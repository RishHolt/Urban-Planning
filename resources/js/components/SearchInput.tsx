import React, { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";

interface SearchInputProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onClear?: () => void;
  className?: string;
  containerClassName?: string;
  showClearButton?: boolean;
  debounceMs?: number;
  initialValue?: string;
  disabled?: boolean;
}

const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = "Search...",
  onSearch,
  onClear,
  className = "",
  containerClassName = "",
  showClearButton = true,
  debounceMs = 300,
  initialValue = "",
  disabled = false,
}) => {
  const [query, setQuery] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync query state with initialValue changes
  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  // Debounced search effect
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      // Only trigger search if there's a query or if clearing an existing search
      if (onSearch && query.trim()) {
        onSearch(query);
      }
    }, debounceMs);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, debounceMs]); // Removed onSearch from deps to prevent infinite loop

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleClear = () => {
    setQuery("");
    if (onClear) {
      onClear();
    }
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      handleClear();
    }
  };

  return (
    <div className={`relative ${containerClassName}`}>
      <div className="relative">
        {/* Search Icon */}
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search 
            size={16} 
            className={`transition-colors duration-200 ${
              isFocused ? "text-primary" : "text-muted"
            }`} 
          />
        </div>

        {/* Input Field */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            input-theme pl-10 pr-10 w-full
            focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
            transition-all duration-200
            ${isFocused ? "shadow-sm" : ""}
            ${disabled ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}
            ${className}
          `}
        />

        {/* Clear Button */}
        {showClearButton && query && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>

    </div>
  );
};

export default SearchInput;
