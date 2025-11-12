# Implementation Guide: API Mode Toggle (Zilkr Dispatcher ↔ Direct Google Ads API)

**Document Version**: 1.0  
**Created**: 2025-11-11  
**Purpose**: Guide for implementing frontend toggle to switch between Zilkr Dispatcher and Direct Google Ads API  
**Status**: Implementation Ready

---

## Overview

This guide provides step-by-step instructions for implementing a frontend toggle that allows users to switch between using the Zilkr Dispatcher and Direct Google Ads API. The implementation includes:

- Frontend toggle component with state management
- Backend routing logic to handle both API modes
- Direct Google Ads API implementation in GoogleAdsService
- Commenting out (not deleting) Zilkr Dispatcher code for easy rollback

---

## Prerequisites

- Node.js and npm installed
- Backend and frontend dev servers can run
- Google Ads API credentials configured in `.env`
- Understanding of the current codebase structure

---

## Implementation Steps

### Step 1: Create API Mode Store (Frontend)

**File**: `src/store/apiModeStore.ts`

**Action**: Create a new Zustand store for managing API mode preference.

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ApiModeState {
  useZilkrDispatcher: boolean;
  setUseZilkrDispatcher: (value: boolean) => void;
  toggleApiMode: () => void;
}

export const useApiModeStore = create<ApiModeState>()(
  persist(
    (set) => ({
      useZilkrDispatcher: false, // Default to Direct Google Ads API
      setUseZilkrDispatcher: (value) => set({ useZilkrDispatcher: value }),
      toggleApiMode: () => set((state) => ({ useZilkrDispatcher: !state.useZilkrDispatcher })),
    }),
    {
      name: 'api_mode_preference', // localStorage key
    }
  )
);
```

**Verification**:
- File created successfully
- No TypeScript errors
- Store exports correctly

---

### Step 2: Create API Mode Toggle Component (Frontend)

**File**: `src/components/ApiModeToggle.tsx`

**Action**: Create a toggle component with visual indicators.

```typescript
import React from 'react';
import { useApiModeStore } from '../store/apiModeStore';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { InfoIcon } from 'lucide-react';

/**
 * API Mode Toggle Component
 * Allows users to switch between Zilkr Dispatcher and Direct Google Ads API
 */
