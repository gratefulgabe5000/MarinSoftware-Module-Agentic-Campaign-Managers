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
// Ad Group Types
// ============================================================================

/**
 * Request interface for creating a new ad group in Marin
 */
export interface MarinAdGroupRequest {
  /** The Marin account ID */
  accountId: string;
  /** Campaign ID that this ad group belongs to */
  campaignId: string;
  /** Ad group name */
  name: string;
  /** Ad group status */
  status?: 'ENABLED' | 'PAUSED' | 'REMOVED';
  /** Cost-per-click bid amount in dollars */
  cpcBid?: number;
  /** Cost-per-thousand-impressions bid amount in dollars */
  cpmBid?: number;
}

/**
 * Response interface for ad group operations
 * Extends MarinBaseResponse with ad group-specific data
 */
export interface MarinAdGroupResponse extends MarinBaseResponse {
  /** Unique ad group ID */
  id: string;
  /** The Marin account ID */
  accountId: string;
  /** Campaign ID that this ad group belongs to */
  campaignId: string;
  /** Ad group name */
  name: string;
  /** Ad group status (ENABLED, PAUSED, or REMOVED) */
  adGroupStatus: string;
  /** Cost-per-click bid amount in dollars */
  cpcBid?: number;
  /** Cost-per-thousand-impressions bid amount in dollars */
  cpmBid?: number;
}

/**
 * Request interface for updating an existing ad group
 * All fields are optional - only provided fields will be updated
 */
export interface MarinAdGroupUpdateRequest {
  /** New ad group name */
  name?: string;
  /** New ad group status */
  status?: 'ENABLED' | 'PAUSED' | 'REMOVED';
  /** New cost-per-click bid amount in dollars */
  cpcBid?: number;
  /** New cost-per-thousand-impressions bid amount in dollars */
  cpmBid?: number;
}

// ============================================================================
// Ad Types
// ============================================================================

/**
 * Headline or description asset for a responsive search ad
 */
export interface AdAsset {
  /** The text content of the asset */
  text: string;
  /** Whether this asset is pinned to a specific position (headlines only) */
  pinned?: boolean;
}

/**
 * Request interface for creating a new ad in Marin
 */
export interface MarinAdRequest {
  /** The Marin account ID */
  accountId: string;
  /** Ad group ID that this ad belongs to */
  adGroupId: string;
  /** Type of ad - currently only responsive search ads supported */
  type: 'RESPONSIVE_SEARCH_AD';
  /** Array of headline assets (min 3, max 15, each max 30 chars) */
  headlines: AdAsset[];
  /** Array of description assets (min 2, max 4, each max 90 chars) */
  descriptions: AdAsset[];
  /** Final URL where users will land after clicking the ad */
  finalUrl: string;
  /** Optional display URL shown in the ad */
  displayUrl?: string;
  /** Optional URL path segments */
  paths?: string[];
}

/**
 * Response interface for ad operations
 * Extends MarinBaseResponse with ad-specific data
 */
export interface MarinAdResponse extends MarinBaseResponse {
  /** Unique ad ID */
  id: string;
  /** The Marin account ID */
  accountId: string;
  /** Ad group ID that this ad belongs to */
  adGroupId: string;
  /** Type of ad */
  type: string;
  /** Array of headline assets */
  headlines: AdAsset[];
  /** Array of description assets */
  descriptions: AdAsset[];
  /** Final URL where users will land after clicking the ad */
  finalUrl: string;
  /** Display URL shown in the ad */
  displayUrl?: string;
  /** URL path segments */
  paths?: string[];
}

/**
 * Request interface for updating an existing ad
 * All fields are optional - only provided fields will be updated
 */
export interface MarinAdUpdateRequest {
  /** New array of headline assets */
  headlines?: AdAsset[];
  /** New array of description assets */
  descriptions?: AdAsset[];
  /** New final URL */
  finalUrl?: string;
  /** New display URL */
  displayUrl?: string;
  /** New URL path segments */
  paths?: string[];
}

// ============================================================================
// Keyword Types
// ============================================================================

/**
 * Request interface for creating a new keyword in Marin
 */
export interface MarinKeywordRequest {
  /** The Marin account ID */
  accountId: string;
  /** Ad group ID that this keyword belongs to */
  adGroupId: string;
  /** Keyword text (max 80 characters) */
  text: string;
  /** Keyword match type */
  matchType: 'BROAD' | 'PHRASE' | 'EXACT';
  /** Optional cost-per-click bid amount in dollars */
  cpcBid?: number;
  /** Optional keyword status */
  status?: 'ENABLED' | 'PAUSED' | 'REMOVED';
}

/**
 * Response interface for keyword operations
 * Extends MarinBaseResponse with keyword-specific data
 */
export interface MarinKeywordResponse extends MarinBaseResponse {
  /** Unique keyword ID */
  id: string;
  /** The Marin account ID */
  accountId: string;
  /** Ad group ID that this keyword belongs to */
  adGroupId: string;
  /** Keyword text */
  text: string;
  /** Keyword match type */
  matchType: string;
  /** Cost-per-click bid amount in dollars */
  cpcBid?: number;
  /** Keyword status (ENABLED, PAUSED, or REMOVED) */
  keywordStatus: string;
}

/**
 * Request interface for updating an existing keyword
 * All fields are optional - only provided fields will be updated
 */
export interface MarinKeywordUpdateRequest {
  /** New keyword text */
  text?: string;
  /** New match type */
  matchType?: 'BROAD' | 'PHRASE' | 'EXACT';
  /** New cost-per-click bid amount */
  cpcBid?: number;
  /** New keyword status */
  status?: 'ENABLED' | 'PAUSED' | 'REMOVED';
}

/**
 * Request interface for bulk keyword creation
 * Allows creating multiple keywords in a single API call
 */
export interface MarinBulkKeywordRequest {
  /** The Marin account ID */
  accountId: string;
  /** Ad group ID that these keywords belong to */
  adGroupId: string;
  /** Array of keyword requests to create */
  keywords: MarinKeywordRequest[];
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

/**
 * Union type for keyword match types
 */
export type KeywordMatchType = 'BROAD' | 'PHRASE' | 'EXACT';

/**
 * Union type for ad types
 */
export type AdType = 'RESPONSIVE_SEARCH_AD';

/**
 * Union type for resource status values (used across campaigns, ad groups, ads, keywords)
 */
export type ResourceStatus = 'ENABLED' | 'PAUSED' | 'REMOVED';

/**
 * Type guard to check if a string is a valid keyword match type
 * @param matchType - The match type string to validate
 * @returns True if the match type is valid, false otherwise
 */
export function isValidKeywordMatchType(matchType: string): matchType is KeywordMatchType {
  return ['BROAD', 'PHRASE', 'EXACT'].includes(matchType);
}

/**
 * Type guard to check if a string is a valid ad type
 * @param adType - The ad type string to validate
 * @returns True if the ad type is valid, false otherwise
 */
export function isValidAdType(adType: string): adType is AdType {
  return adType === 'RESPONSIVE_SEARCH_AD';
}

/**
 * Type guard to check if a string is a valid resource status
 * @param status - The status string to validate
 * @returns True if the status is valid, false otherwise
 */
export function isValidResourceStatus(status: string): status is ResourceStatus {
  return ['ENABLED', 'PAUSED', 'REMOVED'].includes(status);
}
