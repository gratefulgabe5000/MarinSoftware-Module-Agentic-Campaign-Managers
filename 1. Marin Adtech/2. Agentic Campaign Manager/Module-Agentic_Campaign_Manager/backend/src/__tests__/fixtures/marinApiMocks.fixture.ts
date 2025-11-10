/**
 * Mock Marin Dispatcher API Responses
 * Test fixtures for Marin API integration testing
 */

/**
 * Mock Campaign Creation Success Response
 */
export const mockCampaignCreateSuccess = {
  resourceId: 'campaign-12345',
  status: 'SUCCESS' as const,
  errors: [],
  warnings: [],
};

/**
 * Mock Campaign Creation Failure Response
 */
export const mockCampaignCreateFailure = {
  resourceId: undefined,
  status: 'FAILURE' as const,
  errors: ['Campaign name already exists', 'Invalid budget amount'],
  warnings: [],
};

/**
 * Mock Ad Group Creation Success Response
 */
export const mockAdGroupCreateSuccess = {
  resourceId: 'adgroup-67890',
  status: 'SUCCESS' as const,
  errors: [],
  warnings: ['Ad group created with default bid'],
};

/**
 * Mock Ad Group Creation Failure Response
 */
export const mockAdGroupCreateFailure = {
  resourceId: undefined,
  status: 'FAILURE' as const,
  errors: ['Parent campaign not found', 'Invalid ad group name'],
  warnings: [],
};

/**
 * Mock Keyword Creation Success Response
 */
export const mockKeywordCreateSuccess = {
  resourceId: 'keyword-11111',
  status: 'SUCCESS' as const,
  errors: [],
  warnings: [],
};

/**
 * Mock Keyword Creation Failure Response
 */
export const mockKeywordCreateFailure = {
  resourceId: undefined,
  status: 'FAILURE' as const,
  errors: ['Keyword already exists in ad group'],
  warnings: [],
};

/**
 * Mock Batch Job Submission Success Response
 */
export const mockBatchJobSubmitSuccess = {
  jobId: 'batch-job-abc123',
  status: 'PENDING' as const,
  submittedAt: '2024-01-15T10:30:00Z',
  totalOperations: 10,
};

/**
 * Mock Batch Job Status - In Progress
 */
export const mockBatchJobStatusInProgress = {
  jobId: 'batch-job-abc123',
  status: 'IN_PROGRESS' as const,
  progress: {
    completed: 5,
    total: 10,
    percentage: 50,
  },
  startedAt: '2024-01-15T10:30:05Z',
  errors: [],
};

/**
 * Mock Batch Job Status - Completed
 */
export const mockBatchJobStatusCompleted = {
  jobId: 'batch-job-abc123',
  status: 'COMPLETED' as const,
  progress: {
    completed: 10,
    total: 10,
    percentage: 100,
  },
  startedAt: '2024-01-15T10:30:05Z',
  completedAt: '2024-01-15T10:32:15Z',
  results: {
    successful: 8,
    failed: 2,
    operations: [
      {
        operationId: 'op-1',
        resourceType: 'campaign',
        resourceId: 'campaign-12345',
        status: 'SUCCESS',
      },
      {
        operationId: 'op-2',
        resourceType: 'adgroup',
        resourceId: 'adgroup-67890',
        status: 'SUCCESS',
      },
      {
        operationId: 'op-3',
        resourceType: 'keyword',
        resourceId: undefined,
        status: 'FAILURE',
        errors: ['Invalid keyword format'],
      },
    ],
  },
  errors: [],
};

/**
 * Mock Batch Job Status - Failed
 */
export const mockBatchJobStatusFailed = {
  jobId: 'batch-job-abc123',
  status: 'FAILED' as const,
  progress: {
    completed: 3,
    total: 10,
    percentage: 30,
  },
  startedAt: '2024-01-15T10:30:05Z',
  failedAt: '2024-01-15T10:31:00Z',
  errors: ['API rate limit exceeded', 'Authentication token expired'],
};

/**
 * Mock Campaign Request Payload
 */
export const mockCampaignRequest = {
  accountId: 'acc-test-123',
  name: 'Test Campaign - Summer Sale',
  status: 'ENABLED' as const,
  budget: {
    amount: 500.00, // In dollars
    deliveryMethod: 'STANDARD' as const,
  },
  biddingStrategy: 'MAXIMIZE_CONVERSIONS' as const,
  targetNetwork: 'GOOGLE_SEARCH' as const,
};

/**
 * Mock Ad Group Request Payload
 */
export const mockAdGroupRequest = {
  accountId: 'acc-test-123',
  campaignId: 'campaign-12345',
  name: 'Test Ad Group - Running Shoes',
  status: 'ENABLED' as const,
  defaultBid: 2.50, // In dollars
};

/**
 * Mock Keyword Request Payload
 */
export const mockKeywordRequest = {
  accountId: 'acc-test-123',
  adGroupId: 'adgroup-67890',
  text: 'buy running shoes',
  matchType: 'PHRASE' as const,
  bid: 2.75, // In dollars
  status: 'ENABLED' as const,
};

/**
 * Mock Batch Job Request Payload
 */
export const mockBatchJobRequest = {
  accountId: 'acc-test-123',
  operations: [
    {
      operationType: 'CREATE' as const,
      resourceType: 'campaign' as const,
      data: mockCampaignRequest,
    },
    {
      operationType: 'CREATE' as const,
      resourceType: 'adgroup' as const,
      data: mockAdGroupRequest,
    },
    {
      operationType: 'CREATE' as const,
      resourceType: 'keyword' as const,
      data: mockKeywordRequest,
    },
  ],
};

/**
 * Mock Error Response - 400 Bad Request
 */
export const mockError400 = {
  error: 'Bad Request',
  message: 'Invalid request parameters',
  statusCode: 400,
  details: {
    field: 'budget.amount',
    issue: 'Must be a positive number',
  },
};

/**
 * Mock Error Response - 401 Unauthorized
 */
export const mockError401 = {
  error: 'Unauthorized',
  message: 'Invalid or expired authentication token',
  statusCode: 401,
};

/**
 * Mock Error Response - 404 Not Found
 */
export const mockError404 = {
  error: 'Not Found',
  message: 'Resource not found',
  statusCode: 404,
  details: {
    resourceType: 'campaign',
    resourceId: 'campaign-99999',
  },
};

/**
 * Mock Error Response - 429 Rate Limit
 */
export const mockError429 = {
  error: 'Too Many Requests',
  message: 'API rate limit exceeded',
  statusCode: 429,
  retryAfter: 60, // seconds
};

/**
 * Mock Error Response - 500 Internal Server Error
 */
export const mockError500 = {
  error: 'Internal Server Error',
  message: 'An unexpected error occurred',
  statusCode: 500,
};
