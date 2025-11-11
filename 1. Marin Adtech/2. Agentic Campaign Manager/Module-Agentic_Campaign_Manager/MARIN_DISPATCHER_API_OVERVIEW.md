# Marin Dispatcher API Implementation Overview

## Project Structure

```
backend/src/
├── config/
│   └── env.ts                    # Environment configuration
├── controllers/                   # API route handlers
│   ├── campaignController.ts
│   ├── campaignCreationController.ts
│   ├── statusController.ts
│   ├── performanceController.ts
│   ├── patternExtractionController.ts
│   ├── adGroupGenerationController.ts
│   ├── keywordGenerationController.ts
│   ├── rsaGenerationController.ts
│   └── csvExportController.ts
├── routes/                        # Express route definitions
│   ├── api.ts                    # Main API router
│   ├── campaigns.ts              # Campaign routes
│   ├── chat.ts
│   ├── auth.ts
│   ├── ai.ts
│   └── products.ts
├── services/                      # Business logic services
│   ├── marinDispatcherService.ts  # Core Marin Dispatcher integration
│   ├── marinBatchJobService.ts    # Batch job operations
│   ├── platformApiService.ts      # Base platform API interface
│   ├── campaignCreationService.ts
│   ├── googleAdsService.ts
│   ├── metaAdsService.ts
│   ├── microsoftAdsService.ts
│   ├── aiService.ts
│   ├── patternExtractionService.ts
│   └── [other services]
├── lib/                           # Lambda clients
│   ├── marinDispatcherClient.ts   # Lambda client for Marin Dispatcher
│   └── marinBatchJobClient.ts     # Lambda client for batch jobs
├── types/                         # TypeScript type definitions
│   ├── marinDispatcher.types.ts   # Marin API types
│   ├── lambda.types.ts            # Lambda event/response types
│   ├── campaign.types.ts
│   ├── ai.types.ts
│   └── [other types]
├── middleware/
│   ├── errorHandler.ts            # Centralized error handling
│   └── requestLogger.ts           # Request logging middleware
├── utils/
│   ├── marinTypeValidators.ts     # Request validation utilities
│   └── mockDataLoader.ts
├── fixtures/
│   └── marinApiMocks.ts
└── index.ts                       # Express application entry point
```

---

## 1. Backend API Structure & Endpoints

### Main Application (index.ts)
```typescript
- Middleware: CORS, JSON parsing, request logging
- Error handling: Centralized error handler middleware
- Health check: GET /health
- API routes: GET /api
- All routes prefixed with /api
```

### API Routes (routes/api.ts)
```
GET    /api                    # API info
GET    /api/health             # Health check
/api/campaigns/*               # Campaign routes
/api/chat/*                    # Chat routes
/api/auth/*                    # Authentication routes
/api/ai/*                      # AI routes
/api/products/*                # Product routes
```

### Campaign Routes (routes/campaigns.ts)
```
Pattern Extraction:
  GET  /api/campaigns/query-patterns
  GET  /api/campaigns/high-performing-keywords
  GET  /api/campaigns/ad-copy-patterns

Campaign CRUD:
  GET    /api/campaigns                    # Get all campaigns
  GET    /api/campaigns/:id                # Get campaign by ID
  POST   /api/campaigns                    # Create campaign
  PUT    /api/campaigns/:id                # Update campaign
  DELETE /api/campaigns/:id                # Delete campaign

Campaign Creation:
  POST   /api/campaigns/create             # Create single campaign
  POST   /api/campaigns/create-with-progress  # Create with progress tracking

Campaign Status & Performance:
  GET    /api/campaigns/:id/status         # Get status
  GET    /api/campaigns/:id/status/history # Get status history
  GET    /api/campaigns/:id/performance    # Get performance metrics

Campaign Actions:
  POST   /api/campaigns/:id/launch         # Launch campaign
  POST   /api/campaigns/:id/pause          # Pause campaign
  POST   /api/campaigns/:id/resume         # Resume campaign

Ad Groups, Keywords, Ads, Exports:
  POST   /api/campaigns/adgroups/generate
  POST   /api/campaigns/keywords/generate
  POST   /api/campaigns/keywords/validate
  POST   /api/campaigns/ads/generate-rsa
  POST   /api/campaigns/ads/validate
  POST   /api/campaigns/export
  POST   /api/campaigns/export/validate
```

