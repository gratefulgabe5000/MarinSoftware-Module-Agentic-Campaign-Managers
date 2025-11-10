# Phase 2.2 Manual Testing Instructions

**Phase**: 2.2 - Campaign CRUD Methods  
**Date**: 2025-11-10  
**Status**: Ready for Manual Testing  
**Testing Approach**: Manual, Line-by-Line Instructions (No Scripts)

---

## Overview

This document provides explicit, line-by-line manual testing instructions for Phase 2.2 implementation of the Marin Dispatcher Service. Phase 2.2 includes:

1. **createCampaign Method**: Create a new campaign on Marin Dispatcher
2. **updateCampaign Method**: Update an existing campaign
3. **pauseCampaign Method**: Pause a campaign
4. **resumeCampaign Method**: Resume a paused campaign
5. **deleteCampaign Method**: Delete a campaign (sets status to REMOVED)
6. **getCampaignStatus Method**: Get campaign status

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

**Step 1.3**: Verify the compiled service file exists
```
Test-Path dist/services/marinDispatcherService.js
```
**Expected Result**: Returns `True`

### 2. Environment Variables

**Step 2.1**: Check if `.env` file exists in the backend directory
```
Test-Path .env
```

**Step 2.2**: Verify required environment variables are set:
- `MARIN_DISPATCHER_BASE_URL` (or `DISPATCHER_URL`) - Base URL for Marin Dispatcher API
- `MARIN_DISPATCHER_ACCOUNT_ID` - Marin account ID (e.g., "5533110357")
- `MARIN_DISPATCHER_PUBLISHER` - Publisher name (default: "google")
- `MARIN_DISPATCHER_TIMEOUT` - Request timeout in milliseconds (default: 10000)

**Note**: For testing CRUD methods, you will need a valid API URL. If the API is not available, tests will fail gracefully (return errors instead of throwing).

---

## Test 1: createCampaign Method

**Objective**: Verify the `createCampaign()` method correctly creates a campaign on Marin Dispatcher.

### Test 1.1: Import Required Modules

**Step 1.1.1**: Open Node.js REPL
```
node
```

**Step 1.1.2**: Import the compiled service module
```javascript
const { MarinDispatcherService } = require('./dist/services/marinDispatcherService.js');
```

**Expected Result**: No error, `MarinDispatcherService` is defined

**Step 1.1.3**: Create service instance
```javascript
const service = new MarinDispatcherService();
```

**Expected Result**: No error, service instance created

### Test 1.2: Test createCampaign with Valid Data

**Step 1.2.1**: Create a test CampaignPlan object
```javascript
const campaignPlan = {
  objective: 'Drive sales for new product launch',
  targetAudience: {
    demographics: {
      age: '25-45',
      gender: 'all',
      location: 'United States',
      interests: ['technology', 'shopping']
    }
  },
  budget: {
    total: 5000,
    daily: 200,
    currency: 'USD'
  },
  timeline: {
    startDate: '2025-12-01',
    duration: 30
  },
  platforms: ['Google Ads'],
  kpis: {
    primary: 'Conversions',
    secondary: ['Click-through rate', 'Cost per conversion']
  }
};
```

**Step 1.2.2**: Call createCampaign method
```javascript
service.createCampaign(campaignPlan, 'Test Campaign - Product Launch').then(result => {
  console.log('createCampaign result:', result);
  console.log('Success:', result.success);
  console.log('Campaign ID:', result.campaignId);
  console.log('Error:', result.error);
  console.log('Details:', result.details);
}).catch(error => {
  console.error('Unexpected error:', error.message);
  console.error('Stack:', error.stack);
});
```

**Expected Results**:
- If API is accessible: Returns `{ success: true, campaignId: "...", details: {...} }`
- If API is not accessible: Returns `{ success: false, error: "..." }`
- Method does not throw errors (errors are caught and returned)

### Test 1.3: Test createCampaign with Invalid Data

