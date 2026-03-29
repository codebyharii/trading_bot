"""
Input validation for order parameters.
All functions raise ValueError with a human-readable message on failure.
"""

from decimal import Decimal, InvalidOperation

VALID_SIDES = {"BUY", "SELL"}
VALID_ORDER_TYPES = {"MARKET", "LIMIT", "STOP_MARKET", "STOP", "TAKE_PROFIT", "TAKE_PROFIT_MARKET"}
VALID_TIME_IN_FORCE = {"GTC", "IOC", "FOK", "GTX"}


def validate_symbol(symbol: str) -> str:
    symbol = symbol.strip().upper()
    if not symbol or not symbol.isalpha():
        raise ValueError(f"Invalid symbol '{symbol}'. Must be alphabetic characters only (e.g. BTCUSDT).")
    return symbol


def validate_side(side: str) -> str:
    side = side.strip().upper()
    if side not in VALID_SIDES:
        raise ValueError(f"Invalid side '{side}'. Must be one of: {', '.join(sorted(VALID_SIDES))}.")
    return side


def validate_order_type(order_type: str) -> str:
    order_type = order_type.strip().upper()
    if order_type not in VALID_ORDER_TYPES:
        raise ValueError(
            f"Invalid order type '{order_type}'. Supported types: {', '.join(sorted(VALID_ORDER_TYPES))}."
        )
    return order_type


def validate_quantity(quantity: str | float) -> Decimal:
    try:
        qty = Decimal(str(quantity))
    except InvalidOperation:
        raise ValueError(f"Invalid quantity '{quantity}'. Must be a positive number.")
    if qty <= 0:
        raise ValueError(f"Quantity must be greater than zero, got {qty}.")
    return qty


def validate_price(price: str | float | None, order_type: str) -> Decimal | None:
    if order_type == "MARKET":
        if price is not None:
            raise ValueError("Price must not be provided for MARKET orders.")
        return None

    if price is None:
        raise ValueError(f"Price is required for {order_type} orders.")
    try:
        p = Decimal(str(price))
    except InvalidOperation:
        raise ValueError(f"Invalid price '{price}'. Must be a positive number.")
    if p <= 0:
        raise ValueError(f"Price must be greater than zero, got {p}.")
    return p


def validate_stop_price(stop_price: str | float | None, order_type: str) -> Decimal | None:
    if order_type not in {"STOP", "STOP_MARKET", "TAKE_PROFIT", "TAKE_PROFIT_MARKET"}:
        return None
    if stop_price is None:
        raise ValueError(f"stopPrice is required for {order_type} orders.")
    try:
        sp = Decimal(str(stop_price))
    except InvalidOperation:
        raise ValueError(f"Invalid stop price '{stop_price}'. Must be a positive number.")
    if sp <= 0:
        raise ValueError(f"Stop price must be greater than zero, got {sp}.")
    return sp


def validate_time_in_force(tif: str | None, order_type: str) -> str | None:
    if order_type == "MARKET":
        return None
    if tif is None:
        return "GTC"
    tif = tif.strip().upper()
    if tif not in VALID_TIME_IN_FORCE:
        raise ValueError(f"Invalid timeInForce '{tif}'. Must be one of: {', '.join(sorted(VALID_TIME_IN_FORCE))}.")
    return tif
