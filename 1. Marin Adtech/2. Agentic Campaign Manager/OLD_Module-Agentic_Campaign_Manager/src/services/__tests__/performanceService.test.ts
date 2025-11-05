import axios from 'axios';
import { performanceService } from '../performanceService';
import { PerformanceMetrics, TimeRangeConfig } from '../../types/performance.types';
import { cachePerformanceMetrics, getCachedPerformanceMetrics } from '../../utils/indexedDB';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock IndexedDB
jest.mock('../../utils/indexedDB', () => ({
  cachePerformanceMetrics: jest.fn(),
  getCachedPerformanceMetrics: jest.fn(),
}));

describe('PerformanceService', () => {
  const mockMetrics: PerformanceMetrics = {
    impressions: 10000,
    clicks: 500,
    ctr: 5.0,
    conversions: 50,
    cpa: 20.0,
    roas: 2.5,
    spend: 1000,
    revenue: 2500,
    dateRange: {
      start: new Date('2025-01-01'),
      end: new Date('2025-01-08'),
    },
    campaignId: 'campaign-123',
    lastUpdated: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getCachedPerformanceMetrics as jest.Mock).mockResolvedValue(null);
  });

  describe('getMetrics', () => {
    it('should return cached metrics if available', async () => {
      (getCachedPerformanceMetrics as jest.Mock).mockResolvedValue(mockMetrics);

      const timeRange: TimeRangeConfig = { type: '7d' };
      const result = await performanceService.getMetrics('campaign-123', timeRange);

      expect(result).toEqual(mockMetrics);
      expect(getCachedPerformanceMetrics).toHaveBeenCalledWith('campaign-123', timeRange);
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    it('should fetch from API if cache is empty', async () => {
      (getCachedPerformanceMetrics as jest.Mock).mockResolvedValue(null);
      mockedAxios.get.mockResolvedValue({
        data: mockMetrics,
      });

      const timeRange: TimeRangeConfig = { type: '7d' };
      const result = await performanceService.getMetrics('campaign-123', timeRange);

      expect(result).toEqual(mockMetrics);
      expect(mockedAxios.get).toHaveBeenCalled();
      expect(cachePerformanceMetrics).toHaveBeenCalledWith('campaign-123', mockMetrics, timeRange);
    });

    it('should use cached data on network error', async () => {
      (getCachedPerformanceMetrics as jest.Mock)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockMetrics);
      mockedAxios.get.mockRejectedValue({
        request: {},
        isAxiosError: true,
      });

      const timeRange: TimeRangeConfig = { type: '7d' };
      const result = await performanceService.getMetrics('campaign-123', timeRange);

      expect(result).toEqual(mockMetrics);
      expect(getCachedPerformanceMetrics).toHaveBeenCalledTimes(2);
    });

    it('should throw error if no cache available on network error', async () => {
      (getCachedPerformanceMetrics as jest.Mock).mockResolvedValue(null);
      mockedAxios.get.mockRejectedValue({
        request: {},
        isAxiosError: true,
      });

      const timeRange: TimeRangeConfig = { type: '7d' };
      await expect(
        performanceService.getMetrics('campaign-123', timeRange)
      ).rejects.toThrow('Network error: Unable to reach server');
    });
  });

  describe('getTimeSeries', () => {
    it('should fetch time series data', async () => {
      const mockTimeSeries = {
        campaignId: 'campaign-123',
        dataPoints: [],
        timeRange: {
          start: new Date('2025-01-01'),
          end: new Date('2025-01-08'),
        },
      };

      mockedAxios.get.mockResolvedValue({
        data: {
          metrics: mockMetrics,
          timeSeries: mockTimeSeries,
        },
      });

      const timeRange: TimeRangeConfig = { type: '7d' };
      const result = await performanceService.getTimeSeries('campaign-123', timeRange);

      expect(result).toEqual(mockTimeSeries);
      expect(mockedAxios.get).toHaveBeenCalled();
    });

    it('should throw error if time series not available', async () => {
      mockedAxios.get.mockResolvedValue({
        data: {
          metrics: mockMetrics,
        },
      });

      const timeRange: TimeRangeConfig = { type: '7d' };
      await expect(
        performanceService.getTimeSeries('campaign-123', timeRange)
      ).rejects.toThrow('Time series data not available');
    });
  });

  describe('exportToCSV', () => {
    it('should export metrics to CSV', () => {
      const createElementSpy = jest.spyOn(document, 'createElement');
      const appendChildSpy = jest.spyOn(document.body, 'appendChild');
      const removeChildSpy = jest.spyOn(document.body, 'removeChild');
      const clickSpy = jest.fn();

      createElementSpy.mockReturnValue({
        setAttribute: jest.fn(),
        click: clickSpy,
        style: {},
      } as any);

      performanceService.exportToCSV(mockMetrics);

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(clickSpy).toHaveBeenCalled();
      expect(appendChildSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();
    });

    it('should export time series data to CSV', () => {
      const dataPoints = [
        {
          date: new Date('2025-01-01'),
          impressions: 1000,
          clicks: 50,
          ctr: 5.0,
          conversions: 5,
          cpa: 20.0,
          roas: 2.5,
          spend: 100,
          revenue: 250,
        },
      ];

      const createElementSpy = jest.spyOn(document, 'createElement');
      const clickSpy = jest.fn();

      createElementSpy.mockReturnValue({
        setAttribute: jest.fn(),
        click: clickSpy,
        style: {},
      } as any);

      performanceService.exportToCSV(dataPoints);

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(clickSpy).toHaveBeenCalled();
    });
  });
});

