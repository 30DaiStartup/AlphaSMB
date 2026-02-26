-- AlphaSMB Assessment Backend — Supabase Schema
-- Run this SQL in the Supabase SQL Editor (one-time manual setup)
-- RLS: Disabled on both tables. All database access is mediated through
-- Vercel serverless API routes (api/assessment/*.js) using the service role key.
-- The service role key is never exposed to the frontend.
-- If RLS is enabled in the future, add policies that restrict access by session_id.

-- Completed assessments
create table assessments (
  id uuid primary key default gen_random_uuid(),
  session_id text not null unique,
  created_at timestamptz default now(),
  started_at timestamptz,
  completed_at timestamptz,

  -- Context
  role text,
  company_size text,
  industry text,

  -- Identity (nullable — only if email captured)
  user_name text,
  user_email text,
  email_captured boolean default false,
  email_captured_at timestamptz,

  -- Raw answers
  answers jsonb not null,

  -- Computed scores
  mindset_raw integer,
  skillset_raw integer,
  toolset_raw integer,
  overall_raw integer,
  mindset_display numeric(3,1),
  skillset_display numeric(3,1),
  toolset_display numeric(3,1),
  overall_display numeric(3,1),
  mindset_tier text,
  skillset_tier text,
  toolset_tier text,
  overall_tier text,
  pattern text,

  -- Report tracking
  report_sent_at timestamptz,

  -- Benchmarking (Phase 1)
  company_id uuid,
  email_domain text
);

-- Indexes
create index idx_assessments_session on assessments(session_id);
create index idx_assessments_email on assessments(user_email) where user_email is not null;
create index idx_assessments_created on assessments(created_at);

create index idx_assessments_company on assessments(company_id) where company_id is not null;
create index idx_assessments_domain on assessments(email_domain) where email_domain is not null;

-- ── Benchmarking Tables (Phase 1) ──

-- Company entities resolved from email domains
create table companies (
  id uuid primary key default gen_random_uuid(),
  domain text not null unique,
  name text,
  industry text,
  company_size text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_companies_domain on companies(domain);

-- Add FK constraint to assessments
alter table assessments
  add constraint fk_assessments_company
  foreign key (company_id) references companies(id);

-- Static curated benchmarks from research reports
create table industry_baselines (
  id uuid primary key default gen_random_uuid(),
  industry text not null,
  company_size text,
  dimension text not null,
  metric text not null,
  value numeric(4,1) not null,
  source text,
  source_year integer,
  confidence numeric(3,2) default 0.60,
  created_at timestamptz default now()
);

create index idx_baselines_segment on industry_baselines(industry, company_size, dimension);

-- Pre-computed aggregate percentiles from assessment data
create table benchmark_snapshots (
  id uuid primary key default gen_random_uuid(),
  segment_key text not null,
  dimension text not null,
  sample_count integer not null default 0,
  p10 numeric(4,1),
  p25 numeric(4,1),
  median numeric(4,1),
  p75 numeric(4,1),
  p90 numeric(4,1),
  mean numeric(4,1),
  computed_at timestamptz default now()
);

create unique index idx_snapshots_segment_dim on benchmark_snapshots(segment_key, dimension);

-- Per-assessment benchmark cache
create table benchmark_results (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid references assessments(id),
  company_id uuid references companies(id),
  segment_key text not null,
  sample_count integer not null default 0,
  overall_percentile integer,
  mindset_percentile integer,
  skillset_percentile integer,
  toolset_percentile integer,
  data_source text not null default 'static_baseline',
  computed_at timestamptz default now()
);

create unique index idx_benchmark_results_assessment on benchmark_results(assessment_id);

-- Share intents
create table share_intents (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid references assessments(id),
  created_at timestamptz default now(),
  type text not null,
  sender_role text not null,
  visibility text,
  recipients jsonb not null,
  emails_sent boolean default false,
  emails_sent_at timestamptz
);
