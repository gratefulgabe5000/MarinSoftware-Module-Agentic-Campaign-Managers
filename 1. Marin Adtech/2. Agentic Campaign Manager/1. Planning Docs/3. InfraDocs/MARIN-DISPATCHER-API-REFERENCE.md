# Marin Dispatcher API - Complete Reference

**Document Version**: 1.0  
**Created**: 2025-11-11  
**Purpose**: Complete reference of all Marin Dispatcher API operations and their responses

---

## Overview

**Yes, the Marin Dispatcher calls the Google Ads API on your behalf.** The Dispatcher acts as a proxy/gateway that:
- Handles rate limiting (via Redis)
- Manages OAuth tokens and refresh
- Provides connection pooling
- Implements circuit breaker patterns
- Abstracts away Google Ads API complexity (e.g., micros conversion)

**Flow**: `Your Module → Marin Dispatcher → Google Ads API → Marin Dispatcher → Your Module`

---

## API Base Information

- **Base URL**: `http://meridian-dispatcher-alb-{env}-{id}.us-east-1.elb.amazonaws.com` (from `DISPATCHER_URL` env var)
- **API Path Format**: `/dispatcher/${publisher}/...` (InfraDocs pattern)
- **Publisher**: `google` (for Google Ads)
- **Account ID**: `5533110357` (default)
- **Authentication**: None required (internal VPC network)
- **Protocol**: HTTP/REST
- **Data Format**: JSON

---

## Complete API Operations List

### 1. Campaign Operations

#### 1.1 Create Campaign
**Endpoint**: `POST /dispatcher/google/campaigns`  
**Google Ads API**: `POST /v22/customers/{CUSTOMER_ID}/campaigns:mutate`

**Request**:
```json
{
  "accountId": "5533110357",
  "name": "My Campaign",
  "status": "ENABLED",
  "budget": {
    "amount": 1000,          // In dollars, NOT micros
    "deliveryMethod": "STANDARD"  // or "ACCELERATED"
  },
  "biddingStrategy": "MANUAL_CPC",
  "advertisingChannelType": "SEARCH",  // Optional
  "objective": "SIGN_UPS"  // Optional (primarily for Meta)
}
```

**Response** (`MarinCampaignResponse`):
```json
{
  "id": "campaign_123456789",
  "accountId": "5533110357",
  "name": "My Campaign",
  "campaignStatus": "ENABLED",
  "budget": {
    "amount": 1000,
    "deliveryMethod": "STANDARD"
  },
  "biddingStrategy": "MANUAL_CPC",
  "status": "SUCCESS",
  "resourceId": "campaign_123456789",
  "createdAt": "2025-11-11T01:00:00.000Z",
  "updatedAt": "2025-11-11T01:00:00.000Z",
  "errors": [],
  "warnings": []
}
```

---

#### 1.2 Get Campaign (Single)
**Endpoint**: `GET /dispatcher/google/campaigns/{campaignId}`  
**Google Ads API**: `POST /v22/customers/{CUSTOMER_ID}/googleAds:searchStream`

**Request**: None (campaignId in URL path)

**Response** (`MarinCampaignResponse`):
```json
{
  "id": "campaign_123456789",
  "accountId": "5533110357",
  "name": "My Campaign",
  "campaignStatus": "ENABLED",
  "budget": {
    "amount": 1000,
    "deliveryMethod": "STANDARD"
  },
  "biddingStrategy": "MANUAL_CPC",
  "status": "SUCCESS",
  "createdAt": "2025-11-11T01:00:00.000Z",
  "updatedAt": "2025-11-11T01:00:00.000Z"
}
```

---

#### 1.3 List Campaigns
**Endpoint**: `GET /dispatcher/google/campaigns?accountId={id}&limit={limit}&offset={offset}`  
**Google Ads API**: `POST /v22/customers/{CUSTOMER_ID}/googleAds:searchStream`

**Request**: Query parameters
- `accountId` (required): Account ID
- `limit` (optional): Max results (default: 100)
- `offset` (optional): Pagination offset

