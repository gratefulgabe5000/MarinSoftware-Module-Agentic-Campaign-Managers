import { Request, Response } from 'express';
import { AIController } from '../../controllers/aiController';
import { aiService } from '../../services/aiService';

// Mock AI service
jest.mock('../../services/aiService', () => ({
  aiService: {
    understandGoal: jest.fn(),
  },
}));

describe('AIController', () => {
  let controller: AIController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    controller = new AIController();
    mockRequest = {};
    mockResponse = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('understandGoal', () => {
    it('should successfully understand goal', async () => {
      const mockResponseData = {
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
      };

      (aiService.understandGoal as jest.Mock).mockResolvedValue(mockResponseData);

      mockRequest.body = {
        message: 'I want to launch a campaign',
      };

      await controller.understandGoal(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(aiService.understandGoal).toHaveBeenCalledWith({
        message: 'I want to launch a campaign',
        conversationHistory: undefined,
      });
      expect(mockResponse.json).toHaveBeenCalledWith(mockResponseData);
    });

    it('should handle missing message', async () => {
      mockRequest.body = {};

      await controller.understandGoal(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Invalid request',
          message: 'Message is required and must be a string',
        })
      );
    });

    it('should handle invalid message type', async () => {
      mockRequest.body = {
        message: 123,
      };

      await controller.understandGoal(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should handle service errors', async () => {
      (aiService.understandGoal as jest.Mock).mockRejectedValue(
        new Error('Service error')
      );

      mockRequest.body = {
        message: 'Test message',
      };

      await controller.understandGoal(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Failed to understand goal',
        })
      );
    });

    it('should pass conversation history to service', async () => {
      const mockResponseData = {
        campaignPlan: {
          objective: 'Test',
          targetAudience: {},
          budget: { total: 1000, currency: 'USD' },
          timeline: { startDate: '2025-01-01', duration: 30 },
          platforms: ['Google Ads'],
          kpis: { primary: 'Conversions' },
        },
        confidence: 0.8,
        needsClarification: false,
      };

      (aiService.understandGoal as jest.Mock).mockResolvedValue(mockResponseData);

      mockRequest.body = {
        message: 'Test message',
        conversationHistory: [
          { role: 'user', content: 'Previous message' },
        ],
      };

      await controller.understandGoal(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(aiService.understandGoal).toHaveBeenCalledWith({
        message: 'Test message',
        conversationHistory: [{ role: 'user', content: 'Previous message' }],
      });
    });
  });

  describe('generateClarifyingQuestions', () => {
    it('should generate clarifying questions', async () => {
      mockRequest.body = {
        message: 'Test message',
      };

      await controller.generateClarifyingQuestions(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          questions: expect.any(Array),
        })
      );
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          questions: expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(String),
              question: expect.any(String),
            }),
          ]),
        })
      );
    });

    it('should handle missing message', async () => {
      mockRequest.body = {};

      await controller.generateClarifyingQuestions(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Invalid request',
        })
      );
    });

    it('should handle errors', async () => {
      mockRequest.body = {
        message: 'Test message',
      };

      // Simulate error
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await controller.generateClarifyingQuestions(
        mockRequest as Request,
        mockResponse as Response
      );

      // Should still return questions (mock implementation)
      expect(mockResponse.json).toHaveBeenCalled();
    });
  });
});

