import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ExportButton from '../ExportButton';
import { performanceService } from '../../services/performanceService';
import { PerformanceMetrics, PerformanceTimeSeries } from '../../types/performance.types';

// Mock performance service
jest.mock('../../services/performanceService', () => ({
  performanceService: {
    exportToCSV: jest.fn(),
  },
}));

describe('ExportButton', () => {
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

  const mockTimeSeries: PerformanceTimeSeries = {
    campaignId: 'campaign-123',
    dataPoints: [
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
    ],
    timeRange: {
      start: new Date('2025-01-01'),
      end: new Date('2025-01-08'),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render export button', () => {
    render(
      <ExportButton
        metrics={mockMetrics}
        campaignId="campaign-123"
      />
    );

    expect(screen.getByText('Export CSV')).toBeInTheDocument();
  });

  it('should export metrics when clicked', async () => {
    (performanceService.exportToCSV as jest.Mock).mockImplementation(() => {});

    render(
      <ExportButton
        metrics={mockMetrics}
        campaignId="campaign-123"
      />
    );

    const button = screen.getByText('Export CSV');
    fireEvent.click(button);

    await waitFor(() => {
      expect(performanceService.exportToCSV).toHaveBeenCalledWith(
        mockMetrics,
        expect.stringContaining('metrics')
      );
    });
  });

  it('should export both metrics and time series when available', async () => {
    (performanceService.exportToCSV as jest.Mock).mockImplementation(() => {});

    render(
      <ExportButton
        metrics={mockMetrics}
        timeSeries={mockTimeSeries}
        campaignId="campaign-123"
      />
    );

    const button = screen.getByText('Export CSV');
    fireEvent.click(button);

    await waitFor(() => {
      expect(performanceService.exportToCSV).toHaveBeenCalledTimes(2);
    });
  });

  it('should show loading state during export', async () => {
    (performanceService.exportToCSV as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(
      <ExportButton
        metrics={mockMetrics}
        campaignId="campaign-123"
      />
    );

    const button = screen.getByText('Export CSV');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Exporting...')).toBeInTheDocument();
    });
  });

  it('should handle export errors', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    (performanceService.exportToCSV as jest.Mock).mockImplementation(() => {
      throw new Error('Export failed');
    });

    render(
      <ExportButton
        metrics={mockMetrics}
        campaignId="campaign-123"
      />
    );

    const button = screen.getByText('Export CSV');
    fireEvent.click(button);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });
});

