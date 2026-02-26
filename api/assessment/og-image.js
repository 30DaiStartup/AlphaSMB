// Dynamic OG image generator for shared assessment results
// Generates a 1200x630 branded PNG with scores baked in
// Uses satori (HTML → SVG) + @resvg/resvg-js (SVG → PNG)

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

function getOverallTierKey(display) {
  if (display <= 3.0) return 'red';
  if (display <= 5.0) return 'orange';
  if (display <= 7.0) return 'yellow';
  if (display <= 8.5) return 'light-green';
  return 'green';
}

// Load fonts once at cold-start from Google Fonts (static subsets, compatible with opentype.js)
let fontBold, fontSemiBold;
async function loadFonts() {
  if (fontBold && fontSemiBold) return [fontBold, fontSemiBold];

  // Fetch CSS to get static font file URLs for weights 600 + 700
  const css = await fetch(
    'https://fonts.googleapis.com/css2?family=Manrope:wght@600;700',
    { headers: { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' } }
  ).then(r => r.text());

  // Parse @font-face blocks by weight
  const blocks = css.split('@font-face');
  for (const block of blocks) {
    const weightMatch = block.match(/font-weight:\s*(\d+)/);
    const urlMatch = block.match(/src:\s*url\(([^)]+)\)/);
    if (!weightMatch || !urlMatch) continue;

    const weight = parseInt(weightMatch[1]);
    const data = await fetch(urlMatch[1]).then(r => r.arrayBuffer());
    if (weight === 700) fontBold = data;
    if (weight === 600) fontSemiBold = data;
  }

  if (!fontBold || !fontSemiBold) throw new Error('Failed to load Manrope fonts from Google Fonts');
  return [fontBold, fontSemiBold];
}

function buildBar(label, score, tierKey) {
  const pct = Math.round((score / 10) * 100);
  const color = TIER_COLORS[tierKey] || TIER_COLORS.yellow;
  const tierLabel = DIM_LABELS[tierKey] || 'Developing';

  return {
    type: 'div',
    props: {
      style: { display: 'flex', alignItems: 'center', marginBottom: '12px' },
      children: [
        {
          type: 'span',
          props: {
            style: { width: '80px', fontSize: '16px', color: BRAND.sand, fontWeight: 600 },
            children: label,
          },
        },
        {
          type: 'div',
          props: {
            style: {
              flex: 1,
              height: '12px',
              background: BRAND.slate,
              borderRadius: '6px',
              overflow: 'hidden',
              marginLeft: '12px',
              marginRight: '12px',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    width: pct + '%',
                    height: '100%',
                    background: color,
                    borderRadius: '6px',
                  },
                },
              },
            ],
          },
        },
        {
          type: 'span',
          props: {
            style: { width: '40px', fontSize: '16px', color: BRAND.white, fontWeight: 700, textAlign: 'right' },
            children: score.toFixed(1),
          },
        },
        {
          type: 'span',
          props: {
            style: { width: '90px', fontSize: '13px', color: color, fontWeight: 600, marginLeft: '8px' },
            children: tierLabel,
          },
        },
      ],
    },
  };
}

