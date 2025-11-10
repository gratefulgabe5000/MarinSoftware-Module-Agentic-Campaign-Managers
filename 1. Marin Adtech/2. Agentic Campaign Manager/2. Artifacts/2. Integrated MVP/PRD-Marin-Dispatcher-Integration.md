# Marin Dispatcher Integration PRD
**Product Requirements Document**

---

## Document Information
- **Project**: Agentic Campaign Manager - Marin Dispatcher Integration
- **Version**: 1.1 (Updated with Actual API Schemas)
- **Date**: 2025-11-09
- **Last Updated**: 2025-11-09
- **Status**: Ready for Implementation
- **Owner**: Engineering Team

### Revision History
- **v1.1** (2025-11-09): Updated all schemas with actual Marin Dispatcher API documentation
  - Fixed budget structure (removed micros conversion)
  - Updated batch operation format
  - Corrected response formats
  - Added summary objects to results
  - Changed snake_case to camelCase throughout
- **v1.0** (2025-11-09): Initial PRD draft

### ⚠️ Key Changes from v1.0 to v1.1

**CRITICAL Schema Fixes:**

1. **Budget Structure** (affects all campaign creation code):
   ```diff
   - "campaign_budget": { "amount_micros": 50000000, "delivery_method": "STANDARD" }
   + "budget": { "amount": 1000, "deliveryMethod": "STANDARD" }
   ```
   - ❌ No micros conversion needed
   - ❌ Field name: `campaign_budget` → `budget`
   - ❌ Snake case → camelCase

2. **Batch Operations** (affects bulk creation):
   ```diff
   - { "campaignOperation": { "create": { ...data } } }
   + { "operationType": "CREATE", "resourceType": "CAMPAIGN", "data": { ...data } }
   ```
   - ✅ Simpler, flatter structure
   - ✅ Explicit operation and resource types

3. **Batch Job Status** (affects polling logic):
   ```diff
   - { "batchJobId": "...", "status": "DONE", "done": true }
   + { "id": "...", "status": "DONE", "metadata": { "progress": 100 } }
   ```
   - ❌ Check `status === "DONE"` not `done` field
   - ✅ Added `metadata.progress` for better UX

4. **Batch Results** (affects result parsing):
   ```diff
   - { "results": [{ "operationIndex": 0, "campaignResult": {...} }] }
   + { "summary": { "total": 100, "succeeded": 98, "failed": 2 }, "results": [...] }
   ```
   - ✅ Results include summary totals
   - ✅ Simpler result structure

**Impact:** All code examples and type definitions updated to match actual API.

---

## 1. Executive Summary

### 1.1 Overview
This PRD outlines the integration of the Marin Dispatcher API into the Agentic Campaign Manager platform. The Marin Dispatcher acts as a unified gateway to manage campaigns across multiple advertising platforms (Google Ads, Meta, Microsoft Ads) through a single API interface.

### 1.2 Problem Statement
Currently, our Agentic Campaign Manager directly integrates with platform-specific APIs (Google Ads API, Meta API, Microsoft API). While functional, this approach:
- Requires maintaining multiple platform-specific integrations
- Increases complexity in authentication and credential management
- Makes cross-platform campaign management inconsistent
- Lacks centralized campaign orchestration and monitoring

### 1.3 Solution
Integrate the Marin Dispatcher API as an alternative platform service that provides:
- Unified API interface for multi-platform campaign operations
- Centralized authentication and request routing
- Simplified campaign lifecycle management (campaigns, ad groups, ads, keywords)
- Bulk campaign creation via BatchJobService (supports >1000 operations)
- Consistent data models across platforms

### 1.4 Success Metrics
- ✅ Successfully create campaigns via Marin Dispatcher API
- ✅ Full CRUD operations (Create, Read, Update, Delete) for campaigns
- ✅ Ad group, ad, and keyword management support
- ✅ Bulk campaign creation via BatchJobService (>100 campaigns)
- ✅ <500ms average API response time (single operations)
- ✅ <60 seconds completion time for batch jobs
- ✅ 100% parity with direct platform integrations
- ✅ Zero breaking changes to existing REST API contracts

---

## 2. Technical Context

### 2.1 Current Architecture
The Agentic Campaign Manager uses a **platform abstraction pattern**:

```
┌─────────────────────────────────────────────────────────┐
│           CampaignCreationService (Orchestrator)        │
│                                                          │
│  Manages multi-platform campaign creation & lifecycle   │
└──────────────────┬──────────────────────────────────────┘
                   │
                   │ Registers Platform Services
                   │
        ┌──────────┼──────────┬──────────────┐
        │          │           │              │
        ▼          ▼           ▼              ▼
   ┌─────────┐ ┌─────────┐ ┌──────────┐ ┌──────────┐
   │ Google  │ │  Meta   │ │Microsoft │ │  Marin   │ 🆕
   │   Ads   │ │   Ads   │ │   Ads    │ │Dispatcher│
   └─────────┘ └─────────┘ └──────────┘ └──────────┘
        │          │           │              │
        │          │           │              │
   All implement IPlatformAPI Interface
```

**Key Components:**
- `IPlatformAPI` - Interface defining platform contract (8 required methods)
- `BasePlatformAPI` - Abstract base class with common functionality
- `CampaignCreationService` - Orchestrates multi-platform operations
- Platform Services - Google, Meta, Microsoft implementations

**File Locations:**
- `backend/src/services/platformApiService.ts` - Interface definition
- `backend/src/services/googleAdsService.ts` - Reference implementation (357 LOC)
- `backend/src/services/campaignCreationService.ts` - Orchestrator (270 LOC)

### 2.2 Existing API Contract
Our REST API already supports multi-platform operations:

```http
POST   /api/campaigns              # Create campaign (all platforms)
GET    /api/campaigns/:id          # Get campaign details
PUT    /api/campaigns/:id          # Update campaign
DELETE /api/campaigns/:id          # Delete campaign
POST   /api/campaigns/:id/pause    # Pause campaign
POST   /api/campaigns/:id/resume   # Resume campaign
GET    /api/campaigns/:id/status   # Get campaign status
```

