// ── components/PriceCard.jsx ──────────────────────────────────────────────────
import { Card } from "./Layout";
import { useLivePrice } from "../hooks/useLivePrice";

const ORDER_TYPE_INFO = [
  { name: "MARKET",      desc: "Execute at best available price immediately" },
  { name: "LIMIT",       desc: "Set a specific entry or exit price" },
  { name: "STOP MARKET", desc: "Trigger a market order at a threshold price" },
];

export default function PriceCard({ symbol }) {
  const { price, loading, refresh } = useLivePrice(symbol);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, width: 230 }}>
      {/* Mark price */}
      <Card style={{ padding: 20 }}>
        <div style={{
          fontSize:      10,
          color:         "var(--color-text-muted)",
          letterSpacing: "0.09em",
          textTransform: "uppercase",
          marginBottom:  10,
          fontWeight:    600,
        }}>
          Mark Price
        </div>

        <div style={{
          fontFamily: "var(--font-mono)",
          fontSize:   26,
          fontWeight: 600,
          color:      "var(--color-navy)",
          lineHeight: 1,
          minHeight:  32,
        }}>
          {loading ? (
            <span className="pulse" style={{ color: "var(--color-text-muted)", display: "block" }}>—</span>
          ) : price ? (
            `$${price}`
          ) : (
            <span style={{ color: "var(--color-text-muted)", fontSize: 14 }}>Unavailable</span>
          )}
        </div>

        <div style={{
          fontSize:  11,
          color:     "var(--color-text-muted)",
          marginTop: 6,
        }}>
          {symbol?.toUpperCase() || "—"}
        </div>

        <button
          onClick={refresh}
          style={{
            marginTop:    12,
            padding:      "6px 12px",
            background:   "var(--color-blue-pale)",
            border:       "1px solid var(--color-blue)44",
            borderRadius: "var(--radius-sm)",
            color:        "var(--color-blue)",
            fontSize:     11,
            cursor:       "pointer",
            fontWeight:   500,
          }}
        >
          ↻ Refresh
        </button>
      </Card>

      {/* Order type guide */}
      <Card style={{ padding: 20 }}>
        <div style={{
          fontSize:      10,
          color:         "var(--color-text-muted)",
          letterSpacing: "0.09em",
          textTransform: "uppercase",
          marginBottom:  14,
          fontWeight:    600,
        }}>
          Order Types
        </div>

        {ORDER_TYPE_INFO.map(({ name, desc }) => (
          <div key={name} style={{ marginBottom: 12 }}>
            <div style={{
              fontSize:   12,
              fontWeight: 600,
              color:      "var(--color-navy)",
            }}>
              {name}
            </div>
            <div style={{
              fontSize:   11,
              color:      "var(--color-text-muted)",
              marginTop:  3,
              lineHeight: 1.4,
            }}>
              {desc}
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
