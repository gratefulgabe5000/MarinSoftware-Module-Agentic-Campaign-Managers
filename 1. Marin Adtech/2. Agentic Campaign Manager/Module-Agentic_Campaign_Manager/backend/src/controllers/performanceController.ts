import { Request, Response } from 'express';
import { GoogleAdsService } from '../services/googleAdsService';
import { MetaAdsService } from '../services/metaAdsService';
import { MicrosoftAdsService } from '../services/microsoftAdsService';
import { IPlatformAPI } from '../services/platformApiService';

/**
 * Performance Metrics Interface
 */
interface PerformanceMetrics {
  impressions: number;
  clicks: number;
  ctr: number;
  conversions: number;
  cpa: number;
  roas: number;
  spend: number;
  revenue?: number;
  dateRange: {
    start: Date;
    end: Date;
  };
  platform?: string;
  campaignId: string;
  lastUpdated: Date;
}

/**
 * Performance Data Point Interface
 */
interface PerformanceDataPoint {
  date: Date;
  impressions: number;
  clicks: number;
  ctr: number;
  conversions: number;
  cpa: number;
  roas: number;
  spend: number;
  revenue?: number;
}

/**
 * Performance Time Series Interface
 */
interface PerformanceTimeSeries {
  campaignId: string;
  platform?: string;
  dataPoints: PerformanceDataPoint[];
  aggregated?: PerformanceMetrics;
  timeRange: {
    start: Date;
    end: Date;
  };
}

/**
 * Performance Response Interface
 */
interface PerformanceResponse {
  metrics: PerformanceMetrics;
  timeSeries?: PerformanceTimeSeries;
}

/**
 * Performance Controller
 * Handles campaign performance metrics API endpoints
 */
