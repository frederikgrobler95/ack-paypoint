import React, { InputHTMLAttributes } from 'react';
import Input, { InputProps } from './Input';

interface FormGroupProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const FormGroup: React.FC<FormGroupProps> = ({
  label,
  error,
  id,
  className = '',
  ...props
}) => {
  // Generate a unique ID for the input if not provided
  const inputId = id || `form-field-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`mb-4 ${className}`}>
      <label 
        htmlFor={inputId} 
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
      </label>
      <Input
        id={inputId}
        hasError={!!error}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormGroup;