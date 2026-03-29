#!/usr/bin/env python3
"""
FastAPI backend — exposes the trading bot over HTTP so the React UI can communicate with it.
"""

import os
from contextlib import asynccontextmanager
from typing import Annotated, Optional

import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator

from bot import BinanceClientError, BinanceFuturesClient, NetworkError, OrderManager, setup_logging
from bot.logging_config import get_logger

load_dotenv()
setup_logging()
logger = get_logger("api")


# ──────────────────────────────────────────────────────────────────────────────
# App bootstrap
# ──────────────────────────────────────────────────────────────────────────────

def _make_client() -> BinanceFuturesClient:
    key = os.getenv("BINANCE_API_KEY", "")
    secret = os.getenv("BINANCE_API_SECRET", "")
    base_url = os.getenv("BINANCE_BASE_URL", "https://testnet.binancefuture.com")
    if not key or not secret:
        raise RuntimeError("BINANCE_API_KEY and BINANCE_API_SECRET must be set.")
    return BinanceFuturesClient(api_key=key, api_secret=secret, base_url=base_url)


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.client = _make_client()
    app.state.manager = OrderManager(app.state.client)
    logger.info("Binance client initialised.")
    yield
    app.state.client.close()
    logger.info("Binance client closed.")


app = FastAPI(
    title="Trading Bot API",
    description="Binance Futures Testnet order management",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_manager() -> OrderManager:
    return app.state.manager


# ──────────────────────────────────────────────────────────────────────────────
# Schemas
# ──────────────────────────────────────────────────────────────────────────────


class PlaceOrderRequest(BaseModel):
    symbol: str
    side: str
    order_type: str
    quantity: float
    price: Optional[float] = None
    stop_price: Optional[float] = None
    time_in_force: str = "GTC"
    reduce_only: bool = False

    @field_validator("side")
    @classmethod
    def _upper_side(cls, v):
        return v.upper()

    @field_validator("order_type")
    @classmethod
    def _upper_type(cls, v):
        return v.upper()

    @field_validator("symbol")
    @classmethod
    def _upper_symbol(cls, v):
        return v.upper()


# ──────────────────────────────────────────────────────────────────────────────
# Routes
# ──────────────────────────────────────────────────────────────────────────────


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/api/orders")
def place_order(body: PlaceOrderRequest):
    manager = get_manager()
    logger.info("POST /api/orders  body=%s", body.model_dump())
    try:
        result = manager.place_order(
            symbol=body.symbol,
            side=body.side,
            order_type=body.order_type,
            quantity=body.quantity,
            price=body.price,
            stop_price=body.stop_price,
            time_in_force=body.time_in_force,
            reduce_only=body.reduce_only,
        )
    except ValueError as exc:
        logger.warning("Validation error: %s", exc)
        raise HTTPException(status_code=422, detail=str(exc))
    except BinanceClientError as exc:
        logger.error("Binance API error: %s", exc)
        raise HTTPException(status_code=400, detail={"code": exc.code, "message": exc.message})
    except NetworkError as exc:
        logger.error("Network error: %s", exc)
        raise HTTPException(status_code=503, detail=str(exc))

    return result.raw


@app.get("/api/orders")
def list_open_orders(symbol: Annotated[Optional[str], Query()] = None):
    manager = get_manager()
    try:
        return manager.get_open_orders(symbol)
    except (BinanceClientError, NetworkError) as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@app.delete("/api/orders/{order_id}")
def cancel_order(order_id: int, symbol: Annotated[str, Query()]):
    manager = get_manager()
    try:
        return manager.cancel_order(symbol, order_id)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except (BinanceClientError, NetworkError) as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@app.get("/api/account")
def get_account():
    manager = get_manager()
    try:
        info = manager.get_account_info()
        assets = [a for a in info.get("assets", []) if float(a.get("walletBalance", 0)) != 0]
        positions = [p for p in info.get("positions", []) if float(p.get("positionAmt", 0)) != 0]
        return {"assets": assets, "positions": positions, "totalWalletBalance": info.get("totalWalletBalance")}
    except (BinanceClientError, NetworkError) as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@app.get("/api/price/{symbol}")
def get_price(symbol: str):
    client = app.state.client
    try:
        return client.get_ticker_price(symbol.upper())
    except (BinanceClientError, NetworkError) as exc:
        raise HTTPException(status_code=400, detail=str(exc))


if __name__ == "__main__":
    uvicorn.run("api_server:app", host="0.0.0.0", port=8000, reload=True)
