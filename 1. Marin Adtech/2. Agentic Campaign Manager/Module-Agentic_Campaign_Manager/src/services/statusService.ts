import axios from 'axios';
import { CampaignStatus, StatusUpdate, StatusPollingConfig } from '../types/status.types';

const API_BASE_URL = 
  typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL
    ? import.meta.env.VITE_API_BASE_URL
    : 'http://localhost:3001/api';

/**
 * Status Service
 * Handles campaign status tracking and polling
 */
class StatusService {
  private baseURL: string;
  private pollingIntervals: Map<string, NodeJS.Timeout>;
  private statusCallbacks: Map<string, (status: StatusUpdate) => void>;
  private defaultConfig: StatusPollingConfig = {
    enabled: true,
    interval: 5000, // 5 seconds
    timeout: 30000, // 30 seconds
    maxRetries: 3,
  };

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.pollingIntervals = new Map();
    this.statusCallbacks = new Map();
  }

  /**
   * Get campaign status
   */
  async getCampaignStatus(campaignId: string): Promise<StatusUpdate> {
    try {
      const response = await axios.get<StatusUpdate>(
        `${this.baseURL}/campaigns/${campaignId}/status`,
        {
          timeout: 10000,
        }
      );

      return {
        ...response.data,
        timestamp: new Date(response.data.timestamp),
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(
            error.response.data?.error?.message ||
              `Server error: ${error.response.status}`
          );
        } else if (error.request) {
          throw new Error('Network error: Could not connect to server');
        }
      }
      throw new Error('Failed to get campaign status');
    }
  }

  /**
   * Start monitoring campaign status
   */
  startMonitoring(
    campaignId: string,
    onStatusUpdate: (status: StatusUpdate) => void,
    config?: Partial<StatusPollingConfig>
  ): void {
    // Stop existing monitoring if any
    this.stopMonitoring(campaignId);

    // Store callback
    this.statusCallbacks.set(campaignId, onStatusUpdate);

    // Merge config
    const pollingConfig: StatusPollingConfig = {
      ...this.defaultConfig,
      ...config,
    };

    if (!pollingConfig.enabled) {
      return;
    }

    // Initial status check
    this.checkStatus(campaignId).catch((error) => {
      console.error(`Failed to check status for campaign ${campaignId}:`, error);
    });

    // Set up polling interval
    const interval = setInterval(() => {
      this.checkStatus(campaignId).catch((error) => {
        console.error(`Failed to check status for campaign ${campaignId}:`, error);
      });
    }, pollingConfig.interval);

    this.pollingIntervals.set(campaignId, interval);
  }

  /**
   * Stop monitoring campaign status
   */
  stopMonitoring(campaignId: string): void {
    const interval = this.pollingIntervals.get(campaignId);
    if (interval) {
      clearInterval(interval);
      this.pollingIntervals.delete(campaignId);
    }

    this.statusCallbacks.delete(campaignId);
  }

  /**
   * Check campaign status
   */
  private async checkStatus(campaignId: string): Promise<void> {
    try {
      const status = await this.getCampaignStatus(campaignId);
      const callback = this.statusCallbacks.get(campaignId);

      if (callback) {
        callback(status);
      }

      // Stop monitoring if campaign is in final state
      if (
        status.status === CampaignStatus.COMPLETED ||
        status.status === CampaignStatus.ARCHIVED ||
        status.status === CampaignStatus.ERROR
      ) {
        this.stopMonitoring(campaignId);
      }
    } catch (error) {
      console.error(`Error checking status for campaign ${campaignId}:`, error);
      // Don't throw - let polling continue
    }
  }

  /**
   * Stop all monitoring
   */
  stopAllMonitoring(): void {
    this.pollingIntervals.forEach((interval, campaignId) => {
      clearInterval(interval);
    });
    this.pollingIntervals.clear();
    this.statusCallbacks.clear();
  }
}

// Export singleton instance
export const statusService = new StatusService();

// Export class for testing
export default StatusService;