**No changes required to REST endpoints** - Marin will be auto-supported.

---

## 3. Marin Dispatcher API Specification

### 3.1 API Base Information
- **Base URL**: `http://pubgateway-dispatcher-alb-856277585.us-east-1.elb.amazonaws.com`
- **API Version**: v2
- **Authentication**: None required (internal network)
- **Protocol**: HTTP/REST
- **Data Format**: JSON
- **Publisher**: `google` (target platform)
- **Account ID**: `5533110357`

### 3.2 Endpoint Mapping

#### Google Ads API → Marin Dispatcher API

| Operation | Google Ads API | Marin Dispatcher API |
|-----------|---------------|---------------------|
| **Create Campaign Budget** | `POST /v22/customers/{CUSTOMER_ID}/campaignBudgets:mutate` | `POST /api/v2/dispatcher/google/campaigns` |
| **Create Campaign** | `POST /v22/customers/{CUSTOMER_ID}/campaigns:mutate` | `POST /api/v2/dispatcher/google/campaigns` |
| **Update Campaign** | `POST /v22/customers/{CUSTOMER_ID}/campaigns:mutate` | `PUT /api/v2/dispatcher/google/campaigns/{id}` |
| **Get Campaign** | `POST /v22/customers/{CUSTOMER_ID}/googleAds:searchStream` | `GET /api/v2/dispatcher/google/campaigns/{id}` |
| **List Campaigns** | `POST /v22/customers/{CUSTOMER_ID}/googleAds:searchStream` | `GET /api/v2/dispatcher/google/campaigns?accountId={id}` |
| **Create Ad Group** | `POST /v22/customers/{CUSTOMER_ID}/adGroups:mutate` | `POST /api/v2/dispatcher/google/adgroups` |
| **Update Ad Group** | `POST /v22/customers/{CUSTOMER_ID}/adGroups:mutate` | `PUT /api/v2/dispatcher/google/adgroups/{id}` |
| **Create Ad** | `POST /v22/customers/{CUSTOMER_ID}/adGroupAds:mutate` | `POST /api/v2/dispatcher/google/ads` |
| **Update Ad** | `POST /v22/customers/{CUSTOMER_ID}/adGroupAds:mutate` | `PUT /api/v2/dispatcher/google/ads/{id}` |
| **Create Keywords** | `POST /v22/customers/{CUSTOMER_ID}/adGroupCriteria:mutate` | `POST /api/v2/dispatcher/google/keywords` |
| **Update Keywords** | `POST /v22/customers/{CUSTOMER_ID}/adGroupCriteria:mutate` | `PUT /api/v2/dispatcher/google/keywords/{id}` |

#### Batch Job Operations (Bulk Create)

| Operation | Google Ads API | Marin Dispatcher API |
|-----------|---------------|---------------------|
| **Create Batch Job** | `POST /v22/customers/{CUSTOMER_ID}/batchJobs:mutate` | `POST /api/v2/dispatcher/{publisher}/batch-jobs` |
| **Add Operations to Batch** | `POST /v22/customers/{CUSTOMER_ID}/batchJobs/{BATCH_JOB_ID}:addOperations` | `POST /api/v2/dispatcher/{publisher}/batch-jobs/{id}/operations` |
| **Run Batch Job** | `POST /v22/customers/{CUSTOMER_ID}/batchJobs/{BATCH_JOB_ID}:run` | `POST /api/v2/dispatcher/{publisher}/batch-jobs/{id}/run` |
| **Poll Job Status** | `GET /v22/{OPERATION_NAME}` | `GET /api/v2/dispatcher/{publisher}/batch-jobs/{id}` |
| **Get Results** | `GET /v22/customers/{CUSTOMER_ID}/batchJobs/{BATCH_JOB_ID}:listResults` | `GET /api/v2/dispatcher/{publisher}/batch-jobs/{id}/results` |

**Notes:**
- Max 1,000 operations per `addOperations` request
- For >1,000 operations, use `sequenceToken` from response and call again
- Poll status every 5-10 seconds until `done: true`
- Typical completion time: 30-60 seconds

### 3.3 Example API Calls

#### List Campaigns
```bash
curl -X GET \
  'http://pubgateway-dispatcher-alb-856277585.us-east-1.elb.amazonaws.com/api/v2/dispatcher/google/campaigns?accountId=5533110357&limit=100' \
  -H 'accept: application/json'
```

#### Create Campaign (Actual Format)
```bash
curl -X POST \
  'http://pubgateway-dispatcher-alb-856277585.us-east-1.elb.amazonaws.com/api/v2/dispatcher/google/campaigns' \
  -H 'Content-Type: application/json' \
  -H 'accept: application/json' \
  -d '{
    "accountId": "5533110357",
    "name": "My Campaign",
    "status": "ENABLED",
    "budget": {
      "amount": 1000,
      "deliveryMethod": "STANDARD"
    },
    "biddingStrategy": "MANUAL_CPC"
  }'
```

**Note:** No currency conversion needed - amount is in dollars, not micros.

#### Update Campaign
```bash
curl -X PUT \
  'http://pubgateway-dispatcher-alb-856277585.us-east-1.elb.amazonaws.com/api/v2/dispatcher/google/campaigns/{campaign_id}' \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Updated Campaign Name",
    "status": "PAUSED"
  }'
```

#### Bulk Create (Batch Jobs)

**Step 1: Create Batch Job**
```bash
curl -X POST \
  'http://pubgateway-dispatcher-alb-856277585.us-east-1.elb.amazonaws.com/api/v2/dispatcher/google/batch-jobs' \
  -H 'Content-Type: application/json' \
  -d '{
    "accountId": "5533110357"
  }'

# Response:
{
  "batchJobId": "batch-12345",
  "status": "PENDING"
}
```

