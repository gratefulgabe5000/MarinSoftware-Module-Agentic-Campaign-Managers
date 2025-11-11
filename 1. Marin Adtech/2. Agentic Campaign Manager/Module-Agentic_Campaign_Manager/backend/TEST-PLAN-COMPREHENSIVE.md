# Comprehensive Test Plan - Agentic Campaign Manager

**Date**: 2025-11-11  
**Status**: Ready for Testing  
**Priority**: High

---

## Overview

This document outlines all testing requirements for the Agentic Campaign Manager, organized by:
1. **Tests We Can Run NOW** (without budget endpoint)
2. **Tests We Need to Run AFTER** (budget endpoint available)
3. **Regression Tests** (after rebranding and bug fixes)

---

## ✅ Tests We Can Run NOW

### 1. **Rebranding Verification** (Marin → Zilkr)

**Status**: ✅ Ready to Test

#### 1.1 Backend Rebranding
- [ ] All service files use `ZilkrDispatcherService` (not `MarinDispatcherService`)
- [ ] All type files use `Zilkr*` types (not `Marin*`)
- [ ] Environment variables use `ZILKR_DISPATCHER_*` (not `MARIN_DISPATCHER_*`)
- [ ] All imports reference `zilkr*` files (not `marin*`)
- [ ] Error messages reference "Zilkr" (not "Marin")
- [ ] API paths still use `/api/v2/dispatcher/` (verified correct)

**Test Files**:
- `grep -r "Marin\|marin" src/` (should return minimal results - only in comments/docs)
- `grep -r "Zilkr\|zilkr" src/` (should return many results)

#### 1.2 Frontend Rebranding
- [ ] Campaign Dashboard shows "Zilkr" (not "Marin")
- [ ] Sync button says "Sync from Zilkr" (not "Sync from Marin")
- [ ] Error messages reference "Zilkr Dispatcher" (not "Marin Dispatcher")
- [ ] All UI text updated to "Zilkr"

**Test Files**:
- Manual UI testing
- `grep -r "Marin\|marin" src/` in frontend

#### 1.3 Lambda/Example Files Rebranding
- [ ] All Lambda handlers use `Zilkr*Client` (not `Marin*Client`)
- [ ] All example files reference "Zilkr" (not "Marin")
- [ ] Database column references use `zilkr_id` (not `marin_id`)

**Test Files**:
- `grep -r "Marin\|marin" src/bulk-worker/ src/campaign-mgmt/ src/examples/`

---

### 2. **Sync Functionality** (Campaign Dashboard)

**Status**: ✅ Ready to Test

#### 2.1 Sync Button
- [ ] "Sync from Zilkr" button appears in Campaign Dashboard
- [ ] Button shows loading state while syncing
- [ ] Button shows error state if sync fails
- [ ] Button shows success state after sync completes

#### 2.2 Sync API Endpoint
- [ ] `POST /api/campaigns/sync` endpoint exists
- [ ] Endpoint calls `ZilkrDispatcherService.getCampaigns()`
- [ ] Endpoint handles pagination correctly
- [ ] Endpoint maps Zilkr Dispatcher campaigns to internal format
- [ ] Endpoint returns campaigns with correct structure

#### 2.3 Sync Data Flow
- [ ] Sync fetches campaigns from Zilkr Dispatcher
- [ ] Sync merges with existing campaigns in store
- [ ] Sync updates Campaign Dashboard with new campaigns
- [ ] Sync handles errors gracefully (shows error message)
- [ ] Sync handles empty results (no campaigns found)

**Test Files**:
- Manual UI testing: Click "Sync from Zilkr" button
- `test-connectivity-query.js` (verify API connectivity)

---

### 3. **Campaign Dashboard Features** (BUG-007, BUG-008)

**Status**: ✅ Ready to Test

#### 3.1 Tag Management (BUG-007)
- [ ] Tags can be added to campaigns (inline)
- [ ] Tags can be removed from campaigns
- [ ] Tags are displayed as badges on campaign cards
- [ ] Tag filter dropdown shows all unique tags
- [ ] Tag filter filters campaigns correctly
- [ ] Multiple tags can be selected for filtering
- [ ] "Delete All Filtered" button appears when tags are filtered
- [ ] Batch delete works with tag filtering

#### 3.2 Category Filtering (BUG-008)
- [ ] Category filter buttons appear in Campaign Dashboard
- [ ] Categories are extracted from campaign data correctly
- [ ] Category filter filters campaigns correctly
- [ ] Category count shows correct number of campaigns per category
- [ ] Category badges are clickable and filter campaigns
- [ ] "Delete All Filtered" button shows active category filter
- [ ] Batch delete works with category filtering

#### 3.3 Batch Actions
- [ ] "Delete All Filtered" button appears when filters are active
- [ ] Batch delete confirmation dialog shows correct count
- [ ] Batch delete deletes all filtered campaigns
- [ ] Batch delete handles errors gracefully
- [ ] Batch delete updates Campaign Dashboard after deletion

