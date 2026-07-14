import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  color?: string;      // hex background
  textColor?: string;  // hex text
  dot?: string;        // hex dot color
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({
  children,
  color,
  textColor,
  dot,
  size = 'md',
  className = '',
}: BadgeProps) {
  const style: React.CSSProperties = {};
  if (color) style.backgroundColor = color;
  if (textColor) style.color = textColor;

  return (
    <span
      className={`badge ${size === 'sm' ? 'badge-sm' : ''} ${className}`}
      style={style}
    >
      {dot && (
        <span
          className="badge-dot"
          style={{ backgroundColor: dot }}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
