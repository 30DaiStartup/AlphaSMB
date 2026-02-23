# AlphaSMB — Automated LinkedIn Ad Pipeline
## Product Requirements Document (PRD)

**Version:** 1.0
**Date:** February 21, 2026
**Owner:** Zach Henderson
**Handoff Target:** Claude Code

---

## 1. What We're Building

An automated marketing pipeline that bulk-generates LinkedIn ad variations from proven copy, publishes them via the LinkedIn Marketing API, pulls performance data, kills underperforming ads automatically, and promotes winners to a conversion campaign — all running on a daily cron job.

**The loop:**

```
Generate 40+ ad variations (from copy bank)
        ↓
Bulk publish to LinkedIn Campaign Manager via API
        ↓
Pull performance data (CPM, CTR, conversions) from LinkedIn API or data warehouse
        ↓
Pause ads with CPM > threshold (e.g., $40+)
        ↓
Promote top performers to dedicated conversion campaign with own budget
        ↓
Repeat daily via cron
```

**Why this matters for AlphaSMB:** We're selling a $500 strategy call to SMB leaders (CEOs, COOs, VP Ops) at companies with 20-500 employees. LinkedIn is where these people live. The cost per qualified lead on LinkedIn is high — this pipeline lets us test dozens of copy variations simultaneously and let the data pick the winners instead of guessing.

---

## 2. Architecture Overview

### Components

| Component | Purpose | Tech |
|-----------|---------|------|
| **Ad Copy Generator** | Bulk-create ad variations from templates + copy bank | Python script using Claude API |
| **LinkedIn Publisher** | Push ad creatives to LinkedIn Campaign Manager | LinkedIn Marketing API (OAuth 2.0) |
| **Performance Analyzer** | Pull and analyze ad metrics | LinkedIn Marketing API reporting endpoints |
| **Ad Manager** | Pause losers, promote winners | LinkedIn Marketing API |
| **Orchestrator** | Daily cron that runs the full loop | Cron job (bash/Python) |
| **Data Store** | Track ad performance history over time | SQLite or PostgreSQL |

### System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        DAILY CRON JOB                           │
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐  │
│  │  Copy Bank   │───▶│  Ad Copy     │───▶│  LinkedIn API    │  │
│  │  (templates, │    │  Generator   │    │  Publisher       │  │
│  │   hooks,     │    │  (Claude API)│    │  (bulk upload)   │  │
│  │   phrases)   │    └──────────────┘    └──────────────────┘  │
│  └──────────────┘                                               │
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐  │
│  │  LinkedIn    │───▶│  Performance │───▶│  Ad Manager      │  │
│  │  Reporting   │    │  Analyzer    │    │  (pause/promote) │  │
│  │  API         │    │              │    │                  │  │
│  └──────────────┘    └──────────────┘    └──────────────────┘  │
│                              │                                  │
│                              ▼                                  │
│                     ┌──────────────┐                            │
│                     │  SQLite DB   │                            │
│                     │  (history)   │                            │
│                     └──────────────┘                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Component Specifications

### 3.1 Ad Copy Generator

**Purpose:** Produce 40+ unique LinkedIn ad variations per batch from AlphaSMB's proven copy bank and templates.

**Inputs:**
- Copy bank (see Section 6 — all approved copy lives there)
- Ad templates (see Section 6 — three frameworks: Problem-Solution, Social Proof, Direct Offer)
- Audience personas (CEO/Founder, COO/VP Ops)
- Brand voice rules (see Section 6 — strict constraints)

**Outputs:**
- JSON array of ad objects, each containing:
  ```json
  {
    "ad_id": "comparison-ad-01-tools-not-working",
    "headline": "Your team bought AI tools. Nobody's using them.",
    "intro_text": "80% of employees stop using AI tools within 30 days...",
    "cta_type": "LEARN_MORE",
    "destination_url": "https://alphasmb.com/book",
    "persona_target": "ceo_founder",
    "template_type": "problem_solution",
    "hook_category": "pain_recognition"
  }
  ```

**Generation Strategy:**

Create variations across these dimensions:

| Dimension | Options | Count |
|-----------|---------|-------|
| Hook type | Contrarian, Pattern Interrupt, Audience Callout, Specific Number, Question | 5 |
| Template framework | Problem-Solution, Social Proof, Direct Offer | 3 |
| Target persona | CEO/Founder, COO/VP Ops | 2 |
| Pain point emphasis | Left behind, Wasted spend, Past failure, Overwhelm | 4 |