---

## 2. Service Classes & Architecture

### Platform API Base (platformApiService.ts)
```typescript
interface IPlatformAPI {
  createCampaign(campaignPlan, name): Promise<PlatformAPIResponse>
  updateCampaign(campaignId, updates): Promise<PlatformAPIResponse>
  pauseCampaign(campaignId): Promise<PlatformAPIResponse>
  resumeCampaign(campaignId): Promise<PlatformAPIResponse>
  deleteCampaign(campaignId): Promise<PlatformAPIResponse>
  getCampaignStatus(campaignId): Promise<PlatformAPIResponse>
  isAuthenticated(): Promise<boolean>
}

abstract class BasePlatformAPI implements IPlatformAPI {
  - Common error handling
  - Rate limiting with exponential backoff
  - Abstract methods for platform-specific implementations
}
```

### Marin Dispatcher Service (marinDispatcherService.ts)
**Location**: `/backend/src/services/marinDispatcherService.ts`
**Extends**: `BasePlatformAPI`
**Purpose**: Direct API integration with Marin Dispatcher ALB

**Key Methods**:
- `constructor(accountId, publisher)` - Initialize with config
- `isAuthenticated()` - Verify API connectivity
- `createCampaign(campaignPlan, name)` - Create campaign
- `updateCampaign(campaignId, updates)` - Update campaign
- `pauseCampaign(campaignId)` - Pause campaign
- `resumeCampaign(campaignId)` - Resume campaign
- `deleteCampaign(campaignId)` - Delete campaign (status = REMOVED)
- `getCampaignStatus(campaignId)` - Get campaign status
- `createAdGroup(campaignId, name, ...)` - Create ad group
- `updateAdGroup(adGroupId, updates)` - Update ad group
- `createAds(adGroupId, ads)` - Create ads/RSAs
- `createKeywords(adGroupId, keywords)` - Create keywords
- `createBulkKeywords(adGroupId, keywords)` - Bulk keyword creation

**Internal Methods**:
- `buildApiPath(endpoint)` - Construct API endpoint (format: `/dispatcher/${publisher}${endpoint}`)
- `mapCampaignPlanToRequest(campaignPlan, name)` - Convert campaign plan to request format
- `mapResponseToPlatformResponse(response)` - Convert API response to standard format
- `handleError(error, operation)` - Centralized error handling

**X-Ray Integration**:
```typescript
// Per-method tracing
const segment = AWSXRay.getSegment();
const subsegment = segment?.addNewSubsegment('MarinDispatcher.methodName');
// ... operation
subsegment?.close();
```

### Marin Batch Job Service (marinBatchJobService.ts)
**Location**: `/backend/src/services/marinBatchJobService.ts`
**Purpose**: Bulk campaign creation via Marin batch job API

**Key Methods**:
- `createBatchJob()` - Create new batch job, returns batchJobId
- `addOperationsToBatch(batchJobId, operations, sequenceToken?)` - Add up to 1000 operations per request
- `runBatchJob(batchJobId)` - Start batch job execution
- `pollBatchJobStatus(batchJobId, maxAttempts, intervalMs)` - Poll until completion with exponential backoff
- `getBatchJobResults(batchJobId)` - Retrieve batch job results
- `bulkCreateCampaigns(campaigns)` - High-level orchestration method

**Batch Job Workflow**:
1. Create batch job → Get `batchJobId`
2. Create batch operations from campaigns
3. Add operations in chunks (max 1000 per request)
4. Run batch job
5. Poll status until DONE/FAILED/CANCELLED
6. Get results with summary and individual operation results

**API Path Format**: `/dispatcher/${publisher}/batch-jobs`

### Campaign Creation Service (campaignCreationService.ts)
**Purpose**: Orchestrates multi-platform campaign creation
- Registers platform services
- Creates campaigns across multiple platforms
- Handles errors per-platform
- Supports progress tracking callbacks

---

## 3. Lambda Integration Patterns

### Marin Dispatcher Client (lib/marinDispatcherClient.ts)
**Purpose**: Wraps MarinDispatcherService for Lambda functions

