/**
 * Status Types
 * Defines types for campaign status tracking
 */

/**
 * Campaign Status Enum
 */
export enum CampaignStatus {
  DRAFT = 'draft',
  CREATING = 'creating',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
  ERROR = 'error',
}

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
 * Status History Interface
 */
export interface StatusHistory {
  campaignId: string;
  updates: StatusUpdate[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Platform Status Mapping
 */
export interface PlatformStatusMapping {
  platform: string;
  platformStatus: string;
  mappedStatus: CampaignStatus;
}

/**
 * Status Polling Configuration
 */
export interface StatusPollingConfig {
  enabled: boolean;
  interval: number; // milliseconds
  timeout: number; // milliseconds
  maxRetries: number;
}

