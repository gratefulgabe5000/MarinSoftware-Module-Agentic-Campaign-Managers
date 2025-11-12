# Step 13 - Campaign Creation Test Guide

## Overview
Test the complete campaign creation flow including:
- Budget creation
- Campaign creation
- Ad group creation
- Keyword creation

## Pre-Testing Checklist

- [ ] Backend server is running on `http://localhost:3001`
- [ ] Frontend server is running on `http://localhost:5173`
- [ ] Google Ads credentials are configured in `.env`
- [ ] API Mode Toggle is set to **"Direct Google Ads"**
- [ ] Backend terminal is visible for logs

---

## Test: Create Campaign with Ad Groups and Keywords

### Steps:

1. **Navigate to Campaign Generation**
   - Go to `http://localhost:5173/campaigns/generate` (or use the "Generate Campaigns" button)
   - Or use an existing campaign that has ad groups and keywords defined

2. **Ensure Campaign Plan Has Ad Groups and Keywords**
   - The campaign should have `campaignPlan.adGroups` array
   - Each ad group should have `targeting.keywords` array
   - Example structure:
     ```json
     {
       "campaignPlan": {
         "adGroups": [
           {
             "name": "Test Ad Group",
             "targeting": {
               "keywords": ["test keyword", "another keyword"]
             }
           }
         ]
       }
     }
     ```

3. **Create Campaign**
   - Fill in campaign details (name, budget, etc.)
   - Ensure the campaign plan includes ad groups with keywords
   - Click "Create Campaign" or similar button
   - Watch backend terminal logs

4. **Verify Backend Logs**
   - Should see: `[API Mode] Campaign creation request received with API mode: direct`
   - Should see: `[API Mode] Routing Google Ads campaign to GoogleAdsService (direct)`
   - Should see budget creation logs
   - Should see campaign creation logs
   - Should see ad group creation logs
   - Should see keyword creation logs

5. **Check Google Ads Account**
   - Log into Google Ads account
   - Verify the campaign was created
   - Verify ad groups were created under the campaign
   - Verify keywords were added to the ad groups

6. **Verify Frontend Response**
   - Campaign should appear in dashboard
   - No MOCK badges (real data)
   - Campaign should show as created successfully

---

## Expected Backend Logs

### Successful Creation:
```
[API Mode] Campaign creation request received with API mode: direct
[API Mode] Routing Google Ads campaign to GoogleAdsService (direct)
[GoogleAdsService] Creating budget...
[GoogleAdsService] Budget created: customers/123/campaignBudgets/456
[GoogleAdsService] Creating campaign...
[GoogleAdsService] Campaign created: customers/123/campaigns/789
[GoogleAdsService] Creating ad group: "Test Ad Group"
[GoogleAdsService] Ad group created: customers/123/adGroups/101
[GoogleAdsService] Creating keywords for ad group...
[GoogleAdsService] Keyword created: "test keyword"
[GoogleAdsService] Keyword created: "another keyword"
```

### Potential Errors:
- Budget creation errors
- Campaign creation errors
- Ad group creation errors
- Keyword creation errors (may need API method adjustments)

---

## What to Verify

### Backend:
- [ ] Budget is created successfully
- [ ] Campaign is created with budget reference
- [ ] Ad groups are created under the campaign
- [ ] Keywords are added to ad groups
- [ ] No errors in console (warnings for individual failures are OK)

### Google Ads Account:
- [ ] Campaign appears in Google Ads dashboard
- [ ] Campaign has the correct budget
- [ ] Ad groups are visible under the campaign
- [ ] Keywords are listed in each ad group
- [ ] Campaign status matches what was requested (ENABLED/PAUSED)

### Frontend:
- [ ] Campaign appears in dashboard
- [ ] No MOCK badges (real data)
- [ ] Campaign details are correct
- [ ] Success message appears

---

## Troubleshooting

### If Budget Creation Fails:
- Check budget amount is > 0
- Verify Google Ads API permissions
- Check backend logs for specific error

### If Campaign Creation Fails:
- Verify budget was created successfully
- Check campaign name doesn't violate Google Ads rules
- Verify advertising channel type is valid

### If Ad Group Creation Fails:
- Check ad group name is valid
- Verify campaign resource name is correct
- Check CPC bid is in valid range (if provided)

### If Keyword Creation Fails:
- This is the most likely area to need fixes
- Google Ads API keyword creation may need method adjustments
- Check backend logs for specific keyword errors
- Some keywords may fail (invalid characters, duplicates, etc.) - this is OK, others should succeed

---

## Notes

- **Partial Success is OK**: If some keywords fail but others succeed, that's acceptable
- **API Method Verification**: The `adGroupCriteria.create` method may need adjustment based on the actual `google-ads-api` library API
- **Batch Operations**: Future enhancement could use batch operations for better performance

---

## Next Steps After Testing

1. **If Successful**: 
   - Step 13 implementation is complete
   - Campaign creation with ad groups and keywords is working

2. **If Keyword Creation Fails**:
   - Check the exact error message
   - May need to adjust the API method call
   - Verify the `google-ads-api` library version and API

3. **If Other Issues**:
   - Document the specific error
   - Fix the issue
   - Re-test

