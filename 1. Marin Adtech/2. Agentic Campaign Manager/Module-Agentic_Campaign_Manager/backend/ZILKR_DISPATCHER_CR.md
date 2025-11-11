# Zilkr Dispatcher Change Request: Campaign Budget Endpoint

**Date**: 2025-11-11  
**Requestor**: Agentic Campaign Manager Team  
**Priority**: High  
**Status**: Pending Implementation

---

## Summary

The Agentic Campaign Manager requires a new endpoint to create campaign budgets before creating campaigns. This is a **Google Ads API requirement** - budgets must be created as separate resources and then referenced in campaign creation.

**Current Issue**: Campaign creation fails with `404 Not Found` when attempting to create budgets.

---

## Required Implementation

### ✅ **Task 1: Implement Campaign Budget Creation Endpoint**

**Endpoint**: `POST /api/v2/dispatcher/google/campaign-budgets`

**Request Body**:
```json
{
  "accountId": "5533110357",
  "amount": 1000,
  "deliveryMethod": "STANDARD"
}
```

**Request Fields**:
- `accountId` (string, required): Zilkr account ID
- `amount` (number, required): Budget amount in dollars (NOT micros)
- `deliveryMethod` (string, required): Either `"STANDARD"` or `"ACCELERATED"`

**Expected Response**:
```json
{
  "status": "SUCCESS",
  "budgetId": "123456789",
  "resourceName": "customers/5533110357/campaignBudgets/123456789",
  "resourceId": "123456789",
  "amount": 1000,
  "deliveryMethod": "STANDARD"
}
```

**Response Fields**:
- `status` (string, required): `"SUCCESS"` or `"FAILURE"`
- `budgetId` (string, required): Unique budget ID
- `resourceName` (string, required): Full Google Ads API resource name (format: `customers/{CUSTOMER_ID}/campaignBudgets/{BUDGET_ID}`)
- `resourceId` (string, optional): Alternative ID field
- `amount` (number, required): Budget amount in dollars
- `deliveryMethod` (string, required): Budget delivery method

**Error Response** (if validation fails):
```json
{
  "status": "FAILURE",
  "error": "Validation error message",
  "errors": ["Field-level error messages"]
}
```

---

## Why This Is Required

1. **Google Ads API Requirement**: Google Ads API requires `campaign.campaign_budget` to be a **resource reference** (string), not an inline object
2. **Current Workflow**: Agentic Campaign Manager creates budgets first, then references them in campaign creation
3. **Current Status**: The endpoint returns `404 Not Found`, blocking all campaign creation

---

## Current Implementation Status

### ✅ **Agentic Campaign Manager (Complete)**
- ✅ `createBudget()` method implemented in `ZilkrDispatcherService`
- ✅ `createCampaign()` updated to create budget first, then reference it
- ✅ Types defined: `ZilkrBudgetRequest`, `ZilkrBudgetResponse`
- ✅ Error handling implemented with clear messages
- ✅ Ready to use endpoint once available

### ❌ **Zilkr Dispatcher (Pending)**
- ❌ Endpoint `POST /api/v2/dispatcher/google/campaign-budgets` returns `404 Not Found`
- ⏳ Implementation required

---

## Testing

**Test Request**:
```bash
POST http://pubgateway-dispatcher-alb-856277585.us-east-1.elb.amazonaws.com/api/v2/dispatcher/google/campaign-budgets
Content-Type: application/json

{
  "accountId": "5533110357",
  "amount": 1000,
  "deliveryMethod": "STANDARD"
}
```

**Expected Result**: `200 OK` with budget resource details

**Current Result**: `404 Not Found`

---

## Related Documentation

- **Full Analysis**: See `GOOGLE-ADS-API-FIELD-ANALYSIS.md` for complete field mapping and requirements
- **API Path**: Confirmed via testing - actual API uses `/api/v2/dispatcher/` (not `/dispatcher/` as shown in some docs)

---

## Acceptance Criteria

- [ ] Endpoint `POST /api/v2/dispatcher/google/campaign-budgets` returns `200 OK` for valid requests
- [ ] Response includes `budgetId` and `resourceName` fields
- [ ] `resourceName` follows Google Ads API format: `customers/{CUSTOMER_ID}/campaignBudgets/{BUDGET_ID}`
- [ ] Error responses include clear validation messages
- [ ] Endpoint handles both `STANDARD` and `ACCELERATED` delivery methods
- [ ] Budget creation integrates with Google Ads API correctly

---

## Next Steps

1. **Zilkr Dispatcher Team**: Implement the endpoint as specified above
2. **Agentic Campaign Manager Team**: Test integration once endpoint is available
3. **Both Teams**: Verify end-to-end campaign creation workflow

---

**Contact**: Agentic Campaign Manager Team  
**Last Updated**: 2025-11-11

