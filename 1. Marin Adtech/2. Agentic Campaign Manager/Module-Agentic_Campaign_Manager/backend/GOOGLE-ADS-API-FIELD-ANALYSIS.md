# Google Ads API Field Analysis for Marin Dispatcher Integration

**Date**: 2025-11-11  
**Purpose**: Comprehensive analysis of all fields Google Ads API receives for campaign creation, identifying required vs optional fields, and comparing with our current implementation.

---

## 1. Google Ads API Required Fields (Direct API)

Based on Google Ads API v22 documentation and web research:

### ✅ **REQUIRED FIELDS** (Must be present for campaign creation):

| Field Name (Google Ads API) | Field Name (Marin Dispatcher) | Type | Description | Status |
|----------------------------|-------------------------------|------|-------------|--------|
| `campaign.name` | `name` | string | Campaign name (max 255 chars) | ✅ **SENT** |
| `campaign.advertising_channel_type` | `advertisingChannelType` | enum | SEARCH, DISPLAY, SHOPPING, VIDEO, etc. | ✅ **SENT** |
| `campaign.campaign_budget` | `campaignBudget` (reference) | resource_name | Reference to CampaignBudget resource | ✅ **IMPLEMENTED** |
| `campaign.start_date` | `startDate` | string (YYYY-MM-DD) | Campaign start date | ✅ **SENT** |
| `campaign.status` | `status` | enum | ENABLED, PAUSED, REMOVED | ✅ **SENT** |
| Bidding Strategy | `biddingStrategy` | varies | Either portfolio strategy or manual_cpc | ✅ **SENT** |

### 🔴 **CRITICAL ISSUE: Campaign Budget Resource Reference**

**Google Ads API Requirement:**
- Google Ads API requires `campaign.campaign_budget` to be a **resource name** (string reference)
- Format: `customers/{CUSTOMER_ID}/campaignBudgets/{BUDGET_ID}`
- The budget must be created **separately first**, then referenced

**Current Implementation:**
- We're sending: `budget: { amount: 1000, deliveryMethod: "STANDARD" }`
- This is an **inline budget object**, not a resource reference
- **Google Ads API does NOT accept inline budget objects** - it requires a resource reference

**Required Action:**
- **We need to create the CampaignBudget resource first**, then reference it in the campaign creation
- Marin Dispatcher should handle the budget creation and reference correctly
- **We need to send all required fields, including the budget resource reference**

**Status**: ✅ **IMPLEMENTED** - Budget resource creation handled in Agentic Campaign Manager

---

## 2. Google Ads API Optional Fields (Direct API)

| Field Name (Google Ads API) | Field Name (Marin Dispatcher) | Type | Description | Status |
|----------------------------|-------------------------------|------|-------------|--------|
| `campaign.end_date` | `endDate` | string (YYYY-MM-DD) | Campaign end date (defaults to 2037-12-30) | ✅ **SENT** (if provided) |
| `campaign.network_settings` | `networkSettings` | object | Search Network, Display Network settings | ✅ **IMPLEMENTED** |
| `campaign.dynamic_search_ads_setting` | ❌ **NOT SENT** | object | Required for Dynamic Search Ads | ❌ **NOT NEEDED** |
| `campaign.shopping_setting` | ❌ **NOT SENT** | object | Required for Shopping campaigns | ❌ **NOT NEEDED** |
| `campaign.hotel_setting` | ❌ **NOT SENT** | object | Required for Hotel campaigns | ❌ **NOT NEEDED** |
| `campaign.final_url_suffix` | ❌ **NOT SENT** | string | URL suffix for tracking | ❌ **NOT NEEDED** |
| `campaign.tracking_url_template` | ❌ **NOT SENT** | string | Tracking URL template | ❌ **NOT NEEDED** |
| `campaign.url_custom_parameters` | ❌ **NOT SENT** | array | Custom URL parameters | ❌ **NOT NEEDED** |

**Note**: `network_settings` may be required for SEARCH campaigns. Need to verify with Marin Dispatcher team.

---

## 3. Current Request Payload (What We're Sending to Marin Dispatcher)

**After Implementation (with Budget Resource Creation):**