**Test Files**:
- Manual UI testing: Campaign Dashboard
- Test tag filtering, category filtering, batch delete

---

### 4. **Error Handling Improvements**

**Status**: ✅ Ready to Test

#### 4.1 Frontend Error Display
- [ ] Error messages are properly serialized (no `[object Object]`)
- [ ] Error messages show clear, user-friendly text
- [ ] Error messages include relevant details (status codes, API errors)
- [ ] Error messages are displayed in UI (alerts, toasts)

#### 4.2 Backend Error Handling
- [ ] `createBudget()` provides clear error message for 404
- [ ] Error messages indicate missing endpoint clearly
- [ ] Error messages include request details for debugging
- [ ] Error handling preserves original error information

**Test Files**:
- Manual testing: Try to create draft campaign (will fail with clear error)
- `test-error-handling.js`

---

### 5. **API Connectivity & Read Operations**

**Status**: ✅ Ready to Test

#### 5.1 API Connectivity
- [ ] `GET /api/v2/dispatcher/google/campaigns` works (query existing campaigns)
- [ ] API authentication works correctly
- [ ] API returns campaigns in correct format
- [ ] API handles pagination correctly

#### 5.2 Campaign Query
- [ ] Can query existing campaigns from Zilkr Dispatcher
- [ ] Campaign data is correctly mapped to internal format
- [ ] Campaign metadata is preserved correctly

**Test Files**:
- `test-connectivity-query.js`
- `test-phase4-COMPREHENSIVE-API-TESTS.js` (read operations)

---

### 6. **Build & Compilation**

**Status**: ✅ Ready to Test

#### 6.1 TypeScript Compilation
- [ ] `npm run build` completes without errors
- [ ] No TypeScript compilation errors
- [ ] No import errors (all files resolve correctly)
- [ ] All type definitions are correct

#### 6.2 Linting
- [ ] `npm run lint` passes without errors
- [ ] No ESLint errors
- [ ] Code style is consistent

#### 6.3 Runtime
- [ ] Backend server starts without errors
- [ ] Frontend server starts without errors
- [ ] No runtime errors in console
- [ ] Application loads correctly in browser

**Test Files**:
- `npm run build`
- `npm run lint`
- Manual: Start dev servers, check console

---

## ⏳ Tests We Need to Run AFTER Budget Endpoint

### 1. **Budget Creation** (Blocked by Missing Endpoint)

**Status**: ⏳ Waiting for Zilkr Dispatcher Endpoint

#### 1.1 Budget Creation Endpoint
- [ ] `POST /api/v2/dispatcher/google/campaign-budgets` returns `200 OK`
- [ ] Endpoint accepts `{ accountId, amount, deliveryMethod }`
- [ ] Endpoint returns `{ budgetId, resourceName, status }`
- [ ] `resourceName` follows format: `customers/{ID}/campaignBudgets/{BUDGET_ID}`
- [ ] Endpoint handles both `STANDARD` and `ACCELERATED` delivery methods
- [ ] Endpoint validates input (amount > 0, valid deliveryMethod)
- [ ] Endpoint returns clear error messages for invalid input

#### 1.2 Budget Creation Integration
- [ ] `ZilkrDispatcherService.createBudget()` works correctly
- [ ] Budget creation happens before campaign creation
- [ ] Budget resource reference is used in campaign creation
- [ ] Budget creation errors are handled gracefully

**Test Files**:
- `test-budget-and-campaign-creation.js`
- `test-phase4-COMPREHENSIVE-API-TESTS.js` (after endpoint available)

---

### 2. **Campaign Creation** (Draft & Active)

**Status**: ⏳ Waiting for Budget Endpoint

#### 2.1 Draft Campaign Creation
- [ ] "Create as Draft in Google Ads" button works
- [ ] Draft campaign is created with `PAUSED` status
- [ ] Draft campaign appears in Campaign Dashboard
- [ ] Draft campaign has correct metadata (tags, category)
- [ ] Draft campaign can be enabled later from dashboard

#### 2.2 Active Campaign Creation
- [ ] Campaign can be created with `ENABLED` status
- [ ] Campaign appears in Campaign Dashboard
- [ ] Campaign appears in Google Ads console
- [ ] Campaign has correct budget reference

#### 2.3 Campaign Creation Workflow
- [ ] Budget is created first
- [ ] Budget resource reference is obtained
- [ ] Campaign is created with budget reference
- [ ] Campaign includes all required fields:
  - `name`
  - `status`
  - `advertisingChannelType`
  - `startDate`
  - `campaignBudget` (resource reference)
  - `biddingStrategy`
  - `networkSettings` (for SEARCH campaigns)

