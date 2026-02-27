// HTML email templates for share/distribute flows
// Two variants: invite (take the assessment) and share (see results)

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

function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function emailShell(content) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:${BRAND.charcoal};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.charcoal};">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <!-- Header -->
        <tr><td style="padding:24px 32px;text-align:center;">
          <div style="font-size:22px;font-weight:700;color:${BRAND.white};letter-spacing:-0.5px;">
            <span style="color:${BRAND.ember};">Alpha</span>SMB
          </div>
        </td></tr>
        <!-- Main card -->
        <tr><td style="background:${BRAND.charcoalLight};border-radius:12px;padding:32px;">
          ${content}
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:24px 32px;text-align:center;">
          <p style="font-size:13px;color:${BRAND.stone};line-height:1.5;margin:0;">
            <a href="https://alphasmb.com" style="color:${BRAND.ember};text-decoration:none;">alphasmb.com</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// Leader invites team member to take the assessment
function buildInviteEmail({ senderName }) {
  const content = `
    <h2 style="font-size:20px;font-weight:700;color:${BRAND.white};margin:0 0 16px;">You've been invited to take the AI Readiness Assessment</h2>
    <p style="font-size:15px;color:${BRAND.sand};line-height:1.6;margin:0 0 16px;">
      ${esc(senderName)} invited you to take the AlphaSMB AI Readiness Assessment. It's a 5-minute diagnostic that measures your organization's AI readiness across three dimensions: Mindset, Skillset, and Toolset.
    </p>
    <p style="font-size:15px;color:${BRAND.sand};line-height:1.6;margin:0 0 24px;">
      Your perspective matters. The more leadership team members who complete the assessment, the clearer the picture of where your organization stands.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center">
        <a href="https://alphasmb.com/assessment" style="display:inline-block;background:${BRAND.ember};color:${BRAND.white};font-size:16px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:8px;">Take the Assessment</a>
      </td></tr>
    </table>
    <p style="font-size:13px;color:${BRAND.stone};margin:20px 0 0;text-align:center;">Takes about 5 minutes. No account required.</p>`;

  return emailShell(content);
}

// Team member shares their results with a leader
function buildShareResultsEmail({ senderName, overallDisplay, overallTier, mindsetDisplay, mindsetTier, skillsetDisplay, skillsetTier, toolsetDisplay, toolsetTier }) {
  const overallColor = TIER_COLORS[overallTier] || TIER_COLORS.yellow;
  const overallLabel = OVERALL_TIER_LABELS[overallTier] || 'AI Building';

  function barRow(label, display, tierKey) {
    const pct = Math.round((display / 10) * 100);
    const color = TIER_COLORS[tierKey] || TIER_COLORS.yellow;
    const tierLabel = TIER_LABELS[tierKey] || 'Developing';
    return `
      <tr>
        <td style="padding:6px 0;width:70px;font-size:13px;color:${BRAND.sand};">${esc(label)}</td>
        <td style="padding:6px 8px;">
          <div style="background:${BRAND.slate};border-radius:4px;height:6px;width:100%;">
            <div style="background:${color};border-radius:4px;height:6px;width:${pct}%;"></div>
          </div>
        </td>
        <td style="padding:6px 0;width:100px;text-align:right;font-size:13px;">
          <span style="color:${BRAND.white};font-weight:600;">${display.toFixed(1)}</span>
          <span style="color:${color};font-size:11px;margin-left:4px;">${esc(tierLabel)}</span>
        </td>
      </tr>`;
  }

  const content = `
    <h2 style="font-size:20px;font-weight:700;color:${BRAND.white};margin:0 0 16px;">${esc(senderName)} shared their AI Readiness results</h2>
    <p style="font-size:15px;color:${BRAND.sand};line-height:1.6;margin:0 0 24px;">
      ${esc(senderName)} completed the AlphaSMB AI Readiness Assessment and wanted to share their results with you.
    </p>

    <!-- Overall score -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center" style="padding:8px 0 16px;">
        <div style="font-size:36px;font-weight:700;color:${overallColor};">${overallDisplay.toFixed(1)}<span style="font-size:16px;color:${BRAND.stone};font-weight:400;"> / 10</span></div>
        <div style="display:inline-block;margin-top:6px;padding:3px 12px;border:1px solid ${overallColor};border-radius:16px;font-size:12px;font-weight:600;color:${overallColor};">${esc(overallLabel)}</div>
      </td></tr>
    </table>

    <!-- Dimension bars -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;">
      ${barRow('Mindset', mindsetDisplay, mindsetTier)}
      ${barRow('Skillset', skillsetDisplay, skillsetTier)}
      ${barRow('Toolset', toolsetDisplay, toolsetTier)}
    </table>

    <p style="font-size:15px;color:${BRAND.sand};line-height:1.6;margin:0 0 24px;">
      Want to see how your perspective compares? Take the same assessment yourself.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center">
        <a href="https://alphasmb.com/assessment" style="display:inline-block;background:${BRAND.ember};color:${BRAND.white};font-size:16px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:8px;">Take the Assessment</a>
      </td></tr>
    </table>
    <p style="font-size:13px;color:${BRAND.stone};margin:20px 0 0;text-align:center;">Takes about 5 minutes. No account required.</p>`;

  return emailShell(content);
}

function buildInviteEmailText({ senderName }) {
  return `You've been invited to take the AI Readiness Assessment

${senderName} invited you to take the AlphaSMB AI Readiness Assessment. It's a 5-minute diagnostic that measures your organization's AI readiness across three dimensions: Mindset, Skillset, and Toolset.

Your perspective matters. The more leadership team members who complete the assessment, the clearer the picture of where your organization stands.

Take the Assessment: https://alphasmb.com/assessment

Takes about 5 minutes. No account required.

—
alphasmb.com`;
}

function buildShareResultsEmailText({ senderName, overallDisplay, overallTier, mindsetDisplay, mindsetTier, skillsetDisplay, skillsetTier, toolsetDisplay, toolsetTier }) {
  const overallLabel = OVERALL_TIER_LABELS[overallTier] || 'AI Building';

  return `${senderName} shared their AI Readiness results

${senderName} completed the AlphaSMB AI Readiness Assessment and wanted to share their results with you.

OVERALL SCORE: ${overallDisplay.toFixed(1)} / 10 — ${overallLabel}

  Mindset:  ${mindsetDisplay.toFixed(1)} / 10
  Skillset: ${skillsetDisplay.toFixed(1)} / 10
  Toolset:  ${toolsetDisplay.toFixed(1)} / 10

Want to see how your perspective compares? Take the same assessment yourself.

Take the Assessment: https://alphasmb.com/assessment

Takes about 5 minutes. No account required.

—
alphasmb.com`;
}

module.exports = { buildInviteEmail, buildShareResultsEmail, buildInviteEmailText, buildShareResultsEmailText };
