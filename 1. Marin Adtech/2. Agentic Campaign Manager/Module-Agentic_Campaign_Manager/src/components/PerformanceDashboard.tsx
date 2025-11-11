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
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Loader2Icon, AlertCircleIcon, WifiOffIcon, HardDriveIcon, PlayIcon, PauseIcon } from 'lucide-react';

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
        } catch {
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
      <div className="min-h-screen bg-background p-8">
        <div className="flex flex-col items-center justify-center gap-4 py-12">
          <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading performance data...</p>
        </div>
      </div>
    );
  }

  if (error && !metrics) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="mx-auto max-w-7xl space-y-4">
          <h2 className="text-2xl font-bold">Error Loading Performance Data</h2>
          <Alert variant="destructive">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={() => loadPerformanceData()} type="button">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="mx-auto max-w-7xl">
          <Alert>
            <AlertCircleIcon className="h-4 w-4" />
            <AlertDescription>
              No performance data available for this campaign.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Performance Dashboard</h1>
          <div className="flex flex-wrap items-center gap-3">
            <TimeRangeSelector
              selectedRange={timeRange}
              onRangeChange={handleTimeRangeChange}
              showCustom={false}
            />
            <ExportButton
              metrics={metrics}
              timeSeries={timeSeries || undefined}
              campaignId={id}
            />
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex flex-wrap items-center gap-3">
          {isOffline && (
            <Badge variant="destructive" className="flex items-center gap-1.5">
              <WifiOffIcon className="h-3 w-3" />
              Offline
            </Badge>
          )}
          {isCachedData && !isOffline && (
            <Badge variant="secondary" className="flex items-center gap-1.5">
              <HardDriveIcon className="h-3 w-3" />
              Cached Data
            </Badge>
          )}
          {lastUpdated && (
            <span className="text-sm text-muted-foreground">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setPollingEnabled(!pollingEnabled)}
            type="button"
            title={pollingEnabled ? 'Disable auto-refresh' : 'Enable auto-refresh'}
          >
            {pollingEnabled ? (
              <PauseIcon className="h-4 w-4" />
            ) : (
              <PlayIcon className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Metrics Summary Cards */}
        <section>
          <MetricsSummaryCards metrics={metrics} />
        </section>

        {/* Performance Charts */}
        {timeSeries && (
          <section>
            <PerformanceCharts timeSeries={timeSeries} />
          </section>
        )}

        {/* Performance vs Goals */}
        <section>
          <PerformanceVsGoals metrics={metrics} goals={goals} />
        </section>

        {/* Refreshing Indicator */}
        {isLoading && metrics && (
          <div className="fixed bottom-4 right-4 flex items-center gap-2 rounded-md border bg-background p-3 shadow-lg">
            <Loader2Icon className="h-4 w-4 animate-spin" />
            <span className="text-sm">Refreshing data...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceDashboard;

