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
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';

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
    <Card>
      <CardHeader>
        <CardTitle>Spend & Revenue Over Time</CardTitle>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
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
    <Card>
      <CardHeader>
        <CardTitle>Performance Metrics Comparison</CardTitle>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
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
    <Card>
      <CardHeader>
        <CardTitle>CTR Trend</CardTitle>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
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
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">
            No performance data available for the selected time range.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <SpendOverTimeChart dataPoints={dataPoints} />
      <PerformanceComparisonChart dataPoints={dataPoints} />
      <CTRTrendChart dataPoints={dataPoints} />
    </div>
  );
};

export default PerformanceCharts;

