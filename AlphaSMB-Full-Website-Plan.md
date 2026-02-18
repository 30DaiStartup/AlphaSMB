# AlphaSMB — Full Website Plan

**Document purpose:** Comprehensive plan for evolving the AlphaSMB coming-soon splash page into a full website that supports the business model, drives bookings, and builds trust. This document captures the site architecture, page-by-page specs, copy direction, and build priorities — ready for handoff to Claude Code when the time comes.

**Key inputs:** This plan synthesizes the full project history — the playbook, the rubric, the adversarial critique, the business model refinements, the skill pipeline architecture, the vertical targeting strategy, the credential positioning, and the brand identity work.

---

## 1. Business Context the Website Must Reflect

The business has evolved significantly since the initial coming-soon spec. The website needs to support a strategy that is considerably more nuanced than "AI consulting for SMBs." Here's what the site must communicate and enable:

### The Three-Stage Rocket

AlphaSMB is not just a consultancy. It's a deal-flow engine for a consulting-to-product pipeline:

- **Stage 1 — Consulting:** Paid engagements (1-hour calls + anchor clients) that generate revenue, testimonials, and deep operational access to SMBs across verticals
- **Stage 2 — Pattern recognition:** Transcripts and engagement data feed AI agents that spot cross-client pain points ripe for productization
- **Stage 3 — Product:** Agentic solutions built by recruited vibe coders and sold back into the verticals already penetrated

The website primarily serves Stage 1 (getting bookings and building credibility). It should hint at Stage 3 sophistication without revealing the full playbook.

### Two Service Tiers

| Tier | What It Is | Price Point | Capacity |
|------|-----------|-------------|----------|
| **One-Hour Strategy Call** | AI readiness assessment + transformation plan + execution scorecard delivered as a branded PDF. The primary lead generation and revenue engine. | $500/hour (introductory, escalating to $750-1000) | Up to 10/week |
| **Anchor Transformation Engagement** | Deep, multi-month AI transformation driven by the full playbook — champion identification, phased change management, weekly rubric scoring, organizational capability building. | Higher hourly rate, ~5 hrs/week per client | 2 clients max |

### Two Lead Verticals

- **Healthcare IT / SMB practices** — Epic background + healthcare consulting experience. Positioned around "safe speed of adoption" within regulatory guardrails. Strongest pain-point severity, clearest product pipeline.
- **Real estate** — Decades of investing and operational experience. Warmest network, fastest referral velocity. Transaction coordination, market analysis, property management workflows.

Cross-industry credibility narrative: *"I run AI strategy for Aurora WDC, a human intelligence agency serving the Fortune 1000, and I've built and operated businesses across healthcare, real estate, manufacturing, and software. I'm not a tech consultant who knows AI — I'm a business operator at the cutting edge of AI."*

### The Credential Stack

- Fractional Head of AI, Aurora WDC — human intelligence agency serving the Fortune 1000 (current role)
- Early career at Epic + years in healthcare IT consulting
- Decades of real estate investing across complex deal structures
- Industrial engineering background
- Built and owned product companies
- Management consulting across multiple industries

The site must make these credentials feel *earned and natural*, not like a resume dump.

### Monthly Follow-Up Flywheel

One-hour call clients are offered a recurring monthly check-in at $500/month. This creates recurring revenue, retention, ongoing transcripts for the knowledge base, and higher referral probability. The website should make this easy to understand and easy to rebook.

---

## 2. Site Architecture

### Sitemap

```
alphasmb.com
├── / (Home)
├── /services
│   ├── /services/strategy-call (One-Hour Call detail + booking)
│   └── /services/transformation (Anchor Engagement detail + contact)
├── /about
├── /industries (optional — see notes below)
│   ├── /industries/healthcare
│   └── /industries/real-estate
├── /results (Case studies + testimonials)
├── /resources (Blog/content hub — Phase 2)
└── /book (Scheduling — Cal.com embed)
```

