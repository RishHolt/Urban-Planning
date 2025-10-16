import React, { useState } from "react";
import { User, Camera } from "lucide-react";

interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  shape?: "circle" | "square";
  status?: "online" | "offline" | "busy" | "away";
  statusPosition?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  fallback?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  editable?: boolean;
  onEdit?: () => void;
  placeholder?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  name,
  size = "md",
  shape = "circle",
  status,
  statusPosition = "bottom-right",
  fallback,
  className = "",
  onClick,
  editable = false,
  onEdit,
  placeholder,
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(!!src);

  const sizeClasses = {
    xs: "w-6 h-6 text-xs",
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-12 h-12 text-lg",
    xl: "w-16 h-16 text-xl",
    "2xl": "w-20 h-20 text-2xl",
  };

  const shapeClasses = {
    circle: "rounded-full",
    square: "rounded-lg",
  };

  const statusColors = {
    online: "bg-green-500",
    offline: "bg-gray-400",
    busy: "bg-red-500",
    away: "bg-yellow-500",
  };

  const statusPositions = {
    "top-right": "top-0 right-0",
    "top-left": "top-0 left-0",
    "bottom-right": "bottom-0 right-0",
    "bottom-left": "bottom-0 left-0",
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const renderContent = () => {
    if (src && !imageError && !imageLoading) {
      return (
        <img
          src={src}
          alt={alt || name || "Avatar"}
          className="w-full h-full object-cover"
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
      );
    }

    if (fallback) {
      return fallback;
    }

    if (name) {
      return (
        <span className="font-medium text-gray-700">
          {getInitials(name)}
        </span>
      );
    }

    return (
      <User size={size === "xs" ? 12 : size === "sm" ? 16 : size === "md" ? 20 : size === "lg" ? 24 : 32} />
    );
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        className={`
          ${sizeClasses[size]}
          ${shapeClasses[shape]}
          bg-gray-200 flex items-center justify-center
          overflow-hidden cursor-pointer
          transition-all duration-200 hover:scale-105
          ${onClick ? "hover:shadow-lg" : ""}
          ${imageLoading ? "animate-pulse" : ""}
        `}
        onClick={onClick}
      >
        {renderContent()}
      </div>

      {/* Status Indicator */}
      {status && (
        <div
          className={`
            absolute w-3 h-3 ${shapeClasses[shape]} border-2 border-white
            ${statusPositions[statusPosition]}
            ${statusColors[status]}
          `}
        />
      )}

      {/* Edit Button */}
      {editable && (
        <button
          onClick={onEdit}
          className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center"
        >
          <Camera size={16} className="text-white" />
        </button>
      )}

      {/* Loading Spinner */}
      {imageLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

// Avatar Group Component
interface AvatarGroupProps {
  children: React.ReactNode;
  max?: number;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  spacing?: "tight" | "normal" | "loose";
  className?: string;
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  children,
  max = 5,
  size = "md",
  spacing = "normal",
  className = "",
}) => {
  const childrenArray = React.Children.toArray(children);
  const visibleChildren = childrenArray.slice(0, max);
  const remainingCount = childrenArray.length - max;

  const spacingClasses = {
    tight: "-space-x-1",
    normal: "-space-x-2",
    loose: "-space-x-3",
  };

  return (
    <div className={`flex items-center ${spacingClasses[spacing]} ${className}`}>
      {visibleChildren.map((child, index) => (
        <div key={index} className="relative">
          {React.cloneElement(child as React.ReactElement, { size })}
        </div>
      ))}
      
      {remainingCount > 0 && (
        <div
          className={`
            ${size === "xs" ? "w-6 h-6" : 
              size === "sm" ? "w-8 h-8" :
              size === "md" ? "w-10 h-10" :
              size === "lg" ? "w-12 h-12" :
              size === "xl" ? "w-16 h-16" : "w-20 h-20"}
            rounded-full bg-gray-300 flex items-center justify-center
            text-gray-600 font-medium text-xs border-2 border-white
          `}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
};

// User Avatar with Name
interface UserAvatarProps {
  user: {
    name: string;
    email?: string;
    avatar?: string;
    role?: string;
  };
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  showName?: boolean;
  showRole?: boolean;
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  size = "md",
  showName = true,
  showRole = false,
  className = "",
}) => {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <Avatar
        src={user.avatar}
        name={user.name}
        size={size}
        alt={user.name}
      />
      
      {showName && (
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {user.name}
          </p>
          {showRole && user.role && (
            <p className="text-xs text-gray-500 truncate">
              {user.role}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Avatar;