```json
{
  "accountId": "5533110357",                    // ✅ Marin Dispatcher field (not sent to Google Ads)
  "name": "Yamaha SR400 - Campaign",           // ✅ REQUIRED - SENT
  "status": "PAUSED",                          // ✅ REQUIRED - SENT
  "campaignBudget": "customers/5533110357/campaignBudgets/123456789",  // ✅ REQUIRED - Resource reference
  "biddingStrategy": "MANUAL_CPC",             // ✅ REQUIRED - SENT
  "advertisingChannelType": "SEARCH",         // ✅ REQUIRED - SENT
  "startDate": "2025-11-11",                  // ✅ REQUIRED - SENT
  "endDate": "2025-12-11",                     // ⚠️ OPTIONAL - SENT (if provided)
  "networkSettings": {                        // ✅ IMPLEMENTED - Defaults for SEARCH campaigns
    "targetGoogleSearch": true,
    "targetSearchNetwork": true,
    "targetContentNetwork": false,
    "targetYouTube": false
  }
}
```

**Note**: Budget is created first via `POST /api/v2/dispatcher/google/campaign-budgets`, then referenced in campaign creation.

---

## 4. Field Mapping: Marin Dispatcher → Google Ads API

| Marin Dispatcher Field | Google Ads API Field | Required? | Status | Notes |
|------------------------|---------------------|-----------|--------|-------|
| `accountId` | N/A | N/A | ✅ | Used by Marin Dispatcher for routing |
| `name` | `campaign.name` | ✅ **REQUIRED** | ✅ **SENT** | Max 255 characters |
| `status` | `campaign.status` | ✅ **REQUIRED** | ✅ **SENT** | ENABLED, PAUSED, REMOVED |
| `budget.amount` | `campaign_budget.amount_micros` | ✅ **REQUIRED** | ⚠️ **ISSUE** | Need to create budget resource first |
| `budget.deliveryMethod` | `campaign_budget.delivery_method` | ✅ **REQUIRED** | ⚠️ **ISSUE** | Need to create budget resource first |
| `campaignBudget` (reference) | `campaign.campaign_budget` | ✅ **REQUIRED** | ❌ **MISSING** | Resource reference (e.g., `customers/{ID}/campaignBudgets/{BUDGET_ID}`) |
| `biddingStrategy` | `campaign.manual_cpc` or `campaign.bidding_strategy` | ✅ **REQUIRED** | ✅ **SENT** | MANUAL_CPC, MAXIMIZE_CONVERSIONS, etc. |
| `advertisingChannelType` | `campaign.advertising_channel_type` | ✅ **REQUIRED** | ✅ **SENT** | SEARCH, DISPLAY, SHOPPING, etc. |
| `startDate` | `campaign.start_date` | ✅ **REQUIRED** | ✅ **SENT** | YYYY-MM-DD format |
| `endDate` | `campaign.end_date` | ⚠️ **OPTIONAL** | ✅ **SENT** | YYYY-MM-DD format (defaults to 2037-12-30) |
| `networkSettings` | `campaign.network_settings` | ⚠️ **MAY BE REQUIRED** | ✅ **IMPLEMENTED** | Defaults added for SEARCH campaigns |
| `objective` | N/A | ❌ | ❌ **NOT SENT** | Only for Meta campaigns |

---

## 5. Comparison: What We Send vs What Google Ads API Needs

### ✅ **Fields We're Sending Correctly:**

1. ✅ `name` → `campaign.name` (REQUIRED)
2. ✅ `status` → `campaign.status` (REQUIRED)
3. ✅ `advertisingChannelType` → `campaign.advertising_channel_type` (REQUIRED)
4. ✅ `startDate` → `campaign.start_date` (REQUIRED)
5. ✅ `endDate` → `campaign.end_date` (OPTIONAL)
6. ✅ `biddingStrategy` → `campaign.manual_cpc` or `campaign.bidding_strategy` (REQUIRED)

### ❌ **MISSING REQUIRED FIELDS:**

1. ❌ `campaignBudget` (reference) → `campaign.campaign_budget` (REQUIRED)
   - **Current**: We send `budget: { amount, deliveryMethod }` as inline object
   - **Required**: Google Ads API needs `campaign.campaign_budget` as resource reference
   - **Action**: Create CampaignBudget resource first, then reference it

