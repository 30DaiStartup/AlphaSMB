"""Programmatic brand voice enforcement for generated ads.

Validates every ad against AlphaSMB brand rules:
  - Character limits (headline ≤70, intro ≤150)
  - Banned words (regex word-boundary, case-insensitive)
  - Banned phrases (substring, case-insensitive)
  - No "As a..." sentences
  - No exclamation marks
  - No emojis
  - No "we"/"the team" (first person only)
  - Valid CTA type
  - Correct destination URL
  - Warning if $500 not visible
"""

import re
from dataclasses import dataclass, field

from src.generator.copy_loader import CopyAssets

VALID_CTA_TYPES = {"LEARN_MORE", "BOOK_NOW"}
VALID_DESTINATION_URLS = {
    "https://alphasmb.com/assessment",
    "https://alphasmb.com/book",
}
HEADLINE_MAX = 70
INTRO_TEXT_MAX = 150

# Emoji regex — covers most common emoji ranges
EMOJI_RE = re.compile(
    "["
    "\U0001F600-\U0001F64F"  # emoticons
    "\U0001F300-\U0001F5FF"  # symbols & pictographs
    "\U0001F680-\U0001F6FF"  # transport & map
    "\U0001F1E0-\U0001F1FF"  # flags
    "\U00002702-\U000027B0"  # dingbats
    "\U000024C2-\U0001F251"  # enclosed characters
    "\U0001F900-\U0001F9FF"  # supplemental symbols
    "\U0001FA00-\U0001FA6F"  # chess symbols
    "\U0001FA70-\U0001FAFF"  # symbols extended-A
    "\U00002600-\U000026FF"  # misc symbols
    "]"
)


@dataclass
class ValidationResult:
    """Result of validating a single ad."""

    ad_id: str = ""
    passed: bool = True
    errors: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)

    def add_error(self, msg: str):
        self.errors.append(msg)
        self.passed = False

    def add_warning(self, msg: str):
        self.warnings.append(msg)


def _check_headline_length(ad: dict, result: ValidationResult) -> None:
    headline = ad.get("headline", "")
    if len(headline) > HEADLINE_MAX:
        result.add_error(
            f"Headline too long: {len(headline)} chars (max {HEADLINE_MAX}): "
            f"'{headline[:80]}...'"
        )
    if not headline:
        result.add_error("Headline is empty")


def _check_intro_length(ad: dict, result: ValidationResult) -> None:
    intro = ad.get("intro_text", "")
    if len(intro) > INTRO_TEXT_MAX:
        result.add_error(
            f"Intro text too long: {len(intro)} chars (max {INTRO_TEXT_MAX}): "
            f"'{intro[:80]}...'"
        )
    if not intro:
        result.add_error("Intro text is empty")


def _check_banned_words(ad: dict, assets: CopyAssets, result: ValidationResult) -> None:
    """Check all text fields for banned words (word-boundary, case-insensitive)."""
    all_text = " ".join([
        ad.get("headline", ""),
        ad.get("intro_text", ""),
        ad.get("body_text", ""),
    ])

    for word in assets.banned_words:
        # Word boundary match, case insensitive
        pattern = re.compile(r"\b" + re.escape(word) + r"\b", re.IGNORECASE)
        if pattern.search(all_text):
            result.add_error(f"Banned word found: '{word}'")


def _check_banned_phrases(ad: dict, assets: CopyAssets, result: ValidationResult) -> None:
    """Check all text fields for banned phrases (substring, case-insensitive)."""
    all_text = " ".join([
        ad.get("headline", ""),
        ad.get("intro_text", ""),
        ad.get("body_text", ""),
    ])
    all_text_lower = all_text.lower()

    for phrase in assets.banned_phrases:
        if phrase.lower() in all_text_lower:
            result.add_error(f"Banned phrase found: '{phrase}'")


def _check_as_a_sentences(ad: dict, result: ValidationResult) -> None:
    """No sentences starting with 'As a...'."""
    all_text = " ".join([
        ad.get("headline", ""),
        ad.get("intro_text", ""),
        ad.get("body_text", ""),
    ])

    # Match "As a" at start of sentence (after period, newline, or start)
    if re.search(r"(?:^|[.!?]\s+)As a\b", all_text, re.IGNORECASE | re.MULTILINE):
        result.add_error("Contains a sentence starting with 'As a...'")


