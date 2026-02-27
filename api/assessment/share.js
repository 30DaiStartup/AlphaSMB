const supabase = require('../_lib/supabase');
const resend = require('../_lib/resend');
const { buildInviteEmail, buildShareResultsEmail, buildInviteEmailText, buildShareResultsEmailText } = require('../_lib/share-email');
const { validateEnv } = require('../_lib/config');
const { validateEmail, validateSessionId, validateName } = require('../_lib/validate');

var MAX_RECIPIENTS = 10;

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sessionId, type, senderRole, senderName, senderEmail, recipients, visibility } = req.body;

    if (!sessionId || !type || !senderRole || !recipients || !recipients.length) {
      return res.status(400).json({ error: 'Missing required fields: sessionId, type, senderRole, recipients' });
    }

    if (!senderName || !senderEmail) {
      return res.status(400).json({ error: 'Missing sender info: senderName, senderEmail. Submit the report form first.' });
    }

    if (type !== 'distribute' && type !== 'share_with_leader') {
      return res.status(400).json({ error: 'Invalid type. Must be "distribute" or "share_with_leader".' });
    }

    validateEnv();

    if (!validateSessionId(sessionId)) {
      return res.status(400).json({ error: 'Invalid session ID format' });
    }

    if (!validateName(senderName)) {
      return res.status(400).json({ error: 'Invalid sender name' });
    }

    if (!validateEmail(senderEmail)) {
      return res.status(400).json({ error: 'Invalid sender email format' });
    }

    if (recipients.length > MAX_RECIPIENTS) {
      return res.status(400).json({ error: 'Too many recipients. Maximum is ' + MAX_RECIPIENTS });
    }

    // Validate each recipient email
    for (var i = 0; i < recipients.length; i++) {
      if (recipients[i].email && !validateEmail(recipients[i].email)) {
        return res.status(400).json({ error: 'Invalid recipient email format' });
      }
    }

    // Look up assessment
    const { data: assessment, error: lookupError } = await supabase
      .from('assessments')
      .select('id, session_id, overall_display, overall_tier, mindset_display, mindset_tier, skillset_display, skillset_tier, toolset_display, toolset_tier')
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

    // Insert share intent
    const { data: shareIntent, error: insertError } = await supabase
      .from('share_intents')
      .insert({
        assessment_id: assessment.id,
        type: type,
        sender_role: senderRole,
        visibility: visibility || null,
        recipients: recipients,
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Share intent insert error:', insertError);
      return res.status(500).json({ error: 'Failed to store share intent' });
    }

    // Send emails to each recipient
    let sentCount = 0;
    const errors = [];

    for (const recipient of recipients) {
      if (!recipient.email) continue;

      let html;
      let text;
      let subject;

      const shareParams = {
        senderName,
        overallDisplay: assessment.overall_display,
        overallTier: assessment.overall_tier,
        mindsetDisplay: assessment.mindset_display,
        mindsetTier: assessment.mindset_tier,
        skillsetDisplay: assessment.skillset_display,
        skillsetTier: assessment.skillset_tier,
        toolsetDisplay: assessment.toolset_display,
        toolsetTier: assessment.toolset_tier,
      };

      if (type === 'distribute') {
        // Leader inviting team to take assessment
        html = buildInviteEmail({ senderName });
        text = buildInviteEmailText({ senderName });
        subject = `${senderName} invited you to take the AI Readiness Assessment`;
      } else {
        // Member sharing results with leader
        html = buildShareResultsEmail(shareParams);
        text = buildShareResultsEmailText(shareParams);
        subject = `${senderName} shared their AI Readiness Assessment results with you`;
      }

      try {
        const { error: emailError } = await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL,
          reply_to: 'zach@alphasmb.com',
          to: recipient.email,
          subject: subject,
          html: html,
          text: text,
          headers: {
            'List-Unsubscribe': '<mailto:zach@alphasmb.com?subject=unsubscribe>',
            'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
          },
        });

        if (emailError) {
          console.error('Failed to send share email:', emailError);
          errors.push(recipient.email);
        } else {
          sentCount++;
        }
      } catch (emailErr) {
        console.error('Exception sending share email:', emailErr);
        errors.push(recipient.email);
      }
    }

    // Update share intent with send status
    await supabase
      .from('share_intents')
      .update({
        emails_sent: sentCount > 0,
        emails_sent_at: sentCount > 0 ? new Date().toISOString() : null,
      })
      .eq('id', shareIntent.id);

    if (sentCount === 0 && errors.length > 0) {
      return res.status(500).json({ error: 'Failed to send any emails', failedRecipients: errors });
    }

    return res.status(200).json({ success: true, sent: sentCount, failed: errors });
  } catch (err) {
    console.error('Assessment share error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
