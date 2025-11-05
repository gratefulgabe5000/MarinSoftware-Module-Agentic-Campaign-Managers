import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Campaign, CampaignStatus } from '../types/campaign.types';
import { campaignService } from '../services/campaignService';
import { useCampaignStore } from '../store/campaignStore';

/**
 * CampaignActions Component Props
 */
interface CampaignActionsProps {
  campaign: Campaign;
  onUpdate?: (campaign: Campaign) => void;
}

/**
 * CampaignActions Component
 * Provides action buttons for campaign management (pause, resume, delete)
 */
const CampaignActions: React.FC<CampaignActionsProps> = ({
  campaign,
  onUpdate,
}) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
<<<<<<< HEAD
  const [actionType, setActionType] = useState<'activate' | 'pause' | 'resume' | 'delete' | null>(null);
=======
  const [actionType, setActionType] = useState<'pause' | 'resume' | 'delete' | null>(null);
>>>>>>> c75a29246aa4d3b02efa0ae3553d6040d682d314

  const updateCampaign = useCampaignStore((state) => state.updateCampaign);
  const setCampaign = useCampaignStore((state) => state.setCampaign);

  /**
<<<<<<< HEAD
   * Handle activate action
   */
  const handleActivate = () => {
    setActionType('activate');
    setShowConfirmDialog(true);
  };

  /**
=======
>>>>>>> c75a29246aa4d3b02efa0ae3553d6040d682d314
   * Handle pause action
   */
  const handlePause = () => {
    setActionType('pause');
    setShowConfirmDialog(true);
  };

  /**
   * Handle resume action
   */
  const handleResume = () => {
    setActionType('resume');
    setShowConfirmDialog(true);
  };

  /**
   * Handle delete action
   */
  const handleDelete = () => {
    setActionType('delete');
    setShowConfirmDialog(true);
  };

  /**
   * Confirm action
   */
  const confirmAction = async () => {
    if (!actionType) return;

    setIsLoading(true);
    setError(null);
    setShowConfirmDialog(false);

    try {
<<<<<<< HEAD
      if (actionType === 'activate') {
        // Activate campaign (update status to active)
        const updatedCampaign = await campaignService.updateCampaign(campaign.id, {
          status: 'active',
        });

        // Update campaign in store (use the returned campaign object)
        updateCampaign(campaign.id, {
          status: updatedCampaign.status,
          updatedAt: updatedCampaign.updatedAt,
        });
        setCampaign(updatedCampaign);

        if (onUpdate) {
          onUpdate(updatedCampaign);
        }
      } else if (actionType === 'pause') {
=======
      if (actionType === 'pause') {
>>>>>>> c75a29246aa4d3b02efa0ae3553d6040d682d314
        // Pause campaign
        await campaignService.pauseCampaign(campaign.id);

        // Update campaign in store
        const updatedCampaign = {
          ...campaign,
          status: 'paused' as CampaignStatus,
          updatedAt: new Date(),
        };
        updateCampaign(campaign.id, updatedCampaign);
        setCampaign(updatedCampaign);

        if (onUpdate) {
          onUpdate(updatedCampaign);
        }
      } else if (actionType === 'resume') {
        // Resume campaign
        await campaignService.resumeCampaign(campaign.id);

        // Update campaign in store
        const updatedCampaign = {
          ...campaign,
          status: 'active' as CampaignStatus,
          updatedAt: new Date(),
        };
        updateCampaign(campaign.id, updatedCampaign);
        setCampaign(updatedCampaign);

        if (onUpdate) {
          onUpdate(updatedCampaign);
        }
      } else if (actionType === 'delete') {
        // Delete campaign
        await campaignService.deleteCampaign(campaign.id);

        // Navigate to dashboard
        navigate('/');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to perform action');
      alert(`Failed to ${actionType} campaign: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
      setActionType(null);
    }
  };

  /**
   * Cancel action
   */
  const cancelAction = () => {
    setShowConfirmDialog(false);
    setActionType(null);
  };

  /**
   * Get action confirmation message
   */
  const getConfirmMessage = (): string => {
    switch (actionType) {
<<<<<<< HEAD
      case 'activate':
        return `Are you sure you want to activate "${campaign.name}"? This will publish the campaign and start serving ads.`;
=======
>>>>>>> c75a29246aa4d3b02efa0ae3553d6040d682d314
      case 'pause':
        return `Are you sure you want to pause "${campaign.name}"?`;
      case 'resume':
        return `Are you sure you want to resume "${campaign.name}"?`;
      case 'delete':
        return `Are you sure you want to delete "${campaign.name}"? This action cannot be undone.`;
      default:
        return '';
    }
  };

  /**
<<<<<<< HEAD
   * Check if activate is available
   */
  const canActivate = (): boolean => {
    return campaign.status === 'draft' || campaign.status === 'approved';
  };

  /**
=======
>>>>>>> c75a29246aa4d3b02efa0ae3553d6040d682d314
   * Check if pause is available
   */
  const canPause = (): boolean => {
    return campaign.status === 'active' || campaign.status === 'creating';
  };

  /**
   * Check if resume is available
   */
  const canResume = (): boolean => {
    return campaign.status === 'paused';
  };

  /**
   * Check if delete is available
   */
  const canDelete = (): boolean => {
    return campaign.status !== 'deleted';
  };

  return (
    <div className="campaign-actions">
      {error && (
        <div className="error-message">
          <span>⚠️ {error}</span>
        </div>
      )}

      <div className="actions-buttons">
<<<<<<< HEAD
        {canActivate() && (
          <button
            className="action-btn activate-btn"
            onClick={handleActivate}
            disabled={isLoading}
          >
            {isLoading && actionType === 'activate' ? 'Activating...' : '▶️ Activate Campaign'}
          </button>
        )}

=======
>>>>>>> c75a29246aa4d3b02efa0ae3553d6040d682d314
        {canPause() && (
          <button
            className="action-btn pause-btn"
            onClick={handlePause}
            disabled={isLoading}
          >
            {isLoading && actionType === 'pause' ? 'Pausing...' : '⏸️ Pause Campaign'}
          </button>
        )}

        {canResume() && (
          <button
            className="action-btn resume-btn"
            onClick={handleResume}
            disabled={isLoading}
          >
            {isLoading && actionType === 'resume' ? 'Resuming...' : '▶️ Resume Campaign'}
          </button>
        )}

        {canDelete() && (
          <button
            className="action-btn delete-btn"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading && actionType === 'delete' ? 'Deleting...' : '🗑️ Delete Campaign'}
          </button>
        )}
      </div>

      {showConfirmDialog && (
        <div className="confirm-dialog-overlay">
          <div className="confirm-dialog">
            <div className="confirm-dialog-header">
              <h3>Confirm Action</h3>
            </div>
            <div className="confirm-dialog-content">
              <p>{getConfirmMessage()}</p>
            </div>
            <div className="confirm-dialog-actions">
              <button
                className="confirm-btn"
                onClick={confirmAction}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Confirm'}
              </button>
              <button
                className="cancel-btn"
                onClick={cancelAction}
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignActions;

