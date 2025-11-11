import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CampaignPlan } from '../types/ai.types';
import { useCampaignStore } from '../store/campaignStore';
import { campaignService } from '../services/campaignService';
import CampaignPlanEditor from './CampaignPlanEditor';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Alert } from './ui/alert';

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
    } catch (error: unknown) {
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
      <Card>
        <CardContent>
          <CampaignPlanEditor
            campaignPlan={campaignPlan}
            onSave={handleSaveEditedPlan}
            onCancel={handleCancelEdit}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <Button
            onClick={handleApprove}
            disabled={isApproving || !isCampaignPlanValid}
            className="w-full"
          >
            {isApproving ? 'Approving...' : 'Approve & Create Campaign'}
          </Button>

          <Button
            variant="secondary"
            onClick={handleEdit}
            disabled={isEditing || isApproving}
            className="w-full"
          >
            {isEditing ? 'Editing...' : 'Edit Plan'}
          </Button>

          <Button
            variant="outline"
            onClick={handleRequestChanges}
            className="w-full"
          >
            Request Changes
          </Button>
        </div>

        {!isCampaignPlanValid && (
          <Alert variant="destructive" className="mt-2">
            <p className="text-sm">⚠️ Campaign plan is incomplete. Please ensure all required fields are filled.</p>
          </Alert>
        )}

        <Dialog open={showConfirmDialog} onOpenChange={(open) => !open && cancelDialog()}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {requestedAction === 'approve'
                  ? 'Approve Campaign?'
                  : 'Edit Campaign Plan?'}
              </DialogTitle>
              <DialogDescription>
                {requestedAction === 'approve'
                  ? 'This will create the campaign on all selected platforms. Are you sure?'
                  : 'This will allow you to modify the campaign plan. Continue?'}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={cancelDialog}>
                Cancel
              </Button>
              <Button
                onClick={requestedAction === 'approve' ? confirmApprove : confirmEdit}
              >
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default CampaignActionButtons;

