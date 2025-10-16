import React from "react";
import { ChevronRight, Home, MoreHorizontal } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  current?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  maxItems?: number;
  className?: string;
  showHome?: boolean;
  homeHref?: string;
  onItemClick?: (item: BreadcrumbItem, index: number) => void;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  separator = <ChevronRight size={16} />,
  maxItems = 5,
  className = "",
  showHome = true,
  homeHref = "/",
  onItemClick,
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [showOverflow, setShowOverflow] = React.useState(false);

  // Add home item if enabled
  const allItems = showHome 
    ? [{ label: "Home", href: homeHref, icon: <Home size={16} />, current: false }, ...items]
    : items;

  // Handle overflow
  const shouldCollapse = allItems.length > maxItems;
  const displayItems = shouldCollapse && isCollapsed 
    ? [allItems[0], ...allItems.slice(-2)]
    : allItems;

  const handleItemClick = (item: BreadcrumbItem, index: number) => {
    if (onItemClick) {
      onItemClick(item, index);
    }
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <nav
      className={`flex items-center space-x-1 text-sm ${className}`}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-1">
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1;
          const isFirst = index === 0;
          const isCollapsedFirst = shouldCollapse && isCollapsed && isFirst;
          const isCollapsedLast = shouldCollapse && isCollapsed && isLast;

          return (
            <li key={index} className="flex items-center">
              {/* Overflow indicator */}
              {shouldCollapse && isCollapsed && index === 1 && (
                <button
                  onClick={toggleCollapse}
                  className="flex items-center px-2 py-1 text-gray-500 hover:text-gray-700 transition-colors"
                  aria-label="Show more breadcrumbs"
                >
                  <MoreHorizontal size={16} />
                </button>
              )}

              {/* Breadcrumb item */}
              <div className="flex items-center">
                {item.icon && (
                  <span className="mr-1 text-gray-400">
                    {item.icon}
                  </span>
                )}
                
                {item.current || isLast ? (
                  <span
                    className={`
                      font-medium
                      ${item.current ? "text-primary" : "text-gray-900"}
                    `}
                    aria-current="page"
                  >
                    {item.label}
                  </span>
                ) : (
                  <button
                    onClick={() => handleItemClick(item, index)}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {item.label}
                  </button>
                )}
              </div>

              {/* Separator */}
              {!isLast && (
                <span className="mx-2 text-gray-400">
                  {separator}
                </span>
              )}
            </li>
          );
        })}
      </ol>

      {/* Collapse/Expand button for mobile */}
      {shouldCollapse && (
        <button
          onClick={toggleCollapse}
          className="ml-2 p-1 text-gray-500 hover:text-gray-700 transition-colors md:hidden"
          aria-label={isCollapsed ? "Show more breadcrumbs" : "Show fewer breadcrumbs"}
        >
          <MoreHorizontal size={16} />
        </button>
      )}
    </nav>
  );
};

// Mobile Breadcrumbs Component
interface MobileBreadcrumbsProps {
  items: BreadcrumbItem[];
  currentPage: string;
  onBack?: () => void;
  className?: string;
}

export const MobileBreadcrumbs: React.FC<MobileBreadcrumbsProps> = ({
  items,
  currentPage,
  onBack,
  className = "",
}) => {
  return (
    <div className={`md:hidden ${className}`}>
      <nav className="flex items-center space-x-2 text-sm">
        {onBack && (
          <button
            onClick={onBack}
            className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Go back"
          >
            <ChevronRight size={16} className="rotate-180" />
          </button>
        )}
        
        <div className="flex items-center space-x-1 text-gray-500">
          {items.slice(-2).map((item, index) => (
            <React.Fragment key={index}>
              <span>{item.label}</span>
              {index < items.slice(-2).length - 1 && (
                <ChevronRight size={14} />
              )}
            </React.Fragment>
          ))}
        </div>
        
        <ChevronRight size={14} className="text-gray-400" />
        <span className="font-medium text-gray-900">{currentPage}</span>
      </nav>
    </div>
  );
};

// Breadcrumb with dropdown for overflow
interface BreadcrumbWithDropdownProps {
  items: BreadcrumbItem[];
  maxVisible?: number;
  className?: string;
  onItemClick?: (item: BreadcrumbItem, index: number) => void;
}

export const BreadcrumbWithDropdown: React.FC<BreadcrumbWithDropdownProps> = ({
  items,
  maxVisible = 3,
  className = "",
  onItemClick,
}) => {
  const [showDropdown, setShowDropdown] = React.useState(false);

  const visibleItems = items.slice(0, maxVisible);
  const hiddenItems = items.slice(maxVisible);

  return (
    <nav className={`relative ${className}`}>
      <ol className="flex items-center space-x-1 text-sm">
        {visibleItems.map((item, index) => (
          <li key={index} className="flex items-center">
            {item.current || index === visibleItems.length - 1 ? (
              <span className="font-medium text-gray-900">
                {item.label}
              </span>
            ) : (
              <button
                onClick={() => onItemClick?.(item, index)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                {item.label}
              </button>
            )}
            
            {index < visibleItems.length - 1 && (
              <ChevronRight size={16} className="mx-2 text-gray-400" />
            )}
          </li>
        ))}
        
        {hiddenItems.length > 0 && (
          <li className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
            >
              <MoreHorizontal size={16} />
            </button>
            
            {showDropdown && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div className="py-1">
                  {hiddenItems.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        onItemClick?.(item, visibleItems.length + index);
                        setShowDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </li>
        )}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
