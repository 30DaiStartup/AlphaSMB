const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const NAME_RE = /^[\p{L}\p{N}\s\-'.]{1,100}$/u;

function validateEmail(email) {
  return typeof email === 'string' && EMAIL_RE.test(email) && email.length <= 254;
}

function validateSessionId(sessionId) {
  return typeof sessionId === 'string' && UUID_RE.test(sessionId);
}

function validateName(name) {
  return typeof name === 'string' && name.length > 0 && name.length <= 100 && NAME_RE.test(name);
}

module.exports = { validateEmail, validateSessionId, validateName };
