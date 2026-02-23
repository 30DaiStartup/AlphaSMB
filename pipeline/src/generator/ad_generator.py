"""Generate ad variations via Claude API.

Calls Claude with the full brand context + generation matrix,
parses the JSON response, and saves to disk.
"""

import json
import re
import time
from datetime import datetime
from pathlib import Path

import anthropic

from src.generator.copy_loader import CopyAssets, load as load_copy
from src.generator.prompt_builder import build_system_prompt, build_user_prompt
from src.generator.validator import validate_ad, ValidationResult


def _extract_json(text: str) -> list[dict]:
    """Extract JSON array from Claude's response, handling markdown fences."""
    # Try direct parse first
    text = text.strip()
    if text.startswith("["):
        return json.loads(text)

    # Try extracting from markdown code block
    match = re.search(r"```(?:json)?\s*\n(\[.+?\])\s*\n```", text, re.DOTALL)
    if match:
        return json.loads(match.group(1))

    # Try finding array anywhere in the text
    match = re.search(r"(\[[\s\S]*\])", text)
    if match:
        return json.loads(match.group(1))

    raise ValueError("Could not extract JSON array from response")


def generate_ads(
    cfg: dict,
    assets: CopyAssets | None = None,
    count: int = 40,
    max_retries: int = 2,
) -> list[dict]:
    """Generate ad variations using Claude API.

    Args:
        cfg: Pipeline config dict.
        assets: Pre-loaded copy assets. Loaded from disk if None.
        count: Number of ads to generate.
        max_retries: Retries on parse failure.

    Returns:
        List of ad dicts (validated).
    """
    if assets is None:
        assets = load_copy()

    api_key = cfg["claude"]["api_key"]
    model = cfg["claude"].get("model", "claude-sonnet-4-5-20250929")

    client = anthropic.Anthropic(api_key=api_key)
    system_prompt = build_system_prompt(assets)
    user_prompt = build_user_prompt(assets, count=count)

    for attempt in range(max_retries + 1):
        try:
            message = client.messages.create(
                model=model,
                max_tokens=8192,
                system=system_prompt,
                messages=[{"role": "user", "content": user_prompt}],
            )

            response_text = message.content[0].text
            ads = _extract_json(response_text)

            if not isinstance(ads, list):
                raise ValueError(f"Expected list, got {type(ads)}")

            return ads

        except (json.JSONDecodeError, ValueError) as e:
            if attempt < max_retries:
                print(f"Parse error (attempt {attempt + 1}): {e}. Retrying...")
                time.sleep(2)
                continue
            raise ValueError(f"Failed to parse ad JSON after {max_retries + 1} attempts: {e}")


def generate_and_validate(
    cfg: dict,
    assets: CopyAssets | None = None,
    count: int = 40,
) -> tuple[list[dict], list[dict]]:
    """Generate ads and split into valid/invalid based on brand rules.

    Returns:
        (valid_ads, invalid_ads) — invalid_ads include validation errors.
    """
    if assets is None:
        assets = load_copy()

    ads = generate_ads(cfg, assets=assets, count=count)

    valid = []
    invalid = []

    for ad in ads:
        result = validate_ad(ad, assets)
        if result.passed:
            ad["_warnings"] = result.warnings
            valid.append(ad)
        else:
            ad["_errors"] = result.errors
            ad["_warnings"] = result.warnings
            invalid.append(ad)

    return valid, invalid


def save_ads(ads: list[dict], output_dir: str | Path) -> Path:
    """Save generated ads to a timestamped JSON file.

    Returns:
        Path to the saved file.
    """
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    output_path = output_dir / f"generated_ads_{timestamp}.json"

    with open(output_path, "w") as f:
        json.dump(ads, f, indent=2)

    return output_path
