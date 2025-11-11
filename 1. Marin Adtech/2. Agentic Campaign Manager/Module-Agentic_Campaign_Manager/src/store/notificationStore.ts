import { create } from 'zustand';
import { Notification } from '../components/layout/HeaderNotifications';

/**
 * Notification Store State Interface
 */
interface NotificationState {
  // Notifications list
  notifications: Notification[];

  // Unread count
  unreadCount: number;

  // Loading state
  isLoading: boolean;

  // Actions
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  fetchNotifications: () => Promise<void>;
}

/**
 * Mock Notifications (for development)
 */
const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Campaign Performance Alert',
    message: 'Your campaign "Summer Sale 2025" has exceeded its daily budget by 15%',
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    read: false,
    type: 'warning',
    actionUrl: '/campaign/summer-sale-2025',
  },
  {
    id: '2',
    title: 'Campaign Approved',
    message: 'Your campaign "Spring Collection" has been approved and is now live',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: false,
    type: 'success',
    actionUrl: '/campaign/spring-collection',
  },
  {
    id: '3',
    title: 'Low Performing Keywords',
    message: 'Detected 5 keywords with CTR below 1% in "Holiday Campaign"',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    read: true,
    type: 'info',
    actionUrl: '/campaign/holiday-campaign/keywords',
  },
  {
    id: '4',
    title: 'Budget Threshold Reached',
    message: 'Campaign "Back to School" has reached 90% of monthly budget',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    read: true,
    type: 'warning',
    actionUrl: '/campaign/back-to-school',
  },
];

/**
 * Generate unique notification ID
 */
const generateId = (): string => {
  return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Notification Store
 *
 * Manages notification state and actions.
 * Features:
 * - Add, read, and clear notifications
 * - Unread count tracking
 * - Mock data for development
 * - Persistent storage (optional)
 */
export const useNotificationStore = create<NotificationState>((set, _get) => ({
  // Initial state
  notifications: mockNotifications,
  unreadCount: mockNotifications.filter((n) => !n.read).length,
  isLoading: false,

  // Add a new notification
  addNotification: (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: generateId(),
    };

    set((state) => ({
      notifications: [newNotification, ...state.notifications],
      unreadCount: !newNotification.read ? state.unreadCount + 1 : state.unreadCount,
    }));
  },

  // Mark a notification as read
  markAsRead: (notificationId) => {
    set((state) => {
      const notifications = state.notifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      );

      const unreadCount = notifications.filter((n) => !n.read).length;

      return { notifications, unreadCount };
    });
  },

  // Mark all notifications as read
  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },

  // Clear all notifications
  clearAll: () => {
    set({
      notifications: [],
      unreadCount: 0,
    });
  },

  // Fetch notifications from API
  fetchNotifications: async () => {
    set({ isLoading: true });

    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/notifications');
      // const data = await response.json();

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Use mock data for now
      const unreadCount = mockNotifications.filter((n) => !n.read).length;

      set({
        notifications: mockNotifications,
        unreadCount,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      set({ isLoading: false });
    }
  },
}));
