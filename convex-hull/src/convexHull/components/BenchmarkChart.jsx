import { useEffect, useRef } from "react";

export function BenchmarkChart({ stats, algorithms }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !stats || algorithms.length === 0) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, width, height);

    // Margins
    const margin = { top: 20, right: 20, bottom: 50, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Get max value for scaling
    const maxVal = Math.max(...algorithms.map(a => stats[a.key]?.average || 0)) * 1.2;
    if (maxVal === 0) return;

    // Draw background grid
    ctx.strokeStyle = "#E5E7EB";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = margin.top + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(margin.left, y);
      ctx.lineTo(width - margin.right, y);
      ctx.stroke();

      // Grid labels
      const val = maxVal - (maxVal / 5) * i;
      ctx.fillStyle = "#9CA3AF";
      ctx.font = "12px 'Roboto'";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText(val.toFixed(2), margin.left - 10, y);
    }

    // Draw bars
    const barWidth = chartWidth / (algorithms.length * 1.5);
    const barSpacing = chartWidth / algorithms.length;

    algorithms.forEach((algo, idx) => {
      const stat = stats[algo.key];
      if (!stat) return;

      const x = margin.left + barSpacing * idx + (barSpacing - barWidth) / 2;
      const barHeight = (stat.average / maxVal) * chartHeight;
      const y = margin.top + chartHeight - barHeight;

      // Draw error bar (min-max range)
      const minHeight = (stat.min / maxVal) * chartHeight;
      const maxHeight = (stat.max / maxVal) * chartHeight;
      const minY = margin.top + chartHeight - maxHeight;
      const maxY = margin.top + chartHeight - minHeight;

      ctx.strokeStyle = algo.color + "40";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + barWidth / 2, minY);
      ctx.lineTo(x + barWidth / 2, maxY);
      ctx.stroke();

      // Draw bar
      ctx.fillStyle = algo.color;
      ctx.fillRect(x, y, barWidth, barHeight);

      // Draw outline
      ctx.strokeStyle = algo.color;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x, y, barWidth, barHeight);

      // Draw label
      ctx.fillStyle = "#1F2937";
      ctx.font = "500 12px 'Poppins'";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      const label = algo.label.substring(0, 12); // Truncate if needed
      ctx.fillText(label, x + barWidth / 2, margin.top + chartHeight + 15);

      // Draw average value on top of bar
      ctx.fillStyle = algo.color;
      ctx.font = "600 11px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText(stat.average.toFixed(2) + "ms", x + barWidth / 2, y - 5);
    });

    // Draw axes
    ctx.strokeStyle = "#1F2937";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top);
    ctx.lineTo(margin.left, margin.top + chartHeight);
    ctx.lineTo(width - margin.right, margin.top + chartHeight);
    ctx.stroke();

    // Y-axis label
    ctx.save();
    ctx.translate(20, margin.top + chartHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = "#6B7280";
    ctx.font = "12px 'Roboto'";
    ctx.textAlign = "center";
    ctx.fillText("Time (ms)", 0, 0);
    ctx.restore();
  }, [stats, algorithms]);

  if (!stats || algorithms.length === 0) {
    return <div style={{ fontSize: 13, color: "#9CA3AF" }}>No benchmark data available</div>;
  }

  return (
    <div style={{ marginTop: 20 }}>
      <canvas
        ref={canvasRef}
        width={700}
        height={400}
        style={{
          width: "100%",
          maxWidth: "700px",
          border: "1px solid #E5E7EB",
          borderRadius: 8,
          background: "#FFFFFF",
        }}
      />
      <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
        {algorithms.map(algo => {
          const stat = stats[algo.key];
          return (
            <div key={algo.key} style={{ background: "#F9FAFB", padding: "12px 14px", borderRadius: 8, border: "1px solid #E5E7EB" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: algo.color }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: "#1F2937" }}>{algo.label}</span>
              </div>
              <div style={{ fontSize: 11, color: "#6B7280", lineHeight: 1.6 }}>
                <div><strong style={{ color: "#1F2937" }}>Avg:</strong> {stat.average.toFixed(3)}ms</div>
                <div><strong style={{ color: "#1F2937" }}>Min:</strong> {stat.min.toFixed(3)}ms</div>
                <div><strong style={{ color: "#1F2937" }}>Max:</strong> {stat.max.toFixed(3)}ms</div>
                <div><strong style={{ color: "#1F2937" }}>Std Dev:</strong> {stat.stdDev.toFixed(3)}ms</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
