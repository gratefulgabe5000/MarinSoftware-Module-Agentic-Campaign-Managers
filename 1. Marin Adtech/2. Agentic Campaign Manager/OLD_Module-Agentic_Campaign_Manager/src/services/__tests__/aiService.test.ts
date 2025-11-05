import axios from 'axios';
import { aiService } from '../aiService';
import { GoalUnderstandingRequest } from '../../types/ai.types';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AIService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('understandGoal', () => {
    it('should successfully understand goal', async () => {
      const mockResponse = {
        data: {
          campaignPlan: {
            objective: 'Test objective',
            targetAudience: {},
            budget: { total: 1000, currency: 'USD' },
            timeline: { startDate: '2025-01-01', duration: 30 },
            platforms: ['Google Ads'],
            kpis: { primary: 'Conversions' },
          },
          confidence: 0.8,
          needsClarification: false,
        },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const request: GoalUnderstandingRequest = {
        message: 'I want to launch a campaign',
      };

      const result = await aiService.understandGoal(request);

      expect(result).toEqual(mockResponse.data);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/ai/understand-goal'),
        request,
        expect.any(Object)
      );
    });

    it('should handle network errors', async () => {
      mockedAxios.post.mockRejectedValue({
        request: {},
      });

      const request: GoalUnderstandingRequest = {
        message: 'Test message',
      };

      await expect(aiService.understandGoal(request)).rejects.toThrow(
        'Network error: Could not connect to server'
      );
    });

    it('should handle server errors', async () => {
      mockedAxios.post.mockRejectedValue({
        response: {
          status: 500,
          data: { error: { message: 'Server error' } },
        },
      });

      const request: GoalUnderstandingRequest = {
        message: 'Test message',
      };

      await expect(aiService.understandGoal(request)).rejects.toThrow('Server error');
    });

    it('should handle timeout', async () => {
      mockedAxios.post.mockRejectedValue({
        code: 'ECONNABORTED',
        message: 'timeout',
      });

      const request: GoalUnderstandingRequest = {
        message: 'Test message',
      };

      await expect(aiService.understandGoal(request)).rejects.toThrow();
    });
  });

  describe('generateClarifyingQuestions', () => {
    it('should generate clarifying questions', async () => {
      const mockResponse = {
        data: {
          questions: [
            { id: 'q1', question: 'What is your budget?' },
            { id: 'q2', question: 'Who is your target audience?' },
          ],
        },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await aiService.generateClarifyingQuestions('Test message');

      expect(result).toEqual(mockResponse.data);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/ai/clarifying-questions'),
        { message: 'Test message' },
        expect.any(Object)
      );
    });

    it('should handle errors', async () => {
      mockedAxios.post.mockRejectedValue({
        response: {
          status: 500,
          data: { error: { message: 'Server error' } },
        },
      });

      await expect(
        aiService.generateClarifyingQuestions('Test message')
      ).rejects.toThrow('Server error');
    });
  });
});

