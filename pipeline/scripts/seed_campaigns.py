#!/usr/bin/env python3
"""One-time creation of LinkedIn campaign structure.

Creates:
  - Campaign Group: "AlphaSMB — Ad Testing"
  - Testing Pool campaign (Brand Awareness, auto-bid)
  - Winners campaign (Website Conversions, target cost bid)

Run once after LinkedIn API access is approved.
Updates config.yaml with the created campaign IDs.
"""

import json
import sys
from pathlib import Path

import yaml

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.config import load
from src.db import init_db
from src.linkedin.auth import LinkedInAuth
from src.linkedin.api_client import LinkedInAPIClient

# Audience targeting per PRD Section 4
CEO_TARGETING = {
    "include": {
        "and": [
            {
                "or": {
                    "urn:li:adTargetingFacet:titles": [
                        "CEO", "Founder", "Co-Founder", "President",
                        "Owner", "Managing Director",
                    ]
                }
            },
            {
                "or": {
                    "urn:li:adTargetingFacet:staffCountRanges": [
                        "SIZE_11_50", "SIZE_51_200", "SIZE_201_500",
                    ]
                }
            },
            {
                "or": {
                    "urn:li:adTargetingFacet:locations": [
                        "urn:li:geo:103644278",  # United States
                    ]
                }
            },
        ]
    }
}

COO_TARGETING = {
    "include": {
        "and": [
            {
                "or": {
                    "urn:li:adTargetingFacet:titles": [
                        "COO", "VP Operations", "Director of Operations",
                        "Head of Operations",
                    ]
                }
            },
            {
                "or": {
                    "urn:li:adTargetingFacet:staffCountRanges": [
                        "SIZE_11_50", "SIZE_51_200", "SIZE_201_500",
                    ]
                }
            },
            {
                "or": {
                    "urn:li:adTargetingFacet:locations": [
                        "urn:li:geo:103644278",  # United States
                    ]
                }
            },
        ]
    }
}


def main():
    cfg = load(require_linkedin=True)
    db_path = cfg["database"]["path"]
    init_db(db_path)

    auth = LinkedInAuth(cfg)
    client = LinkedInAPIClient(auth, db_path)

    ad_account_id = cfg["linkedin"]["ad_account_id"]
    testing_budget = int(cfg["budget"]["testing_pool_daily"] * 100)  # cents
    winner_budget = int(cfg["budget"]["winner_ad_daily"] * 100)

    print("Creating campaign group...")
    group_response = client.post(
        f"/adAccounts/{ad_account_id}/campaignGroups",
        data={
            "account": f"urn:li:sponsoredAccount:{ad_account_id}",
            "name": "AlphaSMB — Ad Testing",
            "status": "ACTIVE",
        },
    )

    if group_response.status_code not in (200, 201):
        print(f"Failed to create campaign group: {group_response.status_code}")
        print(group_response.text)
        sys.exit(1)

    group_id = group_response.headers.get("X-LinkedIn-Id", "")
    print(f"Campaign group created: {group_id}")

    print("\nCreating Testing Pool campaign...")
    testing_response = client.post(
        f"/adAccounts/{ad_account_id}/campaigns",
        data={
            "account": f"urn:li:sponsoredAccount:{ad_account_id}",
            "campaignGroup": f"urn:li:sponsoredCampaignGroup:{group_id}",
            "name": "Testing Pool",
            "status": "PAUSED",  # Start paused, activate when ads are loaded
            "type": "SPONSORED_UPDATES",
            "costType": "CPM",
            "objectiveType": "BRAND_AWARENESS",
            "dailyBudget": {"currencyCode": "USD", "amount": str(testing_budget)},
            "unitCost": {"currencyCode": "USD", "amount": "0"},  # Auto-bid
            "targetingCriteria": CEO_TARGETING,
            "creativeSelection": "OPTIMIZED",
        },
    )

    if testing_response.status_code not in (200, 201):
        print(f"Failed to create testing campaign: {testing_response.status_code}")
        print(testing_response.text)
        sys.exit(1)

    testing_id = testing_response.headers.get("X-LinkedIn-Id", "")
    print(f"Testing Pool campaign created: {testing_id}")

    print("\nCreating Winners campaign...")
    winners_response = client.post(
        f"/adAccounts/{ad_account_id}/campaigns",
        data={
            "account": f"urn:li:sponsoredAccount:{ad_account_id}",
            "campaignGroup": f"urn:li:sponsoredCampaignGroup:{group_id}",
            "name": "Winners — Conversion",
            "status": "PAUSED",
            "type": "SPONSORED_UPDATES",
            "costType": "CPC",
            "objectiveType": "WEBSITE_CONVERSIONS",
            "dailyBudget": {"currencyCode": "USD", "amount": str(winner_budget)},
            "targetingCriteria": CEO_TARGETING,
            "creativeSelection": "OPTIMIZED",
        },
    )

    if winners_response.status_code not in (200, 201):
        print(f"Failed to create winners campaign: {winners_response.status_code}")
        print(winners_response.text)
        sys.exit(1)

    winners_id = winners_response.headers.get("X-LinkedIn-Id", "")
    print(f"Winners campaign created: {winners_id}")

    # Save campaign IDs to config
    config_path = Path(__file__).resolve().parent.parent / "config.yaml"
    if config_path.exists():
        with open(config_path) as f:
            raw_cfg = yaml.safe_load(f) or {}
        raw_cfg.setdefault("linkedin", {})
        raw_cfg["linkedin"]["testing_campaign_id"] = testing_id
        raw_cfg["linkedin"]["winners_campaign_id"] = winners_id
        with open(config_path, "w") as f:
            yaml.dump(raw_cfg, f, default_flow_style=False)
        print(f"\nCampaign IDs saved to {config_path}")

    print("\nCampaign setup complete.")
    print(f"  Campaign Group: {group_id}")
    print(f"  Testing Pool:   {testing_id}")
    print(f"  Winners:        {winners_id}")
    print("\nNext steps:")
    print("  1. Verify campaigns in LinkedIn Campaign Manager")
    print("  2. Generate ads: python -m src.generator.ad_generator")
    print("  3. Publish ads:  python scripts/publish_ads.py")


if __name__ == "__main__":
    main()
