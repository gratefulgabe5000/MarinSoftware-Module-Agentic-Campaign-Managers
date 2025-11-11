# Marin Dispatcher API Integration Documentation

Complete guide for integrating with Marin Dispatcher for campaign management across advertising platforms.

---

## Table of Contents

1. [Overview](#overview)
2. [API Endpoints](#api-endpoints)
3. [Architecture](#architecture)
4. [Service Classes](#service-classes)
5. [Request/Response Formats](#requestresponse-formats)
6. [Error Codes & Handling](#error-codes--handling)
7. [Usage Examples](#usage-examples)
8. [Batch Job Workflow](#batch-job-workflow)
9. [Environment Variables](#environment-variables)
10. [Lambda Integration Patterns](#lambda-integration-patterns)
11. [X-Ray Tracing Integration](#x-ray-tracing-integration)
12. [VPC Requirements](#vpc-requirements)
13. [Best Practices](#best-practices)
14. [Troubleshooting Guide](#troubleshooting-guide)

---

## Overview

The Marin Dispatcher API is a production-grade TypeScript/Node.js backend that provides:

- **Single Campaign Operations**: Create, update, pause, resume, and delete campaigns
- **Bulk Campaign Operations**: Handle up to 100,000 campaigns with intelligent chunking
- **Multi-Platform Support**: Google Ads, Meta, Microsoft Ads (with pluggable architecture)
- **X-Ray Integration**: Built-in AWS X-Ray tracing for performance monitoring
- **Flexible Deployment**: Works as Express REST API or AWS Lambda functions
- **Type-Safe Implementation**: Full TypeScript with comprehensive type definitions
- **Error Resilience**: Multi-layer error handling with exponential backoff retry logic

### Key Characteristics

- **API Endpoint Format**: `/dispatcher/{publisher}/{resource}`
- **Budget Format**: Dollars (NOT micros)
- **Batch Limit**: 1000 operations per API request
- **Polling Strategy**: Exponential backoff (5-30 seconds)
- **Default Timeout**: 10 minutes (120 polling attempts)

---

## API Endpoints

All Marin Dispatcher endpoints follow the format: `/dispatcher/{publisher}/{resource}`

### Campaign Endpoints

```
POST   /dispatcher/{publisher}/campaigns                    # Create campaign
PUT    /dispatcher/{publisher}/campaigns/{id}               # Update campaign
GET    /dispatcher/{publisher}/campaigns/{id}               # Get campaign by ID
GET    /dispatcher/{publisher}/campaigns?limit=10&offset=0  # List campaigns
DELETE /dispatcher/{publisher}/campaigns/{id}               # Delete campaign (soft delete)
```

**Parameters:**
- `{publisher}`: Platform identifier (google, meta, microsoft)
- `{id}`: Campaign resource ID

### Ad Group Endpoints

```
POST   /dispatcher/{publisher}/adgroups                     # Create ad group
PUT    /dispatcher/{publisher}/adgroups/{id}                # Update ad group
GET    /dispatcher/{publisher}/adgroups/{id}                # Get ad group
POST   /dispatcher/{publisher}/adgroups/bulk                # Bulk create ad groups
```

### Ad (RSA - Responsive Search Ads) Endpoints

```
POST   /dispatcher/{publisher}/ads                          # Create ad
PUT    /dispatcher/{publisher}/ads/{id}                     # Update ad
GET    /dispatcher/{publisher}/ads/{id}                     # Get ad
POST   /dispatcher/{publisher}/ads/bulk                     # Bulk create ads
```

### Keyword Endpoints

```
POST   /dispatcher/{publisher}/keywords                     # Create keyword
PUT    /dispatcher/{publisher}/keywords/{id}                # Update keyword
GET    /dispatcher/{publisher}/keywords/{id}                # Get keyword
POST   /dispatcher/{publisher}/keywords/bulk                # Bulk create keywords
```

### Batch Job Endpoints

```
POST   /dispatcher/{publisher}/batch-jobs                              # Create batch job
PUT    /dispatcher/{publisher}/batch-jobs/{jobId}/operations          # Add operations (max 1000)
POST   /dispatcher/{publisher}/batch-jobs/{jobId}/run                 # Run batch job
GET    /dispatcher/{publisher}/batch-jobs/{jobId}                     # Get batch job status
GET    /dispatcher/{publisher}/batch-jobs/{jobId}/results             # Get batch results
```

**Note**: Replace `{publisher}` with actual publisher (e.g., `google`, `meta`, `microsoft`)

---

## Architecture

### Project Structure

```
backend/src/
├── config/
│   └── env.ts                              # Environment configuration
├── services/
│   ├── marinDispatcherService.ts           # Core API integration (single campaigns)
│   ├── marinBatchJobService.ts             # Bulk campaign operations
│   ├── platformApiService.ts               # Base platform API interface
│   └── [other services]
├── lib/
│   ├── marinDispatcherClient.ts            # Lambda wrapper for dispatcher
│   └── marinBatchJobClient.ts              # Lambda wrapper for batch jobs
├── types/
│   ├── marinDispatcher.types.ts            # Marin API type definitions
│   ├── lambda.types.ts                     # Lambda event/response types
│   └── [other types]
├── routes/
│   ├── campaigns.ts                        # Campaign REST endpoints
│   └── [other routes]
├── middleware/
│   ├── errorHandler.ts                     # Centralized error handling
│   └── requestLogger.ts                    # Request logging
├── utils/
│   ├── marinTypeValidators.ts              # Request validation
│   └── [other utilities]
└── index.ts                                # Express application entry point
```

### Core Components

1. **MarinDispatcherService**: Single campaign CRUD operations with X-Ray tracing
2. **MarinBatchJobService**: Bulk campaign creation with intelligent chunking
3. **MarinDispatcherClient**: Lambda wrapper for dispatcher service
4. **MarinBatchJobClient**: Lambda wrapper for batch jobs (SQS + direct Lambda)
5. **Express REST API**: 20+ campaign management endpoints

---

## Service Classes

### MarinDispatcherService

**Location**: `/backend/src/services/marinDispatcherService.ts`

The core service for direct API integration with Marin Dispatcher ALB.

#### Constructor

```typescript
constructor(accountId: string, publisher: string)
```

**Parameters:**
- `accountId`: Marin account ID
- `publisher`: Platform identifier (google, meta, microsoft)

#### Campaign Methods

```typescript
// Create a new campaign
async createCampaign(campaignPlan: any, name: string): Promise<PlatformAPIResponse>

// Update existing campaign
async updateCampaign(campaignId: string, updates: MarinCampaignUpdateRequest): Promise<PlatformAPIResponse>

// Pause campaign
async pauseCampaign(campaignId: string): Promise<PlatformAPIResponse>

// Resume campaign
async resumeCampaign(campaignId: string): Promise<PlatformAPIResponse>

// Delete campaign (soft delete - sets status to REMOVED)
async deleteCampaign(campaignId: string): Promise<PlatformAPIResponse>

// Get campaign status
async getCampaignStatus(campaignId: string): Promise<PlatformAPIResponse>

// Verify API connectivity
async isAuthenticated(): Promise<boolean>
```

#### Ad Group Methods

```typescript
async createAdGroup(
  campaignId: string,
  name: string,
  options?: { cpcBid?: number; cpmBid?: number }
): Promise<PlatformAPIResponse>

async updateAdGroup(
  adGroupId: string,
  updates: Partial<MarinAdGroupRequest>
): Promise<PlatformAPIResponse>
```

#### Ad Methods

```typescript
async createAds(
  adGroupId: string,
  ads: MarinAdRequest[]
): Promise<PlatformAPIResponse>
```

#### Keyword Methods

```typescript
async createKeywords(
  adGroupId: string,
  keywords: MarinKeywordRequest[]
): Promise<PlatformAPIResponse>

// Bulk keyword creation with single request
async createBulkKeywords(
  adGroupId: string,
  keywords: MarinKeywordRequest[]
): Promise<PlatformAPIResponse>
```

#### Internal Methods

```typescript
// Build API endpoint path
private buildApiPath(endpoint: string): string
// Returns: /dispatcher/{publisher}{endpoint}

// Map campaign plan to request format
private mapCampaignPlanToRequest(campaignPlan: any, name: string): MarinCampaignRequest

// Map API response to platform response format
private mapResponseToPlatformResponse(response: any): PlatformAPIResponse

// Handle errors with logging and X-Ray cleanup
private handleError(error: any, operation: string): PlatformAPIResponse
```

### MarinBatchJobService

**Location**: `/backend/src/services/marinBatchJobService.ts`

High-level service for bulk campaign creation via batch job API.

#### Key Methods

```typescript
// Create new batch job
async createBatchJob(): Promise<{ batchJobId: string }>

// Add operations to batch (up to 1000 per request)
async addOperationsToBatch(
  batchJobId: string,
  operations: BatchOperation[],
  sequenceToken?: string
): Promise<{ sequenceToken: string }>

// Start batch job execution
async runBatchJob(batchJobId: string): Promise<{ jobStatus: string }>

// Poll batch job status with exponential backoff
async pollBatchJobStatus(
  batchJobId: string,
  maxAttempts: number = 120,
  intervalMs: number = 5000
): Promise<BatchJobResponse>

// Retrieve batch job results
async getBatchJobResults(batchJobId: string): Promise<BatchJobResultsResponse>

// High-level orchestration method for bulk campaign creation
async bulkCreateCampaigns(
  campaigns: MarinCampaignRequest[]
): Promise<BatchJobResultsResponse>
```

#### Workflow

The `bulkCreateCampaigns()` method automates the complete batch workflow:

1. Create batch job → Get batchJobId
2. Convert campaigns to batch operations
3. Chunk operations (max 1000 per request)
4. Add operations to batch with sequence token tracking
5. Run batch job
6. Poll status until DONE/FAILED/CANCELLED (exponential backoff)
7. Get results with summary statistics
8. Return BatchJobResultsResponse

---

## Request/Response Formats

### Campaign Types

#### Campaign Request

```typescript
interface MarinCampaignRequest {
  accountId: string;              // Marin account ID
  name: string;                   // Campaign name (max 255 chars)
  status: 'ENABLED' | 'PAUSED' | 'REMOVED';
  budget: {
    amount: number;               // Dollar amount (NOT micros) - CRITICAL
    deliveryMethod: 'STANDARD' | 'ACCELERATED';
  };
  biddingStrategy: string;        // e.g., 'MANUAL_CPC'
  objective?: string;             // Optional: 'SALES', 'LEADS', etc.
}
```

#### Campaign Response

```typescript
interface MarinCampaignResponse extends MarinBaseResponse {
  id: string;                     // Campaign ID
  accountId: string;
  name: string;
  campaignStatus: string;         // Campaign status
  budget: {
    amount: number;
    deliveryMethod: string;
  };
  biddingStrategy: string;
  createdAt?: string;             // ISO 8601 timestamp
  updatedAt?: string;
}

interface MarinBaseResponse {
  resourceId?: string;            // Resource ID from operation
  status: 'SUCCESS' | 'FAILURE';
  errors?: string[];
  warnings?: string[];
}
```

#### Campaign Update Request

```typescript
interface MarinCampaignUpdateRequest {
  name?: string;
  status?: 'ENABLED' | 'PAUSED' | 'REMOVED';
  budget?: { amount: number; deliveryMethod: string };
  biddingStrategy?: string;
}
```

#### Campaign List Response

```typescript
interface MarinCampaignListResponse {
  campaigns: MarinCampaignResponse[];
  total: number;
  limit: number;
  offset: number;
}
```

### Ad Group Types

```typescript
interface MarinAdGroupRequest {
  accountId: string;
  campaignId: string;
  name: string;
  status?: 'ENABLED' | 'PAUSED' | 'REMOVED';
  cpcBid?: number;
  cpmBid?: number;
}

interface MarinAdGroupResponse extends MarinBaseResponse {
  id: string;
  accountId: string;
  campaignId: string;
  name: string;
  status: string;
  cpcBid?: number;
  cpmBid?: number;
  createdAt?: string;
  updatedAt?: string;
}
```

### Ad (RSA - Responsive Search Ads) Types

```typescript
interface MarinAdRequest {
  accountId: string;
  adGroupId: string;
  type: 'RESPONSIVE_SEARCH_AD';
  headlines: Array<{ text: string }>;      // 3-15 items, max 30 chars each
  descriptions: Array<{ text: string }>;   // 2-4 items, max 90 chars each
  finalUrl: string;                        // Required valid URL
  displayUrl?: string;
  paths?: string[];
}

interface AdAsset {
  text: string;
  pinnedField?: number;
}
```

### Keyword Types

```typescript
interface MarinKeywordRequest {
  accountId: string;
  adGroupId: string;
  text: string;                   // Max 80 chars
  matchType: 'BROAD' | 'PHRASE' | 'EXACT';
  cpcBid?: number;
  status?: 'ENABLED' | 'PAUSED' | 'REMOVED';
}

interface MarinKeywordResponse extends MarinBaseResponse {
  id: string;
  accountId: string;
  adGroupId: string;
  text: string;
  matchType: string;
  cpcBid?: number;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

interface MarinBulkKeywordRequest {
  accountId: string;
  adGroupId: string;
  keywords: Omit<MarinKeywordRequest, 'accountId' | 'adGroupId'>[];
}
```

### Batch Job Types

```typescript
interface BatchOperation {
  operationType: 'CREATE' | 'UPDATE';
  resourceType: 'CAMPAIGN' | 'ADGROUP' | 'AD' | 'KEYWORD';
  resource: MarinCampaignRequest | MarinAdGroupRequest | MarinAdRequest | MarinKeywordRequest;
  operationId?: string;
}

interface BatchJobRequest {
  accountId: string;
  publisher: string;
}

interface BatchJobResponse extends MarinBaseResponse {
  id: string;                     // Batch job ID
  accountId: string;
  publisher: string;
  jobStatus: 'PENDING' | 'PROCESSING' | 'DONE' | 'FAILED' | 'CANCELLED';
  createdAt?: string;
  startedAt?: string;
  completedAt?: string;
}

interface BatchJobResultsResponse {
  jobId: string;
  jobStatus: 'DONE' | 'FAILED' | 'CANCELLED';
  summary: {
    totalOperations: number;
    successfulOperations: number;
    failedOperations: number;
  };
  results: BatchJobResult[];
  nextPageToken?: string;
}

interface BatchJobResult {
  operationId: string;
  resourceType: string;
  resourceId: string;
  status: 'SUCCESS' | 'FAILURE';
  error?: string;
}
```

### Platform API Response

```typescript
interface PlatformAPIResponse {
  success: boolean;
  campaignId?: string;
  error?: string;
  details?: {
    id?: string;
    accountId?: string;
    name?: string;
    status?: string;
    budget?: any;
    biddingStrategy?: string;
    createdAt?: string;
    updatedAt?: string;
    errors?: string[];
    warnings?: string[];
  };
}
```

---

## Error Codes & Handling

### Error Response Format

```typescript
// HTTP Error Response
{
  error: {
    message: string;
    statusCode: number;
    stack: string;  // Only in development
  }
}
```

### Common Error Codes

| Code | Meaning | Handling |
|------|---------|----------|
| 400 | Bad Request (validation failed) | Check request format and required fields |
| 401 | Unauthorized | Verify DISPATCHER_URL and account credentials |
| 403 | Forbidden | Check account permissions and API access |
| 404 | Not Found | Verify resource ID exists |
| 409 | Conflict | Resource already exists or state conflict |
| 429 | Rate Limited | Exponential backoff applied automatically |
| 500 | Server Error | Check Marin Dispatcher logs |
| 503 | Service Unavailable | Retry with backoff |

### Error Handling Strategies

#### 1. Validation Error Handling

```typescript
import { validateCampaignRequest } from './utils/marinTypeValidators';

const validation = validateCampaignRequest(request);
if (!validation.isValid) {
  console.error('Validation errors:', validation.errors);
  return {
    success: false,
    error: `Validation failed: ${validation.errors.join(', ')}`
  };
}
```

#### 2. Service-Level Error Handling

```typescript
try {
  // Operation
  subsegment?.close();
  return response;
} catch (error: any) {
  subsegment?.close();
  console.error(`[${this.platformName}] Error:`, error);
  return {
    success: false,
    error: error.message || 'Operation failed',
    details: error
  };
}
```

#### 3. Rate Limiting with Exponential Backoff

```typescript
protected async rateLimit<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      if (error.status === 429 || error.response?.status === 429) {
        const waitTime = delay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}
```

#### 4. Batch Job Error Handling

```typescript
// Partial success handling
if (errors.length > 0 && results.length === 0) {
  // All failed
  return { success: false, error: `All ${errors.length} record(s) failed` };
} else if (errors.length > 0) {
  // Partial success
  return {
    success: true,
    result: { processed, failed, results, errors }
  };
} else {
  // All succeeded
  return { success: true, result: { processed, failed: 0, results } };
}
```

---

## Usage Examples

### Service Class Usage (for Orchestrator, if needed)

#### Create a Single Campaign

```typescript
import { MarinDispatcherService } from './services/marinDispatcherService';

// Initialize service
const service = new MarinDispatcherService('account-123', 'google');

// Create campaign
const response = await service.createCampaign({
  objective: 'sales',
  budget: { total: 1000 },
  timeline: { startDate: '2024-01-01', endDate: '2024-12-31' },
  platforms: ['google'],
}, 'My Campaign');

if (response.success) {
  console.log('Campaign created:', response.campaignId);
} else {
  console.error('Error:', response.error);
}
```

#### Update Campaign

```typescript
const updateResponse = await service.updateCampaign('campaign-123', {
  name: 'Updated Campaign Name',
  budget: { amount: 1500, deliveryMethod: 'STANDARD' },
  status: 'PAUSED'
});

if (updateResponse.success) {
  console.log('Campaign updated');
} else {
  console.error('Update failed:', updateResponse.error);
}
```

#### Pause/Resume Campaign

```typescript
// Pause campaign
const pauseResponse = await service.pauseCampaign('campaign-123');

// Resume campaign
const resumeResponse = await service.resumeCampaign('campaign-123');
```

#### Create Ad Group and Keywords

```typescript
// Create ad group
const adGroupResponse = await service.createAdGroup('campaign-123', 'Ad Group 1', {
  cpcBid: 1.50
});

if (adGroupResponse.success) {
  const adGroupId = adGroupResponse.details?.id;

  // Create keywords
  const keywordResponse = await service.createKeywords(adGroupId, [
    { accountId: 'account-123', adGroupId, text: 'keyword 1', matchType: 'BROAD' },
    { accountId: 'account-123', adGroupId, text: 'keyword 2', matchType: 'PHRASE' }
  ]);
}
```

### Lambda Client Usage (Primary Pattern - InfraDocs)

#### Dispatcher Lambda Handler

```typescript
import { MarinDispatcherClient } from './lib/marinDispatcherClient';

export const handler = async (event) => {
  const client = new MarinDispatcherClient();

  return await client.handleLambdaEvent({
    action: 'create_campaign',
    data: {
      campaignPlan: {
        objective: 'sales',
        budget: { total: 1000 },
        timeline: { startDate: '2024-01-01', endDate: '2024-12-31' },
        platforms: ['google']
      },
      name: 'Campaign from Lambda'
    },
    user: { sub: 'user-id' }
  });
};
```

#### Supported Actions

```typescript
{
  action: 'create_campaign',
  data: { campaignPlan: {...}, name: 'Name' }
}

{
  action: 'update_campaign',
  data: { campaignId: 'id-123', updates: {...} }
}

{
  action: 'pause_campaign',
  data: { campaignId: 'id-123' }
}

{
  action: 'resume_campaign',
  data: { campaignId: 'id-123' }
}

{
  action: 'delete_campaign',
  data: { campaignId: 'id-123' }
}

{
  action: 'get_campaign_status',
  data: { campaignId: 'id-123' }
}
```

#### Lambda Response Format

```typescript
interface LambdaResponse {
  success: boolean;
  result?: any;           // Present on success
  error?: string;         // Present on failure
  details?: any;          // Additional details
}
```

### Lambda Handler Examples

#### Batch Job Lambda Handler

```typescript
import { MarinBatchJobClient } from './lib/marinBatchJobClient';

export const batchJobHandler = async (event) => {
  const client = new MarinBatchJobClient();

  return await client.handleLambdaEvent({
    action: 'bulk_create_campaigns',
    data: {
      campaigns: [
        {
          accountId: 'account-123',
          name: 'Campaign 1',
          status: 'ENABLED',
          budget: { amount: 1000, deliveryMethod: 'STANDARD' },
          biddingStrategy: 'MANUAL_CPC'
        },
        // ... up to 100,000 campaigns
      ]
    },
    user: { sub: 'user-id' }
  });
};
```

#### SQS Handler for Batch Processing

```typescript
export const sqsHandler = async (event) => {
  const client = new MarinBatchJobClient();

  return await client.handleSqsEvent(event);
};

// Expected SQS Message Format:
// {
//   "jobId": "job-123",
//   "campaigns": [
//     { MarinCampaignRequest },
//     ...
//   ]
// }
```

#### Step-by-Step Batch Job Control

```typescript
import { MarinBatchJobClient } from './lib/marinBatchJobClient';

export const stepByStepHandler = async (event) => {
  const client = new MarinBatchJobClient();

  const { action, data, user } = event;

  // Supported actions:
  // - 'create_batch_job'
  // - 'add_operations_to_batch'
  // - 'run_batch_job'
  // - 'poll_batch_job_status'
  // - 'get_batch_job_results'

  return await client.handleLambdaEvent({
    action,
    data,
    user
  });
};
```

---

## Batch Job Workflow

### Complete Batch Job Lifecycle

```
1. Create Batch Job
   POST /dispatcher/google/batch-jobs
   ↓
   { batchJobId: "job-123" }

2. Create Batch Operations from Campaigns
   Convert MarinCampaignRequest[] → BatchOperation[]

3. Chunk Operations (max 1000 per request)
   Split into chunks for large batches

4. Add Operations to Batch (with sequence token)
   PUT /dispatcher/google/batch-jobs/{jobId}/operations
   → Repeat for each chunk, tracking sequenceToken

5. Run Batch Job
   POST /dispatcher/google/batch-jobs/{jobId}/run
   ↓
   jobStatus: 'PROCESSING'

6. Poll Status (exponential backoff)
   GET /dispatcher/google/batch-jobs/{jobId}
   Poll every 5s-30s until DONE/FAILED/CANCELLED
   Default: 120 attempts (10 minutes total)

7. Get Results
   GET /dispatcher/google/batch-jobs/{jobId}/results
   ↓
   BatchJobResultsResponse {
     jobId, jobStatus,
     summary: { totalOperations, successfulOperations, failedOperations },
     results: [{ operationId, resourceType, resourceId, status, error? }, ...]
   }
```

### Batch Job Status Flow

```
CREATE BATCH JOB → jobStatus: 'PENDING'
   ↓
ADD OPERATIONS → jobStatus: 'PENDING'
   ↓
RUN BATCH JOB → jobStatus: 'PROCESSING'
   ↓
POLL STATUS → jobStatus: 'DONE' | 'FAILED' | 'CANCELLED'
   ↓
GET RESULTS → Complete batch report
```

### Polling Strategy

- **Initial interval**: 5 seconds
- **Exponential backoff**: Doubles each retry
- **Maximum interval**: 30 seconds
- **Default max attempts**: 120 (10 minutes total)
- **Custom**: Can be configured via parameters

### Error Handling in Batch Jobs

```typescript
// Get partial success summary
{
  success: true,
  result: {
    processed: 95,
    failed: 5,
    results: [ ... ],
    errors: [ "Operation 2 failed: ...", ... ]
  }
}
```

---

## Environment Variables

### Required Variables

```bash
# Marin Dispatcher Configuration
DISPATCHER_URL=http://meridian-dispatcher-alb-dev-123.us-east-1.elb.amazonaws.com
MARIN_DISPATCHER_ACCOUNT_ID=your-marin-account-id
MARIN_DISPATCHER_PUBLISHER=google              # or meta, microsoft
MARIN_DISPATCHER_TIMEOUT=10000                 # milliseconds
```

### Optional Variables

```bash
# Fallback for local development
MARIN_DISPATCHER_BASE_URL=http://localhost:8080

# API Server
PORT=3001
CORS_ORIGIN=http://localhost:5173
```

### Configuration Loading (config/env.ts)

```typescript
export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',

  marinDispatcher: {
    baseUrl: process.env.DISPATCHER_URL || process.env.MARIN_DISPATCHER_BASE_URL || '',
    accountId: process.env.MARIN_DISPATCHER_ACCOUNT_ID || '',
    publisher: process.env.MARIN_DISPATCHER_PUBLISHER || 'google',
    timeout: parseInt(process.env.MARIN_DISPATCHER_TIMEOUT || '10000', 10),
  },
};
```

### CloudFormation Integration

When deployed to AWS Lambda via CloudFormation/InfraDocs, the `DISPATCHER_URL` environment variable is automatically set to the ALB endpoint:

```
DISPATCHER_URL=http://meridian-dispatcher-alb-{env}-{hash}.{region}.elb.amazonaws.com
```

This is the full URL used as the `baseURL` for API requests.

---

## Lambda Integration Patterns

### MarinDispatcherClient Pattern

**Location**: `/backend/src/lib/marinDispatcherClient.ts`

Wraps `MarinDispatcherService` for Lambda functions with action-based routing.

```typescript
class MarinDispatcherClient {
  async handleLambdaEvent(event: LambdaEvent): Promise<LambdaResponse>

  getService(): MarinDispatcherService
}
```

**Supported Actions:**
- `create_campaign`
- `update_campaign`
- `pause_campaign`
- `resume_campaign`
- `delete_campaign`
- `get_campaign_status`

### MarinBatchJobClient Pattern

**Location**: `/backend/src/lib/marinBatchJobClient.ts`

Handles both SQS events and Lambda events for batch job operations.

```typescript
class MarinBatchJobClient {
  async handleSqsEvent(event: SqsEvent): Promise<LambdaResponse>
  async handleLambdaEvent(event: LambdaEvent): Promise<LambdaResponse>
}
```

**Supported Lambda Actions:**
- `bulk_create_campaigns`
- `create_batch_job`
- `add_operations_to_batch`
- `run_batch_job`
- `poll_batch_job_status`
- `get_batch_job_results`

### Lambda Event Structure

```typescript
interface LambdaEvent {
  action: string;                 // Specific action to perform
  data: any;                      // Action-specific data
  user: {
    sub: string;                  // User ID
    email?: string;
    'cognito:groups'?: string[];
  };
  mode?: 'direct' | 'agentic';
}

interface LambdaResponse {
  success: boolean;
  result?: any;           // Present on success
  error?: string;         // Present on failure
  details?: any;          // Additional details
}
```

### SQS Event Pattern

```typescript
interface SqsEvent {
  Records: Array<{
    messageId: string;
    body: string;  // JSON stringified: { jobId, campaigns }
    // ... other SQS properties
  }>;
}

// Message Body Format:
interface SqsMessage {
  jobId: string;
  campaigns: MarinCampaignRequest[];
}
```

---

## X-Ray Tracing Integration

### Setup

X-Ray tracing is integrated via `aws-xray-sdk-core` and automatically enabled in Lambda functions.

### Usage Pattern

```typescript
import * as AWSXRay from 'aws-xray-sdk-core';

async createCampaign(campaignPlan, name): Promise<PlatformAPIResponse> {
  const segment = AWSXRay.getSegment();
  const subsegment = segment?.addNewSubsegment('MarinDispatcher.createCampaign');

  try {
    // Perform operation
    const response = await this.httpClient.post(endpoint, request);
    subsegment?.close();
    return mapResponse(response);
  } catch (error) {
    subsegment?.close();  // Always close even on error
    return this.handleError(error, 'createCampaign');
  }
}
```

### Subsegment Naming Convention

- `MarinDispatcher.createCampaign`
- `MarinDispatcher.updateCampaign`
- `MarinDispatcher.pauseCampaign`
- `MarinDispatcher.deleteCampaign`
- `MarinDispatcher.getCampaignStatus`
- `MarinDispatcher.createAdGroup`
- `MarinDispatcher.createKeywords`
- `MarinDispatcher.createAds`
- `MarinBatchJobService.bulkCreateCampaigns`
- `MarinBatchJobService.createBatchJob`
- `MarinBatchJobService.addOperationsToBatch`
- `MarinBatchJobService.runBatchJob`
- `MarinBatchJobService.pollBatchJobStatus`
- `MarinBatchJobService.getBatchJobResults`
- `MarinDispatcherClient.handleLambdaEvent`
- `MarinBatchJobClient.handleSqsEvent`
- `MarinBatchJobClient.handleLambdaEvent`

### X-Ray Benefits

1. **Performance Monitoring**: View latency per operation in AWS Console
2. **Service Mapping**: Visualize dependencies between services
3. **Error Tracking**: Identify where failures occur
4. **Debugging**: Trace execution flow with detailed timing

### Viewing Traces in AWS Console

1. Navigate to AWS X-Ray service
2. View service map showing Lambda → Marin Dispatcher interaction
3. Click on traces to see detailed timing and subsegment information
4. Identify performance bottlenecks and error patterns

---

## VPC Requirements

### Lambda VPC Configuration

For Lambda functions to access Marin Dispatcher ALB:

1. **VPC Placement**
   - Deploy Lambda in the same VPC as Marin Dispatcher ALB
   - Or ensure network connectivity via VPN/NAT Gateway

2. **Subnet Configuration**
   - Use private subnet where ALB resides
   - OR route through NAT Gateway if in different subnet

3. **Security Group Configuration**
   - Outbound rules: Allow HTTPS (port 443) or HTTP (port 80)
   - Inbound rules: Only for direct access (usually not needed for outbound)

### ALB Endpoint Details

- **Protocol**: HTTP (internal network - no TLS termination needed)
- **DNS**: `meridian-dispatcher-alb-{env}-{hash}.{region}.elb.amazonaws.com`
- **Port**: 80 (or configured port)
- **Region**: Same as Lambda region recommended

### API Endpoint Example

```
http://meridian-dispatcher-alb-dev-1234567890.us-east-1.elb.amazonaws.com/dispatcher/google/campaigns
```

### Connectivity Troubleshooting

```bash
# Test from Lambda (use Lambda test event):
# curl -v http://meridian-dispatcher-alb-dev-xxx.region.elb.amazonaws.com/dispatcher/google/campaigns

# Expected: 200/400/401 responses (not connection timeout)
```

---

## Best Practices

### 1. Budget Amounts

**ALWAYS use dollars, NOT micros!**

```typescript
// CORRECT
budget: {
  amount: 1000,           // $1000.00
  deliveryMethod: 'STANDARD'
}

// INCORRECT - will cause issues
budget: {
  amount: 1000000000,     // 1 million micros ≠ $1000
  deliveryMethod: 'STANDARD'
}
```

### 2. Batch vs. Single Operations

- **Single Campaign**: Use `MarinDispatcherService` for 1-10 campaigns
- **Bulk Campaigns**: Use `MarinBatchJobService` for 10+ campaigns
- **Very Large**: Batch job API supports up to 100,000 campaigns per job

```typescript
// Single campaign (< 500ms)
const service = new MarinDispatcherService('account-id', 'google');
await service.createCampaign(plan, name);

// Bulk campaigns (30-60s for 100 campaigns)
const batchService = new MarinBatchJobService('account-id', 'google');
await batchService.bulkCreateCampaigns([...100 campaigns]);
```

### 3. Validation Before API Calls

Always validate requests before calling the API:

```typescript
import { validateCampaignRequest } from './utils/marinTypeValidators';

const validation = validateCampaignRequest(request);
if (!validation.isValid) {
  console.error('Validation errors:', validation.errors);
  return { success: false, error: validation.errors.join(', ') };
}

// Safe to proceed with API call
const response = await service.createCampaign(plan, name);
```

### 4. Error Handling in Production

Implement multi-layer error handling:

```typescript
// Layer 1: Validation
const validation = validateRequest(request);
if (!validation.isValid) return { success: false, error: ... };

// Layer 2: Try-catch with X-Ray cleanup
try {
  const response = await service.operation();
  subsegment?.close();
  return response;
} catch (error) {
  subsegment?.close();
  return handleError(error);
}

// Layer 3: Express error middleware catches any unhandled errors
app.use(errorHandler);
```

### 5. Polling Timeout Configuration

For batch jobs, consider operation characteristics:

```typescript
// Quick jobs (< 5 minutes)
await batchService.pollBatchJobStatus(jobId, 60, 5000);

// Standard jobs (10 minutes)
await batchService.pollBatchJobStatus(jobId, 120, 5000);

// Long-running jobs (20+ minutes)
await batchService.pollBatchJobStatus(jobId, 240, 5000);
```

### 6. Sequence Token Management

When adding operations in chunks, always include sequence token:

```typescript
let sequenceToken: string | undefined;

for (const chunk of operationChunks) {
  const result = await batchService.addOperationsToBatch(
    jobId,
    chunk,
    sequenceToken  // Pass from previous response
  );
  sequenceToken = result.sequenceToken;  // Get for next iteration
}
```

### 7. Lambda Memory & Timeout

For batch operations:

```
Memory: 512 MB minimum (1024 MB recommended for large batches)
Timeout: 15 minutes minimum for 100K+ campaigns with polling
```

### 8. X-Ray for Monitoring

Always use X-Ray in Lambda:

```typescript
// Automatically enabled by aws-xray-sdk-core
// Just follow the subsegment pattern in services

// Results visible in:
// - AWS Console → X-Ray → Service Map
// - CloudWatch Logs (with trace IDs)
// - Performance metrics per operation
```

### 9. Logging Best Practices

```typescript
console.log('[MarinDispatcher]', operation, {
  endpoint: this.buildApiPath(endpoint),
  request: sanitize(request),  // Remove sensitive data
  timestamp: new Date().toISOString(),
});

// Avoid logging:
// - API keys or credentials
// - Personal user data
// - Sensitive campaign/budget details
```

### 10. Rate Limiting Awareness

The API has built-in rate limiting. The service automatically implements exponential backoff:

```typescript
// Automatic 429 handling
// 1st retry: wait 1s
// 2nd retry: wait 2s
// 3rd retry: wait 4s
// If all retries fail, error is returned

// No manual retries needed - handled by service
const response = await service.createCampaign(plan, name);
```

---

## Troubleshooting Guide

### Connection Issues

#### Problem: `ECONNREFUSED` or timeout

```
Error: connect ECONNREFUSED 127.0.0.1:8080
```

**Causes:**
1. DISPATCHER_URL not set correctly
2. Marin Dispatcher service not running
3. Network/VPC connectivity issues (for Lambda)

**Solutions:**

```bash
# Verify DISPATCHER_URL
echo $DISPATCHER_URL

# Test connectivity (from Lambda environment)
curl -v http://$DISPATCHER_URL/dispatcher/google/campaigns

# Check environment variables
env | grep DISPATCHER

# For Lambda: Check VPC/Security Group settings
# Ensure Lambda is in same VPC or has NAT Gateway access
```

### Authentication Issues

#### Problem: `401 Unauthorized`

```json
{
  "error": "Unauthorized",
  "statusCode": 401
}
```

**Causes:**
1. Invalid or missing account ID
2. Account doesn't have API access
3. Publisher doesn't match account configuration

**Solutions:**

```typescript
// Verify account and publisher
console.log({
  accountId: config.marinDispatcher.accountId,
  publisher: config.marinDispatcher.publisher,
  baseUrl: config.marinDispatcher.baseUrl
});

// Test with different account ID if multiple available
const service = new MarinDispatcherService('different-account-id', 'google');

// Check with Marin support if account lacks API access
```

### Validation Errors

#### Problem: `400 Bad Request - Validation failed`

```json
{
  "error": "Validation failed: budget.amount must be positive",
  "statusCode": 400
}
```

**Common Issues:**
1. Budget in micros instead of dollars
2. Campaign name too long (> 255 chars)
3. Invalid URL in finalUrl field
4. Missing required fields

**Solutions:**

```typescript
// Always validate before API call
import { validateCampaignRequest } from './utils/marinTypeValidators';

const validation = validateCampaignRequest(request);
if (!validation.isValid) {
  console.error('Validation errors:', validation.errors);
  // Fix each error
}

// Check common issues:
// ✓ budget.amount in dollars (1000 = $1000)
// ✓ name <= 255 characters
// ✓ status in ['ENABLED', 'PAUSED', 'REMOVED']
// ✓ biddingStrategy is non-empty string
```

### Rate Limiting

#### Problem: `429 Too Many Requests`

**Behavior:** Automatically retried with exponential backoff (1s, 2s, 4s)

**What happens:**
1. Service detects 429 status
2. Waits exponentially increasing time
3. Retries up to 3 times
4. Returns error if all retries fail

**Solutions:**

```typescript
// If still getting 429 after retries:
// 1. Reduce concurrent requests
// 2. Increase interval between requests
// 3. Contact Marin support for rate limit increase

// Batch jobs have built-in rate limiting protection
const results = await batchService.bulkCreateCampaigns(campaigns);
// Service chunks and manages rate limits automatically
```

### Batch Job Failures

#### Problem: Batch job stuck in PROCESSING

**Possible Causes:**
1. Very large batch (100K+ campaigns)
2. Network issues during polling
3. Marin Dispatcher service issues

**Solutions:**

```bash
# Increase polling timeout
const results = await batchService.pollBatchJobStatus(
  jobId,
  240,        // 240 attempts instead of default 120
  5000        // 5-second intervals
);
// Total: 20 minutes instead of 10

# Check batch job status manually
curl http://$DISPATCHER_URL/dispatcher/google/batch-jobs/{jobId}
# Look for jobStatus: 'PROCESSING' vs 'DONE'/'FAILED'/'CANCELLED'
```

#### Problem: Operations marked as FAILURE

```json
{
  "operationId": "op-2",
  "status": "FAILURE",
  "error": "Invalid campaign name"
}
```

**Solutions:**

1. Check the error message in results
2. Validate the specific operation that failed
3. Batch supports partial success - review summary

```typescript
const results = await batchService.bulkCreateCampaigns(campaigns);

console.log('Summary:', results.summary);
// {
//   totalOperations: 100,
//   successfulOperations: 95,
//   failedOperations: 5
// }

// Find failed operations
const failures = results.results.filter(r => r.status === 'FAILURE');
failures.forEach(f => {
  console.log(`Operation ${f.operationId}: ${f.error}`);
  // Fix the specific issue in campaign data
});
```

### Lambda Issues

#### Problem: Lambda timeout

```
Task timed out after 60.00 seconds
```

**Causes:**
1. Batch job polling exceeds Lambda timeout
2. Network latency between Lambda and ALB
3. Large batch size (100K+ campaigns)

**Solutions:**

```bash
# Increase Lambda timeout
AWS_LAMBDA_TIMEOUT=900  # 15 minutes

# Reduce batch size
# Instead of 100K campaigns in one batch, split into multiple jobs

# For batch operations, ensure:
# Memory: >= 1024 MB
# Timeout: >= 15 minutes for large batches
```

#### Problem: Lambda can't reach DISPATCHER_URL

```
Error: getaddrinfo ENOTFOUND meridian-dispatcher-alb-dev-xxx.region.elb.amazonaws.com
```

**Causes:**
1. Lambda not in correct VPC
2. Security group doesn't allow outbound traffic
3. DNS resolution issue

**Solutions:**

```bash
# Verify VPC configuration
aws lambda get-function-configuration --function-name my-function
# Check VpcConfig.SubnetIds and SecurityGroupIds

# Ensure security group allows outbound HTTP/HTTPS
# - Protocol: TCP
# - Port: 80 or 443
# - Destination: 0.0.0.0/0 or ALB security group

# Test DNS resolution
# Add test Lambda layer with curl:
curl -v http://meridian-dispatcher-alb-dev-xxx.region.elb.amazonaws.com
```

### Performance Issues

#### Problem: Single campaign creation slow (> 1 second)

**Expected:** 200-500ms per campaign

**Possible Causes:**
1. Network latency to ALB
2. Marin Dispatcher service slow
3. X-Ray tracing overhead (minimal)

**Solutions:**

```typescript
// Check X-Ray traces
// AWS Console → X-Ray → Traces
// Look for:
// - Network latency
// - Marin API response time
// - Service initialization time

// If network latency is high:
// - Deploy Lambda in same VPC as ALB
// - Check ALB security groups
// - Verify NAT Gateway if cross-VPC

// If API latency is high:
// - Check Marin Dispatcher logs
// - Contact Marin support
```

#### Problem: Batch job too slow

**Expected:** 30-60s for 100 campaigns with polling

**Solutions:**

```typescript
// Batch job timing breakdown:
// - Create batch job: 200-500ms
// - Add operations (chunked): 1-2s per chunk of 1000
// - Run batch job: 200-500ms
// - Polling (120 attempts, 5s intervals): 10+ minutes
// - Get results: 500-1000ms

// To speed up:
// 1. Reduce polling interval (use default 5s)
// 2. Increase max attempts if needed
// 3. Parallel job execution (create multiple batch jobs)

// Monitor batch job with X-Ray
const results = await batchService.bulkCreateCampaigns(campaigns);
// X-Ray will show:
// - Time per operation
// - Polling intervals
// - Total execution time
```

### Debugging Checklist

- [ ] Verify `DISPATCHER_URL` environment variable is set
- [ ] Confirm account ID matches Marin account
- [ ] Check publisher matches account configuration
- [ ] Validate request format with `validateCampaignRequest()`
- [ ] Budget amounts in dollars, not micros
- [ ] Campaign name <= 255 characters
- [ ] Ad group name, keyword text, etc. meet length requirements
- [ ] X-Ray traces show operation timing
- [ ] CloudWatch logs show error details
- [ ] For Lambda: VPC and security group configured correctly
- [ ] For batch jobs: Allow sufficient polling timeout
- [ ] Rate limiting: Service auto-retries with exponential backoff

### Getting Help

1. **Check CloudWatch Logs**: Full error messages and stack traces
2. **Check X-Ray Traces**: Latency and service interaction details
3. **Validate Request**: Use `validateCampaignRequest()` before API call
4. **Test Manually**: Use curl to test endpoints directly
5. **Contact Marin Support**: Provide jobId or campaignId for investigation

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `/backend/src/services/marinDispatcherService.ts` | Core API integration (single campaigns) |
| `/backend/src/services/marinBatchJobService.ts` | Bulk campaign operations (up to 100,000) |
| `/backend/src/lib/marinDispatcherClient.ts` | Lambda wrapper for dispatcher service |
| `/backend/src/lib/marinBatchJobClient.ts` | Lambda wrapper for batch jobs (SQS + Lambda) |
| `/backend/src/types/marinDispatcher.types.ts` | All Marin API type definitions |
| `/backend/src/types/lambda.types.ts` | Lambda event/response type definitions |
| `/backend/src/utils/marinTypeValidators.ts` | Request validation functions |
| `/backend/src/config/env.ts` | Environment variable configuration |
| `/backend/src/routes/campaigns.ts` | REST API campaign endpoints |
| `/backend/src/middleware/errorHandler.ts` | Centralized error handling |
| `/backend/src/middleware/requestLogger.ts` | Request logging middleware |
| `/backend/src/index.ts` | Express application setup |

---

## Document Version

- **Version**: 1.0
- **Last Updated**: November 2024
- **Author**: VANES
- **Status**: Complete

---

## Quick Start Checklist

1. **Set Environment Variables**
   ```bash
   export DISPATCHER_URL=http://meridian-dispatcher-alb-dev-xxx.region.elb.amazonaws.com
   export MARIN_DISPATCHER_ACCOUNT_ID=your-account-id
   export MARIN_DISPATCHER_PUBLISHER=google
   ```

2. **Validate Request Format**
   ```typescript
   import { validateCampaignRequest } from './utils/marinTypeValidators';
   const validation = validateCampaignRequest(request);
   ```

3. **Create Service Instance**
   ```typescript
   const service = new MarinDispatcherService('account-id', 'google');
   ```

4. **Call API**
   ```typescript
   const response = await service.createCampaign(plan, name);
   ```

5. **Handle Response**
   ```typescript
   if (response.success) {
     console.log('Success:', response.campaignId);
   } else {
     console.error('Error:', response.error);
   }
   ```

6. **Monitor with X-Ray**
   - AWS Console → X-Ray → Service Map
   - View operation timing and latency

---

End of Documentation
