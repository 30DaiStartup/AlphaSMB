-- AlphaSMB Benchmarking Migration
-- Run this in Supabase SQL Editor to add benchmarking tables to existing database
-- This is a one-time migration for Phase 1 of the competitive benchmarking system

-- 1. Add new columns to assessments
alter table assessments add column if not exists company_id uuid;
alter table assessments add column if not exists email_domain text;

create index if not exists idx_assessments_company on assessments(company_id) where company_id is not null;
create index if not exists idx_assessments_domain on assessments(email_domain) where email_domain is not null;

-- 2. Companies table
create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  domain text not null unique,
  name text,
  industry text,
  company_size text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_companies_domain on companies(domain);

-- 3. FK from assessments to companies
alter table assessments
  add constraint fk_assessments_company
  foreign key (company_id) references companies(id);

-- 4. Industry baselines (static curated data)
create table if not exists industry_baselines (
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

create index if not exists idx_baselines_segment on industry_baselines(industry, company_size, dimension);

-- 5. Benchmark snapshots (pre-computed aggregates)
create table if not exists benchmark_snapshots (
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

create unique index if not exists idx_snapshots_segment_dim on benchmark_snapshots(segment_key, dimension);

-- 6. Benchmark results (per-assessment cache)
create table if not exists benchmark_results (
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

create unique index if not exists idx_benchmark_results_assessment on benchmark_results(assessment_id);

-- 7. Seed baseline data
-- Industry research composite (McKinsey, Deloitte, Salesforce, Gartner) → 1-10 scale
insert into industry_baselines (industry, company_size, dimension, metric, value, source, source_year, confidence) values
  -- Healthcare
  ('healthcare', null, 'overall',  'p25', 2.8, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  ('healthcare', null, 'overall',  'median', 3.8, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  ('healthcare', null, 'overall',  'p75', 5.2, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  ('healthcare', null, 'mindset',  'p25', 3.2, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  ('healthcare', null, 'mindset',  'median', 4.2, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  ('healthcare', null, 'mindset',  'p75', 5.5, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  ('healthcare', null, 'skillset', 'p25', 2.5, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  ('healthcare', null, 'skillset', 'median', 3.5, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  ('healthcare', null, 'skillset', 'p75', 4.8, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  ('healthcare', null, 'toolset',  'p25', 2.8, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  ('healthcare', null, 'toolset',  'median', 3.8, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  ('healthcare', null, 'toolset',  'p75', 5.2, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  -- Real Estate
  ('real_estate', null, 'overall',  'p25', 2.5, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  ('real_estate', null, 'overall',  'median', 3.5, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  ('real_estate', null, 'overall',  'p75', 4.8, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  ('real_estate', null, 'mindset',  'p25', 3.0, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  ('real_estate', null, 'mindset',  'median', 4.0, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  ('real_estate', null, 'mindset',  'p75', 5.2, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  ('real_estate', null, 'skillset', 'p25', 2.2, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  ('real_estate', null, 'skillset', 'median', 3.0, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  ('real_estate', null, 'skillset', 'p75', 4.2, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  ('real_estate', null, 'toolset',  'p25', 2.5, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  ('real_estate', null, 'toolset',  'median', 3.5, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  ('real_estate', null, 'toolset',  'p75', 5.0, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  -- Manufacturing
  ('manufacturing', null, 'overall',  'p25', 3.0, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  ('manufacturing', null, 'overall',  'median', 4.2, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  ('manufacturing', null, 'overall',  'p75', 5.5, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  ('manufacturing', null, 'mindset',  'p25', 3.2, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  ('manufacturing', null, 'mindset',  'median', 4.5, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  ('manufacturing', null, 'mindset',  'p75', 5.8, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  ('manufacturing', null, 'skillset', 'p25', 2.5, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  ('manufacturing', null, 'skillset', 'median', 3.8, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  ('manufacturing', null, 'skillset', 'p75', 5.0, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  ('manufacturing', null, 'toolset',  'p25', 3.2, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  ('manufacturing', null, 'toolset',  'median', 4.5, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  ('manufacturing', null, 'toolset',  'p75', 5.8, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  -- Professional Services
  ('professional_services', null, 'overall',  'p25', 3.5, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  ('professional_services', null, 'overall',  'median', 4.8, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  ('professional_services', null, 'overall',  'p75', 6.2, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  ('professional_services', null, 'mindset',  'p25', 3.8, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  ('professional_services', null, 'mindset',  'median', 5.2, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  ('professional_services', null, 'mindset',  'p75', 6.5, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  ('professional_services', null, 'skillset', 'p25', 3.2, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  ('professional_services', null, 'skillset', 'median', 4.5, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  ('professional_services', null, 'skillset', 'p75', 5.8, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  ('professional_services', null, 'toolset',  'p25', 3.5, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  ('professional_services', null, 'toolset',  'median', 4.8, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  ('professional_services', null, 'toolset',  'p75', 6.2, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  -- Software
  ('software', null, 'overall',  'p25', 4.5, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  ('software', null, 'overall',  'median', 5.8, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  ('software', null, 'overall',  'p75', 7.2, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  ('software', null, 'mindset',  'p25', 5.0, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  ('software', null, 'mindset',  'median', 6.2, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  ('software', null, 'mindset',  'p75', 7.5, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  ('software', null, 'skillset', 'p25', 4.2, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  ('software', null, 'skillset', 'median', 5.5, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  ('software', null, 'skillset', 'p75', 7.0, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  ('software', null, 'toolset',  'p25', 4.5, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  ('software', null, 'toolset',  'median', 6.0, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  ('software', null, 'toolset',  'p75', 7.5, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  -- Other
  ('other', null, 'overall',  'p25', 3.0, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  ('other', null, 'overall',  'median', 4.2, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  ('other', null, 'overall',  'p75', 5.8, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  ('other', null, 'mindset',  'p25', 3.2, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  ('other', null, 'mindset',  'median', 4.5, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  ('other', null, 'mindset',  'p75', 6.0, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  ('other', null, 'skillset', 'p25', 2.8, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  ('other', null, 'skillset', 'median', 4.0, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  ('other', null, 'skillset', 'p75', 5.5, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  ('other', null, 'toolset',  'p25', 3.0, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  ('other', null, 'toolset',  'median', 4.2, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  ('other', null, 'toolset',  'p75', 5.8, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  -- All (global fallback)
  ('all', null, 'overall',  'p25', 3.2, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  ('all', null, 'overall',  'median', 4.5, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  ('all', null, 'overall',  'p75', 6.0, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  ('all', null, 'mindset',  'p25', 3.5, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  ('all', null, 'mindset',  'median', 4.8, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  ('all', null, 'mindset',  'p75', 6.2, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  ('all', null, 'skillset', 'p25', 3.0, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  ('all', null, 'skillset', 'median', 4.2, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  ('all', null, 'skillset', 'p75', 5.8, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  ('all', null, 'toolset',  'p25', 3.2, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  ('all', null, 'toolset',  'median', 4.5, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60),
  ('all', null, 'toolset',  'p75', 6.0, 'Industry research composite (McKinsey, Deloitte, Salesforce, Gartner)', 2025, 0.60)
on conflict do nothing;
