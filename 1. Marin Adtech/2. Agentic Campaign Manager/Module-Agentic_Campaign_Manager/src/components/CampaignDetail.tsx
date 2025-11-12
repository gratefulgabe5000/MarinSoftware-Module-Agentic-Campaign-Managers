import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCampaignStore } from '../store/campaignStore';
import { campaignService } from '../services/campaignService';
import { Campaign } from '../types/campaign.types';
import { CampaignStatus as StatusEnum } from '../types/status.types';
import CampaignOverviewCard from './CampaignOverviewCard';
import CampaignStatus from './CampaignStatus';
import CampaignActions from './CampaignActions';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Loader2Icon, ArrowLeftIcon, AlertCircleIcon, ExternalLinkIcon, EditIcon, SaveIcon, XIcon, RefreshCwIcon } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Campaign Detail Component
 * Displays comprehensive campaign details and allows editing
 */
const CampaignDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<Campaign | undefined>(undefined);
  const [campaignDetails, setCampaignDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  
  const getCampaignById = useCampaignStore((state) => state.getCampaignById);
  const currentCampaign = useCampaignStore((state) => state.currentCampaign);
  const initializeCampaigns = useCampaignStore((state) => state.initializeCampaigns);
  const isInitialized = useCampaignStore((state) => state.isInitialized);

  // Define mapping function BEFORE useEffect to avoid hoisting issues
  const mapCampaignStatusToEnum = (status: string | undefined): StatusEnum | undefined => {
    if (!status || typeof status !== 'string') return undefined;
    const statusMap: Record<string, StatusEnum> = {
      'draft': StatusEnum.DRAFT,
      'creating': StatusEnum.CREATING,
      'pending_approval': StatusEnum.PENDING_APPROVAL,
      'approved': StatusEnum.APPROVED,
      'active': StatusEnum.ACTIVE,
      'paused': StatusEnum.PAUSED,
      'completed': StatusEnum.COMPLETED,
      'archived': StatusEnum.ARCHIVED,
      'error': StatusEnum.ERROR,
    };
    return statusMap[status.toLowerCase()];
  };

  // Load campaign from store
  useEffect(() => {
    const loadCampaign = async () => {
      if (!id) {
        setError('Campaign ID is required');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Make sure store is initialized from IndexedDB
        if (!isInitialized) {
          await initializeCampaigns();
        }

        // Try to get from store first (which now includes IndexedDB data)
        let campaignData = getCampaignById(id);

        // If not in store, try current campaign
        if (!campaignData && currentCampaign?.id === id) {
          campaignData = currentCampaign;
        }

        // If still not found, try to fetch from API
        if (!campaignData) {
          try {
            const apiResponse = await campaignService.getCampaign(id);
            if (apiResponse && apiResponse.status && apiResponse.campaignPlan) {
              campaignData = apiResponse;
            }
          } catch (apiError) {
            // API might not be implemented yet, that's okay
            console.log('Campaign API not available, using store data only');
          }
        }

        setCampaign(campaignData);
      } catch (error) {
        console.error('Error loading campaign:', error);
        setError(error instanceof Error ? error.message : 'Failed to load campaign');
      } finally {
        setIsLoading(false);
      }
    };

    loadCampaign();
  }, [id, getCampaignById, currentCampaign, initializeCampaigns, isInitialized]);

  // Fetch detailed campaign information from Google Ads API
  const fetchCampaignDetails = async () => {
    if (!id || !campaign) return;

    try {
      setIsLoadingDetails(true);
      const googleAdsResourceName = campaign.platformCampaignIds?.googleAds;
      
      if (!googleAdsResourceName) {
        console.log('No Google Ads resource name found, skipping details fetch');
        setIsLoadingDetails(false);
        return;
      }

      const details = await campaignService.getCampaignDetails(id, googleAdsResourceName);
      
      if (details.success && details.campaign) {
        setCampaignDetails(details.campaign);
        // Initialize edit form with current values
        setEditForm({
          name: details.campaign.name,
          budget: details.campaign.budget?.amount || 0,
          startDate: details.campaign.startDate || '',
          endDate: details.campaign.endDate || '',
          enhancedCpcEnabled: details.campaign.biddingStrategy?.manualCpc?.enhancedCpcEnabled || false,
        });
      } else {
        console.warn('Failed to fetch campaign details:', details.error);
      }
    } catch (error) {
      console.error('Error fetching campaign details:', error);
      toast.error('Failed to fetch campaign details from Google Ads');
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Fetch details when campaign is loaded and has Google Ads resource name
  useEffect(() => {
    if (campaign && campaign.platformCampaignIds?.googleAds) {
      fetchCampaignDetails();
    }
  }, [campaign?.id, campaign?.platformCampaignIds?.googleAds]);

  // Handle save
  const handleSave = async () => {
    if (!campaign || !campaignDetails) return;

    try {
      // Update campaign via API
      const updates = {
        name: editForm.name,
        budget: {
          amount: editForm.budget,
          deliveryMethod: campaignDetails.budget?.deliveryMethod || 'STANDARD',
        },
        startDate: editForm.startDate,
        endDate: editForm.endDate,
        biddingStrategy: {
          type: 'MANUAL_CPC',
          manualCpc: {
            enhancedCpcEnabled: editForm.enhancedCpcEnabled,
          },
        },
      };

      await campaignService.updateCampaign(campaign.id, updates, googleAdsResourceName);
      
      // Refresh details
      await fetchCampaignDetails();
      
      setIsEditing(false);
      toast.success('Campaign updated successfully');
    } catch (error) {
      console.error('Error updating campaign:', error);
      toast.error('Failed to update campaign');
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    if (campaignDetails) {
      setEditForm({
        name: campaignDetails.name,
        budget: campaignDetails.budget?.amount || 0,
        startDate: campaignDetails.startDate || '',
        endDate: campaignDetails.endDate || '',
        enhancedCpcEnabled: campaignDetails.biddingStrategy?.manualCpc?.enhancedCpcEnabled || false,
      });
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="flex flex-col items-center justify-center gap-4 py-12">
          <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading campaign details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="mx-auto max-w-7xl space-y-4">
          <Alert variant="destructive">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={() => navigate('/campaigns')} variant="outline">
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="mx-auto max-w-7xl">
          <Card className="py-12">
            <CardContent className="flex flex-col items-center justify-center gap-4 text-center">
              <AlertCircleIcon className="h-12 w-12 text-muted-foreground" />
              <div>
                <h2 className="text-lg font-semibold">Campaign Not Found</h2>
                <p className="text-muted-foreground mt-1">
                  The campaign you're looking for doesn't exist.
                </p>
              </div>
              <Button onClick={() => navigate('/campaigns')} variant="outline">
                <ArrowLeftIcon className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const getStatusVariant = (status: string | undefined): 'default' | 'secondary' | 'destructive' | 'outline' => {
    if (!status || typeof status !== 'string') return 'outline';
    switch (status.toLowerCase()) {
      case 'active':
      case 'enabled':
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

  const getStatusLabel = (status: string | undefined): string => {
    if (!status || typeof status !== 'string') return 'Unknown';
    return status
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const googleAdsResourceName = campaign.platformCampaignIds?.googleAds;
  const hasGoogleAdsData = !!googleAdsResourceName && !!campaignDetails;

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Fixed (below navigation bar) */}
      <div className="fixed top-16 left-0 right-0 z-10 bg-background border-b shadow-sm">
        <div className="mx-auto max-w-7xl px-8 py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <Button
                onClick={() => navigate('/campaigns')}
                variant="ghost"
                size="sm"
                className="mb-2"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{campaign.name}</h1>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge variant={getStatusVariant(campaign.status || campaignDetails?.status)}>
                    {getStatusLabel(campaign.status || campaignDetails?.status)}
                  </Badge>
                  {campaignDetails?.isMock && (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                      MOCK
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {hasGoogleAdsData && (
                <>
                  {!isEditing ? (
                    <>
                      <Button
                        onClick={fetchCampaignDetails}
                        variant="outline"
                        size="sm"
                        disabled={isLoadingDetails}
                      >
                        <RefreshCwIcon className={`h-4 w-4 ${isLoadingDetails ? 'animate-spin' : ''}`} />
                        Refresh
                      </Button>
                      <Button
                        onClick={() => setIsEditing(true)}
                        variant="default"
                        size="sm"
                      >
                        <EditIcon className="h-4 w-4" />
                        Edit
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        onClick={handleCancelEdit}
                        variant="outline"
                        size="sm"
                      >
                        <XIcon className="h-4 w-4" />
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSave}
                        variant="default"
                        size="sm"
                      >
                        <SaveIcon className="h-4 w-4" />
                        Save
                      </Button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content - with top padding to account for fixed header */}
      <div className="pt-52 pb-8">
        <div className="mx-auto max-w-7xl px-8 space-y-6">

          {/* Campaign Overview */}
          {campaign.campaignPlan && (
            <CampaignOverviewCard campaignPlan={campaign.campaignPlan} />
          )}

          {/* Campaign Status */}
          <Card>
            <CardHeader>
              <CardTitle>Campaign Status</CardTitle>
            </CardHeader>
            <CardContent>
              <CampaignStatus
                campaignId={campaign.id}
                initialStatus={mapCampaignStatusToEnum(campaign.status || campaignDetails?.status)}
                showHistory={true}
                pollingInterval={5000}
                enableNotifications={true}
                campaignName={campaign.name}
              />
            </CardContent>
          </Card>

          {/* Campaign Details from Google Ads */}
          {hasGoogleAdsData ? (
            <>
              {/* Campaign Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="name">Campaign Name</Label>
                        <Input
                          id="name"
                          value={editForm.name || ''}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="budget">Daily Budget ($)</Label>
                        <Input
                          id="budget"
                          type="number"
                          step="0.01"
                          min="0"
                          value={editForm.budget || 0}
                          onChange={(e) => setEditForm({ ...editForm, budget: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="startDate">Start Date</Label>
                          <Input
                            id="startDate"
                            type="date"
                            value={editForm.startDate || ''}
                            onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="endDate">End Date</Label>
                          <Input
                            id="endDate"
                            type="date"
                            value={editForm.endDate || ''}
                            onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="enhancedCpc"
                          checked={editForm.enhancedCpcEnabled || false}
                          onChange={(e) => setEditForm({ ...editForm, enhancedCpcEnabled: e.target.checked })}
                          className="rounded"
                        />
                        <Label htmlFor="enhancedCpc" className="cursor-pointer">
                          Enable Enhanced CPC
                        </Label>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm text-muted-foreground">Campaign Name:</span>
                          <p className="font-medium">{campaignDetails.name}</p>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Daily Budget:</span>
                          <p className="font-medium">${campaignDetails.budget?.amount?.toFixed(2) || '0.00'}</p>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Start Date:</span>
                          <p className="font-medium">{campaignDetails.startDate || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">End Date:</span>
                          <p className="font-medium">{campaignDetails.endDate || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Bidding Strategy:</span>
                          <p className="font-medium">{campaignDetails.biddingStrategy?.type || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Enhanced CPC:</span>
                          <p className="font-medium">
                            {campaignDetails.biddingStrategy?.manualCpc?.enhancedCpcEnabled ? 'Enabled' : 'Disabled'}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Network Settings */}
              {campaignDetails.networkSettings && (
                <Card>
                  <CardHeader>
                    <CardTitle>Network Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Google Search</span>
                        <Badge variant={campaignDetails.networkSettings.targetGoogleSearch ? 'default' : 'outline'}>
                          {campaignDetails.networkSettings.targetGoogleSearch ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Search Network</span>
                        <Badge variant={campaignDetails.networkSettings.targetSearchNetwork ? 'default' : 'outline'}>
                          {campaignDetails.networkSettings.targetSearchNetwork ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Content Network</span>
                        <Badge variant={campaignDetails.networkSettings.targetContentNetwork ? 'default' : 'outline'}>
                          {campaignDetails.networkSettings.targetContentNetwork ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Ad Groups */}
              {campaignDetails.adGroups && campaignDetails.adGroups.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Ad Groups ({campaignDetails.adGroups.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {campaignDetails.adGroups.map((adGroup: any) => (
                        <div key={adGroup.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{adGroup.name}</h4>
                            <Badge variant={adGroup.status === 'ENABLED' ? 'default' : 'secondary'}>
                              {adGroup.status}
                            </Badge>
                          </div>
                          {adGroup.cpcBid && (
                            <p className="text-sm text-muted-foreground">
                              CPC Bid: ${adGroup.cpcBid.toFixed(2)}
                            </p>
                          )}
                          {/* Keywords for this ad group */}
                          {campaignDetails.keywords && (
                            <div className="mt-2">
                              <p className="text-sm font-medium mb-1">Keywords:</p>
                              <div className="flex flex-wrap gap-1">
                                {campaignDetails.keywords
                                  .filter((kw: any) => kw.adGroupResourceName === adGroup.resourceName)
                                  .map((keyword: any, idx: number) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {keyword.text} ({keyword.matchType})
                                    </Badge>
                                  ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* All Keywords */}
              {campaignDetails.keywords && campaignDetails.keywords.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>All Keywords ({campaignDetails.keywords.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {campaignDetails.keywords.map((keyword: any, idx: number) => (
                        <div key={idx} className="border rounded p-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{keyword.text}</span>
                            <Badge variant="outline" className="text-xs">{keyword.matchType}</Badge>
                          </div>
                          {keyword.qualityScore && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Quality Score: {keyword.qualityScore}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">
                  {isLoadingDetails ? 'Loading campaign details...' : 'No Google Ads data available for this campaign'}
                </p>
                {googleAdsResourceName && (
                  <Button
                    onClick={fetchCampaignDetails}
                    variant="outline"
                    className="mt-4"
                    disabled={isLoadingDetails}
                  >
                    <RefreshCwIcon className={`h-4 w-4 mr-2 ${isLoadingDetails ? 'animate-spin' : ''}`} />
                    Load Details
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Campaign Information */}
          <Card>
            <CardHeader>
              <CardTitle>Campaign Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Campaign ID:</span>
                <span className="font-medium">{campaign.id}</span>
              </div>
              {googleAdsResourceName && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Google Ads Resource:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs bg-muted px-2 py-1 rounded">{googleAdsResourceName}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                    >
                      <a
                        href={`https://ads.google.com/aw/campaigns/list?campaignId=${googleAdsResourceName.split('/').pop()}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLinkIcon className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Created:</span>
                <span className="font-medium">{new Date(campaign.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Updated:</span>
                <span className="font-medium">{new Date(campaign.updatedAt).toLocaleString()}</span>
              </div>
              {campaign.description && (
                <div className="flex flex-col gap-1 text-sm">
                  <span className="text-muted-foreground">Description:</span>
                  <span className="font-medium">{campaign.description}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Campaign Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Campaign Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <CampaignActions
                campaign={campaign}
                onUpdate={(updatedCampaign) => {
                  setCampaign(updatedCampaign);
                }}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetail;
