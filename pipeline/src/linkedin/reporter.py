"""Pull ad analytics from LinkedIn Marketing API.

Fetches impressions, clicks, spend, CPM, CTR, CPC, conversions
and stores in daily_metrics table.
"""

from datetime import date, timedelta

from src.db import get_active_ads, insert_daily_metrics
from src.linkedin.api_client import LinkedInAPIClient


def pull_daily_metrics(
    client: LinkedInAPIClient,
    cfg: dict,
    db_path: str,
    target_date: date | None = None,
) -> int:
    """Pull yesterday's metrics for all active ads.

    Args:
        client: LinkedIn API client.
        cfg: Pipeline config.
        db_path: Database path.
        target_date: Date to pull metrics for. Defaults to yesterday.

    Returns:
        Number of ad metrics records stored.
    """
    if target_date is None:
        target_date = date.today() - timedelta(days=1)

    ad_account_id = cfg["linkedin"]["ad_account_id"]
    date_str = target_date.isoformat()

    # Get all active ads (both testing and winners)
    testing_ads = get_active_ads(db_path, "testing")
    winner_ads = get_active_ads(db_path, "winners")
    all_ads = testing_ads + winner_ads

    if not all_ads:
        print("No active ads to pull metrics for.")
        return 0

    # Get creative IDs for API query
    creative_ids = [
        a["linkedin_creative_id"]
        for a in all_ads
        if a.get("linkedin_creative_id")
    ]

    if not creative_ids:
        print("No ads have LinkedIn creative IDs yet.")
        return 0

    # Pull analytics — LinkedIn requires date range
    # Use the adAnalytics endpoint with creative-level breakdown
    params = {
        "q": "analytics",
        "dateRange.start.year": target_date.year,
        "dateRange.start.month": target_date.month,
        "dateRange.start.day": target_date.day,
        "dateRange.end.year": target_date.year,
        "dateRange.end.month": target_date.month,
        "dateRange.end.day": target_date.day,
        "timeGranularity": "DAILY",
        "pivot": "CREATIVE",
        "campaigns[0]": f"urn:li:sponsoredCampaign:{cfg['linkedin']['testing_campaign_id']}",
        "fields": "impressions,clicks,costInLocalCurrency,dateRange",
    }

    # Add winners campaign if configured
    winners_id = cfg["linkedin"].get("winners_campaign_id")
    if winners_id:
        params["campaigns[1]"] = f"urn:li:sponsoredCampaign:{winners_id}"

    response = client.get(f"/adAnalytics", params=params)

    if response.status_code != 200:
        print(f"Failed to pull analytics: {response.status_code}")
        print(response.text[:500])
        return 0

    data = response.json()
    elements = data.get("elements", [])
    count = 0

    # Build creative ID → ad ID mapping
    creative_to_ad = {
        a["linkedin_creative_id"]: a["id"]
        for a in all_ads
        if a.get("linkedin_creative_id")
    }

    for element in elements:
        # Extract creative URN from the pivot value
        creative_urn = element.get("pivotValue", "")
        creative_id = creative_urn.split(":")[-1] if ":" in creative_urn else creative_urn

        ad_id = creative_to_ad.get(creative_id)
        if not ad_id:
            continue

        impressions = element.get("impressions", 0)
        clicks = element.get("clicks", 0)
        spend = float(element.get("costInLocalCurrency", 0))

        # Calculate derived metrics
        cpm = (spend / impressions * 1000) if impressions > 0 else 0.0
        ctr = (clicks / impressions * 100) if impressions > 0 else 0.0
        cpc = (spend / clicks) if clicks > 0 else 0.0
        conversions = element.get("externalWebsiteConversions", 0)

        insert_daily_metrics(db_path, {
            "ad_id": ad_id,
            "date": date_str,
            "impressions": impressions,
            "clicks": clicks,
            "spend": spend,
            "cpm": round(cpm, 2),
            "ctr": round(ctr, 2),
            "cpc": round(cpc, 2),
            "conversions": conversions,
        })
        count += 1

    return count
