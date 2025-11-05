import React, { useEffect, useState } from 'react';
import { toastService, Toast as ToastType } from '../utils/toastService';
import Toast from './Toast';

/**
 * Toast Container Component
 * Displays all toast notifications
 */
const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastType[]>([]);

  useEffect(() => {
    // Initial load
    setToasts(toastService.getToasts());

    // Subscribe to toast updates
    const removeListener = toastService.addListener((newToasts) => {
      setToasts(newToasts);
    });

    return () => {
      removeListener();
    };
  }, []);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="toast-container" role="region" aria-label="Notifications">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          toast={toast}
          onDismiss={(id) => toastService.dismiss(id)}
        />
      ))}
    </div>
  );
};

export default ToastContainer;

