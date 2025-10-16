import React from "react";

interface SpinnerProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  color?: "primary" | "secondary" | "accent" | "gray" | "white";
  variant?: "circle" | "dots" | "bars" | "pulse";
  label?: string;
  overlay?: boolean;
  className?: string;
}

const Spinner: React.FC<SpinnerProps> = ({
  size = "md",
  color = "primary",
  variant = "circle",
  label,
  overlay = false,
  className = "",
}) => {
  const sizeClasses = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  };

  const colorClasses = {
    primary: "text-primary",
    secondary: "text-secondary",
    accent: "text-accent",
    gray: "text-gray-500",
    white: "text-white",
  };

  const renderSpinner = () => {
    switch (variant) {
      case "circle":
        return (
          <div
            className={`
              ${sizeClasses[size]}
              ${colorClasses[color]}
              ${className}
            `}
          >
            <svg
              className="animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        );

      case "dots":
        return (
          <div className={`flex space-x-1 ${className}`}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`
                  ${size === "xs" ? "w-1 h-1" : 
                    size === "sm" ? "w-1.5 h-1.5" :
                    size === "md" ? "w-2 h-2" :
                    size === "lg" ? "w-3 h-3" : "w-4 h-4"}
                  ${colorClasses[color]}
                  rounded-full animate-pulse
                `}
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: "1s",
                }}
              />
            ))}
          </div>
        );

      case "bars":
        return (
          <div className={`flex space-x-1 ${className}`}>
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`
                  ${size === "xs" ? "w-0.5 h-3" : 
                    size === "sm" ? "w-1 h-4" :
                    size === "md" ? "w-1 h-6" :
                    size === "lg" ? "w-1.5 h-8" : "w-2 h-10"}
                  ${colorClasses[color]}
                  animate-pulse
                `}
                style={{
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: "1s",
                }}
              />
            ))}
          </div>
        );

      case "pulse":
        return (
          <div
            className={`
              ${sizeClasses[size]}
              ${colorClasses[color]}
              rounded-full animate-pulse
              ${className}
            `}
          />
        );

      default:
        return null;
    }
  };

  const content = (
    <div className="flex flex-col items-center justify-center space-y-2">
      {renderSpinner()}
      {label && (
        <p className={`text-sm ${colorClasses[color]} font-medium`}>
          {label}
        </p>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
};

// Loading Button Component
interface LoadingButtonProps {
  loading?: boolean;
  children: React.ReactNode;
  spinnerSize?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading = false,
  children,
  spinnerSize = "sm",
  className = "",
}) => {
  return (
    <div className={`relative ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-md">
          <Spinner size={spinnerSize} variant="circle" />
        </div>
      )}
      <div className={loading ? "opacity-50" : ""}>
        {children}
      </div>
    </div>
  );
};

// Loading Overlay Component
interface LoadingOverlayProps {
  loading?: boolean;
  children: React.ReactNode;
  spinnerSize?: "xs" | "sm" | "md" | "lg" | "xl";
  spinnerColor?: "primary" | "secondary" | "accent" | "gray" | "white";
  className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  loading = false,
  children,
  spinnerSize = "md",
  spinnerColor = "primary",
  className = "",
}) => {
  return (
    <div className={`relative ${className}`}>
      {children}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-md">
          <Spinner size={spinnerSize} color={spinnerColor} variant="circle" />
        </div>
      )}
    </div>
  );
};

export default Spinner;
