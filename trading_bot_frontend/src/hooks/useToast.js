// ── hooks/useToast.js ─────────────────────────────────────────────────────────
import { useState, useCallback } from "react";

const DURATION_MS = 5_000;

/**
 * Simple toast notification state manager.
 * @returns {{ toast, showToast, clearToast }}
 */
export function useToast() {
  const [toast, setToast] = useState(null); // { message: string, type: "success"|"error" }

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), DURATION_MS);
  }, []);

  const clearToast = useCallback(() => setToast(null), []);

  return { toast, showToast, clearToast };
}
