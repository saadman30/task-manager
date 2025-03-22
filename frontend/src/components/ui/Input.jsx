import React, { forwardRef } from 'react';
import { AlertCircle, X } from 'lucide-react';

const Input = forwardRef(({
  label,
  error,
  helperText,
  className = '',
  as: Component = 'input',
  onClear,
  ...props
}, ref) => {
  const showClearButton = Component === 'input' && 
    props.value && 
    !props.disabled && 
    onClear;

  const baseInputClasses = "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm";
  const errorInputClasses = "border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500";
  const normalInputClasses = "border-gray-300 placeholder-gray-400";

  const inputClasses = `${baseInputClasses} ${error ? errorInputClasses : normalInputClasses} ${className} ${showClearButton ? 'pr-10' : ''}`;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <Component
          ref={ref}
          className={inputClasses}
          aria-invalid={error ? 'true' : 'false'}
          {...props}
        />
        {showClearButton && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 
              text-gray-400 hover:text-gray-600 
              rounded-full hover:bg-gray-100
              transition-colors duration-200"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        {error && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <AlertCircle className="h-5 w-5 text-red-500" />
          </div>
        )}
      </div>
      {(error || helperText) && (
        <p className={`mt-1 text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input; 