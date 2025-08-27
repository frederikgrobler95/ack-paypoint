import React from 'react';
import Toast from './Toast';
import { useToast } from '../../contexts/ToastContext';

const ToastContainer: React.FC = () => {
  const { toasts } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
        />
      ))}
    </div>
  );
};

export default ToastContainer;