Minimum viable matrix: 5 hooks × 3 templates × 2 personas = 30 base variations. Add 10+ additional variations by mixing pain point emphasis for 40+ total.

**Copy Constraints (CRITICAL — enforce these programmatically):**

The generator MUST follow these rules from the brand voice doc. Validate every generated ad against them before publishing:

- First person ("I") only — never "we" or "the team"
- No words from the banned list: leverage, synergy, unlock value, cutting-edge, disrupt, revolutionize, paradigm shift, best-in-class, delve, game-changer, comprehensive, holistic, next-level, scalable solutions, innovative, empower
- No banned phrases: "Excited to announce," "Dive into," "It's important to note," "In today's rapidly evolving," "Harness the power of," "Unlock your potential," "Thrilled to share," anything starting with "As a..."
- No exclamation marks
- No emojis
- Headline max 70 characters
- Intro text max 150 characters visible before "see more"
- Price must be visible in the ad ($500)
- CTA: "Learn More" or "Book Now"
- Link destination: alphasmb.com/book

**Approved hooks to use as seeds (pull directly from copy bank):**

- "80% of employees stop using AI tools within 30 days. The tools aren't the problem."
- "Every AI tool on the market is available to your competitors for the same price you'd pay."
- "I've watched 6-figure AI rollouts fail in 30 days. Every time, the reason is the same."
- "Most AI consultants sell you tools. That's the problem."
- "If you're an SMB leader who bought ChatGPT licenses and nobody's using them — read this."

**Approved key phrases to weave in:**

- "AI-capable organizations, not just AI-equipped employees"
- "Methodology tested inside a real operating company — translated for SMBs"
- "Tools without culture change is just an expensive experiment"
- "An operator who's been in the fire, not a vendor with a slide deck"
- "Organizational capability, not a software purchase"

**Implementation Notes:**
- Use Claude API (claude-sonnet-4-5-20250929) for generation — cost-effective for bulk copy
- Prompt should include the full brand voice doc, copy bank, and templates as context
- Add a validation pass that checks every generated ad against the banned words/phrases list
- Output to `generated_ads_{timestamp}.json`

---

### 3.2 LinkedIn Publisher

**Purpose:** Bulk-upload generated ad creatives to LinkedIn Campaign Manager.

**LinkedIn Marketing API Setup:**

1. **Create a LinkedIn Developer App** at linkedin.com/developers
2. **Request Marketing API Access** — requires Company Page admin access
3. **OAuth 2.0 flow** — use 3-legged OAuth for initial token, then refresh tokens
4. **Required scopes:**
   - `r_ads` — read ad accounts
   - `rw_ads` — create/update ads
   - `r_ads_reporting` — pull analytics

**Campaign Structure on LinkedIn:**

```
Account
  └── Campaign Group: "AlphaSMB — Ad Testing"
        ├── Campaign: "Testing Pool — [Date]"   ← New ads land here
        │     ├── Ad creative 1
        │     ├── Ad creative 2
        │     └── ... (40+ variations)
        │
        └── Campaign: "Winners — Conversion"     ← Promoted winners go here
              ├── Winning ad 1
              └── Winning ad 2
```

**Campaign Settings for Testing Pool:**

| Setting | Value | Rationale |
|---------|-------|-----------|
| Objective | Brand Awareness or Website Visits | Cheaper CPM during testing phase |
| Audience | See Section 4 | SMB leadership targeting |
| Daily Budget | $50-100 total (spread across all ads) | Enough data to differentiate, not enough to burn cash |
| Schedule | Continuous | Let the cron manage start/stop |
| Bid Strategy | Maximum delivery (auto-bid) | Let LinkedIn optimize during testing |
| Ad Format | Single Image Ad (Sponsored Content) | Highest volume, most testable |

**Campaign Settings for Winners:**

| Setting | Value | Rationale |
|---------|-------|-----------|
| Objective | Website Conversions | Optimize for booking page actions |
| Daily Budget | $25-50 per winning ad | Individual budget per proven performer |
| Conversion Tracking | LinkedIn Insight Tag on /book confirmation | Track actual strategy call bookings |
| Bid Strategy | Target Cost or Manual CPC | More control on proven creatives |

**API Endpoints Used:**

