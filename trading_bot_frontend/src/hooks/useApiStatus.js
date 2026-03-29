// ── hooks/useApiStatus.js ─────────────────────────────────────────────────────
import { useState, useEffect } from "react";
import { checkHealth } from "../services/api";

const POLL_INTERVAL_MS = 15_000;

/**
 * Polls the backend health endpoint every 15 seconds.
 * Returns: "unknown" | "ok" | "error"
 */
export function useApiStatus() {
  const [status, setStatus] = useState("unknown");

  useEffect(() => {
    let cancelled = false;

    const ping = async () => {
      try {
        await checkHealth();
        if (!cancelled) setStatus("ok");
      } catch {
        if (!cancelled) setStatus("error");
      }
    };

    ping();
    const id = setInterval(ping, POLL_INTERVAL_MS);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  return status;
}
