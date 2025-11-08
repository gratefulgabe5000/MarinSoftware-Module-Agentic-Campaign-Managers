import React from 'react';

/**
 * Loading Spinner Props
 */
interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

/**
 * Loading Spinner Component
 * Displays a loading spinner
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  className = '',
}) => {
  return (
    <div className={`loading-spinner ${size} ${className}`} role="status" aria-label="Loading">
      <div className="spinner" />
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;

