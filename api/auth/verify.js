// GET /api/auth/verify?token=... — exchange magic token for session JWT

const { validateEnv } = require('../_lib/config');
const { verifyToken, createSessionToken } = require('../_lib/auth');

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

    // Issue long-lived session token
    const sessionToken = createSessionToken(claims.email);

    return res.status(200).json({
      token: sessionToken,
      email: claims.email,
    });
  } catch (err) {
    console.error('Verify error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
