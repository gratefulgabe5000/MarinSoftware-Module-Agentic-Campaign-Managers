# Phase 2.3 & 2C.4 Manual Testing Instructions

**Phase**: 2.3 (Core Campaign Methods) & 2C.4 (Batch Job Service) - Combined Manual Testing  
**Date**: 2025-11-10  
**Status**: Ready for Manual Testing  
**Testing Approach**: Manual, Line-by-Line Instructions (No Scripts)

---

## Overview

This document provides explicit, line-by-line manual testing instructions for **both** Phase 2.3 (MarinDispatcherService) and Phase 2C.4 (MarinBatchJobService) implementations. These phases are combined for comprehensive testing of all service methods.

### Phase 2.3: MarinDispatcherService Methods
1. **isAuthenticated()** - API connectivity check
2. **createCampaign()** - Create campaigns with validation
3. **updateCampaign()** - Update campaigns with validation
4. **pauseCampaign()** - Pause campaigns
5. **resumeCampaign()** - Resume campaigns
6. **deleteCampaign()** - Delete campaigns (sets status to REMOVED)
7. **getCampaignStatus()** - Get campaign status

### Phase 2C.4: MarinBatchJobService Methods
1. **createBatchJob()** - Create a new batch job
2. **addOperationsToBatch()** - Add operations (validates max 1000)
3. **runBatchJob()** - Start batch job execution
4. **pollBatchJobStatus()** - Poll with exponential backoff
5. **getBatchJobResults()** - Get batch job results
6. **bulkCreateCampaigns()** - High-level orchestration method

**Important**: These are manual instructions. You will execute each step manually using Node.js REPL or by creating temporary test files.

---

## Prerequisites

Before starting manual testing, verify the following:

### 1. Environment Setup

**Step 1.1**: Navigate to the backend directory
```
cd "4b. MarinSoftware-Module-Agentic-Campaign-Manager-CSV-Update\1. Marin Adtech\2. Agentic Campaign Manager\Module-Agentic_Campaign_Manager\backend"
```

**Step 1.2**: Verify TypeScript compilation works
```
npm run build
```
**Expected Result**: Compilation succeeds with no errors

**Step 1.3**: Verify both compiled service files exist
```
Test-Path dist/services/marinDispatcherService.js
Test-Path dist/services/marinBatchJobService.js
```
**Expected Result**: Both return `True`

### 2. Environment Variables

**Step 2.1**: Check if `.env` file exists
```
Test-Path .env
```

**Step 2.2**: Verify required environment variables are set:
- `MARIN_DISPATCHER_BASE_URL` (or `DISPATCHER_URL`) - Base URL for Marin Dispatcher API
- `MARIN_DISPATCHER_ACCOUNT_ID` - Marin account ID (e.g., "5533110357")
- `MARIN_DISPATCHER_PUBLISHER` - Publisher name (default: "google")
- `MARIN_DISPATCHER_TIMEOUT` - Request timeout in milliseconds (default: 10000)

**Note**: For testing, you may need a valid API URL. If the API is not available, tests will fail gracefully (return errors instead of throwing).

---

## Part A: Phase 2.3 - MarinDispatcherService Testing

### Test A.1: isAuthenticated Method

**Objective**: Verify the `isAuthenticated()` method correctly checks API connectivity.

#### Test A.1.1: Import and Instantiate Service

**Step A.1.1.1**: Open Node.js REPL
```
node
```

**Step A.1.1.2**: Import the compiled service module
```javascript
const { MarinDispatcherService } = require('./dist/services/marinDispatcherService.js');
```

**Expected Result**: No error, `MarinDispatcherService` is defined

**Step A.1.1.3**: Create service instance
```javascript
const service = new MarinDispatcherService();
```

**Expected Result**: No error, service instance created

#### Test A.1.2: Test isAuthenticated with Valid API

