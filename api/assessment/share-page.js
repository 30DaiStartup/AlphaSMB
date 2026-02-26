// Public results page for social sharing
// Serves OG meta tags for crawlers + branded score card for humans
// Route: /results/:sid → rewrites to /api/assessment/share-page?sid=:sid

const supabase = require('../_lib/supabase');

const BRAND = {
  charcoal: '#1C1917',
  charcoalLight: '#292524',
  ember: '#E8450D',
  sand: '#F5F0EB',
  stone: '#78716C',
  slate: '#44403C',
  white: '#FFFFFF',
};

const TIER_COLORS = {
  red: '#DC2626',
  orange: '#EA580C',
  yellow: '#CA8A04',
  'light-green': '#16A34A',
  green: '#15803D',
};

const OVERALL_LABELS = {
  red: 'AI Stalled',
  orange: 'AI Aware',
  yellow: 'AI Building',
  'light-green': 'AI Advancing',
  green: 'AI Capable',
};

const DIM_LABELS = {
  red: 'Not Started',
  orange: 'Early Stage',
  yellow: 'Developing',
  'light-green': 'Advancing',
  green: 'Leading',
};

function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildDimRow(label, score, tierKey) {
  const pct = Math.round((score / 10) * 100);
  const color = TIER_COLORS[tierKey] || TIER_COLORS.yellow;
  const tierLabel = DIM_LABELS[tierKey] || 'Developing';
  return `
    <div class="share-dim-row">
      <span class="share-dim-label">${esc(label)}</span>
      <div class="share-dim-track">
        <div class="share-dim-fill" style="width:${pct}%;background:${color};"></div>
      </div>
      <span class="share-dim-score">${score.toFixed(1)}</span>
      <span class="share-dim-tier" style="color:${color};">${esc(tierLabel)}</span>
    </div>`;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sid = req.query.sid;
  if (!sid || !/^[0-9a-f-]{36}$/i.test(sid)) {
    return res.redirect(302, '/assessment');
  }

  try {
    const { data: assessment, error } = await supabase
      .from('assessments')
      .select('id, overall_display, overall_tier, mindset_display, mindset_tier, skillset_display, skillset_tier, toolset_display, toolset_tier, email_captured, industry, company_size')
      .eq('session_id', sid)
      .single();

    if (error || !assessment || !assessment.email_captured) {
      return res.redirect(302, '/assessment');
    }

    // Parse numeric strings
    const overall = Number(assessment.overall_display);
    const mindset = Number(assessment.mindset_display);
    const skillset = Number(assessment.skillset_display);
    const toolset = Number(assessment.toolset_display);

    const overallTier = assessment.overall_tier;
    const overallColor = TIER_COLORS[overallTier] || TIER_COLORS.yellow;
    const overallLabel = OVERALL_LABELS[overallTier] || 'AI Building';

    // Build percentile text from cached benchmark
    let percentileText = '';
    const { data: bench } = await supabase
      .from('benchmark_results')
      .select('overall_percentile, segment_key')
      .eq('assessment_id', assessment.id)
      .maybeSingle();

    if (bench && bench.overall_percentile && bench.overall_percentile >= 50) {
      const pos = 'Top ' + (100 - bench.overall_percentile) + '%';
      const industry = assessment.industry;
      if (industry) {
        const label = industry.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase());
        percentileText = pos + ' in ' + esc(label);
      }
    }

    // OG meta content
    const ogTitle = 'I scored ' + overall.toFixed(1) + '/10 \u2014 ' + overallLabel;
    const ogDesc = 'Mindset ' + mindset.toFixed(1) + ' \u00B7 Skillset ' + skillset.toFixed(1) + ' \u00B7 Toolset ' + toolset.toFixed(1) + (percentileText ? ' \u2014 ' + percentileText : '');
    const ogImage = 'https://alphasmb.com/api/assessment/og-image?sid=' + encodeURIComponent(sid);
    const pageUrl = 'https://alphasmb.com/results/' + encodeURIComponent(sid);

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(ogTitle)} \u2014 AlphaSMB AI Readiness</title>

  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${esc(pageUrl)}">
  <meta property="og:title" content="${esc(ogTitle)}">
  <meta property="og:description" content="${esc(ogDesc)}">
  <meta property="og:image" content="${esc(ogImage)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="AlphaSMB">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(ogTitle)}">
  <meta name="twitter:description" content="${esc(ogDesc)}">
  <meta name="twitter:image" content="${esc(ogImage)}">

  <link rel="icon" type="image/png" sizes="32x32" href="/graphics/Al-32x-tpbg.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/styles.css">
  <style>
    .share-page { max-width: 640px; margin: 0 auto; padding: 80px 24px 60px; }
    .share-header { text-align: center; margin-bottom: 40px; }
    .share-wordmark { font-size: 22px; font-weight: 700; color: ${BRAND.white}; text-decoration: none; }
    .share-wordmark span { color: ${BRAND.ember}; }
    .share-label { font-size: 13px; color: ${BRAND.stone}; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 8px; }
    .share-card { background: ${BRAND.charcoalLight}; border-radius: 12px; padding: 36px; margin-bottom: 40px; }
    .share-overall { text-align: center; margin-bottom: 32px; }
    .share-score { font-size: 64px; font-weight: 700; color: ${overallColor}; line-height: 1; }
    .share-score-max { font-size: 24px; font-weight: 400; color: ${BRAND.stone}; }
    .share-tier { display: inline-block; margin-top: 8px; padding: 4px 16px; border: 2px solid ${overallColor}; border-radius: 20px; font-size: 14px; font-weight: 700; color: ${overallColor}; }
    .share-percentile { font-size: 14px; color: ${BRAND.stone}; margin-top: 12px; }
    .share-dim-row { display: flex; align-items: center; margin-bottom: 14px; }
    .share-dim-label { width: 80px; font-size: 14px; font-weight: 600; color: ${BRAND.sand}; }
    .share-dim-track { flex: 1; height: 10px; background: ${BRAND.slate}; border-radius: 5px; overflow: hidden; margin: 0 12px; }
    .share-dim-fill { height: 100%; border-radius: 5px; }
    .share-dim-score { width: 36px; font-size: 14px; font-weight: 700; color: ${BRAND.white}; text-align: right; }
    .share-dim-tier { width: 80px; font-size: 12px; font-weight: 600; margin-left: 8px; }
    .share-cta { text-align: center; padding: 40px 0; border-top: 1px solid ${BRAND.slate}; }
    .share-cta h2 { font-size: 24px; font-weight: 700; color: ${BRAND.white}; margin-bottom: 12px; }
    .share-cta p { font-size: 15px; color: ${BRAND.sand}; line-height: 1.6; margin-bottom: 24px; }
    .share-cta-btn { display: inline-block; background: ${BRAND.ember}; color: ${BRAND.white}; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px; transition: background 0.15s; }
    .share-cta-btn:hover { background: #C53D0A; }
    .share-footer { text-align: center; padding: 24px 0; }
    .share-footer a { color: ${BRAND.ember}; text-decoration: none; font-size: 13px; }
    .share-footer p { font-size: 13px; color: ${BRAND.stone}; margin-top: 8px; }
    @media (max-width: 768px) {
      .share-score { font-size: 48px; }
      .share-card { padding: 24px 20px; }
      .share-dim-label { width: 64px; font-size: 12px; }
      .share-dim-tier { width: 64px; font-size: 11px; }
    }
  </style>
  <script async src="https://plausible.io/js/pa-Rev0XSByyBqh9fk6o5PPi.js" integrity="sha384-6YTkDhBXl3wLZiL8weqvbjIaJ2V5R7HDgryaE814JkwVMGJelE+PmT71+CQwLQ/b" crossorigin="anonymous"></script>
  <script>
    window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};
    plausible.init();
    plausible('Share Page Viewed');
  </script>
