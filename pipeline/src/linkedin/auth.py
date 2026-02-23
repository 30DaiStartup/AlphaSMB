"""LinkedIn OAuth 2.0 token management with auto-refresh."""

import time
from pathlib import Path

import requests
import yaml

TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken"


class LinkedInAuth:
    """Manages LinkedIn OAuth tokens with automatic refresh."""

    def __init__(self, cfg: dict):
        self.client_id = cfg["linkedin"]["client_id"]
        self.client_secret = cfg["linkedin"]["client_secret"]
        self.access_token = cfg["linkedin"].get("access_token", "")
        self.refresh_token = cfg["linkedin"].get("refresh_token", "")
        self._config_path = Path(cfg.get("_config_path", "config.yaml"))

    def get_token(self) -> str:
        """Return a valid access token, refreshing if needed."""
        if not self.access_token:
            raise ValueError("No access token. Run setup_oauth.py first.")

        # Test if token works
        test = requests.get(
            "https://api.linkedin.com/rest/adAccounts?q=search&count=1",
            headers=self._auth_headers(),
            timeout=10,
        )

        if test.status_code == 401 and self.refresh_token:
            self._refresh()
        elif test.status_code == 401:
            raise ValueError(
                "Access token expired and no refresh token available. "
                "Run setup_oauth.py to re-authenticate."
            )

        return self.access_token

    def _auth_headers(self) -> dict:
        return {
            "Authorization": f"Bearer {self.access_token}",
            "LinkedIn-Version": "202602",
            "X-Restli-Protocol-Version": "2.0.0",
        }

    def _refresh(self) -> None:
        """Refresh the access token using the refresh token."""
        response = requests.post(
            TOKEN_URL,
            data={
                "grant_type": "refresh_token",
                "refresh_token": self.refresh_token,
                "client_id": self.client_id,
                "client_secret": self.client_secret,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            timeout=15,
        )

        if response.status_code != 200:
            raise ValueError(
                f"Token refresh failed ({response.status_code}): {response.text}"
            )

        data = response.json()
        self.access_token = data["access_token"]
        if "refresh_token" in data:
            self.refresh_token = data["refresh_token"]

        self._persist_tokens()

    def _persist_tokens(self) -> None:
        """Save updated tokens back to config.yaml."""
        if not self._config_path.exists():
            return

        with open(self._config_path) as f:
            cfg = yaml.safe_load(f) or {}

        cfg.setdefault("linkedin", {})
        cfg["linkedin"]["access_token"] = self.access_token
        if self.refresh_token:
            cfg["linkedin"]["refresh_token"] = self.refresh_token

        with open(self._config_path, "w") as f:
            yaml.dump(cfg, f, default_flow_style=False)