### Build Priority & Phasing

**Phase 1 — Launch (replace coming-soon page):**
- Home
- /services/strategy-call (with embedded booking)
- /about
- /book (scheduling integration)

**Phase 2 — After 10-15 one-hour calls completed:**
- /results (case studies + testimonials as they accumulate)
- /services/transformation (anchor engagement detail)
- /resources (content hub for LinkedIn articles to live long-form)

**Phase 3 — After vertical traction is clear:**
- /industries/healthcare and /industries/real-estate
- Vertical-specific landing pages for targeted LinkedIn/ad traffic

---

## 3. Page-by-Page Specifications

---

### HOME ( / )

**Purpose:** Convert cold traffic into booked strategy calls. Establish credibility instantly. Communicate the core value prop in under 10 seconds.

**Structure follows the conversion architecture (adapted):**

#### Hero Section

**Eyebrow text:**
```
AI Transformation for SMBs
```

**Headline:**
```
Your competitors aren't waiting. Neither should you.
```

**Subheadline:**
```
I help SMB leadership teams build AI-capable organizations — not just AI-equipped employees — so they can compete with anyone regardless of budget or headcount.
```

**Primary CTA:**
```
Button: Book a Strategy Call — $500
```
Links to /book or embedded scheduler.

**Credential bar** (immediately below CTA, single line):
```
Fractional Head of AI at Aurora WDC, a human intelligence agency serving the Fortune 1000 · Epic Systems · 20+ years across healthcare, real estate, manufacturing & software
```
This is the trust signal. It's not a bio — it's a credibility punch in one line. "Current" and "named company" make it verifiable. "Fractional" signals availability.

#### Problem Section

**Headline:**
```
The gap isn't about tools. It's about your organization.
```

**Three problem statements** (same voice as the coming-soon page, evolved):

**Problem 1: "Everyone has the same tools. Not everyone has the same results."**
```
Every AI tool on the market is available to your competitors for the same price you'd pay. ChatGPT, Claude, Copilot — none of them are a competitive advantage anymore. The advantage is whether your organization knows how to think with them, not just use them. That's an organizational capability, not a software purchase.
```

**Problem 2: "Transformation doesn't fail because of technology. It fails because of people."**
```
You can hand every employee a premium AI subscription tomorrow. In 30 days, 80% of them will have stopped using it. Not because the tools don't work — because nobody shifted their mindset, showed them what's possible, or gave them permission to experiment. Tools without culture change is just an expensive experiment.
```

**Problem 3: "You can't afford to figure this out by trial and error."**
```
Every month your organization spends fumbling with AI adoption is a month your competitors are pulling ahead. The gap compounds. And unlike most business challenges, this one has an expiration date — the window to establish an AI-capable culture is open now and closing fast.
```

#### What You Get (Value Section)

**Headline:**
```
Two ways to work with AlphaSMB
```

**Tier 1 Card — The Strategy Call:**
```
Headline: One-Hour AI Strategy Call
Price: $500
Description: A focused, high-intensity session where I assess your organization's AI readiness, identify your highest-value opportunities, and build a transformation plan you can start executing this week. You leave with a branded deliverable that includes:

- AI Readiness Assessment scored across mindset, skillset, and toolset
- Benchmarking against industry peers
- Three-phase transformation roadmap with milestones
- Execution scorecard to track your own progress
- Immediate "first 48 hours" action plan

CTA: Book Your Call →
```

**Tier 2 Card — Anchor Transformation:**
```
Headline: Full Transformation Engagement
Price: Starting at [contact for pricing]
Description: For leadership teams ready to commit. I embed with your organization for up to 3 months, running the full AlphaSMB playbook — champion identification, phased change management, weekly progress scoring against industry benchmarks, and organizational capability building that outlasts the engagement.

Limited to two clients at a time.

CTA: Let's Talk →
```

