import { Request, Response } from 'express';
import { PatternExtractionController } from '../../controllers/patternExtractionController';
import { GoogleAdsService } from '../../services/googleAdsService';
import { extractAllPatterns, extractHighPerformingKeywords, extractAdCopyPatterns } from '../../services/patternExtractionService';

// Mock dependencies
jest.mock('../../services/googleAdsService');
jest.mock('../../services/patternExtractionService');

describe('PatternExtractionController', () => {
  let controller: PatternExtractionController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    controller = new PatternExtractionController();
    mockRequest = {
      query: {},
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('queryPatterns', () => {
    it('should query patterns successfully', async () => {
      mockRequest.query = { accountId: 'test-account' };
      mockRequest.headers = { authorization: 'Bearer test-token' };

      const mockCampaigns = [{ id: 'c1', name: 'Campaign 1' }];
      const mockAdGroups = [{ id: 'ag1', name: 'Ad Group 1' }];
      const mockKeywords = [{ id: 'kw1', text: 'keyword' }];
      const mockAds = [{ id: 'ad1', headlines: ['Headline'] }];
      const mockPatterns = {
        adGroupStructures: { namingConvention: 'Test', themes: [], averageKeywordsPerGroup: 15 },
        highPerformingKeywords: [],
        adCopyPatterns: { headlineTemplates: [], descriptionTemplates: [], commonCTAs: [], averageHeadlinesPerAd: 15, averageDescriptionsPerAd: 4 },
        biddingPatterns: { averageCPC: 1.5, bidStrategy: 'MANUAL_CPC' },
      };

      (GoogleAdsService as jest.MockedClass<typeof GoogleAdsService>).mockImplementation(() => ({
        queryCampaigns: jest.fn().mockResolvedValue(mockCampaigns),
        queryAdGroups: jest.fn().mockResolvedValue(mockAdGroups),
        queryKeywords: jest.fn().mockResolvedValue(mockKeywords),
        queryAds: jest.fn().mockResolvedValue(mockAds),
      } as any));

      (extractAllPatterns as jest.Mock).mockResolvedValue(mockPatterns);

      await controller.queryPatterns(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          patterns: mockPatterns,
        })
      );
    });

    it('should return 400 if accountId is missing', async () => {
      mockRequest.query = {};

      await controller.queryPatterns(
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

    it('should handle date range parameters', async () => {
      mockRequest.query = {
        accountId: 'test-account',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      };

      (GoogleAdsService as jest.MockedClass<typeof GoogleAdsService>).mockImplementation(() => ({
        queryCampaigns: jest.fn().mockResolvedValue([]),
        queryAdGroups: jest.fn().mockResolvedValue([]),
        queryKeywords: jest.fn().mockResolvedValue([]),
        queryAds: jest.fn().mockResolvedValue([]),
      } as any));

      (extractAllPatterns as jest.Mock).mockResolvedValue({
        adGroupStructures: { namingConvention: 'Test', themes: [], averageKeywordsPerGroup: 15 },
        highPerformingKeywords: [],
        adCopyPatterns: { headlineTemplates: [], descriptionTemplates: [], commonCTAs: [], averageHeadlinesPerAd: 15, averageDescriptionsPerAd: 4 },
        biddingPatterns: { averageCPC: 1.5, bidStrategy: 'MANUAL_CPC' },
      });

      await controller.queryPatterns(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      mockRequest.query = { accountId: 'test-account' };

      (GoogleAdsService as jest.MockedClass<typeof GoogleAdsService>).mockImplementation(() => ({
        queryCampaigns: jest.fn().mockRejectedValue(new Error('Service error')),
        queryAdGroups: jest.fn(),
        queryKeywords: jest.fn(),
        queryAds: jest.fn(),
      } as any));

      await controller.queryPatterns(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Failed to query patterns',
        })
      );
    });
  });

  describe('getHighPerformingKeywords', () => {
    it('should return high-performing keywords', async () => {
      mockRequest.query = { accountId: 'test-account' };

      const mockKeywords = [
        { id: 'kw1', text: 'keyword', matchType: 'BROAD', ctr: 5.0, conversions: 10 },
      ];

      const mockHighPerforming = [
        { keyword: 'keyword', matchType: 'BROAD', ctr: 5.0, conversions: 10 },
      ];

      (GoogleAdsService as jest.MockedClass<typeof GoogleAdsService>).mockImplementation(() => ({
        queryKeywords: jest.fn().mockResolvedValue(mockKeywords),
      } as any));

      (extractHighPerformingKeywords as jest.Mock).mockReturnValue(mockHighPerforming);

      await controller.getHighPerformingKeywords(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
        })
      );
    });

    it('should return 400 if accountId is missing', async () => {
      mockRequest.query = {};

      await controller.getHighPerformingKeywords(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });

  describe('getAdCopyPatterns', () => {
    it('should return ad copy patterns', async () => {
      mockRequest.query = { accountId: 'test-account' };

      const mockAds = [
        { id: 'ad1', headlines: ['Headline'], descriptions: ['Description'] },
      ];

      const mockPatterns = {
        headlineTemplates: ['Test'],
        descriptionTemplates: ['Test'],
        commonCTAs: [],
        averageHeadlinesPerAd: 1,
        averageDescriptionsPerAd: 1,
      };

      (GoogleAdsService as jest.MockedClass<typeof GoogleAdsService>).mockImplementation(() => ({
        queryAds: jest.fn().mockResolvedValue(mockAds),
      } as any));

      (extractAdCopyPatterns as jest.Mock).mockReturnValue(mockPatterns);

      await controller.getAdCopyPatterns(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
        })
      );
    });

    it('should return 400 if accountId is missing', async () => {
      mockRequest.query = {};

      await controller.getAdCopyPatterns(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });
});

