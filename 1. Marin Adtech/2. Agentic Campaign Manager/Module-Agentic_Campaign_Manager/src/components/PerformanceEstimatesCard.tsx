import React from 'react';
import { CampaignPlan } from '../types/ai.types';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Label } from './ui/label';

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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Performance Estimates</CardTitle>
          <Badge variant="secondary">
            Confidence: {(estimates.confidence * 100).toFixed(0)}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label>Estimated Impressions</Label>
            <p className="text-2xl font-bold">{estimates.impressions.toLocaleString()}</p>
          </div>
          <div className="space-y-2">
            <Label>Estimated Clicks</Label>
            <p className="text-2xl font-bold">{estimates.clicks.toLocaleString()}</p>
          </div>
          <div className="space-y-2">
            <Label>Estimated Conversions</Label>
            <p className="text-2xl font-bold">{estimates.conversions.toLocaleString()}</p>
          </div>
          <div className="space-y-2">
            <Label>Estimated CTR</Label>
            <p className="text-2xl font-bold">{estimates.ctr.toFixed(2)}%</p>
          </div>
          <div className="space-y-2">
            <Label>Estimated CPA</Label>
            <p className="text-2xl font-bold">
              {campaignPlan.budget.currency} {estimates.cpa.toLocaleString()}
            </p>
          </div>
          <div className="space-y-2">
            <Label>Estimated ROAS</Label>
            <p className="text-2xl font-bold">{estimates.roas}x</p>
          </div>
        </div>

        <div className="rounded-lg bg-muted/50 p-3">
          <p className="text-xs text-muted-foreground">
            * These are rough estimates based on industry averages. Actual performance may vary.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceEstimatesCard;

