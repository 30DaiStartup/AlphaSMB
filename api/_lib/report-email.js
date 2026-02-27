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

// Weekly actions keyed by question ID — surfaced when that question is one of the 2 lowest
const WEEKLY_ACTIONS = {
  q1: 'Schedule a 30-minute leadership meeting this week with one agenda item: \u201CWhat would change about our business if we could automate any 3 processes?\u201D Don\u2019t solve it \u2014 just start the conversation.',
  q2: 'Block 1 hour this week for your CEO or top leader to use an AI tool on one real task \u2014 drafting a memo, analyzing a report, brainstorming strategy. Leaders who use AI tools make fundamentally different decisions about AI investment.',
  q3: 'Bring one concrete AI use case to your next leadership meeting this week. Frame it as a 2-week experiment with a specific metric to measure \u2014 this shifts the conversation from abstract to actionable.',
  q4: 'Spend 30 minutes this week researching how 3 companies in your industry are using AI. Share a one-paragraph summary with your leadership team \u2014 nothing motivates action like seeing competitors move.',
  q5: 'Map your top 3 competitors\u2019 public AI moves this week \u2014 job postings mentioning AI, product announcements, press mentions. Share a quick brief with leadership so the competitive picture is concrete, not theoretical.',
  q6: 'Identify 3 people in different roles. Ask each to try one AI tool on real work this week and report back what happened. You\u2019re not rolling out AI \u2014 you\u2019re finding out where it sticks.',
  q7: 'Pick 3 people whose AI usage dropped off. Ask each one: \u201CWhat got in the way?\u201D This week, you\u2019ll learn whether the barrier is skill, permission, or relevance \u2014 and that tells you exactly what to fix.',
  q8: 'Find the person on your team who\u2019s most curious about AI. Ask them to do a 15-minute show-and-tell for the team this week \u2014 one real example of how they\u2019ve used AI on actual work.',
  q9: 'Identify one person in each department this week. Give them a specific AI task relevant to their role and 30 minutes to try it. You\u2019re looking for who picks it up fastest \u2014 those are your future champions.',
  q10: 'Pick one workflow your team does weekly. Spend 30 minutes this week documenting how AI could assist each step. Don\u2019t implement anything yet \u2014 just make the opportunity visible.',
  q11: 'Audit your current tool situation this week: list every AI tool anyone on your team has access to, who\u2019s using it, and what for. You can\u2019t strategize what you haven\u2019t inventoried.',
  q12: 'Pick your most-used AI tool this week. Have 3 different team members test it on a real task from their actual workflow, then compare notes on what worked and what didn\u2019t.',
  q13: 'Choose one repetitive workflow your team does weekly. Document each step and identify where someone is copying and pasting between an AI tool and another system \u2014 that\u2019s your integration opportunity.',
  q14: 'Draft a one-page AI usage guideline this week: what tools are approved, what data can and can\u2019t go in, who to ask questions. Imperfect guidelines this week beat perfect guidelines next quarter.',
  q15: 'List every AI subscription your organization pays for this week. For each one, write down: who uses it, how often, and one specific outcome it\u2019s produced. Cancel anything no one can justify.',
};

// Pattern-based third action (strategic context alongside the two tactical actions)
const PATTERN_ACTIONS = {
  not_started: 'Set aside one team meeting this week to answer one question: \u201CIf we could use AI to solve one problem in our business, what would it be?\u201D Don\u2019t worry about how \u2014 just align on where to start.',
  tools_without_foundation: 'Pause any new tool purchases this week. Instead, pick one tool you already have and assign one specific person to build one specific workflow with it. Foundation before expansion.',
  vision_without_infrastructure: 'Ask each member of your leadership team to write down their top AI priority this week. Compare notes \u2014 if they don\u2019t match, that\u2019s your first infrastructure gap: alignment.',
  balanced_growth: 'Pick the dimension where you scored lowest and do one thing to move it forward this week. Balanced growth means your bottleneck is wherever you focus least.',
};

