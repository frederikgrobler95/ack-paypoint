import React, { useEffect } from 'react';
import { useToast } from '../../contexts/ToastContext';

interface ToastProps {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ id, message, type, duration = 3000 }) => {
  const { hideToast } = useToast();

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        hideToast(id);
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [id, duration, hideToast]);

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-[#28A745] text-neutral-50'; // Accent Green from DESIGN_SYSTEM.md
      case 'error':
        return 'bg-[#DC3545] text-neutral-50'; // Error Red from DESIGN_SYSTEM.md
      case 'warning':
        return 'bg-[#FFC107] text-gray-800'; // Warning Orange from DESIGN_SYSTEM.md
      case 'info':
        return 'bg-[#007BFF] text-neutral-50'; // Primary Blue from DESIGN_SYSTEM.md
      default:
        return 'bg-gray-500 text-neutral-50';
    }
  };

  const getTypeBorder = () => {
    switch (type) {
      case 'warning':
        return 'border border-[#FFC107]'; // Warning Orange border
      default:
        return '';
    }
  };

  const handleHide = () => {
    hideToast(id);
  };

  return (
    <div
      className={`min-w-[300px] max-w-md transform transition-all duration-300 ease-in-out ${getTypeStyles()} ${getTypeBorder()} p-4 rounded-lg shadow-lg flex justify-between items-start`}
    >
      <div className="flex-1">
        {message}
      </div>
      <button
        onClick={handleHide}
        className="ml-4 text-neutral-50 hover:text-gray-200 focus:outline-none"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
};

export default Toast;