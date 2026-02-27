const supabase = require('../_lib/supabase');
const resend = require('../_lib/resend');
const { buildReportEmail, buildReportEmailText } = require('../_lib/report-email');
const { validateEnv } = require('../_lib/config');
const { validateEmail, validateSessionId, validateName } = require('../_lib/validate');
const { resolveCompany } = require('../_lib/company');
const { computeBenchmark, cacheBenchmarkResult } = require('../_lib/benchmark');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    validateEnv();

    const { sessionId, name, email } = req.body;

    if (!sessionId || !name || !email) {
      return res.status(400).json({ error: 'Missing required fields: sessionId, name, email' });
    }

    if (!validateSessionId(sessionId)) {
      return res.status(400).json({ error: 'Invalid session ID format' });
    }

    if (!validateName(name)) {
      return res.status(400).json({ error: 'Invalid name' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Look up assessment by session_id
    const { data: assessment, error: lookupError } = await supabase
      .from('assessments')
      .select('id, session_id, user_name, user_email, report_sent_at, overall_display, overall_tier, mindset_display, mindset_tier, skillset_display, skillset_tier, toolset_display, toolset_tier, pattern, answers')
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

    // Resolve company from email domain
    const { company, domain: emailDomain } = await resolveCompany(email);

    // Update assessment with company info
    const companyUpdate = { email_domain: emailDomain };
    if (company) companyUpdate.company_id = company.id;

    await supabase
      .from('assessments')
      .update(companyUpdate)
      .eq('id', assessment.id);

    // Also need industry and company_size for benchmark computation
    const { data: fullAssessment } = await supabase
      .from('assessments')
      .select('id, industry, company_size, overall_display, mindset_display, skillset_display, toolset_display')
      .eq('id', assessment.id)
      .single();

    // Compute benchmark
    let benchmark = null;
    if (fullAssessment) {
      // Parse numeric strings
      fullAssessment.overall_display = Number(fullAssessment.overall_display);
      fullAssessment.mindset_display = Number(fullAssessment.mindset_display);
      fullAssessment.skillset_display = Number(fullAssessment.skillset_display);
      fullAssessment.toolset_display = Number(fullAssessment.toolset_display);

      benchmark = await computeBenchmark(fullAssessment);

      // Cache the result
      await cacheBenchmarkResult(assessment.id, company ? company.id : null, benchmark);
    }

    // Set user_name on local object so buildReportEmail uses the name
    assessment.user_name = name;

    // Build and send email
    const html = buildReportEmail(assessment, benchmark, assessment.answers);
    const text = buildReportEmailText(assessment, benchmark, assessment.answers);

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      reply_to: 'zach@alphasmb.com',
      to: email,
      subject: `Your AI Readiness Score: ${assessment.overall_display.toFixed(1)} / 10`,
      html: html,
      text: text,
      headers: {
        'List-Unsubscribe': '<mailto:zach@alphasmb.com?subject=unsubscribe>',
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
    });

    if (emailError) {
      console.error('Resend error:', emailError);
      return res.status(500).json({ error: 'Failed to send email' });
    }

    console.log('Report email sent:', emailData?.id, 'session:', sessionId);

    // Mark report as sent
    await supabase
      .from('assessments')
      .update({ report_sent_at: new Date().toISOString() })
      .eq('id', assessment.id);

    const response = { success: true, emailId: emailData?.id };
    if (benchmark) response.benchmark = benchmark;

    return res.status(200).json(response);
  } catch (err) {
    console.error('Assessment report error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
