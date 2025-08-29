import React, { InputHTMLAttributes, useState } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
  label?: string;
  helperText?: string;
}

const Input: React.FC<InputProps> = ({
  hasError = false,
  label,
  helperText,
  className = '',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  
  // Base input classes based on design system with native-like styling
  let baseClasses = 'font-normal rounded-lg transition-all duration-200 focus:outline-none input-native ';
  
  // Default styling
  baseClasses += 'bg-gray-50 text-gray-900 border border-gray-200 ';
  baseClasses += 'px-4 py-3 text-base leading-6 font-inter w-full body-default ';
  
  // Focus state with enhanced styling
  if (isFocused) {
    baseClasses += 'ring-2 ring-blue-500 border-transparent ';
  } else {
    baseClasses += 'hover:border-gray-300 ';
  }
  
  // Disabled state
  if (props.disabled) {
    baseClasses += 'bg-gray-100 text-gray-500 border-gray-200 opacity-70 ';
  }
  
  // Error state
  if (hasError) {
    baseClasses += 'border-red-500 ring-2 ring-red-500 ring-opacity-25 ';
  }
  
  // Combine base classes with any custom classes
  const combinedClasses = `${baseClasses} ${className}`;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        className={combinedClasses}
        onFocus={(e) => {
          setIsFocused(true);
          if (props.onFocus) props.onFocus(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          if (props.onBlur) props.onBlur(e);
        }}
        aria-invalid={hasError}
        {...props}
      />
      {helperText && (
        <p className={`mt-1 text-sm ${hasError ? 'text-red-600' : 'text-gray-500'}`}>
          {helperText}
        </p>
      )}
    </div>
  );
};

export default Input;