| Action | Endpoint | Method |
|--------|----------|--------|
| Create ad creative | `/adCreatives` | POST |
| Create ad in campaign | `/adAccounts/{id}/creatives` | POST |
| Update ad status | `/adCreatives/{id}` | PATCH |
| Get campaign analytics | `/adAnalytics` | GET |

**Bulk Upload Process:**
1. Read `generated_ads_{timestamp}.json`
2. For each ad, create an `adCreative` via POST
3. Associate with the Testing Pool campaign
4. Set initial status to `ACTIVE`
5. Log ad IDs to database with creation timestamp
6. Output: mapping file `ad_id_mapping_{timestamp}.json` linking internal IDs to LinkedIn creative IDs

**Rate Limiting:**
- LinkedIn API: 100 requests per day per app for most endpoints
- Batch where possible — use bulk creation endpoints if available
- Space requests with 1-2 second delays
- Track daily API usage in the database

---

### 3.3 Performance Analyzer

**Purpose:** Pull ad performance metrics from LinkedIn and identify losers and winners.

**Metrics to Pull:**

| Metric | Source | Used For |
|--------|--------|----------|
| Impressions | LinkedIn API | Minimum data threshold |
| Clicks | LinkedIn API | CTR calculation |
| CPM (Cost per 1,000 impressions) | LinkedIn API | Primary kill signal |
| CTR (Click-through rate) | Calculated | Primary winner signal |
| Spend | LinkedIn API | Budget tracking |
| Conversions (booking page) | LinkedIn Insight Tag | Ultimate success metric |
| CPC (Cost per click) | LinkedIn API | Secondary efficiency metric |

**Analysis Logic:**

```python
# Thresholds (configurable via config.yaml)
MIN_IMPRESSIONS_FOR_DECISION = 500    # Don't judge ads with < 500 impressions
MAX_CPM_THRESHOLD = 40.00             # Pause ads with CPM > $40
MIN_CTR_FOR_WINNER = 0.80             # % — CTR above this is a winner candidate
MIN_CLICKS_FOR_WINNER = 10            # Need at least 10 clicks to promote
WINNER_OBSERVATION_DAYS = 3           # Must perform for 3+ days to promote
LOSER_OBSERVATION_HOURS = 48          # Give ads at least 48 hours before killing

# Decision matrix:
# IF impressions >= MIN_IMPRESSIONS AND CPM > MAX_CPM → PAUSE (loser)
# IF impressions >= MIN_IMPRESSIONS AND CTR >= MIN_CTR AND clicks >= MIN_CLICKS
#    AND days_active >= WINNER_OBSERVATION_DAYS → PROMOTE (winner)
# ELSE → KEEP RUNNING (insufficient data)
```

**Reporting Output:**

Generate a daily report (markdown + terminal output):

```
═══════════════════════════════════════════════════════
  AlphaSMB Daily Ad Performance Report — 2026-02-21
═══════════════════════════════════════════════════════

PAUSED (CPM > $40):
  comparison-ad-33-not-mystery     CPM: $76.67  Impressions: 3,000
  comparison-ad-16-next-dollar     CPM: $50.00  Impressions: 5,000

PROMOTED TO WINNERS:
  comparison-ad-32-stop-hoping     CTR: 1.2%  CPM: $4.12  Clicks: 17

STILL TESTING (insufficient data):
  comparison-ad-8-pattern          Impressions: 312 (need 500)
  comparison-ad-21-8-hours         Impressions: 489 (need 500)

ACTIVE PERFORMERS:
  comparison-ad-18-linkedin-google CTR: 0.9%  CPM: $1.67  Clicks: 12
  comparison-ad-38-paralysis       CTR: 0.7%  CPM: $8.75  Clicks: 16

BUDGET SUMMARY:
  Testing Pool:  $47.23 / $100.00 daily budget
  Winners Pool:  $23.50 / $50.00 daily budget
  Total Spend:   $70.73
═══════════════════════════════════════════════════════
```

**Data Warehouse Option:**

If you want to mirror the original thread's approach using a data warehouse (Graphed or similar):
- Push LinkedIn ad data into a warehouse via ETL
- Query warehouse instead of hitting LinkedIn API directly
- Benefit: historical data, cross-platform analysis, richer queries
- For MVP, pulling directly from LinkedIn API is simpler

---

### 3.4 Ad Manager (Pause/Promote)

**Purpose:** Take action on the Analyzer's recommendations.

