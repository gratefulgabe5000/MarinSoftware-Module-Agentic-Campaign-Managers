import React from 'react';
import { useCampaignStore } from '../store/campaignStore';
import CampaignOverviewCard from './CampaignOverviewCard';
import BudgetBreakdown from './BudgetBreakdown';
import AudienceSummaryCard from './AudienceSummaryCard';
import AdGroupStructureTree from './AdGroupStructureTree';
import PerformanceEstimatesCard from './PerformanceEstimatesCard';
import CampaignActionButtons from './CampaignActionButtons';

/**
 * CampaignPreview Component
 * Main container for displaying campaign plan preview
 */
const CampaignPreview: React.FC = () => {
  const campaignPlan = useCampaignStore((state) => state.currentCampaignPlan);
  const isLoading = useCampaignStore((state) => state.isLoading);
  const error = useCampaignStore((state) => state.error);

  if (isLoading) {
    return (
      <div className="campaign-preview loading">
        <div className="loading-spinner">Loading campaign preview...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="campaign-preview error">
        <div className="error-message">
          <span>⚠️ {error}</span>
        </div>
      </div>
    );
  }

  if (!campaignPlan) {
    return (
      <div className="campaign-preview empty">
        <div className="empty-state">
          <h2>No Campaign Plan</h2>
          <p>Create a campaign plan through the conversational interface first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="campaign-preview">
      <div className="campaign-preview-header">
        <h2>Campaign Preview</h2>
        <p>Review your campaign plan before creating it</p>
      </div>

      <div className="campaign-preview-content">
        <div className="campaign-preview-grid">
          <div className="campaign-preview-main">
            <CampaignOverviewCard campaignPlan={campaignPlan} />
            <BudgetBreakdown campaignPlan={campaignPlan} />
            <AudienceSummaryCard campaignPlan={campaignPlan} />
            <AdGroupStructureTree campaignPlan={campaignPlan} />
            <PerformanceEstimatesCard campaignPlan={campaignPlan} />
          </div>

          <div className="campaign-preview-sidebar">
            <CampaignActionButtons campaignPlan={campaignPlan} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignPreview;

