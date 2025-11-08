import React from 'react';
import LoadingSpinner from './LoadingSpinner';

/**
 * Loading Overlay Props
 */
interface LoadingOverlayProps {
  message?: string;
  fullScreen?: boolean;
}

/**
 * Loading Overlay Component
 * Displays a full-screen or overlay loading indicator
 */
const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  message = 'Loading...',
  fullScreen = false,
}) => {
  return (
    <div
      className={`loading-overlay ${fullScreen ? 'fullscreen' : ''}`}
      role="status"
      aria-label={message}
    >
      <div className="loading-overlay-content">
        <LoadingSpinner size="large" />
        {message && <p className="loading-message">{message}</p>}
      </div>
    </div>
  );
};

export default LoadingOverlay;

