import React, { createContext, useContext, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface AccordionContextType {
  openItems: string[];
  toggleItem: (value: string) => void;
  allowMultiple: boolean;
  variant: "default" | "bordered" | "filled";
  size: "sm" | "md" | "lg";
}

const AccordionContext = createContext<AccordionContextType | undefined>(undefined);

interface AccordionProps {
  children: React.ReactNode;
  allowMultiple?: boolean;
  variant?: "default" | "bordered" | "filled";
  size?: "sm" | "md" | "lg";
  className?: string;
  defaultValue?: string | string[];
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
}

export const Accordion: React.FC<AccordionProps> = ({
  children,
  allowMultiple = false,
  variant = "default",
  size = "md",
  className = "",
  defaultValue,
  value,
  onValueChange,
}) => {
  const [openItems, setOpenItems] = useState<string[]>(() => {
    if (value !== undefined) return Array.isArray(value) ? value : [value];
    if (defaultValue !== undefined) return Array.isArray(defaultValue) ? defaultValue : [defaultValue];
    return [];
  });

  const toggleItem = (itemValue: string) => {
    let newOpenItems: string[];
    
    if (allowMultiple) {
      newOpenItems = openItems.includes(itemValue)
        ? openItems.filter(item => item !== itemValue)
        : [...openItems, itemValue];
    } else {
      newOpenItems = openItems.includes(itemValue) ? [] : [itemValue];
    }

    if (value === undefined) {
      setOpenItems(newOpenItems);
    }
    
    if (onValueChange) {
      onValueChange(allowMultiple ? newOpenItems : newOpenItems[0] || "");
    }
  };

  const currentOpenItems = value !== undefined 
    ? (Array.isArray(value) ? value : [value].filter(Boolean))
    : openItems;

  return (
    <AccordionContext.Provider
      value={{
        openItems: currentOpenItems,
        toggleItem,
        allowMultiple,
        variant,
        size,
      }}
    >
      <div className={`space-y-2 ${className}`}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
};

interface AccordionItemProps {
  value: string;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export const AccordionItem: React.FC<AccordionItemProps> = ({
  value,
  children,
  disabled = false,
  className = "",
}) => {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error("AccordionItem must be used within an Accordion component");
  }

  const { openItems, toggleItem, variant, size } = context;
  const isOpen = openItems.includes(value);

  const variantClasses = {
    default: "border border-gray-200 rounded-lg",
    bordered: "border-2 border-gray-200 rounded-lg",
    filled: "bg-gray-50 rounded-lg",
  };

  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <div
      className={`
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${disabled ? "opacity-50 pointer-events-none" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

interface AccordionTriggerProps {
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

export const AccordionTrigger: React.FC<AccordionTriggerProps> = ({
  children,
  className = "",
  icon,
  iconPosition = "right",
}) => {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error("AccordionTrigger must be used within an AccordionItem");
  }

  const { openItems, toggleItem, size } = context;
  
  // Get the parent AccordionItem's value
  const parentValue = React.useContext(AccordionItemContext);
  if (!parentValue) {
    throw new Error("AccordionTrigger must be used within an AccordionItem");
  }

  const isOpen = openItems.includes(parentValue);

  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-3 text-base",
    lg: "px-6 py-4 text-lg",
  };

  const handleClick = () => {
    toggleItem(parentValue);
  };

  const defaultIcon = isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />;

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`
        w-full flex items-center justify-between
        hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20
        transition-colors duration-200
        ${sizeClasses[size]}
        ${className}
      `}
      aria-expanded={isOpen}
    >
      <div className="flex items-center gap-3">
        {icon && iconPosition === "left" && (
          <span className="flex-shrink-0">{icon}</span>
        )}
        <span className="text-left font-medium">{children}</span>
      </div>
      
      <div className="flex items-center gap-2">
        {icon && iconPosition === "right" && (
          <span className="flex-shrink-0">{icon}</span>
        )}
        <span className="flex-shrink-0 text-gray-400">
          {defaultIcon}
        </span>
      </div>
    </button>
  );
};

interface AccordionContentProps {
  children: React.ReactNode;
  className?: string;
}

export const AccordionContent: React.FC<AccordionContentProps> = ({
  children,
  className = "",
}) => {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error("AccordionContent must be used within an AccordionItem");
  }

  const { openItems, size } = context;
  
  // Get the parent AccordionItem's value
  const parentValue = React.useContext(AccordionItemContext);
  if (!parentValue) {
    throw new Error("AccordionContent must be used within an AccordionItem");
  }

  const isOpen = openItems.includes(parentValue);

  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-3 text-base",
    lg: "px-6 py-4 text-lg",
  };

  return (
    <div
      className={`
        overflow-hidden transition-all duration-300 ease-in-out
        ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}
      `}
    >
      <div className={`
        ${sizeClasses[size]}
        text-gray-600 border-t border-gray-200
        ${className}
      `}>
        {children}
      </div>
    </div>
  );
};

// Context for AccordionItem to pass value to children
const AccordionItemContext = React.createContext<string | null>(null);

// Enhanced AccordionItem that provides context
export const AccordionItemWithContext: React.FC<AccordionItemProps> = ({
  value,
  children,
  disabled = false,
  className = "",
}) => {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error("AccordionItemWithContext must be used within an Accordion component");
  }

  const { openItems, toggleItem, variant, size } = context;
  const isOpen = openItems.includes(value);

  const variantClasses = {
    default: "border border-gray-200 rounded-lg",
    bordered: "border-2 border-gray-200 rounded-lg",
    filled: "bg-gray-50 rounded-lg",
  };

  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <AccordionItemContext.Provider value={value}>
      <div
        className={`
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${disabled ? "opacity-50 pointer-events-none" : ""}
          ${className}
        `}
      >
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
};

export default Accordion;
