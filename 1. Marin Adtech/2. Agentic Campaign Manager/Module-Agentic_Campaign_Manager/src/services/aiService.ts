import axios from 'axios';
import {
  GoalUnderstandingRequest,
  GoalUnderstandingResponse,
  CampaignPlan,
} from '../types/ai.types';
<<<<<<< HEAD
import { getApiBaseUrl } from '../config/environment';

const API_BASE_URL = getApiBaseUrl('AI_');
=======

const API_BASE_URL = 
  typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL
    ? import.meta.env.VITE_API_BASE_URL
    : 'http://localhost:3001/api';
>>>>>>> c75a29246aa4d3b02efa0ae3553d6040d682d314

/**
 * AI Service
 * Handles AI-related API calls
 */
class AIService {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Understand campaign goal from user message
   */
  async understandGoal(
    request: GoalUnderstandingRequest
  ): Promise<GoalUnderstandingResponse> {
    try {
      const response = await axios.post<GoalUnderstandingResponse>(
        `${this.baseURL}/ai/understand-goal`,
        request,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000, // 30 seconds timeout
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(
            error.response.data?.error?.message ||
              `Server error: ${error.response.status}`
          );
        } else if (error.request) {
          throw new Error('Network error: Could not connect to server');
        }
      }
      throw new Error('Failed to understand goal');
    }
  }

  /**
   * Generate clarifying questions
   */
  async generateClarifyingQuestions(
    message: string
  ): Promise<{ questions: Array<{ id: string; question: string }> }> {
    try {
      const response = await axios.post<{
        questions: Array<{ id: string; question: string }>;
      }>(
        `${this.baseURL}/ai/clarifying-questions`,
        { message },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(
            error.response.data?.error?.message ||
              `Server error: ${error.response.status}`
          );
        } else if (error.request) {
          throw new Error('Network error: Could not connect to server');
        }
      }
      throw new Error('Failed to generate clarifying questions');
    }
  }

  /**
   * Retry logic with exponential backoff
   */
  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    initialDelay: number = 1000
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');

        // Don't retry on client errors (4xx)
        if (
          axios.isAxiosError(error) &&
          error.response &&
          error.response.status >= 400 &&
          error.response.status < 500
        ) {
          throw error;
        }

        // Wait before retrying (exponential backoff)
        if (attempt < maxRetries - 1) {
          const delay = initialDelay * Math.pow(2, attempt);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('Max retries exceeded');
  }
}

// Export singleton instance
export const aiService = new AIService();

// Export class for testing
export default AIService;

