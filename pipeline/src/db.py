"""SQLite database layer — schema, connection, and CRUD operations."""

import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path


SCHEMA = """
CREATE TABLE IF NOT EXISTS ads (
    id TEXT PRIMARY KEY,
    linkedin_creative_id TEXT,
    campaign_type TEXT NOT NULL DEFAULT 'testing',
    headline TEXT NOT NULL,
    intro_text TEXT NOT NULL,
    cta_type TEXT NOT NULL,
    destination_url TEXT NOT NULL,
    persona_target TEXT,
    template_type TEXT,
    hook_category TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    paused_at TIMESTAMP,
    promoted_at TIMESTAMP,
    pause_reason TEXT,
    promotion_reason TEXT
);

CREATE TABLE IF NOT EXISTS daily_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ad_id TEXT NOT NULL REFERENCES ads(id),
    date DATE NOT NULL,
    impressions INTEGER NOT NULL DEFAULT 0,
    clicks INTEGER NOT NULL DEFAULT 0,
    spend REAL NOT NULL DEFAULT 0.0,
    cpm REAL NOT NULL DEFAULT 0.0,
    ctr REAL NOT NULL DEFAULT 0.0,
    cpc REAL NOT NULL DEFAULT 0.0,
    conversions INTEGER NOT NULL DEFAULT 0,
    UNIQUE(ad_id, date)
);

CREATE TABLE IF NOT EXISTS pipeline_runs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    run_type TEXT NOT NULL,
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    ads_paused INTEGER DEFAULT 0,
    ads_promoted INTEGER DEFAULT 0,
    ads_generated INTEGER DEFAULT 0,
    total_spend REAL DEFAULT 0.0,
    report_path TEXT,
    error TEXT
);

CREATE TABLE IF NOT EXISTS api_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    endpoint TEXT NOT NULL,
    method TEXT NOT NULL,
    request_body TEXT,
    response_status INTEGER,
    response_body TEXT
);
"""


def init_db(db_path: str) -> None:
    """Create database and tables if they don't exist."""
    Path(db_path).parent.mkdir(parents=True, exist_ok=True)
    with sqlite3.connect(db_path) as conn:
        conn.executescript(SCHEMA)


@contextmanager
def get_connection(db_path: str):
    """Context manager for database connections with row_factory."""
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


# --- Ad CRUD ---

def insert_ad(db_path: str, ad: dict) -> None:
    """Insert a single ad record."""
    with get_connection(db_path) as conn:
        conn.execute(
            """INSERT INTO ads
               (id, headline, intro_text, cta_type, destination_url,
                persona_target, template_type, hook_category, status)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                ad["id"],
                ad["headline"],
                ad["intro_text"],
                ad["cta_type"],
                ad["destination_url"],
                ad.get("persona_target"),
                ad.get("template_type"),
                ad.get("hook_category"),
                ad.get("status", "active"),
            ),
        )


def insert_ads_batch(db_path: str, ads: list[dict]) -> int:
    """Insert multiple ads in a single transaction. Returns count inserted."""
    with get_connection(db_path) as conn:
        conn.executemany(
            """INSERT INTO ads
               (id, headline, intro_text, cta_type, destination_url,
                persona_target, template_type, hook_category, status)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            [
                (
                    a["id"],
                    a["headline"],
                    a["intro_text"],
                    a["cta_type"],
                    a["destination_url"],
                    a.get("persona_target"),
                    a.get("template_type"),
                    a.get("hook_category"),
                    a.get("status", "active"),
                )
                for a in ads
            ],
        )
        return len(ads)


def get_ad(db_path: str, ad_id: str) -> dict | None:
    """Get a single ad by ID."""
    with get_connection(db_path) as conn:
        row = conn.execute("SELECT * FROM ads WHERE id = ?", (ad_id,)).fetchone()
        return dict(row) if row else None


def get_active_ads(db_path: str, campaign_type: str = "testing") -> list[dict]:
    """Get all active ads for a campaign type."""
    with get_connection(db_path) as conn:
        rows = conn.execute(
            "SELECT * FROM ads WHERE status = 'active' AND campaign_type = ?",
            (campaign_type,),
        ).fetchall()
        return [dict(r) for r in rows]


def update_ad_status(
    db_path: str,
    ad_id: str,
    status: str,
    reason: str = "",
    linkedin_creative_id: str | None = None,
) -> None:
    """Update ad status (active, paused, promoted)."""
    now = datetime.now(timezone.utc).isoformat()
    with get_connection(db_path) as conn:
        if status == "paused":
            conn.execute(
                "UPDATE ads SET status = ?, paused_at = ?, pause_reason = ? WHERE id = ?",
                (status, now, reason, ad_id),
            )
        elif status == "promoted":
            conn.execute(
                "UPDATE ads SET status = ?, promoted_at = ?, promotion_reason = ? WHERE id = ?",
                (status, now, reason, ad_id),
            )
        else:
            conn.execute("UPDATE ads SET status = ? WHERE id = ?", (status, ad_id))

        if linkedin_creative_id:
            conn.execute(
                "UPDATE ads SET linkedin_creative_id = ? WHERE id = ?",
                (linkedin_creative_id, ad_id),
            )


