/**
 * API Mode Helper
 * Utility functions for reading API mode preference
 */

export type ApiMode = 'zilkr' | 'direct';

/**
 * Get current API mode from localStorage
 * @returns 'zilkr' or 'direct'
 */
export const getApiMode = (): ApiMode => {
  try {
    const stored = localStorage.getItem('api_mode_preference');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.state?.useZilkrDispatcher ? 'zilkr' : 'direct';
    }
  } catch (error) {
    console.error('Error reading API mode preference:', error);
  }
  return 'direct'; // Default to direct Google Ads API
};

/**
 * Check if Zilkr Dispatcher is enabled
 * @returns true if Zilkr mode is active
 */
export const isZilkrMode = (): boolean => {
  return getApiMode() === 'zilkr';
};