const ApiModeToggle: React.FC = () => {
  const useZilkr = useApiModeStore((state) => state.useZilkrDispatcher);
  const setUseZilkr = useApiModeStore((state) => state.setUseZilkrDispatcher);

  return (
    <div className="flex items-center gap-3 p-2 border rounded-lg bg-background">
      <div className="flex items-center gap-2">
        <Label htmlFor="api-mode-toggle" className="text-sm font-medium">
          API Mode:
        </Label>
        <Switch
          id="api-mode-toggle"
          checked={useZilkr}
          onCheckedChange={setUseZilkr}
          aria-label="Toggle API mode"
        />
      </div>
      <Badge 
        variant={useZilkr ? 'default' : 'secondary'}
        className="text-xs"
      >
        {useZilkr ? 'Zilkr Dispatcher' : 'Direct Google Ads'}
      </Badge>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs max-w-xs">
              {useZilkr 
                ? 'Using Zilkr Dispatcher for campaign operations. Switch to Direct Google Ads API for direct integration.'
                : 'Using Direct Google Ads API for campaign operations. Switch to Zilkr Dispatcher for managed integration.'}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default ApiModeToggle;
```

**Verification**:
- Component renders without errors
- Toggle switches correctly
- Badge updates with mode change
- Tooltip displays on hover

---

### Step 3: Add Toggle to Campaign Dashboard

**File**: `src/components/CampaignDashboard.tsx`

**Action**: Add the toggle component to the dashboard header.

1. Import the component:
```typescript
import ApiModeToggle from './ApiModeToggle';
```

2. Add to the header section (around line 200-250, in the header/filter area):
```typescript
<div className="flex items-center justify-between mb-4">
  <div className="flex items-center gap-4">
    <h1 className="text-2xl font-bold">Campaign Dashboard</h1>
    <ApiModeToggle />
  </div>
  {/* Existing buttons/actions */}
</div>
```

**Verification**:
- Toggle appears in dashboard header
- Toggle is visible and functional
- Layout doesn't break

---

### Step 4: Add Toggle to Campaign Preview Screen

**File**: `src/components/campaign-preview/CampaignPreviewScreen.tsx`

**Action**: Add toggle near campaign creation actions.

1. Import the component:
```typescript
import ApiModeToggle from '../ApiModeToggle';
```

2. Add to the header or settings area (before campaign creation buttons):
```typescript
<div className="mb-4 flex items-center justify-between">
  <ApiModeToggle />
  {/* Existing action buttons */}
</div>
```

**Verification**:
- Toggle appears on preview screen
- Toggle is accessible before campaign creation

---

### Step 5: Add Toggle to Campaign Generation Screen

**File**: `src/components/campaign-generation/CampaignGenerationScreen.tsx`

**Action**: Add toggle to settings/preferences area.

1. Import the component:
```typescript
import ApiModeToggle from '../ApiModeToggle';
```

2. Add to settings section or header:
```typescript
<div className="settings-section mb-4">
  <ApiModeToggle />
</div>
```

**Verification**:
- Toggle appears on generation screen
- Toggle is in logical location

---

### Step 6: Update Frontend Service to Include API Mode

**File**: `src/services/campaignService.ts`

**Action**: Update API calls to include API mode header.

1. Import the store:
```typescript
import { useApiModeStore } from '../store/apiModeStore';
```

2. Update API request functions to include header:
```typescript
// In each API call function (createCampaign, updateCampaign, etc.)
const useZilkr = useApiModeStore.getState().useZilkrDispatcher;

const response = await axios.post(
  '/api/campaigns/create',
  data,
  {
    headers: {
      'Content-Type': 'application/json',
      'X-API-Mode': useZilkr ? 'zilkr' : 'direct',
    },
  }
);
```

**Note**: Since Zustand stores can't be used directly in service files, you'll need to either:
- Pass the mode as a parameter to service functions, OR
- Create a helper function that reads from localStorage, OR
- Use a singleton pattern to access the store

**Recommended Approach**: Create a helper function:

```typescript
// src/utils/apiModeHelper.ts
export const getApiMode = (): 'zilkr' | 'direct' => {
  const stored = localStorage.getItem('api_mode_preference');
  if (stored) {
    const parsed = JSON.parse(stored);
    return parsed.state?.useZilkrDispatcher ? 'zilkr' : 'direct';
  }
  return 'direct'; // Default
};
```

Then in `campaignService.ts`:
```typescript
import { getApiMode } from '../utils/apiModeHelper';

// In API calls:
const response = await axios.post(
  '/api/campaigns/create',
  data,
  {
    headers: {
      'Content-Type': 'application/json',
      'X-API-Mode': getApiMode(),
    },
  }
);
```

**Verification**:
- Helper function works correctly
- API calls include correct header
- Mode is read from localStorage correctly

---

### Step 7: Create API Mode Helper Utility

**File**: `src/utils/apiModeHelper.ts`

**Action**: Create utility to read API mode from localStorage.

```typescript
/**
 * API Mode Helper
 * Utility functions for reading API mode preference
 */

export type ApiMode = 'zilkr' | 'direct';

/**
 * Get current API mode from localStorage
 * @returns 'zilkr' or 'direct'
 */
export const getApiMode = (): ApiMode => {
  try {
    const stored = localStorage.getItem('api_mode_preference');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.state?.useZilkrDispatcher ? 'zilkr' : 'direct';
    }
  } catch (error) {
    console.error('Error reading API mode preference:', error);
  }
  return 'direct'; // Default to direct Google Ads API
};

/**
 * Check if Zilkr Dispatcher is enabled
 * @returns true if Zilkr mode is active
 */
export const isZilkrMode = (): boolean => {
  return getApiMode() === 'zilkr';
};
```

**Verification**:
- Helper functions work correctly
- Handles localStorage errors gracefully
- Returns correct default value

---

### Step 8: Update Campaign Service to Use API Mode

**File**: `src/services/campaignService.ts`

**Action**: Update all API calls to include X-API-Mode header.

For each API call function (createCampaign, updateCampaign, deleteCampaign, etc.):

```typescript
import { getApiMode } from '../utils/apiModeHelper';

// Example for createCampaign:
async createCampaign(campaignData: CampaignCreationRequest): Promise<Campaign> {
  const apiMode = getApiMode();
  
  const response = await axios.post<CampaignCreationResponse>(
    '/api/campaigns/create',
    campaignData,
    {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Mode': apiMode,
      },
    }
  );
  
  return response.data;
}
```

**Verification**:
- All API calls include X-API-Mode header
- Header value matches current toggle state
- No TypeScript errors

---

### Step 9: Comment Out Zilkr Dispatcher Usage in Campaign Creation Service

**File**: `backend/src/services/campaignCreationService.ts`

**Action**: Comment out the logic that forces Google Ads to use Zilkr, and add routing based on API mode.

1. Find the section (around lines 54-66):
```typescript
// TEMPORARY: Commented out - Using Direct Google Ads API by default
// Can be re-enabled when Zilkr Dispatcher is ready
/*
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
*/

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

