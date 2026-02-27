# Post-Assessment Email Nurture Sequence

*Created: 2026-02-25*
*Implementation: Resend (transactional email backend already operational)*

## Sequence Overview

```
Sequence Name: Post-Assessment Nurture
Trigger: Assessment completed + email submitted (report sent)
Goal: Book a strategy call ($500)
Length: 5 emails
Timing: Days 1, 3, 5, 8, 14 after report delivery
Exit Conditions: Books a strategy call (Cal.com webhook), or unsubscribes
Audience: SMB leaders who completed the assessment and received their report
```

## What They Already Know
- Their AI readiness score (overall + 3 dimensions)
- Their tier (e.g., "Exploring," "Building," "Leading")
- Their gap pattern (e.g., mindset-heavy, toolset-heavy)
- The strategy call exists ($500, 1 hour, 6 deliverables)
- Zach's name and AlphaSMB brand

## What They Haven't Done
- Booked a strategy call
- Possibly: shared results with their team (share feature exists)

---

## The Sequence

### Email 1: The Insight Behind Your Score
**Send:** Day 1 (24 hours after report)
**Purpose:** Deepen understanding of their score. Give value. No hard sell.

```
Subject: What your AI readiness score actually means
Preview: The number is the start, not the answer.

Hi [Name],

Yesterday you scored [X]/10 on the AI Readiness Assessment. Here's
what most leaders miss about that number:

The score isn't a grade. It's a map.

A [tier] score in [weakest dimension] doesn't mean you're behind —
it means that's where the highest-leverage change is hiding. In my
experience, organizations that close their weakest dimension gap first
see the other two dimensions rise with it.

Your pattern — [pattern name] — is one I see frequently in
[industry] organizations at your stage. It usually means [one sentence
insight about the pattern].

If you want to dig deeper into what your scores mean for your specific
competitive position, that's exactly what the strategy call is built for.

— Zach

P.S. If other leaders on your team should take the assessment, forward
them this link: https://alphasmb.com/assessment
```

**CTA:** Soft — link to strategy call in context, not as a button.
**Personalization:** Score, tier, weakest dimension, pattern, industry (all available from assessment data).

---

### Email 2: The One Thing Most SMBs Get Wrong
**Send:** Day 3
**Purpose:** Challenge a belief. Build authority. Introduce the methodology.

```
Subject: The AI adoption mistake I see every week
Preview: It's not the tools. It never was.

Hi [Name],

The #1 mistake I see in SMBs trying to adopt AI:

They start with tools.

Buy licenses. Roll out ChatGPT. Run a training session. Then wonder
why nobody's using it 30 days later.

In my experience across dozens of engagements, 80% of employees stop
using AI tools within 30 days when there's no organizational change
management behind the rollout.

The organizations that succeed start differently. They start with
mindset — specifically, leadership mindset. If the people at the top
don't think differently about AI, nothing changes below them.

That's why the methodology I built inside Aurora WDC starts with a
leadership assessment (which you've already done), then moves to
identifying a champion — the one person your organization already
listens to — before touching a single tool.

You've already taken the first step. The strategy call is designed
to map the next ones.

Book a strategy call → https://alphasmb.com/book

— Zach
```

**CTA:** Direct link to booking. First explicit ask.

---

### Email 3: What Your Competitors Are Doing
**Send:** Day 5
**Purpose:** Create urgency through loss aversion. Industry-specific.

```
Subject: What [industry] companies scoring 7+ are doing differently
Preview: The gap between knowing and doing is closing fast.

Hi [Name],

I track patterns across every assessment that comes through.

Here's what I'm seeing in [industry] right now:

Organizations scoring 7+ on AI readiness have one thing in common —
they didn't start with better tools. They started with a leadership
team that committed to building organizational capability, not just
buying subscriptions.

The gap between a [score] and a 7+ isn't about budget or headcount.
It's about having a plan that addresses your specific [weakest
dimension] gap — and someone to help you see what your competitors
are already seeing.

Every month spent figuring this out by trial and error is a month
the gap compounds.

The strategy call exists for exactly this moment: you know where you
stand, and you're ready for someone to show you what's possible.

One hour. $500. Six deliverables. Traditional AI consulting starts
north of $50K.

Book your call → https://alphasmb.com/book

— Zach
```

**CTA:** Direct link to booking with price anchoring.

