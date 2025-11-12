# Next 10 Tasks - Parallel Work Plan
**Created**: 2025-11-12
**For**: GABE & VANES
**Priority**: Foundation Layer + Critical Bug Fixes
**Work Mode**: Parallel Development

---

## Overview

This document outlines the next 10 critical tasks to be completed in parallel by Gabe (backend) and Vanes (frontend). These tasks form the foundation for the Customer Profile Workflow feature while also addressing critical bug fixes.

**Execution Strategy**:
- **GABE**: Focus on database schema, repositories, and backend services
- **VANES**: Focus on bug fixes and prepare frontend services (stub out APIs as needed)
- Both developers can work simultaneously on different parts of the system

---

## GABE's Tasks (Backend - 5 Tasks)

### Task 1: Design Database Schema
**Task ID**: 1.2.1
**Priority**: 🔴 Critical
**Status**: 🔴 Open
**Dependencies**: None (types already completed)
**Estimated Time**: 4-6 hours

**Description**:
Design comprehensive database schema for storing Customer Profile objects with full versioning support, soft delete functionality, and proper indexing.

**Objectives**:
- [ ] Review existing database schema patterns in `backend/src/database/`
- [ ] Design `target_customer_profiles` table with comprehensive structure
- [ ] Design `brand_guidelines` table with comprehensive structure
- [ ] Design `budgets` table with comprehensive structure
- [ ] Design `customer_profile_containers` table
- [ ] Design `campaign_profile_usage` junction table for usage tracking
- [ ] Create comprehensive migration file
- [ ] Create ORM schema file (if using ORM)
- [ ] Document schema decisions in `CUSTOMER_PROFILES_SCHEMA_DOC.md`
- [ ] Review schema with team for feedback
- [ ] Verify schema supports all use cases (versioning, soft delete, indexing)

**Deliverables**:
- `backend/src/database/migrations/XXXX_create_customer_profiles.sql`
- `backend/src/database/schema/customerProfiles.schema.ts` (if using ORM)
- `backend/src/database/schema/CUSTOMER_PROFILES_SCHEMA_DOC.md`

---

### Task 2: Create Database Models/Repositories
**Task ID**: 1.2.2
**Priority**: 🔴 Critical
**Status**: 🔴 Open
**Dependencies**: Task 1 (1.2.1)
**Estimated Time**: 6-8 hours

**Description**:
Create comprehensive database repositories or models for CRUD operations on Customer Profile objects with error handling, logging, and transaction support.

**Objectives**:
- [ ] Review existing repository patterns in `backend/src/repositories/`
- [ ] Create `targetCustomerProfileRepository.ts` with comprehensive CRUD methods
- [ ] Create `brandGuidelinesRepository.ts` with same comprehensive pattern
- [ ] Create `budgetRepository.ts` with same comprehensive pattern
- [ ] Create `customerProfileContainerRepository.ts`
- [ ] Create `accountProfileStatusRepository.ts`
- [ ] Create `campaignProfileUsageRepository.ts`
- [ ] Add comprehensive error handling to all repository methods
- [ ] Add comprehensive logging to all repository methods
- [ ] Add transaction support for multi-step operations
- [ ] Add unit tests for all repository methods
- [ ] Add integration tests

**Deliverables**:
- `backend/src/repositories/targetCustomerProfileRepository.ts`
- `backend/src/repositories/brandGuidelinesRepository.ts`
- `backend/src/repositories/budgetRepository.ts`
- `backend/src/repositories/customerProfileContainerRepository.ts`
- `backend/src/repositories/accountProfileStatusRepository.ts`
- `backend/src/repositories/campaignProfileUsageRepository.ts`
- Test files for all repositories

---

### Task 3: Fix BUG-005 - URLs Not Verified to Exist/Be Reachable
**Task ID**: 2.1.1
**Priority**: 🟡 Medium
**Status**: 🔴 Open
**Dependencies**: None (can work in parallel)
**Estimated Time**: 3-4 hours

**Description**:
URLs are only validated for format, not verified to exist/be reachable. Invalid or broken URLs can pass validation and cause downstream issues. Add URL verification with configurable timeout and error handling.

