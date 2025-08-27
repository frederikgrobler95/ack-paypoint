"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.useToast = exports.ToastProvider = void 0;
const react_1 = __importStar(require("react"));
const ToastContext = (0, react_1.createContext)(undefined);
const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = (0, react_1.useState)([]);
    const showToast = (message, type, duration = 3000) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newToast = { id, message, type, duration };
        setToasts(prev => [...prev, newToast]);
        // Auto hide toast after duration
        if (duration > 0) {
            setTimeout(() => {
                hideToast(id);
            }, duration);
        }
    };
    const hideToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };
    const value = {
        toasts,
        showToast,
        hideToast
    };
    return (react_1.default.createElement(ToastContext.Provider, { value: value }, children));
};
exports.ToastProvider = ToastProvider;
const useToast = () => {
    const context = (0, react_1.useContext)(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
exports.useToast = useToast;
