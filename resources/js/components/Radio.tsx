import React, { forwardRef, createContext, useContext } from "react";
import { Circle } from "lucide-react";

interface RadioContextType {
  name: string;
  value: string | number;
  onChange: (value: string | number) => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
}

const RadioContext = createContext<RadioContextType | undefined>(undefined);

interface RadioProps {
  value: string | number;
  label?: string;
  description?: string;
  disabled?: boolean;
  error?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  containerClassName?: string;
}

const Radio = forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      value,
      label,
      description,
      disabled = false,
      error,
      size = "md",
      className = "",
      containerClassName = "",
      ...props
    },
    ref
  ) => {
    const context = useContext(RadioContext);
    
    if (!context) {
      throw new Error("Radio must be used within a RadioGroup");
    }

    const { name, value: selectedValue, onChange, disabled: groupDisabled, size: groupSize } = context;
    const isChecked = selectedValue === value;
    const isDisabled = disabled || groupDisabled;
    const radioSize = size || groupSize;

    const radioId = `radio-${name}-${value}`;

    const sizeClasses = {
      sm: "w-4 h-4",
      md: "w-5 h-5",
      lg: "w-6 h-6",
    };

    const iconSizes = {
      sm: 8,
      md: 10,
      lg: 12,
    };

    const handleChange = () => {
      if (!isDisabled) {
        onChange(value);
      }
    };

    return (
      <div className={`${containerClassName}`}>
        <div className="flex items-start">
          {/* Hidden Input */}
          <input
            ref={ref}
            type="radio"
            id={radioId}
            name={name}
            value={value}
            checked={isChecked}
            onChange={handleChange}
            disabled={isDisabled}
            className="sr-only"
            {...props}
          />

          {/* Custom Radio Button */}
          <div className="flex items-center h-5">
            <label
              htmlFor={radioId}
              className={`
                relative inline-flex items-center justify-center
                ${sizeClasses[radioSize]}
                rounded-full border-2 transition-all duration-200 cursor-pointer
                ${isDisabled ? "cursor-not-allowed opacity-50" : "hover:scale-105"}
                ${error 
                  ? "border-red-500 focus:ring-red-500/20" 
                  : "border-gray-300 focus:ring-primary/20"
                }
                ${isChecked 
                  ? "bg-primary border-primary text-white" 
                  : "bg-white hover:border-primary"
                }
                ${className}
              `}
            >
              {isChecked && (
                <Circle 
                  size={iconSizes[radioSize]} 
                  className="fill-current"
                />
              )}
            </label>
          </div>

          {/* Label and Description */}
          {(label || description) && (
            <div className="ml-3">
              {label && (
                <label
                  htmlFor={radioId}
                  className={`
                    text-sm font-medium cursor-pointer
                    ${error ? "text-red-700" : "text-gray-700"}
                    ${isDisabled ? "text-gray-400 cursor-not-allowed" : ""}
                  `}
                >
                  {label}
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

Radio.displayName = "Radio";

// Radio Group Component
interface RadioGroupProps {
  children: React.ReactNode;
  name: string;
  value: string | number;
  onChange: (value: string | number) => void;
  label?: string;
  error?: string;
  description?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  orientation?: "horizontal" | "vertical";
  required?: boolean;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  children,
  name,
  value,
  onChange,
  label,
  error,
  description,
  disabled = false,
  size = "md",
  className = "",
  orientation = "vertical",
  required = false,
}) => {
  return (
    <fieldset className={className}>
      {label && (
        <legend className="text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </legend>
      )}
      
      {description && (
        <p className="text-sm text-gray-500 mb-3">
          {description}
        </p>
      )}
      
      <RadioContext.Provider value={{ name, value, onChange, disabled, size }}>
        <div className={`
          ${orientation === "horizontal" 
            ? "flex flex-wrap gap-4" 
            : "space-y-3"
          }
        `}>
          {children}
        </div>
      </RadioContext.Provider>
      
      {error && (
        <p className="mt-2 text-xs text-red-600">
          {error}
        </p>
      )}
    </fieldset>
  );
};

export default Radio;
