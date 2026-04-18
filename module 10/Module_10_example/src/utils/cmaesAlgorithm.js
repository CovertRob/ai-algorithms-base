/**
 * CMA-ES (Covariance Matrix Adaptation Evolution Strategy) Implementation
 * Simplified version for 2D visualization
 */

/**
 * Matrix operations
 */
const multiplyMatrixVector = (matrix, vector) => {
  return [
    matrix[0][0] * vector[0] + matrix[0][1] * vector[1],
    matrix[1][0] * vector[0] + matrix[1][1] * vector[1],
  ];
};

const multiplyMatrices = (A, B) => {
  return [
    [A[0][0] * B[0][0] + A[0][1] * B[1][0], A[0][0] * B[0][1] + A[0][1] * B[1][1]],
    [A[1][0] * B[0][0] + A[1][1] * B[1][0], A[1][0] * B[0][1] + A[1][1] * B[1][1]],
  ];
};

const addMatrices = (A, B) => {
  return [
    [A[0][0] + B[0][0], A[0][1] + B[0][1]],
    [A[1][0] + B[0][0], A[1][1] + B[1][1]],
  ];
};

const scaleMatrix = (A, scalar) => {
  return [
    [A[0][0] * scalar, A[0][1] * scalar],
    [A[1][0] * scalar, A[1][1] * scalar],
  ];
};

const transpose = (A) => {
  return [
    [A[0][0], A[1][0]],
    [A[0][1], A[1][1]],
  ];
};

/**
 * Compute eigenvalues and eigenvectors (2x2 matrix only)
 */
const eigenDecomposition = (C) => {
  const a = C[0][0];
  const b = C[0][1];
  const c = C[1][0];
  const d = C[1][1];

  const trace = a + d;
  const det = a * d - b * c;

  const lambda1 = trace / 2 + Math.sqrt(trace * trace / 4 - det);
  const lambda2 = trace / 2 - Math.sqrt(trace * trace / 4 - det);

  // Eigenvectors
  let v1, v2;

  if (Math.abs(b) > 1e-10) {
    v1 = [lambda1 - d, c];
    v2 = [lambda2 - d, c];
  } else if (Math.abs(c) > 1e-10) {
    v1 = [b, lambda1 - a];
    v2 = [b, lambda2 - a];
  } else {
    v1 = [1, 0];
    v2 = [0, 1];
  }

  // Normalize
  const norm1 = Math.sqrt(v1[0] * v1[0] + v1[1] * v1[1]);
  const norm2 = Math.sqrt(v2[0] * v2[0] + v2[1] * v2[1]);

  v1 = [v1[0] / norm1, v1[1] / norm1];
  v2 = [v2[0] / norm2, v2[1] / norm2];

  return {
    eigenvalues: [lambda1, lambda2],
    eigenvectors: [v1, v2],
  };
};

/**
 * Initialize CMA-ES state
 */
export const initializeCMAES = (lambda, domain) => {
  const [min, max] = domain;
  const mean = [(min + max) / 2, (min + max) / 2];
  const sigma = (max - min) / 6;

  // Covariance matrix (identity)
  const C = [
    [1, 0],
    [0, 1],
  ];

  // Evolution path
  const pc = [0, 0];
  const ps = [0, 0];

  return {
    mean,
    sigma,
    C,
    pc,
    ps,
    generation: 0,
    offspring: [],
  };
};

/**
 * Sample offspring from multivariate Gaussian
 */
export const sampleCMAESOffspring = (state, lambda, domain) => {
  const [min, max] = domain;
  const offspring = [];

  // Get eigendecomposition for sampling
  const { eigenvalues, eigenvectors } = eigenDecomposition(state.C);

  for (let i = 0; i < lambda; i++) {
    // Sample from standard normal
    const z1 = gaussianRandom();
    const z2 = gaussianRandom();

    // Transform to covariance space
    const scaled = [
      Math.sqrt(eigenvalues[0]) * z1 * eigenvectors[0][0] +
        Math.sqrt(eigenvalues[1]) * z2 * eigenvectors[1][0],
      Math.sqrt(eigenvalues[0]) * z1 * eigenvectors[0][1] +
        Math.sqrt(eigenvalues[1]) * z2 * eigenvectors[1][1],
    ];

    let x = state.mean[0] + state.sigma * scaled[0];
    let y = state.mean[1] + state.sigma * scaled[1];

    // Clamp to domain
    x = Math.max(min, Math.min(max, x));
    y = Math.max(min, Math.min(max, y));

    offspring.push({
      id: i,
      x,
      y,
      fitness: 0,
      z: [z1, z2],
    });
  }

  return offspring;
};

