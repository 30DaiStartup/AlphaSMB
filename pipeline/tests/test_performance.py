"""Tests for the performance decision engine."""

import pytest
from datetime import datetime, timedelta, timezone

from src.analyzer.performance import analyze_ad, Decision


DEFAULT_THRESHOLDS = {
    "min_impressions_for_decision": 500,
    "max_cpm_threshold": 40.0,
    "min_ctr_for_winner": 0.80,
    "min_clicks_for_winner": 10,
    "winner_observation_days": 3,
    "loser_observation_hours": 48,
}


def make_ad(ad_id="test-ad", created_hours_ago=72):
    """Create a test ad dict."""
    created = datetime.now(timezone.utc) - timedelta(hours=created_hours_ago)
    return {
        "id": ad_id,
        "status": "active",
        "created_at": created.isoformat(),
    }


def make_metrics(
    total_impressions=1000,
    total_clicks=5,
    total_spend=10.0,
    days_tracked=3,
):
    """Create test aggregate metrics dict."""
    imps = total_impressions or 1
    clicks = total_clicks or 0
    spend = total_spend or 0.0
    return {
        "total_impressions": total_impressions,
        "total_clicks": total_clicks,
        "total_spend": total_spend,
        "total_conversions": 0,
        "days_tracked": days_tracked,
        "avg_cpm": (spend / imps * 1000) if imps > 0 else 0,
        "avg_ctr": (clicks / imps * 100) if imps > 0 else 0,
        "avg_cpc": (spend / clicks) if clicks > 0 else 0,
    }


class TestInsufficientData:
    def test_below_min_impressions(self):
        ad = make_ad()
        metrics = make_metrics(total_impressions=300)
        decision = analyze_ad(ad, metrics, DEFAULT_THRESHOLDS)
        assert decision.decision == Decision.KEEP_TESTING
        assert "Insufficient impressions" in decision.reason

    def test_exactly_min_impressions(self):
        ad = make_ad()
        metrics = make_metrics(total_impressions=500, total_spend=500.0)  # CPM=$1000
        decision = analyze_ad(ad, metrics, DEFAULT_THRESHOLDS)
        # Should NOT be keep_testing due to impressions — should be loser (high CPM)
        assert decision.decision == Decision.PAUSE_LOSER

    def test_zero_impressions(self):
        ad = make_ad()
        metrics = make_metrics(total_impressions=0)
        decision = analyze_ad(ad, metrics, DEFAULT_THRESHOLDS)
        assert decision.decision == Decision.KEEP_TESTING


class TestTooNew:
    def test_under_48_hours(self):
        ad = make_ad(created_hours_ago=24)
        metrics = make_metrics(total_impressions=600, total_spend=30.0)
        decision = analyze_ad(ad, metrics, DEFAULT_THRESHOLDS)
        assert decision.decision == Decision.KEEP_TESTING
        assert "Too new" in decision.reason

    def test_exactly_48_hours(self):
        ad = make_ad(created_hours_ago=48)
        metrics = make_metrics(total_impressions=600, total_spend=30.0)
        decision = analyze_ad(ad, metrics, DEFAULT_THRESHOLDS)
        # At exactly 48 hours, should no longer be "too new"
        assert "Too new" not in decision.reason

    def test_over_48_hours(self):
        ad = make_ad(created_hours_ago=72)
        metrics = make_metrics(total_impressions=600, total_spend=10.0)
        decision = analyze_ad(ad, metrics, DEFAULT_THRESHOLDS)
        assert "Too new" not in decision.reason


