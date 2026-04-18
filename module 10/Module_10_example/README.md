# Evolutionary Algorithms Visualizer

An interactive web application for visualizing and learning about evolutionary algorithms. Built for graduate-level AI and optimization courses.

## Features

### Four Algorithm Implementations

1. **Genetic Algorithm (GA)**
   - Interactive visualization of selection, crossover, and mutation
   - Tournament selection with configurable parameters
   - Arithmetic crossover and Gaussian mutation
   - Real-time diversity and fitness tracking

2. **Evolution Strategies (ES)**
   - (μ, λ) and (μ+λ) strategies
   - Gaussian sampling with adaptive step size (σ)
   - Visual representation of population spread
   - 1/5 success rule implementation

3. **CMA-ES (Covariance Matrix Adaptation)**
   - Adaptive covariance matrix visualization
   - Rotating ellipses show learned search directions
   - Mean trajectory tracking
   - Rank-based recombination

4. **Particle Swarm Optimization (PSO)**
   - Swarm dynamics with velocity vectors
   - Personal best and global best visualization
   - Configurable inertia, cognitive, and social coefficients
   - Particle trail history

### Fitness Functions

- **Rastrigin**: Highly multimodal with many local minima
- **Rosenbrock**: Narrow curved valley (challenging)
- **Ackley**: Nearly flat outer region with central basin
- **Sphere**: Simple convex function for testing

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The application will open at `http://localhost:3000`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Usage

### Navigation

Click on the tabs at the top to switch between algorithms:
- Genetic Algorithm (Blue)
- Evolution Strategies (Orange)
- CMA-ES (Purple)
- Particle Swarm Optimization (Teal)

### Controls

Each algorithm tab includes:

**Parameter Sliders**: Adjust algorithm-specific parameters in real-time

**Animation Buttons**:
- **Show Selection/Sampling**: Visualize the selection mechanism
- **Show Crossover**: See how offspring are created (GA only)
- **Show Mutation**: Watch mutation operators in action (GA only)
- **Run Generation/Iteration**: Execute one complete cycle
- **Run Continuous**: Auto-run multiple generations
- **Reset**: Reinitialize the population

**Metrics Panel**: Live tracking of:
- Generation/Iteration count
- Best fitness found
- Population diversity (GA) or σ (ES/CMA-ES)
- Average velocity (PSO)

### Visualization

The left panel shows a 2D contour map of the selected fitness function with:
- Color-coded fitness landscape (blue = low fitness, red = high fitness)
- Population/particles as colored dots
- Algorithm-specific overlays:
  - GA: Parent highlights during selection
  - ES: Gaussian sampling circle around mean
  - CMA-ES: Adaptive covariance ellipses (1σ, 2σ, 3σ)
  - PSO: Velocity vectors, trails, and global best star

## Educational Objectives

Students will learn:

1. **How selection pressure affects convergence** (GA, ES)
2. **The role of diversity in avoiding local optima** (GA)
3. **Adaptive step-size control** (ES, CMA-ES)
4. **Covariance adaptation to landscape geometry** (CMA-ES)
5. **Balance between exploration and exploitation** (PSO)
6. **Impact of parameter tuning** (all algorithms)

## Technical Stack

- **Frontend**: React 18 + Vite
- **Rendering**: Pixi.js (WebGL) for high-performance visualization
- **Styling**: Tailwind CSS
- **Charts**: Recharts (for metrics)
- **State Management**: Zustand

## Project Structure

```
src/
├── components/
│   ├── shared/       # Reusable UI components (Canvas, Slider, etc.)
│   ├── ga/           # Genetic Algorithm component
│   ├── es/           # Evolution Strategies component
│   ├── cmaes/        # CMA-ES component
│   └── pso/          # Particle Swarm component
├── utils/
│   ├── fitnessFunctions.js     # Optimization test functions
│   ├── visualization.js        # Pixi.js drawing utilities
│   ├── gaAlgorithm.js          # GA implementation
│   ├── esAlgorithm.js          # ES implementation
│   ├── cmaesAlgorithm.js       # CMA-ES implementation
│   └── psoAlgorithm.js         # PSO implementation
├── App.jsx           # Main application with tab navigation
└── main.jsx          # Entry point
```

## Performance

- 60 FPS rendering for populations up to 100 individuals
- WebGL-accelerated graphics via Pixi.js
- Optimized for desktop and tablet displays
- <10ms UI latency for parameter adjustments

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Accessibility

- Colorblind-safe palette
- Tooltips for all parameters
- Keyboard-navigable controls
- ARIA labels for screen readers

## Future Enhancements

- CSV export for analysis
- Side-by-side algorithm comparison
- Custom fitness function input
- Jupyter integration via WebSocket
- 3D visualization mode

## License

MIT License - Educational use encouraged

## Authors

Developed for JHU AI Algorithms Course Development

## Contributing

This is an educational tool. Contributions welcome via pull requests.

## Acknowledgments

- Pixi.js team for excellent WebGL rendering
- React team for the framework
- Evolutionary computation research community
