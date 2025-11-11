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

  // ========================================================================
  // Task 4.4.2: Test Batch Job Operations
  // ========================================================================

  describe('Task 4.4.2: Batch Job Operations', () => {
    // ========================================================================
    // addOperationsToBatch() Tests
    // ========================================================================
    describe('addOperationsToBatch', () => {
      it('should add 10 operations to a batch job', async () => {
        // Arrange
        const batchJobId = 'batch-job-12345';
        const operations: any[] = Array.from({ length: 10 }, (_, i) => ({
          operationType: 'CREATE',
          resourceType: 'CAMPAIGN',
          resource: {
            accountId: 'test-account-123',
            name: `Campaign ${i + 1}`,
            status: 'ENABLED',
            budget: { amount: 1000, deliveryMethod: 'STANDARD' },
          },
        }));

        const mockResponse = {
          operationsAdded: 10,
          sequenceToken: 'seq-token-001',
          status: 'SUCCESS',
        };

        mockHttpClient.post.mockResolvedValue({ data: mockResponse });

        // Act
        const result = await service.addOperationsToBatch(batchJobId, operations);

        // Assert
        expect(mockHttpClient.post).toHaveBeenCalledTimes(1);
        expect(mockHttpClient.post).toHaveBeenCalledWith(
          '/dispatcher/google/batch-jobs/batch-job-12345/operations',
          { operations }
        );
        expect(result.totalOperationsAdded).toBe(10);
        expect(result.sequenceToken).toBe('seq-token-001');
      });

      it('should add exactly 1000 operations to a batch job', async () => {
        // Arrange
        const batchJobId = 'batch-job-67890';
        const operations: any[] = Array.from({ length: 1000 }, (_, i) => ({
          operationType: 'CREATE',
          resourceType: 'CAMPAIGN',
          resource: {
            accountId: 'test-account-123',
            name: `Campaign ${i + 1}`,
            status: 'ENABLED',
            budget: { amount: 1000, deliveryMethod: 'STANDARD' },
          },
        }));

        const mockResponse = {
          operationsAdded: 1000,
          sequenceToken: 'seq-token-1000',
          status: 'SUCCESS',
        };

        mockHttpClient.post.mockResolvedValue({ data: mockResponse });

        // Act
        const result = await service.addOperationsToBatch(batchJobId, operations);

        // Assert
        expect(mockHttpClient.post).toHaveBeenCalledTimes(1);
        expect(result.totalOperationsAdded).toBe(1000);
        expect(result.sequenceToken).toBe('seq-token-1000');
      });

      it('should fail when adding >1000 operations without sequenceToken', async () => {
        // Arrange
        const batchJobId = 'batch-job-99999';
        const operations: any[] = Array.from({ length: 1001 }, (_, i) => ({
          operationType: 'CREATE',
          resourceType: 'CAMPAIGN',
          resource: {
            accountId: 'test-account-123',
            name: `Campaign ${i + 1}`,
            status: 'ENABLED',
            budget: { amount: 1000, deliveryMethod: 'STANDARD' },
          },
        }));

        // Act & Assert
        await expect(
          service.addOperationsToBatch(batchJobId, operations)
        ).rejects.toThrow('Maximum 1000 operations per request');

        // Verify no API call was made
        expect(mockHttpClient.post).not.toHaveBeenCalled();
      });

      it('should add >1000 operations using sequenceToken from previous call', async () => {
        // Arrange
        const batchJobId = 'batch-job-seq';
        const firstBatch: any[] = Array.from({ length: 1000 }, (_, i) => ({
          operationType: 'CREATE',
          resourceType: 'CAMPAIGN',
          resource: {
            accountId: 'test-account-123',
            name: `Campaign ${i + 1}`,
            status: 'ENABLED',
            budget: { amount: 1000, deliveryMethod: 'STANDARD' },
          },
        }));

        const secondBatch: any[] = Array.from({ length: 500 }, (_, i) => ({
          operationType: 'CREATE',
          resourceType: 'CAMPAIGN',
          resource: {
            accountId: 'test-account-123',
            name: `Campaign ${i + 1001}`,
            status: 'ENABLED',
            budget: { amount: 1000, deliveryMethod: 'STANDARD' },
          },
        }));

        const firstResponse = {
          operationsAdded: 1000,
          sequenceToken: 'seq-token-first',
          status: 'SUCCESS',
        };

        const secondResponse = {
          operationsAdded: 500,
          sequenceToken: 'seq-token-second',
          status: 'SUCCESS',
        };

        mockHttpClient.post
          .mockResolvedValueOnce({ data: firstResponse })
          .mockResolvedValueOnce({ data: secondResponse });

        // Act - First batch
        const result1 = await service.addOperationsToBatch(
          batchJobId,
          firstBatch
        );

        // Assert first batch
        expect(result1.totalOperationsAdded).toBe(1000);
        expect(result1.sequenceToken).toBe('seq-token-first');

        // Act - Second batch with sequence token
        const result2 = await service.addOperationsToBatch(
          batchJobId,
          secondBatch,
          result1.sequenceToken
        );

        // Assert second batch
        expect(result2.totalOperationsAdded).toBe(500);
        expect(result2.sequenceToken).toBe('seq-token-second');

        // Verify API calls
        expect(mockHttpClient.post).toHaveBeenCalledTimes(2);
        expect(mockHttpClient.post).toHaveBeenNthCalledWith(
          1,
          '/dispatcher/google/batch-jobs/batch-job-seq/operations',
          { operations: firstBatch }
        );
        expect(mockHttpClient.post).toHaveBeenNthCalledWith(
          2,
          '/dispatcher/google/batch-jobs/batch-job-seq/operations',
          {
            operations: secondBatch,
            sequenceToken: 'seq-token-first',
          }
        );
      });

      it('should verify operations are added with correct structure', async () => {
        // Arrange
        const batchJobId = 'batch-job-verify';
        const operations: any[] = [
          {
            operationType: 'CREATE',
            resourceType: 'CAMPAIGN',
            resource: {
              accountId: 'test-account-123',
              name: 'Test Campaign',
              status: 'ENABLED',
              budget: { amount: 5000, deliveryMethod: 'STANDARD' },
              biddingStrategy: 'MANUAL_CPC',
            },
          },
        ];

        const mockResponse = {
          operationsAdded: 1,
          sequenceToken: 'seq-token-verify',
          status: 'SUCCESS',
        };

        mockHttpClient.post.mockResolvedValue({ data: mockResponse });

        // Act
        await service.addOperationsToBatch(batchJobId, operations);

        // Assert - Verify structure
        expect(mockHttpClient.post).toHaveBeenCalledWith(
          '/dispatcher/google/batch-jobs/batch-job-verify/operations',
          {
            operations: expect.arrayContaining([
              expect.objectContaining({
                operationType: 'CREATE',
                resourceType: 'CAMPAIGN',
                resource: expect.objectContaining({
                  accountId: 'test-account-123',
                  name: 'Test Campaign',
                  status: 'ENABLED',
                }),
              }),
            ]),
          }
        );
      });

      it('should handle empty operations array', async () => {
        // Arrange
        const batchJobId = 'batch-job-empty';
        const operations: any[] = [];

        // Act & Assert
        await expect(
          service.addOperationsToBatch(batchJobId, operations)
        ).rejects.toThrow('At least one operation is required');

        // Verify no API call was made
        expect(mockHttpClient.post).not.toHaveBeenCalled();
      });

      it('should handle invalid batchJobId', async () => {
        // Arrange
        const operations: any[] = [
          {
            operationType: 'CREATE',
            resourceType: 'CAMPAIGN',
            resource: { name: 'Test' },
          },
        ];

        // Act & Assert - Empty string
        await expect(
          service.addOperationsToBatch('', operations)
        ).rejects.toThrow('batchJobId is required and must be a non-empty string');

        // Act & Assert - Whitespace only
        await expect(
          service.addOperationsToBatch('   ', operations)
        ).rejects.toThrow('batchJobId is required and must be a non-empty string');

        // Verify no API call was made
        expect(mockHttpClient.post).not.toHaveBeenCalled();
      });
    });

    // ========================================================================
    // runBatchJob() Tests
    // ========================================================================
    describe('runBatchJob', () => {
      it('should start a batch job and verify status changes to RUNNING', async () => {
        // Arrange
        const batchJobId = 'batch-job-run-12345';

        mockHttpClient.post.mockResolvedValue({
          data: { status: 'SUCCESS' },
          status: 200
        });

        // Mock the status check to show RUNNING state
        const mockStatusResponse: BatchJobResponse = {
          id: batchJobId,
          accountId: 'test-account-123',
          publisher: 'google',
          jobStatus: 'RUNNING',
          totalOperations: 10,
          processedOperations: 0,
          createdAt: '2025-11-11T12:00:00Z',
          status: 'SUCCESS',
        };

        mockHttpClient.get.mockResolvedValue({ data: mockStatusResponse });

        // Act - Run the batch job
        await service.runBatchJob(batchJobId);

        // Assert - Verify run endpoint was called
        expect(mockHttpClient.post).toHaveBeenCalledTimes(1);
        expect(mockHttpClient.post).toHaveBeenCalledWith(
          '/dispatcher/google/batch-jobs/batch-job-run-12345/run'
        );

        // Verify status by making a status check
        const statusResponse = await mockHttpClient.get(
          `/dispatcher/google/batch-jobs/${batchJobId}`
        );
        expect(statusResponse.data.jobStatus).toBe('RUNNING');
      });

      it('should handle invalid batchJobId', async () => {
        // Act & Assert - Empty string
        await expect(service.runBatchJob('')).rejects.toThrow(
          'batchJobId is required and must be a non-empty string'
        );

        // Act & Assert - Whitespace only
        await expect(service.runBatchJob('   ')).rejects.toThrow(
          'batchJobId is required and must be a non-empty string'
        );

        // Verify no API call was made
        expect(mockHttpClient.post).not.toHaveBeenCalled();
      });

      it('should handle API errors when running batch job', async () => {
        // Arrange
        const batchJobId = 'batch-job-error';
        const apiError = {
          message: 'Request failed with status code 500',
          response: {
            status: 500,
            data: { error: 'Internal Server Error' },
          },
        };

        mockHttpClient.post.mockRejectedValue(apiError);

        // Act & Assert
        await expect(service.runBatchJob(batchJobId)).rejects.toThrow(
          'Failed to run batch job: Request failed with status code 500'
        );
      });
    });

    // ========================================================================
    // pollBatchJobStatus() Tests
    // ========================================================================
    describe('pollBatchJobStatus', () => {
      it('should poll until batch job status is DONE', async () => {
        // Arrange
        const batchJobId = 'batch-job-poll-done';

        const runningResponse: BatchJobResponse = {
          id: batchJobId,
          accountId: 'test-account-123',
          publisher: 'google',
          jobStatus: 'RUNNING',
          totalOperations: 100,
          processedOperations: 50,
          createdAt: '2025-11-11T12:00:00Z',
          status: 'SUCCESS',
        };

        const doneResponse: BatchJobResponse = {
          id: batchJobId,
          accountId: 'test-account-123',
          publisher: 'google',
          jobStatus: 'DONE',
          totalOperations: 100,
          processedOperations: 100,
          createdAt: '2025-11-11T12:00:00Z',
          completedAt: '2025-11-11T12:05:00Z',
          status: 'SUCCESS',
        };

        // Mock first call returns RUNNING, second call returns DONE
        mockHttpClient.get
          .mockResolvedValueOnce({ data: runningResponse })
          .mockResolvedValueOnce({ data: doneResponse });

        // Act
        const result = await service.pollBatchJobStatus(batchJobId, 10, 100);

        // Assert
        expect(result.jobStatus).toBe('DONE');
        expect(result.processedOperations).toBe(100);
        expect(mockHttpClient.get).toHaveBeenCalledTimes(2);
      });

      it('should poll until batch job status is FAILED', async () => {
        // Arrange
        const batchJobId = 'batch-job-poll-failed';

        const runningResponse: BatchJobResponse = {
          id: batchJobId,
          accountId: 'test-account-123',
          publisher: 'google',
          jobStatus: 'RUNNING',
          totalOperations: 100,
          processedOperations: 30,
          createdAt: '2025-11-11T12:00:00Z',
          status: 'SUCCESS',
        };

        const failedResponse: BatchJobResponse = {
          id: batchJobId,
          accountId: 'test-account-123',
          publisher: 'google',
          jobStatus: 'FAILED',
          totalOperations: 100,
          processedOperations: 40,
          createdAt: '2025-11-11T12:00:00Z',
          completedAt: '2025-11-11T12:03:00Z',
          status: 'FAILURE',
          errors: ['Batch job execution failed'],
        };

        // Mock first call returns RUNNING, second call returns FAILED
        mockHttpClient.get
          .mockResolvedValueOnce({ data: runningResponse })
          .mockResolvedValueOnce({ data: failedResponse });

        // Act
        const result = await service.pollBatchJobStatus(batchJobId, 10, 100);

        // Assert
        expect(result.jobStatus).toBe('FAILED');
        expect(result.errors).toContain('Batch job execution failed');
        expect(mockHttpClient.get).toHaveBeenCalledTimes(2);
      });

      it('should use exponential backoff when polling', async () => {
        // Arrange
        const batchJobId = 'batch-job-backoff';
        const startTime = Date.now();

        const runningResponse: BatchJobResponse = {
          id: batchJobId,
          accountId: 'test-account-123',
          publisher: 'google',
          jobStatus: 'RUNNING',
          totalOperations: 100,
          processedOperations: 25,
          createdAt: '2025-11-11T12:00:00Z',
          status: 'SUCCESS',
        };

        const doneResponse: BatchJobResponse = {
          ...runningResponse,
          jobStatus: 'DONE',
          processedOperations: 100,
          completedAt: '2025-11-11T12:05:00Z',
        };

        // Mock multiple RUNNING responses before DONE
        mockHttpClient.get
          .mockResolvedValueOnce({ data: runningResponse })
          .mockResolvedValueOnce({ data: runningResponse })
          .mockResolvedValueOnce({ data: runningResponse })
          .mockResolvedValueOnce({ data: doneResponse });

        // Act
        const result = await service.pollBatchJobStatus(batchJobId, 10, 100);
        const elapsedTime = Date.now() - startTime;

        // Assert
        expect(result.jobStatus).toBe('DONE');
        expect(mockHttpClient.get).toHaveBeenCalledTimes(4);

        // Exponential backoff: 100ms, 200ms, 300ms
        // Total expected delay: ~600ms (allowing for some variance)
        expect(elapsedTime).toBeGreaterThanOrEqual(500);
        expect(elapsedTime).toBeLessThan(1000);
      });

      it('should timeout after maxAttempts', async () => {
        // Arrange
        const batchJobId = 'batch-job-timeout';

        const runningResponse: BatchJobResponse = {
          id: batchJobId,
          accountId: 'test-account-123',
          publisher: 'google',
          jobStatus: 'RUNNING',
          totalOperations: 1000,
          processedOperations: 50,
          createdAt: '2025-11-11T12:00:00Z',
          status: 'SUCCESS',
        };

        // Always return RUNNING status
        mockHttpClient.get.mockResolvedValue({ data: runningResponse });

        // Act & Assert
        await expect(
          service.pollBatchJobStatus(batchJobId, 3, 10) // Only 3 attempts, 10ms interval
        ).rejects.toThrow('Batch job timeout: exceeded max polling attempts');

        // Verify we made exactly maxAttempts calls
        expect(mockHttpClient.get).toHaveBeenCalledTimes(3);
      });

      it('should verify status field (not done field) is checked', async () => {
        // Arrange
        const batchJobId = 'batch-job-status-field';

        // This response has a "done" property but we should check "jobStatus"
        const runningResponse: any = {
          id: batchJobId,
          accountId: 'test-account-123',
          publisher: 'google',
          jobStatus: 'RUNNING', // This is what we should check
          done: true, // This should be ignored
          totalOperations: 100,
          processedOperations: 50,
          createdAt: '2025-11-11T12:00:00Z',
          status: 'SUCCESS',
        };

        const doneResponse: BatchJobResponse = {
          id: batchJobId,
          accountId: 'test-account-123',
          publisher: 'google',
          jobStatus: 'DONE', // Correct field to check
          totalOperations: 100,
          processedOperations: 100,
          createdAt: '2025-11-11T12:00:00Z',
          completedAt: '2025-11-11T12:05:00Z',
          status: 'SUCCESS',
        };

        // Mock responses - should keep polling despite done: true
        mockHttpClient.get
          .mockResolvedValueOnce({ data: runningResponse })
          .mockResolvedValueOnce({ data: doneResponse });

        // Act
        const result = await service.pollBatchJobStatus(batchJobId, 10, 10);

        // Assert - Should have polled twice because jobStatus was RUNNING first
        expect(result.jobStatus).toBe('DONE');
        expect(mockHttpClient.get).toHaveBeenCalledTimes(2);
      });

      it('should handle CANCELLED status', async () => {
        // Arrange
        const batchJobId = 'batch-job-cancelled';

        const cancelledResponse: BatchJobResponse = {
          id: batchJobId,
          accountId: 'test-account-123',
          publisher: 'google',
          jobStatus: 'CANCELLED',
          totalOperations: 100,
          processedOperations: 30,
          createdAt: '2025-11-11T12:00:00Z',
          completedAt: '2025-11-11T12:02:00Z',
          status: 'SUCCESS',
        };

        mockHttpClient.get.mockResolvedValue({ data: cancelledResponse });

        // Act
        const result = await service.pollBatchJobStatus(batchJobId, 10, 10);

        // Assert
        expect(result.jobStatus).toBe('CANCELLED');
        expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
      });

      it('should handle invalid batchJobId', async () => {
        // Act & Assert - Empty string
        await expect(
          service.pollBatchJobStatus('', 10, 100)
        ).rejects.toThrow('batchJobId is required and must be a non-empty string');

        // Act & Assert - Whitespace only
        await expect(
          service.pollBatchJobStatus('   ', 10, 100)
        ).rejects.toThrow('batchJobId is required and must be a non-empty string');

        // Verify no API call was made
        expect(mockHttpClient.get).not.toHaveBeenCalled();
      });
    });

    // ========================================================================
    // getBatchJobResults() Tests
    // ========================================================================
    describe('getBatchJobResults', () => {
      it('should return batch job results with summary object', async () => {
        // Arrange
        const batchJobId = 'batch-job-results-12345';

        const mockResults = {
          jobId: batchJobId,
          jobStatus: 'DONE' as BatchJobStatus,
          summary: {
            total: 100,
            successful: 95,
            failed: 5,
          },
          results: [
            {
              operationId: 'op-1',
              status: 'SUCCESS',
              resourceId: 'campaign-001',
              resourceType: 'CAMPAIGN',
            },
            {
              operationId: 'op-2',
              status: 'SUCCESS',
              resourceId: 'campaign-002',
              resourceType: 'CAMPAIGN',
            },
          ],
          nextPageToken: undefined,
        };

        mockHttpClient.get.mockResolvedValue({ data: mockResults });

        // Act
        const result = await service.getBatchJobResults(batchJobId);

        // Assert - Verify summary object is included
        expect(result).toBeDefined();
        expect(result.summary).toBeDefined();
        expect(result.summary.total).toBe(100);
        expect(result.summary.successful).toBe(95);
        expect(result.summary.failed).toBe(5);

        // Verify API call
        expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
        expect(mockHttpClient.get).toHaveBeenCalledWith(
          '/dispatcher/google/batch-jobs/batch-job-results-12345/results'
        );
      });

      it('should return results array with correct structure', async () => {
        // Arrange
        const batchJobId = 'batch-job-results-structure';

        const mockResults = {
          jobId: batchJobId,
          jobStatus: 'DONE' as BatchJobStatus,
          summary: {
            total: 3,
            successful: 2,
            failed: 1,
          },
          results: [
            {
              operationId: 'op-success-1',
              status: 'SUCCESS',
              resourceId: 'campaign-abc',
              resourceType: 'CAMPAIGN',
            },
            {
              operationId: 'op-success-2',
              status: 'SUCCESS',
              resourceId: 'campaign-def',
              resourceType: 'CAMPAIGN',
            },
            {
              operationId: 'op-failed-1',
              status: 'FAILURE',
              resourceType: 'CAMPAIGN',
              errors: ['Validation failed: Invalid budget amount'],
            },
          ],
        };

        mockHttpClient.get.mockResolvedValue({ data: mockResults });

        // Act
        const result = await service.getBatchJobResults(batchJobId);

        // Assert - Verify results array structure
        expect(result.results).toBeDefined();
        expect(Array.isArray(result.results)).toBe(true);
        expect(result.results.length).toBe(3);

        // Verify successful operation structure
        expect(result.results[0]).toMatchObject({
          operationId: 'op-success-1',
          status: 'SUCCESS',
          resourceId: 'campaign-abc',
          resourceType: 'CAMPAIGN',
        });

        // Verify failed operation structure
        expect(result.results[2]).toMatchObject({
          operationId: 'op-failed-1',
          status: 'FAILURE',
          resourceType: 'CAMPAIGN',
          errors: expect.arrayContaining([
            'Validation failed: Invalid budget amount',
          ]),
        });
      });

      it('should handle pagination with nextPageToken', async () => {
        // Arrange
        const batchJobId = 'batch-job-results-pagination';

        const mockResults = {
          jobId: batchJobId,
          jobStatus: 'DONE' as BatchJobStatus,
          summary: {
            total: 1500,
            successful: 1450,
            failed: 50,
          },
          results: Array.from({ length: 1000 }, (_, i) => ({
            operationId: `op-${i + 1}`,
            status: 'SUCCESS',
            resourceId: `campaign-${i + 1}`,
            resourceType: 'CAMPAIGN',
          })),
          nextPageToken: 'next-page-token-abc123',
        };

        mockHttpClient.get.mockResolvedValue({ data: mockResults });

        // Act
        const result = await service.getBatchJobResults(batchJobId);

        // Assert
        expect(result.nextPageToken).toBe('next-page-token-abc123');
        expect(result.results.length).toBe(1000);
        expect(result.summary.total).toBe(1500);
      });

      it('should handle empty results array', async () => {
        // Arrange
        const batchJobId = 'batch-job-results-empty';

        const mockResults = {
          jobId: batchJobId,
          jobStatus: 'DONE' as BatchJobStatus,
          summary: {
            total: 0,
            successful: 0,
            failed: 0,
          },
          results: [],
        };

        mockHttpClient.get.mockResolvedValue({ data: mockResults });

        // Act
        const result = await service.getBatchJobResults(batchJobId);

        // Assert
        expect(result.results).toEqual([]);
        expect(result.summary.total).toBe(0);
      });

      it('should handle invalid batchJobId', async () => {
        // Act & Assert - Empty string
        await expect(service.getBatchJobResults('')).rejects.toThrow(
          'batchJobId is required and must be a non-empty string'
        );

        // Act & Assert - Whitespace only
        await expect(service.getBatchJobResults('   ')).rejects.toThrow(
          'batchJobId is required and must be a non-empty string'
        );

        // Verify no API call was made
        expect(mockHttpClient.get).not.toHaveBeenCalled();
      });

      it('should handle API errors', async () => {
        // Arrange
        const batchJobId = 'batch-job-results-error';
        const apiError = {
          message: 'Request failed with status code 404',
          response: {
            status: 404,
            data: { error: 'Batch job not found' },
          },
        };

        mockHttpClient.get.mockRejectedValue(apiError);

        // Act & Assert
        await expect(
          service.getBatchJobResults(batchJobId)
        ).rejects.toThrow(
          'Failed to get batch job results: Request failed with status code 404'
        );
      });

      it('should properly close X-Ray subsegment', async () => {
        // Arrange
        const mockSubsegment = {
          close: jest.fn(),
        };
        const mockSegment = {
          addNewSubsegment: jest.fn().mockReturnValue(mockSubsegment),
        };
        (AWSXRay.getSegment as jest.Mock).mockReturnValue(mockSegment);

        const batchJobId = 'batch-job-results-xray';
        const mockResults = {
          jobId: batchJobId,
          jobStatus: 'DONE' as BatchJobStatus,
          summary: { total: 10, successful: 10, failed: 0 },
          results: [],
        };

        mockHttpClient.get.mockResolvedValue({ data: mockResults });

        // Act
        await service.getBatchJobResults(batchJobId);

        // Assert
        expect(mockSegment.addNewSubsegment).toHaveBeenCalledWith(
          'MarinBatchJobService.getBatchJobResults'
        );
        expect(mockSubsegment.close).toHaveBeenCalledTimes(1);
      });
    });
  });
});
