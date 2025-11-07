/**
 * Google Ads API v16 Mock Response Data
 *
 * This file contains realistic mock data representing actual Google Ads API responses.
 * Based on official Google Ads API v16 documentation from developers.google.com
 *
 * Resource Naming Convention:
 * - Campaign: customers/{customerId}/campaigns/{campaignId}
 * - Ad Group: customers/{customerId}/adGroups/{adGroupId}
 * - Ad: customers/{customerId}/adGroupAds/{adGroupId}~{adId}
 * - Keyword: customers/{customerId}/adGroupCriteria/{adGroupId}~{criterionId}
 * - Budget: customers/{customerId}/campaignBudgets/{budgetId}
 */

// ============================================================================
// ENUMS - Google Ads API Status and Type Enums
// ============================================================================

export enum CampaignStatus {
  ENABLED = 'ENABLED',
  PAUSED = 'PAUSED',
  REMOVED = 'REMOVED',
  UNSPECIFIED = 'UNSPECIFIED',
}

export enum AdGroupStatus {
  ENABLED = 'ENABLED',
  PAUSED = 'PAUSED',
  REMOVED = 'REMOVED',
  UNSPECIFIED = 'UNSPECIFIED',
}

export enum AdGroupAdStatus {
  ENABLED = 'ENABLED',
  PAUSED = 'PAUSED',
  REMOVED = 'REMOVED',
  UNSPECIFIED = 'UNSPECIFIED',
}

export enum AdvertisingChannelType {
  SEARCH = 'SEARCH',
  DISPLAY = 'DISPLAY',
  SHOPPING = 'SHOPPING',
  HOTEL = 'HOTEL',
  VIDEO = 'VIDEO',
  MULTI_CHANNEL = 'MULTI_CHANNEL',
  LOCAL = 'LOCAL',
  SMART = 'SMART',
  PERFORMANCE_MAX = 'PERFORMANCE_MAX',
  UNSPECIFIED = 'UNSPECIFIED',
}

export enum AdGroupType {
  SEARCH_STANDARD = 'SEARCH_STANDARD',
  DISPLAY_STANDARD = 'DISPLAY_STANDARD',
  SHOPPING_PRODUCT_ADS = 'SHOPPING_PRODUCT_ADS',
  VIDEO_RESPONSIVE = 'VIDEO_RESPONSIVE',
  VIDEO_TRUE_VIEW_IN_STREAM = 'VIDEO_TRUE_VIEW_IN_STREAM',
  UNSPECIFIED = 'UNSPECIFIED',
}

export enum KeywordMatchType {
  EXACT = 'EXACT',
  PHRASE = 'PHRASE',
  BROAD = 'BROAD',
  UNSPECIFIED = 'UNSPECIFIED',
}

export enum BiddingStrategyType {
  MAXIMIZE_CONVERSIONS = 'MAXIMIZE_CONVERSIONS',
  MAXIMIZE_CONVERSION_VALUE = 'MAXIMIZE_CONVERSION_VALUE',
  TARGET_CPA = 'TARGET_CPA',
  TARGET_ROAS = 'TARGET_ROAS',
  TARGET_SPEND = 'TARGET_SPEND',
  MANUAL_CPC = 'MANUAL_CPC',
  ENHANCED_CPC = 'ENHANCED_CPC',
  UNSPECIFIED = 'UNSPECIFIED',
}

export enum AdType {
  RESPONSIVE_SEARCH_AD = 'RESPONSIVE_SEARCH_AD',
  EXPANDED_TEXT_AD = 'EXPANDED_TEXT_AD',
  RESPONSIVE_DISPLAY_AD = 'RESPONSIVE_DISPLAY_AD',
  UNSPECIFIED = 'UNSPECIFIED',
}

export enum CriterionType {
  KEYWORD = 'KEYWORD',
  PLACEMENT = 'PLACEMENT',
  LOCATION = 'LOCATION',
  UNSPECIFIED = 'UNSPECIFIED',
}

// ============================================================================
// TYPE DEFINITIONS - Response Structures
// ============================================================================

export interface GoogleAdsError {
  errorCode: {
    requestError?: string;
    authenticationError?: string;
    authorizationError?: string;
    quotaError?: string;
  };
  message: string;
  trigger?: {
    stringValue?: string;
  };
  location?: {
    fieldPathElements: Array<{
      fieldName: string;
      index?: number;
    }>;
  };
}

