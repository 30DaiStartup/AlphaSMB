// HTML email builder for the full assessment report
// Duplicates insight copy from assessment/insights.js for server-side use

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

const MID_INSIGHTS = {
  mindset: {
    red: 'Your leadership team hasn\u2019t made the mental shift on AI yet. That\u2019s not uncommon \u2014 but it matters, because every decision downstream flows from how leadership thinks about this. Mindset is the ceiling for the entire organization.',
    orange: 'Your leadership is aware AI matters, but still framing it as an operational improvement. That\u2019s real value \u2014 but it\u2019s the smallest box AI fits in. The bigger question is what AI capability makes possible for your business.',
    yellow: 'Your leadership is thinking about AI beyond just tools. The gap at this stage is usually between leadership\u2019s vision and the organization\u2019s ability to execute on it.',
    'light-green': 'Strong leadership mindset. Your team sees AI as a capability, not just a tool. The question is whether the rest of the organization can keep up with where leadership wants to go.',
    green: 'Your leadership thinks about AI the right way \u2014 as a strategic capability. That\u2019s rare at the SMB level. The question now is execution and acceleration.',
  },
  skillset: {
    red: 'AI tool usage is minimal across your organization. This is the \u201Cbought licenses, nobody\u2019s using them\u201D pattern. In my experience, 80% of employees stop using AI tools within 30 days when there\u2019s no organizational support around the rollout.',
    orange: 'Some people are using AI tools, but adoption is thin and uneven. A few curious people figured it out on their own \u2014 everyone else hasn\u2019t found the bridge between \u201Cavailable tool\u201D and \u201Cembedded skill.\u201D',
    yellow: 'You\u2019re past the initial adoption hurdle. The question now is depth and distribution \u2014 are skills concentrated in a few people, or spreading across roles?',
    'light-green': 'Real skill development is happening. You likely have one or more informal champions who others go to for help. The next step is recognizing and empowering them.',
    green: 'Genuine AI skill depth across the organization. People are finding new use cases on their own and sustaining it. This is uncommon and a real competitive asset.',
  },
  toolset: {
    red: 'You haven\u2019t deployed AI tools yet, or deployment is completely ad-hoc. This is actually the easiest dimension to fix \u2014 but it should not be the first thing you fix. Tools without the right mindset and skills is just an expensive experiment.',
    orange: 'You have some AI tools in play, but selection was reactive, not strategic. Some licenses might be sitting unused. This is workable \u2014 but tool strategy should follow mindset and skill development, not precede it.',
    yellow: 'Tools are deployed and some thought has gone into selection and policy. This is where most organizations that \u201Ctook action on AI\u201D land \u2014 and where many stall.',
    'light-green': 'Your tool infrastructure is solid. Here\u2019s the honest truth: this is often the strongest dimension, and it matters the least. The tools are the easy part. The organizational capability to use them is the hard part.',
    green: 'Your tool infrastructure is solid. Here\u2019s the honest truth: this is often the strongest dimension, and it matters the least. The tools are the easy part. The organizational capability to use them is the hard part.',
  },
};

const PATTERNS = {
  not_started: {
    name: 'Not Started',
    summary: 'Your scores indicate your organization is at the very beginning of the AI transformation journey.',
  },
  tools_without_foundation: {
    name: 'Tools Without Foundation',
    summary: 'Your organization has invested in AI tools, but the foundation to actually use them isn\u2019t in place.',
  },
  vision_without_infrastructure: {
    name: 'Vision Without Infrastructure',
    summary: 'Your leadership gets it, but the organization below leadership can\u2019t yet execute on that vision.',
  },
  balanced_growth: {
    name: 'Balanced Growth',
    summary: 'Your scores are relatively balanced across dimensions, which tells me your organization has been thoughtful about AI adoption rather than rushing into one area.',
  },
};

