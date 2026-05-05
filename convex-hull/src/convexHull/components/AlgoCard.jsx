export function AlgoCard({ algo, selected, onSelect }) {
  return (
    <button
      onClick={() => onSelect(algo.key)}
      style={{
        background: selected ? `${algo.color}11` : "#F9FAFB",
        border: `1px solid ${selected ? algo.color : "#E5E7EB"}`,
        borderRadius: 10,
        padding: "11px 14px",
        cursor: "pointer",
        textAlign: "left",
        transition: "all 0.15s",
        width: "100%",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: algo.color, flexShrink: 0, boxShadow: selected ? `0 0 8px ${algo.color}` : "none" }} />
        <span style={{ color: selected ? algo.color : "#4B5563", fontWeight: 600, fontSize: 13, letterSpacing: 0.2, fontFamily: "'Poppins'" }}>{algo.label}</span>
      </div>
      <span style={{ fontFamily: "monospace", fontSize: 12, color: algo.color, opacity: 0.9 }}>{algo.complexity}</span>
    </button>
  );
}