The "limited to two clients" line is a deliberate scarcity signal that's also true.

#### Social Proof Section

**Headline:**
```
What leaders are saying
```

This section starts empty and fills as testimonials accumulate from one-hour calls. Design it now so it's ready to populate. Structure for each testimonial:

- Quote (specific result or insight, not generic praise)
- Name, title, company
- Industry tag (healthcare, real estate, manufacturing, etc.)

**Before testimonials exist**, this section can display the credential narrative instead:

```
"I currently run AI strategy for Aurora WDC, a human intelligence agency serving the Fortune 1000. I've built and operated businesses across healthcare, real estate, manufacturing, and software. I don't just know AI — I know the operations, the politics, and the resistance that come with changing how an organization works."
```

#### The Methodology (Brief)

**Headline:**
```
How it works
```

**Four-step visual** (simple numbered flow, not complex diagram):

```
1. Mindset first.
   We start with leadership. If the people at the top don't think differently about AI, nothing changes below them.

2. Find your champion.
   We identify the person your organization already listens to and turn them into your AI transformation catalyst.

3. Activate the high-agency people.
   Your best people are waiting for permission to move. We surface who they are and give them the tools and methods to lead from within.

4. Measure what matters.
   Weekly scoring against industry benchmarks so you always know where you stand — and so does your leadership team.
```

#### Bottom CTA

**Headline:**
```
Be the alpha.
```

**Subtext:**
```
One hour. One conversation. A plan you can start executing tomorrow.
```

**CTA:**
```
Book a Strategy Call — $500
```

#### Footer

```
© 2026 AlphaSMB. All rights reserved.
```

Links: Services · About · Book a Call · Privacy Policy
Social: LinkedIn icon (link to your profile)

---

### SERVICES — STRATEGY CALL ( /services/strategy-call )

**Purpose:** Detailed breakdown of the one-hour call for prospects who need more info before booking. This is the page you link from LinkedIn posts and email signatures.

**Sections:**

1. **Hero** — What it is, who it's for, what it costs, booking CTA
2. **What happens on the call** — Detailed walkthrough of the hour:
   - First 15 min: deep-dive into your current state — operations, tools, team dynamics, competitive landscape
   - Next 15 min: assessment scoring across mindset, skillset, toolset dimensions
   - Next 20 min: building your transformation roadmap together, identifying quick wins and phased priorities
   - Final 10 min: questions, next steps, and whether a deeper engagement makes sense
3. **What you walk away with** — The deliverable breakdown (assessment, benchmark, roadmap, scorecard, 48-hour action plan). Show a mockup of the branded PDF deliverable when available.
4. **Who this is for** — Qualify the buyer:
   - SMB leaders (20-500 employees) who know they need to move on AI but aren't sure where to start
   - Organizations that have tried tools but haven't seen adoption stick
   - Leadership teams facing competitive pressure from AI-native competitors
   - Industries: healthcare, real estate, manufacturing, professional services, and more
5. **Who this is NOT for** — Disqualify poor fits:
   - Companies looking for someone to "just implement ChatGPT"
   - Organizations without leadership commitment to change
   - Teams looking for a vendor recommendation, not a transformation strategy
6. **FAQ:**
   - "What if I need more than one hour?" → Monthly follow-up option + anchor engagement path
   - "Is this a sales pitch for a bigger engagement?" → Honest: the deliverable is valuable standalone. If a deeper engagement makes sense, I'll tell you. If it doesn't, I'll tell you that too.
   - "What industries do you work with?" → Cross-industry with deep expertise in healthcare, real estate, manufacturing, and software.
   - "Can I expense this?" → Yes. Invoice provided. Many clients expense under professional development or strategic consulting.
7. **Booking embed** — Calendar integration (Calendly, Cal.com, or similar)

---

### SERVICES — TRANSFORMATION ( /services/transformation )

