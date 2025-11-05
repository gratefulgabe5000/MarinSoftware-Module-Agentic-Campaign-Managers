import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CampaignPlan } from '../types/ai.types';
import { useCampaignStore } from '../store/campaignStore';
import { campaignService } from '../services/campaignService';
import CampaignPlanEditor from './CampaignPlanEditor';

/**
 * CampaignActionButtons Component Props
 */
interface CampaignActionButtonsProps {
  campaignPlan: CampaignPlan;
}

/**
 * CampaignActionButtons Component
 * Provides action buttons for campaign approval, editing, and changes
 */
const CampaignActionButtons: React.FC<CampaignActionButtonsProps> = ({
  campaignPlan,
}) => {
  const [isApproving, setIsApproving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [requestedAction, setRequestedAction] = useState<'approve' | 'edit' | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  const setCampaignPlan = useCampaignStore((state) => state.setCampaignPlan);
  const setLoading = useCampaignStore((state) => state.setLoading);
  const setError = useCampaignStore((state) => state.setError);
  const setCampaign = useCampaignStore((state) => state.setCampaign);
  const addCampaign = useCampaignStore((state) => state.addCampaign);
  const isCampaignPlanValid = useCampaignStore((state) => state.isCampaignPlanValid());
  const navigate = useNavigate();

  /**
   * Handle approve action
   */
  const handleApprove = async () => {
    if (!isCampaignPlanValid) {
      setError('Campaign plan is invalid. Please check all required fields.');
      return;
    }

    setRequestedAction('approve');
    setShowConfirmDialog(true);
  };

  /**
   * Confirm approve action
   */
  const confirmApprove = async () => {
    setIsApproving(true);
    setLoading(true);
    setError(null);
    setShowConfirmDialog(false);

    try {
      // Generate campaign name from plan
      const campaignName = campaignPlan.objective.substring(0, 50) || 'New Campaign';

      // Create campaign via API
      const response = await campaignService.createCampaign({
        campaignPlan,
        name: campaignName,
        description: campaignPlan.objective,
      });

      // Store campaign in store
      const campaign = {
        id: response.campaignId,
        name: campaignName,
        description: campaignPlan.objective,
        campaignPlan,
        status: response.status,
        platformCampaignIds: response.platformCampaignIds,
        createdAt: response.createdAt,
        updatedAt: new Date(),
      };

      setCampaign(campaign);
      addCampaign(campaign);

      // Navigate to campaign detail page
      navigate(`/campaign/${response.campaignId}`);

      // Show success message if there are errors
      if (response.errors && response.errors.length > 0) {
        const errorMessage = response.errors
          .map((e) => `${e.platform}: ${e.error}`)
          .join('\n');
        alert(`Campaign created with some errors:\n${errorMessage}`);
      } else {
        // Success - navigation will handle showing the campaign
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to approve campaign');
      alert(`Failed to create campaign: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsApproving(false);
      setLoading(false);
    }
  };

  /**
   * Handle edit action
   */
  const handleEdit = () => {
    setRequestedAction('edit');
    setShowConfirmDialog(true);
  };

  /**
   * Confirm edit action
   */
  const confirmEdit = () => {
    setShowConfirmDialog(false);
    setShowEditor(true);
    setIsEditing(true);
  };

  /**
   * Handle save edited plan
   */
  const handleSaveEditedPlan = (updatedPlan: CampaignPlan) => {
    setCampaignPlan(updatedPlan);
    setShowEditor(false);
    setIsEditing(false);
    setRequestedAction(null);
  };

  /**
   * Handle cancel edit
   */
  const handleCancelEdit = () => {
    setShowEditor(false);
    setIsEditing(false);
    setRequestedAction(null);
  };

  /**
   * Handle request changes action
   */
  const handleRequestChanges = () => {
    // TODO: Navigate back to conversational interface with context
    // For MVP, this is a placeholder
    console.log('Request changes for campaign plan:', campaignPlan);
    alert('Changes request functionality will be implemented in Phase 4.');
  };

  /**
   * Cancel dialog
   */
  const cancelDialog = () => {
    setShowConfirmDialog(false);
    setRequestedAction(null);
  };

  // If editing, show the editor
  if (showEditor) {
    return (
      <div className="campaign-action-buttons card">
        <CampaignPlanEditor
          campaignPlan={campaignPlan}
          onSave={handleSaveEditedPlan}
          onCancel={handleCancelEdit}
        />
      </div>
    );
  }

  return (
    <div className="campaign-action-buttons card">
      <div className="card-header">
        <h3>Actions</h3>
      </div>
      <div className="card-content">
        <div className="action-buttons-list">
          <button
            className="action-btn action-btn-primary"
            onClick={handleApprove}
            disabled={isApproving || !isCampaignPlanValid}
          >
            {isApproving ? 'Approving...' : 'Approve & Create Campaign'}
          </button>

          <button
            className="action-btn action-btn-secondary"
            onClick={handleEdit}
            disabled={isEditing || isApproving}
          >
            {isEditing ? 'Editing...' : 'Edit Plan'}
          </button>

          <button
            className="action-btn action-btn-tertiary"
            onClick={handleRequestChanges}
          >
            Request Changes
          </button>
        </div>

        {!isCampaignPlanValid && (
          <div className="validation-warning">
            <p>⚠️ Campaign plan is incomplete. Please ensure all required fields are filled.</p>
          </div>
        )}

        {showConfirmDialog && (
          <div className="confirm-dialog-overlay">
            <div className="confirm-dialog">
              <h4>
                {requestedAction === 'approve'
                  ? 'Approve Campaign?'
                  : 'Edit Campaign Plan?'}
              </h4>
              <p>
                {requestedAction === 'approve'
                  ? 'This will create the campaign on all selected platforms. Are you sure?'
                  : 'This will allow you to modify the campaign plan. Continue?'}
              </p>
              <div className="confirm-dialog-buttons">
                <button
                  className="confirm-btn confirm-btn-primary"
                  onClick={requestedAction === 'approve' ? confirmApprove : confirmEdit}
                >
                  Confirm
                </button>
                <button className="confirm-btn confirm-btn-secondary" onClick={cancelDialog}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignActionButtons;

