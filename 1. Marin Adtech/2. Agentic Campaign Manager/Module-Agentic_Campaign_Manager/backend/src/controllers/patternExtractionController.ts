import { Request, Response } from 'express';
import { GoogleAdsService } from '../services/googleAdsService';
import {
  extractAllPatterns,
  extractHighPerformingKeywords,
  extractAdCopyPatterns,
} from '../services/patternExtractionService';
import { PatternExtractionRequest } from '../types/campaign-patterns.types';

/**
 * Pattern Extraction Controller
 * Handles pattern extraction from existing campaigns
 */
export class PatternExtractionController {
  /**
   * Query and extract patterns from existing campaigns
   * GET /api/campaigns/query-patterns
   */
  queryPatterns = async (req: Request, res: Response): Promise<void> => {
    try {
      const { accountId, startDate, endDate, campaignIds } = req.query;

      if (!accountId || typeof accountId !== 'string') {
        res.status(400).json({
          error: 'Invalid request',
          message: 'accountId is required',
        });
        return;
      }

      // Get access token from auth (for MVP, use mock)
      const accessToken = req.headers.authorization?.replace('Bearer ', '') || 'mock-token';
      const googleAdsService = new GoogleAdsService(accessToken, accountId);

      // Check if using mock token (indicates mock data will be used)
      const isMockToken = !accessToken || accessToken === 'mock-token';

      // Parse date range
      const dateRange =
        startDate && endDate
          ? {
              startDate: startDate as string,
              endDate: endDate as string,
            }
          : undefined;

      // Parse campaign IDs
      const campaignIdsArray = campaignIds
        ? (Array.isArray(campaignIds) ? campaignIds : [campaignIds]).map(
            (id) => String(id)
          )
        : undefined;

      // Query Google Ads data (with fallback to mock data)
      let campaigns: any[] = [];
      let adGroups: any[] = [];
      let keywords: any[] = [];
      let ads: any[] = [];
      let isMockData = isMockToken; // Track if mock data is being used

      try {
        campaigns = await googleAdsService.queryCampaigns(
          accountId,
          dateRange
        );
        adGroups = await googleAdsService.queryAdGroups(
          accountId,
          campaignIdsArray
        );
        keywords = await googleAdsService.queryKeywords(
          accountId,
          campaignIdsArray,
          dateRange
        );
        ads = await googleAdsService.queryAds(
          accountId,
          campaignIdsArray,
          dateRange
        );
      } catch (error) {
        // If API fails, use mock data
        console.log('Using mock data for pattern extraction (API unavailable)');
        isMockData = true;
        const { loadMockCampaigns, loadMockKeywords, loadMockAds } = await import('../utils/mockDataLoader');
        const mockCampaigns = loadMockCampaigns();
        campaigns = mockCampaigns.campaigns || [];
        adGroups = campaigns.flatMap((c: any) => c.adGroups || []);
        keywords = loadMockKeywords().keywords || [];
        ads = loadMockAds().ads || [];
      }

      // Extract patterns
      const patterns = await extractAllPatterns(
        campaigns,
        adGroups,
        keywords,
        ads,
        {
          minCTR: req.query.minCTR
            ? parseFloat(req.query.minCTR as string)
            : undefined,
          minConversions: req.query.minConversions
            ? parseInt(req.query.minConversions as string, 10)
            : undefined,
        }
      );

      res.json({
        success: true,
        patterns,
        extractedAt: new Date(),
        sourceCampaigns: campaigns.map((c) => c.id),
        dateRange: dateRange || undefined,
        isMockData, // Flag indicating if mock data was used
      });
    } catch (error: any) {
      console.error('Error querying patterns:', error);
      res.status(500).json({
        error: 'Failed to query patterns',
        message: error.message || 'An unexpected error occurred',
      });
    }
  };

  /**
   * Get high-performing keywords
   * GET /api/campaigns/high-performing-keywords
   */
  getHighPerformingKeywords = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { accountId, minCTR, minConversions } = req.query;

      if (!accountId || typeof accountId !== 'string') {
        res.status(400).json({
          error: 'Invalid request',
          message: 'accountId is required',
        });
        return;
      }

      const accessToken = req.headers.authorization?.replace('Bearer ', '') || 'mock-token';
      const googleAdsService = new GoogleAdsService(accessToken, accountId);

      const keywords = await googleAdsService.queryKeywords(accountId);

      const highPerforming = extractHighPerformingKeywords(
        keywords,
        minCTR ? parseFloat(minCTR as string) : 2.0,
        minConversions ? parseInt(minConversions as string, 10) : 0
      );

      res.json({
        success: true,
        keywords: highPerforming,
        count: highPerforming.length,
      });
    } catch (error: any) {
      console.error('Error getting high-performing keywords:', error);
      res.status(500).json({
        error: 'Failed to get high-performing keywords',
        message: error.message || 'An unexpected error occurred',
      });
    }
  };

  /**
   * Get ad copy patterns
   * GET /api/campaigns/ad-copy-patterns
   */
  getAdCopyPatterns = async (req: Request, res: Response): Promise<void> => {
    try {
      const { accountId } = req.query;

      if (!accountId || typeof accountId !== 'string') {
        res.status(400).json({
          error: 'Invalid request',
          message: 'accountId is required',
        });
        return;
      }

      const accessToken = req.headers.authorization?.replace('Bearer ', '') || 'mock-token';
      const googleAdsService = new GoogleAdsService(accessToken, accountId);

      const ads = await googleAdsService.queryAds(accountId);

      const patterns = extractAdCopyPatterns(ads);

      res.json({
        success: true,
        patterns,
      });
    } catch (error: any) {
      console.error('Error getting ad copy patterns:', error);
      res.status(500).json({
        error: 'Failed to get ad copy patterns',
        message: error.message || 'An unexpected error occurred',
      });
    }
  };
}

