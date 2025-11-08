/**
 * Keyword Generation Types (Frontend)
 * Defines types for keyword generation
 */

/**
 * Keyword Source
 */
export interface KeywordSource {
  type: 'product_data' | 'existing_campaign' | 'llm_generated' | 'competitor';
  keyword: string;
  relevance: number; // 0-1
  confidence: number; // 0-1
  performanceData?: {
    ctr?: number;
    conversions?: number;
    roas?: number;
    averageCpc?: number;
  };
}

/**
 * Generated Keyword
 */
export interface GeneratedKeyword {
  text: string;
  matchType: 'broad' | 'phrase' | 'exact';
  source: KeywordSource;
  suggestedBid?: number;
  score?: number; // Aggregated score for ranking
}

/**
 * Keyword Generation Request
 */
export interface KeywordGenerationRequest {
  product: {
    id: string;
    name: string;
    url: string;
    category?: string;
    price?: number;
    description?: string;
  };
  patterns?: {
    highPerformingKeywords?: Array<{
      keyword: string;
      matchType: string;
      ctr: number;
      conversions: number;
      roas?: number;
    }>;
  };
  maxKeywords?: number;
}

/**
 * Keyword Validation Result
 */
export interface KeywordValidationResult {
  keyword: string;
  valid: boolean;
  errors: string[];
  warnings: string[];
}