**Methods**:
```typescript
async handleLambdaEvent(event: LambdaEvent): Promise<LambdaResponse>
  - Validates event structure
  - Routes to appropriate service method based on action
  - Formats response in Lambda response format

private mapPlatformResponseToLambdaResponse(response)
  - Converts service response to Lambda format

getService(): MarinDispatcherService
  - Returns underlying service instance
```

**Supported Actions**:
- `create_campaign` - Requires: campaignPlan, name
- `update_campaign` - Requires: campaignId, updates
- `pause_campaign` - Requires: campaignId
- `resume_campaign` - Requires: campaignId
- `delete_campaign` - Requires: campaignId
- `get_campaign_status` - Requires: campaignId

**Example Lambda Event**:
```json
{
  "action": "create_campaign",
  "data": {
    "campaignPlan": { ... },
    "name": "My Campaign"
  },
  "user": { "sub": "user-123" }
}
```

### Marin Batch Job Client (lib/marinBatchJobClient.ts)
**Purpose**: Handles both SQS events and Lambda events for batch jobs

**Methods**:
```typescript
async handleSqsEvent(event: SqsEvent): Promise<LambdaResponse>
  - Processes SQS records
  - Calls bulkCreateCampaigns for each message
  - Returns results with partial success handling

async handleLambdaEvent(event: LambdaEvent): Promise<LambdaResponse>
  - Routes to batch job service methods
  - Supports 6 batch job actions
```

**Supported SQS Message Format**:
```json
{
  "jobId": "job-123",
  "campaigns": [ { MarinCampaignRequest }, ... ]
}
```

**Supported Lambda Actions**:
- `bulk_create_campaigns` - Direct bulk creation
- `create_batch_job` - Create new batch job
- `add_operations_to_batch` - Add operations with sequence token
- `run_batch_job` - Start execution
- `poll_batch_job_status` - Poll with exponential backoff
- `get_batch_job_results` - Retrieve final results

---

## 4. Request/Response Formats

### Campaign Types (marinDispatcher.types.ts)

