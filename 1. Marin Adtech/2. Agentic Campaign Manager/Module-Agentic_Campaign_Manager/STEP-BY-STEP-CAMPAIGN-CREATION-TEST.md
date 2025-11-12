# Step-by-Step Campaign Creation Test Guide

## Overview
This guide walks you through creating a campaign with ad groups and keywords using the Direct Google Ads API.

---

## Step 1: Verify Setup

### 1.1 Check Backend Server
- [ ] Backend server is running on `http://localhost:3001`
- [ ] Check backend terminal - should see: `Backend server running on http://localhost:3001`
- [ ] No errors in backend terminal

### 1.2 Check Frontend Server
- [ ] Frontend server is running on `http://localhost:5173`
- [ ] Open browser to `http://localhost:5173`
- [ ] Application loads without errors

### 1.3 Verify API Mode
- [ ] Navigate to Campaign Dashboard: `http://localhost:5173/campaigns`
- [ ] Locate the **API Mode Toggle** in the header
- [ ] Verify it shows **"Direct"** button and **"Direct Google Ads"** badge
- [ ] If it shows "Zilkr", click the toggle to switch to "Direct"

**Expected Result:**
- Toggle shows "Direct" / "Direct Google Ads"
- No errors in console

---

## Step 2: Prepare Campaign Data

### 2.1 Navigate to Campaign Generation
- [ ] Click **"Generate Campaigns"** button (or navigate to `/campaigns/generate`)
- [ ] Or use an existing campaign that has ad groups and keywords

### 2.2 Verify Campaign Plan Structure
The campaign should have this structure (check in browser DevTools or backend logs):

```json
{
  "campaignPlan": {
    "objective": "drive_traffic",
    "budget": {
      "total": 1000,
      "daily": 100,
      "currency": "USD"
    },
    "platforms": ["googleAds"],
    "adGroups": [
      {
        "name": "Test Ad Group 1",
        "objective": "drive_traffic",
        "budget": 100,
        "targeting": {
          "keywords": [
            "test keyword",
            "another keyword",
            "third keyword"
          ]
        }
      }
    ]
  },
  "name": "Test Campaign - Direct API"
}
```

**Note:** If using the campaign generation flow, the system should automatically create this structure.

---

## Step 3: Create Campaign

### 3.1 Initiate Campaign Creation
- [ ] Fill in campaign name (e.g., "Test Campaign - Direct API")
- [ ] Ensure budget is set (e.g., $1000 total, $100 daily)
- [ ] Verify ad groups and keywords are included in the campaign plan
- [ ] Click **"Create Campaign"** or **"Create as Draft in Google Ads"** button

### 3.2 Watch Backend Terminal
Immediately after clicking, watch the backend terminal for logs.

**Expected Logs (in order):**
```
[API Mode] Campaign creation request received with API mode: direct
[API Mode] Routing Google Ads campaign to GoogleAdsService (direct)
```

Then you should see:
- Budget creation logs
- Campaign creation logs
- Ad group creation logs
- Keyword creation logs

---

## Step 4: Monitor Backend Logs

### 4.1 Budget Creation
**Look for:**
- Budget creation attempt
- Budget resource name returned (e.g., `customers/123/campaignBudgets/456`)

**If successful:**
- No errors
- Budget ID/resource name appears in logs

**If failed:**
- Error message about budget
- Check budget amount is > 0

### 4.2 Campaign Creation
**Look for:**
- Campaign creation attempt
- Campaign resource name returned (e.g., `customers/123/campaigns/789`)

**If successful:**
- Campaign created with budget reference
- Campaign resource name appears

**If failed:**
- Error message about campaign creation
- May be related to budget, campaign name, or API permissions

### 4.3 Ad Group Creation
**Look for:**
- Ad group creation for each ad group in `campaignPlan.adGroups`
- Ad group resource names (e.g., `customers/123/adGroups/101`)

**If successful:**
- Each ad group is created
- Ad group resource names appear

**If failed:**
- Warning message for specific ad group
- Other ad groups may still succeed

### 4.4 Keyword Creation
**Look for:**
- Keyword creation for each keyword in each ad group
- Keyword resource names

**If successful:**
- Keywords are created in ad groups
- Resource names appear

**If failed:**
- Warning messages for specific keywords
- Some keywords may fail (invalid characters, duplicates, etc.) - this is OK
- Other keywords should still succeed

---

## Step 5: Verify Frontend Response

### 5.1 Check for Success Message
- [ ] Success toast/notification appears
- [ ] Message indicates campaign was created

### 5.2 Check Campaign Dashboard
- [ ] Navigate to Campaign Dashboard
- [ ] New campaign appears in the list
- [ ] Campaign name matches what you entered
- [ ] **No MOCK badge** (indicates real data)
- [ ] Campaign status is correct (Active/Draft/Paused)

### 5.3 Check Campaign Details
- [ ] Click on the campaign to view details
- [ ] Verify campaign information is correct
- [ ] Check that ad groups are listed (if displayed)
- [ ] Check that keywords are listed (if displayed)

