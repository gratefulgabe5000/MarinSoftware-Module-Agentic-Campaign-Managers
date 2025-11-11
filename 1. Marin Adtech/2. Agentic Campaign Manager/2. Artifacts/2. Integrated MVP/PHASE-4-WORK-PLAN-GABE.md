# Phase 4 Work Plan - GABE

**Date**: 2025-11-10  
**Branch**: `feat-Phase4`  
**Assigned to**: GABE  
**Status**: Ready to Start  
**Estimated Time**: 2.5-3 hours

---

## 📋 Overview

Phase 4 focuses on comprehensive testing of all implemented features. GABE will work on:
- **4.1.1**: Connection & Authentication Tests (30 min)
- **4.2.1**: Campaign Lifecycle Tests (1 hour)
- **4.4.1-4.4.3**: Batch Job Tests (1.5 hours)

**Note**: Ad Structure Tests (4.3) and Keyword Tests (2B.3, 2B.4) are deferred until VANES completes keyword implementation.

---

## 🎯 Task 4.1.1: Connection & Authentication Tests

**Estimated Time**: 30 minutes  
**Dependencies**: Phase 3 complete ✅

### Objectives
- Verify API connectivity works
- Test authentication/connection checks
- Validate error handling for connection failures
- Document connection requirements

### Test Plan

#### Test 1: Basic API Connectivity
- [ ] Test `isAuthenticated()` with valid configuration
- [ ] Verify API endpoint is reachable
- [ ] Verify response time is reasonable (<5 seconds)
- [ ] Document successful connection

#### Test 2: Invalid Account ID
- [ ] Test `isAuthenticated()` with invalid account ID
- [ ] Verify error handling (should return `false`, not throw)
- [ ] Verify error message is clear
- [ ] Document error behavior

#### Test 3: Invalid Publisher
- [ ] Test `isAuthenticated()` with invalid publisher
- [ ] Verify error handling
- [ ] Verify error message is clear
- [ ] Document error behavior

#### Test 4: Network Timeout
- [ ] Test with unreachable endpoint (if possible)
- [ ] Verify timeout handling
- [ ] Verify error message
- [ ] Document timeout behavior

#### Test 5: Missing Environment Variables
- [ ] Test service instantiation without `DISPATCHER_URL`
- [ ] Verify error is thrown at construction
- [ ] Verify error message is clear
- [ ] Document environment requirements

### Deliverables
- [ ] Create test script: `test-phase4.1.1-connection.js`
- [ ] Document test results: `PHASE-4.1.1-TEST-RESULTS.md`
- [ ] Update connection requirements documentation

---

## 🎯 Task 4.2.1: Campaign Lifecycle Tests

**Estimated Time**: 1 hour  
**Dependencies**: Task 4.1.1 complete

### Objectives
- Test complete campaign CRUD lifecycle
- Verify all campaign operations work end-to-end
- Test error scenarios
- Validate budget handling (no micros conversion)
- Document test results

### Test Plan

#### Test Suite 1: Campaign Creation
- [ ] **Test 1.1**: Create campaign with valid data
  - Verify campaign is created in Marin system
  - Verify response includes campaign ID
  - Verify budget is NOT converted to micros (check amount is in dollars)
  - Verify status is ENABLED
  - Document campaign ID for subsequent tests

- [ ] **Test 1.2**: Create campaign with invalid data
  - Test with empty name
  - Test with negative budget
  - Test with invalid status
  - Verify validation errors are returned
  - Verify error messages are clear

#### Test Suite 2: Campaign Status Retrieval
- [ ] **Test 2.1**: Get status of created campaign
  - Use campaign ID from Test 1.1
  - Verify status is returned correctly
  - Verify response includes all expected fields
  - Document response structure

- [ ] **Test 2.2**: Get status of non-existent campaign
  - Test with invalid campaign ID
  - Verify 404 error handling
  - Verify error message is clear

#### Test Suite 3: Campaign Updates
- [ ] **Test 3.1**: Update campaign name
  - Use campaign ID from Test 1.1
  - Update name to new value
  - Verify update succeeds
  - Verify new name is reflected in status

