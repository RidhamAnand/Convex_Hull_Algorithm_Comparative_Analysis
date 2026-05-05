# Convex Hull Algorithm Visualizer & Analyzer

## Project Overview

This is an interactive **Convex Hull Algorithm Visualizer** built with React. It allows you to visualize and compare four different convex hull algorithms in real-time. You can watch step-by-step how each algorithm finds the convex hull of a set of 2D points, and benchmark their performance against each other.

### What is Convex Hull?

The **Convex Hull** of a set of points is the smallest convex polygon that contains all the points. Think of it as stretching a rubber band around the outermost points.

---

## Algorithms Implemented

### 1. **Brute Force** - O(n³)
- **Complexity**: O(n³) time
- **How it works**: 
  - Tests all possible pairs of points as potential edges of the hull
  - For each edge, checks if all other points lie on one side
  - If yes, the edge is part of the convex hull
- **Visualization**: Shows edge testing and candidate verification
- **Color**: Red

### 2. **Jarvis March (Gift Wrapping)** - O(nh)
- **Complexity**: O(nh) time, where h is the hull size
- **How it works**:
  - Start from the leftmost point
  - Find the most counterclockwise point from the current point
  - Repeat until returning to the start
- **Visualization**: Shows counterclockwise candidate selection at each step
- **Color**: Orange

### 3. **Graham Scan** - O(n log n)
- **Complexity**: O(n log n) time
- **How it works**:
  - Sort all points by polar angle relative to the lowest point
  - Use a stack-based sweep to eliminate non-hull points
  - Detect left turns vs right turns to determine which points stay on hull
- **Visualization**: Shows polar angle sorting and stack-based sweep
- **Color**: Indigo

### 4. **QuickHull** - O(n log n) average
- **Complexity**: O(n log n) average, O(n²) worst case
- **How it works**:
  - Find leftmost and rightmost points (guaranteed hull vertices)
  - Partition remaining points into upper and lower regions
  - Recursively find the farthest point in each region and partition further
  - Includes coverage percentage tracking
- **Visualization**: Shows partition regions, candidate points, and recursive subdivision
- **Color**: Green

---

## Features

### 🎨 **Visualization Mode**
- **Interactive Canvas**: Click on the canvas to add points manually
- **Generate Points**: Use preset patterns (random, circle, grid, clusters)
- **Point Count Control**: Adjust 3-30 points using a slider
- **Step-by-Step Playback**: 
  - Play/Pause animation
  - Previous/Next step navigation
  - Jump to start/end
  - Adjustable playback speed
- **Real-time Canvas Resizing**: Drag the bottom edge to expand/shrink the canvas

### 📊 **Color Legend**
- **🔵 Indigo**: Regular points
- **🟡 Yellow**: Active pivot or current candidate
- **🟣 Purple**: Right half partition
- **🔴 Red**: Rejected points
- **🟢 Green**: Hull vertices (final result)

### 🔬 **Detailed Step Log**
- Full algorithm execution trace
- Current step highlighted
- Shows:
  - Point coordinates and indices
  - Partition regions with point lists
  - Hull vertex additions
  - Coverage percentages
  - Large, scrollable format for easy reading

### 📈 **Benchmark Mode**
- Test algorithms on 1000 random permutations
- Variable input size (10-500 points)
- Run benchmarks and see average execution times
- Visual comparison bars showing relative performance
- Results displayed for each algorithm

---

## How to Use

### Setup
```bash
npm install
npm start
```

The application will open at `http://localhost:3000`

### Visualization Mode

1. **Select an Algorithm**
   - Click on any algorithm card (Brute Force, Jarvis March, Graham Scan, QuickHull)

2. **Add Points**
   - **Method 1**: Click directly on the canvas to add points manually
   - **Method 2**: Use preset patterns:
     - Random
     - Circle
     - Grid
     - Clusters
   - **Method 3**: Adjust point count (3-30) and click "Generate"

3. **Watch the Visualization**
   - Use playback controls (⏮ ⏪ ▶️ ⏩ ⏭️)
   - Adjust speed slider (50-1000ms per step)
   - Canvas resizing: Drag the bottom edge to expand

