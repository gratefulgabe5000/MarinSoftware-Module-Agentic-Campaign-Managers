import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCampaignStore } from '../store/campaignStore';
import { campaignService } from '../services/campaignService';
import { Campaign } from '../types/campaign.types';
import CampaignOverviewCard from './CampaignOverviewCard';
import CampaignStatus from './CampaignStatus';
import CampaignActions from './CampaignActions';

/**
 * Campaign Detail Component
 * Displays campaign details and status
 */
const CampaignDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const getCampaignById = useCampaignStore((state) => state.getCampaignById);
  const currentCampaign = useCampaignStore((state) => state.currentCampaign);

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

        // Try to get from store first
        let campaignData = getCampaignById(id);
        
        // If not in store, try current campaign
        if (!campaignData && currentCampaign?.id === id) {
          campaignData = currentCampaign;
        }

        // If still not found, fetch from API
        if (!campaignData) {
          campaignData = await campaignService.getCampaign(id);
        }

        setCampaign(campaignData);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load campaign');
      } finally {
        setIsLoading(false);
      }
    };

    loadCampaign();
  }, [id, getCampaignById, currentCampaign]);

  if (isLoading) {
    return (
      <div className="campaign-detail loading">
        <div className="loading-spinner">Loading campaign details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="campaign-detail error">
        <div className="error-message">
          <span>⚠️ {error}</span>
        </div>
        <button onClick={() => navigate('/campaigns')} className="back-button">
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="campaign-detail empty">
        <div className="empty-state">
          <h2>Campaign Not Found</h2>
          <p>The campaign you're looking for doesn't exist.</p>
          <button onClick={() => navigate('/')} className="back-button">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="campaign-detail">
      <div className="campaign-detail-header">
        <button onClick={() => navigate('/campaigns')} className="back-button">
          ← Back
        </button>
        <div>
          <h2>{campaign.name}</h2>
          <p className="campaign-status">
            Status: <span className={`status-badge status-${campaign.status}`}>
              {campaign.status.replace('_', ' ')}
            </span>
          </p>
        </div>
      </div>

      <div className="campaign-detail-content">
        {campaign.campaignPlan && (
          <CampaignOverviewCard campaignPlan={campaign.campaignPlan} />
        )}

        <div className="campaign-status-card card">
          <div className="card-header">
            <h3>Campaign Status</h3>
          </div>
          <div className="card-content">
            <CampaignStatus
              campaignId={campaign.id}
              initialStatus={campaign.status as 'draft' | 'creating' | 'pending_approval' | 'approved' | 'active' | 'paused' | 'completed' | 'archived' | 'error'}
              showHistory={true}
              pollingInterval={5000}
              enableNotifications={true}
              campaignName={campaign.name}
            />
          </div>
        </div>

        <div className="campaign-info-card card">
          <div className="card-header">
            <h3>Campaign Information</h3>
          </div>
          <div className="card-content">
            <div className="info-item">
              <label>Campaign ID:</label>
              <span>{campaign.id}</span>
            </div>
            <div className="info-item">
              <label>Created:</label>
              <span>{new Date(campaign.createdAt).toLocaleString()}</span>
            </div>
            <div className="info-item">
              <label>Updated:</label>
              <span>{new Date(campaign.updatedAt).toLocaleString()}</span>
            </div>
            {campaign.description && (
              <div className="info-item">
                <label>Description:</label>
                <span>{campaign.description}</span>
              </div>
            )}
          </div>
        </div>

        {campaign.platformCampaignIds && Object.keys(campaign.platformCampaignIds).length > 0 && (
          <div className="platform-campaigns-card card">
            <div className="card-header">
              <h3>Platform Campaign IDs</h3>
            </div>
            <div className="card-content">
              {Object.entries(campaign.platformCampaignIds).map(([platform, campaignId]) => (
                <div key={platform} className="platform-item">
                  <label>{platform}:</label>
                  <span className="platform-id">{campaignId}</span>
                  {campaignId && (
                    <a
                      href={`https://ads.google.com/campaigns/${campaignId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="platform-link"
                    >
                      View in Platform →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="campaign-actions-card card">
          <div className="card-header">
            <h3>Campaign Actions</h3>
          </div>
          <div className="card-content">
            <CampaignActions
              campaign={campaign}
              onUpdate={(updatedCampaign) => {
                setCampaign(updatedCampaign);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetail;

