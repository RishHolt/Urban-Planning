import React from 'react';

interface CardProps {
  children?: React.ReactNode;
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  clickable?: boolean;
  variant?: 'default' | 'outlined' | 'elevated';
  className?: string;
  onClick?: () => void;
  // Stats card props (for backward compatibility)
  stats?: boolean;
  icon?: React.ReactNode;
  value?: string | number;
  change?: string;
  iconColor?: string;
}

const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  footer,
  padding = 'md',
  hoverable = false,
  clickable = false,
  variant = 'default',
  className = '',
  onClick,
  // Stats card props (for backward compatibility)
  stats = false,
  icon,
  value,
  change,
  iconColor
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const variantClasses = {
    default: 'bg-white border border-gray-200 shadow-sm',
    outlined: 'bg-white border-2 border-gray-300 shadow-none',
    elevated: 'bg-white border border-gray-200 shadow-lg',
  };

  const baseClasses = `
    rounded-lg transition-all duration-200
    ${variantClasses[variant]}
    ${hoverable ? 'hover:shadow-md hover:-translate-y-0.5' : ''}
    ${clickable ? 'cursor-pointer' : ''}
    ${className}
  `;

  // Stats card variant (for backward compatibility)
  if (stats) {
    return (
      <div className={`${baseClasses} ${paddingClasses[padding]}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold text-primary mt-1">{value}</p>
            <p className={`text-sm font-medium ${iconColor || 'text-primary'}`}>{change}</p>
          </div>
          <div className={`${iconColor || 'bg-primary'} p-3 rounded-lg`}>
            {icon && <span className="text-white">{icon}</span>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={baseClasses} onClick={onClick}>
      {/* Header */}
      {(title || subtitle) && (
        <div className="border-b border-gray-200 pb-3 mb-4">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
          )}
        </div>
      )}

      {/* Content */}
      {children && (
        <div className={paddingClasses[padding]}>
          {children}
        </div>
      )}

      {/* Footer */}
      {footer && (
        <div className="border-t border-gray-200 pt-3 mt-4">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;