class TestPauseLoser:
    def test_high_cpm_pauses(self):
        ad = make_ad()
        # CPM = ($50 / 1000 * 1000) = $50 > $40 threshold
        metrics = make_metrics(total_impressions=1000, total_spend=50.0)
        decision = analyze_ad(ad, metrics, DEFAULT_THRESHOLDS)
        assert decision.decision == Decision.PAUSE_LOSER
        assert "CPM" in decision.reason

    def test_cpm_exactly_at_threshold(self):
        ad = make_ad()
        # CPM = exactly $40
        metrics = make_metrics(total_impressions=1000, total_spend=40.0)
        decision = analyze_ad(ad, metrics, DEFAULT_THRESHOLDS)
        # At threshold, not over — should keep testing
        assert decision.decision == Decision.KEEP_TESTING

    def test_cpm_just_over_threshold(self):
        ad = make_ad()
        # CPM = $40.01
        metrics = make_metrics(total_impressions=1000, total_spend=40.01)
        decision = analyze_ad(ad, metrics, DEFAULT_THRESHOLDS)
        assert decision.decision == Decision.PAUSE_LOSER

    def test_low_cpm_not_paused(self):
        ad = make_ad()
        metrics = make_metrics(total_impressions=1000, total_spend=10.0)
        decision = analyze_ad(ad, metrics, DEFAULT_THRESHOLDS)
        assert decision.decision != Decision.PAUSE_LOSER


class TestPromoteWinner:
    def test_winner_promoted(self):
        ad = make_ad()
        # CTR = 1.0%, clicks = 10, days = 3 — all above thresholds
        metrics = make_metrics(
            total_impressions=1000,
            total_clicks=10,
            total_spend=10.0,
            days_tracked=3,
        )
        decision = analyze_ad(ad, metrics, DEFAULT_THRESHOLDS)
        assert decision.decision == Decision.PROMOTE_WINNER

    def test_high_ctr_but_few_clicks(self):
        ad = make_ad()
        # CTR = 5%, but only 5 clicks (need 10)
        metrics = make_metrics(
            total_impressions=100,
            total_clicks=5,
            total_spend=1.0,
            days_tracked=3,
        )
        # Not enough impressions for decision
        decision = analyze_ad(ad, metrics, DEFAULT_THRESHOLDS)
        assert decision.decision == Decision.KEEP_TESTING

    def test_high_ctr_enough_clicks_but_too_few_days(self):
        ad = make_ad()
        # Great CTR and clicks, but only 2 days
        metrics = make_metrics(
            total_impressions=1000,
            total_clicks=15,
            total_spend=5.0,
            days_tracked=2,
        )
        decision = analyze_ad(ad, metrics, DEFAULT_THRESHOLDS)
        assert decision.decision == Decision.KEEP_TESTING

    def test_ctr_below_threshold(self):
        ad = make_ad()
        # CTR = 0.5% < 0.8%
        metrics = make_metrics(
            total_impressions=2000,
            total_clicks=10,
            total_spend=20.0,
            days_tracked=5,
        )
        decision = analyze_ad(ad, metrics, DEFAULT_THRESHOLDS)
        assert decision.decision == Decision.KEEP_TESTING


class TestEdgeCases:
    def test_loser_beats_winner_check(self):
        """If CPM is high AND CTR is high, should pause (loser check first)."""
        ad = make_ad()
        # High CPM ($50) AND high CTR (1%) — loser check runs first
        metrics = make_metrics(
            total_impressions=1000,
            total_clicks=10,
            total_spend=50.0,
            days_tracked=5,
        )
        decision = analyze_ad(ad, metrics, DEFAULT_THRESHOLDS)
        assert decision.decision == Decision.PAUSE_LOSER

    def test_custom_thresholds(self):
        """Custom thresholds should override defaults."""
        ad = make_ad()
        metrics = make_metrics(
            total_impressions=1000,
            total_clicks=10,
            total_spend=30.0,  # CPM = $30 — under default $40 but over custom $25
            days_tracked=3,
        )
        custom = {**DEFAULT_THRESHOLDS, "max_cpm_threshold": 25.0}
        decision = analyze_ad(ad, metrics, custom)
        assert decision.decision == Decision.PAUSE_LOSER

    def test_missing_created_at(self):
        """Should still work if created_at is missing."""
        ad = {"id": "test", "status": "active"}
        metrics = make_metrics(total_impressions=1000, total_spend=50.0)
        decision = analyze_ad(ad, metrics, DEFAULT_THRESHOLDS)
        assert decision.decision == Decision.PAUSE_LOSER
