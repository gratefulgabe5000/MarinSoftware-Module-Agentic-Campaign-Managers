/**
 * Campaign Preview Types (Backend)
 * Defines types for campaign preview and export
 */

/**
 * Generated Keyword
 */
export interface GeneratedKeyword {
  text: string;
  matchType: 'broad' | 'phrase' | 'exact';
  source?: {
    type: string;
    keyword: string;
    relevance: number;
    confidence: number;
  };
  suggestedBid?: number;
  score?: number;
}

/**
 * Generated RSA Ad
 */
export interface GeneratedRSA {
  id: string;
  adGroupId: string;
  headlines: Array<{ text: string; pinned?: boolean; position?: number }>;
  descriptions: Array<{ text: string }>;
  finalUrl: string;
  displayUrl?: string;
  paths?: string[];
}

/**
 * Ad Group Preview Row
 */
export interface AdGroupPreviewRow {
  id: string;
  type: 'adgroup';
  level: number;
  adGroupId: string;
  name: string;
  productId: string;
  productName: string;
  keywords: GeneratedKeyword[];
  ads: GeneratedRSA[];
}

/**
 * Campaign Preview Data
 */
export interface CampaignPreviewData {
  campaignId: string;
  campaignName: string;
  adGroups: AdGroupPreviewRow[];
  totalKeywords: number;
  totalAds: number;
}

