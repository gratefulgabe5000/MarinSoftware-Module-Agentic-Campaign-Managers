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

/**
 * Campaign Plan Interface
 * Structured plan extracted from user's goal
 * Now includes optional Customer Profile Container reference for default or custom profiles
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
    duration: number;
  };
  platforms: string[];
  kpis: {
    primary: string;
    secondary?: string[];
  };
  adGroups?: AdGroupPlan[];

  /**
   * Customer Profile Container ID reference (optional)
   * If provided, links this campaign plan to a specific Customer Profile Container.
   * This allows the campaign to inherit Target Customer Profile, Brand Guidelines, and Budget
   * from the container instead of using standalone values.
   *
   * When present:
   * - The container's Target Customer Profile may supplement or override targetAudience
   * - The container's Brand Guidelines guide ad creative and messaging
   * - The container's Budget may be used instead of the budget field above
   *
   * @migration For existing campaign plans, this field will be undefined.
   */
  profileContainerId?: string;

  /**
   * Whether to use the account's default profile if no specific profile is provided
   * If true and profileContainerId is undefined, the system should use the default container
   * If false or undefined, the campaign plan uses only its own defined values
   */
  useDefaultProfile?: boolean;
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

