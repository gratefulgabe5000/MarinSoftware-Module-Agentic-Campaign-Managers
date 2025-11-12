# Testing Campaign Operations (Update, Pause, Resume, Delete)

This guide outlines how to test the campaign management operations using the Direct Google Ads API.

## Prerequisites

- ✅ Campaign creation is working (verified)
- ✅ Ad groups and keywords are working (verified)
- ✅ API Mode toggle is set to "Direct" (Direct Google Ads API)
- ✅ Backend server is running on `http://localhost:3001`
- ✅ Frontend is running on `http://localhost:5173`

## Test Operations

### 1. Update Campaign

**Test Steps:**
1. Navigate to Campaign Dashboard
2. Find a campaign that was created via Direct Google Ads API
3. Click the "Edit" button (pencil icon) for the campaign
4. This will navigate to the campaign detail page
5. On the detail page, make changes to the campaign (if edit functionality is available)
6. Save the changes

**Note:** Currently, the Edit button navigates to the campaign detail page. Full edit functionality may need to be implemented on the detail page.

**Expected Result:**
- Campaign should navigate to detail page
- If edit functionality exists, changes should update in Google Ads
- Success message should appear
- Updated campaign should reflect changes in Campaign Dashboard

**Backend Logs to Check:**
- Look for `[Google Ads]` logs showing the update operation
- Should see successful mutate response

---

### 2. Pause Campaign

**Test Steps:**
1. Navigate to Campaign Dashboard
2. Find an active/enabled campaign (status should be "Active" or "Creating")
3. Click the "Pause" button on the campaign card
4. The pause action happens immediately (no confirmation dialog)

**Expected Result:**
- Campaign status should change to "PAUSED" in Google Ads
- Campaign should show as paused in Campaign Dashboard
- Success toast message should appear
- Pause button should disappear, Resume button should appear

**Backend Logs to Check:**
- Look for `[Google Ads]` logs showing pause operation
- Should see `status: 'PAUSED'` in the operation
- Should see successful mutate response

**Verify in Google Ads:**
- Go to Google Ads Console
- Check that the campaign status is "Paused"

---

### 3. Resume Campaign

**Test Steps:**
1. Navigate to Campaign Dashboard
2. Find a paused campaign (status should be "Paused")
3. Click the "Resume" button on the campaign card
4. The resume action happens immediately (no confirmation dialog)

**Expected Result:**
- Campaign status should change to "ENABLED" in Google Ads
- Campaign should show as active in Campaign Dashboard
- Success toast message should appear
- Resume button should disappear, Pause button should appear

**Backend Logs to Check:**
- Look for `[Google Ads]` logs showing resume operation
- Should see `status: 'ENABLED'` in the operation
- Should see successful mutate response

**Verify in Google Ads:**
- Go to Google Ads Console
- Check that the campaign status is "Enabled"

---

### 4. Delete Campaign

**Test Steps:**
1. Navigate to Campaign Dashboard
2. Find a campaign you want to delete (preferably a test campaign)
3. Click the delete/trash icon on the campaign card
4. Confirm the deletion in the dialog that appears

**Expected Result:**
- Campaign status should change to "REMOVED" in Google Ads
- Campaign should disappear from Campaign Dashboard
- Success toast message should appear

**Backend Logs to Check:**
- Look for `[Google Ads]` logs showing delete operation
- Should see `status: 'REMOVED'` in the operation
- Should see successful mutate response

**Verify in Google Ads:**
- Go to Google Ads Console
- Check that the campaign status is "Removed" (campaigns are not permanently deleted, just marked as removed)

---

## Testing Checklist

- [ ] Edit Campaign - Edit button navigates to detail page
- [ ] Update Campaign - Name change works (if edit functionality is implemented on detail page)
- [ ] Update Campaign - Other fields update correctly
- [ ] Pause Campaign - Campaign pauses successfully
- [ ] Pause Campaign - Pause button only shows for active/creating campaigns
- [ ] Resume Campaign - Campaign resumes successfully
- [ ] Resume Campaign - Resume button only shows for paused campaigns
- [ ] Delete Campaign - Campaign is removed successfully
- [ ] All operations work with Direct Google Ads API mode
- [ ] All operations show success toast messages in UI
- [ ] All operations reflect changes in Campaign Dashboard immediately
- [ ] All operations reflect changes in Google Ads Console

---

## Troubleshooting

### If an operation fails:

1. **Check Backend Logs:**
   - Look for `[Google Ads]` error messages
   - Check the error structure and field paths

2. **Check API Mode:**
   - Ensure API Mode toggle is set to "Direct" (Direct Google Ads API)
   - Check that `X-API-Mode: direct` header is being sent

3. **Check Campaign ID Format:**
   - Campaign IDs should be in format: `customers/{customer_id}/campaigns/{campaign_id}`
   - Verify the campaign exists in Google Ads

4. **Check Permissions:**
   - Ensure the Google Ads account has permissions to update/pause/resume/delete campaigns
   - Verify the refresh token has the necessary scopes

---

## Notes

- **Delete vs Remove:** Google Ads doesn't permanently delete campaigns. Setting status to "REMOVED" archives the campaign.
- **Status Changes:** All status changes (PAUSED, ENABLED, REMOVED) use the same `update` operation with different status values.
- **Response Structure:** All operations use `mutateResources` and extract results from `mutate_operation_responses[0].campaign_result.resource_name`.

