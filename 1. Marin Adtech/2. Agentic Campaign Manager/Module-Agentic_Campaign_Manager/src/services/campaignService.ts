import axios from 'axios';
import {
  CampaignCreationRequest,
  CampaignCreationResponse,
  Campaign,
  CampaignUpdateRequest,
} from '../types/campaign.types';
import { getApiBaseUrl } from '../config/environment';
import { getApiMode } from '../utils/apiModeHelper';

const API_BASE_URL = getApiBaseUrl();

/**
 * Campaign Service
 * Handles campaign-related API calls
 */
class CampaignService {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Get headers with API mode
   * @param additionalHeaders - Additional headers to include
   * @returns Headers object with X-API-Mode header
   */
  private getHeaders(additionalHeaders: Record<string, string> = {}): Record<string, string> {
    const apiMode = getApiMode();
    return {
      'Content-Type': 'application/json',
      'X-API-Mode': apiMode,
      ...additionalHeaders,
    };
  }

  /**
   * Create a campaign
   */
  async createCampaign(
    request: CampaignCreationRequest
  ): Promise<CampaignCreationResponse> {
    try {
      const response = await axios.post<CampaignCreationResponse>(
        `${this.baseURL}/campaigns/create`,
        request,
        {
          headers: this.getHeaders(),
          timeout: 60000, // 60 seconds timeout for campaign creation
        }
      );

      return response.data;
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
      throw new Error('Failed to create campaign');
    }
  }

  /**
   * Create campaign with progress tracking (SSE)
   */
  async createCampaignWithProgress(
    request: CampaignCreationRequest,
    _onProgress?: (progress: any) => void
  ): Promise<CampaignCreationResponse> {
    // For MVP, use regular POST with timeout
    // In production, implement WebSocket or SSE properly
    // Note: EventSource doesn't support POST, so we'll use polling instead for MVP
    return this.createCampaign(request);
  }

  /**
   * Get campaign by ID
   */
  async getCampaign(id: string): Promise<Campaign> {
    try {
      const response = await axios.get<Campaign>(
        `${this.baseURL}/campaigns/${id}`,
        {
          headers: this.getHeaders(),
          timeout: 30000,
        }
      );

      return response.data;
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
      throw new Error('Failed to get campaign');
    }
  }

  /**
   * Get detailed campaign information from Google Ads API
   */
  async getCampaignDetails(
    id: string,
    googleAdsResourceName?: string
  ): Promise<any> {
    try {
      const params: any = {};
      if (googleAdsResourceName) {
        params.googleAdsResourceName = googleAdsResourceName;
      }

      const response = await axios.get(
        `${this.baseURL}/campaigns/${id}/details`,
        {
          headers: this.getHeaders(),
          params,
          timeout: 30000,
        }
      );

      return response.data;
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
      throw new Error('Failed to get campaign details');
    }
  }

  /**
   * Get all campaigns
   */
  async getAllCampaigns(): Promise<Campaign[]> {
    try {
      const response = await axios.get<{ campaigns: Campaign[] }>(
        `${this.baseURL}/campaigns`,
        {
          headers: this.getHeaders(),
          timeout: 30000,
        }
      );

      return response.data.campaigns || [];
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
      throw new Error('Failed to get campaigns');
    }
  }

  /**
   * Update campaign
   */
  async updateCampaign(
    id: string,
    updates: CampaignUpdateRequest,
    googleAdsResourceName?: string
  ): Promise<Campaign> {
    try {
      const params: any = {};
      if (googleAdsResourceName) {
        params.googleAdsResourceName = googleAdsResourceName;
      }

      const response = await axios.put<Campaign>(
        `${this.baseURL}/campaigns/${id}`,
        updates,
        {
          headers: this.getHeaders(),
          params,
          timeout: 30000,
        }
      );

      return response.data;
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
      throw new Error('Failed to update campaign');
    }
  }

  /**
   * Delete campaign
   */
  async deleteCampaign(id: string, googleAdsResourceName?: string): Promise<void> {
    try {
      await axios.delete(
        `${this.baseURL}/campaigns/${id}`,
        {
          data: {
            googleAdsResourceName: googleAdsResourceName || id,
          },
          headers: this.getHeaders(),
          timeout: 30000,
        }
      );
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
      throw new Error('Failed to delete campaign');
    }
  }

  /**
   * Pause campaign
   */
  async pauseCampaign(id: string, googleAdsResourceName?: string): Promise<void> {
    try {
      await axios.post(
        `${this.baseURL}/campaigns/${id}/pause`,
        {
          googleAdsResourceName: googleAdsResourceName || id,
        },
        {
          headers: this.getHeaders(),
          timeout: 30000,
        }
      );
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
      throw new Error('Failed to pause campaign');
    }
  }

  /**
   * Resume campaign
   */
  async resumeCampaign(id: string, googleAdsResourceName?: string): Promise<void> {
    try {
      await axios.post(
        `${this.baseURL}/campaigns/${id}/resume`,
        {
          googleAdsResourceName: googleAdsResourceName || id,
        },
        {
          headers: this.getHeaders(),
          timeout: 30000,
        }
      );
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
      throw new Error('Failed to resume campaign');
    }
  }

  /**
   * Sync campaigns from Zilkr Dispatcher
   * Fetches all campaigns from Zilkr Dispatcher API and returns them
   */
  async syncCampaigns(accountId?: string, publisher?: string): Promise<Campaign[]> {
    try {
      const params: Record<string, string> = {};
      if (accountId) {
        params.accountId = accountId;
      }
      if (publisher) {
        params.publisher = publisher;
      }

      const response = await axios.post<{ campaigns: Campaign[]; total: number; syncedAt: string }>(
        `${this.baseURL}/campaigns/sync`,
        {},
        {
          params,
          headers: this.getHeaders(),
          timeout: 60000, // Longer timeout for sync operation
        }
      );

      return response.data.campaigns;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(
            error.response.data?.error?.message ||
              error.response.data?.message ||
              `Server error: ${error.response.status}`
          );
        } else if (error.request) {
          throw new Error('Network error: Could not connect to server');
        }
      }
      throw new Error('Failed to sync campaigns from Zilkr Dispatcher');
    }
  }
}

// Export singleton instance
export const campaignService = new CampaignService();

// Export class for testing
export default CampaignService;

