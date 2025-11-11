import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { CampaignPlan } from '../types/ai.types';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Label } from './ui/label';

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
  const platformData = platforms.map((platform) => ({
    name: platform,
    value: Math.round(budget.total / platforms.length), // Even distribution for MVP
    color: getPlatformColor(platform),
  }));

  // Calculate daily budget if not provided
  const dailyBudget = budget.daily || Math.round(budget.total / campaignPlan.timeline.duration);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Total Budget</Label>
            <p className="text-2xl font-bold">
              {budget.currency} {budget.total.toLocaleString()}
            </p>
          </div>
          <div className="space-y-2">
            <Label>Daily Budget</Label>
            <p className="text-2xl font-bold">
              {budget.currency} {dailyBudget.toLocaleString()}
            </p>
          </div>
        </div>

        {platformData.length > 0 && (
          <div className="w-full">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={platformData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) =>
                    `${entry.name}: ${Math.round((entry.value / platformData.reduce((sum, p) => sum + p.value, 0)) * 100)}%`
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
          <div className="space-y-3">
            <h4 className="font-semibold">Budget by Ad Group</h4>
            <div className="space-y-2">
              {campaignPlan.adGroups.map((adGroup, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <span className="text-sm font-medium">{adGroup.name}</span>
                  <span className="text-sm font-semibold">
                    {budget.currency} {adGroup.budget.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
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

