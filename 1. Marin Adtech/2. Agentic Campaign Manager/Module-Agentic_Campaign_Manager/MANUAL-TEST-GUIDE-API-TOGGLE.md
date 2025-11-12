# Manual Testing Guide - API Mode Toggle

## Pre-Testing Checklist

- [ ] Frontend server is running on `http://localhost:5173/`
- [ ] Backend server is running on `http://localhost:3001`
- [ ] Browser DevTools are open (F12)
- [ ] Network tab is open in DevTools
- [ ] Console tab is open in DevTools (for frontend logs)
- [ ] Backend terminal is visible (for backend logs)

---

## Test 1: Toggle Functionality

### Steps:
1. Open the application in browser: `http://localhost:5173/`
2. Navigate to **Campaign Dashboard**
3. Locate the **API Mode Toggle** component (should be in the header area)
4. Observe the initial state:
   - Button should show "Direct" (default)
   - Badge should show "Direct Google Ads"
   - Info icon should be visible

### Expected Results:
- [ ] Toggle component is visible and properly styled
- [ ] Default state is "Direct Google Ads"
- [ ] Component is in a logical location (header area)

### Test Toggle Action:
5. Click the toggle button
6. Observe the changes:
   - Button text changes to "Zilkr"
   - Badge changes to "Zilkr Dispatcher"
   - Toast notification appears

### Expected Results:
- [ ] Toggle switches correctly
- [ ] Badge updates immediately
- [ ] Toast notification appears with message: "Switched to Zilkr Dispatcher"
- [ ] Toast includes description: "This setting will be used for all campaign operations."

### Test Persistence:
7. Refresh the page (F5)
8. Check the toggle state

### Expected Results:
- [ ] Preference persists after refresh
- [ ] Toggle shows "Zilkr" if it was set before refresh
- [ ] Toggle shows "Direct" if it was reset

---

## Test 2: API Mode Header in Requests

### Steps:
1. Set toggle to **"Direct Google Ads"** (if not already)
2. Open **DevTools → Network tab**
3. Clear the network log
4. Navigate to a page that makes API calls (e.g., Campaign Dashboard)
5. Or trigger an API call (e.g., try to sync campaigns or create a campaign)
6. Find the API request in the Network tab
7. Click on the request to inspect it
8. Go to **Headers** tab
9. Look for **Request Headers** section
10. Find the `X-API-Mode` header

### Expected Results:
- [ ] `X-API-Mode: direct` header is present in the request
- [ ] Header value matches the toggle state

### Test with Zilkr Mode:
11. Set toggle to **"Zilkr Dispatcher"**
12. Trigger another API call (refresh page or perform another action)
13. Inspect the new request headers

### Expected Results:
- [ ] `X-API-Mode: zilkr` header is present in the request
- [ ] Header value matches the toggle state

---

## Test 3: Backend Routing - Direct Google Ads

### Steps:
1. Set toggle to **"Direct Google Ads"**
2. Open backend terminal (where the server is running)
3. Clear or scroll to see new logs
4. Trigger a campaign creation or sync operation
5. Watch the backend console logs

### Expected Results:
- [ ] See log: `[API Mode] Campaign creation request received with API mode: direct` (or similar for sync)
- [ ] See log: `[API Mode] Routing Google Ads campaign to GoogleAdsService (direct)`
- [ ] No errors related to service routing

### Test Campaign Creation (if available):
6. Try to create a campaign (if the UI allows)
7. Check backend logs

### Expected Results:
- [ ] Backend receives correct API mode
- [ ] GoogleAdsService methods are called (check logs)
- [ ] Campaign creation process starts (may fail if Google Ads API not fully configured, but routing should work)

---

## Test 4: Backend Routing - Zilkr Dispatcher

### Steps:
1. Set toggle to **"Zilkr Dispatcher"**
2. Clear backend logs or scroll to see new logs
3. Trigger a campaign creation or sync operation
4. Watch the backend console logs

### Expected Results:
- [ ] See log: `[API Mode] Campaign creation request received with API mode: zilkr` (or similar for sync)
- [ ] See log: `[API Mode] Routing Google Ads campaign to ZilkrDispatcherService`
- [ ] See log: `[API Mode] Using ZilkrDispatcherService for campaign sync` (if syncing)

### Test Campaign Sync (if available):
5. Try to sync campaigns (if the UI allows)
6. Check backend logs

### Expected Results:
- [ ] Backend receives correct API mode
- [ ] ZilkrDispatcherService methods are called
- [ ] Request routing works correctly

---

## Test 5: Toggle on Different Pages

### Steps:
1. Navigate to **Campaign Dashboard**
2. Verify toggle is visible
3. Set toggle to a specific state (e.g., "Zilkr")
4. Navigate to **Campaign Preview Screen** (if available)
5. Check if toggle is visible and maintains state
6. Navigate to **Campaign Generation Screen** (if available)
7. Check if toggle is visible and maintains state

### Expected Results:
- [ ] Toggle is visible on Campaign Dashboard
- [ ] Toggle is visible on Campaign Preview Screen
- [ ] Toggle is visible on Campaign Generation Screen
- [ ] Toggle state persists across page navigation
- [ ] Toggle works correctly on all pages

---

## Test 6: Error Handling

### Steps:
1. Set toggle to **"Direct Google Ads"**
2. Try to perform an operation that might fail (e.g., create campaign without proper data)
3. Observe error handling
4. Set toggle to **"Zilkr Dispatcher"**
5. Try the same operation
6. Observe error handling

### Expected Results:
- [ ] Errors are handled gracefully
- [ ] Error messages are clear
- [ ] Toggle state is not affected by errors
- [ ] No console errors related to API mode

---

## Test Results Summary

### Pass/Fail Checklist:
- [ ] Test 1: Toggle Functionality - **PASS / FAIL**
- [ ] Test 2: API Mode Header in Requests - **PASS / FAIL**
- [ ] Test 3: Backend Routing - Direct Google Ads - **PASS / FAIL**
- [ ] Test 4: Backend Routing - Zilkr Dispatcher - **PASS / FAIL**
- [ ] Test 5: Toggle on Different Pages - **PASS / FAIL**
- [ ] Test 6: Error Handling - **PASS / FAIL**

### Issues Found:
1. 
2. 
3. 

### Notes:
- 

---

## Next Steps

If all tests pass:
- Proceed to **Step 13: Implement Direct Google Ads API Methods**

If any tests fail:
- Document the issues
- Fix the issues
- Re-test

---

## Quick Reference: What to Look For

### Frontend (Browser):
- Toggle button changes state
- Badge updates
- Toast notifications appear
- Network requests include `X-API-Mode` header
- No console errors

### Backend (Terminal):
- Logs show API mode received: `[API Mode] Campaign creation request received with API mode: ...`
- Logs show service routing: `[API Mode] Routing Google Ads campaign to ...`
- No routing errors
- Services are called correctly