**Purpose:** Information page for the anchor engagement. Not a hard sell — this is for prospects who've either done the one-hour call and want to go deeper, or who were referred directly for the full engagement.

**Build in Phase 2** — the one-hour call is the primary revenue and lead-gen engine. This page can be simpler and more conversational.

**Sections:**

1. **What it is** — Full-playbook transformation: champion identification, phased change management (mindset → skillset → toolset), weekly rubric scoring, organizational capability building
2. **How it's different** — Position against generic AI consulting: "Most consultants sell you a roadmap and leave. I embed with your team, find your champion, shift the culture, and measure everything weekly until transformation is self-sustaining."
3. **What you get** — Weekly progress reports benchmarked against industry peers, leadership coaching on AI-driven decision making, phased implementation of the full playbook, identified high-agency employees, prioritized backlog of high-value AI opportunities across four lenses (cost reduction, risk reduction, time liberation, force multiplication)
4. **Structure** — 3-month engagement, ~5 hours/week, limited to 2 clients at a time
5. **CTA** — "Let's Talk" → contact form or scheduler for an intro call

---

### ABOUT ( /about )

**Purpose:** Build trust and human connection. This is where the credential stack comes alive as a story, not a resume.

**Tone:** First person. Conversational. Confident without being arrogant.

**Sections:**

1. **The short version** (above the fold):
```
I'm Zach Henderson. I currently serve as the fractional Head of AI for Aurora WDC, a human intelligence agency that provides strategic intel to the Fortune 1000. Before that, my career has spanned Epic Systems, healthcare IT consulting, decades of real estate investing, industrial engineering, and building product companies from scratch.

I started AlphaSMB because I watched too many capable businesses get left behind — not because they lacked resources, but because nobody showed them how to build an organization that could adapt. I bring the same AI transformation methodology I run at the Fortune 1000 level and translate it for SMB leadership teams who want to punch above their weight class.
```

2. **The credentials** (a clean, scannable list — NOT a resume):
   - Fractional Head of AI, Aurora WDC — human intelligence agency serving the Fortune 1000 (current)
   - Epic Systems + healthcare IT consulting
   - 20+ years in real estate investing (residential, commercial, complex deal structures)
   - Industrial engineering background
   - Built and operated product companies
   - Management consulting across manufacturing, software, healthcare, and professional services

3. **The philosophy** (1-2 paragraphs):
```
Most AI consultants sell you tools. I build the culture that actually uses them.

Transformation doesn't start with a software purchase. It starts with a mindset shift at the leadership level, then finding the one person your organization already listens to and turning them into a catalyst. From there, it compounds — high-agency people self-identify, problems surface from the bottom up, and the organization builds a capability that outlasts any individual tool or engagement. I run this same methodology at the Fortune 1000 level. AlphaSMB is how I bring it to the businesses that need it most.
```

4. **Photo** — `headshot.jpg` from the graphics directory. Professional but approachable. Position prominently on the about page — this is where SMB leaders decide "I want to talk to this person."

5. **CTA:**
```
Ready to talk? Book a strategy call.
```

---

### RESULTS ( /results )

**Purpose:** Social proof hub. Case studies and testimonials. Build in Phase 2 once the proof exists.

**Structure:**

- Featured case study cards (when available) — industry, challenge, approach, measurable result
- Testimonial wall — quotes from one-hour call clients, organized by industry tag
- Aggregate stats as they accumulate: "X organizations assessed across Y industries"

**Important design note:** design the testimonial card component *now* even if the page doesn't launch until Phase 2. The format should be ready to populate the moment the first testimonial comes in so there's zero friction to publishing proof.

---

### BOOK ( /book )

**Purpose:** Frictionless scheduling.

**Implementation:** Embed Cal.com scheduling widget directly. The page should include:
- A brief reminder of what the call includes and what it costs ($500, collected at booking)
- The Cal.com scheduling widget
- "What to prepare" — a short note about what to have ready (basic company info, current AI tools in use, biggest pain points)
- Tone: "Book a call with Zach" — personal, not corporate

