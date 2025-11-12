# Step 13 Testing Guide - Direct Google Ads API Implementation

## Overview
This guide tests the implementation of real Google Ads API methods in `GoogleAdsService`. Since Google Ads credentials may not be configured, we'll test both mock mode (fallback) and verify the implementation structure.

## Pre-Testing Checklist

- [ ] Frontend server is running on `http://localhost:5173/`
- [ ] Backend server is running on `http://localhost:3001`
- [ ] Browser DevTools are open (F12)
- [ ] Network tab is open in DevTools
- [ ] Console tab is open in DevTools (for frontend logs)
- [ ] Backend terminal is visible (for backend logs)
- [ ] API Mode Toggle is set to **"Direct Google Ads"** (default)

---

## Test 1: Service Initialization (Mock Mode)

### Purpose
Verify that `GoogleAdsService` initializes correctly when Google Ads credentials are not configured, and falls back to mock mode.

### Steps:
1. Check backend terminal for initialization logs
2. Look for any errors during service initialization
3. Verify that the service doesn't crash when credentials are missing

### Expected Results:
- [ ] No initialization errors in backend logs
- [ ] Service initializes successfully (even without credentials)
- [ ] Console warnings may appear: `[GoogleAdsService] Client not initialized, using mock response for...` (this is expected)

### Backend Logs to Check:
```
[GoogleAdsService] Client not initialized, using mock response for...
```

---

## Test 2: Campaign Sync with Mock Data

### Purpose
Test that `queryCampaigns()` method works in mock mode and returns campaigns with `isMock: true` flag.

### Steps:
1. Navigate to **Campaign Dashboard** (`http://localhost:5173/campaigns`)
2. Set API Mode Toggle to **"Direct Google Ads"** (if not already)
3. Click **"Sync from Zilkr"** button (or similar sync button)
4. Watch backend terminal logs
5. Check frontend for synced campaigns
6. Inspect the campaigns in the UI

### Expected Results:
- [ ] Backend log: `[API Mode] Campaign sync request received with API mode: direct`
- [ ] Backend log: `[API Mode] Using GoogleAdsService (direct) for campaign sync`
- [ ] Backend log: `[GoogleAdsService] Client not initialized, using mock response for queryCampaigns`
- [ ] Campaigns appear in the dashboard
- [ ] **MOCK badges appear on campaigns** (yellow badge with "MOCK" text)
- [ ] No errors in console

### What to Verify:
- [ ] Campaigns are returned successfully
- [ ] Each campaign has `isMock: true` flag (check in Network response)
- [ ] Mock badges are visible in the UI

---

## Test 3: Campaign Creation with Mock Data

### Purpose
Test that `createCampaign()` and `createBudget()` methods work in mock mode.

### Steps:
1. Navigate to campaign generation or creation page
2. Set API Mode Toggle to **"Direct Google Ads"**
3. Fill in campaign details (name, budget, etc.)
4. Submit campaign creation
5. Watch backend terminal logs
6. Check if campaign is created successfully
7. Verify mock badges appear

### Expected Results:
- [ ] Backend log: `[API Mode] Campaign creation request received with API mode: direct`
- [ ] Backend log: `[API Mode] Routing Google Ads campaign to GoogleAdsService (direct)`
- [ ] Backend log: `[GoogleAdsService] Client not initialized, using mock response for createBudget`
- [ ] Backend log: `[GoogleAdsService] Client not initialized, using mock response for createCampaign`
- [ ] Campaign creation succeeds (with mock data)
- [ ] Created campaign has `isMock: true` flag
- [ ] **MOCK badge appears on created campaign**

### What to Verify:
- [ ] Budget creation is attempted first
- [ ] Campaign creation follows budget creation
- [ ] Response includes `isMock: true`
- [ ] Campaign appears in dashboard with MOCK badge

---

## Test 4: Campaign Operations (Update, Pause, Resume, Delete)

### Purpose
Test that campaign management methods work in mock mode.

### Steps:
1. Find a campaign with MOCK badge (from previous tests)
2. Try to **pause** the campaign
3. Check backend logs
4. Try to **resume** the campaign
5. Check backend logs
6. Try to **update** the campaign (if UI allows)
7. Check backend logs
8. Try to **delete** the campaign (optional, be careful)
9. Check backend logs

### Expected Results:
- [ ] Each operation logs: `[GoogleAdsService] Client not initialized, using mock response for [operation]`
- [ ] Operations complete successfully (mock mode)
- [ ] Responses include `isMock: true` flag
- [ ] No errors in console

