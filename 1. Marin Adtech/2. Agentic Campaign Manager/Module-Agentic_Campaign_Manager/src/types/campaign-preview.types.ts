/**
 * Campaign Preview Types
 * Defines types for campaign preview and editing interface
 */

import { GeneratedAdGroup } from './adgroup-generation.types';
import { GeneratedKeyword } from './keyword-generation.types';
import { GeneratedRSA } from './rsa-generation.types';

/**
 * Preview Row Type
 * Represents a row in the preview table
 */
export type PreviewRowType = 'adgroup' | 'keyword' | 'ad';

/**
 * Preview Row
 * Base interface for all preview rows
 */
export interface PreviewRow {
  id: string;
  type: PreviewRowType;
  parentId?: string; // For nested rows (keywords under ad groups, ads under ad groups)
  level: number; // Indentation level (0 = ad group, 1 = keyword/ad)
  isExpanded?: boolean;
  isEditing?: boolean;
}

/**
 * Ad Group Preview Row
 */
export interface AdGroupPreviewRow extends PreviewRow {
  type: 'adgroup';
  adGroupId: string;
  name: string;
  productId: string;
  productName: string;
  keywords: GeneratedKeyword[];
  ads: GeneratedRSA[];
}

/**
 * Keyword Preview Row
 */
export interface KeywordPreviewRow extends PreviewRow {
  type: 'keyword';
  keywordId: string;
  text: string;
  matchType: 'broad' | 'phrase' | 'exact';
  suggestedBid?: number;
  score?: number;
}

/**
 * Ad Preview Row
 */
export interface AdPreviewRow extends PreviewRow {
  type: 'ad';
  adId: string;
  headlines: Array<{ text: string; pinned?: boolean; position?: number }>;
  descriptions: Array<{ text: string }>;
  finalUrl: string;
  displayUrl?: string;
}

/**
 * Campaign Preview Data
 * Complete preview data for a campaign
 */
export interface CampaignPreviewData {
  campaignId: string;
  campaignName: string;
  adGroups: AdGroupPreviewRow[];
  totalKeywords: number;
  totalAds: number;
}

/**
 * Preview Edit Operation
 */
export type PreviewEditOperation = 
  | { type: 'update_keyword'; keywordId: string; updates: Partial<GeneratedKeyword> }
  | { type: 'update_headline'; adId: string; headlineIndex: number; text: string }
  | { type: 'update_description'; adId: string; descriptionIndex: number; text: string }
  | { type: 'update_url'; adId: string; url: string }
  | { type: 'delete_keyword'; keywordId: string }
  | { type: 'delete_ad'; adId: string };

/**
 * Preview Validation Result
 */
export interface PreviewValidationResult {
  isValid: boolean;
  errors: Array<{
    rowId: string;
    field: string;
    message: string;
  }>;
  warnings: Array<{
    rowId: string;
    field: string;
    message: string;
  }>;
}