**Verification**:
- Old code is commented, not deleted
- New routing logic works correctly
- Service selection based on API mode

---

### Step 10: Update Campaign Creation Controller to Pass API Mode

**File**: `backend/src/controllers/campaignCreationController.ts`

**Action**: Extract API mode from request and pass to service.

1. Update `createCampaign` method (around line 43):
```typescript
createCampaign = async (req: Request, res: Response): Promise<void> => {
  try {
    const { campaignPlan, name, description, metadata } = req.body;

    // Extract API mode from header, query, or body (in that order)
    const apiMode = req.headers['x-api-mode'] as string || 
                    req.query.apiMode as string || 
                    req.body.apiMode as string || 
                    'direct'; // Default to direct

    // Validate request
    if (!campaignPlan || !name) {
      res.status(400).json({
        error: 'Invalid request',
        message: 'campaignPlan and name are required',
      });
      return;
    }

    // ... existing validation ...

    const request: CampaignCreationRequest = {
      campaignPlan,
      name,
      description,
      metadata,
      ...(status && { status }),
      apiMode, // Pass API mode to service
    } as any;

    // Create campaign
    const response = await campaignCreationService.createCampaign(request);

    // ... rest of the method ...
  } catch (error) {
    // ... error handling ...
  }
};
```

**Verification**:
- API mode is extracted correctly
- Defaults to 'direct' if not provided
- Passed correctly to service

---

### Step 11: Comment Out Zilkr Registration in Controller

**File**: `backend/src/controllers/campaignCreationController.ts`

**Action**: Comment out Zilkr Dispatcher service registration (keep for reference).

Around line 32-34:
```typescript
// TEMPORARY: Commented out - Zilkr Dispatcher registration
// Can be re-enabled when switching back to Zilkr-only mode
/*
// Register Zilkr Dispatcher service for Google Ads campaigns (used for draft creation)
const zilkrService = new ZilkrDispatcherService();
campaignCreationService.registerPlatform('Zilkr', zilkrService);
*/

// Keep Zilkr service available for toggle functionality
const zilkrService = new ZilkrDispatcherService();
campaignCreationService.registerPlatform('Zilkr', zilkrService);
```

**Note**: Actually, we want to keep Zilkr registered so the toggle works. Only comment out the forced usage, not the registration.

**Verification**:
- Zilkr service still registered
- Can be used when toggle is on

---

### Step 12: Update Campaign Controller Sync Method

**File**: `backend/src/controllers/campaignController.ts`

**Action**: Update `syncCampaigns` to use API mode.

Around line 250-270:
```typescript
syncCampaigns = async (req: Request, res: Response): Promise<void> => {
  try {
    const accountId = (req.query.accountId as string) || config.zilkrDispatcher.accountId;
    const publisher = (req.query.publisher as string) || config.zilkrDispatcher.publisher;

    // Extract API mode
    const apiMode = req.headers['x-api-mode'] as string || 
                    req.query.apiMode as string || 
                    'direct';

    if (!accountId) {
      res.status(400).json({
        error: 'Invalid request',
        message: 'Account ID is required.',
      });
      return;
    }

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
  } catch (error) {
    // ... error handling ...
  }
};
```

**Verification**:
- Sync method routes correctly based on API mode
- Both paths work correctly

---

### Step 13: Implement Direct Google Ads API Methods

**File**: `backend/src/services/googleAdsService.ts`

**Action**: Replace mock implementations with real Google Ads API calls.

**Required Methods to Implement**:

1. **createBudget()** - Create budget resource
2. **createCampaign()** - Create campaign with budget reference
3. **updateCampaign()** - Update existing campaign
4. **pauseCampaign()** - Pause campaign
5. **resumeCampaign()** - Resume campaign
6. **deleteCampaign()** - Delete campaign
7. **getCampaignStatus()** - Get campaign status
8. **queryCampaigns()** - Query/list campaigns (for sync)

**Example Implementation Structure**:

