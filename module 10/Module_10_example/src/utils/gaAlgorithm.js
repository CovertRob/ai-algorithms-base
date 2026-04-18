/**
 * Genetic Algorithm Implementation
 * Implements selection, crossover, and mutation operators
 */

/**
 * Initialize random population
 */
export const initializePopulation = (size, domain) => {
  const [min, max] = domain;
  return Array.from({ length: size }, (_, id) => ({
    id,
    x: min + Math.random() * (max - min),
    y: min + Math.random() * (max - min),
    fitness: 0,
    generation: 0,
  }));
};

/**
 * Evaluate fitness for all individuals
 */
export const evaluatePopulation = (population, fitnessFunction) => {
  return population.map((individual) => ({
    ...individual,
    fitness: fitnessFunction(individual.x, individual.y),
  }));
};

/**
 * Tournament selection - select parent based on tournament
 */
export const tournamentSelection = (population, tournamentSize = 3) => {
  const tournament = [];
  for (let i = 0; i < tournamentSize; i++) {
    const randomIndex = Math.floor(Math.random() * population.length);
    tournament.push(population[randomIndex]);
  }

  // Return individual with best (lowest) fitness
  return tournament.reduce((best, current) =>
    current.fitness < best.fitness ? current : best
  );
};

/**
 * Roulette wheel selection
 */
export const rouletteSelection = (population) => {
  // Convert fitness to selection probability (for minimization, invert fitness)
  const maxFitness = Math.max(...population.map((ind) => ind.fitness));
  const invFitness = population.map((ind) => maxFitness - ind.fitness + 1);
  const totalFitness = invFitness.reduce((sum, f) => sum + f, 0);

  let random = Math.random() * totalFitness;
  for (let i = 0; i < population.length; i++) {
    random -= invFitness[i];
    if (random <= 0) {
      return population[i];
    }
  }

  return population[population.length - 1];
};

/**
 * Uniform crossover - combine two parents
 */
export const uniformCrossover = (parent1, parent2, crossoverRate) => {
  if (Math.random() > crossoverRate) {
    return [{ ...parent1 }, { ...parent2 }];
  }

  const offspring1 = {
    ...parent1,
    x: Math.random() < 0.5 ? parent1.x : parent2.x,
    y: Math.random() < 0.5 ? parent1.y : parent2.y,
  };

  const offspring2 = {
    ...parent1,
    x: Math.random() < 0.5 ? parent1.x : parent2.x,
    y: Math.random() < 0.5 ? parent1.y : parent2.y,
  };

  return [offspring1, offspring2];
};

/**
 * Arithmetic crossover - weighted average of parents
 */
export const arithmeticCrossover = (parent1, parent2, crossoverRate) => {
  if (Math.random() > crossoverRate) {
    return [{ ...parent1 }, { ...parent2 }];
  }

  const alpha = Math.random();

  const offspring1 = {
    ...parent1,
    x: alpha * parent1.x + (1 - alpha) * parent2.x,
    y: alpha * parent1.y + (1 - alpha) * parent2.y,
  };

  const offspring2 = {
    ...parent1,
    x: (1 - alpha) * parent1.x + alpha * parent2.x,
    y: (1 - alpha) * parent1.y + alpha * parent2.y,
  };

  return [offspring1, offspring2];
};

/**
 * Gaussian mutation
 */
export const gaussianMutation = (individual, mutationRate, mutationStrength, domain) => {
  const mutated = { ...individual };

  if (Math.random() < mutationRate) {
    mutated.x += (Math.random() - 0.5) * mutationStrength;
  }

  if (Math.random() < mutationRate) {
    mutated.y += (Math.random() - 0.5) * mutationStrength;
  }

  // Clamp to domain
  const [min, max] = domain;
  mutated.x = Math.max(min, Math.min(max, mutated.x));
  mutated.y = Math.max(min, Math.min(max, mutated.y));

  return mutated;
};

/**
 * Calculate population diversity (average pairwise distance)
 */
export const calculateDiversity = (population) => {
  if (population.length < 2) return 0;

  let totalDistance = 0;
  let count = 0;

  for (let i = 0; i < population.length; i++) {
    for (let j = i + 1; j < population.length; j++) {
      const dx = population[i].x - population[j].x;
      const dy = population[i].y - population[j].y;
      totalDistance += Math.sqrt(dx * dx + dy * dy);
      count++;
    }
  }

  return count > 0 ? totalDistance / count : 0;
};

/**
 * Get best individual from population
 */
export const getBestIndividual = (population) => {
  return population.reduce((best, current) =>
    current.fitness < best.fitness ? current : best
  );
};

/**
 * Run one generation of GA
 */
export const runGeneration = (
  population,
  fitnessFunction,
  params,
  generation
) => {
  const { crossoverRate, mutationRate, mutationStrength, domain, elitismCount = 2 } = params;

  // Evaluate current population
  let evaluated = evaluatePopulation(population, fitnessFunction);

  // Sort by fitness (best first)
  evaluated.sort((a, b) => a.fitness - b.fitness);

  // Elitism - keep best individuals
  const newPopulation = evaluated.slice(0, elitismCount).map((ind) => ({
    ...ind,
    generation,
  }));

  // Generate offspring
  while (newPopulation.length < population.length) {
    // Selection
    const parent1 = tournamentSelection(evaluated);
    const parent2 = tournamentSelection(evaluated);

    // Crossover
    const [offspring1, offspring2] = arithmeticCrossover(parent1, parent2, crossoverRate);

    // Mutation
    const mutated1 = gaussianMutation(offspring1, mutationRate, mutationStrength, domain);
    const mutated2 = gaussianMutation(offspring2, mutationRate, mutationStrength, domain);

    // Add to new population
    newPopulation.push({
      ...mutated1,
      id: newPopulation.length,
      generation,
    });

    if (newPopulation.length < population.length) {
      newPopulation.push({
        ...mutated2,
        id: newPopulation.length,
        generation,
      });
    }
  }

  return newPopulation;
};
