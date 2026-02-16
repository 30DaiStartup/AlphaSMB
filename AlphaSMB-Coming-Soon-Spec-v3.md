# AlphaSMB — "Coming Soon" Landing Page Spec (v3)

**Document purpose:** Hand this spec directly to Claude Code. It contains everything needed to build the initial splash/coming-soon page — brand direction, copy, design tokens, layout, and technical requirements.

**Companion document:** `AlphaSMB-Brand-Identity-and-Logo-Prompt-v3.md` has the full brand rationale, logo generation prompts, and manual build specs for the wordmark.

---

## 1. Brand Identity Summary

### Name & Wordmark

**AlphaSMB** — rendered as a wordmark where the first two letters **Al** are in ember orange-red and the remaining letters **phaSMB** are in the body text color (white on dark backgrounds, charcoal on light). A thin underline in the body text color sits beneath "Al" only, anchoring the color-highlighted letters.

**Wordmark construction:**

```
AlphaSMB
^^
ember (#E8450D) — first two letters, reads as "AI"
──               — underline beneath "Al" only, in body text color (NOT ember)
  ^^^^^^
  body text color — rest of the word
```

**On the coming-soon page (dark background):**
- "Al" = `--alpha-ember` (#E8450D)
- "phaSMB" = `--alpha-white` (#FFFFFF)
- Underline beneath "Al" = `--alpha-white` (#FFFFFF)

### Build the Wordmark in HTML/CSS (Not an Image)

```html
<div class="wordmark" role="img" aria-label="AlphaSMB">
  <span class="wordmark-al">Al</span><span class="wordmark-rest">phaSMB</span>
</div>
```

```css
.wordmark {
  font-family: 'Sora', 'Manrope', sans-serif;
  font-weight: 700;
  font-size: 56px; /* desktop — 36px on mobile */
  letter-spacing: -0.02em;
  line-height: 1;
  display: inline-block;
}

.wordmark-al {
  color: var(--alpha-ember);
  text-decoration: underline;
  text-decoration-color: var(--alpha-white);
  text-underline-offset: 6px;
  text-decoration-thickness: 4px;
}

.wordmark-rest {
  color: var(--alpha-white);
}
```

Alternative approach if `text-underline-offset` doesn't render exactly right: use a `border-bottom` on the `.wordmark-al` span or a `::after` pseudo-element with a bottom border. Either way, the underline must be the same color as "phaSMB" (white on dark, charcoal on light), NOT ember.

### Color Palette (CSS Variables)

```css
:root {
  --alpha-charcoal: #1C1917;
  --alpha-charcoal-light: #292524;
  --alpha-ember: #E8450D;
  --alpha-ember-dark: #C53D0A;
  --alpha-ember-glow: rgba(232, 69, 13, 0.20);
  --alpha-sand: #F5F0EB;
  --alpha-stone: #78716C;
  --alpha-slate: #44403C;
  --alpha-white: #FFFFFF;
}
```

### Typography

Load from Google Fonts. Only load weights used.

```html
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&display=swap" rel="stylesheet">
```

| Use | Font | Weight |
|-----|------|--------|
| Wordmark | Sora | 700 (Bold) |
| Headlines | Sora | 600 (SemiBold) |
| Body text | Sora | 400 (Regular) |

Fallback stack: `'Sora', 'Manrope', sans-serif`

### Brand Voice

Confident, direct, zero-fluff. Trusted advisor talking to a CEO over coffee. No corporate jargon.

---

## 2. Page Layout & Sections

Single-page, full-viewport "coming soon" splash. **Dark theme** using `--alpha-charcoal` as the primary background. No navigation. No footer links. Four vertical sections.

---

### Section A — Hero (100vh, vertically + horizontally centered)

**Content max-width: ~720px. Single column, centered.**

**Elements top-to-bottom:**

1. **Wordmark** — "AlphaSMB" per the HTML/CSS spec above. 56px desktop, 36px mobile.

2. **Tagline** — 16px spacing below wordmark:
   ```
   AI transformation for the businesses that refuse to be left behind.
   ```
   Sora 400, `--alpha-sand`, 18-20px desktop, 16-17px mobile.

3. **Subtext** — 8px spacing below tagline:
   ```
   We help SMB leadership teams build AI-capable organizations — not just AI-equipped employees.
   ```
   Sora 400, `--alpha-stone`, 16px.

4. **Email Capture CTA** — 32px spacing above.
   - Input + button on one row on desktop (input ~65%, button ~35%), stacked full-width on mobile
   - **Input:** background `--alpha-charcoal-light`, 1px border `--alpha-slate`, text `--alpha-sand`, placeholder `--alpha-stone` reading `your@email.com`, border-radius 6px, padding 12px 16px
   - **Button:** background `--alpha-ember`, text `--alpha-white`, Sora 600, border-radius 6px, padding 12px 24px
   - **Button text:** `Get Early Access`
   - **Button hover:** background `--alpha-ember-dark`, transition 0.2s ease
   - **Button focus:** 2px outline `--alpha-ember`, 2px offset
   - **Input focus:** border color changes to `--alpha-ember`
   - **Validation:** basic check for @ and a dot after it. On invalid submit, show error text below input: `Please enter a valid email address.` in `--alpha-ember`, Sora 400, 13px.
   - **On valid submit:** store email in state, transition to confirmation (Section A-alt). No backend.

5. **Trust micro-line** — 16px below CTA:
   ```
   Join founders and operators already on the list.
   ```
   Sora 400, `--alpha-stone`, 14px.

**Visual treatment:**
- Background: `--alpha-charcoal`
- Subtle radial gradient of `--alpha-ember-glow` behind the wordmark, centered, ~400px radius. Adds warmth without distraction.
- The ember "Al" in the wordmark has a gentle glow on page load — a soft text-shadow pulse in `--alpha-ember-glow`, 2s duration, CSS-only, settles to static.
- Subtle grain/noise texture at 2-3% opacity across the full hero (CSS SVG filter or pseudo-element — no image file).

---

### Section A-alt — Post-Submission Confirmation

When email is submitted, the CTA area (input + button + trust line) crossfades (0.3s ease) to:

```
✓  You're on the list.

We'll be in touch when we're ready. In the meantime — your competitors aren't waiting either.
```

- Checkmark "✓" in `--alpha-ember`, scales in from 0.5→1.0 with bounce easing (`cubic-bezier(0.175, 0.885, 0.32, 1.275)`, 0.4s)
- "You're on the list." — Sora 600, `--alpha-sand`, 20px
- Subtext — Sora 400, `--alpha-stone`, 16px
- No layout shift — confirmation occupies same vertical space as form

---

### Section B — The Problem

**Background: `--alpha-charcoal-light`** (subtle shift from hero).
**Content max-width: ~640px. Centered. Vertical padding: 120px desktop, 80px mobile.**

**Headline:**
```
Your competitors just got faster. Did you?
```
Sora 600, `--alpha-white`, 28-32px desktop.

**Three paragraphs:**

```
Somewhere right now, a company your size is using AI to do in a weekend what takes your team a month. They didn't hire more people. They didn't raise more money. They just moved first.
```

```
The gap isn't about tools — every tool is available to everyone. The gap is organizational. It's whether your people know how to think with AI, not just use it.
```

```
That's the difference between AI-equipped and AI-capable. And it's the difference between leading your market and scrambling to catch up.
```

Paragraphs: Sora 400, `--alpha-sand`, 17-18px, line-height 1.7. Spacing between paragraphs: 24-28px.

**Emphasis phrases** — render these in `--alpha-white` with Sora 600 (weight shift, not color change, against the sand body text):
- "do in a weekend what takes your team a month"
- "The gap is organizational"
- "AI-equipped and AI-capable"

**Animation:** content fades in + translates up 20px on entering viewport (IntersectionObserver, threshold 0.15).

---

### Section C — What's Coming

**Background: `--alpha-charcoal`** (back to primary dark).
**Content max-width: ~720px. Centered. Vertical padding: 120px desktop, 80px mobile.**

**Headline:**
```
What AlphaSMB delivers
```
Sora 600, `--alpha-white`, 28-32px. Margin-bottom 48px.

**Three value propositions** — vertical list with `--alpha-ember` left border (3-4px wide, 20px left padding). Items spaced 36-40px apart.

**Item 1:**
```
Label:  A proven playbook, not a pitch deck.
Body:   A phased transformation methodology built from real engagements — not theory.
```

**Item 2:**
```
Label:  Your highest-agency people, identified.
Body:   We surface who in your organization is ready to lead the change — before you have to guess.
```

**Item 3:**
```
Label:  Measurable progress, weekly.
Body:   A proprietary rubric benchmarks your adoption against peers so you always know where you stand.
```

Each item:
- Label: Sora 600, `--alpha-white`, 18-20px
- Body: Sora 400, `--alpha-stone`, 16px, 8px spacing below label

**Animation:** each item staggers fade-in by 150ms (first at threshold, second 150ms later, third 300ms later).

---

### Section D — Bottom CTA + Footer

**Background: `--alpha-charcoal-light`.**
**Content max-width: ~720px. Centered. Vertical padding: 120px top, 40px bottom.**

**Headline:**
```
Be the alpha.
```
Sora 700, 40-56px desktop, 32px mobile.

**Text treatment:** CSS gradient text from `--alpha-white` to `--alpha-ember`, angled ~135deg. Implementation:
```css
background: linear-gradient(135deg, var(--alpha-white), var(--alpha-ember));
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
background-clip: text;
```
Fallback for unsupported browsers: `color: var(--alpha-white)`.

**Email CTA** — same component as Section A. **Shared state:** if user already submitted in Section A, this shows the confirmation state. Use a single state variable / JS flag shared between both instances.

**Spacing:** 40px between headline and CTA.

**Footer line** — 80px below CTA:
```
© 2026 AlphaSMB. All rights reserved.
```
Sora 400, `--alpha-slate`, 13px. Centered.

**Animation:** section fades in on scroll like B and C.

---

## 3. Technical Requirements

### Stack

**Single HTML file** with embedded `<style>` and `<script>`. No framework, no build tools, no bundler, no npm.

OR a **single self-contained React component (.jsx)** if preferred — no external dependencies beyond React and Google Fonts.

### Responsive

| | Desktop (>768px) | Mobile (≤768px) |
|--|--|--|
| Wordmark | 56px | 36px |
| Headlines | 28-32px | 22-26px |
| Body text | 17-18px | 16-17px (never smaller) |
| CTA layout | Input + button inline | Stacked full-width |
| Section padding | 120px top/bottom | 80px top/bottom |
| Value prop spacing | 36-40px between | 28px between |

### Animations (3 categories — restrained)

**1. Page load (CSS only):**
```
0.0s — Wordmark fades in (opacity 0→1, 0.6s ease-out)
0.4s — "Al" ember glow pulses (text-shadow, 2s, settles)
0.8s — Tagline fades in
1.0s — Subtext fades in
1.2s — CTA fades in
```
Use `@keyframes` + `animation-delay`. No JS animation libraries.

**2. Scroll reveals (IntersectionObserver):**
- Sections B, C, D: fade in + translate up 20px
- `threshold: 0.15`
- Section C value props: stagger each by 150ms
- `transition: opacity 0.6s ease-out, transform 0.6s ease-out`

**3. Submit confirmation (CSS transitions):**
- Crossfade form → confirmation (0.3s ease)
- Checkmark bounce-in (0.4s, cubic-bezier overshoot)

**Disabled under `prefers-reduced-motion`:** all animations and transitions. Elements render immediately in final state.

### Performance

- Page weight under 200KB including fonts
- No image files — everything is CSS/HTML/text
- Google Fonts: Sora 400, 600, 700 only
- Target first contentful paint under 1.5s on 3G

### Accessibility

**Contrast ratios (pre-verified):**
- `--alpha-sand` on `--alpha-charcoal`: ~13.5:1 ✓ (AAA)
- `--alpha-stone` on `--alpha-charcoal`: ~4.6:1 ✓ (AA at 16px+)
- `--alpha-white` on `--alpha-ember` button: ~4.2:1 ✓ (AA for bold/large)
- `--alpha-ember` on `--alpha-charcoal`: ~4.0:1 ✓ (AA for large text / 56px wordmark)

**Requirements:**
- Email input: `<label>` element (visually hidden with sr-only class is fine)
- Wordmark `<div>`: `role="img"` and `aria-label="AlphaSMB"`
- Focus states: visible 2px `--alpha-ember` outline on input and button
- Semantic structure: `<header>` hero, `<main>` wrapping sections, `<section>` each block, `<footer>` bottom
- `prefers-reduced-motion`: disables all animations

---

## 4. Copy Reference (All Copy in One Place)

```
WORDMARK: AlphaSMB
  "Al" in ember, "phaSMB" in white, charcoal underline beneath "Al" only

HERO TAGLINE: AI transformation for the businesses that refuse to be left behind.

HERO SUBTEXT: We help SMB leadership teams build AI-capable organizations — not just AI-equipped employees.

CTA BUTTON: Get Early Access

CTA INPUT PLACEHOLDER: your@email.com

TRUST LINE: Join founders and operators already on the list.

VALIDATION ERROR: Please enter a valid email address.

POST-SUBMIT HEADLINE: You're on the list.

POST-SUBMIT SUBTEXT: We'll be in touch when we're ready. In the meantime — your competitors aren't waiting either.

PROBLEM HEADLINE: Your competitors just got faster. Did you?

PROBLEM P1: Somewhere right now, a company your size is using AI to do in a weekend what takes your team a month. They didn't hire more people. They didn't raise more money. They just moved first.

PROBLEM P2: The gap isn't about tools — every tool is available to everyone. The gap is organizational. It's whether your people know how to think with AI, not just use it.

PROBLEM P3: That's the difference between AI-equipped and AI-capable. And it's the difference between leading your market and scrambling to catch up.

VALUE HEADLINE: What AlphaSMB delivers

VALUE 1 LABEL: A proven playbook, not a pitch deck.
VALUE 1 BODY: A phased transformation methodology built from real engagements — not theory.

VALUE 2 LABEL: Your highest-agency people, identified.
VALUE 2 BODY: We surface who in your organization is ready to lead the change — before you have to guess.

VALUE 3 LABEL: Measurable progress, weekly.
VALUE 3 BODY: A proprietary rubric benchmarks your adoption against peers so you always know where you stand.

BOTTOM CTA HEADLINE: Be the alpha.

FOOTER: © 2026 AlphaSMB. All rights reserved.
```

---

## 5. Scope Boundaries — What This Page Is NOT

- No navigation bar
- No hamburger menu
- No pricing, testimonials, or team section
- No backend / API — email capture is front-end state only
- No analytics scripts
- No cookie banner
- No secondary pages
- No image assets to load
- No dark/light mode toggle — dark only

---

## 6. Definition of Done

1. Loads in under 2 seconds on mobile and desktop
2. Wordmark renders in HTML/CSS: "Al" in ember with white underline, "phaSMB" in white — no image
3. Email form validates, stores in state, transitions to confirmation
4. Both CTA instances share state — submit in one, confirmation shows in both
5. All four sections present with exact copy from Section 4
6. Key phrases in problem section emphasized (white + weight 600)
7. Value props have ember left-border accent
8. Page load animation sequence: staggered fade-ins + ember glow on "Al"
9. Scroll reveal animations on sections B, C, D with staggered value props
10. `prefers-reduced-motion` disables all animations
11. Fully responsive at 768px breakpoint
12. Contrast ratios pass WCAG AA
13. Email input has label, focus states visible, semantic HTML throughout
14. Looks intentionally designed — not default AI-generated aesthetics
