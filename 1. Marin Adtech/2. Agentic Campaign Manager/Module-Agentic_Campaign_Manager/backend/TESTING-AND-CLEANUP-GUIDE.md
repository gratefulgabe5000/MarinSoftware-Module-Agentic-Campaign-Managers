# E2E Testing and Cleanup Guide

## Current Status

⚠️ **API Issue**: The Marin Dispatcher API is currently returning **500 Internal Server Error** when creating campaigns. This appears to be a budget validation issue on the API side, not our code.

**What this means:**
- Campaigns are **NOT** being created currently (due to API error)
- No spend is occurring
- Tests are failing at the API level

## What to Watch For in Google Ads Console

When the API issue is resolved and campaigns start being created, watch for:

### 1. Campaigns Tab
**Location**: `https://ads.google.com` → Campaigns

**Look for:**
- Campaign names with "Test", "E2E", "API Test", or "Workflow" in the name
- Status column: "Enabled" = ⚠️ **WILL SPEND MONEY**, "Paused" = ✅ Safe
- Budget column: Check amounts match test values
- Spend column: Should be $0.00 if paused quickly

### 2. Campaign Details
Click on any test campaign to see:
- **Ad Groups**: Should appear under the campaign
- **Ads**: Click ad group → Ads tab
- **Keywords**: Click ad group → Keywords tab

### 3. Real-Time Indicators
- ✅ New campaigns appear within seconds
- ✅ Status shows immediately
- ⚠️  If "Enabled" - pause immediately!
- ✅ Check "Spend" column frequently

## Immediate Actions After Testing

### Step 1: Pause All Campaigns (IMMEDIATE)
```bash
node cleanup-test-campaigns.js pause-all
```

This will:
- List all campaigns
- Ask for confirmation
- Pause all campaigns (stops spending)

### Step 2: Verify No Spend
In Google Ads Console:
1. Go to Campaigns tab
2. Check "Spend" column - should show $0.00
3. Go to Account overview → Check "Today" spend

### Step 3: Delete Test Campaigns
```bash
# List campaigns first
node cleanup-test-campaigns.js list

# Delete only test campaigns (safer)
node cleanup-test-campaigns.js delete-test

# Or delete ALL campaigns (use with caution)
node cleanup-test-campaigns.js delete-all
```

## Cleanup Script Commands

```bash
# List all campaigns (see what exists)
node cleanup-test-campaigns.js list

# Pause all campaigns (stops spending immediately)
node cleanup-test-campaigns.js pause-all

# Delete only test campaigns (recommended)
node cleanup-test-campaigns.js delete-test

# Delete ALL campaigns (DANGEROUS - requires double confirmation)
node cleanup-test-campaigns.js delete-all
```

## Safety Checklist

### Before Running Tests:
- [ ] Verify account ID is correct (`553-311-0357`)
- [ ] Note current campaign count
- [ ] Check current account spend
- [ ] Have cleanup script ready

### During Tests:
- [ ] Watch Google Ads console in real-time
- [ ] Monitor for new campaigns appearing
- [ ] Check campaign status immediately
- [ ] Verify budgets are reasonable

### After Tests:
- [ ] **IMMEDIATELY** run `pause-all` command
- [ ] Verify spend is $0.00
- [ ] Run `delete-test` to clean up
- [ ] Confirm no test campaigns remain

## Current API Issue

The API is returning 500 errors with budget validation issues. This means:

✅ **Good News**: No campaigns are being created, so no spend is occurring
❌ **Bad News**: We can't test end-to-end until the API issue is resolved

**Error Details:**
- Status: 500 Internal Server Error
- Endpoint: `POST /api/v2/dispatcher/google/campaigns`
- Issue: Budget validation error (likely on API side)

**Next Steps:**
1. Contact Marin Dispatcher team about budget validation
2. Try with different budget amounts
3. Check API documentation for budget requirements

## Manual Cleanup in Google Ads Console

If the cleanup script doesn't work, you can manually:

1. **Pause Campaigns**:
   - Go to Campaigns tab
   - Select test campaigns (checkboxes)
   - Click "Edit" → "Change status" → "Paused"

2. **Delete Campaigns**:
   - Select test campaigns
   - Click "Edit" → "Remove" → Confirm

3. **Verify No Spend**:
   - Check "Spend" column
   - Review account spend in settings

## Emergency Procedures

### If Campaigns Start Spending Money:

1. **IMMEDIATE**: Go to Google Ads console
2. **Pause**: Select all test campaigns → Pause
3. **Verify**: Check spend column shows $0.00
4. **Cleanup**: Delete test campaigns
5. **Review**: Check account spend history

### If Cleanup Script Fails:

1. Use Google Ads console directly
2. Bulk select campaigns
3. Use bulk actions to pause/delete
4. Verify in console that campaigns are removed

---

**Remember**: Test campaigns are REAL campaigns and will spend REAL money if left enabled!

