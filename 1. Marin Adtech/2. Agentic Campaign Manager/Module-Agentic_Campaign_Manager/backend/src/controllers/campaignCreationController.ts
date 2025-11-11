import { Request, Response } from 'express';
import { CampaignCreationRequest } from '../types/campaign.types';
import { campaignCreationService } from '../services/campaignCreationService';
import { GoogleAdsService } from '../services/googleAdsService';
import { MetaAdsService } from '../services/metaAdsService';
import { MicrosoftAdsService } from '../services/microsoftAdsService';
import { MarinDispatcherService } from '../services/marinDispatcherService';

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
    campaignCreationService.registerPlatform('Meta', new MetaAdsService());
    campaignCreationService.registerPlatform('Microsoft Ads', new MicrosoftAdsService());
    // Register Marin Dispatcher service (optional - primarily used by Lambda functions)
    campaignCreationService.registerPlatform('Marin', new MarinDispatcherService());
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

      const request: CampaignCreationRequest = {
        campaignPlan,
        name,
        description,
        metadata,
      };

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

      const request: CampaignCreationRequest = {
        campaignPlan,
        name,
        description,
        metadata,
      };

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

