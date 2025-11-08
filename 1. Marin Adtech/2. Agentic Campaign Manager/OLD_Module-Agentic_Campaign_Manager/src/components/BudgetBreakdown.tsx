import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { CampaignPlan } from '../types/ai.types';

/**
 * BudgetBreakdown Component Props
 */
interface BudgetBreakdownProps {
  campaignPlan: CampaignPlan;
}

/**
 * BudgetBreakdown Component
 * Visualizes budget breakdown
 */
const BudgetBreakdown: React.FC<BudgetBreakdownProps> = ({ campaignPlan }) => {
  const { budget, platforms } = campaignPlan;

  // Prepare data for pie chart (platform distribution)
  const platformData = platforms.map((platform, index) => ({
    name: platform,
    value: Math.round(budget.total / platforms.length), // Even distribution for MVP
    color: getPlatformColor(platform),
  }));

  // Calculate daily budget if not provided
  const dailyBudget = budget.daily || Math.round(budget.total / campaignPlan.timeline.duration);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="budget-breakdown-card card">
      <div className="card-header">
        <h3>Budget Breakdown</h3>
      </div>
      <div className="card-content">
        <div className="budget-summary">
          <div className="budget-item">
            <label>Total Budget</label>
            <p className="budget-amount">
              {budget.currency} {budget.total.toLocaleString()}
            </p>
          </div>
          <div className="budget-item">
            <label>Daily Budget</label>
            <p className="budget-amount">
              {budget.currency} {dailyBudget.toLocaleString()}
            </p>
          </div>
        </div>

        {platformData.length > 0 && (
          <div className="budget-chart">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={platformData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {platformData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => `${budget.currency} ${value.toLocaleString()}`}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {campaignPlan.adGroups && campaignPlan.adGroups.length > 0 && (
          <div className="ad-group-budget">
            <h4>Budget by Ad Group</h4>
            <div className="ad-group-budget-list">
              {campaignPlan.adGroups.map((adGroup, index) => (
                <div key={index} className="ad-group-budget-item">
                  <span className="ad-group-name">{adGroup.name}</span>
                  <span className="ad-group-budget-amount">
                    {budget.currency} {adGroup.budget.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Get color for platform
 */
function getPlatformColor(platform: string): string {
  const colors: Record<string, string> = {
    'Google Ads': '#4285F4',
    'Meta': '#1877F2',
    'Microsoft Ads': '#F25022',
    'LinkedIn': '#0077B5',
    'Twitter': '#1DA1F2',
  };
  return colors[platform] || '#8884d8';
}

export default BudgetBreakdown;

