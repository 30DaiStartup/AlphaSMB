# AlphaSMB Security Audit Report

**Date:** 2026-02-27
**Scope:** Full codebase — HTML, CSS, JS, serverless API, configuration, infrastructure
**Status:** Audit complete. Critical/High fixes implemented. Medium/Low items documented.

---

## Executive Summary

The AlphaSMB codebase demonstrates solid foundational security: proper HTML escaping, CORS restricted to `alphasmb.com`, HSTS enabled, SRI on Plausible, admin JWT auth with timing-safe comparison, and no exposed secrets. The main gaps were **missing rate limiting** on email-sending endpoints, **email header injection** potential in user-controlled subject lines, **weak session ID generation** on the client, and **query-param auth** on the cron endpoint. All critical/high issues have been remediated in this commit.

---

## Findings — Fixed in This Commit

### CRITICAL: No Rate Limiting on Email-Sending Endpoints
- **Files:** `api/assessment/report.js`, `api/assessment/share.js`, `api/auth/magic-link.js`, `api/assessment/complete.js`
- **Risk:** Attacker could spam unlimited emails via report/share/magic-link endpoints, exhausting Resend quota and harassing recipients.
- **Fix:** Created `api/_lib/rate-limit.js` (in-memory per-IP rate limiter). Applied to all email-sending endpoints: 5 req/15min for report/share/magic-link, 10 req/15min for complete.

### CRITICAL: Email Header Injection via User-Controlled Subject Lines
- **Files:** `api/assessment/report.js:114`, `api/assessment/share.js:117,122`
- **Risk:** `senderName` embedded directly in email subjects. A name containing `\r\n` could inject additional headers.
- **Fix:** All user-controlled data in email subjects now has CR/LF stripped via `.replace(/[\r\n]/g, '')`.

### HIGH: Weak Client-Side Session ID Generation (Math.random)
- **File:** `assessment/assessment.js:28-33`
- **Risk:** `Math.random()` is not cryptographically secure. Session IDs could theoretically be predicted.
- **Fix:** Now uses `crypto.getRandomValues()` with proper UUID v4 bit-setting. Falls back to `Math.random()` only for legacy browsers without Web Crypto API.

### HIGH: Cron Endpoint Accepts Secret via Query Parameter
- **File:** `api/benchmark/recompute.js:22`
- **Risk:** Query parameters leak into server logs, proxy logs, and browser history.
- **Fix:** Removed query-param auth. Only `Authorization: Bearer <CRON_SECRET>` accepted (matching Vercel's built-in cron auth).

### HIGH: No Server-Side Score Range Validation
- **File:** `api/assessment/complete.js`
- **Risk:** Attacker could submit scores of 999999, corrupting benchmark percentile calculations for all users.
- **Fix:** Added `isValidScore()` check — all display scores must be finite numbers between 0 and 10. Also added clamping in `api/_lib/benchmark.js:computeBenchmark()`.

### HIGH: Benchmark Dimension Not Whitelisted
- **File:** `api/_lib/benchmark.js:88`
- **Risk:** Dynamic column name constructed from dimension parameter without validation.
- **Fix:** Added `DIMENSION_COLUMNS` whitelist map. Unknown dimensions return `null` instead of constructing arbitrary column names.

### MEDIUM: Share Recipients Not Deduplicated
- **File:** `api/assessment/share.js`
- **Risk:** Same email appearing twice in recipients array would receive duplicate emails.
- **Fix:** Added case-insensitive email deduplication before sending loop.

### MEDIUM: Missing CSP Directives
- **File:** `vercel.json:38`
- **Risk:** Missing `upgrade-insecure-requests` and `form-action` directives.
- **Fix:** Added `upgrade-insecure-requests` (forces HTTPS for all sub-resources) and `form-action 'self'` (prevents form hijacking).

### MEDIUM: Missing Security Headers
- **File:** `vercel.json`
- **Fix:** Added `X-Permitted-Cross-Domain-Policies: none` (prevents Flash/PDF cross-domain policies) and `Cache-Control: no-store` for all API responses.

### MEDIUM: Admin Assessments Endpoint Returns Unbounded Results
- **File:** `api/admin/assessments.js`
- **Risk:** Single request could dump entire assessments table if dataset grows large.
- **Fix:** Added pagination (`?limit=N&offset=N`, default 100, max 500).

### LOW: Missing CRON_SECRET in .env.example
- **File:** `.env.example`
- **Fix:** Added `CRON_SECRET` with generation instructions.

---

## Findings — Remaining (No Code Changes Required)

These items are documented for awareness. They represent defense-in-depth improvements that don't require immediate action.

### INFO: `unsafe-inline` in CSP script-src / style-src
- **Status:** Required for Plausible init block, JSON-LD schema, Cal.com embed, and inline styles.
- **Recommendation:** Future improvement — move Plausible init and JSON-LD to external `.js` files, then replace `unsafe-inline` with nonce-based CSP.

### INFO: Cal.com Embed Script Without SRI Hash
- **File:** `book.html`
- **Status:** Dynamic script injection; SRI not supported on dynamic imports.
- **Recommendation:** Monitor Cal.com script integrity. Consider self-hosting if critical.

### INFO: Auth Tokens Stored in localStorage
- **Files:** `admin/admin.js`, `dashboard/dashboard.js`
- **Status:** Standard for SPAs. XSS would be needed to exploit.
- **Recommendation:** Consider `sessionStorage` for auto-expiry on browser close.

### INFO: Magic Link Token Passed in URL Query Parameter
- **Files:** `api/auth/magic-link.js`, `admin/admin.js`, `dashboard/dashboard.js`
- **Status:** Standard magic-link pattern. Token is cleared from URL via `replaceState`.
- **Recommendation:** Future improvement — POST the token to `/api/auth/verify` instead of GET with query param.

### INFO: 30-Day Session Token TTL
- **File:** `api/_lib/auth.js:8`
- **Status:** Long but appropriate for admin-only use.
- **Recommendation:** Consider reducing to 7 days if admin access frequency allows.

### INFO: Supabase RLS Disabled
- **File:** `supabase-schema.sql`
- **Status:** All DB access mediated through serverless API with service role key. RLS is a defense-in-depth layer.
- **Recommendation:** Enable RLS with `service_role` bypass for production hardening.

### INFO: No CSRF Tokens on POST Endpoints
- **Status:** CORS restricts to `alphasmb.com` origin, providing equivalent protection for fetch-based requests. Form-based CSRF now blocked by `form-action 'self'` CSP directive.
- **Recommendation:** If forms are added that post to API, implement CSRF tokens.

---

## Positive Findings

- **No exposed secrets** — All API keys, tokens, and credentials properly environment-variable-gated. `.env` git-ignored. `.env.example` contains only placeholders.
- **Proper HTML escaping** — Custom `escapeHtml()` / `esc()` functions used consistently. No raw `innerHTML` with unsanitized user data.
- **Strong JWT implementation** — HMAC-SHA256 with `crypto.timingSafeEqual()` for signature verification.
- **CORS properly restricted** — Only `https://alphasmb.com` allowed for API endpoints.
- **Good security headers** — HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy all present.
- **Input validation** — Centralized in `api/_lib/validate.js` with regex-based email, UUID, and name validation.
- **Plausible Analytics** — Cookieless by design, SRI hash present.
- **Method enforcement** — All endpoints check HTTP method and return 405 for disallowed methods.
- **Idempotency** — Report endpoint checks `report_sent_at` to prevent duplicate sends.
