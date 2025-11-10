/**
 * Marin Dispatcher API Type Definitions
 *
 * This file contains all TypeScript type definitions for interacting with the Marin Dispatcher API.
 * These types ensure type safety when making requests to and handling responses from the Marin platform.
 *
 * @module marinDispatcher.types
 */

// ============================================================================
// Base Types
// ============================================================================

/**
 * Base request interface for all Marin Dispatcher API requests
 * All specific request types extend this interface
 */
export interface MarinBaseRequest {
  /** The Marin account ID for the request */
  accountId: string;
}

/**
 * Base response interface for all Marin Dispatcher API responses
 * All specific response types extend this interface
 */
export interface MarinBaseResponse {
  /** Optional resource ID returned from the operation */
  resourceId?: string;
  /** Status of the operation */
  status: 'SUCCESS' | 'FAILURE';
  /** Array of error messages if the operation failed */
  errors?: string[];
  /** Array of warning messages that don't prevent operation success */
  warnings?: string[];
}

// ============================================================================
// Campaign Types
// ============================================================================

/**
 * Request interface for creating a new campaign in Marin
 */
export interface MarinCampaignRequest {
  /** The Marin account ID */
  accountId: string;
  /** Campaign name (max 255 characters) */
  name: string;
  /** Campaign status */
  status: 'ENABLED' | 'PAUSED' | 'REMOVED';
  /** Campaign budget configuration */
  budget: {
    /** Budget amount in dollars (NOT micros) */
    amount: number;
    /** Budget delivery method */
    deliveryMethod: 'STANDARD' | 'ACCELERATED';
  };
  /** Bidding strategy identifier */
  biddingStrategy: string;
  /** Campaign objective - primarily used for Meta campaigns */
  objective?: string;
}

/**
 * Response interface for campaign operations
 * Extends MarinBaseResponse with campaign-specific data
 */
export interface MarinCampaignResponse extends MarinBaseResponse {
  /** Unique campaign ID */
  id: string;
  /** The Marin account ID */
  accountId: string;
  /** Campaign name */
  name: string;
  /** Campaign status (ENABLED, PAUSED, or REMOVED) */
  campaignStatus: string;
  /** Campaign budget configuration */
  budget: {
    /** Budget amount in dollars */
    amount: number;
    /** Budget delivery method */
    deliveryMethod: string;
  };
  /** Bidding strategy identifier */
  biddingStrategy: string;
  /** ISO 8601 timestamp of campaign creation */
  createdAt?: string;
  /** ISO 8601 timestamp of last campaign update */
  updatedAt?: string;
}

/**
 * Request interface for updating an existing campaign
 * All fields are optional - only provided fields will be updated
 */
export interface MarinCampaignUpdateRequest {
  /** New campaign name (max 255 characters) */
  name?: string;
  /** New campaign status */
  status?: 'ENABLED' | 'PAUSED' | 'REMOVED';
  /** New campaign budget configuration */
  budget?: {
    /** Budget amount in dollars (NOT micros) */
    amount: number;
    /** Budget delivery method */
    deliveryMethod: 'STANDARD' | 'ACCELERATED';
  };
  /** New bidding strategy identifier */
  biddingStrategy?: string;
}

/**
 * Request interface for listing/querying campaigns
 */
export interface MarinCampaignListRequest {
  /** The Marin account ID to query campaigns for */
  accountId: string;
  /** Maximum number of campaigns to return (pagination) */
  limit?: number;
  /** Offset for pagination (number of campaigns to skip) */
  offset?: number;
}

/**
 * Response interface for campaign list queries
 */
export interface MarinCampaignListResponse {
  /** Array of campaign objects */
  campaigns: MarinCampaignResponse[];
  /** Total number of campaigns matching the query */
  total: number;
  /** Limit used for this query */
  limit: number;
  /** Offset used for this query */
  offset: number;
}

// ============================================================================
// Type Exports
// ============================================================================

/**
 * Union type of all valid campaign status values
 */
export type CampaignStatus = 'ENABLED' | 'PAUSED' | 'REMOVED';

/**
 * Union type of all valid budget delivery methods
 */
export type BudgetDeliveryMethod = 'STANDARD' | 'ACCELERATED';

/**
 * Type guard to check if a string is a valid campaign status
 * @param status - The status string to validate
 * @returns True if the status is valid, false otherwise
 */
export function isValidCampaignStatus(status: string): status is CampaignStatus {
  return ['ENABLED', 'PAUSED', 'REMOVED'].includes(status);
}

/**
 * Type guard to check if a string is a valid budget delivery method
 * @param method - The delivery method string to validate
 * @returns True if the delivery method is valid, false otherwise
 */
export function isValidBudgetDeliveryMethod(method: string): method is BudgetDeliveryMethod {
  return ['STANDARD', 'ACCELERATED'].includes(method);
}
