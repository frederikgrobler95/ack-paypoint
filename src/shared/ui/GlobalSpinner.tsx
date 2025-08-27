import React from 'react';
import { useLoading } from '../../contexts/LoadingContext';

const GlobalSpinner: React.FC = () => {
  const { isLoading, loadingMessage } = useLoading();

  if (!isLoading) {
    return null;
  }

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 flex flex-col items-center shadow-xl">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
        <p className="text-gray-700 mb-4">{loadingMessage}</p>
      </div>
    </div>
  );
};

export default GlobalSpinner;