**Response** (`MarinCampaignListResponse`):
```json
{
  "campaigns": [
    {
      "id": "campaign_123456789",
      "accountId": "5533110357",
      "name": "Campaign 1",
      "campaignStatus": "ENABLED",
      "budget": { "amount": 1000, "deliveryMethod": "STANDARD" },
      "biddingStrategy": "MANUAL_CPC"
    },
    {
      "id": "campaign_987654321",
      "accountId": "5533110357",
      "name": "Campaign 2",
      "campaignStatus": "PAUSED",
      "budget": { "amount": 2000, "deliveryMethod": "ACCELERATED" },
      "biddingStrategy": "MAXIMIZE_CONVERSIONS"
    }
  ],
  "total": 2,
  "limit": 100,
  "offset": 0
}
```

---

#### 1.4 Update Campaign
**Endpoint**: `PUT /dispatcher/google/campaigns/{campaignId}`  
**Google Ads API**: `POST /v22/customers/{CUSTOMER_ID}/campaigns:mutate`

**Request** (`MarinCampaignUpdateRequest` - all fields optional):
```json
{
  "name": "Updated Campaign Name",
  "status": "PAUSED",
  "budget": {
    "amount": 1500,
    "deliveryMethod": "ACCELERATED"
  },
  "biddingStrategy": "MAXIMIZE_CONVERSIONS"
}
```

**Response** (`MarinCampaignResponse`):
```json
{
  "id": "campaign_123456789",
  "accountId": "5533110357",
  "name": "Updated Campaign Name",
  "campaignStatus": "PAUSED",
  "budget": {
    "amount": 1500,
    "deliveryMethod": "ACCELERATED"
  },
  "biddingStrategy": "MAXIMIZE_CONVERSIONS",
  "status": "SUCCESS",
  "updatedAt": "2025-11-11T02:00:00.000Z"
}
```

**Note**: Pause/Resume/Delete operations use this endpoint with status updates:
- **Pause**: `{ "status": "PAUSED" }`
- **Resume**: `{ "status": "ENABLED" }`
- **Delete**: `{ "status": "REMOVED" }`

---

### 2. Ad Group Operations

#### 2.1 Create Ad Group
**Endpoint**: `POST /dispatcher/google/adgroups`  
**Google Ads API**: `POST /v22/customers/{CUSTOMER_ID}/adGroups:mutate`

**Request** (`MarinAdGroupRequest`):
```json
{
  "accountId": "5533110357",
  "campaignId": "campaign_123456789",
  "name": "Ad Group 1",
  "status": "ENABLED",
  "cpcBid": 2.50,  // Optional, in dollars
  "cpmBid": 5.00   // Optional, in dollars
}
```

**Response** (`MarinAdGroupResponse`):
```json
{
  "id": "adgroup_987654321",
  "accountId": "5533110357",
  "campaignId": "campaign_123456789",
  "name": "Ad Group 1",
  "adGroupStatus": "ENABLED",
  "cpcBid": 2.50,
  "status": "SUCCESS",
  "resourceId": "adgroup_987654321",
  "errors": [],
  "warnings": []
}
```

---

#### 2.2 Update Ad Group
**Endpoint**: `PUT /dispatcher/google/adgroups/{adGroupId}`  
**Google Ads API**: `POST /v22/customers/{CUSTOMER_ID}/adGroups:mutate`

**Request** (`MarinAdGroupUpdateRequest` - all fields optional):
```json
{
  "name": "Updated Ad Group Name",
  "status": "PAUSED",
  "cpcBid": 3.00
}
```

**Response** (`MarinAdGroupResponse`):
```json
{
  "id": "adgroup_987654321",
  "accountId": "5533110357",
  "campaignId": "campaign_123456789",
  "name": "Updated Ad Group Name",
  "adGroupStatus": "PAUSED",
  "cpcBid": 3.00,
  "status": "SUCCESS"
}
```

---

### 3. Ad Operations

#### 3.1 Create Ad (Responsive Search Ad)
**Endpoint**: `POST /dispatcher/google/ads`  
**Google Ads API**: `POST /v22/customers/{CUSTOMER_ID}/adGroupAds:mutate`

**Request** (`MarinAdRequest`):
```json
{
  "accountId": "5533110357",
  "adGroupId": "adgroup_987654321",
  "type": "RESPONSIVE_SEARCH_AD",
  "headlines": [
    { "text": "Headline 1", "pinned": false },
    { "text": "Headline 2", "pinned": false },
    { "text": "Headline 3", "pinned": true }  // Pinned to position 1
  ],
  "descriptions": [
    { "text": "Description 1" },
    { "text": "Description 2" }
  ],
  "finalUrl": "https://example.com/product",
  "displayUrl": "example.com",  // Optional
  "paths": ["product", "sale"]   // Optional URL paths
}
```

