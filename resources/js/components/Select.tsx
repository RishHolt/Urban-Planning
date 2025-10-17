import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, X, Search, Check } from "lucide-react";

interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  group?: string;
}

interface SelectProps {
  options?: SelectOption[];
  value?: string | number | (string | number)[];
  onChange: (value: string | number | (string | number)[]) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  className?: string;
  containerClassName?: string;
  required?: boolean;
  size?: "sm" | "md" | "lg";
  maxHeight?: string;
}

const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select an option...",
  label,
  error,
  helperText,
  disabled = false,
  multiple = false,
  searchable = false,
  clearable = false,
  className = "",
  containerClassName = "",
  required = false,
  size = "md",
  maxHeight = "200px",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const selectRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-3 py-2 text-sm",
    lg: "px-4 py-3 text-base",
  };

  // Filter options based on search term
  const filteredOptions = (options || []).filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group options
  const groupedOptions = filteredOptions.reduce((acc, option) => {
    const group = option.group || "default";
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(option);
    return acc;
  }, {} as Record<string, SelectOption[]>);

  // Get selected options
  const selectedValues = Array.isArray(value) ? value : value ? [value] : [];
  const selectedOptions = (options || []).filter(option => 
    selectedValues.includes(option.value)
  );

  // Handle option selection
  const handleOptionClick = (option: SelectOption) => {
    if (option.disabled) return;

    if (multiple) {
      const newValue = selectedValues.includes(option.value)
        ? selectedValues.filter(v => v !== option.value)
        : [...selectedValues, option.value];
      onChange(newValue);
    } else {
      onChange(option.value);
      setIsOpen(false);
      setSearchTerm("");
    }
  };

  // Handle clear
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(multiple ? [] : "");
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    const flatOptions = Object.values(groupedOptions).flat();
    
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex(prev => 
          prev < flatOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex(prev => 
          prev > 0 ? prev - 1 : flatOptions.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < flatOptions.length) {
          handleOptionClick(flatOptions[focusedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setFocusedIndex(-1);
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
        setFocusedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isOpen, searchable]);

  const displayValue = () => {
    if (multiple) {
      if (selectedOptions.length === 0) return placeholder;
      if (selectedOptions.length === 1) return selectedOptions[0].label;
      return `${selectedOptions.length} selected`;
    }
    
    const selected = (options || []).find(option => option.value === value);
    return selected ? selected.label : placeholder;
  };

  const isSelected = (option: SelectOption) => {
    return selectedValues.includes(option.value);
  };

  return (
    <div className={`${containerClassName}`}>
      {/* Label */}
      {label && (
        <label className="block mb-2 font-medium text-gray-700 text-sm">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}

      {/* Select Container */}
      <div
        ref={selectRef}
        className={`relative ${className}`}
        onKeyDown={handleKeyDown}
      >
        {/* Trigger Button */}
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            w-full text-left bg-white border rounded-lg transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "border-gray-300"}
            ${sizeClasses[size]}
            ${isOpen ? "ring-2 ring-primary/20 border-primary" : ""}
          `}
        >
          <div className="flex items-center justify-between">
            <span className={`${!value || (Array.isArray(value) && value.length === 0) ? "text-gray-400" : "text-gray-900"}`}>
              {displayValue()}
            </span>
            
            <div className="flex items-center gap-2">
              {clearable && value && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
              <ChevronDown 
                size={16} 
                className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </div>
          </div>
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div
            className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg"
            style={{ maxHeight }}
          >
            {/* Search Input */}
            {searchable && (
              <div className="p-2 border-b border-gray-200">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    ref={searchRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search options..."
                    className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
            )}

            {/* Options List */}
            <div className="py-1 overflow-auto" style={{ maxHeight: "200px" }}>
              {Object.entries(groupedOptions).map(([groupName, groupOptions]) => (
                <div key={groupName}>
                  {groupName !== "default" && (
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {groupName}
                    </div>
                  )}
                  
                  {groupOptions.map((option, index) => {
                    const globalIndex = Object.values(groupedOptions)
                      .flat()
                      .indexOf(option);
                    
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleOptionClick(option)}
                        disabled={option.disabled}
                        className={`
                          w-full text-left px-3 py-2 text-sm transition-colors
                          hover:bg-gray-100 focus:bg-gray-100 focus:outline-none
                          disabled:opacity-50 disabled:cursor-not-allowed
                          ${isSelected(option) ? "bg-primary/10 text-primary" : "text-gray-900"}
                          ${focusedIndex === globalIndex ? "bg-gray-100" : ""}
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <span>{option.label}</span>
                          {isSelected(option) && (
                            <Check size={16} className="text-primary" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))}
              
              {filteredOptions.length === 0 && (
                <div className="px-3 py-2 text-sm text-gray-500 text-center">
                  No options found
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Helper Text or Error */}
      {(error || helperText) && (
        <p className={`mt-1 text-xs ${error ? "text-red-600" : "text-gray-500"}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};

// Individual component exports for compatibility
export const SelectTrigger: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => {
  return <div className={`flex items-center justify-between w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${className}`}>
    {children}
  </div>;
};

export const SelectValue: React.FC<{ placeholder?: string }> = ({ placeholder = "Select an option..." }) => {
  return <span className="text-gray-400">{placeholder}</span>;
};

export const SelectContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => {
  return <div className={`absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg ${className}`}>
    {children}
  </div>;
};

export const SelectItem: React.FC<{ value: string | number; children: React.ReactNode; className?: string }> = ({ value, children, className = "" }) => {
  return <button type="button" className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none text-gray-900 ${className}`}>
    {children}
  </button>;
};

export { Select };
export default Select;
