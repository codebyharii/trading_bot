// ── pages/AccountPage.jsx ────────────────────────────────────────────────────
import { useState, useEffect } from "react";
import { getAccount } from "../services/api";
import { Card, SectionHeader, Divider } from "../components/Layout";
import Badge from "../components/Badge";

export default function AccountPage({ showToast }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAccount = async () => {
    setLoading(true);
    try {
      const result = await getAccount();
      setData(result);
    } catch (err) {
      showToast(err.message || "Failed to fetch account.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAccount(); }, []);

  if (loading) {
    return (
      <div className="fade-in" style={{ padding: 40, color: "var(--color-text-muted)", animation: "pulse 1.5s infinite" }}>
        Loading account…
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* ── Page header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <SectionHeader title="Account Overview" subtitle="Binance Futures Testnet · USDT-M" />
        <button
          onClick={fetchAccount}
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

      {data && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* ── Total wallet balance hero ── */}
          <TotalBalanceHero balance={data.totalWalletBalance} />

          {/* ── Asset balances ── */}
          <AssetTable assets={data.assets} />

          {/* ── Open positions ── */}
          {data.positions?.length > 0 && (
            <PositionsTable positions={data.positions} />
          )}
        </div>
      )}
    </div>
  );
}

// ── TotalBalanceHero ──────────────────────────────────────────────────────────
function TotalBalanceHero({ balance }) {
  const formatted = balance
    ? `$${parseFloat(balance).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
    : "—";

  return (
    <div style={{
      background:   "var(--color-navy)",
      borderRadius: "var(--radius-md)",
      padding:      "28px 32px",
      boxShadow:    "var(--shadow-lg)",
    }}>
      <div style={{
        fontSize:      11,
        color:         "rgba(255,255,255,0.55)",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        fontWeight:    600,
      }}>
        Total Wallet Balance
      </div>
      <div style={{
        fontFamily: "var(--font-serif)",
        fontSize:   46,
        fontWeight: 700,
        color:      "#ffffff",
        marginTop:  10,
        lineHeight: 1,
      }}>
        {formatted}
      </div>
      <div style={{
        fontSize:  11,
        color:     "rgba(255,255,255,0.38)",
        marginTop: 8,
      }}>
        USDT Equivalent · Testnet Account
      </div>
    </div>
  );
}

// ── AssetTable ────────────────────────────────────────────────────────────────
function AssetTable({ assets = [] }) {
  const COL = "100px 1fr 1fr 1fr";

  return (
    <Card style={{ padding: 0, overflow: "hidden" }}>
      {/* Header */}
      <div style={{
        padding:    "13px 22px",
        borderBottom: "1px solid var(--color-border)",
        fontWeight: 600,
        fontSize:   13,
        color:      "var(--color-navy)",
      }}>
        Asset Balances
      </div>

      {/* Column labels */}
      <div style={{
        display:             "grid",
        gridTemplateColumns: COL,
        padding:             "10px 22px",
        background:          "var(--color-surface)",
        borderBottom:        "1px solid var(--color-border)",
        fontSize:            10,
        fontWeight:          700,
        color:               "var(--color-text-muted)",
        letterSpacing:       "0.09em",
        textTransform:       "uppercase",
      }}>
        {["Asset", "Wallet Balance", "Available", "Unrealised PnL"].map((h) => (
          <div key={h}>{h}</div>
        ))}
      </div>

      {assets.length === 0 ? (
        <div style={{ padding: 24, textAlign: "center", color: "var(--color-text-muted)", fontSize: 13 }}>
          No non-zero balances
        </div>
      ) : assets.map((a, i) => {
        const pnl    = parseFloat(a.unrealizedProfit || 0);
        const pnlPos = pnl >= 0;
        return (
          <div key={a.asset} style={{
            display:             "grid",
            gridTemplateColumns: COL,
            padding:             "13px 22px",
            borderBottom:        i < assets.length - 1 ? "1px solid var(--color-border)" : "none",
            alignItems:          "center",
          }}>
            <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--color-navy)", fontSize: 13 }}>
              {a.asset}
            </div>
            <MetricCell value={parseFloat(a.walletBalance).toFixed(4)} />
            <MetricCell value={parseFloat(a.availableBalance || 0).toFixed(4)} />
            <MetricCell
              value={pnl.toFixed(4)}
              color={pnlPos ? "var(--color-green)" : "var(--color-red)"}
              prefix={pnlPos ? "+" : ""}
            />
          </div>
        );
      })}
    </Card>
  );
}

// ── PositionsTable ────────────────────────────────────────────────────────────
function PositionsTable({ positions }) {
  const COL = "1fr 90px 1fr 1fr 1fr";

  return (
    <Card style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ padding: "13px 22px", borderBottom: "1px solid var(--color-border)", fontWeight: 600, fontSize: 13, color: "var(--color-navy)" }}>
        Open Positions
      </div>

      <div style={{
        display:             "grid",
        gridTemplateColumns: COL,
        padding:             "10px 22px",
        background:          "var(--color-surface)",
        borderBottom:        "1px solid var(--color-border)",
        fontSize:            10, fontWeight: 700,
        color:               "var(--color-text-muted)",
        letterSpacing:       "0.09em", textTransform: "uppercase",
      }}>
        {["Symbol", "Direction", "Size", "Entry Price", "Unrealised PnL"].map((h) => <div key={h}>{h}</div>)}
      </div>

      {positions.map((p, i) => {
        const amt    = parseFloat(p.positionAmt);
        const isLong = amt > 0;
        const pnl    = parseFloat(p.unrealizedProfit || 0);
        return (
          <div key={p.symbol} style={{
            display:             "grid",
            gridTemplateColumns: COL,
            padding:             "13px 22px",
            borderBottom:        i < positions.length - 1 ? "1px solid var(--color-border)" : "none",
            alignItems:          "center",
          }}>
            <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--color-navy)", fontSize: 13 }}>
              {p.symbol}
            </div>
            <div>
              <Badge variant={isLong ? "green" : "red"}>{isLong ? "LONG" : "SHORT"}</Badge>
            </div>
            <MetricCell value={Math.abs(amt).toString()} />
            <MetricCell value={`$${parseFloat(p.entryPrice).toLocaleString()}`} />
            <MetricCell
              value={pnl.toFixed(4)}
              color={pnl >= 0 ? "var(--color-green)" : "var(--color-red)"}
              prefix={pnl >= 0 ? "+" : ""}
            />
          </div>
        );
      })}
    </Card>
  );
}

// ── MetricCell ────────────────────────────────────────────────────────────────
function MetricCell({ value, color, prefix = "" }) {
  return (
    <div style={{
      fontFamily: "var(--font-mono)",
      fontSize:   13,
      color:      color || "var(--color-text-primary)",
      fontWeight: color ? 600 : 400,
    }}>
      {prefix}{value}
    </div>
  );
}
