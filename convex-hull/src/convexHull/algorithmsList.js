import { bruteForce, jarvisMarch, grahamScan, quickHull } from "./algorithms";

export const ALGORITHMS = [
  { key: "brute", label: "Brute Force", complexity: "O(n^3)", color: "#EF4444", fn: bruteForce },
  { key: "jarvis", label: "Jarvis March", complexity: "O(nh)", color: "#F59E0B", fn: jarvisMarch },
  { key: "graham", label: "Graham Scan", complexity: "O(n log n)", color: "#6366F1", fn: grahamScan },
  { key: "quickhull", label: "QuickHull", complexity: "O(n log n) avg", color: "#10B981", fn: quickHull },
];