const PATTERNS = {
  not_started: {
    name: 'Not Started',
    summary: 'Your scores indicate your organization is at the very beginning of the AI transformation journey.',
    implication: 'Most companies in your position feel like they\u2019ve already fallen behind \u2014 but the reality is that most SMBs haven\u2019t started either. The risk isn\u2019t that you\u2019re behind today. It\u2019s that the gap compounds every quarter you wait. Starting now, even small, gives you a real advantage over competitors who are still frozen.',
  },
  tools_without_foundation: {
    name: 'Tools Without Foundation',
    summary: 'Your organization has invested in AI tools, but the foundation to actually use them isn\u2019t in place.',
    implication: 'This is the most common pattern I see \u2014 and the most expensive. Tool licenses are burning budget while the skills and mindset to use them haven\u2019t developed. The fix isn\u2019t more tools or different tools. It\u2019s building the organizational capability underneath.',
  },
  vision_without_infrastructure: {
    name: 'Vision Without Infrastructure',
    summary: 'Your leadership gets it, but the organization below leadership can\u2019t yet execute on that vision.',
    implication: 'Your leadership is ahead of the organization \u2014 which is actually the right order. But vision without execution creates frustration on both sides. Leadership gets impatient, teams feel pressured but unsupported. The bridge is structured skill-building and clear permission to experiment.',
  },
  balanced_growth: {
    name: 'Balanced Growth',
    summary: 'Your scores are relatively balanced across dimensions, which tells me your organization has been thoughtful about AI adoption rather than rushing into one area.',
    implication: 'Balanced doesn\u2019t mean slow. It means you\u2019ve avoided the traps that catch most organizations \u2014 buying tools nobody uses, or building vision nobody can execute. Your next move is acceleration: pick the dimension where a 1-point improvement would unlock the most value and focus there.',
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

// Find the 2 lowest-scoring questions from the answers object
// answers format: { q1: { score: 3 }, q2: { score: 2 }, ... }
function findLowestQuestions(answers) {
  if (!answers || typeof answers !== 'object') return [];

  const entries = [];
  for (let i = 1; i <= 15; i++) {
    const qId = 'q' + i;
    const answer = answers[qId];
    if (answer && typeof answer.score === 'number') {
      entries.push({ id: qId, score: answer.score });
    }
  }

  if (entries.length === 0) return [];

  entries.sort((a, b) => a.score - b.score);
  return entries.slice(0, 2).map(e => e.id);
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

function buildBenchmarkBar(label, score, percentile) {
  if (!percentile) return '';
  var pct = Math.max(2, Math.min(98, percentile));
  var color = percentile >= 75 ? '#15803D' : percentile >= 50 ? '#CA8A04' : percentile >= 25 ? '#EA580C' : '#DC2626';
  var pctLabel = percentile >= 50
    ? 'Top ' + (100 - percentile) + '%'
    : 'Bottom ' + percentile + '%';

  return `
    <tr>
      <td style="padding:6px 0;width:80px;font-size:14px;color:${BRAND.sand};">${esc(label)}</td>
      <td style="padding:6px 12px;">
        <div style="background:${BRAND.slate};border-radius:4px;height:8px;width:100%;position:relative;">
          <div style="background:${color};border-radius:4px;height:8px;width:${pct}%;"></div>
        </div>
      </td>
      <td style="padding:6px 0;width:100px;text-align:right;font-size:13px;">
        <span style="color:${color};font-weight:600;">${esc(pctLabel)}</span>
      </td>
    </tr>`;
}

function buildBenchmarkSection(benchmark) {
  if (!benchmark || !benchmark.overallPercentile) return '';

  var sourceLabel = benchmark.dataSource === 'peer_data'
    ? 'Based on ' + benchmark.sampleCount + ' assessments'
    : benchmark.dataSource === 'blended'
    ? 'Based on peer data + industry research'
    : 'Based on industry research';

  return `
          <!-- How You Compare -->
          <div style="border-top:1px solid ${BRAND.slate};padding-top:24px;margin-bottom:24px;">
            <h3 style="font-size:16px;font-weight:700;color:${BRAND.white};margin:0 0 6px;">How You Compare</h3>
            <p style="font-size:13px;color:${BRAND.stone};margin:0 0 16px;line-height:1.5;">${esc(sourceLabel)} &mdash; ${esc(benchmark.segmentLabel)}</p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              ${buildBenchmarkBar('Overall', null, benchmark.overallPercentile)}
              ${buildBenchmarkBar('Mindset', null, benchmark.mindsetPercentile)}
              ${buildBenchmarkBar('Skillset', null, benchmark.skillsetPercentile)}
              ${buildBenchmarkBar('Toolset', null, benchmark.toolsetPercentile)}
            </table>
          </div>`;
}

// Build a competitive positioning sentence for a dimension
function buildBenchmarkSentence(dimension, percentile, segmentLabel) {
  if (!percentile || !segmentLabel) return '';
  const position = percentile >= 50
    ? 'top ' + (100 - percentile) + '%'
    : 'bottom ' + percentile + '%';
  return ` Among ${esc(segmentLabel)}, your ${esc(dimension.toLowerCase())} score puts you in the ${position}.`;
}

// Build the "Three Things You Can Do This Week" section
function buildWeeklyActions(answers, pattern) {
  const lowestQs = findLowestQuestions(answers);
  const patternAction = PATTERN_ACTIONS[pattern] || PATTERN_ACTIONS.balanced_growth;

  // If we couldn't extract lowest questions, fall back to pattern-only actions
  if (lowestQs.length < 2) {
    return `
          <!-- Three things this week -->
          <div style="border-top:1px solid ${BRAND.slate};padding-top:24px;margin-bottom:24px;">
            <h3 style="font-size:16px;font-weight:700;color:${BRAND.white};margin:0 0 16px;">Three Things You Can Do This Week</h3>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="padding:0 0 12px;">
                <p style="font-size:14px;color:${BRAND.sand};line-height:1.6;margin:0;"><strong style="color:${BRAND.white};">1.</strong> ${esc(patternAction)}</p>
              </td></tr>
              <tr><td style="padding:0 0 12px;">
                <p style="font-size:14px;color:${BRAND.sand};line-height:1.6;margin:0;"><strong style="color:${BRAND.white};">2. Share this report with your leadership team.</strong> AI transformation is an organizational challenge, not a technology decision. Your team needs to see where you stand.</p>
              </td></tr>
              <tr><td style="padding:0 0 12px;">
                <p style="font-size:14px;color:${BRAND.sand};line-height:1.6;margin:0;"><strong style="color:${BRAND.white};">3. Get a strategy call.</strong> I\u2019ll walk you through exactly what to prioritize based on your scores and your specific situation.</p>
              </td></tr>
            </table>
          </div>`;
  }

  const action1 = WEEKLY_ACTIONS[lowestQs[0]] || WEEKLY_ACTIONS.q1;
  const action2 = WEEKLY_ACTIONS[lowestQs[1]] || WEEKLY_ACTIONS.q2;

  return `
          <!-- Three things this week -->
          <div style="border-top:1px solid ${BRAND.slate};padding-top:24px;margin-bottom:24px;">
            <h3 style="font-size:16px;font-weight:700;color:${BRAND.white};margin:0 0 16px;">Three Things You Can Do This Week</h3>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="padding:0 0 12px;">
                <p style="font-size:14px;color:${BRAND.sand};line-height:1.6;margin:0;"><strong style="color:${BRAND.white};">1.</strong> ${esc(action1)}</p>
              </td></tr>
              <tr><td style="padding:0 0 12px;">
                <p style="font-size:14px;color:${BRAND.sand};line-height:1.6;margin:0;"><strong style="color:${BRAND.white};">2.</strong> ${esc(action2)}</p>
              </td></tr>
              <tr><td style="padding:0 0 12px;">
                <p style="font-size:14px;color:${BRAND.sand};line-height:1.6;margin:0;"><strong style="color:${BRAND.white};">3.</strong> ${esc(patternAction)}</p>
              </td></tr>
            </table>
          </div>`;
}

function buildShareSection(sessionId, overallDisplay, overallTier, mindsetDisplay, skillsetDisplay, toolsetDisplay) {
  if (!sessionId) return '';

  const shareUrl = 'https://alphasmb.com/results/' + encodeURIComponent(sessionId);
  const tierLabel = (OVERALL_TIERS[overallTier] || OVERALL_TIERS.yellow).label;

  const xText = 'I scored ' + overallDisplay.toFixed(1) + '/10 on the AI Readiness Assessment \u2014 ' + tierLabel + '.\n\nMindset ' + mindsetDisplay.toFixed(1) + ' \u00B7 Skillset ' + skillsetDisplay.toFixed(1) + ' \u00B7 Toolset ' + toolsetDisplay.toFixed(1) + '\n\nHow ready is your organization?';
  const xUrl = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(xText) + '&url=' + encodeURIComponent(shareUrl);
  const liUrl = 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(shareUrl);
  const fbUrl = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(shareUrl);

  const btnStyle = 'display:inline-block;padding:10px 18px;border-radius:6px;font-size:13px;font-weight:600;text-decoration:none;color:#FFFFFF;';

  return `
          <!-- Share your score -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="border-top:1px solid ${BRAND.slate};padding-top:24px;margin-top:24px;">
              <p style="font-size:14px;font-weight:600;color:${BRAND.white};text-align:center;margin:0 0 16px;">Share your score</p>
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="padding:0 6px;">
                    <a href="${esc(xUrl)}" style="${btnStyle}background:#000000;" target="_blank">Share on X</a>
                  </td>
                  <td style="padding:0 6px;">
                    <a href="${esc(liUrl)}" style="${btnStyle}background:#0A66C2;" target="_blank">Share on LinkedIn</a>
                  </td>
                  <td style="padding:0 6px;">
                    <a href="${esc(fbUrl)}" style="${btnStyle}background:#1877F2;" target="_blank">Share on Facebook</a>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>`;
}

function buildReportEmail(assessment, benchmark, answers) {
  const { session_id, user_name, overall_display, overall_tier, mindset_display, skillset_display, toolset_display, mindset_tier, skillset_tier, toolset_tier, pattern } = assessment;

  const overallColor = TIER_COLORS[overall_tier] || TIER_COLORS.yellow;
  const overallInfo = OVERALL_TIERS[overall_tier] || OVERALL_TIERS.yellow;
  const patternInfo = PATTERNS[pattern] || PATTERNS.balanced_growth;

  const mindsetInsight = MID_INSIGHTS.mindset[mindset_tier] || '';
  const skillsetInsight = MID_INSIGHTS.skillset[skillset_tier] || '';
  const toolsetInsight = MID_INSIGHTS.toolset[toolset_tier] || '';

  const firstName = user_name ? user_name.split(' ')[0] : 'there';

  // Competitive positioning sentences (only when benchmark data exists)
  const segmentLabel = benchmark && benchmark.segmentLabel ? benchmark.segmentLabel : '';
  const mindsetBenchmark = buildBenchmarkSentence('mindset', benchmark && benchmark.mindsetPercentile, segmentLabel);
  const skillsetBenchmark = buildBenchmarkSentence('skillset', benchmark && benchmark.skillsetPercentile, segmentLabel);
  const toolsetBenchmark = buildBenchmarkSentence('toolset', benchmark && benchmark.toolsetPercentile, segmentLabel);

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
              <p style="font-size:14px;color:${BRAND.sand};line-height:1.6;margin:0;">${esc(mindsetInsight)}${mindsetBenchmark}</p>
            </div>

            <div style="margin-bottom:20px;">
              <h4 style="font-size:14px;font-weight:600;color:${TIER_COLORS[skillset_tier] || BRAND.sand};margin:0 0 6px;">Skillset &mdash; ${skillset_display.toFixed(1)} / 10</h4>
              <p style="font-size:14px;color:${BRAND.sand};line-height:1.6;margin:0;">${esc(skillsetInsight)}${skillsetBenchmark}</p>
            </div>

            <div style="margin-bottom:20px;">
              <h4 style="font-size:14px;font-weight:600;color:${TIER_COLORS[toolset_tier] || BRAND.sand};margin:0 0 6px;">Toolset &mdash; ${toolset_display.toFixed(1)} / 10</h4>
              <p style="font-size:14px;color:${BRAND.sand};line-height:1.6;margin:0;">${esc(toolsetInsight)}${toolsetBenchmark}</p>
            </div>
          </div>

          <!-- Gap pattern -->
          <div style="background:${BRAND.charcoal};border-radius:8px;padding:20px;margin-bottom:24px;">
            <h3 style="font-size:14px;font-weight:600;color:${BRAND.ember};margin:0 0 8px;">Gap Pattern: ${esc(patternInfo.name)}</h3>
            <p style="font-size:14px;color:${BRAND.sand};line-height:1.6;margin:0 0 12px;">${esc(patternInfo.summary)}</p>
            <p style="font-size:14px;color:${BRAND.sand};line-height:1.6;margin:0;">${esc(patternInfo.implication)}</p>
          </div>

          ${buildBenchmarkSection(benchmark)}

          ${buildWeeklyActions(answers, pattern)}

          <!-- CTA -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center" style="padding:8px 0 0;">
              <a href="https://alphasmb.com/book" style="display:inline-block;background:${BRAND.ember};color:${BRAND.white};font-size:16px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:8px;">Book a Strategy Call &mdash; $500</a>
            </td></tr>
          </table>

          <!-- Distribute to team (plain text, not a styled button) -->
          <p style="font-size:13px;color:${BRAND.stone};line-height:1.6;margin:24px 0 0;text-align:center;">
            One perspective is useful. Multiple leaders reveal the full picture.<br>
            <a href="https://alphasmb.com/results/${encodeURIComponent(session_id)}#distribute" style="color:${BRAND.stone};text-decoration:underline;">Invite your team to take the assessment</a>
          </p>

        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:24px 32px;text-align:center;">
          <p style="font-size:13px;color:${BRAND.stone};line-height:1.5;margin:0;">
            Zach Henderson<br>
            <a href="https://alphasmb.com" style="color:${BRAND.ember};text-decoration:none;">alphasmb.com</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildReportEmailText(assessment, benchmark, answers) {
  const { user_name, overall_display, overall_tier, mindset_display, skillset_display, toolset_display, mindset_tier, skillset_tier, toolset_tier, pattern } = assessment;

  const overallInfo = OVERALL_TIERS[overall_tier] || OVERALL_TIERS.yellow;
  const patternInfo = PATTERNS[pattern] || PATTERNS.balanced_growth;
  const firstName = user_name ? user_name.split(' ')[0] : 'there';

  const mindsetInsight = MID_INSIGHTS.mindset[mindset_tier] || '';
  const skillsetInsight = MID_INSIGHTS.skillset[skillset_tier] || '';
  const toolsetInsight = MID_INSIGHTS.toolset[toolset_tier] || '';

  // Benchmark context
  const segmentLabel = benchmark && benchmark.segmentLabel ? benchmark.segmentLabel : '';
  function benchLine(dim, percentile) {
    if (!percentile || !segmentLabel) return '';
    const pos = percentile >= 50 ? 'top ' + (100 - percentile) + '%' : 'bottom ' + percentile + '%';
    return ' Among ' + segmentLabel + ', your ' + dim + ' score puts you in the ' + pos + '.';
  }

  // Weekly actions
  const lowestQs = findLowestQuestions(answers);
  const patternAction = PATTERN_ACTIONS[pattern] || PATTERN_ACTIONS.balanced_growth;
  let weeklyLines;
  if (lowestQs.length >= 2) {
    weeklyLines = [
      '1. ' + (WEEKLY_ACTIONS[lowestQs[0]] || WEEKLY_ACTIONS.q1),
      '2. ' + (WEEKLY_ACTIONS[lowestQs[1]] || WEEKLY_ACTIONS.q2),
      '3. ' + patternAction,
    ];
  } else {
    weeklyLines = [
      '1. ' + patternAction,
      '2. Share this report with your leadership team. AI transformation is an organizational challenge, not a technology decision.',
      '3. Get a strategy call. I\'ll walk you through exactly what to prioritize based on your scores.',
    ];
  }

  // Benchmark section
  let benchSection = '';
  if (benchmark && benchmark.overallPercentile) {
    const srcLabel = benchmark.dataSource === 'peer_data'
      ? 'Based on ' + benchmark.sampleCount + ' assessments'
      : benchmark.dataSource === 'blended'
      ? 'Based on peer data + industry research'
      : 'Based on industry research';
    function pctLabel(p) { return p >= 50 ? 'Top ' + (100 - p) + '%' : 'Bottom ' + p + '%'; }
    benchSection = '\n\nHOW YOU COMPARE (' + srcLabel + ' — ' + segmentLabel + ')\n' +
      '  Overall:  ' + pctLabel(benchmark.overallPercentile) + '\n' +
      '  Mindset:  ' + pctLabel(benchmark.mindsetPercentile) + '\n' +
      '  Skillset: ' + pctLabel(benchmark.skillsetPercentile) + '\n' +
      '  Toolset:  ' + pctLabel(benchmark.toolsetPercentile);
  }

  return `Hi ${firstName}, here are your full AI Readiness Assessment results.

OVERALL SCORE: ${overall_display.toFixed(1)} / 10 — ${overallInfo.label}
${overallInfo.description}

  Mindset:  ${mindset_display.toFixed(1)} / 10
  Skillset: ${skillset_display.toFixed(1)} / 10
  Toolset:  ${toolset_display.toFixed(1)} / 10

DIMENSION BREAKDOWN

Mindset — ${mindset_display.toFixed(1)} / 10
${mindsetInsight}${benchLine('mindset', benchmark && benchmark.mindsetPercentile)}

Skillset — ${skillset_display.toFixed(1)} / 10
${skillsetInsight}${benchLine('skillset', benchmark && benchmark.skillsetPercentile)}

Toolset — ${toolset_display.toFixed(1)} / 10
${toolsetInsight}${benchLine('toolset', benchmark && benchmark.toolsetPercentile)}

GAP PATTERN: ${patternInfo.name}
${patternInfo.summary}
${patternInfo.implication}${benchSection}

THREE THINGS YOU CAN DO THIS WEEK
${weeklyLines.join('\n\n')}

Book a Strategy Call — $500
https://alphasmb.com/book

—
Zach Henderson
alphasmb.com`;
}

module.exports = { buildReportEmail, buildReportEmailText };
