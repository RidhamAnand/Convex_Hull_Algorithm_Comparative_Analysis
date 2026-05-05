export function BenchmarkBar({ label, time, maxTime, color }) {
  const pct = maxTime > 0 ? (time / maxTime) * 100 : 0;
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 13, color: "#4B5563", fontWeight: 500 }}>{label}</span>
        <span style={{ fontFamily: "monospace", fontSize: 13, color, fontWeight: 600 }}>{time.toFixed(3)}ms</span>
      </div>
      <div style={{ height: 7, background: "#E5E7EB", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 4, transition: "width 0.4s ease" }} />
      </div>
    </div>
  );
}
