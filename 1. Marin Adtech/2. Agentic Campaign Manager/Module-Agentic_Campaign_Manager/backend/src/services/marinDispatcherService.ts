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
  MarinAdGroupRequest,
  MarinAdGroupResponse,
  MarinAdGroupUpdateRequest,
  MarinAdRequest,
  MarinAdResponse,
  MarinAdUpdateRequest,
  MarinKeywordRequest,
  MarinKeywordResponse,
  MarinKeywordUpdateRequest,
  MarinBulkKeywordRequest,
} from '../types/marinDispatcher.types';
import { validateCampaignRequest, validateAdGroupRequest, validateAdRequest, validateKeywordRequest, ValidationResult } from '../utils/marinTypeValidators';
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
   *
   * @returns Promise<boolean> True if API is reachable, false otherwise
   *
   * @example
   * ```typescript
   * const service = new MarinDispatcherService();
   * const isAuth = await service.isAuthenticated();
   * if (isAuth) {
   *   console.log('Connected to Marin Dispatcher API');
   * }
   * ```
   *
   * @error Network connectivity errors are caught and logged, returning false
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
   *
   * @param campaignPlan - Campaign plan with budget and objective information
   * @param name - Campaign name (max 255 characters)
   * @returns Promise<PlatformAPIResponse> Response with success status, campaign ID, and details
   *
   * @example
   * ```typescript
   * const campaignPlan: CampaignPlan = {
   *   budget: { total: 1000, daily: 50 },
   *   objective: 'SALES'
   * };
   * const response = await service.createCampaign(campaignPlan, 'Summer Sale 2024');
   * if (response.success) {
   *   console.log('Campaign created:', response.campaignId);
   * }
   * ```
   *
   * @error Validation errors if budget is missing or name exceeds 255 chars
   * @error Network errors from Dispatcher API are caught and returned in response
   */
  async createCampaign(
    campaignPlan: CampaignPlan,
    name: string
  ): Promise<PlatformAPIResponse> {
    const segment = AWSXRay.getSegment();
    const subsegment = segment?.addNewSubsegment('MarinDispatcher.createCampaign');

    try {
      // Map CampaignPlan to MarinCampaignRequest
      const request: MarinCampaignRequest = this.mapCampaignPlanToRequest(campaignPlan, name);

      // Validate request
      const validationResult: ValidationResult = validateCampaignRequest(request);
      if (!validationResult.isValid && validationResult.errors.length > 0) {
        subsegment?.close();
        return {
          success: false,
          error: `Validation failed: ${validationResult.errors.join(', ')}`,
        };
      }

      // Make API call (using InfraDocs path format)
      const response = await this.httpClient.post<MarinCampaignResponse>(
        this.buildApiPath('/campaigns'), // InfraDocs format: /dispatcher/${publisher}/campaigns
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
   * Update a campaign on Marin Dispatcher
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
    const subsegment = segment?.addNewSubsegment('MarinDispatcher.updateCampaign');

    try {
      // Validate campaignId
      if (!campaignId || typeof campaignId !== 'string' || campaignId.trim().length === 0) {
        subsegment?.close();
        return {
          success: false,
          error: 'campaignId is required and must be a non-empty string',
        };
      }

      // Map updates to MarinCampaignUpdateRequest
      const request: MarinCampaignUpdateRequest = {};

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
        if (request[key as keyof MarinCampaignUpdateRequest] === undefined) {
          delete request[key as keyof MarinCampaignUpdateRequest];
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
      const response = await this.httpClient.put<MarinCampaignResponse>(
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
   * Pause a campaign on Marin Dispatcher
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
    const subsegment = segment?.addNewSubsegment('MarinDispatcher.pauseCampaign');

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
      const request: MarinCampaignUpdateRequest = {
        status: 'PAUSED',
      };

      // Make API call (using InfraDocs path format)
      const response = await this.httpClient.put<MarinCampaignResponse>(
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
   * Resume a campaign on Marin Dispatcher
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
    const subsegment = segment?.addNewSubsegment('MarinDispatcher.resumeCampaign');

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
      const request: MarinCampaignUpdateRequest = {
        status: 'ENABLED',
      };

      // Make API call (using InfraDocs path format)
      const response = await this.httpClient.put<MarinCampaignResponse>(
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
   * Delete a campaign on Marin Dispatcher
   *
   * Deletes a campaign by setting its status to REMOVED. Note: Marin Dispatcher uses
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
    const subsegment = segment?.addNewSubsegment('MarinDispatcher.deleteCampaign');

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
      const request: MarinCampaignUpdateRequest = {
        status: 'REMOVED',
      };

      // Make API call (using InfraDocs path format)
      const response = await this.httpClient.put<MarinCampaignResponse>(
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
   * Get campaign status from Marin Dispatcher
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
    const subsegment = segment?.addNewSubsegment('MarinDispatcher.getCampaignStatus');

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
      const response = await this.httpClient.get<MarinCampaignResponse>(
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
   * Query campaigns from Marin Dispatcher with optional pagination
   *
   * @param limit - Maximum number of campaigns to return (optional)
   * @param offset - Number of campaigns to skip for pagination (optional)
   * @returns Promise<MarinCampaignListResponse> with campaigns array and pagination info
   */
  async queryCampaigns(
    limit?: number,
    offset?: number
  ): Promise<MarinCampaignListResponse> {
    const segment = AWSXRay.getSegment();
    const subsegment = segment?.addNewSubsegment('MarinDispatcher.queryCampaigns');

    try {
      // Build query parameters
      const params: MarinCampaignListRequest = {
        accountId: this.accountId,
      };

      if (limit !== undefined) {
        params.limit = limit;
      }

      if (offset !== undefined) {
        params.offset = offset;
      }

      // Make API call to list campaigns (using InfraDocs path format)
      const response = await this.httpClient.get<MarinCampaignListResponse>(
        this.buildApiPath('/campaigns'), // InfraDocs format: /dispatcher/${publisher}/campaigns
        { params }
      );

      subsegment?.close();

      return response.data;
    } catch (error: any) {
      subsegment?.close();
      console.error('[Marin Dispatcher] Query campaigns failed:', error);

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
   * Create an ad group in Marin Dispatcher
   *
   * @param campaignId - The campaign ID to create the ad group in
   * @param adGroupData - The ad group data to create
   * @returns PlatformAPIResponse with ad group creation results
   */
  async createAdGroup(
    campaignId: string,
    adGroupData: Omit<MarinAdGroupRequest, 'accountId' | 'campaignId'>
  ): Promise<PlatformAPIResponse> {
    try {
      const request: MarinAdGroupRequest = {
        accountId: this.accountId,
        campaignId,
        ...adGroupData
      };

      // Validate request
      const validation = validateAdGroupRequest(request);
      if (!validation.isValid) {
        console.error(`[Marin Dispatcher] Ad group validation failed:`, validation.errors);
        return {
          success: false,
          error: `Validation failed: ${validation.errors.join(', ')}`
        };
      }

      const segment = AWSXRay.getSegment();
      const subsegment = segment?.addNewSubsegment('MarinDispatcher.createAdGroup');

      const response = await this.httpClient.post<MarinAdGroupResponse>(
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
   * Update an ad group in Marin Dispatcher
   *
   * @param adGroupId - The ad group ID to update
   * @param updates - The fields to update
   * @returns PlatformAPIResponse with ad group update results
   */
  async updateAdGroup(
    adGroupId: string,
    updates: MarinAdGroupUpdateRequest
  ): Promise<PlatformAPIResponse> {
    try {
      const request: MarinAdGroupUpdateRequest = { ...updates };

      // Remove undefined fields
      Object.keys(request).forEach(key =>
        request[key as keyof MarinAdGroupUpdateRequest] === undefined && delete request[key as keyof MarinAdGroupUpdateRequest]
      );

      const segment = AWSXRay.getSegment();
      const subsegment = segment?.addNewSubsegment('MarinDispatcher.updateAdGroup');

      const response = await this.httpClient.put<MarinAdGroupResponse>(
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
   * Create an ad in Marin Dispatcher
   *
   * @param adGroupId - The ad group ID to create the ad in
   * @param adData - The ad data to create (without accountId and adGroupId)
   * @returns PlatformAPIResponse with ad creation results
   */
  async createAd(
    adGroupId: string,
    adData: Omit<MarinAdRequest, 'accountId' | 'adGroupId'>
  ): Promise<PlatformAPIResponse> {
    try {
      // Build complete request with accountId and adGroupId
      const request: MarinAdRequest = {
        accountId: this.accountId,
        adGroupId,
        ...adData,
        type: adData.type || 'RESPONSIVE_SEARCH_AD' // Ensure type is set, but allow override
      };

      // Validate request
      const validation = validateAdRequest(request);
      if (!validation.isValid) {
        console.error(`[Marin Dispatcher] Ad validation failed:`, validation.errors);
        return {
          success: false,
          error: `Validation failed: ${validation.errors.join(', ')}`
        };
      }

      const segment = AWSXRay.getSegment();
      const subsegment = segment?.addNewSubsegment('MarinDispatcher.createAd');

      // Make API call to create ad
      const response = await this.httpClient.post<MarinAdResponse>(
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
   * Update an ad in Marin Dispatcher
   *
   * @param adId - The ad ID to update
   * @param updates - The fields to update
   * @returns PlatformAPIResponse with ad update results
   */
  async updateAd(
    adId: string,
    updates: MarinAdUpdateRequest
  ): Promise<PlatformAPIResponse> {
    try {
      const request: MarinAdUpdateRequest = { ...updates };

      // Remove undefined fields
      Object.keys(request).forEach(key =>
        request[key as keyof MarinAdUpdateRequest] === undefined && delete request[key as keyof MarinAdUpdateRequest]
      );

      // Check if there are any fields to update
      if (Object.keys(request).length === 0) {
        console.warn(`[Marin Dispatcher] No valid fields to update for ad: ${adId}`);
        return {
          success: false,
          error: 'No valid fields to update'
        };
      }

      const segment = AWSXRay.getSegment();
      const subsegment = segment?.addNewSubsegment('MarinDispatcher.updateAd');

      // Make API call to update ad
      const response = await this.httpClient.put<MarinAdResponse>(
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
   * Create keywords in bulk for an ad group in Marin Dispatcher
   *
   * @param adGroupId - The ad group ID to create keywords in
   * @param keywords - Array of keyword data (without accountId and adGroupId)
   * @returns PlatformAPIResponse with keyword creation results
   */
  async createKeywords(
    adGroupId: string,
    keywords: Omit<MarinKeywordRequest, 'accountId' | 'adGroupId'>[]
  ): Promise<PlatformAPIResponse> {
    try {
      // Build complete request with accountId and adGroupId for each keyword
      const request: MarinBulkKeywordRequest = {
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
        console.error(`[Marin Dispatcher] Keyword validation failed:`, validationErrors);
        return {
          success: false,
          error: `Validation failed: ${validationErrors.join('; ')}`
        };
      }

      const segment = AWSXRay.getSegment();
      const subsegment = segment?.addNewSubsegment('MarinDispatcher.createKeywords');

      // Make API call to create keywords in bulk
      const response = await this.httpClient.post<{ keywords: MarinKeywordResponse[] }>(
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
   * Update a keyword in Marin Dispatcher
   *
   * @param keywordId - The keyword ID to update
   * @param updates - The fields to update
   * @returns PlatformAPIResponse with keyword update results
   */
  async updateKeywords(
    keywordId: string,
    updates: MarinKeywordUpdateRequest
  ): Promise<PlatformAPIResponse> {
    try {
      const request: MarinKeywordUpdateRequest = { ...updates };

      // Remove undefined fields
      Object.keys(request).forEach(key =>
        request[key as keyof MarinKeywordUpdateRequest] === undefined && delete request[key as keyof MarinKeywordUpdateRequest]
      );

      // Check if there are any fields to update
      if (Object.keys(request).length === 0) {
        console.warn(`[Marin Dispatcher] No valid fields to update for keyword: ${keywordId}`);
        return {
          success: false,
          error: 'No valid fields to update'
        };
      }

      const segment = AWSXRay.getSegment();
      const subsegment = segment?.addNewSubsegment('MarinDispatcher.updateKeywords');

      // Make API call to update keyword
      const response = await this.httpClient.put<MarinKeywordResponse>(
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
