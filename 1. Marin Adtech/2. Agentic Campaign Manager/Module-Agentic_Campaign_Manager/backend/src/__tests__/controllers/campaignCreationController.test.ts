import { Request, Response } from 'express';
import { CampaignCreationController } from '../../controllers/campaignCreationController';
import { campaignCreationService } from '../../services/campaignCreationService';

// Mock platform services
jest.mock('../../services/googleAdsService', () => ({
  GoogleAdsService: jest.fn().mockImplementation(() => ({})),
}));
jest.mock('../../services/metaAdsService', () => ({
  MetaAdsService: jest.fn().mockImplementation(() => ({})),
}));
jest.mock('../../services/microsoftAdsService', () => ({
  MicrosoftAdsService: jest.fn().mockImplementation(() => ({})),
}));

// Mock campaign creation service
jest.mock('../../services/campaignCreationService', () => ({
  campaignCreationService: {
    createCampaign: jest.fn(),
    createCampaignWithProgress: jest.fn(),
    registerPlatform: jest.fn(),
  },
}));

describe('CampaignCreationController', () => {
  let controller: CampaignCreationController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Create controller - it will call initializePlatformServices
    // but registerPlatform is mocked, so it should work
    controller = new CampaignCreationController();
    mockRequest = {};
    mockResponse = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      write: jest.fn().mockReturnThis(),
      end: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe('createCampaign', () => {
    it('should successfully create campaign', async () => {
      const mockResponseData = {
        campaignId: 'campaign-123',
        status: 'active',
        platformCampaignIds: {
          googleAds: 'google-123',
        },
        createdAt: new Date(),
      };

      (campaignCreationService.createCampaign as jest.Mock).mockResolvedValue(
        mockResponseData
      );

      mockRequest.body = {
        campaignPlan: {
          objective: 'Test objective',
          targetAudience: {},
          budget: { total: 1000, currency: 'USD' },
          timeline: { startDate: '2025-01-01', duration: 30 },
          platforms: ['Google Ads'],
          kpis: { primary: 'Conversions' },
        },
        name: 'Test Campaign',
      };

      await controller.createCampaign(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(campaignCreationService.createCampaign).toHaveBeenCalledWith(
        expect.objectContaining({
          campaignPlan: expect.any(Object),
          name: 'Test Campaign',
        })
      );
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(mockResponseData);
    });

    it('should handle missing campaign plan', async () => {
      mockRequest.body = {
        name: 'Test Campaign',
      };

      await controller.createCampaign(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Invalid request',
        })
      );
    });

    it('should handle missing name', async () => {
      mockRequest.body = {
        campaignPlan: {
          objective: 'Test',
          targetAudience: {},
          budget: { total: 1000, currency: 'USD' },
          timeline: { startDate: '2025-01-01', duration: 30 },
          platforms: ['Google Ads'],
          kpis: { primary: 'Conversions' },
        },
      };

      await controller.createCampaign(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should handle invalid campaign plan', async () => {
      mockRequest.body = {
        campaignPlan: {
          objective: '',
          targetAudience: {},
          budget: { total: 0, currency: 'USD' },
          timeline: { startDate: '', duration: 0 },
          platforms: [],
          kpis: { primary: '' },
        },
        name: 'Test Campaign',
      };

      await controller.createCampaign(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Invalid campaign plan',
        })
      );
    });

    it('should handle service errors', async () => {
      (campaignCreationService.createCampaign as jest.Mock).mockRejectedValue(
        new Error('Service error')
      );

      mockRequest.body = {
        campaignPlan: {
          objective: 'Test',
          targetAudience: {},
          budget: { total: 1000, currency: 'USD' },
          timeline: { startDate: '2025-01-01', duration: 30 },
          platforms: ['Google Ads'],
          kpis: { primary: 'Conversions' },
        },
        name: 'Test Campaign',
      };

      await controller.createCampaign(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Failed to create campaign',
        })
      );
    });

    it('should return 207 status for partial success', async () => {
      const mockResponseData = {
        campaignId: 'campaign-123',
        status: 'active',
        platformCampaignIds: {
          googleAds: 'google-123',
        },
        createdAt: new Date(),
        errors: [
          {
            platform: 'Meta',
            error: 'Authentication failed',
          },
        ],
      };

      (campaignCreationService.createCampaign as jest.Mock).mockResolvedValue(
        mockResponseData
      );

      mockRequest.body = {
        campaignPlan: {
          objective: 'Test',
          targetAudience: {},
          budget: { total: 1000, currency: 'USD' },
          timeline: { startDate: '2025-01-01', duration: 30 },
          platforms: ['Google Ads', 'Meta'],
          kpis: { primary: 'Conversions' },
        },
        name: 'Test Campaign',
      };

      await controller.createCampaign(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(207); // Multi-Status
    });
  });
});

