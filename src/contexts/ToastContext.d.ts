import React, { ReactNode } from 'react';
interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
}
interface ToastContextType {
    toasts: Toast[];
    showToast: (message: string, type: Toast['type'], duration?: number) => void;
    hideToast: (id: string) => void;
}
interface ToastProviderProps {
    children: ReactNode;
}
export declare const ToastProvider: React.FC<ToastProviderProps>;
export declare const useToast: () => ToastContextType;
export {};
