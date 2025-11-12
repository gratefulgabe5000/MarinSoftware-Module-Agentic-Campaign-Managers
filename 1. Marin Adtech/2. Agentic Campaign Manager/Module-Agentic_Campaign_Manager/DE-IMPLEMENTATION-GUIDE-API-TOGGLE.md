# De-Implementation Guide: Remove API Toggle (Revert to Zilkr Dispatcher Only)

**Document Version**: 1.0  
**Created**: 2025-11-11  
**Purpose**: Guide for removing the API toggle and reverting to Zilkr Dispatcher-only mode  
**Status**: Rollback Ready

---

## Overview

This guide provides step-by-step instructions for removing the API toggle functionality and reverting the application to use only the Zilkr Dispatcher for all Google Ads operations. This process involves:

- Removing frontend toggle components
- Removing API mode state management
- Uncommenting Zilkr Dispatcher code
- Removing Direct Google Ads API routing logic
- Restoring original Zilkr-only behavior

---

## Prerequisites

- Implementation guide was followed
- All changes are committed to version control (for safety)
- Understanding of what was changed during implementation

---

## De-Implementation Steps

### Step 1: Remove API Mode Store (Frontend)

**File**: `src/store/apiModeStore.ts`

**Action**: Delete the file entirely.

```bash
# From project root
rm src/store/apiModeStore.ts
```

