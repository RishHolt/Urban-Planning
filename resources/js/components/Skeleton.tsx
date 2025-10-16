import React from "react";

interface SkeletonProps {
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
  animation?: "pulse" | "wave" | "none";
  className?: string;
  lines?: number;
  spacing?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({
  variant = "rectangular",
  width,
  height,
  animation = "pulse",
  className = "",
  lines = 1,
  spacing = "0.5rem",
}) => {
  const baseClasses = `
    bg-gray-200 dark:bg-gray-700
    ${animation === "pulse" ? "animate-pulse" : ""}
    ${animation === "wave" ? "animate-wave" : ""}
    ${className}
  `;

  const variantClasses = {
    text: "h-4 rounded",
    circular: "rounded-full",
    rectangular: "rounded",
  };

  const style = {
    width: width || (variant === "circular" ? "40px" : "100%"),
    height: height || (variant === "text" ? "1rem" : variant === "circular" ? "40px" : "1rem"),
  };

  if (variant === "text" && lines > 1) {
    return (
      <div className="space-y-2" style={{ "--spacing": spacing } as React.CSSProperties}>
        {Array.from({ length: lines }, (_, index) => (
          <div
            key={index}
            className={`${baseClasses} ${variantClasses[variant]}`}
            style={{
              ...style,
              width: index === lines - 1 ? "75%" : "100%",
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]}`}
      style={style}
    />
  );
};

// Skeleton Layout Components
export const SkeletonCard: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`p-6 border border-gray-200 rounded-lg ${className}`}>
    <div className="flex items-center space-x-4 mb-4">
      <Skeleton variant="circular" width={40} height={40} />
      <div className="space-y-2 flex-1">
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="40%" />
      </div>
    </div>
    <Skeleton variant="text" lines={3} />
  </div>
);

export const SkeletonTable: React.FC<{ 
  rows?: number; 
  columns?: number; 
  className?: string 
}> = ({ rows = 5, columns = 4, className = "" }) => (
  <div className={`space-y-3 ${className}`}>
    {/* Header */}
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {Array.from({ length: columns }, (_, index) => (
        <Skeleton key={index} variant="text" height={20} />
      ))}
    </div>
    
    {/* Rows */}
    {Array.from({ length: rows }, (_, rowIndex) => (
      <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }, (_, colIndex) => (
          <Skeleton key={colIndex} variant="text" height={16} />
        ))}
      </div>
    ))}
  </div>
);

export const SkeletonList: React.FC<{ 
  items?: number; 
  showAvatar?: boolean;
  className?: string 
}> = ({ items = 5, showAvatar = true, className = "" }) => (
  <div className={`space-y-4 ${className}`}>
    {Array.from({ length: items }, (_, index) => (
      <div key={index} className="flex items-center space-x-3">
        {showAvatar && <Skeleton variant="circular" width={40} height={40} />}
        <div className="space-y-2 flex-1">
          <Skeleton variant="text" width={index % 3 === 0 ? "80%" : "100%"} />
          <Skeleton variant="text" width="60%" />
        </div>
      </div>
    ))}
  </div>
);

export const SkeletonForm: React.FC<{ 
  fields?: number; 
  showLabels?: boolean;
  className?: string 
}> = ({ fields = 4, showLabels = true, className = "" }) => (
  <div className={`space-y-6 ${className}`}>
    {Array.from({ length: fields }, (_, index) => (
      <div key={index} className="space-y-2">
        {showLabels && <Skeleton variant="text" width="20%" height={16} />}
        <Skeleton variant="rectangular" height={40} />
      </div>
    ))}
  </div>
);

// Skeleton for specific content types
export const SkeletonProfile: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`space-y-6 ${className}`}>
    <div className="flex items-center space-x-4">
      <Skeleton variant="circular" width={80} height={80} />
      <div className="space-y-2">
        <Skeleton variant="text" width="200px" />
        <Skeleton variant="text" width="150px" />
        <Skeleton variant="text" width="100px" />
      </div>
    </div>
    <div className="space-y-3">
      <Skeleton variant="text" lines={3} />
    </div>
  </div>
);

export const SkeletonDashboard: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`space-y-6 ${className}`}>
    {/* Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="p-6 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <Skeleton variant="circular" width={40} height={40} />
            <Skeleton variant="text" width="60px" />
          </div>
          <Skeleton variant="text" width="80%" height={24} />
          <Skeleton variant="text" width="40%" height={16} />
        </div>
      ))}
    </div>
    
    {/* Chart Area */}
    <div className="p-6 border border-gray-200 rounded-lg">
      <Skeleton variant="text" width="200px" height={20} className="mb-4" />
      <Skeleton variant="rectangular" height={300} />
    </div>
    
    {/* Table */}
    <SkeletonTable rows={5} columns={4} />
  </div>
);

export default Skeleton;
