import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { PerformanceTimeSeries, PerformanceDataPoint } from '../types/performance.types';

/**
 * Performance Charts Props
 */
interface PerformanceChartsProps {
  timeSeries: PerformanceTimeSeries;
}

/**
 * Format date for chart display
 */
const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Spend Over Time Chart Component
 */
interface SpendOverTimeChartProps {
  dataPoints: PerformanceDataPoint[];
}

const SpendOverTimeChart: React.FC<SpendOverTimeChartProps> = ({ dataPoints }) => {
  const chartData = dataPoints.map((point) => ({
    date: formatDate(point.date),
    spend: point.spend,
    revenue: point.revenue || 0,
  }));

  return (
    <div className="performance-chart-container">
      <h3 className="chart-title">Spend & Revenue Over Time</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip
            formatter={(value: number) => `$${value.toFixed(2)}`}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="spend"
            stroke="#FF8042"
            strokeWidth={2}
            name="Spend"
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#00C49F"
            strokeWidth={2}
            name="Revenue"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

/**
 * Performance Comparison Chart Component
 */
interface PerformanceComparisonChartProps {
  dataPoints: PerformanceDataPoint[];
}

const PerformanceComparisonChart: React.FC<PerformanceComparisonChartProps> = ({
  dataPoints,
}) => {
  const chartData = dataPoints.map((point) => ({
    date: formatDate(point.date),
    impressions: point.impressions,
    clicks: point.clicks,
    conversions: point.conversions,
  }));

  return (
    <div className="performance-chart-container">
      <h3 className="chart-title">Performance Metrics Comparison</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip />
          <Legend />
          <Bar yAxisId="left" dataKey="impressions" fill="#4285F4" name="Impressions" />
          <Bar yAxisId="left" dataKey="clicks" fill="#34A853" name="Clicks" />
          <Bar yAxisId="right" dataKey="conversions" fill="#EA4335" name="Conversions" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

/**
 * CTR Trend Chart Component
 */
interface CTRTrendChartProps {
  dataPoints: PerformanceDataPoint[];
}

const CTRTrendChart: React.FC<CTRTrendChartProps> = ({ dataPoints }) => {
  const chartData = dataPoints.map((point) => ({
    date: formatDate(point.date),
    ctr: point.ctr,
  }));

  return (
    <div className="performance-chart-container">
      <h3 className="chart-title">CTR Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip
            formatter={(value: number) => `${value.toFixed(2)}%`}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="ctr"
            stroke="#FBBC04"
            strokeWidth={2}
            name="CTR (%)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

/**
 * Performance Charts Component
 * Displays performance charts using Recharts
 */
const PerformanceCharts: React.FC<PerformanceChartsProps> = ({ timeSeries }) => {
  const { dataPoints } = timeSeries;

  if (!dataPoints || dataPoints.length === 0) {
    return (
      <div className="performance-charts-empty">
        <p>No performance data available for the selected time range.</p>
      </div>
    );
  }

  return (
    <div className="performance-charts">
      <div className="charts-grid">
        <SpendOverTimeChart dataPoints={dataPoints} />
        <PerformanceComparisonChart dataPoints={dataPoints} />
        <CTRTrendChart dataPoints={dataPoints} />
      </div>
    </div>
  );
};

export default PerformanceCharts;

