#!/usr/bin/env python3
"""
Quick connectivity + API key diagnostic.
Run this BEFORE starting api_server.py to verify your .env is correct.

Usage:
    python check_connection.py
"""

import os
import sys
from dotenv import load_dotenv

load_dotenv()

API_KEY    = os.getenv("BINANCE_API_KEY", "").strip()
API_SECRET = os.getenv("BINANCE_API_SECRET", "").strip()
BASE_URL   = os.getenv("BINANCE_BASE_URL", "https://testnet.binancefuture.com").strip()

print("=" * 55)
print("  Binance Futures Testnet — Connection Check")
print("=" * 55)

# ── 1. Check .env values ──────────────────────────────────────
print("\n[1] Checking .env values...")

if not API_KEY:
    print("  ✗  BINANCE_API_KEY is empty — check your .env file")
    sys.exit(1)
if not API_SECRET:
    print("  ✗  BINANCE_API_SECRET is empty — check your .env file")
    sys.exit(1)

print(f"  ✓  API Key    : {API_KEY[:8]}...{API_KEY[-4:]}")
print(f"  ✓  API Secret : {API_SECRET[:4]}...{API_SECRET[-4:]}")
print(f"  ✓  Base URL   : {BASE_URL}")

# Check for common mistakes
if " " in API_KEY or "\n" in API_KEY:
    print("  ✗  API Key contains whitespace — remove spaces/quotes from .env")
    sys.exit(1)
if " " in API_SECRET or "\n" in API_SECRET:
    print("  ✗  API Secret contains whitespace — remove spaces/quotes from .env")
    sys.exit(1)
if "your_" in API_KEY.lower() or "here" in API_KEY.lower():
    print("  ✗  API Key looks like the placeholder — paste your real key")
    sys.exit(1)
if "binance.vision" in BASE_URL:
    print("  ✗  BASE_URL points to SPOT testnet (binance.vision)")
    print("     Must be: https://testnet.binancefuture.com")
    sys.exit(1)

# ── 2. Test network + unsigned endpoint ─────────────────────
print("\n[2] Testing network connection (unsigned)...")
try:
    from bot.client import BinanceFuturesClient, BinanceClientError, NetworkError
    client = BinanceFuturesClient(API_KEY, API_SECRET, BASE_URL)
    price_data = client.get_ticker_price("BTCUSDT")
    print(f"  ✓  BTCUSDT mark price: ${float(price_data['price']):,.2f}")
except NetworkError as e:
    print(f"  ✗  Network error: {e}")
    print("     Check your internet connection.")
    sys.exit(1)
except Exception as e:
    print(f"  ✗  Unexpected error: {e}")
    sys.exit(1)

# ── 3. Test signed endpoint (account) ───────────────────────
print("\n[3] Testing signed request (account info)...")
try:
    account = client.get_account()
    balance = account.get("totalWalletBalance", "N/A")
    print(f"  ✓  Account connected! Wallet balance: {balance} USDT")
except BinanceClientError as e:
    print(f"  ✗  API Error [{e.code}]: {e.message}")
    if e.code == -2015:
        print()
        print("  DIAGNOSIS: Invalid API key. Common causes:")
        print("  1. You used SPOT testnet keys (testnet.binance.vision)")
        print("     → Must use FUTURES testnet: testnet.binancefuture.com")
        print("  2. Key was pasted with extra spaces or quotes")
        print("     → Open .env and ensure: KEY=value (no spaces, no quotes)")
        print("  3. Key has expired (testnet resets periodically)")
        print("     → Go to testnet.binancefuture.com and regenerate")
        print("  4. Futures trading not enabled on the key")
        print("     → On testnet this is auto-enabled, regenerate the key")
    sys.exit(1)
except Exception as e:
    print(f"  ✗  Unexpected: {e}")
    sys.exit(1)
finally:
    client.close()

# ── 4. All good ───────────────────────────────────────────────
print()
print("=" * 55)
print("  All checks passed! You can now run:")
print("  python api_server.py")
print("=" * 55)
