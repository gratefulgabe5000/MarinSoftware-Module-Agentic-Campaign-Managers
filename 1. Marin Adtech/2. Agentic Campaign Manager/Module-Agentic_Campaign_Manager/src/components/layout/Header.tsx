import React, { useState } from 'react';
import { ADEContext } from '../../types/ade.types';
import HeaderLogo from './HeaderLogo';
import HeaderNav, { NavItem } from './HeaderNav';
import MobileNav from './MobileNav';
import HeaderUserMenu, { UserProfile } from './HeaderUserMenu';
import HeaderNotifications, { Notification } from './HeaderNotifications';
import ThemeToggle from './ThemeToggle';

/**
 * Header Component Props
 */
export interface HeaderProps {
  // ADE context (optional)
  adeContext?: ADEContext;

  // Custom branding (optional)
  logo?: string;
  moduleName?: string;

  // Custom navigation items
  navItems?: NavItem[];

  // User profile
  user?: UserProfile;

  // Notifications
  notifications?: Notification[];
  unreadCount?: number;

  // Theme
  theme?: 'light' | 'dark';

  // Feature flags
  showSearch?: boolean;
  showNotifications?: boolean;
  showThemeToggle?: boolean;

  // Callbacks
  onLogoClick?: () => void;
  onThemeChange?: (theme: 'light' | 'dark') => void;
  onSettingsClick?: () => void;
  onPreferencesClick?: () => void;
  onHelpClick?: () => void;
  onLogout?: () => void;
  onNotificationClick?: (notification: Notification) => void;
  onMarkAsRead?: (notificationId: string) => void;
  onMarkAllAsRead?: () => void;
  onClearAllNotifications?: () => void;
}

/**
 * Global Application Header Component
 *
 * Provides consistent navigation, branding, and user context across all screens.
 * Features:
 * - Responsive design (mobile/tablet/desktop)
 * - Sticky positioning
 * - Theme support (light/dark)
 * - Accessible keyboard navigation
 * - ADE framework integration
 *
 * Responsive Breakpoints:
 * - Mobile (<768px): Hamburger menu, logo only
 * - Tablet (768px-1023px): Compact navigation
 * - Desktop (≥1024px): Full navigation with all features
 */
const Header: React.FC<HeaderProps> = ({
  logo,
  moduleName = 'Agentic Campaign Manager',
  navItems,
  user,
  notifications,
  unreadCount,
  theme,
  showSearch = false,
  showNotifications = true,
  showThemeToggle = true,
  onLogoClick,
  onSettingsClick,
  onPreferencesClick,
  onHelpClick,
  onLogout,
  onNotificationClick,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAllNotifications,
  onThemeChange,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-[1000] w-full border-b border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900"
      role="banner"
    >
      {/* Desktop & Tablet Layout */}
      <div className="flex h-16 items-center justify-between px-6 md:px-4 lg:h-16 md:h-14">
        {/* Left Section: Branding & Navigation */}
        <div className="flex items-center gap-12 lg:gap-12 md:gap-8">
          {/* Logo */}
          <HeaderLogo
            logo={logo}
            moduleName={moduleName}
            onClick={onLogoClick}
            showModuleName={true}
          />

          {/* Desktop Navigation - Hidden on mobile */}
          <div className="hidden md:block">
            <HeaderNav items={navItems} showIcons={false} />
          </div>
        </div>

        {/* Right Section: Utilities */}
        <div className="flex items-center gap-4">
          {/* Search - Desktop only (Phase 2) */}
          {showSearch && (
            <div className="hidden lg:block">
              {/* Search component will be added in Phase 2 */}
            </div>
          )}

          {/* Notifications - Desktop & Tablet */}
          {showNotifications && (
            <div className="hidden md:block">
              <HeaderNotifications
                notifications={notifications}
                unreadCount={unreadCount}
                onNotificationClick={onNotificationClick}
                onMarkAsRead={onMarkAsRead}
                onMarkAllAsRead={onMarkAllAsRead}
                onClearAll={onClearAllNotifications}
              />
            </div>
          )}

          {/* Theme Toggle - Desktop & Tablet */}
          {showThemeToggle && (
            <div className="hidden md:block">
              <ThemeToggle theme={theme} onThemeChange={onThemeChange} />
            </div>
          )}

          {/* User Menu - Desktop & Tablet */}
          <div className="hidden md:block">
            <HeaderUserMenu
              user={user}
              onSettingsClick={onSettingsClick}
              onPreferencesClick={onPreferencesClick}
              onHelpClick={onHelpClick}
              onLogout={onLogout}
            />
          </div>

          {/* Mobile Menu Toggle - Mobile only */}
          <div className="md:hidden">
            <MobileNav
              isOpen={mobileMenuOpen}
              onToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
              items={navItems}
              moduleName={moduleName}
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