**Step 2: Add Operations (max 1000 per request)**
```bash
curl -X POST \
  'http://pubgateway-dispatcher-alb-856277585.us-east-1.elb.amazonaws.com/api/v2/dispatcher/google/batch-jobs/batch-12345/operations' \
  -H 'Content-Type: application/json' \
  -d '{
    "operations": [
      {
        "operationType": "CREATE",
        "resourceType": "CAMPAIGN",
        "data": {
          "accountId": "5533110357",
          "name": "Campaign 1",
          "status": "ENABLED",
          "budget": {
            "amount": 1000,
            "deliveryMethod": "STANDARD"
          },
          "biddingStrategy": "MANUAL_CPC"
        }
      },
      {
        "operationType": "CREATE",
        "resourceType": "CAMPAIGN",
        "data": {
          "accountId": "5533110357",
          "name": "Campaign 2",
          "status": "ENABLED",
          "budget": {
            "amount": 1500,
            "deliveryMethod": "STANDARD"
          },
          "biddingStrategy": "MANUAL_CPC"
        }
      }
    ]
  }'

# Response (for >1000 operations):
{
  "nextSequenceToken": "token-abc123",
  "totalOperations": 1000
}
```

**Step 3: Run Batch Job**
```bash
curl -X POST \
  'http://pubgateway-dispatcher-alb-856277585.us-east-1.elb.amazonaws.com/api/v2/dispatcher/google/batch-jobs/batch-12345/run' \
  -H 'Content-Type: application/json'
```

**Step 4: Poll Status (every 5-10 seconds)**
```bash
curl -X GET \
  'http://pubgateway-dispatcher-alb-856277585.us-east-1.elb.amazonaws.com/api/v2/dispatcher/google/batch-jobs/batch-12345' \
  -H 'accept: application/json'

# Response (while running):
{
  "resourceName": "customers/5533110357/batchJobs/batch-12345",
  "id": "batch-12345",
  "status": "RUNNING",
  "metadata": {
    "progress": 50,
    "totalOperations": 2,
    "completedOperations": 1
  }
}

# When complete:
{
  "resourceName": "customers/5533110357/batchJobs/batch-12345",
  "id": "batch-12345",
  "status": "DONE",
  "metadata": {
    "progress": 100,
    "totalOperations": 2,
    "completedOperations": 2
  }
}
```

**Note:** Check `status === "DONE"` instead of `done` field.

**Step 5: Get Results**
```bash
curl -X GET \
  'http://pubgateway-dispatcher-alb-856277585.us-east-1.elb.amazonaws.com/api/v2/dispatcher/google/batch-jobs/batch-12345/results' \
  -H 'accept: application/json'

# Response:
{
  "summary": {
    "total": 2,
    "succeeded": 1,
    "failed": 1
  },
  "results": [
    {
      "index": 0,
      "status": "SUCCESS",
      "resourceId": "campaign_67890",
      "error": null
    },
    {
      "index": 1,
      "status": "FAILURE",
      "resourceId": null,
      "error": "Invalid campaign budget"
    }
  ],
  "nextPageToken": null
}
```

**Note:** Results include a `summary` object with totals for easy reconciliation.

---

## 4. Implementation Plan

### 4.1 Required Files

#### New Files (3)
1. **`backend/src/types/marinDispatcher.types.ts`**
   - Type definitions for Marin API requests/responses
   - Campaign, Ad Group, Ad, Keyword interfaces
   - Batch job types
   - ~250-300 lines of code

2. **`backend/src/services/marinDispatcherService.ts`**
   - Main service implementation
   - Extends `BasePlatformAPI`
   - Implements all 8 `IPlatformAPI` methods
   - Ad structure methods (ad groups, ads, keywords)
   - ~500-600 lines of code

3. **`backend/src/services/marinBatchJobService.ts`**
   - Batch job orchestration service
   - Handles bulk campaign creation
   - Polling and result aggregation
   - ~200-300 lines of code

#### Modified Files (3)
1. **`backend/src/config/env.ts`**
   - Add Marin API configuration variables
   - ~10 lines added

2. **`backend/src/types/campaign.types.ts`**
   - Add `marin?` to `PlatformCampaignIds` interface
   - ~1 line modified

3. **`backend/src/services/campaignCreationService.ts`**
   - Register `MarinDispatcherService` in constructor
   - ~5 lines added

### 4.2 Implementation Phases

#### Phase 1: Configuration & Types (30 minutes)
**Goal**: Set up type definitions and environment configuration

**Tasks**:
- [ ] Create `marinDispatcher.types.ts` with all request/response interfaces
- [ ] Add environment variables to `env.ts`:
  ```typescript
  MARIN_DISPATCHER_BASE_URL
  MARIN_DISPATCHER_ACCOUNT_ID
  MARIN_DISPATCHER_PUBLISHER (default: 'google')
  ```
- [ ] Update `.env` file with actual values

**Deliverable**: Type-safe API contracts ready for implementation

---

#### Phase 2: Core Service Implementation (2-3 hours)
**Goal**: Implement `MarinDispatcherService` with all required campaign methods

**Tasks**:
- [ ] Create `marinDispatcherService.ts` class structure
- [ ] Extend `BasePlatformAPI`
- [ ] Implement 8 required methods:
  - `createCampaign()` - POST campaign with budget
  - `updateCampaign()` - PUT campaign updates
  - `pauseCampaign()` - Update status to PAUSED
  - `resumeCampaign()` - Update status to ENABLED
  - `deleteCampaign()` - Update status to REMOVED or DELETE
  - `getCampaignStatus()` - GET campaign details
  - `isAuthenticated()` - Health check (always true for now)
  - (Optional) `queryCampaigns()` - List campaigns

