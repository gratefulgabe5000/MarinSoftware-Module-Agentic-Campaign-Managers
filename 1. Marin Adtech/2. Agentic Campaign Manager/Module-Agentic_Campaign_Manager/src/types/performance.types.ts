/**
 * Performance Types
 * Defines types for campaign performance metrics and data
 */

/**
 * Performance Metrics Interface
 * Represents aggregated performance data for a campaign
 */
export interface PerformanceMetrics {
  impressions: number;
  clicks: number;
  ctr: number; // Click-through rate (percentage)
  conversions: number;
  cpa: number; // Cost per acquisition
  roas: number; // Return on ad spend
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
 * Performance Data Point
 * Represents performance metrics for a specific time point
 */
export interface PerformanceDataPoint {
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
 * Performance Time Series
 * Represents performance data over time
 */
export interface PerformanceTimeSeries {
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
 * Time Range Options
 */
export type TimeRange = 'today' | '7d' | '30d' | '90d' | 'custom';

/**
 * Time Range Configuration
 */
export interface TimeRangeConfig {
  type: TimeRange;
  start?: Date;
  end?: Date;
}

/**
 * Performance Comparison
 * Compares performance across platforms or time periods
 */
export interface PerformanceComparison {
  baseline: PerformanceMetrics;
  comparison: PerformanceMetrics;
  difference: {
    impressions: number;
    clicks: number;
    ctr: number;
    conversions: number;
    cpa: number;
    roas: number;
    spend: number;
    revenue?: number;
  };
  percentageChange: {
    impressions: number;
    clicks: number;
    ctr: number;
    conversions: number;
    cpa: number;
    roas: number;
    spend: number;
    revenue?: number;
  };
}

/**
 * Performance Goals
 * Campaign performance goals/targets
 */
export interface PerformanceGoals {
  impressions?: number;
  clicks?: number;
  ctr?: number;
  conversions?: number;
  cpa?: number;
  roas?: number;
  spend?: number;
  revenue?: number;
}

/**
 * Performance vs Goals
 * Comparison of actual performance against goals
 */
export interface PerformanceVsGoals {
  metrics: PerformanceMetrics;
  goals: PerformanceGoals;
  status: 'meeting' | 'exceeding' | 'below';
  percentageOfGoal: {
    impressions?: number;
    clicks?: number;
    ctr?: number;
    conversions?: number;
    cpa?: number;
    roas?: number;
    spend?: number;
    revenue?: number;
  };
}

/**
 * Performance Request
 * Request parameters for fetching performance data
 */
export interface PerformanceRequest {
  campaignId: string;
  timeRange: TimeRangeConfig;
  platform?: string;
  includeTimeSeries?: boolean;
}

/**
 * Performance Response
 * Response containing performance data
 */
export interface PerformanceResponse {
  metrics: PerformanceMetrics;
  timeSeries?: PerformanceTimeSeries;
  goals?: PerformanceGoals;
  vsGoals?: PerformanceVsGoals;
}

