/**
 * Campaign CRUD Operations Tests for ZilkrDispatcherService (Task 4.2.1)
 *
 * Tests all campaign CRUD operations: create, read, update, pause, resume, delete
 * Includes validation tests and error scenario tests
 *
 * @module marinDispatcherService.crud.test
 */

import { ZilkrDispatcherService } from '../../services/zilkrDispatcherService';
import { CampaignPlan } from '../../types/ai.types';
import axios from 'axios';
import * as AWSXRay from 'aws-xray-sdk-core';
import {
  ZilkrCampaignResponse,
  ZilkrCampaignRequest,
} from '../../types/marinDispatcher.types';

// Mock dependencies
jest.mock('axios');
jest.mock('aws-xray-sdk-core');
jest.mock('../../config/env', () => {
  const mockConfig = {
    zilkrDispatcher: {
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

describe('ZilkrDispatcherService - Campaign CRUD Tests (Task 4.2.1)', () => {
  let service: ZilkrDispatcherService;
  let mockHttpClient: any;
  let mockSegment: any;
  let mockSubsegment: any;

  // Sample campaign plan for testing
  const sampleCampaignPlan: CampaignPlan = {
    objective: 'MAXIMIZE_CONVERSIONS',
    budget: {
      total: 1000,
      daily: 100,
      currency: 'USD',
    },
    targetAudience: {
      demographics: {
        age: '18-34',
        gender: 'ALL',
        location: 'United States',
        interests: ['Technology', 'Shopping'],
      },
    },
    timeline: {
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      duration: 365,
    },
    platforms: ['google'],
    kpis: {
      primary: 'CONVERSIONS',
      secondary: ['CLICKS', 'CTR'],
    },
    adGroups: [],
  };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock X-Ray segment and subsegment
    mockSubsegment = {
      close: jest.fn(),
    };
    mockSegment = {
      addNewSubsegment: jest.fn().mockReturnValue(mockSubsegment),
    };
    (AWSXRay.getSegment as jest.Mock).mockReturnValue(mockSegment);

    // Create mock HTTP client
    mockHttpClient = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    };

    // Mock axios.create to return our mock HTTP client
    mockedAxios.create.mockReturnValue(mockHttpClient as any);

    // Initialize service
    service = new ZilkrDispatcherService('test-account-123', 'google');
  });

  // ========================================================================
  // Test 1: createCampaign() with valid data
  // ========================================================================

  describe('createCampaign() - Valid Data', () => {
    it('should create campaign with valid data and return campaign ID', async () => {
      const mockResponse: ZilkrCampaignResponse = {
        id: 'marin-campaign-123',
        resourceId: 'google-campaign-456',
        accountId: 'test-account-123',
        name: 'Test Campaign',
        campaignStatus: 'ENABLED',
        status: 'SUCCESS',
        budget: {
          amount: 1000,
          deliveryMethod: 'STANDARD',
        },
        biddingStrategy: 'MANUAL_CPC',
        createdAt: '2025-11-11T10:00:00Z',
        updatedAt: '2025-11-11T10:00:00Z',
      };

      mockHttpClient.post.mockResolvedValue({ data: mockResponse });

      const result = await service.createCampaign(sampleCampaignPlan, 'Test Campaign');

      expect(result.success).toBe(true);
      expect(result.campaignId).toBe('google-campaign-456'); // Uses resourceId
      expect(result.details?.id).toBe('marin-campaign-123');
      expect(result.details?.name).toBe('Test Campaign');
      expect(result.details?.status).toBe('ENABLED');
    });

    it('should verify budget is NOT converted to micros', async () => {
      const mockBudgetResponse = {
        status: 'SUCCESS',
        budgetId: 'budget-123',
        resourceName: 'customers/test/campaignBudgets/budget-123',
        amount: 1000,
        deliveryMethod: 'STANDARD',
      };

      const mockCampaignResponse: ZilkrCampaignResponse = {
        id: 'marin-campaign-123',
        resourceId: 'google-campaign-456',
        accountId: 'test-account-123',
        name: 'Budget Test Campaign',
        campaignStatus: 'ENABLED',
        status: 'SUCCESS',
        budget: {
          amount: 1000,
          deliveryMethod: 'STANDARD',
        },
        biddingStrategy: 'MANUAL_CPC',
      };

      mockHttpClient.post
        .mockResolvedValueOnce({ data: mockBudgetResponse })
        .mockResolvedValueOnce({ data: mockCampaignResponse });

      await service.createCampaign(sampleCampaignPlan, 'Budget Test Campaign');

      // Verify budget creation call (first call)
      expect(mockHttpClient.post).toHaveBeenNthCalledWith(
        1,
        '/api/v2/dispatcher/google/campaign-budgets',
        expect.objectContaining({
          amount: 1000, // Verify NO micros conversion
          deliveryMethod: 'STANDARD',
        })
      );

      // Verify campaign creation call (second call) with budget reference
      expect(mockHttpClient.post).toHaveBeenNthCalledWith(
        2,
        '/api/v2/dispatcher/google/campaigns',
        expect.objectContaining({
          campaignBudget: 'customers/test/campaignBudgets/budget-123',
        })
      );
    });

    it('should verify status is ENABLED by default', async () => {
      const mockResponse: ZilkrCampaignResponse = {
        id: 'marin-campaign-123',
        resourceId: 'google-campaign-456',
        accountId: 'test-account-123',
        name: 'Status Test Campaign',
        campaignStatus: 'ENABLED',
        status: 'SUCCESS',
        budget: { amount: 1000, deliveryMethod: 'STANDARD' },
        biddingStrategy: 'MANUAL_CPC',
      };

      mockHttpClient.post.mockResolvedValue({ data: mockResponse });

      await service.createCampaign(sampleCampaignPlan, 'Status Test Campaign');

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/api/v2/dispatcher/google/campaigns',
        expect.objectContaining({
          status: 'ENABLED', // Default status should be ENABLED
        })
      );
    });

    it('should include objective in campaign request', async () => {
      const mockBudgetResponse = {
        status: 'SUCCESS',
        budgetId: 'budget-123',
        resourceName: 'customers/test/campaignBudgets/budget-123',
        amount: 1000,
        deliveryMethod: 'STANDARD',
      };

      const mockCampaignResponse: ZilkrCampaignResponse = {
        id: 'marin-campaign-123',
        resourceId: 'google-campaign-456',
        accountId: 'test-account-123',
        name: 'Objective Test Campaign',
        campaignStatus: 'ENABLED',
        status: 'SUCCESS',
        budget: { amount: 1000, deliveryMethod: 'STANDARD' },
        biddingStrategy: 'MANUAL_CPC',
      };

      mockHttpClient.post
        .mockResolvedValueOnce({ data: mockBudgetResponse })
        .mockResolvedValueOnce({ data: mockCampaignResponse });

      await service.createCampaign(sampleCampaignPlan, 'Objective Test Campaign');

      expect(mockHttpClient.post).toHaveBeenNthCalledWith(
        2,
        '/api/v2/dispatcher/google/campaigns',
        expect.objectContaining({
          objective: 'MAXIMIZE_CONVERSIONS',
        })
      );
    });

    it('should use total budget if provided, otherwise daily budget', async () => {
      const planWithDailyOnly: CampaignPlan = {
        ...sampleCampaignPlan,
        budget: {
          total: 0,
          daily: 50,
          currency: 'USD',
        },
      };

      const mockBudgetResponse = {
        status: 'SUCCESS',
        budgetId: 'budget-daily',
        resourceName: 'customers/test/campaignBudgets/budget-daily',
        amount: 50,
        deliveryMethod: 'STANDARD',
      };

      const mockCampaignResponse: ZilkrCampaignResponse = {
        id: 'marin-campaign-123',
        resourceId: 'google-campaign-456',
        accountId: 'test-account-123',
        name: 'Daily Budget Campaign',
        campaignStatus: 'ENABLED',
        status: 'SUCCESS',
        budget: { amount: 50, deliveryMethod: 'STANDARD' },
        biddingStrategy: 'MANUAL_CPC',
      };

      mockHttpClient.post
        .mockResolvedValueOnce({ data: mockBudgetResponse })
        .mockResolvedValueOnce({ data: mockCampaignResponse });

      await service.createCampaign(planWithDailyOnly, 'Daily Budget Campaign');

      // Verify budget creation uses daily amount
      expect(mockHttpClient.post).toHaveBeenNthCalledWith(
        1,
        '/api/v2/dispatcher/google/campaign-budgets',
        expect.objectContaining({
          amount: 50, // Should use daily budget when total is not provided
          deliveryMethod: 'STANDARD',
        })
      );
    });
  });

  // ========================================================================
  // Test 2: getCampaignStatus()
  // ========================================================================

  describe('getCampaignStatus()', () => {
    it('should retrieve campaign status with valid campaign ID', async () => {
      const mockResponse: ZilkrCampaignResponse = {
        id: 'marin-campaign-123',
        resourceId: 'google-campaign-456',
        accountId: 'test-account-123',
        name: 'Test Campaign',
        campaignStatus: 'ENABLED',
        status: 'SUCCESS',
        budget: { amount: 1000, deliveryMethod: 'STANDARD' },
        biddingStrategy: 'MANUAL_CPC',
        createdAt: '2025-11-11T10:00:00Z',
        updatedAt: '2025-11-11T10:00:00Z',
      };

      mockHttpClient.get.mockResolvedValue({ data: mockResponse });

      const result = await service.getCampaignStatus('google-campaign-456');

      expect(result.success).toBe(true);
      expect(result.campaignId).toBe('google-campaign-456');
      expect(result.details?.status).toBe('ENABLED');
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/api/v2/dispatcher/google/campaigns/google-campaign-456'
      );
    });

    it('should return campaign details including budget and status', async () => {
      const mockResponse: ZilkrCampaignResponse = {
        id: 'marin-campaign-123',
        resourceId: 'google-campaign-456',
        accountId: 'test-account-123',
        name: 'Detailed Campaign',
        campaignStatus: 'PAUSED',
        status: 'SUCCESS',
        budget: { amount: 500, deliveryMethod: 'ACCELERATED' },
        biddingStrategy: 'TARGET_CPA',
        createdAt: '2025-11-11T10:00:00Z',
        updatedAt: '2025-11-11T11:00:00Z',
      };

      mockHttpClient.get.mockResolvedValue({ data: mockResponse });

      const result = await service.getCampaignStatus('google-campaign-456');

      expect(result.success).toBe(true);
      expect(result.details?.budget).toEqual({
        amount: 500,
        deliveryMethod: 'ACCELERATED',
      });
      expect(result.details?.biddingStrategy).toBe('TARGET_CPA');
      expect(result.details?.status).toBe('PAUSED');
    });
  });

  // ========================================================================
  // Test 3: updateCampaign()
  // ========================================================================

  describe('updateCampaign()', () => {
    it('should update campaign budget', async () => {
      const updates = {
        budget: {
          total: 2000,
          currency: 'USD',
        },
      };

      const mockResponse: ZilkrCampaignResponse = {
        id: 'marin-campaign-123',
        resourceId: 'google-campaign-456',
        accountId: 'test-account-123',
        name: 'Updated Campaign',
        campaignStatus: 'ENABLED',
        status: 'SUCCESS',
        budget: { amount: 2000, deliveryMethod: 'STANDARD' },
        biddingStrategy: 'MANUAL_CPC',
      };

      mockHttpClient.put.mockResolvedValue({ data: mockResponse });

      const result = await service.updateCampaign('google-campaign-456', updates);

      expect(result.success).toBe(true);
      expect(result.details?.budget?.amount).toBe(2000);
      expect(mockHttpClient.put).toHaveBeenCalledWith(
        '/api/v2/dispatcher/google/campaigns/google-campaign-456',
        expect.objectContaining({
          budget: {
            amount: 2000,
            deliveryMethod: 'STANDARD',
          },
        })
      );
    });

    it('should verify budget update is NOT converted to micros', async () => {
      const updates = {
        budget: {
          total: 1500,
          currency: 'USD',
        },
      };

      const mockResponse: ZilkrCampaignResponse = {
        id: 'marin-campaign-123',
        resourceId: 'google-campaign-456',
        accountId: 'test-account-123',
        name: 'Budget Update Campaign',
        campaignStatus: 'ENABLED',
        status: 'SUCCESS',
        budget: { amount: 1500, deliveryMethod: 'STANDARD' },
        biddingStrategy: 'MANUAL_CPC',
      };

      mockHttpClient.put.mockResolvedValue({ data: mockResponse });

      await service.updateCampaign('google-campaign-456', updates);

      expect(mockHttpClient.put).toHaveBeenCalledWith(
        '/api/v2/dispatcher/google/campaigns/google-campaign-456',
        expect.objectContaining({
          budget: {
            amount: 1500, // Verify NO micros conversion
            deliveryMethod: 'STANDARD',
          },
        })
      );
    });

    it('should return error when no valid fields to update', async () => {
      const result = await service.updateCampaign('google-campaign-456', {});

      expect(result.success).toBe(false);
      expect(result.error).toBe('No valid fields to update');
      expect(mockHttpClient.put).not.toHaveBeenCalled();
    });

    it('should validate campaignId is not empty', async () => {
      const result = await service.updateCampaign('', { budget: { total: 1000, currency: 'USD' } });

      expect(result.success).toBe(false);
      expect(result.error).toContain('campaignId is required');
      expect(mockHttpClient.put).not.toHaveBeenCalled();
    });
  });

  // ========================================================================
  // Test 4: pauseCampaign()
  // ========================================================================

  describe('pauseCampaign()', () => {
    it('should pause campaign by setting status to PAUSED', async () => {
      const mockResponse: ZilkrCampaignResponse = {
        id: 'marin-campaign-123',
        resourceId: 'google-campaign-456',
        accountId: 'test-account-123',
        name: 'Paused Campaign',
        campaignStatus: 'PAUSED',
        status: 'SUCCESS',
        budget: { amount: 1000, deliveryMethod: 'STANDARD' },
        biddingStrategy: 'MANUAL_CPC',
      };

      mockHttpClient.put.mockResolvedValue({ data: mockResponse });

      const result = await service.pauseCampaign('google-campaign-456');

      expect(result.success).toBe(true);
      expect(result.details?.status).toBe('PAUSED');
      expect(mockHttpClient.put).toHaveBeenCalledWith(
        '/api/v2/dispatcher/google/campaigns/google-campaign-456',
        { status: 'PAUSED' }
      );
    });

    it('should validate campaignId before pausing', async () => {
      const result = await service.pauseCampaign('');

      expect(result.success).toBe(false);
      expect(result.error).toContain('campaignId is required');
      expect(mockHttpClient.put).not.toHaveBeenCalled();
    });
  });

  // ========================================================================
  // Test 5: resumeCampaign()
  // ========================================================================

  describe('resumeCampaign()', () => {
    it('should resume campaign by setting status to ENABLED', async () => {
      const mockResponse: ZilkrCampaignResponse = {
        id: 'marin-campaign-123',
        resourceId: 'google-campaign-456',
        accountId: 'test-account-123',
        name: 'Resumed Campaign',
        campaignStatus: 'ENABLED',
        status: 'SUCCESS',
        budget: { amount: 1000, deliveryMethod: 'STANDARD' },
        biddingStrategy: 'MANUAL_CPC',
      };

      mockHttpClient.put.mockResolvedValue({ data: mockResponse });

      const result = await service.resumeCampaign('google-campaign-456');

      expect(result.success).toBe(true);
      expect(result.details?.status).toBe('ENABLED');
      expect(mockHttpClient.put).toHaveBeenCalledWith(
        '/api/v2/dispatcher/google/campaigns/google-campaign-456',
        { status: 'ENABLED' }
      );
    });

    it('should validate campaignId before resuming', async () => {
      const result = await service.resumeCampaign('');

      expect(result.success).toBe(false);
      expect(result.error).toContain('campaignId is required');
      expect(mockHttpClient.put).not.toHaveBeenCalled();
    });
  });

  // ========================================================================
  // Test 6: deleteCampaign()
  // ========================================================================

  describe('deleteCampaign()', () => {
    it('should delete campaign by setting status to REMOVED', async () => {
      const mockResponse: ZilkrCampaignResponse = {
        id: 'marin-campaign-123',
        resourceId: 'google-campaign-456',
        accountId: 'test-account-123',
        name: 'Deleted Campaign',
        campaignStatus: 'REMOVED',
        status: 'SUCCESS',
        budget: { amount: 1000, deliveryMethod: 'STANDARD' },
        biddingStrategy: 'MANUAL_CPC',
      };

      mockHttpClient.put.mockResolvedValue({ data: mockResponse });

      const result = await service.deleteCampaign('google-campaign-456');

      expect(result.success).toBe(true);
      expect(result.details?.status).toBe('REMOVED');
      expect(mockHttpClient.put).toHaveBeenCalledWith(
        '/api/v2/dispatcher/google/campaigns/google-campaign-456',
        { status: 'REMOVED' }
      );
    });

    it('should validate campaignId before deleting', async () => {
      const result = await service.deleteCampaign('');

      expect(result.success).toBe(false);
      expect(result.error).toContain('campaignId is required');
      expect(mockHttpClient.put).not.toHaveBeenCalled();
    });
  });

  // ========================================================================
  // Test 7: Error Scenarios
  // ========================================================================

  describe('Error Scenarios', () => {
    describe('Invalid Account ID', () => {
      it('should handle 401 Unauthorized for invalid account', async () => {
        mockHttpClient.post.mockRejectedValue({
          response: {
            status: 401,
            data: { error: 'Unauthorized: Invalid account ID' },
          },
        });

        const result = await service.createCampaign(sampleCampaignPlan, 'Test Campaign');

        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      });

      it('should handle 403 Forbidden for account access denied', async () => {
        mockHttpClient.get.mockRejectedValue({
          response: {
            status: 403,
            data: { error: 'Forbidden: Account access denied' },
          },
        });

        const result = await service.getCampaignStatus('google-campaign-456');

        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      });
    });

    describe('Invalid Campaign ID', () => {
      it('should handle 404 Not Found for non-existent campaign', async () => {
        mockHttpClient.get.mockRejectedValue({
          response: {
            status: 404,
            data: { error: 'Campaign not found' },
          },
        });

        const result = await service.getCampaignStatus('non-existent-campaign');

        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      });

      it('should handle 404 when updating non-existent campaign', async () => {
        mockHttpClient.put.mockRejectedValue({
          response: {
            status: 404,
            data: { error: 'Campaign not found' },
          },
        });

        const result = await service.updateCampaign('non-existent-campaign', {
          budget: { total: 1000, currency: 'USD' },
        });

        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      });
    });

    describe('Malformed Request Body', () => {
      it('should handle 400 Bad Request for invalid data', async () => {
        mockHttpClient.post.mockRejectedValue({
          response: {
            status: 400,
            data: { error: 'Bad Request: Invalid budget format' },
          },
        });

        const result = await service.createCampaign(sampleCampaignPlan, 'Test Campaign');

        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      });
    });

    describe('Network Timeout', () => {
      it('should handle connection timeout errors', async () => {
        mockHttpClient.post.mockRejectedValue({
          code: 'ECONNABORTED',
          message: 'timeout of 30000ms exceeded',
        });

        const result = await service.createCampaign(sampleCampaignPlan, 'Test Campaign');

        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      });

      it('should handle connection refused errors', async () => {
        mockHttpClient.get.mockRejectedValue({
          code: 'ECONNREFUSED',
          message: 'connect ECONNREFUSED 127.0.0.1:3000',
        });

        const result = await service.getCampaignStatus('google-campaign-456');

        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      });
    });

    describe('Server Errors', () => {
      it('should handle 500 Internal Server Error', async () => {
        mockHttpClient.post.mockRejectedValue({
          response: {
            status: 500,
            data: { error: 'Internal Server Error' },
          },
        });

        const result = await service.createCampaign(sampleCampaignPlan, 'Test Campaign');

        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      });

      it('should handle 503 Service Unavailable', async () => {
        mockHttpClient.put.mockRejectedValue({
          response: {
            status: 503,
            data: { error: 'Service temporarily unavailable' },
          },
        });

        const result = await service.pauseCampaign('google-campaign-456');

        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      });
    });
  });

  // ========================================================================
  // Test 8: X-Ray Tracing
  // ========================================================================

  describe('X-Ray Tracing', () => {
    it('should create subsegment for createCampaign', async () => {
      const mockResponse: ZilkrCampaignResponse = {
        id: 'marin-campaign-123',
        resourceId: 'google-campaign-456',
        accountId: 'test-account-123',
        name: 'Test Campaign',
        campaignStatus: 'ENABLED',
        status: 'SUCCESS',
        budget: { amount: 1000, deliveryMethod: 'STANDARD' },
        biddingStrategy: 'MANUAL_CPC',
      };

      mockHttpClient.post.mockResolvedValue({ data: mockResponse });

      await service.createCampaign(sampleCampaignPlan, 'Test Campaign');

      expect(mockSegment.addNewSubsegment).toHaveBeenCalledWith(
        'ZilkrDispatcher.createCampaign'
      );
      expect(mockSubsegment.close).toHaveBeenCalled();
    });

    it('should close subsegment even when error occurs', async () => {
      mockHttpClient.post.mockRejectedValue(new Error('Test error'));

      await service.createCampaign(sampleCampaignPlan, 'Test Campaign');

      expect(mockSubsegment.close).toHaveBeenCalled();
    });
  });
});
