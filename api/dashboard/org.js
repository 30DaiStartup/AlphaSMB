// GET /api/dashboard/org — org-scoped assessments + aggregates
// Protected by requireAuth(), scoped by JWT domain

const { validateEnv } = require('../_lib/config');
const { requireAuth } = require('../_lib/auth');
const supabase = require('../_lib/supabase');

var TIER_LABELS = {
  red: 'AI Stalled',
  orange: 'AI Aware',
  yellow: 'AI Building',
  'light-green': 'AI Advancing',
  green: 'AI Capable',
};

var ROLE_LABELS = {
  ceo_founder: 'CEO / Founder',
  cto: 'CTO',
  coo: 'COO',
  cpo: 'CPO',
  cmo: 'CMO',
};

function formatRole(raw) {
  if (!raw) return 'Not specified';
  if (ROLE_LABELS[raw]) return ROLE_LABELS[raw];
  if (raw.indexOf('other:') === 0) {
    var custom = raw.slice(6).trim();
    return custom || 'Other';
  }
  return raw;
}

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

    var claims = requireAuth(req);
    if (!claims) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    var domain = claims.domain;
    if (!domain) {
      return res.status(400).json({ error: 'No domain in session' });
    }

    // Fetch company info
    var companyData = null;
    var { data: companyRow } = await supabase
      .from('companies')
      .select('name, domain, industry, company_size')
      .eq('domain', domain)
      .single();

    if (companyRow) {
      companyData = companyRow;
    }

    // Fetch assessments scoped to this domain
    var { data, error } = await supabase
      .from('assessments')
      .select('id, user_name, user_email, role, overall_display, overall_tier, mindset_display, skillset_display, toolset_display, created_at')
      .eq('email_domain', domain)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase query error:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    var assessments = data || [];

    // ── Aggregate stats ──
    var teamCount = assessments.length;
    var scoreSum = 0;
    var scoreCount = 0;
    var mindsetSum = 0;
    var mindsetCount = 0;
    var skillsetSum = 0;
    var skillsetCount = 0;
    var toolsetSum = 0;
    var toolsetCount = 0;
    var weekCount = 0;
    var tierCounts = {};
    var roleCounts = {};

    var weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    var weekAgoISO = weekAgo.toISOString();

    for (var i = 0; i < assessments.length; i++) {
      var a = assessments[i];

      if (a.overall_display != null) {
        scoreSum += Number(a.overall_display);
        scoreCount++;
      }
      if (a.mindset_display != null) {
        mindsetSum += Number(a.mindset_display);
        mindsetCount++;
      }
      if (a.skillset_display != null) {
        skillsetSum += Number(a.skillset_display);
        skillsetCount++;
      }
      if (a.toolset_display != null) {
        toolsetSum += Number(a.toolset_display);
        toolsetCount++;
      }

      if (a.created_at && a.created_at >= weekAgoISO) {
        weekCount++;
      }

      var tl = tierLabel(a.overall_tier);
      tierCounts[tl] = (tierCounts[tl] || 0) + 1;

      var r = formatRole(a.role);
      roleCounts[r] = (roleCounts[r] || 0) + 1;
    }

    var avgOverall = scoreCount > 0 ? Number((scoreSum / scoreCount).toFixed(1)) : 0;
    var avgMindset = mindsetCount > 0 ? Number((mindsetSum / mindsetCount).toFixed(1)) : 0;
    var avgSkillset = skillsetCount > 0 ? Number((skillsetSum / skillsetCount).toFixed(1)) : 0;
    var avgToolset = toolsetCount > 0 ? Number((toolsetSum / toolsetCount).toFixed(1)) : 0;

    // Determine strongest dimension
    var dims = [
      { name: 'Mindset', score: avgMindset },
      { name: 'Skillset', score: avgSkillset },
      { name: 'Toolset', score: avgToolset },
    ];
    dims.sort(function (a, b) { return b.score - a.score; });
    var strongestDimension = dims[0].score > 0 ? dims[0].name : null;

    var summary = {
      teamCount: teamCount,
      avgOverall: avgOverall,
      avgMindset: avgMindset,
      avgSkillset: avgSkillset,
      avgToolset: avgToolset,
      strongestDimension: strongestDimension,
      thisWeek: weekCount,
    };

    // Tier distribution in order
    var tierOrder = ['AI Stalled', 'AI Aware', 'AI Building', 'AI Advancing', 'AI Capable'];
    var tiers = tierOrder.map(function (label) {
      return { label: label, count: tierCounts[label] || 0 };
    });

    // Role breakdown sorted by count
    var roles = Object.keys(roleCounts)
      .sort(function (a, b) { return roleCounts[b] - roleCounts[a]; })
      .map(function (k) { return { label: k, count: roleCounts[k] }; });

    // Add status to completed assessments
    for (var j = 0; j < assessments.length; j++) {
      assessments[j].status = 'completed';
    }

    // ── Pending invitees ──
    var pending = [];
    if (assessments.length > 0) {
      // Collect assessment IDs and completed emails
      var assessmentIds = [];
      var completedEmails = {};
      for (var k = 0; k < assessments.length; k++) {
        assessmentIds.push(assessments[k].id);
        if (assessments[k].user_email) {
          completedEmails[assessments[k].user_email.toLowerCase()] = true;
        }
      }

      // Query share_intents for distribute type
      var { data: shares, error: shareError } = await supabase
        .from('share_intents')
        .select('recipients')
        .eq('type', 'distribute')
        .in('assessment_id', assessmentIds);

      if (!shareError && shares && shares.length > 0) {
        var seen = {};
        for (var s = 0; s < shares.length; s++) {
          var recips = shares[s].recipients;
          if (!Array.isArray(recips)) continue;
          for (var r2 = 0; r2 < recips.length; r2++) {
            var email = (recips[r2].email || '').toLowerCase().trim();
            if (!email) continue;
            // Same-domain check
            var parts = email.split('@');
            if (parts.length !== 2 || parts[1] !== domain) continue;
            // Not already completed and not already seen
            if (completedEmails[email] || seen[email]) continue;
            seen[email] = true;
            pending.push({
              user_email: email,
              user_name: null,
              role: null,
              overall_display: null,
              overall_tier: null,
              mindset_display: null,
              skillset_display: null,
              toolset_display: null,
              created_at: null,
              status: 'invited',
            });
          }
        }
      }
    }

    return res.status(200).json({
      company: companyData,
      summary: summary,
      distributions: { tiers: tiers, roles: roles },
      assessments: assessments,
      pending: pending,
    });
  } catch (err) {
    console.error('Dashboard org error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
