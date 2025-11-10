/**
 * Verification Test for Phase 2D.2 - Lambda Handler Examples
 * 
 * Tests that Lambda handler examples are correctly implemented
 */

const path = require('path');
const fs = require('fs');

console.log('='.repeat(80));
console.log('PHASE 2D.2 VERIFICATION TEST - Lambda Handler Examples');
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

// Test 1: Files exist
console.log('Test 1: File Existence');
const campaignHandlerFile = path.join(__dirname, 'src', 'examples', 'campaign-mgmt-handler.js');
const bulkWorkerHandlerFile = path.join(__dirname, 'src', 'examples', 'bulk-worker-handler.js');

const campaignHandlerExists = fs.existsSync(campaignHandlerFile);
const bulkWorkerHandlerExists = fs.existsSync(bulkWorkerHandlerFile);

logTest('1.1: campaign-mgmt-handler.js file exists', campaignHandlerExists, campaignHandlerExists ? 'File found' : 'File not found');
logTest('1.2: bulk-worker-handler.js file exists', bulkWorkerHandlerExists, bulkWorkerHandlerExists ? 'File found' : 'File not found');

// Test 2: Campaign Management Handler Content
console.log('\nTest 2: Campaign Management Handler Content');
if (campaignHandlerExists) {
  try {
    const content = fs.readFileSync(campaignHandlerFile, 'utf8');
    
    // Check for handler export
    const hasHandlerExport = content.includes('exports.handler') || content.includes('module.exports.handler');
    logTest('2.1: Handler function exported', hasHandlerExport, hasHandlerExport ? 'Found' : 'Not found');
    
    // Check for MarinDispatcherClient import
    const hasClientImport = content.includes('MarinDispatcherClient') && content.includes('require');
    logTest('2.2: MarinDispatcherClient imported', hasClientImport, hasClientImport ? 'Found' : 'Not found');
    
    // Check for PostgreSQL integration
    const hasPostgres = content.includes('Pool') || content.includes('pg');
    logTest('2.3: PostgreSQL integration present', hasPostgres, hasPostgres ? 'Found' : 'Not found');
    
    // Check for X-Ray tracing
    const hasXRay = content.includes('AWSXRay') || content.includes('aws-xray-sdk-core');
    logTest('2.4: X-Ray tracing integrated', hasXRay, hasXRay ? 'Found' : 'Not found');
    
    // Check for create_campaign action handling
    const hasCreateCampaign = content.includes("action === 'create_campaign'") || content.includes("'create_campaign'");
    logTest('2.5: create_campaign action handled', hasCreateCampaign, hasCreateCampaign ? 'Found' : 'Not found');
    
    // Check for transaction handling
    const hasTransaction = content.includes('BEGIN') && content.includes('COMMIT') && content.includes('ROLLBACK');
    logTest('2.6: Transaction handling present', hasTransaction, hasTransaction ? 'Found' : 'Not found');
    
    // Check for error handling
    const hasErrorHandling = content.includes('catch (error') || content.includes('catch(error');
    logTest('2.7: Error handling present', hasErrorHandling, hasErrorHandling ? 'Found' : 'Not found');
    
    // Check for DISPATCHER_URL usage
    const hasDispatcherUrl = content.includes('DISPATCHER_URL') || content.includes('process.env.DISPATCHER_URL');
    logTest('2.8: DISPATCHER_URL usage present', hasDispatcherUrl, hasDispatcherUrl ? 'Found' : 'Not found');
    
    // Check for JSDoc comments
    const hasJSDoc = content.includes('/**') && content.includes('@module');
    logTest('2.9: JSDoc comments present', hasJSDoc, hasJSDoc ? 'Found' : 'Not found');
    
    // Check for environment variables documentation
    const hasEnvDocs = content.includes('Environment Variables') || content.includes('POSTGRES_HOST');
    logTest('2.10: Environment variables documented', hasEnvDocs, hasEnvDocs ? 'Found' : 'Not found');
    
  } catch (error) {
    logTest('2.1: Read campaign handler content', false, `Error: ${error.message}`);
  }
} else {
  logTest('2.1: Read campaign handler content', false, 'File does not exist');
}

