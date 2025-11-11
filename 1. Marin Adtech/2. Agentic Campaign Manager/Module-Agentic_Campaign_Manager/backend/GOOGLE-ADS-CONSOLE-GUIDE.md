# Google Ads Console Monitoring Guide

## What to Watch For During E2E Testing

When running E2E tests, watch for these resources appearing in real-time in your Google Ads account (`553-311-0357` - "US - Marin PPC"):

### 1. Campaigns
**Location**: Campaigns tab → All campaigns

**What to look for:**
- Campaign names containing:
  - "E2E Test Campaign"
  - "Complete Workflow Campaign"
  - "API Test Campaign"
  - "Test Campaign"
- Status: Should show as "Enabled" initially
- Budget: Check budget amounts match test values ($100, $150, etc.)

**Key indicators:**
- ✅ Campaign appears in list
- ✅ Status shows "Enabled" or "Paused"
- ✅ Budget amount is visible
- ⚠️  If status is "Paused" - good! Won't spend money
- ⚠️  If status is "Enabled" - will spend money if ads are approved

### 2. Ad Groups
**Location**: Campaigns tab → Select a campaign → Ad groups

**What to look for:**
- Ad group names containing:
  - "E2E Test Ad Group"
  - "Workflow Ad Group"
  - "Test Ad Group"
- Status: Should show as "Enabled" or "Paused"
- CPC Bid: Check if bids are set (e.g., $2.50, $3.00)

**Key indicators:**
- ✅ Ad group appears under the campaign
- ✅ Status is visible
- ✅ Bid amounts are set correctly

### 3. Ads
**Location**: Campaigns tab → Select a campaign → Ad groups → Select ad group → Ads

**What to look for:**
- Ad type: "Responsive search ad"
- Headlines: Should see 3+ headlines
- Descriptions: Should see 2+ descriptions
- Final URL: Should be visible

**Key indicators:**
- ✅ Ad appears in ad group
- ✅ Headlines and descriptions are visible
- ✅ Status shows "Approved", "Under review", or "Disapproved"

### 4. Keywords
**Location**: Campaigns tab → Select a campaign → Ad groups → Select ad group → Keywords

**What to look for:**
- Keywords like:
  - "running shoes"
  - "athletic footwear"
  - "best products"
  - "online shopping"
- Match types: BROAD, PHRASE, or EXACT
- CPC Bid: Should show bid amounts
- Status: Should show "Enabled" or "Paused"

**Key indicators:**
- ✅ Keywords appear in ad group
- ✅ Match types are correct
- ✅ Bids are set

## Real-Time Monitoring Tips

1. **Refresh frequently**: Google Ads console may take a few seconds to show new resources
2. **Check status column**: Look for "Enabled" vs "Paused" status
3. **Monitor budget**: Check if daily budgets are being spent
4. **Watch for approvals**: Ads may show "Under review" initially

## Safety Checklist

### Before Tests Run:
- [ ] Verify you're in the correct account (`553-311-0357`)
- [ ] Note current campaign count
- [ ] Check current account spend (if applicable)

### During Tests:
- [ ] Watch for new campaigns appearing
- [ ] Check campaign status (should be "Enabled" or "Paused")
- [ ] Verify budgets are set correctly
- [ ] Monitor for any immediate spend

### After Tests:
- [ ] **IMMEDIATELY** check campaign status
- [ ] **IMMEDIATELY** pause any "Enabled" campaigns
- [ ] Verify no spend has occurred
- [ ] Run cleanup script to delete test campaigns

## Preventing Spend

### If Campaigns Are Created as "Enabled":

1. **Immediate Action**: Pause campaigns immediately
   ```bash
   node cleanup-test-campaigns.js pause-all
   ```

2. **In Google Ads Console**:
   - Go to Campaigns tab
   - Select test campaigns
   - Click "Edit" → "Change status" → "Paused"
   - Or use bulk actions to pause multiple campaigns

3. **Verify No Spend**:
   - Check "Spend" column in campaigns view
   - Should show $0.00 if paused quickly
   - Check "Today" spend in account overview

### Best Practices:

1. **Test with Paused Status**: Modify tests to create campaigns as "PAUSED" initially
2. **Use Small Budgets**: Test with minimal budgets ($1-10)
3. **Monitor Closely**: Watch console during test execution
4. **Clean Up Immediately**: Delete test campaigns right after testing

## Cleanup Commands

```bash
# List all campaigns
node cleanup-test-campaigns.js list

# Pause all campaigns (stops spending)
node cleanup-test-campaigns.js pause-all

# Delete only test campaigns
node cleanup-test-campaigns.js delete-test

# Delete ALL campaigns (use with extreme caution!)
node cleanup-test-campaigns.js delete-all
```

## What Happens When Campaigns Are Deleted

- Status changes to "Removed"
- Campaigns stop serving ads immediately
- Historical data is preserved
- Campaigns can be restored (if needed) but won't serve ads

## Emergency Stop

If you see campaigns spending money unexpectedly:

1. **Immediate**: Pause all campaigns in Google Ads console
2. **Verify**: Check spend column shows $0.00
3. **Cleanup**: Run cleanup script to delete test campaigns
4. **Review**: Check account spend in account settings

---

**Remember**: Test campaigns created through the API are REAL campaigns in Google Ads and will spend real money if left enabled and approved!

