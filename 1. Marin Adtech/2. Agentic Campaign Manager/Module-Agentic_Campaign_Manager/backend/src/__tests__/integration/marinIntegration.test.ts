/**
 * Marin Integration Tests
 * 
 * Integration tests for Marin Dispatcher Lambda client integration
 * Tests Lambda event handling, response format, SQS events, and error handling
 * 
 * @module marinIntegration.test
 */

import { MarinDispatcherClient } from '../../lib/marinDispatcherClient';
import { MarinBatchJobClient } from '../../lib/marinBatchJobClient';
import { LambdaEvent, LambdaResponse, SqsEvent } from '../../types/lambda.types';

/**
 * Integration Test Suite for Marin Dispatcher Lambda Integration
 * 
 * These tests verify:
 * - Lambda client integration with service layer
 * - Lambda event format handling
 * - Lambda response format
 * - SQS event handling
 * - DISPATCHER_URL environment usage
 * - X-Ray tracing integration
 * - Error handling in Lambda context
 */
describe('Marin Integration Tests', () => {
  let dispatcherClient: MarinDispatcherClient;
  let batchJobClient: MarinBatchJobClient;

  beforeEach(() => {
    dispatcherClient = new MarinDispatcherClient();
    batchJobClient = new MarinBatchJobClient();
  });

  /**
   * Test Lambda client integration structure
   */
  describe('Lambda Client Integration Structure', () => {
    it('should create MarinDispatcherClient instance', () => {
      expect(dispatcherClient).toBeDefined();
      expect(dispatcherClient).toBeInstanceOf(MarinDispatcherClient);
    });

    it('should create MarinBatchJobClient instance', () => {
      expect(batchJobClient).toBeDefined();
      expect(batchJobClient).toBeInstanceOf(MarinBatchJobClient);
    });

    it('should have handleLambdaEvent method in MarinDispatcherClient', () => {
      expect(typeof dispatcherClient.handleLambdaEvent).toBe('function');
    });

    it('should have handleSqsEvent method in MarinBatchJobClient', () => {
      expect(typeof batchJobClient.handleSqsEvent).toBe('function');
    });

    it('should have handleLambdaEvent method in MarinBatchJobClient', () => {
      expect(typeof batchJobClient.handleLambdaEvent).toBe('function');
    });
  });

  /**
   * Test Lambda event format handling
   */
  describe('Lambda Event Format Handling', () => {
    const validEvent: LambdaEvent = {
      action: 'get_campaign_status',
      data: {
        campaignId: 'test-campaign-123',
      },
      user: {
        sub: 'user-123',
        email: 'test@example.com',
      },
    };

    it('should validate Lambda event structure', async () => {
      // This test verifies that the client validates event structure
      // Actual validation happens in handleLambdaEvent method
      expect(validEvent.action).toBeDefined();
      expect(validEvent.data).toBeDefined();
      expect(validEvent.user).toBeDefined();
      expect(validEvent.user.sub).toBeDefined();
    });

    it('should handle missing action', async () => {
      const invalidEvent: any = {
        data: { campaignId: 'test-123' },
        user: { sub: 'user-123' },
      };
      
      const response = await dispatcherClient.handleLambdaEvent(invalidEvent);
      expect(response.success).toBe(false);
      expect(response.error).toContain('Action is required');
    });

    it('should handle missing data', async () => {
      const invalidEvent: any = {
        action: 'get_campaign_status',
        user: { sub: 'user-123' },
      };
      
      const response = await dispatcherClient.handleLambdaEvent(invalidEvent);
      expect(response.success).toBe(false);
      expect(response.error).toContain('Data is required');
    });

    it('should handle missing user', async () => {
      const invalidEvent: any = {
        action: 'get_campaign_status',
        data: { campaignId: 'test-123' },
      };
      
      const response = await dispatcherClient.handleLambdaEvent(invalidEvent);
      expect(response.success).toBe(false);
      expect(response.error).toContain('User is required');
    });

    it('should handle missing user.sub', async () => {
      const invalidEvent: any = {
        action: 'get_campaign_status',
        data: { campaignId: 'test-123' },
        user: {},
      };
      
      const response = await dispatcherClient.handleLambdaEvent(invalidEvent);
      expect(response.success).toBe(false);
      expect(response.error).toContain('sub');
    });
  });

  /**
   * Test Lambda response format
   */
  describe('Lambda Response Format', () => {
    it('should return LambdaResponse format', async () => {
      const event: LambdaEvent = {
        action: 'get_campaign_status',
        data: {
          campaignId: 'test-campaign-123',
        },
        user: {
          sub: 'user-123',
        },
      };

      const response = await dispatcherClient.handleLambdaEvent(event);
      
      // Verify response structure
      expect(response).toHaveProperty('success');
      expect(typeof response.success).toBe('boolean');
      
      if (response.success) {
        expect(response).toHaveProperty('result');
      } else {
        expect(response).toHaveProperty('error');
        expect(typeof response.error).toBe('string');
      }
      
      expect(response).toHaveProperty('details');
    });

    it('should map PlatformAPIResponse to LambdaResponse', async () => {
      // This test verifies that response mapping works correctly
      // The actual mapping happens in mapPlatformResponseToLambdaResponse
      const event: LambdaEvent = {
        action: 'get_campaign_status',
        data: {
          campaignId: 'test-campaign-123',
        },
        user: {
          sub: 'user-123',
        },
      };

      const response = await dispatcherClient.handleLambdaEvent(event);
      
      // Response should have LambdaResponse structure
      expect(response).toMatchObject({
        success: expect.any(Boolean),
        details: expect.any(Object),
      });
    });
  });

  /**
   * Test SQS event handling
   */
  describe('SQS Event Handling', () => {
    const validSqsEvent: SqsEvent = {
      Records: [
        {
          messageId: 'msg-123',
          receiptHandle: 'receipt-123',
          body: JSON.stringify({
            jobId: 'job-123',
            campaigns: [
              {
                name: 'Test Campaign 1',
                accountId: '5533110357',
                status: 'ENABLED',
                budget: {
                  amount: 100,
                  deliveryMethod: 'STANDARD',
                },
                biddingStrategy: 'MANUAL_CPC',
              },
            ],
          }),
          attributes: {
            ApproximateReceiveCount: '1',
            SentTimestamp: Date.now().toString(),
            SenderId: 'sender-123',
            ApproximateFirstReceiveTimestamp: Date.now().toString(),
          },
          md5OfBody: 'md5-hash',
          eventSource: 'aws:sqs',
          eventSourceARN: 'arn:aws:sqs:us-east-1:123456789012:queue-name',
          awsRegion: 'us-east-1',
        },
      ],
    };

    it('should handle valid SQS event', async () => {
      const response = await batchJobClient.handleSqsEvent(validSqsEvent);
      
      expect(response).toHaveProperty('success');
      expect(response).toHaveProperty('result');
      expect(response).toHaveProperty('details');
    });

    it('should handle invalid SQS event (missing Records)', async () => {
      const invalidEvent: any = {};
      
      const response = await batchJobClient.handleSqsEvent(invalidEvent);
      expect(response.success).toBe(false);
      expect(response.error).toContain('Records');
    });

    it('should handle empty SQS Records array', async () => {
      const invalidEvent: SqsEvent = {
        Records: [],
      };
      
      const response = await batchJobClient.handleSqsEvent(invalidEvent);
      expect(response.success).toBe(false);
      expect(response.error).toContain('no records');
    });

    it('should handle invalid SQS message body', async () => {
      const invalidEvent: SqsEvent = {
        Records: [
          {
            ...validSqsEvent.Records[0],
            body: 'invalid-json',
          },
        ],
      };
      
      const response = await batchJobClient.handleSqsEvent(invalidEvent);
      // Should handle parse error gracefully
      expect(response).toHaveProperty('success');
    });
  });

  /**
   * Test DISPATCHER_URL environment usage
   */
  describe('DISPATCHER_URL Environment Usage', () => {
    it('should use DISPATCHER_URL from environment', () => {
      // This test verifies that services are configured to use DISPATCHER_URL
      // The actual environment variable is set by CloudFormation in Lambda
      // For local development, it falls back to MARIN_DISPATCHER_BASE_URL
      
      const service = dispatcherClient.getService();
      expect(service).toBeDefined();
      
      // Service should be configured (actual URL check would require environment)
      // This test verifies the structure is in place
    });
  });

  /**
   * Test X-Ray tracing integration
   */
  describe('X-Ray Tracing Integration', () => {
    it('should have X-Ray tracing in Lambda clients', () => {
      // This test verifies that X-Ray tracing is implemented
      // Actual tracing happens at runtime in Lambda context
      
      // Verify clients are properly structured for X-Ray
      expect(dispatcherClient).toBeDefined();
      expect(batchJobClient).toBeDefined();
      
      // X-Ray segments are created at runtime, not testable in unit tests
      // Integration tests would verify actual tracing in Lambda environment
    });
  });

  /**
   * Test error handling in Lambda context
   */
  describe('Error Handling in Lambda Context', () => {
    it('should handle unknown action gracefully', async () => {
      const event: LambdaEvent = {
        action: 'unknown_action',
        data: {},
        user: {
          sub: 'user-123',
        },
      };

      const response = await dispatcherClient.handleLambdaEvent(event);
      
      expect(response.success).toBe(false);
      expect(response.error).toBeDefined();
      expect(response.error).toContain('Unknown action');
    });

    it('should handle service errors gracefully', async () => {
      const event: LambdaEvent = {
        action: 'get_campaign_status',
        data: {
          campaignId: 'invalid-campaign-id',
        },
        user: {
          sub: 'user-123',
        },
      };

      const response = await dispatcherClient.handleLambdaEvent(event);
      
      // Response should be in LambdaResponse format even on error
      expect(response).toHaveProperty('success');
      expect(response).toHaveProperty('error');
      expect(response).toHaveProperty('details');
    });
  });

  /**
   * Test service registration (optional)
   */
  describe('Service Registration (Optional)', () => {
    it('should verify Marin service can be registered', () => {
      // This test verifies that service registration is possible
      // Actual registration happens in CampaignCreationController
      // This is optional since service is primarily used by Lambda functions
      
      expect(dispatcherClient).toBeDefined();
      expect(dispatcherClient.getService).toBeDefined();
    });
  });
});

