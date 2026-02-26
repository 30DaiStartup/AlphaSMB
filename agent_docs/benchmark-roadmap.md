# Competitive Benchmarking — Full Roadmap

Extracted from planning session (2026-02-26). Three-phase plan for turning the AI readiness assessment into a competitive benchmarking product.

## User Decisions

- **MVP approach**: Assessment-first (peer comparison from assessment data, supplemented with curated external research as static baselines)
- **Company identity**: Email domain matching
- **External data sources**: All of the above (industry reports + live signals + social/sentiment)
- **Access model**: Free basic (simple percentile ranking), paid deep (dimension breakdown, trends, competitive gaps)

---

## Phase 1: MVP — Peer Benchmarks on Results Screen ✅ COMPLETE

Implemented in `feat/benchmarking` branch, merged to main.

- 4 new Supabase tables: `companies`, `industry_baselines`, `benchmark_snapshots`, `benchmark_results`
- Company resolution via email domain matching (40+ personal domain exclusion list)
- Benchmark calculation engine with tiered segment matching: `industry+size → industry → size → all → static baselines`
- Percentile computation with blended scoring:
  - Pure peer: ≥ 30 assessments in segment
  - Blended (peer + static): 10–29 assessments
  - Static baseline only: < 10 assessments
- Minimum cohort size: 10 for privacy
- `api/assessment/report.js` triggers company resolution + benchmark computation
- `GET /api/benchmark/snapshot` — public endpoint for pre-email comparison
- Frontend: benchmark section between gap pattern and email gate
  - Basic view (pre-email): industry median comparison bar
  - Personalized view (post-email): per-dimension percentile bars ("You're in the top 28%")
- Report email includes "How You Compare" section
- Seed data: ~72 rows curated from McKinsey, Deloitte, Salesforce reports
- Cold start plan: pure static baselines day 1–30, blended day 30–90, pure peer day 90+
- **Weekly cron job** (`api/benchmark/recompute.js`): Recomputes `benchmark_snapshots` from real assessment data every Sunday 4 AM UTC

### Key Files
- `api/_lib/benchmark.js` — Segment matching, blended scoring, snapshot queries
- `api/_lib/company.js` — Email domain resolution, personal email detection
- `api/_lib/baselines-seed.js` — Static industry baseline data
- `api/benchmark/snapshot.js` — Public snapshot endpoint
- `api/benchmark/recompute.js` — Cron job for snapshot recomputation
- `supabase-migration-benchmarking.sql` — Schema migration

---

## Phase 2: Research Data Pipeline (Months 2–3)

Python pipeline in `pipeline/src/benchmarks/` alongside existing LinkedIn ad pipeline.

### Architecture

- **Ingestor interface**: `BaseIngestor` base class + `BenchmarkSignal` dataclass
- **Normalization framework**: Piecewise linear calibration table mapping 0–1 rates to 1–10 display scores
- **Weighted multi-source aggregation** with confidence scoring
- **Signal-to-dimension mapping**:
  - Job postings → Skillset
  - Exec AI discussions → Mindset
  - Tool deployment data → Toolset
  - Overall adoption metrics → Overall

### Data Sources (Prioritized)

| Source | Type | Cost | Update Cadence |
|--------|------|------|----------------|
| Manual YAML curation | Industry reports (McKinsey, Deloitte, etc.) | Free | Quarterly |
| First-party assessments | Query Supabase assessments | Free | Weekly |
| Job postings | LinkedIn/Indeed API | $200–500/mo | Monthly |
| Tech stack data | BuiltWith API | $100–300/mo | Monthly |
| Social/sentiment | Reddit, Hacker News scraping | Free | Monthly |
| VC/funding data | Crunchbase API | $0–200/mo | Monthly |
| Government data | Census/BLS | Free | Quarterly |

### Ingestors

1. **Static YAML ingestor** (MVP — build first): Manually curated data from industry reports stored in version-controlled YAML files. Diffable, reviewable, zero tooling required.
2. **First-party ingestor**: Query Supabase assessment data directly. Confidence scales with sample size.
3. **Job postings ingestor**: Parse AI/ML job posting density and requirements by industry/size.
4. **Tech stack ingestor**: BuiltWith or similar — detect AI tool adoption rates.
5. **Sentiment ingestor**: Reddit/HN discussion analysis for AI adoption sentiment by industry.
6. **VC data ingestor**: Crunchbase funding data for AI companies by sector.

### Pipeline Orchestration

- `weekly_benchmarks.py` — Weekly orchestrator: ingest → normalize → aggregate → upsert to Supabase
- Data freshness tracking via `external_data_sources` table
- Admin endpoints for baseline management and snapshot refresh
- Python pipeline writes to Supabase; Vercel functions are read-only consumers

### Key Design Decisions

- YAML for manual curation (version-controlled, diffable, zero tooling)
- Python pipeline writes to Supabase, Vercel functions are read-only consumers
- Confidence-weighted aggregation prevents low-quality sources from dominating
- Non-blocking: if pipeline fails, existing snapshots remain valid

---

## Phase 3: Subscription Product (Months 4–6)

### Pricing Tiers

| Tier | Price | Includes |
|------|-------|----------|
| **Free** | $0 | Overall percentile + median comparison (current) |
| **Basic** | $29/mo | Per-dimension percentiles, company aggregate, monthly retake tracking, industry trends |
| **Pro** | $99/mo | Everything + competitive gap analysis, team comparison, custom alerts, PDF export |

### Features

- **Dashboard page** at `/dashboard/index.html` (vanilla JS, no framework)
- **Magic link authentication** via Resend (JWT tokens, 7-day expiry, no passwords — reuses existing Resend integration)
- **Stripe subscription integration** (checkout sessions, webhooks)
- **Chart.js via CDN** for trend visualization
- **Longitudinal tracking**: Retake support, company progress over time
- **Team comparison views**: Requires 3+ assessments from same company domain
- **Competitive movement alerting**: Email notifications when your segment's benchmarks shift significantly

### Key Design Decisions

- Magic link auth reuses existing Resend (no new dependencies, no passwords)
- Vanilla JS dashboard (consistent with rest of stack)
- Stripe webhooks for subscription state (same pattern as Cal.com)
- Team features gated on company domain resolution (already built in Phase 1)

---

## Implementation Notes

- Modify `report.js` (not `complete.js`) because email is captured in the report flow
- Pre-compute snapshots instead of real-time percentiles (Vercel cold start sensitive, 10s timeout)
- Blended scoring for stability when peer data is thin
- Non-blocking frontend integration (benchmarks are value-add, not a dependency)