**Implementation Pattern** (follow `GoogleAdsService.ts`):
```typescript
import axios from 'axios';
import { BasePlatformAPI, IPlatformAPI } from './platformApiService';
import { CampaignPlan } from '../types/ai.types';
import { PlatformAPIResponse } from '../types/campaign.types';
import config from '../config/env';

export class MarinDispatcherService extends BasePlatformAPI implements IPlatformAPI {
  private apiUrl: string;
  private accountId: string;
  private publisher: string;

  constructor(accountId?: string, publisher: string = 'google') {
    super('Marin Dispatcher');
    this.apiUrl = config.marinDispatcher.baseUrl;
    this.accountId = accountId || config.marinDispatcher.accountId;
    this.publisher = publisher;
  }

  async createCampaign(
    campaignPlan: CampaignPlan,
    name: string
  ): Promise<PlatformAPIResponse> {
    // Implementation here
  }

  // ... other 7 methods
}
```

**Deliverable**: Fully functional campaign service class

---

#### Phase 2B: Ad Structure Implementation (3-4 hours)
**Goal**: Implement ad group, ad, and keyword management methods

**Tasks**:
- [ ] Add ad structure methods to `MarinDispatcherService`:
  - `createAdGroup(campaignId, adGroupData)` - POST ad group
  - `updateAdGroup(adGroupId, updates)` - PUT ad group updates
  - `createAd(adGroupId, adData)` - POST responsive search ad
  - `updateAd(adId, updates)` - PUT ad updates
  - `createKeywords(adGroupId, keywords)` - POST keywords
  - `updateKeywords(keywordId, updates)` - PUT keyword updates
- [ ] Add type definitions for:
  - `MarinAdGroupRequest` / `MarinAdGroupResponse`
  - `MarinAdRequest` / `MarinAdResponse`
  - `MarinKeywordRequest` / `MarinKeywordResponse`
- [ ] Implement data mapping from `CampaignPlan` to ad structure requests

**Example Implementation**:
```typescript
async createAdGroup(
  campaignId: string,
  adGroupData: MarinAdGroupRequest
): Promise<PlatformAPIResponse> {
  try {
    const response = await axios.post(
      `${this.apiUrl}/api/v2/dispatcher/${this.publisher}/adgroups`,
      {
        accountId: this.accountId,
        campaignId,
        ...adGroupData
      }
    );

    return {
      success: true,
      adGroupId: response.data.id,
      details: response.data
    };
  } catch (error) {
    return this.handleError(error, 'createAdGroup');
  }
}

async createAd(
  adGroupId: string,
  adData: MarinAdRequest
): Promise<PlatformAPIResponse> {
  try {
    const response = await axios.post(
      `${this.apiUrl}/api/v2/dispatcher/${this.publisher}/ads`,
      {
        accountId: this.accountId,
        adGroupId,
        ...adData
      }
    );

    return {
      success: true,
      adId: response.data.id,
      details: response.data
    };
  } catch (error) {
    return this.handleError(error, 'createAd');
  }
}

async createKeywords(
  adGroupId: string,
  keywords: MarinKeywordRequest[]
): Promise<PlatformAPIResponse> {
  try {
    const response = await axios.post(
      `${this.apiUrl}/api/v2/dispatcher/${this.publisher}/keywords`,
      {
        accountId: this.accountId,
        adGroupId,
        keywords
      }
    );

    return {
      success: true,
      keywords: response.data.keywords,
      details: response.data
    };
  } catch (error) {
    return this.handleError(error, 'createKeywords');
  }
}
```

**Deliverable**: Full campaign structure creation support (campaign → ad groups → ads → keywords)

---

#### Phase 2C: Batch Job Service (4-5 hours)
**Goal**: Implement bulk campaign creation using BatchJobService

**Tasks**:
- [ ] Create `marinBatchJobService.ts` class
- [ ] Implement batch job workflow:
  - `createBatchJob()` - Initialize batch job
  - `addOperationsToBatch()` - Add operations (handle >1000 with sequenceToken)
  - `runBatchJob()` - Execute batch job
  - `pollBatchJobStatus()` - Poll with exponential backoff
  - `getBatchJobResults()` - Retrieve and parse results
- [ ] Add batch operation types:
  - `BatchOperation` (campaignOperation, adGroupOperation, etc.)
  - `BatchJobStatus` (PENDING, RUNNING, DONE)
  - `BatchJobResult` (success/failure per operation)
- [ ] Implement error handling for partial failures
- [ ] Add progress tracking for large batches

