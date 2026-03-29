// ── components/Sidebar.jsx ────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: "trade",   icon: "⬡", label: "Place Order"  },
  { id: "orders",  icon: "≡", label: "Open Orders"  },
  { id: "account", icon: "◈", label: "Account"      },
];

export default function Sidebar({ activeTab, onTabChange }) {
  return (
    <aside style={{
      width: 210,
      minHeight: "100%",
      background: "var(--color-sidebar)",
      borderRight: "1px solid var(--color-border)",
      padding: "24px 0",
      display: "flex",
      flexDirection: "column",
      flexShrink: 0,
    }}>
      {/* Section label */}
      <div style={{
        padding: "0 18px 14px",
        fontSize: 10,
        letterSpacing: "0.12em",
        color: "var(--color-text-muted)",
        textTransform: "uppercase",
        fontWeight: 600,
      }}>
        Navigation
      </div>

      {/* Nav items */}
      {NAV_ITEMS.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "11px 20px",
              background: isActive ? "var(--color-blue-pale)" : "transparent",
              border: "none",
              borderLeft: `3px solid ${isActive ? "var(--color-blue)" : "transparent"}`,
              color: isActive ? "var(--color-blue)" : "var(--color-text-secondary)",
              fontSize: 13,
              fontWeight: isActive ? 600 : 400,
              textAlign: "left",
              transition: "all 0.15s ease",
              cursor: "pointer",
              width: "100%",
            }}
            onMouseEnter={(e) => {
              if (!isActive) e.currentTarget.style.background = "var(--color-border)";
            }}
            onMouseLeave={(e) => {
              if (!isActive) e.currentTarget.style.background = "transparent";
            }}
          >
            <span style={{ fontSize: 15 }}>{item.icon}</span>
            {item.label}
          </button>
        );
      })}

      {/* Footer */}
      <div style={{
        marginTop: "auto",
        padding: "14px 20px",
        borderTop: "1px solid var(--color-border)",
        fontSize: 10,
        color: "var(--color-text-muted)",
        letterSpacing: "0.08em",
        lineHeight: 1.9,
      }}>
        BINANCE FUTURES<br />TESTNET v1.0.0
      </div>
    </aside>
  );
}
