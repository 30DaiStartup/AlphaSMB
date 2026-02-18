# AlphaSMB

AI transformation consultancy for SMBs. Anti-consultant positioning — advisor who's been in the fire, not a SaaS platform.

## Current State

Multi-page site (Phase 1) deployed on Vercel. Five pages: Home, Services/Strategy-Call, About, Book, Privacy.

- Plan: `AlphaSMB-Full-Website-Plan.md` (full site architecture, copy, phasing)
- Brand: `AlphaSMB-Brand-Identity-and-Logo-Prompt-v3.md` (colors, typography, logo rationale)
- Old spec archived: `archive/AlphaSMB-Coming-Soon-Spec-v3.md`

## Stack

Static HTML/CSS/JS, deployed on Vercel. No framework, no bundler, no build tools.

- `styles.css` — Shared CSS (design tokens, nav, hero, sections, cards, FAQ, footer, responsive, reduced motion)
- `main.js` — Shared JS (scroll reveal via IntersectionObserver, mobile nav toggle, FAQ accordion)
- `vercel.json` — Clean URLs config

## File Structure

```
index.html                  # Home page (hero, problem, services, proof, methodology, CTA)
services/strategy-call.html # Strategy call detail (time blocks, deliverables, fit, FAQ)
about.html                  # About Zach (headshot, credentials, philosophy)
book.html                   # Cal.com scheduling embed
privacy.html                # Privacy policy
styles.css                  # Shared CSS
main.js                     # Shared JS
vercel.json                 # Vercel config
graphics/                   # Assets (unchanged)
archive/                    # Old coming-soon files
agent_docs/                 # Copy and section reference
```

## Wordmark (v3)

Color-isolation treatment — **not** the slash from v2. "Al" in ember (#E8450D) with underline, "phaSMB" in body text color. On dark backgrounds: "Al" ember, "phaSMB" white, underline white.

Hero uses `graphics/AlphaSMB-full-tpbg.png` (transparent bg) as the brand image with CSS drop-shadow halo for dark-on-dark legibility.

## Assets

- `graphics/AlphaSMB-full-tpbg.png` — Full wordmark, transparent bg (hero image)
- `graphics/Al-32x-tpbg.png` — Favicon (32x32)
- `graphics/Al-180x-tpbg.png` — Apple touch icon (180x180)
- `graphics/headshot.jpg` — Zach Henderson headshot (about page)

## Key Constraints

- **Font:** Sora (Google Fonts) — weights 400, 600, 700 only
- **Palette:** Warm charcoal (#1C1917) + ember (#E8450D) — no blue, no navy
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

## Design Tokens

```css
--alpha-charcoal: #1C1917;  --alpha-charcoal-light: #292524;
--alpha-ember: #E8450D;     --alpha-ember-dark: #C53D0A;
--alpha-ember-glow: rgba(232, 69, 13, 0.20);
--alpha-sand: #F5F0EB;      --alpha-stone: #78716C;
--alpha-slate: #44403C;     --alpha-white: #FFFFFF;
```

## Agent Docs

- `agent_docs/copy.md` — All page copy in one place
- `agent_docs/sections.md` — Section-by-section layout specs
