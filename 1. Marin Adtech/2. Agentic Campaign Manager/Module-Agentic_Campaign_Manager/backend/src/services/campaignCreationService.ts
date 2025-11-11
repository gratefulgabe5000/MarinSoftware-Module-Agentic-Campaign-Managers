import {
  CampaignCreationRequest,
  CampaignCreationResponse,
  CampaignCreationProgress,
  CampaignStatus,
  PlatformCampaignIds,
  CampaignCreationError,
} from '../types/campaign.types';
import { GoogleAdsService } from './googleAdsService';
import { MetaAdsService } from './metaAdsService';
import { MicrosoftAdsService } from './microsoftAdsService';
import { IPlatformAPI } from './platformApiService';

/**
 * Campaign Creation Service
 * Orchestrates campaign creation across multiple platforms
 */
class CampaignCreationService {
  private platformServices: Map<string, IPlatformAPI>;

  constructor() {
    this.platformServices = new Map();
  }

  /**
   * Register a platform service
   */
  registerPlatform(platform: string, service: IPlatformAPI): void {
    this.platformServices.set(platform.toLowerCase(), service);
  }

  /**
   * Get platform service
   */
  private getPlatformService(platform: string): IPlatformAPI | null {
    return this.platformServices.get(platform.toLowerCase()) || null;
  }