/**
 * Gaussian random number generator (Box-Muller)
 */
const gaussianRandom = () => {
  const u1 = Math.random();
  const u2 = Math.random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
};

/**
 * Evaluate offspring
 */
export const evaluateCMAESOffspring = (offspring, fitnessFunction) => {
  return offspring.map((ind) => ({
    ...ind,
    fitness: fitnessFunction(ind.x, ind.y),
  }));
};

/**
 * Update CMA-ES state
 */
export const updateCMAES = (state, offspring, mu) => {
  // Sort offspring by fitness
  const sorted = [...offspring].sort((a, b) => a.fitness - b.fitness);
  const selected = sorted.slice(0, mu);

  // Recombination weights
  const weights = selected.map((_, i) => Math.log(mu + 0.5) - Math.log(i + 1));
  const sumWeights = weights.reduce((a, b) => a + b, 0);
  const normalizedWeights = weights.map((w) => w / sumWeights);

  // Update mean
  const newMean = [0, 0];
  selected.forEach((ind, i) => {
    newMean[0] += normalizedWeights[i] * ind.x;
    newMean[1] += normalizedWeights[i] * ind.y;
  });

  // Compute mean displacement
  const displacement = [
    (newMean[0] - state.mean[0]) / state.sigma,
    (newMean[1] - state.mean[1]) / state.sigma,
  ];

  // Update evolution path (simplified)
  const cc = 4 / 6; // Cumulation constant
  const newPc = [
    (1 - cc) * state.pc[0] + Math.sqrt(cc * (2 - cc)) * displacement[0],
    (1 - cc) * state.pc[1] + Math.sqrt(cc * (2 - cc)) * displacement[1],
  ];

  // Update covariance matrix (rank-one update)
  const ccov = 2 / 6;
  const outerProduct = [
    [newPc[0] * newPc[0], newPc[0] * newPc[1]],
    [newPc[1] * newPc[0], newPc[1] * newPc[1]],
  ];

  const newC = [
    [
      (1 - ccov) * state.C[0][0] + ccov * outerProduct[0][0],
      (1 - ccov) * state.C[0][1] + ccov * outerProduct[0][1],
    ],
    [
      (1 - ccov) * state.C[1][0] + ccov * outerProduct[1][0],
      (1 - ccov) * state.C[1][1] + ccov * outerProduct[1][1],
    ],
  ];

  // Update sigma (simplified 1/5 success rule approximation)
  const successRate = selected.filter((ind) => ind.fitness < sorted[mu]?.fitness || 0).length / mu;
  const csigma = successRate > 0.2 ? 1.1 : 0.9;
  const newSigma = state.sigma * csigma;

  return {
    mean: newMean,
    sigma: newSigma,
    C: newC,
    pc: newPc,
    ps: state.ps,
    generation: state.generation + 1,
    offspring: sorted,
  };
};

/**
 * Run one CMA-ES generation
 */
export const runCMAESGeneration = (state, fitnessFunction, lambda, mu, domain) => {
  // Sample offspring
  const offspring = sampleCMAESOffspring(state, lambda, domain);

  // Evaluate
  const evaluated = evaluateCMAESOffspring(offspring, fitnessFunction);

  // Update state
  const newState = updateCMAES(state, evaluated, mu);

  return newState;
};

/**
 * Get ellipse parameters from covariance matrix
 */
export const getCovarianceEllipse = (C, sigma) => {
  const { eigenvalues, eigenvectors } = eigenDecomposition(C);

  const angle = Math.atan2(eigenvectors[0][1], eigenvectors[0][0]);
  const width = 2 * sigma * Math.sqrt(eigenvalues[0]);
  const height = 2 * sigma * Math.sqrt(eigenvalues[1]);

  return { width, height, angle };
};
