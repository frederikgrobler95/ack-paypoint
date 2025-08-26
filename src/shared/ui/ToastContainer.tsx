import React from 'react';
import Toast from './Toast';
import { useToast } from '../../contexts/ToastContext';

const ToastContainer: React.FC = () => {
  const { toasts } = useToast();
  
  const handleToastHide = () => {
    // This function is called when a toast is hidden
    // The actual removal is handled by the ToastContext
  };

  return (
    <div className="fixed top-0 right-0 z-50 p-4 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          onHide={handleToastHide}
        />
      ))}
    </div>
  );
};

export default ToastContainer;