# AEO Audit Report

**Date:** 2026-02-25
**Site:** alphasmb.com
**Pages audited:** 6

## Readiness Score

| Dimension | Before | After | Status |
|-----------|--------|-------|--------|
| Content Extractability | 8 | 8 | Already strong (progressive enhancement on FAQ) |
| Bot Accessibility | 7 | 9 | llms.txt updated with assessment-first funnel |
| Structured Data | 9 | 9 | Already comprehensive (FAQPage, Service, Person, Quiz) |
| Content Structure | 7 | 8 | Answer capsule added to methodology section |
| **Overall** | **7.8** | **8.5** | |

## Changes Made

### Critical
- [x] Hidden content already visible (progressive enhancement via `.js-accordion`)
- [x] llms.txt updated — added assessment as primary entry, methodology section, pricing
- [x] AI crawler allowances already in robots.txt (GPTBot, ClaudeBot, PerplexityBot, etc.)

### Content Structure
- [x] Answer capsule added to methodology section (homepage)
- [x] Headings already question-format on most sections
- [x] 80% stat attributed to "in my experience across dozens of engagements"

### Structured Data
- [x] ProfessionalService schema on homepage
- [x] FAQPage schema on strategy-call page
- [x] Person schema with knowsAbout on about page
- [x] Quiz schema on assessment page
- [x] Service schema for both strategy call ($500) and assessment ($0)

## Verification

- [x] View page source confirms FAQ answers visible without JS
- [x] JS accordion uses `.js-accordion` body class pattern
- [x] /llms.txt accessible and current
- [x] /robots.txt shows AI crawler rules
- [x] Schema validated during schema-markup skill run

## Baseline Queries to Monitor

Test in ChatGPT, Perplexity, and Google AI Overviews (allow 4-8 weeks):
1. "AlphaSMB" — does it return accurate info?
2. "AI transformation consulting for SMBs" — does the company appear?
3. "Zach Henderson AI consulting" — is the person recognized?
4. "How to assess AI readiness for small business" — is the assessment cited?
5. "AI strategy call for SMB leaders" — does the service appear?