**Step 1.3.1**: Create an invalid CampaignPlan (missing required fields)
```javascript
const invalidCampaignPlan = {
  objective: '', // Empty objective
  targetAudience: {},
  budget: {
    total: -100, // Negative budget
    currency: 'USD'
  },
  timeline: {
    startDate: '2025-12-01',
    duration: 30
  },
  platforms: [],
  kpis: {
    primary: 'Conversions'
  }
};
```

**Step 1.3.2**: Call createCampaign with invalid data
```javascript
service.createCampaign(invalidCampaignPlan, '').then(result => {
  console.log('createCampaign with invalid data result:', result);
  console.log('Success:', result.success);
  console.log('Error:', result.error);
}).catch(error => {
  console.error('Unexpected error:', error.message);
});
```

**Expected Result**: Returns `{ success: false, error: "Validation failed: ..." }`

### Test 1.4: Test createCampaign Error Handling

**Step 1.4.1**: Test with invalid API URL (if possible)
```javascript
// Note: This may require temporarily changing the service's API URL
// Or testing with a service instance that has an invalid URL
```

**Expected Result**: Method returns `{ success: false, error: "..." }` instead of throwing

---

## Test 2: updateCampaign Method

**Objective**: Verify the `updateCampaign()` method correctly updates a campaign on Marin Dispatcher.

### Test 2.1: Test updateCampaign with Valid Data

**Step 2.1.1**: Create service instance (if not already created)
```javascript
const service = new MarinDispatcherService();
```

**Step 2.1.2**: Create update data (budget update)
```javascript
const updates = {
  budget: {
    total: 6000,
    daily: 250,
    currency: 'USD'
  }
};
```

**Step 2.1.3**: Call updateCampaign method
```javascript
service.updateCampaign('test-campaign-id-123', updates).then(result => {
  console.log('updateCampaign result:', result);
  console.log('Success:', result.success);
  console.log('Campaign ID:', result.campaignId);
  console.log('Error:', result.error);
  console.log('Details:', result.details);
}).catch(error => {
  console.error('Unexpected error:', error.message);
});
```

**Expected Results**:
- If API is accessible: Returns `{ success: true, campaignId: "...", details: {...} }`
- If API is not accessible: Returns `{ success: false, error: "..." }`
- Method does not throw errors

### Test 2.2: Test updateCampaign with Invalid campaignId

**Step 2.2.1**: Call updateCampaign with empty campaignId
```javascript
service.updateCampaign('', updates).then(result => {
  console.log('updateCampaign with empty ID result:', result);
  console.log('Success:', result.success);
  console.log('Error:', result.error);
}).catch(error => {
  console.error('Unexpected error:', error.message);
});
```

**Expected Result**: Returns `{ success: false, error: "campaignId is required and must be a non-empty string" }`

### Test 2.3: Test updateCampaign with No Updates

**Step 2.3.1**: Call updateCampaign with empty updates
```javascript
service.updateCampaign('test-campaign-id-123', {}).then(result => {
  console.log('updateCampaign with no updates result:', result);
  console.log('Success:', result.success);
  console.log('Error:', result.error);
}).catch(error => {
  console.error('Unexpected error:', error.message);
});
```

**Expected Result**: Returns `{ success: false, error: "No valid fields to update" }`

---

## Test 3: pauseCampaign Method

**Objective**: Verify the `pauseCampaign()` method correctly pauses a campaign.

### Test 3.1: Test pauseCampaign with Valid campaignId

**Step 3.1.1**: Create service instance (if not already created)
```javascript
const service = new MarinDispatcherService();
```

**Step 3.1.2**: Call pauseCampaign method
```javascript
service.pauseCampaign('test-campaign-id-123').then(result => {
  console.log('pauseCampaign result:', result);
  console.log('Success:', result.success);
  console.log('Campaign ID:', result.campaignId);
  console.log('Error:', result.error);
  console.log('Details:', result.details);
}).catch(error => {
  console.error('Unexpected error:', error.message);
});
```

**Expected Results**:
- If API is accessible: Returns `{ success: true, campaignId: "...", details: {...} }`
- If API is not accessible: Returns `{ success: false, error: "..." }`
- Method does not throw errors

