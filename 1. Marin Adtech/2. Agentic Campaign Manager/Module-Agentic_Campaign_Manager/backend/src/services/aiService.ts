import axios from 'axios';
import config from '../config/env';
import {
  GoalUnderstandingRequest,
  GoalUnderstandingResponse,
  CampaignPlan,
} from '../types/ai.types';

/**
 * AI Service
 * Handles LLM API integration (OpenAI or Claude)
 */
class AIService {
  private apiKey: string;
  private baseURL: string;

  constructor() {
    this.apiKey = config.openaiApiKey || '';
    this.baseURL = 'https://api.openai.com/v1';
  }

  /**
   * Understand campaign goal from user message
   */
  async understandGoal(
    request: GoalUnderstandingRequest
  ): Promise<GoalUnderstandingResponse> {
    try {
      // Build prompt for goal understanding
      const prompt = this.buildGoalUnderstandingPrompt(request);

      // Call OpenAI API
      const response = await this.callOpenAI(prompt);

      // Parse and validate response
      const campaignPlan = this.parseCampaignPlan(response);

      // Determine if clarification is needed
      const needsClarification = this.needsClarification(campaignPlan);

      return {
        campaignPlan,
        needsClarification,
        confidence: this.calculateConfidence(campaignPlan),
        clarifyingQuestions: needsClarification
          ? this.generateClarifyingQuestions(campaignPlan)
          : undefined,
      };
    } catch (error) {
      console.error('Error understanding goal:', error);
      throw new Error('Failed to understand campaign goal');
    }
  }

  /**
   * Build prompt for goal understanding
   */
  private buildGoalUnderstandingPrompt(
    request: GoalUnderstandingRequest
  ): string {
    const conversationContext = request.conversationHistory
      ?.map((msg) => `${msg.role}: ${msg.content}`)
      .join('\n');

    return `You are an expert performance marketing AI assistant. Analyze the following campaign goal and extract structured information.

${conversationContext ? `Conversation History:\n${conversationContext}\n\n` : ''}User Goal: ${request.message}

Extract the following information and return it as valid JSON:
- objective: Clear campaign objective
- targetAudience: Demographics and psychographics
- budget: Total budget and daily budget (if specified), currency (default to USD)
- timeline: Start date, end date (if specified), duration in days
- platforms: Advertising platforms (Google Ads, Meta, Microsoft Ads, etc.)
- kpis: Primary KPI and secondary KPIs
- adGroups: Suggested ad groups (optional)

Return JSON in this exact format:
{
  "objective": "...",
  "targetAudience": {
    "demographics": {...},
    "psychographics": {...}
  },
  "budget": {
    "total": 0,
    "daily": 0,
    "currency": "USD"
  },
  "timeline": {
    "startDate": "YYYY-MM-DD",
    "endDate": "YYYY-MM-DD",
    "duration": 0
  },
  "platforms": ["..."],
  "kpis": {
    "primary": "...",
    "secondary": []
  },
  "adGroups": []
}`;
  }

  /**
   * Call OpenAI API
   */
  private async callOpenAI(prompt: string): Promise<string> {
    if (!this.apiKey) {
      // For MVP, return mock response if API key is not configured
      return this.getMockResponse();
    }

    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content:
                'You are an expert performance marketing AI assistant. Always return valid JSON.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 2000,
          response_format: { type: 'json_object' },
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      return response.data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('OpenAI API error:', error);
      // Fallback to mock response on error
      return this.getMockResponse();
    }
  }

  /**
   * Get mock response for MVP (when API key is not configured)
   */
  private getMockResponse(): string {
    return JSON.stringify({
      objective: 'Drive product sign-ups',
      targetAudience: {
        demographics: {
          age: '25-45',
          location: 'US',
        },
        psychographics: {
          interests: ['technology', 'software'],
        },
      },
      budget: {
        total: 5000,
        daily: 167,
        currency: 'USD',
      },
      timeline: {
        startDate: new Date().toISOString().split('T')[0],
        duration: 30,
      },
      platforms: ['Google Ads', 'Meta'],
      kpis: {
        primary: 'Sign-ups',
        secondary: ['CTR', 'CPA'],
      },
      adGroups: [],
    });
  }

  /**
   * Parse campaign plan from AI response
   */
  private parseCampaignPlan(response: string): CampaignPlan {
    try {
      const parsed = JSON.parse(response);
      return this.validateCampaignPlan(parsed);
    } catch (error) {
      console.error('Failed to parse campaign plan:', error);
      throw new Error('Invalid campaign plan format');
    }
  }

  /**
   * Validate campaign plan structure
   */
  private validateCampaignPlan(plan: any): CampaignPlan {
    // Basic validation
    if (!plan.objective || !plan.budget || !plan.timeline || !plan.platforms) {
      throw new Error('Invalid campaign plan: missing required fields');
    }

    return {
      objective: plan.objective || 'Not specified',
      targetAudience: plan.targetAudience || {},
      budget: {
        total: plan.budget?.total || 0,
        daily: plan.budget?.daily,
        currency: plan.budget?.currency || 'USD',
      },
      timeline: {
        startDate: plan.timeline?.startDate || new Date().toISOString().split('T')[0],
        endDate: plan.timeline?.endDate,
        duration: plan.timeline?.duration || 30,
      },
      platforms: Array.isArray(plan.platforms) ? plan.platforms : ['Google Ads'],
      kpis: {
        primary: plan.kpis?.primary || 'Conversions',
        secondary: plan.kpis?.secondary || [],
      },
      adGroups: plan.adGroups || [],
    };
  }

  /**
   * Determine if clarification is needed
   */
  private needsClarification(plan: CampaignPlan): boolean {
    // Check if key information is missing
    if (!plan.targetAudience.demographics && !plan.targetAudience.psychographics) {
      return true;
    }
    if (plan.budget.total === 0) {
      return true;
    }
    return false;
  }

  /**
   * Generate clarifying questions
   */
  private generateClarifyingQuestions(
    plan: CampaignPlan
  ): Array<{ id: string; question: string }> {
    const questions: Array<{ id: string; question: string }> = [];

    if (!plan.targetAudience.demographics && !plan.targetAudience.psychographics) {
      questions.push({
        id: 'target-audience',
        question: 'Who is your target audience? Please describe demographics, interests, and behaviors.',
      });
    }

    if (plan.budget.total === 0) {
      questions.push({
        id: 'budget',
        question: 'What is your total campaign budget? Please specify the amount and currency.',
      });
    }

    return questions;
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(plan: CampaignPlan): number {
    let score = 1.0;

    // Reduce confidence if information is missing
    if (!plan.targetAudience.demographics && !plan.targetAudience.psychographics) {
      score -= 0.3;
    }
    if (plan.budget.total === 0) {
      score -= 0.2;
    }
    if (!plan.timeline.startDate) {
      score -= 0.1;
    }
    if (plan.platforms.length === 0) {
      score -= 0.1;
    }

    return Math.max(0, Math.min(1, score));
  }
}

// Export singleton instance
export const aiService = new AIService();

// Export class for testing
export default AIService;

