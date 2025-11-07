/**
 * AI Service Types
 * Defines types for AI service interactions
 */

import { ClarifyingQuestion } from './message.types';

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

/**
 * Campaign Plan Interface
 * Structured plan extracted from user's goal
 */
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
    duration: number; // in days
  };
  platforms: string[];
  kpis: {
    primary: string;
    secondary?: string[];
  };
  adGroups?: AdGroupPlan[];
}

/**
 * Ad Group Plan Interface
 */
export interface AdGroupPlan {
  name: string;
  objective: string;
  budget: number;
  targeting: {
    demographics?: Record<string, any>;
    interests?: string[];
    behaviors?: string[];
    keywords?: string[];
  };
  adFormats?: string[];
  ads?: Array<{
    id: string;
    adGroupId: string;
    headlines: Array<{ text: string; pinned?: boolean; position?: number }>;
    descriptions: Array<{ text: string }>;
    finalUrl: string;
    displayUrl?: string;
    paths?: string[];
  }>;
}

/**
 * Goal Understanding Request
 */
export interface GoalUnderstandingRequest {
  message: string;
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

/**
 * Goal Understanding Response
 */
export interface GoalUnderstandingResponse {
  campaignPlan: CampaignPlan;
  clarifyingQuestions?: ClarifyingQuestion[];
  confidence: number; // 0-1
  needsClarification: boolean;
  isMockData?: boolean; // Flag to indicate if this is mock/fabricated data
}

/**
 * Clarifying Question Response
 */
export interface ClarifyingQuestionResponse {
  question: ClarifyingQuestion;
  answer: string;
}

