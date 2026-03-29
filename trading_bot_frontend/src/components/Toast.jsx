// ── components/Toast.jsx ──────────────────────────────────────────────────────

export default function Toast({ message, type = "success", onClose }) {
  const isSuccess = type === "success";

  return (
    <div
      className="slide-in"
      role="alert"
      style={{
        position:   "fixed",
        top:        24,
        right:      24,
        zIndex:     1000,
        background: isSuccess ? "var(--color-green-bg)" : "var(--color-red-bg)",
        border:     `1px solid ${isSuccess ? "var(--color-green-border)" : "var(--color-red-border)"}`,
        borderLeft: `4px solid ${isSuccess ? "var(--color-green)" : "var(--color-red)"}`,
        borderRadius: "var(--radius-md)",
        padding:    "14px 20px",
        minWidth:   300,
        maxWidth:   420,
        display:    "flex",
        alignItems: "center",
        gap:        12,
        boxShadow:  "var(--shadow-lg)",
      }}
    >
      {/* Icon */}
      <span style={{
        fontSize: 18,
        color:    isSuccess ? "var(--color-green)" : "var(--color-red)",
        flexShrink: 0,
      }}>
        {isSuccess ? "✓" : "✗"}
      </span>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontWeight: 600,
          fontSize:   13,
          color:      isSuccess ? "var(--color-green)" : "var(--color-red)",
        }}>
          {isSuccess ? "Order Placed Successfully" : "Order Failed"}
        </div>
        <div style={{
          fontSize:    12,
          color:       "var(--color-text-secondary)",
          marginTop:   3,
          wordBreak:   "break-word",
        }}>
          {message}
        </div>
      </div>

      {/* Close */}
      <button
        onClick={onClose}
        aria-label="Close notification"
        style={{
          background: "none",
          border:     "none",
          color:      "var(--color-text-muted)",
          fontSize:   20,
          lineHeight: 1,
          padding:    "0 2px",
          flexShrink: 0,
        }}
      >
        ×
      </button>
    </div>
  );
}