### Test 3.2: Test pauseCampaign with Invalid campaignId

**Step 3.2.1**: Call pauseCampaign with empty campaignId
```javascript
service.pauseCampaign('').then(result => {
  console.log('pauseCampaign with empty ID result:', result);
  console.log('Success:', result.success);
  console.log('Error:', result.error);
}).catch(error => {
  console.error('Unexpected error:', error.message);
});
```

**Expected Result**: Returns `{ success: false, error: "campaignId is required and must be a non-empty string" }`

---

## Test 4: resumeCampaign Method

**Objective**: Verify the `resumeCampaign()` method correctly resumes a campaign.

### Test 4.1: Test resumeCampaign with Valid campaignId

**Step 4.1.1**: Create service instance (if not already created)
```javascript
const service = new MarinDispatcherService();
```

**Step 4.1.2**: Call resumeCampaign method
```javascript
service.resumeCampaign('test-campaign-id-123').then(result => {
  console.log('resumeCampaign result:', result);
  console.log('Success:', result.success);
  console.log('Campaign ID:', result.campaignId);
  console.log('Error:', result.error);
  console.log('Details:', result.details);
}).catch(error => {
  console.error('Unexpected error:', error.message);
});
```

**Expected Results**:
- If API is accessible: Returns `{ success: true, campaignId: "...", details: {...} }`
- If API is not accessible: Returns `{ success: false, error: "..." }`
- Method does not throw errors

### Test 4.2: Test resumeCampaign with Invalid campaignId

**Step 4.2.1**: Call resumeCampaign with empty campaignId
```javascript
service.resumeCampaign('').then(result => {
  console.log('resumeCampaign with empty ID result:', result);
  console.log('Success:', result.success);
  console.log('Error:', result.error);
}).catch(error => {
  console.error('Unexpected error:', error.message);
});
```

**Expected Result**: Returns `{ success: false, error: "campaignId is required and must be a non-empty string" }`

---

## Test 5: deleteCampaign Method

**Objective**: Verify the `deleteCampaign()` method correctly deletes a campaign (sets status to REMOVED).

### Test 5.1: Test deleteCampaign with Valid campaignId

**Step 5.1.1**: Create service instance (if not already created)
```javascript
const service = new MarinDispatcherService();
```

**Step 5.1.2**: Call deleteCampaign method
```javascript
service.deleteCampaign('test-campaign-id-123').then(result => {
  console.log('deleteCampaign result:', result);
  console.log('Success:', result.success);
  console.log('Campaign ID:', result.campaignId);
  console.log('Error:', result.error);
  console.log('Details:', result.details);
}).catch(error => {
  console.error('Unexpected error:', error.message);
});
```

**Expected Results**:
- If API is accessible: Returns `{ success: true, campaignId: "...", details: {...} }`
- If API is not accessible: Returns `{ success: false, error: "..." }`
- Method does not throw errors
- Note: Marin Dispatcher uses status update to REMOVED instead of DELETE endpoint

### Test 5.2: Test deleteCampaign with Invalid campaignId

**Step 5.2.1**: Call deleteCampaign with empty campaignId
```javascript
service.deleteCampaign('').then(result => {
  console.log('deleteCampaign with empty ID result:', result);
  console.log('Success:', result.success);
  console.log('Error:', result.error);
}).catch(error => {
  console.error('Unexpected error:', error.message);
});
```

**Expected Result**: Returns `{ success: false, error: "campaignId is required and must be a non-empty string" }`

---

## Test 6: getCampaignStatus Method

**Objective**: Verify the `getCampaignStatus()` method correctly retrieves campaign status.

### Test 6.1: Test getCampaignStatus with Valid campaignId

**Step 6.1.1**: Create service instance (if not already created)
```javascript
const service = new MarinDispatcherService();
```