**Objectives**:
- [ ] Read `backend/src/services/productParsingService.ts` to understand current URL validation
- [ ] Create `backend/src/utils/urlVerification.ts` utility
- [ ] Add URL verification function (HTTP HEAD or GET request)
- [ ] Implement optional URL verification (configurable)
- [ ] Add timeout handling (5-10 seconds)
- [ ] Add error handling for unreachable URLs
- [ ] Add warning messages for unreachable URLs
- [ ] Update CSV upload to use URL verification
- [ ] Update URL list input to use URL verification
- [ ] Add configuration option to enable/disable verification
- [ ] Add unit tests for URL verification

**Deliverables**:
- `backend/src/utils/urlVerification.ts` (new utility)
- Updated `backend/src/services/productParsingService.ts`
- Test files for URL verification

---

### Task 4: Create Customer Profile Service
**Task ID**: 3.1.1
**Priority**: 🔴 Critical
**Status**: 🔴 Open
**Dependencies**: Task 2 (1.2.2)
**Estimated Time**: 5-7 hours

**Description**:
Create comprehensive service layer for Customer Profile operations with business logic, validation, authorization, and error handling.

**Objectives**:
- [ ] Review existing service patterns in `backend/src/services/`
- [ ] Create `customerProfileService.ts` with comprehensive service methods (CRUD, versioning, soft delete)
- [ ] Add comprehensive input validation
- [ ] Add comprehensive authorization checks
- [ ] Add comprehensive error handling
- [ ] Add comprehensive logging
- [ ] Create `brandGuidelinesService.ts` with same comprehensive pattern
- [ ] Create `budgetService.ts` with same comprehensive pattern
- [ ] Add unit tests for all service methods
- [ ] Add integration tests

**Deliverables**:
- `backend/src/services/customerProfileService.ts`
- `backend/src/services/brandGuidelinesService.ts`
- `backend/src/services/budgetService.ts`
- Test files for all services

---

### Task 5: Create Account Profile Status Service
**Task ID**: 3.1.3
**Priority**: 🔴 Critical
**Status**: 🔴 Open
**Dependencies**: Task 2 (1.2.2)
**Estimated Time**: 2-3 hours

**Description**:
Create service to check account profile status and detect first-time users. This service is critical for triggering the onboarding flow.

**Objectives**:
- [ ] Create `accountProfileStatusService.ts` with comprehensive methods
- [ ] Implement first-time user detection logic
- [ ] Add caching (optional but recommended)
- [ ] Add comprehensive error handling
- [ ] Add comprehensive logging
- [ ] Add unit tests
- [ ] Add integration tests

**Deliverables**:
- `backend/src/services/accountProfileStatusService.ts`
- Test files for service

---

## VANES' Tasks (Frontend - 5 Tasks)

### Task 6: Fix BUG-012 - Inline Editing Behavior Issues
**Task ID**: 2.1.2
**Priority**: 🟡 Medium
**Status**: 🔴 Open
**Dependencies**: None (can start immediately)
**Estimated Time**: 4-5 hours

**Description**:
Inline editing currently saves automatically on blur instead of requiring explicit "Save" button. Inline editing is also enabled by clicking text directly instead of requiring "Edit" button activation. This needs to be fixed for better UX and data safety.

**Objectives**:
- [ ] Read `src/components/campaign-preview/KeywordRow.tsx` to understand current inline editing
- [ ] Read `src/components/campaign-preview/AdGroupRow.tsx` to understand current inline editing
- [ ] Add explicit "Save" and "Cancel" buttons to inline editing components
- [ ] Require "Edit" button activation before editing is enabled
- [ ] Fix match type dropdown to not close edit state when opened
- [ ] Update inline editing logic to use Save/Cancel instead of blur
- [ ] Test inline editing for keywords (edit, save, cancel)
- [ ] Test inline editing for ad groups (edit, save, cancel)
- [ ] Test inline editing for ads (if component exists)
- [ ] Add keyboard shortcuts (Enter to save, Esc to cancel)
- [ ] Add visual feedback for edit state (highlight, border, etc.)

**Deliverables**:
- Updated `src/components/campaign-preview/KeywordRow.tsx`
- Updated `src/components/campaign-preview/AdGroupRow.tsx`
- Updated `src/components/campaign-preview/AdRow.tsx` (if exists)
- Updated `src/store/campaignPreviewStore.ts`

---

### Task 7: Fix BUG-015 - Validation Errors Not Linked to Elements
**Task ID**: 2.1.3
**Priority**: 🟡 Medium
**Status**: 🔴 Open
**Dependencies**: None (can start immediately)
**Estimated Time**: 3-4 hours

