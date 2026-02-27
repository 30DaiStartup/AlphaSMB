// Magic-link authentication: JWT create/verify + admin middleware
// Uses Node.js crypto (no external deps). HMAC-SHA256 signing.

const crypto = require('crypto');

const ADMIN_EMAIL = 'zach@alphasmb.com';
const MAGIC_LINK_TTL = 15 * 60;  // 15 minutes
const SESSION_TTL = 30 * 24 * 60 * 60; // 30 days

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error('AUTH_SECRET is not set');
  return secret;
}

// ── Base64url helpers ──

function base64url(buf) {
  return buf.toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64urlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return Buffer.from(str, 'base64');
}

// ── JWT ──

function createToken(payload, ttl) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const claims = Object.assign({}, payload, { iat: now, exp: now + ttl });

  const segments = [
    base64url(Buffer.from(JSON.stringify(header))),
    base64url(Buffer.from(JSON.stringify(claims))),
  ];
  const sigInput = segments.join('.');
  const sig = crypto.createHmac('sha256', getSecret()).update(sigInput).digest();
  segments.push(base64url(sig));
  return segments.join('.');
}

function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  try {
    // Verify signature (timing-safe)
    const sigInput = parts[0] + '.' + parts[1];
    const expected = crypto.createHmac('sha256', getSecret()).update(sigInput).digest();
    const actual = base64urlDecode(parts[2]);
    if (expected.length !== actual.length) return null;
    if (!crypto.timingSafeEqual(expected, actual)) return null;

    // Decode claims
    const claims = JSON.parse(base64urlDecode(parts[1]).toString('utf8'));

    // Check expiry
    const now = Math.floor(Date.now() / 1000);
    if (!claims.exp || claims.exp < now) return null;

    return claims;
  } catch (e) {
    return null;
  }
}

// ── Token factories ──

function createMagicToken(email) {
  return createToken({ email: email, purpose: 'magic_link' }, MAGIC_LINK_TTL);
}

function createSessionToken(email) {
  return createToken({ email: email, purpose: 'session' }, SESSION_TTL);
}

// ── Middleware ──

function requireAdmin(req) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return null;

  const claims = verifyToken(auth.slice(7));
  if (!claims) return null;
  if (claims.purpose !== 'session') return null;
  if (claims.email !== ADMIN_EMAIL) return null;

  return claims;
}

module.exports = {
  ADMIN_EMAIL,
  createMagicToken,
  createSessionToken,
  verifyToken,
  requireAdmin,
};
