import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * HeaderLogo Component Props
 */
export interface HeaderLogoProps {
  // Custom logo image URL
  logo?: string;

  // Module name to display
  moduleName?: string;

  // Custom click handler (overrides default navigation)
  onClick?: () => void;

  // Whether to show the module name text
  showModuleName?: boolean;
}

/**
 * HeaderLogo Component
 *
 * Displays the application/module branding in the header.
 * Features:
 * - Clickable logo that navigates to dashboard
 * - Responsive sizing
 * - Accessible with proper ARIA labels
 * - Optional custom logo image
 */
const HeaderLogo: React.FC<HeaderLogoProps> = ({
  logo,
  moduleName = 'Agentic Campaign Manager',
  onClick,
  showModuleName = true,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate('/');
    }
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-3 transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md"
      aria-label={`${moduleName} - Go to dashboard`}
    >
      {/* Logo Image */}
      {logo && (
        <img
          src={logo}
          alt={`${moduleName} logo`}
          className="h-8 w-auto"
        />
      )}

      {/* Fallback Icon when no logo is provided */}
      {!logo && (
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 text-white font-bold text-sm">
          M
        </div>
      )}

      {/* Module Name */}
      {showModuleName && (
        <span className="text-lg font-semibold text-gray-900 dark:text-white truncate max-w-[200px] md:max-w-none">
          {moduleName}
        </span>
      )}
    </button>
  );
};

export default HeaderLogo;
