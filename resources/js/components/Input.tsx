import React, { forwardRef, useState } from "react";
import { X, Eye, EyeOff } from "lucide-react";

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
  state?: "default" | "error" | "success" | "warning";
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  showCharCount?: boolean;
  clearable?: boolean;
  onClear?: () => void;
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
      state = "default",
      prefix,
      suffix,
      showCharCount = false,
      clearable = false,
      onClear,
      id,
      type = "text",
      value,
      onChange,
      maxLength,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const [showPassword, setShowPassword] = useState(false);
    const [internalValue, setInternalValue] = useState(value || "");

    const isPassword = type === "password";
    const currentValue = value !== undefined ? value : internalValue;
    const hasValue = currentValue && currentValue.toString().length > 0;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        onChange(e);
      } else {
        setInternalValue(e.target.value);
      }
    };

    const handleClear = () => {
      if (onClear) {
        onClear();
      } else if (onChange) {
        const syntheticEvent = {
          target: { value: "" },
          currentTarget: { value: "" }
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
      } else {
        setInternalValue("");
      }
    };

    const sizeClasses = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-3 py-2 text-sm",
      lg: "px-4 py-3 text-base",
    };

    const stateClasses = {
      default: "border-gray-300 focus:border-primary focus:ring-primary/20",
      error: "border-red-500 focus:border-red-500 focus:ring-red-500/20 bg-red-50",
      success: "border-green-500 focus:border-green-500 focus:ring-green-500/20 bg-green-50",
      warning: "border-yellow-500 focus:border-yellow-500 focus:ring-yellow-500/20 bg-yellow-50",
    };

    const variantClasses = {
      outlined: `
        border bg-white
        focus:ring-2 focus:ring-offset-0
        disabled:bg-gray-50 disabled:text-gray-500 disabled:border-gray-200
      `,
      filled: `
        border-0 bg-gray-100 border-b-2
        focus:bg-gray-50 focus:ring-0
        disabled:bg-gray-200 disabled:text-gray-500
      `,
    };

    const baseInputClasses = `
      w-full rounded-lg transition-all duration-200
      ${sizeClasses[size as keyof typeof sizeClasses]}
      ${variantClasses[variant as keyof typeof variantClasses]}
      ${stateClasses[state]}
    `;

    return (
      <div className={`${fullWidth ? "w-full" : ""} ${containerClassName}`}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="block mb-2 font-medium text-gray-700 text-sm"
          >
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}

        {/* Input Container with External Left Icon */}
        <div className="flex items-center gap-3">
          {/* Left Icon - Outside Input */}
          {(leftIcon || prefix) && (
            <div className="flex items-center text-gray-400">
              {leftIcon || prefix}
            </div>
          )}

          {/* Input Container */}
          <div className="flex-1 flex items-center border rounded-lg bg-white focus-within:ring-2 focus-within:ring-offset-0 focus-within:ring-primary/20 focus-within:border-primary">
            {/* Input */}
            <input
              ref={ref}
              id={inputId}
              type={isPassword && showPassword ? "text" : type}
              value={currentValue}
              onChange={handleChange}
              maxLength={maxLength}
              className={`flex-1 border-0 bg-transparent focus:outline-none placeholder:text-gray-400 text-gray-900 ${sizeClasses[size as keyof typeof sizeClasses]} ${className}`}
              {...props}
            />

            {/* Right Icons Container */}
            <div className="flex items-center gap-1">
              {/* Clear Button */}
              {clearable && hasValue && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  <X size={16} />
                </button>
              )}

              {/* Password Toggle */}
              {isPassword && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              )}

              {/* Right Icon or Suffix */}
              {rightIcon && !isPassword && !clearable && (
                <div className="text-gray-400">{rightIcon}</div>
              )}
              
              {suffix && !isPassword && !clearable && (
                <div className="text-gray-400">{suffix}</div>
              )}
            </div>
          </div>
        </div>

        {/* Character Count */}
        {showCharCount && maxLength && (
          <div className="mt-1 text-xs text-gray-500 text-right">
            {currentValue.toString().length} / {maxLength}
          </div>
        )}

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

// Simple Label component
export const Label: React.FC<{ htmlFor?: string; children: React.ReactNode; className?: string }> = ({ htmlFor, children, className = "" }) => {
  return (
    <label htmlFor={htmlFor} className={`block text-sm font-medium text-gray-700 mb-1 ${className}`}>
      {children}
    </label>
  );
};

// Simple Progress component
export const Progress: React.FC<{ value: number; max?: number; className?: string; size?: 'sm' | 'md' | 'lg' }> = ({ 
  value, 
  max = 100, 
  className = '', 
  size = 'md' 
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  return (
    <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizeClasses[size]} ${className}`}>
      <div
        className="h-full bg-blue-600 transition-all duration-300 ease-in-out rounded-full"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

export { Input };
export default Input;