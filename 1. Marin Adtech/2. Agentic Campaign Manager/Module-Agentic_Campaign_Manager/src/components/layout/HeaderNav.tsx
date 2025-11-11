import React from 'react';
import { NavLink } from 'react-router-dom';
import { LucideIcon, FolderKanban } from 'lucide-react';

/**
 * Navigation Item Interface
 */
export interface NavItem {
  label: string;
  path: string;
  icon?: LucideIcon;
  badge?: number;
  disabled?: boolean;
}

/**
 * HeaderNav Component Props
 */
export interface HeaderNavProps {
  // Custom navigation items (optional)
  items?: NavItem[];

  // Whether to show icons
  showIcons?: boolean;

  // Custom className for styling
  className?: string;
}

/**
 * Default Navigation Items
 */
const defaultNavItems: NavItem[] = [
  {
    label: 'Campaigns',
    path: '/campaigns',
    icon: FolderKanban,
  },
];

/**
 * HeaderNav Component
 *
 * Primary navigation component for the header.
 * Features:
 * - React Router integration with active link highlighting
 * - Keyboard accessible
 * - Responsive design
 * - Optional icons and badges
 * - Disabled state support
 */
const HeaderNav: React.FC<HeaderNavProps> = ({
  items = defaultNavItems,
  showIcons = false,
  className = '',
}) => {
  return (
    <nav className={`flex items-center gap-6 ${className}`} aria-label="Primary navigation">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/' || item.path === '/campaigns'}
            className={({ isActive }: { isActive: boolean }) =>
              `relative flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors
              ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
              }
              ${item.disabled ? 'pointer-events-none opacity-50' : ''}
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md`
            }
            aria-disabled={item.disabled}
          >
            {({ isActive }: { isActive: boolean }) => (
              <>
                {/* Icon */}
                {showIcons && Icon && (
                  <Icon className="h-5 w-5" aria-hidden="true" />
                )}

                {/* Label */}
                <span>{item.label}</span>

                {/* Badge */}
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className="ml-1 rounded-full bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white"
                    aria-label={`${item.badge} notifications`}
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}

                {/* Active Indicator */}
                {isActive && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
                    aria-hidden="true"
                  />
                )}
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
};

export default HeaderNav;
