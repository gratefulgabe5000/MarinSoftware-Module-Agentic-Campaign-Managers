/**
 * Unit tests for Marin Dispatcher Type Definitions
 *
 * These tests verify the structure and integrity of TypeScript type definitions
 * for the Marin Dispatcher API. They ensure that types are correctly exported,
 * type guards work as expected, and that type structures match API specifications.
 *
 * @module marinDispatcher.types.test
 */

import {
  // Base Types
  MarinBaseRequest,
  MarinBaseResponse,

  // Campaign Types
  MarinCampaignRequest,
  MarinCampaignResponse,
  MarinCampaignUpdateRequest,
  MarinCampaignListRequest,
  MarinCampaignListResponse,

  // Ad Group Types
  MarinAdGroupRequest,
  MarinAdGroupResponse,
  MarinAdGroupUpdateRequest,

  // Ad Types
  AdAsset,
  MarinAdRequest,
  MarinAdResponse,
  MarinAdUpdateRequest,

  // Keyword Types
  MarinKeywordRequest,
  MarinKeywordResponse,
  MarinKeywordUpdateRequest,
  MarinBulkKeywordRequest,

  // Batch Job Types
  BatchOperation,
  BatchJobRequest,
  BatchJobResponse,
  AddBatchOperationsRequest,
  AddBatchOperationsResponse,
  BatchJobResult,
  BatchJobResultsRequest,
  BatchJobResultsResponse,

  // Type Guards and Enums
  CampaignStatus,
  BudgetDeliveryMethod,
  KeywordMatchType,
  AdType,
  ResourceStatus,
  BatchOperationType,
  BatchResourceType,
  BatchJobStatus,
  isValidCampaignStatus,
  isValidBudgetDeliveryMethod,
  isValidKeywordMatchType,
  isValidAdType,
  isValidResourceStatus,
  isValidBatchOperationType,
  isValidBatchResourceType,
  isValidBatchJobStatus,
} from '../../types/marinDispatcher.types';

