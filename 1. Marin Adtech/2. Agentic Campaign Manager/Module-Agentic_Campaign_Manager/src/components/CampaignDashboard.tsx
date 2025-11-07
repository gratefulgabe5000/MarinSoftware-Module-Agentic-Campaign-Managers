import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCampaignStore } from '../store/campaignStore';
import { campaignService } from '../services/campaignService';
import { toastService } from '../utils/toastService';
import { Campaign } from '../types/campaign.types';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { PlusIcon, UploadIcon, Loader2Icon, TrashIcon, BarChart3Icon, EyeIcon, AlertCircleIcon } from 'lucide-react';

/**
 * Campaign Dashboard Component
 * Displays list of campaigns and provides navigation
 */
const CampaignDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const storeCampaigns = useCampaignStore((state) => state.campaigns);
  const setCampaignsStore = useCampaignStore((state) => state.setCampaigns);
  const removeCampaign = useCampaignStore((state) => state.removeCampaign);
  const initializeCampaigns = useCampaignStore((state) => state.initializeCampaigns);
  const isInitialized = useCampaignStore((state) => state.isInitialized);
  const [deletingCampaignId, setDeletingCampaignId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadCampaigns();
  }, []);

  // Update campaigns when store changes - always sync with store
  useEffect(() => {
    console.log('📊 [CampaignDashboard] Store campaigns updated:', {
      count: storeCampaigns.length,
      campaigns: storeCampaigns,
      isInitialized
    });
    setCampaigns(storeCampaigns);
  }, [storeCampaigns]);

  const loadCampaigns = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🔄 [CampaignDashboard] Loading campaigns...', {
        isInitialized,
        storeCampaigns: storeCampaigns.length
      });

      // Initialize campaigns from IndexedDB if not already done
      if (!isInitialized) {
        console.log('🔄 [CampaignDashboard] Initializing from IndexedDB...');
        await initializeCampaigns();
      }

      console.log('✅ [CampaignDashboard] Campaigns loaded:', {
        count: storeCampaigns.length,
        campaigns: storeCampaigns
      });

      // Campaigns are now loaded from IndexedDB into the store
      // The useEffect above will sync them to local state
      setIsLoading(false);
    } catch (error) {
      console.error('❌ [CampaignDashboard] Error loading campaigns:', error);
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to load campaigns'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'active':
        return 'default';
      case 'paused':
        return 'secondary';
      case 'creating':
        return 'outline';
      case 'error':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = (status: string): string => {
    return status
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  /**
   * Handle delete campaign
   */
  const handleDeleteClick = (campaignId: string) => {
    setShowDeleteConfirm(campaignId);
  };

  /**
   * Confirm delete campaign
   */
  const handleConfirmDelete = async (campaignId: string) => {
    try {
      setDeletingCampaignId(campaignId);
      setShowDeleteConfirm(null);

      // Delete campaign via API
      await campaignService.deleteCampaign(campaignId);

      // Remove from store
      removeCampaign(campaignId);

      // Update local state
      setCampaigns(campaigns.filter((campaign) => campaign.id !== campaignId));

      // Show success message
      toastService.success('Campaign deleted successfully');
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toastService.error(
        error instanceof Error ? error.message : 'Failed to delete campaign'
      );
    } finally {
      setDeletingCampaignId(null);
    }
  };

  /**
   * Cancel delete confirmation
   */
  const handleCancelDelete = () => {
    setShowDeleteConfirm(null);
  };

  console.log('🎨 [CampaignDashboard] Render state:', {
    isLoading,
    campaignsCount: campaigns.length,
    campaigns,
    storeCampaignsCount: storeCampaigns.length,
    isInitialized
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="flex flex-col items-center justify-center gap-4 py-12">
          <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading campaigns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Campaign Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Manage and monitor your advertising campaigns
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate('/campaigns/csv-upload')}
              type="button"
            >
              <UploadIcon className="h-4 w-4" />
              Bulk Generate
            </Button>
            <Button
              onClick={() => navigate('/create')}
              type="button"
            >
              <PlusIcon className="h-4 w-4" />
              Create Campaign
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={loadCampaigns}
                type="button"
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Empty State */}
        {campaigns.length === 0 ? (
          <Card className="py-12">
            <CardContent className="flex flex-col items-center justify-center gap-4 text-center">
              <div className="rounded-full bg-muted p-4">
                <BarChart3Icon className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">No campaigns found</h3>
                <p className="text-muted-foreground mt-1">
                  Create your first campaign to get started!
                </p>
              </div>
              <Button onClick={() => navigate('/create')} type="button">
                <PlusIcon className="h-4 w-4" />
                Create New Campaign
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Your Campaigns</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {campaigns.map((campaign) => (
                <Card key={campaign.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <CardTitle className="line-clamp-1">{campaign.name}</CardTitle>
                      <Badge variant={getStatusVariant(campaign.status)}>
                        {getStatusLabel(campaign.status)}
                      </Badge>
                    </div>
                    {campaign.description && (
                      <CardDescription className="line-clamp-2">
                        {campaign.description}
                      </CardDescription>
                    )}
                  </CardHeader>

                  <CardContent className="flex-1 space-y-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Platforms:</span>
                        <span className="font-medium">
                          {campaign.campaignPlan.platforms.join(', ')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Budget:</span>
                        <span className="font-medium">
                          {campaign.campaignPlan.budget.currency}{' '}
                          {campaign.campaignPlan.budget.total.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Created:</span>
                        <span className="font-medium">
                          {new Date(campaign.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="flex-1"
                    >
                      <Link to={`/campaign/${campaign.id}`}>
                        <EyeIcon className="h-4 w-4" />
                        Details
                      </Link>
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      asChild
                      className="flex-1"
                    >
                      <Link to={`/campaign/${campaign.id}/performance`}>
                        <BarChart3Icon className="h-4 w-4" />
                        Performance
                      </Link>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteClick(campaign.id)}
                      disabled={deletingCampaignId === campaign.id}
                      type="button"
                    >
                      {deletingCampaignId === campaign.id ? (
                        <Loader2Icon className="h-4 w-4 animate-spin" />
                      ) : (
                        <TrashIcon className="h-4 w-4" />
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!showDeleteConfirm} onOpenChange={(open) => !open && handleCancelDelete()}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Campaign?</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{campaigns.find((c) => c.id === showDeleteConfirm)?.name}"?
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={handleCancelDelete}
                type="button"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => showDeleteConfirm && handleConfirmDelete(showDeleteConfirm)}
                type="button"
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CampaignDashboard;
