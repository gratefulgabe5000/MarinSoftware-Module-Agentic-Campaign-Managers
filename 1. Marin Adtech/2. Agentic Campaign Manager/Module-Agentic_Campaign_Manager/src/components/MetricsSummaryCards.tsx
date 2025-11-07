import React from 'react';
import { PerformanceMetrics } from '../types/performance.types';
import { EyeIcon, MousePointerClickIcon, BarChart3Icon, CheckCircle2Icon, DollarSignIcon, TrendingUpIcon, CreditCardIcon, BanknoteIcon } from 'lucide-react';

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
  icon?: React.ReactNode;
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
    <div className="flex flex-col border-l-4 p-4 rounded-md bg-card shadow-sm" style={{ borderLeftColor: color }}>
      <div className="flex items-center gap-2 mb-2">
        {icon && <div className="text-muted-foreground">{icon}</div>}
        <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
      </div>
      <div className="flex flex-col">
        <p className="text-2xl font-bold">
          {formatValue(value)}
          {unit && <span className="text-lg text-muted-foreground ml-1">{unit}</span>}
        </p>
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            <span>{trend.isPositive ? '↑' : '↓'}</span>
            <span>{Math.abs(trend.value).toFixed(1)}%</span>
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="Impressions"
        value={metrics.impressions}
        icon={<EyeIcon className="h-5 w-5" />}
        color="#4285F4"
      />
      <MetricCard
        title="Clicks"
        value={metrics.clicks}
        icon={<MousePointerClickIcon className="h-5 w-5" />}
        color="#34A853"
      />
      <MetricCard
        title="CTR"
        value={metrics.ctr}
        unit="%"
        icon={<BarChart3Icon className="h-5 w-5" />}
        color="#FBBC04"
      />
      <MetricCard
        title="Conversions"
        value={metrics.conversions}
        icon={<CheckCircle2Icon className="h-5 w-5" />}
        color="#EA4335"
      />
      <MetricCard
        title="CPA"
        value={metrics.cpa}
        unit="$"
        icon={<DollarSignIcon className="h-5 w-5" />}
        color="#9334E6"
      />
      <MetricCard
        title="ROAS"
        value={metrics.roas}
        icon={<TrendingUpIcon className="h-5 w-5" />}
        color="#00C49F"
      />
      <MetricCard
        title="Spend"
        value={metrics.spend}
        unit="$"
        icon={<CreditCardIcon className="h-5 w-5" />}
        color="#FF8042"
      />
      {metrics.revenue && (
        <MetricCard
          title="Revenue"
          value={metrics.revenue}
          unit="$"
          icon={<BanknoteIcon className="h-5 w-5" />}
          color="#0088FE"
        />
      )}
    </div>
  );
};

export default MetricsSummaryCards;

