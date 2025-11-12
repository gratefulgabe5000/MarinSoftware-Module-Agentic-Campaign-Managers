import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ProductInput } from '../../types/product.types';
import { CampaignPatterns } from '../../types/campaign-patterns.types';
import { useAdGroupGeneration } from '../../hooks/useAdGroupGeneration';
import { useKeywordGeneration } from '../../hooks/useKeywordGeneration';
import { useRSAGeneration } from '../../hooks/useRSAGeneration';
import { useCampaignStore } from '../../store/campaignStore';
import { Campaign } from '../../types/campaign.types';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { CheckCircle2Icon, Loader2Icon, ClockIcon, SparklesIcon, ArrowLeftIcon, EyeIcon, HomeIcon, AlertCircleIcon } from 'lucide-react';
import { Progress } from '../ui/progress';
import ApiModeToggle from '../ApiModeToggle';

/**
 * Campaign Generation Screen Component
 * Handles the generation of campaigns for multiple products
 */
const CampaignGenerationScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [products, setProducts] = useState<ProductInput[]>([]);
  const [patterns, setPatterns] = useState<CampaignPatterns | undefined>(undefined);
  const [currentStep, setCurrentStep] = useState<'adgroups' | 'keywords' | 'ads' | 'complete'>('adgroups');
  const [generatedCampaigns, setGeneratedCampaigns] = useState<Campaign[]>([]);
  const [generationProgress, setGenerationProgress] = useState<{
    adGroups: { [key: number]: any };
    keywords: { [key: number]: any };
    ads: { [key: number]: any };
  }>({
    adGroups: {},
    keywords: {},
    ads: {},
  });

  // Get products and patterns from previous step
  useEffect(() => {
    if (location.state) {
      if (location.state.products) {
        setProducts(location.state.products);
      }
      if (location.state.patterns) {
        setPatterns(location.state.patterns);
      }
    }
  }, [location.state]);

  const { generateAdGroups, error: adGroupsError } = useAdGroupGeneration();
  const { generateKeywords, error: keywordsError } = useKeywordGeneration();
  const { generateRSA, error: adsError } = useRSAGeneration();
  const { addCampaign, setCampaigns } = useCampaignStore();

  // Generate ad groups for all products
  useEffect(() => {
    if (currentStep === 'adgroups' && products.length > 0) {
      const generateAllAdGroups = async () => {
        const adGroupsMap: { [key: number]: any } = {};

        for (let i = 0; i < products.length; i++) {
          try {
            const adGroups = await generateAdGroups({
              products: [products[i]],
              patterns: patterns || undefined,
            });
            adGroupsMap[i] = adGroups;
            setGenerationProgress((prev) => ({
              ...prev,
              adGroups: { ...prev.adGroups, [i]: adGroups },
            }));
          } catch (error) {
            console.error(`Error generating ad groups for product ${i}:`, error);
          }
        }

        setCurrentStep('keywords');
      };

      generateAllAdGroups();
    }
  }, [currentStep, products, patterns, generateAdGroups]);

  // Generate keywords for all products
  useEffect(() => {
    if (currentStep === 'keywords' && products.length > 0) {
      const generateAllKeywords = async () => {
        const keywordsMap: { [key: number]: any } = {};

        for (let i = 0; i < products.length; i++) {
          try {
            const keywords = await generateKeywords({
              product: products[i],
              patterns: patterns || undefined,
            });
            keywordsMap[i] = keywords;
            setGenerationProgress((prev) => ({
              ...prev,
              keywords: { ...prev.keywords, [i]: keywords },
            }));
          } catch (error) {
            console.error(`Error generating keywords for product ${i}:`, error);
          }
        }

        setCurrentStep('ads');
      };

      generateAllKeywords();
    }
  }, [currentStep, products, patterns, generateKeywords]);

  // Generate ads for all ad groups
  useEffect(() => {
    if (currentStep === 'ads' && products.length > 0) {
      const generateAllAds = async () => {
        const adsMap: { [key: number]: any } = {};

        for (let i = 0; i < products.length; i++) {
          const adGroups = generationProgress.adGroups[i] || [];

          for (let j = 0; j < adGroups.length; j++) {
            try {
              const adGroup = adGroups[j];
              const ads = await generateRSA({
                adGroupId: adGroup.id || `adgroup-${i}-${j}`,
                product: products[i],
                patterns: patterns || undefined,
              });
              if (!adsMap[i]) {
                adsMap[i] = [];
              }
              adsMap[i].push(ads);
              setGenerationProgress((prev) => ({
                ...prev,
                ads: { ...prev.ads, [i]: adsMap[i] },
              }));
            } catch (error) {
              console.error(`Error generating ads for product ${i}, ad group ${j}:`, error);
            }
          }
        }

        setCurrentStep('complete');
      };

      generateAllAds();
    }
  }, [currentStep, products, patterns, generateRSA, generationProgress.adGroups]);

  // Save generated campaigns to store when complete
  useEffect(() => {
    if (currentStep === 'complete' && products.length > 0) {
      const campaigns: Campaign[] = products.map((product, index) => {
        const adGroups = generationProgress.adGroups[index] || [];
        const keywords = generationProgress.keywords[index] || [];
        const ads = generationProgress.ads[index] || [];

        const startDate = new Date();
        const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

        // Create a campaign for each product
        const campaign: Campaign = {
          id: `campaign-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
          name: `${product.name} - Campaign`,
          description: `Generated campaign for ${product.name}`,
          campaignPlan: {
            objective: 'drive_traffic',
            targetAudience: {
              demographics: {
                interests: [product.category || 'general'],
              },
            },
            budget: {
              total: 1000,
              daily: 100,
              currency: 'USD',
            },
            timeline: {
              startDate: startDate.toISOString(),
              endDate: endDate.toISOString(),
              duration: 30,
            },
            platforms: ['googleAds'],
            kpis: {
              primary: 'clicks',
              secondary: ['impressions', 'ctr'],
            },
            adGroups: adGroups.map((adGroup: any, adGroupIndex: number) => ({
              name: adGroup.name || `Ad Group ${adGroup.id}`,
              objective: 'drive_traffic',
              budget: 100,
              targeting: {
                keywords: keywords.map((k: any) => k.text || k.keyword || k),
              },
              ads: ads[adGroupIndex] ? [ads[adGroupIndex]] : [],
            })),
          },
          status: 'draft',
          platformCampaignIds: {},
          createdAt: new Date(),
          updatedAt: new Date(),
          metadata: {
            tags: [product.category || 'auto-generated'],
            notes: `Generated from product: ${product.name}\nURL: ${product.url}`,
            estimatedPerformance: {
              impressions: 10000,
              clicks: 100,
              conversions: 5,
              ctr: 0.01,
              confidence: 0.7,
            },
          },
        };

        return campaign;
      });

      // Add all campaigns to store
      campaigns.forEach((campaign) => {
        addCampaign(campaign);
      });

      // Also update the campaigns list (avoid duplicates)
      const currentCampaigns = useCampaignStore.getState().campaigns;
      const existingIds = new Set(currentCampaigns.map(c => c.id));
      const newCampaigns = campaigns.filter(c => !existingIds.has(c.id));
      if (newCampaigns.length > 0) {
        setCampaigns([...currentCampaigns, ...newCampaigns]);
      }

      // Store generated campaigns for navigation to preview
      setGeneratedCampaigns(campaigns);
    }
  }, [currentStep, products, generationProgress, addCampaign, setCampaigns]);

  const error = adGroupsError || keywordsError || adsError;

  // Helper function to determine class name for step
  const getStepBorder = (step: 'adgroups' | 'keywords' | 'ads' | 'complete', compareStep: 'adgroups' | 'keywords' | 'ads' | 'complete') => {
    if (step === compareStep) return 'border-primary bg-primary/5';
    if ((compareStep === 'adgroups' && (step === 'keywords' || step === 'ads' || step === 'complete')) ||
        (compareStep === 'keywords' && (step === 'ads' || step === 'complete'))) {
      return 'border-green-500/50 bg-green-500/5';
    }
    return 'border-muted';
  };

  // Helper to render step badge
  const renderStepBadge = (compareStep: 'keywords' | 'ads'): React.ReactNode => {
    if (compareStep === 'keywords') {
      if (currentStep === 'keywords') {
        return <Badge variant="default">In Progress</Badge>;
      }
      if (currentStep === 'adgroups') {
        return <Badge variant="secondary">Waiting</Badge>;
      }
      return <Badge variant="outline">Complete</Badge>;
    }
    // compareStep === 'ads'
    if (currentStep === 'ads') {
      return <Badge variant="default">In Progress</Badge>;
    }
    if (currentStep === 'complete') {
      return <Badge variant="outline">Complete</Badge>;
    }
    return <Badge variant="secondary">Waiting</Badge>;
  };

  // Helper to render step icon
  const renderStepIcon = (compareStep: 'keywords' | 'ads'): React.ReactNode => {
    if (compareStep === 'keywords') {
      if (currentStep === 'keywords') {
        return <Loader2Icon className="h-5 w-5 animate-spin text-primary" />;
      }
      if (currentStep === 'adgroups') {
        return <ClockIcon className="h-5 w-5 text-muted-foreground" />;
      }
      return <CheckCircle2Icon className="h-5 w-5 text-green-600" />;
    }
    // compareStep === 'ads'
    if (currentStep === 'ads') {
      return <Loader2Icon className="h-5 w-5 animate-spin text-primary" />;
    }
    if (currentStep === 'complete') {
      return <CheckCircle2Icon className="h-5 w-5 text-green-600" />;
    }
    return <ClockIcon className="h-5 w-5 text-muted-foreground" />;
  };

  if (products.length === 0) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="mx-auto max-w-3xl space-y-6">
          <Alert variant="destructive">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-4">
                <p>No products found. Please go back and upload products.</p>
                <Button onClick={() => navigate('/campaigns/csv-upload')} type="button">
                  <ArrowLeftIcon className="h-4 w-4" />
                  Go Back
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="mx-auto max-w-3xl space-y-6">
          <Alert variant="destructive">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-1">Error Generating Campaigns</h3>
                  <p className="text-sm">{error}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => navigate('/campaigns/csv-upload')} type="button">
                    <ArrowLeftIcon className="h-4 w-4" />
                    Go Back
                  </Button>
                  <Button onClick={() => window.location.reload()} type="button">
                    Retry
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (currentStep === 'complete') {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="mx-auto max-w-4xl space-y-8">
          <Card className="border-green-500/50 bg-green-500/5">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 rounded-full bg-green-500/10 p-4 w-fit">
                <CheckCircle2Icon className="h-12 w-12 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Campaign Generation Complete!</CardTitle>
              <CardDescription>
                Successfully generated campaigns for {products.length} product{products.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Generation Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {products.map((product, index) => (
                <div key={index} className="rounded-lg border p-4 space-y-2">
                  <h4 className="font-semibold">{product.name}</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Ad Groups</p>
                      <p className="text-2xl font-bold">{generationProgress.adGroups[index]?.length || 0}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Keywords</p>
                      <p className="text-2xl font-bold">{generationProgress.keywords[index]?.length || 0}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Ads</p>
                      <p className="text-2xl font-bold">{generationProgress.ads[index]?.length || 0}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-wrap justify-center gap-3 p-6">
              <Button variant="outline" onClick={() => navigate('/campaigns/csv-upload')} type="button">
                <SparklesIcon className="h-4 w-4" />
                Generate Another
              </Button>
              <Button
                onClick={() => navigate('/campaigns/preview', {
                  state: { campaigns: generatedCampaigns }
                })}
                type="button"
              >
                <EyeIcon className="h-4 w-4" />
                Preview & Edit
              </Button>
              <Button variant="outline" onClick={() => navigate('/campaigns')} type="button">
                <HomeIcon className="h-4 w-4" />
                View Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const progressPercentage =
    currentStep === 'adgroups' ? 33 :
    currentStep === 'keywords' ? 66 :
    currentStep === 'ads' ? 90 : 100;

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-4">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Generating Campaigns</h1>
            <p className="text-muted-foreground">
              Please wait while we generate your campaigns...
            </p>
          </div>
          <div className="flex justify-center">
            <ApiModeToggle />
          </div>
        </div>

        <Card>
          <CardContent className="py-8 space-y-8">
            {/* Overall Progress */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-muted-foreground">{progressPercentage}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>

            {/* Steps */}
            <div className="space-y-4">
              {/* Step 1: Ad Groups */}
              <div className={`flex items-start gap-4 p-4 rounded-lg border ${
                currentStep === 'adgroups' ? 'border-primary bg-primary/5' :
                currentStep === 'keywords' || currentStep === 'ads' || currentStep === 'complete' ? 'border-green-500/50 bg-green-500/5' : 'border-muted'
              }`}>
                <div className="mt-0.5">
                  {currentStep === 'adgroups' ? (
                    <Loader2Icon className="h-5 w-5 animate-spin text-primary" />
                  ) : (
                    <CheckCircle2Icon className="h-5 w-5 text-green-600" />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Generating Ad Groups</h3>
                    <Badge variant={currentStep === 'adgroups' ? 'default' : 'outline'}>
                      {currentStep === 'adgroups' ? 'In Progress' : 'Complete'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Step 2: Keywords */}
              <div className={`flex items-start gap-4 p-4 rounded-lg border ${getStepBorder(currentStep, 'keywords')}`}>
                <div className="mt-0.5">
                  {renderStepIcon('keywords')}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Generating Keywords</h3>
                    {renderStepBadge('keywords')}
                  </div>
                </div>
              </div>

              {/* Step 3: Ads */}
              <div className={`flex items-start gap-4 p-4 rounded-lg border ${getStepBorder(currentStep, 'ads')}`}>
                <div className="mt-0.5">
                  {renderStepIcon('ads')}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Generating Ads</h3>
                    {renderStepBadge('ads')}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Generating campaigns for {products.length} product{products.length !== 1 ? 's' : ''}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {products.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                <span className="font-medium">{product.name}</span>
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-1.5">
                    {generationProgress.adGroups[index] ? (
                      <CheckCircle2Icon className="h-4 w-4 text-green-600" />
                    ) : (
                      <ClockIcon className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-muted-foreground">Ad Groups</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {generationProgress.keywords[index] ? (
                      <CheckCircle2Icon className="h-4 w-4 text-green-600" />
                    ) : (
                      <ClockIcon className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-muted-foreground">Keywords</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {generationProgress.ads[index] ? (
                      <CheckCircle2Icon className="h-4 w-4 text-green-600" />
                    ) : (
                      <ClockIcon className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-muted-foreground">Ads</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CampaignGenerationScreen;

