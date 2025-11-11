import axios from 'axios';
import {
  CampaignCreationRequest,
  CampaignCreationResponse,
  Campaign,
  CampaignUpdateRequest,
} from '../types/campaign.types';
import { getApiBaseUrl } from '../config/environment';

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
          headers: {
            'Content-Type': 'application/json',
          },
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
   * Get all campaigns
   */
  async getAllCampaigns(): Promise<Campaign[]> {
    try {
      const response = await axios.get<{ campaigns: Campaign[] }>(
        `${this.baseURL}/campaigns`,
        {
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
    updates: CampaignUpdateRequest
  ): Promise<Campaign> {
    try {
      const response = await axios.put<Campaign>(
        `${this.baseURL}/campaigns/${id}`,
        updates,
        {
          headers: {
            'Content-Type': 'application/json',
          },
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
  async deleteCampaign(id: string): Promise<void> {
    try {
      await axios.delete(`${this.baseURL}/campaigns/${id}`, {
        timeout: 30000,
      });
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
  async pauseCampaign(id: string): Promise<void> {
    try {
      await axios.post(
        `${this.baseURL}/campaigns/${id}/pause`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
          },
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
  async resumeCampaign(id: string): Promise<void> {
    try {
      await axios.post(
        `${this.baseURL}/campaigns/${id}/resume`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
          },
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
}

// Export singleton instance
export const campaignService = new CampaignService();

// Export class for testing
export default CampaignService;