**Description**:
Validation errors are displayed in summary but not linked to actual elements on page. Users cannot navigate to or find where errors are located, which creates a poor user experience.

**Objectives**:
- [ ] Read `src/components/campaign-preview/CampaignPreview.tsx` to understand validation error display
- [ ] Identify validation error summary component
- [ ] Add clickable links to validation errors in summary
- [ ] Implement scroll-to functionality for error locations
- [ ] Add error indicators to specific elements (visual highlighting)
- [ ] Add error tooltips with detailed messages on hover
- [ ] Test navigation to error locations (click error in summary)
- [ ] Test scroll-to functionality (smooth scroll to element)
- [ ] Test error indicators (visual feedback)
- [ ] Test error tooltips (hover over errors)

**Deliverables**:
- Updated `src/components/campaign-preview/CampaignPreview.tsx`
- Updated or new `src/components/campaign-preview/ValidationSummary.tsx`
- Updated `src/services/validationService.ts`
- New `src/utils/scrollToElement.ts` (if needed)

---

### Task 8: Create Customer Profile Service (Frontend)
**Task ID**: 5.1.1
**Priority**: 🔴 Critical
**Status**: 🔴 Open
**Dependencies**: Backend API Routes (3.2.1) - Can stub APIs for now
**Estimated Time**: 4-5 hours

**Description**:
Create comprehensive frontend service for Customer Profile API interactions with proper error handling, TypeScript types, and request/response interceptors. Can start with stubbed/mocked API calls until backend routes are ready.

**Objectives**:
- [ ] Read existing frontend service patterns (e.g., `src/services/campaignService.ts`) to understand current structure
- [ ] Create `src/services/customerProfileService.ts` with comprehensive methods (CRUD operations)
- [ ] Create `src/services/brandGuidelinesService.ts` with similar methods
- [ ] Create `src/services/budgetService.ts` with similar methods
- [ ] Create `src/services/accountStatusService.ts` for first-time user detection
- [ ] Add comprehensive error handling
- [ ] Add request/response interceptors
- [ ] Add TypeScript types (import from types files)
- [ ] Add JSDoc comments
- [ ] Stub API endpoints if backend not ready (use mock data)
- [ ] Add unit tests

**Deliverables**:
- `src/services/customerProfileService.ts`
- `src/services/brandGuidelinesService.ts`
- `src/services/budgetService.ts`
- `src/services/accountStatusService.ts`
- Test files for all services

**Notes**:
- Can use mock data/stubbed API calls until backend routes (Task 3.2.1) are ready
- Focus on service structure, error handling, and TypeScript types
- Once backend APIs are ready, swap out stubs for real API calls

---

### Task 9: Create Onboarding Service (Frontend)
**Task ID**: 5.1.2
**Priority**: 🔴 Critical
**Status**: 🔴 Open
**Dependencies**: Task 8 (5.1.1)
**Estimated Time**: 3-4 hours

**Description**:
Create comprehensive frontend service for onboarding flow with first-time user detection, profile generation, approval, and skip functionality.

**Objectives**:
- [ ] Create `src/services/onboardingService.ts` with comprehensive methods
- [ ] Implement first-time user detection method
- [ ] Implement profile generation request method
- [ ] Implement profile approval method
- [ ] Implement skip onboarding method
- [ ] Add comprehensive error handling
- [ ] Add TypeScript types (import from customerProfileContainer.types.ts)
- [ ] Add JSDoc comments
- [ ] Stub onboarding API endpoints if backend not ready
- [ ] Add unit tests

**Deliverables**:
- `src/services/onboardingService.ts`
- Test files for service

**Notes**:
- Can use mock data/stubbed API calls until backend onboarding routes (Task 4.1.5) are ready
- Focus on service structure and flow logic

---

### Task 10: Create First-Time User Detection Hook
**Task ID**: 5.2.1
**Priority**: 🔴 Critical
**Status**: 🔴 Open
**Dependencies**: Task 9 (5.1.2)
**Estimated Time**: 2-3 hours

**Description**:
Create React hook to detect first-time users and trigger onboarding flow. This hook will be used in the main App component to show the onboarding modal.

**Objectives**:
- [ ] Create `src/hooks/useFirstTimeUser.ts`
- [ ] Implement first-time user detection logic using onboardingService
- [ ] Add comprehensive error handling
- [ ] Add loading states
- [ ] Add retry logic (optional)
- [ ] Add caching (optional)
- [ ] Add TypeScript types
- [ ] Add JSDoc comments
- [ ] Add unit tests

