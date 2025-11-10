# Phase 2D.4 Manual Testing Instructions

**Phase**: 2D.4 - Lambda Integration Testing  
**Date**: 2025-11-10  
**Status**: Ready for Manual Testing  
**Testing Approach**: Manual, Line-by-Line Instructions (No Scripts)

---

## Overview

This document provides explicit, line-by-line manual testing instructions for Phase 2D.4 implementation of the Lambda Integration. Phase 2D.4 includes:

1. **MarinDispatcherClient**: Lambda client wrapper for campaign operations
2. **MarinBatchJobClient**: Lambda client wrapper for batch job operations
3. **Lambda Handler Examples**: Example handlers for campaign management and bulk worker

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

**Step 1.3**: Verify compiled client files exist
```
Test-Path dist/lib/marinDispatcherClient.js
Test-Path dist/lib/marinBatchJobClient.js
```
**Expected Result**: Both return `True`

**Step 1.4**: Verify compiled type files exist
```
Test-Path dist/types/lambda.types.js
```
**Expected Result**: Returns `True`

### 2. Environment Variables

**Step 2.1**: Check if `.env` file exists in the backend directory
```
Test-Path .env
```

**Step 2.2**: Verify required environment variables are set (or will be set for testing):
- `MARIN_DISPATCHER_BASE_URL` (or `DISPATCHER_URL`) - Base URL for Marin Dispatcher API
- `MARIN_DISPATCHER_ACCOUNT_ID` - Marin account ID (e.g., "5533110357")
- `MARIN_DISPATCHER_PUBLISHER` - Publisher name (default: "google")
- `MARIN_DISPATCHER_TIMEOUT` - Request timeout in milliseconds (default: 10000)

---

## Test Execution

### Option 1: Using Node.js REPL (Recommended)

**Step 1**: Start Node.js REPL
```
node
```

**Step 2**: Import the compiled modules
```javascript
const { MarinDispatcherClient } = require('./dist/lib/marinDispatcherClient.js');
const { MarinBatchJobClient } = require('./dist/lib/marinBatchJobClient.js');
```

**Step 3**: Create client instances
```javascript
const dispatcherClient = new MarinDispatcherClient();
const batchJobClient = new MarinBatchJobClient();
```

---

## Test 1: MarinDispatcherClient - handleLambdaEvent Method

### Test 1.1: create_campaign Action

**Step 1.1.1**: Create a sample Lambda event for create_campaign
```javascript
const createEvent = {
  action: 'create_campaign',
  data: {
    campaignPlan: {
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
        currency: 'USD',
      },
      timeline: {
        startDate: '2025-01-01',
        endDate: '2025-01-31',
        duration: 31,
      },
    },
    name: 'Test Campaign - Manual Test',
  },
  user: {
    sub: 'user-123',
    email: 'test@example.com',
  },
  mode: 'direct',
};
```

**Step 1.1.2**: Call handleLambdaEvent with create_campaign action
```javascript
const result = await dispatcherClient.handleLambdaEvent(createEvent);
console.log('Result:', JSON.stringify(result, null, 2));
```

**Expected Result**:
- `result.success` is a boolean
- `result.result` contains campaign details (if successful)
- `result.error` is undefined (if successful) or contains error message (if failed)
- `result.details` contains full PlatformAPIResponse

**Step 1.1.3**: Verify response structure
```javascript
console.log('Success:', result.success);
console.log('Has result:', result.result !== undefined);
console.log('Has error:', result.error !== undefined);
console.log('Has details:', result.details !== undefined);
```

**Expected Result**: All checks return expected values

### Test 1.2: update_campaign Action

**Step 1.2.1**: Create a sample Lambda event for update_campaign
```javascript
const updateEvent = {
  action: 'update_campaign',
  data: {
    campaignId: 'test-campaign-id-123',
    updates: {
      budget: {
        total: 6000,
        daily: 250,
        currency: 'USD',
      },
    },
  },
  user: {
    sub: 'user-123',
  },
};
```

**Step 1.2.2**: Call handleLambdaEvent with update_campaign action
```javascript
const result = await dispatcherClient.handleLambdaEvent(updateEvent);
console.log('Result:', JSON.stringify(result, null, 2));
```

