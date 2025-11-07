import React, { useState } from 'react';
import { CampaignPlan } from '../types/ai.types';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { ChevronRightIcon, ChevronDownIcon } from 'lucide-react';

/**
 * AdGroupStructureTree Component Props
 */
interface AdGroupStructureTreeProps {
  campaignPlan: CampaignPlan;
}

/**
 * AdGroupStructureTree Component
 * Displays ad group structure in a tree view
 */
const AdGroupStructureTree: React.FC<AdGroupStructureTreeProps> = ({
  campaignPlan,
}) => {
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());

  const toggleGroup = (index: number) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  if (!campaignPlan.adGroups || campaignPlan.adGroups.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ad Group Structure</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">No ad groups defined yet. They will be created during campaign setup.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Ad Group Structure</CardTitle>
          <Badge variant="secondary">{campaignPlan.adGroups.length} ad groups</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {campaignPlan.adGroups.map((adGroup, index) => {
            const isExpanded = expandedGroups.has(index);
            return (
              <div key={index} className="border rounded-lg overflow-hidden">
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleGroup(index)}
                >
                  <div className="flex items-center gap-2 flex-1">
                    {isExpanded ? (
                      <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="font-medium">{adGroup.name}</span>
                  </div>
                  <span className="text-sm font-semibold">
                    {campaignPlan.budget.currency} {adGroup.budget.toLocaleString()}
                  </span>
                </div>
                {isExpanded && (
                  <div className="border-t bg-muted/20 p-4 space-y-4">
                    <div className="space-y-2">
                      <Label>Objective:</Label>
                      <p className="text-sm">{adGroup.objective}</p>
                    </div>
                    {adGroup.targeting && (
                      <>
                        {adGroup.targeting.interests &&
                          adGroup.targeting.interests.length > 0 && (
                            <div className="space-y-2">
                              <Label>Interests:</Label>
                              <div className="flex flex-wrap gap-2">
                                {adGroup.targeting.interests.map((interest, i) => (
                                  <Badge key={i} variant="outline">
                                    {interest}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        {adGroup.targeting.behaviors &&
                          adGroup.targeting.behaviors.length > 0 && (
                            <div className="space-y-2">
                              <Label>Behaviors:</Label>
                              <div className="flex flex-wrap gap-2">
                                {adGroup.targeting.behaviors.map((behavior, i) => (
                                  <Badge key={i} variant="outline">
                                    {behavior}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                      </>
                    )}
                    {adGroup.adFormats && adGroup.adFormats.length > 0 && (
                      <div className="space-y-2">
                        <Label>Ad Formats:</Label>
                        <div className="flex flex-wrap gap-2">
                          {adGroup.adFormats.map((format, i) => (
                            <Badge key={i} variant="secondary">
                              {format}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdGroupStructureTree;

