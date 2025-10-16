import React, { createContext, useContext, useState } from "react";
import { ChevronDown } from "lucide-react";

interface TabContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  orientation: "horizontal" | "vertical";
  variant: "underline" | "pill" | "enclosed";
  size: "sm" | "md" | "lg";
}

const TabContext = createContext<TabContextType | undefined>(undefined);

interface TabsProps {
  children: React.ReactNode;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  orientation?: "horizontal" | "vertical";
  variant?: "underline" | "pill" | "enclosed";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  children,
  defaultValue,
  value,
  onValueChange,
  orientation = "horizontal",
  variant = "underline",
  size = "md",
  className = "",
}) => {
  const [activeTab, setActiveTab] = useState(defaultValue || "");

  const handleTabChange = (tab: string) => {
    if (value === undefined) {
      setActiveTab(tab);
    }
    if (onValueChange) {
      onValueChange(tab);
    }
  };

  const currentActiveTab = value !== undefined ? value : activeTab;

  return (
    <TabContext.Provider
      value={{
        activeTab: currentActiveTab,
        setActiveTab: handleTabChange,
        orientation,
        variant,
        size,
      }}
    >
      <div
        className={`
          ${orientation === "vertical" ? "flex" : ""}
          ${className}
        `}
      >
        {children}
      </div>
    </TabContext.Provider>
  );
};

interface TabListProps {
  children: React.ReactNode;
  className?: string;
}

export const TabList: React.FC<TabListProps> = ({ children, className = "" }) => {
  const context = useContext(TabContext);
  if (!context) {
    throw new Error("TabList must be used within a Tabs component");
  }

  const { orientation, variant, size } = context;

  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const variantClasses = {
    underline: `
      border-b border-gray-200
      ${orientation === "vertical" ? "border-b-0 border-r" : ""}
    `,
    pill: "bg-gray-100 rounded-lg p-1",
    enclosed: "border border-gray-200 rounded-lg p-1",
  };

  return (
    <div
      role="tablist"
      className={`
        flex
        ${orientation === "vertical" ? "flex-col space-y-1" : "flex-row space-x-1"}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

interface TabProps {
  value: string;
  children: React.ReactNode;
  disabled?: boolean;
  icon?: React.ReactNode;
  badge?: string | number;
  className?: string;
}

export const Tab: React.FC<TabProps> = ({
  value,
  children,
  disabled = false,
  icon,
  badge,
  className = "",
}) => {
  const context = useContext(TabContext);
  if (!context) {
    throw new Error("Tab must be used within a Tabs component");
  }

  const { activeTab, setActiveTab, orientation, variant, size } = context;
  const isActive = activeTab === value;

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  const variantClasses = {
    underline: `
      border-b-2 transition-colors duration-200
      ${isActive 
        ? "border-primary text-primary" 
        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
      }
    `,
    pill: `
      rounded-md transition-all duration-200
      ${isActive 
        ? "bg-primary text-white shadow-sm" 
        : "text-gray-500 hover:text-gray-700 hover:bg-gray-200"
      }
    `,
    enclosed: `
      rounded-md transition-all duration-200
      ${isActive 
        ? "bg-white text-primary shadow-sm border border-gray-200" 
        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
      }
    `,
  };

  const handleClick = () => {
    if (!disabled) {
      setActiveTab(value);
    }
  };

  return (
    <button
      role="tab"
      aria-selected={isActive}
      aria-disabled={disabled}
      onClick={handleClick}
      disabled={disabled}
      className={`
        flex items-center gap-2 font-medium whitespace-nowrap
        focus:outline-none focus:ring-2 focus:ring-primary/20
        disabled:opacity-50 disabled:cursor-not-allowed
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
      {badge && (
        <span className={`
          px-2 py-0.5 text-xs rounded-full
          ${isActive ? "bg-white/20" : "bg-gray-200 text-gray-600"}
        `}>
          {badge}
        </span>
      )}
    </button>
  );
};

interface TabPanelsProps {
  children: React.ReactNode;
  className?: string;
}

export const TabPanels: React.FC<TabPanelsProps> = ({ children, className = "" }) => {
  const context = useContext(TabContext);
  if (!context) {
    throw new Error("TabPanels must be used within a Tabs component");
  }

  const { orientation } = context;

  return (
    <div
      className={`
        ${orientation === "vertical" ? "flex-1 ml-4" : "mt-4"}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

interface TabPanelProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export const TabPanel: React.FC<TabPanelProps> = ({
  value,
  children,
  className = "",
}) => {
  const context = useContext(TabContext);
  if (!context) {
    throw new Error("TabPanel must be used within a Tabs component");
  }

  const { activeTab } = context;
  const isActive = activeTab === value;

  if (!isActive) {
    return null;
  }

  return (
    <div
      role="tabpanel"
      className={`
        focus:outline-none
        ${className}
      `}
    >
      {children}
    </div>
  );
};

// Mobile Tabs Component (Dropdown on small screens)
interface MobileTabsProps {
  children: React.ReactNode;
  className?: string;
}

export const MobileTabs: React.FC<MobileTabsProps> = ({ children, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const context = useContext(TabContext);
  
  if (!context) {
    throw new Error("MobileTabs must be used within a Tabs component");
  }

  const { activeTab, setActiveTab } = context;

  // This would need to be implemented with the actual tab data
  // For now, this is a placeholder structure
  return (
    <div className={`md:hidden ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-lg"
      >
        <span>{activeTab}</span>
        <ChevronDown size={16} className={`transform transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      
      {isOpen && (
        <div className="mt-1 border border-gray-300 rounded-lg bg-white shadow-lg">
          {/* Tab options would be rendered here */}
        </div>
      )}
    </div>
  );
};

export default Tabs;
