-- AlphaSMB Assessment Backend — Supabase Schema
-- Run this SQL in the Supabase SQL Editor (one-time manual setup)
-- RLS: Disable on both tables (server-side service key only)

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
  report_sent_at timestamptz
);

-- Indexes
create index idx_assessments_session on assessments(session_id);
create index idx_assessments_email on assessments(user_email) where user_email is not null;
create index idx_assessments_created on assessments(created_at);

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
