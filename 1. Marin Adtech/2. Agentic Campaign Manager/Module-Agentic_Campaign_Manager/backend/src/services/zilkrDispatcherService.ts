/**
 * Zilkr Dispatcher Service
 * Implements Zilkr Dispatcher API integration for campaign management
 */

import axios from 'axios';
import * as AWSXRay from 'aws-xray-sdk-core';
import { BasePlatformAPI, IPlatformAPI } from './platformApiService';
import { CampaignPlan } from '../types/ai.types';
import { PlatformAPIResponse } from '../types/campaign.types';
import {
  ZilkrBudgetRequest,
  ZilkrBudgetResponse,
  ZilkrCampaignRequest,
  ZilkrCampaignResponse,
  ZilkrCampaignUpdateRequest,
  ZilkrCampaignListRequest,
  ZilkrCampaignListResponse,
  ZilkrNetworkSettings,
  ZilkrAdGroupRequest,
  ZilkrAdGroupResponse,
  ZilkrAdGroupUpdateRequest,
  ZilkrAdRequest,
  ZilkrAdResponse,
  ZilkrAdUpdateRequest,
  ZilkrKeywordRequest,
  ZilkrKeywordResponse,
  ZilkrKeywordUpdateRequest,
  ZilkrBulkKeywordRequest,
} from '../types/zilkrDispatcher.types';
import { validateCampaignRequest, validateAdGroupRequest, validateAdRequest, validateKeywordRequest, ValidationResult } from '../utils/zilkrTypeValidators';
import config from '../config/env';

/**
 * Zilkr Dispatcher Service
 * Extends BasePlatformAPI to implement Zilkr Dispatcher API integration
 */
export class ZilkrDispatcherService extends BasePlatformAPI implements IPlatformAPI {
  private apiUrl: string; // Full ALB URL (e.g., http://meridian-dispatcher-alb-dev-1234567890.us-east-1.elb.amazonaws.com)
  private accountId: string;
  private publisher: string;
  private httpClient: ReturnType<typeof axios.create>;

