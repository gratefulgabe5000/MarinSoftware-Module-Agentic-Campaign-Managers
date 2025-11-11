import React, { useEffect, useState } from 'react';
import { CampaignStatus as StatusEnum, StatusUpdate } from '../types/status.types';
import { CampaignStatus as CampaignStatusType } from '../types/campaign.types';
import { statusService } from '../services/statusService';
import { notificationService } from '../services/notificationService';
import { useCampaignStore } from '../store/campaignStore';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2Icon, CheckCircle2Icon, PlayCircleIcon, PauseCircleIcon, XCircleIcon, ClockIcon, AlertCircleIcon } from 'lucide-react';

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
  const updateCampaign = useCampaignStore((state) => state.updateCampaign);

  /**
   * Map StatusEnum to CampaignStatusType
   */
  const mapStatusToCampaignStatus = (status: StatusEnum): CampaignStatusType => {
    const statusMap: Record<StatusEnum, CampaignStatusType> = {
      [StatusEnum.DRAFT]: 'draft',
      [StatusEnum.CREATING]: 'creating',
      [StatusEnum.PENDING_APPROVAL]: 'pending_approval',
      [StatusEnum.APPROVED]: 'approved',
      [StatusEnum.ACTIVE]: 'active',
      [StatusEnum.PAUSED]: 'paused',
      [StatusEnum.COMPLETED]: 'completed',
      [StatusEnum.ARCHIVED]: 'archived',
      [StatusEnum.ERROR]: 'error',
    };
    return statusMap[status] || 'draft';
  };

  /**
   * Sync status with initialStatus prop changes
   */
  useEffect(() => {
    if (initialStatus && initialStatus !== status) {
      setStatus(initialStatus);
    }
  }, [initialStatus, status]);

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

        // Update campaign status in store on initial load
        const campaignStatus = mapStatusToCampaignStatus(update.status);
        updateCampaign(campaignId, { status: campaignStatus });
      } catch (err) {
        console.error('Error loading campaign status:', err);
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

      // Add to history only if status changed
      setStatusHistory((prev) => {
        const updated = [...prev];
        const lastUpdate = updated[updated.length - 1];
        // Only add if status actually changed, not just timestamp
        if (!lastUpdate || lastUpdate.status !== update.status) {
          updated.push(update);
        }
        return updated;
      });

      // Update campaign status in store if status changed
      if (previousStatus && previousStatus !== update.status) {
        const campaignStatus = mapStatusToCampaignStatus(update.status);
        updateCampaign(campaignId, { status: campaignStatus });
      }

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
   * Get status badge variant
   */
  const getStatusVariant = (status: StatusEnum | null): 'default' | 'secondary' | 'destructive' | 'outline' => {
    if (!status) return 'outline';

    switch (status) {
      case StatusEnum.ACTIVE:
        return 'default';
      case StatusEnum.PAUSED:
      case StatusEnum.COMPLETED:
        return 'secondary';
      case StatusEnum.ERROR:
        return 'destructive';
      default:
        return 'outline';
    }
  };

  /**
   * Get status icon
   */
  const getStatusIcon = (status: StatusEnum | null) => {
    if (!status) return <AlertCircleIcon className="h-4 w-4" />;

    switch (status) {
      case StatusEnum.ACTIVE:
        return <PlayCircleIcon className="h-4 w-4" />;
      case StatusEnum.PAUSED:
        return <PauseCircleIcon className="h-4 w-4" />;
      case StatusEnum.CREATING:
        return <Loader2Icon className="h-4 w-4 animate-spin" />;
      case StatusEnum.ERROR:
        return <XCircleIcon className="h-4 w-4" />;
      case StatusEnum.COMPLETED:
        return <CheckCircle2Icon className="h-4 w-4" />;
      case StatusEnum.DRAFT:
      case StatusEnum.PENDING_APPROVAL:
      case StatusEnum.APPROVED:
        return <ClockIcon className="h-4 w-4" />;
      case StatusEnum.ARCHIVED:
        return <CheckCircle2Icon className="h-4 w-4" />;
      default:
        return <AlertCircleIcon className="h-4 w-4" />;
    }
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
      <div className="flex items-center justify-center gap-2 py-4">
        <Loader2Icon className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Loading status...</span>
      </div>
    );
  }

  if (error && !status) {
    return (
      <Alert variant="destructive">
        <AlertCircleIcon className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* Current Status */}
      <div className="flex items-center gap-3">
        <Badge variant={getStatusVariant(status)} className="flex items-center gap-1.5 px-3 py-1.5">
          {getStatusIcon(status)}
          {getStatusText(status)}
        </Badge>
        {statusUpdate && statusUpdate.timestamp && (
          <span className="text-xs text-muted-foreground">
            Last updated: {new Date(statusUpdate.timestamp).toLocaleString()}
          </span>
        )}
      </div>

      {/* Status Message */}
      {statusUpdate && statusUpdate.message && (
        <p className="text-sm text-muted-foreground">{statusUpdate.message}</p>
      )}

      {/* Error Alert */}
      {statusUpdate && statusUpdate.error && (
        <Alert variant="destructive">
          <AlertCircleIcon className="h-4 w-4" />
          <AlertDescription>{statusUpdate.error}</AlertDescription>
        </Alert>
      )}

      {/* Platform Information */}
      {statusUpdate && statusUpdate.platform && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Platform:</span>
          <span className="font-medium">{statusUpdate.platform}</span>
          {statusUpdate.platformStatus && (
            <Badge variant="outline" className="text-xs">
              {statusUpdate.platformStatus}
            </Badge>
          )}
        </div>
      )}

      {/* Status History */}
      {showHistory && statusHistory.length > 0 && (
        <div className="space-y-2 mt-4 pt-4 border-t">
          <h4 className="text-sm font-semibold">Status History</h4>
          <div className="space-y-2">
            {statusHistory.map((update, index) => (
              <div
                key={index}
                className="flex items-start justify-between gap-4 text-xs py-2 px-3 rounded-md bg-muted/50"
              >
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {getStatusText(update.status)}
                  </Badge>
                  {update.message && (
                    <span className="text-muted-foreground">{update.message}</span>
                  )}
                </div>
                <span className="text-muted-foreground whitespace-nowrap">
                  {new Date(update.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignStatus;