**Step A.1.2.1**: Call isAuthenticated method
```javascript
const result = await service.isAuthenticated();
console.log('isAuthenticated result:', result);
```

**Expected Result**: 
- If API is available: Returns `true` or `false` (boolean)
- If API is not available: Returns `false` (graceful failure)
- No exceptions thrown

**Step A.1.2.2**: Verify return type
```javascript
typeof result === 'boolean'
```

**Expected Result**: Returns `true`

---

### Test A.2: createCampaign Method

**Objective**: Verify the `createCampaign()` method correctly creates campaigns with validation.

#### Test A.2.1: Test createCampaign with Valid Data

**Step A.2.1.1**: Create a test CampaignPlan object
```javascript
const campaignPlan = {
  objective: 'Drive sales for new product launch',
  targetAudience: {
    demographics: {
      age: '25-45',
      gender: 'all',
      location: 'United States',
    },
  },
  budget: {
    total: 5000,
    daily: 200,
  },
  duration: {
    startDate: '2025-01-01',
    endDate: '2025-01-31',
  },
};
```

**Step A.2.1.2**: Call createCampaign method
```javascript
const result = await service.createCampaign(campaignPlan, 'Test Campaign - Manual Test');
console.log('createCampaign result:', JSON.stringify(result, null, 2));
```

**Expected Result**:
- If API is available: Returns `{ success: true, campaignId: "...", details: {...} }`
- If API is not available: Returns `{ success: false, error: "..." }`
- No exceptions thrown

**Step A.2.1.3**: Verify response structure
```javascript
result.hasOwnProperty('success') && typeof result.success === 'boolean'
```

**Expected Result**: Returns `true`

#### Test A.2.2: Test createCampaign with Invalid Data

**Step A.2.2.1**: Test with empty campaign name
```javascript
const invalidResult = await service.createCampaign(campaignPlan, '');
console.log('createCampaign with empty name:', JSON.stringify(invalidResult, null, 2));
```

**Expected Result**: Returns `{ success: false, error: "..." }` (validation error)

**Step A.2.2.2**: Test with invalid budget (negative amount)
```javascript
const invalidBudgetPlan = {
  ...campaignPlan,
  budget: { total: -100, daily: 0 },
};
const invalidBudgetResult = await service.createCampaign(invalidBudgetPlan, 'Test Campaign');
console.log('createCampaign with invalid budget:', JSON.stringify(invalidBudgetResult, null, 2));
```

**Expected Result**: Returns `{ success: false, error: "..." }` (validation error)

---

### Test A.3: updateCampaign Method

**Objective**: Verify the `updateCampaign()` method correctly updates campaigns.

#### Test A.3.1: Test updateCampaign with Valid Data

**Step A.3.1.1**: Test with valid campaignId and updates
```javascript
const campaignId = 'test-campaign-id-123';
const updates = {
  budget: {
    total: 6000,
    daily: 250,
  },
};
const result = await service.updateCampaign(campaignId, updates);
console.log('updateCampaign result:', JSON.stringify(result, null, 2));
```

**Expected Result**:
- If API is available: Returns `{ success: true, campaignId: "...", details: {...} }`
- If API is not available: Returns `{ success: false, error: "..." }`
- No exceptions thrown

#### Test A.3.2: Test updateCampaign with Invalid Data

**Step A.3.2.1**: Test with empty campaignId
```javascript
const emptyIdResult = await service.updateCampaign('', updates);
console.log('updateCampaign with empty ID:', JSON.stringify(emptyIdResult, null, 2));
```

**Expected Result**: Returns `{ success: false, error: "campaignId is required..." }`

**Step A.3.2.2**: Test with no valid fields to update
```javascript
const emptyUpdatesResult = await service.updateCampaign(campaignId, {});
console.log('updateCampaign with empty updates:', JSON.stringify(emptyUpdatesResult, null, 2));
```

**Expected Result**: Returns `{ success: false, error: "No valid fields to update" }`

