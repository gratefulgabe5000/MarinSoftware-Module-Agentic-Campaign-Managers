import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Campaign, CampaignStatus } from '../types/campaign.types';
import { campaignService } from '../services/campaignService';
import { useCampaignStore } from '../store/campaignStore';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { PlayCircleIcon, PauseCircleIcon, Trash2Icon, Loader2Icon, AlertCircleIcon } from 'lucide-react';

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
  const [actionType, setActionType] = useState<'activate' | 'pause' | 'resume' | 'delete' | null>(null);

  const updateCampaign = useCampaignStore((state) => state.updateCampaign);
  const setCampaign = useCampaignStore((state) => state.setCampaign);

  /**
   * Handle activate action
   */
  const handleActivate = () => {
    setActionType('activate');
    setShowConfirmDialog(true);
  };

  /**
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
      if (actionType === 'activate') {
        // Activate campaign (update status to active)
        const updatedCampaign = await campaignService.updateCampaign(campaign.id, {
          status: 'active',
        });

        // Update campaign in store
        updateCampaign(campaign.id, updatedCampaign);
        setCampaign(updatedCampaign);

        if (onUpdate) {
          onUpdate(updatedCampaign);
        }
      } else if (actionType === 'pause') {
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
        navigate('/campaigns');
      }
    } catch (error) {
      console.error('Error performing campaign action:', error);
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
      case 'activate':
        return `Are you sure you want to activate "${campaign.name}"? This will publish the campaign and start serving ads.`;
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
   * Check if activate is available
   */
  const canActivate = (): boolean => {
    return campaign.status === 'draft' || campaign.status === 'approved';
  };

  /**
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
    return true;
  };

  return (
    <div className="space-y-4">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircleIcon className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        {canActivate() && (
          <Button
            onClick={handleActivate}
            disabled={isLoading}
            variant="default"
            type="button"
          >
            {isLoading && actionType === 'activate' ? (
              <>
                <Loader2Icon className="h-4 w-4 animate-spin" />
                Activating...
              </>
            ) : (
              <>
                <PlayCircleIcon className="h-4 w-4" />
                Activate Campaign
              </>
            )}
          </Button>
        )}

        {canPause() && (
          <Button
            onClick={handlePause}
            disabled={isLoading}
            variant="secondary"
            type="button"
          >
            {isLoading && actionType === 'pause' ? (
              <>
                <Loader2Icon className="h-4 w-4 animate-spin" />
                Pausing...
              </>
            ) : (
              <>
                <PauseCircleIcon className="h-4 w-4" />
                Pause Campaign
              </>
            )}
          </Button>
        )}

        {canResume() && (
          <Button
            onClick={handleResume}
            disabled={isLoading}
            variant="default"
            type="button"
          >
            {isLoading && actionType === 'resume' ? (
              <>
                <Loader2Icon className="h-4 w-4 animate-spin" />
                Resuming...
              </>
            ) : (
              <>
                <PlayCircleIcon className="h-4 w-4" />
                Resume Campaign
              </>
            )}
          </Button>
        )}

        {canDelete() && (
          <Button
            onClick={handleDelete}
            disabled={isLoading}
            variant="destructive"
            type="button"
          >
            {isLoading && actionType === 'delete' ? (
              <>
                <Loader2Icon className="h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2Icon className="h-4 w-4" />
                Delete Campaign
              </>
            )}
          </Button>
        )}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={(open) => !open && cancelAction()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogDescription>{getConfirmMessage()}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={cancelAction}
              disabled={isLoading}
              type="button"
            >
              Cancel
            </Button>
            <Button
              variant={actionType === 'delete' ? 'destructive' : 'default'}
              onClick={confirmAction}
              disabled={isLoading}
              type="button"
            >
              {isLoading ? (
                <>
                  <Loader2Icon className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Confirm'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CampaignActions;

