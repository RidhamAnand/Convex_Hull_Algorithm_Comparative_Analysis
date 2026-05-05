import { useCallback, useEffect, useRef, useState } from "react";
import { ALGORITHMS } from "./algorithmsList";
import { PRESETS } from "./presets";
import { renderCanvas } from "./renderer";
import { benchmark, benchmarkMultiple } from "./benchmark";
import { AlgoCard } from "./components/AlgoCard";
import { StepLog } from "./components/StepLog";
import { BenchmarkBar } from "./components/BenchmarkBar";
import { BenchmarkChart } from "./components/BenchmarkChart";
import { dist } from "./geometry";

export default function ConvexHullApp() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const [points, setPoints] = useState([]);
  const [selectedAlgo, setSelectedAlgo] = useState("graham");
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(300);
  const [numPoints, setNumPoints] = useState(12);
  const [preset, setPreset] = useState(0);
  const [benchmarks, setBenchmarks] = useState(null);
  const [benchmarkLoading, setBenchmarkLoading] = useState(false);
  const [mode, setMode] = useState("viz");
  const [dragging, setDragging] = useState(null);
  const [benchSize, setBenchSize] = useState(50);

  const [canvasSize, setCanvasSize] = useState({ width: 620, height: 500 });
  const [canvasHeight, setCanvasHeight] = useState(500);
  const [resizing, setResizing] = useState(false);

  const algo = ALGORITHMS.find(a => a.key === selectedAlgo);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resizeObserver = new ResizeObserver(() => {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        setCanvasSize({ width: rect.width * dpr, height: rect.height * dpr });
    });
    resizeObserver.observe(canvas);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (points.length < 3) { setSteps([]); setCurrentStep(0); return; }
    const s = algo.fn(points);
    setSteps(s);
    setCurrentStep(0);
    setPlaying(false);
  }, [points, selectedAlgo, algo]);

  useEffect(() => {
    const step = steps[currentStep] || null;
    renderCanvas(canvasRef.current, points, step, { width: canvasSize.width, height: canvasSize.height });
  }, [points, steps, currentStep, canvasSize]);

  useEffect(() => {
    if (!playing) { if (animRef.current) clearTimeout(animRef.current); return; }
    if (currentStep >= steps.length - 1) { setPlaying(false); return; }
    animRef.current = setTimeout(() => setCurrentStep(s => s + 1), speed);
    return () => clearTimeout(animRef.current);
  }, [playing, currentStep, steps.length, speed]);

  const generatePoints = useCallback(() => {
    const p = PRESETS[preset];
    setPoints(p.fn(numPoints, canvasSize.width, canvasSize.height));
    setSteps([]); setCurrentStep(0); setPlaying(false);
  }, [preset, numPoints, canvasSize]);

  useEffect(() => {
    generatePoints();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCanvasClick = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvasSize.width / rect.width);
    const y = (e.clientY - rect.top) * (canvasSize.height / rect.height);
    setPoints(prev => [...prev, { x, y }]);
  }, [canvasSize]);

  const handleMouseDown = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvasSize.width / rect.width);
    const my = (e.clientY - rect.top) * (canvasSize.height / rect.height);
    const idx = points.findIndex(p => dist(p, { x: mx, y: my }) < 12);
    if (idx !== -1) setDragging(idx);
    else handleCanvasClick(e);
  }, [points, handleCanvasClick, canvasSize]);

  const handleMouseMove = useCallback((e) => {
    if (dragging === null) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(10, Math.min(canvasSize.width - 10, (e.clientX - rect.left) * (canvasSize.width / rect.width)));
    const y = Math.max(10, Math.min(canvasSize.height - 10, (e.clientY - rect.top) * (canvasSize.height / rect.height)));
    setPoints(prev => prev.map((p, i) => i === dragging ? { x, y } : p));
  }, [dragging, canvasSize]);

  const runBenchmark = useCallback(() => {
    setBenchmarkLoading(true);
    // Run in a timeout to allow UI to update
    setTimeout(() => {
      const stats = benchmarkMultiple(
        ALGORITHMS.map(a => ({ key: a.key, fn: a.fn })),
        benchSize,
        canvasSize.width,
        canvasSize.height,
        1000 // 1000 iterations
      );
      setBenchmarks({ stats, size: benchSize });
      setBenchmarkLoading(false);
    }, 0);
  }, [benchSize, canvasSize]);

  const handleResizeStart = useCallback(() => {
    setResizing(true);
  }, []);

  const handleResizeMove = useCallback((e) => {
    if (!resizing) return;
    const container = canvasRef.current?.parentElement;
    if (!container) return;
    const rect = container.parentElement.getBoundingClientRect();
    const newHeight = Math.max(200, Math.min(e.clientY - rect.top - 12, rect.height - 150));
    setCanvasHeight(newHeight);
  }, [resizing]);

  const handleResizeEnd = useCallback(() => {
    setResizing(false);
  }, []);

  useEffect(() => {
    if (resizing) {
      document.addEventListener("mousemove", handleResizeMove);
      document.addEventListener("mouseup", handleResizeEnd);
      return () => {
        document.removeEventListener("mousemove", handleResizeMove);
        document.removeEventListener("mouseup", handleResizeEnd);
      };
    }
  }, [resizing, handleResizeMove, handleResizeEnd]);

  const maxBenchTime = benchmarks?.stats ? Math.max(...ALGORITHMS.map(a => benchmarks.stats[a.key]?.average || 0)) : 1;


  const stepInfo = steps[currentStep];

  return (
    <div style={{
      height: "100vh", background: "#F8F9FA", color: "#2D3436",
      fontFamily: "'Poppins', 'Roboto', system-ui, sans-serif",
      display: "flex", flexDirection: "column",
    }}>
      {/* Header */}
      <div style={{
        padding: "16px 24px", borderBottom: "1px solid rgba(0,0,0,0.08)",
        background: "#FFFFFF",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexShrink: 0, boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #6366F1, #8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>⬡</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18, letterSpacing: -0.3, color: "#1F2937", fontFamily: "'Poppins'" }}>Convex Hull Lab</div>
            <div style={{ fontSize: 12, color: "#6B7280", letterSpacing: 0.5 }}>Algorithm Visualizer & Analyzer</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {["viz", "bench"].map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              background: mode === m ? "#6366F111" : "transparent",
              border: `1px solid ${mode === m ? "#6366F1" : "#E5E7EB"}`,
              color: mode === m ? "#6366F1" : "#6B7280",
              padding: "8px 16px", borderRadius: 6, cursor: "pointer",
              fontSize: 13, fontWeight: 600, letterSpacing: 0.3,
              textTransform: "uppercase", transition: "all 0.2s",
            }}>{m === "viz" ? "Visualize" : "Benchmark"}</button>
          ))}
        </div>
      </div>

      {mode === "viz" ? (
        <div style={{ display: "flex", flex: 1, gap: 0, overflow: "hidden" }}>
          {/* Left Panel */}
          <div style={{
            width: 240, flexShrink: 0, padding: "16px 14px",
            borderRight: "1px solid rgba(0,0,0,0.08)",
            background: "#FFFFFF",
            overflowY: "auto", display: "flex", flexDirection: "column", gap: 16,
          }}>
            {/* Algorithm Selection */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10, fontFamily: "'Poppins'" }}>Algorithm</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {ALGORITHMS.map(a => <AlgoCard key={a.key} algo={a} selected={selectedAlgo === a.key} onSelect={setSelectedAlgo} />)}
              </div>
            </div>

            {/* Point Controls */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10, fontFamily: "'Poppins'" }}>Points</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>
                {PRESETS.map((p, i) => (
                  <button key={i} onClick={() => setPreset(i)} style={{
                    background: preset === i ? "#6366F111" : "#F3F4F6",
                    border: `1px solid ${preset === i ? "#6366F1" : "#E5E7EB"}`,
                    color: preset === i ? "#6366F1" : "#6B7280",
                    padding: "5px 12px", borderRadius: 5, cursor: "pointer", fontSize: 12, transition: "all 0.2s",
                  }}>{p.label}</button>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <input type="range" min={3} max={30} value={numPoints} onChange={e => setNumPoints(+e.target.value)}
                  style={{ flex: 1, accentColor: "#6366F1" }} />
                <span style={{ fontSize: 13, color: "#6B7280", minWidth: 28 }}>{numPoints}</span>
              </div>
              <button onClick={generatePoints} style={{
                width: "100%", background: "#6366F1", border: "1px solid #6366F1",
                color: "#FFFFFF", padding: "10px", borderRadius: 7, cursor: "pointer", fontSize: 13, fontWeight: 600,
                letterSpacing: 0.3, transition: "all 0.2s", fontFamily: "'Poppins'",
              }}>↻ Generate</button>
              <button onClick={() => setPoints([])} style={{
                width: "100%", background: "transparent", border: "1px solid #E5E7EB",
                color: "#6B7280", padding: "8px", borderRadius: 7, cursor: "pointer",
                fontSize: 12, marginTop: 6, transition: "all 0.2s",
              }}>Clear All</button>
            </div>

            {/* Stats */}
            <div style={{ background: "#F9FAFB", borderRadius: 8, padding: "12px 14px", border: "1px solid #E5E7EB" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10, fontFamily: "'Poppins'" }}>Stats</div>
              {[
                ["Points", points.length],
                ["Steps", steps.length],
                ["Current", currentStep],
                ["Hull Size", stepInfo?.type === "result" ? stepInfo.hull.length : "—"],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: "#9CA3AF" }}>{k}</span>
                  <span style={{ fontFamily: "monospace", fontSize: 13, color: "#6366F1", fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div style={{ background: "#F9FAFB", borderRadius: 8, padding: "12px 14px", border: "1px solid #E5E7EB" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10, fontFamily: "'Poppins'" }}>Legend</div>
              {[
                ["#6366F1", "Point"],
                ["#FBBF24", "Active / Pivot"],
                ["#A855F7", "Right half"],
                ["#EF4444", "Rejected"],
                ["#34D399", "Hull vertex"],
              ].map(([c, l]) => (
                <div key={l} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 7 }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: c, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: "#6B7280" }}>{l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Main Canvas Area */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "16px", gap: 12, minHeight: 0 }}>
            {/* Canvas */}
            <div style={{
              height: canvasHeight, position: "relative", borderRadius: 12,
              background: "#FFFFFF", border: "1px solid #E5E7EB",
              overflow: "hidden", cursor: "crosshair", flexShrink: 0, boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}>
              <canvas
                ref={canvasRef}
                width={canvasSize.width}
                height={canvasSize.height}
                style={{ width: "100%", height: "100%", display: "block" }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={() => setDragging(null)}
                onMouseLeave={() => setDragging(null)}
              />
              {stepInfo && (
                <div style={{
                  position: "absolute", top: 12, right: 12,
                  background: "#1F2937", border: "1px solid #E5E7EB",
                  borderRadius: 6, padding: "4px 10px", fontSize: 11, fontFamily: "monospace",
                  color: algo.color,
                }}>{stepInfo.type}</div>
              )}
              <div style={{
                position: "absolute", top: 12, left: 12,
                background: `${algo.color}11`, border: `1px solid ${algo.color}33`,
                borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 600,
                color: algo.color, letterSpacing: 0.3, fontFamily: "'Poppins'",
              }}>{algo.label} {algo.complexity}</div>
              {points.length === 0 && (
                <div style={{
                  position: "absolute", inset: 0, display: "flex", alignItems: "center",
                  justifyContent: "center", flexDirection: "column", gap: 8,
                  color: "#D1D5DB", pointerEvents: "none",
                }}>
                  <div style={{ fontSize: 48 }}>⬡</div>
                  <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: -0.2 }}>Click to add points</div>
                  <div style={{ fontSize: 13 }}>or use Generate button</div>
                </div>
              )}
              {/* Resize Handle */}
              <div
                onMouseDown={handleResizeStart}
                style={{
                  position: "absolute", bottom: 0, left: 0, right: 0,
                  height: 6, background: resizing ? "#6366F1" : "#E5E7EB",
                  cursor: "ns-resize", transition: "background 0.2s",
                  borderTop: "1px solid #D1D5DB",
                }}
              />
            </div>

            {/* Playback Controls */}
            <div style={{
              background: "#FFFFFF", borderRadius: 10,
              border: "1px solid #E5E7EB", padding: "14px 18px",
              flexShrink: 0, boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <button onClick={() => setCurrentStep(0)} disabled={!steps.length} style={{...btnStyle, fontSize: 14}}>⏮</button>
                <button onClick={() => setCurrentStep(s => Math.max(0, s - 1))} disabled={!steps.length} style={{...btnStyle, fontSize: 14}}>◀</button>
                <button onClick={() => setPlaying(p => !p)} disabled={!steps.length} style={{
                  ...btnStyle, background: playing ? "#FEE2E2" : "#F0F4FF",
                  border: `1px solid ${playing ? "#FCA5A5" : "#C7D2FE"}`,
                  color: playing ? "#DC2626" : "#6366F1", minWidth: 70, fontSize: 14,
                }}>{playing ? "⏸ Pause" : "▶ Play"}</button>
                <button onClick={() => setCurrentStep(s => Math.min(steps.length - 1, s + 1))} disabled={!steps.length} style={{...btnStyle, fontSize: 14}}>▶</button>
                <button onClick={() => setCurrentStep(steps.length - 1)} disabled={!steps.length} style={{...btnStyle, fontSize: 14}}>⏭</button>

                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, marginLeft: 10 }}>
                  <span style={{ fontSize: 12, color: "#9CA3AF", fontFamily: "'Poppins'", fontWeight: 500 }}>Speed</span>
                  <input type="range" min={50} max={1000} step={50} value={1050 - speed}
                    onChange={e => setSpeed(1050 - (+e.target.value))}
                    style={{ flex: 1, accentColor: "#6366F1" }} />
                  <span style={{ fontSize: 12, color: "#9CA3AF", minWidth: 45 }}>{speed}ms</span>
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ height: 4, background: "#E5E7EB", borderRadius: 2, overflow: "hidden", marginBottom: 12 }}>
                <div style={{
                  height: "100%", background: algo.color, borderRadius: 2,
                  width: steps.length > 1 ? `${(currentStep / (steps.length - 1)) * 100}%` : "0%",
                  transition: "width 0.1s",
                }} />
              </div>
              <div style={{ fontSize: 12, color: "#6B7280", fontFamily: "monospace", fontWeight: 500 }}>
                Step {currentStep + 1} / {steps.length || 0}
              </div>
            </div>

            {/* Step Log */}
            {steps.length > 0 && <StepLog steps={steps} currentStep={currentStep} />}
          </div>
        </div>
      ) : (
        // BENCHMARK MODE
        <div style={{ flex: 1, padding: 24, display: "flex", flexDirection: "column", gap: 20, maxWidth: 900, margin: "0 auto", width: "100%", overflowY: 'auto' }}>
          <div style={{
            background: "#FFFFFF", border: "1px solid #E5E7EB",
            borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, fontFamily: "'Poppins'" }}>Performance Benchmark</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <span style={{ fontSize: 13, color: "#6B7280" }}>Test size: {benchSize} points</span>
              <input type="range" min={10} max={500} step={10} value={benchSize}
                onChange={e => setBenchSize(+e.target.value)}
                style={{ flex: 1, accentColor: "#6366F1" }} />
              <button onClick={runBenchmark} disabled={benchmarkLoading} style={{
                background: benchmarkLoading ? "#9CA3AF" : "#6366F1", border: `1px solid ${benchmarkLoading ? "#9CA3AF" : "#6366F1"}`,
                color: "#FFFFFF", padding: "10px 18px", borderRadius: 7, cursor: benchmarkLoading ? "not-allowed" : "pointer",
                fontSize: 13, fontWeight: 600, fontFamily: "'Poppins'", letterSpacing: 0.2, transition: "all 0.2s",
              }}>{benchmarkLoading ? "⏳ Running..." : "▶ Run"}</button>
            </div>
            {benchmarkLoading && (
              <div style={{ marginTop: 20, padding: 20, background: "#F0F4FF", borderRadius: 8, border: "1px solid #C7D2FE", textAlign: "center" }}>
                <div style={{ fontSize: 14, color: "#6366F1", fontWeight: 600 }}>⏳ Running 1000 iterations...</div>
                <div style={{ fontSize: 12, color: "#6B7280", marginTop: 6 }}>This may take a moment depending on point count</div>
              </div>
            )}
            {benchmarks && !benchmarkLoading && (
              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#1F2937", marginBottom: 16, fontFamily: "'Poppins'" }}>
                  Average Time Analysis (1000 iterations, n={benchmarks.size} random points)
                </div>
                <BenchmarkChart stats={benchmarks.stats} algorithms={ALGORITHMS} />
              </div>
            )}
          </div>

          {/* Theory cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {ALGORITHMS.map(a => (
              <div key={a.key} style={{
                background: "#FFFFFF", border: `1px solid ${a.color}22`,
                borderRadius: 12, padding: 16, boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: a.color }} />
                  <span style={{ fontWeight: 700, fontSize: 14, fontFamily: "'Poppins'" }}>{a.label}</span>
                  <span style={{ fontFamily: "monospace", fontSize: 11, color: a.color, marginLeft: "auto" }}>{a.complexity}</span>
                </div>
                <div style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.6 }}>
                  {a.key === "brute" && "Tests every pair of points as a potential edge. Edge is on hull if all other points are on one side. Simple but cubic time — unusable for large inputs."}
                  {a.key === "jarvis" && "Wraps around the point set like wrapping a rubber band. At each step, selects the most counterclockwise point. O(h) factor where h is hull size — great when hull is small."}
                  {a.key === "graham" && "Sorts points by polar angle from lowest point, then sweeps through maintaining a stack of left turns. Elegantly handles all edge cases in O(n log n)."}
                  {a.key === "quickhull" && "Recursively partitions points using farthest point from dividing lines. Efficient divide-and-conquer approach with excellent cache locality."}
                </div>
              </div>
            ))}
          </div>

          {/* Complexity table */}
          <div style={{
            background: "#FFFFFF", border: "1px solid #E5E7EB",
            borderRadius: 12, padding: 16, boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, fontFamily: "'Poppins'" }}>Complexity Comparison</div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #E5E7EB" }}>
                  {["Algorithm", "Time", "Space", "Best For"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "6px 12px", color: "#6B7280", fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["Brute Force", "O(n^3)", "O(n)", "n < 20, education"],
                  ["Jarvis March", "O(nh)", "O(h)", "Small hull output"],
                  ["Graham Scan", "O(n log n)", "O(n)", "General purpose"],
                  ["QuickHull", "O(n log n)", "O(n)", "Average case"],
                ].map(([name, time, space, best], i) => {
                  const alg = ALGORITHMS[i];
                  return (
                    <tr key={name} style={{ borderBottom: "1px solid #F3F4F6" }}>
                      <td style={{ padding: "8px 12px", color: alg.color, fontWeight: 600 }}>{name}</td>
                      <td style={{ padding: "8px 12px", fontFamily: "monospace", color: "#1F2937" }}>{time}</td>
                      <td style={{ padding: "8px 12px", fontFamily: "monospace", color: "#4B5563" }}>{space}</td>
                      <td style={{ padding: "8px 12px", color: "#6B7280" }}>{best}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

const btnStyle = {
  background: "#F3F4F6", border: "1px solid #D1D5DB",
  color: "#4B5563", padding: "6px 10px", borderRadius: 6,
  cursor: "pointer", fontSize: 13, fontFamily: "monospace",
  transition: "all 0.1s",
};
