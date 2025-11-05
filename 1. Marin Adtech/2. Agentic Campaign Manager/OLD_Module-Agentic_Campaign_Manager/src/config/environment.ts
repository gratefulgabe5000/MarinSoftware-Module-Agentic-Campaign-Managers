/**
 * Environment Configuration
 * Handles environment variables in a way that's compatible with both Vite and Jest
 */

// Get API base URL from environment
function getViteEnv(): Record<string, string> {
  // Try to access import.meta.env if in browser context
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const metadata = (globalThis as any).import?.meta?.env;
    if (metadata) {
      return metadata;
    }
  } catch {
    // If import.meta is not available, return empty object
  }
  return {};
}

export const getApiBaseUrl = (apiName: string = ''): string => {
  // In Node/Jest environment or if no window
  if (typeof window === 'undefined') {
    return process.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
  }

  // In Browser/Vite environment
  const viteEnv = getViteEnv();
  const envUrl = viteEnv[`VITE_${apiName}API_BASE_URL`] ||
                 viteEnv.VITE_API_BASE_URL;
  if (envUrl) {
    return envUrl;
  }

  return 'http://localhost:3001/api';
};
