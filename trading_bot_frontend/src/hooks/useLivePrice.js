// ── hooks/useLivePrice.js ─────────────────────────────────────────────────────
import { useState, useEffect, useCallback } from "react";
import { getPrice } from "../services/api";

const POLL_INTERVAL_MS = 10_000;

/**
 * Fetches and auto-refreshes the mark price for the given symbol.
 * @param {string} symbol  e.g. "BTCUSDT"
 * @returns {{ price: string|null, loading: boolean, refresh: () => void }}
 */
export function useLivePrice(symbol) {
  const [price, setPrice]     = useState(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!symbol) return;
    setLoading(true);
    try {
      const data = await getPrice(symbol);
      setPrice(
        parseFloat(data.price).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      );
    } catch {
      setPrice(null);
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [refresh]);

  return { price, loading, refresh };
}
