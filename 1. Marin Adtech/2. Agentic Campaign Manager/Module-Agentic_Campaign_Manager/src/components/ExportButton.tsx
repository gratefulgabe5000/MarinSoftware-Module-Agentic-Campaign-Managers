import React, { useState } from 'react';
import { performanceService } from '../services/performanceService';
import {
  PerformanceMetrics,
  PerformanceTimeSeries,
  PerformanceDataPoint,
} from '../types/performance.types';

/**
 * Export Button Props
 */
interface ExportButtonProps {
  metrics: PerformanceMetrics;
  timeSeries?: PerformanceTimeSeries;
  campaignId?: string;
  campaignName?: string;
}

/**
 * Export Button Component
 * Provides export functionality for performance data
 */
const ExportButton: React.FC<ExportButtonProps> = ({
  metrics,
  timeSeries,
  campaignId,
  campaignName,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const generateFilename = (type: 'metrics' | 'timeseries'): string => {
    const date = new Date().toISOString().split('T')[0];
    const name = campaignName
      ? campaignName.replace(/[^a-z0-9]/gi, '_').toLowerCase()
      : 'campaign';
    const id = campaignId || 'unknown';
    return `${name}-${id}-${type}-${date}.csv`;
  };

  const handleExportMetrics = async () => {
    try {
      setIsExporting(true);
      setExportError(null);

      await performanceService.exportToCSV(metrics, generateFilename('metrics'));
    } catch (error) {
      console.error('Error exporting metrics:', error);
      setExportError(
        error instanceof Error
          ? error.message
          : 'Failed to export metrics'
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportTimeSeries = async () => {
    if (!timeSeries || !timeSeries.dataPoints.length) {
      setExportError('No time series data available to export');
      return;
    }

    try {
      setIsExporting(true);
      setExportError(null);

      await performanceService.exportToCSV(
        timeSeries.dataPoints,
        generateFilename('timeseries')
      );
    } catch (error) {
      console.error('Error exporting time series:', error);
      setExportError(
        error instanceof Error
          ? error.message
          : 'Failed to export time series'
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportBoth = async () => {
    try {
      setIsExporting(true);
      setExportError(null);

      // Export metrics first
      await handleExportMetrics();
      
      // Small delay to allow first download to start
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // Export time series if available
      if (timeSeries && timeSeries.dataPoints.length > 0) {
        await handleExportTimeSeries();
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      setExportError(
        error instanceof Error ? error.message : 'Failed to export data'
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="export-button-container">
      <button
        className="btn btn-secondary export-button"
        disabled={isExporting}
        onClick={timeSeries && timeSeries.dataPoints.length > 0 ? handleExportBoth : handleExportMetrics}
        type="button"
        title={
          timeSeries && timeSeries.dataPoints.length > 0
            ? 'Export metrics and time series data (CSV)'
            : 'Export metrics data (CSV)'
        }
      >
        {isExporting ? (
          <>
            <span className="export-icon">⏳</span>
            Exporting...
          </>
        ) : (
          <>
            <span className="export-icon">📥</span>
            Export CSV
          </>
        )}
      </button>
      {exportError && (
        <div className="export-error" title={exportError}>
          <span className="error-icon">⚠️</span>
        </div>
      )}
    </div>
  );
};

export default ExportButton;

