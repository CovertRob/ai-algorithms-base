/**
 * Metric Card component for displaying algorithm metrics
 */
const MetricCard = ({ label, value, color = 'blue', tooltip = '' }) => {
  const colorClasses = {
    blue: 'text-ga-blue-700',
    orange: 'text-es-orange-700',
    purple: 'text-cma-purple-700',
    teal: 'text-pso-teal-700',
  };

  const formatValue = (val) => {
    if (typeof val === 'number') {
      return val.toFixed(4);
    }
    return val;
  };

  return (
    <div className="metric-card" title={tooltip}>
      <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
        {label}
      </div>
      <div className={`text-xl font-bold mt-1 ${colorClasses[color]}`}>
        {formatValue(value)}
      </div>
    </div>
  );
};

export default MetricCard;
