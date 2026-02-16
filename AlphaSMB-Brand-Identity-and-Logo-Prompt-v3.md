# AlphaSMB Logo — Brand Identity & Generation Prompt (v3)

**Document purpose:** Full brand direction, logo specs, and image generation prompts. Companion to `AlphaSMB-Coming-Soon-Spec-v3.md`.

---

## Brand Direction

### The Concept

The wordmark "AlphaSMB" uses **color isolation** to create the AI double-read. The first two letters "Al" are rendered in ember orange-red while the remaining letters "phaSMB" are warm charcoal black. A thin underline sits beneath "Al" only, in the same charcoal as the body text — grounding the highlighted letters without competing for attention.

The result: the eye catches "AI" first (because ember pops against charcoal), then reads the full word naturally. No slash, no extra symbol, no decoding required. It works in under a second.

### Why This Works Better Than Previous Versions

- **vs. AlphaSense's blue underline on dark text:** AlphaSMB does the inverse — colored text with a neutral underline. Visually distinct, no trademark risk.
- **vs. the slash treatment (v2):** No parsing problem. The slash required people to figure out what it meant. Color isolation is instant and intuitive.
- **vs. every blue AI logo in existence:** Ember orange-red in a category drowning in blue. Unmistakable in a LinkedIn feed.

---

## Color Palette

| Token | Hex | Role |
|-------|-----|------|
| `--alpha-charcoal` | #1C1917 | Primary text, underline, dark backgrounds |
| `--alpha-charcoal-light` | #292524 | Secondary dark backgrounds |
| `--alpha-ember` | #E8450D | "Al" text color, CTA buttons, primary accent |
| `--alpha-ember-dark` | #C53D0A | Hover/pressed states |
| `--alpha-ember-glow` | rgba(232, 69, 13, 0.20) | Subtle glow effects |
| `--alpha-sand` | #F5F0EB | Body text on dark, light backgrounds |
| `--alpha-stone` | #78716C | Secondary text |
| `--alpha-slate` | #44403C | Tertiary text, borders |
| `--alpha-white` | #FFFFFF | Bright text on dark |

---

## Typography

| Use | Font | Weight |
|-----|------|--------|
| Wordmark | Sora | 700 (Bold) |
| Headlines | Sora | 600 (SemiBold) |
| Body | Sora | 400 (Regular) |

Source: Google Fonts. Fallback: `Manrope, sans-serif`.

---

## Logo Construction

### How It Reads

```
AlphaSMB
^^
ember (#E8450D)    — these two letters
──                 — charcoal underline beneath "Al" only
  ^^^^^^
  charcoal (#1C1917) — the rest of the word
```

### Detailed Specifications

| Element | Spec |
|---------|------|
| Full text | AlphaSMB |
| "Al" color | #E8450D (ember) |
| "phaSMB" color | #1C1917 (charcoal) |
| Underline color | #1C1917 (charcoal — matches body text, NOT ember) |
| Underline width | Spans exactly the width of "Al" |
| Underline thickness | ~3-4px at display size (~5-6% of cap height) |
| Underline gap | ~4-6px below baseline (~8-10% of cap height) |
| Underline corners | Sharp / square (no border-radius) |
| Case | A uppercase, l lowercase, p-h-a lowercase, S-M-B uppercase |
| Font | Sora Bold 700 |
| Letter spacing | Tight, -1% to -2% tracking |
| Aspect ratio | ~4:1 horizontal |

### HTML/CSS Build (for the landing page)

```html
<div class="wordmark" role="img" aria-label="AlphaSMB">
  <span class="wordmark-al">Al</span><span class="wordmark-rest">phaSMB</span>
</div>
```

```css
.wordmark {
  font-family: 'Sora', 'Manrope', sans-serif;
  font-weight: 700;
  font-size: 56px;
  letter-spacing: -0.02em;
  line-height: 1;
  display: inline-block;
}

.wordmark-al {
  color: #E8450D;
  text-decoration: underline;
  text-decoration-color: #1C1917;
  text-underline-offset: 6px;
  text-decoration-thickness: 4px;
}

.wordmark-rest {
  color: #1C1917;
}
```

