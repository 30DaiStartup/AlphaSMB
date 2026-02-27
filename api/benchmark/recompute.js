var supabase = require('../_lib/supabase');
var { buildSegmentKey } = require('../_lib/benchmark');

var DIMENSIONS = ['overall', 'mindset', 'skillset', 'toolset'];
var DIMENSION_COLUMNS = {
  overall: 'overall_display',
  mindset: 'mindset_display',
  skillset: 'skillset_display',
  toolset: 'toolset_display'
};

// ── Auth ──
function isAuthorized(req) {
  var secret = process.env.CRON_SECRET;
  if (!secret) return false;

  // Vercel cron sends Authorization: Bearer <CRON_SECRET>
  // Only accept the header — query params leak into logs and browser history
  var authHeader = req.headers['authorization'] || '';
  if (authHeader === 'Bearer ' + secret) return true;

  return false;
}

// ── Percentile Computation ──
// Interpolated percentile from sorted array
function percentile(sorted, p) {
  if (sorted.length === 0) return null;
  if (sorted.length === 1) return sorted[0];

  var index = (p / 100) * (sorted.length - 1);
  var lower = Math.floor(index);
  var upper = Math.ceil(index);

  if (lower === upper) return sorted[lower];

  var fraction = index - lower;
  return sorted[lower] + fraction * (sorted[upper] - sorted[lower]);
}

function round1(val) {
  if (val === null) return null;
  return Math.round(val * 10) / 10;
}

// ── Fetch scores for a segment ──
async function fetchScores(industry, companySize) {
  var query = supabase
    .from('assessments')
    .select('overall_display, mindset_display, skillset_display, toolset_display')
    .not('overall_display', 'is', null);

  if (industry) query = query.eq('industry', industry);
  if (companySize) query = query.eq('company_size', companySize);

  var { data, error } = await query;
  if (error) throw new Error('Query error for segment ' + buildSegmentKey(industry, companySize) + ': ' + error.message);
  return data || [];
}

// ── Compute stats for one dimension ──
function computeStats(rows, column) {
  var values = [];
  for (var i = 0; i < rows.length; i++) {
    var v = rows[i][column];
    if (v !== null && v !== undefined) {
      values.push(Number(v));
    }
  }

  if (values.length === 0) return null;

  values.sort(function (a, b) { return a - b; });

  var sum = 0;
  for (var i = 0; i < values.length; i++) sum += values[i];

  return {
    sample_count: values.length,
    p10: round1(percentile(values, 10)),
    p25: round1(percentile(values, 25)),
    median: round1(percentile(values, 50)),
    p75: round1(percentile(values, 75)),
    p90: round1(percentile(values, 90)),
    mean: round1(sum / values.length)
  };
}

// ── Main handler ──
module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!isAuthorized(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // 1. Get all distinct (industry, company_size) pairs with completed assessments
    var { data: pairs, error: pairsErr } = await supabase
      .from('assessments')
      .select('industry, company_size')
      .not('overall_display', 'is', null);

    if (pairsErr) throw new Error('Failed to query assessment pairs: ' + pairsErr.message);

    // Deduplicate pairs
    var seen = {};
    var uniquePairs = [];
    for (var i = 0; i < pairs.length; i++) {
      var key = (pairs[i].industry || '') + '|' + (pairs[i].company_size || '');
      if (!seen[key]) {
        seen[key] = true;
        uniquePairs.push({
          industry: pairs[i].industry || null,
          companySize: pairs[i].company_size || null
        });
      }
    }

    // 2. Build all segment definitions (exact, industry-only, size-only, global)
    var segments = {};
    var industries = {};
    var sizes = {};

    for (var i = 0; i < uniquePairs.length; i++) {
      var pair = uniquePairs[i];

      // Exact segment
      if (pair.industry && pair.companySize) {
        var exactKey = buildSegmentKey(pair.industry, pair.companySize);
        if (!segments[exactKey]) {
          segments[exactKey] = { industry: pair.industry, companySize: pair.companySize };
        }
      }

      // Industry-only
      if (pair.industry) industries[pair.industry] = true;

      // Size-only
      if (pair.companySize) sizes[pair.companySize] = true;
    }

    // Add industry-only segments
    var industryKeys = Object.keys(industries);
    for (var i = 0; i < industryKeys.length; i++) {
      var key = buildSegmentKey(industryKeys[i], null);
      if (!segments[key]) {
        segments[key] = { industry: industryKeys[i], companySize: null };
      }
    }

    // Add size-only segments
    var sizeKeys = Object.keys(sizes);
    for (var i = 0; i < sizeKeys.length; i++) {
      var key = buildSegmentKey(null, sizeKeys[i]);
      if (!segments[key]) {
        segments[key] = { industry: null, companySize: sizeKeys[i] };
      }
    }

    // Add global segment
    segments['all'] = { industry: null, companySize: null };

    // 3. Compute stats for each segment and upsert
    var segmentKeys = Object.keys(segments);
    var totalUpserted = 0;
    var segmentSummary = [];

    for (var s = 0; s < segmentKeys.length; s++) {
      var segKey = segmentKeys[s];
      var seg = segments[segKey];

      var rows = await fetchScores(seg.industry, seg.companySize);
      if (rows.length === 0) continue;

      var upsertBatch = [];

      for (var d = 0; d < DIMENSIONS.length; d++) {
        var dim = DIMENSIONS[d];
        var col = DIMENSION_COLUMNS[dim];
        var stats = computeStats(rows, col);

        if (!stats) continue;

        upsertBatch.push({
          segment_key: segKey,
          dimension: dim,
          sample_count: stats.sample_count,
          p10: stats.p10,
          p25: stats.p25,
          median: stats.median,
          p75: stats.p75,
          p90: stats.p90,
          mean: stats.mean,
          computed_at: new Date().toISOString()
        });
      }

      if (upsertBatch.length > 0) {
        var { error: upsertErr } = await supabase
          .from('benchmark_snapshots')
          .upsert(upsertBatch, { onConflict: 'segment_key,dimension' });

        if (upsertErr) {
          console.error('Upsert error for segment ' + segKey + ':', upsertErr);
        } else {
          totalUpserted += upsertBatch.length;
          segmentSummary.push({
            segment: segKey,
            sampleCount: rows.length,
            dimensions: upsertBatch.length
          });
        }
      }
    }

    return res.status(200).json({
      success: true,
      segmentsComputed: segmentSummary.length,
      rowsUpserted: totalUpserted,
      segments: segmentSummary
    });
  } catch (err) {
    console.error('Benchmark recompute error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
