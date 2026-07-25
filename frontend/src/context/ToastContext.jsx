import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const getToastIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
      default: return <Info className="w-5 h-5 text-brand-400 shrink-0" />;
    }
  };

  const getToastBorder = (type) => {
    switch (type) {
      case 'success': return 'border-emerald-500/30 bg-emerald-950/80 text-emerald-200';
      case 'error': return 'border-red-500/30 bg-red-950/80 text-red-200';
      case 'warning': return 'border-amber-500/30 bg-amber-950/80 text-amber-200';
      default: return 'border-brand-500/30 bg-slate-900/90 text-slate-200';
    }
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}

      {/* Floating Toast Notification Container */}
      <div className="fixed top-5 right-5 z-50 flex flex-col space-y-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl backdrop-blur-md border shadow-2xl flex items-start justify-between space-x-3 transition-all duration-300 animate-in slide-in-from-top-4 ${getToastBorder(
              toast.type
            )}`}
          >
            <div className="flex items-start space-x-3 text-xs leading-relaxed font-medium">
              {getToastIcon(toast.type)}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-0.5 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
