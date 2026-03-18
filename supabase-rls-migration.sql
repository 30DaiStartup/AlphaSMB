-- AlphaSMB — Enable Row Level Security on all tables
-- Run this in the Supabase SQL Editor to resolve critical security advisories.
--
-- Architecture: All database access goes through Vercel serverless API routes
-- using the service role key (which bypasses RLS). No direct client/anon access
-- is expected, so these policies deny all access to the anon role while allowing
-- the service role to operate normally (service role bypasses RLS by default).

-- ── 1. Enable RLS on all tables ──

alter table assessments enable row level security;
alter table companies enable row level security;
alter table industry_baselines enable row level security;
alter table benchmark_snapshots enable row level security;
alter table benchmark_results enable row level security;
alter table share_intents enable row level security;

-- ── 2. Service-role-only policies ──
-- The service role bypasses RLS automatically in Supabase, so with RLS enabled
-- and no permissive policies for anon/authenticated, those roles are blocked.
-- We add explicit service_role policies for clarity and as a safety net.

-- assessments
create policy "Service role full access on assessments"
  on assessments for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- companies
create policy "Service role full access on companies"
  on companies for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- industry_baselines
create policy "Service role full access on industry_baselines"
  on industry_baselines for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- benchmark_snapshots
create policy "Service role full access on benchmark_snapshots"
  on benchmark_snapshots for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- benchmark_results
create policy "Service role full access on benchmark_results"
  on benchmark_results for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- share_intents
create policy "Service role full access on share_intents"
  on share_intents for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- ── 3. Revoke direct table access from anon and authenticated roles ──
-- Belt-and-suspenders: even without RLS policies granting access, explicitly
-- revoking ensures no grants leak through.

revoke all on assessments from anon, authenticated;
revoke all on companies from anon, authenticated;
revoke all on industry_baselines from anon, authenticated;
revoke all on benchmark_snapshots from anon, authenticated;
revoke all on benchmark_results from anon, authenticated;
revoke all on share_intents from anon, authenticated;

-- ── 4. Protect sensitive columns on assessments ──
-- Even for authenticated roles (if ever granted SELECT in the future),
-- strip PII columns. This addresses the "Sensitive Columns Exposed" advisory.
-- Note: service_role bypasses this since it has superuser-like access.

-- If you ever need to grant read access to authenticated users, use a view
-- that excludes user_email, user_name, and answers (contains raw responses).
