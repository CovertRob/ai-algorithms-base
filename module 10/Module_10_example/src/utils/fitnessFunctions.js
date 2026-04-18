/**
 * Fitness Functions for Evolutionary Algorithm Visualization
 * All functions are designed to be MINIMIZED
 */

/**
 * Rastrigin function: f(x,y) = 20 + x² + y² - 10(cos(2πx) + cos(2πy))
 * Global minimum: f(0, 0) = 0
 * Search domain: [-5.12, 5.12]
 * Characteristics: Highly multimodal with many local minima
 */
export const rastrigin = (x, y) => {
  return (
    20 +
    x * x +
    y * y -
    10 * (Math.cos(2 * Math.PI * x) + Math.cos(2 * Math.PI * y))
  );
};

/**
 * Rosenbrock function: f(x,y) = (1-x)² + 100(y-x²)²
 * Global minimum: f(1, 1) = 0
 * Search domain: [-5, 5]
 * Characteristics: Narrow curved valley, hard to optimize
 */
export const rosenbrock = (x, y) => {
  return (1 - x) ** 2 + 100 * (y - x * x) ** 2;
};

/**
 * Ackley function: f(x,y) = -20·exp(-0.2·√(0.5(x²+y²))) - exp(0.5(cos(2πx)+cos(2πy))) + e + 20
 * Global minimum: f(0, 0) = 0
 * Search domain: [-5, 5]
 * Characteristics: Nearly flat outer region, large hole at center
 */
export const ackley = (x, y) => {
  const term1 = -20 * Math.exp(-0.2 * Math.sqrt(0.5 * (x * x + y * y)));
  const term2 = -Math.exp(0.5 * (Math.cos(2 * Math.PI * x) + Math.cos(2 * Math.PI * y)));
  return term1 + term2 + Math.E + 20;
};

/**
 * Sphere function: f(x,y) = x² + y²
 * Global minimum: f(0, 0) = 0
 * Search domain: [-5, 5]
 * Characteristics: Simple convex function, easy to optimize
 */
export const sphere = (x, y) => {
  return x * x + y * y;
};

/**
 * Function metadata for UI display
 */
export const FUNCTIONS = {
  rastrigin: {
    name: 'Rastrigin',
    fn: rastrigin,
    domain: [-5.12, 5.12],
    optimum: [0, 0],
    description: 'Highly multimodal with many local minima',
    contourLevels: [0, 10, 20, 40, 60, 80, 100],
  },
  rosenbrock: {
    name: 'Rosenbrock',
    fn: rosenbrock,
    domain: [-2, 2],
    optimum: [1, 1],
    description: 'Narrow curved valley - challenging optimization',
    contourLevels: [0, 10, 50, 100, 200, 500, 1000],
  },
  ackley: {
    name: 'Ackley',
    fn: ackley,
    domain: [-5, 5],
    optimum: [0, 0],
    description: 'Nearly flat outer region with central basin',
    contourLevels: [0, 2, 4, 6, 8, 10, 12, 14],
  },
  sphere: {
    name: 'Sphere',
    fn: sphere,
    domain: [-5, 5],
    optimum: [0, 0],
    description: 'Simple convex function for testing',
    contourLevels: [0, 5, 10, 15, 20, 25],
  },
};

/**
 * Generate contour data for visualization
 * @param {Function} fn - Fitness function
 * @param {Array} domain - [min, max] for both x and y
 * @param {number} resolution - Number of points per axis
 */
export const generateContourData = (fn, domain, resolution = 100) => {
  const [min, max] = domain;
  const step = (max - min) / resolution;
  const data = [];

  for (let i = 0; i <= resolution; i++) {
    const x = min + i * step;
    for (let j = 0; j <= resolution; j++) {
      const y = min + j * step;
      const z = fn(x, y);
      data.push({ x, y, z });
    }
  }

  return data;
};

/**
 * Clamp value to domain
 */
export const clamp = (value, min, max) => {
  return Math.max(min, Math.min(max, value));
};

/**
 * Generate random point within domain
 */
export const randomInDomain = (domain) => {
  const [min, max] = domain;
  return min + Math.random() * (max - min);
};
