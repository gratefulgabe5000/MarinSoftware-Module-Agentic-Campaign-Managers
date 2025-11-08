import React from 'react';
import { PerformanceMetrics, PerformanceGoals } from '../types/performance.types';

/**
 * Performance vs Goals Props
 */
interface PerformanceVsGoalsProps {
  metrics: PerformanceMetrics;
  goals?: PerformanceGoals;
}

/**
 * Performance vs Goals Component
 * Displays performance metrics compared to goals
 */
const PerformanceVsGoals: React.FC<PerformanceVsGoalsProps> = ({ metrics, goals }) => {
  if (!goals) {
    return (
      <div className="performance-vs-goals-empty">
        <p>No goals set for this campaign.</p>
      </div>
    );
  }

  const calculatePercentageOfGoal = (actual: number, goal?: number): number => {
    if (!goal || goal === 0) return 0;
    return (actual / goal) * 100;
  };

  const getStatus = (percentage: number): 'meeting' | 'exceeding' | 'below' => {
    if (percentage >= 100) return 'exceeding';
    if (percentage >= 80) return 'meeting';
    return 'below';
  };

  const getStatusColor = (status: 'meeting' | 'exceeding' | 'below'): string => {
    switch (status) {
      case 'exceeding':
        return '#34A853';
      case 'meeting':
        return '#FBBC04';
      case 'below':
        return '#EA4335';
      default:
        return '#9AA0A6';
    }
  };

  const goalComparisons = [
    {
      label: 'Impressions',
      actual: metrics.impressions,
      goal: goals.impressions,
      unit: '',
    },
    {
      label: 'Clicks',
      actual: metrics.clicks,
      goal: goals.clicks,
      unit: '',
    },
    {
      label: 'CTR',
      actual: metrics.ctr,
      goal: goals.ctr,
      unit: '%',
    },
    {
      label: 'Conversions',
      actual: metrics.conversions,
      goal: goals.conversions,
      unit: '',
    },
    {
      label: 'CPA',
      actual: metrics.cpa,
      goal: goals.cpa,
      unit: '$',
      isLowerBetter: true, // For CPA, lower is better
    },
    {
      label: 'ROAS',
      actual: metrics.roas,
      goal: goals.roas,
      unit: '',
    },
    {
      label: 'Spend',
      actual: metrics.spend,
      goal: goals.spend,
      unit: '$',
    },
    {
      label: 'Revenue',
      actual: metrics.revenue || 0,
      goal: goals.revenue,
      unit: '$',
    },
  ].filter((comparison) => comparison.goal !== undefined);

  return (
    <div className="performance-vs-goals">
      <h3 className="section-title">Performance vs Goals</h3>
      <div className="goals-comparison-grid">
        {goalComparisons.map((comparison) => {
          const percentage = comparison.isLowerBetter
            ? (comparison.goal! / comparison.actual) * 100
            : calculatePercentageOfGoal(comparison.actual, comparison.goal);
          const status = getStatus(percentage);
          const statusColor = getStatusColor(status);

          return (
            <div key={comparison.label} className="goal-comparison-card">
              <div className="goal-comparison-header">
                <h4 className="goal-metric-label">{comparison.label}</h4>
                <span
                  className={`goal-status-badge ${status}`}
                  style={{ backgroundColor: statusColor }}
                >
                  {status === 'exceeding' && '✓'}
                  {status === 'meeting' && '~'}
                  {status === 'below' && '✗'}
                </span>
              </div>
              <div className="goal-comparison-body">
                <div className="goal-values">
                  <div className="goal-value">
                    <span className="goal-label">Actual:</span>
                    <span className="goal-actual">
                      {comparison.unit}
                      {comparison.actual.toLocaleString()}
                    </span>
                  </div>
                  <div className="goal-value">
                    <span className="goal-label">Goal:</span>
                    <span className="goal-target">
                      {comparison.unit}
                      {comparison.goal!.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="goal-progress">
                  <div className="goal-progress-bar">
                    <div
                      className="goal-progress-fill"
                      style={{
                        width: `${Math.min(percentage, 100)}%`,
                        backgroundColor: statusColor,
                      }}
                    />
                  </div>
                  <span className="goal-percentage">
                    {percentage.toFixed(1)}% of goal
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PerformanceVsGoals;