Note: `text-underline-offset` and `text-decoration-thickness` have strong modern browser support. For the landing page context this is perfectly fine. If exact pixel control is needed, use a pseudo-element `::after` border-bottom instead.

**On dark backgrounds** (the coming-soon page is dark), invert:
- "Al" stays `--alpha-ember` (no change)
- "phaSMB" becomes `--alpha-white` (#FFFFFF)
- Underline becomes `--alpha-white` (#FFFFFF)

### Variants to Create

1. **Light mode** (charcoal text on white/sand) — "Al" ember, "phaSMB" charcoal, underline charcoal
2. **Dark mode** (white text on charcoal) — "Al" ember, "phaSMB" white, underline white
3. **Favicon (16x16, 32x32, 512x512)** — just "Al" in ember on a charcoal square. No underline at favicon size (too small to render cleanly).
4. **Social avatar** — "Al" in ember centered on a charcoal rounded square. Generous padding. No underline.
5. **Monochrome** — full word in charcoal, underline in charcoal, no ember. For contexts where color isn't available.

---

## Primary Logo Generation Prompt

```
A clean, modern wordmark logo on a pure white background. The word "AlphaSMB" is rendered in a single horizontal line using a bold geometric sans-serif typeface with slightly rounded terminals, similar to Sora Bold or Manrope Bold.

The first two letters "Al" are rendered in a vivid deep orange-red ember color, hex #E8450D. The remaining letters "phaSMB" are rendered in warm charcoal black, hex #1C1917. A thin horizontal underline bar sits beneath only the "Al" letters, in the same charcoal color as the rest of the word, not in the orange-red. The underline spans exactly the width of the "Al" characters and sits a few pixels below the text baseline.

The overall effect is that "Al" pops in orange-red and reads as "AI" at first glance, while the full word reads naturally as "AlphaSMB". The charcoal underline anchors the highlighted letters without competing with the color.

Typography details: uppercase A, lowercase l, lowercase p-h-a, uppercase S-M-B. The typeface is geometric sans-serif with uniform stroke widths and slightly rounded stroke endings. Letter spacing is tight, approximately -1% tracking.

No icon, no symbol, no slash, no graphic element other than the underline bar. No tagline. No background pattern or texture. Pure white background with generous negative space. Professional corporate logo quality with vector-clean edges.
```

---

## Simplified Prompt (Midjourney / DALL-E)

```
Minimal wordmark logo on white background. The word "AlphaSMB" in bold geometric sans-serif. The first two letters "Al" are vivid orange-red, the rest "phaSMB" is charcoal black. A thin charcoal underline sits beneath only the "Al" letters. Clean modern typography, tight letter spacing, flat vector corporate logo style. No icon, no decoration, no tagline.
```

---

## Negative Prompt

```
No blue, no navy, no slash, no forward slash, no diagonal line, no gradients, no 3D effects, no shadows, no gloss, no reflections, no background color, no icon, no symbol, no shield, no emblem, no abstract shapes, no swoosh, no tagline, no multiple lines of text, no serif fonts, no handwritten fonts, no orange underline, no full-word underline, no watermark
```

---

## Style Modifiers by Tool

**Midjourney:** `--style raw --no background gradient blue slash --ar 4:1`

**Ideogram:** "Logo" or "Typography" mode, landscape, "Design" style

**DALL-E:** append "flat vector illustration, professional logo design, typography focused"

**Flux:** append "professional corporate logo, typography-driven, flat vector, minimal"

---

## Common Mistakes to Reject

- The underline is orange/ember (it should be charcoal — same color as "phaSMB")
- The underline extends under the entire word (should only be under "Al")
- All letters are the same color (the "Al" must be ember)
- A slash or diagonal element appears (no slash in this version)
- Wrong casing (all caps, or "SMB" lowercase)
- The underline is too thick or looks like a highlight bar
- Background has color or texture (should be pure white)

**Realistic expectation:** AI generators struggle with precise two-color typography. Plan on 5-10 generations to get close, then refine manually. The manual build in Figma or Canva using the specs above is a 5-minute job with Sora Bold from Google Fonts.
