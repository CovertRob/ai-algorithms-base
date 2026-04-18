import { useState, useCallback, useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import Canvas from '../shared/Canvas';
import Slider from '../shared/Slider';
import Select from '../shared/Select';
import ControlPanel from '../shared/ControlPanel';
import MetricCard from '../shared/MetricCard';
import { FUNCTIONS } from '../../utils/fitnessFunctions';
import { drawContourMap, domainToCanvas, drawPoint, clearGraphics, drawEllipse } from '../../utils/visualization';
import {
  initializeCMAES,
  runCMAESGeneration,
  getCovarianceEllipse,
} from '../../utils/cmaesAlgorithm';

const CMAES = () => {
  // Parameters
  const [lambda, setLambda] = useState(20);
  const [mu, setMu] = useState(10);
  const [selectedFunction, setSelectedFunction] = useState('rastrigin');
  const [isRunning, setIsRunning] = useState(false);

  // Algorithm state
  const [cmaState, setCmaState] = useState(null);
  const [generation, setGeneration] = useState(0);
  const [bestFitness, setBestFitness] = useState(0);
  const [meanTrail, setMeanTrail] = useState([]);

  // Refs
  const appRef = useRef(null);
  const backgroundRef = useRef(null);
  const populationLayerRef = useRef(null);

  const functionData = FUNCTIONS[selectedFunction];
  const canvasWidth = 800;
  const canvasHeight = 600;

  // Initialize
  const handleInitialize = () => {
    const state = initializeCMAES(lambda, functionData.domain);
    setCmaState(state);
    setGeneration(0);
    setIsRunning(false);
    setBestFitness(0);
    setMeanTrail([]);

    if (populationLayerRef.current) {
      clearGraphics(populationLayerRef.current);
      drawPopulation(state, []);
    }
  };

  // Draw population
  const drawPopulation = useCallback((state, trail = []) => {
    if (!populationLayerRef.current || !state) return;

    const graphics = populationLayerRef.current;
    clearGraphics(graphics);

    // Draw mean trail
    if (trail.length > 1) {
      const trailCanvas = trail.map((pos) =>
        domainToCanvas(pos[0], pos[1], functionData.domain, canvasWidth, canvasHeight)
      );

      graphics.moveTo(trailCanvas[0].x, trailCanvas[0].y);
      for (let i = 1; i < trailCanvas.length; i++) {
        graphics.lineTo(trailCanvas[i].x, trailCanvas[i].y);
      }
      graphics.stroke({ width: 2, color: 0x9333ea, alpha: 0.5 });
    }

    // Get covariance ellipse parameters
    const ellipseParams = getCovarianceEllipse(state.C, state.sigma);

    // Convert to canvas coordinates
    const { x: meanX, y: meanY } = domainToCanvas(
      state.mean[0],
      state.mean[1],
      functionData.domain,
      canvasWidth,
      canvasHeight
    );

    // Scale ellipse to canvas
    const domainRange = functionData.domain[1] - functionData.domain[0];
    const ellipseWidth = (ellipseParams.width / domainRange) * canvasWidth;
    const ellipseHeight = (ellipseParams.height / domainRange) * canvasHeight;

    // Draw covariance ellipse
    const ellipseGraphics = new PIXI.Graphics();
    populationLayerRef.current.addChild(ellipseGraphics);

    // Multiple ellipses at 1σ, 2σ, 3σ
    for (let i = 1; i <= 3; i++) {
      const alpha = 0.4 - i * 0.1;
      ellipseGraphics.ellipse(0, 0, ellipseWidth * i, ellipseHeight * i);
      ellipseGraphics.stroke({ width: 2, color: 0xa855f7, alpha });
    }

    // Transform to position and rotation
    ellipseGraphics.x = meanX;
    ellipseGraphics.y = meanY;
    ellipseGraphics.rotation = ellipseParams.angle;

    // Draw offspring
    if (state.offspring && state.offspring.length > 0) {
      state.offspring.forEach((ind, idx) => {
        const { x: canvasX, y: canvasY } = domainToCanvas(
          ind.x,
          ind.y,
          functionData.domain,
          canvasWidth,
          canvasHeight
        );

        // Color by rank (better = brighter)
        const alpha = idx < mu ? 0.8 : 0.3;
        const color = idx < mu ? 0xfbbf24 : 0xa855f7;
        const radius = idx < mu ? 7 : 5;

        drawPoint(graphics, canvasX, canvasY, color, radius);
      });
    }

    // Draw mean (center point)
    graphics.star(meanX, meanY, 6, 12, 8);
    graphics.fill({ color: 0xa855f7 });
    graphics.star(meanX, meanY, 6, 12, 8);
    graphics.stroke({ width: 2, color: 0x000000 });
  }, [functionData, canvasWidth, canvasHeight, mu]);

  // Run generation
  const handleRunGeneration = useCallback(() => {
    if (!cmaState) return;

    const newState = runCMAESGeneration(
      cmaState,
      functionData.fn,
      lambda,
      mu,
      functionData.domain
    );

    setCmaState(newState);
    setGeneration((g) => g + 1);

    if (newState.offspring.length > 0) {
      setBestFitness(newState.offspring[0].fitness);
    }

    // Update mean trail
    setMeanTrail((trail) => [...trail, newState.mean].slice(-20));

    drawPopulation(newState, [...meanTrail, newState.mean]);
  }, [cmaState, functionData, lambda, mu, meanTrail, drawPopulation]);

  // Continuous run
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      handleRunGeneration();
    }, 500);

    return () => clearInterval(interval);
  }, [isRunning, handleRunGeneration]);

  // Setup canvas
  const setupCanvas = useCallback((app) => {
    appRef.current = app;

    const background = new PIXI.Graphics();
    app.stage.addChild(background);
    backgroundRef.current = background;

    const populationLayer = new PIXI.Graphics();
    app.stage.addChild(populationLayer);
    populationLayerRef.current = populationLayer;

    drawContourMap(background, functionData.fn, functionData.domain, canvasWidth, canvasHeight);

    const state = initializeCMAES(lambda, functionData.domain);
    setCmaState(state);
    drawPopulation(state);
  }, [functionData, lambda, canvasWidth, canvasHeight, drawPopulation]);


  return (
    <div className="flex h-full">
      <div className="w-2/3 p-6 flex flex-col items-center justify-center bg-gray-100">
        <div className="bg-white rounded-lg shadow-lg p-4">
          <Canvas
            key={`cmaes-${selectedFunction}`}
            width={canvasWidth}
            height={canvasHeight}
            onSetup={setupCanvas}
            className="rounded-md"
          />
        </div>
      </div>

      <div className="w-1/3 p-6 overflow-y-auto space-y-4">
        <ControlPanel title="CMA-ES" color="purple">
          <Select
            label="Fitness Function"
            value={selectedFunction}
            onChange={setSelectedFunction}
            options={Object.keys(FUNCTIONS).map((key) => ({
              value: key,
              label: FUNCTIONS[key].name,
            }))}
            color="purple"
          />

          <Slider
            label="λ (Offspring)"
            value={lambda}
            onChange={setLambda}
            min={10}
            max={50}
            step={5}
            color="purple"
            tooltip="Number of offspring to sample"
          />

          <Slider
            label="μ (Parents)"
            value={mu}
            onChange={setMu}
            min={2}
            max={lambda / 2}
            step={1}
            color="purple"
            tooltip="Number of parents for recombination"
          />
        </ControlPanel>

        <ControlPanel title="Controls" color="purple">
          <div className="flex gap-3">
            <button
              onClick={handleRunGeneration}
              disabled={!cmaState}
              className="flex-1 btn-purple disabled:opacity-50"
            >
              Run Generation
            </button>
          </div>

          <div className="flex gap-3 mt-3">
            <button
              onClick={() => setIsRunning(!isRunning)}
              disabled={!cmaState}
              className="flex-1 btn-purple disabled:opacity-50"
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

        <ControlPanel title="Metrics" color="purple">
          <div className="grid grid-cols-2 gap-3">
            <MetricCard label="Generation" value={generation} color="purple" />
            <MetricCard label="Best Fitness" value={bestFitness} color="purple" />
            <MetricCard
              label="σ (Sigma)"
              value={cmaState?.sigma || 0}
              color="purple"
            />
            <MetricCard
              label="λ/μ Ratio"
              value={(lambda / mu).toFixed(2)}
              color="purple"
            />
          </div>
        </ControlPanel>

        <div className="bg-cma-purple-50 border-l-4 border-cma-purple-600 p-4 rounded">
          <h4 className="font-semibold text-cma-purple-900 mb-2">
            About CMA-ES
          </h4>
          <p className="text-sm text-cma-purple-800">
            CMA-ES adapts the covariance matrix (shown as rotating ellipses) to
            learn the landscape's curvature. The ellipse orientation shows the
            principal search directions, and the trail shows how the mean evolves.
            Gold points are selected parents, purple are offspring.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CMAES;
