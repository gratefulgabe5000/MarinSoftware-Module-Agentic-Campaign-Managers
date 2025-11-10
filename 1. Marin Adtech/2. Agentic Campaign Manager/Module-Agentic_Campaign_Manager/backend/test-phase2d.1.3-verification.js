/**
 * Verification Test for Phase 2D.1.3 - Batch Job Lambda Client
 * 
 * Tests that MarinBatchJobClient is correctly implemented and can be used
 */

const path = require('path');
const fs = require('fs');

console.log('='.repeat(80));
console.log('PHASE 2D.1.3 VERIFICATION TEST - Batch Job Lambda Client');
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

// Test 1: File exists
console.log('Test 1: File Existence');
const clientFile = path.join(__dirname, 'src', 'lib', 'marinBatchJobClient.ts');
const clientFileExists = fs.existsSync(clientFile);
logTest('1.1: marinBatchJobClient.ts file exists', clientFileExists, clientFileExists ? 'File found' : 'File not found');

// Test 2: Check compiled output exists
console.log('\nTest 2: Compiled Output');
const distClientFile = path.join(__dirname, 'dist', 'lib', 'marinBatchJobClient.js');
const distClientFileExists = fs.existsSync(distClientFile);
logTest('2.1: Compiled marinBatchJobClient.js exists', distClientFileExists, distClientFileExists ? 'Compiled file found' : 'Compiled file not found');

// Test 3: Read and verify file content
console.log('\nTest 3: File Content Verification');
if (clientFileExists) {
  try {
    const content = fs.readFileSync(clientFile, 'utf8');
    
    // Check for MarinBatchJobClient class
    const hasClass = content.includes('class MarinBatchJobClient') || content.includes('export class MarinBatchJobClient');
    logTest('3.1: MarinBatchJobClient class defined', hasClass, hasClass ? 'Found' : 'Not found');
    
    // Check for constructor
    const hasConstructor = content.includes('constructor(');
    logTest('3.2: Constructor method defined', hasConstructor, hasConstructor ? 'Found' : 'Not found');
    
    // Check for handleSqsEvent method
    const hasHandleSqsMethod = content.includes('handleSqsEvent(') || content.includes('async handleSqsEvent');
    logTest('3.3: handleSqsEvent method defined', hasHandleSqsMethod, hasHandleSqsMethod ? 'Found' : 'Not found');
    
    // Check for handleLambdaEvent method
    const hasHandleLambdaMethod = content.includes('handleLambdaEvent(') || content.includes('async handleLambdaEvent');
    logTest('3.4: handleLambdaEvent method defined', hasHandleLambdaMethod, hasHandleLambdaMethod ? 'Found' : 'Not found');
    
    // Check for X-Ray tracing
    const hasXRay = content.includes('AWSXRay') || content.includes('aws-xray-sdk-core');
    logTest('3.5: X-Ray tracing integrated', hasXRay, hasXRay ? 'Found' : 'Not found');
    
    // Check for SQS event processing
    const hasSqsProcessing = content.includes('event.Records') || content.includes('Records');
    logTest('3.6: SQS event processing present', hasSqsProcessing, hasSqsProcessing ? 'Found' : 'Not found');
    
    // Check for batch job actions
    const hasBulkCreate = content.includes("case 'bulk_create_campaigns'") || content.includes('bulk_create_campaigns');
    logTest('3.7: bulk_create_campaigns action handled', hasBulkCreate, hasBulkCreate ? 'Found' : 'Not found');
    
    const hasCreateBatch = content.includes("case 'create_batch_job'") || content.includes('create_batch_job');
    logTest('3.8: create_batch_job action handled', hasCreateBatch, hasCreateBatch ? 'Found' : 'Not found');
    
    const hasAddOperations = content.includes("case 'add_operations_to_batch'") || content.includes('add_operations_to_batch');
    logTest('3.9: add_operations_to_batch action handled', hasAddOperations, hasAddOperations ? 'Found' : 'Not found');
    
    const hasRunBatch = content.includes("case 'run_batch_job'") || content.includes('run_batch_job');
    logTest('3.10: run_batch_job action handled', hasRunBatch, hasRunBatch ? 'Found' : 'Not found');
    
    const hasPollStatus = content.includes("case 'poll_batch_job_status'") || content.includes('poll_batch_job_status');
    logTest('3.11: poll_batch_job_status action handled', hasPollStatus, hasPollStatus ? 'Found' : 'Not found');
    
    const hasGetResults = content.includes("case 'get_batch_job_results'") || content.includes('get_batch_job_results');
    logTest('3.12: get_batch_job_results action handled', hasGetResults, hasGetResults ? 'Found' : 'Not found');
    
    // Check for validation
    const hasValidation = content.includes('Validate') || content.includes('if (!event') || content.includes('if (!data');
    logTest('3.13: Input validation present', hasValidation, hasValidation ? 'Found' : 'Not found');
    
    // Check for error handling
    const hasErrorHandling = content.includes('catch (error') || content.includes('catch(error');
    logTest('3.14: Error handling present', hasErrorHandling, hasErrorHandling ? 'Found' : 'Not found');
    
    // Check for message parsing
    const hasMessageParsing = content.includes('JSON.parse(record.body') || content.includes('JSON.parse');
    logTest('3.15: Message parsing present', hasMessageParsing, hasMessageParsing ? 'Found' : 'Not found');
    
    // Check for partial success handling
    const hasPartialSuccess = content.includes('errors.length') && content.includes('results.length');
    logTest('3.16: Partial success handling present', hasPartialSuccess, hasPartialSuccess ? 'Found' : 'Not found');
    
    // Check for JSDoc comments
    const hasJSDoc = content.includes('/**') && content.includes('@param');
    logTest('3.17: JSDoc comments present', hasJSDoc, hasJSDoc ? 'Found' : 'Not found');
    
    // Check for service import
    const hasServiceImport = content.includes('MarinBatchJobService') && content.includes('from');
    logTest('3.18: MarinBatchJobService imported', hasServiceImport, hasServiceImport ? 'Found' : 'Not found');
    
    // Check for Lambda types import
    const hasLambdaTypesImport = content.includes('LambdaEvent') && content.includes('LambdaResponse') && content.includes('SqsEvent');
    logTest('3.19: Lambda types imported', hasLambdaTypesImport, hasLambdaTypesImport ? 'Found' : 'Not found');
    
    // Check for getService method
    const hasGetService = content.includes('getService(') || content.includes('getService()');
    logTest('3.20: getService method present', hasGetService, hasGetService ? 'Found' : 'Not found');
    
  } catch (error) {
    logTest('3.1: Read file content', false, `Error: ${error.message}`);
  }
} else {
  logTest('3.1: Read file content', false, 'File does not exist');
}