**Step 6.1.2**: Call getCampaignStatus method
```javascript
service.getCampaignStatus('test-campaign-id-123').then(result => {
  console.log('getCampaignStatus result:', result);
  console.log('Success:', result.success);
  console.log('Campaign ID:', result.campaignId);
  console.log('Error:', result.error);
  console.log('Details:', result.details);
  if (result.details) {
    console.log('Campaign Status:', result.details.status);
    console.log('Campaign Name:', result.details.name);
  }
}).catch(error => {
  console.error('Unexpected error:', error.message);
});
```

**Expected Results**:
- If API is accessible: Returns `{ success: true, campaignId: "...", details: { status: "...", name: "...", ... } }`
- If API is not accessible: Returns `{ success: false, error: "..." }`
- Method does not throw errors

### Test 6.2: Test getCampaignStatus with Invalid campaignId

**Step 6.2.1**: Call getCampaignStatus with empty campaignId
```javascript
service.getCampaignStatus('').then(result => {
  console.log('getCampaignStatus with empty ID result:', result);
  console.log('Success:', result.success);
  console.log('Error:', result.error);
}).catch(error => {
  console.error('Unexpected error:', error.message);
});
```

**Expected Result**: Returns `{ success: false, error: "campaignId is required and must be a non-empty string" }`

### Test 6.3: Test getCampaignStatus with Non-existent campaignId

**Step 6.3.1**: Call getCampaignStatus with a non-existent campaignId
```javascript
service.getCampaignStatus('non-existent-campaign-id-999').then(result => {
  console.log('getCampaignStatus with non-existent ID result:', result);
  console.log('Success:', result.success);
  console.log('Error:', result.error);
}).catch(error => {
  console.error('Unexpected error:', error.message);
});
```

**Expected Result**: Returns `{ success: false, error: "..." }` (API error, not thrown)

---

## Test 7: Integration Test - Full Campaign Lifecycle

**Objective**: Verify all CRUD methods work together in a complete campaign lifecycle.

### Test 7.1: Create, Update, Pause, Resume, Get Status, Delete

**Step 7.1.1**: Create service instance
```javascript
const service = new MarinDispatcherService();
```

**Step 7.1.2**: Create a campaign
```javascript
const campaignPlan = {
  objective: 'Test campaign lifecycle',
  targetAudience: {},
  budget: { total: 1000, currency: 'USD' },
  timeline: { startDate: '2025-12-01', duration: 30 },
  platforms: ['Google Ads'],
  kpis: { primary: 'Conversions' }
};

let createdCampaignId = null;

service.createCampaign(campaignPlan, 'Lifecycle Test Campaign').then(result => {
  console.log('1. Create Campaign:', result);
  if (result.success && result.campaignId) {
    createdCampaignId = result.campaignId;
    console.log('Created Campaign ID:', createdCampaignId);
    
    // Step 7.1.3: Update the campaign
    return service.updateCampaign(createdCampaignId, { budget: { total: 2000, currency: 'USD' } });
  } else {
    console.log('Campaign creation failed, skipping lifecycle test');
  }
}).then(result => {
  if (result) {
    console.log('2. Update Campaign:', result);
    
    // Step 7.1.4: Pause the campaign
    return service.pauseCampaign(createdCampaignId);
  }
}).then(result => {
  if (result) {
    console.log('3. Pause Campaign:', result);
    
    // Step 7.1.5: Get campaign status
    return service.getCampaignStatus(createdCampaignId);
  }
}).then(result => {
  if (result) {
    console.log('4. Get Campaign Status:', result);
    
    // Step 7.1.6: Resume the campaign
    return service.resumeCampaign(createdCampaignId);
  }
}).then(result => {
  if (result) {
    console.log('5. Resume Campaign:', result);
    
    // Step 7.1.7: Delete the campaign
    return service.deleteCampaign(createdCampaignId);
  }
}).then(result => {
  if (result) {
    console.log('6. Delete Campaign:', result);
    console.log('✓ Full campaign lifecycle test completed');
  }
}).catch(error => {
  console.error('Lifecycle test error:', error.message);
});
```

**Expected Results**:
- All methods execute in sequence
- Each method returns appropriate response
- No errors are thrown (all errors are caught and returned)
- Campaign lifecycle completes successfully (if API is accessible)

