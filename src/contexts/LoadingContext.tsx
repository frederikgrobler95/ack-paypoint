import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  loadingMessage: string;
  showLoading: (message?: string) => void;
  hideLoading: () => void;
  cancelLoading: () => void;
  setCancelHandler: (callback: () => void) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading...');
  const [cancelCallback, setCancelCallback] = useState<(() => void) | null>(null);

  const showLoading = (message: string = 'Loading...') => {
    setLoadingMessage(message);
    setIsLoading(true);
  };

  const hideLoading = () => {
    setIsLoading(false);
    setCancelCallback(null);
  };

  const cancelLoading = () => {
    if (cancelCallback) {
      cancelCallback();
    }
    hideLoading();
  };

  const setCancelHandler = (callback: () => void) => {
    setCancelCallback(() => callback);
  };

  const value = {
    isLoading,
    loadingMessage,
    showLoading,
    hideLoading,
    cancelLoading,
    setCancelHandler
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
      {isLoading && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex flex-col items-center shadow-xl">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
            <p className="text-gray-700 mb-4">{loadingMessage}</p>
            <button
              onClick={cancelLoading}
              className="px-4 py-2 bg-red-500 text-neutral-50 rounded hover:bg-red-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  );
};

export const useLoading = (): LoadingContextType => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};