import React, { useEffect, useRef } from "react";
import { X, AlertTriangle, CheckCircle, AlertCircle, Info } from "lucide-react";
import { Button } from "./index";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  variant?: "default" | "alert" | "confirm" | "info" | "success" | "warning" | "error";
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  closable?: boolean;
  className?: string;
  overlayClassName?: string;
  footer?: React.ReactNode;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: "primary" | "secondary" | "accent" | "outlined" | "ghost" | "danger" | "success";
    loading?: boolean;
    disabled?: boolean;
  }>;
  loading?: boolean;
  icon?: React.ReactNode;
};

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  variant = "default",
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  closable = true,
  className = "",
  overlayClassName = "",
  footer,
  actions,
  loading = false,
  icon,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle escape key press
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === "Escape" && closable) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose, closeOnEscape, closable]);

  // Focus management
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: "max-w-full mx-4",
  };

  const variantConfig = {
    default: {
      icon: null,
      iconColor: "",
      titleColor: "text-gray-900",
    },
    alert: {
      icon: AlertTriangle,
      iconColor: "text-yellow-500",
      titleColor: "text-yellow-800",
    },
    confirm: {
      icon: AlertCircle,
      iconColor: "text-blue-500",
      titleColor: "text-blue-800",
    },
    info: {
      icon: Info,
      iconColor: "text-blue-500",
      titleColor: "text-blue-800",
    },
    success: {
      icon: CheckCircle,
      iconColor: "text-green-500",
      titleColor: "text-green-800",
    },
    warning: {
      icon: AlertTriangle,
      iconColor: "text-yellow-500",
      titleColor: "text-yellow-800",
    },
    error: {
      icon: AlertCircle,
      iconColor: "text-red-500",
      titleColor: "text-red-800",
    },
  };

  const config = variantConfig[variant];
  const IconComponent = icon ? null : config.icon;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && closable && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className={`z-50 fixed inset-0 flex justify-center items-center bg-black/50 p-4 ${overlayClassName}`}
      onClick={handleOverlayClick}
    >
      <div
        ref={modalRef}
        className={`
          bg-white rounded-lg shadow-xl w-full ${sizeClasses[size]} 
          transform transition-all duration-200 ease-out
          animate-in zoom-in-95 fade-in-0
          ${className}
        `}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              {IconComponent && (
                <div className={`flex-shrink-0 ${config.iconColor}`}>
                  <IconComponent size={24} />
                </div>
              )}
              {icon && (
                <div className="flex-shrink-0 text-gray-500">
                  {icon}
                </div>
              )}
              {title && (
                <h3 id="modal-title" className={`text-lg font-semibold ${config.titleColor}`}>
                  {title}
                </h3>
              )}
            </div>
            {showCloseButton && closable && (
              <button
                onClick={onClose}
                className="hover:bg-gray-100 p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2"></div>
              Loading...
            </div>
          ) : (
            children
          )}
        </div>

        {/* Footer */}
        {(footer || actions) && (
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
            {footer || (
              <div className="flex items-center gap-3">
                {actions?.map((action, index) => (
                  <Button
                    key={index}
                    variant={action.variant || "outlined"}
                    onClick={action.onClick}
                    loading={action.loading}
                    disabled={action.disabled}
                  >
                    {action.label}
                  </Button>
                ))}
                {closable && (
                  <Button variant="outlined" onClick={onClose}>
                    Cancel
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;