**Pause Losers:**
```
For each ad flagged as LOSER:
  1. PATCH /adCreatives/{linkedin_id} → status: "PAUSED"
  2. Log to database: ad_id, pause_reason, metrics_at_pause, timestamp
  3. Output confirmation to daily report
```

**Promote Winners:**
```
For each ad flagged as WINNER:
  1. Create new ad creative in Winners campaign (duplicate the creative)
  2. Set status: "ACTIVE" in Winners campaign
  3. Pause original in Testing Pool (avoid double-running)
  4. Set individual daily budget on Winners campaign
  5. Log to database: ad_id, promotion_reason, metrics_at_promotion, timestamp
  6. Output confirmation to daily report
```

**Safety Rails:**
- Never pause ALL ads — always keep minimum 5 active in Testing Pool
- Never promote more than 3 ads per day (budget control)
- Require human confirmation for any action that would change daily budget by > $50
- Log every API action with full request/response for audit trail

---

### 3.5 Orchestrator (Cron)

**Daily Schedule:**

```cron
# Run full pipeline at 6 AM ET (before business hours)
0 6 * * * /path/to/pipeline/run_daily.sh

# Generate new ads weekly (Sunday night)
0 22 * * 0 /path/to/pipeline/generate_new_ads.sh
```

**run_daily.sh workflow:**
```bash
#!/bin/bash
set -e

echo "=== AlphaSMB Ad Pipeline — $(date) ==="

# Step 1: Pull latest performance data
python3 pull_linkedin_data.py

# Step 2: Analyze and identify losers/winners
python3 analyze_performance.py

# Step 3: Pause losers via API
python3 pause_losers.py

# Step 4: Promote winners via API
python3 promote_winners.py

# Step 5: Generate daily report
python3 generate_report.py

# Step 6: Send report to Zach (email or Slack webhook)
python3 send_report.py

echo "=== Pipeline complete ==="
```

**generate_new_ads.sh workflow:**
```bash
#!/bin/bash
set -e

echo "=== AlphaSMB Weekly Ad Generation — $(date) ==="

# Step 1: Generate new ad variations from copy bank
python3 generate_ads.py --count 40

# Step 2: Validate against brand voice rules
python3 validate_ads.py

# Step 3: Publish to LinkedIn Testing Pool
python3 publish_to_linkedin.py

echo "=== New ads published ==="
```

---

## 4. LinkedIn Audience Targeting

### Primary Audience: CEO/Founder

| Parameter | Value |
|-----------|-------|
| Job Titles | CEO, Founder, Co-Founder, President, Owner, Managing Director |
| Company Size | 11-50, 51-200, 201-500 employees |
| Industries | Healthcare, Real Estate, Manufacturing, Professional Services, Software/IT |
| Seniority | CXO, Owner, Partner |
| Location | United States |
| Exclude | Current customers (matched audience), competitors |

### Secondary Audience: COO/VP Ops

| Parameter | Value |
|-----------|-------|
| Job Titles | COO, VP Operations, Director of Operations, Head of Operations |
| Company Size | 11-50, 51-200, 201-500 employees |
| Industries | Same as above |
| Seniority | VP, Director |
| Location | United States |
| Exclude | Current customers, competitors |

### Retargeting Audiences (Phase 2)

| Audience | Source | Use |
|----------|--------|-----|
| Website visitors | LinkedIn Insight Tag on alphasmb.com | Retarget with social proof ads |
| Booking page visitors | Insight Tag on /book | Retarget with urgency/scarcity ads |
| Video viewers (50%+) | LinkedIn video ad engagement | Retarget with direct offer |
| Engaged with ad but didn't click | LinkedIn engagement audience | Retarget with different hook |

---

## 5. Database Schema