**Expected Result**: Same structure as Test 1.1

### Test 1.3: pause_campaign Action

**Step 1.3.1**: Create a sample Lambda event for pause_campaign
```javascript
const pauseEvent = {
  action: 'pause_campaign',
  data: {
    campaignId: 'test-campaign-id-123',
  },
  user: {
    sub: 'user-123',
  },
};
```

**Step 1.3.2**: Call handleLambdaEvent with pause_campaign action
```javascript
const result = await dispatcherClient.handleLambdaEvent(pauseEvent);
console.log('Result:', JSON.stringify(result, null, 2));
```

**Expected Result**: Same structure as Test 1.1

### Test 1.4: resume_campaign Action

**Step 1.4.1**: Create a sample Lambda event for resume_campaign
```javascript
const resumeEvent = {
  action: 'resume_campaign',
  data: {
    campaignId: 'test-campaign-id-123',
  },
  user: {
    sub: 'user-123',
  },
};
```

**Step 1.4.2**: Call handleLambdaEvent with resume_campaign action
```javascript
const result = await dispatcherClient.handleLambdaEvent(resumeEvent);
console.log('Result:', JSON.stringify(result, null, 2));
```

**Expected Result**: Same structure as Test 1.1

### Test 1.5: delete_campaign Action

**Step 1.5.1**: Create a sample Lambda event for delete_campaign
```javascript
const deleteEvent = {
  action: 'delete_campaign',
  data: {
    campaignId: 'test-campaign-id-123',
  },
  user: {
    sub: 'user-123',
  },
};
```

**Step 1.5.2**: Call handleLambdaEvent with delete_campaign action
```javascript
const result = await dispatcherClient.handleLambdaEvent(deleteEvent);
console.log('Result:', JSON.stringify(result, null, 2));
```

**Expected Result**: Same structure as Test 1.1

### Test 1.6: get_campaign_status Action

**Step 1.6.1**: Create a sample Lambda event for get_campaign_status
```javascript
const statusEvent = {
  action: 'get_campaign_status',
  data: {
    campaignId: 'test-campaign-id-123',
  },
  user: {
    sub: 'user-123',
  },
};
```

**Step 1.6.2**: Call handleLambdaEvent with get_campaign_status action
```javascript
const result = await dispatcherClient.handleLambdaEvent(statusEvent);
console.log('Result:', JSON.stringify(result, null, 2));
```

**Expected Result**: Same structure as Test 1.1

### Test 1.7: Unknown Action

**Step 1.7.1**: Create a sample Lambda event with unknown action
```javascript
const unknownEvent = {
  action: 'unknown_action',
  data: {},
  user: {
    sub: 'user-123',
  },
};
```

**Step 1.7.2**: Call handleLambdaEvent with unknown action
```javascript
const result = await dispatcherClient.handleLambdaEvent(unknownEvent);
console.log('Result:', JSON.stringify(result, null, 2));
```

**Expected Result**:
- `result.success` is `false`
- `result.error` contains error message about unknown action
- `result.details` contains supported actions list

### Test 1.8: Invalid Event Structure

**Step 1.8.1**: Test with missing action
```javascript
const invalidEvent1 = {
  data: { campaignId: 'test-123' },
  user: { sub: 'user-123' },
};
const result1 = await dispatcherClient.handleLambdaEvent(invalidEvent1);
console.log('Missing action result:', JSON.stringify(result1, null, 2));
```

**Expected Result**:
- `result1.success` is `false`
- `result1.error` contains "Action is required and must be a string"

**Step 1.8.2**: Test with missing data
```javascript
const invalidEvent2 = {
  action: 'create_campaign',
  user: { sub: 'user-123' },
};
const result2 = await dispatcherClient.handleLambdaEvent(invalidEvent2);
console.log('Missing data result:', JSON.stringify(result2, null, 2));
```

**Expected Result**:
- `result2.success` is `false`
- `result2.error` contains "Data is required and must be an object"

**Step 1.8.3**: Test with missing user
```javascript
const invalidEvent3 = {
  action: 'create_campaign',
  data: { campaignId: 'test-123' },
};
const result3 = await dispatcherClient.handleLambdaEvent(invalidEvent3);
console.log('Missing user result:', JSON.stringify(result3, null, 2));
```

