import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCampaignStore } from '../../store/campaignStore';
import { useCampaignPreviewStore } from '../../store/campaignPreviewStore';
import { Campaign } from '../../types/campaign.types';
import { CampaignPreviewData, AdGroupPreviewRow } from '../../types/campaign-preview.types';
import { GeneratedAdGroup } from '../../types/adgroup-generation.types';
import CampaignPreviewTable from './CampaignPreviewTable';
import LoadingSpinner from '../LoadingSpinner';

/**
 * Campaign Preview Screen
 * Displays generated campaigns in a spreadsheet-like interface for editing and export
 */
const CampaignPreviewScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignPreviewData | null>(null);
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

  // Set preview data when campaign is selected
  useEffect(() => {
    if (selectedCampaign) {
      setPreviewData(selectedCampaign);
      validateCampaign();
    }
  }, [selectedCampaign, setPreviewData, validateCampaign]);

  // Transform campaign to preview data
  const transformCampaignToPreview = (campaign: Campaign): CampaignPreviewData => {
    const adGroups: AdGroupPreviewRow[] = [];
    
    // Extract ad groups from campaign plan
    if (campaign.campaignPlan?.adGroups) {
      campaign.campaignPlan.adGroups.forEach((adGroupPlan, index) => {
        // Get keywords from targeting.keywords (array of strings)
        const keywords = adGroupPlan.targeting?.keywords || [];
        
        // For MVP, we'll create placeholder ads since ads aren't stored in campaignPlan yet
        // In the future, ads should be stored in the campaign structure
        const ads: any[] = []; // TODO: Extract ads from campaign metadata or store

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
            id: `ad-${index}-${adIndex}`,
            adGroupId: `adgroup-${index}`,
            headlines: ad.headlines?.map((h, hIndex) => ({
              text: typeof h === 'string' ? h : h.text || h,
              pinned: false,
              position: hIndex,
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

  // Handle campaign selection
  const handleCampaignSelect = (campaignId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (campaign) {
      setSelectedCampaign(transformCampaignToPreview(campaign));
    }
  };

  // Handle back to dashboard
  const handleBackToDashboard = () => {
    navigate('/');
  };

  // Handle back to generation
  const handleBackToGeneration = () => {
    navigate('/campaigns/generate');
  };

  if (isLoading) {
    return (
      <div className="campaign-preview-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="campaign-preview-screen">
        <div className="preview-header">
          <h1>Campaign Preview</h1>
        </div>
        <div className="preview-empty">
          <p>No campaigns found. Generate campaigns first.</p>
          <div className="preview-actions">
            <button
              className="btn btn-primary"
              onClick={handleBackToGeneration}
              type="button"
            >
              Generate Campaigns
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleBackToDashboard}
              type="button"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="campaign-preview-screen">
      <div className="preview-header">
        <div className="preview-header-content">
          <h1>Campaign Preview & Edit</h1>
          <p>Review and edit your generated campaigns before exporting</p>
        </div>
        <div className="preview-header-actions">
          {campaigns.length > 1 && (
            <select
              className="campaign-select"
              value={selectedCampaign?.campaignId || ''}
              onChange={(e) => handleCampaignSelect(e.target.value)}
            >
              <option value="">Select a campaign...</option>
              {campaigns.map((campaign) => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.name}
                </option>
              ))}
            </select>
          )}
          <button
            className="btn btn-secondary"
            onClick={handleBackToDashboard}
            type="button"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {error && (
        <div className="preview-error">
          <p>⚠️ {error}</p>
        </div>
      )}

      {/* Validation Summary */}
      {validationResult && (
        <div className={`validation-summary ${validationResult.isValid ? 'valid' : 'invalid'}`}>
          <div className="validation-header">
            <h3>Validation Summary</h3>
            {hasUnsavedChanges && (
              <button
                className="btn btn-sm btn-secondary"
                onClick={saveDraft}
                type="button"
              >
                Save Draft
              </button>
            )}
          </div>
          {validationResult.isValid ? (
            <div className="validation-success">
              ✅ All fields are valid. Ready to export.
            </div>
          ) : (
            <div className="validation-errors">
              <p>❌ {validationResult.errors.length} error(s) found:</p>
              <ul>
                {validationResult.errors.slice(0, 10).map((error, index) => (
                  <li key={index}>
                    <strong>{error.field}</strong>: {error.message}
                  </li>
                ))}
                {validationResult.errors.length > 10 && (
                  <li>... and {validationResult.errors.length - 10} more errors</li>
                )}
              </ul>
            </div>
          )}
          {validationResult.warnings.length > 0 && (
            <div className="validation-warnings">
              <p>⚠️ {validationResult.warnings.length} warning(s):</p>
              <ul>
                {validationResult.warnings.slice(0, 5).map((warning, index) => (
                  <li key={index}>
                    <strong>{warning.field}</strong>: {warning.message}
                  </li>
                ))}
                {validationResult.warnings.length > 5 && (
                  <li>... and {validationResult.warnings.length - 5} more warnings</li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}

      {selectedCampaign ? (
        <CampaignPreviewTable previewData={selectedCampaign} />
      ) : campaigns.length === 1 ? (
        <CampaignPreviewTable previewData={transformCampaignToPreview(campaigns[0])} />
      ) : (
        <div className="preview-select">
          <p>Please select a campaign to preview</p>
        </div>
      )}
    </div>
  );
};

export default CampaignPreviewScreen;