export interface GoogleAdsFailure {
  errors: GoogleAdsError[];
}

export interface MutateCampaignResult {
  resourceName: string;
}

export interface MutateCampaignsResponse {
  results: MutateCampaignResult[];
  partialFailureError?: GoogleAdsFailure;
}

export interface MutateAdGroupResult {
  resourceName: string;
}

export interface MutateAdGroupsResponse {
  results: MutateAdGroupResult[];
  partialFailureError?: GoogleAdsFailure;
}

export interface MutateAdGroupAdResult {
  resourceName: string;
}

export interface MutateAdGroupAdsResponse {
  results: MutateAdGroupAdResult[];
  partialFailureError?: GoogleAdsFailure;
}

export interface MutateAdGroupCriterionResult {
  resourceName: string;
}

export interface MutateAdGroupCriteriaResponse {
  results: MutateAdGroupCriterionResult[];
  partialFailureError?: GoogleAdsFailure;
}

export interface AdTextAsset {
  text: string;
  pinnedField?: string;
}

export interface ResponsiveSearchAdInfo {
  headlines: AdTextAsset[];
  descriptions: AdTextAsset[];
  path1?: string;
  path2?: string;
}

export interface Ad {
  id: string;
  resourceName: string;
  type: AdType;
  finalUrls: string[];
  responsiveSearchAd?: ResponsiveSearchAdInfo;
  name?: string;
}

export interface Keyword {
  text: string;
  matchType: KeywordMatchType;
}

export interface AdGroupCriterion {
  resourceName: string;
  criterionId: string;
  status: AdGroupAdStatus;
  keyword?: Keyword;
  type: CriterionType;
  cpcBidMicros?: number;
  finalUrls?: string[];
}

export interface Campaign {
  resourceName: string;
  id: string;
  name: string;
  status: CampaignStatus;
  advertisingChannelType: AdvertisingChannelType;
  campaignBudget: string;
  biddingStrategyType?: BiddingStrategyType;
  startDate?: string;
  endDate?: string;
  targetSpend?: {
    targetSpendMicros?: number;
    cpcBidCeilingMicros?: number;
  };
  networkSettings?: {
    targetGoogleSearch: boolean;
    targetSearchNetwork: boolean;
    targetContentNetwork: boolean;
    targetPartnerSearchNetwork: boolean;
  };
}

export interface AdGroup {
  resourceName: string;
  id: string;
  name: string;
  status: AdGroupStatus;
  type: AdGroupType;
  campaign: string;
  cpcBidMicros?: number;
  effectiveCpcBidMicros?: number;
}

export interface AdGroupAd {
  resourceName: string;
  status: AdGroupAdStatus;
  adGroup: string;
  ad: Ad;
}

// Performance Metrics
export interface CampaignMetrics {
  impressions: number;
  clicks: number;
  conversions: number;
  costMicros: number;
  averageCpc: number;
  ctr: number;
  conversionsValue?: number;
  averageCpm?: number;
  searchImpressionShare?: number;
  searchRankLostImpressionShare?: number;
}

export interface AdGroupMetrics {
  impressions: number;
  clicks: number;
  conversions: number;
  costMicros: number;
  averageCpc: number;
  ctr: number;
  conversionsValue?: number;
}

export interface KeywordMetrics {
  impressions: number;
  clicks: number;
  conversions: number;
  costMicros: number;
  averageCpc: number;
  ctr: number;
  conversionsValue: number;
  conversionsFromInteractionsRate?: number;
  costPerConversion?: number;
  qualityScore?: number;
}

export interface CampaignWithMetrics extends Campaign {
  metrics: CampaignMetrics;
}

export interface AdGroupWithMetrics extends AdGroup {
  metrics: AdGroupMetrics;
}

export interface KeywordWithMetrics extends AdGroupCriterion {
  metrics: KeywordMetrics;
}

// ============================================================================
// MOCK DATA - Campaign Responses
// ============================================================================

export const mockCustomerId = '1234567890';

/**
 * Mock response for successful campaign creation
 */
export const mockCreateCampaignResponse: MutateCampaignsResponse = {
  results: [
    {
      resourceName: `customers/${mockCustomerId}/campaigns/1111111111`,
    },
  ],
};

/**
 * Mock response for successful campaign update
 */
