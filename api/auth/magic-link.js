// POST /api/auth/magic-link — send magic link email to admin
// Always returns 200 to prevent email enumeration

const { validateEnv } = require('../_lib/config');
const { validateEmail } = require('../_lib/validate');
const { ADMIN_EMAIL, createMagicToken } = require('../_lib/auth');
const { buildMagicLinkEmail } = require('../_lib/magic-link-email');
const resend = require('../_lib/resend');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    validateEnv();

    const { email } = req.body || {};

    if (!email || !validateEmail(email)) {
      // Same response as success to prevent enumeration
      return res.status(200).json({ ok: true });
    }

    // Only send to admin email
    if (email.toLowerCase().trim() !== ADMIN_EMAIL) {
      return res.status(200).json({ ok: true });
    }

    const token = createMagicToken(ADMIN_EMAIL);
    const loginUrl = 'https://alphasmb.com/admin?token=' + encodeURIComponent(token);
    const html = buildMagicLinkEmail(loginUrl);

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: 'AlphaSMB Admin — Sign In',
      html: html,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Magic link error:', err);
    // Still return 200 to prevent enumeration
    return res.status(200).json({ ok: true });
  }
};