**Deliverables**:
- `src/hooks/useFirstTimeUser.ts`
- Test files for hook

**Notes**:
- Hook should return: `{ isFirstTimeUser, isLoading, error, refetch }`
- Will be used in App.tsx to trigger onboarding modal

---

## Workflow & Coordination

### Parallel Execution Strategy

**Phase 1: Immediate Start (Tasks 1, 3, 6, 7)**
- **GABE**: Start Task 1 (Database Schema Design)
- **GABE**: In parallel, work on Task 3 (BUG-005 URL Verification)
- **VANES**: Start Task 6 (BUG-012 Inline Editing)
- **VANES**: Start Task 7 (BUG-015 Validation Errors)

**Phase 2: Foundation Build (Tasks 2, 4, 5)**
- **GABE**: After Task 1, start Task 2 (Database Repositories)
- **GABE**: After Task 2, start Task 4 (Customer Profile Service)
- **GABE**: After Task 2, start Task 5 (Account Status Service)

**Phase 3: Frontend Preparation (Tasks 8, 9, 10)**
- **VANES**: After Tasks 6 & 7, start Task 8 (Frontend Services with stubs)
- **VANES**: After Task 8, start Task 9 (Onboarding Service)
- **VANES**: After Task 9, start Task 10 (First-Time User Hook)

### Communication & Handoffs

1. **GABE → VANES**: When Task 2 (Database Repositories) is complete, notify Vanes so she knows backend foundation is ready
2. **GABE → VANES**: When API Routes (Task 3.2.1, not in this list) are complete, notify Vanes to swap out stubbed APIs in Task 8
3. **VANES → GABE**: Share frontend service structure from Task 8 so Gabe can align API responses
4. **Daily Standup**: Quick sync on progress and blockers

### Testing Strategy

- **Unit Tests**: Required for all services, repositories, and utilities
- **Integration Tests**: Required for database repositories and backend services
- **Frontend Tests**: Required for React hooks and service layers
- **Manual Testing**: Bug fixes (Tasks 6 & 7) should be manually tested in UI

---

## Success Criteria

**By completion of these 10 tasks**:
- ✅ Database schema designed and documented
- ✅ Database repositories implemented and tested
- ✅ URL verification bug fixed
- ✅ Backend services for Customer Profile created
- ✅ Account status service for first-time user detection created
- ✅ Inline editing bugs fixed
- ✅ Validation error navigation implemented
- ✅ Frontend services created (with stubs if needed)
- ✅ Onboarding service created
- ✅ First-time user detection hook created

**This sets the foundation for**:
- API Routes (Phase 3.2)
- LLM Generation Services (Phase 4)
- Onboarding Flow UI (Phase 6)
- Settings Page (Phase 6.2)

---

## Notes & Considerations

### For GABE (Backend)
- Follow existing patterns in `backend/src/` for consistency
- Use PowerShell syntax for all commands
- Ensure all services have comprehensive error handling and logging
- Add JSDoc comments to all public methods
- Consider Zilkr compatibility for Budget objects (reference Task 1.1.5 types)

### For VANES (Frontend)
- Follow existing patterns in `src/` for consistency
- Use existing design system for UI components
- Stub out API calls if backend not ready - don't wait
- Focus on TypeScript types and error handling
- Add accessibility (a11y) to all UI changes

### General
- All tasks should include unit tests
- Document any decisions or deviations from the plan
- Update this document with actual completion times for future planning
- Flag any blockers immediately in team chat

---

## Task Tracking

Update this section as tasks are completed:

- [ ] Task 1: Design Database Schema (GABE)
- [ ] Task 2: Create Database Models/Repositories (GABE)
- [ ] Task 3: Fix BUG-005 - URL Verification (GABE)
- [ ] Task 4: Create Customer Profile Service (GABE)
- [ ] Task 5: Create Account Profile Status Service (GABE)
- [ ] Task 6: Fix BUG-012 - Inline Editing (VANES)
- [ ] Task 7: Fix BUG-015 - Validation Errors (VANES)
- [ ] Task 8: Create Customer Profile Service Frontend (VANES)
- [ ] Task 9: Create Onboarding Service Frontend (VANES)
- [ ] Task 10: Create First-Time User Hook (VANES)

**Start Date**: _________
**Target Completion**: _________
**Actual Completion**: _________
