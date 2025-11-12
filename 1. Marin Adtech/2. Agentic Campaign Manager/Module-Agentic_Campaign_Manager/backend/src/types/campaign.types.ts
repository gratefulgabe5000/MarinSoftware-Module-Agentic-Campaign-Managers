/**
 * Campaign Types
 * Defines types for campaign creation and management
 */

import { CampaignPlan } from './ai.types';

/**
 * Campaign Creation Request
 */
export interface CampaignCreationRequest {
  campaignPlan: CampaignPlan;
  name: string;
  description?: string;
  metadata?: {
    tags?: string[];
    notes?: string;
  };
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
 * Status Update Interface
 */
export interface StatusUpdate {
  campaignId: string;
  status: CampaignStatus;
  previousStatus?: CampaignStatus;
  timestamp: Date;
  message?: string;
  platform?: string;
  platformStatus?: string;
  error?: string;
}

/**
 * Platform Campaign IDs
 */
export interface PlatformCampaignIds {
  googleAds?: string;
  meta?: string;
  microsoft?: string;
  marin?: string;
  [platform: string]: string | undefined;
}

/**
 * Campaign Creation Error
 */
export interface CampaignCreationError {
  platform: string;
  error: string;
  details?: any;
}

/**
 * Campaign Interface
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
  metadata?: {
    tags?: string[];
    notes?: string;
  };
  isMock?: boolean; // Flag to indicate if this campaign was created/retrieved using mock data
}

/**
 * Platform API Response
 */
export interface PlatformAPIResponse {
  success: boolean;
  campaignId?: string;
  adGroupId?: string;
  adId?: string;
  keywordId?: string;
  keywords?: any[]; // For bulk keyword creation
  error?: string;
  details?: any;
  isMock?: boolean; // Flag to indicate if this is mock/test data
}

/**
 * Campaign Creation Progress
 */
export interface CampaignCreationProgress {
  campaignId: string;
  status: CampaignStatus;
  progress: number; // 0-100
  completedPlatforms: string[];
  failedPlatforms: string[];
  currentPlatform?: string;
  message?: string;
}

