# Quick Start Guide

## Get Running in 3 Minutes

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The app will open automatically at `http://localhost:3000`

### 3. Start Exploring

#### First Steps with Genetic Algorithm (Blue Tab)
1. Click **"Genetic Algorithm"** tab (already selected)
2. Click **"Show Selection"** - watch yellow circles highlight selected parents
3. Click **"Show Crossover"** - see purple offspring created from parents
4. Click **"Show Mutation"** - observe red mutation effects
5. Click **"Run Continuous"** - watch the population evolve automatically
6. Click **"Pause"** when satisfied

**Try This**:
- Move the "Mutation Rate" slider to 0.8 (high)
- Click "Run Continuous" again
- Notice how the population becomes more scattered (high diversity)

#### Explore Evolution Strategies (Orange Tab)
1. Click **"Evolution Strategies"** tab
2. Notice the orange circle around the mean (⊕ symbol)
3. Click **"Run Generation"** multiple times
4. Watch the circle (σ) shrink as it approaches the optimum
5. Change "Strategy" to "(μ+λ)" and compare behavior

#### Visualize CMA-ES (Purple Tab)
1. Click **"CMA-ES"** tab
2. Select **"Rosenbrock"** function (perfect for CMA-ES!)
3. Click **"Run Continuous"**
4. Watch the purple ellipses rotate and scale
5. See the mean trail (purple line) follow the valley

**Key Insight**: The ellipse learns the landscape shape!

#### Watch Particle Swarm (Teal Tab)
1. Click **"Particle Swarm Optimization"** tab
2. Click **"Run Continuous"**
3. Watch particles converge toward the gold star (global best)
4. Notice the teal trails showing particle history
5. Adjust "Inertia (ω)" to 0.3 for faster convergence

---

## Understanding the Interface

### Left Panel: Visualization Canvas
- **Background colors**: Blue (low fitness) → Red (high fitness)
- **Dots/Particles**: Current population/swarm
- **Special markers**: Stars, circles, ellipses (algorithm-specific)

### Right Panel: Controls

#### Top Section: Parameters
- **Sliders**: Adjust algorithm parameters
- **Dropdown**: Select fitness function
- **Tooltips**: Hover over labels for explanations

#### Middle Section: Animation Controls
- **Show [X]**: Trigger specific algorithm step
- **Run Generation/Iteration**: Execute one complete cycle
- **Run Continuous**: Auto-run (500ms delay)
- **Pause**: Stop continuous run
- **Reset**: Reinitialize population

#### Bottom Section: Metrics
- **Generation/Iteration**: Current step count
- **Best Fitness**: Lowest value found (lower = better)
- **Algorithm-specific**: Diversity, σ, velocity, etc.

---

## Common Scenarios

### "I want to see the algorithm get stuck in a local minimum"
1. Select **Rastrigin** function (many local minima)
2. Set **mutation rate** to 0.05 (very low)
3. Click **Run Continuous**
4. Watch it likely converge to a non-optimal point

### "I want to see fast convergence"
1. Select **Sphere** function (simple convex)
2. Use **PSO** algorithm
3. Set **Inertia** to 0.4
4. Set **Social (c₂)** to 2.5
5. Click **Run Continuous**

### "I want to see covariance adaptation in action"
1. Use **CMA-ES** algorithm
2. Select **Rosenbrock** function
3. Click **Run Continuous**
4. Watch ellipses align with the curved valley

---

## Tips & Tricks

### Performance
- Keep population/swarm size ≤ 50 for smooth animation
- Pause continuous run before changing parameters
- Reset before switching fitness functions

### Best Visualizations
- **GA**: Use "Show Selection/Crossover/Mutation" for step-by-step learning
- **ES**: Watch σ (sigma) metric - it shows adaptation in action
- **CMA-ES**: Rosenbrock function showcases ellipse rotation beautifully
- **PSO**: Lower inertia (ω) shows clearer convergence patterns

### Parameter Ranges
- **Start conservative**: Use default values first
- **One at a time**: Change one parameter, observe, then change another
- **Extreme values**: Try edge cases to understand boundaries

---

## Troubleshooting

### "Nothing is happening"
- Check if population is initialized (metrics should show values)
- Click "Reset" to reinitialize
- Make sure "Run Continuous" is clicked for automatic animation

### "Population disappeared"
- It might have converged very tightly around optimum
- Try zooming in (refresh page - zoom feature coming soon)
- Check "Diversity" metric - if near 0, population collapsed

### "Slow performance"
- Reduce population/swarm size
- Close other browser tabs
- Ensure hardware acceleration is enabled

### "Build errors"
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

## Next Steps

### For Students
1. Complete the guided exploration above
2. Try all four algorithms on all four functions
3. Read `INSTRUCTOR_GUIDE.md` for assignment ideas
4. Experiment with parameter combinations

### For Instructors
1. Review `INSTRUCTOR_GUIDE.md` for lesson plans
2. Test demo scenarios before class
3. Prepare discussion questions about observations
4. Consider screen recording key examples

### For Developers
1. Explore `src/` directory structure
2. Read component documentation in code
3. Check `README.md` for technical details
4. Consider contributing improvements

---

## Key Concepts to Understand

### Genetic Algorithm
- **Selection**: Who gets to reproduce?
- **Crossover**: How do we combine parents?
- **Mutation**: How do we introduce novelty?

### Evolution Strategies
- **Gaussian sampling**: Why normal distribution?
- **Step size (σ)**: How does it adapt?
- **Strategy**: (μ, λ) vs (μ+λ) implications?

### CMA-ES
- **Covariance matrix**: What does it represent?
- **Ellipse orientation**: Why does it rotate?
- **Adaptation**: How is it better than ES?

### PSO
- **Velocity**: What influences particle movement?
- **Inertia**: Why does momentum matter?
- **Social vs Cognitive**: What's the balance?

---

## Resources

- **Full Documentation**: `README.md`
- **Teaching Guide**: `INSTRUCTOR_GUIDE.md`
- **Source Code**: `src/` directory
- **Bug Reports**: GitHub Issues

---

## Quick Reference: Default Parameters

| Algorithm | Key Parameters | Defaults |
|-----------|---------------|----------|
| GA | Population: 50, Crossover: 0.8, Mutation: 0.2 | Balanced |
| ES | μ: 5, λ: 20, Strategy: (μ, λ) | Standard ratio |
| CMA-ES | λ: 20, μ: 10 | Recommended 2:1 |
| PSO | Size: 30, ω: 0.7, c₁: 1.5, c₂: 1.5 | Classic values |

---

**Enjoy exploring evolutionary algorithms!**

For questions: See `README.md` contact section
