import React from "react";

type MainHeaderProps = {
  title: string;
  subtext?: string;
  className?: string;
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'default';
};

const Header: React.FC<MainHeaderProps> = ({ title, subtext, className, children, variant = 'default' }) => {
  return (
    <div className={className ?? ""}>
      <h1 className="font-bold text-2xl" style={{ color: '#4CAF50' }}>{title}</h1>
      {subtext && <p className="mt-1 text-sm text-gray-600">{subtext}</p>}
      {children}
    </div>
  );
};

export default Header;
