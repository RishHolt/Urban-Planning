import React from "react";

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "accent" | "red" | "green" | "blue" | "orange";
  form?: string;
  icon?: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const variantStyles: Record<string, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary", 
  accent: "btn-accent",
  red: "bg-red-500 text-white hover:bg-red-600",
  green: "bg-green-500 text-white hover:bg-green-600",
  blue: "bg-blue-500 text-white hover:bg-blue-600",
  orange: "bg-orange-500 text-white hover:bg-orange-600",
};

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = "button",
  className = "",
  disabled = false,
  variant = "primary",
  form,
  icon,
  ...props
}) => (
  <button
    type={type}
    onClick={onClick}
    className={`flex items-center gap-2 text-center py-3 px-4 rounded-theme-md transition-all duration-200 ${variantStyles[variant] || variantStyles.primary} ${className}`}
    disabled={disabled}
    form={form}
    {...props}
  >
    {icon && <span className="flex-shrink-0">{icon}</span>}
    {children}
  </button>
);

export default Button;
