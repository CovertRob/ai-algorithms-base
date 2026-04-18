/**
 * Particle Swarm Optimization (PSO) Implementation
 */

/**
 * Initialize swarm
 */
export const initializeSwarm = (size, domain) => {
  const [min, max] = domain;
  const particles = [];

  for (let i = 0; i < size; i++) {
    const x = min + Math.random() * (max - min);
    const y = min + Math.random() * (max - min);

    particles.push({
      id: i,
      x,
      y,
      vx: (Math.random() - 0.5) * (max - min) * 0.1,
      vy: (Math.random() - 0.5) * (max - min) * 0.1,
      fitness: 0,
      bestX: x,
      bestY: y,
      bestFitness: Infinity,
      trail: [{ x, y }],
    });
  }

  return {
    particles,
    gBest: { x: 0, y: 0, fitness: Infinity },
  };
};

/**
 * Evaluate particles
 */
export const evaluateSwarm = (swarm, fitnessFunction) => {
  const particles = swarm.particles.map((p) => {
    const fitness = fitnessFunction(p.x, p.y);

    // Update personal best
    let newP = { ...p, fitness };
    if (fitness < p.bestFitness) {
      newP = {
        ...newP,
        bestX: p.x,
        bestY: p.y,
        bestFitness: fitness,
      };
    }

    return newP;
  });

  // Update global best
  let gBest = { ...swarm.gBest };
  particles.forEach((p) => {
    if (p.bestFitness < gBest.fitness) {
      gBest = {
        x: p.bestX,
        y: p.bestY,
        fitness: p.bestFitness,
      };
    }
  });

  return {
    particles,
    gBest,
  };
};

/**
 * Update particle velocities and positions
 */
export const updateSwarm = (swarm, omega, c1, c2, domain) => {
  const [min, max] = domain;

  const particles = swarm.particles.map((p) => {
    // Update velocity
    const r1 = Math.random();
    const r2 = Math.random();

    const cognitive = c1 * r1 * (p.bestX - p.x);
    const cognitiveY = c1 * r1 * (p.bestY - p.y);

    const social = c2 * r2 * (swarm.gBest.x - p.x);
    const socialY = c2 * r2 * (swarm.gBest.y - p.y);

    let vx = omega * p.vx + cognitive + social;
    let vy = omega * p.vy + cognitiveY + socialY;

    // Velocity clamping
    const vMax = (max - min) * 0.2;
    vx = Math.max(-vMax, Math.min(vMax, vx));
    vy = Math.max(-vMax, Math.min(vMax, vy));

    // Update position
    let x = p.x + vx;
    let y = p.y + vy;

    // Boundary handling - reflect
    if (x < min) {
      x = min;
      vx = -vx * 0.5;
    } else if (x > max) {
      x = max;
      vx = -vx * 0.5;
    }

    if (y < min) {
      y = min;
      vy = -vy * 0.5;
    } else if (y > max) {
      y = max;
      vy = -vy * 0.5;
    }

    // Update trail (keep last 10 positions)
    const trail = [...p.trail, { x, y }].slice(-10);

    return {
      ...p,
      x,
      y,
      vx,
      vy,
      trail,
    };
  });

  return {
    ...swarm,
    particles,
  };
};

/**
 * Run one PSO iteration
 */
export const runPSOIteration = (swarm, fitnessFunction, omega, c1, c2, domain) => {
  // Evaluate current positions
  let updated = evaluateSwarm(swarm, fitnessFunction);

  // Update velocities and positions
  updated = updateSwarm(updated, omega, c1, c2, domain);

  return updated;
};

/**
 * Calculate average velocity magnitude
 */
export const calculateAverageVelocity = (particles) => {
  const sum = particles.reduce((acc, p) => {
    return acc + Math.sqrt(p.vx * p.vx + p.vy * p.vy);
  }, 0);

  return sum / particles.length;
};
