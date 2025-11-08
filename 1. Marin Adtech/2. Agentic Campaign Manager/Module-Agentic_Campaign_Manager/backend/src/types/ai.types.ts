/**
 * AI Service Types
 * Defines types for AI service interactions
 */

/**
 * Google Ads Campaign Types
 */
export type GoogleAdsCampaignType =
  | 'SEARCH'
  | 'PERFORMANCE_MAX'
  | 'DEMAND_GEN'
  | 'VIDEO'
  | 'DISPLAY'
  | 'SHOPPING';

/**
 * Platform-specific campaign type configuration
 */
export interface PlatformCampaignType {
  googleAds?: GoogleAdsCampaignType;
  // Future: Add other platforms (Meta, Microsoft, etc.)
}

export interface CampaignPlan {
  objective: string;
  campaignType?: PlatformCampaignType; // Platform-specific campaign type
  targetAudience: {
    demographics?: {
      age?: string;
      gender?: string;
      location?: string;
      interests?: string[];
    };
    psychographics?: {
      values?: string[];
      behaviors?: string[];
      painPoints?: string[];
    };
  };
  budget: {
    total: number;
    daily?: number;
    currency: string;
  };
  timeline: {
    startDate: string;
    endDate?: string;
    duration: number;
  };
  platforms: string[];
  kpis: {
    primary: string;
    secondary?: string[];
  };
  adGroups?: AdGroupPlan[];
}

export interface AdGroupPlan {
  name: string;
  objective: string;
  budget: number;
  targeting: {
    demographics?: Record<string, any>;
    interests?: string[];
    behaviors?: string[];
  };
  adFormats?: string[];
}

export interface GoalUnderstandingRequest {
  message: string;
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

export interface GoalUnderstandingResponse {
  campaignPlan: CampaignPlan;
  clarifyingQuestions?: Array<{
    id: string;
    question: string;
  }>;
  confidence: number;
  needsClarification: boolean;
  isMockData?: boolean; // Flag to indicate if this is mock/fabricated data
}

export interface ClarifyingQuestion {
  id: string;
  question: string;
  context?: string;
}

