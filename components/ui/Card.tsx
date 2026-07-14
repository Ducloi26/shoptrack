import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
  style?: React.CSSProperties;
}

export function Card({
  children,
  className = '',
  hover = false,
  padding = 'md',
  onClick,
  style,
}: CardProps) {
  const paddingMap = {
    none: '',
    sm: 'card-p-sm',
    md: 'card-p-md',
    lg: 'card-p-lg',
  };

  return (
    <div
      className={`card ${paddingMap[padding]} ${hover ? 'card-hover' : ''} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
      style={style}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
  style?: React.CSSProperties;
}

export function CardHeader({ children, className = '', action, style }: CardHeaderProps) {
  return (
    <div className={`card-header ${className}`} style={style}>
      <div className="card-header-content">{children}</div>
      {action && <div className="card-header-action">{action}</div>}
    </div>
  );
}

interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function CardBody({ children, className = '', style }: CardBodyProps) {
  return <div className={`card-body ${className}`} style={style}>{children}</div>;
}
