export function benchmark(algos, pts) {
  const results = {};
  algos.forEach(({ key, fn }) => {
    const t0 = performance.now();
    fn(pts);
    results[key] = performance.now() - t0;
  });
  return results;
}

// Generate random permutation of points
function generateRandomPoints(size, width, height) {
  const points = [];
  for (let i = 0; i < size; i++) {
    points.push({
      x: Math.random() * (width - 40) + 20,
      y: Math.random() * (height - 40) + 20,
    });
  }
  return points;
}

// Run multiple benchmark iterations to get average times
export function benchmarkMultiple(algos, size, width, height, iterations = 1000) {
  const timings = {};
  
  // Initialize tracking for each algorithm
  algos.forEach(({ key }) => {
    timings[key] = [];
  });

  // Run iterations
  for (let i = 0; i < iterations; i++) {
    const testPts = generateRandomPoints(size, width, height);
    
    algos.forEach(({ key, fn }) => {
      const t0 = performance.now();
      fn(testPts);
      const elapsed = performance.now() - t0;
      timings[key].push(elapsed);
    });
  }

  // Calculate statistics
  const stats = {};
  algos.forEach(({ key }) => {
    const times = timings[key];
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const min = Math.min(...times);
    const max = Math.max(...times);
    const stdDev = Math.sqrt(
      times.reduce((sum, t) => sum + Math.pow(t - avg, 2), 0) / times.length
    );
    
    stats[key] = {
      average: avg,
      min,
      max,
      stdDev,
      samples: times,
    };
  });

  return stats;
}