describe('marinDispatcher.types', () => {
  // ==========================================================================
  // Base Type Tests
  // ==========================================================================

  describe('Base Types', () => {
    it('should define MarinBaseRequest with required accountId', () => {
      const request: MarinBaseRequest = {
        accountId: '5533110357',
      };

      expect(request.accountId).toBe('5533110357');
    });

    it('should define MarinBaseResponse with status and optional fields', () => {
      const successResponse: MarinBaseResponse = {
        status: 'SUCCESS',
        resourceId: 'campaign-123',
      };

      const failureResponse: MarinBaseResponse = {
        status: 'FAILURE',
        errors: ['Invalid budget amount'],
        warnings: ['Budget may exceed daily limit'],
      };

      expect(successResponse.status).toBe('SUCCESS');
      expect(successResponse.resourceId).toBe('campaign-123');
      expect(failureResponse.status).toBe('FAILURE');
      expect(failureResponse.errors).toHaveLength(1);
      expect(failureResponse.warnings).toHaveLength(1);
    });
  });

  // ==========================================================================
  // Campaign Type Tests
  // ==========================================================================

  describe('Campaign Types', () => {
    it('should define MarinCampaignRequest with all required fields', () => {
      const request: MarinCampaignRequest = {
        accountId: '5533110357',
        name: 'Test Campaign',
        status: 'ENABLED',
        budget: {
          amount: 1000,
          deliveryMethod: 'STANDARD',
        },
        biddingStrategy: 'TARGET_CPA',
        objective: 'CONVERSIONS',
      };

      expect(request.accountId).toBe('5533110357');
      expect(request.name).toBe('Test Campaign');
      expect(request.status).toBe('ENABLED');
      expect(request.budget.amount).toBe(1000);
      expect(request.budget.deliveryMethod).toBe('STANDARD');
      expect(request.biddingStrategy).toBe('TARGET_CPA');
      expect(request.objective).toBe('CONVERSIONS');
    });

    it('should define MarinCampaignResponse extending MarinBaseResponse', () => {
      const response: MarinCampaignResponse = {
        status: 'SUCCESS',
        id: 'campaign-123',
        accountId: '5533110357',
        name: 'Test Campaign',
        campaignStatus: 'ENABLED',
        budget: {
          amount: 1000,
          deliveryMethod: 'STANDARD',
        },
        biddingStrategy: 'TARGET_CPA',
        createdAt: '2025-11-10T12:00:00Z',
        updatedAt: '2025-11-10T12:30:00Z',
      };

      expect(response.status).toBe('SUCCESS');
      expect(response.id).toBe('campaign-123');
      expect(response.accountId).toBe('5533110357');
      expect(response.name).toBe('Test Campaign');
      expect(response.campaignStatus).toBe('ENABLED');
      expect(response.createdAt).toBe('2025-11-10T12:00:00Z');
      expect(response.updatedAt).toBe('2025-11-10T12:30:00Z');
    });

    it('should define MarinCampaignUpdateRequest with optional fields', () => {
      const updateRequest: MarinCampaignUpdateRequest = {
        name: 'Updated Campaign',
        status: 'PAUSED',
      };

      expect(updateRequest.name).toBe('Updated Campaign');
      expect(updateRequest.status).toBe('PAUSED');
      expect(updateRequest.budget).toBeUndefined();
      expect(updateRequest.biddingStrategy).toBeUndefined();
    });

    it('should define MarinCampaignListRequest with pagination', () => {
      const listRequest: MarinCampaignListRequest = {
        accountId: '5533110357',
        limit: 50,
        offset: 0,
      };

      expect(listRequest.accountId).toBe('5533110357');
      expect(listRequest.limit).toBe(50);
      expect(listRequest.offset).toBe(0);
    });

    it('should define MarinCampaignListResponse with campaigns array', () => {
      const listResponse: MarinCampaignListResponse = {
        campaigns: [
          {
            status: 'SUCCESS',
            id: 'campaign-1',
            accountId: '5533110357',
            name: 'Campaign 1',
            campaignStatus: 'ENABLED',
            budget: { amount: 1000, deliveryMethod: 'STANDARD' },
            biddingStrategy: 'TARGET_CPA',
          },
          {
            status: 'SUCCESS',
            id: 'campaign-2',
            accountId: '5533110357',
            name: 'Campaign 2',
            campaignStatus: 'PAUSED',
            budget: { amount: 2000, deliveryMethod: 'ACCELERATED' },
            biddingStrategy: 'MAXIMIZE_CONVERSIONS',
          },
        ],
        total: 2,
        limit: 50,
        offset: 0,
      };

      expect(listResponse.campaigns).toHaveLength(2);
      expect(listResponse.total).toBe(2);
      expect(listResponse.limit).toBe(50);
      expect(listResponse.offset).toBe(0);
    });
  });

  // ==========================================================================
  // Ad Group Type Tests
  // ==========================================================================

  describe('Ad Group Types', () => {
    it('should define MarinAdGroupRequest with required and optional fields', () => {
      const request: MarinAdGroupRequest = {
        accountId: '5533110357',
        campaignId: 'campaign-123',
        name: 'Test Ad Group',
        status: 'ENABLED',
        cpcBid: 2.50,
      };

      expect(request.accountId).toBe('5533110357');
      expect(request.campaignId).toBe('campaign-123');
      expect(request.name).toBe('Test Ad Group');
      expect(request.status).toBe('ENABLED');
      expect(request.cpcBid).toBe(2.50);
      expect(request.cpmBid).toBeUndefined();
    });

    it('should define MarinAdGroupResponse extending MarinBaseResponse', () => {
      const response: MarinAdGroupResponse = {
        status: 'SUCCESS',
        id: 'adgroup-456',
        accountId: '5533110357',
        campaignId: 'campaign-123',
        name: 'Test Ad Group',
        adGroupStatus: 'ENABLED',
        cpcBid: 2.50,
        cpmBid: 10.00,
      };

      expect(response.status).toBe('SUCCESS');
      expect(response.id).toBe('adgroup-456');
      expect(response.campaignId).toBe('campaign-123');
      expect(response.adGroupStatus).toBe('ENABLED');
      expect(response.cpcBid).toBe(2.50);
      expect(response.cpmBid).toBe(10.00);
    });

    it('should define MarinAdGroupUpdateRequest with all optional fields', () => {
      const updateRequest: MarinAdGroupUpdateRequest = {
        name: 'Updated Ad Group',
        cpcBid: 3.00,
      };

      expect(updateRequest.name).toBe('Updated Ad Group');
      expect(updateRequest.cpcBid).toBe(3.00);
      expect(updateRequest.status).toBeUndefined();
      expect(updateRequest.cpmBid).toBeUndefined();
    });
  });

  // ==========================================================================
  // Ad Type Tests
  // ==========================================================================

  describe('Ad Types', () => {
    it('should define AdAsset with text and optional pinned property', () => {
      const asset: AdAsset = {
        text: 'Great deals on shoes',
        pinned: true,
      };

      expect(asset.text).toBe('Great deals on shoes');
      expect(asset.pinned).toBe(true);
    });

    it('should define MarinAdRequest with headlines and descriptions', () => {
      const request: MarinAdRequest = {
        accountId: '5533110357',
        adGroupId: 'adgroup-456',
        type: 'RESPONSIVE_SEARCH_AD',
        headlines: [
          { text: 'Headline 1' },
          { text: 'Headline 2' },
          { text: 'Headline 3' },
        ],
        descriptions: [
          { text: 'Description 1' },
          { text: 'Description 2' },
        ],
        finalUrl: 'https://example.com',
        displayUrl: 'example.com',
        paths: ['shoes', 'sale'],
      };

      expect(request.accountId).toBe('5533110357');
      expect(request.adGroupId).toBe('adgroup-456');
      expect(request.type).toBe('RESPONSIVE_SEARCH_AD');
      expect(request.headlines).toHaveLength(3);
      expect(request.descriptions).toHaveLength(2);
      expect(request.finalUrl).toBe('https://example.com');
      expect(request.displayUrl).toBe('example.com');
      expect(request.paths).toEqual(['shoes', 'sale']);
    });

    it('should define MarinAdResponse extending MarinBaseResponse', () => {
      const response: MarinAdResponse = {
        status: 'SUCCESS',
        id: 'ad-789',
        accountId: '5533110357',
        adGroupId: 'adgroup-456',
        type: 'RESPONSIVE_SEARCH_AD',
        headlines: [
          { text: 'Headline 1' },
          { text: 'Headline 2' },
          { text: 'Headline 3' },
        ],
        descriptions: [
          { text: 'Description 1' },
          { text: 'Description 2' },
        ],
        finalUrl: 'https://example.com',
        displayUrl: 'example.com',
        paths: ['shoes', 'sale'],
      };

      expect(response.status).toBe('SUCCESS');
      expect(response.id).toBe('ad-789');
      expect(response.headlines).toHaveLength(3);
      expect(response.descriptions).toHaveLength(2);
    });

    it('should define MarinAdUpdateRequest with all optional fields', () => {
      const updateRequest: MarinAdUpdateRequest = {
        finalUrl: 'https://example.com/updated',
      };

      expect(updateRequest.finalUrl).toBe('https://example.com/updated');
      expect(updateRequest.headlines).toBeUndefined();
      expect(updateRequest.descriptions).toBeUndefined();
    });
  });

  // ==========================================================================
  // Keyword Type Tests
  // ==========================================================================

  describe('Keyword Types', () => {
    it('should define MarinKeywordRequest with all fields', () => {
      const request: MarinKeywordRequest = {
        accountId: '5533110357',
        adGroupId: 'adgroup-456',
        text: 'running shoes',
        matchType: 'PHRASE',
        cpcBid: 1.50,
        status: 'ENABLED',
      };

      expect(request.accountId).toBe('5533110357');
      expect(request.adGroupId).toBe('adgroup-456');
      expect(request.text).toBe('running shoes');
      expect(request.matchType).toBe('PHRASE');
      expect(request.cpcBid).toBe(1.50);
      expect(request.status).toBe('ENABLED');
    });

    it('should define MarinKeywordResponse extending MarinBaseResponse', () => {
      const response: MarinKeywordResponse = {
        status: 'SUCCESS',
        id: 'keyword-999',
        accountId: '5533110357',
        adGroupId: 'adgroup-456',
        text: 'running shoes',
        matchType: 'PHRASE',
        cpcBid: 1.50,
        keywordStatus: 'ENABLED',
      };

      expect(response.status).toBe('SUCCESS');
      expect(response.id).toBe('keyword-999');
      expect(response.text).toBe('running shoes');
      expect(response.matchType).toBe('PHRASE');
      expect(response.keywordStatus).toBe('ENABLED');
    });

    it('should define MarinKeywordUpdateRequest with all optional fields', () => {
      const updateRequest: MarinKeywordUpdateRequest = {
        text: 'updated keyword',
        matchType: 'EXACT',
      };

      expect(updateRequest.text).toBe('updated keyword');
      expect(updateRequest.matchType).toBe('EXACT');
      expect(updateRequest.cpcBid).toBeUndefined();
      expect(updateRequest.status).toBeUndefined();
    });

    it('should define MarinBulkKeywordRequest with keywords array', () => {
      const bulkRequest: MarinBulkKeywordRequest = {
        accountId: '5533110357',
        adGroupId: 'adgroup-456',
        keywords: [
          {
            accountId: '5533110357',
            adGroupId: 'adgroup-456',
            text: 'keyword 1',
            matchType: 'BROAD',
          },
          {
            accountId: '5533110357',
            adGroupId: 'adgroup-456',
            text: 'keyword 2',
            matchType: 'EXACT',
          },
        ],
      };

      expect(bulkRequest.accountId).toBe('5533110357');
      expect(bulkRequest.adGroupId).toBe('adgroup-456');
      expect(bulkRequest.keywords).toHaveLength(2);
      expect(bulkRequest.keywords[0].text).toBe('keyword 1');
      expect(bulkRequest.keywords[1].matchType).toBe('EXACT');
    });
  });

  // ==========================================================================
  // Batch Job Type Tests
  // ==========================================================================

  describe('Batch Job Types', () => {
    it('should define BatchOperation with operation and resource details', () => {
      const operation: BatchOperation = {
        operationType: 'CREATE',
        resourceType: 'CAMPAIGN',
        resource: {
          accountId: '5533110357',
          name: 'Batch Campaign',
          status: 'ENABLED',
          budget: { amount: 5000, deliveryMethod: 'STANDARD' },
          biddingStrategy: 'MAXIMIZE_CONVERSIONS',
        },
        operationId: 'op-1',
      };

      expect(operation.operationType).toBe('CREATE');
      expect(operation.resourceType).toBe('CAMPAIGN');
      expect(operation.resource).toBeDefined();
      expect((operation.resource as MarinCampaignRequest).name).toBe('Batch Campaign');
      expect(operation.operationId).toBe('op-1');
    });

    it('should define BatchJobRequest with accountId and operations', () => {
      const request: BatchJobRequest = {
        accountId: '5533110357',
        publisher: 'google',
        operations: [
          {
            operationType: 'CREATE',
            resourceType: 'CAMPAIGN',
            resource: {
              accountId: '5533110357',
              name: 'Campaign 1',
              status: 'ENABLED',
              budget: { amount: 1000, deliveryMethod: 'STANDARD' },
              biddingStrategy: 'TARGET_CPA',
            },
          },
        ],
      };

      expect(request.accountId).toBe('5533110357');
      expect(request.publisher).toBe('google');
      expect(request.operations).toHaveLength(1);
    });

    it('should define BatchJobResponse with job details and status', () => {
      const response: BatchJobResponse = {
        status: 'SUCCESS',
        id: 'batch-job-123',
        accountId: '5533110357',
        publisher: 'google',
        jobStatus: 'PENDING',
        totalOperations: 10,
        processedOperations: 0,
        createdAt: '2025-11-10T12:00:00Z',
        sequenceToken: 'token-abc',
      };

      expect(response.status).toBe('SUCCESS');
      expect(response.id).toBe('batch-job-123');
      expect(response.jobStatus).toBe('PENDING');
      expect(response.totalOperations).toBe(10);
      expect(response.processedOperations).toBe(0);
      expect(response.createdAt).toBe('2025-11-10T12:00:00Z');
      expect(response.sequenceToken).toBe('token-abc');
    });

    it('should define AddBatchOperationsRequest with operations array', () => {
      const request: AddBatchOperationsRequest = {
        operations: [
          {
            operationType: 'UPDATE',
            resourceType: 'CAMPAIGN',
            resource: {
              accountId: '5533110357',
              name: 'Updated Campaign',
              status: 'PAUSED',
              budget: { amount: 2000, deliveryMethod: 'ACCELERATED' },
              biddingStrategy: 'MAXIMIZE_CLICKS',
            },
          },
        ],
        sequenceToken: 'token-xyz',
      };

      expect(request.operations).toHaveLength(1);
      expect(request.sequenceToken).toBe('token-xyz');
    });

    it('should define AddBatchOperationsResponse with status', () => {
      const response: AddBatchOperationsResponse = {
        operationsAdded: 5,
        sequenceToken: 'token-next',
        status: 'SUCCESS',
      };

      expect(response.operationsAdded).toBe(5);
      expect(response.sequenceToken).toBe('token-next');
      expect(response.status).toBe('SUCCESS');
    });

    it('should define BatchJobResult with operation result details', () => {
      const successResult: BatchJobResult = {
        operationId: 'op-1',
        operationType: 'CREATE',
        resourceType: 'CAMPAIGN',
        success: true,
        resourceId: 'campaign-new-123',
      };

      const failureResult: BatchJobResult = {
        operationId: 'op-2',
        operationType: 'UPDATE',
        resourceType: 'ADGROUP',
        success: false,
        error: 'Ad group not found',
        errorCode: 'NOT_FOUND',
      };

      expect(successResult.success).toBe(true);
      expect(successResult.resourceId).toBe('campaign-new-123');
      expect(failureResult.success).toBe(false);
      expect(failureResult.error).toBe('Ad group not found');
      expect(failureResult.errorCode).toBe('NOT_FOUND');
    });

    it('should define BatchJobResultsRequest with pagination', () => {
      const request: BatchJobResultsRequest = {
        jobId: 'batch-job-123',
        limit: 100,
        pageToken: 'page-1',
      };

      expect(request.jobId).toBe('batch-job-123');
      expect(request.limit).toBe(100);
      expect(request.pageToken).toBe('page-1');
    });

    it('should define BatchJobResultsResponse with results and summary', () => {
      const response: BatchJobResultsResponse = {
        jobId: 'batch-job-123',
        jobStatus: 'DONE',
        summary: {
          total: 100,
          successful: 95,
          failed: 5,
        },
        results: [
          {
            operationId: 'op-1',
            operationType: 'CREATE',
            resourceType: 'CAMPAIGN',
            success: true,
            resourceId: 'campaign-1',
          },
          {
            operationId: 'op-2',
            operationType: 'CREATE',
            resourceType: 'CAMPAIGN',
            success: false,
            error: 'Invalid budget',
            errorCode: 'VALIDATION_ERROR',
          },
        ],
        nextPageToken: 'page-2',
      };

      expect(response.jobId).toBe('batch-job-123');
      expect(response.jobStatus).toBe('DONE');
      expect(response.summary.total).toBe(100);
      expect(response.summary.successful).toBe(95);
      expect(response.summary.failed).toBe(5);
      expect(response.results).toHaveLength(2);
      expect(response.nextPageToken).toBe('page-2');
    });
  });

  // ==========================================================================
  // Type Guard Tests
  // ==========================================================================

  describe('Type Guards', () => {
    describe('isValidCampaignStatus', () => {
      it('should return true for valid campaign statuses', () => {
        expect(isValidCampaignStatus('ENABLED')).toBe(true);
        expect(isValidCampaignStatus('PAUSED')).toBe(true);
        expect(isValidCampaignStatus('REMOVED')).toBe(true);
      });

      it('should return false for invalid campaign statuses', () => {
        expect(isValidCampaignStatus('ACTIVE')).toBe(false);
        expect(isValidCampaignStatus('DELETED')).toBe(false);
        expect(isValidCampaignStatus('')).toBe(false);
      });
    });

    describe('isValidBudgetDeliveryMethod', () => {
      it('should return true for valid delivery methods', () => {
        expect(isValidBudgetDeliveryMethod('STANDARD')).toBe(true);
        expect(isValidBudgetDeliveryMethod('ACCELERATED')).toBe(true);
      });

      it('should return false for invalid delivery methods', () => {
        expect(isValidBudgetDeliveryMethod('FAST')).toBe(false);
        expect(isValidBudgetDeliveryMethod('SLOW')).toBe(false);
        expect(isValidBudgetDeliveryMethod('')).toBe(false);
      });
    });

    describe('isValidKeywordMatchType', () => {
      it('should return true for valid match types', () => {
        expect(isValidKeywordMatchType('BROAD')).toBe(true);
        expect(isValidKeywordMatchType('PHRASE')).toBe(true);
        expect(isValidKeywordMatchType('EXACT')).toBe(true);
      });

      it('should return false for invalid match types', () => {
        expect(isValidKeywordMatchType('MODIFIED')).toBe(false);
        expect(isValidKeywordMatchType('NEGATIVE')).toBe(false);
        expect(isValidKeywordMatchType('')).toBe(false);
      });
    });

    describe('isValidAdType', () => {
      it('should return true for valid ad types', () => {
        expect(isValidAdType('RESPONSIVE_SEARCH_AD')).toBe(true);
      });

      it('should return false for invalid ad types', () => {
        expect(isValidAdType('TEXT_AD')).toBe(false);
        expect(isValidAdType('DISPLAY_AD')).toBe(false);
        expect(isValidAdType('')).toBe(false);
      });
    });

    describe('isValidResourceStatus', () => {
      it('should return true for valid resource statuses', () => {
        expect(isValidResourceStatus('ENABLED')).toBe(true);
        expect(isValidResourceStatus('PAUSED')).toBe(true);
        expect(isValidResourceStatus('REMOVED')).toBe(true);
      });

      it('should return false for invalid resource statuses', () => {
        expect(isValidResourceStatus('ACTIVE')).toBe(false);
        expect(isValidResourceStatus('ARCHIVED')).toBe(false);
        expect(isValidResourceStatus('')).toBe(false);
      });
    });

    describe('isValidBatchOperationType', () => {
      it('should return true for valid operation types', () => {
        expect(isValidBatchOperationType('CREATE')).toBe(true);
        expect(isValidBatchOperationType('UPDATE')).toBe(true);
      });

      it('should return false for invalid operation types', () => {
        expect(isValidBatchOperationType('DELETE')).toBe(false);
        expect(isValidBatchOperationType('READ')).toBe(false);
        expect(isValidBatchOperationType('')).toBe(false);
      });
    });

    describe('isValidBatchResourceType', () => {
      it('should return true for valid resource types', () => {
        expect(isValidBatchResourceType('CAMPAIGN')).toBe(true);
        expect(isValidBatchResourceType('ADGROUP')).toBe(true);
        expect(isValidBatchResourceType('AD')).toBe(true);
        expect(isValidBatchResourceType('KEYWORD')).toBe(true);
      });

      it('should return false for invalid resource types', () => {
        expect(isValidBatchResourceType('USER')).toBe(false);
        expect(isValidBatchResourceType('ACCOUNT')).toBe(false);
        expect(isValidBatchResourceType('')).toBe(false);
      });
    });

    describe('isValidBatchJobStatus', () => {
      it('should return true for valid batch job statuses', () => {
        expect(isValidBatchJobStatus('PENDING')).toBe(true);
        expect(isValidBatchJobStatus('RUNNING')).toBe(true);
        expect(isValidBatchJobStatus('DONE')).toBe(true);
        expect(isValidBatchJobStatus('FAILED')).toBe(true);
        expect(isValidBatchJobStatus('CANCELLED')).toBe(true);
      });

      it('should return false for invalid batch job statuses', () => {
        expect(isValidBatchJobStatus('ACTIVE')).toBe(false);
        expect(isValidBatchJobStatus('COMPLETE')).toBe(false);
        expect(isValidBatchJobStatus('')).toBe(false);
      });
    });
  });

  // ==========================================================================
  // Type Export Tests
  // ==========================================================================

  describe('Type Exports', () => {
    it('should export all campaign-related types', () => {
      // This test verifies that types can be imported and used
      const status: CampaignStatus = 'ENABLED';
      const deliveryMethod: BudgetDeliveryMethod = 'STANDARD';

      expect(status).toBe('ENABLED');
      expect(deliveryMethod).toBe('STANDARD');
    });

    it('should export all keyword-related types', () => {
      const matchType: KeywordMatchType = 'PHRASE';
      expect(matchType).toBe('PHRASE');
    });

    it('should export all ad-related types', () => {
      const adType: AdType = 'RESPONSIVE_SEARCH_AD';
      const status: ResourceStatus = 'ENABLED';

      expect(adType).toBe('RESPONSIVE_SEARCH_AD');
      expect(status).toBe('ENABLED');
    });

    it('should export all batch job-related types', () => {
      const operationType: BatchOperationType = 'CREATE';
      const resourceType: BatchResourceType = 'CAMPAIGN';
      const jobStatus: BatchJobStatus = 'PENDING';

      expect(operationType).toBe('CREATE');
      expect(resourceType).toBe('CAMPAIGN');
      expect(jobStatus).toBe('PENDING');
    });
  });
});
