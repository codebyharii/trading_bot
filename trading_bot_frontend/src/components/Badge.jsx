// ── components/Badge.jsx ──────────────────────────────────────────────────────

const VARIANTS = {
  gold: {
    color:      "var(--color-gold)",
    background: "var(--color-gold-bg)",
    border:     "var(--color-gold-border)",
  },
  blue: {
    color:      "var(--color-blue)",
    background: "var(--color-blue-pale)",
    border:     "var(--color-blue)",
  },
  green: {
    color:      "var(--color-green)",
    background: "var(--color-green-bg)",
    border:     "var(--color-green-border)",
  },
  red: {
    color:      "var(--color-red)",
    background: "var(--color-red-bg)",
    border:     "var(--color-red-border)",
  },
};

/**
 * @param {{ variant?: "gold"|"blue"|"green"|"red", children: React.ReactNode }} props
 */
export default function Badge({ variant = "blue", children }) {
  const s = VARIANTS[variant] ?? VARIANTS.blue;
  return (
    <span style={{
      background:    s.background,
      border:        `1px solid ${s.border}55`,
      color:         s.color,
      borderRadius:  "var(--radius-sm)",
      padding:       "2px 8px",
      fontSize:      11,
      fontWeight:    600,
      letterSpacing: "0.05em",
      textTransform: "uppercase",
      fontFamily:    "var(--font-mono)",
      whiteSpace:    "nowrap",
    }}>
      {children}
    </span>
  );
}
