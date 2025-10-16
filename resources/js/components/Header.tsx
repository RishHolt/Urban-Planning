import React from "react";

type MainHeaderProps = {
  title: string;
  subtext?: string;
  className?: string;
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'default';
};

const Header: React.FC<MainHeaderProps> = ({ title, subtext, className, children, variant = 'default' }) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-primary text-white p-6 rounded-theme-lg shadow-theme-md';
      case 'secondary':
        return 'bg-secondary text-white p-6 rounded-theme-lg shadow-theme-md';
      case 'accent':
        return 'bg-accent text-white p-6 rounded-theme-lg shadow-theme-md';
      default:
        return 'border-gray-200';
    }
  };

  const getTextStyles = () => {
    switch (variant) {
      case 'primary':
      case 'secondary':
      case 'accent':
        return 'text-3xl font-bold mb-2';
      default:
        return 'font-bold text-primary text-2xl';
    }
  };

  const getSubtextStyles = () => {
    switch (variant) {
      case 'primary':
      case 'secondary':
      case 'accent':
        return 'text-white/90';
      default:
        return 'mt-1 text-sm';
    }
  };

  return (
    <div className={`${getVariantStyles()} ${className ?? ""}`}>
      <h1 className={getTextStyles()}>{title}</h1>
      {subtext && <p className={getSubtextStyles()}>{subtext}</p>}
      {children}
    </div>
  );
};

export default Header;
