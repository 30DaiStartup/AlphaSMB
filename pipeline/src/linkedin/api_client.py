"""Rate-limited LinkedIn Marketing API wrapper.

Handles:
- 1.5s delay between requests
- Daily call tracking (100/day limit)
- Retry with exponential backoff
- Full request/response logging to DB
"""

import json
import time
from datetime import date

import requests

from src.db import log_api_call

BASE_URL = "https://api.linkedin.com/rest"
DAILY_LIMIT = 100
REQUEST_DELAY = 1.5
MAX_RETRIES = 3


class RateLimitError(Exception):
    """Raised when daily API call limit is reached."""
    pass


class LinkedInAPIClient:
    """Rate-limited, logged LinkedIn Marketing API client."""

    def __init__(self, auth, db_path: str):
        self.auth = auth
        self.db_path = db_path
        self._calls_today = 0
        self._today = date.today()
        self._last_call_time = 0.0

    def _reset_daily_counter_if_needed(self):
        today = date.today()
        if today != self._today:
            self._calls_today = 0
            self._today = today

    def _enforce_rate_limit(self):
        self._reset_daily_counter_if_needed()
        if self._calls_today >= DAILY_LIMIT:
            raise RateLimitError(
                f"Daily API limit reached ({DAILY_LIMIT} calls). "
                f"Try again tomorrow."
            )
        elapsed = time.time() - self._last_call_time
        if elapsed < REQUEST_DELAY:
            time.sleep(REQUEST_DELAY - elapsed)

    def _headers(self) -> dict:
        token = self.auth.get_token()
        return {
            "Authorization": f"Bearer {token}",
            "LinkedIn-Version": "202602",
            "X-Restli-Protocol-Version": "2.0.0",
            "Content-Type": "application/json",
        }

    def request(
        self, method: str, endpoint: str, data: dict | None = None, params: dict | None = None
    ) -> requests.Response:
        """Make a rate-limited, logged API request with retry."""
        self._enforce_rate_limit()

        url = f"{BASE_URL}{endpoint}"
        request_body = json.dumps(data) if data else ""

        for attempt in range(MAX_RETRIES):
            try:
                self._last_call_time = time.time()
                self._calls_today += 1

                response = requests.request(
                    method=method,
                    url=url,
                    headers=self._headers(),
                    json=data,
                    params=params,
                    timeout=30,
                )

                # Log every call
                log_api_call(
                    self.db_path,
                    endpoint=endpoint,
                    method=method,
                    request_body=request_body,
                    response_status=response.status_code,
                    response_body=response.text[:2000],
                )

                # Retry on 429 (rate limited) or 5xx
                if response.status_code == 429:
                    retry_after = int(response.headers.get("Retry-After", 60))
                    time.sleep(retry_after)
                    continue
                elif response.status_code >= 500 and attempt < MAX_RETRIES - 1:
                    time.sleep(2 ** (attempt + 1))
                    continue

                return response

            except requests.RequestException as e:
                log_api_call(
                    self.db_path,
                    endpoint=endpoint,
                    method=method,
                    request_body=request_body,
                    response_status=0,
                    response_body=str(e),
                )
                if attempt < MAX_RETRIES - 1:
                    time.sleep(2 ** (attempt + 1))
                    continue
                raise

        return response  # Return last response if all retries exhausted

    def get(self, endpoint: str, params: dict | None = None) -> requests.Response:
        return self.request("GET", endpoint, params=params)

    def post(self, endpoint: str, data: dict) -> requests.Response:
        return self.request("POST", endpoint, data=data)

    def patch(self, endpoint: str, data: dict) -> requests.Response:
        return self.request("PATCH", endpoint, data=data)

    @property
    def calls_remaining(self) -> int:
        self._reset_daily_counter_if_needed()
        return DAILY_LIMIT - self._calls_today
