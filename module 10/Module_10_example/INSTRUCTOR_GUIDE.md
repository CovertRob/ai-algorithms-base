# Instructor Guide: Evolutionary Algorithms Visualizer

## Overview

This interactive visualization tool is designed for graduate-level courses in AI, Data Science, and Optimization. Students explore evolutionary algorithms through hands-on experimentation without requiring any coding.

## Learning Objectives

By the end of the session, students should be able to:

1. Describe the core mechanisms of each evolutionary algorithm
2. Explain the trade-offs between exploration and exploitation
3. Interpret visual patterns in population dynamics
4. Predict the impact of parameter changes on algorithm behavior
5. Compare algorithm performance across different fitness landscapes

## Recommended Classroom Usage

### Session 1: Genetic Algorithms (45 minutes)

**Introduction (10 min)**
- Explain GA fundamentals: selection, crossover, mutation
- Introduce the Rastrigin function as a multimodal landscape

**Guided Exploration (20 min)**
1. Start with default parameters on Rastrigin
2. Click "Show Selection" → Discuss selection pressure
3. Click "Show Crossover" → Explain recombination
4. Click "Show Mutation" → Highlight exploration mechanism
5. Run "Run Continuous" → Watch convergence

**Parameter Experimentation (15 min)**
- **High mutation (0.8)**: What happens to diversity?
- **Low mutation (0.1)**: Does it get stuck in local minima?
- **High crossover (1.0) vs Low (0.2)**: Impact on convergence speed
- **Different functions**: Try Rosenbrock - narrow valley challenge

**Key Insights**
- GA needs balance: too much mutation → random search
- Crossover exploits building blocks
- Diversity prevents premature convergence

---

### Session 2: Evolution Strategies (30 minutes)

**Introduction (10 min)**
- Explain ES: Gaussian sampling, σ adaptation
- Difference between (μ, λ) and (μ+λ)

**Guided Exploration (10 min)**
1. Initialize with default parameters
2. Watch σ (sigma) metric - how does search radius change?
3. Compare (μ, λ) vs (μ+λ) strategies
4. Observe mean trajectory toward optimum

**Experimentation (10 min)**
- **λ/μ ratio**: Try 20/5 vs 20/15
- **Strategy comparison**: When does (μ+λ) help?
- **Ackley function**: Watch adaptation on flat regions

**Key Insights**
- ES adapts step size automatically (1/5 rule)
- (μ, λ) forces exploration (no parent survival)
- σ determines local vs global search

---

### Session 3: CMA-ES (45 minutes)

**Introduction (15 min)**
- Explain covariance matrix concept
- Why adaptation matters for ill-conditioned landscapes
- Interpret ellipse orientation and scaling

**Guided Exploration (15 min)**
1. Start on Rosenbrock (perfect use case!)
2. Watch ellipse rotate to align with valley
3. Observe mean trail following the curved path
4. Gold dots = selected parents, purple = offspring

**Experimentation (15 min)**
- **Rosenbrock**: CMA-ES excels here - show ellipse alignment
- **Rastrigin**: How does it handle multimodality?
- **λ/μ ratios**: Try 30/10 vs 20/5

**Key Insights**
- CMA-ES learns landscape geometry
- Ellipse axes = principal search directions
- More sophisticated than ES, but more computational cost

---

### Session 4: Particle Swarm Optimization (30 minutes)

**Introduction (10 min)**
- Explain PSO: social behavior, velocity updates
- Cognitive (personal best) vs Social (global best)

**Guided Exploration (10 min)**
1. Initialize swarm on Rastrigin
2. Watch particles converge to global best (gold star)
3. Observe velocity vectors and trails
4. Note personal best circles (faint)

**Experimentation (10 min)**
- **High inertia (0.9)**: More exploration
- **Low inertia (0.3)**: Faster convergence
- **c₁ > c₂**: Individual search dominates
- **c₂ > c₁**: Swarm follows leader quickly