export class PerformanceController {
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
   * Calculate date range from query parameters
   */
  private calculateDateRange(req: Request): { start: Date; end: Date } {
    const { timeRange, start, end } = req.query;
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    if (timeRange === 'custom' && start && end) {
      startDate = new Date(start as string);
      endDate = new Date(end as string);
    } else {
      switch (timeRange) {
        case 'today':
          startDate = new Date();
          startDate.setHours(0, 0, 0, 0);
          break;
        case '7d':
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '90d':
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 90);
          break;
        default:
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 7);
      }
    }

    return { start: startDate, end: endDate };
  }

  /**
   * Generate mock performance data for MVP
   * TODO: Replace with real platform API calls
   */
  private generateMockPerformanceData(
    campaignId: string,
    startDate: Date,
    endDate: Date,
    platform?: string
  ): PerformanceMetrics {
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const baseImpressions = 10000;
    const baseClicks = 500;
    const baseConversions = 50;
    const baseSpend = 1000;

    // Generate realistic-looking data with some variance
    const variance = 0.2; // 20% variance
    const impressions = Math.floor(baseImpressions * days * (1 + (Math.random() - 0.5) * variance));
    const clicks = Math.floor(baseClicks * days * (1 + (Math.random() - 0.5) * variance));
    const conversions = Math.floor(baseConversions * days * (1 + (Math.random() - 0.5) * variance));
    const spend = baseSpend * days * (1 + (Math.random() - 0.5) * variance);
    const ctr = (clicks / impressions) * 100;
    const cpa = conversions > 0 ? spend / conversions : 0;
    const revenue = conversions * 50; // Assume $50 per conversion
    const roas = revenue / spend;

    return {
      impressions,
      clicks,
      ctr: parseFloat(ctr.toFixed(2)),
      conversions,
      cpa: parseFloat(cpa.toFixed(2)),
      roas: parseFloat(roas.toFixed(2)),
      spend: parseFloat(spend.toFixed(2)),
      revenue: parseFloat(revenue.toFixed(2)),
      dateRange: {
        start: startDate,
        end: endDate,
      },
      platform,
      campaignId,
      lastUpdated: new Date(),
    };
  }

  /**
   * Generate mock time series data
   */
  private generateMockTimeSeries(
    campaignId: string,
    startDate: Date,
    endDate: Date,
    platform?: string
  ): PerformanceDataPoint[] {
    const dataPoints: PerformanceDataPoint[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const variance = 0.15;
      const baseImpressions = 1000;
      const baseClicks = 50;
      const baseConversions = 5;
      const baseSpend = 100;

      const impressions = Math.floor(baseImpressions * (1 + (Math.random() - 0.5) * variance));
      const clicks = Math.floor(baseClicks * (1 + (Math.random() - 0.5) * variance));
      const conversions = Math.floor(baseConversions * (1 + (Math.random() - 0.5) * variance));
      const spend = baseSpend * (1 + (Math.random() - 0.5) * variance);
      const ctr = (clicks / impressions) * 100;
      const cpa = conversions > 0 ? spend / conversions : 0;
      const revenue = conversions * 50;
      const roas = revenue / spend;

      dataPoints.push({
        date: new Date(currentDate),
        impressions,
        clicks,
        ctr: parseFloat(ctr.toFixed(2)),
        conversions,
        cpa: parseFloat(cpa.toFixed(2)),
        roas: parseFloat(roas.toFixed(2)),
        spend: parseFloat(spend.toFixed(2)),
        revenue: parseFloat(revenue.toFixed(2)),
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dataPoints;
  }

  /**
   * Get campaign performance metrics
   * GET /api/campaigns/:id/performance
   */
  getCampaignPerformance = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.params) {
        res.status(400).json({
          error: 'Invalid request',
          message: 'Campaign ID is required',
        });
        return;
      }

      const { id } = req.params;
      const { platform, includeTimeSeries } = req.query;

      if (!id) {
        res.status(400).json({
          error: 'Invalid request',
          message: 'Campaign ID is required',
        });
        return;
      }

      const { start, end } = this.calculateDateRange(req);

      // TODO: Load campaign from database and get real platform IDs
      // For MVP, we'll generate mock performance data
      // In production, this would:
      // 1. Load campaign from database
      // 2. Get platform campaign IDs
      // 3. Call platform APIs to get real performance data
      // 4. Aggregate data across platforms if needed

      const metrics = this.generateMockPerformanceData(
        id,
        start,
        end,
        platform as string | undefined
      );

      const response: PerformanceResponse = {
        metrics,
      };

      // Include time series if requested
      if (includeTimeSeries === 'true') {
        const dataPoints = this.generateMockTimeSeries(id, start, end, platform as string | undefined);
        const aggregated = metrics;

        response.timeSeries = {
          campaignId: id,
          platform: platform as string | undefined,
          dataPoints,
          aggregated,
          timeRange: {
            start,
            end,
          },
        };
      }

      res.json(response);
    } catch (error) {
      console.error('Error getting campaign performance:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Aggregate performance across platforms
   */
  private aggregatePerformanceAcrossPlatforms(
    platformMetrics: Array<{ platform: string; metrics: PerformanceMetrics }>
  ): PerformanceMetrics {
    const aggregated: PerformanceMetrics = {
      impressions: 0,
      clicks: 0,
      ctr: 0,
      conversions: 0,
      cpa: 0,
      roas: 0,
      spend: 0,
      revenue: 0,
      dateRange: {
        start: new Date(),
        end: new Date(),
      },
      campaignId: '',
      lastUpdated: new Date(),
    };

    let totalSpend = 0;
    let totalRevenue = 0;
    let totalConversions = 0;

    platformMetrics.forEach(({ metrics }) => {
      aggregated.impressions += metrics.impressions;
      aggregated.clicks += metrics.clicks;
      aggregated.conversions += metrics.conversions;
      aggregated.spend += metrics.spend;
      if (metrics.revenue) {
        aggregated.revenue = (aggregated.revenue || 0) + metrics.revenue;
      }
      totalSpend += metrics.spend;
      totalRevenue += (metrics.revenue || 0);
      totalConversions += metrics.conversions;
    });

    aggregated.ctr = aggregated.impressions > 0
      ? (aggregated.clicks / aggregated.impressions) * 100
      : 0;
    aggregated.cpa = totalConversions > 0 ? totalSpend / totalConversions : 0;
    aggregated.roas = totalSpend > 0 ? totalRevenue / totalSpend : 0;

    return aggregated;
  }
}