**Validation Rules**:
- Headlines: Min 3, Max 15, each max 30 characters
- Descriptions: Min 2, Max 4, each max 90 characters
- finalUrl: Must be valid URL

**Response** (`MarinAdResponse`):
```json
{
  "id": "ad_456789123",
  "accountId": "5533110357",
  "adGroupId": "adgroup_987654321",
  "type": "RESPONSIVE_SEARCH_AD",
  "headlines": [
    { "text": "Headline 1", "pinned": false },
    { "text": "Headline 2", "pinned": false },
    { "text": "Headline 3", "pinned": true }
  ],
  "descriptions": [
    { "text": "Description 1" },
    { "text": "Description 2" }
  ],
  "finalUrl": "https://example.com/product",
  "displayUrl": "example.com",
  "paths": ["product", "sale"],
  "status": "SUCCESS",
  "resourceId": "ad_456789123"
}
```

---

#### 3.2 Update Ad
**Endpoint**: `PUT /dispatcher/google/ads/{adId}`  
**Google Ads API**: `POST /v22/customers/{CUSTOMER_ID}/adGroupAds:mutate`

**Request** (`MarinAdUpdateRequest` - all fields optional):
```json
{
  "headlines": [
    { "text": "New Headline 1", "pinned": false },
    { "text": "New Headline 2", "pinned": false }
  ],
  "descriptions": [
    { "text": "New Description 1" }
  ],
  "finalUrl": "https://example.com/updated"
}
```

**Response** (`MarinAdResponse`):
```json
{
  "id": "ad_456789123",
  "accountId": "5533110357",
  "adGroupId": "adgroup_987654321",
  "type": "RESPONSIVE_SEARCH_AD",
  "headlines": [
    { "text": "New Headline 1", "pinned": false },
    { "text": "New Headline 2", "pinned": false }
  ],
  "descriptions": [
    { "text": "New Description 1" }
  ],
  "finalUrl": "https://example.com/updated",
  "status": "SUCCESS"
}
```

---

### 4. Keyword Operations

#### 4.1 Create Keywords (Bulk)
**Endpoint**: `POST /dispatcher/google/keywords`  
**Google Ads API**: `POST /v22/customers/{CUSTOMER_ID}/adGroupCriteria:mutate`

**Request** (`MarinBulkKeywordRequest`):
```json
{
  "accountId": "5533110357",
  "adGroupId": "adgroup_987654321",
  "keywords": [
    {
      "accountId": "5533110357",
      "adGroupId": "adgroup_987654321",
      "text": "running shoes",
      "matchType": "BROAD",
      "cpcBid": 1.50,
      "status": "ENABLED"
    },
    {
      "accountId": "5533110357",
      "adGroupId": "adgroup_987654321",
      "text": "athletic footwear",
      "matchType": "PHRASE",
      "cpcBid": 2.00,
      "status": "ENABLED"
    }
  ]
}
```

**Validation Rules**:
- Keyword text: Max 80 characters
- Match types: `BROAD`, `PHRASE`, or `EXACT`

**Response**:
```json
{
  "keywords": [
    {
      "id": "keyword_111222333",
      "accountId": "5533110357",
      "adGroupId": "adgroup_987654321",
      "text": "running shoes",
      "matchType": "BROAD",
      "cpcBid": 1.50,
      "keywordStatus": "ENABLED",
      "status": "SUCCESS",
      "resourceId": "keyword_111222333"
    },
    {
      "id": "keyword_444555666",
      "accountId": "5533110357",
      "adGroupId": "adgroup_987654321",
      "text": "athletic footwear",
      "matchType": "PHRASE",
      "cpcBid": 2.00,
      "keywordStatus": "ENABLED",
      "status": "SUCCESS",
      "resourceId": "keyword_444555666"
    }
  ],
  "status": "SUCCESS"
}
```

---

#### 4.2 Update Keyword
**Endpoint**: `PUT /dispatcher/google/keywords/{keywordId}`  
**Google Ads API**: `POST /v22/customers/{CUSTOMER_ID}/adGroupCriteria:mutate`

**Request** (`MarinKeywordUpdateRequest` - all fields optional):
```json
{
  "text": "updated keyword text",
  "matchType": "EXACT",
  "cpcBid": 3.00,
  "status": "PAUSED"
}
```

