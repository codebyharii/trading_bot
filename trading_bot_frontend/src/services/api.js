// ── services/api.js ──────────────────────────────────────────────────────────
// Single source of truth for all HTTP calls to the FastAPI backend.

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// ── Generic request helper ────────────────────────────────────────────────────
async function request(method, path, body = null) {
  const options = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (body) options.body = JSON.stringify(body);

  const response = await fetch(`${BASE_URL}${path}`, options);
  const data = await response.json();

  if (!response.ok) {
    const message =
      data?.detail?.message || data?.detail || `HTTP ${response.status}`;
    const error = new Error(message);
    error.code = data?.detail?.code;
    error.status = response.status;
    throw error;
  }

  return data;
}

// ── Health ────────────────────────────────────────────────────────────────────
export const checkHealth = () => request("GET", "/health");

// ── Orders ────────────────────────────────────────────────────────────────────
/**
 * Place a new order.
 * @param {{ symbol, side, order_type, quantity, price?, stop_price?, time_in_force?, reduce_only? }} payload
 */
export const placeOrder = (payload) => request("POST", "/api/orders", payload);

/**
 * List open orders. Optionally filter by symbol.
 * @param {string|null} symbol
 */
export const getOpenOrders = (symbol = null) => {
  const qs = symbol ? `?symbol=${symbol.toUpperCase()}` : "";
  return request("GET", `/api/orders${qs}`);
};

/**
 * Cancel an order by ID.
 * @param {string} symbol
 * @param {number} orderId
 */
export const cancelOrder = (symbol, orderId) =>
  request("DELETE", `/api/orders/${orderId}?symbol=${symbol.toUpperCase()}`);

// ── Account ───────────────────────────────────────────────────────────────────
export const getAccount = () => request("GET", "/api/account");

// ── Market Data ───────────────────────────────────────────────────────────────
export const getPrice = (symbol) =>
  request("GET", `/api/price/${symbol.toUpperCase()}`);