export const mockUpdateCampaignResponse: MutateCampaignsResponse = {
  results: [
    {
      resourceName: `customers/${mockCustomerId}/campaigns/1111111111`,
    },
  ],
};

/**
 * Mock campaign query results with metrics - MOTORCYCLE SPECIFIC
 */
export const mockCampaignQueryResults: CampaignWithMetrics[] = [
  {
    resourceName: `customers/${mockCustomerId}/campaigns/1111111111`,
    id: '1111111111',
    name: 'Motorcycle Sales - Search Campaign',
    status: CampaignStatus.ENABLED,
    advertisingChannelType: AdvertisingChannelType.SEARCH,
    campaignBudget: `customers/${mockCustomerId}/campaignBudgets/2222222222`,
    biddingStrategyType: BiddingStrategyType.MAXIMIZE_CONVERSIONS,
    startDate: '2024-01-01',
    endDate: undefined,
    targetSpend: {
      targetSpendMicros: 50000000000, // $50,000
    },
    networkSettings: {
      targetGoogleSearch: true,
      targetSearchNetwork: true,
      targetContentNetwork: false,
      targetPartnerSearchNetwork: false,
    },
    metrics: {
      impressions: 125000,
      clicks: 8500,
      conversions: 425,
      costMicros: 42500000000, // $42,500
      averageCpc: 5.0,
      ctr: 6.8,
      conversionsValue: 127500.0,
      averageCpm: 340.0,
      searchImpressionShare: 0.72,
      searchRankLostImpressionShare: 0.15,
    },
  },
  {
    resourceName: `customers/${mockCustomerId}/campaigns/3333333333`,
    id: '3333333333',
    name: 'Motorcycle Brand Awareness',
    status: CampaignStatus.ENABLED,
    advertisingChannelType: AdvertisingChannelType.DISPLAY,
    campaignBudget: `customers/${mockCustomerId}/campaignBudgets/4444444444`,
    biddingStrategyType: BiddingStrategyType.TARGET_CPA,
    startDate: '2024-02-01',
    endDate: undefined,
    networkSettings: {
      targetGoogleSearch: false,
      targetSearchNetwork: false,
      targetContentNetwork: true,
      targetPartnerSearchNetwork: false,
    },
    metrics: {
      impressions: 500000,
      clicks: 15000,
      conversions: 600,
      costMicros: 30000000000, // $30,000
      averageCpc: 2.0,
      ctr: 3.0,
      conversionsValue: 90000.0,
      averageCpm: 60.0,
    },
  },
  {
    resourceName: `customers/${mockCustomerId}/campaigns/5555555555`,
    id: '5555555555',
    name: 'Spring Riding Season - Performance Max',
    status: CampaignStatus.PAUSED,
    advertisingChannelType: AdvertisingChannelType.PERFORMANCE_MAX,
    campaignBudget: `customers/${mockCustomerId}/campaignBudgets/6666666666`,
    biddingStrategyType: BiddingStrategyType.MAXIMIZE_CONVERSION_VALUE,
    startDate: '2024-11-01',
    endDate: '2024-12-31',
    metrics: {
      impressions: 75000,
      clicks: 4500,
      conversions: 180,
      costMicros: 18000000000, // $18,000
      averageCpc: 4.0,
      ctr: 6.0,
      conversionsValue: 72000.0,
    },
  },
];

// ============================================================================
// MOCK DATA - Ad Group Responses
// ============================================================================

/**
 * Mock response for successful ad group creation
 */
export const mockCreateAdGroupResponse: MutateAdGroupsResponse = {
  results: [
    {
      resourceName: `customers/${mockCustomerId}/adGroups/7777777777`,
    },
  ],
};

/**
 * Mock ad group query results with metrics - MOTORCYCLE SPECIFIC
 */
