# AlphaSMB — Section Layout Specs

Layout and visual treatment for each section across all pages. See `copy.md` for exact copy.

## Shared Components

### Navigation (all pages)
- Fixed at top, z-index 1000
- Background: `rgba(28, 25, 23, 0.95)` + `backdrop-filter: blur(10px)`
- Border-bottom: `1px solid rgba(68, 64, 60, 0.3)`
- Inner: max-width 1120px, height 64px, flex space-between
- Left: nav wordmark — Manrope 700, 22px, "Al" ember + "phaSMB" white
- Right: links (15px, sand) + CTA button (ember bg, 8px 20px padding, 6px radius)
- Active link: `aria-current="page"` → ember color
- Mobile (≤768px): hamburger toggle, slide-down menu

### Footer (all pages)
- Background: charcoal, border-top slate
- Centered, max-width 720px, padding 48px 24px
- Links row: 14px, sand, hover ember, gap 24px
- LinkedIn SVG icon: 24x24, stone color, hover ember
- Copyright + contact: 13px, slate

## Home Page Sections

### Hero (100vh, charcoal bg)
- Padding-top: 64px (nav offset)
- Centered, max-width 720px
- **Logo image:** 340px desktop, 240px mobile
  - `::before` radial gradient halo (sand @ 13% opacity)
  - Drop-shadow chain + ember glow pulse animation (2s, 0.4s delay)
- **Eyebrow:** Manrope 600, 13px, stone, uppercase, letter-spacing 0.12em, margin-top 24px
- **Headline:** Manrope 700, 42px desktop / 28px mobile, white, line-height 1.2
- **Subheadline:** 18px / 16px mobile, sand, line-height 1.6
- **CTA button:** btn--primary btn--large → 16px 40px padding
- **Credential bar:** 14px / 13px mobile, stone, line-height 1.5
- **Background effects:** ember radial glow (800px, centered) + SVG noise texture (3% opacity)
- **Load animation:** staggered heroFadeIn — logo 0s, eyebrow 0.6s, headline 0.8s, subheadline 1.0s, CTA 1.2s, credentials 1.4s

### Problem (charcoal-light bg)
- Max-width 720px, padding 120px / 80px mobile
- Three blocks with 4px ember left-border, 20px left padding
- Lead: Manrope 600, 18px, white
- Body: 16px, sand, line-height 1.7
- Scroll reveal with stagger (0ms / 150ms / 300ms)

### Strategy Manifesto (charcoal bg, slate borders top/bottom)
- Padding: 140px / 100px mobile
- Max-width 720px (section__inner)
- Headline: Manrope 700, 36px / 26px mobile, white, max-width 640px
- Body: 18px / 16px mobile, sand, line-height 1.8, paragraph spacing 20px, max-width 640px
- No CTA — pure positioning moment
- Uses `.reveal` for scroll animation

### What You Get (charcoal bg)
- Max-width 960px
- Centered headline
- Two-column card grid (stack on mobile)
- Cards: charcoal-light bg, 1px slate border, 8px radius, 32px padding
- Card hover: ember border-color
- Price: Manrope 700, 28px, ember
- List items: 15px with ember checkmark
- CTA buttons: primary (strategy) or outline (transformation)

### Social Proof (charcoal-light bg)
- Centered headline
- Quote block: 4px ember left-border, 24px left padding
- Quote text: 18px, sand, italic, line-height 1.7
- Attribution: 15px, stone

### Methodology (charcoal bg)
- Four numbered steps, flex layout (number + content)
- Numbers: Manrope 700, 48px / 36px mobile, ember
- Title: Manrope 600, 20px, white
- Body: 16px, sand, line-height 1.6
- Stagger: 0ms / 150ms / 300ms / 450ms

### Bottom CTA (charcoal-light bg)
- Centered, max-width 720px, padding 120px / 80px mobile
- Headline: Manrope 700, 48px / 32px mobile, gradient text white→ember (135deg)
- Subtext: 18px, sand, margin-bottom 32px
- CTA: btn--primary btn--large

## Strategy Call Page

### Page Hero (charcoal bg, not full-vh)
- Padding: 140px top / 120px mobile, 80px / 60px bottom
- Subtle ember radial glow (600px, centered at 30%)
- Headline: 38px / 28px mobile
- Price: 32px, ember
- Description: 18px, sand

### Time Blocks
- 4-column grid (2-col tablet, 1-col phone)
- Each: charcoal-light bg, 1px slate border, 8px radius, centered text
- Time: Manrope 700, 20px, ember
- Label: Manrope 600, 15px, white

### Deliverables
- Checklist with ember checkmarks (18px, 700 weight)
- Items: 16px, sand, line-height 1.6
- **Strategy bridge** between deliverables summary and checklist: 17px italic, ember left-border (4px), 20px left padding, 32px vertical margin

### Why a Strategy Call (charcoal-light bg)
- Placed between "Is this right for you?" and FAQ
- Max-width 720px
- Headline: section-headline (Manrope 600, 30px)
- Body: philosophy-text style (17px, sand, line-height 1.7)
- Emphasis closing line in bold white
- CTA: btn--primary btn--large → /book
- Margin-top 40px on CTA wrapper

### Who For / Not For
- Two-column grid (stack mobile)
- "For" list: green checkmarks (#22c55e)
- "Not for" list: ember X marks

### FAQ Accordion
- Items separated by 1px slate border
- Question: Manrope 600, 16px, white, full-width button
- "+" icon: 24px, ember, rotates 45° when open
- Answer: max-height transition (0.3s), 15px sand text

## About Page

### Intro + Headshot
- Two-column grid: text (1fr) + headshot (300px)
- Mobile: stack, headshot 240px centered
- Headshot: 8px radius, 1:1 aspect, object-fit cover
- Text: 17px, sand, line-height 1.7

### Credentials
- List with 4px ember left-border, 20px left padding
- Items: 16px, sand; labels bold white

### Philosophy
- 17px, sand, line-height 1.7
- Two paragraphs

## Book Page

### Intro
- Centered, max-width 640px
- Headline: 32px, white
- Price: 24px, ember
- Prep note: 14px, stone

### Cal.com Embed
- Max-width 720px, min-height 600px
- `<cal-inline-widget>` with dark theme config

## Privacy Page

- Content page layout: padding-top 120px
- Max-width 720px
- H1: 36px / 28px mobile, white
- H2: 22px, white, margin-top 40px
- H3: 18px, white
- Body: 16px, sand, line-height 1.7
- Lists: ember bullet points
- Links: ember, underlined
- Table: full-width, slate borders, 15px text

## Responsive Breakpoints

- **768px:** Primary breakpoint — card grids stack, nav goes hamburger, font sizes reduce, padding reduces
- **480px:** Time blocks go single-column

## Reduced Motion

All animations disabled: hero fade-in, ember glow, scroll reveal, FAQ transition, nav toggle transition
