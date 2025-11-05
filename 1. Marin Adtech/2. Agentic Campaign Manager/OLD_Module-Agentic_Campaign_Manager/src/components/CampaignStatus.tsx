import React, { useEffect, useState } from 'react';
import { CampaignStatus as StatusEnum, StatusUpdate } from '../types/status.types';
import { statusService } from '../services/statusService';
import { notificationService } from '../services/notificationService';

/**
 * CampaignStatus Component Props
 */
interface CampaignStatusProps {
  campaignId: string;
  initialStatus?: StatusEnum;
  onStatusUpdate?: (status: StatusUpdate) => void;
  showHistory?: boolean;
  pollingInterval?: number;
  enableNotifications?: boolean;
  campaignName?: string;
}

/**
 * CampaignStatus Component
 * Displays campaign status with real-time updates
 */
const CampaignStatus: React.FC<CampaignStatusProps> = ({
  campaignId,
  initialStatus,
  onStatusUpdate,
  showHistory = false,
  pollingInterval = 5000,
  enableNotifications = true,
  campaignName = 'Campaign',
}) => {
  const [status, setStatus] = useState<StatusEnum | null>(initialStatus || null);
  const [statusUpdate, setStatusUpdate] = useState<StatusUpdate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusHistory, setStatusHistory] = useState<StatusUpdate[]>([]);

  /**
   * Load initial status
   */
  useEffect(() => {
    const loadStatus = async () => {
      if (!campaignId) return;

      setIsLoading(true);
      setError(null);

      try {
        const update = await statusService.getCampaignStatus(campaignId);
        setStatus(update.status);
        setStatusUpdate(update);
        setStatusHistory([update]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load status');
      } finally {
        setIsLoading(false);
      }
    };

    loadStatus();
  }, [campaignId]);

  /**
   * Start status monitoring
   */
  useEffect(() => {
    if (!campaignId || !status) return;

    const handleStatusUpdate = (update: StatusUpdate) => {
      const previousStatus = status;
      setStatus(update.status);
      setStatusUpdate(update);

      // Add to history
      setStatusHistory((prev) => {
        const updated = [...prev];
        const lastUpdate = updated[updated.length - 1];
        if (!lastUpdate || lastUpdate.timestamp.getTime() !== update.timestamp.getTime()) {
          updated.push(update);
        }
        return updated;
      });

      // Show notification if status changed and notifications are enabled
      if (enableNotifications && previousStatus && previousStatus !== update.status) {
        notificationService
          .showCampaignStatusNotification(
            campaignId,
            campaignName,
            update.status,
            update.message
          )
          .catch((error) => {
            console.error('Failed to show notification:', error);
          });
      }

      // Call external callback
      if (onStatusUpdate) {
        onStatusUpdate(update);
      }
    };

    // Start monitoring
    statusService.startMonitoring(campaignId, handleStatusUpdate, {
      interval: pollingInterval,
    });

    // Cleanup on unmount
    return () => {
      statusService.stopMonitoring(campaignId);
    };
  }, [campaignId, status, pollingInterval, onStatusUpdate]);

  /**
   * Get status display class
   */
  const getStatusClass = (status: StatusEnum | null): string => {
    if (!status) return 'status-unknown';
    
    const statusMap: Record<StatusEnum, string> = {
      [StatusEnum.DRAFT]: 'status-draft',
      [StatusEnum.CREATING]: 'status-creating',
      [StatusEnum.PENDING_APPROVAL]: 'status-pending',
      [StatusEnum.APPROVED]: 'status-approved',
      [StatusEnum.ACTIVE]: 'status-active',
      [StatusEnum.PAUSED]: 'status-paused',
      [StatusEnum.COMPLETED]: 'status-completed',
      [StatusEnum.ARCHIVED]: 'status-archived',
      [StatusEnum.ERROR]: 'status-error',
    };

    return statusMap[status] || 'status-unknown';
  };

  /**
   * Get status display text
   */
  const getStatusText = (status: StatusEnum | null): string => {
    if (!status) return 'Unknown';

    const statusMap: Record<StatusEnum, string> = {
      [StatusEnum.DRAFT]: 'Draft',
      [StatusEnum.CREATING]: 'Creating',
      [StatusEnum.PENDING_APPROVAL]: 'Pending Approval',
      [StatusEnum.APPROVED]: 'Approved',
      [StatusEnum.ACTIVE]: 'Active',
      [StatusEnum.PAUSED]: 'Paused',
      [StatusEnum.COMPLETED]: 'Completed',
      [StatusEnum.ARCHIVED]: 'Archived',
      [StatusEnum.ERROR]: 'Error',
    };

    return statusMap[status] || 'Unknown';
  };

  if (isLoading && !status) {
    return (
      <div className="campaign-status loading">
        <div className="loading-spinner">Loading status...</div>
      </div>
    );
  }

  if (error && !status) {
    return (
      <div className="campaign-status error">
        <div className="error-message">
          <span>⚠️ {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="campaign-status">
      <div className="status-display">
        <div className={`status-badge ${getStatusClass(status)}`}>
          <span className="status-icon">
            {status === StatusEnum.ACTIVE && '▶️'}
            {status === StatusEnum.PAUSED && '⏸️'}
            {status === StatusEnum.CREATING && '⏳'}
            {status === StatusEnum.ERROR && '❌'}
            {status === StatusEnum.COMPLETED && '✅'}
            {!status && '❓'}
          </span>
          <span className="status-text">{getStatusText(status)}</span>
        </div>

        {statusUpdate && statusUpdate.message && (
          <div className="status-message">{statusUpdate.message}</div>
        )}

        {statusUpdate && statusUpdate.error && (
          <div className="status-error">
            <span>⚠️ {statusUpdate.error}</span>
          </div>
        )}

        {statusUpdate && statusUpdate.platform && (
          <div className="status-platform">
            <span className="platform-label">Platform:</span>
            <span className="platform-value">{statusUpdate.platform}</span>
            {statusUpdate.platformStatus && (
              <span className="platform-status">({statusUpdate.platformStatus})</span>
            )}
          </div>
        )}

        {statusUpdate && statusUpdate.timestamp && (
          <div className="status-timestamp">
            Last updated: {new Date(statusUpdate.timestamp).toLocaleString()}
          </div>
        )}
      </div>

      {showHistory && statusHistory.length > 0 && (
        <div className="status-history">
          <h4>Status History</h4>
          <div className="history-list">
            {statusHistory.map((update, index) => (
              <div key={index} className="history-item">
                <span className="history-status">{getStatusText(update.status)}</span>
                <span className="history-time">
                  {new Date(update.timestamp).toLocaleString()}
                </span>
                {update.message && (
                  <span className="history-message">{update.message}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignStatus;

