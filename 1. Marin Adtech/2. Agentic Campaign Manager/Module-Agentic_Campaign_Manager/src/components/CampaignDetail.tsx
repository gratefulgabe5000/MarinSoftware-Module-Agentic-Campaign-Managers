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
import { Loader2Icon, ArrowLeftIcon, AlertCircleIcon, ExternalLinkIcon } from 'lucide-react';

/**
 * Campaign Detail Component
 * Displays campaign details and status
 */
const CampaignDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<Campaign | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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

  // Campaign state is synced through props and store

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
          const apiResponse = await campaignService.getCampaign(id);

          // Check if API returned a valid campaign (not just a "not implemented" message)
          if (apiResponse && apiResponse.status && apiResponse.campaignPlan) {
            campaignData = apiResponse;
          } else {
            // If API returns null or incomplete data, campaign not found
            campaignData = undefined;
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

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
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
                <Badge variant={getStatusVariant(campaign.status)}>
                  {getStatusLabel(campaign.status)}
                </Badge>
              </div>
            </div>
          </div>
        </div>

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
              initialStatus={mapCampaignStatusToEnum(campaign.status)}
              showHistory={true}
              pollingInterval={5000}
              enableNotifications={true}
              campaignName={campaign.name}
            />
          </CardContent>
        </Card>

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

        {/* Platform Campaign IDs */}
        {campaign.platformCampaignIds && Object.keys(campaign.platformCampaignIds).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Platform Campaign IDs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(campaign.platformCampaignIds).map(([platform, campaignId]) => (
                <div key={platform} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{platform}:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs bg-muted px-2 py-1 rounded">{campaignId}</span>
                    {campaignId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                      >
                        <a
                          href={`https://ads.google.com/campaigns/${campaignId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLinkIcon className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

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
  );
};

export default CampaignDetail;

