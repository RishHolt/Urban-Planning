import React, { forwardRef } from "react";

type TextAreaProps = {
  label?: string;
  error?: string;
  helperText?: string;
  className?: string;
  containerClassName?: string;
  required?: boolean;
  fullWidth?: boolean;
  variant?: "outlined" | "filled";
  size?: "sm" | "md" | "lg";
  rows?: number;
  resize?: "none" | "vertical" | "horizontal" | "both";
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
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
      rows = 4,
      resize = "vertical",
      id,
      ...props
    },
    ref
  ) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

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

    const resizeClasses = {
      none: "resize-none",
      vertical: "resize-y",
      horizontal: "resize-x",
      both: "resize",
    };

    const baseTextAreaClasses = `
      w-full rounded-md transition-colors duration-200
      placeholder:text-gray-400 focus:outline-none
      ${sizeClasses[size as keyof typeof sizeClasses]}
      ${variantClasses[variant as keyof typeof variantClasses]}
      ${resizeClasses[resize as keyof typeof resizeClasses]}
      ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}
      ${className}
    `;

    return (
      <div className={`${fullWidth ? "w-full" : ""} ${containerClassName}`}>
        {/* Label */}
        {label && (
          <label
            htmlFor={textareaId}
            className="block mb-1 font-medium text-gray-700 text-sm"
          >
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}

        {/* TextArea */}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={baseTextAreaClasses}
          {...props}
        />

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

TextArea.displayName = "TextArea";

export default TextArea;