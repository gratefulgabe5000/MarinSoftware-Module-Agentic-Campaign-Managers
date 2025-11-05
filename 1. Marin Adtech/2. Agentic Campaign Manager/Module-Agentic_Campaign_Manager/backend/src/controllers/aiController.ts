import { Request, Response } from 'express';
import { aiService } from '../services/aiService';
import { GoalUnderstandingRequest } from '../types/ai.types';

/**
 * AI Controller
 * Handles AI-related API endpoints
 */
export class AIController {
  /**
   * Understand campaign goal from user message
   * POST /api/ai/understand-goal
   */
  understandGoal = async (req: Request, res: Response): Promise<void> => {
    try {
      const { message, conversationHistory } = req.body;

      if (!message || typeof message !== 'string') {
        res.status(400).json({
          error: 'Invalid request',
          message: 'Message is required and must be a string',
        });
        return;
      }

      const request: GoalUnderstandingRequest = {
        message,
        conversationHistory,
      };

      const response = await aiService.understandGoal(request);

      res.json(response);
    } catch (error) {
      console.error('Error in understandGoal:', error);
      res.status(500).json({
        error: 'Failed to understand goal',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Generate clarifying questions
   * POST /api/ai/clarifying-questions
   */
  generateClarifyingQuestions = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { message } = req.body;

      if (!message || typeof message !== 'string') {
        res.status(400).json({
          error: 'Invalid request',
          message: 'Message is required and must be a string',
        });
        return;
      }

      // For MVP, return simple clarifying questions
      const questions = [
        {
          id: 'target-audience',
          question: 'Who is your target audience? Please describe demographics, interests, and behaviors.',
        },
        {
          id: 'budget',
          question: 'What is your total campaign budget? Please specify the amount and currency.',
        },
        {
          id: 'timeline',
          question: 'When do you want to start the campaign and how long should it run?',
        },
      ];

      res.json({ questions });
    } catch (error) {
      console.error('Error in generateClarifyingQuestions:', error);
      res.status(500).json({
        error: 'Failed to generate clarifying questions',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };
}

