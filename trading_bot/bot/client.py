"""
Binance Futures Testnet API client wrapper.
Handles authentication, request signing, and HTTP communication.
"""

import hashlib
import hmac
import time
import urllib.parse
from typing import Any

import httpx

from .logging_config import get_logger

logger = get_logger(__name__)

TESTNET_BASE_URL = "https://testnet.binancefuture.com"


class BinanceClientError(Exception):
    """Raised when the Binance API returns an error response."""

    def __init__(self, code: int, message: str):
        self.code = code
        self.message = message
        super().__init__(f"Binance API Error [{code}]: {message}")


class NetworkError(Exception):
    """Raised on network-level failures."""


class BinanceFuturesClient:
    """
    Thin wrapper around the Binance Futures Testnet REST API.
    Responsible for request signing and transport only — no business logic.

    KEY FIX: Binance Futures requires the signature to be computed from the
    exact query string that will be sent. For POST requests the params must
    be sent as a query string (not form body) so the signature remains valid.
    """

    def __init__(self, api_key: str, api_secret: str, base_url: str = TESTNET_BASE_URL):
        # Strip accidental whitespace / newlines from .env values
        self.api_key    = api_key.strip()
        self.api_secret = api_secret.strip().encode()
        self.base_url   = base_url.strip().rstrip("/")

        self._http = httpx.Client(
            base_url=self.base_url,
            headers={"X-MBX-APIKEY": self.api_key},
            timeout=15.0,
        )

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _sign(self, query_string: str) -> str:
        """Return HMAC-SHA256 hex signature for the given query string."""
        return hmac.new(
            self.api_secret,
            query_string.encode("utf-8"),
            hashlib.sha256,
        ).hexdigest()

    def _build_query(self, params: dict) -> str:
        """
        Add timestamp, build the query string, append the signature.
        Returns the full signed query string ready to append to the URL.
        """
        params["timestamp"] = int(time.time() * 1000)
        query = urllib.parse.urlencode(params)
        signature = self._sign(query)
        return f"{query}&signature={signature}"

    def _request(
        self,
        method: str,
        path: str,
        params: dict | None = None,
        signed: bool = True,
    ) -> Any:
        params = params or {}

        if signed:
            # Build signed query string and append directly to path.
            # This guarantees the signature covers exactly what Binance receives,
            # regardless of HTTP method — fixes -2015 on POST orders.
            signed_qs = self._build_query(params)
            url = f"{path}?{signed_qs}"
        else:
            url = path
            if params:
                url = f"{path}?{urllib.parse.urlencode(params)}"

        log_params = {k: v for k, v in params.items() if k not in ("signature",)}
        logger.info("-> %s %s  params=%s", method.upper(), path, log_params)

        try:
            response = self._http.request(method.upper(), url)
        except httpx.TimeoutException as exc:
            logger.error("Request timed out: %s", exc)
            raise NetworkError("Request timed out — check your internet connection.") from exc
        except httpx.RequestError as exc:
            logger.error("Network error: %s", exc)
            raise NetworkError(f"Network error: {exc}") from exc

        logger.info("<- HTTP %s  body=%s", response.status_code, response.text[:600])

        data = response.json()

        if isinstance(data, dict) and data.get("code", 0) < 0:
            raise BinanceClientError(data["code"], data.get("msg", "Unknown error"))

        return data

    # ------------------------------------------------------------------
    # Public API surface
    # ------------------------------------------------------------------

    def get_exchange_info(self) -> dict:
        """Return exchange metadata (symbols, filters, etc.)."""
        return self._request("GET", "/fapi/v1/exchangeInfo", signed=False)

    def get_account(self) -> dict:
        """Return current account balances and positions."""
        return self._request("GET", "/fapi/v2/account")

    def get_ticker_price(self, symbol: str) -> dict:
        """Return the latest mark price for a symbol."""
        return self._request(
            "GET", "/fapi/v1/ticker/price",
            params={"symbol": symbol},
            signed=False,
        )

    def place_order(self, **kwargs) -> dict:
        """
        Place a new order. All params sent as signed query string.
        Returns the raw order response dict.
        """
        return self._request("POST", "/fapi/v1/order", params=dict(kwargs))

    def cancel_order(self, symbol: str, order_id: int) -> dict:
        return self._request(
            "DELETE", "/fapi/v1/order",
            params={"symbol": symbol, "orderId": order_id},
        )

    def get_open_orders(self, symbol: str | None = None) -> list:
        params = {}
        if symbol:
            params["symbol"] = symbol
        return self._request("GET", "/fapi/v1/openOrders", params=params)

    def get_order(self, symbol: str, order_id: int) -> dict:
        return self._request(
            "GET", "/fapi/v1/order",
            params={"symbol": symbol, "orderId": order_id},
        )

    def close(self):
        self._http.close()

    def __enter__(self):
        return self

    def __exit__(self, *_):
        self.close()