- [ ] **Test 3.2**: Update campaign budget
  - Update budget amount
  - Verify budget is NOT converted to micros
  - Verify update succeeds
  - Verify new budget is reflected in status

- [ ] **Test 3.3**: Update campaign status
  - Update status to PAUSED
  - Verify update succeeds
  - Verify status is reflected correctly

#### Test Suite 4: Campaign State Management
- [ ] **Test 4.1**: Pause campaign
  - Use campaign ID from Test 1.1
  - Call `pauseCampaign()`
  - Verify status changes to PAUSED
  - Verify response indicates success

- [ ] **Test 4.2**: Resume campaign
  - Use paused campaign ID
  - Call `resumeCampaign()`
  - Verify status changes to ENABLED
  - Verify response indicates success

- [ ] **Test 4.3**: Delete campaign (set to REMOVED)
  - Use campaign ID from Test 1.1
  - Call `deleteCampaign()`
  - Verify status changes to REMOVED
  - Verify response indicates success

#### Test Suite 5: Error Scenarios
- [ ] **Test 5.1**: Invalid account ID
  - Create service with invalid account ID
  - Attempt campaign operations
  - Verify error handling

- [ ] **Test 5.2**: Invalid campaign ID
  - Attempt operations with non-existent campaign ID
  - Verify 404 error handling
  - Verify error messages are clear

- [ ] **Test 5.3**: Malformed request body
  - Send invalid JSON structure
  - Verify error handling
  - Verify error messages are clear

- [ ] **Test 5.4**: Network timeout
  - Test with long-running operation (if possible)
  - Verify timeout handling
  - Verify error messages

### Deliverables
- [ ] Create test script: `test-phase4.2.1-campaign-lifecycle.js`
- [ ] Document test results: `PHASE-4.2.1-TEST-RESULTS.md`
- [ ] Document campaign IDs for reference
- [ ] Update campaign lifecycle documentation

---

## 🎯 Task 4.4.1: Batch Job Creation Tests

**Estimated Time**: 30 minutes  
**Dependencies**: Phase 2C.1 complete ✅

### Objectives
- Test batch job creation
- Verify batch job ID is returned
- Verify initial status is PENDING
- Test error scenarios

### Test Plan

#### Test 1: Create Batch Job
- [ ] Call `createBatchJob()`
- [ ] Verify batch job is created
- [ ] Verify batch job ID is returned
- [ ] Verify status is PENDING
- [ ] Document batch job ID for subsequent tests

#### Test 2: Error Scenarios
- [ ] Test with invalid account ID
- [ ] Test with missing configuration
- [ ] Verify error handling
- [ ] Verify error messages are clear

### Deliverables
- [ ] Create test script: `test-phase4.4.1-batch-creation.js`
- [ ] Document test results: `PHASE-4.4.1-TEST-RESULTS.md`

---

## 🎯 Task 4.4.2: Batch Job Operations Tests

**Estimated Time**: 45 minutes  
**Dependencies**: Task 4.4.1 complete

### Objectives
- Test all batch job operations
- Verify operation limits (max 1000)
- Test sequenceToken handling
- Test polling with exponential backoff
- Test results retrieval

### Test Plan

#### Test Suite 1: Add Operations
- [ ] **Test 1.1**: Add 10 operations
  - Create batch job
  - Add 10 campaign operations
  - Verify operations are added
  - Verify totalOperations count is correct

- [ ] **Test 1.2**: Add exactly 1000 operations
  - Create batch job
  - Add 1000 operations
  - Verify operations are added
  - Verify no sequenceToken is needed

- [ ] **Test 1.3**: Attempt to add >1000 operations (should fail or use sequenceToken)
  - Create batch job
  - Attempt to add 1001 operations
  - Verify error or sequenceToken handling
  - Document behavior

- [ ] **Test 1.4**: Add operations with sequenceToken (>1000 total)
  - Create batch job
  - Add first 1000 operations
  - Get sequenceToken
  - Add next batch with sequenceToken
  - Verify all operations are added
  - Verify sequenceToken handling works

#### Test Suite 2: Run Batch Job
- [ ] **Test 2.1**: Run batch job
  - Create batch job with operations
  - Call `runBatchJob()`
  - Verify batch job starts
  - Verify status changes to RUNNING (if possible to check immediately)

