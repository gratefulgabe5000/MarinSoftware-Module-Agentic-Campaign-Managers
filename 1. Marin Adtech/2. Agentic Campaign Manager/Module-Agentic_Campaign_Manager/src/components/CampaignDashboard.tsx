import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCampaignStore } from '../store/campaignStore';
import { campaignService } from '../services/campaignService';
import { statusService } from '../services/statusService';
import { toastService } from '../utils/toastService';
import { Campaign, CampaignStatus } from '../types/campaign.types';
import { CampaignStatus as StatusEnum } from '../types/status.types';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { PlusIcon, UploadIcon, Loader2Icon, TrashIcon, BarChart3Icon, EyeIcon, AlertCircleIcon, FilterIcon, XIcon, HashIcon, FolderIcon, RefreshCwIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';

/**
 * Campaign Dashboard Component
 * Displays list of campaigns and provides navigation
 */
const CampaignDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | 'all'>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string | 'all'>('all');
  const [showBatchDeleteConfirm, setShowBatchDeleteConfirm] = useState(false);
  const [newTagInput, setNewTagInput] = useState<Record<string, string>>({});
  const [isUpdatingTags, setIsUpdatingTags] = useState<Record<string, boolean>>({});

  const storeCampaigns = useCampaignStore((state) => state.campaigns);
  const removeCampaign = useCampaignStore((state) => state.removeCampaign);
  const updateCampaignStore = useCampaignStore((state) => state.updateCampaign);
  const setStoreCampaigns = useCampaignStore((state) => state.setCampaigns);
  const initializeCampaigns = useCampaignStore((state) => state.initializeCampaigns);
  const isInitialized = useCampaignStore((state) => state.isInitialized);
  const [deletingCampaignId, setDeletingCampaignId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  useEffect(() => {
    loadCampaigns();
  }, []);

  // Update campaigns when store changes - always sync with store
  useEffect(() => {
    setCampaigns(storeCampaigns);
  }, [storeCampaigns]);

  const loadCampaigns = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Initialize campaigns from IndexedDB if not already done
      if (!isInitialized) {
        await initializeCampaigns();
      }

      // Campaigns are now loaded from IndexedDB into the store
      // The useEffect above will sync them to local state
      setIsLoading(false);

      // Sync campaign statuses with backend (don't block on this)
      syncCampaignStatuses();
    } catch (error) {
      console.error('Error loading campaigns:', error);
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to load campaigns'
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Map StatusEnum to CampaignStatus
   */
  const mapStatusToCampaignStatus = (status: StatusEnum): CampaignStatus => {
    const statusMap: Record<StatusEnum, CampaignStatus> = {
      [StatusEnum.DRAFT]: 'draft',
      [StatusEnum.CREATING]: 'creating',
      [StatusEnum.PENDING_APPROVAL]: 'pending_approval',
      [StatusEnum.APPROVED]: 'approved',
      [StatusEnum.ACTIVE]: 'active',
      [StatusEnum.PAUSED]: 'paused',
      [StatusEnum.COMPLETED]: 'completed',
      [StatusEnum.ARCHIVED]: 'archived',
      [StatusEnum.ERROR]: 'error',
    };
    return statusMap[status] || 'draft';
  };

  /**
   * Sync campaign statuses with backend
   */
  const syncCampaignStatuses = async () => {
    // Get all campaigns from store
    const campaignsToSync = storeCampaigns;

    // Fetch status for each campaign
    for (const campaign of campaignsToSync) {
      try {
        const statusUpdate = await statusService.getCampaignStatus(campaign.id);

        const campaignStatus = mapStatusToCampaignStatus(statusUpdate.status);

        // Only update if status has changed
        if (campaign.status !== campaignStatus) {
          updateCampaignStore(campaign.id, { status: campaignStatus });
        }
      } catch (error) {
        console.error(`Failed to sync status for campaign ${campaign.id}:`, error);
        // Continue with other campaigns even if one fails
      }
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
   * Handle sync campaigns from Zilkr Dispatcher
   */
  const handleSyncCampaigns = async () => {
    try {
      setIsSyncing(true);
      setSyncError(null);

      // Call the sync endpoint
      const syncedCampaigns = await campaignService.syncCampaigns();

      // Update the store with synced campaigns
      // Merge with existing campaigns (avoid duplicates by ID)
      const existingCampaignIds = new Set(storeCampaigns.map(c => c.id));
      const newCampaigns = syncedCampaigns.filter(c => !existingCampaignIds.has(c.id));
      const mergedCampaigns = [...storeCampaigns, ...newCampaigns];

      // Update campaigns in store
      setStoreCampaigns(mergedCampaigns);

      // Show success message
      toastService.success(
        `Synced ${syncedCampaigns.length} campaign(s) from Zilkr Dispatcher`,
        `${newCampaigns.length} new campaign(s) added`
      );
    } catch (error) {
      console.error('Error syncing campaigns:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to sync campaigns from Zilkr Dispatcher';
      setSyncError(errorMessage);
      toastService.error('Sync Failed', errorMessage);
    } finally {
      setIsSyncing(false);
    }
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

  /**
   * Handle tag update for a campaign
   */
  const handleTagUpdate = async (campaignId: string, tags: string[]) => {
    try {
      setIsUpdatingTags(prev => ({ ...prev, [campaignId]: true }));
      
      // Update via API
      await campaignService.updateCampaign(campaignId, {
        metadata: { tags }
      });
      
      // Update store
      updateCampaignStore(campaignId, {
        metadata: { tags }
      });
      
      toastService.success('Tags updated successfully');
    } catch (error) {
      console.error('Error updating tags:', error);
      toastService.error(
        error instanceof Error ? error.message : 'Failed to update tags'
      );
    } finally {
      setIsUpdatingTags(prev => ({ ...prev, [campaignId]: false }));
    }
  };

  /**
   * Handle adding a new tag to a campaign
   */
  const handleAddTag = (campaignId: string, tag: string) => {
    const trimmedTag = tag.trim();
    if (!trimmedTag) return;

    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) return;

    const currentTags = campaign.metadata?.tags || [];
    if (currentTags.includes(trimmedTag)) {
      toastService.error('Tag already exists');
      return;
    }

    handleTagUpdate(campaignId, [...currentTags, trimmedTag]);
    setNewTagInput(prev => ({ ...prev, [campaignId]: '' }));
  };

  /**
   * Handle removing a tag from a campaign
   */
  const handleRemoveTag = (campaignId: string, tagToRemove: string) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) return;

    const currentTags = campaign.metadata?.tags || [];
    const newTags = currentTags.filter(tag => tag !== tagToRemove);
    handleTagUpdate(campaignId, newTags);
  };

  /**
   * Handle batch delete
   */
  const handleBatchDelete = async () => {
    try {
      const campaignIds = filteredCampaigns.map(c => c.id);
      setDeletingCampaignId('batch'); // Use special ID for batch
      
      // Delete campaigns in parallel
      await Promise.all(
        campaignIds.map(id => campaignService.deleteCampaign(id))
      );
      
      // Remove from store
      campaignIds.forEach(id => removeCampaign(id));
      
      // Update local state
      setCampaigns(campaigns.filter(c => !campaignIds.includes(c.id)));
      
      toastService.success(`Deleted ${campaignIds.length} campaign(s)`);
      setShowBatchDeleteConfirm(false);
      setSelectedTags([]);
      setCategoryFilter('all');
      setStatusFilter('all');
    } catch (error) {
      console.error('Error deleting campaigns:', error);
      toastService.error(
        error instanceof Error ? error.message : 'Failed to delete campaigns'
      );
    } finally {
      setDeletingCampaignId(null);
    }
  };

  /**
   * Helper function to extract product category from campaign
   * Defined as useCallback to ensure stable reference
   */
  const getCampaignCategory = useCallback((campaign: Campaign): string => {
    try {
      // Try to get from campaignPlan.targetAudience.demographics.interests (primary source)
      const interests = campaign?.campaignPlan?.targetAudience?.demographics?.interests;
      if (interests && Array.isArray(interests) && interests.length > 0) {
        // Category is typically the first interest
        const category = interests[0];
        if (category && typeof category === 'string' && category !== 'general') {
          return category;
        }
      }
      
      // Fall back to metadata.tags
      const tags = campaign?.metadata?.tags;
      if (tags && Array.isArray(tags) && tags.length > 0) {
        // Check if any tag looks like a category (not 'auto-generated', 'general', or empty)
        const categoryTag = tags.find(tag => 
          tag && 
          typeof tag === 'string' &&
          tag.trim() && 
          tag !== 'auto-generated' && 
          tag !== 'general'
        );
        if (categoryTag) {
          return categoryTag.trim();
        }
      }
    } catch (error) {
      console.error('Error extracting category from campaign:', error);
    }
    
    // Default to 'Uncategorized' if no category found
    return 'Uncategorized';
  }, []);

  /**
   * Get all unique tags from campaigns
   */
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    campaigns.forEach(campaign => {
      campaign.metadata?.tags?.forEach(tag => {
        if (tag && tag.trim()) {
          tagSet.add(tag.trim());
        }
      });
    });
    return Array.from(tagSet).sort();
  }, [campaigns]);

  /**
   * Get all unique categories from campaigns
   */
  const allCategories = useMemo(() => {
    const categorySet = new Set<string>();
    campaigns.forEach(campaign => {
      // Extract category inline to avoid dependency issues
      const interests = campaign.campaignPlan?.targetAudience?.demographics?.interests;
      let category: string | undefined;
      
      if (interests && interests.length > 0) {
        const cat = interests[0];
        if (cat && cat !== 'general') {
          category = cat;
        }
      }
      
      if (!category) {
        const tags = campaign.metadata?.tags;
        if (tags && tags.length > 0) {
          const categoryTag = tags.find(tag => 
            tag && 
            tag.trim() && 
            tag !== 'auto-generated' && 
            tag !== 'general'
          );
          if (categoryTag) {
            category = categoryTag.trim();
          }
        }
      }
      
      categorySet.add(category || 'Uncategorized');
    });
    return Array.from(categorySet).sort();
  }, [campaigns]);

  /**
   * Filter campaigns by status, tags, AND category
   */
  const filteredCampaigns = useMemo(() => {
    let filtered = campaigns;
    
    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c && c.status === statusFilter);
    }
    
    // Filter by tags (campaign must have ALL selected tags)
    if (selectedTags.length > 0) {
      filtered = filtered.filter(campaign => {
        if (!campaign) return false;
        const campaignTags = campaign.metadata?.tags || [];
        return selectedTags.every(tag => campaignTags.includes(tag));
      });
    }
    
    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(campaign => {
        if (!campaign) return false;
        try {
          const campaignCategory = getCampaignCategory(campaign);
          return campaignCategory === categoryFilter;
        } catch (error) {
          console.error('Error filtering by category:', error);
          return false;
        }
      });
    }
    
    return filtered;
  }, [campaigns, statusFilter, selectedTags, categoryFilter, getCampaignCategory]);

  /**
   * Get count of campaigns by status
   */
  const getStatusCount = (status: CampaignStatus | 'all') => {
    if (status === 'all') {
      return campaigns.length;
    }
    return campaigns.filter((campaign) => campaign.status === status).length;
  };

  /**
   * Get count of campaigns by category
   */
  const getCategoryCount = useCallback((category: string) => {
    if (category === 'all') {
      return campaigns.length;
    }
    try {
      return campaigns.filter(campaign => {
        if (!campaign) return false;
        return getCampaignCategory(campaign) === category;
      }).length;
    } catch (error) {
      console.error('Error counting campaigns by category:', error);
      return 0;
    }
  }, [campaigns, getCampaignCategory]);

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
    <div className="min-h-screen bg-background">
      {/* Header and Filter Section - Fixed (below navigation bar) - Combined to eliminate gap */}
      <div className="fixed top-16 left-0 right-0 z-10 bg-background border-b shadow-sm">
        <div className="mx-auto max-w-7xl px-8">
          {/* Header Section */}
          <div className="py-4">
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
                  onClick={handleSyncCampaigns}
                  disabled={isSyncing}
                  type="button"
                >
                  {isSyncing ? (
                    <Loader2Icon className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCwIcon className="h-4 w-4" />
                  )}
                  {isSyncing ? 'Syncing...' : 'Sync from Zilkr'}
                </Button>
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
          </div>

          {/* Filter Section - Compact 2-line layout */}
          {campaigns.length > 0 && (
            <div className="py-2 border-t">
            {/* Row 1: Status, Category, and Tag filters */}
            <div className="flex items-center gap-4 flex-wrap py-1">
              {/* Status Filter */}
              <div className="flex items-center gap-1.5">
                <FilterIcon className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">Status:</span>
                <div className="flex gap-1">
                  <Button
                    variant={statusFilter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('all')}
                    type="button"
                    className="h-7 px-2 text-xs"
                  >
                    All ({getStatusCount('all')})
                  </Button>
                  <Button
                    variant={statusFilter === 'draft' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('draft')}
                    type="button"
                    className="h-7 px-2 text-xs"
                  >
                    Draft ({getStatusCount('draft')})
                  </Button>
                  <Button
                    variant={statusFilter === 'active' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('active')}
                    type="button"
                    className="h-7 px-2 text-xs"
                  >
                    Active ({getStatusCount('active')})
                  </Button>
                </div>
              </div>

              {/* Category Filter */}
              {allCategories.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <FolderIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">Category:</span>
                  <div className="flex gap-1">
                    <Button
                      variant={categoryFilter === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCategoryFilter('all')}
                      type="button"
                      className="h-7 px-2 text-xs"
                    >
                      All ({getCategoryCount('all')})
                    </Button>
                    {allCategories.map(category => (
                      <Button
                        key={category}
                        variant={categoryFilter === category ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCategoryFilter(category)}
                        type="button"
                        className="h-7 px-2 text-xs"
                      >
                        {category} ({getCategoryCount(category)})
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tag Filter */}
              {allTags.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <HashIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">Tags:</span>
                  <Select
                    value={selectedTags.join(',')}
                    onValueChange={(value) => {
                      if (value) {
                        const tags = value.split(',').filter(Boolean);
                        setSelectedTags(tags);
                      } else {
                        setSelectedTags([]);
                      }
                    }}
                  >
                    <SelectTrigger className="h-7 w-[200px] text-xs">
                      <SelectValue placeholder="Select tags..." />
                    </SelectTrigger>
                    <SelectContent>
                      {allTags.map(tag => {
                        const isSelected = selectedTags.includes(tag);
                        const count = campaigns.filter(c => c.metadata?.tags?.includes(tag)).length;
                        return (
                          <SelectItem
                            key={tag}
                            value={isSelected ? selectedTags.join(',') : [...selectedTags, tag].join(',')}
                          >
                            {tag} ({count})
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  {selectedTags.length > 0 && (
                    <div className="flex gap-1 items-center">
                      {selectedTags.map(tag => (
                        <Badge key={tag} variant="secondary" className="h-5 px-1.5 text-xs gap-0.5">
                          {tag}
                          <button
                            onClick={() => setSelectedTags(prev => prev.filter(t => t !== tag))}
                            className="hover:bg-destructive/20 rounded-full p-0.5 -mr-0.5"
                            type="button"
                          >
                            <XIcon className="h-2.5 w-2.5" />
                          </button>
                        </Badge>
                      ))}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedTags([])}
                        type="button"
                        className="h-6 px-2 text-xs"
                      >
                        Clear
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Row 2: Batch Actions */}
            {filteredCampaigns.length > 0 && (
              <div className="flex items-center gap-2 py-1 border-t">
                <span className="text-xs font-medium text-muted-foreground">
                  Batch: {filteredCampaigns.length} campaign{filteredCampaigns.length !== 1 ? 's' : ''}
                </span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowBatchDeleteConfirm(true)}
                  disabled={deletingCampaignId === 'batch'}
                  type="button"
                  className="h-7 px-3 text-xs"
                >
                  {deletingCampaignId === 'batch' ? (
                    <Loader2Icon className="h-3 w-3 animate-spin" />
                  ) : (
                    <TrashIcon className="h-3 w-3" />
                  )}
                  Delete All
                </Button>
              </div>
            )}
          </div>
          )}
        </div>
      </div>

      {/* Content - with top padding to account for fixed header(s) */}
      {/* When filter exists: 64px nav + ~196px header + ~80px compact filter = ~340px */}
      {/* When no filter: 64px nav + ~196px header = ~260px */}
      <div className={campaigns.length > 0 ? "pt-[340px] pb-8" : "pt-[260px] pb-8"}>
        <div className="mx-auto max-w-7xl px-8 space-y-8">
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

          {/* Sync Error Alert */}
          {syncError && (
            <Alert variant="destructive">
              <AlertCircleIcon className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>Sync Error: {syncError}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSyncError(null)}
                  type="button"
                >
                  Dismiss
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
        ) : filteredCampaigns.length === 0 ? (
          <Card className="py-12">
            <CardContent className="flex flex-col items-center justify-center gap-4 text-center">
              <div className="rounded-full bg-muted p-4">
                <FilterIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">No campaigns found</h3>
                <p className="text-muted-foreground mt-1">
                  No campaigns match the selected filter.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setStatusFilter('all')}
                type="button"
              >
                Clear Filter
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                Your Campaigns {statusFilter !== 'all' && `(${getStatusLabel(statusFilter)})`}
              </h2>
              <span className="text-sm text-muted-foreground">
                Showing {filteredCampaigns.length} of {campaigns.length} campaigns
              </span>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredCampaigns.map((campaign) => {
                const category = getCampaignCategory(campaign);
                return (
                  <Card key={campaign.id} className="flex flex-col">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <CardTitle className="line-clamp-1">{campaign.name}</CardTitle>
                        <div className="flex gap-2 flex-wrap">
                          <Badge 
                            variant="secondary" 
                            className="cursor-pointer hover:bg-secondary/80"
                            onClick={() => setCategoryFilter(category)}
                            title={`Filter by ${category}`}
                          >
                            {category}
                          </Badge>
                          <Badge variant={getStatusVariant(campaign.status)}>
                            {getStatusLabel(campaign.status)}
                          </Badge>
                        </div>
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

                    {/* Tags Section */}
                    <div className="space-y-2 pt-2 border-t">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-muted-foreground">Tags:</span>
                        {campaign.metadata?.tags && campaign.metadata.tags.length > 0 ? (
                          campaign.metadata.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="gap-1">
                              {tag}
                              <button
                                onClick={() => handleRemoveTag(campaign.id, tag)}
                                disabled={isUpdatingTags[campaign.id]}
                                className="ml-1 hover:bg-destructive/20 rounded-full p-0.5 disabled:opacity-50"
                                type="button"
                              >
                                <XIcon className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground">No tags</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add tag..."
                          value={newTagInput[campaign.id] || ''}
                          onChange={(e) => setNewTagInput(prev => ({ ...prev, [campaign.id]: e.target.value }))}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const value = newTagInput[campaign.id] || '';
                              if (value.trim()) {
                                handleAddTag(campaign.id, value);
                              }
                            }
                          }}
                          disabled={isUpdatingTags[campaign.id]}
                          className="h-8 text-sm"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const value = newTagInput[campaign.id] || '';
                            if (value.trim()) {
                              handleAddTag(campaign.id, value);
                            }
                          }}
                          disabled={isUpdatingTags[campaign.id] || !newTagInput[campaign.id]?.trim()}
                          type="button"
                        >
                          {isUpdatingTags[campaign.id] ? (
                            <Loader2Icon className="h-3 w-3 animate-spin" />
                          ) : (
                            <PlusIcon className="h-3 w-3" />
                          )}
                        </Button>
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
                );
              })}
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

        {/* Batch Delete Confirmation Dialog */}
        <Dialog open={showBatchDeleteConfirm} onOpenChange={setShowBatchDeleteConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete All Filtered Campaigns?</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {filteredCampaigns.length} campaign{filteredCampaigns.length !== 1 ? 's' : ''}?
                {categoryFilter !== 'all' && ` (Category: ${categoryFilter})`}
                {statusFilter !== 'all' && ` (Status: ${getStatusLabel(statusFilter)})`}
                {selectedTags.length > 0 && ` (Tags: ${selectedTags.join(', ')})`}
                <br />
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowBatchDeleteConfirm(false)}
                type="button"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleBatchDelete}
                disabled={deletingCampaignId === 'batch'}
                type="button"
              >
                {deletingCampaignId === 'batch' ? (
                  <>
                    <Loader2Icon className="h-4 w-4 animate-spin mr-2" />
                    Deleting...
                  </>
                ) : (
                  'Delete All'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </div>
    </div>
  );
};

export default CampaignDashboard;
