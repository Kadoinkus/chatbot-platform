'use client';
import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, AlertTriangle, Info, X, AlertCircle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

export function Toast({ id, type, title, message, duration = 5000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose(id);
    }, 300);
  }, [id, onClose]);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, handleClose]);

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} className="text-green-600" />;
      case 'error':
        return <AlertCircle size={20} className="text-red-600" />;
      case 'warning':
        return <AlertTriangle size={20} className="text-orange-600" />;
      case 'info':
        return <Info size={20} className="text-blue-600" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-orange-50 border-orange-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div
      className={`
        max-w-sm w-full bg-white dark:bg-surface-elevated border rounded-lg shadow-lg dark:shadow-none p-4 transition-all duration-300
        ${isExiting ? 'transform translate-x-full opacity-0' : 'transform translate-x-0 opacity-100'}
        ${getStyles()}
      `}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 dark:text-text-primary">{title}</h4>
          {message && (
            <p className="mt-1 text-sm text-gray-700 dark:text-text-secondary">{message}</p>
          )}
        </div>

        <button
          onClick={handleClose}
          className="flex-shrink-0 p-1 hover:bg-gray-100 dark:hover:bg-surface-hover rounded transition-colors"
        >
          <X size={16} className="text-gray-400 dark:text-text-tertiary" />
        </button>
      </div>
    </div>
  );
}

// Toast container component
export function ToastContainer({ toasts }: { toasts: Array<Omit<ToastProps, 'onClose'> & { onClose: (id: string) => void }> }) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <Toast key={toast.id} {...toast} />
      ))}
    </div>
  );
}

// Hook for managing toasts
export function useToast() {
  const [toasts, setToasts] = useState<Array<Omit<ToastProps, 'onClose'>>>([]);

  const addToast = (toast: Omit<ToastProps, 'id' | 'onClose'>) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const showSuccess = (title: string, message?: string) => {
    addToast({ type: 'success', title, message });
  };

  const showError = (title: string, message?: string) => {
    addToast({ type: 'error', title, message });
  };

  const showWarning = (title: string, message?: string) => {
    addToast({ type: 'warning', title, message });
  };

  const showInfo = (title: string, message?: string) => {
    addToast({ type: 'info', title, message });
  };

  return {
    toasts: toasts.map(toast => ({ ...toast, onClose: removeToast })),
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeToast
  };
}