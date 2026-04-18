/**
 * Reusable Slider component with label and value display
 */
const Slider = ({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  color = 'blue',
  tooltip = '',
}) => {
  const colorClasses = {
    blue: 'accent-ga-blue-600',
    orange: 'accent-es-orange-600',
    purple: 'accent-cma-purple-600',
    teal: 'accent-pso-teal-600',
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label
          className="text-sm font-medium text-gray-700"
          title={tooltip}
        >
          {label}
        </label>
        <span className="text-sm font-semibold text-gray-900 bg-gray-100 px-2 py-1 rounded">
          {value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`slider ${colorClasses[color]}`}
        aria-label={label}
        title={tooltip}
      />
      <div className="flex justify-between text-xs text-gray-500">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
};

export default Slider;
