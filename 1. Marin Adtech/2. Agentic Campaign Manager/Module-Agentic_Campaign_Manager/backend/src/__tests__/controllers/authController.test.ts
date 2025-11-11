import { Request, Response } from 'express';
import { AuthController } from '../../controllers/authController';
import * as oauthServiceModule from '../../services/oauthService';

jest.mock('../../services/oauthService', () => ({
  oauthService: {
    generateGoogleAuthUrl: jest.fn().mockReturnValue('https://accounts.google.com/o/oauth2/auth'),
    generateMetaAuthUrl: jest.fn().mockReturnValue('https://www.facebook.com/v18.0/dialog/oauth'),
    generateMicrosoftAuthUrl: jest.fn().mockReturnValue('https://login.microsoftonline.com/common/oauth2/v2.0/authorize'),
    validateState: jest.fn().mockReturnValue({ redirectUri: 'http://localhost:3000' }),
    exchangeGoogleCode: jest.fn().mockResolvedValue({ accessToken: 'token-123', expiresAt: Date.now() + 3600000 }),
    exchangeMetaCode: jest.fn().mockResolvedValue({ accessToken: 'token-123', expiresAt: Date.now() + 3600000 }),
    exchangeMicrosoftCode: jest.fn().mockResolvedValue({ accessToken: 'token-123', expiresAt: Date.now() + 3600000 }),
    storeToken: jest.fn(),
    getToken: jest.fn().mockReturnValue(null),
    isTokenExpired: jest.fn().mockReturnValue(false),
    removeToken: jest.fn(),
  },
}));

const { oauthService } = oauthServiceModule;

describe('AuthController', () => {
  let controller: AuthController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new AuthController();
    mockRequest = {
      query: {},
      body: {},
      params: {},
    };
    mockResponse = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      redirect: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe('authorizeGoogle', () => {
    it('should return Google OAuth URL', async () => {
      await controller.authorizeGoogle(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          authUrl: 'https://accounts.google.com/o/oauth2/auth',
          platform: 'google',
        })
      );
    });
  });

  describe('callbackGoogle', () => {
    it('should handle OAuth callback', async () => {
      mockRequest.query = {
        code: 'auth-code-123',
        state: 'state-123',
      };

      // This method redirects, so we need to mock redirect
      mockResponse.redirect = jest.fn().mockReturnThis();

      await controller.callbackGoogle(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.redirect).toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      // Simulate an error in exchangeGoogleCode
      (oauthService.exchangeGoogleCode as jest.Mock).mockRejectedValueOnce(new Error('OAuth error'));

      mockRequest.query = {
        code: 'auth-code-123',
        state: 'state-123',
      };

      await controller.callbackGoogle(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.redirect).toHaveBeenCalled();
    });
  });

  describe('authorizeGoogle error handling', () => {
    it('should handle errors when generating authorization URL', async () => {
      (oauthService.generateGoogleAuthUrl as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Authorization error');
      });

      await controller.authorizeGoogle(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Failed to generate authorization URL',
        })
      );
    });
  });

  describe('authorizeMeta', () => {
    it('should return Meta OAuth URL', async () => {
      await controller.authorizeMeta(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
          platform: 'meta',
        })
      );
    });
  });

  describe('authorizeMicrosoft', () => {
    it('should return Microsoft OAuth URL', async () => {
      await controller.authorizeMicrosoft(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
          platform: 'microsoft',
        })
      );
    });
  });

  describe('getGoogleStatus', () => {
    it('should return Google connection status', async () => {
      await controller.getGoogleStatus(
        mockRequest as Request,
        mockResponse as Response
      );
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          platform: 'google',
          connected: false,
          hasToken: false,
        })
      );
    });

    it('should return Google status when token is present', async () => {
      const expiryTime = Date.now() + 3600000; // 1 hour from now
      (oauthService.getToken as jest.Mock).mockReturnValueOnce({ accessToken: 'token-123', expiresAt: expiryTime });
      (oauthService.isTokenExpired as jest.Mock).mockReturnValueOnce(false);

      await controller.getGoogleStatus(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          platform: 'google',
          connected: true,
          hasToken: true,
        })
      );
    });
  });

  describe('disconnectGoogle', () => {
    it('should disconnect Google Ads OAuth', async () => {
      await controller.disconnectGoogle(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(oauthService.removeToken).toHaveBeenCalledWith('google');
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          platform: 'google',
          disconnected: true,
        })
      );
    });
  });
});

