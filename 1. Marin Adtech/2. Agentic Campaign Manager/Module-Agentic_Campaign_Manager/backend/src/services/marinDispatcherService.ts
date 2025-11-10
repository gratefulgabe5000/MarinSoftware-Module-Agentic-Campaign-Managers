/**
 * Marin Dispatcher Service
 * Implements Marin Dispatcher API integration for campaign management
 */

import axios from 'axios';
import * as AWSXRay from 'aws-xray-sdk-core';
import { BasePlatformAPI, IPlatformAPI } from './platformApiService';
import { CampaignPlan } from '../types/ai.types';
import { PlatformAPIResponse } from '../types/campaign.types';
import {
  MarinCampaignRequest,
  MarinCampaignResponse,
  MarinCampaignUpdateRequest,
  MarinCampaignListRequest,
  MarinCampaignListResponse,
} from '../types/marinDispatcher.types';
import { validateCampaignRequest, ValidationResult } from '../utils/marinTypeValidators';
import config from '../config/env';

/**
 * Marin Dispatcher Service
 * Extends BasePlatformAPI to implement Marin Dispatcher API integration
 */
export class MarinDispatcherService extends BasePlatformAPI implements IPlatformAPI {
  private apiUrl: string; // Full ALB URL (e.g., http://meridian-dispatcher-alb-dev-1234567890.us-east-1.elb.amazonaws.com)
  private accountId: string;
  private publisher: string;
  private httpClient: ReturnType<typeof axios.create>;

  constructor(accountId?: string, publisher: string = 'google') {
    super('Marin Dispatcher');

    // Use DISPATCHER_URL from environment (InfraDocs pattern - set by CloudFormation)
    // Fallback to baseUrl for local development
    const dispatcherUrl = process.env.DISPATCHER_URL || config.marinDispatcher.baseUrl;
    if (!dispatcherUrl) {
      throw new Error('DISPATCHER_URL or MARIN_DISPATCHER_BASE_URL must be set');
    }

    this.apiUrl = dispatcherUrl; // Full ALB URL, not base path
    this.accountId = accountId || config.marinDispatcher.accountId;
    this.publisher = publisher;

    // Create axios instance with timeout
    // Note: X-Ray tracing will be added per-request in methods
    this.httpClient = axios.create({
      baseURL: this.apiUrl, // Full URL including protocol
      timeout: config.marinDispatcher.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
  }

  /**
   * Build API endpoint path
   * Note: InfraDocs shows /dispatcher/ prefix, PRD shows /api/v2/dispatcher/
   * Using InfraDocs format as source of truth, but verify actual API path
   */
  private buildApiPath(endpoint: string): string {
    // InfraDocs pattern: /dispatcher/${publisher}/campaigns
    // PRD shows: /api/v2/dispatcher/${publisher}/campaigns
    // Using InfraDocs format (source of truth), verify with actual API
    return `/dispatcher/${this.publisher}${endpoint}`;
  }

  /**
   * Map CampaignPlan to MarinCampaignRequest
   */
  private mapCampaignPlanToRequest(
    campaignPlan: CampaignPlan,
    name: string
  ): MarinCampaignRequest {
    // Extract budget amount (NO micros conversion - already in dollars)
    const budgetAmount = campaignPlan.budget.total || campaignPlan.budget.daily || 0;

    return {
      accountId: this.accountId,
      name,
      status: 'ENABLED',
      budget: {
        amount: budgetAmount, // Already in dollars, no conversion needed
        deliveryMethod: 'STANDARD',
      },
      biddingStrategy: 'MANUAL_CPC', // Default bidding strategy
      objective: campaignPlan.objective, // Include objective if provided (for Meta campaigns)
    };
  }

  /**
   * Map MarinCampaignResponse to PlatformAPIResponse
   */
  private mapResponseToPlatformResponse(
    response: MarinCampaignResponse
  ): PlatformAPIResponse {
    // Map resourceId to campaignId (if resourceId exists, use it; otherwise use id)
    const campaignId = response.resourceId || response.id;

    return {
      success: response.status === 'SUCCESS',
      campaignId,
      error: response.status === 'FAILURE' ? response.errors?.join(', ') : undefined,
      details: {
        id: response.id,
        accountId: response.accountId,
        name: response.name,
        status: response.campaignStatus,
        budget: response.budget,
        biddingStrategy: response.biddingStrategy,
        createdAt: response.createdAt,
        updatedAt: response.updatedAt,
        errors: response.errors,
        warnings: response.warnings,
      },
    };
  }

  /**
   * Check if authenticated
   * For Marin Dispatcher, this verifies we can reach the API (internal network)
   */
  async isAuthenticated(): Promise<boolean> {
    const segment = AWSXRay.getSegment();
    const subsegment = segment?.addNewSubsegment('MarinDispatcher.isAuthenticated');

    try {
      // For now, Marin Dispatcher doesn't require auth (internal network)
      // Just verify we can reach the API
      // Use InfraDocs path format: /dispatcher/${publisher}/campaigns
      const response = await this.httpClient.get(
        this.buildApiPath('/campaigns'),
        {
          params: { accountId: this.accountId, limit: 1 },
        }
      );

      subsegment?.close();
      return response.status === 200;
    } catch (error: any) {
      subsegment?.close();
      console.error('[Marin Dispatcher] Authentication check failed:', error);
      return false;
    }
  }

  /**
   * Create a campaign on Marin Dispatcher
   * Note: This is a placeholder - full implementation in Phase 2.2
   */
  async createCampaign(
    campaignPlan: CampaignPlan,
    name: string
  ): Promise<PlatformAPIResponse> {
    // Placeholder - will be implemented in Phase 2.2
    return {
      success: false,
      error: 'createCampaign not yet implemented',
    };
  }

  /**
   * Update a campaign on Marin Dispatcher
   * Note: This is a placeholder - full implementation in Phase 2.2
   */
  async updateCampaign(
    campaignId: string,
    updates: Partial<CampaignPlan>
  ): Promise<PlatformAPIResponse> {
    // Placeholder - will be implemented in Phase 2.2
    return {
      success: false,
      error: 'updateCampaign not yet implemented',
    };
  }

  /**
   * Pause a campaign on Marin Dispatcher
   * Note: This is a placeholder - full implementation in Phase 2.2
   */
  async pauseCampaign(campaignId: string): Promise<PlatformAPIResponse> {
    // Placeholder - will be implemented in Phase 2.2
    return {
      success: false,
      error: 'pauseCampaign not yet implemented',
    };
  }

  /**
   * Resume a campaign on Marin Dispatcher
   * Note: This is a placeholder - full implementation in Phase 2.2
   */
  async resumeCampaign(campaignId: string): Promise<PlatformAPIResponse> {
    // Placeholder - will be implemented in Phase 2.2
    return {
      success: false,
      error: 'resumeCampaign not yet implemented',
    };
  }

  /**
   * Delete a campaign on Marin Dispatcher
   * Note: This is a placeholder - full implementation in Phase 2.2
   */
  async deleteCampaign(campaignId: string): Promise<PlatformAPIResponse> {
    // Placeholder - will be implemented in Phase 2.2
    return {
      success: false,
      error: 'deleteCampaign not yet implemented',
    };
  }

  /**
   * Get campaign status from Marin Dispatcher
   * Note: This is a placeholder - full implementation in Phase 2.2
   */
  async getCampaignStatus(campaignId: string): Promise<PlatformAPIResponse> {
    // Placeholder - will be implemented in Phase 2.2
    return {
      success: false,
      error: 'getCampaignStatus not yet implemented',
    };
  }
}
