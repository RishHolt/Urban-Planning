import React, { forwardRef } from "react";

type InputProps = {
  label?: string;
  error?: string;
  helperText?: string;
  className?: string;
  containerClassName?: string;
  required?: boolean;
  fullWidth?: boolean;
  variant?: "outlined" | "filled";
  size?: "sm" | "md" | "lg";
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
} & React.InputHTMLAttributes<HTMLInputElement>;

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      className = "",
      containerClassName = "",
      required = false,
      fullWidth = true,
      variant = "outlined",
      size = "md",
      leftIcon,
      rightIcon,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    const sizeClasses = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-3 py-2 text-sm",
      lg: "px-4 py-3 text-base",
    };

    const variantClasses = {
      outlined: `
        border border-gray-300 bg-white
        focus:border-primary focus:ring-2 focus:ring-primary/20
        disabled:bg-gray-50 disabled:text-gray-500
      `,
      filled: `
        border-0 bg-gray-100 border-b-2 border-gray-300
        focus:bg-gray-50 focus:border-primary
        disabled:bg-gray-200 disabled:text-gray-500
      `,
    };

    const baseInputClasses = `
      w-full rounded-md transition-colors duration-200
      placeholder:text-gray-400 focus:outline-none
      text-gray-900
      ${sizeClasses[size as keyof typeof sizeClasses]}
      ${variantClasses[variant as keyof typeof variantClasses]}
      ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}
      ${leftIcon ? "pl-10" : ""}
      ${rightIcon ? "pr-10" : ""}
      ${className}
    `;

    return (
      <div className={`${fullWidth ? "w-full" : ""} ${containerClassName}`}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="block mb-1 font-medium text-gray-700 text-sm"
          >
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className="left-0 absolute inset-y-0 flex items-center pl-3 pointer-events-none">
              <div className="text-gray-400">{leftIcon}</div>
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            id={inputId}
            className={baseInputClasses}
            {...props}
          />

          {/* Right Icon */}
          {rightIcon && (
            <div className="right-0 absolute inset-y-0 flex items-center pr-3 pointer-events-none">
              <div className="text-gray-400">{rightIcon}</div>
            </div>
          )}
        </div>

        {/* Helper Text or Error */}
        {(error || helperText) && (
          <p
            className={`mt-1 text-xs ${
              error ? "text-red-600" : "text-gray-500"
            }`}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;