def set_linkedin_creative_id(db_path: str, ad_id: str, creative_id: str) -> None:
    """Set the LinkedIn creative ID after publishing."""
    with get_connection(db_path) as conn:
        conn.execute(
            "UPDATE ads SET linkedin_creative_id = ? WHERE id = ?",
            (creative_id, ad_id),
        )


# --- Metrics CRUD ---

def insert_daily_metrics(db_path: str, metrics: dict) -> None:
    """Insert or replace daily metrics for an ad."""
    with get_connection(db_path) as conn:
        conn.execute(
            """INSERT OR REPLACE INTO daily_metrics
               (ad_id, date, impressions, clicks, spend, cpm, ctr, cpc, conversions)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                metrics["ad_id"],
                metrics["date"],
                metrics["impressions"],
                metrics["clicks"],
                metrics["spend"],
                metrics["cpm"],
                metrics["ctr"],
                metrics["cpc"],
                metrics.get("conversions", 0),
            ),
        )


def get_ad_metrics(db_path: str, ad_id: str) -> list[dict]:
    """Get all daily metrics for an ad, ordered by date."""
    with get_connection(db_path) as conn:
        rows = conn.execute(
            "SELECT * FROM daily_metrics WHERE ad_id = ? ORDER BY date",
            (ad_id,),
        ).fetchall()
        return [dict(r) for r in rows]


def get_ad_aggregate_metrics(db_path: str, ad_id: str) -> dict:
    """Get aggregate metrics for an ad across all days."""
    with get_connection(db_path) as conn:
        row = conn.execute(
            """SELECT
                 SUM(impressions) as total_impressions,
                 SUM(clicks) as total_clicks,
                 SUM(spend) as total_spend,
                 SUM(conversions) as total_conversions,
                 MIN(date) as first_date,
                 MAX(date) as last_date,
                 COUNT(*) as days_tracked
               FROM daily_metrics WHERE ad_id = ?""",
            (ad_id,),
        ).fetchone()
        result = dict(row)
        # Calculate aggregate CPM, CTR, CPC
        imps = result["total_impressions"] or 0
        clicks = result["total_clicks"] or 0
        spend = result["total_spend"] or 0.0
        result["avg_cpm"] = (spend / imps * 1000) if imps > 0 else 0.0
        result["avg_ctr"] = (clicks / imps * 100) if imps > 0 else 0.0
        result["avg_cpc"] = (spend / clicks) if clicks > 0 else 0.0
        return result


def get_total_spend_today(db_path: str, date: str) -> float:
    """Get total spend for a given date across all ads."""
    with get_connection(db_path) as conn:
        row = conn.execute(
            "SELECT COALESCE(SUM(spend), 0.0) as total FROM daily_metrics WHERE date = ?",
            (date,),
        ).fetchone()
        return row["total"]


# --- Pipeline Runs ---

def start_pipeline_run(db_path: str, run_type: str) -> int:
    """Record start of a pipeline run. Returns run ID."""
    with get_connection(db_path) as conn:
        cursor = conn.execute(
            "INSERT INTO pipeline_runs (run_type) VALUES (?)", (run_type,)
        )
        return cursor.lastrowid


def complete_pipeline_run(
    db_path: str,
    run_id: int,
    ads_paused: int = 0,
    ads_promoted: int = 0,
    ads_generated: int = 0,
    total_spend: float = 0.0,
    report_path: str = "",
    error: str = "",
) -> None:
    """Record completion of a pipeline run."""
    with get_connection(db_path) as conn:
        conn.execute(
            """UPDATE pipeline_runs SET
                 completed_at = CURRENT_TIMESTAMP,
                 ads_paused = ?, ads_promoted = ?, ads_generated = ?,
                 total_spend = ?, report_path = ?, error = ?
               WHERE id = ?""",
            (ads_paused, ads_promoted, ads_generated, total_spend, report_path, error, run_id),
        )


# --- API Log ---

def log_api_call(
    db_path: str,
    endpoint: str,
    method: str,
    request_body: str = "",
    response_status: int = 0,
    response_body: str = "",
) -> None:
    """Log an API call for audit trail."""
    with get_connection(db_path) as conn:
        conn.execute(
            """INSERT INTO api_log
               (endpoint, method, request_body, response_status, response_body)
               VALUES (?, ?, ?, ?, ?)""",
            (endpoint, method, request_body, response_status, response_body),
        )
