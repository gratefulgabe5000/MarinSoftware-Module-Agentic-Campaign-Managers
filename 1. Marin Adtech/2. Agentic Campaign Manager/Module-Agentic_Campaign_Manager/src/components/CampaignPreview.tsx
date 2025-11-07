import React from 'react';
import { useCampaignStore } from '../store/campaignStore';
import CampaignOverviewCard from './CampaignOverviewCard';
import BudgetBreakdown from './BudgetBreakdown';
import AudienceSummaryCard from './AudienceSummaryCard';
import AdGroupStructureTree from './AdGroupStructureTree';
import PerformanceEstimatesCard from './PerformanceEstimatesCard';
import CampaignActionButtons from './CampaignActionButtons';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import LoadingSpinner from './LoadingSpinner';
import { AlertCircleIcon } from 'lucide-react';

/**
 * CampaignPreview Component
 * Main container for displaying campaign plan preview
 */
const CampaignPreview: React.FC = () => {
  const campaignPlan = useCampaignStore((state) => state.currentCampaignPlan);
  const isMockData = useCampaignStore((state) => state.currentCampaignPlanIsMock);
  const isLoading = useCampaignStore((state) => state.isLoading);
  const error = useCampaignStore((state) => state.error);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="mx-auto max-w-3xl">
          <Alert variant="destructive">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!campaignPlan) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="mx-auto max-w-3xl text-center space-y-4">
          <h2 className="text-2xl font-bold">No Campaign Plan</h2>
          <p className="text-muted-foreground">Create a campaign plan through the conversational interface first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-3xl font-bold tracking-tight">Campaign Preview</h2>
            {isMockData && (
              <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20">
                <span className="mr-1">⚠️</span>
                Mock Data - Simulated Response
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">Review your campaign plan before creating it</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
          <div className="space-y-6">
            <CampaignOverviewCard campaignPlan={campaignPlan} />
            <BudgetBreakdown campaignPlan={campaignPlan} />
            <AudienceSummaryCard campaignPlan={campaignPlan} />
            <AdGroupStructureTree campaignPlan={campaignPlan} />
            <PerformanceEstimatesCard campaignPlan={campaignPlan} />
          </div>

          <div className="lg:sticky lg:top-8 h-fit">
            <CampaignActionButtons campaignPlan={campaignPlan} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignPreview;

