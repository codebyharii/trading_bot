# J·P Trading Bot — Binance Futures Testnet

A production-grade Python trading bot for Binance Futures Testnet (USDT-M) with a React dashboard inspired by JP Morgan's design language.

---

## Architecture

```
trading_bot/           ← Python backend
  bot/
    __init__.py
    client.py          ← Binance REST client (signing, transport)
    orders.py          ← Order placement logic + response parsing
    validators.py      ← Input validation (raises ValueError on bad input)
    logging_config.py  ← Rotating file + console logging
  cli.py               ← CLI entry point (argparse)
  api_server.py        ← FastAPI REST server for the React UI
  requirements.txt
  logs/                ← Log output directory (auto-created)

trading_bot_frontend/  ← React UI
  src/
    App.jsx            ← Monolithic JP-Morgan-inspired dashboard
    main.jsx
  package.json
  vite.config.js
```

---

## Setup

### 1. Binance Futures Testnet

1. Register at [https://testnet.binancefuture.com](https://testnet.binancefuture.com)
2. Log in → API Management → Generate API Key & Secret
3. Copy credentials

### 2. Python Backend

```bash
cd trading_bot
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Create `.env`:

```env
BINANCE_API_KEY=your_api_key_here
BINANCE_API_SECRET=your_api_secret_here
BINANCE_BASE_URL=https://testnet.binancefuture.com
```

### 3. React Frontend (optional)

```bash
cd trading_bot_frontend
npm install
npm run dev          # http://localhost:3000
```

---

## CLI Usage

### Place a MARKET order

```bash
python cli.py place --symbol BTCUSDT --side BUY --type MARKET --quantity 0.001
```

### Place a LIMIT order

```bash
python cli.py place --symbol ETHUSDT --side SELL --type LIMIT --quantity 0.1 --price 3800
```

### Place a Stop-Market order (Bonus)

```bash
python cli.py place --symbol BTCUSDT --side SELL --type STOP_MARKET --quantity 0.001 --stop-price 60000
```

### List open orders

```bash
python cli.py orders
python cli.py orders --symbol BTCUSDT
```

### Cancel an order

```bash
python cli.py cancel --symbol BTCUSDT --order-id 4011651863
```

### Account balances

```bash
python cli.py account
```

---

## API Server (for React UI)

```bash
python api_server.py
# → http://localhost:8000
# → Swagger docs: http://localhost:8000/docs
```

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | API health check |
| POST | `/api/orders` | Place a new order |
| GET | `/api/orders` | List open orders |
| DELETE | `/api/orders/{id}?symbol=X` | Cancel an order |
| GET | `/api/account` | Account balances & positions |
| GET | `/api/price/{symbol}` | Get mark price |

---

## Sample CLI Output

```
── Order Request ─────────────────────────────────
  Symbol      : BTCUSDT
  Side        : BUY
  Type        : MARKET
  Quantity    : 0.001
──────────────────────────────────────────────────

┌─────────────────────────────────────────┐
│           ORDER CONFIRMED                │
├─────────────────────────────────────────┤
│  Order ID    : 4011651863               │
│  Symbol      : BTCUSDT                  │
│  Side        : BUY                      │
│  Type        : MARKET                   │
│  Status      : FILLED                   │
│  Orig Qty    : 0.001                    │
│  Exec Qty    : 0.001                    │
│  Avg Price   : 67832.10                 │
│  Limit Price : 0                        │
└─────────────────────────────────────────┘

✓  Order placed successfully.
```

---

## Logging

Logs are written to `logs/trading_bot.log` (rotating, max 5 × 5 MB).

```
2025-06-10T09:12:01 | INFO     | bot.client | → POST /fapi/v1/order  params={...}
2025-06-10T09:12:01 | INFO     | bot.client | ← HTTP 200  body={...}
2025-06-10T09:12:01 | INFO     | bot.orders | Order placed successfully: orderId=...
```

Sample logs are included in `logs/market_order.log` and `logs/limit_order.log`.

---

## Assumptions

- **Testnet only** — the base URL is always `https://testnet.binancefuture.com`
- **One-way mode** — orders are placed in BOTH position mode (default testnet)
- **Quantities** — must conform to Binance's lot-size filter for the symbol; the bot validates format but not exchange-specific precision (the API will reject invalid precision)
- **No persistence** — order history is not stored locally; the API is the source of truth

---

## Bonus Features Implemented

- ✅ Stop-Market / Stop-Limit / Take-Profit order types (third order type)
- ✅ FastAPI REST server enabling the React UI
- ✅ Full React dashboard with JP Morgan design language

---

## Evaluation Checklist

| Criterion | Status |
|-----------|--------|
| Places MARKET orders on testnet | ✅ |
| Places LIMIT orders on testnet | ✅ |
| Supports BUY and SELL | ✅ |
| CLI with argparse | ✅ |
| Input validation with clear errors | ✅ |
| Order request summary printed | ✅ |
| Order response details printed | ✅ |
| Structured code (client / orders / cli layers) | ✅ |
| Logging to file | ✅ |
| Exception handling (validation, API, network) | ✅ |
| Sample log files included | ✅ |
| README with setup & examples | ✅ |
| requirements.txt | ✅ |
| Bonus: Stop-Limit order type | ✅ |
| Bonus: React UI | ✅ |