const OVERALL_TIERS = {
  red: { label: 'AI Stalled', description: 'Your organization hasn\u2019t started the transformation \u2014 and the gap is growing.' },
  orange: { label: 'AI Aware', description: 'You know AI matters, but the organization can\u2019t move yet.' },
  yellow: { label: 'AI Building', description: 'You\u2019ve made progress in some areas, but structural gaps are holding you back.' },
  'light-green': { label: 'AI Advancing', description: 'Real capability is forming \u2014 now the question is acceleration and strategic alignment.' },
  green: { label: 'AI Capable', description: 'Your organization has serious AI capability. The question is what to do with it.' },
};

function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildDimensionBar(label, display, tierKey) {
  const pct = Math.round((display / 10) * 100);
  const color = TIER_COLORS[tierKey] || TIER_COLORS.yellow;
  const tierLabel = tierKey === 'light-green' ? 'Advancing' :
    tierKey === 'red' ? 'Not Started' :
    tierKey === 'orange' ? 'Early Stage' :
    tierKey === 'yellow' ? 'Developing' : 'Leading';

  return `
    <tr>
      <td style="padding:8px 0;width:80px;font-size:14px;color:${BRAND.sand};">${esc(label)}</td>
      <td style="padding:8px 12px;">
        <div style="background:${BRAND.slate};border-radius:4px;height:8px;width:100%;">
          <div style="background:${color};border-radius:4px;height:8px;width:${pct}%;"></div>
        </div>
      </td>
      <td style="padding:8px 0;width:120px;text-align:right;font-size:14px;">
        <span style="color:${BRAND.white};font-weight:600;">${display.toFixed(1)}</span>
        <span style="color:${color};font-size:12px;margin-left:6px;">${esc(tierLabel)}</span>
      </td>
    </tr>`;
}