**Response** (`MarinKeywordResponse`):
```json
{
  "id": "keyword_111222333",
  "accountId": "5533110357",
  "adGroupId": "adgroup_987654321",
  "text": "updated keyword text",
  "matchType": "EXACT",
  "cpcBid": 3.00,
  "keywordStatus": "PAUSED",
  "status": "SUCCESS"
}
```

---

### 5. Batch Job Operations (Bulk Create)

#### 5.1 Create Batch Job
**Endpoint**: `POST /dispatcher/google/batch-jobs`  
**Google Ads API**: `POST /v22/customers/{CUSTOMER_ID}/batchJobs:mutate`

**Request**:
```json
{
  "accountId": "5533110357"
}
```

**Response** (`BatchJobCreateResponse`):
```json
{
  "batchJobId": "batch-12345",
  "status": "PENDING"
}
```

---

#### 5.2 Add Operations to Batch Job
**Endpoint**: `POST /dispatcher/google/batch-jobs/{batchJobId}/operations`  
**Google Ads API**: `POST /v22/customers/{CUSTOMER_ID}/batchJobs/{BATCH_JOB_ID}:addOperations`

**Request** (`AddOperationsRequest`):
```json
{
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
  ],
  "sequenceToken": "token-abc123"  // Optional, for >1000 operations
}
```

**Limits**:
- Max 1,000 operations per request
- For >1,000 operations, use `sequenceToken` from previous response

**Response** (`AddOperationsResponse`):
```json
{
  "nextSequenceToken": "token-xyz789",  // Present if more operations can be added
  "totalOperations": 1000,              // Total operations in batch job so far
  "status": "SUCCESS"
}
```

---

#### 5.3 Run Batch Job
**Endpoint**: `POST /dispatcher/google/batch-jobs/{batchJobId}/run`  
**Google Ads API**: `POST /v22/customers/{CUSTOMER_ID}/batchJobs/{BATCH_JOB_ID}:run`

**Request**: None (batchJobId in URL path)

**Response**: HTTP 200 (no body) or error

---

#### 5.4 Poll Batch Job Status
**Endpoint**: `GET /dispatcher/google/batch-jobs/{batchJobId}`  
**Google Ads API**: `GET /v22/{OPERATION_NAME}`

**Request**: None (batchJobId in URL path)

**Response** (`BatchJobStatus`):
```json
{
  "resourceName": "customers/5533110357/batchJobs/batch-12345",
  "id": "batch-12345",
  "status": "RUNNING",  // PENDING | RUNNING | DONE | FAILED | CANCELLED
  "metadata": {
    "progress": 50,              // 0-100 percentage
    "totalOperations": 2,
    "completedOperations": 1
  }
}
```

**Polling Strategy**:
- Poll every 5-10 seconds
- Use exponential backoff (5s, 10s, 15s, max 30s)
- Check `status === "DONE"` (NOT `done` field)
- Max attempts: 120 (10 minutes at 5s intervals)