export const mockAdGroupQueryResults: AdGroupWithMetrics[] = [
  {
    resourceName: `customers/${mockCustomerId}/adGroups/7777777777`,
    id: '7777777777',
    name: 'Harley-Davidson - Cruisers',
    status: AdGroupStatus.ENABLED,
    type: AdGroupType.SEARCH_STANDARD,
    campaign: `customers/${mockCustomerId}/campaigns/1111111111`,
    cpcBidMicros: 2500000, // $2.50
    effectiveCpcBidMicros: 2500000,
    metrics: {
      impressions: 45000,
      clicks: 3150,
      conversions: 158,
      costMicros: 15750000000, // $15,750
      averageCpc: 5.0,
      ctr: 7.0,
      conversionsValue: 47400.0,
    },
  },
  {
    resourceName: `customers/${mockCustomerId}/adGroups/8888888888`,
    id: '8888888888',
    name: 'Triumph - Cafe Racers',
    status: AdGroupStatus.ENABLED,
    type: AdGroupType.SEARCH_STANDARD,
    campaign: `customers/${mockCustomerId}/campaigns/1111111111`,
    cpcBidMicros: 2200000, // $2.20
    effectiveCpcBidMicros: 2200000,
    metrics: {
      impressions: 32000,
      clicks: 2240,
      conversions: 112,
      costMicros: 11200000000, // $11,200
      averageCpc: 5.0,
      ctr: 7.0,
      conversionsValue: 33600.0,
    },
  },
  {
    resourceName: `customers/${mockCustomerId}/adGroups/9999999999`,
    id: '9999999999',
    name: 'Honda + Yamaha - Classic Bikes',
    status: AdGroupStatus.ENABLED,
    type: AdGroupType.SEARCH_STANDARD,
    campaign: `customers/${mockCustomerId}/campaigns/1111111111`,
    cpcBidMicros: 1800000, // $1.80
    effectiveCpcBidMicros: 1800000,
    metrics: {
      impressions: 48000,
      clicks: 3110,
      conversions: 155,
      costMicros: 15550000000, // $15,550
      averageCpc: 5.0,
      ctr: 6.48,
      conversionsValue: 46500.0,
    },
  },
];

// ============================================================================
// MOCK DATA - Keyword (Ad Group Criterion) Responses
// ============================================================================

/**
 * Mock response for successful keyword creation
 */
export const mockCreateKeywordResponse: MutateAdGroupCriteriaResponse = {
  results: [
    {
      resourceName: `customers/${mockCustomerId}/adGroupCriteria/7777777777~1000000001`,
    },
  ],
};

/**
 * Mock response for bulk keyword creation
 */
export const mockBulkCreateKeywordsResponse: MutateAdGroupCriteriaResponse = {
  results: [
    {
      resourceName: `customers/${mockCustomerId}/adGroupCriteria/7777777777~1000000001`,
    },
    {
      resourceName: `customers/${mockCustomerId}/adGroupCriteria/7777777777~1000000002`,
    },
    {
      resourceName: `customers/${mockCustomerId}/adGroupCriteria/7777777777~1000000003`,
    },
    {
      resourceName: `customers/${mockCustomerId}/adGroupCriteria/7777777777~1000000004`,
    },
    {
      resourceName: `customers/${mockCustomerId}/adGroupCriteria/7777777777~1000000005`,
    },
  ],
};

/**
 * Mock keyword query results with performance metrics - MOTORCYCLE SPECIFIC
 */
