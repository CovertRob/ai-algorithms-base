/**
 * Evolution Strategies (ES) Implementation
 * Implements (μ, λ) and (μ+λ) strategies
 */

/**
 * Initialize ES population with mean and sigma
 */
export const initializeES = (mu, domain) => {
  const [min, max] = domain;
  const centerX = (min + max) / 2;
  const centerY = (min + max) / 2;

  return {
    mean: { x: centerX, y: centerY },
    sigma: (max - min) / 6, // Initial step size
    individuals: [],
  };
};

/**
 * Sample offspring from Gaussian distribution around mean
 */
export const sampleOffspring = (mean, sigma, lambda, domain) => {
  const [min, max] = domain;
  const offspring = [];

  for (let i = 0; i < lambda; i++) {
    // Box-Muller transform for Gaussian sampling
    const u1 = Math.random();
    const u2 = Math.random();
    const z1 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    const z2 = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2);

    let x = mean.x + sigma * z1;
    let y = mean.y + sigma * z2;

    // Clamp to domain
    x = Math.max(min, Math.min(max, x));
    y = Math.max(min, Math.min(max, y));

    offspring.push({
      id: i,
      x,
      y,
      fitness: 0,
    });
  }

  return offspring;
};

/**
 * Evaluate offspring
 */
export const evaluateOffspring = (offspring, fitnessFunction) => {
  return offspring.map((ind) => ({
    ...ind,
    fitness: fitnessFunction(ind.x, ind.y),
  }));
};

/**
 * Select μ best individuals
 */
export const selectBest = (individuals, mu) => {
  const sorted = [...individuals].sort((a, b) => a.fitness - b.fitness);
  return sorted.slice(0, mu);
};

/**
 * Update mean based on selected individuals
 */
export const updateMean = (selected) => {
  const n = selected.length;
  const sumX = selected.reduce((sum, ind) => sum + ind.x, 0);
  const sumY = selected.reduce((sum, ind) => sum + ind.y, 0);

  return {
    x: sumX / n,
    y: sumY / n,
  };
};

/**
 * Update sigma using 1/5 success rule
 */
export const updateSigma = (sigma, successRate, c = 1.2) => {
  if (successRate > 0.2) {
    return sigma * c; // Increase step size
  } else if (successRate < 0.2) {
    return sigma / c; // Decrease step size
  }
  return sigma;
};

/**
 * Run one generation of ES
 */
export const runESGeneration = (state, fitnessFunction, mu, lambda, strategy, domain) => {
  // Sample offspring
  const offspring = sampleOffspring(state.mean, state.sigma, lambda, domain);

  // Evaluate
  const evaluated = evaluateOffspring(offspring, fitnessFunction);

  // Select based on strategy
  let selected;
  if (strategy === 'comma') {
    // (μ, λ) - select only from offspring
    selected = selectBest(evaluated, mu);
  } else {
    // (μ+λ) - select from parents + offspring
    const combined = [...state.individuals, ...evaluated];
    selected = selectBest(combined, mu);
  }

  // Calculate success rate (proportion of offspring better than parent mean)
  const parentFitness = state.individuals.length > 0
    ? state.individuals[0].fitness
    : Infinity;
  const successCount = evaluated.filter((ind) => ind.fitness < parentFitness).length;
  const successRate = successCount / lambda;

  // Update mean
  const newMean = updateMean(selected);

  // Update sigma
  const newSigma = updateSigma(state.sigma, successRate);

  return {
    mean: newMean,
    sigma: newSigma,
    individuals: selected,
    offspring: evaluated,
  };
};
