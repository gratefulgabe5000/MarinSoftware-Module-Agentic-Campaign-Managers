# Manual Testing Instructions - Task 3.1.1: Service Registration

**Task**: Register MarinDispatcherService in CampaignCreationService  
**Date**: 2025-11-10  
**Status**: Ready for Testing

---

## Test Objectives

Verify that:
1. MarinDispatcherService can be imported successfully
2. Marin service is registered in CampaignCreationService
3. Service can be retrieved by platform name
4. Platform key mapping works correctly for 'marin'
5. TypeScript compilation succeeds

---

## Pre-Test Setup

1. Navigate to backend directory:
   ```powershell
   cd "C:\Users\grate\Documents\Cursor\GratefulGabe5000\4b. MarinSoftware-Module-Agentic-Campaign-Manager-CSV-Update\1. Marin Adtech\2. Agentic Campaign Manager\Module-Agentic_Campaign_Manager\backend"
   ```

2. Verify TypeScript compilation:
   ```powershell
   npm run build
   ```
   **Expected**: Compilation succeeds with no errors

---

## Test 1: Verify Import and Registration

### Test Steps

1. Create test file: `test-3.1.1-service-registration.js`
2. Run the test script

### Test Script

```javascript
// test-3.1.1-service-registration.js
const path = require('path');

// Test 1: Verify TypeScript compilation
console.log('Test 1: TypeScript Compilation');
console.log('================================');
try {
  const { execSync } = require('child_process');
  const result = execSync('npm run build', { 
    cwd: __dirname,
    encoding: 'utf8',
    stdio: 'pipe'
  });
  console.log('✅ TypeScript compilation successful');
  console.log('');
} catch (error) {
  console.error('❌ TypeScript compilation failed:');
  console.error(error.stdout || error.message);
  process.exit(1);
}

// Test 2: Verify module can be loaded
console.log('Test 2: Module Loading');
console.log('======================');
try {
  // Note: This test requires compiled JavaScript
  // For now, we'll verify the source files exist
  const fs = require('fs');
  const controllerPath = path.join(__dirname, 'src', 'controllers', 'campaignCreationController.ts');
  const servicePath = path.join(__dirname, 'src', 'services', 'campaignCreationService.ts');
  const marinServicePath = path.join(__dirname, 'src', 'services', 'marinDispatcherService.ts');
  
  if (fs.existsSync(controllerPath)) {
    console.log('✅ campaignCreationController.ts exists');
  } else {
    console.error('❌ campaignCreationController.ts not found');
    process.exit(1);
  }
  
  if (fs.existsSync(servicePath)) {
    console.log('✅ campaignCreationService.ts exists');
  } else {
    console.error('❌ campaignCreationService.ts not found');
    process.exit(1);
  }
  
  if (fs.existsSync(marinServicePath)) {
    console.log('✅ marinDispatcherService.ts exists');
  } else {
    console.error('❌ marinDispatcherService.ts not found');
    process.exit(1);
  }
  console.log('');
} catch (error) {
  console.error('❌ Module loading test failed:', error.message);
  process.exit(1);
}

// Test 3: Verify import statement exists
console.log('Test 3: Import Statement Verification');
console.log('=====================================');
try {
  const fs = require('fs');
  const controllerPath = path.join(__dirname, 'src', 'controllers', 'campaignCreationController.ts');
  const controllerContent = fs.readFileSync(controllerPath, 'utf8');
  
  if (controllerContent.includes("import { MarinDispatcherService }")) {
    console.log('✅ MarinDispatcherService import found');
  } else {
    console.error('❌ MarinDispatcherService import not found');
    process.exit(1);
  }
  
  if (controllerContent.includes("from '../services/marinDispatcherService'")) {
    console.log('✅ Import path is correct');
  } else {
    console.error('❌ Import path is incorrect');
    process.exit(1);
  }
  console.log('');
} catch (error) {
  console.error('❌ Import verification failed:', error.message);
  process.exit(1);
}

// Test 4: Verify service registration
console.log('Test 4: Service Registration Verification');
console.log('==========================================');
try {
  const fs = require('fs');
  const controllerPath = path.join(__dirname, 'src', 'controllers', 'campaignCreationController.ts');
  const controllerContent = fs.readFileSync(controllerPath, 'utf8');
  
  if (controllerContent.includes("registerPlatform('Marin'")) {
    console.log('✅ Marin service registration found');
  } else {
    console.error('❌ Marin service registration not found');
    process.exit(1);
  }
  
  if (controllerContent.includes("new MarinDispatcherService()")) {
    console.log('✅ MarinDispatcherService instantiation found');
  } else {
    console.error('❌ MarinDispatcherService instantiation not found');
    process.exit(1);
  }
  console.log('');
} catch (error) {
  console.error('❌ Service registration verification failed:', error.message);
  process.exit(1);
}

// Test 5: Verify platform key mapping
console.log('Test 5: Platform Key Mapping Verification');
console.log('==========================================');
try {
  const fs = require('fs');
  const servicePath = path.join(__dirname, 'src', 'services', 'campaignCreationService.ts');
  const serviceContent = fs.readFileSync(servicePath, 'utf8');
  
  if (serviceContent.includes("if (platformLower.includes('marin')) return 'marin'")) {
    console.log('✅ Marin platform key mapping found');
  } else {
    console.error('❌ Marin platform key mapping not found');
    process.exit(1);
  }
  console.log('');
} catch (error) {
  console.error('❌ Platform key mapping verification failed:', error.message);
  process.exit(1);
}

console.log('========================================');
console.log('All Tests Passed! ✅');
console.log('========================================');
console.log('');
console.log('Summary:');
console.log('- TypeScript compilation: ✅');
console.log('- Module files exist: ✅');
console.log('- Import statement: ✅');
console.log('- Service registration: ✅');
console.log('- Platform key mapping: ✅');
console.log('');
console.log('Task 3.1.1: Service Registration - COMPLETE');
```

