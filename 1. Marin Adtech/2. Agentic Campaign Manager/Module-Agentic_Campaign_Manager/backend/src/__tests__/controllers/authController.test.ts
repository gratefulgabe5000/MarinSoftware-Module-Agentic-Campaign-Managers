import { Request, Response } from 'express';
import { AuthController } from '../../controllers/authController';
import { oauthService } from '../../services/oauthService';

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

    it('should handle errors', async () => {
      (oauthService.generateGoogleAuthUrl as jest.Mock).mockImplementationOnce(() => {
        throw new Error('OAuth error');
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

