import React from 'react';
import { CampaignPlan } from '../types/ai.types';

/**
 * PerformanceEstimatesCard Component Props
 */
interface PerformanceEstimatesCardProps {
  campaignPlan: CampaignPlan;
}

/**
 * PerformanceEstimatesCard Component
 * Displays performance estimates and predictions
 */
const PerformanceEstimatesCard: React.FC<PerformanceEstimatesCardProps> = ({
  campaignPlan,
}) => {
  // Calculate rough estimates based on budget and duration
  // These are placeholder calculations - in production, these would come from ML models
  const calculateEstimates = () => {
    const { budget, timeline } = campaignPlan;
    const dailyBudget = budget.daily || Math.round(budget.total / timeline.duration);

    // Rough estimates (placeholders)
    const avgCPC = 2.5; // Average cost per click
    const avgCTR = 0.02; // 2% click-through rate
    const avgConversionRate = 0.03; // 3% conversion rate
    const avgOrderValue = 50; // Average order value

    const estimatedImpressions = Math.round((dailyBudget / avgCPC / avgCTR) * timeline.duration);
    const estimatedClicks = Math.round(estimatedImpressions * avgCTR);
    const estimatedConversions = Math.round(estimatedClicks * avgConversionRate);
    const estimatedCTR = avgCTR * 100;
    const estimatedCPA = Math.round(budget.total / estimatedConversions) || 0;
    const estimatedRevenue = estimatedConversions * avgOrderValue;
    const estimatedROAS = (estimatedRevenue / budget.total).toFixed(2);

    return {
      impressions: estimatedImpressions,
      clicks: estimatedClicks,
      conversions: estimatedConversions,
      ctr: estimatedCTR,
      cpa: estimatedCPA,
      roas: estimatedROAS,
      revenue: estimatedRevenue,
      confidence: 0.65, // Placeholder confidence score
    };
  };

  const estimates = calculateEstimates();

  return (
    <div className="performance-estimates-card card">
      <div className="card-header">
        <h3>Performance Estimates</h3>
        <span className="confidence-badge">
          Confidence: {(estimates.confidence * 100).toFixed(0)}%
        </span>
      </div>
      <div className="card-content">
        <div className="performance-grid">
          <div className="performance-metric">
            <label>Estimated Impressions</label>
            <p className="metric-value">{estimates.impressions.toLocaleString()}</p>
          </div>
          <div className="performance-metric">
            <label>Estimated Clicks</label>
            <p className="metric-value">{estimates.clicks.toLocaleString()}</p>
          </div>
          <div className="performance-metric">
            <label>Estimated Conversions</label>
            <p className="metric-value">{estimates.conversions.toLocaleString()}</p>
          </div>
          <div className="performance-metric">
            <label>Estimated CTR</label>
            <p className="metric-value">{estimates.ctr.toFixed(2)}%</p>
          </div>
          <div className="performance-metric">
            <label>Estimated CPA</label>
            <p className="metric-value">
              {campaignPlan.budget.currency} {estimates.cpa.toLocaleString()}
            </p>
          </div>
          <div className="performance-metric">
            <label>Estimated ROAS</label>
            <p className="metric-value">{estimates.roas}x</p>
          </div>
        </div>

        <div className="performance-disclaimer">
          <p>
            <small>
              * These are rough estimates based on industry averages. Actual performance may vary.
            </small>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PerformanceEstimatesCard;

