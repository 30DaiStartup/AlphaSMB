// GET /api/admin/assessments — protected: all assessments + aggregate stats

const { validateEnv } = require('../_lib/config');
const { requireAdmin } = require('../_lib/auth');
const supabase = require('../_lib/supabase');

const TIER_LABELS = {
  red: 'AI Stalled',
  orange: 'AI Aware',
  yellow: 'AI Building',
  'light-green': 'AI Advancing',
  green: 'AI Capable',
};

function tierLabel(key) {
  return TIER_LABELS[key] || key || 'Unknown';
}

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    validateEnv();

    const claims = requireAdmin(req);
    if (!claims) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Pagination: ?limit=N&offset=N  (default 100, max 500)
    var limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 100, 1), 500);
    var offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);

    // Fetch assessments, newest first
    const { data, error } = await supabase
      .from('assessments')
      .select('id, session_id, created_at, completed_at, role, company_size, industry, user_name, user_email, email_captured, email_domain, overall_display, overall_tier, mindset_display, skillset_display, toolset_display, pattern')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Supabase query error:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    const assessments = data || [];

    // ── Aggregate stats ──
    var totalCount = assessments.length;
    var emailCount = 0;
    var scoreSum = 0;
    var scoreCount = 0;
    var weekCount = 0;
    var tierCounts = {};
    var industryCounts = {};
    var sizeCounts = {};

    var weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    var weekAgoISO = weekAgo.toISOString();

    for (var i = 0; i < assessments.length; i++) {
      var a = assessments[i];

      if (a.email_captured) emailCount++;

      if (a.overall_display != null) {
        scoreSum += Number(a.overall_display);
        scoreCount++;
      }

      if (a.created_at && a.created_at >= weekAgoISO) {
        weekCount++;
      }

      // Tier distribution
      var tl = tierLabel(a.overall_tier);
      tierCounts[tl] = (tierCounts[tl] || 0) + 1;

      // Industry breakdown
      var ind = a.industry || 'Not specified';
      industryCounts[ind] = (industryCounts[ind] || 0) + 1;

      // Size breakdown
      var sz = a.company_size || 'Not specified';
      sizeCounts[sz] = (sizeCounts[sz] || 0) + 1;
    }

    var summary = {
      total: totalCount,
      emailCaptureRate: totalCount > 0 ? Math.round((emailCount / totalCount) * 100) : 0,
      avgScore: scoreCount > 0 ? Number((scoreSum / scoreCount).toFixed(1)) : 0,
      thisWeek: weekCount,
    };

    // Sort tier distribution in order
    var tierOrder = ['AI Stalled', 'AI Aware', 'AI Building', 'AI Advancing', 'AI Capable'];
    var distributions = {
      tiers: tierOrder.map(function (label) {
        return { label: label, count: tierCounts[label] || 0 };
      }),
      industries: Object.keys(industryCounts)
        .sort(function (a, b) { return industryCounts[b] - industryCounts[a]; })
        .map(function (k) { return { label: k, count: industryCounts[k] }; }),
      sizes: Object.keys(sizeCounts)
        .sort(function (a, b) { return sizeCounts[b] - sizeCounts[a]; })
        .map(function (k) { return { label: k, count: sizeCounts[k] }; }),
    };

    return res.status(200).json({ summary: summary, distributions: distributions, assessments: assessments });
  } catch (err) {
    console.error('Admin assessments error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
