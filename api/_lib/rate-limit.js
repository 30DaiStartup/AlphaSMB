// Simple in-memory rate limiter for Vercel serverless functions.
// Limits are per-IP per-endpoint. State resets on cold starts, which is
// acceptable — the goal is to prevent abuse, not enforce exact quotas.

const buckets = new Map();

const CLEANUP_INTERVAL = 60 * 1000; // 1 min
let lastCleanup = Date.now();

function cleanup(windowMs) {
  var now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  buckets.forEach(function (entry, key) {
    if (now - entry.start > windowMs * 2) buckets.delete(key);
  });
}

/**
 * @param {object} opts
 * @param {number} opts.windowMs  — sliding window in ms (default 60 000)
 * @param {number} opts.max       — max requests per window  (default 10)
 * @returns {function(req, res): boolean} — returns true if request is blocked
 */
function rateLimit(opts) {
  var windowMs = (opts && opts.windowMs) || 60 * 1000;
  var max = (opts && opts.max) || 10;

  return function check(req, res) {
    cleanup(windowMs);

    var ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown')
      .split(',')[0].trim();
    var route = req.url ? req.url.split('?')[0] : '/';
    var key = ip + ':' + route;
    var now = Date.now();

    var entry = buckets.get(key);
    if (!entry || now - entry.start > windowMs) {
      buckets.set(key, { start: now, count: 1 });
      return false;
    }

    entry.count++;
    if (entry.count > max) {
      res.setHeader('Retry-After', Math.ceil((entry.start + windowMs - now) / 1000));
      res.status(429).json({ error: 'Too many requests. Please try again later.' });
      return true;
    }

    return false;
  };
}

module.exports = { rateLimit };