4. **Understand the Steps**
   - Read detailed descriptions in the scrollable step log
   - Watch how points change color based on their status
   - See hull vertices highlighted in green

5. **Clear and Restart**
   - Use "Clear All" to remove all points
   - Select another algorithm or generate new points

### Benchmark Mode

1. Click **"Benchmark"** tab
2. Adjust test size using the slider (10-500 points)
3. Click **"▶ Run"** to execute
4. See comparison bars showing average time for each algorithm across 1000 random permutations
5. Lower bars = faster algorithms

---

## Project Structure

```
src/
├── convexHull/
│   ├── ConvexHullApp.jsx          # Main app component
│   ├── algorithms.js               # Algorithm implementations
│   ├── algorithmsList.js           # Algorithm metadata
│   ├── geometry.js                 # Geometry utility functions
│   ├── renderer.js                 # Canvas rendering logic
│   ├── benchmark.js                # Performance benchmarking
│   ├── presets.js                  # Point generation presets
│   └── components/
│       ├── AlgoCard.jsx            # Algorithm selection card
│       ├── StepLog.jsx             # Step-by-step details display
│       └── BenchmarkBar.jsx        # Performance comparison bar
├── App.js                           # React app entry
├── index.js                         # React DOM render
├── index.css                        # Global styles
└── App.css
```

---

## Output & Visualization Details

### Canvas Display
- **White background** with light grid
- **Points**: Blue circles with indices
- **Partition candidates**: Pink/Magenta highlight
- **Hull edges**: Drawn after algorithm completes
- **Grid spacing**: 40px for reference

### Step Log Information

Each step displays:
- **Step Type**: anchor_points, init_partition, partition, farthest_found, recurse_partition, etc.
- **Point Lists**: Specific points involved {P1, P2, ...}
- **Coverage %**: Shows how much of the hull space is covered
- **Hull Progress**: Current count of hull vertices found

### Benchmark Output

Each benchmark shows:
- **Algorithm Name** with complexity
- **Execution Time**: In milliseconds (averaged over 1000 runs)
- **Visual Bar**: Proportional to fastest algorithm
- **Comparison**: Easy to see which algorithm performs best

---

## Example Scenarios

### Testing Small Input (5 points)
- All algorithms finish nearly instantly
- Great for understanding algorithm differences
- Easy to follow step-by-step

### Testing Medium Input (15-20 points)
- Differences in performance become visible
- Good demonstration of algorithm characteristics
- QuickHull usually faster than Brute Force

### Benchmark with Large Input (500 points × 1000 runs)
- Clear performance ranking emerges
- Graham Scan and QuickHull typically outperform others
- Brute Force becomes noticeably slow

---

## Light Theme Design

- **Professional typography**: Poppins (headings) + Roboto (body)
- **Easy on the eyes**: Off-white backgrounds, high contrast
- **Accessible**: Large fonts, clear hierarchy
- **Responsive**: Works on different window sizes
- **Interactive feedback**: Buttons and controls highlight on interaction

---

## Technologies Used

- **React 19.2.5**: Component-based UI framework
- **HTML5 Canvas**: 2D visualization rendering
- **CSS-in-JS**: Inline styling for responsive design
- **ResizeObserver API**: Responsive canvas sizing
- **Google Fonts**: Poppins & Roboto typography
- **Create React App**: Development environment

---

## Tips for Best Experience

1. **Start with 5-10 points** to understand each algorithm
2. **Compare algorithms on the same point set** to see differences
3. **Use circle or grid presets** for consistent results
4. **Slow down playback** (1000ms) to observe each step carefully
5. **Run benchmarks with 100-200 points** for meaningful comparisons
6. **Expand canvas** for better visibility on larger point sets

---

## Notes for Group Discussion

- Each algorithm has tradeoffs between simplicity and efficiency
- Brute Force is educational but impractical for large inputs
- Jarvis March excels when hull size is small
- Graham Scan is consistent and widely used
- QuickHull is very efficient in practice despite worst-case O(n²)
- The visualizer makes these differences immediately apparent

---

## Author

Created for **Divide & Conquer Algorithms Lab**

Enjoy exploring convex hulls! 🎨📊