This page can also be the target of a UTM-tagged link from LinkedIn posts for tracking.

---

### INDUSTRY PAGES ( /industries/healthcare, /industries/real-estate )

**Purpose:** Targeted landing pages for vertical-specific traffic. Build in Phase 3 after vertical traction is established.

**Healthcare page should lean into:**
- Epic background and healthcare IT consulting experience
- Understanding of HIPAA and regulatory guardrails
- Specific pain points: prior auth, clinical documentation, claims processing, patient communication
- Positioning: "safe speed of adoption" — move fast within the guardrails
- Industry-specific testimonials

**Real estate page should lean into:**
- Decades of investing experience across deal structures
- Understanding of transaction workflows, property management operations, market analysis processes
- Pain points: transaction coordination, tenant communication, due diligence, scheduling
- Industry-specific testimonials

Each industry page should have its own booking CTA and can be the target of industry-specific LinkedIn content and outreach.

---

## 4. Design & Technical Direction

### Visual Identity

Carry forward the v3 brand identity:
- **Palette:** ember + charcoal + sand + stone (see Coming-Soon-Spec-v3 CSS variables)
- **Typography:** Sora 400/600/700 from Google Fonts
- **Wordmark:** HTML/CSS "Al" in ember with white/charcoal underline (context-dependent)
- **Accent treatment:** ember left-borders on lists, ember CTAs, ember focus states

### Design Principles

- **Dark theme for the home page hero and CTAs** — transitions to lighter sections for content-heavy areas (problem, methodology, about). The contrast between dark and light sections creates natural visual rhythm.
- **No stock photos.** None. Real photos only (your photo on the about page, client logos when permitted). If an image isn't real, don't use one — use typography and whitespace instead.
- **Restrained animation.** Scroll reveals on sections, hover transitions on buttons and cards, page load sequence on the hero. Nothing else.
- **Mobile-first responsive.** Every page must work perfectly on phone screens — this is where LinkedIn traffic lands.

### Technical Stack Options

Two paths depending on where you want to invest:

**Option A — Static site (recommended for Phase 1):**
- HTML/CSS/JS, deployed on Vercel from GitHub
- Cal.com embed for scheduling
- No backend, no CMS, no database
- Fast, cheap ($0), easy to maintain
- Add pages by creating new HTML files

**Option B — Lightweight framework (Phase 2+):**
- Next.js or Astro on Vercel
- Headless CMS (like Notion as CMS, or Contentful free tier) for blog/resources
- Still static/SSG — no server costs
- Better for managing content at scale once blog and case studies are live

**Recommendation:** Start with Option A. Get the site live, start driving calls, accumulate proof. Migrate to Option B when the content volume justifies it (probably when you have 10+ blog posts and 5+ case studies).

### Integrations Needed

| Tool | Purpose | When |
|------|---------|------|
| **Cal.com** (free) | Scheduling + $500 payment collection at booking | Phase 1 launch |
| **Stripe** (via Cal.com) | Payment processing | Phase 1 launch |
| **Plausible Analytics** ($9/mo) | Privacy-focused, cookieless traffic analytics | Phase 1 launch |
| **Kit / ConvertKit** (free tier) | Email capture, newsletter, automation, segmentation | Phase 1 launch |
| **LinkedIn** | Social link, content distribution | Phase 1 launch |
| **Testimonial.to or similar** | Structured testimonial collection from clients | Phase 2 |
| **CMS** (Notion, Contentful, or similar) | Blog/resource content management | Phase 2+ |

---

## 5. Copy Voice Guide

All website copy should follow these principles:

**Do:**
- Write like a peer, not a vendor
- Use "I" not "we" — this is a personal-brand consultancy, not a faceless firm
- Be specific over generic: "I've led AI transformation inside a Fortune 1000 intelligence firm" > "I have extensive experience in AI"
- Name the pain before you name the solution
- Use the client's language: "your best people are buried in work that doesn't move the needle" > "optimize resource allocation"
- Let the credentials speak through context, not claims: show what you've done, don't just assert you're qualified

**Don't:**
- Use corporate jargon: no "leverage," "synergy," "unlock value," "digital transformation journey"
- Use generic AI hype: no "harness the power of AI," "AI-driven solutions," "cutting-edge technology"
- Hedge: no "we might be able to help" — "here's what we do" 
- Overuse "alpha" wordplay — save it for "Be the alpha" closing CTA only
- Use stock-photo energy in the writing: no bland positivity, no consultant-speak

---

## 6. Content Strategy (Feeds the Website)

The website becomes the hub that LinkedIn content drives traffic to. The content strategy is:

**LinkedIn posts (2-3x/week):**
- Alternate between healthcare-specific and real-estate-specific tactical content
- Each post ends with a soft CTA to the strategy call or a link to a relevant page
- Format: personal story + specific insight + actionable takeaway
- Repurpose the best posts as long-form articles on /resources (Phase 2)

**One-hour call deliverables (with permission):**
- Anonymized case snippets become social proof on the /results page
- Common questions across calls become FAQ content
- Pattern insights become LinkedIn content: "I've done 30 strategy calls with healthcare SMBs this quarter. Here's the one thing 80% of them have in common."

**AI readiness self-assessment (future):**
- A simplified, public-facing version of the rubric: "Score your organization's AI readiness in 5 minutes"
- Lives at /assessment or similar
- Captures email, generates a basic score, recommends a strategy call for the full picture
- This is the inbound lead magnet that the adversarial critique identified as a high-value asset

---

## 7. Build Sequence & Milestones

| Phase | What Ships | Trigger to Start | Estimated Effort |
|-------|-----------|-----------------|-----------------|
| **Phase 1a** | Coming-soon page (already specced in v3) | Now | 1-2 hours in Claude Code |
| **Phase 1b** | Full home page + /services/strategy-call + /about + /book | After coming-soon is live and booking tool is chosen | 4-6 hours |
| **Phase 2** | /results page + /services/transformation + /resources hub | After 10-15 completed calls with testimonials | 3-4 hours |
| **Phase 3** | /industries/healthcare + /industries/real-estate | After clear vertical traction | 2-3 hours per page |
| **Phase 4** | Self-assessment tool (/assessment) | After rubric is validated across 20+ clients | Larger build — likely a separate spec |

---

## 8. Resolved Decisions

### 1. Scheduling Tool: Cal.com ✓

**Decision: Cal.com.** The research confirms this is the clear winner for a single-user consultancy:

- Cal.com's free plan includes unlimited event types, unlimited calendar connections, workflow automation, AND payment collection via Stripe — all features Calendly locks behind their $10-12/month Standard plan
- Calendly's free plan is severely limited: one event type, one calendar connection, no payments
- Cal.com has a cleaner, more modern UI with dark mode
- Cal.com gives you a short booking URL: cal.com/zachhenderson (or similar)
- Trustpilot ratings: Cal.com 4.7 stars vs Calendly 1.7 stars
- Cal.com is open-source, so if you ever need custom behavior, it's extensible
- Stripe integration is built into Cal.com's free tier for collecting the $500 at booking

The only things Calendly does better are native mobile apps (Cal.com uses mobile-optimized web) and deeper enterprise CRM integrations (Salesforce/HubSpot routing). Neither matters for your use case.

**Setup: collect payment at booking via Stripe integration.** This reduces no-shows dramatically. A $500 commitment at the point of scheduling means only serious buyers end up on your calendar.

### 2. Payment Collection: At Booking ✓

Confirmed. Stripe via Cal.com, collected when the client books.

### 3. Name Usage: Zach Henderson + AlphaSMB ✓

