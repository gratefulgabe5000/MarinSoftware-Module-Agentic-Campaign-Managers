import React from 'react';
import { User, Settings, HelpCircle, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

/**
 * User Profile Interface
 */
export interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
  initials?: string;
}

/**
 * HeaderUserMenu Component Props
 */
export interface HeaderUserMenuProps {
  // User profile data
  user?: UserProfile;

  // Callbacks
  onSettingsClick?: () => void;
  onPreferencesClick?: () => void;
  onHelpClick?: () => void;
  onLogout?: () => void;

  // Loading state
  isLoading?: boolean;
}

/**
 * Generate initials from name
 */
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * HeaderUserMenu Component
 *
 * User profile menu with dropdown containing account actions.
 * Features:
 * - User avatar or initials display
 * - Dropdown menu with account options
 * - Keyboard accessible
 * - Loading state support
 * - Responsive design
 */
const HeaderUserMenu: React.FC<HeaderUserMenuProps> = ({
  user,
  onSettingsClick,
  onPreferencesClick,
  onHelpClick,
  onLogout,
  isLoading = false,
}) => {
  // Default user for development
  const defaultUser: UserProfile = {
    name: 'John Doe',
    email: 'john.doe@marinsoftware.com',
    initials: 'JD',
  };

  const currentUser = user || defaultUser;
  const initials = currentUser.initials || getInitials(currentUser.name);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="User menu"
          disabled={isLoading}
        >
          {/* User Avatar */}
          {currentUser.avatar ? (
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
              {initials}
            </div>
          )}

          {/* Loading Spinner */}
          {isLoading && (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        {/* User Info Header */}
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{currentUser.name}</p>
            <p className="text-xs leading-none text-gray-500 dark:text-gray-400">
              {currentUser.email}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Account Settings */}
        <DropdownMenuItem
          onClick={onSettingsClick}
          className="cursor-pointer"
        >
          <Settings className="mr-2 h-4 w-4" aria-hidden="true" />
          <span>Account Settings</span>
        </DropdownMenuItem>

        {/* Preferences */}
        <DropdownMenuItem
          onClick={onPreferencesClick}
          className="cursor-pointer"
        >
          <User className="mr-2 h-4 w-4" aria-hidden="true" />
          <span>Preferences</span>
        </DropdownMenuItem>

        {/* Help/Documentation */}
        <DropdownMenuItem
          onClick={onHelpClick}
          className="cursor-pointer"
        >
          <HelpCircle className="mr-2 h-4 w-4" aria-hidden="true" />
          <span>Help & Documentation</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Logout */}
        <DropdownMenuItem
          onClick={onLogout}
          className="cursor-pointer text-red-600 focus:text-red-600 dark:text-red-400"
        >
          <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default HeaderUserMenu;