**Key Insights**
- PSO has no explicit mutation or crossover
- Balance: ω (inertia) vs c₁+c₂ (attraction)
- Premature convergence risk if c₂ too high

---

## Suggested Assignments

### Assignment 1: Parameter Sensitivity Analysis
**Objective**: Understand how parameters affect performance

**Task**: For each algorithm:
1. Choose one fitness function
2. Run 5 trials with default parameters
3. Record best fitness at generation 50
4. Vary ONE parameter (e.g., mutation rate)
5. Document observations

**Deliverable**: 1-page report with screenshots

---

### Assignment 2: Algorithm Comparison
**Objective**: Compare algorithms on the same problem

**Task**:
1. Use Rastrigin function
2. Run GA, ES, CMA-ES, and PSO for 100 iterations
3. Note:
   - Convergence speed
   - Final fitness
   - Visual patterns
4. Explain which algorithm works best and why

**Deliverable**: Comparative analysis (2 pages)

---

### Assignment 3: Challenging Landscapes
**Objective**: Identify algorithm strengths and weaknesses

**Task**: Test each algorithm on:
1. **Rastrigin** (multimodal)
2. **Rosenbrock** (narrow valley)
3. **Ackley** (flat plateau)

Document:
- Which algorithm handles each landscape best?
- Why?
- Parameter adjustments that helped?

**Deliverable**: Summary table + explanation

---

## Troubleshooting

### "Population not evolving"
- Check mutation rate (GA) or σ (ES/CMA-ES)
- Ensure crossover/inertia is not zero
- Try increasing population size

### "Gets stuck in local minimum"
- Increase diversity (higher mutation, larger σ)
- Try different selection pressure
- Use (μ, λ) strategy instead of (μ+λ)

### "Too slow convergence"
- Increase selection pressure
- Reduce population size
- Adjust c₁/c₂ ratio (PSO)

---

## Advanced Topics (Optional)

### Multi-Objective Optimization
Extend the tool by:
- Adding Pareto front visualization
- Implementing NSGA-II or SPEA2

### Constraint Handling
Discuss penalty methods:
- Death penalty (infeasible solutions rejected)
- Adaptive penalties
- Repair mechanisms

### Hybridization
Combine algorithms:
- PSO for global search + local hill climbing
- CMA-ES initialization from GA population

---

## Technical Notes

### Performance Tips
- Keep population < 100 for smooth 60 FPS rendering
- Use "Run Continuous" sparingly during demos
- Reset before switching functions

### Accessibility
- All controls have tooltips
- Colorblind-safe palette
- Keyboard navigation supported

### Browser Requirements
- Chrome 90+, Firefox 88+, Safari 14+
- WebGL enabled
- 1920x1080+ resolution recommended

---

## Additional Resources

### Textbooks
1. **"Introduction to Evolutionary Computing"** by Eiben & Smith
2. **"Computational Intelligence: An Introduction"** by Engelbrecht

### Papers
1. Hansen & Ostermeier (2001) - CMA-ES original paper
2. Kennedy & Eberhart (1995) - PSO introduction
3. Beyer & Schwefel (2002) - ES overview

### Online Resources
- [CMA-ES Tutorial](https://cma-es.github.io/)
- [Optimization Test Functions](https://en.wikipedia.org/wiki/Test_functions_for_optimization)

---

## Feedback & Improvements

Students can suggest features via:
- GitHub Issues
- Course discussion board
- Direct instructor feedback

Common requests:
- 3D visualization mode
- Custom fitness function input
- Side-by-side algorithm comparison
- Export data to CSV for analysis

---

## License & Attribution

This tool is open-source (MIT License). Feel free to:
- Use in your courses
- Modify for specific needs
- Share with colleagues
- Contribute improvements

**Please cite**: JHU AI Algorithms Course Development, 2025

---

## Contact

For questions or support:
- Course instructor: [contact info]
- Technical issues: GitHub repository
- Feature requests: Submit pull request

Enjoy teaching evolutionary algorithms interactively!
