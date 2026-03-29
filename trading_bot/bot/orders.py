"""
Order placement logic — sits between the CLI/API layer and the Binance client.
Validates input, builds order params, and formats responses.
"""

from dataclasses import dataclass
from decimal import Decimal
from typing import Optional

from .client import BinanceFuturesClient
from .logging_config import get_logger
from .validators import (
    validate_order_type,
    validate_price,
    validate_quantity,
    validate_side,
    validate_stop_price,
    validate_symbol,
    validate_time_in_force,
)

logger = get_logger(__name__)


@dataclass
class OrderRequest:
    symbol: str
    side: str
    order_type: str
    quantity: Decimal
    price: Optional[Decimal] = None
    stop_price: Optional[Decimal] = None
    time_in_force: Optional[str] = None
    reduce_only: bool = False


@dataclass
class OrderResult:
    order_id: int
    symbol: str
    side: str
    order_type: str
    status: str
    orig_qty: str
    executed_qty: str
    avg_price: str
    price: str
    raw: dict

    def summary(self) -> str:
        lines = [
            "┌─────────────────────────────────────────┐",
            "│           ORDER CONFIRMED                │",
            "├─────────────────────────────────────────┤",
            f"│  Order ID    : {self.order_id:<25}│",
            f"│  Symbol      : {self.symbol:<25}│",
            f"│  Side        : {self.side:<25}│",
            f"│  Type        : {self.order_type:<25}│",
            f"│  Status      : {self.status:<25}│",
            f"│  Orig Qty    : {self.orig_qty:<25}│",
            f"│  Exec Qty    : {self.executed_qty:<25}│",
            f"│  Avg Price   : {self.avg_price:<25}│",
            f"│  Limit Price : {self.price:<25}│",
            "└─────────────────────────────────────────┘",
        ]
        return "\n".join(lines)


class OrderManager:
    """
    High-level interface for placing and managing orders.
    Decouples validation and business logic from the raw HTTP client.
    """

    def __init__(self, client: BinanceFuturesClient):
        self.client = client

    def _validate_request(
        self,
        symbol: str,
        side: str,
        order_type: str,
        quantity,
        price=None,
        stop_price=None,
        time_in_force=None,
    ) -> OrderRequest:
        return OrderRequest(
            symbol=validate_symbol(symbol),
            side=validate_side(side),
            order_type=validate_order_type(order_type),
            quantity=validate_quantity(quantity),
            price=validate_price(price, validate_order_type(order_type)),
            stop_price=validate_stop_price(stop_price, validate_order_type(order_type)),
            time_in_force=validate_time_in_force(time_in_force, validate_order_type(order_type)),
        )

    def _build_params(self, req: OrderRequest) -> dict:
        params: dict = {
            "symbol": req.symbol,
            "side": req.side,
            "type": req.order_type,
            "quantity": str(req.quantity),
        }
        if req.price is not None:
            params["price"] = str(req.price)
        if req.stop_price is not None:
            params["stopPrice"] = str(req.stop_price)
        if req.time_in_force is not None:
            params["timeInForce"] = req.time_in_force
        if req.reduce_only:
            params["reduceOnly"] = "true"
        return params

    def _parse_response(self, raw: dict) -> OrderResult:
        return OrderResult(
            order_id=raw.get("orderId", 0),
            symbol=raw.get("symbol", ""),
            side=raw.get("side", ""),
            order_type=raw.get("type", ""),
            status=raw.get("status", ""),
            orig_qty=raw.get("origQty", "0"),
            executed_qty=raw.get("executedQty", "0"),
            avg_price=raw.get("avgPrice", "0") or raw.get("price", "0"),
            price=raw.get("price", "0"),
            raw=raw,
        )

    def place_order(
        self,
        symbol: str,
        side: str,
        order_type: str,
        quantity,
        price=None,
        stop_price=None,
        time_in_force: str = "GTC",
        reduce_only: bool = False,
    ) -> OrderResult:
        req = self._validate_request(symbol, side, order_type, quantity, price, stop_price, time_in_force)
        logger.info(
            "Placing %s %s %s  qty=%s  price=%s",
            req.order_type,
            req.side,
            req.symbol,
            req.quantity,
            req.price,
        )
        params = self._build_params(req)
        raw = self.client.place_order(**params)
        result = self._parse_response(raw)
        logger.info("Order placed successfully: orderId=%s  status=%s", result.order_id, result.status)
        return result

    def get_open_orders(self, symbol: str | None = None) -> list[dict]:
        return self.client.get_open_orders(symbol)

    def cancel_order(self, symbol: str, order_id: int) -> dict:
        symbol = validate_symbol(symbol)
        logger.info("Cancelling orderId=%s on %s", order_id, symbol)
        return self.client.cancel_order(symbol, order_id)

    def get_account_info(self) -> dict:
        return self.client.get_account()
