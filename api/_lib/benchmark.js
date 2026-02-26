const supabase = require('./supabase');

const MIN_COHORT_SIZE = 10;
const DIMENSIONS = ['overall', 'mindset', 'skillset', 'toolset'];

// Build segment key from industry + company_size
function buildSegmentKey(industry, companySize) {
  var parts = [];
  if (industry) parts.push(industry);
  if (companySize) parts.push(companySize);
  return parts.length > 0 ? parts.join(':') : 'all';
}

// Format segment into human-readable label
function formatSegmentLabel(industry, companySize) {
  var parts = [];
  if (industry) {
    var label = industry.replace(/_/g, ' ');
    label = label.charAt(0).toUpperCase() + label.slice(1);
    if (label.startsWith('Other:')) label = label.slice(6).trim();
    parts.push(label + ' companies');
  }
  if (companySize) {
    var sizeLabels = {
      'under_20': 'under 20',
      '20-50': '20\u201350',
      '51-100': '51\u2013100',
      '101-250': '101\u2013250',
      '251-500': '251\u2013500',
      '500+': '500+'
    };
    var sizeLabel = sizeLabels[companySize] || companySize.replace(/_/g, ' ');
    parts.push('with ' + sizeLabel + ' employees');
  }
  if (parts.length === 0) return 'All assessed companies';
  return parts.join(' ');
}

// ── Tiered Segment Matching ──
// Try progressively broader segments until we find one with enough data
async function findBestSegment(industry, companySize) {
  var tiers = [];

  // Tier 1: exact match (industry + size)
  if (industry && companySize) {
    tiers.push({ industry: industry, companySize: companySize });
  }
  // Tier 2: industry only
  if (industry) {
    tiers.push({ industry: industry, companySize: null });
  }
  // Tier 3: size only
  if (companySize) {
    tiers.push({ industry: null, companySize: companySize });
  }
  // Tier 4: all assessments
  tiers.push({ industry: null, companySize: null });

  for (var i = 0; i < tiers.length; i++) {
    var tier = tiers[i];
    var query = supabase
      .from('assessments')
      .select('id', { count: 'exact', head: true })
      .not('overall_display', 'is', null);

    if (tier.industry) query = query.eq('industry', tier.industry);
    if (tier.companySize) query = query.eq('company_size', tier.companySize);

    var { count, error } = await query;
    if (error) continue;
    if (count >= MIN_COHORT_SIZE) {
      return {
        industry: tier.industry,
        companySize: tier.companySize,
        segmentKey: buildSegmentKey(tier.industry, tier.companySize),
        sampleCount: count,
        source: 'peer_data'
      };
    }
  }

  return null; // No segment has enough peer data
}

// ── Percentile from Peer Data ──
// Count how many assessments in the segment score below this value
async function computePeerPercentile(dimension, value, industry, companySize) {
  var column = dimension === 'overall' ? 'overall_display' : dimension + '_display';

  var query = supabase
    .from('assessments')
    .select('id', { count: 'exact', head: true })
    .not('overall_display', 'is', null)
    .lt(column, value);

  if (industry) query = query.eq('industry', industry);
  if (companySize) query = query.eq('company_size', companySize);

  var { count: below, error: belowErr } = await query;
  if (belowErr) return null;

  var totalQuery = supabase
    .from('assessments')
    .select('id', { count: 'exact', head: true })
    .not('overall_display', 'is', null);

  if (industry) totalQuery = totalQuery.eq('industry', industry);
  if (companySize) totalQuery = totalQuery.eq('company_size', companySize);

  var { count: total, error: totalErr } = await totalQuery;
  if (totalErr || total === 0) return null;

  var percentile = Math.round((below / total) * 100);
  return Math.max(1, Math.min(99, percentile));
}

// ── Static Baseline Lookup ──
async function getStaticBaseline(industry, dimension) {
  var lookupIndustry = industry || 'all';
  // Strip "other:" prefix
  if (lookupIndustry.startsWith('other:')) lookupIndustry = 'other';

  var { data, error } = await supabase
    .from('industry_baselines')
    .select('metric, value')
    .eq('industry', lookupIndustry)
    .eq('dimension', dimension)
    .is('company_size', null);

  if (error || !data || data.length === 0) {
    // Fallback to 'all' industry
    var fallback = await supabase
      .from('industry_baselines')
      .select('metric, value')
      .eq('industry', 'all')
      .eq('dimension', dimension)
      .is('company_size', null);

    if (fallback.error || !fallback.data) return null;
    data = fallback.data;
  }

  var result = {};
  data.forEach(function (row) {
    result[row.metric] = Number(row.value);
  });
  return result;
}

// Estimate percentile from static baseline p25/median/p75
function estimatePercentileFromBaseline(value, baseline) {
  if (!baseline || !baseline.median) return 50;

  var p25 = baseline.p25 || baseline.median - 1;
  var median = baseline.median;
  var p75 = baseline.p75 || baseline.median + 1;

  if (value <= p25) {
    var pct = 25 * (value / p25);
    return Math.max(1, Math.round(pct));
  }
  if (value <= median) {
    var pct = 25 + 25 * ((value - p25) / (median - p25));
    return Math.round(pct);
  }
  if (value <= p75) {
    var pct = 50 + 25 * ((value - median) / (p75 - median));
    return Math.round(pct);
  }
  var pct = 75 + 25 * Math.min(1, (value - p75) / (10 - p75));
  return Math.min(99, Math.round(pct));
}