### Expected Results

All tests should pass:
- ✅ TypeScript compilation successful
- ✅ Module files exist
- ✅ Import statement found
- ✅ Service registration found
- ✅ Platform key mapping found

---

## Test 2: Runtime Verification (Optional)

If you want to test at runtime, you can create a simple Node.js script:

```javascript
// test-3.1.1-runtime.js
// Note: This requires the compiled JavaScript
const { campaignCreationService } = require('./dist/services/campaignCreationService');
const { MarinDispatcherService } = require('./dist/services/marinDispatcherService');

console.log('Testing Service Registration...');
console.log('');

// Test: Register Marin service
const marinService = new MarinDispatcherService();
campaignCreationService.registerPlatform('Marin', marinService);

// Test: Retrieve service
const retrievedService = campaignCreationService.getPlatformService('marin');
if (retrievedService) {
  console.log('✅ Marin service retrieved successfully');
  console.log('✅ Service type:', retrievedService.constructor.name);
} else {
  console.error('❌ Marin service not found');
  process.exit(1);
}

console.log('');
console.log('Runtime test passed! ✅');
```

---

## Test Results

After running the tests, document results here:

### Test 1: Verification Tests
- [ ] TypeScript compilation: PASS / FAIL
- [ ] Module files exist: PASS / FAIL
- [ ] Import statement: PASS / FAIL
- [ ] Service registration: PASS / FAIL
- [ ] Platform key mapping: PASS / FAIL

### Test 2: Runtime Verification (if applicable)
- [ ] Service registration: PASS / FAIL
- [ ] Service retrieval: PASS / FAIL

---

## Notes

- This task is **optional** - service is primarily used by Lambda functions
- The registration allows the orchestrator to use Marin service if needed
- Primary usage is via Lambda functions (CampaignMgmtFunction, BulkWorkerFunction) via MarinDispatcherClient
- Service registration follows the same pattern as other platform services

---

## Next Steps

After successful testing:
1. Document test results
2. Proceed to Task 3.1.2: Verify Lambda Integration

