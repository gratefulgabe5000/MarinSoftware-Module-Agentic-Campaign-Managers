import { campaignCreationService } from '../../services/campaignCreationService';
import { CampaignCreationRequest } from '../../types/campaign.types';
import { GoogleAdsService } from '../../services/googleAdsService';
import { MetaAdsService } from '../../services/metaAdsService';
import { MicrosoftAdsService } from '../../services/microsoftAdsService';

describe('CampaignCreationService', () => {
  beforeEach(() => {
    // Clear registered platforms
    jest.clearAllMocks();
  });

  describe('createCampaign', () => {
    it('should create campaign on registered platforms', async () => {
      // Mock platform services
      const mockGoogleService = {
        isAuthenticated: jest.fn().mockResolvedValue(true),
        createCampaign: jest.fn().mockResolvedValue({
          success: true,
          campaignId: 'google-123',
        }),
      };

      const mockMetaService = {
        isAuthenticated: jest.fn().mockResolvedValue(true),
        createCampaign: jest.fn().mockResolvedValue({
          success: true,
          campaignId: 'meta-123',
        }),
      };

      // Register platform services
      campaignCreationService.registerPlatform('Google Ads', mockGoogleService as any);
      campaignCreationService.registerPlatform('Meta', mockMetaService as any);

      const request: CampaignCreationRequest = {
        campaignPlan: {
          objective: 'Test objective',
          targetAudience: {},
          budget: { total: 1000, currency: 'USD' },
          timeline: { startDate: '2025-01-01', duration: 30 },
          platforms: ['Google Ads', 'Meta'],
          kpis: { primary: 'Conversions' },
        },
        name: 'Test Campaign',
      };

      const response = await campaignCreationService.createCampaign(request);

      expect(response.campaignId).toBeDefined();
      expect(response.status).toBe('active');
      expect(response.platformCampaignIds).toBeDefined();
      expect(mockGoogleService.createCampaign).toHaveBeenCalled();
      expect(mockMetaService.createCampaign).toHaveBeenCalled();
    });

    it('should handle missing platform services', async () => {
      const request: CampaignCreationRequest = {
        campaignPlan: {
          objective: 'Test',
          targetAudience: {},
          budget: { total: 1000, currency: 'USD' },
          timeline: { startDate: '2025-01-01', duration: 30 },
          platforms: ['Unknown Platform'],
          kpis: { primary: 'Conversions' },
        },
        name: 'Test Campaign',
      };

      const response = await campaignCreationService.createCampaign(request);

      expect(response.errors).toBeDefined();
      expect(response.errors?.length).toBeGreaterThan(0);
      expect(response.errors?.some((e) => e.platform === 'Unknown Platform')).toBe(true);
    });

    it('should handle authentication failures', async () => {
      const mockService = {
        isAuthenticated: jest.fn().mockResolvedValue(false),
        createCampaign: jest.fn(),
      };

      campaignCreationService.registerPlatform('Google Ads', mockService as any);

      const request: CampaignCreationRequest = {
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

      const response = await campaignCreationService.createCampaign(request);

      expect(response.errors).toBeDefined();
      expect(response.errors?.some((e) => e.platform === 'Google Ads')).toBe(true);
      expect(mockService.createCampaign).not.toHaveBeenCalled();
    });

    it('should handle platform creation failures', async () => {
      const mockService = {
        isAuthenticated: jest.fn().mockResolvedValue(true),
        createCampaign: jest.fn().mockResolvedValue({
          success: false,
          error: 'Platform error',
        }),
      };

      campaignCreationService.registerPlatform('Google Ads', mockService as any);

      const request: CampaignCreationRequest = {
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

      const response = await campaignCreationService.createCampaign(request);

      expect(response.errors).toBeDefined();
      expect(response.errors?.some((e) => e.platform === 'Google Ads')).toBe(true);
    });
  });
});

