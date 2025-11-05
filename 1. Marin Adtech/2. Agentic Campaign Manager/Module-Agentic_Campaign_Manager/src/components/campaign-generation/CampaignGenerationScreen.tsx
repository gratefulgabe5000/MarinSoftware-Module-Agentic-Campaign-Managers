import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ProductInput } from '../../types/product.types';
import { CampaignPatterns } from '../../types/campaign-patterns.types';
import { useAdGroupGeneration } from '../../hooks/useAdGroupGeneration';
import { useKeywordGeneration } from '../../hooks/useKeywordGeneration';
import { useRSAGeneration } from '../../hooks/useRSAGeneration';
import { useCampaignStore } from '../../store/campaignStore';
import { Campaign } from '../../types/campaign.types';
import LoadingSpinner from '../LoadingSpinner';

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

  const { generateAdGroups, loading: adGroupsLoading, error: adGroupsError } = useAdGroupGeneration();
  const { generateKeywords, loading: keywordsLoading, error: keywordsError } = useKeywordGeneration();
  const { generateRSA, loading: adsLoading, error: adsError } = useRSAGeneration();
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
            adGroups: adGroups.map((adGroup: any) => ({
              name: adGroup.name || `Ad Group ${adGroup.id}`,
              objective: 'drive_traffic',
              budget: 100,
              targeting: {
                keywords: keywords.map((k: any) => k.text || k.keyword || k),
              },
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
    }
  }, [currentStep, products, generationProgress, addCampaign, setCampaigns]);

  const isLoading = adGroupsLoading || keywordsLoading || adsLoading;
  const error = adGroupsError || keywordsError || adsError;

  if (products.length === 0) {
    return (
      <div className="campaign-generation-screen">
        <div className="campaign-generation-header">
          <h1>Campaign Generation</h1>
        </div>
        <div className="campaign-generation-error">
          <p>No products found. Please go back and upload products.</p>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/campaigns/csv-upload')}
            type="button"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="campaign-generation-screen">
        <div className="campaign-generation-header">
          <h1>Campaign Generation</h1>
        </div>
        <div className="campaign-generation-error">
          <h3>Error Generating Campaigns</h3>
          <p>{error}</p>
          <div className="error-actions">
            <button
              className="btn btn-secondary"
              onClick={() => navigate('/campaigns/csv-upload')}
              type="button"
            >
              Go Back
            </button>
            <button
              className="btn btn-primary"
              onClick={() => window.location.reload()}
              type="button"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'complete') {
    return (
      <div className="campaign-generation-screen">
        <div className="campaign-generation-header">
          <h1>Campaign Generation Complete</h1>
        </div>
        <div className="campaign-generation-success">
          <p>✅ Successfully generated campaigns for {products.length} product(s)</p>
          <div className="generation-summary">
            <h3>Generation Summary</h3>
            <ul>
              {products.map((product, index) => (
                <li key={index}>
                  <strong>{product.name}</strong>
                  <ul>
                    <li>Ad Groups: {generationProgress.adGroups[index]?.length || 0}</li>
                    <li>Keywords: {generationProgress.keywords[index]?.length || 0}</li>
                    <li>Ads: {generationProgress.ads[index]?.length || 0}</li>
                  </ul>
                </li>
              ))}
            </ul>
          </div>
          <div className="generation-actions">
            <button
              className="btn btn-secondary"
              onClick={() => navigate('/campaigns/csv-upload')}
              type="button"
            >
              Generate Another
            </button>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/')}
              type="button"
            >
              View Campaigns
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="campaign-generation-screen">
      <div className="campaign-generation-header">
        <h1>Generating Campaigns</h1>
        <p>Please wait while we generate your campaigns...</p>
      </div>
      <div className="campaign-generation-progress">
        <LoadingSpinner />
        <div className="progress-steps">
          <div className={`progress-step ${currentStep === 'adgroups' ? 'active' : currentStep === 'keywords' || currentStep === 'ads' || currentStep === 'complete' ? 'completed' : ''}`}>
            <span className="step-number">1</span>
            <span className="step-label">Generating Ad Groups</span>
            {currentStep === 'adgroups' && <span className="step-status">In Progress...</span>}
            {currentStep !== 'adgroups' && <span className="step-status">✓ Complete</span>}
          </div>
          <div className={`progress-step ${currentStep === 'keywords' ? 'active' : currentStep === 'ads' || currentStep === 'complete' ? 'completed' : ''}`}>
            <span className="step-number">2</span>
            <span className="step-label">Generating Keywords</span>
            {currentStep === 'keywords' && <span className="step-status">In Progress...</span>}
            {currentStep === 'ads' || currentStep === 'complete' ? <span className="step-status">✓ Complete</span> : <span className="step-status">Waiting...</span>}
          </div>
          <div className={`progress-step ${currentStep === 'ads' ? 'active' : currentStep === 'complete' ? 'completed' : ''}`}>
            <span className="step-number">3</span>
            <span className="step-label">Generating Ads</span>
            {currentStep === 'ads' && <span className="step-status">In Progress...</span>}
            {currentStep === 'complete' ? <span className="step-status">✓ Complete</span> : <span className="step-status">Waiting...</span>}
          </div>
        </div>
        <div className="progress-details">
          <p>Generating campaigns for {products.length} product(s)...</p>
          <div className="product-progress">
            {products.map((product, index) => (
              <div key={index} className="product-progress-item">
                <span>{product.name}</span>
                <span>
                  {generationProgress.adGroups[index] ? '✓' : '⏳'} Ad Groups |{' '}
                  {generationProgress.keywords[index] ? '✓' : '⏳'} Keywords |{' '}
                  {generationProgress.ads[index] ? '✓' : '⏳'} Ads
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignGenerationScreen;

