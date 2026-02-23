"""Decision engine — identify losers and winners from ad performance data.

Thresholds (configurable via config.yaml):
  < 500 impressions        → KEEP_TESTING (insufficient data)
  < 48 hours active        → KEEP_TESTING (too new)
  CPM > $40 + enough imps  → PAUSE_LOSER
  CTR >= 0.80% + clicks>=10 + days>=3 → PROMOTE_WINNER
  Otherwise                → KEEP_TESTING
"""

from dataclasses import dataclass
from datetime import date, datetime, timedelta, timezone
from enum import Enum

from src.db import get_active_ads, get_ad_aggregate_metrics


class Decision(Enum):
    KEEP_TESTING = "keep_testing"
    PAUSE_LOSER = "pause_loser"
    PROMOTE_WINNER = "promote_winner"


@dataclass
class AdDecision:
    """Decision for a single ad."""

    ad_id: str
    decision: Decision
    reason: str
    metrics: dict


def analyze_ad(
    ad: dict,
    metrics: dict,
    thresholds: dict,
) -> AdDecision:
    """Analyze a single ad and return a decision.

    Args:
        ad: Ad record from DB.
        metrics: Aggregate metrics from get_ad_aggregate_metrics().
        thresholds: Config thresholds dict.

    Returns:
        AdDecision with decision and reason.
    """
    min_impressions = thresholds.get("min_impressions_for_decision", 500)
    max_cpm = thresholds.get("max_cpm_threshold", 40.0)
    min_ctr = thresholds.get("min_ctr_for_winner", 0.80)
    min_clicks = thresholds.get("min_clicks_for_winner", 10)
    winner_days = thresholds.get("winner_observation_days", 3)
    loser_hours = thresholds.get("loser_observation_hours", 48)

    total_impressions = metrics.get("total_impressions") or 0
    total_clicks = metrics.get("total_clicks") or 0
    avg_cpm = metrics.get("avg_cpm", 0.0)
    avg_ctr = metrics.get("avg_ctr", 0.0)
    days_tracked = metrics.get("days_tracked") or 0

    # Check minimum data requirements
    if total_impressions < min_impressions:
        return AdDecision(
            ad_id=ad["id"],
            decision=Decision.KEEP_TESTING,
            reason=f"Insufficient impressions: {total_impressions}/{min_impressions}",
            metrics=metrics,
        )

    # Check minimum time active
    created_at = ad.get("created_at", "")
    if created_at:
        try:
            created = datetime.fromisoformat(created_at)
            hours_active = (datetime.now(timezone.utc) - created).total_seconds() / 3600
            if hours_active < loser_hours:
                return AdDecision(
                    ad_id=ad["id"],
                    decision=Decision.KEEP_TESTING,
                    reason=f"Too new: {hours_active:.0f}h active (min {loser_hours}h)",
                    metrics=metrics,
                )
        except (ValueError, TypeError):
            pass

    # Check for loser (high CPM)
    if avg_cpm > max_cpm:
        return AdDecision(
            ad_id=ad["id"],
            decision=Decision.PAUSE_LOSER,
            reason=f"CPM ${avg_cpm:.2f} > ${max_cpm:.2f} threshold",
            metrics=metrics,
        )

    # Check for winner (high CTR + enough clicks + enough days)
    if avg_ctr >= min_ctr and total_clicks >= min_clicks and days_tracked >= winner_days:
        return AdDecision(
            ad_id=ad["id"],
            decision=Decision.PROMOTE_WINNER,
            reason=(
                f"CTR {avg_ctr:.2f}% >= {min_ctr}%, "
                f"clicks {total_clicks} >= {min_clicks}, "
                f"days {days_tracked} >= {winner_days}"
            ),
            metrics=metrics,
        )

    # Keep testing
    return AdDecision(
        ad_id=ad["id"],
        decision=Decision.KEEP_TESTING,
        reason="Performing within thresholds — keep testing",
        metrics=metrics,
    )


def analyze_all(
    db_path: str,
    thresholds: dict,
) -> dict[str, list[AdDecision]]:
    """Analyze all active testing ads.

    Returns:
        Dict with keys 'pause', 'promote', 'keep_testing', each a list of AdDecision.
    """
    ads = get_active_ads(db_path, campaign_type="testing")

    results = {
        "pause": [],
        "promote": [],
        "keep_testing": [],
    }

    for ad in ads:
        metrics = get_ad_aggregate_metrics(db_path, ad["id"])
        decision = analyze_ad(ad, metrics, thresholds)

        if decision.decision == Decision.PAUSE_LOSER:
            results["pause"].append(decision)
        elif decision.decision == Decision.PROMOTE_WINNER:
            results["promote"].append(decision)
        else:
            results["keep_testing"].append(decision)

    return results
