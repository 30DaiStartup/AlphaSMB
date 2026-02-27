// Internal notification email sent to Zach when a new assessment is completed

const BRAND = {
  charcoal: '#1C1917',
  charcoalLight: '#292524',
  ember: '#E8450D',
  sand: '#F5F0EB',
  stone: '#78716C',
  white: '#FFFFFF',
};

const TIER_COLORS = {
  red: '#DC2626',
  orange: '#EA580C',
  yellow: '#CA8A04',
  'light-green': '#16A34A',
  green: '#15803D',
};

const TIER_LABELS = {
  red: 'Not Started',
  orange: 'Early Stage',
  yellow: 'Developing',
  'light-green': 'Advancing',
  green: 'Leading',
};

const OVERALL_TIER_LABELS = {
  red: 'AI Stalled',
  orange: 'AI Aware',
  yellow: 'AI Building',
  'light-green': 'AI Advancing',
  green: 'AI Capable',
};

const PATTERN_LABELS = {
  not_started: 'Not Started',
  tools_without_foundation: 'Tools Without Foundation',
  vision_without_infrastructure: 'Vision Without Infrastructure',
  balanced_growth: 'Balanced Growth',
};

function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildDimensionRow(label, display, tierKey) {
  const color = TIER_COLORS[tierKey] || TIER_COLORS.yellow;
  const tierLabel = TIER_LABELS[tierKey] || tierKey;
  const pct = Math.round((display / 10) * 100);

  return `
    <tr>
      <td style="padding:6px 0;width:70px;font-size:14px;color:${BRAND.sand};">${esc(label)}</td>
      <td style="padding:6px 12px;">
        <div style="background:#44403C;border-radius:4px;height:8px;width:100%;">
          <div style="background:${color};border-radius:4px;height:8px;width:${pct}%;"></div>
        </div>
      </td>
      <td style="padding:6px 0;width:110px;text-align:right;font-size:14px;">
        <span style="color:${BRAND.white};font-weight:600;">${display.toFixed(1)}</span>
        <span style="color:${color};font-size:12px;margin-left:6px;">${esc(tierLabel)}</span>
      </td>
    </tr>`;
}

function buildNotifyEmail(data) {
  const {
    sessionId,
    overallDisplay, overallTier,
    mindsetDisplay, mindsetTier,
    skillsetDisplay, skillsetTier,
    toolsetDisplay, toolsetTier,
    pattern,
    role, industry, companySize,
  } = data;

  const overallColor = TIER_COLORS[overallTier] || TIER_COLORS.yellow;
  const overallLabel = OVERALL_TIER_LABELS[overallTier] || overallTier;
  const patternLabel = PATTERN_LABELS[pattern] || pattern || 'Unknown';

  const metaRows = [];
  if (role) metaRows.push(`<strong>Role:</strong> ${esc(role)}`);
  if (industry) metaRows.push(`<strong>Industry:</strong> ${esc(industry)}`);
  if (companySize) metaRows.push(`<strong>Company Size:</strong> ${esc(companySize)}`);

  const metaBlock = metaRows.length > 0
    ? `<div style="margin-bottom:20px;">
        <p style="font-size:13px;color:${BRAND.sand};line-height:1.8;margin:0;">
          ${metaRows.join('<br>')}
        </p>
      </div>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:${BRAND.charcoal};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.charcoal};">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;">

        <!-- Header -->
        <tr><td style="padding:16px 24px;text-align:center;">
          <div style="font-size:20px;font-weight:700;color:${BRAND.white};letter-spacing:-0.5px;">
            <span style="color:${BRAND.ember};">Alpha</span>SMB
          </div>
          <p style="font-size:12px;color:${BRAND.stone};margin:6px 0 0;">New Assessment Alert</p>
        </td></tr>

        <!-- Card -->
        <tr><td style="background:${BRAND.charcoalLight};border-radius:12px;padding:24px;">

          <!-- Overall score -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center" style="padding:0 0 20px;">
              <div style="font-size:42px;font-weight:700;color:${overallColor};">${overallDisplay.toFixed(1)}<span style="font-size:18px;color:${BRAND.stone};font-weight:400;"> / 10</span></div>
              <div style="display:inline-block;margin-top:6px;padding:3px 14px;border:1px solid ${overallColor};border-radius:20px;font-size:12px;font-weight:600;color:${overallColor};">${esc(overallLabel)}</div>
            </td></tr>
          </table>

          <!-- Dimension bars -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
            ${buildDimensionRow('Mindset', mindsetDisplay, mindsetTier)}
            ${buildDimensionRow('Skillset', skillsetDisplay, skillsetTier)}
            ${buildDimensionRow('Toolset', toolsetDisplay, toolsetTier)}
          </table>

          <!-- Pattern -->
          <p style="font-size:13px;color:${BRAND.stone};margin:0 0 16px;">
            <strong style="color:${BRAND.ember};">Gap Pattern:</strong>
            <span style="color:${BRAND.sand};"> ${esc(patternLabel)}</span>
          </p>

          ${metaBlock}

          <!-- Session ID (for lookup) -->
          <p style="font-size:11px;color:${BRAND.stone};margin:16px 0 0;word-break:break-all;">
            Session: ${esc(sessionId)}
          </p>

        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildNotifyEmailText(data) {
  const {
    sessionId,
    overallDisplay, overallTier,
    mindsetDisplay, mindsetTier,
    skillsetDisplay, skillsetTier,
    toolsetDisplay, toolsetTier,
    pattern,
    role, industry, companySize,
  } = data;

  const overallLabel = OVERALL_TIER_LABELS[overallTier] || overallTier;
  const patternLabel = PATTERN_LABELS[pattern] || pattern || 'Unknown';

  const meta = [];
  if (role) meta.push(`Role: ${role}`);
  if (industry) meta.push(`Industry: ${industry}`);
  if (companySize) meta.push(`Company Size: ${companySize}`);

  return `NEW ASSESSMENT COMPLETED

Overall: ${overallDisplay.toFixed(1)} / 10 — ${overallLabel}

  Mindset:  ${mindsetDisplay.toFixed(1)} / 10 (${TIER_LABELS[mindsetTier] || mindsetTier})
  Skillset: ${skillsetDisplay.toFixed(1)} / 10 (${TIER_LABELS[skillsetTier] || skillsetTier})
  Toolset:  ${toolsetDisplay.toFixed(1)} / 10 (${TIER_LABELS[toolsetTier] || toolsetTier})

Gap Pattern: ${patternLabel}
${meta.length > 0 ? '\n' + meta.join('\n') + '\n' : ''}
Session: ${sessionId}`;
}

module.exports = { buildNotifyEmail, buildNotifyEmailText };
