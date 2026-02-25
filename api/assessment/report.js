const supabase = require('../_lib/supabase');
const resend = require('../_lib/resend');
const { buildReportEmail } = require('../_lib/report-email');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sessionId, name, email } = req.body;

    if (!sessionId || !name || !email) {
      return res.status(400).json({ error: 'Missing required fields: sessionId, name, email' });
    }

    // Look up assessment by session_id
    const { data: assessment, error: lookupError } = await supabase
      .from('assessments')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (lookupError || !assessment) {
      console.error('Assessment lookup error:', lookupError);
      return res.status(404).json({ error: 'Assessment not found' });
    }

    // Supabase returns numeric(3,1) columns as strings — parse to numbers
    assessment.overall_display = Number(assessment.overall_display);
    assessment.mindset_display = Number(assessment.mindset_display);
    assessment.skillset_display = Number(assessment.skillset_display);
    assessment.toolset_display = Number(assessment.toolset_display);

    // Skip if report was already sent to this email (idempotency)
    if (assessment.report_sent_at && assessment.user_email === email) {
      return res.status(200).json({ success: true, alreadySent: true });
    }

    // Update assessment with user identity
    const { error: updateError } = await supabase
      .from('assessments')
      .update({
        user_name: name,
        user_email: email,
        email_captured: true,
        email_captured_at: new Date().toISOString(),
      })
      .eq('id', assessment.id);

    if (updateError) {
      console.error('Assessment update error:', updateError);
      return res.status(500).json({ error: 'Failed to update assessment' });
    }

    // Build and send email
    const html = buildReportEmail(assessment);

    const { error: emailError } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: email,
      subject: `Your AI Readiness Score: ${assessment.overall_display.toFixed(1)} / 10`,
      html: html,
    });

    if (emailError) {
      console.error('Resend error:', emailError);
      return res.status(500).json({ error: 'Failed to send email' });
    }

    // Mark report as sent
    await supabase
      .from('assessments')
      .update({ report_sent_at: new Date().toISOString() })
      .eq('id', assessment.id);

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Assessment report error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
