import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { NavItem } from './HeaderNav';

/**
 * MobileNav Component Props
 */
export interface MobileNavProps {
  // Whether the menu is open
  isOpen: boolean;

  // Callback to toggle menu
  onToggle: () => void;

  // Navigation items
  items?: NavItem[];

  // Module name
  moduleName?: string;
}

/**
 * Default Navigation Items (same as HeaderNav)
 */
const defaultNavItems: NavItem[] = [
  {
    label: 'Campaigns',
    path: '/campaigns',
  },
  {
    label: 'Create Campaign',
    path: '/create',
  },
];

/**
 * MobileNav Component
 *
 * Mobile navigation menu with hamburger trigger and full-screen overlay.
 * Features:
 * - Hamburger menu icon
 * - Full-screen overlay (except header)
 * - Slide-in animation from right
 * - Backdrop blur effect
 * - Keyboard accessible (Escape to close)
 * - Focus trap when open
 * - Prevents body scroll when open
 */
const MobileNav: React.FC<MobileNavProps> = ({
  isOpen,
  onToggle,
  items = defaultNavItems,
  moduleName = 'Navigation',
}) => {
  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle Escape key to close menu
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onToggle();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onToggle]);

  return (
    <>
      {/* Hamburger Menu Button */}
      <button
        onClick={onToggle}
        className="rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label="Toggle navigation menu"
        aria-expanded={isOpen}
        aria-controls="mobile-menu"
      >
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 top-16 z-[999] bg-black/20 backdrop-blur-sm"
            onClick={onToggle}
            aria-hidden="true"
          />

          {/* Menu Panel */}
          <div
            id="mobile-menu"
            className="fixed right-0 top-16 z-[1000] h-[calc(100vh-4rem)] w-full max-w-sm animate-in slide-in-from-right duration-300 overflow-y-auto bg-white shadow-xl dark:bg-gray-900 md:hidden"
            role="dialog"
            aria-modal="true"
            aria-label={`${moduleName} menu`}
          >
            {/* Close Button */}
            <div className="flex justify-end border-b border-gray-200 p-4 dark:border-gray-800">
              <button
                onClick={onToggle}
                className="rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Close menu"
              >
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex flex-col p-4" aria-label="Mobile navigation">
              {items.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/' || item.path === '/campaigns'}
                    onClick={onToggle}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-md px-4 py-3 text-base font-medium transition-colors
                      ${
                        isActive
                          ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                          : 'text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800'
                      }
                      ${item.disabled ? 'pointer-events-none opacity-50' : ''}
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset`
                    }
                    aria-current={({ isActive }) => (isActive ? 'page' : undefined)}
                    aria-disabled={item.disabled}
                  >
                    {/* Icon */}
                    {Icon && (
                      <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                    )}

                    {/* Label */}
                    <span className="flex-1">{item.label}</span>

                    {/* Badge */}
                    {item.badge !== undefined && item.badge > 0 && (
                      <span
                        className="rounded-full bg-blue-600 px-2 py-1 text-xs font-semibold text-white"
                        aria-label={`${item.badge} notifications`}
                      >
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>

            {/* Divider */}
            <div className="border-t border-gray-200 dark:border-gray-800" />

            {/* Additional Mobile Menu Items */}
            <div className="flex flex-col p-4">
              {/* Notifications link (mobile) */}
              <button
                className="flex items-center gap-3 rounded-md px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                onClick={onToggle}
              >
                <span>Notifications</span>
              </button>

              {/* Settings/Profile link (mobile) */}
              <button
                className="flex items-center gap-3 rounded-md px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                onClick={onToggle}
              >
                <span>Profile & Settings</span>
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default MobileNav;
