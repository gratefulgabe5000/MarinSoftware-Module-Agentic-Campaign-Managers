import React from 'react';
import { PerformanceMetrics } from '../types/performance.types';

/**
 * Metrics Summary Cards Props
 */
interface MetricsSummaryCardsProps {
  metrics: PerformanceMetrics;
}

/**
 * Metric Card Component
 */
interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit = '',
  icon,
  trend,
  color = '#4285F4',
}) => {
  const formatValue = (val: string | number): string => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}M`;
      } else if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}K`;
      }
      return val.toLocaleString();
    }
    return val;
  };

  return (
    <div className="metric-card" style={{ borderLeft: `4px solid ${color}` }}>
      <div className="metric-card-header">
        {icon && <span className="metric-icon">{icon}</span>}
        <h4 className="metric-title">{title}</h4>
      </div>
      <div className="metric-card-body">
        <p className="metric-value">
          {formatValue(value)}
          {unit && <span className="metric-unit">{unit}</span>}
        </p>
        {trend && (
          <div className={`metric-trend ${trend.isPositive ? 'positive' : 'negative'}`}>
            <span className="trend-icon">{trend.isPositive ? '↑' : '↓'}</span>
            <span className="trend-value">{Math.abs(trend.value).toFixed(1)}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Metrics Summary Cards Component
 * Displays key performance metrics in card format
 */
const MetricsSummaryCards: React.FC<MetricsSummaryCardsProps> = ({ metrics }) => {
  return (
    <div className="metrics-summary-cards">
      <MetricCard
        title="Impressions"
        value={metrics.impressions}
        icon="👁️"
        color="#4285F4"
      />
      <MetricCard
        title="Clicks"
        value={metrics.clicks}
        icon="🖱️"
        color="#34A853"
      />
      <MetricCard
        title="CTR"
        value={metrics.ctr}
        unit="%"
        icon="📊"
        color="#FBBC04"
      />
      <MetricCard
        title="Conversions"
        value={metrics.conversions}
        icon="✅"
        color="#EA4335"
      />
      <MetricCard
        title="CPA"
        value={metrics.cpa}
        unit="$"
        icon="💰"
        color="#9334E6"
      />
      <MetricCard
        title="ROAS"
        value={metrics.roas}
        icon="📈"
        color="#00C49F"
      />
      <MetricCard
        title="Spend"
        value={metrics.spend}
        unit="$"
        icon="💵"
        color="#FF8042"
      />
      {metrics.revenue && (
        <MetricCard
          title="Revenue"
          value={metrics.revenue}
          unit="$"
          icon="💸"
          color="#0088FE"
        />
      )}
    </div>
  );
};

export default MetricsSummaryCards;

