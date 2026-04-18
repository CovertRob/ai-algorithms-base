import { useState, useCallback, useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import Canvas from '../shared/Canvas';
import Slider from '../shared/Slider';
import Select from '../shared/Select';
import ControlPanel from '../shared/ControlPanel';
import MetricCard from '../shared/MetricCard';
import { FUNCTIONS } from '../../utils/fitnessFunctions';
import { drawContourMap, domainToCanvas, drawPoint, clearGraphics, drawTrail } from '../../utils/visualization';
import {
  initializeSwarm,
  runPSOIteration,
  calculateAverageVelocity,
} from '../../utils/psoAlgorithm';

const ParticleSwarm = () => {
  // Parameters
  const [swarmSize, setSwarmSize] = useState(30);
  const [omega, setOmega] = useState(0.7);
  const [c1, setC1] = useState(1.5);
  const [c2, setC2] = useState(1.5);
  const [selectedFunction, setSelectedFunction] = useState('rastrigin');
  const [isRunning, setIsRunning] = useState(false);

  // Algorithm state
  const [swarm, setSwarm] = useState(null);
  const [iteration, setIteration] = useState(0);
  const [avgVelocity, setAvgVelocity] = useState(0);

  // Refs
  const appRef = useRef(null);
  const backgroundRef = useRef(null);
  const swarmLayerRef = useRef(null);

  const functionData = FUNCTIONS[selectedFunction];
  const canvasWidth = 800;
  const canvasHeight = 600;

  // Initialize
  const handleInitialize = () => {
    const newSwarm = initializeSwarm(swarmSize, functionData.domain);
    setSwarm(newSwarm);
    setIteration(0);
    setIsRunning(false);
    setAvgVelocity(0);

    if (swarmLayerRef.current) {
      clearGraphics(swarmLayerRef.current);
      drawSwarm(newSwarm);
    }
  };

  // Draw swarm
  const drawSwarm = useCallback((swarmData) => {
    if (!swarmLayerRef.current || !swarmData) return;

    const graphics = swarmLayerRef.current;
    clearGraphics(graphics);

    // Draw global best as star
    const gBestCanvas = domainToCanvas(
      swarmData.gBest.x,
      swarmData.gBest.y,
      functionData.domain,
      canvasWidth,
      canvasHeight
    );

    graphics.star(gBestCanvas.x, gBestCanvas.y, 8, 20, 10);
    graphics.fill({ color: 0xfbbf24 });
    graphics.star(gBestCanvas.x, gBestCanvas.y, 8, 20, 10);
    graphics.stroke({ width: 2, color: 0x000000 });

    // Draw particles
    swarmData.particles.forEach((particle) => {
      const { x: canvasX, y: canvasY } = domainToCanvas(
        particle.x,
        particle.y,
        functionData.domain,
        canvasWidth,
        canvasHeight
      );

      // Draw trail
      if (particle.trail && particle.trail.length > 1) {
        const trailCanvas = particle.trail.map((pos) =>
          domainToCanvas(pos.x, pos.y, functionData.domain, canvasWidth, canvasHeight)
        );
        drawTrail(graphics, trailCanvas, 0x14b8a6, 1, 0.3);
      }

      // Draw personal best (faint circle)
      const pBestCanvas = domainToCanvas(
        particle.bestX,
        particle.bestY,
        functionData.domain,
        canvasWidth,
        canvasHeight
      );

      graphics.circle(pBestCanvas.x, pBestCanvas.y, 8);
      graphics.stroke({ width: 1, color: 0x14b8a6, alpha: 0.3 });

      // Draw particle
      drawPoint(graphics, canvasX, canvasY, 0x14b8a6, 6);

      // Draw velocity vector (small arrow)
      const vScale = 10;
      const vx = particle.vx * vScale;
      const vy = particle.vy * vScale;

      if (Math.abs(vx) > 0.5 || Math.abs(vy) > 0.5) {
        graphics.moveTo(canvasX, canvasY);
        graphics.lineTo(canvasX + vx, canvasY + vy);
        graphics.stroke({ width: 2, color: 0x0d9488, alpha: 0.6 });
      }
    });
  }, [functionData, canvasWidth, canvasHeight]);

  // Run iteration
  const handleRunIteration = useCallback(() => {
    if (!swarm) return;

    const newSwarm = runPSOIteration(
      swarm,
      functionData.fn,
      omega,
      c1,
      c2,
      functionData.domain
    );

    setSwarm(newSwarm);
    setIteration((i) => i + 1);
    setAvgVelocity(calculateAverageVelocity(newSwarm.particles));

    drawSwarm(newSwarm);
  }, [swarm, functionData, omega, c1, c2, drawSwarm]);

  // Continuous run
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      handleRunIteration();
    }, 100);

    return () => clearInterval(interval);
  }, [isRunning, handleRunIteration]);

  // Setup canvas
  const setupCanvas = useCallback((app) => {
    appRef.current = app;

    const background = new PIXI.Graphics();
    app.stage.addChild(background);
    backgroundRef.current = background;

    const swarmLayer = new PIXI.Graphics();
    app.stage.addChild(swarmLayer);
    swarmLayerRef.current = swarmLayer;

    drawContourMap(background, functionData.fn, functionData.domain, canvasWidth, canvasHeight);

    const newSwarm = initializeSwarm(swarmSize, functionData.domain);
    setSwarm(newSwarm);
    drawSwarm(newSwarm);
  }, [functionData, swarmSize, canvasWidth, canvasHeight, drawSwarm]);


  return (
    <div className="flex h-full">
      <div className="w-2/3 p-6 flex flex-col items-center justify-center bg-gray-100">
        <div className="bg-white rounded-lg shadow-lg p-4">
          <Canvas
            key={`pso-${selectedFunction}`}
            width={canvasWidth}
            height={canvasHeight}
            onSetup={setupCanvas}
            className="rounded-md"
          />
        </div>
      </div>

      <div className="w-1/3 p-6 overflow-y-auto space-y-4">
        <ControlPanel title="Particle Swarm Optimization" color="teal">
          <Select
            label="Fitness Function"
            value={selectedFunction}
            onChange={setSelectedFunction}
            options={Object.keys(FUNCTIONS).map((key) => ({
              value: key,
              label: FUNCTIONS[key].name,
            }))}
            color="teal"
          />

          <Slider
            label="Swarm Size"
            value={swarmSize}
            onChange={setSwarmSize}
            min={10}
            max={100}
            step={10}
            color="teal"
            tooltip="Number of particles in the swarm"
          />

          <Slider
            label="Inertia (ω)"
            value={omega}
            onChange={setOmega}
            min={0.1}
            max={1}
            step={0.1}
            color="teal"
            tooltip="Inertia weight - controls velocity momentum"
          />

          <Slider
            label="Cognitive (c₁)"
            value={c1}
            onChange={setC1}
            min={0}
            max={3}
            step={0.1}
            color="teal"
            tooltip="Cognitive coefficient - attraction to personal best"
          />

          <Slider
            label="Social (c₂)"
            value={c2}
            onChange={setC2}
            min={0}
            max={3}
            step={0.1}
            color="teal"
            tooltip="Social coefficient - attraction to global best"
          />
        </ControlPanel>

        <ControlPanel title="Controls" color="teal">
          <div className="flex gap-3">
            <button
              onClick={handleRunIteration}
              disabled={!swarm}
              className="flex-1 btn-teal disabled:opacity-50"
            >
              Run Iteration
            </button>
          </div>

          <div className="flex gap-3 mt-3">
            <button
              onClick={() => setIsRunning(!isRunning)}
              disabled={!swarm}
              className="flex-1 btn-teal disabled:opacity-50"
            >
              {isRunning ? 'Pause' : 'Run Continuous'}
            </button>

            <button
              onClick={handleInitialize}
              className="flex-1 bg-gray-600 text-white btn-primary hover:bg-gray-700"
            >
              Reset
            </button>
          </div>
        </ControlPanel>

        <ControlPanel title="Metrics" color="teal">
          <div className="grid grid-cols-2 gap-3">
            <MetricCard label="Iteration" value={iteration} color="teal" />
            <MetricCard
              label="Best Fitness"
              value={swarm?.gBest.fitness || 0}
              color="teal"
            />
            <MetricCard
              label="Avg Velocity"
              value={avgVelocity}
              color="teal"
            />
            <MetricCard
              label="Particles"
              value={swarmSize}
              color="teal"
            />
          </div>
        </ControlPanel>

        <div className="bg-pso-teal-50 border-l-4 border-pso-teal-600 p-4 rounded">
          <h4 className="font-semibold text-pso-teal-900 mb-2">
            About Particle Swarm Optimization
          </h4>
          <p className="text-sm text-pso-teal-800">
            PSO simulates social behavior where particles adjust their velocities
            based on personal experience (cognitive) and swarm knowledge (social).
            The golden star shows the global best position found so far.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ParticleSwarm;