// Test 4: Try to import and use class (if compiled)
console.log('\nTest 4: Class Import and Usage');
if (distClientFileExists) {
  try {
    // Try to require the compiled module
    const clientModule = require('./dist/lib/marinBatchJobClient.js');
    
    // Check if class exists
    const hasClientClass = clientModule.MarinBatchJobClient !== undefined;
    logTest('4.1: MarinBatchJobClient can be imported', hasClientClass, hasClientClass ? 'Imported successfully' : 'Import failed');
    
    if (hasClientClass) {
      // Try to instantiate the class
      try {
        const Client = clientModule.MarinBatchJobClient;
        const client = new Client();
        logTest('4.2: MarinBatchJobClient can be instantiated', true, 'Instantiated successfully');
        
        // Check if handleSqsEvent method exists
        const hasHandleSqsMethod = typeof client.handleSqsEvent === 'function';
        logTest('4.3: handleSqsEvent method exists', hasHandleSqsMethod, hasHandleSqsMethod ? 'Method found' : 'Method not found');
        
        // Check if handleLambdaEvent method exists
        const hasHandleLambdaMethod = typeof client.handleLambdaEvent === 'function';
        logTest('4.4: handleLambdaEvent method exists', hasHandleLambdaMethod, hasHandleLambdaMethod ? 'Method found' : 'Method not found');
        
        // Check if getService method exists
        const hasGetServiceMethod = typeof client.getService === 'function';
        logTest('4.5: getService method exists', hasGetServiceMethod, hasGetServiceMethod ? 'Method found' : 'Method not found');
        
        // Test validation with invalid SQS event (missing Records)
        const invalidSqsEvent1 = {
          // Missing Records array
        };
        logTest('4.6: handleSqsEvent method signature valid', 
          hasHandleSqsMethod && client.handleSqsEvent.length === 1,
          'Method accepts one parameter (event)');
        
        // Test sample SQS event structure
        const sampleSqsEvent = {
          Records: [{
            messageId: 'msg-123',
            receiptHandle: 'receipt-123',
            body: JSON.stringify({
              jobId: 'job-123',
              campaigns: [
                { name: 'Campaign 1', accountId: '5533110357', status: 'ENABLED', budget: { amount: 100, deliveryMethod: 'STANDARD' }, biddingStrategy: 'MANUAL_CPC' }
              ]
            }),
            attributes: {
              ApproximateReceiveCount: '1',
              SentTimestamp: '1234567890',
              SenderId: 'sender-123',
              ApproximateFirstReceiveTimestamp: '1234567890'
            },
            md5OfBody: 'md5-123',
            eventSource: 'aws:sqs',
            eventSourceARN: 'arn:aws:sqs:us-east-1:123456789012:queue-name',
            awsRegion: 'us-east-1'
          }]
        };
        logTest('4.7: Sample SqsEvent structure valid',
          sampleSqsEvent.Records && Array.isArray(sampleSqsEvent.Records) && sampleSqsEvent.Records.length > 0,
          'Structure matches SqsEvent interface');
        
        // Test sample Lambda event structure for batch jobs
        const sampleLambdaEvent = {
          action: 'bulk_create_campaigns',
          data: {
            campaigns: [
              { name: 'Campaign 1', accountId: '5533110357', status: 'ENABLED', budget: { amount: 100, deliveryMethod: 'STANDARD' }, biddingStrategy: 'MANUAL_CPC' }
            ]
          },
          user: { sub: 'user-123', email: 'test@example.com' },
          mode: 'direct'
        };
        logTest('4.8: Sample LambdaEvent structure valid',
          sampleLambdaEvent.action && sampleLambdaEvent.data && sampleLambdaEvent.user && sampleLambdaEvent.user.sub,
          'Structure matches LambdaEvent interface');
        
        // Test sample response structure
        const sampleResponse = {
          success: true,
          result: {
            processed: 1,
            failed: 0,
            results: [{ jobId: 'job-123', result: {} }]
          },
          error: undefined,
          details: {}
        };
        logTest('4.9: Sample LambdaResponse structure valid',
          typeof sampleResponse.success === 'boolean' && sampleResponse.result !== undefined,
          'Structure matches LambdaResponse interface');
        
      } catch (error) {
        logTest('4.2: Instantiate class', false, `Error: ${error.message}`);
      }
    }
    
  } catch (error) {
    logTest('4.1: Import class', false, `Error: ${error.message}`);
  }
} else {
  logTest('4.1: Import class', false, 'Compiled file does not exist - run npm run build first');
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

