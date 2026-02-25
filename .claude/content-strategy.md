# Content Strategy — AlphaSMB

*Created: 2026-02-25*

## Goal

Every piece of content should drive one action: **take the free AI Readiness Assessment.** Content builds authority in AI transformation for SMBs and captures demand from leaders who know they need to move on AI but don't know where to start.

## Content Pillars

### 1. AI Readiness (Assessment-Adjacent)
**Why:** Directly feeds the primary funnel. Targets "where do I start?" queries.
**Product connection:** Every piece naturally leads to "find out where your organization stands."

### 2. AI Transformation Methodology (Thought Leadership)
**Why:** Differentiates from tool-focused competitors. Builds authority.
**Product connection:** Demonstrates the mindset→champion→activation→measurement framework.

### 3. Industry-Specific AI Adoption (Vertical Search)
**Why:** Long-tail keywords with high intent. SMB leaders search "[industry] + AI."
**Product connection:** Assessment tailors results by industry — content can reference this.

### 4. AI Adoption Failures (Problem-Aware Content)
**Why:** Addresses the pain directly. "We tried AI and it didn't work" is the #1 customer statement.
**Product connection:** Assessment diagnoses why it didn't work (mindset/skillset/toolset gap).

---

## Priority Topics — First 12 Pieces

### Tier 1: Searchable + Assessment Funnel (publish first)

| # | Topic | Type | Buyer Stage | Target Query |
|---|-------|------|-------------|--------------|
| 1 | How to Assess Your Organization's AI Readiness | Hub guide | Awareness | "AI readiness assessment" "how ready is my company for AI" |
| 2 | Why AI Tools Fail in SMBs (And What to Do Instead) | Blog | Awareness | "AI adoption failure rate" "why AI tools don't work" |
| 3 | AI Strategy for SMBs: Where to Start When You're Behind | Blog | Awareness | "AI strategy small business" "AI for SMBs" |
| 4 | The 80% Drop-Off Problem: Why AI Subscriptions Go Unused | Blog | Awareness | "AI tool adoption" "employees not using AI" |

**CTA on each:** "Find out where your organization stands — take the free 5-minute assessment."

### Tier 2: Industry-Specific (high-intent long-tail)

| # | Topic | Type | Buyer Stage | Target Query |
|---|-------|------|-------------|--------------|
| 5 | AI Transformation in Healthcare: What SMB Providers Need to Know | Blog | Consideration | "AI in healthcare small business" "AI for medical practices" |
| 6 | AI for Real Estate Companies: Beyond Virtual Tours | Blog | Consideration | "AI in real estate" "AI for real estate companies" |
| 7 | AI for Manufacturing SMBs: Competing with Larger Operations | Blog | Consideration | "AI in manufacturing" "AI for small manufacturers" |
| 8 | AI for Professional Services Firms: From Billable Hours to Strategic Value | Blog | Consideration | "AI professional services" "AI for consulting firms" |

**CTA on each:** "See how your [industry] organization scores — take the assessment."

### Tier 3: Shareable Thought Leadership

| # | Topic | Type | Buyer Stage | Target Query |
|---|-------|------|-------------|--------------|
| 9 | AI Isn't a Tool Decision. It's a Strategy Decision. | Essay | Awareness | Shareable (LinkedIn, organic) |
| 10 | The Champion Model: Why AI Transformation Succeeds or Fails on One Person | Essay | Consideration | Shareable + "AI change management" |
| 11 | What I Learned Leading AI Transformation Inside a Real Company | Essay | Awareness | Shareable (founder story) |
| 12 | Your AI Readiness Score Doesn't Mean What You Think It Means | Essay | Consideration | Shareable (assessment follow-up) |

**CTA on each:** Assessment link in bio/footer. #12 specifically targets assessment completers.

---

## Topic Cluster Map

```
AI Readiness (Hub: #1)
├── Why AI Tools Fail (#2)
├── 80% Drop-Off Problem (#4)
├── Your Score Doesn't Mean What You Think (#12)
└── → Assessment CTA

AI Strategy for SMBs (#3)
├── Healthcare (#5)
├── Real Estate (#6)
├── Manufacturing (#7)
├── Professional Services (#8)
└── → Assessment CTA (industry-tailored)

Methodology / Thought Leadership
├── Tool vs Strategy Decision (#9)
├── The Champion Model (#10)
├── What I Learned at Aurora WDC (#11)
└── → Assessment CTA
```

---

## Distribution

| Channel | Content Type | Frequency |
|---------|-------------|-----------|
| Blog (alphasmb.com/blog) | All 12 pieces | 2/week until backlog published |
| LinkedIn | Condensed versions of essays (#9-12), key insights from blog posts | 3-4x/week |
| Email (Resend) | New post notifications to assessment completers | Per publish |

---

## Content Production Notes

- **Voice:** First person (Zach), direct, anti-consultant. Same voice as the site.
- **Length:** Blog posts 1000-1500 words. Essays 800-1200 words. No padding.
- **Structure:** Question-format H2s, answer capsules at top of sections (AEO-friendly).
- **CTA placement:** After problem articulation (mid-article) and at the end. Always the assessment.
- **Avoid:** AI hype language, "leverage/synergy/unlock" words, generic "AI is changing everything" openers.

## Technical Setup Required

- Create `/blog` directory or URL structure
- Blog post template with nav, footer, Plausible, assessment CTA
- Add blog to sitemap.xml
- Add blog link to nav (when first post publishes)

## Success Metrics

- Assessment starts from blog traffic (Plausible: page referrer on Assessment Started event)
- Blog → Assessment conversion rate
- Organic search impressions for target keywords (Google Search Console)
- AI answer engine citations (manual spot-checks monthly)
