/**
 * Notification Service
 * Handles browser notifications for campaign status updates
 */

/**
 * Notification Permission Status
 */
export type NotificationPermission = 'default' | 'granted' | 'denied';

/**
 * Notification Options
 */
export interface NotificationOptions {
  title: string;
  body?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  requireInteraction?: boolean;
  silent?: boolean;
}

/**
 * Notification Service
 * Manages browser notifications
 */
class NotificationService {
  private permission: NotificationPermission = 'default';
  private isSupported: boolean = false;

  constructor() {
    this.checkSupport();
    this.checkPermission();
  }

  /**
   * Check if notifications are supported
   */
  private checkSupport(): void {
    this.isSupported = 'Notification' in window;
  }

  /**
   * Check current permission status
   */
  private checkPermission(): void {
    if (!this.isSupported) {
      this.permission = 'denied';
      return;
    }

    this.permission = Notification.permission as NotificationPermission;
  }

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported) {
      throw new Error('Notifications are not supported in this browser');
    }

    if (this.permission === 'granted') {
      return 'granted';
    }

    if (this.permission === 'denied') {
      throw new Error('Notification permission has been denied');
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission as NotificationPermission;
      return this.permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      throw new Error('Failed to request notification permission');
    }
  }

  /**
   * Show notification
   */
  async showNotification(options: NotificationOptions): Promise<Notification | null> {
    if (!this.isSupported) {
      console.warn('Notifications are not supported in this browser');
      return null;
    }

    // Check permission
    if (this.permission !== 'granted') {
      // Try to request permission
      try {
        const permission = await this.requestPermission();
        if (permission !== 'granted') {
          console.warn('Notification permission not granted');
          return null;
        }
      } catch (error) {
        console.error('Failed to get notification permission:', error);
        return null;
      }
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/favicon.ico',
        badge: options.badge,
        tag: options.tag,
        data: options.data,
        requireInteraction: options.requireInteraction || false,
        silent: options.silent || false,
      });

      // Handle notification click
      notification.onclick = () => {
        window.focus();
        notification.close();

        // Handle notification data
        if (options.data && options.data.url) {
          window.location.href = options.data.url;
        }
      };

      // Handle notification close
      notification.onclose = () => {
        console.log('Notification closed');
      };

      // Auto-close after 5 seconds (unless requireInteraction is true)
      if (!options.requireInteraction) {
        setTimeout(() => {
          notification.close();
        }, 5000);
      }

      return notification;
    } catch (error) {
      console.error('Error showing notification:', error);
      return null;
    }
  }

  /**
   * Show campaign status notification
   */
  async showCampaignStatusNotification(
    campaignId: string,
    campaignName: string,
    status: string,
    message?: string
  ): Promise<Notification | null> {
    const statusEmojis: Record<string, string> = {
      active: '▶️',
      paused: '⏸️',
      creating: '⏳',
      error: '❌',
      completed: '✅',
    };

    const emoji = statusEmojis[status] || '📊';

    return this.showNotification({
      title: `${emoji} Campaign Status Update`,
      body: `${campaignName}: ${status}${message ? ` - ${message}` : ''}`,
      tag: `campaign-${campaignId}`,
      data: {
        campaignId,
        url: `/campaign/${campaignId}`,
      },
      requireInteraction: status === 'error',
    });
  }

  /**
   * Get current permission status
   */
  getPermission(): NotificationPermission {
    this.checkPermission();
    return this.permission;
  }

  /**
   * Check if notifications are supported
   */
  isNotificationsSupported(): boolean {
    return this.isSupported;
  }

  /**
   * Check if permission is granted
   */
  isPermissionGranted(): boolean {
    return this.permission === 'granted';
  }
}

// Export singleton instance
export const notificationService = new NotificationService();

// Export class for testing
export default NotificationService;

