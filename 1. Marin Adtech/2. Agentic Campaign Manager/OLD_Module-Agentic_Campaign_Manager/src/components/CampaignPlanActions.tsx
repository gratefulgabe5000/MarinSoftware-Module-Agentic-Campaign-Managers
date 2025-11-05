import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCampaignStore } from '../store/campaignStore';
import { campaignService } from '../services/campaignService';
import { toastService } from '../utils/toastService';

/**
 * Campaign Plan Actions Props
 */
interface CampaignPlanActionsProps {
  campaignPlanId?: string;
}

/**
 * Campaign Plan Actions Component
 * Action buttons for viewing preview and creating campaign
 */
const CampaignPlanActions: React.FC<CampaignPlanActionsProps> = () => {
  const navigate = useNavigate();
  const campaignPlan = useCampaignStore((state) => state.currentCampaignPlan);
  const setLoading = useCampaignStore((state) => state.setLoading);
  const setError = useCampaignStore((state) => state.setError);
  const addCampaign = useCampaignStore((state) => state.addCampaign);
  const setCampaign = useCampaignStore((state) => state.setCampaign);
  const isLoading = useCampaignStore((state) => state.isLoading);

  /**
   * Handle view preview
   */
  const handleViewPreview = () => {
    if (!campaignPlan) {
      toastService.error('No campaign plan available');
      return;
    }
    // Navigate to preview page
    navigate('/preview');
  };

  /**
   * Handle create campaign
   */
  const handleCreateCampaign = async () => {
    if (!campaignPlan) {
      toastService.error('No campaign plan available');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Create campaign from plan
      const campaign = await campaignService.createCampaign({
        name: `Campaign - ${campaignPlan.objective.substring(0, 50)}`,
        description: `Campaign for ${campaignPlan.objective}`,
        objective: campaignPlan.objective,
        campaignPlan,
      });

      // Add to store
      addCampaign(campaign);
      setCampaign(campaign);

      // Show success message
      toastService.success('Campaign created successfully!');

      // Navigate to campaign detail page
      navigate(`/campaign/${campaign.id}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create campaign';
      setError(errorMessage);
      toastService.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!campaignPlan) {
    return null;
  }

  return (
    <div className="campaign-plan-actions">
      <button
        className="btn btn-secondary"
        onClick={handleViewPreview}
        type="button"
        disabled={isLoading}
      >
        📋 View Preview
      </button>
      <button
        className="btn btn-primary"
        onClick={handleCreateCampaign}
        type="button"
        disabled={isLoading}
      >
        {isLoading ? 'Creating...' : '✅ Create Campaign'}
      </button>
    </div>
  );
};

export default CampaignPlanActions;

