/**
 * Unit tests for MarinDispatcherService Campaign Query Operations (Task 4.2.2)
 *
 * @module marinDispatcherService.campaignQuery.test
 */

import { MarinDispatcherService } from '../../services/marinDispatcherService';
import axios from 'axios';
import * as AWSXRay from 'aws-xray-sdk-core';
import {
  MarinCampaignResponse,
  MarinCampaignListResponse,
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

describe('MarinDispatcherService - Campaign Query Operations (Task 4.2.2)', () => {
  let service: MarinDispatcherService;
  let mockHttpClient: any;

  // Helper function to create mock campaigns
  const createMockCampaign = (id: string, name: string): MarinCampaignResponse => ({
    id,
    accountId: 'test-account-123',
    name,
    status: 'SUCCESS',
    campaignStatus: 'ENABLED',
    budget: {
      amount: 100.0,
      deliveryMethod: 'STANDARD',
    },
    biddingStrategy: 'MANUAL_CPC',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

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
  // queryCampaigns Tests
  // ========================================================================

  describe('queryCampaigns', () => {
    it('should successfully return a list of campaigns', async () => {
      // Create mock campaigns
      const mockCampaigns = [
        createMockCampaign('campaign-1', 'Summer Sale Campaign'),
        createMockCampaign('campaign-2', 'Winter Promotion'),
        createMockCampaign('campaign-3', 'Spring Collection'),
      ];

      const mockResponse: MarinCampaignListResponse = {
        campaigns: mockCampaigns,
        total: 3,
        limit: 10,
        offset: 0,
      };

      mockHttpClient.get.mockResolvedValue({ data: mockResponse });

      // Execute
      const result = await service.queryCampaigns();

      // Verify
      expect(result).toEqual(mockResponse);
      expect(result.campaigns).toHaveLength(3);
      expect(result.total).toBe(3);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/dispatcher/google/campaigns',
        {
          params: {
            accountId: 'test-account-123',
          },
        }
      );
    });

    it('should query campaigns with limit parameter', async () => {
      // Create mock campaigns
      const mockCampaigns = [
        createMockCampaign('campaign-1', 'Campaign 1'),
        createMockCampaign('campaign-2', 'Campaign 2'),
      ];

      const mockResponse: MarinCampaignListResponse = {
        campaigns: mockCampaigns,
        total: 10,
        limit: 2,
        offset: 0,
      };

      mockHttpClient.get.mockResolvedValue({ data: mockResponse });

      // Execute with limit
      const result = await service.queryCampaigns(2);

      // Verify
      expect(result).toEqual(mockResponse);
      expect(result.campaigns).toHaveLength(2);
      expect(result.limit).toBe(2);
      expect(result.total).toBe(10);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/dispatcher/google/campaigns',
        {
          params: {
            accountId: 'test-account-123',
            limit: 2,
          },
        }
      );
    });

    it('should query campaigns with offset parameter', async () => {
      // Create mock campaigns (second page)
      const mockCampaigns = [
        createMockCampaign('campaign-11', 'Campaign 11'),
        createMockCampaign('campaign-12', 'Campaign 12'),
      ];

      const mockResponse: MarinCampaignListResponse = {
        campaigns: mockCampaigns,
        total: 20,
        limit: 10,
        offset: 10,
      };

      mockHttpClient.get.mockResolvedValue({ data: mockResponse });

      // Execute with offset
      const result = await service.queryCampaigns(undefined, 10);

      // Verify
      expect(result).toEqual(mockResponse);
      expect(result.campaigns).toHaveLength(2);
      expect(result.offset).toBe(10);
      expect(result.total).toBe(20);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/dispatcher/google/campaigns',
        {
          params: {
            accountId: 'test-account-123',
            offset: 10,
          },
        }
      );
    });

    it('should query campaigns with both limit and offset parameters', async () => {
      // Create mock campaigns (specific page)
      const mockCampaigns = [
        createMockCampaign('campaign-6', 'Campaign 6'),
        createMockCampaign('campaign-7', 'Campaign 7'),
        createMockCampaign('campaign-8', 'Campaign 8'),
      ];

      const mockResponse: MarinCampaignListResponse = {
        campaigns: mockCampaigns,
        total: 25,
        limit: 5,
        offset: 5,
      };

      mockHttpClient.get.mockResolvedValue({ data: mockResponse });

      // Execute with both limit and offset
      const result = await service.queryCampaigns(5, 5);

      // Verify
      expect(result).toEqual(mockResponse);
      expect(result.campaigns).toHaveLength(3);
      expect(result.limit).toBe(5);
      expect(result.offset).toBe(5);
      expect(result.total).toBe(25);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/dispatcher/google/campaigns',
        {
          params: {
            accountId: 'test-account-123',
            limit: 5,
            offset: 5,
          },
        }
      );
    });

    it('should return empty list when no campaigns exist', async () => {
      const mockResponse: MarinCampaignListResponse = {
        campaigns: [],
        total: 0,
        limit: 10,
        offset: 0,
      };

      mockHttpClient.get.mockResolvedValue({ data: mockResponse });

      // Execute
      const result = await service.queryCampaigns();

      // Verify
      expect(result).toEqual(mockResponse);
      expect(result.campaigns).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network timeout');
      mockHttpClient.get.mockRejectedValue(networkError);

      // Execute and expect error
      await expect(service.queryCampaigns()).rejects.toThrow('Network timeout');

      // Verify error was logged
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/dispatcher/google/campaigns',
        {
          params: {
            accountId: 'test-account-123',
          },
        }
      );
    });

    it('should handle API errors with custom message', async () => {
      const apiError = {
        response: {
          data: {
            message: 'Invalid account ID',
          },
        },
      };
      mockHttpClient.get.mockRejectedValue(apiError);

      // Execute and expect error
      await expect(service.queryCampaigns()).rejects.toThrow('Invalid account ID');
    });

    it('should handle malformed responses', async () => {
      const malformedError = {
        message: 'Invalid response format',
      };
      mockHttpClient.get.mockRejectedValue(malformedError);

      // Execute and expect error
      await expect(service.queryCampaigns()).rejects.toThrow('Invalid response format');
    });

    it('should handle timeout errors', async () => {
      const timeoutError = {
        code: 'ECONNABORTED',
        message: 'timeout of 30000ms exceeded',
      };
      mockHttpClient.get.mockRejectedValue(timeoutError);

      // Execute and expect error
      await expect(service.queryCampaigns()).rejects.toThrow('timeout of 30000ms exceeded');
    });

    it('should handle 404 errors', async () => {
      const notFoundError = {
        response: {
          status: 404,
          data: {
            message: 'Endpoint not found',
          },
        },
        message: '404 Not Found',
      };
      mockHttpClient.get.mockRejectedValue(notFoundError);

      // Execute and expect error
      await expect(service.queryCampaigns()).rejects.toThrow('Endpoint not found');
    });

    it('should handle 500 server errors', async () => {
      const serverError = {
        response: {
          status: 500,
          data: {
            message: 'Internal server error',
          },
        },
        message: '500 Internal Server Error',
      };
      mockHttpClient.get.mockRejectedValue(serverError);

      // Execute and expect error
      await expect(service.queryCampaigns()).rejects.toThrow('Internal server error');
    });

    it('should query with limit of 0 (edge case)', async () => {
      const mockResponse: MarinCampaignListResponse = {
        campaigns: [],
        total: 100,
        limit: 0,
        offset: 0,
      };

      mockHttpClient.get.mockResolvedValue({ data: mockResponse });

      // Execute with limit of 0
      const result = await service.queryCampaigns(0);

      // Verify
      expect(result.campaigns).toHaveLength(0);
      expect(result.limit).toBe(0);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/dispatcher/google/campaigns',
        {
          params: {
            accountId: 'test-account-123',
            limit: 0,
          },
        }
      );
    });

    it('should query with large limit value', async () => {
      const mockCampaigns = Array.from({ length: 100 }, (_, i) =>
        createMockCampaign(`campaign-${i + 1}`, `Campaign ${i + 1}`)
      );

      const mockResponse: MarinCampaignListResponse = {
        campaigns: mockCampaigns,
        total: 500,
        limit: 100,
        offset: 0,
      };

      mockHttpClient.get.mockResolvedValue({ data: mockResponse });

      // Execute with large limit
      const result = await service.queryCampaigns(100);

      // Verify
      expect(result.campaigns).toHaveLength(100);
      expect(result.limit).toBe(100);
      expect(result.total).toBe(500);
    });

    it('should query with large offset value', async () => {
      const mockCampaigns = [
        createMockCampaign('campaign-991', 'Campaign 991'),
        createMockCampaign('campaign-992', 'Campaign 992'),
      ];

      const mockResponse: MarinCampaignListResponse = {
        campaigns: mockCampaigns,
        total: 1000,
        limit: 10,
        offset: 990,
      };

      mockHttpClient.get.mockResolvedValue({ data: mockResponse });

      // Execute with large offset
      const result = await service.queryCampaigns(10, 990);

      // Verify
      expect(result.campaigns).toHaveLength(2);
      expect(result.offset).toBe(990);
      expect(result.total).toBe(1000);
    });

    it('should verify X-Ray tracing is called', async () => {
      const mockResponse: MarinCampaignListResponse = {
        campaigns: [],
        total: 0,
        limit: 10,
        offset: 0,
      };

      mockHttpClient.get.mockResolvedValue({ data: mockResponse });

      const mockSubsegment = {
        close: jest.fn(),
      };

      const mockSegment = {
        addNewSubsegment: jest.fn().mockReturnValue(mockSubsegment),
      };

      (AWSXRay.getSegment as jest.Mock).mockReturnValue(mockSegment);

      // Execute
      await service.queryCampaigns();

      // Verify X-Ray tracing
      expect(AWSXRay.getSegment).toHaveBeenCalled();
      expect(mockSegment.addNewSubsegment).toHaveBeenCalledWith('MarinDispatcher.queryCampaigns');
      expect(mockSubsegment.close).toHaveBeenCalled();
    });
  });
});