---

## Test 8: Error Handling Verification

**Objective**: Verify all methods handle errors gracefully without throwing.

### Test 8.1: Test Error Handling for All Methods

**Step 8.1.1**: Create service instance
```javascript
const service = new MarinDispatcherService();
```

**Step 8.1.2**: Test error handling for createCampaign
```javascript
service.createCampaign(null, '').then(result => {
  console.log('createCampaign error handling:', result);
  console.log('Does not throw:', result.error !== undefined);
}).catch(error => {
  console.error('ERROR: createCampaign threw an error:', error.message);
});
```

**Expected Result**: Returns error response, does not throw

**Step 8.1.3**: Test error handling for updateCampaign
```javascript
service.updateCampaign('', {}).then(result => {
  console.log('updateCampaign error handling:', result);
  console.log('Does not throw:', result.error !== undefined);
}).catch(error => {
  console.error('ERROR: updateCampaign threw an error:', error.message);
});
```

**Expected Result**: Returns error response, does not throw

**Step 8.1.4**: Test error handling for pauseCampaign
```javascript
service.pauseCampaign('').then(result => {
  console.log('pauseCampaign error handling:', result);
  console.log('Does not throw:', result.error !== undefined);
}).catch(error => {
  console.error('ERROR: pauseCampaign threw an error:', error.message);
});
```

**Expected Result**: Returns error response, does not throw

**Step 8.1.5**: Test error handling for resumeCampaign
```javascript
service.resumeCampaign('').then(result => {
  console.log('resumeCampaign error handling:', result);
  console.log('Does not throw:', result.error !== undefined);
}).catch(error => {
  console.error('ERROR: resumeCampaign threw an error:', error.message);
});
```

**Expected Result**: Returns error response, does not throw

**Step 8.1.6**: Test error handling for deleteCampaign
```javascript
service.deleteCampaign('').then(result => {
  console.log('deleteCampaign error handling:', result);
  console.log('Does not throw:', result.error !== undefined);
}).catch(error => {
  console.error('ERROR: deleteCampaign threw an error:', error.message);
});
```

**Expected Result**: Returns error response, does not throw

**Step 8.1.7**: Test error handling for getCampaignStatus
```javascript
service.getCampaignStatus('').then(result => {
  console.log('getCampaignStatus error handling:', result);
  console.log('Does not throw:', result.error !== undefined);
}).catch(error => {
  console.error('ERROR: getCampaignStatus threw an error:', error.message);
});
```

**Expected Result**: Returns error response, does not throw

---

## Test 9: X-Ray Tracing Verification

**Objective**: Verify X-Ray tracing is integrated in all methods.

### Test 9.1: Verify X-Ray SDK is Used

**Step 9.1.1**: Check if X-Ray SDK is imported (inspect service file)
```
Get-Content dist/services/marinDispatcherService.js | Select-String "aws-xray"
```

**Expected Result**: X-Ray SDK is imported

**Step 9.1.2**: Check if all methods use X-Ray tracing
```
Get-Content dist/services/marinDispatcherService.js | Select-String "getSegment|addNewSubsegment"
```

**Expected Result**: All methods use X-Ray tracing

**Note**: X-Ray tracing requires AWS Lambda environment. In local testing, segments may not be created, but the code should not error.

---

## Test 10: TypeScript Type Safety

**Objective**: Verify TypeScript compilation and type safety.

### Test 10.1: Verify TypeScript Compilation

**Step 10.1.1**: Run TypeScript compiler
```
npm run build
```

**Expected Result**: Compilation succeeds with no errors

**Step 10.1.2**: Check for any type errors
```
# Look for "error TS" in output
```

**Expected Result**: No TypeScript errors

### Test 10.2: Verify Method Signatures