function buildReportEmail(assessment) {
  const { user_name, overall_display, overall_tier, mindset_display, skillset_display, toolset_display, mindset_tier, skillset_tier, toolset_tier, pattern } = assessment;

  const overallColor = TIER_COLORS[overall_tier] || TIER_COLORS.yellow;
  const overallInfo = OVERALL_TIERS[overall_tier] || OVERALL_TIERS.yellow;
  const patternInfo = PATTERNS[pattern] || PATTERNS.balanced_growth;

  const mindsetInsight = MID_INSIGHTS.mindset[mindset_tier] || '';
  const skillsetInsight = MID_INSIGHTS.skillset[skillset_tier] || '';
  const toolsetInsight = MID_INSIGHTS.toolset[toolset_tier] || '';

  const firstName = user_name ? user_name.split(' ')[0] : 'there';

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
          <p style="font-size:13px;color:${BRAND.stone};margin:8px 0 0;">Your AI Readiness Report</p>
        </td></tr>

        <!-- Main card -->
        <tr><td style="background:${BRAND.charcoalLight};border-radius:12px;padding:32px;">

          <!-- Greeting -->
          <p style="font-size:16px;color:${BRAND.sand};line-height:1.6;margin:0 0 24px;">
            Hi ${esc(firstName)}, here are your full AI Readiness Assessment results.
          </p>

          <!-- Overall score -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center" style="padding:16px 0 24px;">
              <div style="font-size:48px;font-weight:700;color:${overallColor};">${overall_display.toFixed(1)}<span style="font-size:20px;color:${BRAND.stone};font-weight:400;"> / 10</span></div>
              <div style="display:inline-block;margin-top:8px;padding:4px 16px;border:1px solid ${overallColor};border-radius:20px;font-size:13px;font-weight:600;color:${overallColor};">${esc(overallInfo.label)}</div>
              <p style="font-size:14px;color:${BRAND.stone};margin:12px 0 0;line-height:1.5;">${esc(overallInfo.description)}</p>
            </td></tr>
          </table>

          <!-- Dimension bars -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 32px;">
            ${buildDimensionBar('Mindset', mindset_display, mindset_tier)}
            ${buildDimensionBar('Skillset', skillset_display, skillset_tier)}
            ${buildDimensionBar('Toolset', toolset_display, toolset_tier)}
          </table>

          <!-- Dimension insights -->
          <div style="border-top:1px solid ${BRAND.slate};padding-top:24px;margin-bottom:24px;">
            <h3 style="font-size:16px;font-weight:700;color:${BRAND.white};margin:0 0 16px;">Dimension Breakdown</h3>

            <div style="margin-bottom:20px;">
              <h4 style="font-size:14px;font-weight:600;color:${TIER_COLORS[mindset_tier] || BRAND.sand};margin:0 0 6px;">Mindset &mdash; ${mindset_display.toFixed(1)} / 10</h4>
              <p style="font-size:14px;color:${BRAND.sand};line-height:1.6;margin:0;">${esc(mindsetInsight)}</p>
            </div>

            <div style="margin-bottom:20px;">
              <h4 style="font-size:14px;font-weight:600;color:${TIER_COLORS[skillset_tier] || BRAND.sand};margin:0 0 6px;">Skillset &mdash; ${skillset_display.toFixed(1)} / 10</h4>
              <p style="font-size:14px;color:${BRAND.sand};line-height:1.6;margin:0;">${esc(skillsetInsight)}</p>
            </div>

            <div style="margin-bottom:20px;">
              <h4 style="font-size:14px;font-weight:600;color:${TIER_COLORS[toolset_tier] || BRAND.sand};margin:0 0 6px;">Toolset &mdash; ${toolset_display.toFixed(1)} / 10</h4>
              <p style="font-size:14px;color:${BRAND.sand};line-height:1.6;margin:0;">${esc(toolsetInsight)}</p>
            </div>
          </div>

          <!-- Gap pattern -->
          <div style="background:${BRAND.charcoal};border-radius:8px;padding:20px;margin-bottom:24px;">
            <h3 style="font-size:14px;font-weight:600;color:${BRAND.ember};margin:0 0 8px;">Gap Pattern: ${esc(patternInfo.name)}</h3>
            <p style="font-size:14px;color:${BRAND.sand};line-height:1.6;margin:0;">${esc(patternInfo.summary)}</p>
          </div>

          <!-- What to do next -->
          <div style="border-top:1px solid ${BRAND.slate};padding-top:24px;margin-bottom:24px;">
            <h3 style="font-size:16px;font-weight:700;color:${BRAND.white};margin:0 0 16px;">What To Do Next</h3>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="padding:0 0 12px;">
                <p style="font-size:14px;color:${BRAND.sand};line-height:1.6;margin:0;"><strong style="color:${BRAND.white};">1. Share with your leadership team.</strong> AI transformation is an organizational challenge, not a technology decision. Your team needs to see where you stand.</p>
              </td></tr>
              <tr><td style="padding:0 0 12px;">
                <p style="font-size:14px;color:${BRAND.sand};line-height:1.6;margin:0;"><strong style="color:${BRAND.white};">2. Identify your biggest gap.</strong> Look at which dimension scored lowest. That\u2019s where the bottleneck is \u2014 and usually where the highest-leverage work lives.</p>
              </td></tr>
              <tr><td style="padding:0 0 12px;">
                <p style="font-size:14px;color:${BRAND.sand};line-height:1.6;margin:0;"><strong style="color:${BRAND.white};">3. Get a strategy call.</strong> I\u2019ll walk you through exactly what to prioritize based on your scores and your specific situation.</p>
              </td></tr>
            </table>
          </div>

          <!-- CTA -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center" style="padding:8px 0 0;">
              <a href="https://alphasmb.com/book" style="display:inline-block;background:${BRAND.ember};color:${BRAND.white};font-size:16px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:8px;">Book a Strategy Call &mdash; $500</a>
            </td></tr>
          </table>

        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:24px 32px;text-align:center;">
          <p style="font-size:13px;color:${BRAND.stone};line-height:1.5;margin:0;">
            Zach Henderson &mdash; Head of AI at Aurora WDC<br>
            <a href="https://alphasmb.com" style="color:${BRAND.ember};text-decoration:none;">alphasmb.com</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

module.exports = { buildReportEmail };