**Example Implementation**:
```typescript
import axios from 'axios';
import config from '../config/env';
import {
  BatchOperation,
  BatchJobStatus,
  BatchJobResult
} from '../types/marinDispatcher.types';

export class MarinBatchJobService {
  private apiUrl: string;
  private accountId: string;
  private publisher: string;

  constructor(accountId?: string, publisher: string = 'google') {
    this.apiUrl = config.marinDispatcher.baseUrl;
    this.accountId = accountId || config.marinDispatcher.accountId;
    this.publisher = publisher;
  }

  async createBatchJob(): Promise<{ batchJobId: string }> {
    const response = await axios.post(
      `${this.apiUrl}/api/v2/dispatcher/${this.publisher}/batch-jobs`,
      { accountId: this.accountId }
    );
    return { batchJobId: response.data.batchJobId };
  }

  async addOperationsToBatch(
    batchJobId: string,
    operations: BatchOperation[],
    sequenceToken?: string
  ): Promise<{ sequenceToken?: string; totalOperationsAdded: number }> {
    const payload: any = { operations };
    if (sequenceToken) {
      payload.sequenceToken = sequenceToken;
    }

    const response = await axios.post(
      `${this.apiUrl}/api/v2/dispatcher/${this.publisher}/batch-jobs/${batchJobId}/operations`,
      payload
    );

    return {
      sequenceToken: response.data.sequenceToken,
      totalOperationsAdded: response.data.totalOperationsAdded
    };
  }

  async runBatchJob(batchJobId: string): Promise<void> {
    await axios.post(
      `${this.apiUrl}/api/v2/dispatcher/${this.publisher}/batch-jobs/${batchJobId}/run`
    );
  }

  async pollBatchJobStatus(
    batchJobId: string,
    maxAttempts: number = 120,
    intervalMs: number = 5000
  ): Promise<BatchJobStatus> {
    for (let i = 0; i < maxAttempts; i++) {
      const response = await axios.get(
        `${this.apiUrl}/api/v2/dispatcher/${this.publisher}/batch-jobs/${batchJobId}`
      );

      // Check status field, not done field
      if (response.data.status === 'DONE' || response.data.status === 'FAILED') {
        return response.data;
      }

      // Exponential backoff (5s, 10s, 15s, max 30s)
      const delay = Math.min(intervalMs * (i + 1), 30000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    throw new Error('Batch job timeout: exceeded max polling attempts');
  }

  async getBatchJobResults(batchJobId: string): Promise<BulkCreateResponse> {
    const response = await axios.get(
      `${this.apiUrl}/api/v2/dispatcher/${this.publisher}/batch-jobs/${batchJobId}/results`
    );
    return response.data;  // Returns { summary, results, nextPageToken }
  }

  /**
   * High-level method to execute bulk campaign creation
   */
  async bulkCreateCampaigns(
    campaigns: any[]
  ): Promise<BulkCreateResponse> {
    // 1. Create batch job
    const { batchJobId } = await this.createBatchJob();

    // 2. Add operations in chunks of 1000 (Marin format)
    const operations: BatchOperation[] = campaigns.map(campaign => ({
      operationType: 'CREATE',
      resourceType: 'CAMPAIGN',
      data: {
        accountId: this.accountId,
        ...campaign
      }
    }));

    let sequenceToken: string | undefined;
    for (let i = 0; i < operations.length; i += 1000) {
      const chunk = operations.slice(i, i + 1000);
      const result = await this.addOperationsToBatch(batchJobId, chunk, sequenceToken);
      sequenceToken = result.nextSequenceToken;
    }

    // 3. Run batch job
    await this.runBatchJob(batchJobId);

    // 4. Poll until complete
    const status = await this.pollBatchJobStatus(batchJobId);

    if (status.status === 'FAILED') {
      throw new Error(`Batch job failed: ${batchJobId}`);
    }

    // 5. Get results (includes summary)
    const response = await this.getBatchJobResults(batchJobId);

    return response;  // Returns { summary: { total, succeeded, failed }, results, nextPageToken }
  }
}
```

**Deliverable**: Bulk campaign creation with progress tracking and error handling

---

#### Phase 3: Integration (30 minutes)
**Goal**: Connect service to existing platform infrastructure

**Tasks**:
- [ ] Update `PlatformCampaignIds` in `campaign.types.ts`:
  ```typescript
  export interface PlatformCampaignIds {
    googleAds?: string;
    meta?: string;
    microsoft?: string;
    marin?: string; // 🆕 Add this
    [platform: string]: string | undefined;
  }
  ```

- [ ] Register service in `CampaignCreationService`:
  ```typescript
  // In constructor
  const marinService = new MarinDispatcherService();
  this.registerPlatformService('marin', marinService);
  ```

**Deliverable**: Marin available as platform option

---

#### Phase 4: Testing (3-4 hours)
**Goal**: Validate all operations work correctly

**Test Cases**:
1. **Connection Test**
   - [ ] Verify API connectivity
   - [ ] Test `isAuthenticated()` method
   - [ ] Validate account ID and publisher routing

2. **Campaign Lifecycle Test**
   - [ ] Create campaign with budget
   - [ ] Verify campaign appears in Marin system
   - [ ] Update campaign name/status
   - [ ] Pause campaign
   - [ ] Resume campaign
   - [ ] Get campaign status
   - [ ] Delete campaign

3. **Ad Structure Test**
   - [ ] Create campaign
   - [ ] Create ad group in campaign
   - [ ] Create responsive search ad in ad group
   - [ ] Add keywords to ad group
   - [ ] Update ad group settings
   - [ ] Update keyword bids
   - [ ] Verify full structure in Marin system

4. **Batch Job Test (Bulk Create)**
   - [ ] Create batch job
   - [ ] Add 10 campaign operations
   - [ ] Run batch job
   - [ ] Poll status until completion
   - [ ] Verify all 10 campaigns created successfully
   - [ ] Test with >1000 operations (verify sequenceToken handling)
   - [ ] Test partial failure (5 valid, 5 invalid campaigns)
   - [ ] Verify error messages for failed operations

5. **Error Handling Test**
   - [ ] Invalid account ID
   - [ ] Malformed request body
   - [ ] Network timeout
   - [ ] Rate limiting (if applicable)
   - [ ] Batch job timeout (exceed max polling attempts)
   - [ ] Invalid batch operations

6. **Integration Test**
   - [ ] Create campaign via REST API using `platform: 'marin'`
   - [ ] Multi-platform creation (Marin + Google Ads simultaneously)
   - [ ] Verify status updates propagate correctly
   - [ ] Bulk create via REST API endpoint

**Deliverable**: Validated, production-ready integration with full test coverage

---

## 5. Data Models

### 5.1 Campaign Plan Mapping

Our internal `CampaignPlan` → Marin Dispatcher Request

```typescript
// Internal CampaignPlan
interface CampaignPlan {
  objective: string;
  budget: {
    amount: number;
    currency: string;
    duration: string;
  };
  targeting: {
    locations: string[];
    demographics: any;
    interests: string[];
  };
  adCreative: {
    headlines: string[];
    descriptions: string[];
    callToActions: string[];
  };
  keywords: string[];
  campaignType: {
    googleAds?: string;
    meta?: string;
    microsoft?: string;
  };
}

// Maps to Marin Campaign Request
{
  "accountId": "5533110357",
  "name": campaignPlan.name,
  "status": "ENABLED",
  "budget": {
    "amount": campaignPlan.budget.amount,  // No conversion - already in dollars
    "deliveryMethod": "STANDARD"
  },
  "biddingStrategy": "MANUAL_CPC",
  "objective": campaignPlan.objective  // For Meta campaigns
}

// IMPORTANT: No currency conversion needed!
// - Marin uses "amount" in dollars, not "amount_micros"
// - No need for advertising_channel_type - publisher param determines platform
// - Use camelCase (deliveryMethod, biddingStrategy) not snake_case
```

