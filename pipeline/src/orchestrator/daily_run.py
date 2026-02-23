"""Daily pipeline entry point.

Sequence:
  1. Refresh OAuth token
  2. Pull yesterday's metrics from LinkedIn
  3. Analyze all active ads (loser/winner identification)
  4. Apply safety checks
  5. Pause losers, promote winners
  6. Generate daily report
  7. Send report via email/Slack

Full error handling — logs failures to DB and sends alert on error.
"""

import sys
import traceback
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from src.config import load
from src.db import start_pipeline_run, complete_pipeline_run
from src.linkedin.auth import LinkedInAuth
from src.linkedin.api_client import LinkedInAPIClient
from src.linkedin.reporter import pull_daily_metrics
from src.linkedin.manager import execute_decisions
from src.analyzer.performance import analyze_all
from src.analyzer.report_builder import build_report, save_report
from src.orchestrator.notifier import send_report


def run_daily(cfg: dict | None = None) -> bool:
    """Execute the full daily pipeline.

    Returns:
        True on success, False on failure.
    """
    if cfg is None:
        cfg = load(require_linkedin=True)

    db_path = cfg["database"]["path"]
    run_id = start_pipeline_run(db_path, "daily_analysis")

    print(f"=== AlphaSMB Daily Pipeline — {date.today()} ===\n")

    try:
        # Step 1: Auth
        print("Step 1: Refreshing OAuth token...")
        auth = LinkedInAuth(cfg)
        auth.get_token()
        print("  Token valid.\n")

        client = LinkedInAPIClient(auth, db_path)

        # Step 2: Pull metrics
        print("Step 2: Pulling yesterday's metrics...")
        metrics_count = pull_daily_metrics(client, cfg, db_path)
        print(f"  Stored metrics for {metrics_count} ads.\n")

        # Step 3: Analyze
        print("Step 3: Analyzing ad performance...")
        decisions = analyze_all(db_path, cfg.get("thresholds", {}))
        print(
            f"  Pause: {len(decisions['pause'])}  "
            f"Promote: {len(decisions['promote'])}  "
            f"Keep testing: {len(decisions['keep_testing'])}\n"
        )

        # Steps 4-5: Execute decisions (safety checks built in)
        print("Step 4-5: Executing decisions...")
        paused, promoted = execute_decisions(
            client,
            decisions["pause"],
            decisions["promote"],
            cfg,
            db_path,
        )
        print(f"  Paused: {paused}  Promoted: {promoted}\n")

        # Step 6: Generate report
        print("Step 6: Generating daily report...")
        report = build_report(decisions, db_path, cfg)
        report_dir = cfg.get("reporting", {}).get("report_dir", "./data/reports/")
        report_path = save_report(report, report_dir)
        print(f"  Report saved: {report_path}")
        print(report)

        # Step 7: Send report
        print("Step 7: Sending report...")
        send_report(report, cfg)

        # Record success
        complete_pipeline_run(
            db_path,
            run_id,
            ads_paused=paused,
            ads_promoted=promoted,
            report_path=str(report_path),
        )

        print("=== Daily pipeline complete ===")
        return True

    except Exception as e:
        error_msg = f"{type(e).__name__}: {e}\n{traceback.format_exc()}"
        print(f"\nPipeline failed: {error_msg}")

        complete_pipeline_run(db_path, run_id, error=error_msg)

        # Try to send error alert
        try:
            send_report(f"PIPELINE ERROR:\n\n{error_msg}", cfg)
        except Exception:
            pass

        return False


def main():
    success = run_daily()
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
