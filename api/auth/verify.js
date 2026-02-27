// GET /api/auth/verify?token=... — exchange magic token for session JWT

const { validateEnv } = require('../_lib/config');
const { ADMIN_EMAIL, verifyToken, createSessionToken } = require('../_lib/auth');
const { extractDomain, resolveCompany } = require('../_lib/company');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    validateEnv();

    const token = req.query.token;
    if (!token) {
      return res.status(400).json({ error: 'Missing token' });
    }

    const claims = verifyToken(token);
    if (!claims) {
      return res.status(401).json({ error: 'Invalid or expired link' });
    }

    if (claims.purpose !== 'magic_link') {
      return res.status(401).json({ error: 'Invalid token type' });
    }

    var email = claims.email;
    var domain = extractDomain(email);
    var role = email === ADMIN_EMAIL ? 'admin' : 'org';

    // Resolve company (upserts if new corporate domain)
    var companyName = null;
    var resolved = await resolveCompany(email);
    if (resolved.company) {
      companyName = resolved.company.name || null;
    }

    // Issue long-lived session token with domain + role
    var sessionToken = createSessionToken(email, domain, role);

    return res.status(200).json({
      token: sessionToken,
      email: email,
      domain: domain,
      role: role,
      companyName: companyName,
    });
  } catch (err) {
    console.error('Verify error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