### Methods to Test:
- [ ] `pauseCampaign()` - Sets status to PAUSED
- [ ] `resumeCampaign()` - Sets status to ENABLED
- [ ] `updateCampaign()` - Updates campaign details
- [ ] `deleteCampaign()` - Sets status to REMOVED
- [ ] `getCampaignStatus()` - Gets campaign status

---

## Test 5: Mock Data Badge Display

### Purpose
Verify that mock badges appear correctly in the UI when `isMock: true`.

### Steps:
1. Navigate to **Campaign Dashboard**
2. Look for campaigns with **MOCK badges** (yellow badge with "MOCK" text)
3. Hover over the badge to see tooltip
4. Navigate to **Campaign Preview Screen**
5. Check campaign tabs for MOCK badges
6. Verify badge styling and visibility

### Expected Results:
- [ ] **MOCK badges appear on campaigns** created/synced with mock data
- [ ] Badge is yellow (`bg-yellow-50 text-yellow-700 border-yellow-300`)
- [ ] Badge text says "MOCK"
- [ ] Tooltip appears on hover: "This campaign was created/retrieved using mock/test data"
- [ ] Badges appear in both Dashboard and Preview Screen
- [ ] Badge size is appropriate (not too large/small)

### Locations to Check:
- [ ] Campaign cards on Dashboard
- [ ] Campaign tabs in Preview Screen
- [ ] Badge is positioned correctly (not overlapping other elements)

---

## Test 6: API Response Structure

### Purpose
Verify that API responses include the `isMock` flag and are properly structured.

### Steps:
1. Open DevTools → Network tab
2. Trigger a campaign sync or creation
3. Find the API request in Network tab
4. Click on the request → Response tab
5. Inspect the JSON response
6. Check for `isMock` field in campaign objects

### Expected Results:
- [ ] Response includes campaigns array
- [ ] Each campaign object has `isMock: true` (for mock data)
- [ ] Response structure matches expected format
- [ ] No missing required fields

### Response Structure to Verify:
```json
{
  "campaigns": [
    {
      "id": "...",
      "name": "...",
      "isMock": true,  // ← Should be present
      ...
    }
  ]
}
```

---

## Test 7: Error Handling

### Purpose
Test that errors are handled gracefully when operations fail.

### Steps:
1. Try to create a campaign with invalid data
2. Check error messages
3. Try to sync campaigns when API is unavailable
4. Check error handling
5. Verify that `isMock` flag doesn't cause errors

### Expected Results:
- [ ] Errors are caught and handled gracefully
- [ ] Error messages are clear and informative
- [ ] No crashes or unhandled exceptions
- [ ] `isMock` flag doesn't interfere with error handling

---

## Test 8: Backend Logging

### Purpose
Verify that backend logs provide clear information about mock vs real API usage.

### Steps:
1. Perform various operations (sync, create, update)
2. Review backend terminal logs
3. Look for mock mode indicators
4. Verify log messages are helpful

### Expected Results:
- [ ] Logs clearly indicate when mock mode is used
- [ ] Log format: `[GoogleAdsService] Client not initialized, using mock response for [method]`
- [ ] Logs are not too verbose (not spamming console)
- [ ] Logs help with debugging

---

## Test Results Summary

### Pass/Fail Checklist:
- [ ] Test 1: Service Initialization - **PASS / FAIL**
- [ ] Test 2: Campaign Sync with Mock Data - **PASS / FAIL**
- [ ] Test 3: Campaign Creation with Mock Data - **PASS / FAIL**
- [ ] Test 4: Campaign Operations - **PASS / FAIL**
- [ ] Test 5: Mock Data Badge Display - **PASS / FAIL**
- [ ] Test 6: API Response Structure - **PASS / FAIL**
- [ ] Test 7: Error Handling - **PASS / FAIL**
- [ ] Test 8: Backend Logging - **PASS / FAIL**

### Issues Found:
1. 
2. 
3. 

### Notes:
- 

---

## Quick Reference: Expected Behavior

### When Google Ads Credentials ARE Configured:
- Service initializes with real Google Ads API client
- Methods call real Google Ads API
- Responses do NOT include `isMock: true`
- No MOCK badges appear

### When Google Ads Credentials ARE NOT Configured (Current State):
- Service initializes but uses mock mode
- Methods return mock responses
- Responses include `isMock: true`
- MOCK badges appear in UI
- Console warnings indicate mock mode

---

## Next Steps

If all tests pass:
- Step 13 implementation is complete
- Mock data badging is working correctly
- Ready to test with real Google Ads credentials (when available)

If any tests fail:
- Document the issues
- Fix the issues
- Re-test