---

### Test A.4: pauseCampaign Method

**Objective**: Verify the `pauseCampaign()` method correctly pauses campaigns.

#### Test A.4.1: Test pauseCampaign with Valid campaignId

**Step A.4.1.1**: Call pauseCampaign method
```javascript
const result = await service.pauseCampaign('test-campaign-id-123');
console.log('pauseCampaign result:', JSON.stringify(result, null, 2));
```

**Expected Result**:
- If API is available: Returns `{ success: true, campaignId: "...", details: {...} }`
- If API is not available: Returns `{ success: false, error: "..." }`
- No exceptions thrown

#### Test A.4.2: Test pauseCampaign with Invalid Data

**Step A.4.2.1**: Test with empty campaignId
```javascript
const emptyIdResult = await service.pauseCampaign('');
console.log('pauseCampaign with empty ID:', JSON.stringify(emptyIdResult, null, 2));
```

**Expected Result**: Returns `{ success: false, error: "campaignId is required..." }`

---

### Test A.5: resumeCampaign Method

**Objective**: Verify the `resumeCampaign()` method correctly resumes campaigns.

#### Test A.5.1: Test resumeCampaign with Valid campaignId

**Step A.5.1.1**: Call resumeCampaign method
```javascript
const result = await service.resumeCampaign('test-campaign-id-123');
console.log('resumeCampaign result:', JSON.stringify(result, null, 2));
```

**Expected Result**:
- If API is available: Returns `{ success: true, campaignId: "...", details: {...} }`
- If API is not available: Returns `{ success: false, error: "..." }`
- No exceptions thrown

#### Test A.5.2: Test resumeCampaign with Invalid Data

**Step A.5.2.1**: Test with empty campaignId
```javascript
const emptyIdResult = await service.resumeCampaign('');
console.log('resumeCampaign with empty ID:', JSON.stringify(emptyIdResult, null, 2));
```

**Expected Result**: Returns `{ success: false, error: "campaignId is required..." }`

---

### Test A.6: deleteCampaign Method

**Objective**: Verify the `deleteCampaign()` method correctly deletes campaigns.

#### Test A.6.1: Test deleteCampaign with Valid campaignId

**Step A.6.1.1**: Call deleteCampaign method
```javascript
const result = await service.deleteCampaign('test-campaign-id-123');
console.log('deleteCampaign result:', JSON.stringify(result, null, 2));
```

**Expected Result**:
- If API is available: Returns `{ success: true, campaignId: "...", details: {...} }`
- If API is not available: Returns `{ success: false, error: "..." }`
- No exceptions thrown

#### Test A.6.2: Test deleteCampaign with Invalid Data

**Step A.6.2.1**: Test with empty campaignId
```javascript
const emptyIdResult = await service.deleteCampaign('');
console.log('deleteCampaign with empty ID:', JSON.stringify(emptyIdResult, null, 2));
```

**Expected Result**: Returns `{ success: false, error: "campaignId is required..." }`

---

### Test A.7: getCampaignStatus Method

**Objective**: Verify the `getCampaignStatus()` method correctly retrieves campaign status.

#### Test A.7.1: Test getCampaignStatus with Valid campaignId

**Step A.7.1.1**: Call getCampaignStatus method
```javascript
const result = await service.getCampaignStatus('test-campaign-id-123');
console.log('getCampaignStatus result:', JSON.stringify(result, null, 2));
```

**Expected Result**:
- If API is available: Returns `{ success: true, campaignId: "...", details: {...} }`
- If API is not available: Returns `{ success: false, error: "..." }`
- No exceptions thrown

#### Test A.7.2: Test getCampaignStatus with Invalid Data

**Step A.7.2.1**: Test with empty campaignId
```javascript
const emptyIdResult = await service.getCampaignStatus('');
console.log('getCampaignStatus with empty ID:', JSON.stringify(emptyIdResult, null, 2));
```

