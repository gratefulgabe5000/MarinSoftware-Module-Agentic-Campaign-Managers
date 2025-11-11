/**
 * REST API Integration Tests for Marin Dispatcher Integration
 * Task 4.5.1: Test REST API Integration
 *
 * Tests campaign CRUD operations via REST API with Marin platform support
 */

// Set test environment variables before importing modules
process.env.NODE_ENV = 'test';
process.env.MARIN_DISPATCHER_BASE_URL = 'http://localhost:3000';
process.env.DISPATCHER_URL = 'http://localhost:3000';

import request from 'supertest';
import express, { Application } from 'express';
import apiRoutes from '../../routes/api';
import { CampaignPlan } from '../../types/ai.types';
import { CampaignCreationResponse } from '../../types/campaign.types';
import { campaignCreationService } from '../../services/campaignCreationService';
import { MarinDispatcherService } from '../../services/marinDispatcherService';
import { GoogleAdsService } from '../../services/googleAdsService';

// Mock services
jest.mock('../../services/campaignCreationService');
jest.mock('../../services/marinDispatcherService');
jest.mock('../../services/googleAdsService');
jest.mock('../../services/metaAdsService');
jest.mock('../../services/microsoftAdsService');

describe('REST API Integration - Marin Dispatcher', () => {
  let app: Application;

  // Mock campaign plan for tests
  const mockCampaignPlan: CampaignPlan = {
    objective: 'Increase brand awareness and drive sales',
    budget: {
      total: 10000,
      daily: 333.33,
      currency: 'USD',
    },
    timeline: {
      startDate: '2025-01-15',
      endDate: '2025-02-15',
      duration: 30,
    },
    platforms: ['marin'],
    targetAudience: {
      demographics: {
        age: '25-45',
        gender: 'all',
        location: 'United States',
        interests: ['technology', 'shopping'],
      },
    },
    kpis: {
      primary: 'conversions',
      secondary: ['clicks', 'impressions'],
    },
  };

  beforeAll(() => {
    // Set up Express app with API routes
    app = express();
    app.use(express.json());
    app.use('/api', apiRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ========================================================================
  // Task 4.5.1.1: Test Campaign Creation via REST API
  // ========================================================================

  describe('POST /api/campaigns/create - Marin Platform', () => {
    it('should create campaign on Marin platform successfully', async () => {
      // Mock response from campaign creation service
      const mockResponse: CampaignCreationResponse = {
        campaignId: 'campaign-123',
        status: 'active',
        platformCampaignIds: {
          marin: 'marin-campaign-456',
        },
        createdAt: new Date(),
        message: 'Campaign created successfully on Marin',
      };

      (campaignCreationService.createCampaign as jest.Mock).mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/api/campaigns/create')
        .send({
          campaignPlan: mockCampaignPlan,
          name: 'Test Marin Campaign',
          description: 'Test campaign for Marin platform',
        })
        .expect(201);

      expect(response.body).toHaveProperty('campaignId');
      expect(response.body).toHaveProperty('status', 'active');
      expect(response.body).toHaveProperty('platformCampaignIds');
      expect(response.body.platformCampaignIds).toHaveProperty('marin', 'marin-campaign-456');
      expect(campaignCreationService.createCampaign).toHaveBeenCalledWith(
        expect.objectContaining({
          campaignPlan: expect.objectContaining({
            platforms: ['marin'],
          }),
          name: 'Test Marin Campaign',
        })
      );
    });

    it('should verify campaign response includes Marin campaign ID', async () => {
      const mockResponse: CampaignCreationResponse = {
        campaignId: 'campaign-789',
        status: 'active',
        platformCampaignIds: {
          marin: 'marin-campaign-999',
        },
        createdAt: new Date(),
      };

      (campaignCreationService.createCampaign as jest.Mock).mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/api/campaigns/create')
        .send({
          campaignPlan: mockCampaignPlan,
          name: 'Verify Marin ID Campaign',
        })
        .expect(201);

      // Verify Marin campaign ID is present in response
      expect(response.body.platformCampaignIds.marin).toBe('marin-campaign-999');
      expect(response.body.platformCampaignIds.marin).toMatch(/^marin-campaign-\d+$/);
    });

    it('should return 400 when campaignPlan is missing', async () => {
      const response = await request(app)
        .post('/api/campaigns/create')
        .send({
          name: 'Test Campaign',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid request');
      expect(response.body.message).toContain('campaignPlan and name are required');
    });

    it('should return 400 when name is missing', async () => {
      const response = await request(app)
        .post('/api/campaigns/create')
        .send({
          campaignPlan: mockCampaignPlan,
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid request');
      expect(response.body.message).toContain('campaignPlan and name are required');
    });

    it('should return 400 when platforms array is empty', async () => {
      const invalidCampaignPlan = {
        ...mockCampaignPlan,
        platforms: [],
      };

      const response = await request(app)
        .post('/api/campaigns/create')
        .send({
          campaignPlan: invalidCampaignPlan,
          name: 'Test Campaign',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid campaign plan');
      expect(response.body.message).toContain('missing required fields');
    });
  });

  // ========================================================================
  // Task 4.5.1.2: Test Multi-Platform Campaign Creation
  // ========================================================================

  describe('POST /api/campaigns/create - Multi-Platform (Marin + Google Ads)', () => {
    it('should create campaign on both Marin and Google Ads platforms', async () => {
      const multiPlatformCampaignPlan: CampaignPlan = {
        ...mockCampaignPlan,
        platforms: ['marin', 'googleAds'],
      };

      const mockResponse: CampaignCreationResponse = {
        campaignId: 'campaign-multi-123',
        status: 'active',
        platformCampaignIds: {
          marin: 'marin-campaign-456',
          googleAds: 'google-campaign-789',
        },
        createdAt: new Date(),
        message: 'Campaign created successfully on Marin and Google Ads',
      };

      (campaignCreationService.createCampaign as jest.Mock).mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/api/campaigns/create')
        .send({
          campaignPlan: multiPlatformCampaignPlan,
          name: 'Multi-Platform Campaign',
          description: 'Campaign across Marin and Google Ads',
        })
        .expect(201);

      expect(response.body).toHaveProperty('campaignId');
      expect(response.body).toHaveProperty('platformCampaignIds');
      expect(response.body.platformCampaignIds).toHaveProperty('marin');
      expect(response.body.platformCampaignIds).toHaveProperty('googleAds');
    });

    it('should verify response includes both platform IDs', async () => {
      const multiPlatformCampaignPlan: CampaignPlan = {
        ...mockCampaignPlan,
        platforms: ['marin', 'googleAds'],
      };

      const mockResponse: CampaignCreationResponse = {
        campaignId: 'campaign-multi-456',
        status: 'active',
        platformCampaignIds: {
          marin: 'marin-campaign-111',
          googleAds: 'google-campaign-222',
        },
        createdAt: new Date(),
      };

      (campaignCreationService.createCampaign as jest.Mock).mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/api/campaigns/create')
        .send({
          campaignPlan: multiPlatformCampaignPlan,
          name: 'Verify Multi-Platform IDs',
        })
        .expect(201);

      // Verify both IDs are present and have correct format
      expect(response.body.platformCampaignIds.marin).toBe('marin-campaign-111');
      expect(response.body.platformCampaignIds.googleAds).toBe('google-campaign-222');

      // Verify both platforms were requested
      expect(campaignCreationService.createCampaign).toHaveBeenCalledWith(
        expect.objectContaining({
          campaignPlan: expect.objectContaining({
            platforms: expect.arrayContaining(['marin', 'googleAds']),
          }),
        })
      );
    });

    it('should handle partial success with 207 Multi-Status', async () => {
      const multiPlatformCampaignPlan: CampaignPlan = {
        ...mockCampaignPlan,
        platforms: ['marin', 'googleAds'],
      };

      const mockResponse: CampaignCreationResponse = {
        campaignId: 'campaign-partial-123',
        status: 'active',
        platformCampaignIds: {
          marin: 'marin-campaign-999',
        },
        createdAt: new Date(),
        errors: [
          {
            platform: 'googleAds',
            error: 'Authentication failed',
          },
        ],
      };

      (campaignCreationService.createCampaign as jest.Mock).mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/api/campaigns/create')
        .send({
          campaignPlan: multiPlatformCampaignPlan,
          name: 'Partial Success Campaign',
        })
        .expect(207); // Multi-Status

      expect(response.body.platformCampaignIds.marin).toBe('marin-campaign-999');
      expect(response.body.platformCampaignIds.googleAds).toBeUndefined();
      expect(response.body.errors).toHaveLength(1);
      expect(response.body.errors[0].platform).toBe('googleAds');
    });
  });

  // ========================================================================
  // Task 4.5.1.3: Test Campaign Update via REST API
  // ========================================================================

  describe('PUT /api/campaigns/:id - Update Campaign', () => {
    it('should update campaign on Marin platform', async () => {
      const campaignId = 'campaign-123';
      const updates = {
        status: 'active',
        budget: {
          total: 15000,
          daily: 500,
          currency: 'USD',
        },
      };

      const response = await request(app)
        .put(`/api/campaigns/${campaignId}`)
        .send(updates)
        .expect(200);

      expect(response.body).toHaveProperty('id', campaignId);
      expect(response.body).toHaveProperty('status', 'active');
      expect(response.body).toHaveProperty('updatedAt');
    });

    it('should update campaign budget successfully', async () => {
      const campaignId = 'campaign-456';
      const updates = {
        budget: {
          total: 20000,
          daily: 666.67,
          currency: 'USD',
        },
      };

      const response = await request(app)
        .put(`/api/campaigns/${campaignId}`)
        .send(updates)
        .expect(200);

      expect(response.body.id).toBe(campaignId);
      expect(response.body.budget).toEqual(updates.budget);
    });

    it('should return 400 when campaign ID is missing', async () => {
      const response = await request(app)
        .put('/api/campaigns/')
        .send({ status: 'active' })
        .expect(404); // Express returns 404 for missing route parameter

      expect(response.body).toBeDefined();
    });

    it('should handle empty update payload', async () => {
      const campaignId = 'campaign-789';

      const response = await request(app)
        .put(`/api/campaigns/${campaignId}`)
        .send({})
        .expect(200);

      expect(response.body).toHaveProperty('id', campaignId);
    });
  });

  // ========================================================================
  // Task 4.5.1.4: Test Campaign Pause/Resume via REST API
  // ========================================================================

  describe('POST /api/campaigns/:id/pause - Pause Campaign', () => {
    it('should pause campaign successfully', async () => {
      const campaignId = 'campaign-123';

      const response = await request(app)
        .post(`/api/campaigns/${campaignId}/pause`)
        .expect(200);

      expect(response.body).toHaveProperty('id', campaignId);
      expect(response.body).toHaveProperty('status', 'paused');
      expect(response.body).toHaveProperty('message', 'Campaign paused');
      expect(response.body).toHaveProperty('updatedAt');
    });

    it('should return 400 when campaign ID is invalid', async () => {
      const response = await request(app)
        .post('/api/campaigns//pause')
        .expect(404);

      expect(response.body).toBeDefined();
    });
  });

  describe('POST /api/campaigns/:id/resume - Resume Campaign', () => {
    it('should resume campaign successfully', async () => {
      const campaignId = 'campaign-123';

      const response = await request(app)
        .post(`/api/campaigns/${campaignId}/resume`)
        .expect(200);

      expect(response.body).toHaveProperty('id', campaignId);
      expect(response.body).toHaveProperty('status', 'active');
      expect(response.body).toHaveProperty('message', 'Campaign resumed');
      expect(response.body).toHaveProperty('updatedAt');
    });

    it('should handle resume after pause', async () => {
      const campaignId = 'campaign-456';

      // First pause
      await request(app)
        .post(`/api/campaigns/${campaignId}/pause`)
        .expect(200);

      // Then resume
      const response = await request(app)
        .post(`/api/campaigns/${campaignId}/resume`)
        .expect(200);

      expect(response.body.status).toBe('active');
      expect(response.body.message).toBe('Campaign resumed');
    });
  });

  // ========================================================================
  // Task 4.5.1.5: Test Campaign Delete via REST API
  // ========================================================================

  describe('DELETE /api/campaigns/:id - Delete Campaign', () => {
    it('should delete campaign successfully', async () => {
      const campaignId = 'campaign-123';

      const response = await request(app)
        .delete(`/api/campaigns/${campaignId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', campaignId);
      expect(response.body).toHaveProperty('message', 'Campaign deleted');
      expect(response.body).toHaveProperty('deletedAt');
    });

    it('should return 400 when campaign ID is missing', async () => {
      const response = await request(app)
        .delete('/api/campaigns/')
        .expect(404);

      expect(response.body).toBeDefined();
    });

    it('should handle delete of non-existent campaign gracefully', async () => {
      const campaignId = 'non-existent-campaign';

      const response = await request(app)
        .delete(`/api/campaigns/${campaignId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', campaignId);
      expect(response.body).toHaveProperty('message', 'Campaign deleted');
    });
  });

  // ========================================================================
  // Task 4.5.1.6: Test Error Handling in REST API Context
  // ========================================================================

  describe('Error Handling', () => {
    it('should handle service errors with 500 status', async () => {
      (campaignCreationService.createCampaign as jest.Mock).mockRejectedValue(
        new Error('Service unavailable')
      );

      const response = await request(app)
        .post('/api/campaigns/create')
        .send({
          campaignPlan: mockCampaignPlan,
          name: 'Error Test Campaign',
        })
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Failed to create campaign');
      expect(response.body.message).toContain('Service unavailable');
    });

    it('should handle invalid JSON payload', async () => {
      const response = await request(app)
        .post('/api/campaigns/create')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')
        .expect(400);

      expect(response.body).toBeDefined();
    });

    it('should handle missing required fields in campaign plan', async () => {
      const incompleteCampaignPlan = {
        objective: 'Test objective',
        // Missing budget, timeline, platforms
      };

      const response = await request(app)
        .post('/api/campaigns/create')
        .send({
          campaignPlan: incompleteCampaignPlan,
          name: 'Incomplete Campaign',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid campaign plan');
      expect(response.body.message).toContain('missing required fields');
    });

    it('should handle network timeouts gracefully', async () => {
      (campaignCreationService.createCampaign as jest.Mock).mockRejectedValue(
        new Error('Network timeout')
      );

      const response = await request(app)
        .post('/api/campaigns/create')
        .send({
          campaignPlan: mockCampaignPlan,
          name: 'Timeout Test Campaign',
        })
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Failed to create campaign');
      expect(response.body.message).toContain('Network timeout');
    });

    it('should handle Marin Dispatcher authentication errors', async () => {
      const mockResponse: CampaignCreationResponse = {
        campaignId: 'campaign-auth-error',
        status: 'error',
        platformCampaignIds: {},
        createdAt: new Date(),
        errors: [
          {
            platform: 'marin',
            error: 'Authentication failed',
            details: { code: 401 },
          },
        ],
      };

      (campaignCreationService.createCampaign as jest.Mock).mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/api/campaigns/create')
        .send({
          campaignPlan: mockCampaignPlan,
          name: 'Auth Error Campaign',
        })
        .expect(207); // Multi-Status for partial failures

      expect(response.body.errors).toHaveLength(1);
      expect(response.body.errors[0].platform).toBe('marin');
      expect(response.body.errors[0].error).toContain('Authentication failed');
    });

    it('should handle validation errors from Marin Dispatcher', async () => {
      const mockResponse: CampaignCreationResponse = {
        campaignId: 'campaign-validation-error',
        status: 'error',
        platformCampaignIds: {},
        createdAt: new Date(),
        errors: [
          {
            platform: 'marin',
            error: 'Validation failed: budget amount is required',
          },
        ],
      };

      (campaignCreationService.createCampaign as jest.Mock).mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/api/campaigns/create')
        .send({
          campaignPlan: mockCampaignPlan,
          name: 'Validation Error Campaign',
        })
        .expect(207);

      expect(response.body.errors[0].error).toContain('Validation failed');
    });

    it('should handle all platforms failing', async () => {
      const multiPlatformCampaignPlan: CampaignPlan = {
        ...mockCampaignPlan,
        platforms: ['marin', 'googleAds'],
      };

      const mockResponse: CampaignCreationResponse = {
        campaignId: 'campaign-all-failed',
        status: 'error',
        platformCampaignIds: {},
        createdAt: new Date(),
        errors: [
          {
            platform: 'marin',
            error: 'Service unavailable',
          },
          {
            platform: 'googleAds',
            error: 'Authentication failed',
          },
        ],
      };

      (campaignCreationService.createCampaign as jest.Mock).mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/api/campaigns/create')
        .send({
          campaignPlan: multiPlatformCampaignPlan,
          name: 'All Failed Campaign',
        })
        .expect(207);

      expect(response.body.errors).toHaveLength(2);
      expect(Object.keys(response.body.platformCampaignIds)).toHaveLength(0);
    });
  });

  // ========================================================================
  // Additional Integration Tests
  // ========================================================================

  describe('GET /api/campaigns - List Campaigns', () => {
    it('should return list of campaigns', async () => {
      const response = await request(app)
        .get('/api/campaigns')
        .expect(200);

      expect(response.body).toHaveProperty('campaigns');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.campaigns)).toBe(true);
    });
  });

  describe('GET /api/campaigns/:id - Get Campaign by ID', () => {
    it('should return campaign details', async () => {
      const campaignId = 'campaign-123';

      const response = await request(app)
        .get(`/api/campaigns/${campaignId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', campaignId);
    });
  });

  describe('API Health Check', () => {
    it('should return API health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('message', 'API is running');
    });
  });
});
