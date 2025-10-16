import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  description?: string;
  duration?: number;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => string;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

interface ToastProviderProps {
  children: React.ReactNode;
  position?: "top-right" | "top-center" | "top-left" | "bottom-right" | "bottom-center" | "bottom-left";
  maxToasts?: number;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  position = "top-right",
  maxToasts = 5,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = {
      id,
      duration: 5000, // Default 5 seconds
      ...toast,
    };

    setToasts(prev => {
      const updated = [newToast, ...prev];
      return updated.slice(0, maxToasts);
    });

    return id;
  }, [maxToasts]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearAll }}>
      {children}
      <ToastContainer toasts={toasts} position={position} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

interface ToastContainerProps {
  toasts: Toast[];
  position: string;
  onRemove: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, position, onRemove }) => {
  const positionClasses = {
    "top-right": "top-4 right-4",
    "top-center": "top-4 left-1/2 transform -translate-x-1/2",
    "top-left": "top-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "bottom-center": "bottom-4 left-1/2 transform -translate-x-1/2",
    "bottom-left": "bottom-4 left-4",
  };

  return (
    <div
      className={`fixed z-50 space-y-2 max-w-sm w-full ${positionClasses[position as keyof typeof positionClasses]}`}
    >
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);

    // Auto remove
    if (toast.duration && toast.duration > 0) {
      const removeTimer = setTimeout(() => {
        handleRemove();
      }, toast.duration);

      // Progress bar animation
      const progressTimer = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev - (100 / (toast.duration! / 100));
          return newProgress <= 0 ? 0 : newProgress;
        });
      }, 100);

      return () => {
        clearTimeout(timer);
        clearTimeout(removeTimer);
        clearInterval(progressTimer);
      };
    }

    return () => clearTimeout(timer);
  }, [toast.duration]);

  const handleRemove = () => {
    setIsVisible(false);
    setTimeout(() => onRemove(toast.id), 300);
  };

  const variantStyles = {
    success: {
      container: "bg-green-50 border-green-200 text-green-800",
      icon: "text-green-400",
      progress: "bg-green-500",
    },
    error: {
      container: "bg-red-50 border-red-200 text-red-800",
      icon: "text-red-400",
      progress: "bg-red-500",
    },
    warning: {
      container: "bg-yellow-50 border-yellow-200 text-yellow-800",
      icon: "text-yellow-400",
      progress: "bg-yellow-500",
    },
    info: {
      container: "bg-blue-50 border-blue-200 text-blue-800",
      icon: "text-blue-400",
      progress: "bg-blue-500",
    },
  };

  const defaultIcons = {
    success: <CheckCircle size={20} />,
    error: <AlertCircle size={20} />,
    warning: <AlertTriangle size={20} />,
    info: <Info size={20} />,
  };

  const styles = variantStyles[toast.type];

  return (
    <div
      className={`
        relative rounded-lg border p-4 shadow-lg transition-all duration-300 transform
        ${styles.container}
        ${isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
      `}
      role="alert"
    >
      {/* Progress Bar */}
      {toast.duration && toast.duration > 0 && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 rounded-t-lg overflow-hidden">
          <div
            className={`h-full transition-all duration-100 ${styles.progress}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="flex">
        {/* Icon */}
        <div className={`flex-shrink-0 ${styles.icon}`}>
          {toast.icon || defaultIcons[toast.type]}
        </div>

        {/* Content */}
        <div className="ml-3 flex-1">
          {toast.title && (
            <h3 className="text-sm font-medium text-gray-900">
              {toast.title}
            </h3>
          )}
          
          {toast.description && (
            <div className="mt-1 text-sm text-gray-700">
              {toast.description}
            </div>
          )}

          {/* Action */}
          {toast.action && (
            <div className="mt-3">
              {toast.action}
            </div>
          )}
        </div>

        {/* Close Button */}
        <div className="ml-auto pl-3">
          <button
            type="button"
            onClick={handleRemove}
            className="inline-flex rounded-md p-1.5 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ToastProvider;
