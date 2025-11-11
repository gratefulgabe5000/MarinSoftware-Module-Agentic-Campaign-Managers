/**
 * Zilkr Batch Job Lambda Client
 * 
 * Wraps ZilkrBatchJobService for use in AWS Lambda functions triggered by SQS
 * Processes SQS events for bulk campaign creation
 * 
 * @module marinBatchJobClient
 */

import { ZilkrBatchJobService } from '../services/zilkrBatchJobService';
import { LambdaEvent, LambdaResponse, SqsEvent, BatchJobSqsMessage } from '../types/lambda.types';
import { BatchJobResultsResponse } from '../types/zilkrDispatcher.types';
import * as AWSXRay from 'aws-xray-sdk-core';

/**
 * Zilkr Batch Job Lambda Client
 * 
 * Wraps ZilkrBatchJobService to handle SQS events and format responses
 * Provides a clean interface for Lambda functions to process batch job operations
 */
export class ZilkrBatchJobClient {
  private service: ZilkrBatchJobService;

  /**
   * Create a new Zilkr Batch Job Lambda Client
   * 
   * @param accountId - Zilkr Dispatcher account ID (optional, uses config default)
   * @param publisher - Publisher platform (default: 'google')
   */
  constructor(accountId?: string, publisher: string = 'google') {
    this.service = new ZilkrBatchJobService(accountId, publisher);
  }

  /**
   * Handle SQS event for bulk campaign creation
   * 
   * Processes SQS records and calls batch job service for each message
   * Each SQS record should contain a JSON body with jobId and campaigns array
   * 
   * @param event - SQS event containing Records array
   * @returns Lambda response with success status and results
   * 
   * @example
   * ```typescript
   * const client = new ZilkrBatchJobClient();
   * const sqsEvent = {
   *   Records: [{
   *     messageId: 'msg-123',
   *     body: JSON.stringify({
   *       jobId: 'job-123',
   *       campaigns: [{ name: 'Campaign 1', ... }, { name: 'Campaign 2', ... }]
   *     })
   *   }]
   * };
   * const response = await client.handleSqsEvent(sqsEvent);
   * ```
   */
  async handleSqsEvent(event: SqsEvent): Promise<LambdaResponse> {
    const segment = AWSXRay.getSegment();
    const subsegment = segment?.addNewSubsegment('ZilkrBatchJobClient.handleSqsEvent');

    try {
      // Validate event structure
      if (!event || !event.Records || !Array.isArray(event.Records)) {
        subsegment?.close();
        return {
          success: false,
          error: 'Invalid SQS event: Records array is required',
          details: { event },
        };
      }

      if (event.Records.length === 0) {
        subsegment?.close();
        return {
          success: false,
          error: 'SQS event contains no records',
          details: { event },
        };
      }

      // Process SQS records
      const results: Array<{ jobId: string; result: BatchJobResultsResponse; error?: string }> = [];
      const errors: Array<{ jobId?: string; error: string; record: any }> = [];

      for (const record of event.Records) {
        const recordSubsegment = segment?.addNewSubsegment('ZilkrBatchJobClient.processRecord');
        
        try {
          // Validate record structure
          if (!record.body) {
            recordSubsegment?.close();
            errors.push({
              error: 'Record body is missing',
              record,
            });
            continue;
          }

          // Parse message body
          let message: BatchJobSqsMessage;
          try {
            message = JSON.parse(record.body);
          } catch (parseError: any) {
            recordSubsegment?.close();
            errors.push({
              error: `Failed to parse record body: ${parseError.message}`,
              record,
            });
            continue;
          }

          // Validate message structure
          if (!message.jobId) {
            recordSubsegment?.close();
            errors.push({
              error: 'Message jobId is required',
              record,
            });
            continue;
          }

          if (!message.campaigns || !Array.isArray(message.campaigns)) {
            recordSubsegment?.close();
            errors.push({
              jobId: message.jobId,
              error: 'Message campaigns array is required',
              record,
            });
            continue;
          }

          if (message.campaigns.length === 0) {
            recordSubsegment?.close();
            errors.push({
              jobId: message.jobId,
              error: 'Message campaigns array cannot be empty',
              record,
            });
            continue;
          }

          // Process batch job
          const result = await this.service.bulkCreateCampaigns(message.campaigns);
          
          recordSubsegment?.close();
          
          results.push({
            jobId: message.jobId,
            result,
          });
        } catch (error: any) {
          recordSubsegment?.close();
          errors.push({
            error: error.message || 'Unknown error processing record',
            record,
          });
        }
      }

      subsegment?.close();

      // Return response with results and any errors
      if (errors.length > 0 && results.length === 0) {
        // All records failed
        return {
          success: false,
          error: `All ${errors.length} record(s) failed`,
          result: {
            processed: 0,
            failed: errors.length,
            errors,
          },
          details: { event, errors },
        };
      } else if (errors.length > 0) {
        // Partial success
        return {
          success: true,
          result: {
            processed: results.length,
            failed: errors.length,
            results,
            errors,
          },
          details: { event, results, errors },
        };
      } else {
        // All records succeeded
        return {
          success: true,
          result: {
            processed: results.length,
            failed: 0,
            results,
          },
          details: { event, results },
        };
      }
    } catch (error: any) {
      subsegment?.close();
      return {
        success: false,
        error: error.message || 'Unknown error occurred',
        details: {
          error: error.toString(),
          stack: error.stack,
          event,
        },
      };
    }
  }