#### Campaign Request
```typescript
interface MarinCampaignRequest {
  accountId: string;              // Marin account ID
  name: string;                   // Campaign name (max 255 chars)
  status: 'ENABLED' | 'PAUSED' | 'REMOVED';
  budget: {
    amount: number;               // Dollar amount (NOT micros)
    deliveryMethod: 'STANDARD' | 'ACCELERATED';
  };
  biddingStrategy: string;        // e.g., 'MANUAL_CPC'
  objective?: string;             // For Meta campaigns
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

### Ad (RSA) Types

```typescript
interface MarinAdRequest {
  accountId: string;
  adGroupId: string;
  type: 'RESPONSIVE_SEARCH_AD';
  headlines: Array<{ text: string }>;      // 3-15 items, max 30 chars
  descriptions: Array<{ text: string }>;   // 2-4 items, max 90 chars
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

### Platform API Response (campaign.types.ts)

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

### Lambda Types (lambda.types.ts)

```typescript
interface LambdaEvent {
  action: string;                 // e.g., 'create_campaign'
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
  result?: any;                   // Present on success
  error?: string;                 // Present on failure
  details?: any;                  // Additional details
}

type CampaignAction =
  | 'create_campaign'
  | 'update_campaign'
  | 'pause_campaign'
  | 'resume_campaign'
  | 'delete_campaign'
  | 'get_campaign_status';

type BatchJobAction =
  | 'create_batch_job'
  | 'add_operations_to_batch'
  | 'run_batch_job'
  | 'poll_batch_job_status'
  | 'get_batch_job_results'
  | 'bulk_create_campaigns';
```

---

## 5. Error Handling Patterns

### Middleware Error Handler (middleware/errorHandler.ts)

```typescript
export interface AppError extends Error {
  statusCode?: number;
  status?: number;
  isOperational?: boolean;
}

// Error handler logs and returns structured error response
{
  error: {
    message: string;
    statusCode: number;
    stack: string;  // Only in development
  }
}

// Async wrapper for catching errors in route handlers
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
```

### Service-Level Error Handling

```typescript
// In MarinDispatcherService
private handleError(error: any, operation: string): PlatformAPIResponse {
  console.error(`[${this.platformName}] Error in ${operation}:`, error);
  return {
    success: false,
    error: error.message || `Failed to ${operation}`,
    details: error,
  };
}

// Try-catch with X-Ray cleanup
try {
  // Operation
  subsegment?.close();
  return response;
} catch (error: any) {
  subsegment?.close();
  return this.handleError(error, 'operation');
}
```

### Validation Error Handling (utils/marinTypeValidators.ts)

```typescript
interface ValidationResult {
  isValid: boolean;
  errors: string[];  // Array of validation error messages
}

// Example usage
const validation = validateCampaignRequest(request);
if (!validation.isValid && validation.errors.length > 0) {
  return {
    success: false,
    error: `Validation failed: ${validation.errors.join(', ')}`,
  };
}
```

### Rate Limiting with Exponential Backoff

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

### Batch Job Error Handling

```typescript
// Partial success handling in SQS event processing
if (errors.length > 0 && results.length === 0) {
  // All failed
  return { success: false, error: `All ${errors.length} record(s) failed` };
} else if (errors.length > 0) {
  // Partial success
  return { success: true, result: { processed, failed, results, errors } };
} else {
  // All succeeded
  return { success: true, result: { processed, failed: 0, results } };
}
```

---

## 6. Environment Variable Configuration

### Required Environment Variables (config/env.ts)

```typescript
// API Configuration
PORT=3001                              // Default: 3001
CORS_ORIGIN=http://localhost:5173      // CORS origin for development

// AI Services
OPENAI_API_KEY=<key>                   // Required for production
ANTHROPIC_API_KEY=<key>                // Optional

// Google Ads OAuth
GOOGLE_ADS_CLIENT_ID=<id>
GOOGLE_ADS_CLIENT_SECRET=<secret>
GOOGLE_ADS_REFRESH_TOKEN=<token>
GOOGLE_ADS_DEVELOPER_TOKEN=<token>
GOOGLE_ADS_CUSTOMER_ID=<id>

// Meta Ads
META_APP_ID=<id>
META_APP_SECRET=<secret>

// Microsoft Ads
MICROSOFT_ADS_CLIENT_ID=<id>
MICROSOFT_ADS_CLIENT_SECRET=<secret>

// Marin Dispatcher (Critical for Lambda deployment)
DISPATCHER_URL=<ALB_URL>               // Primary: Set by CloudFormation
MARIN_DISPATCHER_BASE_URL=<URL>        // Fallback: Local development
MARIN_DISPATCHER_ACCOUNT_ID=<id>       // Marin account ID
MARIN_DISPATCHER_PUBLISHER=google      // Default: 'google'
MARIN_DISPATCHER_TIMEOUT=10000         // Default: 10000ms
```

### Configuration Loading

```typescript
export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  openaiApiKey: process.env.OPENAI_API_KEY !== undefined ? 
    process.env.OPENAI_API_KEY : '',
  
  marinDispatcher: {
    baseUrl: process.env.DISPATCHER_URL !== undefined ? 
      process.env.DISPATCHER_URL : 
      (process.env.MARIN_DISPATCHER_BASE_URL !== undefined ? 
        process.env.MARIN_DISPATCHER_BASE_URL : ''),
    accountId: process.env.MARIN_DISPATCHER_ACCOUNT_ID !== undefined ? 
      process.env.MARIN_DISPATCHER_ACCOUNT_ID : '',
    publisher: process.env.MARIN_DISPATCHER_PUBLISHER !== undefined ? 
      process.env.MARIN_DISPATCHER_PUBLISHER : 'google',
    timeout: parseInt(process.env.MARIN_DISPATCHER_TIMEOUT || '10000', 10),
  },
};

// Validation for production
if (process.env.NODE_ENV === 'production') {
  const requiredVars = ['OPENAI_API_KEY'];
  const missingVars = requiredVars.filter((varName) => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn(`Warning: Missing environment variables: ${missingVars.join(', ')}`);
  }
}

// Marin Dispatcher URL validation
if (!config.marinDispatcher.baseUrl && process.env.NODE_ENV === 'production') {
  console.warn('Warning: DISPATCHER_URL or MARIN_DISPATCHER_BASE_URL must be set');
}
```

### CloudFormation Integration

The `DISPATCHER_URL` environment variable is set by CloudFormation/InfraDocs during Lambda deployment:
```
DISPATCHER_URL=http://meridian-dispatcher-alb-{env}-{hash}.{region}.elb.amazonaws.com
```

This is the full ALB URL, including protocol, used as the `baseURL` for axios requests.

---

## 7. VPC & X-Ray Tracing Setup

### X-Ray Integration

**Library**: `aws-xray-sdk-core`

**Usage Pattern**:
```typescript
import * as AWSXRay from 'aws-xray-sdk-core';

// In service methods
async createCampaign(campaignPlan, name): Promise<PlatformAPIResponse> {
  const segment = AWSXRay.getSegment();
  const subsegment = segment?.addNewSubsegment('MarinDispatcher.createCampaign');

  try {
    // Operation
    subsegment?.close();
    return response;
  } catch (error) {
    subsegment?.close();
    return this.handleError(error, 'createCampaign');
  }
}
```

**Subsegment Naming Convention**:
- `MarinDispatcher.createCampaign`
- `MarinDispatcher.updateCampaign`
- `MarinDispatcher.pauseCampaign`
- `MarinBatchJobService.bulkCreateCampaigns`
- `MarinDispatcherClient.handleLambdaEvent`
- `MarinBatchJobClient.handleSqsEvent`

### VPC Configuration

Marin Dispatcher is deployed behind an Application Load Balancer (ALB) within a VPC. Lambda functions must be configured to access it:

1. **Lambda VPC Configuration**:
   - Subnet: Private subnet where Dispatcher ALB resides
   - Security Group: Must allow outbound HTTPS (port 443) or HTTP (port 80)

2. **ALB Endpoint**:
   - Protocol: HTTP (internal network)
   - DNS: `meridian-dispatcher-alb-{env}-{hash}.{region}.elb.amazonaws.com`
   - Port: 80 (typically)

3. **API Endpoint Format**:
   ```
   http://meridian-dispatcher-alb-dev-1234567890.us-east-1.elb.amazonaws.com/dispatcher/google/campaigns
   ```

---

## 8. Batch Job Workflow

### Single Campaign Creation Flow

```
Controller (campaignCreationController.ts)
  ↓
POST /api/campaigns/create
  ↓
CampaignCreationService.createCampaign()
  ↓
MarinDispatcherService.createCampaign()
  ↓
POST /dispatcher/google/campaigns
  ↓
Marin Dispatcher ALB
  ↓
MarinCampaignResponse
  ↓
Return PlatformAPIResponse
```

### Bulk Campaign Creation via Batch Job

```
Lambda Event (handleLambdaEvent)
  ↓
action: 'bulk_create_campaigns'
  ↓
MarinBatchJobClient.handleLambdaEvent()
  ↓
MarinBatchJobService.bulkCreateCampaigns()
  ↓
1. createBatchJob()
   POST /dispatcher/google/batch-jobs
   → Get batchJobId
  ↓
2. createBatchOperationsFromCampaigns(campaigns)
   Convert MarinCampaignRequest[] → BatchOperation[]
  ↓
3. chunkOperations(operations, 1000)
   Split into chunks (max 1000 per request)
  ↓
4. Loop through chunks:
   PUT /dispatcher/google/batch-jobs/{batchJobId}/operations
   → Include sequenceToken in each request
  ↓
5. runBatchJob(batchJobId)
   POST /dispatcher/google/batch-jobs/{batchJobId}/run
  ↓
6. pollBatchJobStatus(batchJobId)
   GET /dispatcher/google/batch-jobs/{batchJobId}
   Poll every 5s-30s (exponential backoff)
   Until jobStatus = DONE|FAILED|CANCELLED
  ↓
7. getBatchJobResults(batchJobId)
   GET /dispatcher/google/batch-jobs/{batchJobId}/results
   → BatchJobResultsResponse with summary and individual results
  ↓
Return BatchJobResultsResponse
```

### SQS Batch Processing

```
SQS Event
  ↓
Records: [
  {
    body: JSON.stringify({
      jobId: 'job-123',
      campaigns: [{ MarinCampaignRequest }, ...]
    })
  }
]
  ↓
MarinBatchJobClient.handleSqsEvent()
  ↓
For each record:
  Parse message body
  Validate jobId and campaigns array
  Call MarinBatchJobService.bulkCreateCampaigns()
  Collect results/errors
  ↓
Return LambdaResponse with:
  - success: boolean
  - result: { processed, failed, results, errors }
  - Handles partial success
```

### Batch Operation Types

```
BatchOperation {
  operationType: 'CREATE' | 'UPDATE'
  resourceType: 'CAMPAIGN' | 'ADGROUP' | 'AD' | 'KEYWORD'
  resource: Typed request object
  operationId?: string
}

Validation per resourceType:
  CAMPAIGN → validateCampaignRequest()
  ADGROUP  → validateAdGroupRequest()
  AD       → validateAdRequest()
  KEYWORD  → validateKeywordRequest()
```

### Batch Job Status Flow

```
CREATE BATCH JOB
  ↓
jobStatus: 'PENDING'
  ↓
ADD OPERATIONS (up to 1000 per request)
  ↓
jobStatus: 'PENDING'
  ↓
RUN BATCH JOB
  ↓
jobStatus: 'PROCESSING'
  ↓
POLL STATUS
  ↓
jobStatus: 'DONE' | 'FAILED' | 'CANCELLED'
  ↓
GET RESULTS
  ↓
BatchJobResultsResponse {
  jobId
  jobStatus
  summary: {
    totalOperations
    successfulOperations
    failedOperations
  }
  results: BatchJobResult[]
}
```

---

## 9. Type System & Validation

### Type Validators (utils/marinTypeValidators.ts)

**Functions**:
- `validateCampaignRequest(request)` → ValidationResult
- `validateAdGroupRequest(request)` → ValidationResult
- `validateAdRequest(request)` → ValidationResult
- `validateKeywordRequest(request)` → ValidationResult
- `validateBatchOperation(operation)` → ValidationResult

**Validation Rules**:

```typescript
Campaign:
  ✓ accountId: non-empty string
  ✓ name: non-empty, max 255 chars
  ✓ status: ENABLED | PAUSED | REMOVED
  ✓ budget.amount: positive number
  ✓ budget.deliveryMethod: STANDARD | ACCELERATED
  ✓ biddingStrategy: non-empty string
  ✓ objective: optional, string if provided

Ad Group:
  ✓ accountId: non-empty string
  ✓ campaignId: non-empty string
  ✓ name: non-empty string
  ✓ status: optional, ENABLED | PAUSED | REMOVED
  ✓ cpcBid: optional, positive number
  ✓ cpmBid: optional, positive number

Ad (RSA):
  ✓ accountId: non-empty string
  ✓ adGroupId: non-empty string
  ✓ type: must be 'RESPONSIVE_SEARCH_AD'
  ✓ headlines: array, 3-15 items, max 30 chars each
  ✓ descriptions: array, 2-4 items, max 90 chars each
  ✓ finalUrl: valid URL
  ✓ displayUrl: optional, string if provided
  ✓ paths: optional, array of strings

Keyword:
  ✓ accountId: non-empty string
  ✓ adGroupId: non-empty string
  ✓ text: non-empty, max 80 chars
  ✓ matchType: BROAD | PHRASE | EXACT
  ✓ cpcBid: optional, positive number
  ✓ status: optional, ENABLED | PAUSED | REMOVED
```

### Helper Functions

```typescript
isNonEmptyString(value)    // typeof === 'string' && length > 0
isValidUrl(url)            // Try new URL(url)
isPositiveNumber(value)    // typeof === 'number' && > 0
isValidCampaignStatus(status)    // Type guard
isValidBudgetDeliveryMethod(method)
isValidKeywordMatchType(type)
isValidResourceStatus(status)
isValidBatchOperationType(type)
isValidBatchResourceType(type)
```

---

## 10. Testing & Fixtures

### Test Structure

```
backend/src/__tests__/
├── services/
│   ├── marinDispatcherService.test.ts          # Core API tests
│   ├── marinDispatcherService.crud.test.ts     # CRUD operations
│   ├── marinDispatcherService.connectivity.test.ts
│   ├── marinDispatcherService.campaignQuery.test.ts
│   ├── marinDispatcherService.adStructure.test.ts
│   ├── marinDispatcherService.manual.test.ts
│   ├── marinBatchJobService.test.ts            # Batch job tests
│   └── [other service tests]
├── controllers/
│   ├── campaignController.test.ts
│   ├── campaignCreationController.test.ts
│   └── [other controller tests]
├── routes/
│   ├── campaigns.rest-api.test.ts              # Integration tests
│   └── [other route tests]
├── integration/
│   ├── e2e-workflow.test.ts
│   └── marinIntegration.test.ts
└── fixtures/
    └── marinApiMocks.ts
```

### Mock Pattern

```typescript
jest.mock('axios');
jest.mock('aws-xray-sdk-core');
jest.mock('../../config/env', () => ({
  default: { marinDispatcher: { ... } }
}));

// Mock HTTP client
mockHttpClient = {
  post: jest.fn().mockResolvedValue({ data: { ... } }),
  put: jest.fn(),
  get: jest.fn(),
};
mockedAxios.create.mockReturnValue(mockHttpClient);

// Mock X-Ray
(AWSXRay.getSegment as jest.Mock).mockReturnValue({
  addNewSubsegment: jest.fn().mockReturnValue({ close: jest.fn() }),
});
```

---

## 11. Key Architecture Decisions

### 1. Full ALB URL vs Base Path
**Decision**: Use full ALB URL from `DISPATCHER_URL` env var
- Simplifies axios configuration
- Supports both local development and Lambda deployment
- Clear separation between base URL and API paths

### 2. X-Ray Tracing Per Method
**Decision**: Get X-Ray segment in each service method
- Fine-grained performance monitoring
- Automatic cleanup even on error
- Works in Lambda context without additional setup

### 3. Batch Operations Chunking
**Decision**: Chunk 1000 operations per request
- Marin API limit: 1000 operations per request
- Automatic handling of large campaign batches
- Sequence token management across chunks

### 4. Exponential Backoff for Rate Limiting
**Decision**: Implement in BasePlatformAPI
- Handles API rate limits transparently
- Automatic retry with configurable delays
- Reduces overall service latency

### 5. Validation Before API Call
**Decision**: Validate request structure in service
- Prevents unnecessary API calls
- Clear error messages for client
- Centralized validation logic

### 6. Platform-Agnostic Interface
**Decision**: IPlatformAPI interface with service implementations
- Easy to add new platforms
- Consistent error handling
- Pluggable architecture

---

## 12. Configuration & Deployment

### Local Development
```bash
# .env file
DISPATCHER_URL=http://localhost:8080
MARIN_DISPATCHER_ACCOUNT_ID=dev-123
MARIN_DISPATCHER_PUBLISHER=google
PORT=3001
```

### AWS Lambda Deployment
```
CloudFormation sets:
DISPATCHER_URL=http://meridian-dispatcher-alb-prod-123.us-east-1.elb.amazonaws.com
MARIN_DISPATCHER_ACCOUNT_ID=prod-account-id
```

### VPC Configuration Required
1. Lambda must be in same VPC or have network access to ALB
2. Security group must allow outbound HTTP/HTTPS
3. NAT Gateway for private subnet access (if applicable)

---

## Key Files Summary

| File | Purpose |
|------|---------|
| `index.ts` | Express app setup, middleware, routes |
| `config/env.ts` | Environment variable configuration |
| `routes/api.ts` | Main API router |
| `routes/campaigns.ts` | Campaign endpoints |
| `services/marinDispatcherService.ts` | Core Marin Dispatcher integration |
| `services/marinBatchJobService.ts` | Batch job operations |
| `services/platformApiService.ts` | Base platform API interface |
| `lib/marinDispatcherClient.ts` | Lambda wrapper for dispatcher service |
| `lib/marinBatchJobClient.ts` | Lambda wrapper for batch jobs |
| `types/marinDispatcher.types.ts` | Marin API type definitions |
| `types/lambda.types.ts` | Lambda event/response types |
| `utils/marinTypeValidators.ts` | Request validation functions |
| `middleware/errorHandler.ts` | Centralized error handling |
| `middleware/requestLogger.ts` | Request logging |

