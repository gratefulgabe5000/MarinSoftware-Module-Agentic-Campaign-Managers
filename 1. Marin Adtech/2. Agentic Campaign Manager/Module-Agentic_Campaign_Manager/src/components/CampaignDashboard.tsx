import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCampaignStore } from '../store/campaignStore';
import { campaignService } from '../services/campaignService';
import { toastService } from '../utils/toastService';
import { Campaign } from '../types/campaign.types';

/**
 * Campaign Dashboard Component
 * Displays list of campaigns and provides navigation
 */
const CampaignDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const storeCampaigns = useCampaignStore((state) => state.campaigns);
  const setCampaignsStore = useCampaignStore((state) => state.setCampaigns);
  const removeCampaign = useCampaignStore((state) => state.removeCampaign);
  const [deletingCampaignId, setDeletingCampaignId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadCampaigns();
  }, []);

  // Update campaigns when store changes
  useEffect(() => {
    // Always sync with store campaigns (even if empty or when individual campaigns update)
    setCampaigns(storeCampaigns);
  }, [storeCampaigns]);

  const loadCampaigns = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Always use store campaigns if available (they're the source of truth)
      // Only fetch from API if store is empty
      if (storeCampaigns.length > 0) {
        setCampaigns(storeCampaigns);
        setIsLoading(false);
        // Optionally refresh from API in the background
        try {
          const campaignsData = await campaignService.getAllCampaigns();
          setCampaignsStore(campaignsData);
          setCampaigns(campaignsData);
        } catch (apiError) {
          // Silent fail - use store data
          console.warn('Failed to refresh campaigns from API:', apiError);
        }
        return;
      }

      // Load from API if store is empty
      const campaignsData = await campaignService.getAllCampaigns();
      setCampaigns(campaignsData);
      setCampaignsStore(campaignsData);
    } catch (error) {
      console.error('Error loading campaigns:', error);
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to load campaigns'
      );
      // Use store campaigns as fallback
      if (storeCampaigns.length > 0) {
        setCampaigns(storeCampaigns);
      }
    } finally {
      setIsLoading(false);
    }
  };

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

  const getStatusLabel = (status: string): string => {
    return status
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
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

  if (isLoading) {
    return (
      <div className="campaign-dashboard">
        <div className="dashboard-loading">
          <div className="loading-spinner" />
          <p>Loading campaigns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="campaign-dashboard">
      <div className="dashboard-header">
        <h2 className="dashboard-title">Campaign Dashboard</h2>
        <div className="dashboard-actions">
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/campaigns/csv-upload')}
            type="button"
          >
            📊 Bulk Generate from CSV/URLs
          </button>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/create')}
            type="button"
          >
            + Create New Campaign
          </button>
        </div>
      </div>

      {error && (
        <div className="dashboard-error">
          <p>{error}</p>
          <button
            className="btn btn-secondary"
            onClick={loadCampaigns}
            type="button"
          >
            Retry
          </button>
        </div>
      )}

      {campaigns.length === 0 ? (
        <div className="dashboard-empty">
          <p>No campaigns found. Create your first campaign to get started!</p>
        </div>
      ) : (
        <div className="campaigns-list">
          <h3 className="section-title">Your Campaigns</h3>
          <div className="campaigns-grid">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="campaign-card">
                <div className="campaign-card-header">
                  <h4 className="campaign-name">{campaign.name}</h4>
                  <span
                    className="campaign-status"
                    style={{
                      backgroundColor: getStatusColor(campaign.status),
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                    }}
                  >
                    {getStatusLabel(campaign.status)}
                  </span>
                </div>

                {campaign.description && (
                  <p className="campaign-description">{campaign.description}</p>
                )}

                <div className="campaign-meta">
                  <div className="campaign-meta-item">
                    <span className="meta-label">Platforms:</span>
                    <span className="meta-value">
                      {campaign.campaignPlan.platforms.join(', ')}
                    </span>
                  </div>
                  <div className="campaign-meta-item">
                    <span className="meta-label">Budget:</span>
                    <span className="meta-value">
                      {campaign.campaignPlan.budget.currency}{' '}
                      {campaign.campaignPlan.budget.total.toLocaleString()}
                    </span>
                  </div>
                  <div className="campaign-meta-item">
                    <span className="meta-label">Created:</span>
                    <span className="meta-value">
                      {new Date(campaign.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="campaign-actions">
                  <Link
                    to={`/campaign/${campaign.id}`}
                    className="btn btn-secondary"
                  >
                    View Details
                  </Link>
                  <Link
                    to={`/campaign/${campaign.id}/performance`}
                    className="btn btn-primary"
                  >
                    View Performance
                  </Link>
                  <button
                    className="btn btn-danger"
                    onClick={(e) => {
                      e.preventDefault();
                      handleDeleteClick(campaign.id);
                    }}
                    disabled={deletingCampaignId === campaign.id}
                    type="button"
                    title="Delete Campaign"
                  >
                    {deletingCampaignId === campaign.id ? 'Deleting...' : '🗑️ Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="confirm-dialog-overlay">
          <div className="confirm-dialog">
            <h4>Delete Campaign?</h4>
            <p>
              Are you sure you want to delete "{campaigns.find((c) => c.id === showDeleteConfirm)?.name}"? 
              This action cannot be undone.
            </p>
            <div className="confirm-dialog-buttons">
              <button
                className="confirm-btn confirm-btn-primary"
                onClick={() => handleConfirmDelete(showDeleteConfirm)}
                type="button"
              >
                Delete
              </button>
              <button
                className="confirm-btn confirm-btn-secondary"
                onClick={handleCancelDelete}
                type="button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignDashboard;
