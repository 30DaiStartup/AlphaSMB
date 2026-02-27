const supabase = require('../_lib/supabase');
const resend = require('../_lib/resend');
const { validateEnv } = require('../_lib/config');
const { validateSessionId } = require('../_lib/validate');
const { buildNotifyEmail, buildNotifyEmailText } = require('../_lib/notify-email');
const { rateLimit } = require('../_lib/rate-limit');

// 10 completions per 15 minutes per IP
var limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });

function isValidScore(val) {
  return typeof val === 'number' && isFinite(val) && val >= 0 && val <= 10;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (limiter(req, res)) return;

  try {
    const { sessionId, role, industry, companySize, startedAt, completedAt, answers, scores } = req.body;

    validateEnv();

    // Validate required fields
    if (!sessionId || !answers || !scores) {
      return res.status(400).json({ error: 'Missing required fields: sessionId, answers, scores' });
    }

    if (!validateSessionId(sessionId)) {
      return res.status(400).json({ error: 'Invalid session ID format' });
    }

    if (!scores.raw || !scores.display || !scores.tiers) {
      return res.status(400).json({ error: 'Invalid scores structure' });
    }

    // Validate score ranges (0-10) to prevent benchmark pollution
    var displayScores = [scores.display.mindset, scores.display.skillset, scores.display.toolset, scores.display.overall];
    for (var i = 0; i < displayScores.length; i++) {
      if (!isValidScore(Number(displayScores[i]))) {
        return res.status(400).json({ error: 'Invalid score value: must be 0-10' });
      }
    }

    // Upsert into assessments table (keyed on session_id for idempotency)
    const { data, error } = await supabase
      .from('assessments')
      .upsert({
        session_id: sessionId,
        role: role || null,
        company_size: companySize || null,
        industry: industry || null,
        started_at: startedAt || null,
        completed_at: completedAt || new Date().toISOString(),
        answers: answers,
        mindset_raw: scores.raw.mindset,
        skillset_raw: scores.raw.skillset,
        toolset_raw: scores.raw.toolset,
        overall_raw: scores.raw.overall,
        mindset_display: scores.display.mindset,
        skillset_display: scores.display.skillset,
        toolset_display: scores.display.toolset,
        overall_display: scores.display.overall,
        mindset_tier: scores.tiers.mindset?.key || null,
        skillset_tier: scores.tiers.skillset?.key || null,
        toolset_tier: scores.tiers.toolset?.key || null,
        overall_tier: scores.tiers.overall?.key || null,
        pattern: scores.pattern || null,
      }, {
        onConflict: 'session_id',
      })
      .select('id')
      .single();

    if (error) {
      console.error('Supabase upsert error:', error);
      return res.status(500).json({ error: 'Failed to store assessment' });
    }

    // Send notification email to Zach (fire-and-forget — don't block the response)
    try {
      const notifyData = {
        sessionId,
        overallDisplay: scores.display.overall,
        overallTier: scores.tiers.overall?.key || null,
        mindsetDisplay: scores.display.mindset,
        mindsetTier: scores.tiers.mindset?.key || null,
        skillsetDisplay: scores.display.skillset,
        skillsetTier: scores.tiers.skillset?.key || null,
        toolsetDisplay: scores.display.toolset,
        toolsetTier: scores.tiers.toolset?.key || null,
        pattern: scores.pattern || null,
        role: role || null,
        industry: industry || null,
        companySize: companySize || null,
      };

      const html = buildNotifyEmail(notifyData);
      const text = buildNotifyEmailText(notifyData);

      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL,
        to: 'zach@alphasmb.com',
        subject: `New Assessment: ${scores.display.overall.toFixed(1)}/10 — ${scores.tiers.overall?.label || 'Completed'}`,
        html,
        text,
      });

      console.log('Notify email sent for session:', sessionId);
    } catch (notifyErr) {
      // Log but don't fail the request — the assessment was already saved
      console.error('Notify email error:', notifyErr);
    }

    return res.status(200).json({ id: data.id });
  } catch (err) {
    console.error('Assessment complete error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