**Expected Result**: Returns `{ success: false, error: "campaignId is required..." }`

---

## Part B: Phase 2C.4 - MarinBatchJobService Testing

### Test B.1: createBatchJob Method

**Objective**: Verify the `createBatchJob()` method correctly creates batch jobs.

#### Test B.1.1: Import and Instantiate Batch Job Service

**Step B.1.1.1**: Import the compiled batch job service module
```javascript
const { MarinBatchJobService } = require('./dist/services/marinBatchJobService.js');
```

**Expected Result**: No error, `MarinBatchJobService` is defined

**Step B.1.1.2**: Create batch job service instance
```javascript
const batchService = new MarinBatchJobService();
```

**Expected Result**: No error, service instance created

#### Test B.1.2: Test createBatchJob

**Step B.1.2.1**: Call createBatchJob method
```javascript
const result = await batchService.createBatchJob();
console.log('createBatchJob result:', JSON.stringify(result, null, 2));
```

**Expected Result**:
- If API is available: Returns `{ batchJobId: "..." }`
- If API is not available: Throws error with message containing "Failed to create batch job"
- batchJobId is a non-empty string

**Step B.1.2.2**: Verify response structure
```javascript
result.hasOwnProperty('batchJobId') && typeof result.batchJobId === 'string' && result.batchJobId.length > 0
```

**Expected Result**: Returns `true` (if API available) or error thrown (if API not available)

---

### Test B.2: addOperationsToBatch Method

**Objective**: Verify the `addOperationsToBatch()` method correctly adds operations with validation.

#### Test B.2.1: Test addOperationsToBatch with Valid Data (< 1000 operations)

**Step B.2.1.1**: Create test batch operations
```javascript
const operations = [
  {
    operationType: 'CREATE',
    resourceType: 'CAMPAIGN',
    resource: {
      accountId: '5533110357',
      name: 'Test Campaign 1',
      status: 'ENABLED',
      budget: { amount: 100, deliveryMethod: 'STANDARD' },
      biddingStrategy: 'MANUAL_CPC',
    },
  },
  {
    operationType: 'CREATE',
    resourceType: 'CAMPAIGN',
    resource: {
      accountId: '5533110357',
      name: 'Test Campaign 2',
      status: 'ENABLED',
      budget: { amount: 200, deliveryMethod: 'STANDARD' },
      biddingStrategy: 'MANUAL_CPC',
    },
  },
];
```

**Step B.2.1.2**: Call addOperationsToBatch method
```javascript
const batchJobId = 'test-batch-job-id-123';
const result = await batchService.addOperationsToBatch(batchJobId, operations);
console.log('addOperationsToBatch result:', JSON.stringify(result, null, 2));
```

**Expected Result**:
- If API is available: Returns `{ sequenceToken: "...", totalOperationsAdded: 2 }`
- If API is not available: Throws error with message containing "Failed to add operations"
- No exceptions thrown for validation

#### Test B.2.2: Test addOperationsToBatch with Invalid Data

**Step B.2.2.1**: Test with empty batchJobId
```javascript
try {
  await batchService.addOperationsToBatch('', operations);
} catch (error) {
  console.log('addOperationsToBatch with empty ID error:', error.message);
}
```

**Expected Result**: Throws error with message containing "batchJobId is required"

**Step B.2.2.2**: Test with empty operations array
```javascript
try {
  await batchService.addOperationsToBatch(batchJobId, []);
} catch (error) {
  console.log('addOperationsToBatch with empty operations error:', error.message);
}
```

**Expected Result**: Throws error with message containing "At least one operation is required"