**Expected Result**:
- `result3.success` is `false`
- `result3.error` contains "User is required and must have a sub (user ID)"

---

## Test 2: MarinBatchJobClient - handleSqsEvent Method

### Test 2.1: Valid SQS Event

**Step 2.1.1**: Create a sample SQS event
```javascript
const sqsEvent = {
  Records: [
    {
      messageId: 'msg-123',
      receiptHandle: 'receipt-123',
      body: JSON.stringify({
        jobId: 'job-123',
        campaigns: [
          {
            accountId: '5533110357',
            name: 'Test Campaign 1',
            status: 'ENABLED',
            budget: {
              amount: 100,
              deliveryMethod: 'STANDARD',
            },
            biddingStrategy: 'MANUAL_CPC',
          },
          {
            accountId: '5533110357',
            name: 'Test Campaign 2',
            status: 'ENABLED',
            budget: {
              amount: 200,
              deliveryMethod: 'STANDARD',
            },
            biddingStrategy: 'MANUAL_CPC',
          },
        ],
      }),
      attributes: {
        ApproximateReceiveCount: '1',
        SentTimestamp: '1234567890',
        SenderId: 'sender-123',
        ApproximateFirstReceiveTimestamp: '1234567890',
      },
      md5OfBody: 'md5-123',
      eventSource: 'aws:sqs',
      eventSourceARN: 'arn:aws:sqs:us-east-1:123456789012:queue-name',
      awsRegion: 'us-east-1',
    },
  ],
};
```

**Step 2.1.2**: Call handleSqsEvent with valid SQS event
```javascript
const result = await batchJobClient.handleSqsEvent(sqsEvent);
console.log('Result:', JSON.stringify(result, null, 2));
```

**Expected Result**:
- `result.success` is a boolean
- `result.result` contains processed/failed counts and results array
- `result.error` is undefined (if successful) or contains error message (if failed)
- `result.details` contains full event and results

**Step 2.1.3**: Verify response structure
```javascript
console.log('Success:', result.success);
console.log('Has result:', result.result !== undefined);
console.log('Has processed count:', result.result?.processed !== undefined);
console.log('Has failed count:', result.result?.failed !== undefined);
```

**Expected Result**: All checks return expected values

### Test 2.2: Invalid SQS Event Structure

**Step 2.2.1**: Test with missing Records
```javascript
const invalidSqsEvent1 = {};
const result1 = await batchJobClient.handleSqsEvent(invalidSqsEvent1);
console.log('Missing Records result:', JSON.stringify(result1, null, 2));
```

**Expected Result**:
- `result1.success` is `false`
- `result1.error` contains "Invalid SQS event: Records array is required"

**Step 2.2.2**: Test with empty Records
```javascript
const invalidSqsEvent2 = { Records: [] };
const result2 = await batchJobClient.handleSqsEvent(invalidSqsEvent2);
console.log('Empty Records result:', JSON.stringify(result2, null, 2));
```

**Expected Result**:
- `result2.success` is `false`
- `result2.error` contains "SQS event contains no records"

**Step 2.2.3**: Test with invalid message body
```javascript
const invalidSqsEvent3 = {
  Records: [
    {
      messageId: 'msg-123',
      body: 'invalid json',
    },
  ],
};
const result3 = await batchJobClient.handleSqsEvent(invalidSqsEvent3);
console.log('Invalid JSON result:', JSON.stringify(result3, null, 2));
```

**Expected Result**:
- `result3.success` is `false` or `true` (partial success)
- `result3.result.errors` contains error about failed to parse message body

---

## Test 3: MarinBatchJobClient - handleLambdaEvent Method

### Test 3.1: bulk_create_campaigns Action

**Step 3.1.1**: Create a sample Lambda event for bulk_create_campaigns
```javascript
const bulkEvent = {
  action: 'bulk_create_campaigns',
  data: {
    campaigns: [
      {
        accountId: '5533110357',
        name: 'Bulk Campaign 1',
        status: 'ENABLED',
        budget: {
          amount: 100,
          deliveryMethod: 'STANDARD',
        },
        biddingStrategy: 'MANUAL_CPC',
      },
      {
        accountId: '5533110357',
        name: 'Bulk Campaign 2',
        status: 'ENABLED',
        budget: {
          amount: 200,
          deliveryMethod: 'STANDARD',
        },
        biddingStrategy: 'MANUAL_CPC',
      },
    ],
  },
  user: {
    sub: 'user-123',
  },
};
```

