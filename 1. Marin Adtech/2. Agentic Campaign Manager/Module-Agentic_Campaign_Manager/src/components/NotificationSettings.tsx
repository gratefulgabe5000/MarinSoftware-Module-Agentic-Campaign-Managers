import React, { useEffect, useState } from 'react';
import { notificationService, NotificationPermission } from '../services/notificationService';

/**
 * NotificationSettings Component Props
 */
interface NotificationSettingsProps {
  onPermissionChange?: (permission: NotificationPermission) => void;
}

/**
 * NotificationSettings Component
 * Manages notification preferences and permissions
 */
const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  onPermissionChange,
}) => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check support and permission on mount
    setIsSupported(notificationService.isNotificationsSupported());
    setPermission(notificationService.getPermission());
  }, []);

  /**
   * Handle permission request
   */
  const handleRequestPermission = async () => {
    setIsRequesting(true);
    setError(null);

    try {
      const newPermission = await notificationService.requestPermission();
      setPermission(newPermission);

      if (onPermissionChange) {
        onPermissionChange(newPermission);
      }

      if (newPermission === 'denied') {
        setError('Notification permission was denied. Please enable it in your browser settings.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request notification permission');
    } finally {
      setIsRequesting(false);
    }
  };

  /**
   * Get permission status text
   */
  const getPermissionStatusText = (): string => {
    switch (permission) {
      case 'granted':
        return 'Notifications are enabled';
      case 'denied':
        return 'Notifications are disabled';
      case 'default':
        return 'Notification permission not requested';
      default:
        return 'Unknown permission status';
    }
  };

  /**
   * Get permission status class
   */
  const getPermissionStatusClass = (): string => {
    switch (permission) {
      case 'granted':
        return 'permission-granted';
      case 'denied':
        return 'permission-denied';
      case 'default':
        return 'permission-default';
      default:
        return 'permission-unknown';
    }
  };

  if (!isSupported) {
    return (
      <div className="notification-settings">
        <div className="notification-warning">
          <span>⚠️ Notifications are not supported in this browser</span>
        </div>
      </div>
    );
  }

  return (
    <div className="notification-settings">
      <div className="notification-header">
        <h3>Browser Notifications</h3>
        <p className="notification-description">
          Get notified when campaign status changes
        </p>
      </div>

      <div className="notification-content">
        <div className={`permission-status ${getPermissionStatusClass()}`}>
          <span className="permission-text">{getPermissionStatusText()}</span>
        </div>

        {error && (
          <div className="notification-error">
            <span>⚠️ {error}</span>
          </div>
        )}

        {permission !== 'granted' && (
          <button
            className="request-permission-btn"
            onClick={handleRequestPermission}
            disabled={isRequesting || permission === 'denied'}
          >
            {isRequesting
              ? 'Requesting Permission...'
              : permission === 'denied'
              ? 'Permission Denied (Enable in Browser Settings)'
              : 'Enable Notifications'}
          </button>
        )}

        {permission === 'granted' && (
          <div className="notification-success">
            <span>✅ Notifications are enabled</span>
            <p className="notification-hint">
              You will receive notifications when campaign status changes.
            </p>
          </div>
        )}

        {permission === 'denied' && (
          <div className="notification-help">
            <p>
              To enable notifications, please:
            </p>
            <ol>
              <li>Click the lock/info icon in your browser's address bar</li>
              <li>Find "Notifications" in the site settings</li>
              <li>Change the setting to "Allow"</li>
              <li>Refresh this page</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationSettings;

