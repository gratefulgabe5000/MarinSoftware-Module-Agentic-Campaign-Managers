import React from 'react';
import { Toaster } from 'sonner';

/**
 * Toast Container Component
 * Displays all toast notifications using Sonner
 */
const ToastContainer: React.FC = () => {
  return (
    <Toaster
      position="bottom-right"
      richColors
      closeButton
      expand
    />
  );
};

export default ToastContainer;

