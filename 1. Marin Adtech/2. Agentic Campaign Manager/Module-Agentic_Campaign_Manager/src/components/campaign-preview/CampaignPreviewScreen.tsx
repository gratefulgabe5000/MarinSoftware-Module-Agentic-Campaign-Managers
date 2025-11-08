import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCampaignStore } from '../../store/campaignStore';
import { useCampaignPreviewStore } from '../../store/campaignPreviewStore';
import { Campaign } from '../../types/campaign.types';
import { CampaignPreviewData, AdGroupPreviewRow } from '../../types/campaign-preview.types';
import { GeneratedAdGroup } from '../../types/adgroup-generation.types';
import CampaignPreviewTable from './CampaignPreviewTable';
import LoadingSpinner from '../LoadingSpinner';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { ArrowLeftIcon, SparklesIcon, CheckCircle2Icon, AlertCircleIcon, AlertTriangleIcon, SaveIcon, Loader2Icon } from 'lucide-react';

/**
 * Campaign Preview Screen
 * Displays generated campaigns in a spreadsheet-like interface for editing and export
 */
const CampaignPreviewScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [activeCampaignTab, setActiveCampaignTab] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const storeCampaigns = useCampaignStore((state) => state.campaigns);
  const { setPreviewData, validateCampaign, validationResult, hasUnsavedChanges, saveDraft } = useCampaignPreviewStore();

  // Get campaigns from location state (passed from generation screen) or from store
  useEffect(() => {
    if (location.state?.campaigns) {
      setCampaigns(location.state.campaigns);
      setIsLoading(false);
    } else if (storeCampaigns.length > 0) {
      setCampaigns(storeCampaigns);
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [location.state, storeCampaigns]);

  // Set preview data when active campaign tab changes
  useEffect(() => {
    const campaignIndex = parseInt(activeCampaignTab, 10);
    if (campaigns.length > 0 && campaignIndex >= 0 && campaignIndex < campaigns.length) {
      const campaign = campaigns[campaignIndex];
      const previewData = transformCampaignToPreview(campaign);
      setPreviewData(previewData);
      validateCampaign();
    }
  }, [activeCampaignTab, campaigns, setPreviewData, validateCampaign]);

  // Transform campaign to preview data
  const transformCampaignToPreview = (campaign: Campaign): CampaignPreviewData => {
    const adGroups: AdGroupPreviewRow[] = [];
    
    // Extract ad groups from campaign plan
    if (campaign.campaignPlan?.adGroups) {
      campaign.campaignPlan.adGroups.forEach((adGroupPlan, index) => {
        // Get keywords from targeting.keywords (array of strings)
        const keywords = adGroupPlan.targeting?.keywords || [];
        
        // Extract ads from adGroupPlan.ads
        const ads = adGroupPlan.ads || [];

        const adGroupRow: AdGroupPreviewRow = {
          id: `adgroup-${index}`,
          type: 'adgroup',
          level: 0,
          adGroupId: adGroupPlan.name || `adgroup-${index}`,
          name: adGroupPlan.name || 'Untitled Ad Group',
          productId: `product-${index}`,
          productName: campaign.name || 'Untitled Product',
          keywords: keywords.map((kw) => ({
            text: typeof kw === 'string' ? kw : (kw.text || String(kw)),
            matchType: typeof kw === 'string' ? 'broad' : (kw.matchType || 'broad'),
            source: {
              type: 'llm_generated',
              keyword: typeof kw === 'string' ? kw : (kw.text || String(kw)),
              relevance: 0.8,
              confidence: 0.7,
            },
          })),
          ads: ads.map((ad, adIndex) => ({
            id: ad.id || `ad-${index}-${adIndex}`,
            adGroupId: ad.adGroupId || `adgroup-${index}`,
            headlines: ad.headlines?.map((h, hIndex) => ({
              text: typeof h === 'string' ? h : h.text || h,
              pinned: h.pinned || false,
              position: h.position ?? hIndex,
            })) || [],
            descriptions: ad.descriptions?.map((d, dIndex) => ({
              text: typeof d === 'string' ? d : d.text || d,
            })) || [],
            finalUrl: ad.finalUrl || campaign.campaignPlan.targetUrl || '',
            displayUrl: ad.displayUrl,
          })),
        };

        adGroups.push(adGroupRow);
      });
    }

    return {
      campaignId: campaign.id,
      campaignName: campaign.name,
      adGroups,
      totalKeywords: adGroups.reduce((sum, ag) => sum + ag.keywords.length, 0),
      totalAds: adGroups.reduce((sum, ag) => sum + ag.ads.length, 0),
    };
  };

  // Handle back to dashboard
  const handleBackToDashboard = () => {
    navigate('/campaigns');
  };

  // Handle back to generation
  const handleBackToGeneration = () => {
    navigate('/campaigns/generate');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="flex items-center justify-center py-12">
          <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="mx-auto max-w-4xl space-y-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">No Campaigns Found</h2>
                <p className="text-muted-foreground">
                  Generate campaigns first to preview and edit them.
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleBackToGeneration} type="button">
                  <SparklesIcon className="h-4 w-4" />
                  Generate Campaigns
                </Button>
                <Button variant="outline" onClick={handleBackToDashboard} type="button">
                  <ArrowLeftIcon className="h-4 w-4" />
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold tracking-tight">Campaign Preview & Edit</h1>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300 text-sm px-3 py-1">
                PREVIEW
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              Review and edit your generated campaigns before exporting
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleBackToDashboard} type="button">
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>

        {/* Campaign Tabs */}
        {campaigns.length > 1 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Select Campaign to Preview</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Tabs value={activeCampaignTab} onValueChange={setActiveCampaignTab}>
                <div className="overflow-x-auto pb-2">
                  <TabsList className="inline-flex w-auto">
                    {campaigns.map((campaign, index) => (
                      <TabsTrigger
                        key={campaign.id}
                        value={index.toString()}
                        className="whitespace-nowrap"
                      >
                        {campaign.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Validation Summary */}
        {validationResult && (
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Validation Summary</CardTitle>
                {hasUnsavedChanges && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={saveDraft}
                    type="button"
                  >
                    <SaveIcon className="h-4 w-4" />
                    Save Draft
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              {validationResult.isValid ? (
                <Alert className="border-green-500/50 bg-green-500/5">
                  <CheckCircle2Icon className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-600">All Valid</AlertTitle>
                  <AlertDescription className="text-green-600">
                    All fields are valid. Ready to export.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive">
                  <AlertCircleIcon className="h-4 w-4" />
                  <AlertTitle>{validationResult.errors.length} Error{validationResult.errors.length !== 1 ? 's' : ''} Found</AlertTitle>
                  <AlertDescription>
                    <ul className="mt-2 space-y-1 list-disc list-inside">
                      {validationResult.errors.slice(0, 10).map((error, index) => (
                        <li key={index} className="text-sm">
                          <strong>{error.field}</strong>: {error.message}
                        </li>
                      ))}
                      {validationResult.errors.length > 10 && (
                        <li className="text-sm">
                          ... and {validationResult.errors.length - 10} more errors
                        </li>
                      )}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
              {validationResult.warnings.length > 0 && (
                <Alert className="border-yellow-500/50 bg-yellow-500/5">
                  <AlertTriangleIcon className="h-4 w-4 text-yellow-600" />
                  <AlertTitle className="text-yellow-600">
                    {validationResult.warnings.length} Warning{validationResult.warnings.length !== 1 ? 's' : ''}
                  </AlertTitle>
                  <AlertDescription>
                    <ul className="mt-2 space-y-1 list-disc list-inside text-yellow-600">
                      {validationResult.warnings.slice(0, 5).map((warning, index) => (
                        <li key={index} className="text-sm">
                          <strong>{warning.field}</strong>: {warning.message}
                        </li>
                      ))}
                      {validationResult.warnings.length > 5 && (
                        <li className="text-sm">
                          ... and {validationResult.warnings.length - 5} more warnings
                        </li>
                      )}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {campaigns.length > 0 && (
          <CampaignPreviewTable previewData={transformCampaignToPreview(campaigns[parseInt(activeCampaignTab, 10)])} />
        )}
      </div>
    </div>
  );
};

export default CampaignPreviewScreen;

