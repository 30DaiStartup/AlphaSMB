"""Tests for copy loader — file loading and data extraction."""

import pytest
from pathlib import Path

from src.generator.copy_loader import (
    load,
    _extract_banned_words,
    _extract_banned_phrases,
    _extract_hooks_from_copy_bank,
    _extract_key_phrases,
    _extract_website_cascade_hooks,
    _extract_website_cascade_phrases,
    _extract_voice_rules,
    PROJECT_ROOT,
)


# --- Unit tests for extraction functions ---

class TestExtractBannedWords:
    def test_extracts_words(self):
        text = """## Words to NEVER Use

leverage, synergy, unlock value, cutting-edge, disrupt

## Next Section
"""
        words = _extract_banned_words(text)
        assert "leverage" in words
        assert "synergy" in words
        assert "cutting-edge" in words

    def test_empty_section(self):
        text = "## Some Other Section\n\ntext here"
        words = _extract_banned_words(text)
        assert words == []


class TestExtractBannedPhrases:
    def test_extracts_phrases(self):
        text = """## Phrases to NEVER Use

- "Excited to announce..."
- "Dive into..."
- Any sentence starting with "As a..."

## Next Section
"""
        phrases = _extract_banned_phrases(text)
        assert "Excited to announce" in phrases
        assert "Dive into" in phrases
        assert "As a" in phrases

    def test_empty_section(self):
        phrases = _extract_banned_phrases("no section here")
        assert phrases == []


class TestExtractHooks:
    def test_extracts_hooks(self):
        text = """## Proven LinkedIn Hooks

These hooks have been written for the AlphaSMB voice:

> I built something. Took me 20 years to be ready.

> Every AI tool on the market is available.

---
"""
        hooks = _extract_hooks_from_copy_bank(text)
        assert len(hooks) == 2
        assert "I built something. Took me 20 years to be ready." in hooks

    def test_no_hooks(self):
        hooks = _extract_hooks_from_copy_bank("no hooks here")
        assert hooks == []


class TestExtractKeyPhrases:
    def test_extracts_phrases(self):
        text = """## Key Phrases Bank

Reuse these exact phrases:

- "AI-capable organizations, not just AI-equipped employees"
- "The gap isn't about tools. It's about your organization."
- "Methodology built inside a real company, translated for SMBs"

---
"""
        phrases = _extract_key_phrases(text)
        assert len(phrases) == 3
        assert "AI-capable organizations, not just AI-equipped employees" in phrases


class TestExtractWebsiteCascadeHooks:
    def test_extracts_hooks(self):
        text = """### New Hook Lines (For LinkedIn / Ads)

- "Most leaders put AI in the wrong strategic box."
- "AI doesn't improve your current strategy. It makes a new one possible."

---
"""
        hooks = _extract_website_cascade_hooks(text)
        assert len(hooks) == 2
        assert "Most leaders put AI in the wrong strategic box." in hooks


class TestExtractWebsiteCascadePhrases:
    def test_extracts_phrases(self):
        text = """### New Key Phrases

- "AI isn't a tool decision. It's a strategy decision."
- "New capabilities change where you can compete."
- "You can't strategy-deck your way into a new future."

---
"""
        phrases = _extract_website_cascade_phrases(text)
        assert len(phrases) == 3


class TestExtractVoiceRules:
    def test_extracts_rules(self):
        text = """## Voice Rules

- **First person.** Always "I" — never "we."
- **Peer-to-peer.** Write like a peer.
- **Specific over generic.** Use details.
"""
        rules = _extract_voice_rules(text)
        assert len(rules) == 3
        assert any("First person" in r for r in rules)


# --- Integration test using real files ---

class TestFullLoad:
    """Test loading from the actual project files."""

    def test_load_from_project(self):
        """Verify the loader can read the actual project files."""
        context_dir = PROJECT_ROOT / "context-docs"
        if not context_dir.exists():
            pytest.skip("context-docs not found (not running from project root)")

        assets = load(PROJECT_ROOT)

        # Verify raw files loaded
        assert len(assets.brand_voice_raw) > 100
        assert len(assets.copy_bank_raw) > 100

        # Verify structured data extracted
        assert len(assets.banned_words) >= 10
        assert len(assets.banned_phrases) >= 5
        assert len(assets.approved_hooks) >= 9  # At least the 9 from copy bank
        assert len(assets.key_phrases) >= 10  # At least 10 from copy bank
        assert len(assets.voice_rules) >= 5

    def test_no_duplicate_hooks(self):
        """Hooks should be deduplicated across sources."""
        context_dir = PROJECT_ROOT / "context-docs"
        if not context_dir.exists():
            pytest.skip("context-docs not found")

        assets = load(PROJECT_ROOT)
        assert len(assets.approved_hooks) == len(set(assets.approved_hooks))

    def test_no_duplicate_phrases(self):
        """Key phrases should be deduplicated across sources."""
        context_dir = PROJECT_ROOT / "context-docs"
        if not context_dir.exists():
            pytest.skip("context-docs not found")

        assets = load(PROJECT_ROOT)
        assert len(assets.key_phrases) == len(set(assets.key_phrases))
