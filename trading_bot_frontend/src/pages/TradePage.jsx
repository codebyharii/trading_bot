// ── pages/TradePage.jsx ───────────────────────────────────────────────────────
import { useState } from "react";
import { placeOrder } from "../services/api";
import { Card, Divider, SectionHeader } from "../components/Layout";
import { FieldGroup, Input, Select, SideToggle } from "../components/FormControls";
import PriceCard from "../components/PriceCard";

const ORDER_TYPES = [
  { value: "MARKET",             label: "Market"                },
  { value: "LIMIT",              label: "Limit"                 },
  { value: "STOP_MARKET",        label: "Stop Market"           },
  { value: "STOP",               label: "Stop Limit"            },
  { value: "TAKE_PROFIT_MARKET", label: "Take Profit Market"    },
];

const TIF_OPTIONS = [
  { value: "GTC", label: "GTC — Good Till Cancel"   },
  { value: "IOC", label: "IOC — Immediate or Cancel" },
  { value: "FOK", label: "FOK — Fill or Kill"        },
];

const INITIAL_FORM = {
  symbol:      "BTCUSDT",
  side:        "BUY",
  orderType:   "MARKET",
  quantity:    "",
  price:       "",
  stopPrice:   "",
  timeInForce: "GTC",
  reduceOnly:  false,
};

