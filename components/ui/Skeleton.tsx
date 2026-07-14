import React from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  rounded?: boolean | 'full';
  className?: string;
  count?: number;
}

export function Skeleton({
  width,
  height,
  rounded = false,
  className = '',
  count = 1,
}: SkeletonProps) {
  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  const roundedClass = rounded === 'full' ? 'skeleton-circle' : rounded ? 'skeleton-rounded' : '';

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`skeleton ${roundedClass} ${className}`}
          style={style}
          aria-hidden="true"
        />
      ))}
    </>
  );
}

// ============================================
// OrderCard skeleton — mirror của OrderCard layout
// ============================================
export function OrderCardSkeleton() {
  return (
    <div className="order-card skeleton-card" aria-label="Đang tải...">
      <div className="order-card-header">
        <div className="flex gap-3 items-center">
          <Skeleton width={40} height={40} rounded="full" />
          <div className="flex flex-col gap-2">
            <Skeleton width={120} height={14} rounded />
            <Skeleton width={80} height={12} rounded />
          </div>
        </div>
        <Skeleton width={90} height={26} rounded />
      </div>
      <div className="order-card-body">
        <Skeleton width="100%" height={12} rounded />
        <Skeleton width="60%" height={12} rounded />
      </div>
    </div>
  );
}
