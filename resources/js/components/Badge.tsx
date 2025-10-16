import React from "react";
import { X } from "lucide-react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "primary" | "secondary" | "accent" | "success" | "warning" | "danger" | "info";
  size?: "sm" | "md" | "lg";
  shape?: "rounded" | "pill" | "square";
  removable?: boolean;
  onRemove?: () => void;
  className?: string;
  dot?: boolean;
  maxWidth?: string;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  size = "md",
  shape = "rounded",
  removable = false,
  onRemove,
  className = "",
  dot = false,
  maxWidth,
}) => {
  const variantStyles = {
    default: "bg-gray-100 text-gray-800 border-gray-200",
    primary: "bg-primary/10 text-primary border-primary/20",
    secondary: "bg-secondary/10 text-secondary border-secondary/20",
    accent: "bg-accent/10 text-accent border-accent/20",
    success: "bg-green-100 text-green-800 border-green-200",
    warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
    danger: "bg-red-100 text-red-800 border-red-200",
    info: "bg-blue-100 text-blue-800 border-blue-200",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
    lg: "px-3 py-1.5 text-base",
  };

  const shapeStyles = {
    rounded: "rounded",
    pill: "rounded-full",
    square: "rounded-none",
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove();
    }
  };

  if (dot) {
    return (
      <div
        className={`
          inline-flex items-center justify-center
          w-2 h-2 rounded-full
          ${variantStyles[variant].split(' ')[0]}
          ${className}
        `}
        style={{ maxWidth }}
      />
    );
  }

  return (
    <span
      className={`
        inline-flex items-center gap-1 border font-medium
        transition-all duration-200 hover:scale-105
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${shapeStyles[shape]}
        ${className}
      `}
      style={{ maxWidth }}
    >
      {children}
      
      {removable && (
        <button
          type="button"
          onClick={handleRemove}
          className="ml-1 hover:opacity-75 transition-opacity"
          aria-label="Remove"
        >
          <X size={size === "sm" ? 12 : size === "md" ? 14 : 16} />
        </button>
      )}
    </span>
  );
};

// Badge Group Component for positioning badges on elements
interface BadgeGroupProps {
  children: React.ReactNode;
  className?: string;
}

export const BadgeGroup: React.FC<BadgeGroupProps> = ({
  children,
  className = "",
}) => {
  return (
    <div className={`relative inline-block ${className}`}>
      {children}
    </div>
  );
};

// Positioned Badge Component
interface PositionedBadgeProps extends BadgeProps {
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  offset?: string;
}

export const PositionedBadge: React.FC<PositionedBadgeProps> = ({
  position = "top-right",
  offset = "0",
  ...badgeProps
}) => {
  const positionStyles = {
    "top-right": `top-0 right-0 transform translate-x-1/2 -translate-y-1/2`,
    "top-left": `top-0 left-0 transform -translate-x-1/2 -translate-y-1/2`,
    "bottom-right": `bottom-0 right-0 transform translate-x-1/2 translate-y-1/2`,
    "bottom-left": `bottom-0 left-0 transform -translate-x-1/2 translate-y-1/2`,
  };

  return (
    <div
      className={`
        absolute z-10
        ${positionStyles[position]}
      `}
      style={{ margin: offset }}
    >
      <Badge {...badgeProps} />
    </div>
  );
};

export default Badge;
