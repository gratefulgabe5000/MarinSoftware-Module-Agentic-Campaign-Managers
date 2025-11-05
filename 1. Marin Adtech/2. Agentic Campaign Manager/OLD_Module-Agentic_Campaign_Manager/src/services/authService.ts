import axios from 'axios';

const API_BASE_URL = 
  typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL
    ? import.meta.env.VITE_API_BASE_URL
    : 'http://localhost:3001/api';

/**
 * Platform Connection Status
 */
export interface ConnectionStatus {
  platform: string;
  connected: boolean;
  hasToken: boolean;
  tokenExpired: boolean;
}

/**
 * Auth Service
 * Handles OAuth authentication flow
 */
class AuthService {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Get authorization URL for platform
   */
  async getAuthorizationUrl(platform: 'google' | 'meta' | 'microsoft', redirectUri?: string): Promise<string> {
    try {
      const response = await axios.get<{ authUrl: string }>(
        `${this.baseURL}/auth/${platform}/authorize`,
        {
          params: redirectUri ? { redirect_uri: redirectUri } : {},
          timeout: 10000,
        }
      );

      return response.data.authUrl;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(
            error.response.data?.error?.message ||
              `Server error: ${error.response.status}`
          );
        } else if (error.request) {
          throw new Error('Network error: Could not connect to server');
        }
      }
      throw new Error('Failed to get authorization URL');
    }
  }

  /**
   * Initiate OAuth flow
   */
  async initiateOAuthFlow(platform: 'google' | 'meta' | 'microsoft', redirectUri?: string): Promise<void> {
    try {
      const authUrl = await this.getAuthorizationUrl(platform, redirectUri);
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error initiating OAuth flow:', error);
      throw error;
    }
  }

  /**
   * Get connection status
   */
  async getConnectionStatus(platform: 'google' | 'meta' | 'microsoft'): Promise<ConnectionStatus> {
    try {
      const response = await axios.get<ConnectionStatus>(
        `${this.baseURL}/auth/status`,
        {
          params: { platform },
          timeout: 10000,
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(
            error.response.data?.error?.message ||
              `Server error: ${error.response.status}`
          );
        } else if (error.request) {
          throw new Error('Network error: Could not connect to server');
        }
      }
      throw new Error('Failed to get connection status');
    }
  }

  /**
   * Get all connection statuses
   */
  async getAllConnectionStatuses(): Promise<ConnectionStatus[]> {
    try {
      const platforms: ('google' | 'meta' | 'microsoft')[] = ['google', 'meta', 'microsoft'];
      const statuses = await Promise.all(
        platforms.map((platform) => this.getConnectionStatus(platform))
      );
      return statuses;
    } catch (error) {
      console.error('Error getting all connection statuses:', error);
      return [];
    }
  }
}

// Export singleton instance
export const authService = new AuthService();

// Export class for testing
export default AuthService;

