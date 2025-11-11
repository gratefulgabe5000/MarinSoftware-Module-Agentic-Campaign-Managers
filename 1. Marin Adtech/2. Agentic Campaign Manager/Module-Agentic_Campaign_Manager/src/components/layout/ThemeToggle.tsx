import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

/**
 * ThemeToggle Component Props
 */
export interface ThemeToggleProps {
  // Custom theme change handler
  onThemeChange?: (theme: 'light' | 'dark') => void;

  // Controlled theme (if managed by parent/ADE)
  theme?: 'light' | 'dark';
}

/**
 * ThemeToggle Component
 *
 * Toggle button to switch between light and dark themes.
 * Features:
 * - System preference detection
 * - LocalStorage persistence
 * - Smooth transition animation
 * - Keyboard accessible
 * - Can be controlled by parent (for ADE integration)
 */
const ThemeToggle: React.FC<ThemeToggleProps> = ({ onThemeChange, theme: controlledTheme }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Apply theme to document
  const applyTheme = (newTheme: 'light' | 'dark') => {
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    if (controlledTheme) {
      // eslint-disable-next-line
      setTheme(controlledTheme);
      return;
    }

    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';

    const initialTheme = savedTheme || systemTheme;
    // eslint-disable-next-line
    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, [controlledTheme]);

  // Toggle theme
  const toggleTheme = () => {
    if (controlledTheme) {
      // If controlled, use callback
      const newTheme = controlledTheme === 'light' ? 'dark' : 'light';
      onThemeChange?.(newTheme);
      return;
    }

    // Otherwise, manage internally
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);

    // Call callback if provided
    onThemeChange?.(newTheme);
  };

  const currentTheme = controlledTheme || theme;

  return (
    <button
      onClick={toggleTheme}
      className="rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
      aria-label={`Switch to ${currentTheme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${currentTheme === 'light' ? 'dark' : 'light'} mode`}
    >
      {currentTheme === 'light' ? (
        <Moon className="h-5 w-5" aria-hidden="true" />
      ) : (
        <Sun className="h-5 w-5" aria-hidden="true" />
      )}
    </button>
  );
};

export default ThemeToggle;