**Step 10.2.1**: Check that all methods exist and have correct signatures
```javascript
const service = new MarinDispatcherService();
console.log('createCampaign:', typeof service.createCampaign);
console.log('updateCampaign:', typeof service.updateCampaign);
console.log('pauseCampaign:', typeof service.pauseCampaign);
console.log('resumeCampaign:', typeof service.resumeCampaign);
console.log('deleteCampaign:', typeof service.deleteCampaign);
console.log('getCampaignStatus:', typeof service.getCampaignStatus);
```

**Expected Results**: All methods should be `"function"`

---

## Test Results Summary

After completing all tests, document your results:

### Test Results Checklist

- [ ] **Test 1**: createCampaign Method
  - [ ] Method creates campaign with valid data
  - [ ] Method validates input data
  - [ ] Method handles errors gracefully
  
- [ ] **Test 2**: updateCampaign Method
  - [ ] Method updates campaign with valid data
  - [ ] Method validates campaignId
  - [ ] Method handles empty updates
  - [ ] Method handles errors gracefully
  
- [ ] **Test 3**: pauseCampaign Method
  - [ ] Method pauses campaign with valid campaignId
  - [ ] Method validates campaignId
  - [ ] Method handles errors gracefully
  
- [ ] **Test 4**: resumeCampaign Method
  - [ ] Method resumes campaign with valid campaignId
  - [ ] Method validates campaignId
  - [ ] Method handles errors gracefully
  
- [ ] **Test 5**: deleteCampaign Method
  - [ ] Method deletes campaign with valid campaignId
  - [ ] Method validates campaignId
  - [ ] Method handles errors gracefully
  
- [ ] **Test 6**: getCampaignStatus Method
  - [ ] Method gets campaign status with valid campaignId
  - [ ] Method validates campaignId
  - [ ] Method handles errors gracefully
  
- [ ] **Test 7**: Integration Test - Full Campaign Lifecycle
  - [ ] All methods work together
  - [ ] Campaign lifecycle completes successfully
  
- [ ] **Test 8**: Error Handling Verification
  - [ ] All methods handle errors gracefully
  - [ ] No methods throw errors
  
- [ ] **Test 9**: X-Ray Tracing Verification
  - [ ] X-Ray SDK is imported
  - [ ] All methods use X-Ray tracing
  
- [ ] **Test 10**: TypeScript Type Safety
  - [ ] TypeScript compilation succeeds
  - [ ] All methods have correct signatures

---

## Troubleshooting

### Issue: "Cannot find module" errors

**Solution**: 
1. Ensure you've run `npm run build` to compile TypeScript
2. Verify you're in the correct directory (backend/)
3. Use relative paths from backend directory: `./dist/services/marinDispatcherService.js`

### Issue: API methods return errors

**Possible Causes**:
1. API endpoint is not accessible
2. API URL is incorrect
3. Network connectivity issues
4. Invalid request data

**Solution**: This is expected if the API is not available. The methods should return error responses without throwing errors.

### Issue: Validation errors

**Solution**: 
1. Ensure all required fields are provided
2. Check that data types are correct
3. Verify budget amounts are positive numbers
4. Check that campaign names are not empty

### Issue: TypeScript compilation errors

**Solution**:
1. Check for syntax errors in `src/services/marinDispatcherService.ts`
2. Verify all imports are correct
3. Run `npm install` to ensure dependencies are installed

---

## Next Steps

After completing Phase 2.2 manual testing:

1. **Document Results**: Record all test results in this document or a separate test results file
2. **Report Issues**: If any tests fail, document the issue and expected vs actual behavior
3. **Proceed to Phase 2.3**: Once all Phase 2.2 tests pass, proceed to Phase 2.3 (Campaign Query Methods) if needed

---

## Notes

- **No Scripts**: These instructions are designed for manual execution. Do not create automated test scripts.
- **Node.js REPL**: Use Node.js REPL for interactive testing. Exit with `.exit` command.
- **Environment Variables**: Ensure environment variables are set before testing. You may need to restart Node.js REPL after setting environment variables.
- **API Availability**: Some tests require a valid API endpoint. If the API is not available, tests will fail gracefully (return errors instead of throwing errors).

---

**End of Manual Testing Instructions**

