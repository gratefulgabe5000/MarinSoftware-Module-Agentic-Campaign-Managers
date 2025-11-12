import { Request, Response } from 'express';
import { CampaignCreationRequest } from '../types/campaign.types';
import { campaignCreationService } from '../services/campaignCreationService';
import { GoogleAdsService } from '../services/googleAdsService';
import { MetaAdsService } from '../services/metaAdsService';
import { MicrosoftAdsService } from '../services/microsoftAdsService';
import { ZilkrDispatcherService } from '../services/zilkrDispatcherService';

/**
 * Campaign Creation Controller
 * Handles campaign creation API endpoints
 */
export class CampaignCreationController {
  constructor() {
    // Register platform services on initialization
    // In production, these would be loaded from database/storage
    this.initializePlatformServices();
  }

  /**
   * Initialize platform services
   * TODO: Load access tokens from database/storage
   */
  private initializePlatformServices(): void {
    // For MVP, register services without tokens (will fail authentication check)
    // In production, tokens would be loaded from user's stored OAuth tokens
    campaignCreationService.registerPlatform('Google Ads', new GoogleAdsService());
    campaignCreationService.registerPlatform('google', new GoogleAdsService()); // Also register lowercase
    campaignCreationService.registerPlatform('googleAds', new GoogleAdsService()); // Also register camelCase
    campaignCreationService.registerPlatform('Meta', new MetaAdsService());
    campaignCreationService.registerPlatform('Microsoft Ads', new MicrosoftAdsService());
    // Register Zilkr Dispatcher service for Google Ads campaigns (used for draft creation)
    const marinService = new ZilkrDispatcherService();
    campaignCreationService.registerPlatform('Zilkr', marinService);
    // Also register Zilkr for 'google' platform to use for draft creation
    // Note: This will use Zilkr Dispatcher instead of direct Google Ads API
  }

  /**
   * Create campaign
   * POST /api/campaigns/create
   */
  createCampaign = async (req: Request, res: Response): Promise<void> => {
    try {
      const { campaignPlan, name, description, metadata } = req.body;

      // Validate request
      if (!campaignPlan || !name) {
        res.status(400).json({
          error: 'Invalid request',
          message: 'campaignPlan and name are required',
        });
        return;
      }

      // Validate campaign plan structure
      if (
        !campaignPlan.objective ||
        !campaignPlan.budget ||
        !campaignPlan.timeline ||
        !campaignPlan.platforms ||
        campaignPlan.platforms.length === 0
      ) {
        res.status(400).json({
          error: 'Invalid campaign plan',
          message: 'Campaign plan is missing required fields',
        });
        return;
      }

      // Validate budget values
      if (campaignPlan.budget.total !== undefined && campaignPlan.budget.total < 0) {
        res.status(400).json({
          error: 'Invalid campaign plan',
          message: 'Budget total cannot be negative',
        });
        return;
      }

      if (campaignPlan.budget.daily !== undefined && campaignPlan.budget.daily < 0) {
        res.status(400).json({
          error: 'Invalid campaign plan',
          message: 'Budget daily cannot be negative',
        });
        return;
      }

      // Get status from request body (for draft creation)
      const status = req.body.status; // 'paused' for drafts, undefined for active campaigns
      
      // Get API mode from request header (X-API-Mode: 'zilkr' or 'direct')
      // Defaults to 'direct' if not provided
      const apiMode = (req.headers['x-api-mode'] as string) || 'direct';
      
      // Log API mode for verification
      console.log(`[API Mode] Campaign creation request received with API mode: ${apiMode}`);
      
      const request: CampaignCreationRequest = {
        campaignPlan,
        name,
        description,
        metadata,
        ...(status && { status }), // Include status if provided
        apiMode, // Include API mode for service routing
      } as any; // Type assertion needed since status and apiMode are not in CampaignCreationRequest interface

      // Create campaign
      const response = await campaignCreationService.createCampaign(request);

      // Return appropriate status code based on result
      const statusCode = response.errors && response.errors.length > 0 ? 207 : 201; // 207 = Multi-Status

      res.status(statusCode).json(response);
    } catch (error) {
      console.error('Error in createCampaign:', error);
      res.status(500).json({
        error: 'Failed to create campaign',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Create campaign with progress tracking (WebSocket/SSE)
   * POST /api/campaigns/create-with-progress
   */
  createCampaignWithProgress = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { campaignPlan, name, description, metadata } = req.body;

      // Validate request
      if (!campaignPlan || !name) {
        res.status(400).json({
          error: 'Invalid request',
          message: 'campaignPlan and name are required',
        });
        return;
      }

      // Get API mode from request header (X-API-Mode: 'zilkr' or 'direct')
      // Defaults to 'direct' if not provided
      const apiMode = (req.headers['x-api-mode'] as string) || 'direct';
      
      const request: CampaignCreationRequest = {
        campaignPlan,
        name,
        description,
        metadata,
        apiMode, // Include API mode for service routing
      } as any; // Type assertion needed since apiMode is not in CampaignCreationRequest interface

      // Set up Server-Sent Events for progress updates
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      // Create campaign with progress tracking
      const response = await campaignCreationService.createCampaignWithProgress(
        request,
        (progress) => {
          // Send progress update via SSE
          res.write(`data: ${JSON.stringify(progress)}\n\n`);
        }
      );

      // Send final response
      res.write(`data: ${JSON.stringify({ type: 'complete', response })}\n\n`);
      res.end();
    } catch (error) {
      console.error('Error in createCampaignWithProgress:', error);
      res.write(
        `data: ${JSON.stringify({
          type: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        })}\n\n`
      );
      res.end();
    }
  };
}

