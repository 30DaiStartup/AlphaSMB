"""Load all brand docs and copy assets from disk into structured data.

Source files:
  context-docs/1-brand-voice.md       → voice rules, banned words/phrases
  context-docs/2-product-services.md  → service details, pricing
  context-docs/3-audience-personas.md → personas, pain points
  context-docs/4-credentials-proof.md → credentials, bios
  context-docs/5-linkedin-ad-copy-guide.md → ad frameworks, templates
  context-docs/6-copy-bank.md         → hooks, key phrases, headlines
  linkedin-content-choice-cascade.md  → 7 post hooks (merged into pool)
  website-copy-choice-cascade.md      → 4 new hooks + 8 new phrases
"""

import re
from dataclasses import dataclass, field
from pathlib import Path

# Project root (two levels up from this file)
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent


@dataclass
class CopyAssets:
    """Structured copy data extracted from all source files."""

    # Raw file contents (for Claude API prompt context)
    brand_voice_raw: str = ""
    product_services_raw: str = ""
    audience_personas_raw: str = ""
    credentials_raw: str = ""
    ad_copy_guide_raw: str = ""
    copy_bank_raw: str = ""

    # Extracted structured data
    banned_words: list[str] = field(default_factory=list)
    banned_phrases: list[str] = field(default_factory=list)
    approved_hooks: list[str] = field(default_factory=list)
    key_phrases: list[str] = field(default_factory=list)
    approved_ctas: list[str] = field(default_factory=list)
    voice_rules: list[str] = field(default_factory=list)


def _read_file(path: Path) -> str:
    """Read a file, return empty string if not found."""
    if path.exists():
        return path.read_text(encoding="utf-8")
    return ""


def _extract_banned_words(text: str) -> list[str]:
    """Extract banned words from '## Words to NEVER Use' section."""
    match = re.search(
        r"## Words to NEVER Use\s*\n(.+?)(?=\n## |\Z)",
        text,
        re.DOTALL,
    )
    if not match:
        return []

    line = match.group(1).strip()
    # Words are comma-separated on one or more lines
    words = [w.strip() for w in re.split(r",\s*", line) if w.strip()]
    return words


def _extract_banned_phrases(text: str) -> list[str]:
    """Extract banned phrases from '## Phrases to NEVER Use' section."""
    match = re.search(
        r"## Phrases to NEVER Use\s*\n(.+?)(?=\n## |\Z)",
        text,
        re.DOTALL,
    )
    if not match:
        return []

    phrases = []
    for line in match.group(1).strip().splitlines():
        line = line.strip()
        if line.startswith("- "):
            raw = line[2:].strip()
            # Handle the "Any sentence starting with..." special case first
            if raw.lower().startswith("any sentence starting with"):
                # Extract the pattern — e.g., 'As a...' (try curly then straight quotes)
                inner = re.search(r'[\u201c"](.+?)[\u201d"]', raw)
                if inner:
                    phrases.append(inner.group(1).rstrip("."))
            else:
                # Remove surrounding quotes (straight and curly)
                phrase = raw.strip('"').strip('\u201c').strip('\u201d')
                phrases.append(phrase.rstrip("."))
    return phrases


def _extract_hooks_from_copy_bank(text: str) -> list[str]:
    """Extract proven hooks from '## Proven LinkedIn Hooks' section."""
    match = re.search(
        r"## Proven LinkedIn Hooks\s*\n(.+?)(?=\n## |\n---|\Z)",
        text,
        re.DOTALL,
    )
    if not match:
        return []

    hooks = []
    for line in match.group(1).strip().splitlines():
        line = line.strip()
        if line.startswith("> "):
            hooks.append(line[2:].strip())
    return hooks


def _extract_key_phrases(text: str) -> list[str]:
    """Extract key phrases from '## Key Phrases Bank' section."""
    match = re.search(
        r"## Key Phrases Bank\s*\n(.+?)(?=\n## |\n---|\Z)",
        text,
        re.DOTALL,
    )
    if not match:
        return []

    phrases = []
    for line in match.group(1).strip().splitlines():
        line = line.strip()
        if line.startswith("- "):
            # Remove markdown and surrounding quotes
            phrase = line[2:].strip().strip('"').strip('"')
            if phrase:
                phrases.append(phrase)
    return phrases


def _extract_hooks_from_cascade(text: str) -> list[str]:
    """Extract hook lines from LinkedIn content choice cascade posts."""
    hooks = []
    # Find all code blocks (``` ... ```) — first line of each is the hook
    blocks = re.findall(r"```\n(.+?)\n", text)
    for block in blocks:
        line = block.strip()
        if line and not line.startswith("#") and len(line) > 10:
            hooks.append(line)
    return hooks