```typescript
import { GoogleAdsApi, Customer } from 'google-ads-api';
import config from '../config/env';

export class GoogleAdsService extends BasePlatformAPI implements IPlatformAPI {
  private client: GoogleAdsApi;
  private customer: Customer;

  constructor(accessToken?: string, customerId?: string) {
    super('Google Ads', accessToken);
    
    // Initialize Google Ads API client
    this.client = new GoogleAdsApi({
      client_id: config.googleAdsClientId,
      client_secret: config.googleAdsClientSecret,
      developer_token: config.googleAdsDeveloperToken,
    });

    const customerIdToUse = customerId || config.googleAdsCustomerId;
    this.customer = this.client.Customer({
      customer_id: customerIdToUse,
      refresh_token: config.googleAdsRefreshToken,
    });
  }

  async createBudget(amount: number, type: string = 'STANDARD'): Promise<PlatformAPIResponse> {
    try {
      // Create budget using Google Ads API
      const budget = await this.customer.campaignBudgets.create({
        name: `Budget ${Date.now()}`,
        amount_micros: amount * 1_000_000, // Convert to micros
        delivery_method: 'STANDARD',
      });

      return {
        success: true,
        budgetId: budget.resource_name,
        details: budget,
      };
    } catch (error) {
      return this.handleError(error, 'createBudget');
    }
  }

  async createCampaign(
    campaignPlan: CampaignPlan,
    name: string,
    status: 'ENABLED' | 'PAUSED' | 'REMOVED' = 'ENABLED'
  ): Promise<PlatformAPIResponse> {
    try {
      // Step 1: Create budget first
      const budgetAmount = campaignPlan.budget.total || campaignPlan.budget.daily || 0;
      const budgetResponse = await this.createBudget(budgetAmount);
      
      if (!budgetResponse.success || !budgetResponse.budgetId) {
        return {
          success: false,
          error: 'Failed to create budget',
        };
      }

      // Step 2: Create campaign with budget reference
      const campaign = await this.customer.campaigns.create({
        name,
        advertising_channel_type: 'SEARCH',
        status: status,
        campaign_budget: budgetResponse.budgetId,
        // ... map other campaignPlan fields ...
      });

      return {
        success: true,
        campaignId: campaign.resource_name,
        details: campaign,
      };
    } catch (error) {
      return this.handleError(error, 'createCampaign');
    }
  }

  // Implement other methods similarly...
}
```

**Verification**:
- All methods implemented
- Budget creation works
- Campaign creation works with budget reference
- Error handling is comprehensive

---

### Step 14: Add Toast Notification on Toggle Change

**File**: `src/components/ApiModeToggle.tsx`

**Action**: Add toast notification when mode changes.

```typescript
import { toast } from 'sonner'; // or your toast library
import { useApiModeStore } from '../store/apiModeStore';

const ApiModeToggle: React.FC = () => {
  const useZilkr = useApiModeStore((state) => state.useZilkrDispatcher);
  const setUseZilkr = useApiModeStore((state) => state.setUseZilkrDispatcher);

  const handleToggle = (checked: boolean) => {
    setUseZilkr(checked);
    toast.success(
      `Switched to ${checked ? 'Zilkr Dispatcher' : 'Direct Google Ads API'}`,
      {
        description: 'This setting will be used for all campaign operations.',
      }
    );
  };

  return (
    // ... existing JSX with onCheckedChange={handleToggle} ...
  );
};
```

**Verification**:
- Toast appears on toggle
- Message is clear and informative

---

### Step 15: Add Visual Indicator in Campaign List

**File**: `src/components/CampaignDashboard.tsx`

**Action**: Show which API mode was used to create each campaign (if stored).

This is optional but helpful for debugging. You could add a badge or icon next to campaigns showing their creation mode.

**Verification**:
- Visual indicators work correctly
- Don't clutter the UI

---

## Testing

### Test 1: Toggle Functionality

**Steps**:
1. Open the application in browser
2. Navigate to Campaign Dashboard
3. Locate the API Mode Toggle
4. Verify default is "Direct Google Ads"
5. Toggle to "Zilkr Dispatcher"
6. Verify badge updates
7. Refresh page
8. Verify preference persists

**Expected Results**:
- Toggle switches correctly
- Badge updates immediately
- Preference persists after refresh
- Toast notification appears

---

### Test 2: API Mode Header in Requests

**Steps**:
1. Open browser DevTools → Network tab
2. Set toggle to "Direct Google Ads"
3. Create a new campaign
4. Inspect the request headers
5. Verify `X-API-Mode: direct` header is present
6. Toggle to "Zilkr Dispatcher"
7. Create another campaign
8. Verify `X-API-Mode: zilkr` header is present

**Expected Results**:
- Correct header is sent with each request
- Header value matches toggle state

---

### Test 3: Backend Routing - Direct Google Ads

