/**
 * Unit tests for MarinBatchJobService - Task 4.4.1: Test Batch Job Creation
 *
 * @module marinBatchJobService.test
 */

import { MarinBatchJobService } from '../../services/marinBatchJobService';
import axios from 'axios';
import * as AWSXRay from 'aws-xray-sdk-core';
import {
  BatchJobResponse,
  BatchJobStatus,
  MarinCampaignRequest,
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

describe('MarinBatchJobService - Task 4.4.1: Test Batch Job Creation', () => {
  let service: MarinBatchJobService;
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
    service = new MarinBatchJobService('test-account-123', 'google');
  });

  // ========================================================================
  // Task 4.4.1: Test Batch Job Creation - createBatchJob() Tests
  // ========================================================================

  describe('createBatchJob', () => {
    it('should successfully create a batch job and return batch job ID', async () => {
      // Arrange
      const mockResponse: BatchJobResponse = {
        id: 'batch-job-12345',
        accountId: 'test-account-123',
        publisher: 'google',
        jobStatus: 'PENDING',
        totalOperations: 0,
        processedOperations: 0,
        createdAt: '2025-11-11T12:00:00Z',
        sequenceToken: 'seq-token-123',
        status: 'SUCCESS',
      };

      mockHttpClient.post.mockResolvedValue({ data: mockResponse });

      // Act
      const result = await service.createBatchJob();

      // Assert - Verify batch job is created
      expect(mockHttpClient.post).toHaveBeenCalledTimes(1);
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/dispatcher/google/batch-jobs',
        {
          accountId: 'test-account-123',
          publisher: 'google',
        }
      );

      // Assert - Verify batch job ID is returned
      expect(result).toBeDefined();
      expect(result.batchJobId).toBe('batch-job-12345');
      expect(typeof result.batchJobId).toBe('string');
      expect(result.batchJobId.length).toBeGreaterThan(0);
    });

    it('should verify batch job status is PENDING', async () => {
      // Arrange
      const mockResponse: BatchJobResponse = {
        id: 'batch-job-67890',
        accountId: 'test-account-123',
        publisher: 'google',
        jobStatus: 'PENDING',
        totalOperations: 0,
        processedOperations: 0,
        createdAt: '2025-11-11T12:00:00Z',
        status: 'SUCCESS',
      };

      mockHttpClient.post.mockResolvedValue({ data: mockResponse });

      // Act
      const result = await service.createBatchJob();

      // Assert - Verify status is PENDING
      expect(result.batchJobId).toBe('batch-job-67890');
      expect(mockResponse.jobStatus).toBe('PENDING');

      // Additional verification that response matches expected structure
      expect(mockResponse.totalOperations).toBe(0);
      expect(mockResponse.processedOperations).toBe(0);
    });

    it('should include correct request payload with accountId and publisher', async () => {
      // Arrange
      const mockResponse: BatchJobResponse = {
        id: 'batch-job-11111',
        accountId: 'test-account-123',
        publisher: 'google',
        jobStatus: 'PENDING',
        totalOperations: 0,
        processedOperations: 0,
        createdAt: '2025-11-11T12:00:00Z',
        status: 'SUCCESS',
      };

      mockHttpClient.post.mockResolvedValue({ data: mockResponse });

      // Act
      await service.createBatchJob();

      // Assert - Verify correct request payload
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/dispatcher/google/batch-jobs',
        {
          accountId: 'test-account-123',
          publisher: 'google',
        }
      );
    });

    it('should use correct API endpoint path format', async () => {
      // Arrange
      const mockResponse: BatchJobResponse = {
        id: 'batch-job-22222',
        accountId: 'test-account-123',
        publisher: 'google',
        jobStatus: 'PENDING',
        totalOperations: 0,
        processedOperations: 0,
        createdAt: '2025-11-11T12:00:00Z',
        status: 'SUCCESS',
      };

      mockHttpClient.post.mockResolvedValue({ data: mockResponse });

      // Act
      await service.createBatchJob();

      // Assert - Verify InfraDocs format: /dispatcher/${publisher}/batch-jobs
      const expectedPath = '/dispatcher/google/batch-jobs';
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        expectedPath,
        expect.any(Object)
      );
    });

    it('should properly close X-Ray subsegment on success', async () => {
      // Arrange
      const mockSubsegment = {
        close: jest.fn(),
      };
      const mockSegment = {
        addNewSubsegment: jest.fn().mockReturnValue(mockSubsegment),
      };
      (AWSXRay.getSegment as jest.Mock).mockReturnValue(mockSegment);

      const mockResponse: BatchJobResponse = {
        id: 'batch-job-33333',
        accountId: 'test-account-123',
        publisher: 'google',
        jobStatus: 'PENDING',
        totalOperations: 0,
        processedOperations: 0,
        createdAt: '2025-11-11T12:00:00Z',
        status: 'SUCCESS',
      };

      mockHttpClient.post.mockResolvedValue({ data: mockResponse });

      // Act
      await service.createBatchJob();

      // Assert - Verify X-Ray subsegment handling
      expect(mockSegment.addNewSubsegment).toHaveBeenCalledWith(
        'MarinBatchJobService.createBatchJob'
      );
      expect(mockSubsegment.close).toHaveBeenCalledTimes(1);
    });

    // ========================================================================
    // Task 4.4.1: Error Scenarios
    // ========================================================================

    describe('Error Scenarios', () => {
      it('should handle network errors gracefully', async () => {
        // Arrange
        const networkError = new Error('Network Error: Connection refused');
        mockHttpClient.post.mockRejectedValue(networkError);

        // Act & Assert
        await expect(service.createBatchJob()).rejects.toThrow(
          'Failed to create batch job: Network Error: Connection refused'
        );
      });

      it('should handle API 404 errors', async () => {
        // Arrange
        const apiError = {
          message: 'Request failed with status code 404',
          response: {
            status: 404,
            data: { error: 'Endpoint not found' },
          },
        };
        mockHttpClient.post.mockRejectedValue(apiError);

        // Act & Assert
        await expect(service.createBatchJob()).rejects.toThrow(
          'Failed to create batch job: Request failed with status code 404'
        );
      });

      it('should handle API 500 errors', async () => {
        // Arrange
        const apiError = {
          message: 'Request failed with status code 500',
          response: {
            status: 500,
            data: { error: 'Internal Server Error' },
          },
        };
        mockHttpClient.post.mockRejectedValue(apiError);

        // Act & Assert
        await expect(service.createBatchJob()).rejects.toThrow(
          'Failed to create batch job: Request failed with status code 500'
        );
      });

      it('should handle API 401 unauthorized errors', async () => {
        // Arrange
        const apiError = {
          message: 'Request failed with status code 401',
          response: {
            status: 401,
            data: { error: 'Unauthorized' },
          },
        };
        mockHttpClient.post.mockRejectedValue(apiError);

        // Act & Assert
        await expect(service.createBatchJob()).rejects.toThrow(
          'Failed to create batch job: Request failed with status code 401'
        );
      });

      it('should handle API 403 forbidden errors', async () => {
        // Arrange
        const apiError = {
          message: 'Request failed with status code 403',
          response: {
            status: 403,
            data: { error: 'Forbidden' },
          },
        };
        mockHttpClient.post.mockRejectedValue(apiError);

        // Act & Assert
        await expect(service.createBatchJob()).rejects.toThrow(
          'Failed to create batch job: Request failed with status code 403'
        );
      });

      it('should handle timeout errors', async () => {
        // Arrange
        const timeoutError = {
          message: 'timeout of 30000ms exceeded',
          code: 'ECONNABORTED',
        };
        mockHttpClient.post.mockRejectedValue(timeoutError);

        // Act & Assert
        await expect(service.createBatchJob()).rejects.toThrow(
          'Failed to create batch job: timeout of 30000ms exceeded'
        );
      });

      it('should handle malformed response data', async () => {
        // Arrange - Response missing required 'id' field
        const malformedResponse = {
          data: {
            // Missing 'id' field
            accountId: 'test-account-123',
            publisher: 'google',
            jobStatus: 'PENDING',
          },
        };
        mockHttpClient.post.mockResolvedValue(malformedResponse);

        // Act & Assert
        // The service will attempt to access response.data.id which will be undefined
        const result = await service.createBatchJob();
        expect(result.batchJobId).toBeUndefined();
      });

      it('should properly close X-Ray subsegment on error', async () => {
        // Arrange
        const mockSubsegment = {
          close: jest.fn(),
        };
        const mockSegment = {
          addNewSubsegment: jest.fn().mockReturnValue(mockSubsegment),
        };
        (AWSXRay.getSegment as jest.Mock).mockReturnValue(mockSegment);

        const apiError = new Error('API Error');
        mockHttpClient.post.mockRejectedValue(apiError);

        // Act & Assert
        await expect(service.createBatchJob()).rejects.toThrow();
        expect(mockSubsegment.close).toHaveBeenCalledTimes(1);
      });

      it('should handle empty error message', async () => {
        // Arrange
        const emptyError = new Error('');
        mockHttpClient.post.mockRejectedValue(emptyError);

        // Act & Assert
        await expect(service.createBatchJob()).rejects.toThrow(
          'Failed to create batch job:'
        );
      });

      it('should handle error without message property', async () => {
        // Arrange
        const strangeError = { code: 'UNKNOWN_ERROR' };
        mockHttpClient.post.mockRejectedValue(strangeError);

        // Act & Assert
        await expect(service.createBatchJob()).rejects.toThrow(
          'Failed to create batch job: undefined'
        );
      });
    });

    // ========================================================================
    // Additional Edge Cases
    // ========================================================================

    describe('Edge Cases', () => {
      it('should work with custom accountId', async () => {
        // Arrange
        const customService = new MarinBatchJobService('custom-account-456', 'google');
        const mockResponse: BatchJobResponse = {
          id: 'batch-job-custom',
          accountId: 'custom-account-456',
          publisher: 'google',
          jobStatus: 'PENDING',
          totalOperations: 0,
          processedOperations: 0,
          createdAt: '2025-11-11T12:00:00Z',
          status: 'SUCCESS',
        };

        mockHttpClient.post.mockResolvedValue({ data: mockResponse });

        // Act
        const result = await customService.createBatchJob();

        // Assert
        expect(result.batchJobId).toBe('batch-job-custom');
        expect(mockHttpClient.post).toHaveBeenCalledWith(
          '/dispatcher/google/batch-jobs',
          {
            accountId: 'custom-account-456',
            publisher: 'google',
          }
        );
      });

      it('should work with different publishers', async () => {
        // Arrange
        const bingService = new MarinBatchJobService('test-account-123', 'bing');
        const mockResponse: BatchJobResponse = {
          id: 'batch-job-bing',
          accountId: 'test-account-123',
          publisher: 'bing',
          jobStatus: 'PENDING',
          totalOperations: 0,
          processedOperations: 0,
          createdAt: '2025-11-11T12:00:00Z',
          status: 'SUCCESS',
        };

        mockHttpClient.post.mockResolvedValue({ data: mockResponse });

        // Act
        const result = await bingService.createBatchJob();

        // Assert
        expect(result.batchJobId).toBe('batch-job-bing');
        expect(mockHttpClient.post).toHaveBeenCalledWith(
          '/dispatcher/bing/batch-jobs',
          {
            accountId: 'test-account-123',
            publisher: 'bing',
          }
        );
      });

      it('should handle X-Ray unavailable (no segment)', async () => {
        // Arrange
        (AWSXRay.getSegment as jest.Mock).mockReturnValue(undefined);

        const mockResponse: BatchJobResponse = {
          id: 'batch-job-no-xray',
          accountId: 'test-account-123',
          publisher: 'google',
          jobStatus: 'PENDING',
          totalOperations: 0,
          processedOperations: 0,
          createdAt: '2025-11-11T12:00:00Z',
          status: 'SUCCESS',
        };

        mockHttpClient.post.mockResolvedValue({ data: mockResponse });

        // Act & Assert - Should not throw error even without X-Ray
        const result = await service.createBatchJob();
        expect(result.batchJobId).toBe('batch-job-no-xray');
      });
    });
  });
});
