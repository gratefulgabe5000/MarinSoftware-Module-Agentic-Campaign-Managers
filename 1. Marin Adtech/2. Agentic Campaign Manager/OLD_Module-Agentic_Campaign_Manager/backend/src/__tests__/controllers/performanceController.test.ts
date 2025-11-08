import { Request, Response } from 'express';
import { PerformanceController } from '../../controllers/performanceController';

describe('PerformanceController', () => {
  let controller: PerformanceController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    controller = new PerformanceController();
    mockRequest = {
      params: { id: 'campaign-123' },
      query: { timeRange: '7d' },
    };
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe('getCampaignPerformance', () => {
    it('should return performance metrics', async () => {
      await controller.getCampaignPerformance(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalled();
      const responseData = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(responseData).toHaveProperty('metrics');
      expect(responseData.metrics).toHaveProperty('campaignId', 'campaign-123');
      expect(responseData.metrics).toHaveProperty('impressions');
      expect(responseData.metrics).toHaveProperty('clicks');
      expect(responseData.metrics).toHaveProperty('spend');
    });

    it('should include time series when requested', async () => {
      mockRequest.query = {
        timeRange: '7d',
        includeTimeSeries: 'true',
      };

      await controller.getCampaignPerformance(
        mockRequest as Request,
        mockResponse as Response
      );

      const responseData = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(responseData).toHaveProperty('timeSeries');
      expect(responseData.timeSeries).toHaveProperty('dataPoints');
    });

    it('should handle custom date range', async () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-08');
      mockRequest.query = {
        timeRange: 'custom',
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      };

      await controller.getCampaignPerformance(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalled();
      const responseData = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(responseData.metrics.dateRange.start).toBeInstanceOf(Date);
      expect(responseData.metrics.dateRange.end).toBeInstanceOf(Date);
    });

    it('should return 400 error if campaign ID is missing', async () => {
      mockRequest.params = {};

      await controller.getCampaignPerformance(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid request',
        message: 'Campaign ID is required',
      });
    });

    it('should handle errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Mock an error scenario
      mockRequest.params = undefined as any;

      await controller.getCampaignPerformance(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);

      consoleErrorSpy.mockRestore();
    });
  });

  describe('calculateDateRange', () => {
    it('should calculate date range for today', async () => {
      mockRequest.query = { timeRange: 'today' };

      await controller.getCampaignPerformance(
        mockRequest as Request,
        mockResponse as Response
      );

      const responseData = (mockResponse.json as jest.Mock).mock.calls[0][0];
      const startDate = new Date(responseData.metrics.dateRange.start);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      expect(startDate.getDate()).toBe(today.getDate());
    });

    it('should calculate date range for 7 days', async () => {
      mockRequest.query = { timeRange: '7d' };

      await controller.getCampaignPerformance(
        mockRequest as Request,
        mockResponse as Response
      );

      const responseData = (mockResponse.json as jest.Mock).mock.calls[0][0];
      const startDate = new Date(responseData.metrics.dateRange.start);
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - 7);

      expect(Math.abs(startDate.getTime() - expectedDate.getTime())).toBeLessThan(
        24 * 60 * 60 * 1000 // Within 1 day
      );
    });

    it('should calculate date range for 30 days', async () => {
      mockRequest.query = { timeRange: '30d' };

      await controller.getCampaignPerformance(
        mockRequest as Request,
        mockResponse as Response
      );

      const responseData = (mockResponse.json as jest.Mock).mock.calls[0][0];
      const startDate = new Date(responseData.metrics.dateRange.start);
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - 30);

      expect(Math.abs(startDate.getTime() - expectedDate.getTime())).toBeLessThan(
        24 * 60 * 60 * 1000 // Within 1 day
      );
    });
  });
});

