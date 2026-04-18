/**
 * Control Panel wrapper component for consistent styling
 */
const ControlPanel = ({ title, children, color = 'blue' }) => {
  const colorClasses = {
    blue: 'border-l-4 border-ga-blue-600',
    orange: 'border-l-4 border-es-orange-600',
    purple: 'border-l-4 border-cma-purple-600',
    teal: 'border-l-4 border-pso-teal-600',
  };

  return (
    <div className={`control-panel ${colorClasses[color]}`}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      )}
      <div className="space-y-6">{children}</div>
    </div>
  );
};

export default ControlPanel;
