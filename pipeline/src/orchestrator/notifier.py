"""Report delivery via email (SMTP) and optional Slack webhook."""

import json
import smtplib
from email.mime.text import MIMEText

import requests


def send_email(report: str, cfg: dict) -> bool:
    """Send report via SMTP email.

    Requires these config keys under 'reporting':
      email_to: recipient address
      smtp_host: SMTP server (default: smtp.gmail.com)
      smtp_port: SMTP port (default: 587)
      smtp_user: SMTP username
      smtp_pass: SMTP password
      email_from: sender address (defaults to smtp_user)
    """
    reporting = cfg.get("reporting", {})
    email_to = reporting.get("email_to", "")
    smtp_host = reporting.get("smtp_host", "smtp.gmail.com")
    smtp_port = int(reporting.get("smtp_port", 587))
    smtp_user = reporting.get("smtp_user", "")
    smtp_pass = reporting.get("smtp_pass", "")
    email_from = reporting.get("email_from", smtp_user)

    if not email_to or not smtp_user:
        return False

    msg = MIMEText(report, "plain")
    msg["Subject"] = "AlphaSMB Ad Pipeline — Daily Report"
    msg["From"] = email_from
    msg["To"] = email_to

    try:
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.sendmail(email_from, [email_to], msg.as_string())
        print("  Email sent.")
        return True
    except Exception as e:
        print(f"  Email failed: {e}")
        return False


def send_slack(report: str, cfg: dict) -> bool:
    """Send report to Slack via webhook.

    Requires 'reporting.slack_webhook' in config.
    """
    webhook = cfg.get("reporting", {}).get("slack_webhook", "")
    if not webhook:
        return False

    try:
        response = requests.post(
            webhook,
            json={"text": f"```\n{report}\n```"},
            timeout=10,
        )
        if response.status_code == 200:
            print("  Slack notification sent.")
            return True
        else:
            print(f"  Slack webhook failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"  Slack notification failed: {e}")
        return False


def send_report(report: str, cfg: dict) -> None:
    """Send report via all configured channels."""
    email_sent = send_email(report, cfg)
    slack_sent = send_slack(report, cfg)

    if not email_sent and not slack_sent:
        print("  No notification channels configured (email/Slack).")