export const mockKeywordQueryResults: KeywordWithMetrics[] = [
  {
    resourceName: `customers/${mockCustomerId}/adGroupCriteria/7777777777~1000000001`,
    criterionId: '1000000001',
    status: AdGroupAdStatus.ENABLED,
    type: CriterionType.KEYWORD,
    cpcBidMicros: 2500000, // $2.50
    keyword: {
      text: 'harley davidson cruiser',
      matchType: KeywordMatchType.PHRASE,
    },
    metrics: {
      impressions: 10000,
      clicks: 700,
      conversions: 35,
      costMicros: 1750000000, // $1,750
      averageCpc: 2.5,
      ctr: 7.0,
      conversionsValue: 52500.0,
      conversionsFromInteractionsRate: 5.0,
      costPerConversion: 50.0,
      qualityScore: 8,
    },
  },
  {
    resourceName: `customers/${mockCustomerId}/adGroupCriteria/7777777777~1000000002`,
    criterionId: '1000000002',
    status: AdGroupAdStatus.ENABLED,
    type: CriterionType.KEYWORD,
    cpcBidMicros: 2800000, // $2.80
    keyword: {
      text: 'buy harley davidson',
      matchType: KeywordMatchType.BROAD,
    },
    metrics: {
      impressions: 8500,
      clicks: 510,
      conversions: 26,
      costMicros: 1428000000, // $1,428
      averageCpc: 2.8,
      ctr: 6.0,
      conversionsValue: 39000.0,
      conversionsFromInteractionsRate: 5.1,
      costPerConversion: 54.92,
      qualityScore: 7,
    },
  },
  {
    resourceName: `customers/${mockCustomerId}/adGroupCriteria/8888888888~1000000003`,
    criterionId: '1000000003',
    status: AdGroupAdStatus.ENABLED,
    type: CriterionType.KEYWORD,
    cpcBidMicros: 2200000, // $2.20
    keyword: {
      text: 'triumph cafe racer',
      matchType: KeywordMatchType.EXACT,
    },
    metrics: {
      impressions: 5000,
      clicks: 400,
      conversions: 24,
      costMicros: 880000000, // $880
      averageCpc: 2.2,
      ctr: 8.0,
      conversionsValue: 28800.0,
      conversionsFromInteractionsRate: 6.0,
      costPerConversion: 36.67,
      qualityScore: 9,
    },
  },
  {
    resourceName: `customers/${mockCustomerId}/adGroupCriteria/8888888888~1000000004`,
    criterionId: '1000000004',
    status: AdGroupAdStatus.ENABLED,
    type: CriterionType.KEYWORD,
    cpcBidMicros: 2000000, // $2.00
    keyword: {
      text: 'triumph thruxton motorcycle',
      matchType: KeywordMatchType.PHRASE,
    },
    metrics: {
      impressions: 6500,
      clicks: 455,
      conversions: 27,
      costMicros: 910000000, // $910
      averageCpc: 2.0,
      ctr: 7.0,
      conversionsValue: 35100.0,
      conversionsFromInteractionsRate: 5.93,
      costPerConversion: 33.70,
      qualityScore: 8,
    },
  },
  {
    resourceName: `customers/${mockCustomerId}/adGroupCriteria/9999999999~1000000005`,
    criterionId: '1000000005',
    status: AdGroupAdStatus.ENABLED,
    type: CriterionType.KEYWORD,
    cpcBidMicros: 1800000, // $1.80
    keyword: {
      text: 'classic motorcycle for sale',
      matchType: KeywordMatchType.BROAD,
    },
    metrics: {
      impressions: 12000,
      clicks: 720,
      conversions: 36,
      costMicros: 1296000000, // $1,296
      averageCpc: 1.8,
      ctr: 6.0,
      conversionsValue: 21600.0,
      conversionsFromInteractionsRate: 5.0,
      costPerConversion: 36.0,
      qualityScore: 7,
    },
  },
  {
    resourceName: `customers/${mockCustomerId}/adGroupCriteria/9999999999~1000000006`,
    criterionId: '1000000006',
    status: AdGroupAdStatus.ENABLED,
    type: CriterionType.KEYWORD,
    cpcBidMicros: 1600000, // $1.60
    keyword: {
      text: 'honda cb350',
      matchType: KeywordMatchType.EXACT,
    },
    metrics: {
      impressions: 4200,
      clicks: 336,
      conversions: 21,
      costMicros: 537600000, // $537.60
      averageCpc: 1.6,
      ctr: 8.0,
      conversionsValue: 11550.0,
      conversionsFromInteractionsRate: 6.25,
      costPerConversion: 25.60,
      qualityScore: 9,
    },
  },
  {
    resourceName: `customers/${mockCustomerId}/adGroupCriteria/9999999999~1000000007`,
    criterionId: '1000000007',
    status: AdGroupAdStatus.ENABLED,
    type: CriterionType.KEYWORD,
    cpcBidMicros: 1700000, // $1.70
    keyword: {
      text: 'yamaha sr400 for sale',
      matchType: KeywordMatchType.PHRASE,
    },
    metrics: {
      impressions: 3800,
      clicks: 266,
      conversions: 16,
      costMicros: 452200000, // $452.20
      averageCpc: 1.7,
      ctr: 7.0,
      conversionsValue: 11200.0,
      conversionsFromInteractionsRate: 6.02,
      costPerConversion: 28.26,
      qualityScore: 8,
    },
  },
];

// ============================================================================
// MOCK DATA - Responsive Search Ad Responses
// ============================================================================

/**
 * Mock response for successful RSA creation
 */
export const mockCreateRSAResponse: MutateAdGroupAdsResponse = {
  results: [
    {
      resourceName: `customers/${mockCustomerId}/adGroupAds/7777777777~2000000001`,
    },
  ],
};

/**
 * Mock RSA query results - MOTORCYCLE SPECIFIC
 */
