/**
 * Campaign Types
 * Defines types for campaign management
 */

import { CampaignPlan } from './ai.types';

/**
 * Campaign Interface
 * Represents a created campaign with status and tracking
 */
export interface Campaign {
  id: string;
  name: string;
  description?: string;
  campaignPlan: CampaignPlan;
  status: CampaignStatus;
  platformCampaignIds: PlatformCampaignIds;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  metadata?: CampaignMetadata;
}

/**
 * Campaign Status
 */
export type CampaignStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'creating'
  | 'active'
  | 'paused'
  | 'completed'
  | 'archived'
  | 'error';

/**
 * Platform Campaign IDs
 * Maps platform names to their campaign IDs
 */
export interface PlatformCampaignIds {
  googleAds?: string;
  meta?: string;
  microsoft?: string;
  zilkr?: string;
  [platform: string]: string | undefined;
}

/**
 * Campaign Metadata
 */
export interface CampaignMetadata {
  tags?: string[];
  notes?: string;
  estimatedPerformance?: PerformanceEstimates;
  actualPerformance?: PerformanceMetrics;
}

/**
 * Performance Estimates
 */
export interface PerformanceEstimates {
  impressions?: number;
  clicks?: number;
  conversions?: number;
  ctr?: number;
  cpa?: number;
  roas?: number;
  confidence?: number;
}

/**
 * Performance Metrics
 */
export interface PerformanceMetrics {
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpa: number;
  roas: number;
  spend: number;
  revenue?: number;
  startDate: Date;
  endDate?: Date;
}

/**
 * Target Audience Interface
 */
export interface TargetAudience {
  demographics?: {
    age?: string;
    gender?: string;
    location?: string;
    language?: string;
    interests?: string[];
  };
  psychographics?: {
    values?: string[];
    behaviors?: string[];
    painPoints?: string[];
  };
  customAudiences?: string[];
  lookalikeAudiences?: string[];
  estimatedSize?: number;
}

/**
 * Budget Interface
 */
export interface Budget {
  total: number;
  daily?: number;
  currency: string;
  distribution?: BudgetDistribution;
}

/**
 * Budget Distribution
 */
export interface BudgetDistribution {
  byPlatform?: {
    [platform: string]: number;
  };
  byAdGroup?: {
    [adGroupId: string]: number;
  };
}

/**
 * Timeline Interface
 */
export interface Timeline {
  startDate: string;
  endDate?: string;
  duration: number; // in days
  timeZone?: string;
}

/**
 * KPIs Interface
 */
export interface KPIs {
  primary: string;
  secondary?: string[];
  targets?: {
    [kpi: string]: number;
  };
}

/**
 * Campaign Creation Request
 */
export interface CampaignCreationRequest {
  campaignPlan: CampaignPlan;
  name: string;
  description?: string;
  metadata?: CampaignMetadata;
}

/**
 * Campaign Update Request
 */
export interface CampaignUpdateRequest {
  name?: string;
  description?: string;
  campaignPlan?: Partial<CampaignPlan>;
  status?: CampaignStatus;
  metadata?: Partial<CampaignMetadata>;
}

/**
 * Campaign Creation Error
 */
export interface CampaignCreationError {
  platform: string;
  error: string;
}

/**
 * Campaign Creation Response
 */
export interface CampaignCreationResponse {
  campaignId: string;
  status: CampaignStatus;
  platformCampaignIds: PlatformCampaignIds;
  createdAt: Date;
  message?: string;
  errors?: CampaignCreationError[];
}

