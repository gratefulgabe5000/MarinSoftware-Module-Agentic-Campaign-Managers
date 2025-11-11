import { Request, Response } from 'express';
import { AuthController } from '../../controllers/authController';

describe('AuthController', () => {
  let controller: AuthController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    controller = new AuthController();
    mockRequest = {};
    mockResponse = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
  });

  describe('authorizeGoogle', () => {
    it('should return Google OAuth URL', async () => {
      await controller.authorizeGoogle(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalled();
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
  });

  describe('authorizeMeta', () => {
    it('should return Meta OAuth URL', async () => {
      await controller.authorizeMeta(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalled();
    });
  });

  describe('callbackMeta', () => {
    it('should handle Meta OAuth callback', async () => {
      mockRequest.query = {
        code: 'meta-code-123',
        state: 'state-123',
      };

      mockResponse.redirect = jest.fn().mockReturnThis();

      await controller.callbackMeta(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.redirect).toHaveBeenCalled();
    });
  });

  describe('authorizeMicrosoft', () => {
    it('should return Microsoft OAuth URL', async () => {
      await controller.authorizeMicrosoft(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalled();
    });
  });

  describe('callbackMicrosoft', () => {
    it('should handle Microsoft OAuth callback', async () => {
      mockRequest.query = {
        code: 'microsoft-code-123',
        state: 'state-123',
      };

      mockResponse.redirect = jest.fn().mockReturnThis();

      await controller.callbackMicrosoft(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.redirect).toHaveBeenCalled();
    });
  });

  describe('getConnectionStatus', () => {
    it('should return connection status', async () => {
      mockRequest.query = { platform: 'google' };

      await controller.getConnectionStatus(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          platform: 'google',
          connected: expect.any(Boolean),
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
          connected: expect.any(Boolean),
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

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          platform: 'google',
          disconnected: true,
        })
      );
    });
  });
});

