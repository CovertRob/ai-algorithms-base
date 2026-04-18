import { useState, useCallback, useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import Canvas from '../shared/Canvas';
import Slider from '../shared/Slider';
import Select from '../shared/Select';
import ControlPanel from '../shared/ControlPanel';
import MetricCard from '../shared/MetricCard';
import { FUNCTIONS } from '../../utils/fitnessFunctions';
import { drawContourMap, domainToCanvas, drawPoint, drawArrow, clearGraphics } from '../../utils/visualization';
import {
  initializePopulation,
  evaluatePopulation,
  runGeneration,
  getBestIndividual,
  calculateDiversity,
  tournamentSelection,
  arithmeticCrossover,
  gaussianMutation,
} from '../../utils/gaAlgorithm';

const GeneticAlgorithm = () => {
  // Parameters
  const [populationSize, setPopulationSize] = useState(50);
  const [crossoverRate, setCrossoverRate] = useState(0.8);
  const [mutationRate, setMutationRate] = useState(0.2);
  const [mutationStrength, setMutationStrength] = useState(0.5);
  const [selectedFunction, setSelectedFunction] = useState('rastrigin');
  const [isRunning, setIsRunning] = useState(false);
  const [animationStep, setAnimationStep] = useState('idle'); // idle, selection, crossover, mutation, complete

  // Algorithm state
  const [population, setPopulation] = useState([]);
  const [generation, setGeneration] = useState(0);
  const [bestFitness, setBestFitness] = useState(0);
  const [diversity, setDiversity] = useState(0);
  const [history, setHistory] = useState([]);

  // Refs for Pixi
  const appRef = useRef(null);
  const backgroundRef = useRef(null);
  const populationLayerRef = useRef(null);
  const animationLayerRef = useRef(null);

  const functionData = FUNCTIONS[selectedFunction];
  const canvasWidth = 800;
  const canvasHeight = 600;

  // Initialize population
  const handleInitialize = () => {
    const newPop = initializePopulation(populationSize, functionData.domain);
    const evaluated = evaluatePopulation(newPop, functionData.fn);
    setPopulation(evaluated);
    setGeneration(0);
    setHistory([]);
    setAnimationStep('idle');
    setIsRunning(false);

    const best = getBestIndividual(evaluated);
    setBestFitness(best.fitness);
    setDiversity(calculateDiversity(evaluated));

    // Draw initial state
    if (populationLayerRef.current) {
      clearGraphics(populationLayerRef.current);
      drawPopulation(evaluated);
    }
  };

  // Draw population on canvas
  const drawPopulation = useCallback((pop) => {
    if (!populationLayerRef.current) return;

    const graphics = populationLayerRef.current;
    clearGraphics(graphics);

    pop.forEach((individual) => {
      const { x: canvasX, y: canvasY } = domainToCanvas(
        individual.x,
        individual.y,
        functionData.domain,
        canvasWidth,
        canvasHeight
      );

      // Color based on fitness (better = darker blue)
      const fitnessFactor = Math.max(0, Math.min(1, individual.fitness / 100));
      const color = 0x3b82f6; // Blue
      drawPoint(graphics, canvasX, canvasY, color, 6);
    });
  }, [functionData, canvasWidth, canvasHeight]);

  // Animate selection step
  const animateSelection = useCallback(() => {
    if (!populationLayerRef.current || !animationLayerRef.current) return;

    setAnimationStep('selection');

    const graphics = animationLayerRef.current;
    clearGraphics(graphics);

    // Select a few parents and highlight them
    const numParents = Math.min(6, Math.floor(population.length / 4));
    const selected = [];

    for (let i = 0; i < numParents; i++) {
      const parent = tournamentSelection(population);
      selected.push(parent);

      const { x: canvasX, y: canvasY } = domainToCanvas(
        parent.x,
        parent.y,
        functionData.domain,
        canvasWidth,
        canvasHeight
      );

      // Draw highlight ring
      graphics.circle(canvasX, canvasY, 12);
      graphics.stroke({ width: 3, color: 0xfbbf24, alpha: 0.8 });
    }

    setTimeout(() => {
      clearGraphics(graphics);
      setAnimationStep('idle');
    }, 2000);
  }, [population, functionData, canvasWidth, canvasHeight]);

  // Animate crossover step
  const animateCrossover = useCallback(() => {
    if (!animationLayerRef.current) return;

    setAnimationStep('crossover');

    const graphics = animationLayerRef.current;
    clearGraphics(graphics);

    // Select two parents and show crossover
    const parent1 = tournamentSelection(population);
    const parent2 = tournamentSelection(population);

    const [offspring1, offspring2] = arithmeticCrossover(parent1, parent2, 1.0);

    const p1Canvas = domainToCanvas(parent1.x, parent1.y, functionData.domain, canvasWidth, canvasHeight);
    const p2Canvas = domainToCanvas(parent2.x, parent2.y, functionData.domain, canvasWidth, canvasHeight);
    const o1Canvas = domainToCanvas(offspring1.x, offspring1.y, functionData.domain, canvasWidth, canvasHeight);
    const o2Canvas = domainToCanvas(offspring2.x, offspring2.y, functionData.domain, canvasWidth, canvasHeight);

    // Draw parents
    drawPoint(graphics, p1Canvas.x, p1Canvas.y, 0x10b981, 8);
    drawPoint(graphics, p2Canvas.x, p2Canvas.y, 0x10b981, 8);

    // Draw lines to offspring
    drawArrow(graphics, p1Canvas.x, p1Canvas.y, o1Canvas.x, o1Canvas.y, 0x6366f1, 2);
    drawArrow(graphics, p2Canvas.x, p2Canvas.y, o2Canvas.x, o2Canvas.y, 0x6366f1, 2);

    // Draw offspring
    drawPoint(graphics, o1Canvas.x, o1Canvas.y, 0x6366f1, 6);
    drawPoint(graphics, o2Canvas.x, o2Canvas.y, 0x6366f1, 6);

    setTimeout(() => {
      clearGraphics(graphics);
      setAnimationStep('idle');
    }, 2000);
  }, [population, functionData, canvasWidth, canvasHeight]);

  // Animate mutation step
  const animateMutation = useCallback(() => {
    if (!animationLayerRef.current) return;

    setAnimationStep('mutation');

    const graphics = animationLayerRef.current;
    clearGraphics(graphics);

    // Select an individual and show mutation
    const individual = population[Math.floor(Math.random() * population.length)];
    const mutated = gaussianMutation(individual, 1.0, mutationStrength, functionData.domain);

    const origCanvas = domainToCanvas(individual.x, individual.y, functionData.domain, canvasWidth, canvasHeight);
    const mutCanvas = domainToCanvas(mutated.x, mutated.y, functionData.domain, canvasWidth, canvasHeight);

    // Draw original
    drawPoint(graphics, origCanvas.x, origCanvas.y, 0xf59e0b, 8);

    // Draw mutation arrow
    drawArrow(graphics, origCanvas.x, origCanvas.y, mutCanvas.x, mutCanvas.y, 0xef4444, 3);

    // Draw mutated
    drawPoint(graphics, mutCanvas.x, mutCanvas.y, 0xef4444, 6);

    setTimeout(() => {
      clearGraphics(graphics);
      setAnimationStep('idle');
    }, 2000);
  }, [population, mutationStrength, functionData, canvasWidth, canvasHeight]);

  // Run full generation
  const handleRunGeneration = useCallback(() => {
    const newPop = runGeneration(population, functionData.fn, {
      crossoverRate,
      mutationRate,
      mutationStrength,
      domain: functionData.domain,
    }, generation + 1);

    const evaluated = evaluatePopulation(newPop, functionData.fn);
    setPopulation(evaluated);
    setGeneration((g) => g + 1);

    const best = getBestIndividual(evaluated);
    setBestFitness(best.fitness);
    setDiversity(calculateDiversity(evaluated));
    setHistory((h) => [...h, { generation: generation + 1, fitness: best.fitness }]);

    drawPopulation(evaluated);
  }, [population, functionData, crossoverRate, mutationRate, mutationStrength, generation, drawPopulation]);

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

    // Background layer
    const background = new PIXI.Graphics();
    app.stage.addChild(background);
    backgroundRef.current = background;

    // Population layer
    const populationLayer = new PIXI.Graphics();
    app.stage.addChild(populationLayer);
    populationLayerRef.current = populationLayer;

    // Animation layer
    const animationLayer = new PIXI.Graphics();
    app.stage.addChild(animationLayer);
    animationLayerRef.current = animationLayer;

    // Draw contour map
    drawContourMap(background, functionData.fn, functionData.domain, canvasWidth, canvasHeight);

    // Initialize population
    const newPop = initializePopulation(populationSize, functionData.domain);
    const evaluated = evaluatePopulation(newPop, functionData.fn);
    setPopulation(evaluated);

    const best = getBestIndividual(evaluated);
    setBestFitness(best.fitness);
    setDiversity(calculateDiversity(evaluated));

    drawPopulation(evaluated);
  }, [functionData, populationSize, canvasWidth, canvasHeight, drawPopulation]);


  return (
    <div className="flex h-full">
      {/* Left: Canvas */}
      <div className="w-2/3 p-6 flex flex-col items-center justify-center bg-gray-100">
        <div className="bg-white rounded-lg shadow-lg p-4">
          <Canvas
            key={`ga-${selectedFunction}`}
            width={canvasWidth}
            height={canvasHeight}
            onSetup={setupCanvas}
            className="rounded-md"
          />
        </div>
      </div>

      {/* Right: Controls */}
      <div className="w-1/3 p-6 overflow-y-auto space-y-4">
        <ControlPanel title="Genetic Algorithm" color="blue">
          <div className="space-y-4">
            <Select
              label="Fitness Function"
              value={selectedFunction}
              onChange={setSelectedFunction}
              options={Object.keys(FUNCTIONS).map((key) => ({
                value: key,
                label: FUNCTIONS[key].name,
              }))}
              color="blue"
              tooltip="Select the optimization landscape"
            />

            <Slider
              label="Population Size"
              value={populationSize}
              onChange={setPopulationSize}
              min={10}
              max={100}
              step={10}
              color="blue"
              tooltip="Number of individuals in the population"
            />

            <Slider
              label="Crossover Rate"
              value={crossoverRate}
              onChange={setCrossoverRate}
              min={0}
              max={1}
              step={0.1}
              color="blue"
              tooltip="Probability of crossover between parents"
            />

            <Slider
              label="Mutation Rate"
              value={mutationRate}
              onChange={setMutationRate}
              min={0}
              max={1}
              step={0.1}
              color="blue"
              tooltip="Probability of mutation per gene"
            />

            <Slider
              label="Mutation Strength"
              value={mutationStrength}
              onChange={setMutationStrength}
              min={0.1}
              max={2}
              step={0.1}
              color="blue"
              tooltip="Magnitude of mutation perturbation"
            />
          </div>
        </ControlPanel>

        {/* Animation Controls */}
        <ControlPanel title="Animation Controls" color="blue">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={animateSelection}
              disabled={animationStep !== 'idle' || population.length === 0}
              className="btn-blue text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Show Selection
            </button>

            <button
              onClick={animateCrossover}
              disabled={animationStep !== 'idle' || population.length === 0}
              className="btn-blue text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Show Crossover
            </button>

            <button
              onClick={animateMutation}
              disabled={animationStep !== 'idle' || population.length === 0}
              className="btn-blue text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Show Mutation
            </button>

            <button
              onClick={handleRunGeneration}
              disabled={animationStep !== 'idle' || population.length === 0}
              className="btn-blue text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Run Generation
            </button>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={() => setIsRunning(!isRunning)}
              disabled={population.length === 0}
              className={`flex-1 btn-blue disabled:opacity-50 disabled:cursor-not-allowed`}
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

        {/* Metrics */}
        <ControlPanel title="Metrics" color="blue">
          <div className="grid grid-cols-2 gap-3">
            <MetricCard
              label="Generation"
              value={generation}
              color="blue"
            />
            <MetricCard
              label="Best Fitness"
              value={bestFitness}
              color="blue"
              tooltip="Lowest fitness value found"
            />
            <MetricCard
              label="Diversity"
              value={diversity}
              color="blue"
              tooltip="Average pairwise distance between individuals"
            />
            <MetricCard
              label="Population"
              value={population.length}
              color="blue"
            />
          </div>
        </ControlPanel>

        {/* Description */}
        <div className="bg-ga-blue-50 border-l-4 border-ga-blue-600 p-4 rounded">
          <h4 className="font-semibold text-ga-blue-900 mb-2">
            About Genetic Algorithms
          </h4>
          <p className="text-sm text-ga-blue-800">
            GA uses selection, crossover, and mutation to evolve a population
            toward optimal solutions. Watch how diversity changes and fitness
            improves over generations.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GeneticAlgorithm;