  /**
   * Handle Lambda event for batch job operations
   * 
   * Processes Lambda events for batch job operations (not SQS)
   * Supports actions: create_batch_job, add_operations_to_batch, run_batch_job,
   * poll_batch_job_status, get_batch_job_results, bulk_create_campaigns
   * 
   * @param event - Lambda event containing action, data, and user info
   * @returns Lambda response with success status and results
   * 
   * @example
   * ```typescript
   * const client = new ZilkrBatchJobClient();
   * const event = {
   *   action: 'bulk_create_campaigns',
   *   data: { campaigns: [{ name: 'Campaign 1', ... }] },
   *   user: { sub: 'user-123' }
   * };
   * const response = await client.handleLambdaEvent(event);
   * ```
   */
  async handleLambdaEvent(event: LambdaEvent): Promise<LambdaResponse> {
    const segment = AWSXRay.getSegment();
    const subsegment = segment?.addNewSubsegment('ZilkrBatchJobClient.handleLambdaEvent');

    try {
      const { action, data, user } = event;

      // Validate event structure
      if (!action || typeof action !== 'string') {
        subsegment?.close();
        return {
          success: false,
          error: 'Action is required and must be a string',
          details: { event },
        };
      }

      if (!data || typeof data !== 'object') {
        subsegment?.close();
        return {
          success: false,
          error: 'Data is required and must be an object',
          details: { event },
        };
      }

      if (!user || !user.sub) {
        subsegment?.close();
        return {
          success: false,
          error: 'User is required and must have a sub (user ID)',
          details: { event },
        };
      }

      // Call appropriate service method based on action
      let result: any;

      switch (action) {
        case 'bulk_create_campaigns':
          if (!data.campaigns || !Array.isArray(data.campaigns)) {
            subsegment?.close();
            return {
              success: false,
              error: 'bulk_create_campaigns requires campaigns array in data',
              details: { event },
            };
          }
          result = await this.service.bulkCreateCampaigns(data.campaigns);
          break;

        case 'create_batch_job':
          result = await this.service.createBatchJob();
          break;

        case 'add_operations_to_batch':
          if (!data.batchJobId || !data.operations) {
            subsegment?.close();
            return {
              success: false,
              error: 'add_operations_to_batch requires batchJobId and operations in data',
              details: { event },
            };
          }
          result = await this.service.addOperationsToBatch(
            data.batchJobId,
            data.operations,
            data.sequenceToken
          );
          break;

        case 'run_batch_job':
          if (!data.batchJobId) {
            subsegment?.close();
            return {
              success: false,
              error: 'run_batch_job requires batchJobId in data',
              details: { event },
            };
          }
          await this.service.runBatchJob(data.batchJobId);
          result = { message: 'Batch job started successfully' };
          break;

        case 'poll_batch_job_status':
          if (!data.batchJobId) {
            subsegment?.close();
            return {
              success: false,
              error: 'poll_batch_job_status requires batchJobId in data',
              details: { event },
            };
          }
          result = await this.service.pollBatchJobStatus(
            data.batchJobId,
            data.maxAttempts,
            data.intervalMs
          );
          break;

        case 'get_batch_job_results':
          if (!data.batchJobId) {
            subsegment?.close();
            return {
              success: false,
              error: 'get_batch_job_results requires batchJobId in data',
              details: { event },
            };
          }
          result = await this.service.getBatchJobResults(data.batchJobId);
          break;

        default:
          subsegment?.close();
          return {
            success: false,
            error: `Unknown action: ${action}. Supported actions: bulk_create_campaigns, create_batch_job, add_operations_to_batch, run_batch_job, poll_batch_job_status, get_batch_job_results`,
            details: {
              event,
              supportedActions: [
                'bulk_create_campaigns',
                'create_batch_job',
                'add_operations_to_batch',
                'run_batch_job',
                'poll_batch_job_status',
                'get_batch_job_results',
              ],
            },
          };
      }

      subsegment?.close();

      // Map result to LambdaResponse format
      return {
        success: true,
        result,
        details: { event, result },
      };
    } catch (error: any) {
      subsegment?.close();
      return {
        success: false,
        error: error.message || 'Unknown error occurred',
        details: {
          error: error.toString(),
          stack: error.stack,
          event,
        },
      };
    }
  }

  /**
   * Get the underlying service instance
   * 
   * Useful for direct service access if needed
   * 
   * @returns The ZilkrBatchJobService instance
   */
  getService(): ZilkrBatchJobService {
    return this.service;
  }
}

