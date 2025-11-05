/**
 * Toast Notification Service
 * Manages toast notifications throughout the application
 */

/**
 * Toast Type
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

/**
 * Toast Type Enum (alias for type safety)
 */
export type ToastTypeEnum = ToastType;

/**
 * Toast Interface
 */
export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number; // in milliseconds
  timestamp: Date;
}

/**
 * Toast Listener
 */
type ToastListener = (toasts: Toast[]) => void;

/**
 * Toast Service
 */
class ToastService {
  private toasts: Toast[] = [];
  private listeners: ToastListener[] = [];
  private defaultDuration = 5000; // 5 seconds

  /**
   * Show a toast notification
   */
  show(message: string, type: ToastType = 'info', duration?: number): string {
    const toast: Toast = {
      id: `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      message,
      type,
      duration: duration !== undefined ? duration : this.defaultDuration,
      timestamp: new Date(),
    };

    this.toasts.push(toast);
    this.notifyListeners();

    // Auto-dismiss if duration is set
    if (toast.duration && toast.duration > 0) {
      setTimeout(() => {
        this.dismiss(toast.id);
      }, toast.duration);
    }

    return toast.id;
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
    this.toasts = this.toasts.filter((toast) => toast.id !== id);
    this.notifyListeners();
  }

  /**
   * Dismiss all toasts
   */
  dismissAll(): void {
    this.toasts = [];
    this.notifyListeners();
  }

  /**
   * Get all toasts
   */
  getToasts(): Toast[] {
    return [...this.toasts];
  }

  /**
   * Add listener
   */
  addListener(listener: ToastListener): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      listener(this.getToasts());
    });
  }
}

// Export singleton instance
export const toastService = new ToastService();

