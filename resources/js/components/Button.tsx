import React from "react";
import { Loader2 } from "lucide-react";

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "accent" | "outlined" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg" | "xl";
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  iconOnly?: boolean;
  form?: string;
  icon?: React.ReactNode; // Keep for backward compatibility
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const variantStyles: Record<string, string> = {
  primary: "bg-primary text-white hover:bg-primary/90 focus:ring-primary/20 border-primary",
  secondary: "bg-secondary text-white hover:bg-secondary/90 focus:ring-secondary/20 border-secondary",
  accent: "bg-accent text-white hover:bg-accent/90 focus:ring-accent/20 border-accent",
  outlined: "bg-transparent text-primary border-2 border-primary hover:bg-primary hover:text-white focus:ring-primary/20",
  ghost: "bg-transparent text-primary hover:bg-primary/10 focus:ring-primary/20 border-transparent",
  danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500/20 border-red-500",
  success: "bg-green-500 text-white hover:bg-green-600 focus:ring-green-500/20 border-green-500",
};

const sizeStyles: Record<string, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
  xl: "px-8 py-4 text-xl",
};

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = "button",
  className = "",
  disabled = false,
  variant = "primary",
  size = "md",
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  iconOnly = false,
  form,
  icon, // Backward compatibility
  ...props
}) => {
  const isDisabled = disabled || loading;
  const displayIcon = icon || leftIcon; // Backward compatibility

  return (
    <button
      type={type}
      onClick={onClick}
      className={`
        relative inline-flex items-center justify-center gap-2 
        font-medium rounded-theme-md border-2
        transition-all duration-200 ease-in-out
        focus:outline-none focus:ring-4 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        hover:scale-105 active:scale-95
        ${variantStyles[variant] || variantStyles.primary}
        ${sizeStyles[size] || sizeStyles.md}
        ${fullWidth ? "w-full" : ""}
        ${iconOnly ? "aspect-square p-0" : ""}
        ${className}
      `}
      disabled={isDisabled}
      form={form}
      {...props}
    >
      {loading && (
        <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
      )}
      
      {!loading && displayIcon && (
        <span className="flex-shrink-0">{displayIcon}</span>
      )}
      
      {!iconOnly && children}
      
      {!loading && rightIcon && (
        <span className="flex-shrink-0">{rightIcon}</span>
      )}
    </button>
  );
};

export { Button };
export default Button;
