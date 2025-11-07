/**
 * Toast Notification Service
 * Manages toast notifications throughout the application using Sonner
 */

import { toast as sonnerToast } from 'sonner';

/**
 * Toast Type
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

/**
 * Toast Type Enum (alias for type safety)
 */
export type ToastTypeEnum = ToastType;

/**
 * Toast Interface (kept for backward compatibility)
 */
export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number; // in milliseconds
  timestamp: Date;
}

/**
 * Toast Service
 */
class ToastService {
  private defaultDuration = 5000; // 5 seconds

  /**
   * Show a toast notification
   */
  show(message: string, type: ToastType = 'info', duration?: number): string {
    const durationMs = duration !== undefined ? duration : this.defaultDuration;
    const id = sonnerToast[type](message, {
      duration: durationMs,
    });
    return String(id);
  }

  /**
   * Show success toast
   */
  success(message: string, duration?: number): string {
    return this.show(message, 'success', duration);
  }

  /**
   * Show error toast
   */
  error(message: string, duration?: number): string {
    return this.show(message, 'error', duration || 0); // Errors don't auto-dismiss
  }

  /**
   * Show warning toast
   */
  warning(message: string, duration?: number): string {
    return this.show(message, 'warning', duration);
  }

  /**
   * Show info toast
   */
  info(message: string, duration?: number): string {
    return this.show(message, 'info', duration);
  }

  /**
   * Dismiss a toast
   */
  dismiss(id: string): void {
    sonnerToast.dismiss(Number(id));
  }

  /**
   * Dismiss all toasts
   */
  dismissAll(): void {
    sonnerToast.dismiss();
  }

  /**
   * Get all toasts (deprecated - sonner manages its own state)
   */
  getToasts(): Toast[] {
    return [];
  }

  /**
   * Add listener (deprecated - sonner manages its own state)
   */
  addListener(): () => void {
    return () => {};
  }
}

// Export singleton instance
export const toastService = new ToastService();

