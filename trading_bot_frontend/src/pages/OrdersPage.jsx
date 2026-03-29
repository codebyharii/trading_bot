// ── pages/OrdersPage.jsx ─────────────────────────────────────────────────────
import { useState, useEffect, useCallback } from "react";
import { getOpenOrders, cancelOrder } from "../services/api";
import { Card, SectionHeader } from "../components/Layout";
import Badge from "../components/Badge";

const COL = "1.4fr 70px 120px 120px 130px 110px 90px";

export default function OrdersPage({ showToast }) {
  const [orders,     setOrders]     = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [filter,     setFilter]     = useState("");
  const [cancelling, setCancelling] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getOpenOrders(filter.trim() || null);
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast(err.message || "Failed to fetch orders.", "error");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  // Fetch on mount only (user refreshes manually or by symbol change)
  useEffect(() => { fetchOrders(); }, []);

  const handleCancel = async (order) => {
    setCancelling(order.orderId);
    try {
      await cancelOrder(order.symbol, order.orderId);
      showToast(`Order #${order.orderId} cancelled successfully.`, "success");
      fetchOrders();
    } catch (err) {
      showToast(err.message || "Cancel failed.", "error");
    } finally {
      setCancelling(null);
    }
  };

  const statusVariant = (status) => {
    if (status === "NEW")            return "blue";
    if (status === "PARTIALLY_FILLED") return "gold";
    if (status === "FILLED")         return "green";
    return "gold";
  };

  return (
    <div className="fade-in">
      {/* ── Page header ── */}
      <div style={{
        display:        "flex",
        alignItems:     "flex-start",
        justifyContent: "space-between",
        marginBottom:   24,
      }}>
        <SectionHeader
          title="Open Orders"
          subtitle={`${orders.length} active order${orders.length !== 1 ? "s" : ""}`}
        />

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter by symbol…"
            style={{
              background:   "var(--color-input)",
              border:       "1px solid var(--color-border)",
              borderRadius: "var(--radius-sm)",
              padding:      "9px 12px",
              fontSize:     13,
              color:        "var(--color-text-primary)",
              fontFamily:   "var(--font-mono)",
              width:        180,
            }}
            onFocus={(e) => { e.target.style.borderColor = "var(--color-blue)"; e.target.style.boxShadow = "0 0 0 3px var(--color-blue-pale)"; }}
            onBlur={(e)  => { e.target.style.borderColor = "var(--color-border)"; e.target.style.boxShadow = "none"; }}
            onKeyDown={(e) => e.key === "Enter" && fetchOrders()}
          />
          <button
            onClick={fetchOrders}
            style={{
              padding:      "9px 16px",
              background:   "var(--color-blue-pale)",
              border:       "1px solid var(--color-blue)44",
              borderRadius: "var(--radius-sm)",
              color:        "var(--color-blue)",
              fontSize:     13,
              fontWeight:   500,
              cursor:       "pointer",
            }}
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* ── Table card ── */}
      <Card style={{ padding: 0, overflow: "hidden" }}>
        {/* Table header */}
        <div style={{
          display:             "grid",
          gridTemplateColumns: COL,
          padding:             "11px 20px",
          background:          "var(--color-surface)",
          borderBottom:        "1px solid var(--color-border)",
          fontSize:            10,
          fontWeight:          700,
          color:               "var(--color-text-muted)",
          letterSpacing:       "0.09em",
          textTransform:       "uppercase",
        }}>
          {["Symbol", "Side", "Type", "Orig Qty", "Price", "Status", "Action"].map((h) => (
            <div key={h}>{h}</div>
          ))}
        </div>

        {/* Rows */}
        {loading ? (
          <EmptyState icon="↻" text="Loading orders…" pulse />
        ) : orders.length === 0 ? (
          <EmptyState icon="◈" text="No open orders found" />
        ) : (
          orders.map((order, i) => (
            <OrderRow
              key={order.orderId}
              order={order}
              last={i === orders.length - 1}
              cancelling={cancelling === order.orderId}
              onCancel={() => handleCancel(order)}
              statusVariant={statusVariant}
              colGrid={COL}
            />
          ))
        )}
      </Card>
    </div>
  );
}

// ── OrderRow ─────────────────────────────────────────────────────────────────
function OrderRow({ order, last, cancelling, onCancel, statusVariant, colGrid }) {
  const [hovered, setHovered] = useState(false);
  const price = parseFloat(order.price);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display:             "grid",
        gridTemplateColumns: colGrid,
        padding:             "13px 20px",
        borderBottom:        last ? "none" : "1px solid var(--color-border)",
        background:          hovered ? "var(--color-surface)" : "transparent",
        transition:          "background 0.15s",
        alignItems:          "center",
      }}
    >
      <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--color-navy)", fontSize: 13 }}>
        {order.symbol}
      </div>
      <div style={{
        color:      order.side === "BUY" ? "var(--color-green)" : "var(--color-red)",
        fontWeight: 700,
        fontSize:   12,
      }}>
        {order.side}
      </div>
      <div style={{ color: "var(--color-text-secondary)", fontSize: 12 }}>
        {order.type}
      </div>
      <div style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-secondary)", fontSize: 12 }}>
        {order.origQty}
      </div>
      <div style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-secondary)", fontSize: 12 }}>
        {price > 0 ? `$${price.toLocaleString()}` : "—"}
      </div>
      <div>
        <Badge variant={statusVariant(order.status)}>{order.status}</Badge>
      </div>
      <div>
        <button
          onClick={onCancel}
          disabled={cancelling}
          style={{
            padding:      "4px 10px",
            background:   hovered ? "var(--color-red-bg)" : "transparent",
            border:       "1px solid var(--color-red-border)88",
            borderRadius: "var(--radius-sm)",
            color:        "var(--color-red)",
            fontSize:     11,
            fontWeight:   500,
            cursor:       cancelling ? "not-allowed" : "pointer",
            transition:   "all 0.15s",
            opacity:      cancelling ? 0.5 : 1,
          }}
        >
          {cancelling ? "…" : "Cancel"}
        </button>
      </div>
    </div>
  );
}

// ── EmptyState ────────────────────────────────────────────────────────────────
function EmptyState({ icon, text, pulse }) {
  return (
    <div style={{
      padding:    48,
      textAlign:  "center",
      color:      "var(--color-text-muted)",
      animation:  pulse ? "pulse 1.5s infinite" : "none",
    }}>
      <div style={{ fontSize: 30, marginBottom: 10, color: "var(--color-border-mid)" }}>{icon}</div>
      <div style={{ fontSize: 13 }}>{text}</div>
    </div>
  );
}