function buildMarkup(assessment, percentileText) {
  const overall = Number(assessment.overall_display);
  const mindset = Number(assessment.mindset_display);
  const skillset = Number(assessment.skillset_display);
  const toolset = Number(assessment.toolset_display);
  const overallTier = assessment.overall_tier || getOverallTierKey(overall);
  const overallColor = TIER_COLORS[overallTier] || TIER_COLORS.yellow;
  const overallLabel = OVERALL_LABELS[overallTier] || 'AI Building';

  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        width: '1200px',
        height: '630px',
        background: BRAND.charcoal,
        padding: '48px 60px',
        fontFamily: 'Manrope',
      },
      children: [
        // Header row
        {
          type: 'div',
          props: {
            style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' },
            children: [
              {
                type: 'div',
                props: {
                  style: { display: 'flex', fontSize: '24px', fontWeight: 700, color: BRAND.white },
                  children: [
                    { type: 'span', props: { style: { color: BRAND.ember }, children: 'Alpha' } },
                    { type: 'span', props: { children: 'SMB' } },
                  ],
                },
              },
              {
                type: 'span',
                props: {
                  style: { fontSize: '14px', color: BRAND.stone, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' },
                  children: 'AI READINESS SCORE',
                },
              },
            ],
          },
        },
        // Score area
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '36px' },
            children: [
              {
                type: 'div',
                props: {
                  style: { display: 'flex', alignItems: 'baseline' },
                  children: [
                    { type: 'span', props: { style: { fontSize: '72px', fontWeight: 700, color: overallColor }, children: overall.toFixed(1) } },
                    { type: 'span', props: { style: { fontSize: '28px', color: BRAND.stone, marginLeft: '8px' }, children: '/ 10' } },
                  ],
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    marginTop: '8px',
                    padding: '4px 20px',
                    border: '2px solid ' + overallColor,
                    borderRadius: '24px',
                    fontSize: '16px',
                    fontWeight: 700,
                    color: overallColor,
                  },
                  children: overallLabel,
                },
              },
            ],
          },
        },
        // Dimension bars
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'column', maxWidth: '700px', width: '100%', margin: '0 auto' },
            children: [
              buildBar('Mindset', mindset, assessment.mindset_tier),
              buildBar('Skillset', skillset, assessment.skillset_tier),
              buildBar('Toolset', toolset, assessment.toolset_tier),
            ],
          },
        },
        // Bottom row
        {
          type: 'div',
          props: {
            style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' },
            children: [
              {
                type: 'span',
                props: {
                  style: { fontSize: '14px', color: BRAND.stone },
                  children: percentileText || '',
                },
              },
              {
                type: 'span',
                props: {
                  style: { fontSize: '15px', color: BRAND.sand, fontWeight: 600 },
                  children: 'How ready is your organization?  \u2192  alphasmb.com',
                },
              },
            ],
          },
        },
      ],
    },
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sid = req.query.sid;
  if (!sid || !/^[0-9a-f-]{36}$/i.test(sid)) {
    return res.status(400).json({ error: 'Invalid session ID' });
  }

  try {
    // Look up assessment
    const { data: assessment, error } = await supabase
      .from('assessments')
      .select('id, overall_display, overall_tier, mindset_display, mindset_tier, skillset_display, skillset_tier, toolset_display, toolset_tier, industry, company_size')
      .eq('session_id', sid)
      .single();

    if (error || !assessment || assessment.overall_display == null) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    // Parse numeric strings
    assessment.overall_display = Number(assessment.overall_display);
    assessment.mindset_display = Number(assessment.mindset_display);
    assessment.skillset_display = Number(assessment.skillset_display);
    assessment.toolset_display = Number(assessment.toolset_display);

    // Check for cached benchmark percentile
    let percentileText = '';
    const { data: bench } = await supabase
      .from('benchmark_results')
      .select('overall_percentile, segment_key')
      .eq('assessment_id', assessment.id)
      .maybeSingle();

    if (bench && bench.overall_percentile && bench.overall_percentile >= 50) {
      const pos = 'Top ' + (100 - bench.overall_percentile) + '%';
      // Derive label from assessment industry
      const industry = assessment.industry;
      if (industry) {
        const label = industry.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase());
        percentileText = pos + ' in ' + label;
      }
    }

    // Load fonts + ESM modules in parallel
    const [[bold, semiBold], { default: satori }, { Resvg }] = await Promise.all([
      loadFonts(),
      import('satori'),
      import('@resvg/resvg-js'),
    ]);

    const markup = buildMarkup(assessment, percentileText);

    const svg = await satori(markup, {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Manrope', data: bold, weight: 700, style: 'normal' },
        { name: 'Manrope', data: semiBold, weight: 600, style: 'normal' },
      ],
    });

    const resvg = new Resvg(svg, {
      fitTo: { mode: 'width', value: 1200 },
    });
    const png = resvg.render().asPng();

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, s-maxage=86400, max-age=3600');
    return res.status(200).send(Buffer.from(png));
  } catch (err) {
    console.error('OG image error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