#### Test Suite 3: Poll Batch Job Status
- [ ] **Test 3.1**: Poll until DONE
  - Create and run batch job
  - Call `pollBatchJobStatus()`
  - Verify polling continues until DONE
  - Verify status field is checked (not done field)
  - Verify exponential backoff is used
  - Document polling behavior

- [ ] **Test 3.2**: Poll until FAILED
  - Create batch job with invalid operations
  - Run batch job
  - Poll until FAILED
  - Verify error handling
  - Document failure behavior

- [ ] **Test 3.3**: Test timeout scenario
  - Create batch job with long-running operations (if possible)
  - Set low maxAttempts
  - Verify timeout is handled correctly
  - Verify error message is clear

#### Test Suite 4: Get Batch Job Results
- [ ] **Test 4.1**: Get results for completed batch job
  - Create, run, and wait for batch job completion
  - Call `getBatchJobResults()`
  - Verify results are returned
  - Verify summary object is included (total, succeeded, failed)
  - Verify results array structure
  - Verify each result has index, status, resourceId, error fields

- [ ] **Test 4.2**: Get results for failed batch job
  - Get results for failed batch job
  - Verify error information is included
  - Verify summary shows correct failed count

### Deliverables
- [ ] Create test script: `test-phase4.4.2-batch-operations.js`
- [ ] Document test results: `PHASE-4.4.2-TEST-RESULTS.md`
- [ ] Document batch job IDs for reference

---

## 🎯 Task 4.4.3: Bulk Campaign Creation Tests

**Estimated Time**: 45 minutes  
**Dependencies**: Task 4.4.2 complete

### Objectives
- Test high-level bulk campaign creation
- Verify chunking works correctly
- Test with various campaign counts
- Test partial and full failure scenarios
- Test timeout handling

### Test Plan

#### Test Suite 1: Small Batch (10 campaigns)
- [ ] **Test 1.1**: Create 10 campaigns via bulkCreateCampaigns
  - Prepare 10 valid campaign requests
  - Call `bulkCreateCampaigns()`
  - Verify all campaigns are created
  - Verify summary shows correct counts (total: 10, succeeded: 10, failed: 0)
  - Verify completion time is reasonable (<30 seconds)
  - Verify all campaign IDs are returned

#### Test Suite 2: Medium Batch (100 campaigns)
- [ ] **Test 2.1**: Create 100 campaigns
  - Prepare 100 valid campaign requests
  - Call `bulkCreateCampaigns()`
  - Verify chunking works correctly (operations split into chunks of 1000)
  - Verify sequenceToken handling (if >1000 operations)
  - Verify all campaigns are created
  - Verify summary shows correct counts
  - Document completion time

#### Test Suite 3: Large Batch (>1000 campaigns)
- [ ] **Test 3.1**: Create >1000 campaigns
  - Prepare >1000 valid campaign requests
  - Call `bulkCreateCampaigns()`
  - Verify multiple chunks are created
  - Verify sequenceToken is used correctly
  - Verify all campaigns are processed
  - Verify summary shows correct counts
  - Document completion time and chunking behavior

#### Test Suite 4: Partial Failure Scenario
- [ ] **Test 4.1**: Create batch with mix of valid and invalid campaigns
  - Prepare 5 valid and 5 invalid campaign requests
  - Call `bulkCreateCampaigns()`
  - Verify summary shows correct succeeded/failed counts (succeeded: 5, failed: 5)
  - Verify error messages are included in results
  - Verify valid campaigns are created successfully
  - Verify invalid campaigns have error messages

#### Test Suite 5: Full Failure Scenario
- [ ] **Test 5.1**: Create batch with all invalid campaigns
  - Prepare 10 invalid campaign requests
  - Call `bulkCreateCampaigns()`
  - Verify error handling
  - Verify summary shows all failed (succeeded: 0, failed: 10)
  - Verify error messages are clear

#### Test Suite 6: Timeout Scenario
- [ ] **Test 6.1**: Test timeout handling
  - Create batch job with very long-running operations (if possible)
  - Set low timeout or maxAttempts
  - Verify timeout is handled correctly
  - Verify error message indicates timeout
  - Document timeout behavior