**Step 3.1.2**: Call handleLambdaEvent with bulk_create_campaigns action
```javascript
const result = await batchJobClient.handleLambdaEvent(bulkEvent);
console.log('Result:', JSON.stringify(result, null, 2));
```

**Expected Result**:
- `result.success` is a boolean
- `result.result` contains batch job results
- `result.details` contains full event and result

### Test 3.2: create_batch_job Action

**Step 3.2.1**: Create a sample Lambda event for create_batch_job
```javascript
const createBatchEvent = {
  action: 'create_batch_job',
  data: {},
  user: {
    sub: 'user-123',
  },
};
```

**Step 3.2.2**: Call handleLambdaEvent with create_batch_job action
```javascript
const result = await batchJobClient.handleLambdaEvent(createBatchEvent);
console.log('Result:', JSON.stringify(result, null, 2));
```

**Expected Result**: Same structure as Test 3.1

### Test 3.3: add_operations_to_batch Action

**Step 3.3.1**: Create a sample Lambda event for add_operations_to_batch
```javascript
const addOpsEvent = {
  action: 'add_operations_to_batch',
  data: {
    batchJobId: 'batch-job-123',
    operations: [
      {
        operationType: 'CREATE',
        resourceType: 'CAMPAIGN',
        resource: {
          accountId: '5533110357',
          name: 'Test Campaign',
          status: 'ENABLED',
          budget: {
            amount: 100,
            deliveryMethod: 'STANDARD',
          },
          biddingStrategy: 'MANUAL_CPC',
        },
      },
    ],
  },
  user: {
    sub: 'user-123',
  },
};
```

**Step 3.3.2**: Call handleLambdaEvent with add_operations_to_batch action
```javascript
const result = await batchJobClient.handleLambdaEvent(addOpsEvent);
console.log('Result:', JSON.stringify(result, null, 2));
```

**Expected Result**: Same structure as Test 3.1

### Test 3.4: run_batch_job Action

**Step 3.4.1**: Create a sample Lambda event for run_batch_job
```javascript
const runBatchEvent = {
  action: 'run_batch_job',
  data: {
    batchJobId: 'batch-job-123',
  },
  user: {
    sub: 'user-123',
  },
};
```

**Step 3.4.2**: Call handleLambdaEvent with run_batch_job action
```javascript
const result = await batchJobClient.handleLambdaEvent(runBatchEvent);
console.log('Result:', JSON.stringify(result, null, 2));
```

**Expected Result**: Same structure as Test 3.1

### Test 3.5: poll_batch_job_status Action

**Step 3.5.1**: Create a sample Lambda event for poll_batch_job_status
```javascript
const pollEvent = {
  action: 'poll_batch_job_status',
  data: {
    batchJobId: 'batch-job-123',
    maxAttempts: 2,
    intervalMs: 1000,
  },
  user: {
    sub: 'user-123',
  },
};
```

**Step 3.5.2**: Call handleLambdaEvent with poll_batch_job_status action
```javascript
const result = await batchJobClient.handleLambdaEvent(pollEvent);
console.log('Result:', JSON.stringify(result, null, 2));
```

**Expected Result**: Same structure as Test 3.1

### Test 3.6: get_batch_job_results Action

**Step 3.6.1**: Create a sample Lambda event for get_batch_job_results
```javascript
const getResultsEvent = {
  action: 'get_batch_job_results',
  data: {
    batchJobId: 'batch-job-123',
  },
  user: {
    sub: 'user-123',
  },
};
```

**Step 3.6.2**: Call handleLambdaEvent with get_batch_job_results action
```javascript
const result = await batchJobClient.handleLambdaEvent(getResultsEvent);
console.log('Result:', JSON.stringify(result, null, 2));
```

**Expected Result**: Same structure as Test 3.1

### Test 3.7: Unknown Action