**Verification**:
- File is deleted
- No import errors in other files (yet - we'll fix imports next)

---

### Step 2: Remove API Mode Toggle Component (Frontend)

**File**: `src/components/ApiModeToggle.tsx`

**Action**: Delete the file entirely.

```bash
rm src/components/ApiModeToggle.tsx
```

**Verification**:
- File is deleted
- No import errors (yet - we'll fix imports next)

---

### Step 3: Remove Toggle from Campaign Dashboard

**File**: `src/components/CampaignDashboard.tsx`

**Action**: Remove import and component usage.

1. Remove the import:
```typescript
// DELETE THIS LINE:
import ApiModeToggle from './ApiModeToggle';
```

2. Remove the component from JSX (around where you added it):
```typescript
// DELETE THIS SECTION:
<div className="flex items-center gap-4">
  <h1 className="text-2xl font-bold">Campaign Dashboard</h1>
  <ApiModeToggle />
</div>

// RESTORE TO ORIGINAL:
<h1 className="text-2xl font-bold">Campaign Dashboard</h1>
```

**Verification**:
- No import errors
- Component removed from UI
- Layout looks correct

---

### Step 4: Remove Toggle from Campaign Preview Screen

**File**: `src/components/campaign-preview/CampaignPreviewScreen.tsx`

**Action**: Remove import and component usage.

1. Remove the import:
```typescript
// DELETE THIS LINE:
import ApiModeToggle from '../ApiModeToggle';
```

2. Remove the component from JSX:
```typescript
// DELETE THIS SECTION:
<div className="mb-4 flex items-center justify-between">
  <ApiModeToggle />
  {/* Existing action buttons */}
</div>
```

**Verification**:
- No import errors
- Component removed from UI

---

### Step 5: Remove Toggle from Campaign Generation Screen

**File**: `src/components/campaign-generation/CampaignGenerationScreen.tsx`

**Action**: Remove import and component usage.

1. Remove the import:
```typescript
// DELETE THIS LINE:
import ApiModeToggle from '../ApiModeToggle';
```

2. Remove the component from JSX:
```typescript
// DELETE THIS SECTION:
<div className="settings-section mb-4">
  <ApiModeToggle />
</div>
```

**Verification**:
- No import errors
- Component removed from UI

---

### Step 6: Remove API Mode Helper Utility

**File**: `src/utils/apiModeHelper.ts`

**Action**: Delete the file entirely.

```bash
rm src/utils/apiModeHelper.ts
```

**Verification**:
- File is deleted
- No import errors (yet - we'll fix imports next)

---

### Step 7: Remove API Mode from Campaign Service

**File**: `src/services/campaignService.ts`

**Action**: Remove API mode header from all API calls.

1. Remove the import:
```typescript
// DELETE THIS LINE:
import { getApiMode } from '../utils/apiModeHelper';
```

2. Remove API mode from all API calls:

**Before**:
```typescript
const apiMode = getApiMode();

const response = await axios.post(
  '/api/campaigns/create',
  data,
  {
    headers: {
      'Content-Type': 'application/json',
      'X-API-Mode': apiMode,
    },
  }
);
```

**After**:
```typescript
const response = await axios.post(
  '/api/campaigns/create',
  data,
  {
    headers: {
      'Content-Type': 'application/json',
    },
  }
);
```

**Repeat for all API call functions**:
- `createCampaign()`
- `updateCampaign()`
- `deleteCampaign()`
- `syncCampaigns()`
- Any other API calls that include the header

**Verification**:
- No import errors
- All API calls updated
- Headers no longer include X-API-Mode

---

### Step 8: Restore Zilkr-Only Logic in Campaign Creation Service

**File**: `backend/src/services/campaignCreationService.ts`

**Action**: Uncomment original Zilkr code and remove API mode routing.

1. Find the section where you added API mode routing (around lines 54-80)

2. **Remove** the new API mode routing code:
```typescript
// DELETE THIS ENTIRE SECTION:
// NEW: Use API mode from request to determine service
let service: IPlatformAPI | null = null;

// Check if this is a Google Ads platform
const isGoogleAds = platform.toLowerCase() === 'google' || 
                   platform.toLowerCase() === 'googleads' || 
                   platform.toLowerCase() === 'google ads' ||
                   platform.toLowerCase().includes('google');

if (isGoogleAds) {
  // Get API mode from request (passed via header or body)
  // This will be set in the controller
  const useZilkr = (request as any).apiMode === 'zilkr';
  
  if (useZilkr) {
    service = this.getPlatformService('Zilkr');
  } else {
    service = this.getPlatformService('google'); // Direct Google Ads API
  }
} else {
  // For other platforms, use the registered service
  service = this.getPlatformService(platform);
}
```

3. **Uncomment** the original Zilkr-only code:
```typescript
// RESTORE THIS ORIGINAL CODE:
// For Google Ads campaigns, always use Zilkr Dispatcher instead of direct Google Ads API
// This ensures we use the Zilkr Dispatcher for all Google Ads operations (draft or active)
let service: IPlatformAPI | null = null;

// Check if this is a Google Ads platform
const isGoogleAds = platform.toLowerCase() === 'google' || 
                   platform.toLowerCase() === 'googleads' || 
                   platform.toLowerCase() === 'google ads' ||
                   platform.toLowerCase().includes('google');

if (isGoogleAds) {
  // Always use Zilkr Dispatcher for Google Ads campaigns
  service = this.getPlatformService('Zilkr');
} else {
  // For other platforms, use the registered service
  service = this.getPlatformService(platform);
}
```

**Verification**:
- Original Zilkr logic is restored
- API mode routing is removed
- Google Ads always uses Zilkr

---

### Step 9: Remove API Mode from Campaign Creation Controller

**File**: `backend/src/controllers/campaignCreationController.ts`

**Action**: Remove API mode extraction and passing.

1. Find the `createCampaign` method (around line 43)

2. **Remove** API mode extraction:
```typescript
// DELETE THIS SECTION:
// Extract API mode from header, query, or body (in that order)
const apiMode = req.headers['x-api-mode'] as string || 
                req.query.apiMode as string || 
                req.body.apiMode as string || 
                'direct'; // Default to direct
```

3. **Remove** API mode from request object:
```typescript
// BEFORE:
const request: CampaignCreationRequest = {
  campaignPlan,
  name,
  description,
  metadata,
  ...(status && { status }),
  apiMode, // DELETE THIS LINE
} as any;

// AFTER:
const request: CampaignCreationRequest = {
  campaignPlan,
  name,
  description,
  metadata,
  ...(status && { status }),
} as any;
```

**Verification**:
- API mode extraction removed
- Request object no longer includes apiMode
- No TypeScript errors

---

### Step 10: Restore Zilkr-Only Sync in Campaign Controller

**File**: `backend/src/controllers/campaignController.ts`

**Action**: Remove API mode routing and restore Zilkr-only sync.

1. Find the `syncCampaigns` method (around line 250)

2. **Remove** API mode extraction and routing:
```typescript
// DELETE THIS SECTION:
// Extract API mode
const apiMode = req.headers['x-api-mode'] as string || 
                req.query.apiMode as string || 
                'direct';

if (apiMode === 'zilkr') {
  // Use Zilkr Dispatcher
  const dispatcherService = new ZilkrDispatcherService(accountId, publisher);
  // ... existing Zilkr sync logic ...
} else {
  // Use Direct Google Ads API
  const googleAdsService = new GoogleAdsService();
  // Implement sync using Google Ads API
  // ... Google Ads sync logic ...
}
```

3. **Restore** original Zilkr-only code:
```typescript
// RESTORE ORIGINAL:
// Initialize Zilkr Dispatcher Service
const dispatcherService = new ZilkrDispatcherService(accountId, publisher);

// Query all campaigns (with pagination if needed)
let allCampaigns: ZilkrCampaignResponse[] = [];
// ... rest of original Zilkr sync logic ...
```

**Verification**:
- API mode routing removed
- Only Zilkr Dispatcher is used
- Sync works correctly

---

### Step 11: Remove Direct Google Ads API Implementation (Optional)

**File**: `backend/src/services/googleAdsService.ts`

**Action**: Decide whether to keep or revert GoogleAdsService.

**Option A: Keep Direct Google Ads Implementation** (Recommended)
- Keep the implementation for future use
- Just ensure it's not being called
- Add comment: `// Not currently used - Zilkr Dispatcher is the primary integration`

**Option B: Revert to Mock Implementation**
- If you had mocks before, restore them
- Remove real Google Ads API implementations
- Restore original mock responses

**Recommendation**: Keep Option A - the implementation may be useful later.

**Verification**:
- GoogleAdsService is not being called
- Zilkr Dispatcher is the only active service

---

### Step 12: Verify Zilkr Dispatcher Registration

**File**: `backend/src/controllers/campaignCreationController.ts`

**Action**: Ensure Zilkr Dispatcher is properly registered.

1. Check the `initializePlatformServices` method (around line 24)

2. Verify Zilkr is registered:
```typescript
// Should be present and NOT commented:
const zilkrService = new ZilkrDispatcherService();
campaignCreationService.registerPlatform('Zilkr', zilkrService);
```

3. If it was commented, uncomment it:
```typescript
// UNCOMMENT IF COMMENTED:
// Register Zilkr Dispatcher service for Google Ads campaigns
const zilkrService = new ZilkrDispatcherService();
campaignCreationService.registerPlatform('Zilkr', zilkrService);
```

**Verification**:
- Zilkr service is registered
- Not commented out
- Available for use

---

### Step 13: Remove Toast Notifications (If Added)

**File**: Any files that show toast on API mode change

**Action**: Remove toast notifications related to API mode.

If you added toast notifications in `ApiModeToggle.tsx`, they're already removed since we deleted that file. If you added them elsewhere, remove them.

**Verification**:
- No toast notifications about API mode
- No references to API mode in toast code

---

### Step 14: Clean Up TypeScript Types (If Added)

**Files**: Any type definition files

**Action**: Remove API mode-related types if they were added to shared types.

Check for:
- `ApiMode` type definitions
- `apiMode` fields in interfaces
- Any API mode-related type exports

**Verification**:
- No unused type definitions
- No TypeScript errors

---

### Step 15: Remove localStorage Data (Optional)

**Action**: Clear API mode preference from localStorage.

Users may have the preference stored. You can either:
- Leave it (harmless, just unused)
- Add a migration script to clear it
- Document that it will be ignored

**Recommendation**: Leave it - it's harmless and will be overwritten if toggle is re-implemented.

---

## Testing

### Test 1: Verify Toggle is Removed

**Steps**:
1. Open the application in browser
2. Navigate to Campaign Dashboard
3. Verify API Mode Toggle is NOT visible
4. Navigate to Campaign Preview
5. Verify toggle is NOT visible
6. Navigate to Campaign Generation
7. Verify toggle is NOT visible

**Expected Results**:
- Toggle component is completely removed
- No UI elements related to API mode
- No console errors about missing components

---

### Test 2: Verify No API Mode Header in Requests

**Steps**:
1. Open browser DevTools → Network tab
2. Create a new campaign
3. Inspect the request headers
4. Verify `X-API-Mode` header is NOT present

**Expected Results**:
- No X-API-Mode header in requests
- Requests work normally without the header

---

### Test 3: Verify Zilkr Dispatcher is Used

**Steps**:
1. Create a campaign
2. Check backend logs
3. Verify ZilkrDispatcherService is being called
4. Verify request is sent to Zilkr Dispatcher API
5. Verify campaign is created successfully

**Expected Results**:
- ZilkrDispatcherService methods are called
- Requests sent to Zilkr Dispatcher endpoint
- Campaigns created successfully

---

### Test 4: Verify Direct Google Ads is NOT Used

**Steps**:
1. Create a campaign
2. Check backend logs
3. Verify GoogleAdsService is NOT being called
4. Verify no direct Google Ads API calls are made

**Expected Results**:
- GoogleAdsService is never called
- No direct Google Ads API requests
- All operations go through Zilkr

---

### Test 5: Verify Campaign Creation Works

**Steps**:
1. Create a new campaign with budget
2. Verify budget is created via Zilkr
3. Verify campaign is created via Zilkr
4. Verify campaign appears in dashboard

**Expected Results**:
- Budget creation works
- Campaign creation works
- Campaign appears correctly
- No errors in console

---

### Test 6: Verify Campaign Sync Works

**Steps**:
1. Navigate to Campaign Dashboard
2. Click "Sync Campaigns" (if available)
3. Verify campaigns are synced from Zilkr
4. Verify campaigns appear in list

**Expected Results**:
- Sync operation works
- Campaigns loaded from Zilkr
- No errors during sync

---

### Test 7: Verify No Import Errors

**Steps**:
1. Check browser console for errors
2. Check backend console for errors
3. Verify no "Cannot find module" errors
4. Verify no "undefined is not a function" errors

**Expected Results**:
- No import errors
- No missing module errors
- Application loads without errors

---

### Test 8: Verify TypeScript Compilation

**Steps**:
1. Run `npm run type-check` (if available)
2. Or run `tsc --noEmit`
3. Verify no TypeScript errors

**Expected Results**:
- TypeScript compiles successfully
- No type errors
- No unused import warnings (related to removed code)

---

### Test 9: Verify Build Process

**Steps**:
1. Run `npm run build` (frontend)
2. Verify build completes successfully
3. Run backend build if applicable
4. Verify no build errors

**Expected Results**:
- Build completes successfully
- No errors during build
- Production build works

---

### Test 10: Verify All Campaign Operations

**Steps**:
1. Create a campaign
2. Update a campaign
3. Pause a campaign
4. Resume a campaign
5. Delete a campaign
6. Verify all operations work correctly

**Expected Results**:
- All CRUD operations work
- All operations use Zilkr Dispatcher
- No errors during operations

---

## Rollback Verification Checklist

- [ ] API Mode Store deleted
- [ ] Toggle Component deleted
- [ ] Toggle removed from Campaign Dashboard
- [ ] Toggle removed from Campaign Preview
- [ ] Toggle removed from Campaign Generation
- [ ] API Mode Helper deleted
- [ ] API Mode header removed from all API calls
- [ ] Zilkr-only logic restored in Campaign Creation Service
- [ ] API Mode removed from Campaign Creation Controller
- [ ] Zilkr-only sync restored in Campaign Controller
- [ ] Zilkr Dispatcher properly registered
- [ ] No import errors
- [ ] No TypeScript errors
- [ ] All tests passing
- [ ] Application works with Zilkr only

---

## Post-De-Implementation Cleanup

### Optional: Remove Unused Google Ads Service Code

If you want to completely remove the Direct Google Ads API implementation:

1. **Option A: Comment it out** (Recommended for future use)
   - Add comments indicating it's not currently used
   - Keep code for potential future use

2. **Option B: Delete it entirely**
   - Remove `googleAdsService.ts` implementation
   - Remove from service registration
   - **Warning**: You'll need to re-implement if you want it back

**Recommendation**: Keep it commented for future reference.

---

## Troubleshooting

### Issue: Import errors after removing files

**Solution**: Make sure you removed all imports of deleted files. Search the codebase for:
- `import.*apiModeStore`
- `import.*ApiModeToggle`
- `import.*apiModeHelper`

### Issue: TypeScript errors about missing types

**Solution**: Remove any type definitions related to API mode. Search for:
- `ApiMode` type
- `apiMode` in interfaces

### Issue: Backend still checking for API mode

**Solution**: Make sure you removed all API mode extraction code from controllers.

### Issue: Campaigns not creating

**Solution**: Verify Zilkr Dispatcher is properly registered and configured. Check:
- Zilkr service registration
- Zilkr endpoint URL in config
- Zilkr credentials

---

## Completion Checklist

- [ ] All frontend toggle code removed
- [ ] All API mode state management removed
- [ ] All API mode headers removed from requests
- [ ] Zilkr-only logic restored in backend
- [ ] API mode routing removed from backend
- [ ] Zilkr Dispatcher properly registered
- [ ] No import errors
- [ ] No TypeScript errors
- [ ] All tests passing
- [ ] Application works with Zilkr only
- [ ] Documentation updated (if needed)

---

## Notes

- All Zilkr Dispatcher code should now be active (uncommented)
- Direct Google Ads API code can remain but won't be used
- localStorage preference will be ignored (harmless)
- If you need to re-implement the toggle, refer to the Implementation Guide

---

**Last Updated**: 2025-11-11  
**Status**: Ready for De-Implementation

