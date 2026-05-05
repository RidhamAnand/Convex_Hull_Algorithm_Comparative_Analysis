export const PRESETS = [
  { label: "Random", fn: (n, W, H) => Array.from({ length: n }, () => ({ x: 40 + Math.random() * (W - 80), y: 40 + Math.random() * (H - 80) })) },
  { label: "Circle", fn: (n, W, H) => Array.from({ length: n }, (_, i) => ({ x: W / 2 + (W / 2 - 60) * Math.cos((2 * Math.PI * i) / n), y: H / 2 + (H / 2 - 60) * Math.sin((2 * Math.PI * i) / n) })) },
  { label: "Grid", fn: (n, W, H) => { const s = Math.ceil(Math.sqrt(n)); return Array.from({ length: s * s }, (_, i) => ({ x: 50 + ((i % s) / (s - 1)) * (W - 100), y: 50 + (Math.floor(i / s) / (s - 1)) * (H - 100) })).slice(0, n); } },
  { label: "Cluster", fn: (n, W, H) => { const centers = [[W * 0.25, H * 0.3], [W * 0.75, H * 0.3], [W * 0.5, H * 0.75]]; return Array.from({ length: n }, (_, i) => { const c = centers[i % 3]; return { x: Math.max(20, Math.min(W - 20, c[0] + (Math.random() - 0.5) * W * 0.3)), y: Math.max(20, Math.min(H - 20, c[1] + (Math.random() - 0.5) * H * 0.3)) }; }); } },
];
