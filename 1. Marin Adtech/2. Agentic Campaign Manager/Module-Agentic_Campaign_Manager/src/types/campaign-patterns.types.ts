/**
 * Campaign Patterns Types
 * Defines types for extracting and using patterns from existing campaigns
 */

/**
 * Campaign Patterns Interface
 * Contains all extracted patterns from existing campaigns
 */
export interface CampaignPatterns {
  adGroupStructures: AdGroupStructures;
  highPerformingKeywords: HighPerformingKeyword[];
  adCopyPatterns: AdCopyPatterns;
  biddingPatterns: BiddingPatterns;
}

/**
 * Ad Group Structures
 * Patterns extracted from ad group organization
 */
export interface AdGroupStructures {
  namingConvention: string;
  themes: string[];
  averageKeywordsPerGroup: number;
}

/**
 * High Performing Keyword
 * Keyword with performance metrics above thresholds
 */
export interface HighPerformingKeyword {
  keyword: string;
  matchType: string;
  ctr: number;
  conversions: number;
  roas?: number;
  impressions?: number;
  clicks?: number;
  cost?: number;
  averageCpc?: number;
}

/**
 * Ad Copy Patterns
 * Patterns extracted from existing ad copy
 */
export interface AdCopyPatterns {
  headlineTemplates: string[];
  descriptionTemplates: string[];
  commonCTAs: string[];
  averageHeadlinesPerAd: number;
  averageDescriptionsPerAd: number;
}

/**
 * Bidding Patterns
 * Patterns extracted from bidding strategies
 */
export interface BiddingPatterns {
  averageCPC: number;
  bidStrategy: string;
  averageCPM?: number;
  averageCPA?: number;
}

/**
 * Pattern Extraction Request
 */
export interface PatternExtractionRequest {
  accountId: string;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  campaignIds?: string[];
  minCTR?: number;
  minConversions?: number;
}

/**
 * Pattern Extraction Response
 */
export interface PatternExtractionResponse {
  patterns: CampaignPatterns;
  extractedAt: Date;
  sourceCampaigns: string[];
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  isMockData?: boolean; // Flag indicating if mock data was used
}

