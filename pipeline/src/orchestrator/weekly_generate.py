"""Weekly ad generation entry point.

Sequence:
  1. Load copy bank from disk
  2. Generate new ads via Claude API
  3. Validate against brand rules
  4. Publish to LinkedIn Testing Pool
  5. Store in database
  6. Generate and send report

Saves JSON checkpoint for resume on partial failure.
"""

import json
import sys
import traceback
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from src.config import load
from src.db import start_pipeline_run, complete_pipeline_run, insert_ads_batch
from src.generator.copy_loader import load as load_copy
from src.generator.ad_generator import generate_and_validate, save_ads
from src.linkedin.auth import LinkedInAuth
from src.linkedin.api_client import LinkedInAPIClient
from src.linkedin.publisher import publish_batch
from src.orchestrator.notifier import send_report


def run_weekly(cfg: dict | None = None) -> bool:
    """Execute the weekly ad generation pipeline.

    Returns:
        True on success, False on failure.
    """
    if cfg is None:
        cfg = load(require_linkedin=True)

    db_path = cfg["database"]["path"]
    count = cfg.get("generation", {}).get("ads_per_batch", 40)
    data_dir = Path(cfg["database"]["path"]).parent / "generated"
    run_id = start_pipeline_run(db_path, "weekly_generation")

    print(f"=== AlphaSMB Weekly Ad Generation — {date.today()} ===\n")

    try:
        # Step 1: Load copy bank
        print("Step 1: Loading copy bank...")
        assets = load_copy()
        print(
            f"  Hooks: {len(assets.approved_hooks)}  "
            f"Phrases: {len(assets.key_phrases)}  "
            f"Banned words: {len(assets.banned_words)}\n"
        )

        # Step 2-3: Generate and validate
        print(f"Step 2-3: Generating {count} ads via Claude API...")
        valid_ads, invalid_ads = generate_and_validate(cfg, assets=assets, count=count)
        print(f"  Valid: {len(valid_ads)}  Invalid: {len(invalid_ads)}")

        if invalid_ads:
            print("  Invalid ads (not published):")
            for ad in invalid_ads:
                print(f"    {ad.get('ad_id', '?')}: {ad.get('_errors', [])}")

        # Save all generated ads to disk (checkpoint)
        ads_path = save_ads(valid_ads, data_dir)
        print(f"  Saved to: {ads_path}\n")

        if invalid_ads:
            invalid_path = save_ads(invalid_ads, data_dir)
            print(f"  Invalid ads saved to: {invalid_path}")

        if not valid_ads:
            print("No valid ads generated. Stopping.")
            complete_pipeline_run(db_path, run_id, error="No valid ads generated")
            return False

        # Step 4: Publish to LinkedIn
        print(f"Step 4: Publishing {len(valid_ads)} ads to LinkedIn...")
        auth = LinkedInAuth(cfg)
        client = LinkedInAPIClient(auth, db_path)
        published, failed = publish_batch(client, valid_ads, cfg, db_path)
        print(f"  Published: {published}  Failed: {failed}\n")

        # Step 5: Store in database (publisher already handles individual inserts)

        # Step 6: Report
        report_lines = [
            f"Weekly Ad Generation Report — {date.today()}",
            f"{'='*50}",
            f"Generated: {len(valid_ads) + len(invalid_ads)}",
            f"Valid: {len(valid_ads)}",
            f"Invalid: {len(invalid_ads)}",
            f"Published: {published}",
            f"Failed: {failed}",
        ]

        if invalid_ads:
            report_lines.append("\nInvalid Ads:")
            for ad in invalid_ads:
                report_lines.append(f"  {ad.get('ad_id', '?')}: {ad.get('_errors', [])}")

        # Show warnings on valid ads
        warned = [a for a in valid_ads if a.get("_warnings")]
        if warned:
            report_lines.append("\nWarnings:")
            for ad in warned:
                report_lines.append(f"  {ad.get('ad_id', '?')}: {ad.get('_warnings', [])}")

        report = "\n".join(report_lines)
        print(report)

        send_report(report, cfg)

        complete_pipeline_run(
            db_path,
            run_id,
            ads_generated=published,
            report_path=str(ads_path),
        )

        print("\n=== Weekly generation complete ===")
        return True

    except Exception as e:
        error_msg = f"{type(e).__name__}: {e}\n{traceback.format_exc()}"
        print(f"\nGeneration pipeline failed: {error_msg}")

        complete_pipeline_run(db_path, run_id, error=error_msg)

        try:
            send_report(f"GENERATION PIPELINE ERROR:\n\n{error_msg}", cfg)
        except Exception:
            pass

        return False


def main():
    success = run_weekly()
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
