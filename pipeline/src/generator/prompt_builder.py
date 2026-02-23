"""Build Claude API prompts for ad generation.

Constructs:
  - System prompt: all 6 context docs concatenated with section headers
  - User prompt: generation matrix, output schema, constraints
"""

from src.generator.copy_loader import CopyAssets

GENERATION_MATRIX = """
## Generation Matrix

Generate ads across these dimensions:

### Hook Types (5)
1. **Contrarian** — Challenge a common belief ("Most AI consultants sell you tools. That's the problem.")
2. **Pattern Interrupt** — Unexpected stat or observation ("I've watched 6-figure AI rollouts fail in 30 days.")
3. **Audience Callout** — Name the reader directly ("If you're an SMB leader who bought ChatGPT licenses...")
4. **Specific Number** — Lead with a concrete stat ("80% of employees stop using AI tools within 30 days.")
5. **Question** — Trigger recognition ("Why does every AI tool rollout start with excitement and end with silence?")

### Template Frameworks (3)
1. **Problem-Solution** — Pain point → failed approach → what's needed → AlphaSMB → CTA with price
2. **Social Proof** — Credibility marker → observation/result → differentiation → CTA
3. **Direct Offer** — "One hour. $500. Six deliverables." → list → who it's for → CTA

### Target Personas (2)
1. **CEO/Founder** — Cares about competitive position, ROI, not wasting money. Says "We bought ChatGPT licenses but nobody's using them."
2. **COO/VP Ops** — Cares about adoption, implementation. Says "We tried AI tools and it didn't stick."

### Pain Points for Variation (4)
1. **Left behind** — Competitors adopting AI faster
2. **Wasted spend** — Money on tools nobody uses
3. **Past failure** — Tried AI, didn't work (organizational problem, not tech)
4. **Overwhelm** — Too many options, can't tell hype from real

Base matrix: 5 hooks x 3 templates x 2 personas = 30 ads
Plus 10+ pain-point variations = 40+ total ads
"""

OUTPUT_SCHEMA = """
## Output Format

Return a JSON array of ad objects. Each ad MUST follow this exact schema:

```json
[
  {
    "ad_id": "string — unique ID like 'contrarian-ps-ceo-01'",
    "headline": "string — max 70 characters",
    "intro_text": "string — max 150 characters (visible before 'see more')",
    "body_text": "string — full ad body (appears after 'see more')",
    "cta_type": "LEARN_MORE or BOOK_NOW",
    "destination_url": "https://alphasmb.com/assessment",
    "persona_target": "ceo_founder or coo_vp_ops",
    "template_type": "problem_solution or social_proof or direct_offer",
    "hook_category": "contrarian or pattern_interrupt or audience_callout or specific_number or question"
  }
]
```
"""


def build_system_prompt(assets: CopyAssets) -> str:
    """Build system prompt with all context docs."""
    sections = [
        ("BRAND VOICE & TONE", assets.brand_voice_raw),
        ("PRODUCTS & SERVICES", assets.product_services_raw),
        ("TARGET AUDIENCE & PERSONAS", assets.audience_personas_raw),
        ("CREDENTIALS & PROOF POINTS", assets.credentials_raw),
        ("LINKEDIN & AD COPY GUIDE", assets.ad_copy_guide_raw),
        ("APPROVED COPY BANK", assets.copy_bank_raw),
    ]

    parts = [
        "You are a direct-response copywriter for AlphaSMB, an AI transformation "
        "consultancy for SMBs. You write LinkedIn ad copy that follows strict brand "
        "voice rules. You never deviate from the approved voice, words, or style.\n\n"
        "Below is the complete brand and copy reference. Study it carefully — every "
        "ad you generate must be consistent with these documents.\n"
    ]

    for title, content in sections:
        if content:
            parts.append(f"\n{'='*60}\n{title}\n{'='*60}\n\n{content}")

    return "\n".join(parts)


def build_user_prompt(assets: CopyAssets, count: int = 40) -> str:
    """Build user prompt with generation matrix, constraints, and output schema."""

    banned_words_str = ", ".join(assets.banned_words) if assets.banned_words else "(see brand voice doc)"
    banned_phrases_str = "\n".join(f"  - {p}" for p in assets.banned_phrases) if assets.banned_phrases else "(see brand voice doc)"
    hooks_str = "\n".join(f"  - {h}" for h in assets.approved_hooks) if assets.approved_hooks else "(see copy bank)"
    phrases_str = "\n".join(f"  - {p}" for p in assets.key_phrases) if assets.key_phrases else "(see copy bank)"

    return f"""Generate exactly {count} LinkedIn ad variations for AlphaSMB.

{GENERATION_MATRIX}

## Approved Hooks (use as seeds — remix and adapt, don't copy verbatim):
{hooks_str}

## Approved Key Phrases (weave these into ads naturally):
{phrases_str}

## CRITICAL CONSTRAINTS — Every ad MUST follow ALL of these:

1. **First person only.** Always "I" — NEVER "we" or "the team."
2. **Headline max 70 characters.** Count carefully.
3. **Intro text max 150 characters.** This is what shows before "see more."
4. **BANNED WORDS (never use):** {banned_words_str}
5. **BANNED PHRASES (never use):**
{banned_phrases_str}
6. **No exclamation marks.** Not even one.
7. **No emojis.** None.
8. **No sentences starting with "As a..."**
9. **Price must be visible.** "$500" must appear in every ad.
10. **CTA type:** Either "LEARN_MORE" or "BOOK_NOW"
11. **Destination URL:** Always "https://alphasmb.com/assessment"
12. **Tone:** Direct, conversational, peer-to-peer. Like an operator talking to another operator. Not a vendor pitching a client.
13. **Specificity:** Use real details (Aurora WDC, Fortune 1000, 80% stat, six deliverables). No vague claims.
14. **"AlphaSMB" capitalization:** Always one word — AlphaSMB (capital A, S, M, B).

## What makes great AlphaSMB ad copy:
- Names the pain FIRST, then introduces the solution
- Uses the reader's own language ("We bought ChatGPT licenses but nobody's using them")
- Leads with recognition, not persuasion
- Short sentences mixed with longer ones — rhythm matters
- Feels like a transcript, not a brochure
- Lets credentials speak through context, not assertion

{OUTPUT_SCHEMA}

Generate exactly {count} ads now. Return ONLY the JSON array — no other text.
"""