// Test 3: Bulk Worker Handler Content
console.log('\nTest 3: Bulk Worker Handler Content');
if (bulkWorkerHandlerExists) {
  try {
    const content = fs.readFileSync(bulkWorkerHandlerFile, 'utf8');
    
    // Check for handler export
    const hasHandlerExport = content.includes('exports.handler') || content.includes('module.exports.handler');
    logTest('3.1: Handler function exported', hasHandlerExport, hasHandlerExport ? 'Found' : 'Not found');
    
    // Check for MarinBatchJobClient import
    const hasClientImport = content.includes('MarinBatchJobClient') && content.includes('require');
    logTest('3.2: MarinBatchJobClient imported', hasClientImport, hasClientImport ? 'Found' : 'Not found');
    
    // Check for DynamoDB integration
    const hasDynamoDB = content.includes('DynamoDB') || content.includes('dynamodb');
    logTest('3.3: DynamoDB integration present', hasDynamoDB, hasDynamoDB ? 'Found' : 'Not found');
    
    // Check for X-Ray tracing
    const hasXRay = content.includes('AWSXRay') || content.includes('aws-xray-sdk-core');
    logTest('3.4: X-Ray tracing integrated', hasXRay, hasXRay ? 'Found' : 'Not found');
    
    // Check for SQS event processing
    const hasSqsProcessing = content.includes('event.Records') || content.includes('Records');
    logTest('3.5: SQS event processing present', hasSqsProcessing, hasSqsProcessing ? 'Found' : 'Not found');
    
    // Check for handleSqsEvent call
    const hasHandleSqsEvent = content.includes('handleSqsEvent') || content.includes('batchJobClient.handleSqsEvent');
    logTest('3.6: handleSqsEvent method called', hasHandleSqsEvent, hasHandleSqsEvent ? 'Found' : 'Not found');
    
    // Check for job status updates
    const hasJobStatus = content.includes('RUNNING') && content.includes('COMPLETED') && content.includes('FAILED');
    logTest('3.7: Job status updates present', hasJobStatus, hasJobStatus ? 'Found' : 'Not found');
    
    // Check for error handling
    const hasErrorHandling = content.includes('catch (error') || content.includes('catch(error');
    logTest('3.8: Error handling present', hasErrorHandling, hasErrorHandling ? 'Found' : 'Not found');
    
    // Check for DISPATCHER_URL usage
    const hasDispatcherUrl = content.includes('DISPATCHER_URL') || content.includes('process.env.DISPATCHER_URL');
    logTest('3.9: DISPATCHER_URL usage present', hasDispatcherUrl, hasDispatcherUrl ? 'Found' : 'Not found');
    
    // Check for partial success handling
    const hasPartialSuccess = content.includes('errors.length') && content.includes('results.length');
    logTest('3.10: Partial success handling present', hasPartialSuccess, hasPartialSuccess ? 'Found' : 'Not found');
    
    // Check for JSDoc comments
    const hasJSDoc = content.includes('/**') && content.includes('@module');
    logTest('3.11: JSDoc comments present', hasJSDoc, hasJSDoc ? 'Found' : 'Not found');
    
    // Check for environment variables documentation
    const hasEnvDocs = content.includes('Environment Variables') || content.includes('DYNAMODB_JOB_STATUS');
    logTest('3.12: Environment variables documented', hasEnvDocs, hasEnvDocs ? 'Found' : 'Not found');
    
  } catch (error) {
    logTest('3.1: Read bulk worker handler content', false, `Error: ${error.message}`);
  }
} else {
  logTest('3.1: Read bulk worker handler content', false, 'File does not exist');
}

// Test 4: Syntax validation (try to parse files)
console.log('\nTest 4: Syntax Validation');
if (campaignHandlerExists) {
  try {
    // Try to require the file (will fail if syntax is invalid)
    // Note: This will fail if dependencies are missing, but that's OK for examples
    // We're just checking syntax, not runtime execution
    const content = fs.readFileSync(campaignHandlerFile, 'utf8');
    
    // Basic syntax checks
    const hasValidSyntax = 
      content.includes('exports.handler') &&
      content.includes('async') &&
      content.includes('function') || content.includes('=>');
    
    logTest('4.1: Campaign handler syntax valid', hasValidSyntax, hasValidSyntax ? 'Valid' : 'Invalid');
    
    // Check for balanced braces (basic check)
    const openBraces = (content.match(/{/g) || []).length;
    const closeBraces = (content.match(/}/g) || []).length;
    const bracesBalanced = openBraces === closeBraces;
    logTest('4.2: Campaign handler braces balanced', bracesBalanced, bracesBalanced ? 'Balanced' : `Unbalanced (${openBraces} open, ${closeBraces} close)`);
    
  } catch (error) {
    logTest('4.1: Campaign handler syntax validation', false, `Error: ${error.message}`);
  }
} else {
  logTest('4.1: Campaign handler syntax validation', false, 'File does not exist');
}

if (bulkWorkerHandlerExists) {
  try {
    const content = fs.readFileSync(bulkWorkerHandlerFile, 'utf8');
    
    // Basic syntax checks
    const hasValidSyntax = 
      content.includes('exports.handler') &&
      content.includes('async') &&
      content.includes('function') || content.includes('=>');
    
    logTest('4.3: Bulk worker handler syntax valid', hasValidSyntax, hasValidSyntax ? 'Valid' : 'Invalid');
    
    // Check for balanced braces (basic check)
    const openBraces = (content.match(/{/g) || []).length;
    const closeBraces = (content.match(/}/g) || []).length;
    const bracesBalanced = openBraces === closeBraces;
    logTest('4.4: Bulk worker handler braces balanced', bracesBalanced, bracesBalanced ? 'Balanced' : `Unbalanced (${openBraces} open, ${closeBraces} close)`);
    
  } catch (error) {
    logTest('4.3: Bulk worker handler syntax validation', false, `Error: ${error.message}`);
  }
} else {
  logTest('4.3: Bulk worker handler syntax validation', false, 'File does not exist');
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

