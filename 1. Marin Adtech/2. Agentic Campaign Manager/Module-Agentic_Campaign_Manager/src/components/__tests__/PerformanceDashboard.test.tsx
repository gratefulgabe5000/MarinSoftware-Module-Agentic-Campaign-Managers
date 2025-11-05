import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PerformanceDashboard from '../PerformanceDashboard';
import { performanceService } from '../../services/performanceService';
import { syncQueue } from '../../utils/syncQueue';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: 'campaign-123' }),
}));

// Mock performance service
jest.mock('../../services/performanceService', () => ({
  performanceService: {
    getPerformance: jest.fn(),
    getMetrics: jest.fn(),
  },
}));

// Mock sync queue
jest.mock('../../utils/syncQueue', () => ({
  syncQueue: {
    addConnectionListener: jest.fn(() => jest.fn()),
  },
}));

// Mock child components
jest.mock('../MetricsSummaryCards', () => {
  return function MockMetricsSummaryCards(props: any) {
    return <div data-testid="metrics-summary-cards">Metrics Summary Cards</div>;
  };
});

jest.mock('../TimeRangeSelector', () => {
  return function MockTimeRangeSelector(props: any) {
    return (
      <div data-testid="time-range-selector">
        <button onClick={() => props.onRangeChange({ type: '30d' })}>
          Change Range
        </button>
      </div>
    );
  };
});

jest.mock('../PerformanceCharts', () => {
  return function MockPerformanceCharts(props: any) {
    return <div data-testid="performance-charts">Performance Charts</div>;
  };
});

jest.mock('../PerformanceVsGoals', () => {
  return function MockPerformanceVsGoals(props: any) {
    return <div data-testid="performance-vs-goals">Performance vs Goals</div>;
  };
});

jest.mock('../ExportButton', () => {
  return function MockExportButton(props: any) {
    return <div data-testid="export-button">Export Button</div>;
  };
});

describe('PerformanceDashboard', () => {
  const mockMetrics = {
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

  const mockTimeSeries = {
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

  const mockResponse = {
    metrics: mockMetrics,
    timeSeries: mockTimeSeries,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });
  });

  it('should render loading state initially', () => {
    (performanceService.getPerformance as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(
      <BrowserRouter>
        <PerformanceDashboard />
      </BrowserRouter>
    );

    expect(screen.getByText('Loading performance data...')).toBeInTheDocument();
  });

  it('should render performance dashboard with data', async () => {
    (performanceService.getPerformance as jest.Mock).mockResolvedValue(mockResponse);

    render(
      <BrowserRouter>
        <PerformanceDashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Performance Dashboard')).toBeInTheDocument();
    });

    expect(screen.getByTestId('metrics-summary-cards')).toBeInTheDocument();
    expect(screen.getByTestId('performance-charts')).toBeInTheDocument();
    expect(screen.getByTestId('performance-vs-goals')).toBeInTheDocument();
    expect(screen.getByTestId('export-button')).toBeInTheDocument();
  });

  it('should show error message on failure', async () => {
    (performanceService.getPerformance as jest.Mock).mockRejectedValue(
      new Error('Failed to load')
    );

    render(
      <BrowserRouter>
        <PerformanceDashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Error Loading Performance Data')).toBeInTheDocument();
    });

    expect(screen.getByText('Failed to load')).toBeInTheDocument();
  });

  it('should use cached data when offline', async () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    });

    (performanceService.getPerformance as jest.Mock).mockRejectedValue(
      new Error('Network error: Unable to reach server')
    );
    (performanceService.getMetrics as jest.Mock).mockResolvedValue(mockMetrics);

    render(
      <BrowserRouter>
        <PerformanceDashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('metrics-summary-cards')).toBeInTheDocument();
    });
  });

  it('should handle time range change', async () => {
    (performanceService.getPerformance as jest.Mock).mockResolvedValue(mockResponse);

    render(
      <BrowserRouter>
        <PerformanceDashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('time-range-selector')).toBeInTheDocument();
    });

    const changeButton = screen.getByText('Change Range');
    fireEvent.click(changeButton);

    await waitFor(() => {
      expect(performanceService.getPerformance).toHaveBeenCalledTimes(2);
    });
  });
});

