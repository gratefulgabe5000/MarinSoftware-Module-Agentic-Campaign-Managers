import React from 'react';
import { CampaignPlan } from '../types/ai.types';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Label } from './ui/label';

/**
 * CampaignOverviewCard Component Props
 */
interface CampaignOverviewCardProps {
  campaignPlan: CampaignPlan;
}

/**
 * CampaignOverviewCard Component
 * Displays campaign overview information
 */
const CampaignOverviewCard: React.FC<CampaignOverviewCardProps> = ({
  campaignPlan,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaign Overview</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label>Objective</Label>
          <p className="text-sm text-foreground">{campaignPlan.objective}</p>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Timeline</Label>
          <div className="flex flex-wrap gap-3 text-sm">
            <span>
              <strong>Start:</strong> {new Date(campaignPlan.timeline.startDate).toLocaleDateString()}
            </span>
            {campaignPlan.timeline.endDate && (
              <span>
                <strong>End:</strong> {new Date(campaignPlan.timeline.endDate).toLocaleDateString()}
              </span>
            )}
            <span>
              <strong>Duration:</strong> {campaignPlan.timeline.duration} days
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Platforms</Label>
          <div className="flex flex-wrap gap-2">
            {campaignPlan.platforms.map((platform, index) => (
              <Badge key={index} variant="secondary">
                {platform}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Primary KPI</Label>
          <p className="text-sm">
            <strong>{campaignPlan.kpis.primary}</strong>
            {campaignPlan.kpis.secondary && campaignPlan.kpis.secondary.length > 0 && (
              <span className="text-muted-foreground">
                {' '}(Secondary: {campaignPlan.kpis.secondary.join(', ')})
              </span>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CampaignOverviewCard;

