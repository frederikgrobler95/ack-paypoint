import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  className = '',
  ...props
}) => {
  // Base button classes
  let baseClasses = 'font-semibold rounded transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ';

  // Variant classes based on design system
  switch (variant) {
    case 'primary':
      baseClasses += 'bg-blue-600 text-white shadow-md hover:bg-blue-800 focus:ring-blue-500 focus:ring-offset-blue-100 active:bg-blue-900 active:shadow-inner disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none ';
      break;
    case 'secondary':
      baseClasses += 'bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-500 focus:ring-offset-gray-100 active:bg-gray-400 active:shadow-inner disabled:bg-gray-100 disabled:text-gray-500 ';
      break;
    case 'danger':
      baseClasses += 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 focus:ring-offset-red-100 active:bg-red-800 active:shadow-inner disabled:bg-gray-300 disabled:text-gray-500 ';
      break;
    default:
      baseClasses += 'bg-blue-600 text-white shadow-md hover:bg-blue-800 focus:ring-blue-500 focus:ring-offset-blue-100 active:bg-blue-900 active:shadow-inner disabled:bg-gray-300 disabled:text-gray-500 ';
  }

  // Size classes based on design system
  switch (size) {
    case 'small':
      baseClasses += 'px-3 py-1.5 text-sm ';
      break;
    case 'medium':
      baseClasses += 'px-4 py-2 text-base ';
      break;
    case 'large':
      baseClasses += 'px-6 py-3 text-lg ';
      break;
    default:
      baseClasses += 'px-4 py-2 text-base ';
  }

  // Combine base classes with any custom classes
  const combinedClasses = `${baseClasses} ${className}`;

  return (
    <button
      className={combinedClasses}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;