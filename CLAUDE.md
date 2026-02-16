# AlphaSMB

AI transformation consultancy for SMBs. Anti-consultant positioning — advisor who's been in the fire, not a SaaS platform.

## Current State

Landing page built (`index.html`). Specs are v3.

- Spec: `AlphaSMB-Coming-Soon-Spec-v3.md` (layout, copy, animations, requirements)
- Brand: `AlphaSMB-Brand-Identity-and-Logo-Prompt-v3.md` (colors, typography, logo rationale)

## Stack

Single HTML file with embedded `<style>` and `<script>`. No framework, no bundler, no build tools.

## Wordmark (v3)

Color-isolation treatment — **not** the slash from v2. "Al" in ember (#E8450D) with underline, "phaSMB" in body text color. On dark backgrounds: "Al" ember, "phaSMB" white, underline white.

Hero uses `graphics/AlphaSMB-full-tpbg.png` (transparent bg) as the brand image with CSS drop-shadow halo for dark-on-dark legibility.

## Assets

- `graphics/AlphaSMB-full-tpbg.png` — Full wordmark, transparent bg (hero image)
- `graphics/Al-32x-tpbg.png` — Favicon (32x32)
- `graphics/Al-180x-tpbg.png` — Apple touch icon (180x180)

## Key Constraints

- **Font:** Sora (Google Fonts) — weights 400, 600, 700 only
- **Palette:** Warm charcoal (#1C1917) + ember (#E8450D) — no blue, no navy
- **Email capture:** Front-end state only, no backend. Two CTAs share state
- **Animations:** CSS keyframes for load, IntersectionObserver for scroll, CSS transitions for submit. Respect `prefers-reduced-motion`
- **Responsive:** 768px breakpoint. Input+button inline desktop, stacked mobile
- **Accessibility:** WCAG AA contrast, visible focus states, semantic HTML, sr-only labels

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
- `agent_docs/sections.md` — Detailed section-by-section layout specs
