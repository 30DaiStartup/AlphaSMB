"""Daily performance report generator.

Produces a clean, scannable report for terminal and markdown file output.
"""

from datetime import date, datetime
from pathlib import Path

from src.analyzer.performance import AdDecision, Decision
from src.db import get_active_ads, get_ad_aggregate_metrics, get_total_spend_today


def build_report(
    decisions: dict[str, list[AdDecision]],
    db_path: str,
    cfg: dict,
    report_date: date | None = None,
) -> str:
    """Build the daily performance report.

    Args:
        decisions: Output from analyze_all() — pause/promote/keep_testing lists.
        db_path: Database path.
        cfg: Pipeline config.
        report_date: Date for the report header. Defaults to today.

    Returns:
        Formatted report string (markdown-compatible).
    """
    if report_date is None:
        report_date = date.today()

    date_str = report_date.strftime("%Y-%m-%d")
    testing_budget = cfg.get("budget", {}).get("testing_pool_daily", 100.0)
    winner_budget = cfg.get("budget", {}).get("max_total_daily", 300.0)

    lines = [
        "",
        "=" * 60,
        f"  AlphaSMB Daily Ad Performance Report — {date_str}",
        "=" * 60,
        "",
    ]

    # PAUSED section
    paused = decisions.get("pause", [])
    lines.append(f"PAUSED (CPM > threshold): {len(paused)}")
    if paused:
        for d in paused:
            m = d.metrics
            lines.append(
                f"  {d.ad_id:<40} CPM: ${m.get('avg_cpm', 0):.2f}  "
                f"Impressions: {m.get('total_impressions', 0):,}"
            )
    else:
        lines.append("  (none)")
    lines.append("")

    # PROMOTED section
    promoted = decisions.get("promote", [])
    lines.append(f"PROMOTED TO WINNERS: {len(promoted)}")
    if promoted:
        for d in promoted:
            m = d.metrics
            lines.append(
                f"  {d.ad_id:<40} CTR: {m.get('avg_ctr', 0):.1f}%  "
                f"CPM: ${m.get('avg_cpm', 0):.2f}  "
                f"Clicks: {m.get('total_clicks', 0)}"
            )
    else:
        lines.append("  (none)")
    lines.append("")

    # STILL TESTING section
    keep_testing = decisions.get("keep_testing", [])
    insufficient = [
        d for d in keep_testing
        if (d.metrics.get("total_impressions") or 0) < cfg.get("thresholds", {}).get("min_impressions_for_decision", 500)
    ]
    active_performers = [d for d in keep_testing if d not in insufficient]

    lines.append(f"STILL TESTING (insufficient data): {len(insufficient)}")
    if insufficient:
        min_imps = cfg.get("thresholds", {}).get("min_impressions_for_decision", 500)
        for d in insufficient:
            m = d.metrics
            imps = m.get("total_impressions") or 0
            lines.append(
                f"  {d.ad_id:<40} Impressions: {imps:,} (need {min_imps:,})"
            )
    else:
        lines.append("  (none)")
    lines.append("")

    # ACTIVE PERFORMERS section
    lines.append(f"ACTIVE PERFORMERS: {len(active_performers)}")
    if active_performers:
        # Sort by CTR descending
        sorted_performers = sorted(
            active_performers,
            key=lambda d: d.metrics.get("avg_ctr", 0),
            reverse=True,
        )
        for d in sorted_performers:
            m = d.metrics
            lines.append(
                f"  {d.ad_id:<40} CTR: {m.get('avg_ctr', 0):.1f}%  "
                f"CPM: ${m.get('avg_cpm', 0):.2f}  "
                f"Clicks: {m.get('total_clicks', 0)}"
            )
    else:
        lines.append("  (none)")
    lines.append("")

    # BUDGET SUMMARY
    today_spend = get_total_spend_today(db_path, date_str)
    testing_ads_count = len(get_active_ads(db_path, "testing"))
    winner_ads_count = len(get_active_ads(db_path, "winners"))

    lines.extend([
        "BUDGET SUMMARY:",
        f"  Today's spend:     ${today_spend:.2f}",
        f"  Testing Pool ads:  {testing_ads_count} active",
        f"  Winners Pool ads:  {winner_ads_count} active",
        "",
        "ACTIONS TAKEN:",
        f"  Ads paused:   {len(paused)}",
        f"  Ads promoted: {len(promoted)}",
        "",
        "=" * 60,
        "",
    ])

    return "\n".join(lines)


def save_report(report: str, report_dir: str, report_date: date | None = None) -> Path:
    """Save report to a markdown file.

    Returns:
        Path to the saved report file.
    """
    if report_date is None:
        report_date = date.today()

    output_dir = Path(report_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    filename = f"daily_report_{report_date.strftime('%Y-%m-%d')}.md"
    output_path = output_dir / filename

    with open(output_path, "w") as f:
        f.write(report)

    return output_path
