
// Brute Force O(n^3): for each edge, check all points are on same side
export function bruteForce(pts) {
  const steps = [];
  const n = pts.length;
  const hullEdges = [];

  if (n < 3) {
    steps.push({ type: "result", hull: pts.slice(), highlight: [], message: "Need at least 3 points.", testing: null });
    return steps;
  }

  steps.push({ type: "start", hull: [], highlight: [], message: `Brute Force: Testing all ${n * (n - 1) / 2} edges. For each edge, verify all other points lie on the same side.`, testing: null });

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const A = pts[i], B = pts[j];
      let valid = true;
      let firstSign = null;
      const checking = [];

      for (let k = 0; k < n; k++) {
        if (k === i || k === j) continue;
        const c = cross(A, B, pts[k]);
        checking.push(k);
        if (firstSign === null && c !== 0) firstSign = Math.sign(c);
        else if (c !== 0 && Math.sign(c) !== firstSign) { valid = false; }
      }

      steps.push({
        type: "test_edge",
        hull: hullEdges.flatMap(e => [e[0], e[1]]),
        highlight: [i, j],
        checking,
        valid,
        message: valid
          ? `Edge (P${i}→P${j}) is a hull edge — all points on same side ✓`
          : `Edge (P${i}→P${j}) rejected — points on both sides ✗`,
        testing: [i, j],
      });

      if (valid) hullEdges.push([i, j]);
    }
  }

  // Build ordered hull from edges
  const adj = {};
  hullEdges.forEach(([a, b]) => {
    if (!adj[a]) adj[a] = [];
    if (!adj[b]) adj[b] = [];
    adj[a].push(b); adj[b].push(a);
  });

  const hull = [];
  const visited = new Set();
  let cur = hullEdges[0]?.[0] ?? 0;
  while (hull.length <= n) {
    hull.push(pts[cur]);
    visited.add(cur);
    const nxt = (adj[cur] || []).find(v => !visited.has(v));
    if (nxt === undefined) break;
    cur = nxt;
  }

  steps.push({ type: "result", hull, highlight: [], message: `Done! Hull has ${hull.length} vertices. Total edge tests: ${n * (n - 1) / 2}.`, testing: null });
  return steps;
}

// Jarvis March (Gift Wrapping) O(nh)
export function jarvisMarch(pts) {
  const steps = [];
  const n = pts.length;
  if (n < 3) {
    steps.push({ type: "result", hull: pts.slice(), highlight: [], message: "Need at least 3 points.", testing: null });
    return steps;
  }

  steps.push({ type: "start", hull: [], highlight: [], message: "Jarvis March: Start from leftmost point, always turn to the most counterclockwise point.", testing: null });

  let startIdx = pts.reduce((min, p, i) => p.x < pts[min].x || (p.x === pts[min].x && p.y < pts[min].y) ? i : min, 0);
  const hull = [];
  const hullIdxs = [];
  let cur = startIdx;

  steps.push({ type: "select_start", hull: [], highlight: [startIdx], message: `Selected leftmost point P${startIdx} as start of hull traversal.`, testing: null });

  do {
    hull.push(pts[cur]);
    hullIdxs.push(cur);

    let next = (cur + 1) % n;
    for (let i = 0; i < n; i++) {
      if (i === cur) continue;
      const c = cross(pts[cur], pts[next], pts[i]);
      steps.push({
        type: "wrap_test",
        hull: hull.slice(),
        hullIdxs: hullIdxs.slice(),
        highlight: [cur, next],
        testing: [cur, i, next],
        message: c < 0
          ? `P${i} is more counterclockwise than P${next} — updating candidate to P${i}`
          : `P${i} is not better than current candidate P${next}`,
        candidate: next,
      });
      if (c < 0) next = i;
    }

    steps.push({ type: "selected_next", hull: hull.slice(), hullIdxs: hullIdxs.slice(), highlight: [cur, next], message: `Selected P${next} as next hull vertex.`, testing: null });
    cur = next;
  } while (cur !== startIdx && hull.length < n);

  steps.push({ type: "result", hull, highlight: [], message: `Done! Hull has ${hull.length} vertices.`, testing: null });
  return steps;
}

