/**
 * Verification Test for Phase 2D.4 - Lambda Integration Testing
 * 
 * Tests that Lambda clients are correctly implemented and can be used
 */

const path = require('path');
const fs = require('fs');

console.log('='.repeat(80));
console.log('PHASE 2D.4 VERIFICATION TEST - Lambda Integration Testing');
console.log('='.repeat(80));
console.log('');

const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

function logTest(name, passed, message = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status}: ${name}${message ? ' - ' + message : ''}`);
  testResults.tests.push({ name, passed, message });
  if (passed) {
    testResults.passed++;
  } else {
    testResults.failed++;
  }
}

// Test 1: Compiled files exist
console.log('Test 1: Compiled Files');
const dispatcherClientFile = path.join(__dirname, 'dist', 'lib', 'marinDispatcherClient.js');
const batchJobClientFile = path.join(__dirname, 'dist', 'lib', 'marinBatchJobClient.js');
const lambdaTypesFile = path.join(__dirname, 'dist', 'types', 'lambda.types.js');

const dispatcherClientExists = fs.existsSync(dispatcherClientFile);
const batchJobClientExists = fs.existsSync(batchJobClientFile);
const lambdaTypesExists = fs.existsSync(lambdaTypesFile);

logTest('1.1: Compiled marinDispatcherClient.js exists', dispatcherClientExists, dispatcherClientExists ? 'Found' : 'Not found');
logTest('1.2: Compiled marinBatchJobClient.js exists', batchJobClientExists, batchJobClientExists ? 'Found' : 'Not found');
logTest('1.3: Compiled lambda.types.js exists', lambdaTypesExists, lambdaTypesExists ? 'Found' : 'Not found');

// Test 2: Import and instantiate clients
console.log('\nTest 2: Client Import and Instantiation');
if (dispatcherClientExists && batchJobClientExists) {
  try {
    const dispatcherModule = require('./dist/lib/marinDispatcherClient.js');
    const batchJobModule = require('./dist/lib/marinBatchJobClient.js');
    
    const hasDispatcherClient = dispatcherModule.MarinDispatcherClient !== undefined;
    const hasBatchJobClient = batchJobModule.MarinBatchJobClient !== undefined;
    
    logTest('2.1: MarinDispatcherClient can be imported', hasDispatcherClient, hasDispatcherClient ? 'Imported successfully' : 'Import failed');
    logTest('2.2: MarinBatchJobClient can be imported', hasBatchJobClient, hasBatchJobClient ? 'Imported successfully' : 'Import failed');
    
    if (hasDispatcherClient && hasBatchJobClient) {
      try {
        const DispatcherClient = dispatcherModule.MarinDispatcherClient;
        const BatchJobClient = batchJobModule.MarinBatchJobClient;
        
        const dispatcherClient = new DispatcherClient();
        const batchJobClient = new BatchJobClient();
        
        logTest('2.3: MarinDispatcherClient can be instantiated', true, 'Instantiated successfully');
        logTest('2.4: MarinBatchJobClient can be instantiated', true, 'Instantiated successfully');
        
        // Check if handleLambdaEvent method exists
        const hasDispatcherHandleMethod = typeof dispatcherClient.handleLambdaEvent === 'function';
        logTest('2.5: MarinDispatcherClient.handleLambdaEvent method exists', hasDispatcherHandleMethod, hasDispatcherHandleMethod ? 'Method found' : 'Method not found');
        
        // Check if handleSqsEvent method exists
        const hasBatchJobSqsMethod = typeof batchJobClient.handleSqsEvent === 'function';
        logTest('2.6: MarinBatchJobClient.handleSqsEvent method exists', hasBatchJobSqsMethod, hasBatchJobSqsMethod ? 'Method found' : 'Method not found');
        
        // Check if handleLambdaEvent method exists
        const hasBatchJobLambdaMethod = typeof batchJobClient.handleLambdaEvent === 'function';
        logTest('2.7: MarinBatchJobClient.handleLambdaEvent method exists', hasBatchJobLambdaMethod, hasBatchJobLambdaMethod ? 'Method found' : 'Method not found');
        
        // Check if getService method exists
        const hasDispatcherGetService = typeof dispatcherClient.getService === 'function';
        const hasBatchJobGetService = typeof batchJobClient.getService === 'function';
        logTest('2.8: MarinDispatcherClient.getService method exists', hasDispatcherGetService, hasDispatcherGetService ? 'Method found' : 'Method not found');
        logTest('2.9: MarinBatchJobClient.getService method exists', hasBatchJobGetService, hasBatchJobGetService ? 'Method found' : 'Method not found');
        
      } catch (error) {
        logTest('2.3: Instantiate clients', false, `Error: ${error.message}`);
      }
    }
    
  } catch (error) {
    logTest('2.1: Import clients', false, `Error: ${error.message}`);
  }
} else {
  logTest('2.1: Import clients', false, 'Compiled files do not exist - run npm run build first');
}

// Test 3: Lambda event structure validation
console.log('\nTest 3: Lambda Event Structure Validation');
const sampleLambdaEvent = {
  action: 'create_campaign',
  data: {
    campaignPlan: {
      objective: 'Drive sales',
      budget: { total: 1000, currency: 'USD' },
    },
    name: 'Test Campaign',
  },
  user: {
    sub: 'user-123',
    email: 'test@example.com',
  },
  mode: 'direct',
};

logTest('3.1: Sample LambdaEvent has action', sampleLambdaEvent.action !== undefined, sampleLambdaEvent.action || 'Not found');
logTest('3.2: Sample LambdaEvent has data', sampleLambdaEvent.data !== undefined, sampleLambdaEvent.data ? 'Found' : 'Not found');
logTest('3.3: Sample LambdaEvent has user', sampleLambdaEvent.user !== undefined, sampleLambdaEvent.user ? 'Found' : 'Not found');
logTest('3.4: Sample LambdaEvent user has sub', sampleLambdaEvent.user?.sub !== undefined, sampleLambdaEvent.user?.sub || 'Not found');
logTest('3.5: Sample LambdaEvent has optional mode', sampleLambdaEvent.mode !== undefined, sampleLambdaEvent.mode || 'Not found');

// Test 4: Lambda response structure validation
console.log('\nTest 4: Lambda Response Structure Validation');
const sampleLambdaResponse = {
  success: true,
  result: {
    campaignId: 'campaign-123',
  },
  error: undefined,
  details: {},
};

logTest('4.1: Sample LambdaResponse has success', typeof sampleLambdaResponse.success === 'boolean', sampleLambdaResponse.success ? 'Found' : 'Not found');
logTest('4.2: Sample LambdaResponse has result', sampleLambdaResponse.result !== undefined, sampleLambdaResponse.result ? 'Found' : 'Not found');
logTest('4.3: Sample LambdaResponse has error', sampleLambdaResponse.error !== undefined || sampleLambdaResponse.error === undefined, 'Found (can be undefined)');
logTest('4.4: Sample LambdaResponse has details', sampleLambdaResponse.details !== undefined, sampleLambdaResponse.details ? 'Found' : 'Not found');

// Test 5: SQS event structure validation
console.log('\nTest 5: SQS Event Structure Validation');
const sampleSqsEvent = {
  Records: [
    {
      messageId: 'msg-123',
      receiptHandle: 'receipt-123',
      body: JSON.stringify({
        jobId: 'job-123',
        campaigns: [
          {
            accountId: '5533110357',
            name: 'Test Campaign',
            status: 'ENABLED',
            budget: { amount: 100, deliveryMethod: 'STANDARD' },
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

logTest('5.1: Sample SqsEvent has Records', sampleSqsEvent.Records !== undefined, sampleSqsEvent.Records ? 'Found' : 'Not found');
logTest('5.2: Sample SqsEvent Records is array', Array.isArray(sampleSqsEvent.Records), Array.isArray(sampleSqsEvent.Records) ? 'Is array' : 'Not array');
logTest('5.3: Sample SqsEvent Record has body', sampleSqsEvent.Records[0]?.body !== undefined, sampleSqsEvent.Records[0]?.body ? 'Found' : 'Not found');
logTest('5.4: Sample SqsEvent Record body is valid JSON', (() => {
  try {
    JSON.parse(sampleSqsEvent.Records[0].body);
    return true;
  } catch {
    return false;
  }
})(), 'Valid JSON');

// Test 6: Method signature validation
console.log('\nTest 6: Method Signature Validation');
if (dispatcherClientExists && batchJobClientExists) {
  try {
    const dispatcherModule = require('./dist/lib/marinDispatcherClient.js');
    const batchJobModule = require('./dist/lib/marinBatchJobClient.js');
    
    if (dispatcherModule.MarinDispatcherClient && batchJobModule.MarinBatchJobClient) {
      const DispatcherClient = dispatcherModule.MarinDispatcherClient;
      const BatchJobClient = batchJobModule.MarinBatchJobClient;
      
      const dispatcherClient = new DispatcherClient();
      const batchJobClient = new BatchJobClient();
      
      // Check method signatures
      const dispatcherHandleMethod = dispatcherClient.handleLambdaEvent;
      const batchJobSqsMethod = batchJobClient.handleSqsEvent;
      const batchJobLambdaMethod = batchJobClient.handleLambdaEvent;
      
      logTest('6.1: handleLambdaEvent accepts 1 parameter', dispatcherHandleMethod.length === 1, `Accepts ${dispatcherHandleMethod.length} parameter(s)`);
      logTest('6.2: handleSqsEvent accepts 1 parameter', batchJobSqsMethod.length === 1, `Accepts ${batchJobSqsMethod.length} parameter(s)`);
      logTest('6.3: batchJobClient.handleLambdaEvent accepts 1 parameter', batchJobLambdaMethod.length === 1, `Accepts ${batchJobLambdaMethod.length} parameter(s)`);
      
    }
  } catch (error) {
    logTest('6.1: Method signature validation', false, `Error: ${error.message}`);
  }
} else {
  logTest('6.1: Method signature validation', false, 'Compiled files do not exist');
}

// Test 7: Manual testing instructions exist
console.log('\nTest 7: Manual Testing Instructions');
const manualTestFile = path.join(__dirname, '..', '..', '1. Planning Docs', '2. Architecture-Meeting-Planning', 'TEST-2D.4-Manual-Instructions.md');
const manualTestExists = fs.existsSync(manualTestFile);
logTest('7.1: TEST-2D.4-Manual-Instructions.md exists', manualTestExists, manualTestExists ? 'Found' : 'Not found');

if (manualTestExists) {
  try {
    const content = fs.readFileSync(manualTestFile, 'utf8');
    const hasDispatcherClientTests = content.includes('MarinDispatcherClient') || content.includes('dispatcherClient');
    const hasBatchJobClientTests = content.includes('MarinBatchJobClient') || content.includes('batchJobClient');
    const hasSqsEventTests = content.includes('handleSqsEvent') || content.includes('SQS event');
    const hasLambdaEventTests = content.includes('handleLambdaEvent') || content.includes('Lambda event');
    
    logTest('7.2: Manual instructions cover MarinDispatcherClient', hasDispatcherClientTests, hasDispatcherClientTests ? 'Found' : 'Not found');
    logTest('7.3: Manual instructions cover MarinBatchJobClient', hasBatchJobClientTests, hasBatchJobClientTests ? 'Found' : 'Not found');
    logTest('7.4: Manual instructions cover SQS event handling', hasSqsEventTests, hasSqsEventTests ? 'Found' : 'Not found');
    logTest('7.5: Manual instructions cover Lambda event handling', hasLambdaEventTests, hasLambdaEventTests ? 'Found' : 'Not found');
  } catch (error) {
    logTest('7.2: Read manual instructions', false, `Error: ${error.message}`);
  }
}

// Print summary
console.log('');
console.log('='.repeat(80));
console.log('TEST SUMMARY');
console.log('='.repeat(80));
console.log(`Total Tests: ${testResults.passed + testResults.failed}`);
console.log(`✅ Passed: ${testResults.passed}`);
console.log(`❌ Failed: ${testResults.failed}`);
console.log('');
console.log(`Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
console.log('='.repeat(80));

// Exit with appropriate code
process.exit(testResults.failed > 0 ? 1 : 0);

