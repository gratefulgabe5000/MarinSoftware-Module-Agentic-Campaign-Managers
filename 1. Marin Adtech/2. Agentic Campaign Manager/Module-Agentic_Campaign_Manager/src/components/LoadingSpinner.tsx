import React from 'react';
import { Spinner } from './ui/spinner';
import { cn } from '@/lib/utils';

/**
 * Loading Spinner Props
 */
interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

/**
 * Loading Spinner Component
 * Displays a loading spinner using shadcn Spinner
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  className = '',
}) => {
  const sizeClasses = {
    small: 'size-4',
    medium: 'size-6',
    large: 'size-8',
  };

  return (
    <div className={cn('flex items-center justify-center', className)} role="status" aria-label="Loading">
      <Spinner className={sizeClasses[size]} />
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;

