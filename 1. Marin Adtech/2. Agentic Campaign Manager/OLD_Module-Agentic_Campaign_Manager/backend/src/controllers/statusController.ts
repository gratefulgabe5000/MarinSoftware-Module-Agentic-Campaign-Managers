import { Request, Response } from 'express';
import { StatusUpdate, CampaignStatus } from '../types/campaign.types';
import { GoogleAdsService } from '../services/googleAdsService';
import { MetaAdsService } from '../services/metaAdsService';
import { MicrosoftAdsService } from '../services/microsoftAdsService';
import { IPlatformAPI } from '../services/platformApiService';

/**
 * Status Controller
 * Handles campaign status API endpoints
 */
export class StatusController {
  private platformServices: Map<string, IPlatformAPI>;

  constructor() {
    this.platformServices = new Map();
    this.initializePlatformServices();
  }

  /**
   * Initialize platform services
   * TODO: Load from database/storage
   */
  private initializePlatformServices(): void {
    // For MVP, register services without tokens
    // In production, load from user's stored OAuth tokens
    this.platformServices.set('Google Ads', new GoogleAdsService());
    this.platformServices.set('Meta', new MetaAdsService());
    this.platformServices.set('Microsoft Ads', new MicrosoftAdsService());
  }

  /**
   * Get campaign status
   * GET /api/campaigns/:id/status
   */
  getCampaignStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          error: 'Invalid request',
          message: 'Campaign ID is required',
        });
        return;
      }

      // TODO: Load campaign from database
      // For MVP, we'll check platform APIs directly
      // In production, this would check the database first, then platform APIs

      // Get status from all platforms (for MVP, return mock status)
      const statusUpdate: StatusUpdate = {
        campaignId: id,
        status: 'active' as CampaignStatus, // Default status
        timestamp: new Date(),
        message: 'Campaign is active',
      };

      // Check platform services for status
      // For MVP, we'll return a mock status
      // In production, this would query each platform's API
      const platformStatuses: Array<{ platform: string; status: string }> = [];

      for (const [platformName, service] of this.platformServices.entries()) {
        try {
          const isAuthenticated = await service.isAuthenticated();
          if (isAuthenticated) {
            // For MVP, return mock status
            // In production, call service.getCampaignStatus(campaignId)
            platformStatuses.push({
              platform: platformName,
              status: 'active',
            });
          }
        } catch (error) {
          console.error(`Error checking status for ${platformName}:`, error);
        }
      }

      // If we have platform statuses, update the response
      if (platformStatuses.length > 0) {
        const firstPlatform = platformStatuses[0];
        statusUpdate.platform = firstPlatform.platform;
        statusUpdate.platformStatus = firstPlatform.status;
      }

      res.json(statusUpdate);
    } catch (error) {
      console.error('Error in getCampaignStatus:', error);
      res.status(500).json({
        error: 'Failed to get campaign status',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Get campaign status history
   * GET /api/campaigns/:id/status/history
   */
  getCampaignStatusHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          error: 'Invalid request',
          message: 'Campaign ID is required',
        });
        return;
      }

      // TODO: Load status history from database
      // For MVP, return empty history
      const history: StatusUpdate[] = [];

      res.json({
        campaignId: id,
        updates: history,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error in getCampaignStatusHistory:', error);
      res.status(500).json({
        error: 'Failed to get campaign status history',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };
}

