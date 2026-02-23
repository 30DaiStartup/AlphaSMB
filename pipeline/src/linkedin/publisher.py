"""Bulk upload ad creatives to LinkedIn Campaign Manager.

For each ad in the generated JSON:
  1. POST /adCreatives — create the creative
  2. Associate with Testing Pool campaign
  3. Set status ACTIVE
  4. Record LinkedIn creative ID in DB
"""

import json
from pathlib import Path

from src.db import insert_ad, set_linkedin_creative_id
from src.linkedin.api_client import LinkedInAPIClient, RateLimitError


def publish_ad(
    client: LinkedInAPIClient,
    ad: dict,
    ad_account_id: str,
    campaign_id: str,
    db_path: str,
) -> str | None:
    """Publish a single ad creative to LinkedIn.

    Returns:
        LinkedIn creative ID on success, None on failure.
    """
    # Build the ad creative payload per LinkedIn Marketing API
    payload = {
        "campaign": f"urn:li:sponsoredCampaign:{campaign_id}",
        "reference": None,
        "status": "ACTIVE",
        "type": "SPONSORED_STATUS_UPDATE",
        "variables": {
            "data": {
                "com.linkedin.ads.SponsoredUpdateCreativeVariables": {
                    "activity": None,
                    "directSponsoredContent": {
                        "share": {
                            "commentary": {
                                "text": ad.get("intro_text", ""),
                            },
                            "content": {
                                "contentEntities": [
                                    {
                                        "entityLocation": ad["destination_url"],
                                        "thumbnails": [],
                                    }
                                ],
                                "title": ad["headline"],
                                "description": ad.get("body_text", ad["intro_text"]),
                            },
                            "subject": ad["headline"],
                        },
                        "callToAction": {
                            "labelType": ad["cta_type"],
                        },
                    },
                }
            }
        },
    }

    response = client.post(
        f"/adAccounts/{ad_account_id}/creatives",
        data=payload,
    )

    if response.status_code in (200, 201):
        # Extract creative ID from response or Location header
        creative_id = None
        if "X-LinkedIn-Id" in response.headers:
            creative_id = response.headers["X-LinkedIn-Id"]
        elif response.text:
            try:
                data = response.json()
                creative_id = str(data.get("id", ""))
            except json.JSONDecodeError:
                pass

        if creative_id:
            set_linkedin_creative_id(db_path, ad["id"], creative_id)
            return creative_id

        return "created"
    else:
        print(f"  Failed to publish '{ad['id']}': {response.status_code} — {response.text[:200]}")
        return None


def publish_batch(
    client: LinkedInAPIClient,
    ads: list[dict],
    cfg: dict,
    db_path: str,
) -> tuple[int, int]:
    """Publish a batch of ads to LinkedIn.

    Inserts ads into DB first, then publishes to LinkedIn.
    Handles rate limits by saving progress and stopping.

    Args:
        client: LinkedIn API client.
        ads: List of ad dicts.
        cfg: Pipeline config.
        db_path: Database path.

    Returns:
        (published_count, failed_count)
    """
    ad_account_id = cfg["linkedin"]["ad_account_id"]
    campaign_id = cfg["linkedin"]["testing_campaign_id"]

    published = 0
    failed = 0

    for ad in ads:
        # Insert into local DB first
        try:
            insert_ad(db_path, ad)
        except Exception:
            pass  # Already exists (resume scenario)

        # Check if we have API calls remaining
        if client.calls_remaining < 5:
            print(f"  Rate limit approaching. Stopping after {published} ads.")
            print(f"  Remaining ads will be published on next run.")
            break

        try:
            creative_id = publish_ad(
                client, ad, ad_account_id, campaign_id, db_path
            )
            if creative_id:
                published += 1
                print(f"  Published: {ad['id']} -> {creative_id}")
            else:
                failed += 1
        except RateLimitError:
            print(f"  Daily rate limit reached after {published} ads.")
            break
        except Exception as e:
            print(f"  Error publishing '{ad['id']}': {e}")
            failed += 1

    return published, failed
