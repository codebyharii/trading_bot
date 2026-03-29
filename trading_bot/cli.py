#!/usr/bin/env python3
"""
Trading Bot CLI — Binance Futures Testnet
Usage examples:
  python cli.py place --symbol BTCUSDT --side BUY --type MARKET --quantity 0.001
  python cli.py place --symbol ETHUSDT --side SELL --type LIMIT --quantity 0.1 --price 3200
  python cli.py place --symbol BTCUSDT --side BUY --type STOP_MARKET --quantity 0.001 --stop-price 40000
  python cli.py orders --symbol BTCUSDT
  python cli.py cancel --symbol BTCUSDT --order-id 12345
  python cli.py account
"""

import argparse
import json
import os
import sys

from dotenv import load_dotenv

from bot import BinanceClientError, BinanceFuturesClient, NetworkError, OrderManager, setup_logging
from bot.logging_config import get_logger

load_dotenv()
setup_logging()
logger = get_logger("cli")


# ──────────────────────────────────────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────────────────────────────────────


def _get_credentials() -> tuple[str, str]:
    key = os.getenv("BINANCE_API_KEY", "")
    secret = os.getenv("BINANCE_API_SECRET", "")
    if not key or not secret:
        print(
            "ERROR: BINANCE_API_KEY and BINANCE_API_SECRET must be set as environment variables "
            "or in a .env file.",
            file=sys.stderr,
        )
        sys.exit(1)
    return key, secret


def _build_client() -> BinanceFuturesClient:
    key, secret = _get_credentials()
    base_url = os.getenv("BINANCE_BASE_URL", "https://testnet.binancefuture.com")
    return BinanceFuturesClient(api_key=key, api_secret=secret, base_url=base_url)


def _print_order_request_summary(args) -> None:
    print("\n── Order Request ─────────────────────────────────")
    print(f"  Symbol      : {args.symbol.upper()}")
    print(f"  Side        : {args.side.upper()}")
    print(f"  Type        : {args.type.upper()}")
    print(f"  Quantity    : {args.quantity}")
    if hasattr(args, "price") and args.price:
        print(f"  Price       : {args.price}")
    if hasattr(args, "stop_price") and args.stop_price:
        print(f"  Stop Price  : {args.stop_price}")
    print("──────────────────────────────────────────────────\n")


# ──────────────────────────────────────────────────────────────────────────────
# Sub-command handlers
# ──────────────────────────────────────────────────────────────────────────────


def cmd_place(args) -> int:
    _print_order_request_summary(args)
    logger.info("CLI place-order invoked: %s", vars(args))

    with _build_client() as client:
        manager = OrderManager(client)
        try:
            result = manager.place_order(
                symbol=args.symbol,
                side=args.side,
                order_type=args.type,
                quantity=args.quantity,
                price=args.price,
                stop_price=getattr(args, "stop_price", None),
                time_in_force=getattr(args, "tif", "GTC"),
                reduce_only=getattr(args, "reduce_only", False),
            )
        except ValueError as exc:
            print(f"\n✗  Validation error: {exc}\n", file=sys.stderr)
            logger.error("Validation error: %s", exc)
            return 1
        except BinanceClientError as exc:
            print(f"\n✗  API error [{exc.code}]: {exc.message}\n", file=sys.stderr)
            logger.error("API error: %s", exc)
            return 1
        except NetworkError as exc:
            print(f"\n✗  Network error: {exc}\n", file=sys.stderr)
            logger.error("Network error: %s", exc)
            return 1

    print(result.summary())
    print("\n✓  Order placed successfully.\n")
    return 0


