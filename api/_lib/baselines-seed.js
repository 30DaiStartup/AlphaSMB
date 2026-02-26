// Static industry baseline seed data for AI readiness benchmarking
// Sources: McKinsey Global AI Survey 2025, Deloitte State of AI 2025,
// Salesforce SMB Trends, Gartner AI Adoption
//
// Mapping: adoption rates → 1-10 display scale
//   10-15% → 2.5-3.5 (Early Stage)
//   25-35% → 4.0-5.0
//   40-55% → 5.5-6.5
//   60-75% → 7.0-8.0
//   80%+   → 8.5-10.0

const BASELINES = [
  // ── Healthcare ──
  { industry: 'healthcare', dimension: 'overall',  metric: 'p25', value: 2.8 },
  { industry: 'healthcare', dimension: 'overall',  metric: 'median', value: 3.8 },
  { industry: 'healthcare', dimension: 'overall',  metric: 'p75', value: 5.2 },
  { industry: 'healthcare', dimension: 'mindset',  metric: 'p25', value: 3.2 },
  { industry: 'healthcare', dimension: 'mindset',  metric: 'median', value: 4.2 },
  { industry: 'healthcare', dimension: 'mindset',  metric: 'p75', value: 5.5 },
  { industry: 'healthcare', dimension: 'skillset', metric: 'p25', value: 2.5 },
  { industry: 'healthcare', dimension: 'skillset', metric: 'median', value: 3.5 },
  { industry: 'healthcare', dimension: 'skillset', metric: 'p75', value: 4.8 },
  { industry: 'healthcare', dimension: 'toolset',  metric: 'p25', value: 2.8 },
  { industry: 'healthcare', dimension: 'toolset',  metric: 'median', value: 3.8 },
  { industry: 'healthcare', dimension: 'toolset',  metric: 'p75', value: 5.2 },

  // ── Real Estate ──
  { industry: 'real_estate', dimension: 'overall',  metric: 'p25', value: 2.5 },
  { industry: 'real_estate', dimension: 'overall',  metric: 'median', value: 3.5 },
  { industry: 'real_estate', dimension: 'overall',  metric: 'p75', value: 4.8 },
  { industry: 'real_estate', dimension: 'mindset',  metric: 'p25', value: 3.0 },
  { industry: 'real_estate', dimension: 'mindset',  metric: 'median', value: 4.0 },
  { industry: 'real_estate', dimension: 'mindset',  metric: 'p75', value: 5.2 },
  { industry: 'real_estate', dimension: 'skillset', metric: 'p25', value: 2.2 },
  { industry: 'real_estate', dimension: 'skillset', metric: 'median', value: 3.0 },
  { industry: 'real_estate', dimension: 'skillset', metric: 'p75', value: 4.2 },
  { industry: 'real_estate', dimension: 'toolset',  metric: 'p25', value: 2.5 },
  { industry: 'real_estate', dimension: 'toolset',  metric: 'median', value: 3.5 },
  { industry: 'real_estate', dimension: 'toolset',  metric: 'p75', value: 5.0 },

  // ── Manufacturing ──
  { industry: 'manufacturing', dimension: 'overall',  metric: 'p25', value: 3.0 },
  { industry: 'manufacturing', dimension: 'overall',  metric: 'median', value: 4.2 },
  { industry: 'manufacturing', dimension: 'overall',  metric: 'p75', value: 5.5 },
  { industry: 'manufacturing', dimension: 'mindset',  metric: 'p25', value: 3.2 },
  { industry: 'manufacturing', dimension: 'mindset',  metric: 'median', value: 4.5 },
  { industry: 'manufacturing', dimension: 'mindset',  metric: 'p75', value: 5.8 },
  { industry: 'manufacturing', dimension: 'skillset', metric: 'p25', value: 2.5 },
  { industry: 'manufacturing', dimension: 'skillset', metric: 'median', value: 3.8 },
  { industry: 'manufacturing', dimension: 'skillset', metric: 'p75', value: 5.0 },
  { industry: 'manufacturing', dimension: 'toolset',  metric: 'p25', value: 3.2 },
  { industry: 'manufacturing', dimension: 'toolset',  metric: 'median', value: 4.5 },
  { industry: 'manufacturing', dimension: 'toolset',  metric: 'p75', value: 5.8 },

  // ── Professional Services ──
  { industry: 'professional_services', dimension: 'overall',  metric: 'p25', value: 3.5 },
  { industry: 'professional_services', dimension: 'overall',  metric: 'median', value: 4.8 },
  { industry: 'professional_services', dimension: 'overall',  metric: 'p75', value: 6.2 },
  { industry: 'professional_services', dimension: 'mindset',  metric: 'p25', value: 3.8 },
  { industry: 'professional_services', dimension: 'mindset',  metric: 'median', value: 5.2 },
  { industry: 'professional_services', dimension: 'mindset',  metric: 'p75', value: 6.5 },
  { industry: 'professional_services', dimension: 'skillset', metric: 'p25', value: 3.2 },
  { industry: 'professional_services', dimension: 'skillset', metric: 'median', value: 4.5 },
  { industry: 'professional_services', dimension: 'skillset', metric: 'p75', value: 5.8 },
  { industry: 'professional_services', dimension: 'toolset',  metric: 'p25', value: 3.5 },
  { industry: 'professional_services', dimension: 'toolset',  metric: 'median', value: 4.8 },
  { industry: 'professional_services', dimension: 'toolset',  metric: 'p75', value: 6.2 },

  // ── Software ──
  { industry: 'software', dimension: 'overall',  metric: 'p25', value: 4.5 },
  { industry: 'software', dimension: 'overall',  metric: 'median', value: 5.8 },
  { industry: 'software', dimension: 'overall',  metric: 'p75', value: 7.2 },
  { industry: 'software', dimension: 'mindset',  metric: 'p25', value: 5.0 },
  { industry: 'software', dimension: 'mindset',  metric: 'median', value: 6.2 },
  { industry: 'software', dimension: 'mindset',  metric: 'p75', value: 7.5 },
  { industry: 'software', dimension: 'skillset', metric: 'p25', value: 4.2 },
  { industry: 'software', dimension: 'skillset', metric: 'median', value: 5.5 },
  { industry: 'software', dimension: 'skillset', metric: 'p75', value: 7.0 },
  { industry: 'software', dimension: 'toolset',  metric: 'p25', value: 4.5 },
  { industry: 'software', dimension: 'toolset',  metric: 'median', value: 6.0 },
  { industry: 'software', dimension: 'toolset',  metric: 'p75', value: 7.5 },

  // ── Other / Catch-all ──
  { industry: 'other', dimension: 'overall',  metric: 'p25', value: 3.0 },
  { industry: 'other', dimension: 'overall',  metric: 'median', value: 4.2 },
  { industry: 'other', dimension: 'overall',  metric: 'p75', value: 5.8 },
  { industry: 'other', dimension: 'mindset',  metric: 'p25', value: 3.2 },
  { industry: 'other', dimension: 'mindset',  metric: 'median', value: 4.5 },
  { industry: 'other', dimension: 'mindset',  metric: 'p75', value: 6.0 },
  { industry: 'other', dimension: 'skillset', metric: 'p25', value: 2.8 },
  { industry: 'other', dimension: 'skillset', metric: 'median', value: 4.0 },
  { industry: 'other', dimension: 'skillset', metric: 'p75', value: 5.5 },
  { industry: 'other', dimension: 'toolset',  metric: 'p25', value: 3.0 },
  { industry: 'other', dimension: 'toolset',  metric: 'median', value: 4.2 },
  { industry: 'other', dimension: 'toolset',  metric: 'p75', value: 5.8 },

  // ── All Industries (global fallback) ──
  { industry: 'all', dimension: 'overall',  metric: 'p25', value: 3.2 },
  { industry: 'all', dimension: 'overall',  metric: 'median', value: 4.5 },
  { industry: 'all', dimension: 'overall',  metric: 'p75', value: 6.0 },
  { industry: 'all', dimension: 'mindset',  metric: 'p25', value: 3.5 },
  { industry: 'all', dimension: 'mindset',  metric: 'median', value: 4.8 },
  { industry: 'all', dimension: 'mindset',  metric: 'p75', value: 6.2 },
  { industry: 'all', dimension: 'skillset', metric: 'p25', value: 3.0 },
  { industry: 'all', dimension: 'skillset', metric: 'median', value: 4.2 },
  { industry: 'all', dimension: 'skillset', metric: 'p75', value: 5.8 },
  { industry: 'all', dimension: 'toolset',  metric: 'p25', value: 3.2 },
  { industry: 'all', dimension: 'toolset',  metric: 'median', value: 4.5 },
  { industry: 'all', dimension: 'toolset',  metric: 'p75', value: 6.0 },
];

// Add common metadata to all rows
const SEED_DATA = BASELINES.map(function (row) {
  return Object.assign({}, row, {
    company_size: null,
    source: 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)',
    source_year: 2025,
    confidence: 0.60
  });
});

module.exports = { SEED_DATA, BASELINES };
