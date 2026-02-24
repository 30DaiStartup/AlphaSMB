# AlphaSMB

AI transformation consultancy for SMBs. Anti-consultant positioning — advisor who's been in the fire, not a SaaS platform.

## Current State

Multi-page site (Phase 1) deployed on Vercel. Six pages: Home, Services/Strategy-Call, Assessment, About, Book, Privacy.

- Plan: `AlphaSMB-Full-Website-Plan.md` (full site architecture, copy, phasing)
- Brand: `AlphaSMB-Brand-Identity-and-Logo-Prompt-v3.md` (colors, typography, logo rationale)

## Stack

Static HTML/CSS/JS, deployed on Vercel. No framework, no bundler, no build tools.

- `styles.css` — Shared CSS (design tokens at `:root`, nav, hero, sections, cards, FAQ, footer, responsive, reduced motion)
- `main.js` — Shared JS (scroll reveal via IntersectionObserver, mobile nav toggle, FAQ accordion)
- `vercel.json` — Clean URLs config

## File Structure

```
index.html                  # Home page (hero, problem, services, proof, methodology, CTA)
services/strategy-call.html # Strategy call detail (time blocks, deliverables, fit, FAQ)
assessment/                 # AI readiness diagnostic (20 questions, client-side scoring)
  index.html                #   Assessment page
  assessment.css             #   Assessment-specific styles
  assessment.js / questions.js / scoring.js / insights.js / speech.js
about.html                  # About Zach (headshot, credentials, philosophy)
book.html                   # Cal.com scheduling embed
privacy.html                # Privacy policy
styles.css                  # Shared CSS
main.js                     # Shared JS
graphics/                   # Assets (logo, favicon, headshot)
pipeline/                   # LinkedIn ad pipeline (Python, see agent_docs/pipeline.md)
```

## Key Constraints

- **Font:** Manrope (Google Fonts) — weights 400, 600, 700 only
- **Palette:** Warm charcoal (#1C1917) + ember (#E8450D) — no blue, no navy. Tokens in `styles.css:9`
- **Animations:** CSS keyframes for load, IntersectionObserver for scroll, CSS transitions for interactions. Respect `prefers-reduced-motion`
- **Responsive:** 768px breakpoint
- **Accessibility:** WCAG AA contrast, visible focus states, semantic HTML, sr-only labels

## Integrations

| Integration | Implementation |
|------------|---------------|
| **Cal.com** | Inline embed on `/book`, link `https://cal.com/alphasmb/60min` |
| **Plausible** | Script tag in `<head>` of every page |
| **Stripe** | Handled by Cal.com at booking |
| **Kit** | Post-booking automation only (no visible form on site) |

## Agent Docs

- `agent_docs/copy.md` — All page copy in one place
- `agent_docs/sections.md` — Section-by-section layout specs
- `agent_docs/brand.md` — Wordmark, assets, design tokens
- `agent_docs/pipeline.md` — LinkedIn ad pipeline components and setup

## LinkedIn Ad Pipeline

Automated marketing pipeline in `pipeline/` — separate Python system. See `agent_docs/pipeline.md` for components and setup. Run tests: `python -m pytest pipeline/tests/ -v`
