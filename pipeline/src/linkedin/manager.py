"""Ad management — pause losers, promote winners with safety rails.

Safety checks:
  - Never drop below min_active_ads (default 5) in Testing Pool
  - Max promotions per day (default 3)
  - Log every action for audit trail
"""

from src.analyzer.performance import AdDecision
from src.db import (
    get_active_ads,
    get_ad,
    update_ad_status,
    insert_ad,
)
from src.linkedin.api_client import LinkedInAPIClient


def apply_safety_checks(
    pause_list: list[AdDecision],
    promote_list: list[AdDecision],
    db_path: str,
    cfg: dict,
) -> tuple[list[AdDecision], list[AdDecision]]:
    """Apply safety rails to pause/promote lists.

    Returns:
        (safe_pause_list, safe_promote_list) — filtered by safety rules.
    """
    min_active = cfg.get("thresholds", {}).get("min_active_ads", 5)
    max_promotions = cfg.get("thresholds", {}).get("max_daily_promotions", 3)

    current_active = len(get_active_ads(db_path, "testing"))

    # Cap promotions per day
    safe_promote = promote_list[:max_promotions]
    if len(promote_list) > max_promotions:
        print(
            f"  Safety: Capped promotions at {max_promotions}/day "
            f"({len(promote_list)} candidates)"
        )

    # Don't pause if it would drop below minimum active ads
    # Account for promotions too (they also remove from testing pool)
    will_remove = len(safe_promote) + len(pause_list)
    remaining = current_active - will_remove

    safe_pause = list(pause_list)
    if remaining < min_active:
        # Remove pauses until we're above minimum
        allowed_pauses = max(0, current_active - len(safe_promote) - min_active)
        safe_pause = pause_list[:allowed_pauses]
        if len(safe_pause) < len(pause_list):
            print(
                f"  Safety: Reduced pauses from {len(pause_list)} to {len(safe_pause)} "
                f"(min {min_active} active ads)"
            )

    return safe_pause, safe_promote


def pause_loser(
    client: LinkedInAPIClient,
    decision: AdDecision,
    cfg: dict,
    db_path: str,
) -> bool:
    """Pause a single underperforming ad.

    Returns:
        True on success, False on failure.
    """
    ad = get_ad(db_path, decision.ad_id)
    if not ad or not ad.get("linkedin_creative_id"):
        print(f"  Cannot pause '{decision.ad_id}': no LinkedIn creative ID")
        return False

    creative_id = ad["linkedin_creative_id"]
    ad_account_id = cfg["linkedin"]["ad_account_id"]

    response = client.patch(
        f"/adAccounts/{ad_account_id}/creatives/{creative_id}",
        data={"status": "PAUSED"},
    )

    if response.status_code in (200, 204):
        update_ad_status(db_path, decision.ad_id, "paused", reason=decision.reason)
        print(f"  Paused: {decision.ad_id} — {decision.reason}")
        return True
    else:
        print(f"  Failed to pause '{decision.ad_id}': {response.status_code}")
        return False


def promote_winner(
    client: LinkedInAPIClient,
    decision: AdDecision,
    cfg: dict,
    db_path: str,
) -> bool:
    """Promote a winning ad to the Winners campaign.

    Steps:
      1. Create a copy of the creative in the Winners campaign
      2. Pause the original in Testing Pool
      3. Update DB with promotion status

    Returns:
        True on success, False on failure.
    """
    ad = get_ad(db_path, decision.ad_id)
    if not ad or not ad.get("linkedin_creative_id"):
        print(f"  Cannot promote '{decision.ad_id}': no LinkedIn creative ID")
        return False

    ad_account_id = cfg["linkedin"]["ad_account_id"]
    winners_campaign_id = cfg["linkedin"].get("winners_campaign_id")
    if not winners_campaign_id:
        print("  Cannot promote: no winners_campaign_id configured")
        return False

    # Create new creative in Winners campaign
    payload = {
        "campaign": f"urn:li:sponsoredCampaign:{winners_campaign_id}",
        "status": "ACTIVE",
        "type": "SPONSORED_STATUS_UPDATE",
        "variables": {
            "data": {
                "com.linkedin.ads.SponsoredUpdateCreativeVariables": {
                    "directSponsoredContent": {
                        "share": {
                            "commentary": {"text": ad["intro_text"]},
                            "content": {
                                "contentEntities": [
                                    {"entityLocation": ad["destination_url"]}
                                ],
                                "title": ad["headline"],
                            },
                            "subject": ad["headline"],
                        },
                        "callToAction": {"labelType": ad["cta_type"]},
                    }
                }
            }
        },
    }

    response = client.post(
        f"/adAccounts/{ad_account_id}/creatives",
        data=payload,
    )

    if response.status_code not in (200, 201):
        print(f"  Failed to create winner creative: {response.status_code}")
        return False

    # Pause original in Testing Pool
    original_creative_id = ad["linkedin_creative_id"]
    client.patch(
        f"/adAccounts/{ad_account_id}/creatives/{original_creative_id}",
        data={"status": "PAUSED"},
    )

    # Update DB
    update_ad_status(db_path, decision.ad_id, "promoted", reason=decision.reason)
    print(f"  Promoted: {decision.ad_id} — {decision.reason}")
    return True


def execute_decisions(
    client: LinkedInAPIClient,
    pause_list: list[AdDecision],
    promote_list: list[AdDecision],
    cfg: dict,
    db_path: str,
) -> tuple[int, int]:
    """Execute pause/promote decisions with safety checks.

    Returns:
        (paused_count, promoted_count)
    """
    safe_pause, safe_promote = apply_safety_checks(
        pause_list, promote_list, db_path, cfg
    )

    paused = 0
    promoted = 0

    for decision in safe_pause:
        if pause_loser(client, decision, cfg, db_path):
            paused += 1

    for decision in safe_promote:
        if promote_winner(client, decision, cfg, db_path):
            promoted += 1

    return paused, promoted
