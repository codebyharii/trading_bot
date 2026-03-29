// ── components/Header.jsx ─────────────────────────────────────────────────────
import Badge from "./Badge";

export default function Header({ apiStatus }) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric",
  });

  return (
    <header style={{
      background: "var(--color-header)",
      borderBottom: "2px solid var(--color-navy)",
      padding: "0 32px",
      height: 62,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      zIndex: 100,
      boxShadow: "var(--shadow-card)",
    }}>
      {/* ── Logo ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div>
          <div style={{
            fontFamily: "var(--font-serif)",
            fontSize: 20,
            fontWeight: 700,
            color: "var(--color-navy)",
            letterSpacing: "0.02em",
            lineHeight: 1,
          }}>
            <span style={{ color: "var(--color-blue)" }}>J·P</span> TRADING
          </div>
          <div style={{
            fontSize: 9,
            color: "var(--color-text-muted)",
            letterSpacing: "0.15em",
            marginTop: 3,
            textTransform: "uppercase",
          }}>
            Futures Testnet · USDT-M
          </div>
        </div>

        <div style={{ width: 1, height: 30, background: "var(--color-border)" }} />
        <Badge variant="gold">TESTNET</Badge>
      </div>

      {/* ── Right side ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <ApiStatusIndicator status={apiStatus} />
        <span style={{
          fontSize: 11,
          color: "var(--color-text-muted)",
          fontFamily: "var(--font-mono)",
        }}>
          {today}
        </span>
      </div>
    </header>
  );
}

function ApiStatusIndicator({ status }) {
  const isOk = status === "ok";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--color-text-secondary)" }}>
      <span style={{
        display: "inline-block",
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: isOk ? "var(--color-green)" : "var(--color-red)",
        boxShadow: isOk ? "0 0 6px var(--color-green-border)" : "none",
        animation: isOk ? "pulse 2s infinite" : "none",
      }} />
      {isOk ? "API Connected" : status === "unknown" ? "Checking…" : "API Offline"}
    </div>
  );
}