</head>
<body>
  <div class="share-page">
    <div class="share-header">
      <a href="/" class="share-wordmark"><span>Alpha</span>SMB</a>
      <p class="share-label">AI Readiness Score</p>
    </div>

    <div class="share-card">
      <div class="share-overall">
        <div class="share-score">${overall.toFixed(1)}<span class="share-score-max"> / 10</span></div>
        <div class="share-tier">${esc(overallLabel)}</div>
        ${percentileText ? '<p class="share-percentile">' + percentileText + '</p>' : ''}
      </div>

      ${buildDimRow('Mindset', mindset, assessment.mindset_tier)}
      ${buildDimRow('Skillset', skillset, assessment.skillset_tier)}
      ${buildDimRow('Toolset', toolset, assessment.toolset_tier)}
    </div>

    <div class="share-cta">
      <h2>How ready is YOUR organization?</h2>
      <p>Take the free 5-minute AI Readiness Assessment and get your personalized score across mindset, skillset, and toolset.</p>
      <a href="/assessment" class="share-cta-btn">Take the Assessment</a>
    </div>

    <div class="share-footer">
      <a href="/">alphasmb.com</a>
      <p>&copy; 2026 AlphaSMB</p>
    </div>
  </div>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, max-age=600');
    return res.status(200).send(html);
  } catch (err) {
    console.error('Share page error:', err);
    return res.redirect(302, '/assessment');
  }
};