// ── Main: Compute Benchmark for an Assessment ──
async function computeBenchmark(assessment) {
  var scores = {
    overall: Number(assessment.overall_display),
    mindset: Number(assessment.mindset_display),
    skillset: Number(assessment.skillset_display),
    toolset: Number(assessment.toolset_display)
  };

  var industry = assessment.industry;
  var companySize = assessment.company_size;

  // Try to find a peer segment with enough data
  var segment = await findBestSegment(industry, companySize);

  var result = {
    overallPercentile: null,
    mindsetPercentile: null,
    skillsetPercentile: null,
    toolsetPercentile: null,
    segmentLabel: '',
    sampleCount: 0,
    dataSource: 'static_baseline',
    segmentKey: buildSegmentKey(industry, companySize)
  };

  if (segment && segment.sampleCount >= 30) {
    // Pure peer data
    result.dataSource = 'peer_data';
    result.sampleCount = segment.sampleCount;
    result.segmentLabel = formatSegmentLabel(segment.industry, segment.companySize);

    for (var i = 0; i < DIMENSIONS.length; i++) {
      var dim = DIMENSIONS[i];
      var pctKey = dim + 'Percentile';
      result[pctKey] = await computePeerPercentile(
        dim, scores[dim], segment.industry, segment.companySize
      );
    }
  } else if (segment && segment.sampleCount >= MIN_COHORT_SIZE) {
    // Blended: peer + static
    result.dataSource = 'blended';
    result.sampleCount = segment.sampleCount;
    result.segmentLabel = formatSegmentLabel(segment.industry, segment.companySize);
    var peerWeight = (segment.sampleCount - MIN_COHORT_SIZE) / (30 - MIN_COHORT_SIZE);

    for (var i = 0; i < DIMENSIONS.length; i++) {
      var dim = DIMENSIONS[i];
      var pctKey = dim + 'Percentile';
      var peerPct = await computePeerPercentile(
        dim, scores[dim], segment.industry, segment.companySize
      );
      var baseline = await getStaticBaseline(industry, dim);
      var staticPct = estimatePercentileFromBaseline(scores[dim], baseline);

      if (peerPct !== null) {
        result[pctKey] = Math.round(peerPct * peerWeight + staticPct * (1 - peerWeight));
      } else {
        result[pctKey] = staticPct;
      }
      result[pctKey] = Math.max(1, Math.min(99, result[pctKey]));
    }
  } else {
    // Pure static baseline
    result.dataSource = 'static_baseline';
    result.segmentLabel = formatSegmentLabel(industry, companySize);

    for (var i = 0; i < DIMENSIONS.length; i++) {
      var dim = DIMENSIONS[i];
      var pctKey = dim + 'Percentile';
      var baseline = await getStaticBaseline(industry, dim);
      result[pctKey] = estimatePercentileFromBaseline(scores[dim], baseline);
    }
  }

  return result;
}

// ── Cache result in benchmark_results table ──
async function cacheBenchmarkResult(assessmentId, companyId, benchmark) {
  var { error } = await supabase
    .from('benchmark_results')
    .upsert({
      assessment_id: assessmentId,
      company_id: companyId || null,
      segment_key: benchmark.segmentKey,
      sample_count: benchmark.sampleCount,
      overall_percentile: benchmark.overallPercentile,
      mindset_percentile: benchmark.mindsetPercentile,
      skillset_percentile: benchmark.skillsetPercentile,
      toolset_percentile: benchmark.toolsetPercentile,
      data_source: benchmark.dataSource,
      computed_at: new Date().toISOString()
    }, { onConflict: 'assessment_id' });

  if (error) console.error('Benchmark cache error:', error);
}

// ── Public: Get Snapshot (pre-email, for processing screen) ──
async function getSegmentSnapshot(industry, companySize) {
  var result = { medians: {}, p25: {}, p75: {}, sampleCount: 0, dataSource: 'static_baseline' };

  // Try pre-computed snapshots first
  var segmentKey = buildSegmentKey(industry, companySize);
  var { data: snapshots } = await supabase
    .from('benchmark_snapshots')
    .select('dimension, median, p25, p75, sample_count')
    .eq('segment_key', segmentKey);

  if (snapshots && snapshots.length > 0 && snapshots[0].sample_count >= MIN_COHORT_SIZE) {
    snapshots.forEach(function (s) {
      result.medians[s.dimension] = Number(s.median);
      result.p25[s.dimension] = Number(s.p25);
      result.p75[s.dimension] = Number(s.p75);
    });
    result.sampleCount = snapshots[0].sample_count;
    result.dataSource = 'peer_data';
    return result;
  }

  // Fallback to static baselines
  for (var i = 0; i < DIMENSIONS.length; i++) {
    var dim = DIMENSIONS[i];
    var baseline = await getStaticBaseline(industry, dim);
    if (baseline) {
      result.medians[dim] = baseline.median || null;
      result.p25[dim] = baseline.p25 || null;
      result.p75[dim] = baseline.p75 || null;
    }
  }
  result.dataSource = 'static_baseline';
  return result;
}

module.exports = {
  computeBenchmark,
  cacheBenchmarkResult,
  getSegmentSnapshot,
  buildSegmentKey,
  formatSegmentLabel
};