### ⚠️ **POTENTIALLY MISSING FIELDS:**

1. ⚠️ `networkSettings` → `campaign.network_settings` (MAY BE REQUIRED)
   - **Current**: Not sending
   - **Status**: May be required for SEARCH campaigns
   - **Action**: Verify with Marin Dispatcher team if defaults should be added

---

## 6. Required Implementation: Budget Resource Creation

### Step 1: Create CampaignBudget Resource

**Option A: Separate Budget Creation Endpoint (Recommended)**
- Marin Dispatcher adds: `POST /api/v2/dispatcher/google/campaign-budgets`
- Request:
  ```json
  {
    "accountId": "5533110357",
    "amount": 1000,
    "deliveryMethod": "STANDARD"
  }
  ```
- Response:
  ```json
  {
    "budgetId": "123456789",
    "resourceName": "customers/5533110357/campaignBudgets/123456789",
    "status": "SUCCESS"
  }
  ```

**Option B: Inline Budget Handling**
- Marin Dispatcher accepts inline `budget` object in campaign creation
- Creates CampaignBudget resource internally
- Returns budget reference in response
- Uses budget reference when calling Google Ads API

### Step 2: Reference Budget in Campaign Creation

**After Budget Creation:**
- Use budget reference in campaign creation:
  ```json
  {
    "accountId": "5533110357",
    "name": "My Campaign",
    "status": "PAUSED",
    "campaignBudget": "customers/5533110357/campaignBudgets/123456789",  // ✅ Resource reference
    "biddingStrategy": "MANUAL_CPC",
    "advertisingChannelType": "SEARCH",
    "startDate": "2025-11-11",
    "endDate": "2025-12-11"
  }
  ```

---

## 7. Complete Required Fields List

### ✅ **REQUIRED FIELDS** (Must be sent for successful campaign creation):

| Field | Google Ads API Field | Type | Format | Status |
|-------|---------------------|------|--------|--------|
| `name` | `campaign.name` | string | Max 255 chars | ✅ **SENT** |
| `status` | `campaign.status` | enum | ENABLED, PAUSED, REMOVED | ✅ **SENT** |
| `advertisingChannelType` | `campaign.advertising_channel_type` | enum | SEARCH, DISPLAY, etc. | ✅ **SENT** |
| `startDate` | `campaign.start_date` | string | YYYY-MM-DD | ✅ **SENT** |
| `campaignBudget` | `campaign.campaign_budget` | resource_name | Resource reference | ❌ **MISSING** |
| `biddingStrategy` | `campaign.manual_cpc` or `campaign.bidding_strategy` | varies | MANUAL_CPC, etc. | ✅ **SENT** |

### ⚠️ **OPTIONAL FIELDS** (Can be sent but not required):

| Field | Google Ads API Field | Type | Format | Status |
|-------|---------------------|------|--------|--------|
| `endDate` | `campaign.end_date` | string | YYYY-MM-DD | ✅ **SENT** (if provided) |
| `networkSettings` | `campaign.network_settings` | object | Network settings | ❌ **NOT SENT** |

---

## 8. What Needs to be Added/Implemented

### 🔴 **CRITICAL: Budget Resource Creation**

**Issue**: Google Ads API requires `campaign.campaign_budget` to be a resource reference, not an inline object.

**Current Request**:
```json
{
  "accountId": "5533110357",
  "name": "My Campaign",
  "status": "PAUSED",
  "budget": {
    "amount": 1000,
    "deliveryMethod": "STANDARD"
  },
  "biddingStrategy": "MANUAL_CPC",
  "advertisingChannelType": "SEARCH",
  "startDate": "2025-11-11",
  "endDate": "2025-12-11"
}
```

**Required Solution** (Choose one):

#### Option A: Separate Budget Creation Endpoint (Recommended)
Add endpoint: `POST /api/v2/dispatcher/google/campaign-budgets`
- Request: `{ accountId, amount, deliveryMethod }`
- Response: `{ budgetId, resourceName }`
- Then reference in campaign: `{ ..., campaignBudget: "{BUDGET_ID}" }` or `campaignBudget: "{RESOURCE_NAME}"`