---

### Email 4: How the Strategy Call Actually Works
**Send:** Day 8
**Purpose:** Reduce uncertainty. Address "is $500 worth it?" objection.

```
Subject: What actually happens in 60 minutes
Preview: Here's the breakdown — no surprises.

Hi [Name],

Some people look at "$500 for one hour" and wonder what they're
actually getting. Fair question. Here's the breakdown:

**Minutes 1-15: Deep dive.** Your current state — operations, tools,
team dynamics, competitive landscape. I ask the questions your
assessment can't.

**Minutes 15-30: Assessment.** I score your organization across the
same three dimensions, but with the depth and nuance a self-assessment
can't reach.

**Minutes 30-50: Roadmap.** We build your transformation plan
together — quick wins and phased priorities specific to your business.

**Minutes 50-60: Honest next steps.** If a deeper engagement makes
sense, I'll tell you. If it doesn't, I'll tell you that too.

You walk away with six deliverables: three-phase transformation
roadmap, champion identification framework, AI hackathon blueprint,
execution scorecard, 48-hour quick-start plan, and a shareable
report for your leadership team.

The deliverable stands on its own. You can execute the plan
independently.

Book your call → https://alphasmb.com/book

— Zach

P.S. Many clients expense the call under professional development
or strategic consulting budgets. An invoice is provided after booking.
```

**CTA:** Direct link to booking. Addresses price objection + expense angle.

---

### Email 5: Last Touch — The Window
**Send:** Day 14
**Purpose:** Final nudge. Reframe the decision.

```
Subject: A question for you, [Name]
Preview: Not a sales pitch. A genuine question.

Hi [Name],

Two weeks ago, you took the AI Readiness Assessment because something
told you it was time to figure out where your organization stands.

You scored [X]/10. You saw the gaps. You have the report.

The question isn't whether AI matters for your business — you already
know it does. The question is whether you're going to build a plan
or keep figuring it out by trial and error.

I've been in rooms where leaders waited another quarter, then another,
and watched the gap become a chasm. I've also been in rooms where
one conversation changed the trajectory.

If this is the right time, book the call. If it's not, no hard
feelings — the assessment and report are yours to keep.

https://alphasmb.com/book

— Zach

P.S. This is the last email in this sequence. I won't keep following
up. If you ever want to revisit, the assessment is always there.
```

**CTA:** Soft close. Respects the "no drip campaigns" promise on the site.

---

## Personalization Variables

All available from assessment data stored in Supabase:

| Variable | Source | Example |
|----------|--------|---------|
| `[Name]` | Email form | "Sarah" |
| `[score]` | Assessment scores | "5.3" |
| `[tier]` | Scoring tiers | "Building" |
| `[weakest dimension]` | Lowest dimension score | "mindset" |
| `[pattern name]` | Gap pattern | "Tool-First Trap" |
| `[industry]` | Context screen selection | "healthcare" |

## Implementation Notes

- **Sender:** zach@alphasmb.com (personal, not noreply)
- **Reply-to:** zach@alphasmb.com (replies should reach Zach)
- **Unsubscribe:** Required. One-click unsubscribe link in footer.
- **Exit on booking:** If Cal.com webhook fires for this email, stop the sequence. Requires Cal.com → Supabase integration.
- **Tracking:** Plausible custom events for email link clicks (UTM: `utm_source=email&utm_medium=nurture&utm_campaign=post-assessment&utm_content=email-[1-5]`)
- **Backend:** Resend API, triggered by a scheduled function or cron checking Supabase for users who submitted email but haven't booked (based on days since report delivery)

## Metrics

| Metric | Benchmark Target |
|--------|-----------------|
| Open rate | 40%+ (small list, high relevance) |
| Click rate | 5-10% |
| Assessment → Strategy Call conversion | 10-15% within 14 days |
| Unsubscribe rate | <2% per email |

## Sequence Principles

1. **Honors the privacy promise:** "No spam. No drip campaigns. Just your report and an option to book a strategy call if it makes sense." — 5 emails over 14 days, then stops.
2. **Value before ask:** Emails 1-2 give insight, emails 3-5 sell.
3. **Personalized with assessment data:** Not generic nurture.
4. **Transparent about ending:** Email 5 explicitly says it's the last one.
5. **Every email is from Zach:** First person, direct, anti-consultant voice.