export default function TradePage({ showToast }) {
  const [form, setForm]       = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);

  const set = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e?.target ? e.target.value : e }));

  const requiresPrice = ["LIMIT", "STOP"].includes(form.orderType);
  const requiresStop  = ["STOP_MARKET", "STOP", "TAKE_PROFIT", "TAKE_PROFIT_MARKET"].includes(form.orderType);
  const showTif       = form.orderType !== "MARKET";

  const validate = () => {
    if (!form.symbol.trim())              return "Symbol is required.";
    if (!form.quantity || parseFloat(form.quantity) <= 0) return "Enter a valid quantity.";
    if (requiresPrice && !form.price)     return "Price is required for this order type.";
    if (requiresStop && !form.stopPrice)  return "Stop price is required for this order type.";
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) { showToast(err, "error"); return; }

    setLoading(true);
    try {
      const payload = {
        symbol:         form.symbol.toUpperCase().trim(),
        side:           form.side,
        order_type:     form.orderType,
        quantity:       parseFloat(form.quantity),
        time_in_force:  form.timeInForce,
        reduce_only:    form.reduceOnly,
      };
      if (requiresPrice) payload.price      = parseFloat(form.price);
      if (requiresStop)  payload.stop_price = parseFloat(form.stopPrice);

      const result = await placeOrder(payload);
      setLastOrder(result);
      showToast(`Order #${result.orderId} — ${result.status}`, "success");
      setForm((f) => ({ ...f, quantity: "", price: "", stopPrice: "" }));
    } catch (err) {
      showToast(err.message || "Order failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  const isBuy = form.side === "BUY";

  return (
    <div className="fade-in">
      <SectionHeader
        title="Place Order"
        subtitle="Binance Futures Testnet · USDT-M Perpetuals"
      />

      <div style={{ height: 20 }} />

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
        {/* ── Order form ── */}
        <Card style={{ flex: 1 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Symbol + Order type */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <FieldGroup label="Symbol" required>
                <Input
                  value={form.symbol}
                  onChange={set("symbol")}
                  placeholder="BTCUSDT"
                />
              </FieldGroup>
              <FieldGroup label="Order Type" required>
                <Select
                  value={form.orderType}
                  onChange={set("orderType")}
                  options={ORDER_TYPES}
                />
              </FieldGroup>
            </div>

            {/* Side */}
            <FieldGroup label="Side" required>
              <SideToggle value={form.side} onChange={set("side")} />
            </FieldGroup>

            {/* Quantity */}
            <FieldGroup label="Quantity" required>
              <Input
                type="number"
                value={form.quantity}
                onChange={set("quantity")}
                placeholder="0.001"
              />
            </FieldGroup>

            {/* Limit price */}
            {requiresPrice && (
              <FieldGroup label="Limit Price" required>
                <Input
                  type="number"
                  value={form.price}
                  onChange={set("price")}
                  placeholder="67000.00"
                />
              </FieldGroup>
            )}

            {/* Stop price */}
            {requiresStop && (
              <FieldGroup label="Stop Price" required>
                <Input
                  type="number"
                  value={form.stopPrice}
                  onChange={set("stopPrice")}
                  placeholder="65000.00"
                />
              </FieldGroup>
            )}

            {/* Time in force */}
            {showTif && (
              <FieldGroup label="Time in Force">
                <Select
                  value={form.timeInForce}
                  onChange={set("timeInForce")}
                  options={TIF_OPTIONS}
                />
              </FieldGroup>
            )}

            {/* Reduce-only toggle */}
            <label style={{
              display:    "flex",
              alignItems: "center",
              gap:        8,
              fontSize:   12,
              color:      "var(--color-text-secondary)",
              cursor:     "pointer",
            }}>
              <input
                type="checkbox"
                checked={form.reduceOnly}
                onChange={(e) => setForm((f) => ({ ...f, reduceOnly: e.target.checked }))}
                style={{ accentColor: "var(--color-blue)" }}
              />
              Reduce-only order
            </label>

            <Divider />

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                padding:       "13px",
                background:    loading
                  ? "var(--color-text-muted)"
                  : isBuy
                    ? "linear-gradient(135deg, var(--color-green), #005c2e)"
                    : "linear-gradient(135deg, var(--color-red), #991b1b)",
                border:        "none",
                borderRadius:  "var(--radius-sm)",
                color:         "#fff",
                fontSize:      13,
                fontWeight:    700,
                letterSpacing: "0.08em",
                cursor:        loading ? "not-allowed" : "pointer",
                transition:    "all 0.2s ease",
                boxShadow:     loading
                  ? "none"
                  : isBuy
                    ? "0 3px 12px rgba(0,113,58,.3)"
                    : "0 3px 12px rgba(185,28,28,.3)",
              }}
            >
              {loading
                ? "PLACING ORDER…"
                : `${isBuy ? "▲" : "▼"} PLACE ${form.side} ORDER`}
            </button>
          </div>
        </Card>

        {/* ── Price + info cards ── */}
        <PriceCard symbol={form.symbol} />
      </div>

      {/* ── Last order confirmation ── */}
      {lastOrder && (
        <div style={{ marginTop: 24 }}>
          <OrderConfirmation order={lastOrder} onDismiss={() => setLastOrder(null)} />
        </div>
      )}
    </div>
  );
}

// ── Inline order confirmation panel ──────────────────────────────────────────
function OrderConfirmation({ order, onDismiss }) {
  const rows = [
    ["Order ID",    order.orderId],
    ["Symbol",      order.symbol],
    ["Side",        order.side],
    ["Type",        order.type],
    ["Status",      order.status],
    ["Orig Qty",    order.origQty],
    ["Exec Qty",    order.executedQty],
    ["Avg Price",   order.avgPrice || order.price || "—"],
  ];

  return (
    <Card style={{ borderLeft: "4px solid var(--color-green)" }} className="fade-in">
      <div style={{
        display:        "flex",
        justifyContent: "space-between",
        alignItems:     "center",
        marginBottom:   14,
      }}>
        <div style={{
          fontSize:   13,
          fontWeight: 600,
          color:      "var(--color-green)",
        }}>
          ✓ Order Confirmed
        </div>
        <button
          onClick={onDismiss}
          style={{
            background: "none", border: "none",
            color:      "var(--color-text-muted)",
            fontSize:   18, cursor: "pointer",
          }}
        >×</button>
      </div>

      <div style={{
        display:             "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap:                 12,
      }}>
        {rows.map(([label, value]) => (
          <div key={label}>
            <div style={{ fontSize: 10, color: "var(--color-text-muted)", marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</div>
            <div style={{ fontSize: 13, fontFamily: "var(--font-mono)", color: "var(--color-text-primary)", fontWeight: 500 }}>{String(value)}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}