### 5.2 Response Handling

```typescript
// Marin API Response (Campaign Creation)
{
  "resourceId": "campaign_12345",
  "status": "SUCCESS",
  "errors": [],
  "warnings": []
}

// Maps to PlatformAPIResponse
{
  success: true,
  campaignId: "campaign_12345",
  details: {
    status: "SUCCESS",
    errors: [],
    warnings: []
  }
}

// Marin API Response (Get Campaign)
{
  "id": "campaign_12345",
  "accountId": "5533110357",
  "name": "My Campaign",
  "status": "ENABLED",
  "budget": {
    "amount": 1000,
    "deliveryMethod": "STANDARD"
  },
  "biddingStrategy": "MANUAL_CPC",
  "createdAt": "2024-11-09T10:30:00Z",
  "updatedAt": "2024-11-09T10:30:00Z"
}

// Maps to PlatformAPIResponse
{
  success: true,
  campaignId: "campaign_12345",
  details: {
    name: "My Campaign",
    status: "ENABLED",
    budget: 1000  // Already in dollars, no conversion
  }
}
```

### 5.3 Batch Job Types

```typescript
// Batch Operation Types (Marin Simplified Structure)
export interface BatchOperation {
  operationType: 'CREATE' | 'UPDATE';
  resourceType: 'CAMPAIGN' | 'ADGROUP' | 'AD' | 'KEYWORD';
  resourceId?: string;  // Required for UPDATE operations
  data: MarinCampaignRequest | MarinAdGroupRequest | MarinAdRequest | MarinKeywordRequest;
}

// Example Batch Operation
const createCampaignOp: BatchOperation = {
  operationType: 'CREATE',
  resourceType: 'CAMPAIGN',
  data: {
    accountId: '5533110357',
    name: 'My Campaign',
    status: 'ENABLED',
    budget: {
      amount: 1000,
      deliveryMethod: 'STANDARD'
    },
    biddingStrategy: 'MANUAL_CPC'
  }
};

const updateCampaignOp: BatchOperation = {
  operationType: 'UPDATE',
  resourceType: 'CAMPAIGN',
  resourceId: 'campaign_123',
  data: {
    status: 'PAUSED'
  }
};

// Batch Job Status
export interface BatchJobStatus {
  resourceName: string;  // e.g., "customers/5533110357/batchJobs/batch-12345"
  id: string;  // Batch job ID
  status: 'PENDING' | 'RUNNING' | 'DONE' | 'FAILED';
  metadata: {
    progress: number;  // 0-100 percentage
    totalOperations: number;
    completedOperations: number;
  };
}

// Batch Job Result
export interface BatchJobResult {
  index: number;  // Operation index (not operationIndex)
  status: 'SUCCESS' | 'FAILURE';
  resourceId: string | null;  // Created/updated resource ID
  error: string | null;  // Error message if failed
}

// Bulk Create Response (includes summary)
export interface BulkCreateResponse {
  summary: {
    total: number;
    succeeded: number;
    failed: number;
  };
  results: BatchJobResult[];
  nextPageToken: string | null;  // For pagination if >1000 results
}

// Add Operations Response
export interface AddOperationsResponse {
  nextSequenceToken: string;  // For adding more operations
  totalOperations: number;  // Total operations in batch job so far
}
```

---

## 6. Configuration Requirements

### 6.1 Environment Variables

Add to `.env`:
```bash
# Marin Dispatcher Configuration
MARIN_DISPATCHER_BASE_URL=http://pubgateway-dispatcher-alb-856277585.us-east-1.elb.amazonaws.com
MARIN_DISPATCHER_ACCOUNT_ID=5533110357
MARIN_DISPATCHER_PUBLISHER=google
MARIN_DISPATCHER_TIMEOUT=10000
```

### 6.2 Code Configuration

Update `backend/src/config/env.ts`:
```typescript
export default {
  // ... existing config
  marinDispatcher: {
    baseUrl: process.env.MARIN_DISPATCHER_BASE_URL || '',
    accountId: process.env.MARIN_DISPATCHER_ACCOUNT_ID || '',
    publisher: process.env.MARIN_DISPATCHER_PUBLISHER || 'google',
    timeout: parseInt(process.env.MARIN_DISPATCHER_TIMEOUT || '10000'),
  },
};
```

---

## 7. API Contract (REST Endpoints)

### 7.1 Create Campaign with Marin

**Request**:
```http
POST /api/campaigns
Content-Type: application/json

{
  "name": "Q4 Holiday Campaign",
  "campaignPlan": {
    "objective": "Drive sales",
    "budget": {
      "amount": 5000,
      "currency": "USD",
      "duration": "monthly"
    },
    "targeting": {
      "locations": ["US", "CA"],
      "keywords": ["holiday gifts", "christmas shopping"]
    },
    "adCreative": {
      "headlines": ["Shop Holiday Deals", "Free Shipping"],
      "descriptions": ["Best prices of the season"]
    },
    "campaignType": {
      "googleAds": "SEARCH"
    }
  },
  "platforms": ["marin"] // 🆕 Use Marin instead of googleAds
}
```

**Response**:
```json
{
  "campaignId": "internal-campaign-123",
  "status": "creating",
  "platformCampaignIds": {
    "marin": "12345" // Marin campaign ID
  },
  "createdAt": "2025-11-09T10:30:00Z"
}
```

### 7.2 Multi-Platform Creation

Can still use Marin alongside other platforms:
```json
{
  "platforms": ["marin", "meta", "microsoft"]
}
```

Result:
```json
{
  "platformCampaignIds": {
    "marin": "12345",
    "meta": "act_67890",
    "microsoft": "ms-54321"
  }
}
```

---

## 8. Error Handling

### 8.1 Error Categories