---

## Step 6: Verify in Google Ads Account

### 6.1 Log into Google Ads
- [ ] Go to [Google Ads](https://ads.google.com/)
- [ ] Log into the account matching your `GOOGLE_ADS_CUSTOMER_ID`

### 6.2 Verify Campaign
- [ ] Navigate to **Campaigns** section
- [ ] Find the campaign you just created (by name)
- [ ] Verify campaign exists
- [ ] Verify campaign status matches (ENABLED/PAUSED)
- [ ] Verify budget is set correctly

### 6.3 Verify Ad Groups
- [ ] Click into the campaign
- [ ] Navigate to **Ad groups** tab
- [ ] Verify ad groups are listed
- [ ] Verify ad group names match
- [ ] Verify ad groups are ENABLED

### 6.4 Verify Keywords
- [ ] Click into an ad group
- [ ] Navigate to **Keywords** section
- [ ] Verify keywords are listed
- [ ] Verify keyword text matches
- [ ] Verify match types are correct (BROAD/PHRASE/EXACT)
- [ ] Verify keywords are ENABLED

---

## Step 7: Troubleshooting Common Issues

### Issue: Budget Creation Fails
**Symptoms:**
- Error in backend logs about budget
- Campaign creation doesn't proceed

**Solutions:**
- Check budget amount is > 0
- Verify budget is in valid range for Google Ads
- Check Google Ads API permissions

### Issue: Campaign Creation Fails
**Symptoms:**
- Budget created successfully
- Campaign creation error

**Solutions:**
- Check campaign name doesn't violate Google Ads rules (no special characters, length limits)
- Verify advertising channel type is valid
- Check campaign status is valid (ENABLED/PAUSED)

### Issue: Ad Group Creation Fails
**Symptoms:**
- Campaign created successfully
- Ad group creation errors

**Solutions:**
- Check ad group names are valid
- Verify CPC bid is in valid range (if provided)
- Check backend logs for specific error

### Issue: Keyword Creation Fails
**Symptoms:**
- Ad groups created successfully
- Keyword creation errors/warnings

**Solutions:**
- This is common - some keywords may fail due to:
  - Invalid characters
  - Duplicate keywords
  - Keyword policy violations
  - API method issues
- Check backend logs for specific keyword errors
- Verify the `adGroupCriteria.create` method is correct for your `google-ads-api` library version
- Some keywords failing is OK - others should succeed

### Issue: No Logs Appear
**Symptoms:**
- Clicked create but no backend logs

**Solutions:**
- Check backend server is running
- Check frontend is sending request (check Network tab in DevTools)
- Verify API mode toggle is set correctly
- Check for frontend errors in console

---

## Step 8: Document Results

### 8.1 Record What Worked
- [ ] Budget creation: **PASS / FAIL**
- [ ] Campaign creation: **PASS / FAIL**
- [ ] Ad group creation: **PASS / FAIL**
- [ ] Keyword creation: **PASS / FAIL**

### 8.2 Record Any Errors
- [ ] Note specific error messages
- [ ] Note which step failed
- [ ] Note if partial success (e.g., some keywords failed)

### 8.3 Record Google Ads Verification
- [ ] Campaign appears in Google Ads: **YES / NO**
- [ ] Ad groups appear: **YES / NO**
- [ ] Keywords appear: **YES / NO**

---

## Expected Complete Flow

### Successful Flow:
```
1. User clicks "Create Campaign"
2. Frontend sends POST to /api/campaigns/create with X-API-Mode: direct
3. Backend receives request
4. Backend logs: [API Mode] Campaign creation request received with API mode: direct
5. Backend logs: [API Mode] Routing Google Ads campaign to GoogleAdsService (direct)
6. GoogleAdsService.createBudget() called
7. Budget created: customers/123/campaignBudgets/456
8. GoogleAdsService.createCampaign() called
9. Campaign created: customers/123/campaigns/789
10. For each ad group:
    - GoogleAdsService creates ad group
    - Ad group created: customers/123/adGroups/101
    - For each keyword:
      - GoogleAdsService creates keyword
      - Keyword created: customers/123/adGroupCriteria/202
11. Response returned to frontend
12. Campaign appears in dashboard
13. Campaign appears in Google Ads account
```

---

## Quick Test Checklist

- [ ] **Step 1**: Setup verified
- [ ] **Step 2**: Campaign data prepared
- [ ] **Step 3**: Campaign creation initiated
- [ ] **Step 4**: Backend logs monitored
- [ ] **Step 5**: Frontend response verified
- [ ] **Step 6**: Google Ads account verified
- [ ] **Step 7**: Issues resolved (if any)
- [ ] **Step 8**: Results documented

---

## Next Steps After Testing

1. **If All Steps Pass:**
   - Step 13 implementation is complete
   - Campaign creation with ad groups and keywords is working
   - Ready for production use

2. **If Issues Found:**
   - Document specific errors
   - Fix issues
   - Re-test

3. **If Partial Success:**
   - Note what worked and what didn't
   - Fix failing components
   - Re-test

