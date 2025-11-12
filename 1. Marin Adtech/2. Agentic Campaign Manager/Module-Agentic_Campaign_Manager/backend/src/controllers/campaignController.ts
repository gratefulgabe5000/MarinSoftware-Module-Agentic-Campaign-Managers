import { Request, Response } from 'express';
import { ZilkrDispatcherService } from '../services/zilkrDispatcherService';
import { GoogleAdsService } from '../services/googleAdsService';
import { config } from '../config/env';
import { ZilkrCampaignResponse } from '../types/zilkrDispatcher.types';

/**
 * Campaign Controller
 * Handles campaign-related business logic
 * Placeholder implementation for Phase 1 - will be fully implemented in Phase 3-4
 */
export class CampaignController {
  /**
   * Get the appropriate service based on API mode
   * @param apiMode - 'zilkr' or 'direct'
   * @param accountId - Account ID for service initialization
   * @param publisher - Publisher for Zilkr Dispatcher (optional)
   * @returns ZilkrDispatcherService or GoogleAdsService
   */
  private getService(apiMode: string, accountId: string, publisher?: string): ZilkrDispatcherService | GoogleAdsService {
    if (apiMode === 'zilkr') {
      return new ZilkrDispatcherService(accountId, publisher);
    } else {
      return new GoogleAdsService();
    }
  }
  /**
   * Get all campaigns
   * GET /api/campaigns
   */
  getAllCampaigns = async (req: Request, res: Response): Promise<void> => {
    try {
      // For MVP, return empty array (campaigns are stored in frontend store)
      // In production, this would load from database
      res.json({
        campaigns: [],
        total: 0,
      });
    } catch (error) {
      console.error('Error in getAllCampaigns:', error);
      res.status(500).json({ 
        error: 'Failed to retrieve campaigns',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Get campaign by ID
   * GET /api/campaigns/:id
   */
  getCampaignById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      // Placeholder - will be implemented in Phase 3
      res.json({
        id,
        message: 'Campaign retrieval not yet implemented',
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve campaign' });
    }
  };

  /**
   * Get detailed campaign information
   * GET /api/campaigns/:id/details
   */
  getCampaignDetails = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const apiMode = (req.headers['x-api-mode'] as string) || 'direct';
      const accountId = (req.query.accountId as string) || config.zilkrDispatcher.accountId;
      const googleAdsResourceName = (req.query.googleAdsResourceName as string) || id;

      console.log(`[API Mode] Get campaign details request received with API mode: ${apiMode}, campaign ID: ${id}, resource name: ${googleAdsResourceName}`);

      // Check if this is a valid Google Ads resource name
      const isValidGoogleAdsResourceName = (resourceName: string): boolean => {
        return /^customers\/\d+\/campaigns\/\d+$/.test(resourceName);
      };

      if (!isValidGoogleAdsResourceName(googleAdsResourceName)) {
        // Local-only campaign - return basic info
        res.json({
          success: false,
          error: 'Campaign not found in Google Ads',
          localOnly: true,
        });
        return;
      }

      if (apiMode === 'direct') {
        const googleAdsService = new GoogleAdsService();
        const result = await googleAdsService.getCampaignDetails(googleAdsResourceName);
        
        if (!result.success) {
          res.status(404).json(result);
          return;
        }

        res.json({
          ...result,
          campaignId: id,
          googleAdsResourceName,
        });
      } else if (apiMode === 'zilkr') {
        // Zilkr Dispatcher implementation would go here
        res.status(501).json({
          success: false,
          error: 'Zilkr Dispatcher campaign details not yet implemented',
        });
      } else {
        res.status(400).json({
          success: false,
          error: 'Invalid API mode',
        });
      }
    } catch (error) {
      console.error('Error in getCampaignDetails:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve campaign details',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Create new campaign
   * POST /api/campaigns
   */
  createCampaign = async (req: Request, res: Response): Promise<void> => {
    try {
      // Placeholder - will be implemented in Phase 2-3
      res.status(201).json({
        id: 'placeholder-id',
        message: 'Campaign creation not yet implemented',
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create campaign' });
    }
  };

  /**
   * Update campaign
   * PUT /api/campaigns/:id
   */
  updateCampaign = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updates = req.body || {}; // e.g., { name, budget, startDate, endDate, biddingStrategy }

      if (!id) {
        res.status(400).json({
          error: 'Invalid request',
          message: 'Campaign ID is required',
        });
        return;
      }

      // Get API mode from request header (X-API-Mode: 'zilkr' or 'direct')
      // Defaults to 'direct' if not provided
      const apiMode = (req.headers['x-api-mode'] as string) || 'direct';
      
      // Get account ID from query params or use default from config
      const accountId = (req.query.accountId as string) || config.zilkrDispatcher.accountId;
      const publisher = (req.query.publisher as string) || config.zilkrDispatcher.publisher;
      const googleAdsResourceName = (req.query.googleAdsResourceName as string) || id;

      console.log(`[API Mode] Update campaign request received with API mode: ${apiMode}, campaign ID: ${id}, resource name: ${googleAdsResourceName}`);

      // Check if this is a valid Google Ads resource name
      if (!this.isValidGoogleAdsResourceName(googleAdsResourceName)) {
        // Local-only campaign - just return success
        res.json({
          id,
          status: updates.status || 'active',
          updatedAt: new Date(),
          localOnly: true,
          ...updates,
        });
        return;
      }

      if (apiMode === 'direct') {
        const googleAdsService = new GoogleAdsService();
        
        // Build update payload for Google Ads API
        const updatePayload: any = {};
        
        if (updates.name) {
          updatePayload.name = updates.name;
        }
        
        if (updates.startDate) {
          updatePayload.start_date = updates.startDate;
        }
        
        if (updates.endDate) {
          updatePayload.end_date = updates.endDate;
        }
        
        if (updates.biddingStrategy?.manualCpc) {
          updatePayload.manual_cpc = {
            enhanced_cpc_enabled: updates.biddingStrategy.manualCpc.enhancedCpcEnabled || false,
          };
        }

        // Update campaign
        const result = await googleAdsService.updateCampaign(googleAdsResourceName, updatePayload);
        
        if (!result.success) {
          res.status(500).json({
            error: 'Failed to update campaign in Google Ads',
            message: result.error || 'Unknown error',
            details: result.details,
          });
          return;
        }

        // Update budget if provided
        if (updates.budget?.amount) {
          // Get budget resource name from campaign details first
          const detailsResult = await googleAdsService.getCampaignDetails(googleAdsResourceName);
          if (detailsResult.success && detailsResult.campaign?.budget?.resourceName) {
            // Update budget amount (convert dollars to micros)
            const budgetMicros = Math.round(updates.budget.amount * 1000000);
            // Note: Budget update would need a separate method in GoogleAdsService
            // For now, we'll just log it
            console.log(`[Update] Budget update requested: $${updates.budget.amount} (${budgetMicros} micros) for ${detailsResult.campaign.budget.resourceName}`);
          }
        }

        res.json({
          id,
          status: 'active',
          updatedAt: new Date(),
          ...updates,
        });
      } else if (apiMode === 'zilkr') {
        // Zilkr Dispatcher implementation would go here
        res.status(501).json({
          error: 'Zilkr Dispatcher campaign update not yet implemented',
        });
      } else {
        res.status(400).json({
          error: 'Invalid API mode',
        });
      }
    } catch (error) {
      console.error('Error in updateCampaign:', error);
      res.status(500).json({
        error: 'Failed to update campaign',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Helper function to check if a string is a valid Google Ads resource name
   * Valid format: customers/{customer_id}/campaigns/{campaign_id}
   */
  private isValidGoogleAdsResourceName(resourceName: string): boolean {
    if (!resourceName || typeof resourceName !== 'string') {
      return false;
    }
    // Check if it matches the pattern: customers/{number}/campaigns/{number}
    const resourceNamePattern = /^customers\/\d+\/campaigns\/\d+$/;
    return resourceNamePattern.test(resourceName);
  }

  /**
   * Delete campaign
   * DELETE /api/campaigns/:id
   */
  deleteCampaign = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          error: 'Invalid request',
          message: 'Campaign ID is required',
        });
        return;
      }

      // Get API mode from request header (X-API-Mode: 'zilkr' or 'direct')
      // Defaults to 'direct' if not provided
      const apiMode = (req.headers['x-api-mode'] as string) || 'direct';
      
      // Get account ID from query params or use default from config
      const accountId = (req.query.accountId as string) || config.zilkrDispatcher.accountId;
      const publisher = (req.query.publisher as string) || config.zilkrDispatcher.publisher;

      // Get the Google Ads resource name from request body or use ID directly
      const googleAdsResourceName = (req.body?.googleAdsResourceName as string) || id;

      console.log(`[API Mode] Delete campaign request received with API mode: ${apiMode}, campaign ID: ${id}, resource name: ${googleAdsResourceName}`);

      // Check if this is a local-only campaign (not created in Google Ads)
      const isLocalOnly = !this.isValidGoogleAdsResourceName(googleAdsResourceName);

      if (isLocalOnly) {
        console.log(`[Delete] Campaign ${id} is local-only (not in Google Ads), skipping Google Ads deletion`);
        // For local-only campaigns, just return success without calling Google Ads API
        res.json({
          message: 'Local campaign deleted',
          id: id,
          deletedAt: new Date(),
          localOnly: true,
        });
        return;
      }

      // Campaign exists in Google Ads - delete it there first
      const service = this.getService(apiMode, accountId, publisher);

      // Call the service to delete the campaign from Google Ads
      if (apiMode === 'direct' && service instanceof GoogleAdsService) {
        const result = await service.deleteCampaign(googleAdsResourceName);
        
        if (!result.success) {
          res.status(500).json({
            error: 'Failed to delete campaign from Google Ads',
            message: result.error || 'Unknown error',
            details: result.details,
          });
          return;
        }
      } else if (apiMode === 'zilkr' && service instanceof ZilkrDispatcherService) {
        // Zilkr Dispatcher delete implementation would go here
        console.log(`[API Mode] Zilkr Dispatcher delete not yet implemented`);
      }

      // Return success
      res.json({
        message: 'Campaign deleted',
        id: id,
        deletedAt: new Date(),
        localOnly: false,
      });
    } catch (error) {
      console.error('Error in deleteCampaign:', error);
      res.status(500).json({
        error: 'Failed to delete campaign',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Launch campaign
   * POST /api/campaigns/:id/launch
   */
  launchCampaign = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      // Placeholder - will be implemented in Phase 4
      res.json({
        id,
        status: 'launched',
        message: 'Campaign launch not yet implemented',
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to launch campaign' });
    }
  };

  /**
   * Pause campaign
   * POST /api/campaigns/:id/pause
   */
  pauseCampaign = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          error: 'Invalid request',
          message: 'Campaign ID is required',
        });
        return;
      }

      // Get API mode from request header (X-API-Mode: 'zilkr' or 'direct')
      // Defaults to 'direct' if not provided
      const apiMode = (req.headers['x-api-mode'] as string) || 'direct';
      
      // Get account ID from query params or use default from config
      const accountId = (req.query.accountId as string) || config.zilkrDispatcher.accountId;
      const publisher = (req.query.publisher as string) || config.zilkrDispatcher.publisher;

      // Get the Google Ads resource name from request body or use ID directly
      // The ID might be a resource name (customers/123/campaigns/456) or our internal ID
      // If it's our internal ID, we need the resource name from platformCampaignIds
      const googleAdsResourceName = (req.body?.googleAdsResourceName as string) || id;

      console.log(`[API Mode] Pause campaign request received with API mode: ${apiMode}, campaign ID: ${id}, resource name: ${googleAdsResourceName}`);

      // Check if this is a local-only campaign (not created in Google Ads)
      const isLocalOnly = !this.isValidGoogleAdsResourceName(googleAdsResourceName);

      if (isLocalOnly) {
        console.log(`[Pause] Campaign ${id} is local-only (not in Google Ads), updating local status only`);
        // For local-only campaigns, just update the status locally
        res.json({
          message: 'Local campaign paused',
          id: id,
          status: 'paused',
          updatedAt: new Date(),
          localOnly: true,
        });
        return;
      }

      // Campaign exists in Google Ads - pause it there
      const service = this.getService(apiMode, accountId, publisher);

      // Call the service to pause the campaign
      if (apiMode === 'direct' && service instanceof GoogleAdsService) {
        const result = await service.pauseCampaign(googleAdsResourceName);
        
        if (!result.success) {
          res.status(500).json({
            error: 'Failed to pause campaign',
            message: result.error || 'Unknown error',
            details: result.details,
          });
          return;
        }
      } else if (apiMode === 'zilkr' && service instanceof ZilkrDispatcherService) {
        // Zilkr Dispatcher pause implementation would go here
        console.log(`[API Mode] Zilkr Dispatcher pause not yet implemented`);
      }

      // Return success
      res.json({
        message: 'Campaign paused',
        id: id,
        status: 'paused',
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error in pauseCampaign:', error);
      res.status(500).json({
        error: 'Failed to pause campaign',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Resume campaign
   * POST /api/campaigns/:id/resume
   */
  resumeCampaign = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          error: 'Invalid request',
          message: 'Campaign ID is required',
        });
        return;
      }

      // Get API mode from request header (X-API-Mode: 'zilkr' or 'direct')
      // Defaults to 'direct' if not provided
      const apiMode = (req.headers['x-api-mode'] as string) || 'direct';
      
      // Get account ID from query params or use default from config
      const accountId = (req.query.accountId as string) || config.zilkrDispatcher.accountId;
      const publisher = (req.query.publisher as string) || config.zilkrDispatcher.publisher;

      // Get the Google Ads resource name from request body or use ID directly
      const googleAdsResourceName = (req.body?.googleAdsResourceName as string) || id;

      console.log(`[API Mode] Resume campaign request received with API mode: ${apiMode}, campaign ID: ${id}, resource name: ${googleAdsResourceName}`);

      // Check if this is a local-only campaign (not created in Google Ads)
      const isLocalOnly = !this.isValidGoogleAdsResourceName(googleAdsResourceName);

      if (isLocalOnly) {
        console.log(`[Resume] Campaign ${id} is local-only (not in Google Ads), updating local status only`);
        // For local-only campaigns, just update the status locally
        res.json({
          message: 'Local campaign resumed',
          id: id,
          status: 'active',
          updatedAt: new Date(),
          localOnly: true,
        });
        return;
      }

      // Campaign exists in Google Ads - resume it there
      const service = this.getService(apiMode, accountId, publisher);

      // Call the service to resume the campaign
      if (apiMode === 'direct' && service instanceof GoogleAdsService) {
        const result = await service.resumeCampaign(googleAdsResourceName);
        
        if (!result.success) {
          res.status(500).json({
            error: 'Failed to resume campaign',
            message: result.error || 'Unknown error',
            details: result.details,
          });
          return;
        }
      } else if (apiMode === 'zilkr' && service instanceof ZilkrDispatcherService) {
        // Zilkr Dispatcher resume implementation would go here
        console.log(`[API Mode] Zilkr Dispatcher resume not yet implemented`);
      }

      // Return success
      res.json({
        message: 'Campaign resumed',
        id: id,
        status: 'active',
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error in resumeCampaign:', error);
      res.status(500).json({
        error: 'Failed to resume campaign',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Sync campaigns from Zilkr Dispatcher or Direct Google Ads API
   * POST /api/campaigns/sync
   * Fetches all campaigns from the selected API and returns them in Campaign format
   */
  syncCampaigns = async (req: Request, res: Response): Promise<void> => {
    try {
      // Get API mode from request header (X-API-Mode: 'zilkr' or 'direct')
      // Defaults to 'direct' if not provided
      const apiMode = (req.headers['x-api-mode'] as string) || 'direct';
      
      // Log API mode for verification
      console.log(`[API Mode] Campaign sync request received with API mode: ${apiMode}`);
      
      // Get account ID from query params or use default from config
      const accountId = (req.query.accountId as string) || config.zilkrDispatcher.accountId;
      const publisher = (req.query.publisher as string) || config.zilkrDispatcher.publisher;

      if (!accountId) {
        res.status(400).json({
          error: 'Invalid request',
          message: 'Account ID is required. Provide accountId query parameter or set ZILKR_DISPATCHER_ACCOUNT_ID in environment.',
        });
        return;
      }

      let allCampaigns: ZilkrCampaignResponse[] = [];

      if (apiMode === 'zilkr') {
        console.log(`[API Mode] Using ZilkrDispatcherService for campaign sync`);
        // Use Zilkr Dispatcher Service
        const dispatcherService = new ZilkrDispatcherService(accountId, publisher);

        // Query all campaigns (with pagination if needed)
        let offset = 0;
        const limit = 100; // Fetch in batches of 100
        let hasMore = true;

        while (hasMore) {
          const response = await dispatcherService.queryCampaigns(limit, offset);
          
          if (response.campaigns && Array.isArray(response.campaigns)) {
            allCampaigns = [...allCampaigns, ...response.campaigns];
            
            // Check if there are more campaigns to fetch
            hasMore = response.campaigns.length === limit && allCampaigns.length < response.total;
            offset += limit;
          } else {
            hasMore = false;
          }
        }
      } else {
        // Use Direct Google Ads API
        console.log(`[API Mode] Using GoogleAdsService (direct) for campaign sync`);
        const googleAdsService = new GoogleAdsService();
        
        // GoogleAdsService.queryCampaigns has different signature
        // It returns an array directly, not a paginated response
        const campaigns = await googleAdsService.queryCampaigns(accountId);
        
        // Map Google Ads campaigns to ZilkrCampaignResponse format
        allCampaigns = campaigns.map((campaign: any) => ({
          id: campaign.id,
          accountId: accountId, // Required by ZilkrCampaignResponse
          name: campaign.name,
          campaignStatus: campaign.status === 'ENABLED' ? 'ENABLED' : 
                         campaign.status === 'PAUSED' ? 'PAUSED' : 'REMOVED',
          budget: {
            amount: campaign.budget || 0,
            deliveryMethod: 'STANDARD', // Default delivery method
          },
          biddingStrategy: campaign.biddingStrategyType || 'TARGET_SPEND',
          createdAt: campaign.startDate || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'SUCCESS' as const, // Required by ZilkrBaseResponse
          isMock: campaign.isMock || false, // Pass through mock flag
        }));
      }

      // Map ZilkrCampaignResponse to Campaign format
      const mappedCampaigns = allCampaigns.map((zilkrCampaign) => {
        // Map Zilkr status to Campaign status
        const statusMap: Record<string, string> = {
          'ENABLED': 'active',
          'PAUSED': 'paused',
          'REMOVED': 'archived',
        };

        const campaignStatus = statusMap[zilkrCampaign.campaignStatus] || 'active';

        // Create a minimal CampaignPlan from Zilkr campaign data
        const campaignPlan = {
          objective: 'sync', // Default objective for synced campaigns
          budget: {
            total: zilkrCampaign.budget?.amount || 0,
            daily: zilkrCampaign.budget?.amount || 0,
            currency: 'USD',
          },
          timeline: {
            startDate: zilkrCampaign.createdAt || new Date().toISOString(),
            endDate: undefined,
            duration: 30, // Default duration in days
          },
          platforms: ['google'], // Default to google for now
          targetAudience: {
            demographics: {
              age: '18-65',
              gender: 'all',
              location: 'all',
              interests: [],
            },
          },
          kpis: {
            primary: 'conversions',
            secondary: [],
          },
        };

        return {
          id: zilkrCampaign.id,
          name: zilkrCampaign.name,
          description: `Synced from ${apiMode === 'zilkr' ? 'Zilkr Dispatcher' : 'Direct Google Ads'} - ${zilkrCampaign.campaignStatus}`,
          campaignPlan,
          status: campaignStatus as any,
          platformCampaignIds: {
            googleAds: zilkrCampaign.id,
            zilkr: zilkrCampaign.id,
          },
          createdAt: zilkrCampaign.createdAt ? new Date(zilkrCampaign.createdAt) : new Date(),
          updatedAt: zilkrCampaign.updatedAt ? new Date(zilkrCampaign.updatedAt) : new Date(),
          metadata: {
            tags: ['synced', apiMode === 'zilkr' ? 'zilkr-dispatcher' : 'direct-google-ads'],
            notes: `Synced from ${apiMode === 'zilkr' ? 'Zilkr Dispatcher' : 'Direct Google Ads'}. Bidding Strategy: ${zilkrCampaign.biddingStrategy || 'N/A'}`,
          },
          isMock: (zilkrCampaign as any).isMock || false, // Pass through mock flag from Google Ads campaigns
        };
      });

      res.json({
        campaigns: mappedCampaigns,
        total: mappedCampaigns.length,
        syncedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error in syncCampaigns:', error);
      res.status(500).json({
        error: 'Failed to sync campaigns from Zilkr Dispatcher',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };
}