| Error Type | HTTP Code | Handling Strategy |
|------------|-----------|-------------------|
| **Authentication Failed** | 401 | Return error to user, don't retry |
| **Invalid Request** | 400 | Return validation error details |
| **Not Found** | 404 | Return "Campaign not found" |
| **Rate Limit** | 429 | Exponential backoff retry (3 attempts) |
| **Server Error** | 500 | Retry once, then fail gracefully |
| **Network Timeout** | - | Retry with increased timeout |

### 8.2 Error Response Format

```typescript
{
  success: false,
  error: "Failed to create campaign on Marin Dispatcher",
  details: {
    platform: "marin",
    originalError: {
      status: 400,
      message: "Invalid campaign budget",
      code: "INVALID_BUDGET"
    }
  }
}
```

---

## 9. Testing Strategy

### 9.1 Unit Tests
```typescript
// backend/src/__tests__/services/marinDispatcherService.test.ts

describe('MarinDispatcherService', () => {
  it('should create campaign successfully', async () => {
    // Mock axios POST
    // Call createCampaign()
    // Assert success response
  });

  it('should handle API errors gracefully', async () => {
    // Mock axios POST to fail
    // Call createCampaign()
    // Assert error response with details
  });

  it('should convert budget to micros correctly', () => {
    // Test budget conversion logic
  });
});
```

### 9.2 Integration Tests
```bash
# Test against actual Marin Dispatcher API
npm run test:integration:marin
```

### 9.3 Manual Testing Checklist
- [ ] Create campaign via Postman
- [ ] Verify campaign in Marin UI (if available)
- [ ] Update campaign and verify changes
- [ ] Pause/resume campaign and verify status
- [ ] Create full campaign structure (campaign → ad group → ads → keywords)
- [ ] Test error scenarios (invalid data, network errors)

---

## 10. Success Criteria

### 10.1 Functional Requirements
- ✅ All 8 `IPlatformAPI` methods implemented and working
- ✅ Campaign CRUD operations complete
- ✅ Ad group, ad, and keyword management functional
- ✅ Bulk campaign creation via BatchJobService
- ✅ Batch job polling with proper timeout handling
- ✅ Partial failure handling in batch operations
- ✅ Error handling covers all failure scenarios
- ✅ Response format matches existing platform services
- ✅ No breaking changes to REST API

### 10.2 Non-Functional Requirements
- ✅ API response time <500ms for single operations (P95)
- ✅ Batch job completion <60 seconds for 100 campaigns
- ✅ Handle >1000 operations with sequenceToken
- ✅ 100% TypeScript type coverage
- ✅ Code follows existing patterns (GoogleAdsService template)
- ✅ All methods documented with JSDoc comments
- ✅ Unit test coverage >80%
- ✅ Zero console errors or warnings

### 10.3 Acceptance Criteria

**Single Campaign Operations:**
- [ ] Engineer can create campaign using Marin from Postman
- [ ] Campaign appears in target platform (Google Ads)
- [ ] Can create full campaign structure (campaign → ad group → ad → keywords)
- [ ] Multi-platform campaigns work (Marin + others)
- [ ] All campaign lifecycle operations functional (pause, resume, delete, update)
- [ ] Error messages are clear and actionable

**Bulk Operations:**
- [ ] Can create 100+ campaigns via batch job
- [ ] Batch job completes within 60 seconds
- [ ] Partial failures are handled gracefully
- [ ] Can track batch job progress via polling
- [ ] Results clearly show success/failure per operation

**Code Quality:**
- [ ] Code passes TypeScript compilation
- [ ] All tests pass
- [ ] No TypeScript errors or warnings
- [ ] JSDoc comments on all public methods

---

## 11. Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation | Status |
|------|--------|------------|------------|--------|
| ~~**API schema unknown**~~ | ~~High~~ | ~~Medium~~ | ~~Start with GET /campaigns to understand response format~~ | ✅ **RESOLVED** - OpenAPI spec analyzed |
| **Authentication changes** | Medium | Low | Currently no auth, monitor for changes | ⚠️ Active |
| **Rate limiting** | Medium | High | Implement circuit breaker and exponential backoff from day 1 | ⚠️ Active (limits unknown) |
| **Network instability** | Medium | Low | Add timeout and retry logic | ⚠️ Active |
| **Breaking API changes** | High | Low | Version API endpoints, add health checks | ⚠️ Active |
| **Batch job timeout/orphan** | High | Medium | Save job IDs, implement recovery process, add monitoring | 🆕 **NEW RISK** |
| **Data loss in bulk ops** | High | Medium | Add reconciliation, audit logging, and retry logic | 🆕 **NEW RISK** |

---

## 12. Timeline

| Phase | Duration | Status |
|-------|----------|--------|
| **Planning & PRD** | 1 hour | ✅ Complete |
| **API Validation** | 2 hours | ✅ Complete (OpenAPI spec analyzed) |
| **Phase 1: Config & Types** | 2-3 hours | 🔲 Not Started |
| **Phase 2: Core Campaign Service** | 2-3 hours | 🔲 Not Started |
| **Phase 2B: Ad Structure** | 3-4 hours | 🔲 Not Started |
| **Phase 2C: Batch Job Service** | 3-4 hours | 🔲 Not Started (reduced from 4-5 hrs) |
| **Phase 3: Integration** | 30 min | 🔲 Not Started |
| **Phase 4: Testing** | 3-4 hours | 🔲 Not Started |
| **Total** | ~15-20 hours | 🔲 Not Started |

**Target Completion**: 2-3 days for full implementation

**Note**: Time reduced from original estimate due to simpler API structure than expected.

---

## 13. Open Questions

1. ~~**What is the exact request/response schema for Marin Dispatcher?**~~ ✅ **RESOLVED**
   - ~~Action: Call GET /campaigns to inspect response format~~
   - **Resolution**: Full OpenAPI 3.0 spec available at `/api-docs.json`
   - **Status**: Complete - PRD updated with actual schemas

2. ~~**Does Marin require authentication headers in production?**~~ ✅ **RESOLVED**
   - ~~Action: Test with/without auth headers~~
   - **Resolution**: No authentication required (internal network)
   - **Status**: Confirmed in API documentation

