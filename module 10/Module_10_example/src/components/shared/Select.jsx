/**
 * Reusable Select dropdown component
 */
const Select = ({ label, value, onChange, options, color = 'blue', tooltip = '' }) => {
  const colorClasses = {
    blue: 'focus:ring-ga-blue-500 focus:border-ga-blue-500',
    orange: 'focus:ring-es-orange-500 focus:border-es-orange-500',
    purple: 'focus:ring-cma-purple-500 focus:border-cma-purple-500',
    teal: 'focus:ring-pso-teal-500 focus:border-pso-teal-500',
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700" title={tooltip}>
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm
          ${colorClasses[color]} focus:outline-none focus:ring-2 text-sm`}
        aria-label={label}
        title={tooltip}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;
