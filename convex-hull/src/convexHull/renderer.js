import { cross } from "./geometry";

export function renderCanvas(canvas, points, step, options = {}) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  // Background
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, W, H);

  // Grid
  ctx.strokeStyle = "rgba(0,0,0,0.04)";
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

  if (!step) {
    // Just render points
    points.forEach((p, i) => {
      ctx.beginPath(); ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#6C63FF"; ctx.fill();
      ctx.strokeStyle = "#A09BFF"; ctx.lineWidth = 1.5; ctx.stroke();
    });
    return;
  }

  const {
    hull = [], highlight = [], highlight2 = [], checking = [],
    testing = null, leftHull, rightHull, upperBridge, divideX,
    candidate, hullIdxs = [], stack = [], sortedIdxs = [], partitionCandidates = [],
  } = step;

  if (divideX !== undefined) {
    ctx.strokeStyle = "rgba(251,191,36,0.3)";
    ctx.setLineDash([8, 4]);
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(divideX, 0); ctx.lineTo(divideX, H); ctx.stroke();
    ctx.setLineDash([]);
  }

  if (leftHull && leftHull.length > 1) {
    ctx.strokeStyle = "rgba(99,102,241,0.5)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(leftHull[0].x, leftHull[0].y);
    leftHull.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.closePath(); ctx.stroke();
    ctx.setLineDash([]);
  }
  if (rightHull && rightHull.length > 1) {
    ctx.strokeStyle = "rgba(168,85,247,0.5)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(rightHull[0].x, rightHull[0].y);
    rightHull.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.closePath(); ctx.stroke();
    ctx.setLineDash([]);
  }

  if (upperBridge && upperBridge.length === 2) {
    ctx.strokeStyle = "rgba(251,191,36,0.9)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(upperBridge[0].x, upperBridge[0].y);
    ctx.lineTo(upperBridge[1].x, upperBridge[1].y);
    ctx.stroke();
  }

  if (hull.length > 1) {
    const isResult = step.type === "result";
    ctx.strokeStyle = isResult ? "#34D399" : "rgba(99,102,241,0.7)";
    ctx.lineWidth = isResult ? 2.5 : 1.8;
    ctx.shadowColor = isResult ? "rgba(52,211,153,0.4)" : "transparent";
    ctx.shadowBlur = isResult ? 12 : 0;
    ctx.beginPath();
    ctx.moveTo(hull[0].x, hull[0].y);
    hull.forEach(p => ctx.lineTo(p.x, p.y));
    if (isResult) ctx.closePath();
    ctx.stroke();
    ctx.shadowBlur = 0;

    if (isResult) {
      ctx.fillStyle = "rgba(52,211,153,0.08)";
      ctx.fill();
    }
  }

  if (testing && testing.length >= 2) {
    const A = points[testing[0]], B = points[testing[1]];
    if (A && B) {
      const isValid = step.valid;
      ctx.strokeStyle = isValid === false ? "rgba(239,68,68,0.7)" : isValid === true ? "rgba(52,211,153,0.8)" : "rgba(251,191,36,0.8)";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 3]);
      ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  if (checking && checking.length > 0 && testing) {
    const A = points[testing[0]], B = points[testing[1]];
    checking.forEach(k => {
      const P = points[k];
      if (!P || !A || !B) return;
      const c = cross(A, B, P);
      ctx.strokeStyle = c > 0 ? "rgba(99,102,241,0.25)" : c < 0 ? "rgba(239,68,68,0.25)" : "rgba(255,255,255,0.2)";
      ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(P.x, P.y); ctx.stroke();
    });
  }

  if (step.type === "wrap_test" && testing && testing.length === 3) {
    const from = points[testing[0]], to = points[testing[2]];
    if (from && to) {
      ctx.strokeStyle = "rgba(251,191,36,0.35)";
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(to.x, to.y); ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  if (step.type === "sorted" && sortedIdxs.length > 1) {
    for (let i = 1; i < sortedIdxs.length; i++) {
      const A = points[sortedIdxs[i - 1]], B = points[sortedIdxs[i]];
      if (A && B) {
        ctx.strokeStyle = "rgba(99,102,241,0.2)";
        ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.stroke();
      }
    }
  }

  // Graham Scan: Draw turn test with colored dashed lines
  if (step.type === "check_turn" && testing && testing.length === 3) {
    const p1 = points[testing[0]];
    const p2 = points[testing[1]];
    const p3 = points[testing[2]];
    
    if (p1 && p2 && p3) {
      // Color based on turn direction
      const color = step.popping ? "rgba(239,68,68,0.7)" : "rgba(52,211,153,0.7)";
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 4]);
      
      // Draw the angle turn
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  // Graham Scan: Draw current hull from stack
  if ((step.type === "push" || step.type === "init_stack") && sortedIdxs && sortedIdxs.length > 0) {
    if (step.stack && step.stack.length > 1) {
      const stackPoints = step.stack.map(idx => points[sortedIdxs[idx]]).filter(p => p);
      if (stackPoints.length > 1) {
        ctx.strokeStyle = "rgba(99,102,241,0.6)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(stackPoints[0].x, stackPoints[0].y);
        for (let i = 1; i < stackPoints.length; i++) {
          ctx.lineTo(stackPoints[i].x, stackPoints[i].y);
        }
        ctx.stroke();
      }
    }
  }

  points.forEach((p, i) => {
    const isHighlight = highlight.includes(i);
    const isHighlight2 = highlight2.includes(i);
    const isChecking = checking.includes(i);
    const isTesting = testing && testing.includes(i);
    const isPartition = partitionCandidates.includes(i);
    const inHull = step.type === "result" && hull.some(h => Math.abs(h.x - p.x) < 1 && Math.abs(h.y - p.y) < 1);

    let color = "#6366F1";
    let border = "#818CF8";
    let radius = 5;

    if (inHull) { color = "#34D399"; border = "#6EE7B7"; radius = 6; }
    else if (isHighlight) { color = "#FBBF24"; border = "#FDE68A"; radius = 6; }
    else if (isHighlight2) { color = "#A855F7"; border = "#D8B4FE"; radius = 6; }
    else if (isTesting) { color = "#F59E0B"; border = "#FCD34D"; radius = 5.5; }
    else if (isPartition) { color = "#EC4899"; border = "#F472B6"; radius = 5; }
    else if (isChecking) { color = "#818CF8"; border = "#C7D2FE"; radius = 4.5; }

    ctx.beginPath(); ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color; ctx.fill();
    ctx.strokeStyle = border; ctx.lineWidth = 1.5; ctx.stroke();

    ctx.fillStyle = "#1F2937";
    ctx.font = "bold 11px monospace";
    ctx.fillText(i, p.x + 7, p.y - 5);
  });
}
