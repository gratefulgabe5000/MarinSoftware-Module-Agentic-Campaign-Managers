import React from 'react';
import { Bell, Check, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

/**
 * Notification Interface
 */
export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
  actionUrl?: string;
}

/**
 * HeaderNotifications Component Props
 */
export interface HeaderNotificationsProps {
  // Notifications list
  notifications?: Notification[];

  // Unread count
  unreadCount?: number;

  // Callbacks
  onNotificationClick?: (notification: Notification) => void;
  onMarkAsRead?: (notificationId: string) => void;
  onMarkAllAsRead?: () => void;
  onClearAll?: () => void;

  // Loading state
  isLoading?: boolean;
}

/**
 * Format timestamp to relative time
 */
const formatTimestamp = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
};

/**
 * Get notification color based on type
 */
const getNotificationColor = (type: Notification['type']): string => {
  switch (type) {
    case 'success':
      return 'text-green-600 dark:text-green-400';
    case 'warning':
      return 'text-yellow-600 dark:text-yellow-400';
    case 'error':
      return 'text-red-600 dark:text-red-400';
    default:
      return 'text-blue-600 dark:text-blue-400';
  }
};

/**
 * HeaderNotifications Component
 *
 * Notification dropdown component for the header.
 * Features:
 * - Bell icon with badge count
 * - Dropdown panel with notification list
 * - Mark as read functionality
 * - Clear all notifications
 * - Keyboard accessible
 * - Responsive design
 */
const HeaderNotifications: React.FC<HeaderNotificationsProps> = ({
  notifications = [],
  unreadCount = 0,
  onNotificationClick,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  isLoading = false,
}) => {
  const hasNotifications = notifications.length > 0;
  const displayCount = unreadCount > 99 ? '99+' : unreadCount;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="relative rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
          disabled={isLoading}
        >
          <Bell className="h-5 w-5" aria-hidden="true" />

          {/* Notification Badge */}
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-semibold text-white animate-pulse">
              {displayCount}
            </span>
          )}

          {/* Loading Spinner */}
          {isLoading && (
            <span className="absolute -right-1 -top-1 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 max-h-[400px] overflow-y-auto">
        {/* Header */}
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <span className="text-xs font-normal text-gray-500">
              {unreadCount} unread
            </span>
          )}
        </DropdownMenuLabel>

        {/* Actions */}
        {hasNotifications && (
          <>
            <div className="flex gap-2 px-2 pb-2">
              {unreadCount > 0 && (
                <button
                  onClick={onMarkAllAsRead}
                  className="flex-1 rounded-md px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                >
                  <Check className="inline h-3 w-3 mr-1" />
                  Mark all read
                </button>
              )}
              <button
                onClick={onClearAll}
                className="flex-1 rounded-md px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                <X className="inline h-3 w-3 mr-1" />
                Clear all
              </button>
            </div>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Notification List */}
        {hasNotifications ? (
          <div className="max-h-64 overflow-y-auto">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                onClick={() => {
                  if (!notification.read && onMarkAsRead) {
                    onMarkAsRead(notification.id);
                  }
                  if (onNotificationClick) {
                    onNotificationClick(notification);
                  }
                }}
                className={`cursor-pointer flex flex-col items-start gap-1 p-3 ${
                  !notification.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                }`}
              >
                <div className="flex w-full items-start justify-between gap-2">
                  <span
                    className={`text-sm font-medium ${getNotificationColor(notification.type)}`}
                  >
                    {notification.title}
                  </span>
                  {!notification.read && (
                    <span className="h-2 w-2 flex-shrink-0 rounded-full bg-blue-600" />
                  )}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                  {notification.message}
                </p>
                <span className="text-xs text-gray-500 dark:text-gray-500">
                  {formatTimestamp(notification.timestamp)}
                </span>
              </DropdownMenuItem>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 px-4">
            <Bell className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No notifications
            </p>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default HeaderNotifications;