  /**
   * Create campaign across all platforms
   */
  async createCampaign(
    request: CampaignCreationRequest
  ): Promise<CampaignCreationResponse> {
    const { campaignPlan, name } = request;
    // Get API status from request (for draft creation) - default to 'ENABLED'
    const apiStatus = (request as any).status === 'paused' ? 'PAUSED' : 'ENABLED';
    const campaignId = `campaign-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const platformCampaignIds: PlatformCampaignIds = {};
    const errors: CampaignCreationError[] = [];

    // Create campaign on each platform
    const platformPromises = campaignPlan.platforms.map(async (platform) => {
      // For Google Ads campaigns, always use Zilkr Dispatcher instead of direct Google Ads API
      // This ensures we use the Zilkr Dispatcher for all Google Ads operations (draft or active)
      let service: IPlatformAPI | null = null;
      
      // Check if this is a Google Ads platform
      const isGoogleAds = platform.toLowerCase() === 'google' || 
                         platform.toLowerCase() === 'googleads' || 
                         platform.toLowerCase() === 'google ads' ||
                         platform.toLowerCase().includes('google');
      
      if (isGoogleAds) {
        // Always use Zilkr Dispatcher for Google Ads campaigns
        service = this.getPlatformService('Zilkr');
      } else {
        // For other platforms, use the registered service
        service = this.getPlatformService(platform);
      }

      if (!service) {
        errors.push({
          platform,
          error: `Platform service not registered for ${platform}`,
        });
        return;
      }

      // Check authentication (Zilkr Dispatcher doesn't require auth, but other services might)
      const isAuthenticated = await service.isAuthenticated();
      if (!isAuthenticated) {
        // For Zilkr Dispatcher, authentication check might fail in local dev but still work
        // Check if this is Zilkr Dispatcher service
        const isZilkrDispatcher = service.constructor.name === 'ZilkrDispatcherService';
        if (!isZilkrDispatcher) {
          errors.push({
            platform,
            error: `Not authenticated for ${platform}. Please connect your account first.`,
          });
          return;
        }
        // For Zilkr Dispatcher, continue even if auth check fails (it's internal network)
      }

      try {
        // Create campaign on platform with API status (for Zilkr Dispatcher, pass status; other platforms may ignore it)
        const response = await service.createCampaign(campaignPlan, name, apiStatus);

        if (response.success && response.campaignId) {
          // Map platform name to response key
          const platformKey = this.getPlatformKey(platform);
          if (platformKey) {
            platformCampaignIds[platformKey] = response.campaignId;
          }
        } else {
          errors.push({
            platform,
            error: response.error || 'Failed to create campaign',
            details: response.details,
          });
        }
      } catch (error) {
        errors.push({
          platform,
          error: error instanceof Error ? error.message : 'Unknown error',
          details: error,
        });
      }
    });

    // Wait for all platform creations to complete
    await Promise.allSettled(platformPromises);

    // Determine overall status
    const status: CampaignStatus =
      errors.length === 0
        ? 'active'
        : errors.length === campaignPlan.platforms.length
        ? 'error'
        : 'active'; // Partial success

    return {
      campaignId,
      status,
      platformCampaignIds,
      createdAt: new Date(),
      errors: errors.length > 0 ? errors : undefined,
      message:
        errors.length === 0
          ? 'Campaign created successfully on all platforms'
          : errors.length === campaignPlan.platforms.length
          ? 'Campaign creation failed on all platforms'
          : `Campaign created with ${errors.length} error(s)`,
    };
  }

  /**
   * Get platform key for response mapping
   */
  private getPlatformKey(platform: string): keyof PlatformCampaignIds | null {
    const platformLower = platform.toLowerCase();
    if (platformLower.includes('google')) return 'googleAds';
    if (platformLower.includes('meta') || platformLower.includes('facebook')) return 'meta';
    if (platformLower.includes('microsoft') || platformLower.includes('bing')) return 'microsoft';
    if (platformLower.includes('marin')) return 'marin';
    return null;
  }

  /**
   * Create campaign with progress tracking
   */
  async createCampaignWithProgress(
    request: CampaignCreationRequest,
    onProgress?: (progress: CampaignCreationProgress) => void
  ): Promise<CampaignCreationResponse> {
    const { campaignPlan, name } = request;
    const campaignId = `campaign-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const platformCampaignIds: PlatformCampaignIds = {};
    const errors: CampaignCreationError[] = [];
    const completedPlatforms: string[] = [];
    const failedPlatforms: string[] = [];

    const totalPlatforms = campaignPlan.platforms.length;

    // Create campaign on each platform sequentially to track progress
    for (let i = 0; i < campaignPlan.platforms.length; i++) {
      const platform = campaignPlan.platforms[i];
      const progress = Math.round(((i + 1) / totalPlatforms) * 100);

      // Update progress
      if (onProgress) {
        onProgress({
          campaignId,
          status: 'creating',
          progress,
          completedPlatforms: [...completedPlatforms],
          failedPlatforms: [...failedPlatforms],
          currentPlatform: platform,
          message: `Creating campaign on ${platform}...`,
        });
      }

      const service = this.getPlatformService(platform);

      if (!service) {
        const error: CampaignCreationError = {
          platform,
          error: `Platform service not registered for ${platform}`,
        };
        errors.push(error);
        failedPlatforms.push(platform);
        continue;
      }

      // Check authentication
      const isAuthenticated = await service.isAuthenticated();
      if (!isAuthenticated) {
        const error: CampaignCreationError = {
          platform,
          error: `Not authenticated for ${platform}. Please connect your account first.`,
        };
        errors.push(error);
        failedPlatforms.push(platform);
        continue;
      }

      try {
        // Create campaign on platform
        const response = await service.createCampaign(campaignPlan, name);

        if (response.success && response.campaignId) {
          const platformKey = this.getPlatformKey(platform);
          if (platformKey) {
            platformCampaignIds[platformKey] = response.campaignId;
          }
          completedPlatforms.push(platform);
        } else {
          const error: CampaignCreationError = {
            platform,
            error: response.error || 'Failed to create campaign',
            details: response.details,
          };
          errors.push(error);
          failedPlatforms.push(platform);
        }
      } catch (error) {
        const campaignError: CampaignCreationError = {
          platform,
          error: error instanceof Error ? error.message : 'Unknown error',
          details: error,
        };
        errors.push(campaignError);
        failedPlatforms.push(platform);
      }
    }

    // Determine overall status
    const status: CampaignStatus =
      errors.length === 0
        ? 'active'
        : errors.length === campaignPlan.platforms.length
        ? 'error'
        : 'active';

    // Final progress update
    if (onProgress) {
      onProgress({
        campaignId,
        status,
        progress: 100,
        completedPlatforms,
        failedPlatforms,
        message:
          errors.length === 0
            ? 'Campaign created successfully on all platforms'
            : errors.length === campaignPlan.platforms.length
            ? 'Campaign creation failed on all platforms'
            : `Campaign created with ${errors.length} error(s)`,
      });
    }

    return {
      campaignId,
      status,
      platformCampaignIds,
      createdAt: new Date(),
      errors: errors.length > 0 ? errors : undefined,
      message:
        errors.length === 0
          ? 'Campaign created successfully on all platforms'
          : errors.length === campaignPlan.platforms.length
          ? 'Campaign creation failed on all platforms'
          : `Campaign created with ${errors.length} error(s)`,
    };
  }
}

// Export singleton instance
export const campaignCreationService = new CampaignCreationService();

// Export class for testing
export default CampaignCreationService;

