import React from 'react';
import { Toast as ToastType, ToastType as ToastTypeEnum } from '../utils/toastService';

/**
 * Toast Component Props
 */
interface ToastProps {
  toast: ToastType;
  onDismiss: (id: string) => void;
}

/**
 * Toast Component
 * Individual toast notification
 */
const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const getToastIcon = (type: ToastTypeEnum): string => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return 'ℹ️';
    }
  };

  const getToastClass = (type: ToastTypeEnum): string => {
    return `toast toast-${type}`;
  };

  return (
    <div className={getToastClass(toast.type)} role="alert">
      <div className="toast-content">
        <span className="toast-icon">{getToastIcon(toast.type)}</span>
        <span className="toast-message">{toast.message}</span>
      </div>
      <button
        className="toast-dismiss"
        onClick={() => onDismiss(toast.id)}
        type="button"
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </div>
  );
};

export default Toast;