**Step 3.7.1**: Create a sample Lambda event with unknown action
```javascript
const unknownEvent = {
  action: 'unknown_action',
  data: {},
  user: {
    sub: 'user-123',
  },
};
```

**Step 3.7.2**: Call handleLambdaEvent with unknown action
```javascript
const result = await batchJobClient.handleLambdaEvent(unknownEvent);
console.log('Result:', JSON.stringify(result, null, 2));
```

**Expected Result**:
- `result.success` is `false`
- `result.error` contains error message about unknown action
- `result.details` contains supported actions list

---

## Test 4: Response Format Validation

### Test 4.1: LambdaResponse Structure

**Step 4.1.1**: Verify all responses follow LambdaResponse format
```javascript
// Test with any successful response
const testEvent = {
  action: 'get_campaign_status',
  data: { campaignId: 'test-123' },
  user: { sub: 'user-123' },
};
const result = await dispatcherClient.handleLambdaEvent(testEvent);

// Verify structure
console.log('Has success:', typeof result.success === 'boolean');
console.log('Has result:', result.result !== undefined);
console.log('Has error:', result.error !== undefined || result.error === undefined);
console.log('Has details:', result.details !== undefined);
```

**Expected Result**: All checks return `true`

### Test 4.2: Error Response Structure

**Step 4.2.1**: Verify error responses follow LambdaResponse format
```javascript
const errorEvent = {
  action: 'unknown_action',
  data: {},
  user: { sub: 'user-123' },
};
const result = await dispatcherClient.handleLambdaEvent(errorEvent);

// Verify error structure
console.log('Success is false:', result.success === false);
console.log('Has error message:', typeof result.error === 'string');
console.log('Has details:', result.details !== undefined);
```

**Expected Result**: All checks return `true`

---

## Test Checklist

### MarinDispatcherClient Tests
- [ ] Test 1.1: create_campaign action
- [ ] Test 1.2: update_campaign action
- [ ] Test 1.3: pause_campaign action
- [ ] Test 1.4: resume_campaign action
- [ ] Test 1.5: delete_campaign action
- [ ] Test 1.6: get_campaign_status action
- [ ] Test 1.7: Unknown action (error handling)
- [ ] Test 1.8: Invalid event structure (validation)

### MarinBatchJobClient Tests
- [ ] Test 2.1: Valid SQS event
- [ ] Test 2.2: Invalid SQS event structure (validation)
- [ ] Test 3.1: bulk_create_campaigns action
- [ ] Test 3.2: create_batch_job action
- [ ] Test 3.3: add_operations_to_batch action
- [ ] Test 3.4: run_batch_job action
- [ ] Test 3.5: poll_batch_job_status action
- [ ] Test 3.6: get_batch_job_results action
- [ ] Test 3.7: Unknown action (error handling)

### Response Format Tests
- [ ] Test 4.1: LambdaResponse structure validation
- [ ] Test 4.2: Error response structure validation

---

## Expected Results Summary

### Successful Tests
- All actions return proper `LambdaResponse` format
- All validation tests pass (invalid inputs are rejected)
- All error handling works correctly
- All response structures are correct

### Expected Failures (API Not Available)
- API calls will return 404 errors (expected)
- Error handling will catch and format errors correctly
- Methods will return error responses instead of throwing

---

## Troubleshooting

### Common Issues

1. **Module Not Found Error**
   - **Solution**: Run `npm run build` to compile TypeScript files
   - **Verify**: Check that `dist/lib/` directory contains compiled files

2. **Environment Variable Not Set**
   - **Solution**: Set `DISPATCHER_URL` or `MARIN_DISPATCHER_BASE_URL` in `.env` file
   - **Verify**: Check `.env` file contains required variables

3. **Type Errors**
   - **Solution**: Ensure TypeScript compilation completed successfully
   - **Verify**: Run `npm run build` and check for errors

4. **API 404 Errors**
   - **Expected**: API is not available, methods handle errors gracefully
   - **Verify**: Check that error responses are properly formatted

---

**End of Manual Testing Instructions**

**Version**: 1.0  
**Created**: 2025-11-10  
**Purpose**: Manual testing guide for Phase 2D.4 (Lambda Integration Testing)  
**Reusable**: Yes - Use this guide each time you need to test Phase 2D.4