**Test Files**:
- `test-budget-and-campaign-creation.js`
- `test-complete-workflow-e2e.js`
- Manual UI testing: Create draft campaign from preview screen

---

### 3. **End-to-End Campaign Creation Workflow**

**Status**: ⏳ Waiting for Budget Endpoint

#### 3.1 Complete Workflow
- [ ] CSV upload → Campaign generation → Preview → Create Draft
- [ ] Campaign appears in Campaign Dashboard
- [ ] Campaign can be enabled from dashboard
- [ ] Campaign appears in Google Ads console
- [ ] Campaign has correct budget, settings, and metadata

#### 3.2 Campaign Lifecycle
- [ ] Create campaign (draft)
- [ ] Enable campaign (from dashboard)
- [ ] Pause campaign (from dashboard)
- [ ] Resume campaign (from dashboard)
- [ ] Delete campaign (from dashboard)
- [ ] Campaign is deleted from Google Ads

**Test Files**:
- `test-complete-workflow-e2e.js`
- Manual end-to-end testing

---

## 🔄 Regression Tests (After Rebranding & Bug Fixes)

### 1. **Existing Functionality Still Works**

#### 1.1 CSV Upload & Processing
- [ ] CSV upload works correctly
- [ ] Campaign generation from CSV works
- [ ] Preview screen displays campaigns correctly
- [ ] Inline editing works (keywords, ads, ad groups)
- [ ] Delete functionality works (keywords, ads)

#### 1.2 Export Functionality
- [ ] "Export to Google Ads Editor" button works
- [ ] CSV export includes all required fields
- [ ] CSV export format is correct for Google Ads Editor
- [ ] Export validation works

#### 1.3 Campaign Management
- [ ] Campaign Dashboard displays campaigns correctly
- [ ] Campaign filtering works (status, tags, category)
- [ ] Campaign search works
- [ ] Campaign sorting works

---

### 2. **API Integration**

#### 2.1 Zilkr Dispatcher Integration
- [ ] All API calls use correct path (`/api/v2/dispatcher/`)
- [ ] All API calls include required headers
- [ ] All API calls handle errors correctly
- [ ] All API responses are mapped correctly

#### 2.2 Error Handling
- [ ] Network errors are handled gracefully
- [ ] API errors (400, 404, 500) are handled correctly
- [ ] Error messages are user-friendly
- [ ] Error messages include relevant details

---

## 📋 Test Execution Checklist

### Phase 1: Immediate Tests (Can Run Now)
- [ ] **Rebranding Verification** (Backend, Frontend, Lambda)
- [ ] **Sync Functionality** (Button, API, Data Flow)
- [ ] **Campaign Dashboard Features** (Tags, Categories, Batch Actions)
- [ ] **Error Handling** (Frontend, Backend)
- [ ] **API Connectivity** (Read operations)
- [ ] **Build & Compilation** (TypeScript, Linting, Runtime)

### Phase 2: After Budget Endpoint Available
- [ ] **Budget Creation** (Endpoint, Integration)
- [ ] **Campaign Creation** (Draft, Active, Workflow)
- [ ] **End-to-End Workflow** (Complete lifecycle)

### Phase 3: Regression Tests
- [ ] **Existing Functionality** (CSV, Export, Management)
- [ ] **API Integration** (All endpoints, Error handling)

---

## 🧪 Test Files Reference

### Backend Test Files
- `test-connectivity-query.js` - API connectivity
- `test-budget-and-campaign-creation.js` - Budget & campaign creation (after endpoint)
- `test-complete-workflow-e2e.js` - End-to-end workflow
- `test-error-handling.js` - Error handling scenarios
- `test-infra-compliance.js` - Environment variables, API paths
- `test-service-init.js` - Service initialization
- `test-api-path-compliance.js` - API path format
- `test-phase4-COMPREHENSIVE-API-TESTS.js` - Comprehensive API tests

### Frontend Test Files
- Manual UI testing (Campaign Dashboard, Preview Screen)
- Browser DevTools console checks

---

## 🎯 Priority Order

1. **HIGH PRIORITY** (Can Test Now):
   - Rebranding verification
   - Sync functionality
   - Campaign Dashboard features
   - Build & compilation

2. **MEDIUM PRIORITY** (After Budget Endpoint):
   - Budget creation
   - Campaign creation
   - End-to-end workflow

3. **LOW PRIORITY** (Regression):
   - Existing functionality verification
   - API integration verification

---

## 📝 Notes

- **Budget Endpoint**: All campaign creation tests are blocked until `POST /api/v2/dispatcher/google/campaign-budgets` is implemented
- **Rebranding**: All "Marin" references should be changed to "Zilkr" (verify with grep)
- **Error Handling**: Improved error messages should be tested with actual API calls
- **Sync Functionality**: Should work now (read-only operation)

---

**Last Updated**: 2025-11-11  
**Status**: Ready for Testing