### Deliverables
- [ ] Create test script: `test-phase4.4.3-bulk-creation.js`
- [ ] Document test results: `PHASE-4.4.3-TEST-RESULTS.md`
- [ ] Document performance metrics (completion times)
- [ ] Document chunking behavior for large batches

---

## 📝 Testing Approach

### Pattern to Follow
Based on previous phases, use **manual testing with verification scripts**:

1. **Create test scripts** in `backend/` directory
2. **Use Node.js** to load compiled services
3. **Test validation** (structure, types, error handling)
4. **Test API calls** (may fail if API not available, but verify error handling)
5. **Document results** in separate markdown files

### Test Script Template
```javascript
// test-phase4.X.X-description.js
const path = require('path');

// Load compiled service
const servicePath = path.join(__dirname, 'dist/services/marinDispatcherService.js');
const { MarinDispatcherService } = require(servicePath);

async function runTests() {
  console.log('=== Phase 4.X.X Tests ===\n');
  
  // Test 1: Service instantiation
  try {
    const service = new MarinDispatcherService();
    console.log('✅ Test 1: Service instantiation - PASS');
  } catch (error) {
    console.log('❌ Test 1: Service instantiation - FAIL:', error.message);
  }
  
  // Additional tests...
}

runTests().catch(console.error);
```

### Running Tests
```powershell
# Navigate to backend directory
cd "C:\Users\grate\Documents\Cursor\GratefulGabe5000\4b. MarinSoftware-Module-Agentic-Campaign-Manager-CSV-Update\1. Marin Adtech\2. Agentic Campaign Manager\Module-Agentic_Campaign_Manager\backend"

# Build TypeScript
npm run build

# Run test script
node test-phase4.X.X-description.js
```

---

## 📊 Success Criteria

### Task 4.1.1
- [ ] All connection tests pass
- [ ] Error handling verified
- [ ] Documentation complete

### Task 4.2.1
- [ ] All campaign CRUD operations tested
- [ ] Complete lifecycle verified (create → update → pause → resume → delete)
- [ ] Budget handling verified (no micros conversion)
- [ ] Error scenarios tested
- [ ] Documentation complete

### Task 4.4.1
- [ ] Batch job creation tested
- [ ] Error handling verified
- [ ] Documentation complete

### Task 4.4.2
- [ ] All batch operations tested
- [ ] Operation limits verified (max 1000)
- [ ] SequenceToken handling verified
- [ ] Polling with exponential backoff verified
- [ ] Results retrieval verified
- [ ] Documentation complete

### Task 4.4.3
- [ ] Bulk creation tested with various sizes
- [ ] Chunking verified
- [ ] Partial failure handling verified
- [ ] Full failure handling verified
- [ ] Timeout handling verified
- [ ] Performance metrics documented
- [ ] Documentation complete

---

## 🚀 Getting Started

### Step 1: Navigate to Backend Directory
```powershell
Set-Location "C:\Users\grate\Documents\Cursor\GratefulGabe5000\4b. MarinSoftware-Module-Agentic-Campaign-Manager-CSV-Update\1. Marin Adtech\2. Agentic Campaign Manager\Module-Agentic_Campaign_Manager\backend"
```

### Step 2: Verify Environment
```powershell
# Check environment variables
Get-Content .env | Select-String "MARIN_DISPATCHER"

# Build TypeScript
npm run build
```

### Step 3: Start with Task 4.1.1
- Begin with connection tests
- Work through each task sequentially
- Document results as you go

---

## 📚 Reference Documents

- **Task List**: `TASKLIST-Marin-Dispatcher-Integration.md`
- **Workflow**: `TASKLIST-Marin-Dispatcher-Integration-WORKFLOW.md`
- **Previous Test Results**: 
  - `PHASE-2.3-AND-2C.4-TEST-RESULTS.md`
  - `PHASE-2C.2-TEST-RESULTS.md`
  - `PHASE-2C.3-TEST-RESULTS.md`

---

**Last Updated**: 2025-11-10  
**Status**: Ready to Start  
**Next Review**: After Task 4.1.1 completion