def _check_exclamation_marks(ad: dict, result: ValidationResult) -> None:
    all_text = " ".join([
        ad.get("headline", ""),
        ad.get("intro_text", ""),
        ad.get("body_text", ""),
    ])

    if "!" in all_text:
        result.add_error("Contains exclamation mark(s)")


def _check_emojis(ad: dict, result: ValidationResult) -> None:
    all_text = " ".join([
        ad.get("headline", ""),
        ad.get("intro_text", ""),
        ad.get("body_text", ""),
    ])

    if EMOJI_RE.search(all_text):
        result.add_error("Contains emoji(s)")


def _check_first_person(ad: dict, result: ValidationResult) -> None:
    """Must use 'I', never 'we' or 'the team'."""
    all_text = " ".join([
        ad.get("headline", ""),
        ad.get("intro_text", ""),
        ad.get("body_text", ""),
    ])

    # Check for "we" as a standalone word (not in "between", "power", etc.)
    if re.search(r"\bwe\b", all_text, re.IGNORECASE):
        # Allow "we" inside customer quotes
        # Simple heuristic: if it appears outside quotes, flag it
        # Remove quoted content first
        unquoted = re.sub(r'"[^"]*"', "", all_text)
        unquoted = re.sub(r"'[^']*'", "", unquoted)
        if re.search(r"\bwe\b", unquoted, re.IGNORECASE):
            result.add_error("Uses 'we' — must use first person 'I' only")

    if re.search(r"\bthe team\b", all_text, re.IGNORECASE):
        result.add_error("Uses 'the team' — must use first person 'I' only")


def _check_cta(ad: dict, result: ValidationResult) -> None:
    cta = ad.get("cta_type", "")
    if cta not in VALID_CTA_TYPES:
        result.add_error(
            f"Invalid CTA type: '{cta}'. Must be one of: {VALID_CTA_TYPES}"
        )


def _check_destination_url(ad: dict, result: ValidationResult) -> None:
    url = ad.get("destination_url", "")
    if url not in VALID_DESTINATION_URLS:
        result.add_error(
            f"Invalid destination URL: '{url}'. Must be one of: {VALID_DESTINATION_URLS}"
        )


def _check_price_visible(ad: dict, result: ValidationResult) -> None:
    """Warning (not error) if $500 not visible in the ad."""
    all_text = " ".join([
        ad.get("headline", ""),
        ad.get("intro_text", ""),
        ad.get("body_text", ""),
    ])

    if "$500" not in all_text:
        result.add_warning("$500 price not visible in ad copy")


def _check_required_fields(ad: dict, result: ValidationResult) -> None:
    """Ensure all required fields are present."""
    required = ["ad_id", "headline", "intro_text", "cta_type", "destination_url"]
    for field_name in required:
        if not ad.get(field_name):
            result.add_error(f"Missing required field: '{field_name}'")


def validate_ad(ad: dict, assets: CopyAssets) -> ValidationResult:
    """Run all validation checks on a single ad.

    Args:
        ad: Ad dict with headline, intro_text, body_text, etc.
        assets: Copy assets with banned words/phrases.

    Returns:
        ValidationResult with errors and warnings.
    """
    result = ValidationResult(ad_id=ad.get("ad_id", "unknown"))

    _check_required_fields(ad, result)
    _check_headline_length(ad, result)
    _check_intro_length(ad, result)
    _check_banned_words(ad, assets, result)
    _check_banned_phrases(ad, assets, result)
    _check_as_a_sentences(ad, result)
    _check_exclamation_marks(ad, result)
    _check_emojis(ad, result)
    _check_first_person(ad, result)
    _check_cta(ad, result)
    _check_destination_url(ad, result)
    _check_price_visible(ad, result)

    return result


def validate_batch(ads: list[dict], assets: CopyAssets) -> list[ValidationResult]:
    """Validate a batch of ads. Returns list of results."""
    return [validate_ad(ad, assets) for ad in ads]
