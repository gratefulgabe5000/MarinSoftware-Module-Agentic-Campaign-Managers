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
      const response = await this.callOpenAI(prompt, request);

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
        isMockData: !this.apiKey, // Mark as mock data if no API key is configured
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
  private async callOpenAI(prompt: string, request?: GoalUnderstandingRequest): Promise<string> {
    if (!this.apiKey) {
      // For MVP, return mock response if API key is not configured
      return this.getMockResponse(request);
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

      const responseData = response.data as any;
      return responseData.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('OpenAI API error:', error);
      // Fallback to mock response on error
      return this.getMockResponse(request);
    }
  }

  /**
   * Get mock response for MVP (when API key is not configured)
   * This extracts basic information from the user's message
   */
  private getMockResponse(request?: GoalUnderstandingRequest): string {
    // Combine message and conversation history for better extraction
    const message = request?.message?.toLowerCase() || '';
    const conversationHistory = request?.conversationHistory || [];
    const fullText = [message, ...conversationHistory.map(m => m.content)].join(' ').toLowerCase();
    
    // Extract budget - improved pattern to match $4,000, $4000, 4000, etc.
    // Look for patterns like: $4,000, $4000, 4000 dollars, budget is 4000, etc.
    const budgetPatterns = [
      /\$\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i,  // $4,000 or $4000
      /budget\s*(?:is|of|:)?\s*\$?\s*(\d{1,3}(?:,\d{3})*)/i,  // budget is 4000 or budget: $4,000
      /(\d{1,3}(?:,\d{3})*)\s*(?:dollar|usd|us\s*\$)/i,  // 4000 dollars or 4000 USD
      /(\d{1,3}(?:,\d{3})*)\s*(?:for|spend|spending)/i,  // 4000 for campaign
    ];
    
    let budget = 5000; // default
    for (const pattern of budgetPatterns) {
      const match = fullText.match(pattern);
      if (match && match[1]) {
        const extracted = parseFloat(match[1].replace(/,/g, ''));
        if (extracted > 0 && extracted < 10000000) { // reasonable range
          budget = extracted;
          break;
        }
      }
    }
    
    // For mock data, always use USD (even if other currencies are mentioned)
    // This ensures consistency in mock responses while real API can handle any currency
    const currency = 'USD';
    
    // Extract duration/days - improved patterns
    const durationPatterns = [
      /(\d+)\s*(?:week|weeks)/i,  // 6 weeks
      /(\d+)\s*(?:day|days)/i,     // 30 days
      /campaign\s*(?:duration|length|for|of)?\s*(\d+)/i,  // campaign duration 30
      /for\s*(\d+)\s*(?:week|day)/i,  // for 6 weeks
    ];
    
    let duration = 30; // default
    for (const pattern of durationPatterns) {
      const match = fullText.match(pattern);
      if (match && match[1]) {
        const extracted = parseInt(match[1], 10);
        if (match[0].includes('week')) {
          duration = extracted * 7; // convert weeks to days
        } else if (extracted > 0 && extracted <= 365) {
          duration = extracted;
        }
        if (duration > 0) break;
      }
    }
    
    // Extract platforms - improved detection
    const platforms: string[] = [];
    const platformKeywords = {
      'Google Ads': ['google', 'google ads', 'adwords'],
      'Meta': ['meta', 'facebook', 'instagram', 'fb', 'fb ads'],
      'Microsoft Ads': ['microsoft', 'bing', 'microsoft ads', 'bing ads'],
    };
    
    for (const [platform, keywords] of Object.entries(platformKeywords)) {
      if (keywords.some(keyword => fullText.includes(keyword))) {
        platforms.push(platform);
      }
    }
    if (platforms.length === 0) platforms.push('Google Ads', 'Meta');
    
    // Extract objective - improved detection
    let objective = 'Drive conversions';
    const objectiveKeywords = {
      'Drive product sign-ups': ['sign', 'signup', 'sign-up', 'register', 'registration'],
      'Drive sales': ['sale', 'purchase', 'buy', 'revenue', 'sell'],
      'Generate leads': ['lead', 'inquiry', 'inquiries', 'contact'],
      'Increase brand awareness': ['awareness', 'brand', 'visibility', 'exposure'],
      'Drive website traffic': ['traffic', 'visit', 'visitor', 'clicks', 'ctr'],
      'Promote event': ['event', 'conference', 'webinar', 'meetup', 'promote', 'promotion'],
      'Drive registrations': ['register', 'registration', 'attend', 'attendance'],
    };
    
    for (const [obj, keywords] of Object.entries(objectiveKeywords)) {
      if (keywords.some(keyword => fullText.includes(keyword))) {
        objective = obj;
        break;
      }
    }
    
    // Extract target audience - improved patterns
    let targetAge = '25-45';
    let targetLocation = 'US';
    let targetInterests: string[] = [];
    
    // Age range
    const ageMatch = fullText.match(/(\d+)[-\s]+(\d+)\s*(?:year|age|yr)/i);
    if (ageMatch) {
      targetAge = `${ageMatch[1]}-${ageMatch[2]}`;
    }
    
    // Location
    const locationMatch = fullText.match(/\b(us|usa|united states|uk|united kingdom|canada|australia|europe|global|worldwide)\b/i);
    if (locationMatch) {
      const loc = locationMatch[1].toLowerCase();
      if (loc === 'us' || loc === 'usa' || loc === 'united states') {
        targetLocation = 'US';
      } else if (loc === 'uk' || loc === 'united kingdom') {
        targetLocation = 'UK';
      } else {
        targetLocation = locationMatch[1].toUpperCase();
      }
    }
    
    // Professional/industry keywords
    const professionalKeywords = ['professional', 'marketing', 'business', 'executive', 'manager'];
    const industryKeywords = ['marketing', 'technology', 'software', 'finance', 'healthcare', 'education'];
    
    if (professionalKeywords.some(kw => fullText.includes(kw))) {
      targetInterests.push('professional');
    }
    
    for (const industry of industryKeywords) {
      if (fullText.includes(industry)) {
        targetInterests.push(industry);
      }
    }
    
    if (targetInterests.length === 0) {
      targetInterests = ['general'];
    }
    
    // Extract KPI - improved detection
    let primaryKPI = 'Conversions';
    const kpiKeywords = {
      'Sign-ups': ['sign', 'signup', 'sign-up', 'register'],
      'Sales': ['sale', 'revenue', 'purchase'],
      'Leads': ['lead', 'inquiry'],
      'Clicks': ['click', 'ctr'],
      'Registrations': ['register', 'registration', 'attend'],
      'Impressions': ['impression', 'reach'],
    };
    
    for (const [kpi, keywords] of Object.entries(kpiKeywords)) {
      if (keywords.some(keyword => fullText.includes(keyword))) {
        primaryKPI = kpi;
        break;
      }
    }
    
    // Calculate daily budget
    const dailyBudget = Math.round(budget / duration);
    
    // Calculate start date (today or tomorrow)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1);
    const startDateStr = startDate.toISOString().split('T')[0];
    
    return JSON.stringify({
      objective,
      targetAudience: {
        demographics: {
          age: targetAge,
          location: targetLocation,
        },
        psychographics: {
          interests: targetInterests,
        },
      },
      budget: {
        total: budget,
        daily: dailyBudget,
        currency,
      },
      timeline: {
        startDate: startDateStr,
        duration,
      },
      platforms,
      kpis: {
        primary: primaryKPI,
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

