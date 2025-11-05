/**
 * Message Types
 * Defines types for conversational interface messages
 */

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
  isMockData?: boolean; // Flag to indicate if this message contains mock data
}

export interface ConversationState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  conversationId: string | null;
}

export interface ClarifyingQuestion {
  id: string;
  question: string;
  context?: string;
}

export interface GoalUnderstanding {
  objective: string;
  targetAudience: string;
  budget?: {
    total: number;
    daily?: number;
    currency: string;
  };
  timeline?: {
    startDate: string;
    endDate?: string;
    duration: number;
  };
  platforms: string[];
  clarifyingQuestions?: ClarifyingQuestion[];
}

