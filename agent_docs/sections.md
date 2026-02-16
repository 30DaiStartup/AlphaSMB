# AlphaSMB — Section Layout Specs

Detailed layout and visual treatment for each section. See `copy.md` for exact copy.

## Structure

Semantic HTML: `<header>` for hero, `<main>` wrapping all sections, `<section>` for each block, `<footer>` for bottom.

## Section A — Hero (100vh)

- Centered vertically + horizontally, max-width ~720px
- **Logo image:** `graphics/AlphaSMB-full-tpbg.png` (340px desktop, 240px mobile)
  - Transparent bg on dark hero — uses CSS drop-shadow halo for dark text legibility
  - Radial backdrop glow (sand @ ~13% opacity) behind image via ::before pseudo-element
  - Ember glow pulse on load: drop-shadow animation, 0.4s delay, 2s duration, settles
- **Wordmark (v3):** Color-isolation — "Al" ember + white underline, "phaSMB" white. No slash.
  - HTML/CSS wordmark styles preserved in CSS for reuse; hero uses the PNG image instead
- Background: charcoal solid + radial gradient of ember-glow (~400px radius)
- Noise texture overlay: 2-3% opacity via CSS (SVG filter pseudo-element)
- CTA: input (65%) + button (35%) inline on desktop, stacked on mobile
  - Input: charcoal-light bg, 1px slate border, sand text, 6px radius, padding 12px 16px
  - Button: ember bg, white text, Sora 600, 6px radius, padding 12px 24px. Hover → ember-dark

### Load Animation Sequence (CSS only)

1. Logo image fade-in: 0→1, 0.6s ease-out
2. Ember glow pulse (drop-shadow): 0.4s delay, 2s
3. Tagline fade-in: 0.8s delay
4. Subtext fade-in: 1.0s delay
5. CTA fade-in: 1.2s delay

## Section A-alt — Post-Submit

- Crossfade from form (0.3s ease)
- Checkmark ✓ scales 0.5→1.0 with overshoot bounce (0.4s)
- No layout shift, no page reload

## Section B — Problem

- Centered, max-width ~640px
- Background: charcoal-light (subtle shift from hero)
- Padding: 120px top/bottom desktop, 80px mobile
- Paragraphs: 17-18px, 1.7 line-height, 24-28px spacing between
- Scroll reveal: fade-in + translate up 20px, IntersectionObserver threshold 0.15

## Section C — What's Coming

- Centered, max-width ~720px
- Background: charcoal (back to primary)
- Padding: 120px top/bottom desktop
- Value props: vertical list, 36-40px apart
  - 3-4px left border ember, 20px left padding
  - Label: Sora 600, white, 18-20px
  - Body: Sora 400, stone, 16px, 8px top margin
  - Stagger: each item delays fade-in by 150ms

## Section D — Bottom CTA + Footer

- Centered, max-width ~720px
- Background: charcoal-light
- Padding: 120px top, 40px bottom
- "Be the alpha." — 40-56px desktop, 32px mobile, gradient text white→ember
- Same CTA component, shared state with hero
- Footer: slate, 13px, 80px below CTA
- Scroll reveal like B and C
