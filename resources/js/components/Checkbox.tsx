import React, { forwardRef } from "react";
import { Check } from "lucide-react";

interface CheckboxProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  error?: string;
  indeterminate?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  containerClassName?: string;
  name?: string;
  value?: string;
  required?: boolean;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      checked = false,
      onChange,
      label,
      description,
      disabled = false,
      error,
      indeterminate = false,
      size = "md",
      className = "",
      containerClassName = "",
      name,
      value,
      required = false,
      ...props
    },
    ref
  ) => {
    const checkboxId = `checkbox-${Math.random().toString(36).substr(2, 9)}`;

    const sizeClasses = {
      sm: "w-4 h-4",
      md: "w-5 h-5",
      lg: "w-6 h-6",
    };

    const iconSizes = {
      sm: 12,
      md: 16,
      lg: 20,
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        onChange(e.target.checked);
      }
    };

    return (
      <div className={`${containerClassName}`}>
        <div className="flex items-start">
          {/* Hidden Input */}
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            name={name}
            value={value}
            checked={checked}
            onChange={handleChange}
            disabled={disabled}
            required={required}
            className="sr-only"
            {...props}
          />

          {/* Custom Checkbox */}
          <div className="flex items-center h-5">
            <label
              htmlFor={checkboxId}
              className={`
                relative inline-flex items-center justify-center
                ${sizeClasses[size]}
                rounded border-2 transition-all duration-200 cursor-pointer
                ${disabled ? "cursor-not-allowed opacity-50" : "hover:scale-105"}
                ${error 
                  ? "border-red-500 focus:ring-red-500/20" 
                  : "border-gray-300 focus:ring-primary/20"
                }
                ${checked || indeterminate 
                  ? "bg-primary border-primary text-white" 
                  : "bg-white hover:border-primary"
                }
                ${className}
              `}
            >
              {(checked || indeterminate) && (
                <Check 
                  size={iconSizes[size]} 
                  className={`${indeterminate ? "opacity-0" : ""}`}
                />
              )}
              
              {indeterminate && (
                <div className="absolute w-2 h-0.5 bg-white rounded" />
              )}
            </label>
          </div>

          {/* Label and Description */}
          {(label || description) && (
            <div className="ml-3">
              {label && (
                <label
                  htmlFor={checkboxId}
                  className={`
                    text-sm font-medium cursor-pointer
                    ${error ? "text-red-700" : "text-gray-700"}
                    ${disabled ? "text-gray-400 cursor-not-allowed" : ""}
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
                  ${disabled ? "text-gray-400" : ""}
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

Checkbox.displayName = "Checkbox";

// Checkbox Group Component
interface CheckboxGroupProps {
  children: React.ReactNode;
  label?: string;
  error?: string;
  description?: string;
  className?: string;
  orientation?: "horizontal" | "vertical";
}

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  children,
  label,
  error,
  description,
  className = "",
  orientation = "vertical",
}) => {
  return (
    <fieldset className={className}>
      {label && (
        <legend className="text-sm font-medium text-gray-700 mb-2">
          {label}
        </legend>
      )}
      
      {description && (
        <p className="text-sm text-gray-500 mb-3">
          {description}
        </p>
      )}
      
      <div className={`
        ${orientation === "horizontal" 
          ? "flex flex-wrap gap-4" 
          : "space-y-3"
        }
      `}>
        {children}
      </div>
      
      {error && (
        <p className="mt-2 text-xs text-red-600">
          {error}
        </p>
      )}
    </fieldset>
  );
};

export default Checkbox;