def cmd_orders(args) -> int:
    symbol = args.symbol.upper() if args.symbol else None
    with _build_client() as client:
        manager = OrderManager(client)
        try:
            orders = manager.get_open_orders(symbol)
        except (BinanceClientError, NetworkError) as exc:
            print(f"✗  {exc}", file=sys.stderr)
            return 1

    if not orders:
        print("No open orders found.")
        return 0

    print(f"\nOpen orders ({len(orders)}):")
    for o in orders:
        print(
            f"  [{o['orderId']}]  {o['side']:4}  {o['type']:12}  {o['symbol']:12}  "
            f"qty={o['origQty']}  price={o['price']}  status={o['status']}"
        )
    print()
    return 0


def cmd_cancel(args) -> int:
    with _build_client() as client:
        manager = OrderManager(client)
        try:
            resp = manager.cancel_order(args.symbol, args.order_id)
        except (ValueError, BinanceClientError, NetworkError) as exc:
            print(f"✗  {exc}", file=sys.stderr)
            return 1

    print(f"\n✓  Order {resp.get('orderId')} cancelled.  Status: {resp.get('status')}\n")
    return 0


def cmd_account(args) -> int:
    with _build_client() as client:
        manager = OrderManager(client)
        try:
            info = manager.get_account_info()
        except (BinanceClientError, NetworkError) as exc:
            print(f"✗  {exc}", file=sys.stderr)
            return 1

    assets = [a for a in info.get("assets", []) if float(a.get("walletBalance", 0)) > 0]
    print("\n── Account Balances ────────────────────────────────")
    for a in assets:
        print(f"  {a['asset']:8}  wallet={a['walletBalance']:>16}  unrealised PnL={a.get('unrealizedProfit', '0'):>16}")
    if not assets:
        print("  (no non-zero balances)")
    print("────────────────────────────────────────────────────\n")
    return 0


# ──────────────────────────────────────────────────────────────────────────────
# Argument parser
# ──────────────────────────────────────────────────────────────────────────────


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="trading-bot",
        description="Binance Futures Testnet Trading Bot",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    sub = parser.add_subparsers(dest="command", required=True)

    # ── place ──────────────────────────────────────────────────────────────────
    place = sub.add_parser("place", help="Place a new order")
    place.add_argument("--symbol", required=True, help="Trading pair, e.g. BTCUSDT")
    place.add_argument("--side", required=True, choices=["BUY", "SELL", "buy", "sell"], help="Order side")
    place.add_argument(
        "--type",
        required=True,
        choices=["MARKET", "LIMIT", "STOP_MARKET", "STOP", "TAKE_PROFIT", "TAKE_PROFIT_MARKET"],
        dest="type",
        help="Order type",
    )
    place.add_argument("--quantity", required=True, type=float, help="Order quantity (base asset)")
    place.add_argument("--price", type=float, default=None, help="Limit price (required for LIMIT / STOP)")
    place.add_argument("--stop-price", type=float, default=None, dest="stop_price", help="Stop trigger price")
    place.add_argument("--tif", default="GTC", choices=["GTC", "IOC", "FOK", "GTX"], help="Time-in-force (default GTC)")
    place.add_argument("--reduce-only", action="store_true", dest="reduce_only", help="Reduce-only order")
    place.set_defaults(func=cmd_place)

    # ── orders ─────────────────────────────────────────────────────────────────
    orders = sub.add_parser("orders", help="List open orders")
    orders.add_argument("--symbol", default=None, help="Filter by symbol")
    orders.set_defaults(func=cmd_orders)

    # ── cancel ─────────────────────────────────────────────────────────────────
    cancel = sub.add_parser("cancel", help="Cancel an open order")
    cancel.add_argument("--symbol", required=True)
    cancel.add_argument("--order-id", required=True, type=int, dest="order_id")
    cancel.set_defaults(func=cmd_cancel)

    # ── account ────────────────────────────────────────────────────────────────
    account = sub.add_parser("account", help="Show account balances")
    account.set_defaults(func=cmd_account)

    return parser


def main():
    parser = build_parser()
    args = parser.parse_args()
    sys.exit(args.func(args))


if __name__ == "__main__":
    main()
