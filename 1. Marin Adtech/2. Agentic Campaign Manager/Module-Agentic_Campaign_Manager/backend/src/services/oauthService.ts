import crypto from 'crypto';
import axios from 'axios';
import config from '../config/env';

/**
 * OAuth Token Interface
 */
export interface OAuthToken {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  tokenType?: string;
  scope?: string[];
}

/**
 * OAuth State Interface
 */
export interface OAuthState {
  state: string;
  platform: string;
  redirectUri: string;
  createdAt: Date;
  expiresAt: Date;
}

/**
 * OAuth Service
 * Handles OAuth 2.0 authorization flow for platform integrations
 */
class OAuthService {
  private states: Map<string, OAuthState>;
  private tokens: Map<string, OAuthToken>;
  private stateExpiration: number = 10 * 60 * 1000; // 10 minutes

  constructor() {
    this.states = new Map();
    this.tokens = new Map();
  }

  /**
   * Generate authorization URL for Google Ads
   */
  generateGoogleAuthUrl(redirectUri: string): string {
    const state = this.generateState('google', redirectUri);
    const clientId = config.googleAdsClientId || 'YOUR_GOOGLE_ADS_CLIENT_ID';
    const scope = 'https://www.googleapis.com/auth/adwords';
    
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scope,
      access_type: 'offline',
      prompt: 'consent',
      state: state,
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  /**
   * Generate authorization URL for Meta Ads
   */
  generateMetaAuthUrl(redirectUri: string): string {
    const state = this.generateState('meta', redirectUri);
    const appId = config.metaAppId || 'YOUR_META_APP_ID';
    const scope = 'ads_management,ads_read';
    
    const params = new URLSearchParams({
      client_id: appId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scope,
      state: state,
    });

    return `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;
  }

  /**
   * Generate authorization URL for Microsoft Ads
   */
  generateMicrosoftAuthUrl(redirectUri: string): string {
    const state = this.generateState('microsoft', redirectUri);
    const clientId = config.microsoftAdsClientId || 'YOUR_MICROSOFT_ADS_CLIENT_ID';
    const scope = 'https://ads.microsoft.com/ads.manage offline_access';
    
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scope,
      state: state,
    });

    return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token (Google Ads)
   */
  async exchangeGoogleCode(code: string, redirectUri: string): Promise<OAuthToken> {
    const clientId = config.googleAdsClientId || 'YOUR_GOOGLE_ADS_CLIENT_ID';
    const clientSecret = config.googleAdsClientSecret || 'YOUR_GOOGLE_ADS_CLIENT_SECRET';

    try {
      const response = await axios.post(
        'https://oauth2.googleapis.com/token',
        {
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      const data = response.data as any;
      const token: OAuthToken = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: data.expires_in
          ? new Date(Date.now() + data.expires_in * 1000)
          : undefined,
        tokenType: data.token_type || 'Bearer',
        scope: data.scope ? data.scope.split(' ') : [],
      };

      return token;
    } catch (error) {
      console.error('Error exchanging Google code:', error);
      throw new Error('Failed to exchange authorization code for access token');
    }
  }

  /**
   * Exchange authorization code for access token (Meta Ads)
   */
  async exchangeMetaCode(code: string, redirectUri: string): Promise<OAuthToken> {
    const appId = config.metaAppId || 'YOUR_META_APP_ID';
    const appSecret = config.metaAppSecret || 'YOUR_META_APP_SECRET';

    try {
      const response = await axios.get(
        'https://graph.facebook.com/v18.0/oauth/access_token',
        {
          params: {
            client_id: appId,
            client_secret: appSecret,
            redirect_uri: redirectUri,
            code,
          },
        }
      );

      const data = response.data as any;
      const token: OAuthToken = {
        accessToken: data.access_token,
        expiresAt: data.expires_in
          ? new Date(Date.now() + data.expires_in * 1000)
          : undefined,
        tokenType: 'Bearer',
      };

      return token;
    } catch (error) {
      console.error('Error exchanging Meta code:', error);
      throw new Error('Failed to exchange authorization code for access token');
    }
  }

  /**
   * Exchange authorization code for access token (Microsoft Ads)
   */
  async exchangeMicrosoftCode(code: string, redirectUri: string): Promise<OAuthToken> {
    const clientId = config.microsoftAdsClientId || 'YOUR_MICROSOFT_ADS_CLIENT_ID';
    const clientSecret = config.microsoftAdsClientSecret || 'YOUR_MICROSOFT_ADS_CLIENT_SECRET';

    try {
      const response = await axios.post(
        'https://login.microsoftonline.com/common/oauth2/v2.0/token',
        {
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      const data = response.data as any;
      const token: OAuthToken = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: data.expires_in
          ? new Date(Date.now() + data.expires_in * 1000)
          : undefined,
        tokenType: data.token_type || 'Bearer',
        scope: data.scope ? data.scope.split(' ') : [],
      };

      return token;
    } catch (error) {
      console.error('Error exchanging Microsoft code:', error);
      throw new Error('Failed to exchange authorization code for access token');
    }
  }

  /**
   * Refresh access token (Google Ads)
   */
  async refreshGoogleToken(refreshToken: string): Promise<OAuthToken> {
    const clientId = config.googleAdsClientId || 'YOUR_GOOGLE_ADS_CLIENT_ID';
    const clientSecret = config.googleAdsClientSecret || 'YOUR_GOOGLE_ADS_CLIENT_SECRET';

    try {
      const response = await axios.post(
        'https://oauth2.googleapis.com/token',
        {
          refresh_token: refreshToken,
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'refresh_token',
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      const data = response.data as any;
      const token: OAuthToken = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token || refreshToken,
        expiresAt: data.expires_in
          ? new Date(Date.now() + data.expires_in * 1000)
          : undefined,
        tokenType: data.token_type || 'Bearer',
      };

      return token;
    } catch (error) {
      console.error('Error refreshing Google token:', error);
      throw new Error('Failed to refresh access token');
    }
  }

  /**
   * Generate state parameter for OAuth flow
   */
  private generateState(platform: string, redirectUri: string): string {
    const state = crypto.randomBytes(32).toString('hex');
    const oauthState: OAuthState = {
      state,
      platform,
      redirectUri,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + this.stateExpiration),
    };

    this.states.set(state, oauthState);
    return state;
  }

  /**
   * Validate state parameter
   */
  validateState(state: string): OAuthState | null {
    const oauthState = this.states.get(state);
    if (!oauthState) {
      return null;
    }

    if (oauthState.expiresAt < new Date()) {
      this.states.delete(state);
      return null;
    }

    return oauthState;
  }

  /**
   * Store token
   */
  storeToken(platform: string, token: OAuthToken): void {
    this.tokens.set(platform, token);
  }

  /**
   * Get token
   */
  getToken(platform: string): OAuthToken | null {
    return this.tokens.get(platform) || null;
  }

  /**
<<<<<<< HEAD
   * Remove token
   */
  removeToken(platform: string): void {
    this.tokens.delete(platform);
  }

  /**
=======
>>>>>>> c75a29246aa4d3b02efa0ae3553d6040d682d314
   * Check if token is expired
   */
  isTokenExpired(token: OAuthToken): boolean {
    if (!token.expiresAt) {
      return false;
    }
    return token.expiresAt < new Date();
  }

  /**
   * Clean up expired states
   */
  cleanupExpiredStates(): void {
    const now = new Date();
    for (const [state, oauthState] of this.states.entries()) {
      if (oauthState.expiresAt < now) {
        this.states.delete(state);
      }
    }
  }
}

// Export singleton instance
export const oauthService = new OAuthService();

// Clean up expired states every 5 minutes
setInterval(() => {
  oauthService.cleanupExpiredStates();
}, 5 * 60 * 1000);

// Export class for testing
export default OAuthService;