**Step B.2.2.3**: Test with > 1000 operations
```javascript
const tooManyOps = Array(1001).fill(null).map((_, i) => ({
  operationType: 'CREATE',
  resourceType: 'CAMPAIGN',
  resource: {
    accountId: '5533110357',
    name: `Test Campaign ${i}`,
    status: 'ENABLED',
    budget: { amount: 100, deliveryMethod: 'STANDARD' },
    biddingStrategy: 'MANUAL_CPC',
  },
}));

try {
  await batchService.addOperationsToBatch(batchJobId, tooManyOps);
} catch (error) {
  console.log('addOperationsToBatch with >1000 operations error:', error.message);
}
```

**Expected Result**: Throws error with message containing "Maximum 1000 operations per request"

---

### Test B.3: runBatchJob Method

**Objective**: Verify the `runBatchJob()` method correctly starts batch job execution.

#### Test B.3.1: Test runBatchJob with Valid batchJobId

**Step B.3.1.1**: Call runBatchJob method
```javascript
const batchJobId = 'test-batch-job-id-123';
await batchService.runBatchJob(batchJobId);
console.log('runBatchJob completed successfully');
```

**Expected Result**:
- If API is available: Completes without error (returns void)
- If API is not available: Throws error with message containing "Failed to run batch job"
- No exceptions thrown for validation

#### Test B.3.2: Test runBatchJob with Invalid Data

**Step B.3.2.1**: Test with empty batchJobId
```javascript
try {
  await batchService.runBatchJob('');
} catch (error) {
  console.log('runBatchJob with empty ID error:', error.message);
}
```

**Expected Result**: Throws error with message containing "batchJobId is required"

---

### Test B.4: pollBatchJobStatus Method

**Objective**: Verify the `pollBatchJobStatus()` method correctly polls batch job status.

#### Test B.4.1: Test pollBatchJobStatus with Valid batchJobId

**Step B.4.1.1**: Call pollBatchJobStatus method (with short timeout for testing)
```javascript
const batchJobId = 'test-batch-job-id-123';
const result = await batchService.pollBatchJobStatus(batchJobId, 2, 1000); // 2 attempts, 1 second interval
console.log('pollBatchJobStatus result:', JSON.stringify(result, null, 2));
```

**Expected Result**:
- If API is available: Returns `BatchJobResponse` with `jobStatus: 'DONE' | 'FAILED' | 'CANCELLED'`
- If API is not available: Throws error after max attempts
- No exceptions thrown for validation

**Step B.4.1.2**: Verify response structure
```javascript
result.hasOwnProperty('jobStatus') && typeof result.jobStatus === 'string'
```

**Expected Result**: Returns `true` (if API available)

#### Test B.4.2: Test pollBatchJobStatus with Invalid Data

**Step B.4.2.1**: Test with empty batchJobId
```javascript
try {
  await batchService.pollBatchJobStatus('', 1, 1000);
} catch (error) {
  console.log('pollBatchJobStatus with empty ID error:', error.message);
}
```

**Expected Result**: Throws error with message containing "batchJobId is required"

---

### Test B.5: getBatchJobResults Method

**Objective**: Verify the `getBatchJobResults()` method correctly retrieves batch job results.

#### Test B.5.1: Test getBatchJobResults with Valid batchJobId

**Step B.5.1.1**: Call getBatchJobResults method
```javascript
const batchJobId = 'test-batch-job-id-123';
const result = await batchService.getBatchJobResults(batchJobId);
console.log('getBatchJobResults result:', JSON.stringify(result, null, 2));
```

**Expected Result**:
- If API is available: Returns `BatchJobResultsResponse` with `{ jobId, jobStatus, summary: { total, successful, failed }, results, nextPageToken }`
- If API is not available: Throws error with message containing "Failed to get batch job results"
- No exceptions thrown for validation

**Step B.5.1.2**: Verify response structure
```javascript
result.hasOwnProperty('jobId') && result.hasOwnProperty('jobStatus') && result.hasOwnProperty('summary')
```

**Expected Result**: Returns `true` (if API available)

#### Test B.5.2: Test getBatchJobResults with Invalid Data

