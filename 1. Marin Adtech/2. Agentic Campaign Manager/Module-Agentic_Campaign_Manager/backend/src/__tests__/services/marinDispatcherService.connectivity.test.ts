/**
 * API Connectivity Tests for MarinDispatcherService (Task 4.1.1)
 *
 * Tests the isAuthenticated() method and verifies API endpoint connectivity
 * Includes tests for valid and invalid configurations
 *
 * @module marinDispatcherService.connectivity.test
 */

import { MarinDispatcherService } from '../../services/marinDispatcherService';
import axios from 'axios';
import * as AWSXRay from 'aws-xray-sdk-core';

// Mock dependencies
jest.mock('axios');
jest.mock('aws-xray-sdk-core');

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('MarinDispatcherService - API Connectivity Tests (Task 4.1.1)', () => {
  let mockHttpClient: any;
  let mockSegment: any;
  let mockSubsegment: any;

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
    };

    // Mock axios.create to return our mock HTTP client
    mockedAxios.create.mockReturnValue(mockHttpClient as any);
  });

  // ========================================================================
  // Test 1: isAuthenticated() with valid configuration
  // ========================================================================

  describe('isAuthenticated() - Valid Configuration', () => {
    it('should return true when API endpoint is reachable with valid account', async () => {
      // Mock environment config
      jest.mock('../../config/env', () => ({
        __esModule: true,
        default: {
          marinDispatcher: {
            baseUrl: 'http://test-dispatcher.example.com',
            accountId: 'test-account-123',
            publisher: 'google',
            timeout: 30000,
          },
        },
      }));

      const service = new MarinDispatcherService('test-account-123', 'google');

      // Mock successful API response
      mockHttpClient.get.mockResolvedValue({
        status: 200,
        data: {
          campaigns: [],
          total: 0,
          limit: 1,
          offset: 0,
        },
      });

      const result = await service.isAuthenticated();

      expect(result).toBe(true);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/dispatcher/google/campaigns',
        {
          params: {
            accountId: 'test-account-123',
            limit: 1,
          },
        }
      );
      expect(mockSubsegment.close).toHaveBeenCalled();
    });

    it('should return true when API returns 200 status for Meta publisher', async () => {
      const service = new MarinDispatcherService('test-account-456', 'meta');

      mockHttpClient.get.mockResolvedValue({
        status: 200,
        data: {
          campaigns: [],
          total: 0,
        },
      });

      const result = await service.isAuthenticated();

      expect(result).toBe(true);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/dispatcher/meta/campaigns',
        expect.objectContaining({
          params: expect.objectContaining({
            accountId: 'test-account-456',
          }),
        })
      );
    });

    it('should return true when API returns 200 status for Microsoft publisher', async () => {
      const service = new MarinDispatcherService('test-account-789', 'microsoft');

      mockHttpClient.get.mockResolvedValue({
        status: 200,
        data: {
          campaigns: [],
          total: 0,
        },
      });

      const result = await service.isAuthenticated();

      expect(result).toBe(true);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/dispatcher/microsoft/campaigns',
        expect.objectContaining({
          params: expect.objectContaining({
            accountId: 'test-account-789',
          }),
        })
      );
    });
  });

  // ========================================================================
  // Test 2: API endpoint reachability
  // ========================================================================

  describe('API Endpoint Reachability', () => {
    it('should verify API endpoint is reachable', async () => {
      const service = new MarinDispatcherService('test-account-123', 'google');

      mockHttpClient.get.mockResolvedValue({
        status: 200,
        data: { campaigns: [], total: 0 },
      });

      const result = await service.isAuthenticated();

      expect(result).toBe(true);
      expect(mockHttpClient.get).toHaveBeenCalled();
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.stringContaining('/campaigns'),
        expect.any(Object)
      );
    });

    it('should handle network timeout errors', async () => {
      const service = new MarinDispatcherService('test-account-123', 'google');

      mockHttpClient.get.mockRejectedValue({
        code: 'ECONNABORTED',
        message: 'timeout of 30000ms exceeded',
      });

      const result = await service.isAuthenticated();

      expect(result).toBe(false);
      expect(mockSubsegment.close).toHaveBeenCalled();
    });

    it('should handle connection refused errors', async () => {
      const service = new MarinDispatcherService('test-account-123', 'google');

      mockHttpClient.get.mockRejectedValue({
        code: 'ECONNREFUSED',
        message: 'connect ECONNREFUSED 127.0.0.1:3000',
      });

      const result = await service.isAuthenticated();

      expect(result).toBe(false);
    });

    it('should handle DNS resolution errors', async () => {
      const service = new MarinDispatcherService('test-account-123', 'google');

      mockHttpClient.get.mockRejectedValue({
        code: 'ENOTFOUND',
        message: 'getaddrinfo ENOTFOUND invalid-host.example.com',
      });

      const result = await service.isAuthenticated();

      expect(result).toBe(false);
    });
  });

  // ========================================================================
  // Test 3: Invalid account ID
  // ========================================================================

  describe('Invalid Account ID', () => {
    it('should return false when API returns 401 for invalid account', async () => {
      const service = new MarinDispatcherService('invalid-account-id', 'google');

      mockHttpClient.get.mockRejectedValue({
        response: {
          status: 401,
          data: { error: 'Unauthorized: Invalid account ID' },
        },
      });

      const result = await service.isAuthenticated();

      expect(result).toBe(false);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/dispatcher/google/campaigns',
        expect.objectContaining({
          params: expect.objectContaining({
            accountId: 'invalid-account-id',
          }),
        })
      );
    });

    it('should return false when API returns 403 for forbidden account', async () => {
      const service = new MarinDispatcherService('forbidden-account', 'google');

      mockHttpClient.get.mockRejectedValue({
        response: {
          status: 403,
          data: { error: 'Forbidden: Account access denied' },
        },
      });

      const result = await service.isAuthenticated();

      expect(result).toBe(false);
    });

    it('should return false when API returns 404 for non-existent account', async () => {
      const service = new MarinDispatcherService('non-existent-account', 'google');

      mockHttpClient.get.mockRejectedValue({
        response: {
          status: 404,
          data: { error: 'Account not found' },
        },
      });

      const result = await service.isAuthenticated();

      expect(result).toBe(false);
    });

    it('should handle empty account ID', async () => {
      const service = new MarinDispatcherService('', 'google');

      mockHttpClient.get.mockRejectedValue({
        response: {
          status: 400,
          data: { error: 'Bad Request: Account ID is required' },
        },
      });

      const result = await service.isAuthenticated();

      expect(result).toBe(false);
    });
  });

  // ========================================================================
  // Test 4: Invalid publisher
  // ========================================================================

  describe('Invalid Publisher', () => {
    it('should return false when API returns 400 for invalid publisher', async () => {
      const service = new MarinDispatcherService('test-account-123', 'invalid-publisher');

      mockHttpClient.get.mockRejectedValue({
        response: {
          status: 400,
          data: { error: 'Invalid publisher: invalid-publisher' },
        },
      });

      const result = await service.isAuthenticated();

      expect(result).toBe(false);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/dispatcher/invalid-publisher/campaigns',
        expect.any(Object)
      );
    });

    it('should return false when API returns 404 for unsupported publisher', async () => {
      const service = new MarinDispatcherService('test-account-123', 'unsupported-publisher');

      mockHttpClient.get.mockRejectedValue({
        response: {
          status: 404,
          data: { error: 'Publisher not supported' },
        },
      });

      const result = await service.isAuthenticated();

      expect(result).toBe(false);
    });

    it('should handle publisher with special characters', async () => {
      const service = new MarinDispatcherService('test-account-123', 'pub@lisher!');

      mockHttpClient.get.mockRejectedValue({
        response: {
          status: 400,
          data: { error: 'Invalid publisher format' },
        },
      });

      const result = await service.isAuthenticated();

      expect(result).toBe(false);
    });

    it('should handle empty publisher', async () => {
      const service = new MarinDispatcherService('test-account-123', '');

      mockHttpClient.get.mockRejectedValue({
        response: {
          status: 400,
          data: { error: 'Publisher is required' },
        },
      });

      const result = await service.isAuthenticated();

      expect(result).toBe(false);
    });
  });

  // ========================================================================
  // Test 5: HTTP error responses
  // ========================================================================

  describe('HTTP Error Responses', () => {
    it('should return false on 500 Internal Server Error', async () => {
      const service = new MarinDispatcherService('test-account-123', 'google');

      mockHttpClient.get.mockRejectedValue({
        response: {
          status: 500,
          data: { error: 'Internal Server Error' },
        },
      });

      const result = await service.isAuthenticated();

      expect(result).toBe(false);
    });

    it('should return false on 502 Bad Gateway', async () => {
      const service = new MarinDispatcherService('test-account-123', 'google');

      mockHttpClient.get.mockRejectedValue({
        response: {
          status: 502,
          data: { error: 'Bad Gateway' },
        },
      });

      const result = await service.isAuthenticated();

      expect(result).toBe(false);
    });

    it('should return false on 503 Service Unavailable', async () => {
      const service = new MarinDispatcherService('test-account-123', 'google');

      mockHttpClient.get.mockRejectedValue({
        response: {
          status: 503,
          data: { error: 'Service Unavailable' },
        },
      });

      const result = await service.isAuthenticated();

      expect(result).toBe(false);
    });

    it('should return false on 429 Too Many Requests', async () => {
      const service = new MarinDispatcherService('test-account-123', 'google');

      mockHttpClient.get.mockRejectedValue({
        response: {
          status: 429,
          data: { error: 'Too Many Requests' },
        },
      });

      const result = await service.isAuthenticated();

      expect(result).toBe(false);
    });
  });

  // ========================================================================
  // Test 6: Error logging and X-Ray tracing
  // ========================================================================

  describe('Error Logging and X-Ray Tracing', () => {
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
      consoleErrorSpy.mockRestore();
    });

    it('should log errors when authentication fails', async () => {
      const service = new MarinDispatcherService('test-account-123', 'google');

      const testError = new Error('Connection failed');
      mockHttpClient.get.mockRejectedValue(testError);

      await service.isAuthenticated();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[Marin Dispatcher] Authentication check failed:',
        testError
      );
    });

    it('should create X-Ray subsegment for authentication check', async () => {
      const service = new MarinDispatcherService('test-account-123', 'google');

      mockHttpClient.get.mockResolvedValue({ status: 200, data: {} });

      await service.isAuthenticated();

      expect(AWSXRay.getSegment).toHaveBeenCalled();
      expect(mockSegment.addNewSubsegment).toHaveBeenCalledWith(
        'MarinDispatcher.isAuthenticated'
      );
      expect(mockSubsegment.close).toHaveBeenCalled();
    });

    it('should close X-Ray subsegment even when error occurs', async () => {
      const service = new MarinDispatcherService('test-account-123', 'google');

      mockHttpClient.get.mockRejectedValue(new Error('Test error'));

      await service.isAuthenticated();

      expect(mockSubsegment.close).toHaveBeenCalled();
    });
  });
});
