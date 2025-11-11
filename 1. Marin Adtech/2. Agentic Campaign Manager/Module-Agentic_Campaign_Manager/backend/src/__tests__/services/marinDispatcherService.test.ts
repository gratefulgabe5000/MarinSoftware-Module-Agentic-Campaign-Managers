/**
 * Unit tests for MarinDispatcherService Keyword Methods (Phase 2B.3)
 *
 * @module marinDispatcherService.test
 */

import { MarinDispatcherService } from '../../services/marinDispatcherService';
import axios from 'axios';
import * as AWSXRay from 'aws-xray-sdk-core';
import {
  MarinKeywordRequest,
  MarinKeywordResponse,
  MarinKeywordUpdateRequest,
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

describe('MarinDispatcherService - Keyword Methods', () => {
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
  // createKeywords Tests (Task 2B.3.1)
  // ========================================================================

  describe('createKeywords', () => {
    const adGroupId = 'adgroup-123';
    const mockKeywords: Omit<MarinKeywordRequest, 'accountId' | 'adGroupId'>[] = [
      {
        text: 'running shoes',
        matchType: 'BROAD',
        cpcBid: 1.5,
        status: 'ENABLED',
      },
      {
        text: 'nike running shoes',
        matchType: 'PHRASE',
        cpcBid: 2.0,
      },
      {
        text: 'buy running shoes online',
        matchType: 'EXACT',
        cpcBid: 2.5,
        status: 'PAUSED',
      },
    ];

    it('should successfully create keywords in bulk', async () => {
      const mockResponse: { keywords: MarinKeywordResponse[] } = {
        keywords: [
          {
            id: 'keyword-1',
            accountId: 'test-account-123',
            adGroupId: 'adgroup-123',
            text: 'running shoes',
            matchType: 'BROAD',
            cpcBid: 1.5,
            keywordStatus: 'ENABLED',
            status: 'SUCCESS',
          },
          {
            id: 'keyword-2',
            accountId: 'test-account-123',
            adGroupId: 'adgroup-123',
            text: 'nike running shoes',
            matchType: 'PHRASE',
            cpcBid: 2.0,
            keywordStatus: 'ENABLED',
            status: 'SUCCESS',
          },
          {
            id: 'keyword-3',
            accountId: 'test-account-123',
            adGroupId: 'adgroup-123',
            text: 'buy running shoes online',
            matchType: 'EXACT',
            cpcBid: 2.5,
            keywordStatus: 'PAUSED',
            status: 'SUCCESS',
          },
        ],
      };

      mockHttpClient.post.mockResolvedValue({ data: mockResponse });

      const result = await service.createKeywords(adGroupId, mockKeywords);

      expect(result.success).toBe(true);
      expect(result.keywords).toEqual(mockResponse.keywords);
      expect(result.keywords).toHaveLength(3);
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/dispatcher/google/keywords',
        expect.objectContaining({
          accountId: 'test-account-123',
          adGroupId: 'adgroup-123',
          keywords: expect.arrayContaining([
            expect.objectContaining({
              accountId: 'test-account-123',
              adGroupId: 'adgroup-123',
              text: 'running shoes',
              matchType: 'BROAD',
            }),
          ]),
        })
      );
    });

    it('should validate keyword text length (max 80 characters)', async () => {
      const longText = 'a'.repeat(81);
      const invalidKeywords: Omit<MarinKeywordRequest, 'accountId' | 'adGroupId'>[] = [
        {
          text: longText,
          matchType: 'BROAD',
        },
      ];

      const result = await service.createKeywords(adGroupId, invalidKeywords);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Validation failed');
      expect(result.error).toContain('text must not exceed 80 characters');
      expect(mockHttpClient.post).not.toHaveBeenCalled();
    });

    it('should validate keyword matchType', async () => {
      const invalidKeywords: any[] = [
        {
          text: 'test keyword',
          matchType: 'INVALID_TYPE',
        },
      ];

      const result = await service.createKeywords(adGroupId, invalidKeywords);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Validation failed');
      expect(result.error).toContain('matchType must be one of: BROAD, PHRASE, EXACT');
      expect(mockHttpClient.post).not.toHaveBeenCalled();
    });

    it('should validate cpcBid is positive if provided', async () => {
      const invalidKeywords: Omit<MarinKeywordRequest, 'accountId' | 'adGroupId'>[] = [
        {
          text: 'test keyword',
          matchType: 'BROAD',
          cpcBid: -1.5,
        },
      ];

      const result = await service.createKeywords(adGroupId, invalidKeywords);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Validation failed');
      expect(result.error).toContain('cpcBid must be a positive number');
      expect(mockHttpClient.post).not.toHaveBeenCalled();
    });

    it('should handle multiple validation errors across keywords', async () => {
      const invalidKeywords: any[] = [
        {
          text: 'a'.repeat(81), // Too long
          matchType: 'BROAD',
        },
        {
          text: 'valid keyword',
          matchType: 'INVALID_TYPE', // Invalid match type
        },
        {
          text: '', // Empty text
          matchType: 'PHRASE',
        },
      ];

      const result = await service.createKeywords(adGroupId, invalidKeywords);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Validation failed');
      expect(result.error).toContain('Keyword 0');
      expect(result.error).toContain('Keyword 1');
      expect(result.error).toContain('Keyword 2');
      expect(mockHttpClient.post).not.toHaveBeenCalled();
    });

    it('should handle API errors gracefully', async () => {
      mockHttpClient.post.mockRejectedValue({
        response: {
          status: 400,
          data: { error: 'Bad Request' },
        },
      });

      const result = await service.createKeywords(adGroupId, mockKeywords);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should create keywords with only required fields', async () => {
      const minimalKeywords: Omit<MarinKeywordRequest, 'accountId' | 'adGroupId'>[] = [
        {
          text: 'minimal keyword',
          matchType: 'EXACT',
        },
      ];

      const mockResponse: { keywords: MarinKeywordResponse[] } = {
        keywords: [
          {
            id: 'keyword-minimal',
            accountId: 'test-account-123',
            adGroupId: 'adgroup-123',
            text: 'minimal keyword',
            matchType: 'EXACT',
            keywordStatus: 'ENABLED',
            status: 'SUCCESS',
          },
        ],
      };

      mockHttpClient.post.mockResolvedValue({ data: mockResponse });

      const result = await service.createKeywords(adGroupId, minimalKeywords);

      expect(result.success).toBe(true);
      expect(result.keywords).toHaveLength(1);
      expect(mockHttpClient.post).toHaveBeenCalled();
    });

    it('should handle network errors gracefully', async () => {
      mockHttpClient.post.mockRejectedValue(new Error('Network error'));

      const result = await service.createKeywords(adGroupId, mockKeywords);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    // ========================================================================
    // Task 4.3.3: Integration & Error Tests
    // ========================================================================

    it('should create campaign, ad group, and keywords in sequence', async () => {
      // Step 1: Create a campaign
      const mockCampaignResponse: any = {
        id: 'campaign-keyword-test',
        accountId: 'test-account-123',
        name: 'Keyword Integration Test Campaign',
        status: 'SUCCESS',
        campaignStatus: 'ENABLED',
        budget: {
          amount: 100.0,
          deliveryMethod: 'STANDARD',
        },
        biddingStrategy: 'MANUAL_CPC',
      };

      // Step 2: Mock Ad Group Response
      const mockAdGroupResponse: any = {
        id: 'adgroup-keyword-test',
        accountId: 'test-account-123',
        campaignId: 'campaign-keyword-test',
        name: 'Keyword Test Ad Group',
        adGroupStatus: 'ENABLED',
        cpcBid: 2.0,
        status: 'SUCCESS',
      };

      // Step 3: Mock Keywords Response
      const mockKeywordsResponse: { keywords: MarinKeywordResponse[] } = {
        keywords: [
          {
            id: 'keyword-integration-1',
            accountId: 'test-account-123',
            adGroupId: 'adgroup-keyword-test',
            text: 'test keyword one',
            matchType: 'BROAD',
            cpcBid: 1.5,
            keywordStatus: 'ENABLED',
            status: 'SUCCESS',
          },
          {
            id: 'keyword-integration-2',
            accountId: 'test-account-123',
            adGroupId: 'adgroup-keyword-test',
            text: 'test keyword two',
            matchType: 'PHRASE',
            cpcBid: 2.0,
            keywordStatus: 'ENABLED',
            status: 'SUCCESS',
          },
          {
            id: 'keyword-integration-3',
            accountId: 'test-account-123',
            adGroupId: 'adgroup-keyword-test',
            text: 'test keyword three',
            matchType: 'EXACT',
            cpcBid: 2.5,
            keywordStatus: 'ENABLED',
            status: 'SUCCESS',
          },
        ],
      };

      // Mock all three API calls
      mockHttpClient.post
        .mockResolvedValueOnce({ data: mockCampaignResponse })  // Campaign creation
        .mockResolvedValueOnce({ data: mockAdGroupResponse })   // Ad Group creation
        .mockResolvedValueOnce({ data: mockKeywordsResponse }); // Keywords creation

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
        'Keyword Integration Test Campaign'
      );

      expect(campaignResult.success).toBe(true);
      expect(campaignResult.campaignId).toBe('campaign-keyword-test');

      // Then create ad group in that campaign
      const adGroupResult = await service.createAdGroup('campaign-keyword-test', {
        name: 'Keyword Test Ad Group',
        status: 'ENABLED',
        cpcBid: 2.0,
      });

      expect(adGroupResult.success).toBe(true);
      expect(adGroupResult.adGroupId).toBe('adgroup-keyword-test');

      // Finally create keywords in that ad group
      const testKeywords: Omit<MarinKeywordRequest, 'accountId' | 'adGroupId'>[] = [
        {
          text: 'test keyword one',
          matchType: 'BROAD',
          cpcBid: 1.5,
        },
        {
          text: 'test keyword two',
          matchType: 'PHRASE',
          cpcBid: 2.0,
        },
        {
          text: 'test keyword three',
          matchType: 'EXACT',
          cpcBid: 2.5,
        },
      ];

      const keywordsResult = await service.createKeywords('adgroup-keyword-test', testKeywords);

      expect(keywordsResult.success).toBe(true);
      expect(keywordsResult.keywords).toHaveLength(3);

      // Verify all keywords were created
      expect(keywordsResult.keywords).toEqual(mockKeywordsResponse.keywords);

      // Verify match types are correct
      expect(keywordsResult.keywords![0].matchType).toBe('BROAD');
      expect(keywordsResult.keywords![1].matchType).toBe('PHRASE');
      expect(keywordsResult.keywords![2].matchType).toBe('EXACT');

      // Verify bids are set correctly
      expect(keywordsResult.keywords![0].cpcBid).toBe(1.5);
      expect(keywordsResult.keywords![1].cpcBid).toBe(2.0);
      expect(keywordsResult.keywords![2].cpcBid).toBe(2.5);

      // Verify all three API calls were made in correct order
      expect(mockHttpClient.post).toHaveBeenCalledTimes(3);

      // Verify campaign creation call
      expect(mockHttpClient.post).toHaveBeenNthCalledWith(
        1,
        '/dispatcher/google/campaigns',
        expect.any(Object)
      );

      // Verify ad group creation call
      expect(mockHttpClient.post).toHaveBeenNthCalledWith(
        2,
        '/dispatcher/google/campaigns/campaign-keyword-test/adgroups',
        expect.objectContaining({
          campaignId: 'campaign-keyword-test',
          name: 'Keyword Test Ad Group',
        })
      );

      // Verify keywords creation call
      expect(mockHttpClient.post).toHaveBeenNthCalledWith(
        3,
        '/dispatcher/google/keywords',
        expect.objectContaining({
          accountId: 'test-account-123',
          adGroupId: 'adgroup-keyword-test',
          keywords: expect.arrayContaining([
            expect.objectContaining({
              text: 'test keyword one',
              matchType: 'BROAD',
              cpcBid: 1.5,
            }),
            expect.objectContaining({
              text: 'test keyword two',
              matchType: 'PHRASE',
              cpcBid: 2.0,
            }),
            expect.objectContaining({
              text: 'test keyword three',
              matchType: 'EXACT',
              cpcBid: 2.5,
            }),
          ]),
        })
      );
    });

    it('should return error when creating keywords with invalid ad group ID', async () => {
      const invalidAdGroupId = 'invalid-adgroup-id';

      // Mock API error for invalid ad group ID
      mockHttpClient.post.mockRejectedValue({
        response: {
          status: 404,
          data: {
            error: 'Ad group not found',
            message: `Ad group with ID ${invalidAdGroupId} does not exist`
          },
        },
      });

      const result = await service.createKeywords(invalidAdGroupId, mockKeywords);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/dispatcher/google/keywords',
        expect.objectContaining({
          adGroupId: invalidAdGroupId,
        })
      );
    });
  });

  // ========================================================================
  // updateKeywords Tests (Task 2B.3.2)
  // ========================================================================

  describe('updateKeywords', () => {
    const keywordId = 'keyword-123';

    it('should successfully update keyword text', async () => {
      const updates: MarinKeywordUpdateRequest = {
        text: 'updated keyword text',
      };

      const mockResponse: MarinKeywordResponse = {
        id: keywordId,
        accountId: 'test-account-123',
        adGroupId: 'adgroup-123',
        text: 'updated keyword text',
        matchType: 'BROAD',
        keywordStatus: 'ENABLED',
        status: 'SUCCESS',
      };

      mockHttpClient.put.mockResolvedValue({ data: mockResponse });

      const result = await service.updateKeywords(keywordId, updates);

      expect(result.success).toBe(true);
      expect(result.keywordId).toBe(keywordId);
      expect(result.details).toEqual(mockResponse);
      expect(mockHttpClient.put).toHaveBeenCalledWith(
        '/dispatcher/google/keywords/keyword-123',
        { text: 'updated keyword text' }
      );
    });

    it('should successfully update keyword matchType', async () => {
      const updates: MarinKeywordUpdateRequest = {
        matchType: 'EXACT',
      };

      const mockResponse: MarinKeywordResponse = {
        id: keywordId,
        accountId: 'test-account-123',
        adGroupId: 'adgroup-123',
        text: 'test keyword',
        matchType: 'EXACT',
        keywordStatus: 'ENABLED',
        status: 'SUCCESS',
      };

      mockHttpClient.put.mockResolvedValue({ data: mockResponse });

      const result = await service.updateKeywords(keywordId, updates);

      expect(result.success).toBe(true);
      expect(result.keywordId).toBe(keywordId);
      expect(mockHttpClient.put).toHaveBeenCalledWith(
        '/dispatcher/google/keywords/keyword-123',
        { matchType: 'EXACT' }
      );
    });

    it('should successfully update keyword cpcBid', async () => {
      const updates: MarinKeywordUpdateRequest = {
        cpcBid: 3.5,
      };

      const mockResponse: MarinKeywordResponse = {
        id: keywordId,
        accountId: 'test-account-123',
        adGroupId: 'adgroup-123',
        text: 'test keyword',
        matchType: 'BROAD',
        cpcBid: 3.5,
        keywordStatus: 'ENABLED',
        status: 'SUCCESS',
      };

      mockHttpClient.put.mockResolvedValue({ data: mockResponse });

      const result = await service.updateKeywords(keywordId, updates);

      expect(result.success).toBe(true);
      expect(result.keywordId).toBe(keywordId);
      expect(mockHttpClient.put).toHaveBeenCalledWith(
        '/dispatcher/google/keywords/keyword-123',
        { cpcBid: 3.5 }
      );
    });

    it('should successfully update keyword status', async () => {
      const updates: MarinKeywordUpdateRequest = {
        status: 'PAUSED',
      };

      const mockResponse: MarinKeywordResponse = {
        id: keywordId,
        accountId: 'test-account-123',
        adGroupId: 'adgroup-123',
        text: 'test keyword',
        matchType: 'BROAD',
        keywordStatus: 'PAUSED',
        status: 'SUCCESS',
      };

      mockHttpClient.put.mockResolvedValue({ data: mockResponse });

      const result = await service.updateKeywords(keywordId, updates);

      expect(result.success).toBe(true);
      expect(result.keywordId).toBe(keywordId);
      expect(mockHttpClient.put).toHaveBeenCalledWith(
        '/dispatcher/google/keywords/keyword-123',
        { status: 'PAUSED' }
      );
    });

    it('should successfully update multiple fields at once', async () => {
      const updates: MarinKeywordUpdateRequest = {
        text: 'new keyword text',
        matchType: 'PHRASE',
        cpcBid: 2.75,
        status: 'ENABLED',
      };

      const mockResponse: MarinKeywordResponse = {
        id: keywordId,
        accountId: 'test-account-123',
        adGroupId: 'adgroup-123',
        text: 'new keyword text',
        matchType: 'PHRASE',
        cpcBid: 2.75,
        keywordStatus: 'ENABLED',
        status: 'SUCCESS',
      };

      mockHttpClient.put.mockResolvedValue({ data: mockResponse });

      const result = await service.updateKeywords(keywordId, updates);

      expect(result.success).toBe(true);
      expect(result.keywordId).toBe(keywordId);
      expect(mockHttpClient.put).toHaveBeenCalledWith(
        '/dispatcher/google/keywords/keyword-123',
        {
          text: 'new keyword text',
          matchType: 'PHRASE',
          cpcBid: 2.75,
          status: 'ENABLED',
        }
      );
    });

    it('should remove undefined fields from update request', async () => {
      const updates: MarinKeywordUpdateRequest = {
        text: 'updated text',
        matchType: undefined,
        cpcBid: undefined,
        status: undefined,
      };

      const mockResponse: MarinKeywordResponse = {
        id: keywordId,
        accountId: 'test-account-123',
        adGroupId: 'adgroup-123',
        text: 'updated text',
        matchType: 'BROAD',
        keywordStatus: 'ENABLED',
        status: 'SUCCESS',
      };

      mockHttpClient.put.mockResolvedValue({ data: mockResponse });

      const result = await service.updateKeywords(keywordId, updates);

      expect(result.success).toBe(true);
      expect(mockHttpClient.put).toHaveBeenCalledWith(
        '/dispatcher/google/keywords/keyword-123',
        { text: 'updated text' } // Only defined field should be sent
      );
    });

    it('should return error when no valid fields to update', async () => {
      const updates: MarinKeywordUpdateRequest = {};

      const result = await service.updateKeywords(keywordId, updates);

      expect(result.success).toBe(false);
      expect(result.error).toBe('No valid fields to update');
      expect(mockHttpClient.put).not.toHaveBeenCalled();
    });

    it('should handle API errors gracefully', async () => {
      const updates: MarinKeywordUpdateRequest = {
        text: 'updated keyword',
      };

      mockHttpClient.put.mockRejectedValue({
        response: {
          status: 404,
          data: { error: 'Keyword not found' },
        },
      });

      const result = await service.updateKeywords(keywordId, updates);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