**Step B.5.2.1**: Test with empty batchJobId
```javascript
try {
  await batchService.getBatchJobResults('');
} catch (error) {
  console.log('getBatchJobResults with empty ID error:', error.message);
}
```

**Expected Result**: Throws error with message containing "batchJobId is required"

---

### Test B.6: bulkCreateCampaigns Method

**Objective**: Verify the `bulkCreateCampaigns()` method correctly orchestrates the entire batch job flow.

#### Test B.6.1: Test bulkCreateCampaigns with Valid Data (< 1000 campaigns)

**Step B.6.1.1**: Create test campaign requests
```javascript
const campaigns = [
  {
    accountId: '5533110357',
    name: 'Bulk Test Campaign 1',
    status: 'ENABLED',
    budget: { amount: 100, deliveryMethod: 'STANDARD' },
    biddingStrategy: 'MANUAL_CPC',
  },
  {
    accountId: '5533110357',
    name: 'Bulk Test Campaign 2',
    status: 'ENABLED',
    budget: { amount: 200, deliveryMethod: 'STANDARD' },
    biddingStrategy: 'MANUAL_CPC',
  },
];
```

**Step B.6.1.2**: Call bulkCreateCampaigns method
```javascript
const result = await batchService.bulkCreateCampaigns(campaigns);
console.log('bulkCreateCampaigns result:', JSON.stringify(result, null, 2));
```

**Expected Result**:
- If API is available: Returns `BatchJobResultsResponse` with complete results
- If API is not available: Throws error with message containing "Bulk campaign creation failed"
- Orchestrates entire flow: create → add → run → poll → results

**Step B.6.1.3**: Verify response structure
```javascript
result.hasOwnProperty('jobId') && result.hasOwnProperty('summary') && result.hasOwnProperty('results')
```

**Expected Result**: Returns `true` (if API available)

#### Test B.6.2: Test bulkCreateCampaigns with Invalid Data

**Step B.6.2.1**: Test with empty campaigns array
```javascript
try {
  await batchService.bulkCreateCampaigns([]);
} catch (error) {
  console.log('bulkCreateCampaigns with empty array error:', error.message);
}
```

**Expected Result**: Throws error with message containing "campaigns array is required"

**Step B.6.2.2**: Test with null campaigns array
```javascript
try {
  await batchService.bulkCreateCampaigns(null);
} catch (error) {
  console.log('bulkCreateCampaigns with null array error:', error.message);
}
```

**Expected Result**: Throws error with message containing "campaigns array is required"

#### Test B.6.3: Test bulkCreateCampaigns with > 1000 campaigns (Chunking)

**Step B.6.3.1**: Create 1500 test campaigns
```javascript
const manyCampaigns = Array(1500).fill(null).map((_, i) => ({
  accountId: '5533110357',
  name: `Bulk Test Campaign ${i + 1}`,
  status: 'ENABLED',
  budget: { amount: 100, deliveryMethod: 'STANDARD' },
  biddingStrategy: 'MANUAL_CPC',
}));
```

**Step B.6.3.2**: Call bulkCreateCampaigns method (this will test chunking)
```javascript
const result = await batchService.bulkCreateCampaigns(manyCampaigns);
console.log('bulkCreateCampaigns with 1500 campaigns result summary:', result.summary);
```

**Expected Result**:
- If API is available: Successfully chunks into 2 batches (1000 + 500)
- Uses sequenceToken for second batch
- Returns complete results
- If API is not available: Throws error

---

## Test Checklist

### Phase 2.3 - MarinDispatcherService

- [ ] **Test A.1**: isAuthenticated method
  - [ ] Valid API call
  - [ ] Return type verification
- [ ] **Test A.2**: createCampaign method
  - [ ] Valid data
  - [ ] Invalid data (empty name)
  - [ ] Invalid data (negative budget)
- [ ] **Test A.3**: updateCampaign method
  - [ ] Valid data
  - [ ] Invalid data (empty campaignId)
  - [ ] Invalid data (empty updates)
