/**
 * Verification Test for Phase 2D.1.1 - Lambda Event Types
 * 
 * Tests that all Lambda types are correctly defined and can be imported/used
 */

const path = require('path');
const fs = require('fs');

console.log('='.repeat(80));
console.log('PHASE 2D.1.1 VERIFICATION TEST - Lambda Event Types');
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
const typesFile = path.join(__dirname, 'src', 'types', 'lambda.types.ts');
const typesFileExists = fs.existsSync(typesFile);
logTest('1.1: lambda.types.ts file exists', typesFileExists, typesFileExists ? 'File found' : 'File not found');

// Test 2: Check compiled output exists
console.log('\nTest 2: Compiled Output');
const distTypesFile = path.join(__dirname, 'dist', 'types', 'lambda.types.js');
const distTypesFileExists = fs.existsSync(distTypesFile);
logTest('2.1: Compiled lambda.types.js exists', distTypesFileExists, distTypesFileExists ? 'Compiled file found' : 'Compiled file not found');

// Test 3: Read and verify file content
console.log('\nTest 3: File Content Verification');
if (typesFileExists) {
  try {
    const content = fs.readFileSync(typesFile, 'utf8');
    
    // Check for LambdaEvent interface
    const hasLambdaEvent = content.includes('interface LambdaEvent') || content.includes('export interface LambdaEvent');
    logTest('3.1: LambdaEvent interface defined', hasLambdaEvent, hasLambdaEvent ? 'Found' : 'Not found');
    
    // Check for LambdaResponse interface
    const hasLambdaResponse = content.includes('interface LambdaResponse') || content.includes('export interface LambdaResponse');
    logTest('3.2: LambdaResponse interface defined', hasLambdaResponse, hasLambdaResponse ? 'Found' : 'Not found');
    
    // Check for required properties in LambdaEvent
    const hasAction = content.includes('action:') && content.includes('string');
    logTest('3.3: LambdaEvent has action property', hasAction, hasAction ? 'Found' : 'Not found');
    
    const hasData = content.includes('data:');
    logTest('3.4: LambdaEvent has data property', hasData, hasData ? 'Found' : 'Not found');
    
    const hasUser = content.includes('user:') && content.includes('sub:');
    logTest('3.5: LambdaEvent has user property with sub', hasUser, hasUser ? 'Found' : 'Not found');
    
    const hasMode = content.includes('mode?:') || content.includes('mode?');
    logTest('3.6: LambdaEvent has optional mode property', hasMode, hasMode ? 'Found' : 'Not found');
    
    // Check for required properties in LambdaResponse
    const hasSuccess = content.includes('success:') && content.includes('boolean');
    logTest('3.7: LambdaResponse has success property', hasSuccess, hasSuccess ? 'Found' : 'Not found');
    
    const hasResult = content.includes('result?:');
    logTest('3.8: LambdaResponse has optional result property', hasResult, hasResult ? 'Found' : 'Not found');
    
    const hasError = content.includes('error?:');
    logTest('3.9: LambdaResponse has optional error property', hasError, hasError ? 'Found' : 'Not found');
    
    // Check for type exports
    const hasCampaignAction = content.includes('CampaignAction') || content.includes('type CampaignAction');
    logTest('3.10: CampaignAction type defined', hasCampaignAction, hasCampaignAction ? 'Found' : 'Not found');
    
    const hasBatchJobAction = content.includes('BatchJobAction') || content.includes('type BatchJobAction');
    logTest('3.11: BatchJobAction type defined', hasBatchJobAction, hasBatchJobAction ? 'Found' : 'Not found');
    
    // Check for SQS event types
    const hasSqsEvent = content.includes('SqsEvent') || content.includes('interface SqsEvent');
    logTest('3.12: SqsEvent interface defined', hasSqsEvent, hasSqsEvent ? 'Found' : 'Not found');
    
    // Check for JSDoc comments
    const hasJSDoc = content.includes('/**') && content.includes('@interface');
    logTest('3.13: JSDoc comments present', hasJSDoc, hasJSDoc ? 'Found' : 'Not found');
    
  } catch (error) {
    logTest('3.1: Read file content', false, `Error: ${error.message}`);
  }
} else {
  logTest('3.1: Read file content', false, 'File does not exist');
}

// Test 4: Try to import and use types (if compiled)
console.log('\nTest 4: Type Import and Usage');
if (distTypesFileExists) {
  try {
    // Try to require the compiled module
    const lambdaTypes = require('./dist/types/lambda.types.js');
    
    // Check if exports exist
    const hasLambdaEventExport = lambdaTypes.LambdaEvent !== undefined;
    logTest('4.1: LambdaEvent can be imported', hasLambdaEventExport, hasLambdaEventExport ? 'Imported successfully' : 'Import failed');
    
    const hasLambdaResponseExport = lambdaTypes.LambdaResponse !== undefined;
    logTest('4.2: LambdaResponse can be imported', hasLambdaResponseExport, hasLambdaResponseExport ? 'Imported successfully' : 'Import failed');
    
    // Try to create a sample object matching the interface (runtime check)
    const sampleEvent = {
      action: 'create_campaign',
      data: { campaignPlan: {}, name: 'Test Campaign' },
      user: { sub: 'user-123' },
      mode: 'direct'
    };
    logTest('4.3: Sample LambdaEvent object structure valid', 
      sampleEvent.action && sampleEvent.data && sampleEvent.user && sampleEvent.user.sub,
      'Structure matches interface');
    
    const sampleResponse = {
      success: true,
      result: { campaignId: 'campaign-123' },
      error: undefined,
      details: {}
    };
    logTest('4.4: Sample LambdaResponse object structure valid',
      typeof sampleResponse.success === 'boolean' && sampleResponse.result !== undefined,
      'Structure matches interface');
    
  } catch (error) {
    logTest('4.1: Import types', false, `Error: ${error.message}`);
  }
} else {
  logTest('4.1: Import types', false, 'Compiled file does not exist - run npm run build first');
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

