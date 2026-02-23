#!/usr/bin/env python3
"""Interactive LinkedIn OAuth 2.0 setup.

Run once to get initial access + refresh tokens.
Starts a local HTTP server to capture the OAuth callback.

Usage:
    python setup_oauth.py

Prerequisites:
    - LinkedIn Developer App created
    - Marketing API access approved
    - http://localhost:8888/callback added as authorized redirect URL
    - client_id and client_secret set in config.yaml
"""

import http.server
import json
import sys
import urllib.parse
import webbrowser
from pathlib import Path

import requests
import yaml

PIPELINE_ROOT = Path(__file__).resolve().parent
REDIRECT_URI = "http://localhost:8888/callback"
SCOPES = "r_ads rw_ads r_ads_reporting"
AUTH_URL = "https://www.linkedin.com/oauth/v2/authorization"
TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken"


def load_config():
    config_path = PIPELINE_ROOT / "config.yaml"
    if not config_path.exists():
        print("Error: config.yaml not found. Copy config.example.yaml first.")
        sys.exit(1)
    with open(config_path) as f:
        return yaml.safe_load(f)


def save_tokens(cfg, access_token, refresh_token=None):
    config_path = PIPELINE_ROOT / "config.yaml"
    cfg["linkedin"]["access_token"] = access_token
    if refresh_token:
        cfg["linkedin"]["refresh_token"] = refresh_token
    with open(config_path, "w") as f:
        yaml.dump(cfg, f, default_flow_style=False)
    print(f"\nTokens saved to {config_path}")


class OAuthCallbackHandler(http.server.BaseHTTPRequestHandler):
    """Handles the OAuth callback and captures the authorization code."""

    auth_code = None

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        params = urllib.parse.parse_qs(parsed.query)

        if "code" in params:
            OAuthCallbackHandler.auth_code = params["code"][0]
            self.send_response(200)
            self.send_header("Content-Type", "text/html")
            self.end_headers()
            self.wfile.write(
                b"<h1>Authorization successful</h1>"
                b"<p>You can close this window and return to the terminal.</p>"
            )
        elif "error" in params:
            self.send_response(400)
            self.send_header("Content-Type", "text/html")
            self.end_headers()
            error = params.get("error_description", params["error"])[0]
            self.wfile.write(f"<h1>Error: {error}</h1>".encode())
        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, format, *args):
        pass  # Suppress default logging


def main():
    cfg = load_config()
    client_id = cfg.get("linkedin", {}).get("client_id", "")
    client_secret = cfg.get("linkedin", {}).get("client_secret", "")

    if not client_id or not client_secret:
        print("Error: linkedin.client_id and linkedin.client_secret must be set in config.yaml")
        sys.exit(1)

    # Build authorization URL
    auth_params = urllib.parse.urlencode({
        "response_type": "code",
        "client_id": client_id,
        "redirect_uri": REDIRECT_URI,
        "scope": SCOPES,
    })
    auth_url = f"{AUTH_URL}?{auth_params}"

    print("Opening browser for LinkedIn authorization...")
    print(f"If browser doesn't open, visit:\n{auth_url}\n")
    webbrowser.open(auth_url)

    # Start local server to capture callback
    print("Waiting for OAuth callback on http://localhost:8888/callback ...")
    server = http.server.HTTPServer(("localhost", 8888), OAuthCallbackHandler)
    server.handle_request()  # Handle one request (the callback)

    auth_code = OAuthCallbackHandler.auth_code
    if not auth_code:
        print("Error: No authorization code received.")
        sys.exit(1)

    print(f"Authorization code received. Exchanging for tokens...")

    # Exchange code for tokens
    response = requests.post(
        TOKEN_URL,
        data={
            "grant_type": "authorization_code",
            "code": auth_code,
            "client_id": client_id,
            "client_secret": client_secret,
            "redirect_uri": REDIRECT_URI,
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )

    if response.status_code != 200:
        print(f"Token exchange failed: {response.status_code}")
        print(response.text)
        sys.exit(1)

    data = response.json()
    access_token = data["access_token"]
    refresh_token = data.get("refresh_token", "")

    print(f"\nAccess token received (expires in {data.get('expires_in', '?')}s)")
    if refresh_token:
        print("Refresh token received")
    else:
        print("Warning: No refresh token. Token will expire and need manual re-auth.")

    save_tokens(cfg, access_token, refresh_token)

    # Quick verification
    print("\nVerifying token with a test API call...")
    test = requests.get(
        "https://api.linkedin.com/rest/adAccounts?q=search",
        headers={
            "Authorization": f"Bearer {access_token}",
            "LinkedIn-Version": "202602",
            "X-Restli-Protocol-Version": "2.0.0",
        },
    )
    if test.status_code == 200:
        accounts = test.json().get("elements", [])
        print(f"Success — found {len(accounts)} ad account(s)")
        for acct in accounts:
            print(f"  Account: {acct.get('id')} ({acct.get('name', 'unnamed')})")
    else:
        print(f"Warning: Test call returned {test.status_code}")
        print(test.text[:500])

    print("\nOAuth setup complete.")


if __name__ == "__main__":
    main()
