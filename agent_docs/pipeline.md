# LinkedIn Ad Pipeline

Automated marketing pipeline in `pipeline/` — separate Python system, independent from the website.

- **PRD:** `AlphaSMB-LinkedIn-Ad-Pipeline-PRD.md`
- **Stack:** Python 3.10+, SQLite, Claude API, LinkedIn Marketing API
- **Config:** `pipeline/config.yaml` (gitignored) — copy from `pipeline/config.example.yaml`
- **Tests:** `python -m pytest pipeline/tests/ -v` from repo root
- **Prerequisites:** LinkedIn Developer App with Marketing API access, Anthropic API key. See PRD Section 8 for setup.

## Components

| Component | Path | Purpose |
|-----------|------|---------|
| Config | `pipeline/src/config.py` | YAML + env var config loading |
| Database | `pipeline/src/db.py` | SQLite schema + CRUD (ads, metrics, runs, api_log) |
| Copy Loader | `pipeline/src/generator/copy_loader.py` | Read brand docs + cascades → structured data |
| Prompt Builder | `pipeline/src/generator/prompt_builder.py` | Build Claude API prompts with generation matrix |
| Ad Generator | `pipeline/src/generator/ad_generator.py` | Claude API bulk generation |
| Validator | `pipeline/src/generator/validator.py` | Brand voice enforcement (68 tests) |
| LinkedIn Auth | `pipeline/src/linkedin/auth.py` | OAuth 2.0 token management |
| API Client | `pipeline/src/linkedin/api_client.py` | Rate-limited wrapper (100 calls/day) |
| Publisher | `pipeline/src/linkedin/publisher.py` | Bulk upload ad creatives |
| Reporter | `pipeline/src/linkedin/reporter.py` | Pull LinkedIn analytics |
| Manager | `pipeline/src/linkedin/manager.py` | Pause losers, promote winners |
| Analyzer | `pipeline/src/analyzer/performance.py` | Decision engine with configurable thresholds |
| Report Builder | `pipeline/src/analyzer/report_builder.py` | Daily markdown + terminal report |
| Daily Run | `pipeline/src/orchestrator/daily_run.py` | Daily cron entry point |
| Weekly Gen | `pipeline/src/orchestrator/weekly_generate.py` | Weekly ad generation entry point |
| Notifier | `pipeline/src/orchestrator/notifier.py` | Email/Slack delivery |
