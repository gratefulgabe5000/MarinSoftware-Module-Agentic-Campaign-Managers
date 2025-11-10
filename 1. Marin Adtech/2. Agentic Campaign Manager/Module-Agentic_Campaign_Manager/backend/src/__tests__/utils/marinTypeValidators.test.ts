/**
 * Unit tests for Marin Dispatcher Type Validation Utilities
 *
 * @module marinTypeValidators.test
 */

import {
  validateCampaignRequest,
  validateAdGroupRequest,
  validateAdRequest,
  validateKeywordRequest,
  validateBatchOperation,
} from '../../utils/marinTypeValidators';
import {
  MarinCampaignRequest,
  MarinAdGroupRequest,
  MarinAdRequest,
  MarinKeywordRequest,
  BatchOperation,
} from '../../types/marinDispatcher.types';

describe('marinTypeValidators', () => {
  // ==========================================================================
  // validateCampaignRequest Tests
  // ==========================================================================

  describe('validateCampaignRequest', () => {
    it('should validate a valid campaign request', () => {
      const validRequest: MarinCampaignRequest = {
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

      const result = validateCampaignRequest(validRequest);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject campaign request with missing accountId', () => {
      const invalidRequest: any = {
        name: 'Test Campaign',
        status: 'ENABLED',
        budget: {
          amount: 1000,
          deliveryMethod: 'STANDARD',
        },
        biddingStrategy: 'TARGET_CPA',
      };

      const result = validateCampaignRequest(invalidRequest);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('accountId is required and must be a non-empty string');
    });

    it('should reject campaign request with empty name', () => {
      const invalidRequest: MarinCampaignRequest = {
        accountId: '5533110357',
        name: '',
        status: 'ENABLED',
        budget: {
          amount: 1000,
          deliveryMethod: 'STANDARD',
        },
        biddingStrategy: 'TARGET_CPA',
      };

      const result = validateCampaignRequest(invalidRequest);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('name is required and must be a non-empty string');
    });

    it('should reject campaign request with name exceeding 255 characters', () => {
      const longName = 'a'.repeat(256);
      const invalidRequest: MarinCampaignRequest = {
        accountId: '5533110357',
        name: longName,
        status: 'ENABLED',
        budget: {
          amount: 1000,
          deliveryMethod: 'STANDARD',
        },
        biddingStrategy: 'TARGET_CPA',
      };

      const result = validateCampaignRequest(invalidRequest);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('name must not exceed 255 characters');
    });

    it('should reject campaign request with invalid status', () => {
      const invalidRequest: any = {
        accountId: '5533110357',
        name: 'Test Campaign',
        status: 'INVALID_STATUS',
        budget: {
          amount: 1000,
          deliveryMethod: 'STANDARD',
        },
        biddingStrategy: 'TARGET_CPA',
      };

      const result = validateCampaignRequest(invalidRequest);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('status must be one of: ENABLED, PAUSED, REMOVED');
    });

    it('should reject campaign request with negative budget amount', () => {
      const invalidRequest: MarinCampaignRequest = {
        accountId: '5533110357',
        name: 'Test Campaign',
        status: 'ENABLED',
        budget: {
          amount: -100,
          deliveryMethod: 'STANDARD',
        },
        biddingStrategy: 'TARGET_CPA',
      };

      const result = validateCampaignRequest(invalidRequest);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('budget.amount must be a positive number');
    });

    it('should reject campaign request with invalid delivery method', () => {
      const invalidRequest: any = {
        accountId: '5533110357',
        name: 'Test Campaign',
        status: 'ENABLED',
        budget: {
          amount: 1000,
          deliveryMethod: 'INVALID_METHOD',
        },
        biddingStrategy: 'TARGET_CPA',
      };

      const result = validateCampaignRequest(invalidRequest);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('budget.deliveryMethod must be one of: STANDARD, ACCELERATED');
    });

    it('should reject campaign request with missing biddingStrategy', () => {
      const invalidRequest: any = {
        accountId: '5533110357',
        name: 'Test Campaign',
        status: 'ENABLED',
        budget: {
          amount: 1000,
          deliveryMethod: 'STANDARD',
        },
      };

      const result = validateCampaignRequest(invalidRequest);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('biddingStrategy is required and must be a non-empty string');
    });
  });

  // ==========================================================================
  // validateAdGroupRequest Tests
  // ==========================================================================

  describe('validateAdGroupRequest', () => {
    it('should validate a valid ad group request', () => {
      const validRequest: MarinAdGroupRequest = {
        accountId: '5533110357',
        campaignId: 'campaign-123',
        name: 'Test Ad Group',
        status: 'ENABLED',
        cpcBid: 1.5,
        cpmBid: 10.0,
      };

      const result = validateAdGroupRequest(validRequest);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate ad group request without optional fields', () => {
      const validRequest: MarinAdGroupRequest = {
        accountId: '5533110357',
        campaignId: 'campaign-123',
        name: 'Test Ad Group',
      };

      const result = validateAdGroupRequest(validRequest);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject ad group request with missing accountId', () => {
      const invalidRequest: any = {
        campaignId: 'campaign-123',
        name: 'Test Ad Group',
      };

      const result = validateAdGroupRequest(invalidRequest);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('accountId is required and must be a non-empty string');
    });

    it('should reject ad group request with missing campaignId', () => {
      const invalidRequest: any = {
        accountId: '5533110357',
        name: 'Test Ad Group',
      };

      const result = validateAdGroupRequest(invalidRequest);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('campaignId is required and must be a non-empty string');
    });

    it('should reject ad group request with invalid status', () => {
      const invalidRequest: any = {
        accountId: '5533110357',
        campaignId: 'campaign-123',
        name: 'Test Ad Group',
        status: 'INVALID_STATUS',
      };

      const result = validateAdGroupRequest(invalidRequest);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('status must be one of: ENABLED, PAUSED, REMOVED');
    });

    it('should reject ad group request with negative cpcBid', () => {
      const invalidRequest: MarinAdGroupRequest = {
        accountId: '5533110357',
        campaignId: 'campaign-123',
        name: 'Test Ad Group',
        cpcBid: -1.5,
      };

      const result = validateAdGroupRequest(invalidRequest);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('cpcBid must be a positive number if provided');
    });
  });

  // ==========================================================================
  // validateAdRequest Tests
  // ==========================================================================

  describe('validateAdRequest', () => {
    it('should validate a valid ad request', () => {
      const validRequest: MarinAdRequest = {
        accountId: '5533110357',
        adGroupId: 'adgroup-123',
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
        paths: ['path1', 'path2'],
      };

      const result = validateAdRequest(validRequest);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject ad request with missing accountId', () => {
      const invalidRequest: any = {
        adGroupId: 'adgroup-123',
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
      };

      const result = validateAdRequest(invalidRequest);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('accountId is required and must be a non-empty string');
    });

    it('should reject ad request with invalid type', () => {
      const invalidRequest: any = {
        accountId: '5533110357',
        adGroupId: 'adgroup-123',
        type: 'INVALID_TYPE',
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
      };

      const result = validateAdRequest(invalidRequest);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('type must be RESPONSIVE_SEARCH_AD');
    });

    it('should reject ad request with too few headlines', () => {
      const invalidRequest: MarinAdRequest = {
        accountId: '5533110357',
        adGroupId: 'adgroup-123',
        type: 'RESPONSIVE_SEARCH_AD',
        headlines: [
          { text: 'Headline 1' },
          { text: 'Headline 2' },
        ],
        descriptions: [
          { text: 'Description 1' },
          { text: 'Description 2' },
        ],
        finalUrl: 'https://example.com',
      };

      const result = validateAdRequest(invalidRequest);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('headlines must have at least 3 items');
    });

    it('should reject ad request with too many headlines', () => {
      const invalidRequest: MarinAdRequest = {
        accountId: '5533110357',
        adGroupId: 'adgroup-123',
        type: 'RESPONSIVE_SEARCH_AD',
        headlines: Array.from({ length: 16 }, (_, i) => ({ text: `Headline ${i + 1}` })),
        descriptions: [
          { text: 'Description 1' },
          { text: 'Description 2' },
        ],
        finalUrl: 'https://example.com',
      };

      const result = validateAdRequest(invalidRequest);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('headlines must have at most 15 items');
    });

    it('should reject ad request with headline exceeding 30 characters', () => {
      const invalidRequest: MarinAdRequest = {
        accountId: '5533110357',
        adGroupId: 'adgroup-123',
        type: 'RESPONSIVE_SEARCH_AD',
        headlines: [
          { text: 'This is a very long headline that exceeds the limit' },
          { text: 'Headline 2' },
          { text: 'Headline 3' },
        ],
        descriptions: [
          { text: 'Description 1' },
          { text: 'Description 2' },
        ],
        finalUrl: 'https://example.com',
      };

      const result = validateAdRequest(invalidRequest);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('headlines[0].text must not exceed 30 characters');
    });

    it('should reject ad request with too few descriptions', () => {
      const invalidRequest: MarinAdRequest = {
        accountId: '5533110357',
        adGroupId: 'adgroup-123',
        type: 'RESPONSIVE_SEARCH_AD',
        headlines: [
          { text: 'Headline 1' },
          { text: 'Headline 2' },
          { text: 'Headline 3' },
        ],
        descriptions: [
          { text: 'Description 1' },
        ],
        finalUrl: 'https://example.com',
      };

      const result = validateAdRequest(invalidRequest);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('descriptions must have at least 2 items');
    });

    it('should reject ad request with description exceeding 90 characters', () => {
      const longDescription = 'This is a very long description that exceeds the ninety character limit for ad descriptions';
      const invalidRequest: MarinAdRequest = {
        accountId: '5533110357',
        adGroupId: 'adgroup-123',
        type: 'RESPONSIVE_SEARCH_AD',
        headlines: [
          { text: 'Headline 1' },
          { text: 'Headline 2' },
          { text: 'Headline 3' },
        ],
        descriptions: [
          { text: longDescription },
          { text: 'Description 2' },
        ],
        finalUrl: 'https://example.com',
      };

      const result = validateAdRequest(invalidRequest);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('descriptions[0].text must not exceed 90 characters');
    });

    it('should reject ad request with invalid finalUrl', () => {
      const invalidRequest: MarinAdRequest = {
        accountId: '5533110357',
        adGroupId: 'adgroup-123',
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
        finalUrl: 'not-a-valid-url',
      };

      const result = validateAdRequest(invalidRequest);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('finalUrl must be a valid URL');
    });
  });

  // ==========================================================================
  // validateKeywordRequest Tests
  // ==========================================================================

  describe('validateKeywordRequest', () => {
    it('should validate a valid keyword request', () => {
      const validRequest: MarinKeywordRequest = {
        accountId: '5533110357',
        adGroupId: 'adgroup-123',
        text: 'test keyword',
        matchType: 'BROAD',
        cpcBid: 1.5,
        status: 'ENABLED',
      };

      const result = validateKeywordRequest(validRequest);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate keyword request without optional fields', () => {
      const validRequest: MarinKeywordRequest = {
        accountId: '5533110357',
        adGroupId: 'adgroup-123',
        text: 'test keyword',
        matchType: 'PHRASE',
      };

      const result = validateKeywordRequest(validRequest);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject keyword request with missing accountId', () => {
      const invalidRequest: any = {
        adGroupId: 'adgroup-123',
        text: 'test keyword',
        matchType: 'EXACT',
      };

      const result = validateKeywordRequest(invalidRequest);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('accountId is required and must be a non-empty string');
    });

    it('should reject keyword request with text exceeding 80 characters', () => {
      const longText = 'a'.repeat(81);
      const invalidRequest: MarinKeywordRequest = {
        accountId: '5533110357',
        adGroupId: 'adgroup-123',
        text: longText,
        matchType: 'BROAD',
      };

      const result = validateKeywordRequest(invalidRequest);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('text must not exceed 80 characters');
    });

    it('should reject keyword request with invalid matchType', () => {
      const invalidRequest: any = {
        accountId: '5533110357',
        adGroupId: 'adgroup-123',
        text: 'test keyword',
        matchType: 'INVALID_MATCH_TYPE',
      };

      const result = validateKeywordRequest(invalidRequest);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('matchType must be one of: BROAD, PHRASE, EXACT');
    });

    it('should reject keyword request with negative cpcBid', () => {
      const invalidRequest: MarinKeywordRequest = {
        accountId: '5533110357',
        adGroupId: 'adgroup-123',
        text: 'test keyword',
        matchType: 'BROAD',
        cpcBid: -1.5,
      };

      const result = validateKeywordRequest(invalidRequest);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('cpcBid must be a positive number if provided');
    });
  });

  // ==========================================================================
  // validateBatchOperation Tests
  // ==========================================================================

  describe('validateBatchOperation', () => {
    it('should validate a valid batch operation for campaign creation', () => {
      const validOperation: BatchOperation = {
        operationType: 'CREATE',
        resourceType: 'CAMPAIGN',
        resource: {
          accountId: '5533110357',
          name: 'Test Campaign',
          status: 'ENABLED',
          budget: {
            amount: 1000,
            deliveryMethod: 'STANDARD',
          },
          biddingStrategy: 'TARGET_CPA',
        },
        operationId: 'op-123',
      };

      const result = validateBatchOperation(validOperation);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate a valid batch operation for ad group creation', () => {
      const validOperation: BatchOperation = {
        operationType: 'CREATE',
        resourceType: 'ADGROUP',
        resource: {
          accountId: '5533110357',
          campaignId: 'campaign-123',
          name: 'Test Ad Group',
        },
      };

      const result = validateBatchOperation(validOperation);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject batch operation with invalid operationType', () => {
      const invalidOperation: any = {
        operationType: 'INVALID_OPERATION',
        resourceType: 'CAMPAIGN',
        resource: {
          accountId: '5533110357',
          name: 'Test Campaign',
          status: 'ENABLED',
          budget: {
            amount: 1000,
            deliveryMethod: 'STANDARD',
          },
          biddingStrategy: 'TARGET_CPA',
        },
      };

      const result = validateBatchOperation(invalidOperation);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('operationType must be one of: CREATE, UPDATE');
    });

    it('should reject batch operation with invalid resourceType', () => {
      const invalidOperation: any = {
        operationType: 'CREATE',
        resourceType: 'INVALID_RESOURCE',
        resource: {
          accountId: '5533110357',
          name: 'Test Resource',
        },
      };

      const result = validateBatchOperation(invalidOperation);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('resourceType must be one of: CAMPAIGN, ADGROUP, AD, KEYWORD');
    });

    it('should reject batch operation with invalid campaign resource', () => {
      const invalidOperation: BatchOperation = {
        operationType: 'CREATE',
        resourceType: 'CAMPAIGN',
        resource: {
          accountId: '5533110357',
          name: '',  // Invalid: empty name
          status: 'ENABLED',
          budget: {
            amount: 1000,
            deliveryMethod: 'STANDARD',
          },
          biddingStrategy: 'TARGET_CPA',
        } as MarinCampaignRequest,
      };

      const result = validateBatchOperation(invalidOperation);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(err => err.includes('name'))).toBe(true);
    });

    it('should reject batch operation with invalid keyword resource', () => {
      const invalidOperation: BatchOperation = {
        operationType: 'CREATE',
        resourceType: 'KEYWORD',
        resource: {
          accountId: '5533110357',
          adGroupId: 'adgroup-123',
          text: 'test keyword',
          matchType: 'INVALID_TYPE' as any,  // Invalid match type
        },
      };

      const result = validateBatchOperation(invalidOperation);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(err => err.includes('matchType'))).toBe(true);
    });
  });
});
