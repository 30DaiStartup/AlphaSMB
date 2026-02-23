"""Load pipeline configuration from YAML + environment variables."""

import os
from pathlib import Path

import yaml
from dotenv import load_dotenv

load_dotenv()

PIPELINE_ROOT = Path(__file__).resolve().parent.parent


def _deep_merge(base: dict, override: dict) -> dict:
    """Merge override into base, recursing into nested dicts."""
    merged = base.copy()
    for key, value in override.items():
        if key in merged and isinstance(merged[key], dict) and isinstance(value, dict):
            merged[key] = _deep_merge(merged[key], value)
        else:
            merged[key] = value
    return merged


def _apply_env_overrides(cfg: dict) -> dict:
    """Override config values with environment variables.

    Env var naming: PIPELINE_<SECTION>_<KEY> (uppercase, underscores).
    Examples:
        PIPELINE_LINKEDIN_CLIENT_ID -> cfg["linkedin"]["client_id"]
        PIPELINE_CLAUDE_API_KEY     -> cfg["claude"]["api_key"]
    """
    prefix = "PIPELINE_"
    for env_key, env_val in os.environ.items():
        if not env_key.startswith(prefix):
            continue
        parts = env_key[len(prefix) :].lower().split("_", 1)
        if len(parts) != 2:
            continue
        section, key = parts
        if section in cfg and isinstance(cfg[section], dict):
            # Attempt numeric conversion for thresholds/budgets
            if key in cfg[section]:
                original = cfg[section][key]
                if isinstance(original, (int, float)):
                    try:
                        env_val = type(original)(env_val)
                    except (ValueError, TypeError):
                        pass
            cfg[section][key] = env_val
    return cfg


REQUIRED_FOR_LINKEDIN = [
    ("linkedin", "client_id"),
    ("linkedin", "client_secret"),
    ("linkedin", "ad_account_id"),
]

REQUIRED_FOR_GENERATION = [
    ("claude", "api_key"),
]


def validate(cfg: dict, require_linkedin: bool = False) -> list[str]:
    """Return list of missing required config fields."""
    errors = []
    checks = list(REQUIRED_FOR_GENERATION)
    if require_linkedin:
        checks.extend(REQUIRED_FOR_LINKEDIN)

    for section, key in checks:
        val = cfg.get(section, {}).get(key)
        if not val:
            errors.append(f"{section}.{key} is required")
    return errors


def load(config_path: Path | None = None, require_linkedin: bool = False) -> dict:
    """Load config from YAML, apply env overrides, validate.

    Args:
        config_path: Path to config.yaml. Defaults to pipeline/config.yaml.
        require_linkedin: If True, validate LinkedIn credentials are present.

    Returns:
        Merged configuration dict.

    Raises:
        FileNotFoundError: If config file doesn't exist.
        ValueError: If required fields are missing.
    """
    if config_path is None:
        config_path = PIPELINE_ROOT / "config.yaml"

    if not config_path.exists():
        raise FileNotFoundError(
            f"Config file not found: {config_path}\n"
            f"Copy config.example.yaml to config.yaml and fill in your values."
        )

    with open(config_path) as f:
        cfg = yaml.safe_load(f) or {}

    cfg = _apply_env_overrides(cfg)

    # Resolve relative paths against pipeline root
    db_path = cfg.get("database", {}).get("path", "./data/alphasmb_ads.db")
    if not os.path.isabs(db_path):
        cfg.setdefault("database", {})["path"] = str(PIPELINE_ROOT / db_path)

    report_dir = cfg.get("reporting", {}).get("report_dir", "./data/reports/")
    if not os.path.isabs(report_dir):
        cfg.setdefault("reporting", {})["report_dir"] = str(PIPELINE_ROOT / report_dir)

    errors = validate(cfg, require_linkedin=require_linkedin)
    if errors:
        raise ValueError("Config validation failed:\n  " + "\n  ".join(errors))

    return cfg
