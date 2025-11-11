import React, { useState } from 'react';
import { CampaignPreviewData } from '../../types/campaign-preview.types';
import { useCampaignStore } from '../../store/campaignStore';
import { campaignService } from '../../services/campaignService';
import { toastService } from '../../utils/toastService';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Loader2Icon, UploadIcon, AlertCircleIcon, CheckCircle2Icon } from 'lucide-react';
import { Campaign } from '../../types/campaign.types';

/**
 * Create Draft Campaign Button Component
 * Creates the campaign in Google Ads as a draft (PAUSED status) and saves it to the dashboard
 */
interface CreateDraftCampaignButtonProps {
  previewData: CampaignPreviewData;
  campaign: Campaign; // The full campaign object from the store
}

const CreateDraftCampaignButton: React.FC<CreateDraftCampaignButtonProps> = ({ previewData, campaign }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [createdCampaignId, setCreatedCampaignId] = useState<string | null>(null);

  const addCampaign = useCampaignStore((state) => state.addCampaign);
  const updateCampaign = useCampaignStore((state) => state.updateCampaign);

  const handleCreateDraft = async () => {
    try {
      setIsCreating(true);
      setError(null);
      setSuccess(false);

      // Create campaign via Zilkr Dispatcher API as PAUSED (draft)
      // We'll use the campaign creation endpoint but with PAUSED status
      const response = await campaignService.createCampaign({
        campaignPlan: campaign.campaignPlan,
        name: campaign.name,
        description: campaign.description,
        status: 'paused' as any, // Create as draft (paused) - will be converted to 'PAUSED' in backend
      });

      // Check for errors first
      if (response.errors && response.errors.length > 0) {
        const errorMessages = response.errors.map(e => {
          // Handle error as string or object
          const errorText = typeof e.error === 'string' 
            ? e.error 
            : typeof e.error === 'object' && e.error !== null
            ? JSON.stringify(e.error)
            : String(e.error);
          return `${e.platform}: ${errorText}`;
        }).join(', ');
        throw new Error(`Campaign creation failed: ${errorMessages}`);
      }

      // Check if we have a campaign ID from the response
      if (response.campaignId) {
        // Get the Google Ads campaign ID from platformCampaignIds
        const googleAdsCampaignId = response.platformCampaignIds?.googleAds || response.platformCampaignIds?.zilkr || response.campaignId;
        
        // Create a campaign object to save to the store
        const createdCampaign: Campaign = {
          id: response.campaignId,
          name: campaign.name,
          description: campaign.description,
          campaignPlan: campaign.campaignPlan,
          status: 'paused', // Ensure status is paused
          platformCampaignIds: {
            ...response.platformCampaignIds,
            googleAds: googleAdsCampaignId,
            zilkr: googleAdsCampaignId,
          },
          createdAt: response.createdAt || new Date(),
          updatedAt: new Date(),
          metadata: {
            ...campaign.metadata,
            tags: [...(campaign.metadata?.tags || []), 'draft', 'google-ads'],
            notes: `Created as draft in Google Ads. Campaign ID: ${googleAdsCampaignId}`,
          },
        };

        // Check if campaign already exists in store (by ID)
        const existingCampaign = useCampaignStore.getState().campaigns.find(c => c.id === campaign.id);
        
        if (existingCampaign) {
          // Update existing campaign with Google Ads ID
          updateCampaign(campaign.id, {
            platformCampaignIds: {
              ...campaign.platformCampaignIds,
              googleAds: googleAdsCampaignId,
              zilkr: googleAdsCampaignId,
            },
            status: 'paused',
            metadata: {
              ...campaign.metadata,
              tags: [...(campaign.metadata?.tags || []), 'draft', 'google-ads'],
              notes: `Created as draft in Google Ads. Campaign ID: ${googleAdsCampaignId}`,
            },
          });
        } else {
          // Add new campaign to store
          addCampaign(createdCampaign);
        }

        setCreatedCampaignId(googleAdsCampaignId);
        setSuccess(true);
        toastService.success(
          'Campaign Created as Draft',
          `Campaign "${campaign.name}" has been created in Google Ads as a draft (paused). You can enable it later from the dashboard.`
        );
      } else {
        throw new Error('Campaign creation response missing campaign ID');
      }
    } catch (err) {
      console.error('Error creating draft campaign:', err);
      let errorMessage = 'Failed to create campaign in Google Ads';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null) {
        // Try to extract error message from error object
        if ('error' in err && typeof err.error === 'string') {
          errorMessage = err.error;
        } else if ('message' in err && typeof err.message === 'string') {
          errorMessage = err.message;
        } else {
          // Serialize the error object to JSON for display
          try {
            errorMessage = JSON.stringify(err, null, 2);
          } catch {
            errorMessage = String(err);
          }
        }
      } else {
        errorMessage = String(err);
      }
      
      setError(errorMessage);
      toastService.error('Failed to Create Draft Campaign', errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  // Check if campaign already has a Google Ads ID
  const hasGoogleAdsId = !!campaign.platformCampaignIds?.googleAds;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Create Campaign in Google Ads</CardTitle>
        <CardDescription>
          Create this campaign in Google Ads as a draft (paused). It will appear in your Campaign Dashboard and can be enabled later.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {success && createdCampaignId && (
          <Alert className="border-green-500/50 bg-green-500/5">
            <CheckCircle2Icon className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600">
              <div className="space-y-1">
                <p className="font-semibold">Campaign created successfully!</p>
                <p className="text-sm">
                  Campaign ID: <code className="bg-green-100 px-1 rounded">{createdCampaignId}</code>
                </p>
                <p className="text-sm">
                  The campaign is now in your Google Ads account as a draft (paused). You can view and enable it from the Campaign Dashboard.
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {hasGoogleAdsId && !success && (
          <Alert className="border-blue-500/50 bg-blue-500/5">
            <AlertCircleIcon className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-600">
              This campaign already exists in Google Ads (ID: {campaign.platformCampaignIds.googleAds}).
              Creating again will create a new campaign.
            </AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handleCreateDraft}
          disabled={isCreating || success}
          type="button"
          className="w-full md:w-auto"
          variant={success ? 'outline' : 'default'}
        >
          {isCreating ? (
            <>
              <Loader2Icon className="h-4 w-4 animate-spin" />
              Creating Draft Campaign...
            </>
          ) : success ? (
            <>
              <CheckCircle2Icon className="h-4 w-4" />
              Campaign Created
            </>
          ) : (
            <>
              <UploadIcon className="h-4 w-4" />
              Create as Draft in Google Ads
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default CreateDraftCampaignButton;

