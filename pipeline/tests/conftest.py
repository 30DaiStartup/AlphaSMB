"""Shared test fixtures."""

import os
import sys
import tempfile
from pathlib import Path

import pytest

# Add pipeline root to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.generator.copy_loader import CopyAssets


@pytest.fixture
def sample_assets():
    """Minimal CopyAssets for testing."""
    return CopyAssets(
        banned_words=[
            "leverage", "synergy", "unlock value", "cutting-edge", "disrupt",
            "revolutionize", "paradigm shift", "best-in-class", "delve",
            "game-changer", "comprehensive", "holistic", "next-level",
            "scalable solutions", "innovative", "empower",
        ],
        banned_phrases=[
            "Excited to announce",
            "Dive into",
            "It's important to note",
            "In today's rapidly evolving",
            "Harness the power of",
            "Unlock your potential",
            "Thrilled to share",
            "As a",
        ],
        approved_hooks=[
            "80% of employees stop using AI tools within 30 days. The tools aren't the problem.",
            "Every AI tool on the market is available to your competitors for the same price you'd pay.",
        ],
        key_phrases=[
            "AI-capable organizations, not just AI-equipped employees",
            "Fortune 1000 methodology at SMB prices",
        ],
    )


@pytest.fixture
def valid_ad():
    """A valid ad that passes all validation."""
    return {
        "ad_id": "test-ad-01",
        "headline": "AI Strategy for SMB Leaders — $500",
        "intro_text": "80% of employees stop using AI tools within 30 days.",
        "body_text": "I help SMB leadership teams build AI-capable organizations. $500 strategy call.",
        "cta_type": "LEARN_MORE",
        "destination_url": "https://alphasmb.com/assessment",
        "persona_target": "ceo_founder",
        "template_type": "problem_solution",
        "hook_category": "specific_number",
    }


@pytest.fixture
def temp_db():
    """Temporary SQLite database for testing."""
    from src.db import init_db

    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as f:
        db_path = f.name

    init_db(db_path)
    yield db_path

    os.unlink(db_path)
