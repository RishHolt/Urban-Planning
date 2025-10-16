import React, { useState } from "react";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info, Loader2 } from "lucide-react";

type AlertProps = {
  children: React.ReactNode;
  variant?: "success" | "error" | "warning" | "info";
  title?: string;
  description?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  autoDismiss?: number; // milliseconds
};

const Alert: React.FC<AlertProps> = ({
  children,
  variant = "info",
  title,
  description,
  dismissible = false,
  onDismiss,
  icon,
  action,
  className = "",
  autoDismiss,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) {
      onDismiss();
    }
  };

  // Auto dismiss effect
  React.useEffect(() => {
    if (autoDismiss && autoDismiss > 0) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, autoDismiss);

      return () => clearTimeout(timer);
    }
  }, [autoDismiss]);

  const variantStyles = {
    success: {
      container: "bg-green-50 border-green-200 text-green-800",
      icon: "text-green-400",
      title: "text-green-800",
      description: "text-green-700",
    },
    error: {
      container: "bg-red-50 border-red-200 text-red-800",
      icon: "text-red-400",
      title: "text-red-800",
      description: "text-red-700",
    },
    warning: {
      container: "bg-yellow-50 border-yellow-200 text-yellow-800",
      icon: "text-yellow-400",
      title: "text-yellow-800",
      description: "text-yellow-700",
    },
    info: {
      container: "bg-blue-50 border-blue-200 text-blue-800",
      icon: "text-blue-400",
      title: "text-blue-800",
      description: "text-blue-700",
    },
  };

  const defaultIcons = {
    success: <CheckCircle size={20} />,
    error: <AlertCircle size={20} />,
    warning: <AlertTriangle size={20} />,
    info: <Info size={20} />,
  };

  const styles = variantStyles[variant];

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`
        relative rounded-lg border p-4 transition-all duration-200
        ${styles.container}
        ${className}
      `}
      role="alert"
    >
      <div className="flex">
        {/* Icon */}
        <div className={`flex-shrink-0 ${styles.icon}`}>
          {icon || defaultIcons[variant]}
        </div>

        {/* Content */}
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`text-sm font-medium ${styles.title}`}>
              {title}
            </h3>
          )}
          
          {description && (
            <div className={`mt-1 text-sm ${styles.description}`}>
              {description}
            </div>
          )}
          
          {children && (
            <div className={`mt-1 text-sm ${styles.description}`}>
              {children}
            </div>
          )}

          {/* Action */}
          {action && (
            <div className="mt-3">
              {action}
            </div>
          )}
        </div>

        {/* Dismiss Button */}
        {dismissible && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={handleDismiss}
                className={`
                  inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2
                  ${styles.icon} hover:opacity-75 transition-opacity
                `}
                aria-label="Dismiss"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;
