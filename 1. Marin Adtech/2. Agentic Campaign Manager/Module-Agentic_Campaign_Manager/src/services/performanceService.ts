import axios from 'axios';
import {
  PerformanceMetrics,
  PerformanceTimeSeries,
  PerformanceRequest,
  PerformanceResponse,
  TimeRangeConfig,
  TimeRange,
  PerformanceDataPoint,
} from '../types/performance.types';
import { cachePerformanceMetrics, getCachedPerformanceMetrics } from '../utils/indexedDB';

const API_BASE_URL =
  typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL
    ? import.meta.env.VITE_API_BASE_URL
    : 'http://localhost:3001/api';

/**
 * Performance Service
 * Handles performance metrics API calls and caching
 */
class PerformanceService {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Calculate date range from TimeRangeConfig
   */
  private calculateDateRange(timeRange: TimeRangeConfig): { start: Date; end: Date } {
    const end = new Date();
    let start: Date;

    if (timeRange.type === 'custom' && timeRange.start && timeRange.end) {
      return {
        start: new Date(timeRange.start),
        end: new Date(timeRange.end),
      };
    }

    switch (timeRange.type) {
      case 'today':
        start = new Date();
        start.setHours(0, 0, 0, 0);
        break;
      case '7d':
        start = new Date();
        start.setDate(start.getDate() - 7);
        break;
      case '30d':
        start = new Date();
        start.setDate(start.getDate() - 30);
        break;
      case '90d':
        start = new Date();
        start.setDate(start.getDate() - 90);
        break;
      default:
        start = new Date();
        start.setDate(start.getDate() - 7);
    }

    return { start, end };
  }

  /**
   * Get performance metrics for a campaign
   */
  async getMetrics(
    campaignId: string,
    timeRange: TimeRangeConfig
  ): Promise<PerformanceMetrics> {
    try {
      // Check cache first
      const cached = await getCachedPerformanceMetrics(campaignId, timeRange);
      if (cached) {
        return cached;
      }

      const dateRange = this.calculateDateRange(timeRange);
      const params = new URLSearchParams({
        timeRange: timeRange.type,
        start: dateRange.start.toISOString(),
        end: dateRange.end.toISOString(),
        ...(timeRange.type === 'custom' && timeRange.start && timeRange.end
          ? {
              start: timeRange.start.toISOString(),
              end: timeRange.end.toISOString(),
            }
          : {}),
      });

      const response = await axios.get<PerformanceMetrics>(
        `${this.baseURL}/campaigns/${campaignId}/performance`,
        {
          params,
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000, // 30 seconds timeout
        }
      );

      const metrics = response.data;
      
      // Cache the metrics
      await cachePerformanceMetrics(campaignId, metrics, timeRange);

      return metrics;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(
            error.response.data?.error?.message ||
              `Server error: ${error.response.status}`
          );
        } else if (error.request) {
          // Try to get from cache if network error
          const cached = await getCachedPerformanceMetrics(campaignId, timeRange);
          if (cached) {
            return cached;
          }
          throw new Error('Network error: Unable to reach server');
        }
      }
      throw error;
    }
  }

  /**
   * Get performance time series data
   */
  async getTimeSeries(
    campaignId: string,
    timeRange: TimeRangeConfig
  ): Promise<PerformanceTimeSeries> {
    try {
      const dateRange = this.calculateDateRange(timeRange);
      const params = new URLSearchParams({
        timeRange: timeRange.type,
        start: dateRange.start.toISOString(),
        end: dateRange.end.toISOString(),
        includeTimeSeries: 'true',
        ...(timeRange.type === 'custom' && timeRange.start && timeRange.end
          ? {
              start: timeRange.start.toISOString(),
              end: timeRange.end.toISOString(),
            }
          : {}),
      });

      const response = await axios.get<PerformanceResponse>(
        `${this.baseURL}/campaigns/${campaignId}/performance`,
        {
          params,
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      if (!response.data.timeSeries) {
        throw new Error('Time series data not available');
      }

      return response.data.timeSeries;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(
            error.response.data?.error?.message ||
              `Server error: ${error.response.status}`
          );
        } else if (error.request) {
          throw new Error('Network error: Unable to reach server');
        }
      }
      throw error;
    }
  }

  /**
   * Get full performance response (metrics + time series)
   */
  async getPerformance(
    campaignId: string,
    timeRange: TimeRangeConfig,
    includeTimeSeries: boolean = true
  ): Promise<PerformanceResponse> {
    try {
      const dateRange = this.calculateDateRange(timeRange);
      const params = new URLSearchParams({
        timeRange: timeRange.type,
        start: dateRange.start.toISOString(),
        end: dateRange.end.toISOString(),
        includeTimeSeries: includeTimeSeries.toString(),
        ...(timeRange.type === 'custom' && timeRange.start && timeRange.end
          ? {
              start: timeRange.start.toISOString(),
              end: timeRange.end.toISOString(),
            }
          : {}),
      });

      const response = await axios.get<PerformanceResponse>(
        `${this.baseURL}/campaigns/${campaignId}/performance`,
        {
          params,
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      // Cache metrics if available
      if (response.data.metrics) {
        await cachePerformanceMetrics(campaignId, response.data.metrics, timeRange);
      }

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(
            error.response.data?.error?.message ||
              `Server error: ${error.response.status}`
          );
        } else if (error.request) {
          // Try to get from cache if network error
          const cached = await getCachedPerformanceMetrics(campaignId, timeRange);
          if (cached) {
            return {
              metrics: cached,
            };
          }
          throw new Error('Network error: Unable to reach server');
        }
      }
      throw error;
    }
  }

  /**
   * Export metrics to CSV
   */
  exportToCSV(
    metrics: PerformanceMetrics | PerformanceDataPoint[],
    filename?: string
  ): void {
    let csvContent = '';
    let rows: string[][] = [];

    if (Array.isArray(metrics)) {
      // Time series data
      csvContent = 'Date,Impressions,Clicks,CTR,Conversions,CPA,ROAS,Spend,Revenue\n';
      rows = metrics.map((point) => [
        point.date.toISOString(),
        point.impressions.toString(),
        point.clicks.toString(),
        point.ctr.toFixed(2),
        point.conversions.toString(),
        point.cpa.toFixed(2),
        point.roas.toFixed(2),
        point.spend.toFixed(2),
        point.revenue?.toFixed(2) || '0',
      ]);
    } else {
      // Single metrics object
      csvContent = 'Metric,Value\n';
      rows = [
        ['Impressions', metrics.impressions.toString()],
        ['Clicks', metrics.clicks.toString()],
        ['CTR', metrics.ctr.toFixed(2) + '%'],
        ['Conversions', metrics.conversions.toString()],
        ['CPA', metrics.cpa.toFixed(2)],
        ['ROAS', metrics.roas.toFixed(2)],
        ['Spend', metrics.spend.toFixed(2)],
        ['Revenue', metrics.revenue?.toFixed(2) || '0'],
        ['Start Date', metrics.dateRange.start.toISOString()],
        ['End Date', metrics.dateRange.end.toISOString()],
      ];
    }

    csvContent += rows.map((row) => row.join(',')).join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      filename ||
        `performance-${new Date().toISOString().split('T')[0]}.csv`
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// Export singleton instance
export const performanceService = new PerformanceService();

