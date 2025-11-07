import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header, { HeaderProps } from './Header';
import { useUserStore } from '../../store/userStore';
import { useNotificationStore } from '../../store/notificationStore';

/**
 * ConnectedHeader Component
 *
 * Wrapper component that connects the Header to the application stores.
 * This component handles all state management and provides callbacks
 * to the presentational Header component.
 */
const ConnectedHeader: React.FC<Omit<HeaderProps, 'user' | 'notifications' | 'unreadCount'>> = (
  props
) => {
  const navigate = useNavigate();

  // User state from store
  const user = useUserStore((state) => state.user);
  const logout = useUserStore((state) => state.logout);

  // Notification state from store
  const notifications = useNotificationStore((state) => state.notifications);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);
  const clearAll = useNotificationStore((state) => state.clearAll);

  // Navigation handlers
  const handleLogoClick = () => {
    navigate('/');
  };

  const handleSettingsClick = () => {
    navigate('/settings');
    // Or open settings modal
  };

  const handlePreferencesClick = () => {
    navigate('/preferences');
    // Or open preferences modal
  };

  const handleHelpClick = () => {
    // Navigate to help page or open help modal
    window.open('https://docs.marinsoftware.com/agentic-campaign-manager', '_blank');
  };

  const handleLogout = () => {
    logout();
    // Optionally redirect to login page
    // navigate('/login');
  };

  const handleNotificationClick = (notification: any) => {
    // Navigate to the action URL if available
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  return (
    <Header
      {...props}
      user={user || undefined}
      notifications={notifications}
      unreadCount={unreadCount}
      onLogoClick={handleLogoClick}
      onSettingsClick={handleSettingsClick}
      onPreferencesClick={handlePreferencesClick}
      onHelpClick={handleHelpClick}
      onLogout={handleLogout}
      onNotificationClick={handleNotificationClick}
      onMarkAsRead={markAsRead}
      onMarkAllAsRead={markAllAsRead}
      onClearAllNotifications={clearAll}
    />
  );
};

export default ConnectedHeader;