def _extract_website_cascade_hooks(text: str) -> list[str]:
    """Extract new hook lines from website copy choice cascade."""
    match = re.search(
        r"### New Hook Lines.*?\n(.+?)(?=\n### |\n---|\n## |\Z)",
        text,
        re.DOTALL,
    )
    if not match:
        return []

    hooks = []
    for line in match.group(1).strip().splitlines():
        line = line.strip()
        if line.startswith("- "):
            hook = line[2:].strip().strip('"').strip('"')
            if hook:
                hooks.append(hook)
    return hooks


def _extract_website_cascade_phrases(text: str) -> list[str]:
    """Extract new key phrases from website copy choice cascade."""
    match = re.search(
        r"### New Key Phrases.*?\n(.+?)(?=\n### |\n---|\n## |\Z)",
        text,
        re.DOTALL,
    )
    if not match:
        return []

    phrases = []
    for line in match.group(1).strip().splitlines():
        line = line.strip()
        if line.startswith("- "):
            phrase = line[2:].strip().strip('"').strip('"')
            if phrase:
                phrases.append(phrase)
    return phrases


def _extract_voice_rules(text: str) -> list[str]:
    """Extract voice rules from '## Voice Rules' section."""
    match = re.search(
        r"## Voice Rules\s*\n(.+?)(?=\n## |\Z)",
        text,
        re.DOTALL,
    )
    if not match:
        return []

    rules = []
    for line in match.group(1).strip().splitlines():
        line = line.strip()
        if line.startswith("- "):
            # Remove leading bullet and bold markers
            rule = line[2:].strip()
            rule = re.sub(r"\*\*(.+?)\*\*", r"\1", rule)
            rules.append(rule)
    return rules


def _extract_ctas(text: str) -> list[str]:
    """Extract approved CTAs from copy bank and ad guide."""
    ctas = []
    # Look for CTA sections
    for match in re.finditer(r"> (.+?\$500.*?)$", text, re.MULTILINE):
        ctas.append(match.group(1).strip())
    return list(set(ctas))


def load(project_root: Path | None = None) -> CopyAssets:
    """Load all copy source files and extract structured data.

    Args:
        project_root: Path to the alphasmb repo root. Auto-detected if None.

    Returns:
        CopyAssets with raw text and extracted structured data.
    """
    root = project_root or PROJECT_ROOT
    context = root / "context-docs"

    assets = CopyAssets()

    # Load raw files
    assets.brand_voice_raw = _read_file(context / "1-brand-voice.md")
    assets.product_services_raw = _read_file(context / "2-product-services.md")
    assets.audience_personas_raw = _read_file(context / "3-audience-personas.md")
    assets.credentials_raw = _read_file(context / "4-credentials-proof.md")
    assets.ad_copy_guide_raw = _read_file(context / "5-linkedin-ad-copy-guide.md")
    assets.copy_bank_raw = _read_file(context / "6-copy-bank.md")

    linkedin_cascade = _read_file(root / "linkedin-content-choice-cascade.md")
    website_cascade = _read_file(root / "website-copy-choice-cascade.md")

    # Extract structured data from brand voice
    assets.banned_words = _extract_banned_words(assets.brand_voice_raw)
    assets.banned_phrases = _extract_banned_phrases(assets.brand_voice_raw)
    assets.voice_rules = _extract_voice_rules(assets.brand_voice_raw)

    # Extract hooks from copy bank (9 proven hooks)
    assets.approved_hooks = _extract_hooks_from_copy_bank(assets.copy_bank_raw)

    # Merge hooks from LinkedIn cascade (7 post hooks)
    cascade_hooks = _extract_hooks_from_cascade(linkedin_cascade)
    for hook in cascade_hooks:
        if hook not in assets.approved_hooks:
            assets.approved_hooks.append(hook)

    # Merge hooks from website cascade (4 new hooks)
    website_hooks = _extract_website_cascade_hooks(website_cascade)
    for hook in website_hooks:
        if hook not in assets.approved_hooks:
            assets.approved_hooks.append(hook)

    # Extract key phrases from copy bank (10 phrases)
    assets.key_phrases = _extract_key_phrases(assets.copy_bank_raw)

    # Merge key phrases from website cascade (8 new phrases)
    website_phrases = _extract_website_cascade_phrases(website_cascade)
    for phrase in website_phrases:
        if phrase not in assets.key_phrases:
            assets.key_phrases.append(phrase)

    # Extract CTAs
    assets.approved_ctas = _extract_ctas(assets.copy_bank_raw)

    return assets
