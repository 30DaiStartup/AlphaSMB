"""Tests for ad validator — brand voice enforcement."""

import pytest

from src.generator.validator import validate_ad, validate_batch


class TestHeadlineLength:
    def test_valid_headline(self, valid_ad, sample_assets):
        result = validate_ad(valid_ad, sample_assets)
        assert result.passed

    def test_headline_exactly_70(self, valid_ad, sample_assets):
        valid_ad["headline"] = "A" * 70
        result = validate_ad(valid_ad, sample_assets)
        # Should pass (exactly at limit)
        assert "Headline too long" not in " ".join(result.errors)

    def test_headline_71_chars(self, valid_ad, sample_assets):
        valid_ad["headline"] = "A" * 71
        result = validate_ad(valid_ad, sample_assets)
        assert not result.passed
        assert any("Headline too long" in e for e in result.errors)

    def test_empty_headline(self, valid_ad, sample_assets):
        valid_ad["headline"] = ""
        result = validate_ad(valid_ad, sample_assets)
        assert not result.passed
        assert any("empty" in e.lower() for e in result.errors)


class TestIntroTextLength:
    def test_valid_intro(self, valid_ad, sample_assets):
        result = validate_ad(valid_ad, sample_assets)
        assert result.passed

    def test_intro_exactly_150(self, valid_ad, sample_assets):
        valid_ad["intro_text"] = "A" * 150
        result = validate_ad(valid_ad, sample_assets)
        assert "Intro text too long" not in " ".join(result.errors)

    def test_intro_151_chars(self, valid_ad, sample_assets):
        valid_ad["intro_text"] = "A" * 151
        result = validate_ad(valid_ad, sample_assets)
        assert not result.passed
        assert any("Intro text too long" in e for e in result.errors)


class TestBannedWords:
    def test_banned_word_in_headline(self, valid_ad, sample_assets):
        valid_ad["headline"] = "Leverage AI for your SMB — $500"
        result = validate_ad(valid_ad, sample_assets)
        assert not result.passed
        assert any("leverage" in e.lower() for e in result.errors)

    def test_banned_word_in_body(self, valid_ad, sample_assets):
        valid_ad["body_text"] = "I help you harness innovative solutions. $500."
        result = validate_ad(valid_ad, sample_assets)
        assert not result.passed
        assert any("innovative" in e.lower() for e in result.errors)

    def test_banned_word_case_insensitive(self, valid_ad, sample_assets):
        valid_ad["headline"] = "SYNERGY in AI Strategy — $500"
        result = validate_ad(valid_ad, sample_assets)
        assert not result.passed
        assert any("synergy" in e.lower() for e in result.errors)

    def test_banned_word_not_substring(self, valid_ad, sample_assets):
        # "delve" should not match "deliver"
        valid_ad["body_text"] = "I deliver results for SMBs. $500."
        result = validate_ad(valid_ad, sample_assets)
        # Should not flag "delve" in "deliver"
        assert not any("delve" in e.lower() for e in result.errors)

    def test_no_banned_words(self, valid_ad, sample_assets):
        result = validate_ad(valid_ad, sample_assets)
        assert result.passed


class TestBannedPhrases:
    def test_excited_to_announce(self, valid_ad, sample_assets):
        valid_ad["body_text"] = "Excited to announce a new service. $500."
        result = validate_ad(valid_ad, sample_assets)
        assert not result.passed

    def test_dive_into(self, valid_ad, sample_assets):
        valid_ad["body_text"] = "Let's dive into your AI strategy. $500."
        result = validate_ad(valid_ad, sample_assets)
        assert not result.passed

    def test_case_insensitive_phrase(self, valid_ad, sample_assets):
        valid_ad["body_text"] = "IN TODAY'S RAPIDLY EVOLVING market. $500."
        result = validate_ad(valid_ad, sample_assets)
        assert not result.passed

    def test_thrilled_to_share(self, valid_ad, sample_assets):
        valid_ad["intro_text"] = "Thrilled to share this with you."
        result = validate_ad(valid_ad, sample_assets)
        assert not result.passed


class TestAsASentences:
    def test_as_a_at_start(self, valid_ad, sample_assets):
        valid_ad["body_text"] = "As a consultant, I see this daily. $500."
        result = validate_ad(valid_ad, sample_assets)
        assert not result.passed

    def test_as_a_mid_sentence(self, valid_ad, sample_assets):
        valid_ad["body_text"] = "I know this. As a leader, you understand. $500."
        result = validate_ad(valid_ad, sample_assets)
        assert not result.passed

    def test_as_a_in_quote_still_caught(self, valid_ad, sample_assets):
        # The validator catches "As a" patterns broadly
        valid_ad["body_text"] = "My experience matters. As a former operator I know. $500."
        result = validate_ad(valid_ad, sample_assets)
        assert not result.passed


