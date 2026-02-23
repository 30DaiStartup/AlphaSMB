// AlphaSMB AI Readiness Assessment — Scoring Module
// Pure functions for score computation, tier assignment, and pattern detection

var Scoring = (function () {

  // Convert raw score (5-20) to display score (1.0-10.0)
  function normalize(raw) {
    var display = ((raw - 5) / 15) * 9 + 1;
    return Math.round(display * 10) / 10;
  }

  // Per-dimension tier assignment
  function getTier(display) {
    if (display <= 3.0) return { key: 'red', label: 'Not Started', color: 'var(--assess-tier-red)' };
    if (display <= 5.0) return { key: 'orange', label: 'Early Stage', color: 'var(--assess-tier-orange)' };
    if (display <= 7.0) return { key: 'yellow', label: 'Developing', color: 'var(--assess-tier-yellow)' };
    if (display <= 8.5) return { key: 'light-green', label: 'Advancing', color: 'var(--assess-tier-light-green)' };
    return { key: 'green', label: 'Leading', color: 'var(--assess-tier-green)' };
  }

  // Overall tier assignment (different labels)
  function getOverallTier(display) {
    if (display <= 3.0) return { key: 'red', label: 'AI Stalled', description: 'Your organization hasn\u2019t started the transformation \u2014 and the gap is growing.', color: 'var(--assess-tier-red)' };
    if (display <= 5.0) return { key: 'orange', label: 'AI Aware', description: 'You know AI matters, but the organization can\u2019t move yet.', color: 'var(--assess-tier-orange)' };
    if (display <= 7.0) return { key: 'yellow', label: 'AI Building', description: 'You\u2019ve made progress in some areas, but structural gaps are holding you back.', color: 'var(--assess-tier-yellow)' };
    if (display <= 8.5) return { key: 'light-green', label: 'AI Advancing', description: 'Real capability is forming \u2014 now the question is acceleration and strategic alignment.', color: 'var(--assess-tier-light-green)' };
    return { key: 'green', label: 'AI Capable', description: 'Your organization has serious AI capability. The question is what to do with it.', color: 'var(--assess-tier-green)' };
  }

  // Detect gap pattern from display scores
  // Priority order matters — first match wins
  function detectPattern(scores) {
    var mindset = scores.mindset;
    var skillset = scores.skillset;
    var toolset = scores.toolset;
    var org_os = scores.org_os;
    var overall = scores.overall;

    // 1. Not started: overall < 3.5
    if (overall < 3.5) {
      return 'not_started';
    }

    // 2. Tools without foundation: toolset > each other by 1.5+
    if (toolset - mindset >= 1.5 && toolset - skillset >= 1.5 && toolset - org_os >= 1.5) {
      return 'tools_without_foundation';
    }

    // 3. Vision without infrastructure: mindset > skillset AND > org_os by 1.5+
    if (mindset - skillset >= 1.5 && mindset - org_os >= 1.5) {
      return 'vision_without_infrastructure';
    }

    // 4. Structural bottleneck: org_os lowest by 1.5+ AND at least one other > 5.0
    if (org_os <= mindset - 1.5 && org_os <= skillset - 1.5 && org_os <= toolset - 1.5) {
      if (mindset > 5.0 || skillset > 5.0 || toolset > 5.0) {
        return 'structural_bottleneck';
      }
    }

    // 5. Balanced growth: fallback
    return 'balanced_growth';
  }

  // Compute all scores from answers map
  // answers: { q1: { score: 3 }, q2: { score: 2 }, ... }
  function computeScores(answers) {
    var dimensions = {
      mindset: { questions: ['q1', 'q2', 'q3', 'q4', 'q5'], raw: 0 },
      skillset: { questions: ['q6', 'q7', 'q8', 'q9', 'q10'], raw: 0 },
      toolset: { questions: ['q11', 'q12', 'q13', 'q14', 'q15'], raw: 0 },
      org_os: { questions: ['q16', 'q17', 'q18', 'q19', 'q20'], raw: 0 }
    };

    var keys = ['mindset', 'skillset', 'toolset', 'org_os'];
    var result = { raw: {}, display: {}, tiers: {} };
    var overallRaw = 0;
    var displaySum = 0;

    keys.forEach(function (dim) {
      var raw = 0;
      dimensions[dim].questions.forEach(function (qId) {
        if (answers[qId]) {
          raw += answers[qId].score;
        }
      });
      var display = normalize(raw);
      result.raw[dim] = raw;
      result.display[dim] = display;
      result.tiers[dim] = getTier(display);
      overallRaw += raw;
      displaySum += display;
    });

    result.raw.overall = overallRaw;
    result.display.overall = Math.round((displaySum / 4) * 10) / 10;
    result.tiers.overall = getOverallTier(result.display.overall);
    result.pattern = detectPattern(result.display);

    return result;
  }

  // Compute a single dimension score from answers
  function computeDimensionScore(answers, dimension) {
    var qMap = {
      mindset: ['q1', 'q2', 'q3', 'q4', 'q5'],
      skillset: ['q6', 'q7', 'q8', 'q9', 'q10'],
      toolset: ['q11', 'q12', 'q13', 'q14', 'q15'],
      org_os: ['q16', 'q17', 'q18', 'q19', 'q20']
    };
    var raw = 0;
    qMap[dimension].forEach(function (qId) {
      if (answers[qId]) raw += answers[qId].score;
    });
    var display = normalize(raw);
    return { raw: raw, display: display, tier: getTier(display) };
  }

  return {
    normalize: normalize,
    getTier: getTier,
    getOverallTier: getOverallTier,
    detectPattern: detectPattern,
    computeScores: computeScores,
    computeDimensionScore: computeDimensionScore
  };

})();
