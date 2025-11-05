import axios from 'axios';
import { oauthService } from '../../services/oauthService';
import config from '../../config/env';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock config
jest.mock('../../config/env', () => ({
  googleAdsClientId: 'test-google-client-id',
  googleAdsClientSecret: 'test-google-client-secret',
  metaAppId: 'test-meta-app-id',
  metaAppSecret: 'test-meta-app-secret',
  microsoftAdsClientId: 'test-microsoft-client-id',
  microsoftAdsClientSecret: 'test-microsoft-client-secret',
  corsOrigin: 'http://localhost:3000',
}));

describe('OAuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateGoogleAuthUrl', () => {
    it('should generate Google authorization URL', () => {
      const redirectUri = 'http://localhost:3000/callback';
      const authUrl = oauthService.generateGoogleAuthUrl(redirectUri);

      expect(authUrl).toContain('accounts.google.com');
      expect(authUrl).toContain('oauth2');
      expect(authUrl).toContain('client_id');
      expect(authUrl).toContain('redirect_uri');
      expect(authUrl).toContain('response_type=code');
      expect(authUrl).toContain('state');
    });
  });

  describe('generateMetaAuthUrl', () => {
    it('should generate Meta authorization URL', () => {
      const redirectUri = 'http://localhost:3000/callback';
      const authUrl = oauthService.generateMetaAuthUrl(redirectUri);

      expect(authUrl).toContain('facebook.com');
      expect(authUrl).toContain('dialog/oauth');
      expect(authUrl).toContain('client_id');
      expect(authUrl).toContain('redirect_uri');
      expect(authUrl).toContain('response_type=code');
      expect(authUrl).toContain('state');
    });
  });

  describe('generateMicrosoftAuthUrl', () => {
    it('should generate Microsoft authorization URL', () => {
      const redirectUri = 'http://localhost:3000/callback';
      const authUrl = oauthService.generateMicrosoftAuthUrl(redirectUri);

      expect(authUrl).toContain('login.microsoftonline.com');
      expect(authUrl).toContain('oauth2');
      expect(authUrl).toContain('client_id');
      expect(authUrl).toContain('redirect_uri');
      expect(authUrl).toContain('response_type=code');
      expect(authUrl).toContain('state');
    });
  });

  describe('exchangeGoogleCode', () => {
    it('should exchange authorization code for access token', async () => {
      const mockResponse = {
        data: {
          access_token: 'test-access-token',
          refresh_token: 'test-refresh-token',
          expires_in: 3600,
          token_type: 'Bearer',
          scope: 'https://www.googleapis.com/auth/adwords',
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      };

      mockedAxios.post.mockResolvedValue(mockResponse as any);

      const token = await oauthService.exchangeGoogleCode('test-code', 'http://localhost:3000/callback');

      expect(token.accessToken).toBe('test-access-token');
      expect(token.refreshToken).toBe('test-refresh-token');
      expect(token.tokenType).toBe('Bearer');
      expect(token.expiresAt).toBeDefined();
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://oauth2.googleapis.com/token',
        expect.any(Object),
        expect.any(Object)
      );
    });

    it('should handle errors', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Token exchange failed'));

      await expect(
        oauthService.exchangeGoogleCode('test-code', 'http://localhost:3000/callback')
      ).rejects.toThrow('Failed to exchange authorization code for access token');
    });
  });

  describe('exchangeMetaCode', () => {
    it('should exchange authorization code for access token', async () => {
      const mockResponse = {
        data: {
          access_token: 'test-access-token',
          expires_in: 3600,
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      };

      mockedAxios.get.mockResolvedValue(mockResponse as any);

      const token = await oauthService.exchangeMetaCode('test-code', 'http://localhost:3000/callback');

      expect(token.accessToken).toBe('test-access-token');
      expect(token.tokenType).toBe('Bearer');
      expect(token.expiresAt).toBeDefined();
    });
  });

  describe('exchangeMicrosoftCode', () => {
    it('should exchange authorization code for access token', async () => {
      const mockResponse = {
        data: {
          access_token: 'test-access-token',
          refresh_token: 'test-refresh-token',
          expires_in: 3600,
          token_type: 'Bearer',
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      };

      mockedAxios.post.mockResolvedValue(mockResponse as any);

      const token = await oauthService.exchangeMicrosoftCode('test-code', 'http://localhost:3000/callback');

      expect(token.accessToken).toBe('test-access-token');
      expect(token.refreshToken).toBe('test-refresh-token');
      expect(token.tokenType).toBe('Bearer');
    });
  });

  describe('refreshGoogleToken', () => {
    it('should refresh access token', async () => {
      const mockResponse = {
        data: {
          access_token: 'new-access-token',
          expires_in: 3600,
          token_type: 'Bearer',
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      };

      mockedAxios.post.mockResolvedValue(mockResponse as any);

      const token = await oauthService.refreshGoogleToken('test-refresh-token');

      expect(token.accessToken).toBe('new-access-token');
      expect(token.tokenType).toBe('Bearer');
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://oauth2.googleapis.com/token',
        expect.any(Object),
        expect.any(Object)
      );
    });
  });

  describe('validateState', () => {
    it('should validate state parameter', () => {
      const redirectUri = 'http://localhost:3000/callback';
      const state = oauthService.generateGoogleAuthUrl(redirectUri).split('state=')[1]?.split('&')[0];

      if (state) {
        const oauthState = oauthService.validateState(state);
        expect(oauthState).toBeDefined();
        expect(oauthState?.platform).toBe('google');
      }
    });

    it('should return null for invalid state', () => {
      const oauthState = oauthService.validateState('invalid-state');
      expect(oauthState).toBeNull();
    });
  });

  describe('storeToken and getToken', () => {
    it('should store and retrieve token', () => {
      const token = {
        accessToken: 'test-token',
        tokenType: 'Bearer',
      };

      oauthService.storeToken('google', token);
      const retrievedToken = oauthService.getToken('google');

      expect(retrievedToken).toEqual(token);
    });

    it('should return null for non-existent token', () => {
      const token = oauthService.getToken('nonexistent');
      expect(token).toBeNull();
    });
  });

  describe('isTokenExpired', () => {
    it('should return true for expired token', () => {
      const expiredToken = {
        accessToken: 'test-token',
        expiresAt: new Date(Date.now() - 1000),
      };

      expect(oauthService.isTokenExpired(expiredToken)).toBe(true);
    });

    it('should return false for valid token', () => {
      const validToken = {
        accessToken: 'test-token',
        expiresAt: new Date(Date.now() + 3600000),
      };

      expect(oauthService.isTokenExpired(validToken)).toBe(false);
    });

    it('should return false for token without expiration', () => {
      const tokenWithoutExpiration = {
        accessToken: 'test-token',
      };

      expect(oauthService.isTokenExpired(tokenWithoutExpiration)).toBe(false);
    });
  });
});

