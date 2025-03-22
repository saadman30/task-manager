import React, { forwardRef } from 'react';
import { AlertCircle, ChevronDown } from 'lucide-react';

const Select = forwardRef(({
  label,
  options = [],
  error,
  className = '',
  ...props
}, ref) => {
  const baseSelectClasses = "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm appearance-none";
  const errorSelectClasses = "border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500";
  const normalSelectClasses = "border-gray-300 text-gray-900";

  const selectClasses = `${baseSelectClasses} ${error ? errorSelectClasses : normalSelectClasses} ${className}`;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          className={selectClasses}
          aria-invalid={error ? 'true' : 'false'}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          {error ? (
            <AlertCircle className="h-5 w-5 text-red-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </div>
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select; 