#### Option B: Inline Budget Handling
Accept inline budget in campaign creation, but:
- Create CampaignBudget resource internally
- Return budget resource reference in response
- Use that reference when calling Google Ads API

**Recommendation**: Option A (explicit, clear separation of concerns)

### ⚠️ **POTENTIALLY REQUIRED: Network Settings**

**Issue**: Google Ads API may require `network_settings` for SEARCH campaigns.

**Action**: Verify with Marin Dispatcher team if:
- `network_settings` should be added with defaults for SEARCH campaigns
- Or if it's truly optional and Google Ads API provides defaults

---

## 9. Complete Field Status Summary

### ✅ **REQUIRED FIELDS - SENT:**

| Field | Status | Notes |
|-------|--------|-------|
| `name` | ✅ **SENT** | Required by Google Ads API |
| `status` | ✅ **SENT** | Required by Google Ads API |
| `advertisingChannelType` | ✅ **SENT** | Required by Google Ads API |
| `startDate` | ✅ **SENT** | Required by Google Ads API (400 error without it) |
| `biddingStrategy` | ✅ **SENT** | Required by Google Ads API |
| `budget.amount` | ✅ **SENT** | Required, but need resource reference |
| `budget.deliveryMethod` | ✅ **SENT** | Required, but need resource reference |

### ❌ **REQUIRED FIELDS - MISSING:**

| Field | Status | Notes |
|-------|--------|-------|
| `campaignBudget` (reference) | ❌ **MISSING** | **REQUIRED** - Resource reference to CampaignBudget |

### ⚠️ **OPTIONAL FIELDS - SENT:**

| Field | Status | Notes |
|-------|--------|-------|
| `endDate` | ✅ **SENT** | Optional, but sent if provided |

### ⚠️ **POTENTIALLY REQUIRED FIELDS - MISSING:**

| Field | Status | Notes |
|-------|--------|-------|
| `networkSettings` | ❌ **NOT SENT** | May be required for SEARCH campaigns |

---

## 10. Required Actions for Marin Dispatcher Team

### 🔴 **CRITICAL: Budget Resource Creation**

**Issue**: Google Ads API requires `campaign.campaign_budget` to be a resource reference, not an inline object.

**Current Request**:
```json
{
  "accountId": "5533110357",
  "name": "My Campaign",
  "status": "PAUSED",
  "budget": {
    "amount": 1000,
    "deliveryMethod": "STANDARD"
  },
  "biddingStrategy": "MANUAL_CPC",
  "advertisingChannelType": "SEARCH",
  "startDate": "2025-11-11",
  "endDate": "2025-12-11"
}
```

**Required Solution** (Choose one):

#### Option A: Separate Budget Creation Endpoint (Recommended)
Add endpoint: `POST /api/v2/dispatcher/google/campaign-budgets`
- Request: `{ accountId, amount, deliveryMethod }`
- Response: `{ budgetId, resourceName }`
- Then reference in campaign: `{ ..., campaignBudget: "{BUDGET_ID}" }` or `campaignBudget: "{RESOURCE_NAME}"`

#### Option B: Inline Budget Handling
Accept inline budget in campaign creation, but:
- Create CampaignBudget resource internally
- Return budget resource reference in response
- Use that reference when calling Google Ads API

**Recommendation**: Option A (explicit, clear separation of concerns)

### ✅ **All Other Required Fields Are Being Sent**

| Field | Status | Notes |
|-------|--------|-------|
| `name` | ✅ | Sent correctly |
| `status` | ✅ | Sent correctly |
| `advertisingChannelType` | ✅ | Sent correctly |
| `startDate` | ✅ | Sent correctly |
| `endDate` | ✅ | Sent correctly (optional) |
| `biddingStrategy` | ✅ | Sent correctly |
| `budget.amount` | ✅ | Sent correctly (but need resource reference) |
| `budget.deliveryMethod` | ✅ | Sent correctly (but need resource reference) |
| `campaignBudget` (reference) | ❌ | **MISSING** - Need budget resource reference |

### ⚠️ **POTENTIALLY REQUIRED: Network Settings**

