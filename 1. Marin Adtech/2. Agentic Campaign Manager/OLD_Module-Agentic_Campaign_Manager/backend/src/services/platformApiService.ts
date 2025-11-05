/**
 * Platform API Service Base
 * Base interface and abstract class for platform API services
 */

import { CampaignPlan } from '../types/ai.types';
import { PlatformAPIResponse } from '../types/campaign.types';

/**
 * Platform API Interface
 * Defines the contract for platform API services
 */
export interface IPlatformAPI {
  /**
   * Create a campaign on the platform
   */
  createCampaign(campaignPlan: CampaignPlan, name: string): Promise<PlatformAPIResponse>;

  /**
   * Update a campaign on the platform
   */
  updateCampaign(campaignId: string, updates: Partial<CampaignPlan>): Promise<PlatformAPIResponse>;

  /**
   * Pause a campaign on the platform
   */
  pauseCampaign(campaignId: string): Promise<PlatformAPIResponse>;

  /**
   * Resume a campaign on the platform
   */
  resumeCampaign(campaignId: string): Promise<PlatformAPIResponse>;

  /**
   * Delete a campaign on the platform
   */
  deleteCampaign(campaignId: string): Promise<PlatformAPIResponse>;

  /**
   * Get campaign status from the platform
   */
  getCampaignStatus(campaignId: string): Promise<PlatformAPIResponse>;

  /**
   * Check if authenticated
   */
  isAuthenticated(): Promise<boolean>;
}

/**
 * Abstract Platform API Service
 * Base implementation with common functionality
 */
export abstract class BasePlatformAPI implements IPlatformAPI {
  protected platformName: string;
  protected accessToken?: string;

  constructor(platformName: string, accessToken?: string) {
    this.platformName = platformName;
    this.accessToken = accessToken;
  }

  /**
   * Create a campaign on the platform
   */
  abstract createCampaign(
    campaignPlan: CampaignPlan,
    name: string
  ): Promise<PlatformAPIResponse>;

  /**
   * Update a campaign on the platform
   */
  abstract updateCampaign(
    campaignId: string,
    updates: Partial<CampaignPlan>
  ): Promise<PlatformAPIResponse>;

  /**
   * Pause a campaign on the platform
   */
  abstract pauseCampaign(campaignId: string): Promise<PlatformAPIResponse>;

  /**
   * Resume a campaign on the platform
   */
  abstract resumeCampaign(campaignId: string): Promise<PlatformAPIResponse>;

  /**
   * Delete a campaign on the platform
   */
  abstract deleteCampaign(campaignId: string): Promise<PlatformAPIResponse>;

  /**
   * Get campaign status from the platform
   */
  abstract getCampaignStatus(campaignId: string): Promise<PlatformAPIResponse>;

  /**
   * Check if authenticated
   */
  abstract isAuthenticated(): Promise<boolean>;

  /**
   * Handle API errors
   */
  protected handleError(error: any, operation: string): PlatformAPIResponse {
    console.error(`[${this.platformName}] Error in ${operation}:`, error);
    return {
      success: false,
      error: error.message || `Failed to ${operation} on ${this.platformName}`,
      details: error,
    };
  }

  /**
   * Rate limiting wrapper
   */
  protected async rateLimit<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error: any) {
        lastError = error;

        // Check if it's a rate limit error
        if (error.status === 429 || error.response?.status === 429) {
          const waitTime = delay * Math.pow(2, attempt);
          console.log(
            `[${this.platformName}] Rate limited, waiting ${waitTime}ms before retry...`
          );
          await new Promise((resolve) => setTimeout(resolve, waitTime));
          continue;
        }

        // If not a rate limit error, throw immediately
        throw error;
      }
    }

    throw lastError || new Error('Max retries exceeded');
  }
}

