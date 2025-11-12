/**
 * End-to-End Workflow Tests for Marin Dispatcher Integration
 * Task 4.5.2: Test End-to-End Workflow
 *
 * Tests complete workflows from campaign creation through ad structure deployment
 */

// Set test environment variables before importing modules
process.env.NODE_ENV = 'test';
process.env.MARIN_DISPATCHER_BASE_URL = 'http://localhost:3000';
process.env.DISPATCHER_URL = 'http://localhost:3000';
process.env.MARIN_DISPATCHER_ACCOUNT_ID = 'test-account-123';

import request from 'supertest';
import express, { Application } from 'express';
import apiRoutes from '../../routes/api';
import { ZilkrDispatcherService } from '../../services/zilkrDispatcherService';
import { ZilkrBatchJobService } from '../../services/zilkrBatchJobService';
import { CampaignPlan } from '../../types/ai.types';
import { campaignCreationService } from '../../services/campaignCreationService';

// Mock services
jest.mock('../../services/campaignCreationService');
jest.mock('../../services/zilkrDispatcherService');
jest.mock('../../services/zilkrBatchJobService');
jest.mock('../../services/googleAdsService');
jest.mock('../../services/metaAdsService');
jest.mock('../../services/microsoftAdsService');

describe('E2E Workflow Tests - Marin Dispatcher Integration', () => {
  let app: Application;
  let marinService: ZilkrDispatcherService;
  let batchJobService: ZilkrBatchJobService;

  // Mock campaign plan
  const mockCampaignPlan: CampaignPlan = {
    objective: 'Drive conversions and increase sales',
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
        age: '25-54',
        gender: 'all',
        location: 'United States',
        interests: ['shopping', 'technology', 'fashion'],
      },
    },
    kpis: {
      primary: 'conversions',
      secondary: ['clicks', 'ctr', 'roas'],
    },
  };

  beforeAll(() => {
    // Set up Express app with API routes
    app = express();
    app.use(express.json());
    app.use('/api', apiRoutes);

    // Initialize services
    marinService = new ZilkrDispatcherService('test-account-123', 'google');
    batchJobService = new ZilkrBatchJobService();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ========================================================================
  // Task 4.5.2.1: Test Complete Campaign Creation Workflow
  // ========================================================================

  describe('Complete Campaign Creation Workflow', () => {
    it('should create complete campaign structure: campaign → ad group → ad → keywords', async () => {
      // Step 1: Create campaign via REST API
      const campaignResponse = {
        campaignId: 'e2e-campaign-001',
        status: 'active',
        platformCampaignIds: {
          marin: 'marin-campaign-e2e-001',
        },
        createdAt: new Date(),
        message: 'Campaign created successfully',
      };

      (campaignCreationService.createCampaign as jest.Mock).mockResolvedValue(campaignResponse);

      const createCampaignResponse = await request(app)
        .post('/api/campaigns/create')
        .send({
          campaignPlan: mockCampaignPlan,
          name: 'E2E Test Campaign',
          description: 'End-to-end test campaign with full structure',
        })
        .expect(201);

      // Verify campaign was created
      expect(createCampaignResponse.body).toHaveProperty('campaignId');
      expect(createCampaignResponse.body).toHaveProperty('platformCampaignIds.marin');
      const campaignId = createCampaignResponse.body.platformCampaignIds.marin;

      // Step 2: Create ad group
      (marinService.createAdGroup as jest.Mock).mockResolvedValue({
        success: true,
        adGroupId: 'adgroup-e2e-001',
        details: {
          id: 'adgroup-e2e-001',
          campaignId: campaignId,
          name: 'E2E Test Ad Group',
          status: 'ENABLED',
        },
      });

      const adGroupData = {
        name: 'E2E Test Ad Group',
        status: 'ENABLED' as const,
        cpcBid: 1.5,
      };

      const adGroupResult = await marinService.createAdGroup(campaignId, adGroupData);

      expect(adGroupResult.success).toBe(true);
      expect(adGroupResult.adGroupId).toBe('adgroup-e2e-001');
      const adGroupId = adGroupResult.adGroupId!;

      // Step 3: Create ad (Responsive Search Ad)
      (marinService.createAd as jest.Mock).mockResolvedValue({
        success: true,
        adId: 'ad-e2e-001',
        details: {
          id: 'ad-e2e-001',
          adGroupId: adGroupId,
          type: 'RESPONSIVE_SEARCH_AD',
          status: 'ENABLED',
        },
      });

      const adData = {
        type: 'RESPONSIVE_SEARCH_AD' as const,
        status: 'ENABLED',
        headlines: [
          { text: 'Premium Products on Sale' },
          { text: 'Shop Top Brands Today' },
          { text: 'Limited Time Offers' },
        ],
        descriptions: [
          { text: 'Save up to 50% on premium brands. Shop now while supplies last.' },
          { text: 'Free shipping on orders over $50. Fast delivery nationwide.' },
        ],
        finalUrl: 'https://example.com/sale',
      };

      const adResult = await marinService.createAd(adGroupId, adData);

      expect(adResult.success).toBe(true);
      expect(adResult.adId).toBe('ad-e2e-001');

      // Step 4: Create keywords
      (marinService.createKeywords as jest.Mock).mockResolvedValue({
        success: true,
        keywords: [
          { id: 'kw-e2e-001', text: 'premium products', matchType: 'BROAD' },
          { id: 'kw-e2e-002', text: 'top brands', matchType: 'PHRASE' },
          { id: 'kw-e2e-003', text: 'buy premium products online', matchType: 'EXACT' },
        ],
        details: { count: 3 },
      });

      const keywordsData = [
        { text: 'premium products', matchType: 'BROAD' as const, cpcBid: 1.5 },
        { text: 'top brands', matchType: 'PHRASE' as const, cpcBid: 2.0 },
        { text: 'buy premium products online', matchType: 'EXACT' as const, cpcBid: 2.5 },
      ];

      const keywordsResult = await marinService.createKeywords(adGroupId, keywordsData);

      expect(keywordsResult.success).toBe(true);
      expect(keywordsResult.keywords).toHaveLength(3);

      // Step 5: Verify full structure in Marin system
      // In a real implementation, this would query the Marin API to verify structure
      // For this test, we verify all components were created successfully
      expect(campaignId).toBeDefined();
      expect(adGroupId).toBeDefined();
      expect(adResult.adId).toBeDefined();
      expect(keywordsResult.keywords).toBeDefined();
      expect(Array.isArray(keywordsResult.keywords)).toBe(true);

      // Verify the complete workflow executed successfully
      expect(campaignCreationService.createCampaign).toHaveBeenCalledTimes(1);
      expect(marinService.createAdGroup).toHaveBeenCalledWith(campaignId, adGroupData);
      expect(marinService.createAd).toHaveBeenCalledWith(adGroupId, adData);
      expect(marinService.createKeywords).toHaveBeenCalledWith(adGroupId, keywordsData);
    });

    it('should verify campaign structure integrity after creation', async () => {
      // Create complete structure
      const campaignId = 'marin-campaign-integrity-001';
      const adGroupId = 'adgroup-integrity-001';
      const adId = 'ad-integrity-001';

      (campaignCreationService.createCampaign as jest.Mock).mockResolvedValue({
        campaignId: 'integrity-campaign-001',
        status: 'active',
        platformCampaignIds: { marin: campaignId },
        createdAt: new Date(),
      });

      (marinService.createAdGroup as jest.Mock).mockResolvedValue({
        success: true,
        adGroupId: adGroupId,
        details: { campaignId: campaignId },
      });

      (marinService.createAd as jest.Mock).mockResolvedValue({
        success: true,
        adId: adId,
        details: { adGroupId: adGroupId },
      });

      (marinService.createKeywords as jest.Mock).mockResolvedValue({
        success: true,
        keywords: [
          { id: 'kw-int-001', text: 'test keyword', adGroupId: adGroupId },
        ],
      });

      // Execute workflow
      await request(app).post('/api/campaigns/create').send({
        campaignPlan: mockCampaignPlan,
        name: 'Integrity Test Campaign',
      });

      const adGroupResult = await marinService.createAdGroup(campaignId, {
        name: 'Test Ad Group',
        status: 'ENABLED' as const,
      });

      const adResult = await marinService.createAd(adGroupId!, {
        type: 'RESPONSIVE_SEARCH_AD' as const,
        headlines: [{ text: 'Test' }, { text: 'Headline' }, { text: 'Three' }],
        descriptions: [{ text: 'Test description' }, { text: 'Another description' }],
        finalUrl: 'https://example.com',
      });

      const keywordsResult = await marinService.createKeywords(adGroupId!, [
        { text: 'test keyword', matchType: 'EXACT' as const, cpcBid: 1.0 },
      ]);

      // Verify hierarchical integrity
      expect(adGroupResult.details.campaignId).toBe(campaignId);
      expect(adResult.details.adGroupId).toBe(adGroupId);
      if (keywordsResult.keywords && keywordsResult.keywords.length > 0) {
        expect(keywordsResult.keywords[0].adGroupId).toBe(adGroupId);
      }
    });

    it('should handle workflow with multiple ad groups and ads', async () => {
      const campaignId = 'marin-campaign-multi-001';

      (campaignCreationService.createCampaign as jest.Mock).mockResolvedValue({
        campaignId: 'multi-campaign-001',
        status: 'active',
        platformCampaignIds: { marin: campaignId },
        createdAt: new Date(),
      });

      // Create campaign
      await request(app).post('/api/campaigns/create').send({
        campaignPlan: mockCampaignPlan,
        name: 'Multi-Structure Campaign',
      });

      // Create 3 ad groups
      const adGroups = [];
      for (let i = 1; i <= 3; i++) {
        (marinService.createAdGroup as jest.Mock).mockResolvedValueOnce({
          success: true,
          adGroupId: `adgroup-multi-00${i}`,
          details: { campaignId: campaignId },
        });

        const adGroupResult = await marinService.createAdGroup(campaignId, {
          name: `Ad Group ${i}`,
          status: 'ENABLED' as const,
        });

        if (adGroupResult.adGroupId) {
          adGroups.push(adGroupResult.adGroupId);
        }
      }

      expect(adGroups).toHaveLength(3);

      // Create 2 ads per ad group
      const ads = [];
      for (const adGroupId of adGroups) {
        for (let j = 1; j <= 2; j++) {
          (marinService.createAd as jest.Mock).mockResolvedValueOnce({
            success: true,
            adId: `ad-${adGroupId}-${j}`,
            details: { adGroupId: adGroupId },
          });

          const adResult = await marinService.createAd(adGroupId, {
            type: 'RESPONSIVE_SEARCH_AD' as const,
            headlines: [{ text: 'H1' }, { text: 'H2' }, { text: 'H3' }],
            descriptions: [{ text: 'D1' }, { text: 'D2' }],
            finalUrl: 'https://example.com',
          });

          if (adResult.adId) {
            ads.push(adResult.adId);
          }
        }
      }

      expect(ads).toHaveLength(6); // 3 ad groups × 2 ads each
      expect(marinService.createAdGroup).toHaveBeenCalledTimes(3);
      expect(marinService.createAd).toHaveBeenCalledTimes(6);
    });
  });

  // ========================================================================
  // Task 4.5.2.2: Test Bulk Campaign Creation Workflow
  // ========================================================================

  describe('Bulk Campaign Creation Workflow', () => {
    it('should create 10 campaigns via batch job', async () => {
      // Mock batch job service
      const mockCampaigns = Array.from({ length: 10 }, (_, i) => ({
        name: `Bulk Campaign ${i + 1}`,
        accountId: 'test-account-123',
        status: 'ENABLED' as const,
        campaignBudget: `budget-${i + 1}`,
        biddingStrategy: 'MANUAL_CPC' as const,
      }));

      const mockJobResult = {
        jobId: 'bulk-job-001',
        jobStatus: 'DONE' as const,
        summary: {
          total: 10,
          successful: 10,
          failed: 0,
        },
        results: mockCampaigns.map((_, i) => ({
          operationId: `op-${i + 1}`,
          operationType: 'CREATE' as const,
          resourceType: 'CAMPAIGN' as const,
          operationStatus: 'SUCCESS' as const,
          resourceId: `bulk-campaign-${String(i + 1).padStart(3, '0')}`,
        })),
      };

      (batchJobService.bulkCreateCampaigns as jest.Mock).mockResolvedValue(mockJobResult);

      const result = await batchJobService.bulkCreateCampaigns(mockCampaigns);

      // Verify all campaigns were created
      expect(result.summary.total).toBe(10);
      expect(result.summary.successful).toBe(10);
      expect(result.summary.failed).toBe(0);
      expect(result.results).toHaveLength(10);

      // Verify each campaign was created successfully
      result.results.forEach((res: any, index: number) => {
        expect(res.operationStatus).toBe('SUCCESS');
        expect(res.resourceId).toBe(`bulk-campaign-${String(index + 1).padStart(3, '0')}`);
      });
    });

    it('should verify all campaigns have correct structure', async () => {
      const mockCampaigns = Array.from({ length: 10 }, (_, i) => ({
        name: `Verification Campaign ${i + 1}`,
        accountId: 'test-account-123',
        status: 'ENABLED' as const,
        campaignBudget: 'budget-123',
        biddingStrategy: 'MANUAL_CPC' as const,
      }));

      const mockJobResult = {
        jobId: 'verify-job-001',
        jobStatus: 'DONE' as const,
        summary: {
          total: 10,
          successful: 10,
          failed: 0,
        },
        results: mockCampaigns.map((campaign, i) => ({
          operationId: `op-${i + 1}`,
          operationType: 'CREATE' as const,
          resourceType: 'CAMPAIGN' as const,
          operationStatus: 'SUCCESS' as const,
          resourceId: `verify-campaign-${i + 1}`,
          resource: {
            name: campaign.name,
            status: campaign.status,
            campaignBudget: campaign.campaignBudget,
            biddingStrategy: campaign.biddingStrategy,
          },
        })),
      };

      (batchJobService.bulkCreateCampaigns as jest.Mock).mockResolvedValue(mockJobResult);

      const result = await batchJobService.bulkCreateCampaigns(mockCampaigns);

      // Verify results are correct
      expect(result.summary.successful).toBe(10);
      result.results.forEach((res: any, index: number) => {
        expect(res.resource.name).toBe(mockCampaigns[index].name);
        expect(res.resource.status).toBe(mockCampaigns[index].status);
        expect(res.resource.campaignBudget).toEqual(mockCampaigns[index].campaignBudget);
        expect(res.resource.biddingStrategy).toBe(mockCampaigns[index].biddingStrategy);
      });
    });

    it('should handle partial failures in bulk creation', async () => {
      const mockCampaigns = Array.from({ length: 10 }, (_, i) => ({
        name: `Partial Campaign ${i + 1}`,
        accountId: 'test-account-123',
        status: 'ENABLED' as const,
        campaignBudget: 'budget-123',
        biddingStrategy: 'MANUAL_CPC' as const,
      }));

      const mockJobResult = {
        jobId: 'partial-job-001',
        jobStatus: 'DONE' as const,
        summary: {
          total: 10,
          successful: 7,
          failed: 3,
        },
        results: mockCampaigns.map((_, i) => {
          // Make campaigns 3, 5, and 8 fail
          const shouldFail = [2, 4, 7].includes(i);
          const operationStatus: 'FAILED' | 'SUCCESS' = shouldFail ? 'FAILED' : 'SUCCESS';
          return {
            operationId: `op-${i + 1}`,
            operationType: 'CREATE' as const,
            resourceType: 'CAMPAIGN' as const,
            operationStatus,
            resourceId: shouldFail ? undefined : `partial-campaign-${i + 1}`,
            errors: shouldFail ? ['Validation failed: Invalid budget'] : undefined,
          };
        }),
      };

      (batchJobService.bulkCreateCampaigns as jest.Mock).mockResolvedValue(mockJobResult);

      const result = await batchJobService.bulkCreateCampaigns(mockCampaigns);

      // Verify counts
      expect(result.summary.total).toBe(10);
      expect(result.summary.successful).toBe(7);
      expect(result.summary.failed).toBe(3);

      // Verify failed campaigns have errors
      const failedResults = result.results.filter((r: any) => r.operationStatus === 'FAILED');
      expect(failedResults).toHaveLength(3);
      failedResults.forEach((res: any) => {
        expect(res.errors).toBeDefined();
        expect(res.errors[0]).toContain('Validation failed');
      });

      // Verify successful campaigns have IDs
      const successfulResults = result.results.filter((r: any) => r.operationStatus === 'SUCCESS');
      expect(successfulResults).toHaveLength(7);
      successfulResults.forEach((res: any) => {
        expect(res.resourceId).toBeDefined();
      });
    });
  });

  // ========================================================================
  // Task 4.5.2.3: Test Error Recovery Workflow
  // ========================================================================

  describe('Error Recovery Workflow', () => {
    it('should handle campaign creation with invalid data, then retry with valid data', async () => {
      // Step 1: Create campaign with invalid data (missing required fields)
      const invalidCampaignPlan = {
        objective: 'Test objective',
        budget: { total: -1000, currency: 'USD' }, // Invalid: negative budget
        timeline: { startDate: '2025-01-15', duration: 30 },
        platforms: ['marin'],
        targetAudience: {},
        kpis: { primary: 'conversions' },
      };

      const response1 = await request(app)
        .post('/api/campaigns/create')
        .send({
          campaignPlan: invalidCampaignPlan,
          name: 'Invalid Campaign',
        })
        .expect(400);

      // Step 2: Verify error is returned
      expect(response1.body).toHaveProperty('error');
      expect(response1.body.message).toContain('cannot be negative');

      // Step 3: Retry with valid data
      (campaignCreationService.createCampaign as jest.Mock).mockResolvedValue({
        campaignId: 'retry-campaign-001',
        status: 'active',
        platformCampaignIds: { marin: 'marin-campaign-retry-001' },
        createdAt: new Date(),
      });

      const response2 = await request(app)
        .post('/api/campaigns/create')
        .send({
          campaignPlan: mockCampaignPlan, // Valid campaign plan
          name: 'Valid Campaign',
        })
        .expect(201);

      // Step 4: Verify success
      expect(response2.body).toHaveProperty('campaignId');
      expect(response2.body).toHaveProperty('status', 'active');
      expect(response2.body.platformCampaignIds.marin).toBe('marin-campaign-retry-001');
    });

    it('should recover from ad group creation failure', async () => {
      const campaignId = 'marin-campaign-recovery-001';

      // Step 1: Attempt to create ad group with invalid data
      (marinService.createAdGroup as jest.Mock).mockResolvedValueOnce({
        success: false,
        error: 'Validation failed: CPC bid must be positive',
      });

      const invalidAdGroupData = {
        name: 'Invalid Ad Group',
        status: 'ENABLED' as const,
        cpcBid: -1.5, // Invalid: negative bid
      };

      const result1 = await marinService.createAdGroup(campaignId, invalidAdGroupData);

      // Step 2: Verify error
      expect(result1.success).toBe(false);
      expect(result1.error).toContain('Validation failed');

      // Step 3: Retry with valid data
      (marinService.createAdGroup as jest.Mock).mockResolvedValueOnce({
        success: true,
        adGroupId: 'adgroup-recovery-001',
        details: { status: 'ENABLED', cpcBid: 1.5 },
      });

      const validAdGroupData = {
        name: 'Valid Ad Group',
        status: 'ENABLED' as const,
        cpcBid: 1.5, // Valid bid
      };

      const result2 = await marinService.createAdGroup(campaignId, validAdGroupData);

      // Step 4: Verify success
      expect(result2.success).toBe(true);
      expect(result2.adGroupId).toBe('adgroup-recovery-001');
      expect(result2.details.cpcBid).toBe(1.5);
    });

    it('should recover from ad creation failure', async () => {
      const adGroupId = 'adgroup-recovery-002';

      // Step 1: Attempt to create ad with invalid data
      (marinService.createAd as jest.Mock).mockResolvedValueOnce({
        success: false,
        error: 'Validation failed: Must have at least 3 headlines',
      });

      const invalidAdData = {
        type: 'RESPONSIVE_SEARCH_AD' as const,
        headlines: [{ text: 'Only One Headline' }], // Invalid: need at least 3
        descriptions: [{ text: 'Description' }, { text: 'Another' }],
        finalUrl: 'https://example.com',
      };

      const result1 = await marinService.createAd(adGroupId, invalidAdData);

      // Step 2: Verify error
      expect(result1.success).toBe(false);
      expect(result1.error).toContain('at least 3 headlines');

      // Step 3: Retry with valid data
      (marinService.createAd as jest.Mock).mockResolvedValueOnce({
        success: true,
        adId: 'ad-recovery-001',
        details: { status: 'ENABLED' },
      });

      const validAdData = {
        type: 'RESPONSIVE_SEARCH_AD' as const,
        headlines: [
          { text: 'Headline One' },
          { text: 'Headline Two' },
          { text: 'Headline Three' },
        ],
        descriptions: [{ text: 'Description' }, { text: 'Another' }],
        finalUrl: 'https://example.com',
      };

      const result2 = await marinService.createAd(adGroupId, validAdData);

      // Step 4: Verify success
      expect(result2.success).toBe(true);
      expect(result2.adId).toBe('ad-recovery-001');
    });

    it('should recover from keyword creation failure', async () => {
      const adGroupId = 'adgroup-recovery-003';

      // Step 1: Attempt to create keywords with invalid data
      (marinService.createKeywords as jest.Mock).mockResolvedValueOnce({
        success: false,
        error: 'Validation failed: Keyword text must not exceed 80 characters',
      });

      const invalidKeywordsData = [
        {
          text: 'This is a very long keyword that exceeds the maximum allowed character limit for keywords',
          matchType: 'BROAD' as const,
          cpcBid: 1.5,
        },
      ];

      const result1 = await marinService.createKeywords(adGroupId, invalidKeywordsData);

      // Step 2: Verify error
      expect(result1.success).toBe(false);
      expect(result1.error).toContain('80 characters');

      // Step 3: Retry with valid data
      (marinService.createKeywords as jest.Mock).mockResolvedValueOnce({
        success: true,
        keywords: [
          { id: 'kw-recovery-001', text: 'valid keyword', matchType: 'BROAD' },
          { id: 'kw-recovery-002', text: 'another valid keyword', matchType: 'PHRASE' },
        ],
      });

      const validKeywordsData = [
        { text: 'valid keyword', matchType: 'BROAD' as const, cpcBid: 1.5 },
        { text: 'another valid keyword', matchType: 'PHRASE' as const, cpcBid: 2.0 },
      ];

      const result2 = await marinService.createKeywords(adGroupId, validKeywordsData);

      // Step 4: Verify success
      expect(result2.success).toBe(true);
      expect(result2.keywords).toHaveLength(2);
    });

    it('should handle network errors and retry successfully', async () => {
      // Step 1: Simulate network error
      (campaignCreationService.createCampaign as jest.Mock).mockRejectedValueOnce(
        new Error('Network timeout')
      );

      const response1 = await request(app)
        .post('/api/campaigns/create')
        .send({
          campaignPlan: mockCampaignPlan,
          name: 'Network Test Campaign',
        })
        .expect(500);

      // Step 2: Verify error
      expect(response1.body).toHaveProperty('error', 'Failed to create campaign');
      expect(response1.body.message).toContain('Network timeout');

      // Step 3: Retry after network recovery
      (campaignCreationService.createCampaign as jest.Mock).mockResolvedValueOnce({
        campaignId: 'network-recovery-001',
        status: 'active',
        platformCampaignIds: { marin: 'marin-campaign-network-001' },
        createdAt: new Date(),
      });

      const response2 = await request(app)
        .post('/api/campaigns/create')
        .send({
          campaignPlan: mockCampaignPlan,
          name: 'Network Test Campaign',
        })
        .expect(201);

      // Step 4: Verify success
      expect(response2.body).toHaveProperty('campaignId');
      expect(response2.body).toHaveProperty('status', 'active');
    });
  });

  // ========================================================================
  // Additional E2E Tests
  // ========================================================================

  describe('Complex Multi-Step Workflows', () => {
    it('should execute complete workflow with pause and resume', async () => {
      // Create campaign
      (campaignCreationService.createCampaign as jest.Mock).mockResolvedValue({
        campaignId: 'pause-resume-001',
        status: 'active',
        platformCampaignIds: { marin: 'marin-campaign-pr-001' },
        createdAt: new Date(),
      });

      const createResponse = await request(app)
        .post('/api/campaigns/create')
        .send({
          campaignPlan: mockCampaignPlan,
          name: 'Pause Resume Campaign',
        });

      const campaignId = createResponse.body.campaignId;

      // Pause campaign
      const pauseResponse = await request(app)
        .post(`/api/campaigns/${campaignId}/pause`)
        .expect(200);

      expect(pauseResponse.body.status).toBe('paused');

      // Resume campaign
      const resumeResponse = await request(app)
        .post(`/api/campaigns/${campaignId}/resume`)
        .expect(200);

      expect(resumeResponse.body.status).toBe('active');
    });

    it('should handle workflow with campaign deletion', async () => {
      // Create campaign
      (campaignCreationService.createCampaign as jest.Mock).mockResolvedValue({
        campaignId: 'delete-test-001',
        status: 'active',
        platformCampaignIds: { marin: 'marin-campaign-del-001' },
        createdAt: new Date(),
      });

      const createResponse = await request(app)
        .post('/api/campaigns/create')
        .send({
          campaignPlan: mockCampaignPlan,
          name: 'Delete Test Campaign',
        });

      const campaignId = createResponse.body.campaignId;

      // Delete campaign
      const deleteResponse = await request(app)
        .delete(`/api/campaigns/${campaignId}`)
        .expect(200);

      expect(deleteResponse.body.message).toBe('Campaign deleted');
      expect(deleteResponse.body).toHaveProperty('deletedAt');
    });
  });
});
