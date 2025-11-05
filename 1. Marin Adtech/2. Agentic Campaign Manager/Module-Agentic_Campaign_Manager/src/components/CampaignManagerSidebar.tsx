import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCampaignStore } from '../store/campaignStore';
import { campaignService } from '../services/campaignService';
import { Campaign } from '../types/campaign.types';

/**
 * Campaign Manager Sidebar Props
 */
interface CampaignManagerSidebarProps {
  activeCampaignId?: string;
  onCampaignSelect?: (campaignId: string) => void;
}

/**
 * Campaign Manager Sidebar Component
 * Displays campaign list and quick actions in sidebar
 */
const CampaignManagerSidebar: React.FC<CampaignManagerSidebarProps> = ({
  activeCampaignId,
  onCampaignSelect,
}) => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const storeCampaigns = useCampaignStore((state) => state.campaigns);
  const setCampaignsStore = useCampaignStore((state) => state.setCampaigns);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      setIsLoading(true);

      // Try to load from store first
      if (storeCampaigns.length > 0) {
        setCampaigns(storeCampaigns);
        setIsLoading(false);
        return;
      }

      // Load from API
      const campaignsData = await campaignService.getAllCampaigns();
      setCampaigns(campaignsData);
      setCampaignsStore(campaignsData);
    } catch (error) {
      console.error('Error loading campaigns:', error);
      // Use store campaigns as fallback
      if (storeCampaigns.length > 0) {
        setCampaigns(storeCampaigns);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCampaigns = campaigns.filter((campaign) =>
    campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    campaign.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active':
        return '#34A853';
      case 'paused':
        return '#FBBC04';
      case 'creating':
        return '#4285F4';
      case 'error':
        return '#EA4335';
      default:
        return '#9AA0A6';
    }
  };

  const handleCampaignClick = (campaignId: string) => {
    if (onCampaignSelect) {
      onCampaignSelect(campaignId);
    }
    navigate(`/campaign/${campaignId}`);
  };

  return (
    <div className="campaign-manager-sidebar">
      <div className="sidebar-header">
        <h3 className="sidebar-title">Campaigns</h3>
        <button
          className="btn btn-primary btn-small"
          onClick={() => navigate('/create')}
          type="button"
          title="Create New Campaign"
        >
          + New
        </button>
      </div>

      <div className="sidebar-search">
        <input
          type="text"
          className="search-input"
          placeholder="Search campaigns..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="sidebar-loading">
          <div className="loading-spinner small" />
          <span>Loading campaigns...</span>
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <div className="sidebar-empty">
          <p>No campaigns found</p>
          {searchQuery && (
            <button
              className="btn btn-link"
              onClick={() => setSearchQuery('')}
              type="button"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="sidebar-campaigns-list">
          {filteredCampaigns.map((campaign) => (
            <div
              key={campaign.id}
              className={`sidebar-campaign-item ${
                activeCampaignId === campaign.id ? 'active' : ''
              }`}
              onClick={() => handleCampaignClick(campaign.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleCampaignClick(campaign.id);
                }
              }}
            >
              <div className="campaign-item-header">
                <h4 className="campaign-item-name">{campaign.name}</h4>
                <span
                  className="campaign-item-status"
                  style={{
                    backgroundColor: getStatusColor(campaign.status),
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '8px',
                    fontSize: '10px',
                    fontWeight: 'bold',
                  }}
                >
                  {campaign.status}
                </span>
              </div>
              {campaign.description && (
                <p className="campaign-item-description">{campaign.description}</p>
              )}
              <div className="campaign-item-meta">
                <span className="campaign-item-platforms">
                  {campaign.campaignPlan.platforms.join(', ')}
                </span>
                <span className="campaign-item-budget">
                  {campaign.campaignPlan.budget.currency}
                  {campaign.campaignPlan.budget.total.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="sidebar-footer">
        <div className="sidebar-quick-actions">
          <Link to="/create" className="quick-action-link">
            <span className="quick-action-icon">➕</span>
            <span className="quick-action-label">Create Campaign</span>
          </Link>
          <Link to="/" className="quick-action-link">
            <span className="quick-action-icon">📊</span>
            <span className="quick-action-label">Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CampaignManagerSidebar;

