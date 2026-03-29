// ── components/FormControls.jsx ───────────────────────────────────────────────
// All reusable form primitives in one file.

// ── FieldGroup ────────────────────────────────────────────────────────────────
export function FieldGroup({ label, required, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{
        fontSize:      10,
        fontWeight:    600,
        color:         "var(--color-text-muted)",
        letterSpacing: "0.09em",
        textTransform: "uppercase",
      }}>
        {label}
        {required && (
          <span style={{ color: "var(--color-blue)", marginLeft: 3 }}>*</span>
        )}
      </label>
      {children}
    </div>
  );
}

// ── shared input styles ───────────────────────────────────────────────────────
const baseInput = {
  background:  "var(--color-input)",
  border:      "1px solid var(--color-border)",
  borderRadius: "var(--radius-sm)",
  padding:     "10px 12px",
  color:       "var(--color-text-primary)",
  fontSize:    14,
  width:       "100%",
  transition:  "border-color 0.2s, box-shadow 0.2s",
};

function focusStyle(e) {
  e.target.style.borderColor = "var(--color-blue)";
  e.target.style.boxShadow  = "0 0 0 3px var(--color-blue-pale)";
}
function blurStyle(e) {
  e.target.style.borderColor = "var(--color-border)";
  e.target.style.boxShadow  = "none";
}

// ── Input ─────────────────────────────────────────────────────────────────────
export function Input({ value, onChange, placeholder, type = "text", disabled = false }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      style={{
        ...baseInput,
        fontFamily: "var(--font-mono)",
        opacity:    disabled ? 0.5 : 1,
      }}
      onFocus={focusStyle}
      onBlur={blurStyle}
    />
  );
}

// ── Select ────────────────────────────────────────────────────────────────────
export function Select({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={onChange}
      style={{
        ...baseInput,
        appearance:          "none",
        WebkitAppearance:    "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%23003566' d='M1 1l5 5 5-5'/%3E%3C/svg%3E")`,
        backgroundRepeat:    "no-repeat",
        backgroundPosition:  "right 12px center",
        paddingRight:        32,
        cursor:              "pointer",
      }}
      onFocus={focusStyle}
      onBlur={blurStyle}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

// ── SideToggle (BUY / SELL) ───────────────────────────────────────────────────
export function SideToggle({ value, onChange }) {
  return (
    <div style={{
      display:      "flex",
      borderRadius: "var(--radius-sm)",
      overflow:     "hidden",
      border:       "1px solid var(--color-border-mid)",
    }}>
      {["BUY", "SELL"].map((side) => {
        const isActive = value === side;
        const activeColor = side === "BUY" ? "var(--color-green)" : "var(--color-red)";
        return (
          <button
            key={side}
            onClick={() => onChange(side)}
            style={{
              flex:          1,
              padding:       "10px",
              border:        "none",
              background:    isActive ? activeColor : "var(--color-input)",
              color:         isActive ? "#fff" : "var(--color-text-muted)",
              fontWeight:    700,
              fontSize:      13,
              letterSpacing: "0.08em",
              transition:    "all 0.2s ease",
            }}
          >
            {side === "BUY" ? "▲ BUY" : "▼ SELL"}
          </button>
        );
      })}
    </div>
  );
}
