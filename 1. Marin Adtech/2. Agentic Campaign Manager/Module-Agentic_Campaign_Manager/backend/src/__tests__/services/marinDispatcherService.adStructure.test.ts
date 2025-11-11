/**
 * Unit tests for MarinDispatcherService Ad Structure Methods (Phase 2B.1 & 2B.2)
 * Tests Ad Group and Ad methods
 *
 * @module marinDispatcherService.adStructure.test
 */

import { MarinDispatcherService } from '../../services/marinDispatcherService';
import axios from 'axios';
import * as AWSXRay from 'aws-xray-sdk-core';
import {
  MarinAdGroupRequest,
  MarinAdGroupResponse,
  MarinAdGroupUpdateRequest,
  MarinAdRequest,
  MarinAdResponse,
  MarinAdUpdateRequest,
  AdAsset,
} from '../../types/marinDispatcher.types';

// Mock dependencies
jest.mock('axios');
jest.mock('aws-xray-sdk-core');
jest.mock('../../config/env', () => {
  const mockConfig = {
    marinDispatcher: {
      baseUrl: 'http://test-dispatcher.example.com',
      accountId: 'test-account-123',
      publisher: 'google',
      timeout: 30000,
    },
  };
  return {
    __esModule: true,
    default: mockConfig,
    config: mockConfig,
  };
});

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('MarinDispatcherService - Ad Structure Methods', () => {
  let service: MarinDispatcherService;
  let mockHttpClient: any;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock X-Ray segment
    (AWSXRay.getSegment as jest.Mock).mockReturnValue({
      addNewSubsegment: jest.fn().mockReturnValue({
        close: jest.fn(),
      }),
    });

    // Create mock HTTP client
    mockHttpClient = {
      post: jest.fn(),
      put: jest.fn(),
      get: jest.fn(),
    };

    // Mock axios.create to return our mock HTTP client
    mockedAxios.create.mockReturnValue(mockHttpClient as any);

    // Initialize service
    service = new MarinDispatcherService('test-account-123', 'google');
  });

  // ========================================================================
  // createAdGroup Tests (Task 2B.1.1)
  // ========================================================================

  describe('createAdGroup', () => {
    const campaignId = 'campaign-123';
    const mockAdGroupData: Omit<MarinAdGroupRequest, 'accountId' | 'campaignId'> = {
      name: 'Test Ad Group',
      status: 'ENABLED',
      cpcBid: 1.5,
    };

    it('should successfully create an ad group', async () => {
      const mockResponse: MarinAdGroupResponse = {
        id: 'adgroup-123',
        accountId: 'test-account-123',
        campaignId: 'campaign-123',
        name: 'Test Ad Group',
        adGroupStatus: 'ENABLED',
        cpcBid: 1.5,
        status: 'SUCCESS',
      };

      mockHttpClient.post.mockResolvedValue({ data: mockResponse });

      const result = await service.createAdGroup(campaignId, mockAdGroupData);

      expect(result.success).toBe(true);
      expect(result.adGroupId).toBe('adgroup-123');
      expect(result.details).toEqual(mockResponse);
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/dispatcher/google/campaigns/campaign-123/adgroups',
        expect.objectContaining({
          accountId: 'test-account-123',
          campaignId: 'campaign-123',
          name: 'Test Ad Group',
          status: 'ENABLED',
          cpcBid: 1.5,
        })
      );
    });

    it('should create an ad group with minimal required fields', async () => {
      const minimalData: Omit<MarinAdGroupRequest, 'accountId' | 'campaignId'> = {
        name: 'Minimal Ad Group',
      };

      const mockResponse: MarinAdGroupResponse = {
        id: 'adgroup-minimal',
        accountId: 'test-account-123',
        campaignId: 'campaign-123',
        name: 'Minimal Ad Group',
        adGroupStatus: 'ENABLED',
        status: 'SUCCESS',
      };

      mockHttpClient.post.mockResolvedValue({ data: mockResponse });

      const result = await service.createAdGroup(campaignId, minimalData);

      expect(result.success).toBe(true);
      expect(result.adGroupId).toBe('adgroup-minimal');
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/dispatcher/google/campaigns/campaign-123/adgroups',
        expect.objectContaining({
          accountId: 'test-account-123',
          campaignId: 'campaign-123',
          name: 'Minimal Ad Group',
        })
      );
    });

    it('should validate that ad group name is required', async () => {
      const invalidData: any = {
        status: 'ENABLED',
        cpcBid: 1.5,
      };

      const result = await service.createAdGroup(campaignId, invalidData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Validation failed');
      expect(result.error).toContain('name is required');
      expect(mockHttpClient.post).not.toHaveBeenCalled();
    });

    it('should validate ad group name is not empty', async () => {
      const invalidData: Omit<MarinAdGroupRequest, 'accountId' | 'campaignId'> = {
        name: '',
        status: 'ENABLED',
      };

      const result = await service.createAdGroup(campaignId, invalidData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Validation failed');
      expect(result.error).toContain('name is required and must be a non-empty string');
      expect(mockHttpClient.post).not.toHaveBeenCalled();
    });

    it('should validate ad group status if provided', async () => {
      const invalidData: any = {
        name: 'Test Ad Group',
        status: 'INVALID_STATUS',
      };

      const result = await service.createAdGroup(campaignId, invalidData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Validation failed');
      expect(result.error).toContain('status must be one of: ENABLED, PAUSED, REMOVED');
      expect(mockHttpClient.post).not.toHaveBeenCalled();
    });

    it('should validate cpcBid is positive if provided', async () => {
      const invalidData: Omit<MarinAdGroupRequest, 'accountId' | 'campaignId'> = {
        name: 'Test Ad Group',
        cpcBid: -1.5,
      };

      const result = await service.createAdGroup(campaignId, invalidData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Validation failed');
      expect(result.error).toContain('cpcBid must be a positive number');
      expect(mockHttpClient.post).not.toHaveBeenCalled();
    });

    it('should validate cpmBid is positive if provided', async () => {
      const invalidData: Omit<MarinAdGroupRequest, 'accountId' | 'campaignId'> = {
        name: 'Test Ad Group',
        cpmBid: -5.0,
      };

      const result = await service.createAdGroup(campaignId, invalidData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Validation failed');
      expect(result.error).toContain('cpmBid must be a positive number');
      expect(mockHttpClient.post).not.toHaveBeenCalled();
    });

    it('should handle API errors gracefully', async () => {
      mockHttpClient.post.mockRejectedValue({
        response: {
          status: 400,
          data: { error: 'Campaign not found' },
        },
      });

      const result = await service.createAdGroup(campaignId, mockAdGroupData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle network errors gracefully', async () => {
      mockHttpClient.post.mockRejectedValue(new Error('Network error'));

      const result = await service.createAdGroup(campaignId, mockAdGroupData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    // ========================================================================
    // Task 4.3.1: Integration & Error Tests
    // ========================================================================

    it('should create campaign first, then create ad group in that campaign', async () => {
      // Step 1: Create a campaign
      const mockCampaignResponse: any = {
        id: 'campaign-new-123',
        accountId: 'test-account-123',
        name: 'New Test Campaign',
        status: 'SUCCESS',
        campaignStatus: 'ENABLED',
        budget: {
          amount: 100.0,
          deliveryMethod: 'STANDARD',
        },
        biddingStrategy: 'MANUAL_CPC',
      };

      const mockAdGroupResponse: MarinAdGroupResponse = {
        id: 'adgroup-new-123',
        accountId: 'test-account-123',
        campaignId: 'campaign-new-123',
        name: 'Test Ad Group in New Campaign',
        adGroupStatus: 'ENABLED',
        cpcBid: 2.0,
        status: 'SUCCESS',
      };

      // Mock the campaign creation
      mockHttpClient.post
        .mockResolvedValueOnce({ data: mockCampaignResponse })
        // Then mock the ad group creation
        .mockResolvedValueOnce({ data: mockAdGroupResponse });

      // Create campaign first
      const campaignResult = await service.createCampaign(
        {
          objective: 'conversions',
          budget: {
            total: 100.0,
            daily: 100.0,
            currency: 'USD'
          },
          targetAudience: {
            demographics: {
              age: '25-54',
              gender: 'All',
              location: 'United States'
            }
          },
          timeline: {
            startDate: '2025-01-15',
            endDate: '2025-02-15',
            duration: 30
          },
          platforms: ['google'],
          kpis: {
            primary: 'conversions',
            secondary: ['ctr', 'roas']
          }
        },
        'New Test Campaign'
      );

      expect(campaignResult.success).toBe(true);
      expect(campaignResult.campaignId).toBe('campaign-new-123');

      // Then create ad group in that campaign
      const adGroupResult = await service.createAdGroup('campaign-new-123', {
        name: 'Test Ad Group in New Campaign',
        status: 'ENABLED',
        cpcBid: 2.0,
      });

      expect(adGroupResult.success).toBe(true);
      expect(adGroupResult.adGroupId).toBe('adgroup-new-123');
      expect(adGroupResult.details?.campaignId).toBe('campaign-new-123');

      // Verify both API calls were made
      expect(mockHttpClient.post).toHaveBeenCalledTimes(2);
      expect(mockHttpClient.post).toHaveBeenNthCalledWith(
        1,
        '/dispatcher/google/campaigns',
        expect.any(Object)
      );
      expect(mockHttpClient.post).toHaveBeenNthCalledWith(
        2,
        '/dispatcher/google/campaigns/campaign-new-123/adgroups',
        expect.objectContaining({
          campaignId: 'campaign-new-123',
          name: 'Test Ad Group in New Campaign',
        })
      );
    });

    it('should return error when creating ad group with invalid campaign ID', async () => {
      const invalidCampaignId = 'invalid-campaign-id';

      // Mock API error for invalid campaign ID
      mockHttpClient.post.mockRejectedValue({
        response: {
          status: 404,
          data: {
            error: 'Campaign not found',
            message: `Campaign with ID ${invalidCampaignId} does not exist`
          },
        },
      });

      const result = await service.createAdGroup(invalidCampaignId, mockAdGroupData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        `/dispatcher/google/campaigns/${invalidCampaignId}/adgroups`,
        expect.any(Object)
      );
    });

    it('should return error when creating ad group with non-existent campaign ID', async () => {
      const nonExistentCampaignId = 'campaign-does-not-exist';

      // Mock 404 error
      mockHttpClient.post.mockRejectedValue({
        response: {
          status: 404,
          data: { error: 'Not Found' },
        },
      });

      const result = await service.createAdGroup(nonExistentCampaignId, {
        name: 'Orphan Ad Group',
        status: 'ENABLED',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should return error when creating ad group with malformed campaign ID', async () => {
      const malformedCampaignId = '';

      // This should fail even before the API call in some implementations,
      // or return a 400 Bad Request from the API
      mockHttpClient.post.mockRejectedValue({
        response: {
          status: 400,
          data: { error: 'Invalid campaign ID format' },
        },
      });

      const result = await service.createAdGroup(malformedCampaignId, mockAdGroupData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  // ========================================================================
  // updateAdGroup Tests (Task 2B.1.2 & Task 4.3.1)
  // ========================================================================

  describe('updateAdGroup', () => {
    const adGroupId = 'adgroup-123';

    it('should successfully update ad group name', async () => {
      const updates: MarinAdGroupUpdateRequest = {
        name: 'Updated Ad Group Name',
      };

      const mockResponse: MarinAdGroupResponse = {
        id: adGroupId,
        accountId: 'test-account-123',
        campaignId: 'campaign-123',
        name: 'Updated Ad Group Name',
        adGroupStatus: 'ENABLED',
        status: 'SUCCESS',
      };

      mockHttpClient.put.mockResolvedValue({ data: mockResponse });

      const result = await service.updateAdGroup(adGroupId, updates);

      expect(result.success).toBe(true);
      expect(result.adGroupId).toBe(adGroupId);
      expect(result.details).toEqual(mockResponse);
      expect(mockHttpClient.put).toHaveBeenCalledWith(
        '/dispatcher/google/adgroups/adgroup-123',
        { name: 'Updated Ad Group Name' }
      );
    });

    it('should successfully update ad group status', async () => {
      const updates: MarinAdGroupUpdateRequest = {
        status: 'PAUSED',
      };

      const mockResponse: MarinAdGroupResponse = {
        id: adGroupId,
        accountId: 'test-account-123',
        campaignId: 'campaign-123',
        name: 'Test Ad Group',
        adGroupStatus: 'PAUSED',
        status: 'SUCCESS',
      };

      mockHttpClient.put.mockResolvedValue({ data: mockResponse });

      const result = await service.updateAdGroup(adGroupId, updates);

      expect(result.success).toBe(true);
      expect(result.adGroupId).toBe(adGroupId);
      expect(mockHttpClient.put).toHaveBeenCalledWith(
        '/dispatcher/google/adgroups/adgroup-123',
        { status: 'PAUSED' }
      );
    });

    it('should successfully update ad group cpcBid', async () => {
      const updates: MarinAdGroupUpdateRequest = {
        cpcBid: 2.5,
      };

      const mockResponse: MarinAdGroupResponse = {
        id: adGroupId,
        accountId: 'test-account-123',
        campaignId: 'campaign-123',
        name: 'Test Ad Group',
        adGroupStatus: 'ENABLED',
        cpcBid: 2.5,
        status: 'SUCCESS',
      };

      mockHttpClient.put.mockResolvedValue({ data: mockResponse });

      const result = await service.updateAdGroup(adGroupId, updates);

      expect(result.success).toBe(true);
      expect(result.adGroupId).toBe(adGroupId);
      expect(mockHttpClient.put).toHaveBeenCalledWith(
        '/dispatcher/google/adgroups/adgroup-123',
        { cpcBid: 2.5 }
      );
    });

    it('should successfully update multiple fields at once', async () => {
      const updates: MarinAdGroupUpdateRequest = {
        name: 'New Name',
        status: 'ENABLED',
        cpcBid: 3.0,
        cpmBid: 5.0,
      };

      const mockResponse: MarinAdGroupResponse = {
        id: adGroupId,
        accountId: 'test-account-123',
        campaignId: 'campaign-123',
        name: 'New Name',
        adGroupStatus: 'ENABLED',
        cpcBid: 3.0,
        cpmBid: 5.0,
        status: 'SUCCESS',
      };

      mockHttpClient.put.mockResolvedValue({ data: mockResponse });

      const result = await service.updateAdGroup(adGroupId, updates);

      expect(result.success).toBe(true);
      expect(result.adGroupId).toBe(adGroupId);
      expect(mockHttpClient.put).toHaveBeenCalledWith(
        '/dispatcher/google/adgroups/adgroup-123',
        {
          name: 'New Name',
          status: 'ENABLED',
          cpcBid: 3.0,
          cpmBid: 5.0,
        }
      );
    });

    it('should remove undefined fields from update request', async () => {
      const updates: MarinAdGroupUpdateRequest = {
        name: 'Updated Name',
        status: undefined,
        cpcBid: undefined,
        cpmBid: undefined,
      };

      const mockResponse: MarinAdGroupResponse = {
        id: adGroupId,
        accountId: 'test-account-123',
        campaignId: 'campaign-123',
        name: 'Updated Name',
        adGroupStatus: 'ENABLED',
        status: 'SUCCESS',
      };

      mockHttpClient.put.mockResolvedValue({ data: mockResponse });

      const result = await service.updateAdGroup(adGroupId, updates);

      expect(result.success).toBe(true);
      expect(mockHttpClient.put).toHaveBeenCalledWith(
        '/dispatcher/google/adgroups/adgroup-123',
        { name: 'Updated Name' } // Only defined field should be sent
      );
    });

    it('should handle API errors gracefully', async () => {
      const updates: MarinAdGroupUpdateRequest = {
        name: 'Updated Name',
      };

      mockHttpClient.put.mockRejectedValue({
        response: {
          status: 404,
          data: { error: 'Ad group not found' },
        },
      });

      const result = await service.updateAdGroup(adGroupId, updates);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  // ========================================================================
  // createAd Tests (Task 2B.2.1)
  // ========================================================================

  describe('createAd', () => {
    const adGroupId = 'adgroup-123';

    const validHeadlines: AdAsset[] = [
      { text: 'Headline 1' },
      { text: 'Headline 2' },
      { text: 'Headline 3' },
    ];

    const validDescriptions: AdAsset[] = [
      { text: 'Description 1' },
      { text: 'Description 2' },
    ];

    const mockAdData: Omit<MarinAdRequest, 'accountId' | 'adGroupId'> = {
      type: 'RESPONSIVE_SEARCH_AD',
      headlines: validHeadlines,
      descriptions: validDescriptions,
      finalUrl: 'https://www.example.com',
    };

    it('should successfully create a responsive search ad', async () => {
      const mockResponse: MarinAdResponse = {
        id: 'ad-123',
        accountId: 'test-account-123',
        adGroupId: 'adgroup-123',
        type: 'RESPONSIVE_SEARCH_AD',
        headlines: validHeadlines,
        descriptions: validDescriptions,
        finalUrl: 'https://www.example.com',
        status: 'SUCCESS',
      };

      mockHttpClient.post.mockResolvedValue({ data: mockResponse });

      const result = await service.createAd(adGroupId, mockAdData);

      expect(result.success).toBe(true);
      expect(result.adId).toBe('ad-123');
      expect(result.details).toEqual(mockResponse);
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/dispatcher/google/adgroups/adgroup-123/ads',
        expect.objectContaining({
          accountId: 'test-account-123',
          adGroupId: 'adgroup-123',
          type: 'RESPONSIVE_SEARCH_AD',
          headlines: validHeadlines,
          descriptions: validDescriptions,
          finalUrl: 'https://www.example.com',
        })
      );
    });

    it('should default to RESPONSIVE_SEARCH_AD type if not provided', async () => {
      const adDataWithoutType: any = {
        headlines: validHeadlines,
        descriptions: validDescriptions,
        finalUrl: 'https://www.example.com',
      };

      const mockResponse: MarinAdResponse = {
        id: 'ad-default',
        accountId: 'test-account-123',
        adGroupId: 'adgroup-123',
        type: 'RESPONSIVE_SEARCH_AD',
        headlines: validHeadlines,
        descriptions: validDescriptions,
        finalUrl: 'https://www.example.com',
        status: 'SUCCESS',
      };

      mockHttpClient.post.mockResolvedValue({ data: mockResponse });

      const result = await service.createAd(adGroupId, adDataWithoutType);

      expect(result.success).toBe(true);
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/dispatcher/google/adgroups/adgroup-123/ads',
        expect.objectContaining({
          type: 'RESPONSIVE_SEARCH_AD',
        })
      );
    });

    it('should validate minimum number of headlines (3 required)', async () => {
      const invalidAdData: Omit<MarinAdRequest, 'accountId' | 'adGroupId'> = {
        type: 'RESPONSIVE_SEARCH_AD',
        headlines: [
          { text: 'Headline 1' },
          { text: 'Headline 2' },
        ], // Only 2 headlines
        descriptions: validDescriptions,
        finalUrl: 'https://www.example.com',
      };

      const result = await service.createAd(adGroupId, invalidAdData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Validation failed');
      expect(result.error).toContain('headlines must have at least 3 items');
      expect(mockHttpClient.post).not.toHaveBeenCalled();
    });

    it('should validate maximum number of headlines (15 allowed)', async () => {
      const tooManyHeadlines = Array(16)
        .fill(null)
        .map((_, i) => ({ text: `Headline ${i + 1}` }));

      const invalidAdData: Omit<MarinAdRequest, 'accountId' | 'adGroupId'> = {
        type: 'RESPONSIVE_SEARCH_AD',
        headlines: tooManyHeadlines,
        descriptions: validDescriptions,
        finalUrl: 'https://www.example.com',
      };

      const result = await service.createAd(adGroupId, invalidAdData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Validation failed');
      expect(result.error).toContain('headlines must have at most 15 items');
      expect(mockHttpClient.post).not.toHaveBeenCalled();
    });

    it('should validate headline text length (30 chars max)', async () => {
      const invalidAdData: Omit<MarinAdRequest, 'accountId' | 'adGroupId'> = {
        type: 'RESPONSIVE_SEARCH_AD',
        headlines: [
          { text: 'Valid Headline 1' },
          { text: 'Valid Headline 2' },
          { text: 'This headline is way too long and exceeds thirty characters' },
        ],
        descriptions: validDescriptions,
        finalUrl: 'https://www.example.com',
      };

      const result = await service.createAd(adGroupId, invalidAdData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Validation failed');
      expect(result.error).toContain('30 characters');
      expect(mockHttpClient.post).not.toHaveBeenCalled();
    });

    it('should validate minimum number of descriptions (2 required)', async () => {
      const invalidAdData: Omit<MarinAdRequest, 'accountId' | 'adGroupId'> = {
        type: 'RESPONSIVE_SEARCH_AD',
        headlines: validHeadlines,
        descriptions: [
          { text: 'Only one description' },
        ], // Only 1 description
        finalUrl: 'https://www.example.com',
      };

      const result = await service.createAd(adGroupId, invalidAdData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Validation failed');
      expect(result.error).toContain('descriptions must have at least 2 items');
      expect(mockHttpClient.post).not.toHaveBeenCalled();
    });

    it('should validate maximum number of descriptions (4 allowed)', async () => {
      const tooManyDescriptions = Array(5)
        .fill(null)
        .map((_, i) => ({ text: `Description ${i + 1}` }));

      const invalidAdData: Omit<MarinAdRequest, 'accountId' | 'adGroupId'> = {
        type: 'RESPONSIVE_SEARCH_AD',
        headlines: validHeadlines,
        descriptions: tooManyDescriptions,
        finalUrl: 'https://www.example.com',
      };

      const result = await service.createAd(adGroupId, invalidAdData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Validation failed');
      expect(result.error).toContain('descriptions must have at most 4 items');
      expect(mockHttpClient.post).not.toHaveBeenCalled();
    });

    it('should validate description text length (90 chars max)', async () => {
      const invalidAdData: Omit<MarinAdRequest, 'accountId' | 'adGroupId'> = {
        type: 'RESPONSIVE_SEARCH_AD',
        headlines: validHeadlines,
        descriptions: [
          { text: 'Valid description 1' },
          { text: 'This description is way too long and definitely exceeds the ninety character limit that is imposed on descriptions' },
        ],
        finalUrl: 'https://www.example.com',
      };

      const result = await service.createAd(adGroupId, invalidAdData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Validation failed');
      expect(result.error).toContain('90 characters');
      expect(mockHttpClient.post).not.toHaveBeenCalled();
    });

    it('should validate finalUrl is required', async () => {
      const invalidAdData: any = {
        type: 'RESPONSIVE_SEARCH_AD',
        headlines: validHeadlines,
        descriptions: validDescriptions,
      };

      const result = await service.createAd(adGroupId, invalidAdData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Validation failed');
      expect(result.error).toContain('finalUrl is required');
      expect(mockHttpClient.post).not.toHaveBeenCalled();
    });

    it('should validate finalUrl format', async () => {
      const invalidAdData: Omit<MarinAdRequest, 'accountId' | 'adGroupId'> = {
        type: 'RESPONSIVE_SEARCH_AD',
        headlines: validHeadlines,
        descriptions: validDescriptions,
        finalUrl: 'not-a-valid-url',
      };

      const result = await service.createAd(adGroupId, invalidAdData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Validation failed');
      expect(result.error).toContain('finalUrl must be a valid URL');
      expect(mockHttpClient.post).not.toHaveBeenCalled();
    });

    it('should create ad with optional display URL and paths', async () => {
      const adDataWithOptionals: Omit<MarinAdRequest, 'accountId' | 'adGroupId'> = {
        type: 'RESPONSIVE_SEARCH_AD',
        headlines: validHeadlines,
        descriptions: validDescriptions,
        finalUrl: 'https://www.example.com',
        displayUrl: 'www.example.com',
        paths: ['path1', 'path2'],
      };

      const mockResponse: MarinAdResponse = {
        id: 'ad-with-optionals',
        accountId: 'test-account-123',
        adGroupId: 'adgroup-123',
        type: 'RESPONSIVE_SEARCH_AD',
        headlines: validHeadlines,
        descriptions: validDescriptions,
        finalUrl: 'https://www.example.com',
        displayUrl: 'www.example.com',
        paths: ['path1', 'path2'],
        status: 'SUCCESS',
      };

      mockHttpClient.post.mockResolvedValue({ data: mockResponse });

      const result = await service.createAd(adGroupId, adDataWithOptionals);

      expect(result.success).toBe(true);
      expect(result.adId).toBe('ad-with-optionals');
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/dispatcher/google/adgroups/adgroup-123/ads',
        expect.objectContaining({
          displayUrl: 'www.example.com',
          paths: ['path1', 'path2'],
        })
      );
    });

    it('should handle pinned headlines', async () => {
      const pinnedHeadlines: AdAsset[] = [
        { text: 'Pinned Headline', pinned: true },
        { text: 'Regular Headline 1' },
        { text: 'Regular Headline 2' },
      ];

      const adDataWithPinned: Omit<MarinAdRequest, 'accountId' | 'adGroupId'> = {
        type: 'RESPONSIVE_SEARCH_AD',
        headlines: pinnedHeadlines,
        descriptions: validDescriptions,
        finalUrl: 'https://www.example.com',
      };

      const mockResponse: MarinAdResponse = {
        id: 'ad-pinned',
        accountId: 'test-account-123',
        adGroupId: 'adgroup-123',
        type: 'RESPONSIVE_SEARCH_AD',
        headlines: pinnedHeadlines,
        descriptions: validDescriptions,
        finalUrl: 'https://www.example.com',
        status: 'SUCCESS',
      };

      mockHttpClient.post.mockResolvedValue({ data: mockResponse });

      const result = await service.createAd(adGroupId, adDataWithPinned);

      expect(result.success).toBe(true);
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/dispatcher/google/adgroups/adgroup-123/ads',
        expect.objectContaining({
          headlines: expect.arrayContaining([
            expect.objectContaining({ text: 'Pinned Headline', pinned: true }),
          ]),
        })
      );
    });

    it('should handle API errors gracefully', async () => {
      mockHttpClient.post.mockRejectedValue({
        response: {
          status: 400,
          data: { error: 'Ad group not found' },
        },
      });

      const result = await service.createAd(adGroupId, mockAdData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle network errors gracefully', async () => {
      mockHttpClient.post.mockRejectedValue(new Error('Network error'));

      const result = await service.createAd(adGroupId, mockAdData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  // ========================================================================
  // updateAd Tests (Task 2B.2.2)
  // ========================================================================

  describe('updateAd', () => {
    const adId = 'ad-123';

    it('should successfully update ad headlines', async () => {
      const newHeadlines: AdAsset[] = [
        { text: 'New Headline 1' },
        { text: 'New Headline 2' },
        { text: 'New Headline 3' },
      ];

      const updates: MarinAdUpdateRequest = {
        headlines: newHeadlines,
      };

      const mockResponse: MarinAdResponse = {
        id: adId,
        accountId: 'test-account-123',
        adGroupId: 'adgroup-123',
        type: 'RESPONSIVE_SEARCH_AD',
        headlines: newHeadlines,
        descriptions: [
          { text: 'Description 1' },
          { text: 'Description 2' },
        ],
        finalUrl: 'https://www.example.com',
        status: 'SUCCESS',
      };

      mockHttpClient.put.mockResolvedValue({ data: mockResponse });

      const result = await service.updateAd(adId, updates);

      expect(result.success).toBe(true);
      expect(result.adId).toBe(adId);
      expect(result.details).toEqual(mockResponse);
      expect(mockHttpClient.put).toHaveBeenCalledWith(
        '/dispatcher/google/ads/ad-123',
        { headlines: newHeadlines }
      );
    });

    it('should successfully update ad descriptions', async () => {
      const newDescriptions: AdAsset[] = [
        { text: 'New Description 1' },
        { text: 'New Description 2' },
      ];

      const updates: MarinAdUpdateRequest = {
        descriptions: newDescriptions,
      };

      const mockResponse: MarinAdResponse = {
        id: adId,
        accountId: 'test-account-123',
        adGroupId: 'adgroup-123',
        type: 'RESPONSIVE_SEARCH_AD',
        headlines: [
          { text: 'Headline 1' },
          { text: 'Headline 2' },
          { text: 'Headline 3' },
        ],
        descriptions: newDescriptions,
        finalUrl: 'https://www.example.com',
        status: 'SUCCESS',
      };

      mockHttpClient.put.mockResolvedValue({ data: mockResponse });

      const result = await service.updateAd(adId, updates);

      expect(result.success).toBe(true);
      expect(result.adId).toBe(adId);
      expect(mockHttpClient.put).toHaveBeenCalledWith(
        '/dispatcher/google/ads/ad-123',
        { descriptions: newDescriptions }
      );
    });

    it('should successfully update ad finalUrl', async () => {
      const updates: MarinAdUpdateRequest = {
        finalUrl: 'https://www.newexample.com',
      };

      const mockResponse: MarinAdResponse = {
        id: adId,
        accountId: 'test-account-123',
        adGroupId: 'adgroup-123',
        type: 'RESPONSIVE_SEARCH_AD',
        headlines: [
          { text: 'Headline 1' },
          { text: 'Headline 2' },
          { text: 'Headline 3' },
        ],
        descriptions: [
          { text: 'Description 1' },
          { text: 'Description 2' },
        ],
        finalUrl: 'https://www.newexample.com',
        status: 'SUCCESS',
      };

      mockHttpClient.put.mockResolvedValue({ data: mockResponse });

      const result = await service.updateAd(adId, updates);

      expect(result.success).toBe(true);
      expect(result.adId).toBe(adId);
      expect(mockHttpClient.put).toHaveBeenCalledWith(
        '/dispatcher/google/ads/ad-123',
        { finalUrl: 'https://www.newexample.com' }
      );
    });

    it('should successfully update multiple fields at once', async () => {
      const updates: MarinAdUpdateRequest = {
        headlines: [
          { text: 'Updated Headline 1' },
          { text: 'Updated Headline 2' },
          { text: 'Updated Headline 3' },
        ],
        descriptions: [
          { text: 'Updated Description 1' },
          { text: 'Updated Description 2' },
        ],
        finalUrl: 'https://www.updated.com',
        displayUrl: 'www.updated.com',
        paths: ['new', 'path'],
      };

      const mockResponse: MarinAdResponse = {
        id: adId,
        accountId: 'test-account-123',
        adGroupId: 'adgroup-123',
        type: 'RESPONSIVE_SEARCH_AD',
        headlines: updates.headlines!,
        descriptions: updates.descriptions!,
        finalUrl: updates.finalUrl!,
        displayUrl: updates.displayUrl,
        paths: updates.paths,
        status: 'SUCCESS',
      };

      mockHttpClient.put.mockResolvedValue({ data: mockResponse });

      const result = await service.updateAd(adId, updates);

      expect(result.success).toBe(true);
      expect(result.adId).toBe(adId);
      expect(mockHttpClient.put).toHaveBeenCalledWith(
        '/dispatcher/google/ads/ad-123',
        updates
      );
    });

    it('should remove undefined fields from update request', async () => {
      const updates: MarinAdUpdateRequest = {
        finalUrl: 'https://www.example.com',
        headlines: undefined,
        descriptions: undefined,
        displayUrl: undefined,
        paths: undefined,
      };

      const mockResponse: MarinAdResponse = {
        id: adId,
        accountId: 'test-account-123',
        adGroupId: 'adgroup-123',
        type: 'RESPONSIVE_SEARCH_AD',
        headlines: [
          { text: 'Headline 1' },
          { text: 'Headline 2' },
          { text: 'Headline 3' },
        ],
        descriptions: [
          { text: 'Description 1' },
          { text: 'Description 2' },
        ],
        finalUrl: 'https://www.example.com',
        status: 'SUCCESS',
      };

      mockHttpClient.put.mockResolvedValue({ data: mockResponse });

      const result = await service.updateAd(adId, updates);

      expect(result.success).toBe(true);
      expect(mockHttpClient.put).toHaveBeenCalledWith(
        '/dispatcher/google/ads/ad-123',
        { finalUrl: 'https://www.example.com' } // Only defined field should be sent
      );
    });

    it('should return error when no valid fields to update', async () => {
      const updates: MarinAdUpdateRequest = {};

      const result = await service.updateAd(adId, updates);

      expect(result.success).toBe(false);
      expect(result.error).toBe('No valid fields to update');
      expect(mockHttpClient.put).not.toHaveBeenCalled();
    });

    it('should handle API errors gracefully', async () => {
      const updates: MarinAdUpdateRequest = {
        finalUrl: 'https://www.example.com',
      };

      mockHttpClient.put.mockRejectedValue({
        response: {
          status: 404,
          data: { error: 'Ad not found' },
        },
      });

      const result = await service.updateAd(adId, updates);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle network errors gracefully', async () => {
      const updates: MarinAdUpdateRequest = {
        finalUrl: 'https://www.example.com',
      };

      mockHttpClient.put.mockRejectedValue(new Error('Network error'));

      const result = await service.updateAd(adId, updates);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  // ========================================================================
  // X-Ray Integration Tests (Task 2B.4)
  // ========================================================================

  describe('X-Ray Tracing Integration', () => {
    it('should create subsegment for createAdGroup', async () => {
      const mockSubsegment = {
        close: jest.fn(),
      };
      const mockSegment = {
        addNewSubsegment: jest.fn().mockReturnValue(mockSubsegment),
      };
      (AWSXRay.getSegment as jest.Mock).mockReturnValue(mockSegment);

      const mockResponse: MarinAdGroupResponse = {
        id: 'adgroup-123',
        accountId: 'test-account-123',
        campaignId: 'campaign-123',
        name: 'Test Ad Group',
        adGroupStatus: 'ENABLED',
        status: 'SUCCESS',
      };

      mockHttpClient.post.mockResolvedValue({ data: mockResponse });

      await service.createAdGroup('campaign-123', { name: 'Test Ad Group' });

      expect(mockSegment.addNewSubsegment).toHaveBeenCalledWith('MarinDispatcher.createAdGroup');
      expect(mockSubsegment.close).toHaveBeenCalled();
    });

    it('should create subsegment for updateAdGroup', async () => {
      const mockSubsegment = {
        close: jest.fn(),
      };
      const mockSegment = {
        addNewSubsegment: jest.fn().mockReturnValue(mockSubsegment),
      };
      (AWSXRay.getSegment as jest.Mock).mockReturnValue(mockSegment);

      const mockResponse: MarinAdGroupResponse = {
        id: 'adgroup-123',
        accountId: 'test-account-123',
        campaignId: 'campaign-123',
        name: 'Updated Ad Group',
        adGroupStatus: 'ENABLED',
        status: 'SUCCESS',
      };

      mockHttpClient.put.mockResolvedValue({ data: mockResponse });

      await service.updateAdGroup('adgroup-123', { name: 'Updated Ad Group' });

      expect(mockSegment.addNewSubsegment).toHaveBeenCalledWith('MarinDispatcher.updateAdGroup');
      expect(mockSubsegment.close).toHaveBeenCalled();
    });

    it('should create subsegment for createAd', async () => {
      const mockSubsegment = {
        close: jest.fn(),
      };
      const mockSegment = {
        addNewSubsegment: jest.fn().mockReturnValue(mockSubsegment),
      };
      (AWSXRay.getSegment as jest.Mock).mockReturnValue(mockSegment);

      const mockResponse: MarinAdResponse = {
        id: 'ad-123',
        accountId: 'test-account-123',
        adGroupId: 'adgroup-123',
        type: 'RESPONSIVE_SEARCH_AD',
        headlines: [
          { text: 'Headline 1' },
          { text: 'Headline 2' },
          { text: 'Headline 3' },
        ],
        descriptions: [
          { text: 'Description 1' },
          { text: 'Description 2' },
        ],
        finalUrl: 'https://www.example.com',
        status: 'SUCCESS',
      };

      mockHttpClient.post.mockResolvedValue({ data: mockResponse });

      await service.createAd('adgroup-123', {
        type: 'RESPONSIVE_SEARCH_AD',
        headlines: [
          { text: 'Headline 1' },
          { text: 'Headline 2' },
          { text: 'Headline 3' },
        ],
        descriptions: [
          { text: 'Description 1' },
          { text: 'Description 2' },
        ],
        finalUrl: 'https://www.example.com',
      });

      expect(mockSegment.addNewSubsegment).toHaveBeenCalledWith('MarinDispatcher.createAd');
      expect(mockSubsegment.close).toHaveBeenCalled();
    });

    it('should create subsegment for updateAd', async () => {
      const mockSubsegment = {
        close: jest.fn(),
      };
      const mockSegment = {
        addNewSubsegment: jest.fn().mockReturnValue(mockSubsegment),
      };
      (AWSXRay.getSegment as jest.Mock).mockReturnValue(mockSegment);

      const mockResponse: MarinAdResponse = {
        id: 'ad-123',
        accountId: 'test-account-123',
        adGroupId: 'adgroup-123',
        type: 'RESPONSIVE_SEARCH_AD',
        headlines: [
          { text: 'Headline 1' },
          { text: 'Headline 2' },
          { text: 'Headline 3' },
        ],
        descriptions: [
          { text: 'Description 1' },
          { text: 'Description 2' },
        ],
        finalUrl: 'https://www.updated.com',
        status: 'SUCCESS',
      };

      mockHttpClient.put.mockResolvedValue({ data: mockResponse });

      await service.updateAd('ad-123', { finalUrl: 'https://www.updated.com' });

      expect(mockSegment.addNewSubsegment).toHaveBeenCalledWith('MarinDispatcher.updateAd');
      expect(mockSubsegment.close).toHaveBeenCalled();
    });
  });
});