**When Complete**:
```json
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

---

#### 5.5 Get Batch Job Results
**Endpoint**: `GET /dispatcher/google/batch-jobs/{batchJobId}/results?limit={limit}&pageToken={token}`  
**Google Ads API**: `GET /v22/customers/{CUSTOMER_ID}/batchJobs/{BATCH_JOB_ID}:listResults`

**Request**: Query parameters
- `limit` (optional): Max results per page (default: 1000)
- `pageToken` (optional): For pagination if >1000 results

**Response** (`BulkCreateResponse`):
```json
{
  "summary": {
    "total": 2,
    "succeeded": 1,
    "failed": 1
  },
  "results": [
    {
      "index": 0,  // Operation index (not operationIndex)
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
  "nextPageToken": null  // Present if >1000 results, use for pagination
}
```

**Note**: Results use `index` field (0-based), not `operationIndex`.

---

## Summary Table

| Operation | Method | Endpoint | Google Ads API Equivalent | Response Type |
|-----------|--------|----------|---------------------------|---------------|
| **Create Campaign** | POST | `/dispatcher/google/campaigns` | `campaigns:mutate` | `MarinCampaignResponse` |
| **Get Campaign** | GET | `/dispatcher/google/campaigns/{id}` | `googleAds:searchStream` | `MarinCampaignResponse` |
| **List Campaigns** | GET | `/dispatcher/google/campaigns?accountId={id}` | `googleAds:searchStream` | `MarinCampaignListResponse` |
| **Update Campaign** | PUT | `/dispatcher/google/campaigns/{id}` | `campaigns:mutate` | `MarinCampaignResponse` |
| **Create Ad Group** | POST | `/dispatcher/google/adgroups` | `adGroups:mutate` | `MarinAdGroupResponse` |
| **Update Ad Group** | PUT | `/dispatcher/google/adgroups/{id}` | `adGroups:mutate` | `MarinAdGroupResponse` |
| **Create Ad** | POST | `/dispatcher/google/ads` | `adGroupAds:mutate` | `MarinAdResponse` |
| **Update Ad** | PUT | `/dispatcher/google/ads/{id}` | `adGroupAds:mutate` | `MarinAdResponse` |
| **Create Keywords** | POST | `/dispatcher/google/keywords` | `adGroupCriteria:mutate` | `{ keywords: MarinKeywordResponse[] }` |
| **Update Keyword** | PUT | `/dispatcher/google/keywords/{id}` | `adGroupCriteria:mutate` | `MarinKeywordResponse` |
| **Create Batch Job** | POST | `/dispatcher/google/batch-jobs` | `batchJobs:mutate` | `BatchJobCreateResponse` |
| **Add Operations** | POST | `/dispatcher/google/batch-jobs/{id}/operations` | `batchJobs:addOperations` | `AddOperationsResponse` |
| **Run Batch Job** | POST | `/dispatcher/google/batch-jobs/{id}/run` | `batchJobs:run` | HTTP 200 |
| **Poll Job Status** | GET | `/dispatcher/google/batch-jobs/{id}` | `{OPERATION_NAME}` | `BatchJobStatus` |
| **Get Results** | GET | `/dispatcher/google/batch-jobs/{id}/results` | `batchJobs:listResults` | `BulkCreateResponse` |

---

## Common Response Fields

### Base Response (`MarinBaseResponse`)
All responses include:
- `status`: `"SUCCESS"` | `"FAILURE"`
- `resourceId?`: Created/updated resource ID
- `errors?`: Array of error messages
- `warnings?`: Array of warning messages

### Error Response Format
```json
{
  "status": "FAILURE",
  "errors": [
    "Invalid campaign budget: amount must be positive",
    "Campaign name exceeds 255 characters"
  ],
  "warnings": [
    "Bidding strategy may not be optimal for this campaign type"
  ]
}
```

---

## Important Notes

### Budget Handling
- ⚠️ **CRITICAL**: Budget amounts are in **dollars**, NOT micros
- Google Ads API uses micros (1,000,000 micros = $1.00)
- Marin Dispatcher handles conversion automatically
- Example: $100.00 = `amount: 100` (NOT `amount_micros: 100000000`)

### Status Values
- Campaign/Ad Group/Keyword status: `ENABLED` | `PAUSED` | `REMOVED`
- Batch job status: `PENDING` | `RUNNING` | `DONE` | `FAILED` | `CANCELLED`
- Check `status === "DONE"` for batch jobs (NOT `done` field)

### Batch Job Limits
- Max 1,000 operations per `addOperations` request
- Use `sequenceToken` for >1,000 operations
- Poll every 5-10 seconds with exponential backoff
- Typical completion: 30-60 seconds for 100 campaigns

### Validation Rules
- Campaign name: Max 255 characters
- Keyword text: Max 80 characters
- Headlines: Min 3, Max 15, each max 30 characters
- Descriptions: Min 2, Max 4, each max 90 characters
- Match types: `BROAD` | `PHRASE` | `EXACT`

### API Path Format
- **InfraDocs Pattern**: `/dispatcher/${publisher}/...`
- **PRD Shows**: `/api/v2/dispatcher/${publisher}/...`
- **Use**: InfraDocs format (source of truth) - verify with actual API

---

## Environment Variables

- `DISPATCHER_URL`: Set by CloudFormation (from `MeridianDispatcherUrl-${Environment}`)
- `MARIN_DISPATCHER_BASE_URL`: Fallback for local development
- `MARIN_DISPATCHER_ACCOUNT_ID`: Default account ID
- `MARIN_DISPATCHER_PUBLISHER`: Default publisher (usually `google`)

---

**Last Updated**: 2025-11-11  
**Source**: PRD-Marin-Dispatcher-Integration.md, marinDispatcher.types.ts, InfraDocs