3. **What are the rate limits for Marin API?** ⚠️ **PENDING**
   - Action: Check with Marin team or test in production
   - Owner: Engineering
   - Status: Not documented in OpenAPI spec
   - **Mitigation**: Implement circuit breaker and exponential backoff from day 1

4. **Should we deprecate direct platform integrations?** 💡 **FUTURE**
   - Action: Discuss with Product team after Marin integration is stable
   - Owner: Product
   - Status: Future consideration (not blocking)

---

## 14. Next Steps

1. ✅ **Review and approve this PRD** (v1.1 with actual API schemas)
2. ✅ **Validated dispatcher API documentation** - OpenAPI spec retrieved and analyzed
   - ✅ All endpoints exist and are documented
   - ✅ Request/response schemas verified
   - ✅ Batch job workflow confirmed
   - 🔲 **Remaining**: Test actual API calls with curl/Postman
3. 🔲 **Begin Phase 1 implementation** (Config & Types)
   - Add environment variables
   - Create type definitions including batch job types
4. 🔲 **Implement Phase 2** (Core Campaign Service)
   - 8 required IPlatformAPI methods
5. 🔲 **Implement Phase 2B** (Ad Structure)
   - Ad groups, ads, keywords methods
6. 🔲 **Implement Phase 2C** (Batch Job Service)
   - Bulk operations with polling
7. 🔲 **Phase 3: Integration**
   - Wire up services to existing infrastructure
8. 🔲 **Phase 4: Testing**
   - Unit tests, integration tests, bulk operation tests
9. 🔲 **Deploy to staging** environment
10. 🔲 **Production rollout** with monitoring

---

## 15. References

### Code References
- Interface: `backend/src/services/platformApiService.ts:13-48`
- Reference Implementation: `backend/src/services/googleAdsService.ts:18-357`
- Orchestrator: `backend/src/services/campaignCreationService.ts:1-270`
- Types: `backend/src/types/campaign.types.ts:1-122`

### API Documentation
- Marin Dispatcher Endpoint: `http://pubgateway-dispatcher-alb-856277585.us-east-1.elb.amazonaws.com/api/v2/dispatcher/google/campaigns`
- Test Account ID: `5533110357`
- Publisher: `google`

### External Resources
- Google Ads API v22 Reference (for data model comparison)
- Axios Documentation (HTTP client)
- TypeScript Best Practices

---

## Appendix A: IPlatformAPI Interface

```typescript
export interface IPlatformAPI {
  createCampaign(campaignPlan: CampaignPlan, name: string): Promise<PlatformAPIResponse>;
  updateCampaign(campaignId: string, updates: Partial<CampaignPlan>): Promise<PlatformAPIResponse>;
  pauseCampaign(campaignId: string): Promise<PlatformAPIResponse>;
  resumeCampaign(campaignId: string): Promise<PlatformAPIResponse>;
  deleteCampaign(campaignId: string): Promise<PlatformAPIResponse>;
  getCampaignStatus(campaignId: string): Promise<PlatformAPIResponse>;
  isAuthenticated(): Promise<boolean>;
}
```

---

## Appendix B: Project File Structure

```
backend/src/
├── services/
│   ├── platformApiService.ts          # Interface definition
│   ├── googleAdsService.ts            # Reference implementation
│   ├── marinDispatcherService.ts      # 🆕 NEW FILE (campaign + ad structure methods)
│   ├── marinBatchJobService.ts        # 🆕 NEW FILE (bulk operations)
│   └── campaignCreationService.ts     # Orchestrator (modified)
├── types/
│   ├── campaign.types.ts              # Modified (+1 line: marin?)
│   └── marinDispatcher.types.ts       # 🆕 NEW FILE (all types including batch jobs)
├── config/
│   └── env.ts                         # Modified (+10 lines)
└── routes/
    └── campaigns.ts                   # May need bulk endpoint addition
```

**Summary of Changes:**
- **3 new files** (~950-1200 LOC total)
- **3 modified files** (~15 lines total)
- **Total effort**: 14-18 hours

---

## 16. Implementation Priorities

Based on the updated PRD with actual API schemas, here are the key priorities:

### Must-Have (Blocking)
1. **Correct Schema Implementation**
   - Use `budget.amount` not `campaign_budget.amount_micros`
   - Use camelCase field names throughout
   - Use simplified batch operation structure
   - Check `status === "DONE"` not `done` field

2. **Data Integrity Layer**
   - Generate request IDs for all operations
   - Log all requests/responses for audit trail
   - Implement reconciliation for batch jobs using `summary` object
   - Add retry logic for failed operations

3. **Error Handling**
   - Circuit breaker for rate limiting
   - Exponential backoff for retries
   - Proper timeout handling for batch jobs
   - Save orphaned batch job IDs for recovery

### Should-Have (Recommended)
1. **Monitoring & Alerting**
   - Track API latency metrics
   - Alert on batch job timeouts
   - Alert on data discrepancies (expected vs actual)
   - Track failure rates

2. **Testing**
   - Unit tests for all service methods
   - Integration tests with actual API
   - Batch job tests (success, failure, timeout scenarios)
   - Edge case tests (>1000 operations, partial failures)

### Nice-to-Have (Future)
1. **Performance Optimizations**
   - Batch job progress UI/notifications
   - Webhook support (if Marin adds it)
   - Parallel batch job execution
   - Caching for frequently accessed data

2. **Developer Experience**
   - Comprehensive JSDoc comments
   - Example scripts for common operations
   - Postman collection with working examples
   - Developer troubleshooting guide

### What NOT to Do
❌ **Don't** convert budget amounts to micros
❌ **Don't** use snake_case field names
❌ **Don't** use Google Ads style nested operation structure
❌ **Don't** check `done` field for batch job completion
❌ **Don't** skip data integrity layer "for now"
❌ **Don't** assume operations succeeded without reconciliation

---

**End of PRD v1.1**