- [ ] **Test A.4**: pauseCampaign method
  - [ ] Valid campaignId
  - [ ] Invalid data (empty campaignId)
- [ ] **Test A.5**: resumeCampaign method
  - [ ] Valid campaignId
  - [ ] Invalid data (empty campaignId)
- [ ] **Test A.6**: deleteCampaign method
  - [ ] Valid campaignId
  - [ ] Invalid data (empty campaignId)
- [ ] **Test A.7**: getCampaignStatus method
  - [ ] Valid campaignId
  - [ ] Invalid data (empty campaignId)

### Phase 2C.4 - MarinBatchJobService

- [ ] **Test B.1**: createBatchJob method
  - [ ] Valid call
  - [ ] Response structure verification
- [ ] **Test B.2**: addOperationsToBatch method
  - [ ] Valid data (< 1000 operations)
  - [ ] Invalid data (empty batchJobId)
  - [ ] Invalid data (empty operations)
  - [ ] Invalid data (> 1000 operations)
- [ ] **Test B.3**: runBatchJob method
  - [ ] Valid batchJobId
  - [ ] Invalid data (empty batchJobId)
- [ ] **Test B.4**: pollBatchJobStatus method
  - [ ] Valid batchJobId (with short timeout)
  - [ ] Invalid data (empty batchJobId)
- [ ] **Test B.5**: getBatchJobResults method
  - [ ] Valid batchJobId
  - [ ] Invalid data (empty batchJobId)
- [ ] **Test B.6**: bulkCreateCampaigns method
  - [ ] Valid data (< 1000 campaigns)
  - [ ] Invalid data (empty array)
  - [ ] Invalid data (null array)
  - [ ] Valid data (> 1000 campaigns - chunking test)

---

## Expected Results Summary

### Success Criteria

**Phase 2.3 (MarinDispatcherService)**:
- ✅ All 7 methods can be called without exceptions (validation errors return error objects, not exceptions)
- ✅ All methods return proper `PlatformAPIResponse` format
- ✅ All methods validate input correctly
- ✅ All methods handle errors gracefully
- ✅ X-Ray tracing is integrated (verified in source code)

**Phase 2C.4 (MarinBatchJobService)**:
- ✅ All 6 methods can be called without exceptions (validation errors throw exceptions)
- ✅ All methods validate input correctly
- ✅ `addOperationsToBatch` validates max 1000 operations
- ✅ `bulkCreateCampaigns` handles chunking for >1000 campaigns
- ✅ All methods handle errors gracefully
- ✅ X-Ray tracing is integrated (verified in source code)

---

## Notes

### API Availability

- **If API is available**: Tests will make actual API calls and return real responses
- **If API is not available**: Tests will fail gracefully with error messages (no crashes)
- **Validation tests**: Will always work (don't require API)

### Error Handling

- **MarinDispatcherService**: Returns error objects (`{ success: false, error: "..." }`)
- **MarinBatchJobService**: Throws errors (use try-catch blocks)

### Testing Approach

- **Manual REPL**: Execute commands one by one in Node.js REPL
- **Temporary Scripts**: Optionally create temporary `.js` files for complex test scenarios
- **No Automation**: These are manual tests, not automated scripts

---

## Troubleshooting

### Common Issues

1. **Module not found**: Ensure `npm run build` completed successfully
2. **Environment variables missing**: Check `.env` file or set variables manually
3. **API errors**: Expected if API is not available - verify error messages are clear
4. **Type errors**: Ensure TypeScript compilation succeeded

### Verification Steps

After completing all tests, verify:
- All methods exist and are callable
- All validation works correctly
- All error handling works correctly
- All return types are correct
- No unexpected exceptions (only expected validation errors)

---

**Test Execution Date**: _______________  
**Test Execution Time**: _______________  
**Test Environment**: Node.js (local development)  
**Test Status**: _______________

