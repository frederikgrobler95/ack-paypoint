import React from 'react';
import { useToast } from '../../contexts/ToastContext';

interface ToastProps {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onHide: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ id, message, type, onHide }) => {
  const { hideToast } = useToast();
  
  const getTypeColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-amber-500';
      case 'info':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  const getTypeTextColor = () => {
    switch (type) {
      case 'warning':
        return 'text-amber-800';
      default:
        return 'text-white';
    }
  };

  const handleHide = () => {
    hideToast(id);
    onHide(id);
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 min-w-[300px] max-w-md transform transition-all duration-300 ease-in-out ${getTypeColor()} ${getTypeTextColor()} p-4 rounded-lg shadow-lg flex justify-between items-start`}
    >
      <div className="flex-1">
        {message}
      </div>
      <button
        onClick={handleHide}
        className="ml-4 text-white hover:text-gray-200 focus:outline-none"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
};

export default Toast;