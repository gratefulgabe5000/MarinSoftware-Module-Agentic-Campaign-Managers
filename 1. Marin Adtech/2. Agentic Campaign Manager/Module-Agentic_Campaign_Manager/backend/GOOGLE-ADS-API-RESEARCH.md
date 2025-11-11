# Google Ads API Research - Budget & Objective Fields

**Date**: 2025-11-10  
**Purpose**: Deep research on Google Ads API format requirements, specifically budget validation and objective field usage

---

## 🔍 Key Findings

### 1. Budget Format: Direct Google Ads API vs. Marin Dispatcher API

#### Direct Google Ads API (v22)
- **Format**: Requires `amount_micros` field
- **Unit**: Micro-units (1,000,000 micros = 1 currency unit)
- **Example**: $100.00 = `amount_micros: 100000000`
- **Field Name**: `campaign_budget.amount_micros`
- **Documentation**: [Google Ads API Campaign Budget](https://developers.google.com/google-ads/api/fields/v22/campaign_budget)

#### Marin Dispatcher API (Wrapper Layer)
- **Format**: Uses `amount` field in dollars
- **Unit**: Dollars (NOT micros)
- **Example**: $100.00 = `amount: 100`
- **Field Name**: `budget.amount`
- **Documentation**: PRD states "No currency conversion needed - amount is in dollars, not micros"

**Conclusion**: ✅ **Our implementation is CORRECT** - Marin Dispatcher API abstracts away the micros conversion.

---

## 2. Objective Field Analysis

### Google Ads API - No "Objective" Field

The Google Ads API does **NOT** have an `objective` field. Instead, it uses:

1. **`advertising_channel_type`**: 
   - Values: `SEARCH`, `DISPLAY`, `SHOPPING`, `VIDEO`, `MULTI_CHANNEL`, `HOTEL`, `PERFORMANCE_MAX`, `LOCAL`, `SMART`
   - Determines the advertising channel

2. **`campaign_type`**: 
   - Values: `SEARCH`, `DISPLAY`, `SHOPPING`, `VIDEO`, `MULTI_CHANNEL`, `HOTEL`, `PERFORMANCE_MAX`, `LOCAL`, `SMART`
   - Determines the campaign type

3. **`bidding_strategy_type`**: 
   - Values: `MANUAL_CPC`, `MAXIMIZE_CONVERSIONS`, `MAXIMIZE_CONVERSION_VALUE`, `TARGET_CPA`, `TARGET_ROAS`, `TARGET_SPEND`, `TARGET_IMPRESSION_SHARE`, etc.
   - Determines the bidding strategy

### Meta Ads API - Uses "Objective" Field

Meta Ads API **DOES** use an `objective` field:
- Values: `OUTCOME_TRAFFIC`, `OUTCOME_ENGAGEMENT`, `OUTCOME_LEADS`, `OUTCOME_APP_PROMOTION`, `OUTCOME_SALES`, `OUTCOME_AWARENESS`, `OUTCOME_VIDEO_VIEWS`, etc.

### Marin Dispatcher API

According to our type definitions:
```typescript
export interface MarinCampaignRequest {
  // ... other fields
  /** Campaign objective - primarily used for Meta campaigns */
  objective?: string;  // Optional field
}
```

**Conclusion**: ✅ **Removing objective field was CORRECT** for Google Ads campaigns. The field is optional and primarily for Meta campaigns.

---

## 3. Budget Validation Error Analysis

### Current Error
```json
{
  "error": "Validation Error",
  "message": "Request validation failed for CreateCampaignRequest",
  "validationErrors": [
    {
      "field": "budget",
      "constraint": "Validation failed",
      "value": {
        "amount": 100,
        "deliveryMethod": "STANDARD"
      }
    }
  ]
}
```

### Possible Causes

#### A. Minimum Budget Requirement
- **Google Ads API**: Minimum daily budget varies by currency
  - USD: Typically $1.00 per day minimum
  - Some accounts may require higher minimums
- **Marin Dispatcher**: May enforce its own minimums
- **Our Test**: Using $100, which should be well above minimum

#### B. Budget Structure Issues
The API might expect:
1. **Separate Budget Resource**: Google Ads API requires creating a `CampaignBudget` resource first, then referencing it
2. **Budget ID Reference**: Campaign might need `campaign_budget` field with budget resource ID
3. **Budget Type**: Might need `budget_type` field (e.g., `DAILY`, `TOTAL`)

#### C. Missing Required Fields
The API might require additional fields:
1. **`advertising_channel_type`**: Required by Google Ads API
2. **`campaign_type`**: Required by Google Ads API
3. **`start_date`**: Required by Google Ads API
4. **`end_date`**: Optional but might be required
5. **`network_settings`**: Required by Google Ads API

#### D. Budget Delivery Method
- **Google Ads API**: Uses `delivery_method` with values: `STANDARD`, `ACCELERATED`
- **Marin Dispatcher**: Uses `deliveryMethod` (camelCase)
- **Our Implementation**: ✅ Using `deliveryMethod: 'STANDARD'` (correct)

---

## 4. Google Ads API Required Fields for Campaign Creation

Based on Google Ads API documentation, creating a campaign requires:

### Required Fields:
1. **`name`**: Campaign name ✅ (we have this)
2. **`advertising_channel_type`**: Advertising channel (SEARCH, DISPLAY, etc.) ⚠️ (we're missing this)
3. **`campaign_budget`**: Reference to CampaignBudget resource ⚠️ (we're sending budget object, not reference)
4. **`start_date`**: Campaign start date ⚠️ (we're missing this)
5. **`status`**: Campaign status ✅ (we have this)

### Optional but Important Fields:
1. **`end_date`**: Campaign end date
2. **`network_settings`**: Network settings (Search Network, Display Network, etc.)
3. **`bidding_strategy_type`**: Bidding strategy type
4. **`target_spend`**: Target spend (if using TARGET_SPEND bidding)

---

## 5. Marin Dispatcher API - Expected Format

Based on PRD and our type definitions:

### Current Request Format:
```json
{
  "accountId": "5533110357",
  "name": "My Campaign",
  "status": "ENABLED",
  "budget": {
    "amount": 100,
    "deliveryMethod": "STANDARD"
  },
  "biddingStrategy": "MANUAL_CPC"
}
```

### PRD Example Format:
```json
{
  "accountId": "5533110357",
  "name": "My Campaign",
  "status": "ENABLED",
  "budget": {
    "amount": 1000,
    "deliveryMethod": "STANDARD"
  },
  "biddingStrategy": "MANUAL_CPC"
}
```

**Note**: PRD example uses $1000, not $100. This might indicate a minimum budget requirement.

---

## 6. Recommendations

### Immediate Actions:

1. **Test with Higher Budget** ($1000):
   ```javascript
   budget: {
     amount: 1000,  // Try PRD example amount
     deliveryMethod: "STANDARD"
   }
   ```

2. **Check for Missing Required Fields**:
   - Contact Marin Dispatcher API team to confirm required fields
   - Verify if `advertising_channel_type` or `campaign_type` is needed
   - Check if `start_date` is required

3. **Verify Budget Structure**:
   - Confirm if budget should be a separate resource (created first, then referenced)
   - Or if inline budget object is correct

4. **Check API Documentation**:
   - Request actual API schema/OpenAPI spec from Marin team
   - Verify validation rules and minimum requirements

### Code Changes (If Needed):

#### If Budget Must Be Separate Resource:
```typescript
// Step 1: Create CampaignBudget
const budgetResponse = await this.httpClient.post(
  this.buildApiPath('/campaign-budgets'),
  {
    accountId: this.accountId,
    amount: budgetAmount,
    deliveryMethod: 'STANDARD'
  }
);

// Step 2: Create Campaign with Budget Reference
const campaignResponse = await this.httpClient.post(
  this.buildApiPath('/campaigns'),
  {
    accountId: this.accountId,
    name,
    status: 'ENABLED',
    campaignBudget: budgetResponse.data.id,  // Reference to budget
    biddingStrategy: 'MANUAL_CPC'
  }
);
```

#### If Additional Fields Required:
```typescript
const request: MarinCampaignRequest = {
  accountId: this.accountId,
  name,
  status: 'ENABLED',
  budget: {
    amount: budgetAmount,
    deliveryMethod: 'STANDARD'
  },
  biddingStrategy: 'MANUAL_CPC',
  // Add if required:
  advertisingChannelType: 'SEARCH',  // If required
  startDate: new Date().toISOString().split('T')[0],  // If required
  // ... other fields
};
```

---

## 7. Summary

### ✅ Confirmed Correct:
1. **Budget Format**: Using dollars (not micros) is correct for Marin Dispatcher API
2. **Objective Field**: Removing it was correct for Google Ads campaigns
3. **API Path**: Using `/api/v2/dispatcher/...` is correct
4. **Field Names**: Using camelCase (`deliveryMethod`) is correct

### ⚠️ Potential Issues:
1. **Budget Amount**: May need to be $1000+ (minimum requirement) - ❌ **Tested with $1000, still fails**
2. **Missing Fields**: ⚠️ **CRITICAL FINDING** - Existing campaign shows `advertisingChannelType: "SEARCH"` field
3. **Budget Structure**: May need to create budget resource separately first
4. **API Validation**: Marin Dispatcher API may have additional validation rules

### 🔴 **CRITICAL FINDING - Missing Required Field**

**Existing Campaign Structure** (from API):
```json
{
  "id": 102800328,
  "name": "US - Paid Search Research Tools",
  "status": "REMOVED",
  "advertisingChannelType": "SEARCH",  // ⚠️ THIS FIELD EXISTS IN RESPONSE
  "biddingStrategyType": "MANUAL_CPC",  // Note: Response uses "biddingStrategyType", not "biddingStrategy"
  "startDate": "2013-01-15",
  "endDate": "2037-12-30"
}
```

**Our Request** (what we're sending):
```json
{
  "accountId": "5533110357",
  "name": "My Campaign",
  "status": "ENABLED",
  "budget": { "amount": 1000, "deliveryMethod": "STANDARD" },
  "biddingStrategy": "MANUAL_CPC"
  // ❌ Missing: advertisingChannelType
}
```

**Conclusion**: The API likely requires `advertisingChannelType` field for campaign creation!

### 🔍 Next Steps:
1. Test with $1000 budget (matching PRD example)
2. Contact Marin Dispatcher API team for:
   - Complete API schema/OpenAPI spec
   - Required fields list
   - Budget validation rules
   - Minimum budget requirements
3. Check existing campaigns in the system to see their structure
4. Review API error logs for more detailed validation messages

---

## 8. References

- [Google Ads API - Campaign Budget](https://developers.google.com/google-ads/api/fields/v22/campaign_budget)
- [Google Ads API - Campaign](https://developers.google.com/google-ads/api/fields/v22/campaign)
- [Google Ads API - Common Errors](https://developers.google.com/google-ads/api/docs/common-errors)
- PRD: `PRD-Marin-Dispatcher-Integration.md`
- Type Definitions: `backend/src/types/marinDispatcher.types.ts`

---

**Last Updated**: 2025-11-10  
**Status**: Research Complete - Awaiting API Team Clarification