export const mockRSAQueryResults: AdGroupAd[] = [
  {
    resourceName: `customers/${mockCustomerId}/adGroupAds/7777777777~2000000001`,
    status: AdGroupAdStatus.ENABLED,
    adGroup: `customers/${mockCustomerId}/adGroups/7777777777`,
    ad: {
      id: '2000000001',
      resourceName: `customers/${mockCustomerId}/ads/2000000001`,
      type: AdType.RESPONSIVE_SEARCH_AD,
      finalUrls: ['https://example.com/harley-davidson-cruisers'],
      responsiveSearchAd: {
        headlines: [
          { text: 'Harley-Davidson Cruisers' },
          { text: 'Legendary V-Twin Power' },
          { text: 'American Icon Motorcycles' },
          { text: 'Shop Harley Cruisers Now' },
          { text: 'Premium Harley-Davidson' },
          { text: 'Authentic Riding Experience' },
          { text: 'Financing Available' },
          { text: 'Authorized Dealer' },
        ],
        descriptions: [
          { text: 'Experience the freedom of the open road with legendary Harley-Davidson cruisers. Financing available.' },
          { text: 'Shop our premium selection of Harley cruisers. Authorized dealer with expert service.' },
          { text: 'Join the Harley family. Test rides available. Trade-ins welcome.' },
        ],
        path1: 'harley',
        path2: 'cruisers',
      },
    },
  },
  {
    resourceName: `customers/${mockCustomerId}/adGroupAds/8888888888~2000000002`,
    status: AdGroupAdStatus.ENABLED,
    adGroup: `customers/${mockCustomerId}/adGroups/8888888888`,
    ad: {
      id: '2000000002',
      resourceName: `customers/${mockCustomerId}/ads/2000000002`,
      type: AdType.RESPONSIVE_SEARCH_AD,
      finalUrls: ['https://example.com/triumph-cafe-racers'],
      responsiveSearchAd: {
        headlines: [
          { text: 'Triumph Cafe Racers' },
          { text: 'British Engineering Excellence' },
          { text: 'Thruxton & Street Twin' },
          { text: 'Classic Style Modern Tech' },
          { text: 'Premium Cafe Racer Bikes' },
          { text: 'Iconic Triumph Design' },
          { text: 'Test Ride Today' },
          { text: 'Authorized Triumph Dealer' },
        ],
        descriptions: [
          { text: 'Discover Triumph cafe racers combining timeless British style with modern performance. Test rides available.' },
          { text: 'Shop Thruxton and Street Twin models. Premium quality with comprehensive warranty.' },
          { text: 'Experience British motorcycle heritage. Expert service and financing options available.' },
        ],
        path1: 'triumph',
        path2: 'cafe-racer',
      },
    },
  },
  {
    resourceName: `customers/${mockCustomerId}/adGroupAds/9999999999~2000000003`,
    status: AdGroupAdStatus.ENABLED,
    adGroup: `customers/${mockCustomerId}/adGroups/9999999999`,
    ad: {
      id: '2000000003',
      resourceName: `customers/${mockCustomerId}/ads/2000000003`,
      type: AdType.RESPONSIVE_SEARCH_AD,
      finalUrls: ['https://example.com/classic-motorcycles'],
      responsiveSearchAd: {
        headlines: [
          { text: 'Classic Motorcycles For Sale' },
          { text: 'Honda CB350 & Yamaha SR400' },
          { text: 'Retro Style Modern Reliability' },
          { text: 'Affordable Classic Bikes' },
          { text: 'Japanese Motorcycle Quality' },
          { text: 'Perfect First Motorcycle' },
          { text: 'Starting Under $7,000' },
          { text: 'Low Insurance Rates' },
        ],
        descriptions: [
          { text: 'Shop Honda CB350 and Yamaha SR400 classic motorcycles. Timeless design with legendary reliability.' },
          { text: 'Affordable classics starting under $7,000. Perfect for new and experienced riders.' },
          { text: 'Low maintenance, easy to ride, classic style. Financing and trade-ins available.' },
        ],
        path1: 'classic',
        path2: 'motorcycles',
      },
    },
  },
];

// ============================================================================
// MOCK DATA - Error Responses
// ============================================================================

/**
 * Mock authentication error response
 */
export const mockAuthenticationError: GoogleAdsFailure = {
  errors: [
    {
      errorCode: {
        authenticationError: 'AUTHENTICATION_ERROR',
      },
      message: 'Authentication of the request failed.',
    },
  ],
};

