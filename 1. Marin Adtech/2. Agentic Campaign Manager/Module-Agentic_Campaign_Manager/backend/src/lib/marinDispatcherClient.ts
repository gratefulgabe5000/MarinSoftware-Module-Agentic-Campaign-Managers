/**
 * Zilkr Dispatcher Lambda Client
 * 
 * Wraps ZilkrDispatcherService for use in AWS Lambda functions
 * Maps Lambda event format to service methods and formats responses
 * 
 * @module marinDispatcherClient
 */

import { ZilkrDispatcherService } from '../services/zilkrDispatcherService';
import { LambdaEvent, LambdaResponse, CampaignAction } from '../types/lambda.types';
import { PlatformAPIResponse } from '../types/campaign.types';
import { CampaignPlan } from '../types/ai.types';
import * as AWSXRay from 'aws-xray-sdk-core';

/**
 * Zilkr Dispatcher Lambda Client
 * 
 * Wraps ZilkrDispatcherService to handle Lambda events and format responses
 * Provides a clean interface for Lambda functions to interact with Zilkr Dispatcher
 */
export class ZilkrDispatcherClient {
  private service: ZilkrDispatcherService;

  /**
   * Create a new Zilkr Dispatcher Lambda Client
   * 
   * @param accountId - Zilkr Dispatcher account ID (optional, uses config default)
   * @param publisher - Publisher platform (default: 'google')
   */
  constructor(accountId?: string, publisher: string = 'google') {
    this.service = new ZilkrDispatcherService(accountId, publisher);
  }

  /**
   * Handle Lambda event and call appropriate service method
   * 
   * Maps Lambda event format to service methods and formats responses
   * Supports all campaign operations: create, update, pause, resume, delete, get status
   * 
   * @param event - Lambda event containing action, data, and user info
   * @returns Lambda response with success status, result, and error info
   * 
   * @example
   * ```typescript
   * const client = new ZilkrDispatcherClient();
   * const event = {
   *   action: 'create_campaign',
   *   data: { campaignPlan: {...}, name: 'My Campaign' },
   *   user: { sub: 'user-123' }
   * };
   * const response = await client.handleLambdaEvent(event);
   * ```
   */
  async handleLambdaEvent(event: LambdaEvent): Promise<LambdaResponse> {
    const segment = AWSXRay.getSegment();
    const subsegment = segment?.addNewSubsegment('ZilkrDispatcherClient.handleLambdaEvent');

    try {
      const { action, data, user } = event;

      // Validate action
      if (!action || typeof action !== 'string') {
        subsegment?.close();
        return {
          success: false,
          error: 'Action is required and must be a string',
          details: { event },
        };
      }

      // Validate data
      if (!data || typeof data !== 'object') {
        subsegment?.close();
        return {
          success: false,
          error: 'Data is required and must be an object',
          details: { event },
        };
      }

      // Validate user
      if (!user || !user.sub) {
        subsegment?.close();
        return {
          success: false,
          error: 'User is required and must have a sub (user ID)',
          details: { event },
        };
      }

      // Call appropriate service method based on action
      let result: PlatformAPIResponse;

      switch (action as CampaignAction) {
        case 'create_campaign':
          if (!data.campaignPlan || !data.name) {
            subsegment?.close();
            return {
              success: false,
              error: 'create_campaign requires campaignPlan and name in data',
              details: { event },
            };
          }
          result = await this.service.createCampaign(
            data.campaignPlan as CampaignPlan,
            data.name as string
          );
          break;

        case 'update_campaign':
          if (!data.campaignId || !data.updates) {
            subsegment?.close();
            return {
              success: false,
              error: 'update_campaign requires campaignId and updates in data',
              details: { event },
            };
          }
          result = await this.service.updateCampaign(
            data.campaignId as string,
            data.updates as Partial<CampaignPlan>
          );
          break;

        case 'pause_campaign':
          if (!data.campaignId) {
            subsegment?.close();
            return {
              success: false,
              error: 'pause_campaign requires campaignId in data',
              details: { event },
            };
          }
          result = await this.service.pauseCampaign(data.campaignId as string);
          break;

        case 'resume_campaign':
          if (!data.campaignId) {
            subsegment?.close();
            return {
              success: false,
              error: 'resume_campaign requires campaignId in data',
              details: { event },
            };
          }
          result = await this.service.resumeCampaign(data.campaignId as string);
          break;

        case 'delete_campaign':
          if (!data.campaignId) {
            subsegment?.close();
            return {
              success: false,
              error: 'delete_campaign requires campaignId in data',
              details: { event },
            };
          }
          result = await this.service.deleteCampaign(data.campaignId as string);
          break;

        case 'get_campaign_status':
          if (!data.campaignId) {
            subsegment?.close();
            return {
              success: false,
              error: 'get_campaign_status requires campaignId in data',
              details: { event },
            };
          }
          result = await this.service.getCampaignStatus(data.campaignId as string);
          break;

        default:
          subsegment?.close();
          return {
            success: false,
            error: `Unknown action: ${action}. Supported actions: create_campaign, update_campaign, pause_campaign, resume_campaign, delete_campaign, get_campaign_status`,
            details: { event, supportedActions: [
              'create_campaign',
              'update_campaign',
              'pause_campaign',
              'resume_campaign',
              'delete_campaign',
              'get_campaign_status',
            ] },
          };
      }

      subsegment?.close();

      // Map PlatformAPIResponse to LambdaResponse format
      return this.mapPlatformResponseToLambdaResponse(result);
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
   * Map PlatformAPIResponse to LambdaResponse format
   * 
   * Converts service response format to Lambda response format
   * 
   * @param platformResponse - Response from ZilkrDispatcherService
   * @returns Lambda-formatted response
   */
  private mapPlatformResponseToLambdaResponse(
    platformResponse: PlatformAPIResponse
  ): LambdaResponse {
    return {
      success: platformResponse.success,
      result: platformResponse.details || {
        campaignId: platformResponse.campaignId,
        success: platformResponse.success,
      },
      error: platformResponse.error,
      details: platformResponse,
    };
  }

  /**
   * Get the underlying service instance
   * 
   * Useful for direct service access if needed
   * 
   * @returns The ZilkrDispatcherService instance
   */
  getService(): ZilkrDispatcherService {
    return this.service;
  }
}

