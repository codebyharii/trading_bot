// ── components/Layout.jsx ─────────────────────────────────────────────────────
// Small structural / layout primitives.

// ── Divider ───────────────────────────────────────────────────────────────────
export function Divider({ style }) {
  return (
    <div
      role="separator"
      style={{
        height:     1,
        background: "var(--color-border)",
        ...style,
      }}
    />
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────
export function Card({ children, style }) {
  return (
    <div style={{
      background:   "var(--color-card)",
      border:       "1px solid var(--color-border)",
      borderRadius: "var(--radius-md)",
      padding:      24,
      boxShadow:    "var(--shadow-card)",
      ...style,
    }}>
      {children}
    </div>
  );
}

// ── SectionHeader ──────────────────────────────────────────────────────────────
export function SectionHeader({ title, subtitle }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <h2 style={{
        fontFamily: "var(--font-serif)",
        fontSize:   20,
        fontWeight: 700,
        color:      "var(--color-navy)",
        lineHeight: 1.2,
      }}>
        {title}
      </h2>
      {subtitle && (
        <p style={{
          fontSize:  12,
          color:     "var(--color-text-muted)",
          marginTop: 4,
        }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