/**
 * Mock authorization error response
 */
export const mockAuthorizationError: GoogleAdsFailure = {
  errors: [
    {
      errorCode: {
        authorizationError: 'USER_PERMISSION_DENIED',
      },
      message: 'User does not have permission to access customer.',
    },
  ],
};

/**
 * Mock quota exceeded error response
 */
export const mockQuotaError: GoogleAdsFailure = {
  errors: [
    {
      errorCode: {
        quotaError: 'RESOURCE_EXHAUSTED',
      },
      message: 'Quota exceeded for quota metric "google.ads.api.requests" and limit "requests per minute".',
    },
  ],
};

/**
 * Mock request error with field path
 */
export const mockRequestError: GoogleAdsFailure = {
  errors: [
    {
      errorCode: {
        requestError: 'INVALID_OPERATION',
      },
      message: 'The operation is invalid.',
      trigger: {
        stringValue: 'Invalid campaign budget value',
      },
      location: {
        fieldPathElements: [
          {
            fieldName: 'operations',
            index: 0,
          },
          {
            fieldName: 'create',
          },
          {
            fieldName: 'campaign_budget',
          },
        ],
      },
    },
  ],
};

/**
 * Mock partial failure response (some operations succeeded, some failed)
 */
export const mockPartialFailureResponse: MutateAdGroupCriteriaResponse = {
  results: [
    {
      resourceName: `customers/${mockCustomerId}/adGroupCriteria/7777777777~1000000001`,
    },
    {
      resourceName: '', // Failed operation
    },
    {
      resourceName: `customers/${mockCustomerId}/adGroupCriteria/7777777777~1000000003`,
    },
  ],
  partialFailureError: {
    errors: [
      {
        errorCode: {
          requestError: 'DUPLICATE_OPERATION',
        },
        message: 'The operation contains a duplicate element.',
        location: {
          fieldPathElements: [
            {
              fieldName: 'operations',
              index: 1,
            },
          ],
        },
      },
    ],
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate a mock resource name for campaigns
 */
export function generateCampaignResourceName(customerId: string, campaignId: string): string {
  return `customers/${customerId}/campaigns/${campaignId}`;
}

/**
 * Generate a mock resource name for ad groups
 */
export function generateAdGroupResourceName(customerId: string, adGroupId: string): string {
  return `customers/${customerId}/adGroups/${adGroupId}`;
}

/**
 * Generate a mock resource name for ads
 */
export function generateAdResourceName(customerId: string, adGroupId: string, adId: string): string {
  return `customers/${customerId}/adGroupAds/${adGroupId}~${adId}`;
}

/**
 * Generate a mock resource name for keywords
 */
export function generateKeywordResourceName(
  customerId: string,
  adGroupId: string,
  criterionId: string
): string {
  return `customers/${customerId}/adGroupCriteria/${adGroupId}~${criterionId}`;
}

/**
 * Generate a random campaign ID
 */
export function generateCampaignId(): string {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

/**
 * Generate a random ad group ID
 */
export function generateAdGroupId(): string {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

/**
 * Generate a random ad ID
 */
export function generateAdId(): string {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

/**
 * Generate a random criterion ID
 */
export function generateCriterionId(): string {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

/**
 * Simulate API delay
 */
export async function simulateApiDelay(minMs: number = 300, maxMs: number = 1000): Promise<void> {
  const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return new Promise((resolve) => setTimeout(resolve, delay));
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  // Response objects
  mockCreateCampaignResponse,
  mockUpdateCampaignResponse,
  mockCampaignQueryResults,
  mockCreateAdGroupResponse,
  mockAdGroupQueryResults,
  mockCreateKeywordResponse,
  mockBulkCreateKeywordsResponse,
  mockKeywordQueryResults,
  mockCreateRSAResponse,
  mockRSAQueryResults,

  // Error responses
  mockAuthenticationError,
  mockAuthorizationError,
  mockQuotaError,
  mockRequestError,
  mockPartialFailureResponse,

  // Helper functions
  generateCampaignResourceName,
  generateAdGroupResourceName,
  generateAdResourceName,
  generateKeywordResourceName,
  generateCampaignId,
  generateAdGroupId,
  generateAdId,
  generateCriterionId,
  simulateApiDelay,

  // Constants
  mockCustomerId,
};
