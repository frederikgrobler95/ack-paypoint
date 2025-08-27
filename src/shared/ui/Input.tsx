import React, { InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

const Input: React.FC<InputProps> = ({
  hasError = false,
  className = '',
  ...props
}) => {
  // Base input classes based on design system
  let baseClasses = 'font-normal rounded transition-all duration-200 focus:outline-none ';
  
  // Default styling
  baseClasses += 'bg-white text-gray-900 border border-gray-300 ';
  baseClasses += 'px-3 py-2 text-base leading-6 font-inter ';
  
  // Hover state
  baseClasses += 'hover:border-gray-500 ';
  
  // Focus state
  baseClasses += 'focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:ring-opacity-25 ';
  
  // Disabled state
  if (props.disabled) {
    baseClasses += 'bg-gray-100 text-gray-500 border-gray-300 ';
  }
  
  // Error state
  if (hasError) {
    baseClasses += 'border-red-600 focus:ring-red-600 focus:ring-opacity-25 ';
  }
  
  // Combine base classes with any custom classes
  const combinedClasses = `${baseClasses} ${className}`;

  return (
    <input
      className={combinedClasses}
      {...props}
    />
  );
};

export default Input;