// POST /api/auth/magic-link — send magic link email
// Admin → /admin, corporate email → /dashboard, personal email → silent reject
// Always returns 200 to prevent email enumeration

const { validateEnv } = require('../_lib/config');
const { validateEmail } = require('../_lib/validate');
const { ADMIN_EMAIL, createMagicToken } = require('../_lib/auth');
const { extractDomain, isPersonalEmail } = require('../_lib/company');
const { buildMagicLinkEmail } = require('../_lib/magic-link-email');
const resend = require('../_lib/resend');
const { rateLimit } = require('../_lib/rate-limit');

// 5 magic-link requests per 15 minutes per IP
var limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5 });

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limit BEFORE processing — still returns 200 to prevent enumeration
  if (limiter(req, res)) return;

  try {
    validateEnv();

    const { email } = req.body || {};

    if (!email || !validateEmail(email)) {
      return res.status(200).json({ ok: true });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const domain = extractDomain(normalizedEmail);

    // Reject personal email domains silently
    if (!domain || isPersonalEmail(domain)) {
      return res.status(200).json({ ok: true });
    }

    const token = createMagicToken(normalizedEmail);
    const isAdmin = normalizedEmail === ADMIN_EMAIL;
    const destination = isAdmin ? '/admin' : '/dashboard';
    const loginUrl = 'https://alphasmb.com' + destination + '?token=' + encodeURIComponent(token);
    const html = buildMagicLinkEmail(loginUrl, isAdmin ? 'Admin Dashboard' : 'Organization Dashboard');

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: normalizedEmail,
      subject: isAdmin ? 'AlphaSMB Admin — Sign In' : 'AlphaSMB Dashboard — Sign In',
      html: html,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Magic link error:', err);
    return res.status(200).json({ ok: true });
  }
};