const polarAngle = (p0, p1) => Math.atan2(p1.y - p0.y, p1.x - p0.x);
const distSq = (p0, p1) => Math.pow(p1.x - p0.x, 2) + Math.pow(p1.y - p0.y, 2);
const cross = (a, b, c) => (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);

export function grahamScan(pts) {
  const steps = [];
  const n = pts.length;
  if (n < 3) {
    steps.push({ type: "result", hull: pts.slice(), message: "Need at least 3 points." });
    return steps;
  }

  // Flip y so screen coords behave like notebook (y-up)
  const flipped = pts.map(p => ({ ...p, y: -p.y }));

  // Pivot: minimum y in flipped coords = bottommost on notebook = topmost on screen
  const pivot = flipped.reduce((min, p, i) =>
    (p.y < flipped[min].y || (p.y === flipped[min].y && p.x < flipped[min].x)) ? i : min, 0);
  const P0 = flipped[pivot];

  steps.push({
    type: "pivot",
    highlight: [pivot],
    message: `✓ Pivot P${pivot} selected (bottommost point). Starting CCW sweep.`
  });

  // Sort by ascending polar angle = CCW order in y-up space
  // Collinear: closest first → gets popped by cross=0 rule, farthest survives
  const sorted = flipped
    .map((p, i) => ({ ...p, idx: i }))
    .filter((_, i) => i !== pivot)
    .sort((a, b) => {
      const aA = polarAngle(P0, a), bA = polarAngle(P0, b);
      if (Math.abs(aA - bA) > 1e-9) return aA - bA;
      return distSq(P0, a) - distSq(P0, b);
    });

  const sortedPts = [P0, ...sorted];
  const sortedIdxs = [pivot, ...sorted.map(p => p.idx)];

  steps.push({
    type: "sorted",
    highlight: sortedIdxs,
    sortedIdxs,
    message: `✓ Sorted ${n} points in CCW order from P${pivot}. Starting sweep...`
  });

  const stack = [0, 1];

  steps.push({
    type: "init_stack",
    highlight: [sortedIdxs[0], sortedIdxs[1]],
    sortedIdxs,
    stack: stack.slice(),
    message: `Stack initialized: P${sortedIdxs[0]} → P${sortedIdxs[1]}. Rule: cross > 0 = keep, cross ≤ 0 = discard`
  });

  for (let i = 2; i < sortedPts.length; i++) {
    while (stack.length >= 2) {
      const second = stack[stack.length - 2];
      const top    = stack[stack.length - 1];
      const c = cross(sortedPts[second], sortedPts[top], sortedPts[i]);

      const msg = c > 0
        ? `✓ cross > 0: KEEP P${sortedIdxs[top]}`
        : `✗ cross ≤ 0: DISCARD P${sortedIdxs[top]}`;

      steps.push({
        type: "check_turn",
        highlight: [sortedIdxs[second], sortedIdxs[top], sortedIdxs[i]],
        testing:   [sortedIdxs[second], sortedIdxs[top], sortedIdxs[i]],
        sortedIdxs,
        stack: stack.slice(),
        popping: c <= 0,
        message: `P${sortedIdxs[second]}→P${sortedIdxs[top]}→P${sortedIdxs[i]}: cross=${c.toFixed(1)} ... ${msg}`
      });

      if (c <= 0) stack.pop();
      else break;
    }

    stack.push(i);

    steps.push({
      type: "push",
      highlight: [sortedIdxs[i]],
      sortedIdxs,
      stack: stack.slice(),
      message: `Added P${sortedIdxs[i]}. Stack: ${stack.map(s => `P${sortedIdxs[s]}`).join("→")}`
    });
  }

  // Hull uses original pts (unflipped) for rendering
  const hull = stack.map(s => pts[sortedIdxs[s]]);

  steps.push({
    type: "result",
    hull,
    message: `✓ Done! CCW Hull: ${hull.length} vertices. cross > 0 → keep, cross ≤ 0 → discard`
  });

  return steps;
}

