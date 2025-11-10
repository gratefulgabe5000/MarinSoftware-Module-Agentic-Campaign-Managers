# Phase 2.1 Manual Testing Instructions

**Phase**: 2.1 - Base Service Structure  
**Date**: 2025-11-10  
**Status**: Ready for Manual Testing  
**Testing Approach**: Manual, Line-by-Line Instructions (No Scripts)

---

## Overview

This document provides explicit, line-by-line manual testing instructions for Phase 2.1 implementation of the Marin Dispatcher Service. Phase 2.1 includes:

1. **Service Class Structure**: Constructor, private properties, helper methods
2. **isAuthenticated Method**: API connectivity check
3. **Placeholder Methods**: All CRUD methods that return "not yet implemented" errors

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

**Step 1.4**: Verify the compiled config file exists
```
Test-Path dist/config/env.js
```
**Expected Result**: Returns `True`

### 2. Environment Variables

**Step 2.1**: Check if `.env` file exists in the backend directory
```
Test-Path .env
```

**Step 2.2**: If `.env` exists, verify it contains Marin Dispatcher configuration:
```
Get-Content .env | Select-String "MARIN_DISPATCHER"
```

**Step 2.3**: Verify required environment variables are set (or will be set for testing):
- `MARIN_DISPATCHER_BASE_URL` (or `DISPATCHER_URL`) - Base URL for Marin Dispatcher API
- `MARIN_DISPATCHER_ACCOUNT_ID` - Marin account ID (e.g., "5533110357")
- `MARIN_DISPATCHER_PUBLISHER` - Publisher name (default: "google")
- `MARIN_DISPATCHER_TIMEOUT` - Request timeout in milliseconds (default: 10000)

**Note**: For testing `isAuthenticated()`, you will need a valid API URL. If the API is not available, the test will fail gracefully (return `false`).

---

## Test 1: Service Constructor - Default Parameters

**Objective**: Verify the service can be instantiated with default parameters from config.

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

**Step 1.1.3**: Import the config module to verify values
```javascript
const config = require('./dist/config/env.js');
```

**Expected Result**: No error, `config` is defined

**Step 1.1.4**: Check config values
```javascript
console.log('Config marinDispatcher:', config.default.marinDispatcher);
```

**Expected Result**: Object with `baseUrl`, `accountId`, `publisher`, `timeout` properties

### Test 1.2: Create Service with Default Parameters

**Step 1.2.1**: Create a service instance with no parameters
```javascript
const service = new MarinDispatcherService();
```

**Expected Result**: No error, service instance created

**Step 1.2.2**: Verify service is an instance of MarinDispatcherService
```javascript
console.log('Service instance:', service instanceof MarinDispatcherService);
```

**Expected Result**: `true`

**Step 1.2.3**: Verify service extends BasePlatformAPI (check for platformName property)
```javascript
console.log('Platform name:', service.platformName);
```

**Expected Result**: `"Marin Dispatcher"`

### Test 1.3: Verify Constructor Error Handling

**Step 1.3.1**: Exit Node.js REPL
```javascript
.exit
```

**Step 1.3.2**: Temporarily rename or remove `.env` file (if it exists)
```
Rename-Item .env .env.backup -ErrorAction SilentlyContinue
```

**Step 1.3.3**: Unset environment variables
```
$env:MARIN_DISPATCHER_BASE_URL = $null
$env:DISPATCHER_URL = $null
```

**Step 1.3.4**: Open Node.js REPL again
```
node
```

**Step 1.3.5**: Import the service
```javascript
const { MarinDispatcherService } = require('./dist/services/marinDispatcherService.js');
```

**Step 1.3.6**: Attempt to create service instance
```javascript
try {
  const service = new MarinDispatcherService();
  console.log('ERROR: Service created without required config');
} catch (error) {
  console.log('SUCCESS: Error thrown as expected:', error.message);
}
```

**Expected Result**: Error message: `"DISPATCHER_URL or MARIN_DISPATCHER_BASE_URL must be set"`

**Step 1.3.7**: Restore environment
```javascript
.exit
```

