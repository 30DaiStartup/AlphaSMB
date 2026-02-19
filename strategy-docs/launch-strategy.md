# AlphaSMB Launch Strategy

*Created: 2026-02-19*

This document covers the full go-to-market launch sequence for AlphaSMB -- from pre-launch verification through the first 90 days of operation. The goal is to generate consistent strategy call bookings ($500/call) and build the proof points (testimonials, case patterns, referrals) that make the business self-sustaining.

---

## 1. Pre-Launch Checklist

Complete every item before making any public announcement. One broken link or failed payment flow during launch week will cost you credibility you can't get back.

### Site QA

- [ ] **All five pages load correctly** on desktop and mobile (Home, /services/strategy-call, /about, /book, /privacy)
- [ ] **Navigation links** work from every page, including mobile hamburger menu
- [ ] **Clean URLs** working via Vercel (no `.html` extensions visible)
- [ ] **Favicon and Apple touch icon** rendering correctly
- [ ] **OG tags** validated -- paste each page URL into the [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) and [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/) to confirm title, description, and image render correctly
- [ ] **All CTAs ("Book a Strategy Call -- $500")** link to `/book` or `https://cal.com/alphasmb/60min`
- [ ] **Footer links** all functional (Services, About, Book a Call, Privacy, LinkedIn)
- [ ] **Email link** (zach@alphasmb.com) in footer opens mail client correctly
- [ ] **Responsive check** on actual phone (not just browser dev tools) -- iPhone Safari and Android Chrome at minimum
- [ ] **Load speed** acceptable (<3s on mobile) -- run through [PageSpeed Insights](https://pagespeed.web.dev/)
- [ ] **No console errors** in browser dev tools on any page

### Booking & Payment Flow

- [ ] **Cal.com embed** loads on `/book` page (dark theme, correct branding)
- [ ] **Test booking** -- book a call using a personal/test email, confirm calendar invite arrives
- [ ] **Stripe payment** processes successfully during test booking ($500 charge)
- [ ] **Stripe refund** the test charge after confirming payment flow works
- [ ] **Confirmation email** from Cal.com arrives with calendar invite and any pre-call questionnaire
- [ ] **Cal.com availability** set correctly (block off times you're not available, timezone correct)
- [ ] **Cal.com noscript fallback** -- disable JavaScript, confirm direct link and email fallback display

### Analytics

- [ ] **Plausible script** present in `<head>` of all five pages
- [ ] **Plausible dashboard** showing pageviews (visit each page yourself to confirm data flows)
- [ ] **Custom events** tracking (if configured) -- CTA clicks, Cal.com embed interactions
- [ ] **Plausible goals** set up for key conversions (booking page visits, outbound Cal.com clicks)

### LinkedIn Profile

- [ ] **Headline** updated to reflect AlphaSMB positioning (e.g., "Fractional Head of AI at Aurora WDC | Founder, AlphaSMB -- AI Transformation for SMBs")
- [ ] **About section** rewritten to lead with the AlphaSMB value prop, not just career history
- [ ] **Featured section** includes link to alphasmb.com (with a compelling description, not just the URL)
- [ ] **Experience section** has AlphaSMB listed as current role alongside Aurora WDC
- [ ] **Website link** in contact info points to alphasmb.com
- [ ] **Banner image** updated (if you have one -- consider a simple branded graphic with the AlphaSMB wordmark and tagline)
- [ ] **Profile set to public** and "Open to" section reflects consulting availability

### Other Pre-Launch Items

- [ ] **Email signature** updated to include AlphaSMB, website URL, and one-liner
- [ ] **Google Business Profile** -- optional but useful if you want to appear in local searches; not urgent for launch
- [ ] **robots.txt and sitemap.xml** deployed (if not already part of the SEO work)
- [ ] **Schema markup** live on site (LocalBusiness or ProfessionalService, if implemented)
- [ ] **Personal calendar** blocked for launch week -- you need bandwidth for DMs, follow-ups, and potential calls
- [ ] **Talking points doc** ready -- a one-paragraph explanation of what AlphaSMB is that you can paste into any DM or email without rewriting it each time

---

## 2. Launch Week Timeline (Days 1-7)

The goal of launch week is simple: get the word out to your warm network and book your first 3-5 strategy calls. This is not about going viral. It is about telling the people who already trust you that you are doing something new, and giving them an easy way to act on it or refer someone.

### Day 0 (Sunday Before Launch)

**Prep day. Nothing goes public.**

- Final pass through the pre-launch checklist -- everything green
- Pre-write all LinkedIn posts for the week (see templates below)
- Pre-write DM templates (see Section 3)
- Pre-write email announcement (see below)
- Make a list of 50 warm contacts to reach out to personally (former colleagues, industry contacts, people who have asked you about AI)
- Segment the 50 into three tiers:
  - **Tier 1 (10 people):** Close contacts who would book a call or refer someone immediately
  - **Tier 2 (20 people):** Professional contacts who would share your post or make an introduction
  - **Tier 3 (20 people):** Broader network -- people who should know about this but you have no specific ask

### Day 1 (Monday) -- The Announcement

**LinkedIn Post #1: The origin story**

This is your "why I started this" post. It should hit these beats:
1. What you've seen doing AI work at the Fortune 1000 level
2. The gap you noticed -- SMBs can't access this kind of strategic thinking
3. What AlphaSMB is and what problem it solves
4. The offer ($500 strategy call, what they walk away with)
5. CTA: Link to alphasmb.com or directly to /book

Tone: Personal, direct, conversational. Not a press release. Not "excited to announce." Write it like you'd explain it to a smart friend over coffee.

Post length: 800-1,200 words (LinkedIn rewards longer-form content that keeps people reading). Use short paragraphs and line breaks.

**Personal outreach: Tier 1 contacts (10 DMs)**

- Send personalized DMs to your 10 closest contacts
- Do NOT just share the LinkedIn post link -- write a personal message first, then mention the post
- Template in Section 3 below

**Email announcement**

Send to your personal/professional contact list. Keep it short:

> Subject: Something new I'm building
>
> [First name] --
>
> Quick note to let you know I launched AlphaSMB -- an AI transformation consultancy for SMBs.
>
> The short version: I've been running AI strategy for Fortune 1000 companies at Aurora WDC. I kept seeing the same problem -- SMBs that know they need to move on AI but don't have access to the strategic thinking that makes it work. So I built a service that gives them exactly that.
>
> The primary offering is a one-hour AI strategy call ($500) where I do an AI readiness assessment, build a transformation roadmap, and deliver a 48-hour action plan they can start executing immediately.
>
> If you know any SMB leaders (20-500 employees) who are trying to figure out AI for their organization, I'd appreciate the introduction. And if that's you, even better -- [book a call here](https://alphasmb.com/book).
>
> Site: [alphasmb.com](https://alphasmb.com)
>
> Thanks,
> Zach

### Day 2 (Tuesday)

**Personal outreach: Tier 2 contacts (10 DMs)**

- Personalized messages to 10 of your 20 Tier 2 contacts
- Ask is lighter: "Would love it if you'd share the post" or "If anyone in your network comes to mind..."

**Engage on LinkedIn**

- Respond to every comment on your Day 1 post (within 1 hour of each comment if possible)
- Comment on 5-10 posts from people in your target audience (SMB leaders, AI-adjacent content)
- Do NOT post new content today -- let the Day 1 post run

### Day 3 (Wednesday)

**LinkedIn Post #2: The methodology**

A value-first post that teaches something. Pick one element of your framework and go deep:
- "Why giving everyone ChatGPT licenses doesn't work (and what to do instead)"
- Or: "The one role every SMB needs to fill before they can adopt AI"
- Or: "What I learned running AI transformation at the Fortune 1000 that applies to every 50-person company"

End with a soft CTA: "If this resonates and you want to talk through what it looks like for your organization, the link is in my profile."

**Personal outreach: Remaining Tier 2 contacts (10 DMs)**

### Day 4 (Thursday)

**Personal outreach: Tier 3 contacts (10 DMs)**

- Lighter touch: "Hey [name], wanted to let you know about something I launched..."
- No hard ask -- just awareness

**Engage on LinkedIn**

- Continue responding to comments
- Comment on 5-10 relevant posts
- Share any early wins or reactions in your LinkedIn stories or as a short comment on your own post

### Day 5 (Friday)

**LinkedIn Post #3: Social proof or insight**

If you've had any calls by now, share a (anonymized) insight:
- "Had my first few AlphaSMB strategy calls this week. The pattern I keep seeing..."
- Or share a specific takeaway or framework element that resonated with callers

If no calls yet, share a relevant observation from your Aurora WDC work:
- "Something I see at every company I work with, from 50 employees to Fortune 1000..."

**Personal outreach: Remaining Tier 3 contacts (10 DMs)**

### Days 6-7 (Weekend)

**Rest and review.**

- Check Plausible analytics: How many site visits? Which pages? Where did traffic come from?
- Check Cal.com: How many bookings?
- Review which DMs got responses, which didn't
- Note any objections or questions that came up repeatedly
- Plan Week 2 content based on what you learned

---

## 3. Warm Network Activation

### Principles

- **Personal before promotional.** Every outreach should feel like a conversation between two people, not a broadcast from a brand.
- **10 DMs per day maximum.** More than that and you'll start cutting corners on personalization. Quality over volume.
- **Lead with context, not the pitch.** Reference something specific about your relationship or their situation before mentioning AlphaSMB.
- **Make the ask easy.** Don't ask them to buy. Ask them to share, introduce, or just keep you in mind.
- **One follow-up only.** If they don't respond to the DM, let it go. If they respond but don't act, don't push.

### DM Templates

**Tier 1 -- Close contacts (the ones who would book or refer)**

> Hey [name] -- wanted to give you a heads up on something I just launched. I started AlphaSMB, an AI transformation consultancy for SMBs. Been doing this work at the Fortune 1000 level at Aurora WDC and kept seeing smaller companies get left behind because they don't have access to the same strategic thinking.
>
> The core offering is a one-hour strategy call ($500) where I assess their AI readiness, build a roadmap, and give them a 48-hour action plan.
>
> Two asks: (1) if you know any SMB leaders (20-500 employees) who are wrestling with AI adoption, I'd love an intro. (2) I posted about it on LinkedIn today -- a share or comment would mean a lot. [Link]
>
> How are things on your end?

**Tier 2 -- Professional contacts (share/introduce)**

> Hey [name] -- hope you're doing well. Quick note: I launched a consultancy called AlphaSMB, helping SMB leadership teams build AI-capable organizations. It's an extension of the work I've been doing at Aurora WDC.
>
> If anyone in your network is trying to figure out AI for their business, I'd appreciate you keeping me in mind. I also posted about it on LinkedIn if you wanted to take a look. [Link]
>
> No pressure at all -- just wanted you to know about it.

**Tier 3 -- Broader network (awareness only)**

> Hey [name] -- been a while. Wanted to let you know I launched something new alongside my work at Aurora WDC -- an AI transformation consultancy for SMBs called AlphaSMB. If you ever run into someone trying to figure out AI for their business, feel free to send them my way: alphasmb.com.
>
> Hope things are going well for you.

### "First 5 Callers" Early-Bird Framing

Optional but effective for launch week: offer a visible incentive for early bookings. This creates urgency without discounting.

**Do NOT discount the $500 price.** Discounting signals uncertainty about your own value. Instead, add value:

- "The first 5 people who book a strategy call this month get a complimentary 30-minute follow-up call 2 weeks later to check progress against the action plan."
- Mention this in your LinkedIn post, DMs, and email
- Track who books and fulfill the follow-up
- After 5 are claimed, remove the offer -- creates genuine scarcity

This gives early callers extra value, gives you a second touchpoint to collect testimonials, and gives you a reason to follow up ("Your free follow-up is next week -- when works?").

---

## 4. First 30 Days Plan

### Week 1: Launch (covered above)

Target: 3-5 strategy calls booked.

### Week 2: Momentum

**Posting cadence: 2 posts**

- Monday: Value post (a framework, insight, or specific example from your work -- NOT a pitch for AlphaSMB)
- Thursday: A post that addresses a common question or objection you've heard in DMs or calls

**Outreach:**
- Continue 5-10 DMs/day to new connections or people who engaged with your posts
- Follow up with anyone who expressed interest in Week 1 but didn't book

**Testimonial collection:**
- After each strategy call, send a follow-up email within 48 hours:
  > "Thanks for the call, [name]. I'm building AlphaSMB and early feedback means everything. If you found the session valuable, would you be open to sharing a 2-3 sentence quote I can use on the site? No pressure either way."
- Offer to draft something for them to approve (most people want to help but don't want to write from scratch)
- Even a one-liner is gold at this stage

### Week 3: Patterns

**Posting cadence: 2 posts**

- Tuesday: Share an anonymized pattern you're seeing across calls ("Every SMB I talk to has the same problem with AI adoption...")
- Friday: Behind-the-scenes post about building AlphaSMB (what you've learned, what surprised you)

**Content pipeline:**
- Start a running doc of insights from strategy calls (anonymized). Every call is content:
  - What question did they ask that others probably have?
  - What assumption did they have that was wrong?
  - What was the "aha moment" in the session?
- Each insight becomes a future LinkedIn post

**Referral asks:**
- For clients who had a good experience, ask explicitly: "Do you know anyone else dealing with the same challenge? I'd appreciate an intro."
- Make it easy: "Just forward them my site -- alphasmb.com -- or connect us on LinkedIn and I'll take it from there."

### Week 4: Systematize

**Posting cadence: 2-3 posts**

By now you should have a rhythm. Aim for:
- Monday: Value/insight post
- Wednesday: Engagement post (question, poll, hot take on AI adoption)
- Friday (optional): Personal/behind-the-scenes

**Review and adjust:**
- How many calls booked in the first 30 days?
- What's the conversion rate from site visit to booking page to actual booking?
- Which LinkedIn posts performed best? Double down on that format.
- Which DM approaches got the best response rate?
- Are there objections coming up repeatedly? Address them on the site or in content.

**Testimonials on site:**
- If you have 2-3 testimonials by now, add them to the homepage (the social proof section is scaffolded and waiting)
- Even 1-2 real quotes from real people changes the site's credibility dramatically

**Monthly follow-up offer:**
- Reach out to every strategy call client: "Wanted to check in -- how's the action plan going? If you'd like a monthly check-in to keep momentum, I offer that at $500/month."
- This is low-pressure, high-value recurring revenue

---

## 5. Success Metrics

### 7-Day Targets

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Site visits | 200-500 | Plausible dashboard |
| Booking page visits | 30-50 | Plausible (filter to /book) |
| Strategy calls booked | 3-5 | Cal.com dashboard |
| Revenue | $1,500-$2,500 | Stripe dashboard |
| LinkedIn post impressions | 5,000-15,000 (across all posts) | LinkedIn analytics |
| DMs sent | 50 | Manual count |
| DM response rate | 40-60% | Manual count |
| Email open rate | 50%+ | Email tool or manual |
| Testimonial requests sent | Equal to calls completed | Manual |

### 30-Day Targets

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Site visits | 800-1,500 | Plausible |
| Strategy calls booked | 8-15 | Cal.com |
| Revenue | $4,000-$7,500 | Stripe |
| Testimonials collected | 3-5 | Manual |
| LinkedIn followers gained | 100-300 | LinkedIn analytics |
| Booking page conversion rate | 8-15% of visitors | Plausible (booking page visits / total visits) |
| Referral bookings | 1-3 (any booking that came from a referral) | Ask during calls |
| Monthly follow-up clients | 1-2 | Cal.com / Stripe |

### 90-Day Targets

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Monthly strategy calls | 15-25 (steady state) | Cal.com |
| Monthly revenue (strategy calls) | $7,500-$12,500 | Stripe |
| Anchor engagement clients | 1-2 | Direct |
| Total revenue (90-day) | $25,000-$50,000 | Stripe + direct invoicing |
| Testimonials on site | 5-8 | Site audit |
| LinkedIn audience | 500-1,000 new followers | LinkedIn analytics |
| Inbound inquiries (no outreach needed) | 3-5/month | Email + LinkedIn DMs |
| Referral rate | 20-30% of bookings come from referrals | Ask during calls |
| Site traffic (monthly) | 1,000-2,500 visits | Plausible |

### Leading Indicators to Watch

These tell you early whether things are working or not:

- **Booking page visit-to-booking ratio** -- if people visit /book but don't complete, the Cal.com flow or pricing may be the issue
- **LinkedIn post engagement rate** -- if posts get views but no comments/shares, the content isn't resonating
- **DM response rate** -- if below 30%, your messaging needs work
- **Repeat visitors in Plausible** -- people coming back to the site multiple times before booking is normal and healthy
- **Time on strategy call page** -- long time = they're considering it; short time = something turned them off

---

## 6. Risk Mitigation

### Scenario: Bookings Are Slow (0-2 in First Two Weeks)

**Diagnosis first.** Check the funnel:

1. **Are people visiting the site?** (Check Plausible)
   - If no: The problem is awareness. Double down on outreach and posting.
   - If yes: Move to step 2.

2. **Are they reaching the booking page?** (Check /book pageviews)
   - If no: The problem is the site itself -- the copy, CTAs, or navigation aren't compelling enough. Review the homepage and strategy call page for friction.
   - If yes: Move to step 3.

3. **Are they starting the Cal.com flow but not completing?**
   - If yes: The problem is the booking flow. Check: Is availability too limited? Is the Stripe checkout step creating friction? Is the $500 price stopping them at the last step?
   - If no one is even clicking into Cal.com: The booking page copy or layout needs work.

**Actions if bookings are slow:**

- **Increase outreach volume.** Go from 10 DMs/day to 15-20. Cast a wider net.
- **Ask for feedback.** Send 5 DMs to people who visited the site but didn't book: "Hey, saw you checked out AlphaSMB -- any feedback on the site? Genuinely curious what you thought."
- **Post more frequently.** Go to 3-4 LinkedIn posts per week. Each post is another chance for someone to discover you.
- **Guest content.** Offer to write a guest post or do a LinkedIn Live / podcast appearance with someone in your network who reaches SMB leaders.
- **Try a different angle.** If "AI transformation" isn't landing, test more specific framing: "AI strategy for healthcare companies" or "Why your Copilot rollout failed."

### Scenario: Price Objections ("$500 for an Hour Is Too Much")

**Do not lower the price.** The price is a signal. Lowering it tells the market you're not confident in the value.

Instead:

- **Reframe the deliverable.** The $500 is not for an hour of conversation. It's for an AI readiness assessment, transformation roadmap, execution scorecard, and 48-hour action plan. A branded PDF they can share with their leadership team. Emphasize deliverables over time.
- **Compare to alternatives.** "A McKinsey AI assessment starts at $150K. An internal hire to run AI strategy costs $180K+/year. This is $500 for a plan you can start executing this week."
- **Address it in content.** Write a LinkedIn post about pricing consulting work, or about what goes into a strategy call. Make the value visible before they ever hit the booking page.
- **Offer the follow-up bonus** (first 5 callers framing) to add perceived value without reducing price.
- **If objections persist from a specific person**, they may not be your target customer. SMB leaders who balk at $500 for strategic consulting are likely not decision-makers with budget authority. That's the anti-persona.

### Scenario: No-Shows or Cancellations

- **Cal.com reminder emails** should be configured (24 hours and 1 hour before)
- **Pre-call questionnaire** creates investment -- people who fill it out are more likely to show up
- **Cancellation policy**: Since payment is collected at booking via Stripe, consider a policy: full refund if cancelled 24+ hours before, 50% refund within 24 hours, no refund for no-shows. State this clearly on the booking page or in the confirmation email.
- If no-shows become a pattern (>10%), add a manual confirmation step: send a personal email after booking that says "Looking forward to our call on [date]. I've reviewed your questionnaire -- here's what I'm thinking we'll focus on..." This creates personal accountability.

### Scenario: Early Calls Don't Go Well

- **After every call, do a 5-minute self-debrief:** What worked? What didn't land? What question caught you off guard? What would you do differently?
- **Adjust the format.** The 15/15/20/10 time blocks are a starting framework. If you find you need more discovery time and less roadmap time, adjust.
- **Don't chase testimonials from bad calls.** If a call didn't go well, learn from it but don't ask for a testimonial. One bad testimonial request that results in a lukewarm quote is worse than no testimonial.
- **Iterate the deliverable.** The branded PDF should improve with every call. The first version will be rough. By call 10, it should be polished.

### Scenario: Wrong Audience Showing Up

If the people booking calls aren't the target (solopreneurs, people wanting tool recommendations, companies under 20 employees):

- **Tighten the "Who This Is For / Not For" copy** on the strategy call page
- **Add qualifying language** to the Cal.com booking form: "How many employees does your company have?" and "What's your primary goal for this call?"
- **Pre-screen with a brief questionnaire** -- if someone is clearly not a fit, offer to refund and redirect them to a more appropriate resource. This protects your time and builds goodwill.
- **Adjust your LinkedIn content** to speak more specifically to the target persona (CEOs/COOs of 50-500 employee companies, not freelancers or solopreneurs)

### Scenario: Competitor Concerns

If another AI consultant launches something similar or you start seeing competitive pressure:

- **Double down on what's unique.** No one else has your specific combination of Fortune 1000 AI leadership (current, verifiable at Aurora WDC) + 20 years of cross-industry operating experience + SMB-accessible pricing.
- **Don't engage with competitors publicly.** Never mention them by name. Focus on your own positioning.
- **Speed matters.** The first mover with real testimonials and a visible track record wins in local/niche consulting. Get those first 10 testimonials as fast as possible.

---

## Appendix: LinkedIn Profile Optimization Checklist

Your LinkedIn profile IS your landing page for the first 90 days. Most people will check your profile before visiting alphasmb.com. Treat it accordingly.

### Headline (220 characters max)

Current pattern to follow:
> Fractional Head of AI at Aurora WDC | Founder, AlphaSMB -- I help SMB leadership teams build AI-capable organizations

Keep Aurora WDC first -- it's the credibility anchor. AlphaSMB second -- it's what they should click on.

### About Section

Structure:
1. **Opening hook** (2-3 sentences): What you do and who you do it for. Lead with the value prop, not your resume.
2. **The problem** (2-3 sentences): What you see happening with AI adoption at SMBs.
3. **Your approach** (2-3 sentences): How AlphaSMB is different -- organizational transformation, not tool implementation.
4. **Credentials** (2-3 sentences): Aurora WDC, Epic, 20+ years, cross-industry.
5. **CTA**: "If your organization is wrestling with AI adoption, let's talk: alphasmb.com/book"

### Featured Section

Pin these in order:
1. Link to alphasmb.com with a description: "AI Transformation Consultancy for SMBs -- Strategy Calls, Readiness Assessments, and Transformation Roadmaps"
2. Your best-performing LinkedIn post from launch week
3. (Later) A testimonial screenshot or case study link

### Experience

- **AlphaSMB** -- Founder (current). Description: 2-3 sentences about what AlphaSMB does and who it serves. Include the URL.
- **Aurora WDC** -- Fractional Head of AI (current). Keep this prominent -- it's your credibility proof.

---

## Appendix: Post-Launch Content Calendar (Weeks 2-8)

Suggested posting rhythm: 2-3 posts per week. Mix of formats to keep your audience engaged.

| Week | Post 1 (Mon/Tue) | Post 2 (Thu/Fri) | Optional Post 3 |
|------|-------------------|-------------------|-----------------|
| 2 | Framework/methodology insight | Address a common objection or question | -- |
| 3 | Anonymized pattern from calls | Behind-the-scenes of building AlphaSMB | -- |
| 4 | Hot take on AI adoption (contrarian view) | Client win or testimonial (if available) | Engagement post (question or poll) |
| 5 | Deep dive on one element of your framework | Industry-specific AI insight (healthcare, manufacturing, etc.) | -- |
| 6 | "What I've learned from X strategy calls" | Response to AI news or trend through your lens | Engagement post |
| 7 | Longer-form thought leadership piece | Quick tactical tip for SMB leaders | -- |
| 8 | Month-2 reflection + what's next | Client testimonial or case pattern | Engagement post |

### Content Themes That Work for This Positioning

- **"Everyone has the same tools" posts** -- variations on why AI adoption is an organizational capability, not a software purchase
- **"What I see at the Fortune 1000 vs. SMBs" posts** -- your unique vantage point is seeing both worlds
- **"Here's what actually happened" posts** -- real (anonymized) stories from strategy calls
- **Contrarian takes** -- "Stop buying AI tools" / "Your AI pilot program is wasting money" / "The problem with AI training"
- **Framework breakdowns** -- teach one piece of the mindset-champion-activation-measurement framework per post
- **Industry-specific posts** -- "AI adoption in healthcare is different because..." (shows depth, attracts specific personas)

### Content to Avoid

- Anything that sounds like a press release ("Excited to announce...")
- Posts that are just links to the website with no substance
- AI hype content ("AI will change everything!" -- everyone is posting this, it's noise)
- Engagement bait (tag 5 people, like if you agree, etc.)
- Complaining about other consultants or competitors
- Anything using the words from the "words to avoid" list in the brand voice doc

---

## Appendix: Key Links and Resources

| Resource | URL |
|----------|-----|
| AlphaSMB website | https://alphasmb.com |
| Booking page | https://alphasmb.com/book |
| Cal.com direct link | https://cal.com/alphasmb/60min |
| LinkedIn profile | https://www.linkedin.com/in/zach-henderson/ |
| Plausible analytics | (check Plausible dashboard) |
| Stripe dashboard | (check Stripe dashboard) |
| Facebook OG debugger | https://developers.facebook.com/tools/debug/ |
| LinkedIn post inspector | https://www.linkedin.com/post-inspector/ |
| PageSpeed Insights | https://pagespeed.web.dev/ |
