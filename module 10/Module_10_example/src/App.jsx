import { useState } from 'react';
import GeneticAlgorithm from './components/ga/GeneticAlgorithm';
import EvolutionStrategies from './components/es/EvolutionStrategies';
import CMAES from './components/cmaes/CMAES';
import ParticleSwarm from './components/pso/ParticleSwarm';

const TABS = [
  { id: 'ga', label: 'Genetic Algorithm', color: 'ga-blue' },
  { id: 'es', label: 'Evolution Strategies', color: 'es-orange' },
  { id: 'cmaes', label: 'CMA-ES', color: 'cma-purple' },
  { id: 'pso', label: 'Particle Swarm Optimization', color: 'pso-teal' },
];

function App() {
  const [activeTab, setActiveTab] = useState('ga');

  const renderContent = () => {
    switch (activeTab) {
      case 'ga':
        return <GeneticAlgorithm />;
      case 'es':
        return <EvolutionStrategies />;
      case 'cmaes':
        return <CMAES />;
      case 'pso':
        return <ParticleSwarm />;
      default:
        return <GeneticAlgorithm />;
    }
  };

  const getTabColorClasses = (tabColor, isActive) => {
    const baseClasses = 'px-6 py-3 font-medium text-sm transition-all duration-200 focus:outline-none';

    const colorMap = {
      'ga-blue': isActive
        ? 'bg-ga-blue-600 text-white border-b-4 border-ga-blue-700'
        : 'text-gray-600 hover:bg-ga-blue-50 hover:text-ga-blue-700',
      'es-orange': isActive
        ? 'bg-es-orange-600 text-white border-b-4 border-es-orange-700'
        : 'text-gray-600 hover:bg-es-orange-50 hover:text-es-orange-700',
      'cma-purple': isActive
        ? 'bg-cma-purple-600 text-white border-b-4 border-cma-purple-700'
        : 'text-gray-600 hover:bg-cma-purple-50 hover:text-cma-purple-700',
      'pso-teal': isActive
        ? 'bg-pso-teal-600 text-white border-b-4 border-pso-teal-700'
        : 'text-gray-600 hover:bg-pso-teal-50 hover:text-pso-teal-700',
    };

    return `${baseClasses} ${colorMap[tabColor]}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-full px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Evolutionary Algorithms Visualizer
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Interactive learning platform for optimization algorithms
          </p>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200">
        <div className="flex space-x-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={getTabColorClasses(tab.color, activeTab === tab.id)}
              aria-label={`Switch to ${tab.label}`}
              title={tab.label}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="h-[calc(100vh-140px)]">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