class TestExclamationMarks:
    def test_exclamation_in_headline(self, valid_ad, sample_assets):
        valid_ad["headline"] = "AI Strategy for SMBs! — $500"
        result = validate_ad(valid_ad, sample_assets)
        assert not result.passed
        assert any("exclamation" in e.lower() for e in result.errors)

    def test_no_exclamation(self, valid_ad, sample_assets):
        result = validate_ad(valid_ad, sample_assets)
        assert result.passed


class TestEmojis:
    def test_emoji_in_text(self, valid_ad, sample_assets):
        valid_ad["headline"] = "AI Strategy 🚀 — $500"
        result = validate_ad(valid_ad, sample_assets)
        assert not result.passed
        assert any("emoji" in e.lower() for e in result.errors)

    def test_no_emoji(self, valid_ad, sample_assets):
        result = validate_ad(valid_ad, sample_assets)
        assert result.passed


class TestFirstPerson:
    def test_we_in_body(self, valid_ad, sample_assets):
        valid_ad["body_text"] = "We help SMBs transform. $500."
        result = validate_ad(valid_ad, sample_assets)
        assert not result.passed
        assert any("we" in e.lower() for e in result.errors)

    def test_the_team(self, valid_ad, sample_assets):
        valid_ad["body_text"] = "The team will build your roadmap. $500."
        result = validate_ad(valid_ad, sample_assets)
        assert not result.passed

    def test_we_in_customer_quote_allowed(self, valid_ad, sample_assets):
        valid_ad["body_text"] = 'Clients say "We bought ChatGPT licenses." $500.'
        result = validate_ad(valid_ad, sample_assets)
        # "we" inside quotes should be allowed
        assert result.passed

    def test_i_is_fine(self, valid_ad, sample_assets):
        valid_ad["body_text"] = "I help SMBs transform. $500."
        result = validate_ad(valid_ad, sample_assets)
        assert result.passed


class TestCTA:
    def test_valid_learn_more(self, valid_ad, sample_assets):
        valid_ad["cta_type"] = "LEARN_MORE"
        result = validate_ad(valid_ad, sample_assets)
        assert result.passed

    def test_valid_book_now(self, valid_ad, sample_assets):
        valid_ad["cta_type"] = "BOOK_NOW"
        result = validate_ad(valid_ad, sample_assets)
        assert result.passed

    def test_invalid_cta(self, valid_ad, sample_assets):
        valid_ad["cta_type"] = "SIGN_UP"
        result = validate_ad(valid_ad, sample_assets)
        assert not result.passed
        assert any("CTA" in e for e in result.errors)


class TestDestinationURL:
    def test_correct_url(self, valid_ad, sample_assets):
        result = validate_ad(valid_ad, sample_assets)
        assert result.passed

    def test_wrong_url(self, valid_ad, sample_assets):
        valid_ad["destination_url"] = "https://example.com"
        result = validate_ad(valid_ad, sample_assets)
        assert not result.passed
        assert any("destination url" in e.lower() for e in result.errors)

    def test_book_url_also_valid(self, valid_ad, sample_assets):
        valid_ad["destination_url"] = "https://alphasmb.com/book"
        result = validate_ad(valid_ad, sample_assets)
        assert result.passed


class TestPriceVisible:
    def test_price_visible(self, valid_ad, sample_assets):
        result = validate_ad(valid_ad, sample_assets)
        assert not result.warnings  # No warning when $500 is present

    def test_price_missing_warning(self, valid_ad, sample_assets):
        valid_ad["headline"] = "AI Strategy for SMB Leaders"
        valid_ad["intro_text"] = "Transform your organization."
        valid_ad["body_text"] = "I help SMBs build AI capability."
        result = validate_ad(valid_ad, sample_assets)
        # Should still pass (warning, not error)
        assert result.passed
        assert any("$500" in w for w in result.warnings)


class TestRequiredFields:
    def test_missing_ad_id(self, valid_ad, sample_assets):
        del valid_ad["ad_id"]
        result = validate_ad(valid_ad, sample_assets)
        assert not result.passed

    def test_missing_headline(self, valid_ad, sample_assets):
        del valid_ad["headline"]
        result = validate_ad(valid_ad, sample_assets)
        assert not result.passed


class TestBatchValidation:
    def test_batch_all_valid(self, valid_ad, sample_assets):
        ads = [valid_ad.copy() for _ in range(3)]
        for i, ad in enumerate(ads):
            ad["ad_id"] = f"test-{i}"
        results = validate_batch(ads, sample_assets)
        assert all(r.passed for r in results)

    def test_batch_mixed(self, valid_ad, sample_assets):
        good_ad = valid_ad.copy()
        bad_ad = valid_ad.copy()
        bad_ad["ad_id"] = "bad-ad"
        bad_ad["headline"] = "A" * 100  # Too long
        results = validate_batch([good_ad, bad_ad], sample_assets)
        assert results[0].passed
        assert not results[1].passed
