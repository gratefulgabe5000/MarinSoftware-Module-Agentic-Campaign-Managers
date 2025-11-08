import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  PerformanceMetrics,
  PerformanceTimeSeries,
  PerformanceResponse,
  TimeRangeConfig,
} from '../types/performance.types';
import { performanceService } from '../services/performanceService';
import { syncQueue } from '../utils/syncQueue';
import MetricsSummaryCards from './MetricsSummaryCards';
import TimeRangeSelector from './TimeRangeSelector';
import PerformanceCharts from './PerformanceCharts';
import PerformanceVsGoals from './PerformanceVsGoals';
import ExportButton from './ExportButton';

/**
 * Performance Dashboard Component
 * Main container for displaying campaign performance metrics
 */
const PerformanceDashboard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [timeSeries, setTimeSeries] = useState<PerformanceTimeSeries | null>(null);
  const [goals, setGoals] = useState<PerformanceResponse['goals']>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRangeConfig>({ type: '7d' });
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isCachedData, setIsCachedData] = useState(false);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [pollingEnabled, setPollingEnabled] = useState(true);

  useEffect(() => {
    if (!id) {
      setError('Campaign ID is required');
      setIsLoading(false);
      return;
    }

    loadPerformanceData();

    // Set up online/offline listeners
    const removeListener = syncQueue.addConnectionListener((online) => {
      setIsOffline(!online);
      if (online) {
        // Connection restored, reload data
        loadPerformanceData();
      }
    });

    // Set up background polling if enabled
    let interval: NodeJS.Timeout | null = null;
    if (pollingEnabled) {
      interval = setInterval(() => {
        if (!isOffline && id) {
          loadPerformanceData(true); // Silent refresh
        }
      }, 30000); // Poll every 30 seconds
      setPollingInterval(interval);
    }

    return () => {
      removeListener();
      if (interval) {
        clearInterval(interval);
      }
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [id, timeRange, pollingEnabled, isOffline]);

  const loadPerformanceData = async (silent: boolean = false) => {
    if (!id) return;

    try {
      if (!silent) {
        setIsLoading(true);
      }
      setError(null);
      setIsCachedData(false);

      const response = await performanceService.getPerformance(
        id,
        timeRange,
        true // Include time series
      );

      setMetrics(response.metrics);
      if (response.timeSeries) {
        setTimeSeries(response.timeSeries);
      }
      setGoals(response.goals);
      setLastUpdated(new Date());
      setIsCachedData(response.metrics.lastUpdated < new Date(Date.now() - 15 * 60 * 1000)); // 15 min threshold
    } catch (error) {
      console.error('Error loading performance data:', error);
      
      // If offline or network error, try to use cached data
      if (isOffline || (error instanceof Error && error.message.includes('Network'))) {
        try {
          const cached = await performanceService.getMetrics(id, timeRange);
          if (cached) {
            setMetrics(cached);
            setIsCachedData(true);
            setLastUpdated(new Date(cached.lastUpdated));
            setError(null);
          } else {
            setError('No cached data available. Please check your connection.');
          }
        } catch (cacheError) {
          setError(
            error instanceof Error
              ? error.message
              : 'Failed to load performance data'
          );
        }
      } else {
        setError(
          error instanceof Error
            ? error.message
            : 'Failed to load performance data'
        );
      }
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  };

  const handleTimeRangeChange = (newTimeRange: TimeRangeConfig) => {
    setTimeRange(newTimeRange);
  };

  if (isLoading && !metrics) {
    return (
      <div className="performance-dashboard">
        <div className="dashboard-loading">
          <div className="loading-spinner" />
          <p>Loading performance data...</p>
        </div>
      </div>
    );
  }

  if (error && !metrics) {
    return (
      <div className="performance-dashboard">
        <div className="dashboard-error">
          <h3>Error Loading Performance Data</h3>
          <p>{error}</p>
          <button
            className="retry-button"
            onClick={() => loadPerformanceData()}
            type="button"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="performance-dashboard">
        <div className="dashboard-empty">
          <p>No performance data available for this campaign.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="performance-dashboard">
      <div className="dashboard-header">
        <h2 className="dashboard-title">Performance Dashboard</h2>
        <div className="dashboard-controls">
          <TimeRangeSelector
            selectedRange={timeRange}
            onRangeChange={handleTimeRangeChange}
            showCustom={false} // For MVP, disable custom range
          />
          <ExportButton
            metrics={metrics}
            timeSeries={timeSeries || undefined}
            campaignId={id}
          />
          <div className="dashboard-status">
            {isOffline && (
              <div className="offline-indicator" title="You are currently offline">
                <span className="offline-icon">📡</span>
                <span className="offline-text">Offline</span>
              </div>
            )}
            {isCachedData && !isOffline && (
              <div className="cached-indicator" title="Showing cached data">
                <span className="cached-icon">💾</span>
                <span className="cached-text">Cached</span>
              </div>
            )}
            {lastUpdated && (
              <div className="last-updated">
                <span className="last-updated-label">Last updated:</span>
                <span className="last-updated-time">
                  {lastUpdated.toLocaleTimeString()}
                </span>
              </div>
            )}
            <button
              className="polling-toggle"
              onClick={() => setPollingEnabled(!pollingEnabled)}
              type="button"
              title={pollingEnabled ? 'Disable auto-refresh' : 'Enable auto-refresh'}
            >
              {pollingEnabled ? '⏸️' : '▶️'}
            </button>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Metrics Summary Cards */}
        <section className="dashboard-section metrics-section">
          <MetricsSummaryCards metrics={metrics} />
        </section>

        {/* Performance Charts */}
        {timeSeries && (
          <section className="dashboard-section charts-section">
            <PerformanceCharts timeSeries={timeSeries} />
          </section>
        )}

        {/* Performance vs Goals */}
        <section className="dashboard-section goals-section">
          <PerformanceVsGoals metrics={metrics} goals={goals} />
        </section>
      </div>

      {isLoading && metrics && (
        <div className="dashboard-refreshing">
          <div className="loading-spinner small" />
          <span>Refreshing data...</span>
        </div>
      )}
    </div>
  );
};

export default PerformanceDashboard;