```sql
CREATE TABLE ads (
    id TEXT PRIMARY KEY,               -- internal ad ID (e.g., "comparison-ad-01-tools")
    linkedin_creative_id TEXT,          -- LinkedIn API creative ID
    campaign_type TEXT,                 -- "testing" or "winners"
    headline TEXT,
    intro_text TEXT,
    cta_type TEXT,
    destination_url TEXT,
    persona_target TEXT,
    template_type TEXT,
    hook_category TEXT,
    status TEXT,                        -- "active", "paused", "promoted"
    created_at TIMESTAMP,
    paused_at TIMESTAMP,
    promoted_at TIMESTAMP,
    pause_reason TEXT,
    promotion_reason TEXT
);

CREATE TABLE daily_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ad_id TEXT REFERENCES ads(id),
    date DATE,
    impressions INTEGER,
    clicks INTEGER,
    spend REAL,
    cpm REAL,
    ctr REAL,
    cpc REAL,
    conversions INTEGER,
    UNIQUE(ad_id, date)
);

CREATE TABLE pipeline_runs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    run_type TEXT,                      -- "daily_analysis" or "weekly_generation"
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    ads_paused INTEGER,
    ads_promoted INTEGER,
    ads_generated INTEGER,
    total_spend REAL,
    report_path TEXT
);

CREATE TABLE api_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TIMESTAMP,
    endpoint TEXT,
    method TEXT,
    request_body TEXT,
    response_status INTEGER,
    response_body TEXT
);
```

---

## 6. Reference: AlphaSMB Copy & Brand Assets

All source copy, brand voice rules, templates, and audience personas are documented in the project knowledge base. The ad generator should load these files as context:

| File | Contents | Use |
|------|----------|-----|
| `1-brand-voice.md` | Voice rules, banned words, tone spectrum | Enforce in every generated ad |
| `2-product-services.md` | Service details, pricing, methodology, competitive positioning | Source for ad claims and offers |
| `3-audience-personas.md` | Personas, pain points, objection handling, customer language | Drive targeting and messaging |
| `4-credentials-proof.md` | Zach's credentials, bio, proof points | Source for social proof ad framework |
| `5-linkedin-ad-copy-guide.md` | Ad copy frameworks, templates, CTA copy, hashtag strategy | Direct templates for the generator |
| `6-copy-bank.md` | Approved headlines, hooks, key phrases, deliverable descriptions | Seed content for all generated ads |

---

## 7. Configuration File

```yaml
# config.yaml — AlphaSMB Ad Pipeline Configuration

linkedin:
  app_id: "YOUR_LINKEDIN_APP_ID"
  app_secret: "YOUR_LINKEDIN_APP_SECRET"
  access_token: "YOUR_ACCESS_TOKEN"        # OAuth 2.0
  refresh_token: "YOUR_REFRESH_TOKEN"
  ad_account_id: "YOUR_AD_ACCOUNT_ID"
  testing_campaign_id: "YOUR_TESTING_CAMPAIGN_ID"
  winners_campaign_id: "YOUR_WINNERS_CAMPAIGN_ID"

claude:
  api_key: "YOUR_ANTHROPIC_API_KEY"
  model: "claude-sonnet-4-5-20250929"

thresholds:
  min_impressions_for_decision: 500
  max_cpm_threshold: 40.00
  min_ctr_for_winner: 0.80
  min_clicks_for_winner: 10
  winner_observation_days: 3
  loser_observation_hours: 48
  max_daily_promotions: 3
  min_active_ads: 5

budget:
  testing_pool_daily: 100.00
  winner_ad_daily: 25.00
  max_total_daily: 300.00

generation:
  ads_per_batch: 40
  generation_schedule: "weekly"

reporting:
  email_to: "zach@alphasmb.com"
  slack_webhook: ""                         # Optional
  report_dir: "./reports/"

database:
  path: "./data/alphasmb_ads.db"

destination:
  booking_url: "https://alphasmb.com/book"
  website_url: "https://alphasmb.com"
```

---

## 8. Implementation Order

Build in this order. Each phase should be independently testable.

### Phase 1: Foundation (Day 1-2)
- [ ] Set up project structure and config.yaml
- [ ] Set up SQLite database with schema
- [ ] LinkedIn API authentication (OAuth 2.0 flow)
- [ ] Test basic LinkedIn API calls (read campaigns, read ads)
- [ ] Install LinkedIn Insight Tag on alphasmb.com and /book

### Phase 2: Ad Generator (Day 3-4)
- [ ] Build ad copy generator using Claude API
- [ ] Load all 6 brand/copy docs as context for the prompt
- [ ] Implement banned word/phrase validator
- [ ] Generate first batch of 40 ads
- [ ] Manual review of generated ads (human in the loop for V1)
- [ ] Output to JSON

### Phase 3: Publisher (Day 5-6)
- [ ] Build LinkedIn bulk publisher
- [ ] Create campaign structure (Testing Pool + Winners)
- [ ] Upload first batch of ads
- [ ] Verify ads are live in Campaign Manager
- [ ] Log LinkedIn creative IDs to database

