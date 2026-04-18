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
  initializeES,
  runESGeneration,
} from '../../utils/esAlgorithm';

const EvolutionStrategies = () => {
  // Parameters
  const [mu, setMu] = useState(5);
  const [lambda, setLambda] = useState(20);
  const [strategy, setStrategy] = useState('comma');
  const [selectedFunction, setSelectedFunction] = useState('rastrigin');
  const [isRunning, setIsRunning] = useState(false);

  // Algorithm state
  const [esState, setEsState] = useState(null);
  const [generation, setGeneration] = useState(0);
  const [bestFitness, setBestFitness] = useState(0);

  // Refs
  const appRef = useRef(null);
  const backgroundRef = useRef(null);
  const populationLayerRef = useRef(null);

  const functionData = FUNCTIONS[selectedFunction];
  const canvasWidth = 800;
  const canvasHeight = 600;

  // Initialize
  const handleInitialize = () => {
    const state = initializeES(mu, functionData.domain);
    setEsState(state);
    setGeneration(0);
    setIsRunning(false);
    setBestFitness(0);

    if (populationLayerRef.current) {
      clearGraphics(populationLayerRef.current);
      drawPopulation(state);
    }
  };

  // Draw population
  const drawPopulation = useCallback((state) => {
    if (!populationLayerRef.current || !state) return;

    const graphics = populationLayerRef.current;
    clearGraphics(graphics);

    // Draw sigma circle around mean
    const { x: meanX, y: meanY } = domainToCanvas(
      state.mean.x,
      state.mean.y,
      functionData.domain,
      canvasWidth,
      canvasHeight
    );

    const sigmaRadius = (state.sigma / (functionData.domain[1] - functionData.domain[0])) * canvasWidth;

    // Draw sampling ellipse
    drawEllipse(graphics, meanX, meanY, sigmaRadius, sigmaRadius, 0, 0xea580c, 0.3);

    // Draw mean
    graphics.star(meanX, meanY, 8, 15, 10);
    graphics.fill({ color: 0xea580c });
    graphics.star(meanX, meanY, 8, 15, 10);
    graphics.stroke({ width: 2, color: 0x000000 });

    // Draw offspring
    if (state.offspring) {
      state.offspring.forEach((ind) => {
        const { x: canvasX, y: canvasY } = domainToCanvas(
          ind.x,
          ind.y,
          functionData.domain,
          canvasWidth,
          canvasHeight
        );

        // Color by fitness (better = brighter)
        const alpha = 0.3 + 0.7 * (1 - Math.min(ind.fitness / 50, 1));
        drawPoint(graphics, canvasX, canvasY, 0xf97316, 5);
      });
    }

    // Draw selected parents
    if (state.individuals && state.individuals.length > 0) {
      state.individuals.forEach((ind) => {
        const { x: canvasX, y: canvasY } = domainToCanvas(
          ind.x,
          ind.y,
          functionData.domain,
          canvasWidth,
          canvasHeight
        );
        drawPoint(graphics, canvasX, canvasY, 0xfbbf24, 8);
      });
    }
  }, [functionData, canvasWidth, canvasHeight]);

  // Run generation
  const handleRunGeneration = useCallback(() => {
    if (!esState) return;

    const newState = runESGeneration(
      esState,
      functionData.fn,
      mu,
      lambda,
      strategy,
      functionData.domain
    );

    setEsState(newState);
    setGeneration((g) => g + 1);

    if (newState.individuals.length > 0) {
      setBestFitness(newState.individuals[0].fitness);
    }

    drawPopulation(newState);
  }, [esState, functionData, mu, lambda, strategy, drawPopulation]);

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

    const state = initializeES(mu, functionData.domain);
    setEsState(state);
    drawPopulation(state);
  }, [functionData, mu, canvasWidth, canvasHeight, drawPopulation]);


  return (
    <div className="flex h-full">
      <div className="w-2/3 p-6 flex flex-col items-center justify-center bg-gray-100">
        <div className="bg-white rounded-lg shadow-lg p-4">
          <Canvas
            key={`es-${selectedFunction}`}
            width={canvasWidth}
            height={canvasHeight}
            onSetup={setupCanvas}
            className="rounded-md"
          />
        </div>
      </div>

      <div className="w-1/3 p-6 overflow-y-auto space-y-4">
        <ControlPanel title="Evolution Strategies" color="orange">
          <Select
            label="Fitness Function"
            value={selectedFunction}
            onChange={setSelectedFunction}
            options={Object.keys(FUNCTIONS).map((key) => ({
              value: key,
              label: FUNCTIONS[key].name,
            }))}
            color="orange"
          />

          <Slider
            label="μ (Parents)"
            value={mu}
            onChange={setMu}
            min={1}
            max={20}
            step={1}
            color="orange"
            tooltip="Number of parents to select"
          />

          <Slider
            label="λ (Offspring)"
            value={lambda}
            onChange={setLambda}
            min={5}
            max={100}
            step={5}
            color="orange"
            tooltip="Number of offspring to generate"
          />

          <Select
            label="Strategy"
            value={strategy}
            onChange={setStrategy}
            options={[
              { value: 'comma', label: '(μ, λ) - Select from offspring only' },
              { value: 'plus', label: '(μ+λ) - Select from parents + offspring' },
            ]}
            color="orange"
          />
        </ControlPanel>

        <ControlPanel title="Controls" color="orange">
          <div className="flex gap-3">
            <button
              onClick={handleRunGeneration}
              disabled={!esState}
              className="flex-1 btn-orange disabled:opacity-50"
            >
              Run Generation
            </button>
          </div>

          <div className="flex gap-3 mt-3">
            <button
              onClick={() => setIsRunning(!isRunning)}
              disabled={!esState}
              className="flex-1 btn-orange disabled:opacity-50"
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

        <ControlPanel title="Metrics" color="orange">
          <div className="grid grid-cols-2 gap-3">
            <MetricCard label="Generation" value={generation} color="orange" />
            <MetricCard label="Best Fitness" value={bestFitness} color="orange" />
            <MetricCard label="σ (Sigma)" value={esState?.sigma || 0} color="orange" />
            <MetricCard label="λ/μ Ratio" value={(lambda / mu).toFixed(2)} color="orange" />
          </div>
        </ControlPanel>

        <div className="bg-es-orange-50 border-l-4 border-es-orange-600 p-4 rounded">
          <h4 className="font-semibold text-es-orange-900 mb-2">
            About Evolution Strategies
          </h4>
          <p className="text-sm text-es-orange-800">
            ES samples offspring from a Gaussian distribution around the parent mean
            and adapts the step size (σ) based on success rate. Watch how the search
            radius changes as the algorithm explores and exploits.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EvolutionStrategies;
