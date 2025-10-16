import React, { forwardRef } from "react";
import { Loader2 } from "lucide-react";

interface SwitchProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  loading?: boolean;
  error?: string;
  size?: "sm" | "md" | "lg";
  color?: "primary" | "secondary" | "accent" | "success" | "warning" | "danger";
  labelPosition?: "left" | "right";
  className?: string;
  containerClassName?: string;
  name?: string;
  value?: string;
  required?: boolean;
}

const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  (
    {
      checked = false,
      onChange,
      label,
      description,
      disabled = false,
      loading = false,
      error,
      size = "md",
      color = "primary",
      labelPosition = "right",
      className = "",
      containerClassName = "",
      name,
      value,
      required = false,
      ...props
    },
    ref
  ) => {
    const switchId = `switch-${Math.random().toString(36).substr(2, 9)}`;
    const isDisabled = disabled || loading;

    const sizeClasses = {
      sm: {
        track: "w-8 h-4",
        thumb: "w-3 h-3",
        translate: "translate-x-4",
      },
      md: {
        track: "w-11 h-6",
        thumb: "w-5 h-5",
        translate: "translate-x-5",
      },
      lg: {
        track: "w-14 h-7",
        thumb: "w-6 h-6",
        translate: "translate-x-7",
      },
    };

    const colorClasses = {
      primary: "bg-primary",
      secondary: "bg-secondary",
      accent: "bg-accent",
      success: "bg-green-500",
      warning: "bg-yellow-500",
      danger: "bg-red-500",
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isDisabled && onChange) {
        onChange(e.target.checked);
      }
    };

    const currentSize = sizeClasses[size];
    const currentColor = colorClasses[color];

    return (
      <div className={`${containerClassName}`}>
        <div className={`
          flex items-center gap-3
          ${labelPosition === "left" ? "flex-row-reverse" : "flex-row"}
        `}>
          {/* Switch */}
          <div className="flex items-center">
            <input
              ref={ref}
              type="checkbox"
              id={switchId}
              name={name}
              value={value}
              checked={checked}
              onChange={handleChange}
              disabled={isDisabled}
              required={required}
              className="sr-only"
              {...props}
            />

            <label
              htmlFor={switchId}
              className={`
                relative inline-flex items-center cursor-pointer transition-all duration-200
                ${isDisabled ? "cursor-not-allowed opacity-50" : "hover:scale-105"}
                ${className}
              `}
            >
              {/* Track */}
              <div className={`
                ${currentSize.track}
                rounded-full transition-colors duration-200
                ${checked 
                  ? `${currentColor} ${error ? "ring-2 ring-red-500/20" : ""}` 
                  : error 
                    ? "bg-red-100 ring-2 ring-red-500/20" 
                    : "bg-gray-200"
                }
              `}>
                {/* Thumb */}
                <div className={`
                  ${currentSize.thumb}
                  bg-white rounded-full shadow-md transition-transform duration-200
                  ${checked ? currentSize.translate : "translate-x-0.5"}
                  ${loading ? "animate-pulse" : ""}
                `}>
                  {/* Loading Spinner */}
                  {loading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 size={size === "sm" ? 8 : size === "md" ? 12 : 16} className="animate-spin text-gray-400" />
                    </div>
                  )}
                </div>
              </div>
            </label>
          </div>

          {/* Label and Description */}
          {(label || description) && (
            <div className="flex-1">
              {label && (
                <label
                  htmlFor={switchId}
                  className={`
                    text-sm font-medium cursor-pointer
                    ${error ? "text-red-700" : "text-gray-700"}
                    ${isDisabled ? "text-gray-400 cursor-not-allowed" : ""}
                  `}
                >
                  {label}
                  {required && <span className="ml-1 text-red-500">*</span>}
                </label>
              )}
              
              {description && (
                <p className={`
                  text-sm mt-1
                  ${error ? "text-red-600" : "text-gray-500"}
                  ${isDisabled ? "text-gray-400" : ""}
                `}>
                  {description}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <p className="mt-1 text-xs text-red-600">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Switch.displayName = "Switch";

export default Switch;