// QuickHull O(n log n) average, O(n²) worst case
export function quickHull(pts) {
  const steps = [];
  const n = pts.length;
  if (n < 3) {
    steps.push({ type: "result", hull: pts.slice(), highlight: [], message: "Need at least 3 points.", testing: null });
    return steps;
  }

  steps.push({ type: "start", hull: [], highlight: [], message: "QuickHull: Find leftmost and rightmost points, partition by lines, recursively process partitions.", testing: null });

  // Create indexed points
  const indexed = pts.map((p, i) => ({ ...p, idx: i }));

  // Find leftmost and rightmost
  let minIdx = 0, maxIdx = 0;
  for (let i = 1; i < indexed.length; i++) {
    if (indexed[i].x < indexed[minIdx].x || (indexed[i].x === indexed[minIdx].x && indexed[i].y < indexed[minIdx].y)) minIdx = i;
    if (indexed[i].x > indexed[maxIdx].x || (indexed[i].x === indexed[maxIdx].x && indexed[i].y < indexed[maxIdx].y)) maxIdx = i;
  }

  const leftmost = indexed[minIdx];
  const rightmost = indexed[maxIdx];

  steps.push({
    type: "anchor_points",
    hull: [],
    highlight: [leftmost.idx, rightmost.idx],
    message: `Found leftmost P${leftmost.idx} and rightmost P${rightmost.idx}. These are definitely on the hull.`,
    testing: null,
  });

  const hull = [leftmost, rightmost];
  const processedIdx = new Set([minIdx, maxIdx]);

  // Function to find farthest point from a line
  function farthestPointFromLine(A, B, candidates) {
    let maxDist = -1;
    let farthest = null;
    for (const idx of candidates) {
      const p = indexed[idx];
      const c = cross(A, B, p);
      if (c <= 0) continue;
      const d = Math.abs(cross(A, B, p)) / (Math.sqrt((B.x - A.x) ** 2 + (B.y - A.y) ** 2) + 1e-10);
      if (d > maxDist) {
        maxDist = d;
        farthest = idx;
      }
    }
    return farthest;
  }

  // Initial candidates: all points except leftmost and rightmost
  const candidates = [];
  for (let i = 0; i < indexed.length; i++) {
    if (i !== minIdx && i !== maxIdx) candidates.push(i);
  }

  steps.push({
    type: "init_partition",
    hull: hull.slice(),
    highlight: [leftmost.idx, rightmost.idx],
    partitionCandidates: candidates.map(i => indexed[i].idx),
    message: `Initialized with ${candidates.length} candidate points {${candidates.map(i => `P${indexed[i].idx}`).join(", ")}} (${(candidates.length / n * 100).toFixed(1)}% coverage). Testing all against base line.`,
    testing: null,
    progress: { processed: 2, total: n },
  });

  // Process upper hull (points below the leftmost→rightmost line)
  const upperCandidates = candidates.filter(i => cross(leftmost, rightmost, indexed[i]) > 0);
  steps.push({
    type: "partition",
    hull: hull.slice(),
    highlight: [leftmost.idx, rightmost.idx],
    partitionCandidates: upperCandidates.map(i => indexed[i].idx),
    message: `Lower region partition: ${upperCandidates.length} points {${upperCandidates.map(i => `P${indexed[i].idx}`).join(", ")}} below line P${leftmost.idx}→P${rightmost.idx}. Coverage: ${(upperCandidates.length / n * 100).toFixed(1)}%. Processing recursively...`,
    testing: null,
    progress: { processed: 2, total: n },
  });

  function processPartition(A, B, partition, region) {
    if (partition.length === 0) {
      steps.push({
        type: "partition_done",
        hull: hull.slice(),
        message: `${region} partition complete. Total hull vertices so far: ${hull.length}/${n}. Coverage: ${(hull.length / n * 100).toFixed(1)}%.`,
        testing: null,
        progress: { processed: hull.length, total: n },
      });
      return;
    }

    const farthestIdx = farthestPointFromLine(A, B, partition);
    if (farthestIdx === null) {
      steps.push({
        type: "partition_done",
        hull: hull.slice(),
        message: `${region} partition complete (no more points above line). Hull vertices so far: ${hull.length}/${n}. Coverage: ${(hull.length / n * 100).toFixed(1)}%.`,
        testing: null,
        progress: { processed: hull.length, total: n },
      });
      return;
    }

    const farthest = indexed[farthestIdx];
    steps.push({
      type: "farthest_found",
      hull: hull.slice(),
      highlight: [A.idx, B.idx, farthest.idx],
      message: `Found farthest point P${farthest.idx} from line P${A.idx}→P${B.idx}. Adding to hull (${hull.length + 1}/${n}). Coverage: ${((hull.length + 1) / n * 100).toFixed(1)}%.`,
      testing: null,
      progress: { processed: hull.length + 1, total: n },
    });

    hull.push(farthest);
    processedIdx.add(farthestIdx);

    // Points on the left of A-Farthest (further partition)
    const leftOfAF = partition.filter(i => i !== farthestIdx && cross(A, farthest, indexed[i]) > 0);
    if (leftOfAF.length > 0) {
      const pointList = leftOfAF.map(i => `P${indexed[i].idx}`).join(", ");
      steps.push({
        type: "recurse_partition",
        hull: hull.slice(),
        highlight: [A.idx, farthest.idx],
        partitionCandidates: leftOfAF.map(i => indexed[i].idx),
        message: `Sub-partition of P${A.idx}→P${farthest.idx}: ${leftOfAF.length} candidates remain {${pointList}}. Recursing...`,
        testing: null,
        progress: { processed: hull.length, total: n },
      });
      processPartition(A, farthest, leftOfAF, region);
    }

    // Points on the left of Farthest-B (further partition)
    const leftOfFB = partition.filter(i => i !== farthestIdx && cross(farthest, B, indexed[i]) > 0);
    if (leftOfFB.length > 0) {
      const pointList = leftOfFB.map(i => `P${indexed[i].idx}`).join(", ");
      steps.push({
        type: "recurse_partition",
        hull: hull.slice(),
        highlight: [farthest.idx, B.idx],
        partitionCandidates: leftOfFB.map(i => indexed[i].idx),
        message: `Sub-partition of P${farthest.idx}→P${B.idx}: ${leftOfFB.length} candidates remain {${pointList}}. Recursing...`,
        testing: null,
        progress: { processed: hull.length, total: n },
      });
      processPartition(farthest, B, leftOfFB, region);
    }
  }

  processPartition(leftmost, rightmost, upperCandidates, "Lower");

  // Process lower hull (points above the rightmost→leftmost line)
  const lowerCandidates = candidates.filter(i => cross(rightmost, leftmost, indexed[i]) > 0);
  steps.push({
    type: "partition",
    hull: hull.slice(),
    highlight: [rightmost.idx, leftmost.idx],
    partitionCandidates: lowerCandidates.map(i => indexed[i].idx),
    message: `Upper region partition: ${lowerCandidates.length} points {${lowerCandidates.map(i => `P${indexed[i].idx}`).join(", ")}} above line P${rightmost.idx}→P${leftmost.idx}. Coverage: ${(lowerCandidates.length / n * 100).toFixed(1)}%. Processing recursively...`,
    testing: null,
    progress: { processed: hull.length, total: n },
  });

  processPartition(rightmost, leftmost, lowerCandidates, "Upper");

  // Order hull points counterclockwise
  const center = { x: hull.reduce((s, p) => s + p.x, 0) / hull.length, y: hull.reduce((s, p) => s + p.y, 0) / hull.length };
  hull.sort((a, b) => Math.atan2(a.y - center.y, a.x - center.x) - Math.atan2(b.y - center.y, b.x - center.x));

  steps.push({
    type: "result",
    hull: hull.slice(),
    highlight: [],
    message: `Done! QuickHull found ${hull.length}/${n} hull vertices (${(hull.length / n * 100).toFixed(1)}% coverage). All interior points identified and processed.`,
    testing: null,
    progress: { processed: hull.length, total: n },
  });
  return steps;
}