- Use "AlphaSMB" as the entity/brand name in headers, the wordmark, the footer, the credential bar, service tier names, and anywhere the business is being referenced as an organization
- Use "Zach" or "Zach Henderson" in the about page, the philosophy section, the "What leaders are saying" placeholder narrative, and any first-person copy. The hero subheadline and methodology section can use "I/we" naturally
- The booking page should feel personal: "Book a call with Zach" not "Book a call with AlphaSMB"

### 4. Headshot: Available ✓

Headshot image is available in the graphics directory (`headshot.jpg`). Will be used on the /about page and potentially as the social preview image for link sharing.

### 5. Email Service: Kit (formerly ConvertKit) — Recommended

**Recommendation: Kit (formerly ConvertKit).** Here's why it fits your trajectory:

- **Free up to 10,000 subscribers** — you won't hit this for a long time, so $0/month to start
- **Best-in-class automation and tagging** — critical for your future needs. You'll want to segment subscribers by: one-hour call clients, anchor clients, newsletter subscribers, industry vertical (healthcare, real estate, etc.), and product leads. Kit's tagging system handles this cleanly
- **Visual automation builder** — when you're ready to build sequences (onboarding, follow-up after calls, product launch announcements), Kit's automation builder is the strongest in this class
- **Built for "brands of one"** — Kit is designed for exactly your profile: a solo operator with a personal brand who will eventually sell products to their audience
- **Commerce-ready** — when you start selling agentic products (Stage 3 of your rocket), Kit has built-in digital product sales and paid newsletter capability. You won't need to migrate to a different platform
- **Good deliverability** — your emails will actually reach inboxes, which matters when you're emailing CEOs

Why not the others:
- **Mailchimp** — feature bloat, confusing UI after years of Intuit ownership, punitive pricing as your list grows, free plan is now extremely limited (500 contacts, 1,000 emails/month)
- **Loops** — clean and simple but automation is too basic for your needs. Better for SaaS product emails than consultant newsletters
- **Beehiiv** — excellent for pure newsletter businesses but overkill on the publishing side and weaker on automation/tagging. Better for media companies than consulting practices

**Immediate use:** capture emails from the coming-soon page, send a launch announcement when the full site goes live, and begin a periodic newsletter with insights from your one-hour calls (anonymized).

### 6. Privacy Policy: Generated ✓

See `AlphaSMB-Privacy-Policy.md` — ready to be published as a page on the site. You'll need to add your contact email address where indicated. Note the disclaimer at the bottom: this is a solid starting point but if you want ironclad CCPA/GDPR compliance as you scale, a quick attorney review is worth the investment.

### 7. Analytics: Plausible — Recommended

**Recommendation: Start with Plausible ($9/month).** Here's my reasoning:

- **No cookie banner needed.** Plausible is cookieless and GDPR-compliant by default. Google Analytics requires a cookie consent banner, which adds friction and visual clutter to your coming-soon page and full site. For a business where every visitor impression matters, removing that banner is worth $9/month alone.
- **Dashboard you'll actually check.** Plausible gives you one clean screen: visitors, sources, pages, locations, devices. That's everything you need at this stage. Google Analytics gives you 200 reports, 95% of which you'll never look at, and the 5% you need are buried behind a learning curve.
- **Privacy-aligned with your brand.** You're building trust with SMB leaders. "We use privacy-focused analytics that don't track you" is a small but real signal that you respect people's data. It aligns with the AlphaSMB brand voice.
- **You can always add GA later.** If you reach a point where you need conversion funnels, event tracking, or audience segmentation for ad targeting, you can add Google Analytics alongside Plausible. They're not mutually exclusive. But at launch, Plausible gives you everything you need without the complexity tax.

The $9/month pays for itself the moment it tells you which LinkedIn post drove the most traffic to your booking page — that's the insight that actually matters for your business right now.
