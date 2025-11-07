import React from 'react';
import { CampaignPlan } from '../types/ai.types';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Label } from './ui/label';
import { Badge } from './ui/badge';

/**
 * AudienceSummaryCard Component Props
 */
interface AudienceSummaryCardProps {
  campaignPlan: CampaignPlan;
}

/**
 * AudienceSummaryCard Component
 * Displays target audience summary
 */
const AudienceSummaryCard: React.FC<AudienceSummaryCardProps> = ({
  campaignPlan,
}) => {
  const { targetAudience } = campaignPlan;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Target Audience</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {targetAudience.demographics && (
          <div className="space-y-4">
            <h4 className="font-semibold text-base">Demographics</h4>
            <div className="space-y-3">
              {targetAudience.demographics.age && (
                <div className="flex items-center gap-2">
                  <Label className="min-w-[80px]">Age:</Label>
                  <span className="text-sm">{targetAudience.demographics.age}</span>
                </div>
              )}
              {targetAudience.demographics.gender && (
                <div className="flex items-center gap-2">
                  <Label className="min-w-[80px]">Gender:</Label>
                  <span className="text-sm">{targetAudience.demographics.gender}</span>
                </div>
              )}
              {targetAudience.demographics.location && (
                <div className="flex items-center gap-2">
                  <Label className="min-w-[80px]">Location:</Label>
                  <span className="text-sm">{targetAudience.demographics.location}</span>
                </div>
              )}
              {targetAudience.demographics.interests &&
                targetAudience.demographics.interests.length > 0 && (
                  <div className="space-y-2">
                    <Label>Interests:</Label>
                    <div className="flex flex-wrap gap-2">
                      {targetAudience.demographics.interests.map((interest, index) => (
                        <Badge key={index} variant="secondary">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>
        )}

        {targetAudience.psychographics && (
          <div className="space-y-4">
            <h4 className="font-semibold text-base">Psychographics</h4>
            {targetAudience.psychographics.values &&
              targetAudience.psychographics.values.length > 0 && (
                <div className="space-y-2">
                  <Label>Values:</Label>
                  <div className="flex flex-wrap gap-2">
                    {targetAudience.psychographics.values.map((value, index) => (
                      <Badge key={index} variant="outline">
                        {value}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            {targetAudience.psychographics.behaviors &&
              targetAudience.psychographics.behaviors.length > 0 && (
                <div className="space-y-2">
                  <Label>Behaviors:</Label>
                  <div className="flex flex-wrap gap-2">
                    {targetAudience.psychographics.behaviors.map((behavior, index) => (
                      <Badge key={index} variant="outline">
                        {behavior}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            {targetAudience.psychographics.painPoints &&
              targetAudience.psychographics.painPoints.length > 0 && (
                <div className="space-y-2">
                  <Label>Pain Points:</Label>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {targetAudience.psychographics.painPoints.map((painPoint, index) => (
                      <li key={index}>{painPoint}</li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
        )}

        {!targetAudience.demographics && !targetAudience.psychographics && (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">No audience information specified</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AudienceSummaryCard;

