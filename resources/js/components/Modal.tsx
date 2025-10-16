import React, { useEffect } from "react";
import { X } from "lucide-react";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
};

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
}) => {
  // Handle escape key press
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === "Escape") {
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
  }, [isOpen, onClose, closeOnEscape]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="z-50 fixed inset-0 flex justify-center items-center bg-black/50 p-4"
      onClick={handleOverlayClick}
    >
      <div
        className={`
          bg-white rounded-lg shadow-xl w-full ${sizeClasses[size]} 
          transform transition-all duration-200 ease-out
          animate-in zoom-in-95 fade-in-0
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex justify-between items-center p-4 border-gray-200 border-b">
            {title && (
              <h3 className="font-semibold text-primary text-lg">{title}</h3>
            )}
            {showCloseButton && (
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
        <div className="p-4 text-sm">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;