**Steps**:
1. Set toggle to "Direct Google Ads"
2. Create a campaign
3. Check backend logs
4. Verify GoogleAdsService is used
5. Verify campaign is created in Google Ads

**Expected Results**:
- Backend receives correct API mode
- GoogleAdsService methods are called
- Campaign created successfully in Google Ads

---

### Test 4: Backend Routing - Zilkr Dispatcher

**Steps**:
1. Set toggle to "Zilkr Dispatcher"
2. Create a campaign
3. Check backend logs
4. Verify ZilkrDispatcherService is used
5. Verify request is sent to Zilkr Dispatcher API

**Expected Results**:
- Backend receives correct API mode
- ZilkrDispatcherService methods are called
- Request sent to Zilkr Dispatcher endpoint

---

### Test 5: Budget Creation - Direct Google Ads

**Steps**:
1. Set toggle to "Direct Google Ads"
2. Create a campaign with budget
3. Verify budget is created first
4. Verify campaign references budget correctly

**Expected Results**:
- Budget created before campaign
- Campaign references budget resource correctly
- No errors in budget creation

---

### Test 6: Campaign Sync - Both Modes

**Steps**:
1. Set toggle to "Direct Google Ads"
2. Sync campaigns from Google Ads
3. Verify campaigns are loaded
4. Switch toggle to "Zilkr Dispatcher"
5. Sync campaigns again
6. Verify campaigns are loaded from Zilkr

**Expected Results**:
- Both sync methods work correctly
- Campaigns load in both modes
- No errors during sync

---

### Test 7: Error Handling

**Steps**:
1. Set toggle to "Zilkr Dispatcher"
2. Disconnect from network (or disable Zilkr endpoint)
3. Try to create a campaign
4. Verify error is handled gracefully
5. Verify user can switch to Direct Google Ads as fallback

**Expected Results**:
- Errors are caught and displayed
- User can switch modes as fallback
- No application crashes

---

### Test 8: Toggle on All Pages

**Steps**:
1. Navigate to Campaign Dashboard
2. Verify toggle is visible
3. Navigate to Campaign Preview
4. Verify toggle is visible
5. Navigate to Campaign Generation
6. Verify toggle is visible
7. Toggle on one page
8. Navigate to another page
9. Verify toggle state is consistent

**Expected Results**:
- Toggle appears on all specified pages
- Toggle state is consistent across pages
- State persists across navigation

---

### Test 9: Concurrent Operations

**Steps**:
1. Set toggle to "Direct Google Ads"
2. Start creating a campaign
3. While creation is in progress, toggle to "Zilkr Dispatcher"
4. Verify current operation completes with original mode
5. Verify next operation uses new mode

**Expected Results**:
- Current operations complete with original mode
- New operations use updated mode
- No race conditions

---

### Test 10: LocalStorage Persistence

**Steps**:
1. Set toggle to "Zilkr Dispatcher"
2. Close browser
3. Reopen browser
4. Navigate to application
5. Verify toggle is still set to "Zilkr Dispatcher"

**Expected Results**:
- Preference persists across browser sessions
- Toggle state is restored correctly

---

## Rollback Notes

If you need to rollback this implementation:

1. All Zilkr Dispatcher code is commented, not deleted
2. Simply uncomment the Zilkr-specific code
3. Remove or comment the toggle-related code
4. Remove API mode routing logic
5. See De-Implementation Guide for detailed steps

---

## Troubleshooting

### Issue: Toggle doesn't persist after refresh

**Solution**: Check that `persist` middleware is correctly configured in the store.

### Issue: API mode header not being sent

**Solution**: Verify `getApiMode()` helper is being called in service functions.

### Issue: Backend not receiving API mode

**Solution**: Check request headers in Network tab, verify header name is `X-API-Mode` (case-sensitive).

### Issue: Both services being called

**Solution**: Verify routing logic in `campaignCreationService.ts` is using correct conditional.

---

## Completion Checklist

- [ ] API Mode Store created
- [ ] Toggle Component created
- [ ] Toggle added to Campaign Dashboard
- [ ] Toggle added to Campaign Preview Screen
- [ ] Toggle added to Campaign Generation Screen
- [ ] API Mode Helper utility created
- [ ] Frontend service updated to include header
- [ ] Backend controller extracts API mode
- [ ] Backend service routes based on API mode
- [ ] Direct Google Ads API methods implemented
- [ ] Zilkr code commented (not deleted)
- [ ] Toast notifications added
- [ ] All tests passing
- [ ] Documentation updated

---

**Last Updated**: 2025-11-11  
**Status**: Ready for Implementation

