import React from 'react';

/**
 * Skeleton Loader Props
 */
interface SkeletonLoaderProps {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  className?: string;
  count?: number;
}

/**
 * Skeleton Loader Component
 * Displays a skeleton loading placeholder
 */
const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'text',
  width,
  height,
  className = '',
  count = 1,
}) => {
  const style: React.CSSProperties = {};
  if (width) {
    style.width = typeof width === 'number' ? `${width}px` : width;
  }
  if (height) {
    style.height = typeof height === 'number' ? `${height}px` : height;
  }

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`skeleton-loader skeleton-${variant} ${className}`}
          style={style}
          role="status"
          aria-label="Loading"
        >
          <span className="sr-only">Loading...</span>
        </div>
      ))}
    </>
  );
};

export default SkeletonLoader;