**Step 1.3.8**: Restore `.env` file (if it existed)
```
Rename-Item .env.backup .env -ErrorAction SilentlyContinue
```

---

## Test 2: Service Constructor - Custom Parameters

**Objective**: Verify the service can be instantiated with custom accountId and publisher.

### Test 2.1: Create Service with Custom accountId

**Step 2.1.1**: Open Node.js REPL
```
node
```

**Step 2.1.2**: Import the service
```javascript
const { MarinDispatcherService } = require('./dist/services/marinDispatcherService.js');
```

**Step 2.1.3**: Create service with custom accountId
```javascript
const service = new MarinDispatcherService('custom-account-123');
```

**Expected Result**: No error, service instance created

**Step 2.1.4**: Verify service uses custom accountId (we'll check this indirectly via isAuthenticated test)

### Test 2.2: Create Service with Custom accountId and Publisher

**Step 2.2.1**: Create service with both custom accountId and publisher
```javascript
const service2 = new MarinDispatcherService('custom-account-456', 'meta');
```

**Expected Result**: No error, service instance created

**Step 2.2.2**: Verify service uses custom publisher (we'll check this indirectly via API path in isAuthenticated test)

---

## Test 3: isAuthenticated Method

**Objective**: Verify the `isAuthenticated()` method correctly checks API connectivity.

### Test 3.1: Test isAuthenticated with Valid API URL

**Prerequisites**: 
- Valid `MARIN_DISPATCHER_BASE_URL` or `DISPATCHER_URL` environment variable set
- API endpoint is accessible (or mock server running)

**Step 3.1.1**: Ensure environment variables are set
```javascript
// In Node.js REPL, check environment
console.log('DISPATCHER_URL:', process.env.DISPATCHER_URL);
console.log('MARIN_DISPATCHER_BASE_URL:', process.env.MARIN_DISPATCHER_BASE_URL);
```

**Step 3.1.2**: Create service instance
```javascript
const service = new MarinDispatcherService();
```

**Step 3.1.3**: Call isAuthenticated method
```javascript
service.isAuthenticated().then(result => {
  console.log('isAuthenticated result:', result);
  console.log('Type:', typeof result);
}).catch(error => {
  console.error('Error calling isAuthenticated:', error.message);
});
```

**Expected Results**:
- If API is accessible: Returns `true` (status 200)
- If API is not accessible: Returns `false` (error caught and logged)
- Result is always a boolean

**Step 3.1.4**: Verify error handling (if API is not accessible)
```javascript
// If API is not accessible, verify error is caught and logged
// Check console output for: "[Marin Dispatcher] Authentication check failed:"
```

**Expected Result**: Error is caught, logged, and method returns `false` (not throwing)

### Test 3.2: Test isAuthenticated with Invalid API URL

**Step 3.2.1**: Set invalid API URL
```javascript
process.env.DISPATCHER_URL = 'http://invalid-url-that-does-not-exist.com';
```

**Step 3.2.2**: Create new service instance (to pick up new env var)
```javascript
const serviceInvalid = new MarinDispatcherService();
```

**Step 3.2.3**: Call isAuthenticated
```javascript
serviceInvalid.isAuthenticated().then(result => {
  console.log('isAuthenticated with invalid URL:', result);
}).catch(error => {
  console.error('Unexpected error:', error.message);
});
```

**Expected Result**: Returns `false` (error caught, not thrown)

### Test 3.3: Verify X-Ray Tracing

**Step 3.3.1**: Check if X-Ray SDK is imported (inspect service file)
```
Get-Content dist/services/marinDispatcherService.js | Select-String "aws-xray"
```

**Expected Result**: X-Ray SDK is imported

**Note**: X-Ray tracing requires AWS Lambda environment. In local testing, segments may not be created, but the code should not error.

---

## Test 4: Placeholder Methods

**Objective**: Verify all placeholder methods return expected "not yet implemented" errors.

### Test 4.1: Test createCampaign Method

**Step 4.1.1**: Create service instance
```javascript
   const service = new MarinDispatcherService();
```

**Step 4.1.2**: Create a test CampaignPlan object
```javascript
const campaignPlan = {
  objective: 'Test objective',
  targetAudience: {},
  budget: { total: 1000, currency: 'USD' },
  timeline: { startDate: '2025-01-01', duration: 30 },
  platforms: ['Google Ads'],
  kpis: { primary: 'Conversions' }
};
```

**Step 4.1.3**: Call createCampaign method
```javascript
service.createCampaign(campaignPlan, 'Test Campaign').then(result => {
  console.log('createCampaign result:', result);
  console.log('Success:', result.success);
  console.log('Error:', result.error);
}).catch(error => {
  console.error('Unexpected error:', error.message);
});
```

**Expected Result**:
```javascript
{
  success: false,
  error: 'createCampaign not yet implemented'
}
```

### Test 4.2: Test updateCampaign Method

**Step 4.2.1**: Call updateCampaign method
```javascript
service.updateCampaign('test-campaign-id', { budget: { total: 2000, currency: 'USD' } }).then(result => {
  console.log('updateCampaign result:', result);
  console.log('Success:', result.success);
  console.log('Error:', result.error);
}).catch(error => {
  console.error('Unexpected error:', error.message);
});
```

**Expected Result**:
```javascript
{
  success: false,
  error: 'updateCampaign not yet implemented'
}
```

### Test 4.3: Test pauseCampaign Method

**Step 4.3.1**: Call pauseCampaign method
```javascript
service.pauseCampaign('test-campaign-id').then(result => {
  console.log('pauseCampaign result:', result);
  console.log('Success:', result.success);
  console.log('Error:', result.error);
}).catch(error => {
  console.error('Unexpected error:', error.message);
});
```

**Expected Result**:
```javascript
{
  success: false,
  error: 'pauseCampaign not yet implemented'
}
```

### Test 4.4: Test resumeCampaign Method

**Step 4.4.1**: Call resumeCampaign method
```javascript
service.resumeCampaign('test-campaign-id').then(result => {
  console.log('resumeCampaign result:', result);
  console.log('Success:', result.success);
  console.log('Error:', result.error);
}).catch(error => {
  console.error('Unexpected error:', error.message);
});
```

**Expected Result**:
```javascript
{
  success: false,
  error: 'resumeCampaign not yet implemented'
}
```

### Test 4.5: Test deleteCampaign Method

**Step 4.5.1**: Call deleteCampaign method
```javascript
service.deleteCampaign('test-campaign-id').then(result => {
  console.log('deleteCampaign result:', result);
  console.log('Success:', result.success);
  console.log('Error:', result.error);
}).catch(error => {
  console.error('Unexpected error:', error.message);
});
```

**Expected Result**:
```javascript
{
  success: false,
  error: 'deleteCampaign not yet implemented'
}
```

### Test 4.6: Test getCampaignStatus Method

**Step 4.6.1**: Call getCampaignStatus method
```javascript
service.getCampaignStatus('test-campaign-id').then(result => {
  console.log('getCampaignStatus result:', result);
  console.log('Success:', result.success);
  console.log('Error:', result.error);
}).catch(error => {
  console.error('Unexpected error:', error.message);
});
```

**Expected Result**:
```javascript
{
  success: false,
  error: 'getCampaignStatus not yet implemented'
}
   ```

---

## Test 5: Helper Methods (Private Methods - Indirect Testing)

**Objective**: Verify private helper methods work correctly through public methods.

### Test 5.1: Verify buildApiPath Method

**Note**: `buildApiPath` is a private method, so we test it indirectly through `isAuthenticated()`.

**Step 5.1.1**: Create service with publisher "google"
```javascript
const serviceGoogle = new MarinDispatcherService(undefined, 'google');
```

**Step 5.1.2**: Call isAuthenticated (this uses buildApiPath internally)
```javascript
serviceGoogle.isAuthenticated().then(result => {
  console.log('isAuthenticated with google publisher:', result);
}).catch(error => {
  // Check error message for API path
  console.log('Error message:', error.message);
  console.log('Error config URL:', error.config?.url);
});
```

**Expected Result**: 
- If error occurs, check `error.config.url` contains `/dispatcher/google/campaigns`
- API path should follow format: `{baseUrl}/dispatcher/{publisher}/campaigns`

**Step 5.1.3**: Create service with publisher "meta"
```javascript
const serviceMeta = new MarinDispatcherService(undefined, 'meta');
```

**Step 5.1.4**: Call isAuthenticated
```javascript
serviceMeta.isAuthenticated().then(result => {
  console.log('isAuthenticated with meta publisher:', result);
}).catch(error => {
  console.log('Error config URL:', error.config?.url);
});
```

**Expected Result**: 
- If error occurs, check `error.config.url` contains `/dispatcher/meta/campaigns`

### Test 5.2: Verify mapCampaignPlanToRequest Method

**Note**: `mapCampaignPlanToRequest` is a private method used by `createCampaign()`. Since `createCampaign()` is a placeholder, we cannot fully test this yet. However, we can verify the method exists by checking the compiled code.

**Step 5.2.1**: Verify method exists in compiled code
```
Get-Content dist/services/marinDispatcherService.js | Select-String "mapCampaignPlanToRequest"
```

**Expected Result**: Method exists in compiled code

### Test 5.3: Verify mapResponseToPlatformResponse Method

**Note**: `mapResponseToPlatformResponse` is a private method used by public methods. Since all public methods are placeholders, we cannot fully test this yet.

**Step 5.3.1**: Verify method exists in compiled code
```
Get-Content dist/services/marinDispatcherService.js | Select-String "mapResponseToPlatformResponse"
```

**Expected Result**: Method exists in compiled code

---

## Test 6: HTTP Client Configuration

**Objective**: Verify the axios HTTP client is configured correctly.

### Test 6.1: Verify HTTP Client Properties

**Step 6.1.1**: Create service instance
```javascript
const service = new MarinDispatcherService();
```

**Step 6.1.2**: Inspect HTTP client (if accessible)
```javascript
// Note: httpClient is private, so we test indirectly through isAuthenticated
// Check that requests use correct baseURL and timeout
```

**Step 6.1.3**: Call isAuthenticated and inspect error (if API unavailable)
```javascript
service.isAuthenticated().then(result => {
  console.log('Result:', result);
}).catch(error => {
  if (error.config) {
    console.log('Base URL:', error.config.baseURL);
    console.log('Timeout:', error.config.timeout);
    console.log('Headers:', error.config.headers);
  }
});
```

**Expected Results**:
- `baseURL`: Should match `MARIN_DISPATCHER_BASE_URL` or `DISPATCHER_URL`
- `timeout`: Should match `MARIN_DISPATCHER_TIMEOUT` (default: 10000)
- `headers`: Should include `Content-Type: application/json` and `Accept: application/json`

---

## Test 7: TypeScript Type Safety

**Objective**: Verify TypeScript compilation and type safety.

### Test 7.1: Verify TypeScript Compilation

**Step 7.1.1**: Run TypeScript compiler
```
npm run build
```

**Expected Result**: Compilation succeeds with no errors

**Step 7.1.2**: Check for any type errors
```
# Look for "error TS" in output
```

**Expected Result**: No TypeScript errors

### Test 7.2: Verify Exported Types

**Step 7.2.1**: Check that service exports correctly
```javascript
const { MarinDispatcherService } = require('./dist/services/marinDispatcherService.js');
console.log('MarinDispatcherService type:', typeof MarinDispatcherService);
```

**Expected Result**: `"function"`

---

## Test 8: Integration with BasePlatformAPI

**Objective**: Verify the service correctly extends BasePlatformAPI.

### Test 8.1: Verify Inheritance

**Step 8.1.1**: Import BasePlatformAPI
```javascript
const { BasePlatformAPI } = require('./dist/services/platformApiService.js');
```

**Step 8.1.2**: Create service instance
```javascript
const service = new MarinDispatcherService();
```

**Step 8.1.3**: Verify service is instance of BasePlatformAPI
```javascript
console.log('Is instance of BasePlatformAPI:', service instanceof BasePlatformAPI);
```

**Expected Result**: `true`

### Test 8.2: Verify IPlatformAPI Interface Implementation

**Step 8.2.1**: Verify all required methods exist
```javascript
const service = new MarinDispatcherService();
console.log('createCampaign:', typeof service.createCampaign);
console.log('updateCampaign:', typeof service.updateCampaign);
console.log('pauseCampaign:', typeof service.pauseCampaign);
console.log('resumeCampaign:', typeof service.resumeCampaign);
console.log('deleteCampaign:', typeof service.deleteCampaign);
console.log('getCampaignStatus:', typeof service.getCampaignStatus);
console.log('isAuthenticated:', typeof service.isAuthenticated);
```

**Expected Results**: All methods should be `"function"`

---

## Test Results Summary

After completing all tests, document your results:

### Test Results Checklist

- [ ] **Test 1**: Service Constructor - Default Parameters
  - [ ] Service creates with default parameters
  - [ ] Service throws error when config is missing
  
- [ ] **Test 2**: Service Constructor - Custom Parameters
  - [ ] Service creates with custom accountId
  - [ ] Service creates with custom accountId and publisher
  
- [ ] **Test 3**: isAuthenticated Method
  - [ ] Method returns boolean
  - [ ] Method handles API errors gracefully
  - [ ] Method uses correct API path format
  
- [ ] **Test 4**: Placeholder Methods
  - [ ] createCampaign returns "not yet implemented"
  - [ ] updateCampaign returns "not yet implemented"
  - [ ] pauseCampaign returns "not yet implemented"
  - [ ] resumeCampaign returns "not yet implemented"
  - [ ] deleteCampaign returns "not yet implemented"
  - [ ] getCampaignStatus returns "not yet implemented"
  
- [ ] **Test 5**: Helper Methods
  - [ ] buildApiPath generates correct paths
  - [ ] mapCampaignPlanToRequest exists in code
  - [ ] mapResponseToPlatformResponse exists in code
  
- [ ] **Test 6**: HTTP Client Configuration
  - [ ] HTTP client uses correct baseURL
  - [ ] HTTP client uses correct timeout
  - [ ] HTTP client uses correct headers
  
- [ ] **Test 7**: TypeScript Type Safety
  - [ ] TypeScript compilation succeeds
  - [ ] Service exports correctly
  
- [ ] **Test 8**: Integration with BasePlatformAPI
  - [ ] Service extends BasePlatformAPI
  - [ ] All IPlatformAPI methods are implemented

---

## Troubleshooting

### Issue: "Cannot find module" errors

**Solution**: 
1. Ensure you've run `npm run build` to compile TypeScript
2. Verify you're in the correct directory (backend/)
3. Use relative paths from backend directory: `./dist/services/marinDispatcherService.js`

### Issue: "DISPATCHER_URL or MARIN_DISPATCHER_BASE_URL must be set" error

**Solution**:
1. Set environment variable: `$env:MARIN_DISPATCHER_BASE_URL = "http://your-api-url"`
2. Or create `.env` file with `MARIN_DISPATCHER_BASE_URL=http://your-api-url`

### Issue: isAuthenticated returns false

**Possible Causes**:
1. API endpoint is not accessible
2. API URL is incorrect
3. Network connectivity issues

**Solution**: This is expected if the API is not available. The method should return `false` gracefully without throwing errors.

### Issue: TypeScript compilation errors

**Solution**:
1. Check for syntax errors in `src/services/marinDispatcherService.ts`
2. Verify all imports are correct
3. Run `npm install` to ensure dependencies are installed

---

## Next Steps

After completing Phase 2.1 manual testing:

1. **Document Results**: Record all test results in this document or a separate test results file
2. **Report Issues**: If any tests fail, document the issue and expected vs actual behavior
3. **Proceed to Phase 2.2**: Once all Phase 2.1 tests pass, proceed to Phase 2.2 (Campaign CRUD Methods)

---

## Notes

- **No Scripts**: These instructions are designed for manual execution. Do not create automated test scripts.
- **Node.js REPL**: Use Node.js REPL for interactive testing. Exit with `.exit` command.
- **Environment Variables**: Ensure environment variables are set before testing. You may need to restart Node.js REPL after setting environment variables.
- **API Availability**: Some tests require a valid API endpoint. If the API is not available, tests will fail gracefully (return `false` instead of throwing errors).

---

**End of Manual Testing Instructions**