  constructor(accountId?: string, publisher: string = 'google') {
    super('Zilkr Dispatcher');

    // Use DISPATCHER_URL from environment (InfraDocs pattern - set by CloudFormation)
    // Fallback to baseUrl for local development
    const dispatcherUrl = process.env.DISPATCHER_URL || config.zilkrDispatcher.baseUrl;
    if (!dispatcherUrl) {
      throw new Error('DISPATCHER_URL or ZILKR_DISPATCHER_BASE_URL must be set');
    }

    this.apiUrl = dispatcherUrl; // Full ALB URL, not base path
    this.accountId = accountId || config.zilkrDispatcher.accountId;
    this.publisher = publisher;

    // Create axios instance with timeout
    // Note: X-Ray tracing will be added per-request in methods
    this.httpClient = axios.create({
      baseURL: this.apiUrl, // Full URL including protocol
      timeout: config.zilkrDispatcher.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
  }

  /**
   * Override handleError to extract detailed error information from axios responses
   * This provides better error messages when the Zilkr Dispatcher API returns errors
   */
  protected handleError(error: any, operation: string): PlatformAPIResponse {
    console.error(`[Zilkr Dispatcher] Error in ${operation}:`, error);

    // Extract detailed error message from axios error response
    let errorMessage = `Failed to ${operation} on Zilkr Dispatcher`;

    if (error.response) {
      // API responded with error status
      const status = error.response.status;
      const data = error.response.data;

      // Extract error message from response data
      if (data?.message) {
        // Check if the message indicates a downstream API error (e.g., Google Ads 404)
        if (data.message.includes('status code 404')) {
          errorMessage = `Zilkr Dispatcher API error (${status}): ${data.message}. This suggests the Google Ads API call failed with 404 - the account ID may be invalid, or the Google Ads API endpoint may not be accessible.`;
        } else if (data.message.includes('status code')) {
          errorMessage = `Zilkr Dispatcher API error (${status}): ${data.message}. This indicates a downstream API error (likely from Google Ads).`;
        } else {
          errorMessage = `Zilkr Dispatcher API error (${status}): ${data.message}`;
        }
      } else if (data?.error) {
        errorMessage = `Zilkr Dispatcher API error (${status}): ${data.error}`;
        if (data.message) {
          errorMessage += `. ${data.message}`;
        }
      } else if (typeof data === 'string') {
        errorMessage = `Zilkr Dispatcher API error (${status}): ${data}`;
      } else {
        errorMessage = `Zilkr Dispatcher API error (${status}): ${JSON.stringify(data)}`;
      }
    } else if (error.request) {
      // Request was made but no response received
      errorMessage = `Zilkr Dispatcher API request failed: No response received`;
    } else if (error.message) {
      // Error occurred in setting up the request
      errorMessage = `Zilkr Dispatcher API error: ${error.message}`;
    }

    return {
      success: false,
      error: errorMessage,
      details: {
        operation,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        originalError: error.message,
        // Include request details for debugging
        requestUrl: error.config?.url,
        requestMethod: error.config?.method,
        requestData: error.config?.data,
      },
    };
  }

  /**
   * Build API endpoint path
   * NOTE: Actual API uses /api/v2/dispatcher/ (verified via testing)
   * InfraDocs shows /dispatcher/ but actual API requires /api/v2/dispatcher/
   * The 404 error when using /dispatcher/ confirms the actual API path is /api/v2/dispatcher/
   */
  private buildApiPath(endpoint: string): string {
    // Actual API path format: /api/v2/dispatcher/${publisher}/campaigns
    // Verified: /dispatcher/ returns 404, /api/v2/dispatcher/ returns 200/500 (but endpoint exists)
    return `/api/v2/dispatcher/${this.publisher}${endpoint}`;
  }

  /**
   * Create a campaign budget resource
   * 
   * Google Ads API requires campaign_budget to be a resource reference, not an inline object.
   * We need to create the budget resource first, then reference it in campaign creation.
   * 
   * @param amount - Budget amount in dollars (NOT micros)
   * @param deliveryMethod - Budget delivery method (STANDARD or ACCELERATED)
   * @returns Promise<ZilkrBudgetResponse> Budget resource with ID and resource name
   * 
   * @example
   * ```typescript
   * const budget = await service.createBudget(1000, 'STANDARD');
   * const budgetRef = budget.resourceName; // Use this in campaign creation
   * ```
   */
  async createBudget(
    amount: number,
    deliveryMethod: 'STANDARD' | 'ACCELERATED' = 'STANDARD'
  ): Promise<ZilkrBudgetResponse> {
    const segment = AWSXRay.getSegment();
    const subsegment = segment?.addNewSubsegment('ZilkrDispatcher.createBudget');

    const budgetRequest: ZilkrBudgetRequest = {
      accountId: this.accountId,
      amount,
      deliveryMethod,
    };

    try {
      // Create budget resource via Zilkr Dispatcher
      // Note: This endpoint may need to be added by Zilkr Dispatcher team
      // Expected endpoint: POST /api/v2/dispatcher/google/campaign-budgets
      const response = await this.httpClient.post<ZilkrBudgetResponse>(
        this.buildApiPath('/campaign-budgets'),
        budgetRequest
      );

      subsegment?.close();
      return response.data;
    } catch (error: any) {
      subsegment?.close();

      // If this is a 404 error, provide a clear message that the endpoint needs to be implemented
      if (error.response?.status === 404) {
        const endpoint = this.buildApiPath('/campaign-budgets');
        const enhancedError = new Error(
          `Zilkr Dispatcher endpoint not found (404): ${endpoint}. ` +
          `This endpoint needs to be implemented by the Zilkr Dispatcher team. ` +
          `The Agentic Campaign Manager requires this endpoint to create campaign budgets before creating campaigns. ` +
          `Request body: ${JSON.stringify(budgetRequest)}`
        );
        (enhancedError as any).response = error.response;
        (enhancedError as any).request = error.request;
        throw enhancedError;
      }

      throw error; // Re-throw to be handled by caller
    }
  }

  /**
   * Map CampaignPlan to ZilkrCampaignRequest
   * 
   * NOTE: Google Ads API requires:
   * - startDate for campaign creation (400 error without it)
   * - campaign_budget as resource reference (not inline object)
   * - network_settings may be required for SEARCH campaigns
   * 
   * We handle budget creation separately before calling this method.
   * 
   * @param campaignPlan - Campaign plan with budget and objective information
   * @param name - Campaign name
   * @param status - Campaign status (ENABLED, PAUSED, or REMOVED)
   * @param campaignBudget - Budget resource reference (from createBudget)
   * @returns ZilkrCampaignRequest with all required fields
   */
  private mapCampaignPlanToRequest(
    campaignPlan: CampaignPlan,
    name: string,
    status: 'ENABLED' | 'PAUSED' | 'REMOVED' = 'ENABLED',
    campaignBudget: string // Budget resource reference
  ): ZilkrCampaignRequest {
    // Extract start date from timeline or use today
    // Google Ads API REQUIRES startDate - without it, returns 400 Bad Request
    let startDate: string | undefined;
    if (campaignPlan.timeline?.startDate) {
      // Convert ISO date to YYYY-MM-DD format
      const date = new Date(campaignPlan.timeline.startDate);
      startDate = date.toISOString().split('T')[0];
    } else {
      // Default to today if not provided (required by Google Ads API)
      startDate = new Date().toISOString().split('T')[0];
    }

    // Extract end date from timeline if provided (optional)
    let endDate: string | undefined;
    if (campaignPlan.timeline?.endDate) {
      const date = new Date(campaignPlan.timeline.endDate);
      endDate = date.toISOString().split('T')[0];
    }

    // Determine advertising channel type from campaign plan or default to SEARCH
    const advertisingChannelType = campaignPlan.campaignType?.googleAds || 'SEARCH';

    // Network settings - may be required for SEARCH campaigns
    // Default: Include Google Search Network and Search Network partners
    const networkSettings: ZilkrNetworkSettings = {
      targetGoogleSearch: true,
      targetSearchNetwork: true,
      targetContentNetwork: false, // Display Network - optional
      targetYouTube: false, // YouTube - optional
    };

    const request: ZilkrCampaignRequest = {
      accountId: this.accountId,
      name,
      status: status, // Use provided status (ENABLED, PAUSED, or REMOVED)
      campaignBudget: campaignBudget, // Resource reference (required by Google Ads API)
      biddingStrategy: 'MANUAL_CPC', // Default bidding strategy
      advertisingChannelType: advertisingChannelType as 'SEARCH' | 'DISPLAY' | 'SHOPPING' | 'VIDEO' | 'MULTI_CHANNEL' | 'HOTEL' | 'PERFORMANCE_MAX' | 'LOCAL' | 'SMART',
      startDate: startDate, // REQUIRED by Google Ads API (400 error without it)
      endDate: endDate, // Optional but included if provided
      networkSettings: networkSettings, // May be required for SEARCH campaigns
      // Note: objective field removed - Google Ads API doesn't accept it (only for Meta)
    };

    return request;
  }

  /**
   * Map ZilkrCampaignResponse to PlatformAPIResponse
   */
  private mapResponseToPlatformResponse(
    response: ZilkrCampaignResponse
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
   * For Zilkr Dispatcher, this verifies we can reach the API (internal network)
   *
   * @returns Promise<boolean> True if API is reachable, false otherwise
   *
   * @example
   * ```typescript
   * const service = new ZilkrDispatcherService();
   * const isAuth = await service.isAuthenticated();
   * if (isAuth) {
   *   console.log('Connected to Zilkr Dispatcher API');
   * }
   * ```
   *
   * @error Network connectivity errors are caught and logged, returning false
   */
  async isAuthenticated(): Promise<boolean> {
    const segment = AWSXRay.getSegment();
    const subsegment = segment?.addNewSubsegment('ZilkrDispatcher.isAuthenticated');

    try {
      // For now, Zilkr Dispatcher doesn't require auth (internal network)
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
      console.error('[Zilkr Dispatcher] Authentication check failed:', error);
      return false;
    }
  }

  /**
   * Create a campaign on Zilkr Dispatcher
   *
   * @param campaignPlan - Campaign plan with budget and objective information
   * @param name - Campaign name (max 255 characters)
   * @param status - Optional campaign status (default: 'ENABLED', use 'PAUSED' for drafts)
   * @returns Promise<PlatformAPIResponse> Response with success status, campaign ID, and details
   *
   * @example
   * ```typescript
   * const campaignPlan: CampaignPlan = {
   *   budget: { total: 1000, daily: 50 },
   *   objective: 'SALES'
   * };
   * const response = await service.createCampaign(campaignPlan, 'Summer Sale 2024', 'PAUSED');
   * if (response.success) {
   *   console.log('Campaign created as draft:', response.campaignId);
   * }
   * ```
   *
   * @error Validation errors if budget is missing or name exceeds 255 chars
   * @error Network errors from Dispatcher API are caught and returned in response
   */
  async createCampaign(
    campaignPlan: CampaignPlan,
    name: string,
    status: 'ENABLED' | 'PAUSED' | 'REMOVED' = 'ENABLED'
  ): Promise<PlatformAPIResponse> {
    const segment = AWSXRay.getSegment();
    const subsegment = segment?.addNewSubsegment('ZilkrDispatcher.createCampaign');

    try {
      // Step 1: Create budget resource first (required by Google Ads API)
      // Google Ads API requires campaign_budget to be a resource reference, not an inline object
      const budgetAmount = campaignPlan.budget.total || campaignPlan.budget.daily || 0;
      if (budgetAmount <= 0) {
        subsegment?.close();
        return {
          success: false,
          error: 'Budget amount must be greater than 0',
        };
      }

      let budgetResponse: ZilkrBudgetResponse;
      try {
        budgetResponse = await this.createBudget(budgetAmount, 'STANDARD');
      } catch (budgetError: any) {
        subsegment?.close();
        // If budget creation fails, return error
        return this.handleError(budgetError, 'createBudget');
      }

      // Step 2: Use budget resource reference in campaign creation
      // Use resourceName if available, otherwise use budgetId
      const campaignBudget = budgetResponse.resourceName || budgetResponse.budgetId || budgetResponse.resourceId || '';
      
      // Validate that we have a budget reference (required by Google Ads API)
      if (!campaignBudget || campaignBudget.trim() === '') {
        subsegment?.close();
        return {
          success: false,
          error: 'Budget creation succeeded but did not return a valid budget reference. ' +
                `Received: resourceName=${budgetResponse.resourceName}, budgetId=${budgetResponse.budgetId}, resourceId=${budgetResponse.resourceId}`,
        };
      }

      // Step 3: Map CampaignPlan to ZilkrCampaignRequest with budget reference
      const request: ZilkrCampaignRequest = this.mapCampaignPlanToRequest(
        campaignPlan,
        name,
        status,
        campaignBudget
      );

      // Validate request
      const validationResult: ValidationResult = validateCampaignRequest(request);
      if (!validationResult.isValid && validationResult.errors.length > 0) {
        subsegment?.close();
        return {
          success: false,
          error: `Validation failed: ${validationResult.errors.join(', ')}`,
        };
      }

      // Step 4: Create campaign with budget reference
      const response = await this.httpClient.post<ZilkrCampaignResponse>(
        this.buildApiPath('/campaigns'),
        request
      );

      subsegment?.close();

      // Map response to PlatformAPIResponse
      return this.mapResponseToPlatformResponse(response.data);
    } catch (error: any) {
      subsegment?.close();
      return this.handleError(error, 'createCampaign');
    }
  }

  /**
   * Update a campaign on Zilkr Dispatcher
   *
   * @param campaignId - Campaign ID to update (required)
   * @param updates - Partial campaign plan with fields to update (budget, etc.)
   * @returns Promise<PlatformAPIResponse> Response with success status and campaign details
   *
   * @example
   * ```typescript
   * const updates: Partial<CampaignPlan> = {
   *   budget: { total: 1500, daily: 75 }
   * };
   * const response = await service.updateCampaign('campaign-123', updates);
   * if (response.success) {
   *   console.log('Campaign updated');
   * }
   * ```
   *
   * @error Returns error response if campaignId is empty or invalid
   * @error Returns error response if no valid fields are provided for update
   */
  async updateCampaign(
    campaignId: string,
    updates: Partial<CampaignPlan>
  ): Promise<PlatformAPIResponse> {
    const segment = AWSXRay.getSegment();
    const subsegment = segment?.addNewSubsegment('ZilkrDispatcher.updateCampaign');

    try {
      // Validate campaignId
      if (!campaignId || typeof campaignId !== 'string' || campaignId.trim().length === 0) {
        subsegment?.close();
        return {
          success: false,
          error: 'campaignId is required and must be a non-empty string',
        };
      }

      // Map updates to ZilkrCampaignUpdateRequest
      const request: ZilkrCampaignUpdateRequest = {};

      // Map budget if provided
      if (updates.budget) {
        const budgetAmount = updates.budget.total || updates.budget.daily || 0;
        if (budgetAmount > 0) {
          request.budget = {
            amount: budgetAmount, // NO micros conversion - already in dollars
            deliveryMethod: 'STANDARD',
          };
        }
      }

      // Note: CampaignPlan doesn't have name, status, or biddingStrategy properties
      // These would need to be passed separately or added to CampaignPlan interface if needed

      // Remove undefined fields
      Object.keys(request).forEach((key) => {
        if (request[key as keyof ZilkrCampaignUpdateRequest] === undefined) {
          delete request[key as keyof ZilkrCampaignUpdateRequest];
        }
      });

      // Check if request has any fields to update
      if (Object.keys(request).length === 0) {
        subsegment?.close();
        return {
          success: false,
          error: 'No valid fields to update',
        };
      }

      // Make API call (using InfraDocs path format)
      const response = await this.httpClient.put<ZilkrCampaignResponse>(
        this.buildApiPath(`/campaigns/${campaignId}`), // InfraDocs format: /dispatcher/${publisher}/campaigns/{id}
        request
      );

      subsegment?.close();

      // Map response to PlatformAPIResponse
      return this.mapResponseToPlatformResponse(response.data);
    } catch (error: any) {
      subsegment?.close();
      return this.handleError(error, 'updateCampaign');
    }
  }

  /**
   * Pause a campaign on Zilkr Dispatcher
   *
   * Pausing a campaign stops serving ads but preserves all campaign settings and data.
   * The campaign can be resumed at any time.
   *
   * @param campaignId - Campaign ID to pause (required)
   * @returns Promise<PlatformAPIResponse> Response with success status and updated campaign details
   *
   * @example
   * ```typescript
   * const response = await service.pauseCampaign('campaign-123');
   * if (response.success) {
   *   console.log('Campaign paused');
   * }
   * ```
   *
   * @error Returns error response if campaignId is empty or invalid
   */
  async pauseCampaign(campaignId: string): Promise<PlatformAPIResponse> {
    const segment = AWSXRay.getSegment();
    const subsegment = segment?.addNewSubsegment('ZilkrDispatcher.pauseCampaign');

    try {
      // Validate campaignId
      if (!campaignId || typeof campaignId !== 'string' || campaignId.trim().length === 0) {
        subsegment?.close();
        return {
          success: false,
          error: 'campaignId is required and must be a non-empty string',
        };
      }

      // Create update request to set status to PAUSED
      const request: ZilkrCampaignUpdateRequest = {
        status: 'PAUSED',
      };

      // Make API call (using InfraDocs path format)
      const response = await this.httpClient.put<ZilkrCampaignResponse>(
        this.buildApiPath(`/campaigns/${campaignId}`), // InfraDocs format: /dispatcher/${publisher}/campaigns/{id}
        request
      );

      subsegment?.close();

      // Map response to PlatformAPIResponse
      return this.mapResponseToPlatformResponse(response.data);
    } catch (error: any) {
      subsegment?.close();
      return this.handleError(error, 'pauseCampaign');
    }
  }

  /**
   * Resume a campaign on Zilkr Dispatcher
   *
   * Resumes a paused campaign, allowing ads to be served again.
   * Only works on campaigns that are in PAUSED status.
   *
   * @param campaignId - Campaign ID to resume (required)
   * @returns Promise<PlatformAPIResponse> Response with success status and updated campaign details
   *
   * @example
   * ```typescript
   * const response = await service.resumeCampaign('campaign-123');
   * if (response.success) {
   *   console.log('Campaign resumed and ads serving');
   * }
   * ```
   *
   * @error Returns error response if campaignId is empty or invalid
   * @error API may return error if campaign is not in PAUSED status
   */
  async resumeCampaign(campaignId: string): Promise<PlatformAPIResponse> {
    const segment = AWSXRay.getSegment();
    const subsegment = segment?.addNewSubsegment('ZilkrDispatcher.resumeCampaign');

    try {
      // Validate campaignId
      if (!campaignId || typeof campaignId !== 'string' || campaignId.trim().length === 0) {
        subsegment?.close();
        return {
          success: false,
          error: 'campaignId is required and must be a non-empty string',
        };
      }

      // Create update request to set status to ENABLED
      const request: ZilkrCampaignUpdateRequest = {
        status: 'ENABLED',
      };

      // Make API call (using InfraDocs path format)
      const response = await this.httpClient.put<ZilkrCampaignResponse>(
        this.buildApiPath(`/campaigns/${campaignId}`), // InfraDocs format: /dispatcher/${publisher}/campaigns/{id}
        request
      );

      subsegment?.close();

      // Map response to PlatformAPIResponse
      return this.mapResponseToPlatformResponse(response.data);
    } catch (error: any) {
      subsegment?.close();
      return this.handleError(error, 'resumeCampaign');
    }
  }

  /**
   * Delete a campaign on Zilkr Dispatcher
   *
   * Deletes a campaign by setting its status to REMOVED. Note: Zilkr Dispatcher uses
   * a status update to REMOVED instead of a DELETE HTTP method. The campaign data is
   * preserved in the system but marked as removed.
   *
   * @param campaignId - Campaign ID to delete (required)
   * @returns Promise<PlatformAPIResponse> Response with success status and campaign details
   *
   * @example
   * ```typescript
   * const response = await service.deleteCampaign('campaign-123');
   * if (response.success) {
   *   console.log('Campaign deleted (status set to REMOVED)');
   * }
   * ```
   *
   * @error Returns error response if campaignId is empty or invalid
   * @note Deleted campaigns (status=REMOVED) can be seen in API queries but are not active
   */
  async deleteCampaign(campaignId: string): Promise<PlatformAPIResponse> {
    const segment = AWSXRay.getSegment();
    const subsegment = segment?.addNewSubsegment('ZilkrDispatcher.deleteCampaign');

    try {
      // Validate campaignId
      if (!campaignId || typeof campaignId !== 'string' || campaignId.trim().length === 0) {
        subsegment?.close();
        return {
          success: false,
          error: 'campaignId is required and must be a non-empty string',
        };
      }

      // Create update request to set status to REMOVED
      const request: ZilkrCampaignUpdateRequest = {
        status: 'REMOVED',
      };

      // Make API call (using InfraDocs path format)
      const response = await this.httpClient.put<ZilkrCampaignResponse>(
        this.buildApiPath(`/campaigns/${campaignId}`), // InfraDocs format: /dispatcher/${publisher}/campaigns/{id}
        request
      );

      subsegment?.close();

      // Map response to PlatformAPIResponse
      return this.mapResponseToPlatformResponse(response.data);
    } catch (error: any) {
      subsegment?.close();
      return this.handleError(error, 'deleteCampaign');
    }
  }

  /**
   * Get campaign status from Zilkr Dispatcher
   *
   * Retrieves the current status and details of a campaign including budget,
   * bidding strategy, and other campaign metadata.
   *
   * @param campaignId - Campaign ID to get status for (required)
   * @returns Promise<PlatformAPIResponse> Response with success status and complete campaign details
   *
   * @example
   * ```typescript
   * const response = await service.getCampaignStatus('campaign-123');
   * if (response.success) {
   *   console.log('Campaign status:', response.details?.status);
   *   console.log('Budget:', response.details?.budget);
   * }
   * ```
   *
   * @error Returns error response if campaignId is empty or invalid
   * @error Network errors from Dispatcher API are caught and returned in response
   */
  async getCampaignStatus(campaignId: string): Promise<PlatformAPIResponse> {
    const segment = AWSXRay.getSegment();
    const subsegment = segment?.addNewSubsegment('ZilkrDispatcher.getCampaignStatus');

    try {
      // Validate campaignId
      if (!campaignId || typeof campaignId !== 'string' || campaignId.trim().length === 0) {
        subsegment?.close();
        return {
          success: false,
          error: 'campaignId is required and must be a non-empty string',
        };
      }

      // Make API call to get campaign (using InfraDocs path format)
      const response = await this.httpClient.get<ZilkrCampaignResponse>(
        this.buildApiPath(`/campaigns/${campaignId}`) // InfraDocs format: /dispatcher/${publisher}/campaigns/{id}
      );

      subsegment?.close();

      // Map response to PlatformAPIResponse
      return this.mapResponseToPlatformResponse(response.data);
    } catch (error: any) {
      subsegment?.close();
      return this.handleError(error, 'getCampaignStatus');
    }
  }

  /**
   * Query campaigns from Zilkr Dispatcher with optional pagination
   *
   * @param limit - Maximum number of campaigns to return (optional)
   * @param offset - Number of campaigns to skip for pagination (optional)
   * @returns Promise<ZilkrCampaignListResponse> with campaigns array and pagination info
   */
  async queryCampaigns(
    limit?: number,
    offset?: number
  ): Promise<ZilkrCampaignListResponse> {
    const segment = AWSXRay.getSegment();
    const subsegment = segment?.addNewSubsegment('ZilkrDispatcher.queryCampaigns');

    try {
      // Build query parameters
      const params: ZilkrCampaignListRequest = {
        accountId: this.accountId,
      };

      if (limit !== undefined) {
        params.limit = limit;
      }

      if (offset !== undefined) {
        params.offset = offset;
      }

      // Make API call to list campaigns (using InfraDocs path format)
      const response = await this.httpClient.get<ZilkrCampaignListResponse>(
        this.buildApiPath('/campaigns'), // InfraDocs format: /dispatcher/${publisher}/campaigns
        { params }
      );

      subsegment?.close();

      return response.data;
    } catch (error: any) {
      subsegment?.close();
      console.error('[Zilkr Dispatcher] Query campaigns failed:', error);

      // Re-throw the error to allow callers to handle it
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to query campaigns'
      );
    }
  }

  // ========================================================================
  // Ad Group Methods (Phase 2B.1)
  // ========================================================================

  /**
   * Create an ad group in Zilkr Dispatcher
   *
   * @param campaignId - The campaign ID to create the ad group in
   * @param adGroupData - The ad group data to create
   * @returns PlatformAPIResponse with ad group creation results
   */
  async createAdGroup(
    campaignId: string,
    adGroupData: Omit<ZilkrAdGroupRequest, 'accountId' | 'campaignId'>
  ): Promise<PlatformAPIResponse> {
    try {
      const request: ZilkrAdGroupRequest = {
        accountId: this.accountId,
        campaignId,
        ...adGroupData
      };

      // Validate request
      const validation = validateAdGroupRequest(request);
      if (!validation.isValid) {
        console.error(`[Zilkr Dispatcher] Ad group validation failed:`, validation.errors);
        return {
          success: false,
          error: `Validation failed: ${validation.errors.join(', ')}`
        };
      }

      const segment = AWSXRay.getSegment();
      const subsegment = segment?.addNewSubsegment('ZilkrDispatcher.createAdGroup');

      const response = await this.httpClient.post<ZilkrAdGroupResponse>(
        this.buildApiPath(`/campaigns/${campaignId}/adgroups`),  // InfraDocs format: /dispatcher/${publisher}/campaigns/{id}/adgroups
        request
      );

      subsegment?.close();

      return {
        success: true,
        adGroupId: response.data.id,
        details: response.data
      };
    } catch (error) {
      return this.handleError(error, 'createAdGroup');
    }
  }

  /**
   * Update an ad group in Zilkr Dispatcher
   *
   * @param adGroupId - The ad group ID to update
   * @param updates - The fields to update
   * @returns PlatformAPIResponse with ad group update results
   */
  async updateAdGroup(
    adGroupId: string,
    updates: ZilkrAdGroupUpdateRequest
  ): Promise<PlatformAPIResponse> {
    try {
      const request: ZilkrAdGroupUpdateRequest = { ...updates };

      // Remove undefined fields
      Object.keys(request).forEach(key =>
        request[key as keyof ZilkrAdGroupUpdateRequest] === undefined && delete request[key as keyof ZilkrAdGroupUpdateRequest]
      );

      const segment = AWSXRay.getSegment();
      const subsegment = segment?.addNewSubsegment('ZilkrDispatcher.updateAdGroup');

      const response = await this.httpClient.put<ZilkrAdGroupResponse>(
        this.buildApiPath(`/adgroups/${adGroupId}`),  // InfraDocs format: /dispatcher/${publisher}/adgroups/{id}
        request
      );

      subsegment?.close();

      return {
        success: true,
        adGroupId: response.data.id,
        details: response.data
      };
    } catch (error) {
      return this.handleError(error, 'updateAdGroup');
    }
  }

  // ========================================================================
  // Ad Methods (Phase 2B.2)
  // ========================================================================

  /**
   * Create an ad in Zilkr Dispatcher
   *
   * @param adGroupId - The ad group ID to create the ad in
   * @param adData - The ad data to create (without accountId and adGroupId)
   * @returns PlatformAPIResponse with ad creation results
   */
  async createAd(
    adGroupId: string,
    adData: Omit<ZilkrAdRequest, 'accountId' | 'adGroupId'>
  ): Promise<PlatformAPIResponse> {
    try {
      // Build complete request with accountId and adGroupId
      const request: ZilkrAdRequest = {
        accountId: this.accountId,
        adGroupId,
        ...adData,
        type: adData.type || 'RESPONSIVE_SEARCH_AD' // Ensure type is set, but allow override
      };

      // Validate request
      const validation = validateAdRequest(request);
      if (!validation.isValid) {
        console.error(`[Zilkr Dispatcher] Ad validation failed:`, validation.errors);
        return {
          success: false,
          error: `Validation failed: ${validation.errors.join(', ')}`
        };
      }

      const segment = AWSXRay.getSegment();
      const subsegment = segment?.addNewSubsegment('ZilkrDispatcher.createAd');

      // Make API call to create ad
      const response = await this.httpClient.post<ZilkrAdResponse>(
        this.buildApiPath(`/adgroups/${adGroupId}/ads`),  // InfraDocs format: /dispatcher/${publisher}/adgroups/{id}/ads
        request
      );

      subsegment?.close();

      return {
        success: true,
        adId: response.data.id,
        details: response.data
      };
    } catch (error) {
      return this.handleError(error, 'createAd');
    }
  }

  /**
   * Update an ad in Zilkr Dispatcher
   *
   * @param adId - The ad ID to update
   * @param updates - The fields to update
   * @returns PlatformAPIResponse with ad update results
   */
  async updateAd(
    adId: string,
    updates: ZilkrAdUpdateRequest
  ): Promise<PlatformAPIResponse> {
    try {
      const request: ZilkrAdUpdateRequest = { ...updates };

      // Remove undefined fields
      Object.keys(request).forEach(key =>
        request[key as keyof ZilkrAdUpdateRequest] === undefined && delete request[key as keyof ZilkrAdUpdateRequest]
      );

      // Check if there are any fields to update
      if (Object.keys(request).length === 0) {
        console.warn(`[Zilkr Dispatcher] No valid fields to update for ad: ${adId}`);
        return {
          success: false,
          error: 'No valid fields to update'
        };
      }

      const segment = AWSXRay.getSegment();
      const subsegment = segment?.addNewSubsegment('ZilkrDispatcher.updateAd');

      // Make API call to update ad
      const response = await this.httpClient.put<ZilkrAdResponse>(
        this.buildApiPath(`/ads/${adId}`),  // InfraDocs format: /dispatcher/${publisher}/ads/{id}
        request
      );

      subsegment?.close();

      return {
        success: true,
        adId: response.data.id,
        details: response.data
      };
    } catch (error) {
      return this.handleError(error, 'updateAd');
    }
  }

  // ========================================================================
  // Keyword Methods (Phase 2B.3)
  // ========================================================================

  /**
   * Create keywords in bulk for an ad group in Zilkr Dispatcher
   *
   * @param adGroupId - The ad group ID to create keywords in
   * @param keywords - Array of keyword data (without accountId and adGroupId)
   * @returns PlatformAPIResponse with keyword creation results
   */
  async createKeywords(
    adGroupId: string,
    keywords: Omit<ZilkrKeywordRequest, 'accountId' | 'adGroupId'>[]
  ): Promise<PlatformAPIResponse> {
    try {
      // Build complete request with accountId and adGroupId for each keyword
      const request: ZilkrBulkKeywordRequest = {
        accountId: this.accountId,
        adGroupId,
        keywords: keywords.map(kw => ({
          accountId: this.accountId,
          adGroupId,
          ...kw
        }))
      };

      // Validate all keywords
      const validationErrors: string[] = [];
      request.keywords.forEach((kw, index) => {
        const validation = validateKeywordRequest(kw);
        if (!validation.isValid) {
          validationErrors.push(`Keyword ${index}: ${validation.errors.join(', ')}`);
        }
      });

      if (validationErrors.length > 0) {
        console.error(`[Zilkr Dispatcher] Keyword validation failed:`, validationErrors);
        return {
          success: false,
          error: `Validation failed: ${validationErrors.join('; ')}`
        };
      }

      const segment = AWSXRay.getSegment();
      const subsegment = segment?.addNewSubsegment('ZilkrDispatcher.createKeywords');

      // Make API call to create keywords in bulk
      const response = await this.httpClient.post<{ keywords: ZilkrKeywordResponse[] }>(
        this.buildApiPath('/keywords'),  // InfraDocs format: /dispatcher/${publisher}/keywords
        request
      );

      subsegment?.close();

      return {
        success: true,
        keywords: response.data.keywords,
        details: response.data
      };
    } catch (error) {
      return this.handleError(error, 'createKeywords');
    }
  }

  /**
   * Update a keyword in Zilkr Dispatcher
   *
   * @param keywordId - The keyword ID to update
   * @param updates - The fields to update
   * @returns PlatformAPIResponse with keyword update results
   */
  async updateKeywords(
    keywordId: string,
    updates: ZilkrKeywordUpdateRequest
  ): Promise<PlatformAPIResponse> {
    try {
      const request: ZilkrKeywordUpdateRequest = { ...updates };

      // Remove undefined fields
      Object.keys(request).forEach(key =>
        request[key as keyof ZilkrKeywordUpdateRequest] === undefined && delete request[key as keyof ZilkrKeywordUpdateRequest]
      );

      // Check if there are any fields to update
      if (Object.keys(request).length === 0) {
        console.warn(`[Zilkr Dispatcher] No valid fields to update for keyword: ${keywordId}`);
        return {
          success: false,
          error: 'No valid fields to update'
        };
      }

      const segment = AWSXRay.getSegment();
      const subsegment = segment?.addNewSubsegment('ZilkrDispatcher.updateKeywords');

      // Make API call to update keyword
      const response = await this.httpClient.put<ZilkrKeywordResponse>(
        this.buildApiPath(`/keywords/${keywordId}`),  // InfraDocs format: /dispatcher/${publisher}/keywords/{id}
        request
      );

      subsegment?.close();

      return {
        success: true,
        keywordId: response.data.id,
        details: response.data
      };
    } catch (error) {
      return this.handleError(error, 'updateKeywords');
    }
  }
}
