import React from "react";
import { X } from "lucide-react";

interface TagProps {
  children: React.ReactNode;
  variant?: "solid" | "outlined" | "subtle";
  color?: "default" | "primary" | "secondary" | "accent" | "success" | "warning" | "danger" | "info";
  size?: "sm" | "md" | "lg";
  shape?: "rounded" | "pill" | "square";
  removable?: boolean;
  onRemove?: () => void;
  icon?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}

const Tag: React.FC<TagProps> = ({
  children,
  variant = "solid",
  color = "default",
  size = "md",
  shape = "rounded",
  removable = false,
  onRemove,
  icon,
  className = "",
  disabled = false,
  clickable = false,
  onClick,
}) => {
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
    lg: "px-3 py-1.5 text-base",
  };

  const shapeClasses = {
    rounded: "rounded",
    pill: "rounded-full",
    square: "rounded-none",
  };

  const colorVariants = {
    solid: {
      default: "bg-gray-100 text-gray-800 border-gray-200",
      primary: "bg-primary text-white border-primary",
      secondary: "bg-secondary text-white border-secondary",
      accent: "bg-accent text-white border-accent",
      success: "bg-green-500 text-white border-green-500",
      warning: "bg-yellow-500 text-white border-yellow-500",
      danger: "bg-red-500 text-white border-red-500",
      info: "bg-blue-500 text-white border-blue-500",
    },
    outlined: {
      default: "bg-transparent text-gray-700 border-gray-300",
      primary: "bg-transparent text-primary border-primary",
      secondary: "bg-transparent text-secondary border-secondary",
      accent: "bg-transparent text-accent border-accent",
      success: "bg-transparent text-green-700 border-green-500",
      warning: "bg-transparent text-yellow-700 border-yellow-500",
      danger: "bg-transparent text-red-700 border-red-500",
      info: "bg-transparent text-blue-700 border-blue-500",
    },
    subtle: {
      default: "bg-gray-50 text-gray-700 border-gray-200",
      primary: "bg-primary/10 text-primary border-primary/20",
      secondary: "bg-secondary/10 text-secondary border-secondary/20",
      accent: "bg-accent/10 text-accent border-accent/20",
      success: "bg-green-50 text-green-700 border-green-200",
      warning: "bg-yellow-50 text-yellow-700 border-yellow-200",
      danger: "bg-red-50 text-red-700 border-red-200",
      info: "bg-blue-50 text-blue-700 border-blue-200",
    },
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove && !disabled) {
      onRemove();
    }
  };

  const handleClick = () => {
    if (onClick && !disabled) {
      onClick();
    }
  };

  const baseClasses = `
    inline-flex items-center gap-1 border font-medium
    transition-all duration-200
    ${disabled ? "opacity-50 cursor-not-allowed" : ""}
    ${clickable && !disabled ? "cursor-pointer hover:scale-105" : ""}
  `;

  const colorClasses = colorVariants[variant][color];

  return (
    <span
      className={`
        ${baseClasses}
        ${sizeClasses[size]}
        ${shapeClasses[shape]}
        ${colorClasses}
        ${className}
      `}
      onClick={handleClick}
    >
      {icon && (
        <span className="flex-shrink-0">
          {icon}
        </span>
      )}
      
      <span className="truncate">
        {children}
      </span>
      
      {removable && !disabled && (
        <button
          type="button"
          onClick={handleRemove}
          className="ml-1 flex-shrink-0 hover:opacity-75 transition-opacity"
          aria-label="Remove tag"
        >
          <X size={size === "sm" ? 12 : size === "md" ? 14 : 16} />
        </button>
      )}
    </span>
  );
};

// Tag Group Component
interface TagGroupProps {
  children: React.ReactNode;
  maxTags?: number;
  showMore?: boolean;
  onShowMore?: () => void;
  className?: string;
  spacing?: "tight" | "normal" | "loose";
}

export const TagGroup: React.FC<TagGroupProps> = ({
  children,
  maxTags,
  showMore = true,
  onShowMore,
  className = "",
  spacing = "normal",
}) => {
  const childrenArray = React.Children.toArray(children);
  const visibleChildren = maxTags ? childrenArray.slice(0, maxTags) : childrenArray;
  const remainingCount = maxTags ? childrenArray.length - maxTags : 0;

  const spacingClasses = {
    tight: "gap-1",
    normal: "gap-2",
    loose: "gap-3",
  };

  return (
    <div className={`flex flex-wrap items-center ${spacingClasses[spacing]} ${className}`}>
      {visibleChildren}
      
      {remainingCount > 0 && showMore && (
        <button
          onClick={onShowMore}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          +{remainingCount} more
        </button>
      )}
    </div>
  );
};

// Filter Tag Component
interface FilterTagProps {
  label: string;
  value: string;
  onRemove: (value: string) => void;
  count?: number;
  variant?: "solid" | "outlined" | "subtle";
  color?: "default" | "primary" | "secondary" | "accent" | "success" | "warning" | "danger" | "info";
  size?: "sm" | "md" | "lg";
}

export const FilterTag: React.FC<FilterTagProps> = ({
  label,
  value,
  onRemove,
  count,
  variant = "outlined",
  color = "primary",
  size = "md",
}) => {
  return (
    <Tag
      variant={variant}
      color={color}
      size={size}
      removable
      onRemove={() => onRemove(value)}
    >
      {label}
      {count && count > 1 && (
        <span className="ml-1 opacity-75">
          ({count})
        </span>
      )}
    </Tag>
  );
};

// Status Tag Component
interface StatusTagProps {
  status: "active" | "inactive" | "pending" | "approved" | "rejected" | "draft" | "published";
  size?: "sm" | "md" | "lg";
  showDot?: boolean;
}

export const StatusTag: React.FC<StatusTagProps> = ({
  status,
  size = "md",
  showDot = true,
}) => {
  const statusConfig = {
    active: { color: "success" as const, label: "Active" },
    inactive: { color: "default" as const, label: "Inactive" },
    pending: { color: "warning" as const, label: "Pending" },
    approved: { color: "success" as const, label: "Approved" },
    rejected: { color: "danger" as const, label: "Rejected" },
    draft: { color: "default" as const, label: "Draft" },
    published: { color: "success" as const, label: "Published" },
  };

  const config = statusConfig[status];

  return (
    <Tag
      variant="subtle"
      color={config.color}
      size={size}
      icon={showDot ? (
        <div className={`w-2 h-2 rounded-full ${
          config.color === "success" ? "bg-green-500" :
          config.color === "warning" ? "bg-yellow-500" :
          config.color === "danger" ? "bg-red-500" :
          "bg-gray-400"
        }`} />
      ) : undefined}
    >
      {config.label}
    </Tag>
  );
};

export default Tag;