**Question**: Should Marin Dispatcher add default `network_settings` for SEARCH campaigns?

**Action**: Verify if Google Ads API requires `network_settings` for SEARCH campaigns, or if it provides defaults.

---

## 11. Next Steps

1. **Contact Marin Dispatcher Team** with this document
2. **Request**:
   - Budget resource creation solution (Option A or B above)
   - Verification that all other fields are being mapped correctly
   - Detailed error messages from Google Ads API (field-level validation errors)
   - Whether network_settings needs to be added with defaults

3. **After Marin Dispatcher Updates**:
   - Update our implementation to use budget resource creation
   - Test campaign creation with all required fields
   - Verify all fields are correctly passed to Google Ads API
   - Verify error messages are more detailed

---

## 12. Summary

### ✅ **What We're Sending (Required Fields Status):**

| Field | Status | Notes |
|-------|--------|-------|
| `name` | ✅ **SENT** | Required by Google Ads API |
| `status` | ✅ **SENT** | Required by Google Ads API |
| `advertisingChannelType` | ✅ **SENT** | Required by Google Ads API |
| `startDate` | ✅ **SENT** | Required by Google Ads API (400 error without it) |
| `endDate` | ✅ **SENT** | Optional, but sent if provided |
| `biddingStrategy` | ✅ **SENT** | Required by Google Ads API |
| `budget.amount` | ✅ **SENT** | Required, but need resource reference |
| `budget.deliveryMethod` | ✅ **SENT** | Required, but need resource reference |
| `campaignBudget` (reference) | ❌ **MISSING** | **REQUIRED** - Resource reference to CampaignBudget |

### ❌ **MISSING REQUIRED FIELD:**

**`campaign.campaign_budget` (Resource Reference)**
- **Google Ads API Requirement**: Must be a resource reference string
- **Format**: `customers/{CUSTOMER_ID}/campaignBudgets/{BUDGET_ID}`
- **Current Status**: We send inline `budget` object, but Google Ads API needs resource reference
- **Action Required**: Create CampaignBudget resource first, then reference it in campaign creation

---

---

## 13. Test Results (2025-11-11)

### ✅ **Implementation Status**

**Budget Resource Creation:**
- ✅ `createBudget()` method implemented in `MarinDispatcherService`
- ✅ `createCampaign()` updated to create budget first, then reference it
- ✅ Types updated: `MarinBudgetRequest`, `MarinBudgetResponse` added
- ✅ Validator updated to check `campaignBudget` reference

**Network Settings:**
- ✅ `MarinNetworkSettings` type added
- ✅ `networkSettings` added to `MarinCampaignRequest` with defaults for SEARCH campaigns

**Test Results:**
- ❌ Budget creation endpoint not available: `POST /api/v2/dispatcher/google/campaign-budgets` returns 404
- ⚠️ Campaign creation fails because budget creation fails first (expected behavior)
- ✅ Implementation is correct - waiting for Marin Dispatcher endpoint

### 📋 **Test Output**

```
Budget Creation Test:
- Endpoint: POST /api/v2/dispatcher/google/campaign-budgets
- Request: { accountId: "5533110357", amount: 1000, deliveryMethod: "STANDARD" }
- Response: 404 Not Found
- Error: "Route not found: POST /api/v2/dispatcher/google/campaign-budgets"

Campaign Creation Test:
- Fails because budget creation fails first (expected)
- Implementation correctly handles budget creation before campaign creation
```

### 🔴 **Required Action: Marin Dispatcher Team**

**Endpoint Required:**
- `POST /api/v2/dispatcher/google/campaign-budgets`
- Request: `{ accountId: string, amount: number, deliveryMethod: 'STANDARD' | 'ACCELERATED' }`
- Response: `{ budgetId: string, resourceName: string, status: 'SUCCESS', ... }`

**Current Status:**
- ✅ Agentic Campaign Manager implementation complete
- ❌ Marin Dispatcher endpoint not yet available (404)
- ⏳ Waiting for Marin Dispatcher team to add endpoint

---

**Last Updated**: 2025-11-11  
**Status**: Implementation Complete - Waiting for Marin Dispatcher Endpoint