### Phase 4: Analyzer (Day 7-8)
- [ ] Build performance data puller (LinkedIn Reporting API)
- [ ] Store daily metrics in database
- [ ] Implement analysis logic (loser/winner identification)
- [ ] Generate daily report (markdown + terminal)
- [ ] Test with live data after 48+ hours of ad runtime

### Phase 5: Ad Manager (Day 9-10)
- [ ] Build pause function (PATCH ad status)
- [ ] Build promote function (duplicate to Winners campaign)
- [ ] Add safety rails (min active ads, max daily promotions)
- [ ] Test pause/promote with real ads
- [ ] Add API logging

### Phase 6: Orchestration (Day 11-12)
- [ ] Wire everything into run_daily.sh and generate_new_ads.sh
- [ ] Set up cron jobs
- [ ] Add error handling and alerting
- [ ] Email/Slack report delivery
- [ ] Run full pipeline end-to-end

### Phase 7: Optimization (Ongoing)
- [ ] Add retargeting audiences (Phase 2 targeting)
- [ ] A/B test ad images (dark backgrounds, ember accent per brand)
- [ ] Add conversion tracking (actual bookings, not just clicks)
- [ ] Build weekly summary dashboard
- [ ] Tune thresholds based on accumulated data

---

## 9. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Ad variations in rotation | 40+ at any time | Database count |
| Average CPM (Testing Pool) | < $25 | LinkedIn analytics |
| Average CTR (Winners) | > 1.0% | LinkedIn analytics |
| Cost per website visit | < $10 | Spend / clicks |
| Cost per booking | < $100 | Spend / conversions |
| Pipeline uptime | 95%+ daily runs complete | Cron logs |
| Time to kill losers | < 72 hours from first impression | Database timestamps |
| Time to promote winners | < 5 days from first impression | Database timestamps |

---

## 10. Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| LinkedIn API rate limits (100/day) | Can't manage all ads | Batch operations, prioritize actions, request higher limits |
| LinkedIn rejects ad creatives | Ads don't go live | Pre-validate against LinkedIn ad policies, add retry logic |
| Generated copy violates brand voice | Off-brand ads run | Automated validator + human review for V1 |
| Budget runaway | Overspend | Hard daily cap in config, safety rails in code, LinkedIn budget limits |
| OAuth token expires | Pipeline stops | Implement refresh token rotation, alert on auth failures |
| Low impression volume | Can't make data-driven decisions | Extend observation windows, lower thresholds, increase budget |
| LinkedIn API changes | Pipeline breaks | Pin API versions, monitor LinkedIn developer changelog |

---

## 11. What This PRD Does NOT Cover

- **Ad creative images/design** — This pipeline handles copy only. Image creation (dark backgrounds, ember accent, text overlay) is a separate workstream. For V1, use a single branded image template.
- **Organic LinkedIn posting** — This is paid ads only. The LinkedIn posting cadence (Mon/Wed/Fri) described in the ad copy guide is separate.
- **Landing page optimization** — Assumes alphasmb.com/book exists and converts. Separate workstream.
- **CRM integration** — Leads from LinkedIn go to Cal.com/Stripe. No CRM sync in V1.
- **Multi-platform** — LinkedIn only. Facebook/Google ads would follow the same architecture but are out of scope.

---

## 12. Notes for Claude Code

When building this, keep these things in mind:

1. **Start with the LinkedIn API auth.** Everything else depends on it. If you can't read campaigns and create ads, nothing works.

2. **The ad generator prompt is the most important piece.** The brand voice rules are strict. Load all 6 project docs as context and explicitly instruct the model to validate against banned words. Test the output quality before automating.

3. **Use the real copy bank as seeds, not as the entire ad.** The generator should remix and recombine proven hooks, phrases, and frameworks — not just copy-paste from the bank.

4. **LinkedIn's API is more restrictive than Facebook's.** Rate limits are tighter, bulk operations are more limited, and the reporting API has different time granularity. Plan for this.

5. **The config.yaml thresholds are starting points.** They'll need tuning after 1-2 weeks of real data. Make them easy to change without touching code.

6. **Log everything.** Every API call, every decision, every pause/promote action. When something breaks at 6 AM and Zach wakes up to no ads running, the logs are the first thing he'll check.

7. **The daily report is the user interface.** Make it clean, scannable, and actionable. Zach should be able to read it in 30 seconds and know if anything needs his attention.
