/**
 * Verification Test for Phase 2D.3 - Lambda Deployment Structure
 * 
 * Tests that Lambda deployment structure is correctly created
 */

const path = require('path');
const fs = require('fs');

console.log('='.repeat(80));
console.log('PHASE 2D.3 VERIFICATION TEST - Lambda Deployment Structure');
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

// Test 1: Directory structure exists
console.log('Test 1: Directory Structure');
const campaignMgmtDir = path.join(__dirname, 'src', 'campaign-mgmt');
const bulkWorkerDir = path.join(__dirname, 'src', 'bulk-worker');
const sharedDir = path.join(__dirname, 'src', 'shared');

const campaignMgmtExists = fs.existsSync(campaignMgmtDir);
const bulkWorkerExists = fs.existsSync(bulkWorkerDir);
const sharedExists = fs.existsSync(sharedDir);

logTest('1.1: campaign-mgmt directory exists', campaignMgmtExists, campaignMgmtExists ? 'Found' : 'Not found');
logTest('1.2: bulk-worker directory exists', bulkWorkerExists, bulkWorkerExists ? 'Found' : 'Not found');
logTest('1.3: shared directory exists', sharedExists, sharedExists ? 'Found' : 'Not found');

// Test 2: Campaign Management Lambda files
console.log('\nTest 2: Campaign Management Lambda Files');
if (campaignMgmtExists) {
  const indexFile = path.join(campaignMgmtDir, 'index.js');
  const packageFile = path.join(campaignMgmtDir, 'package.json');
  const readmeFile = path.join(campaignMgmtDir, 'README.md');
  const handlersDir = path.join(campaignMgmtDir, 'handlers');
  const libDir = path.join(campaignMgmtDir, 'lib');
  
  const indexExists = fs.existsSync(indexFile);
  const packageExists = fs.existsSync(packageFile);
  const readmeExists = fs.existsSync(readmeFile);
  const handlersExists = fs.existsSync(handlersDir);
  const libExists = fs.existsSync(libDir);
  
  logTest('2.1: campaign-mgmt/index.js exists', indexExists, indexExists ? 'Found' : 'Not found');
  logTest('2.2: campaign-mgmt/package.json exists', packageExists, packageExists ? 'Found' : 'Not found');
  logTest('2.3: campaign-mgmt/README.md exists', readmeExists, readmeExists ? 'Found' : 'Not found');
  logTest('2.4: campaign-mgmt/handlers directory exists', handlersExists, handlersExists ? 'Found' : 'Not found');
  logTest('2.5: campaign-mgmt/lib directory exists', libExists, libExists ? 'Found' : 'Not found');
  
  // Check handler files
  if (handlersExists) {
    const createFile = path.join(handlersDir, 'create.js');
    const readFile = path.join(handlersDir, 'read.js');
    const updateFile = path.join(handlersDir, 'update.js');
    const deleteFile = path.join(handlersDir, 'delete.js');
    
    logTest('2.6: handlers/create.js exists', fs.existsSync(createFile), fs.existsSync(createFile) ? 'Found' : 'Not found');
    logTest('2.7: handlers/read.js exists', fs.existsSync(readFile), fs.existsSync(readFile) ? 'Found' : 'Not found');
    logTest('2.8: handlers/update.js exists', fs.existsSync(updateFile), fs.existsSync(updateFile) ? 'Found' : 'Not found');
    logTest('2.9: handlers/delete.js exists', fs.existsSync(deleteFile), fs.existsSync(deleteFile) ? 'Found' : 'Not found');
  }
  
  // Check lib files
  if (libExists) {
    const dbFile = path.join(libDir, 'db.js');
    const dispatcherFile = path.join(libDir, 'dispatcher.js');
    
    logTest('2.10: lib/db.js exists', fs.existsSync(dbFile), fs.existsSync(dbFile) ? 'Found' : 'Not found');
    logTest('2.11: lib/dispatcher.js exists', fs.existsSync(dispatcherFile), fs.existsSync(dispatcherFile) ? 'Found' : 'Not found');
  }
} else {
  logTest('2.1: Campaign management files', false, 'Directory does not exist');
}

// Test 3: Bulk Worker Lambda files
console.log('\nTest 3: Bulk Worker Lambda Files');
if (bulkWorkerExists) {
  const indexFile = path.join(bulkWorkerDir, 'index.js');
  const packageFile = path.join(bulkWorkerDir, 'package.json');
  const readmeFile = path.join(bulkWorkerDir, 'README.md');
  const libDir = path.join(bulkWorkerDir, 'lib');
  
  const indexExists = fs.existsSync(indexFile);
  const packageExists = fs.existsSync(packageFile);
  const readmeExists = fs.existsSync(readmeFile);
  const libExists = fs.existsSync(libDir);
  
  logTest('3.1: bulk-worker/index.js exists', indexExists, indexExists ? 'Found' : 'Not found');
  logTest('3.2: bulk-worker/package.json exists', packageExists, packageExists ? 'Found' : 'Not found');
  logTest('3.3: bulk-worker/README.md exists', readmeExists, readmeExists ? 'Found' : 'Not found');
  logTest('3.4: bulk-worker/lib directory exists', libExists, libExists ? 'Found' : 'Not found');
  
  // Check lib files
  if (libExists) {
    const batchJobFile = path.join(libDir, 'batchJob.js');
    logTest('3.5: lib/batchJob.js exists', fs.existsSync(batchJobFile), fs.existsSync(batchJobFile) ? 'Found' : 'Not found');
  }
} else {
  logTest('3.1: Bulk worker files', false, 'Directory does not exist');
}

// Test 4: Package.json content validation
console.log('\nTest 4: Package.json Content Validation');
if (campaignMgmtExists) {
  const packageFile = path.join(campaignMgmtDir, 'package.json');
  if (fs.existsSync(packageFile)) {
    try {
      const packageContent = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
      
      logTest('4.1: campaign-mgmt/package.json is valid JSON', true, 'Valid JSON');
      logTest('4.2: campaign-mgmt/package.json has name', packageContent.name !== undefined, packageContent.name || 'Not found');
      logTest('4.3: campaign-mgmt/package.json has dependencies', packageContent.dependencies !== undefined, packageContent.dependencies ? 'Found' : 'Not found');
      logTest('4.4: campaign-mgmt/package.json has pg dependency', packageContent.dependencies?.pg !== undefined, packageContent.dependencies?.pg || 'Not found');
      logTest('4.5: campaign-mgmt/package.json has axios dependency', packageContent.dependencies?.axios !== undefined, packageContent.dependencies?.axios || 'Not found');
      logTest('4.6: campaign-mgmt/package.json has aws-xray-sdk-core dependency', packageContent.dependencies?.['aws-xray-sdk-core'] !== undefined, packageContent.dependencies?.['aws-xray-sdk-core'] || 'Not found');
    } catch (error) {
      logTest('4.1: campaign-mgmt/package.json is valid JSON', false, `Error: ${error.message}`);
    }
  } else {
    logTest('4.1: campaign-mgmt/package.json exists', false, 'File not found');
  }
}

if (bulkWorkerExists) {
  const packageFile = path.join(bulkWorkerDir, 'package.json');
  if (fs.existsSync(packageFile)) {
    try {
      const packageContent = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
      
      logTest('4.7: bulk-worker/package.json is valid JSON', true, 'Valid JSON');
      logTest('4.8: bulk-worker/package.json has name', packageContent.name !== undefined, packageContent.name || 'Not found');
      logTest('4.9: bulk-worker/package.json has dependencies', packageContent.dependencies !== undefined, packageContent.dependencies ? 'Found' : 'Not found');
      logTest('4.10: bulk-worker/package.json has aws-sdk dependency', packageContent.dependencies?.['aws-sdk'] !== undefined, packageContent.dependencies?.['aws-sdk'] || 'Not found');
      logTest('4.11: bulk-worker/package.json has aws-xray-sdk-core dependency', packageContent.dependencies?.['aws-xray-sdk-core'] !== undefined, packageContent.dependencies?.['aws-xray-sdk-core'] || 'Not found');
    } catch (error) {
      logTest('4.7: bulk-worker/package.json is valid JSON', false, `Error: ${error.message}`);
    }
  } else {
    logTest('4.7: bulk-worker/package.json exists', false, 'File not found');
  }
}

// Test 5: Handler file content validation
console.log('\nTest 5: Handler File Content Validation');
if (campaignMgmtExists) {
  const indexFile = path.join(campaignMgmtDir, 'index.js');
  if (fs.existsSync(indexFile)) {
    try {
      const content = fs.readFileSync(indexFile, 'utf8');
      
      const hasHandlerExport = content.includes('exports.handler') || content.includes('module.exports.handler');
      const hasDispatcherClient = content.includes('dispatcherClient') || content.includes('dispatcher');
      const hasHandlers = content.includes('createHandler') || content.includes('handlers/create');
      const hasXRay = content.includes('AWSXRay') || content.includes('aws-xray-sdk-core');
      
      logTest('5.1: campaign-mgmt/index.js has handler export', hasHandlerExport, hasHandlerExport ? 'Found' : 'Not found');
      logTest('5.2: campaign-mgmt/index.js uses dispatcher client', hasDispatcherClient, hasDispatcherClient ? 'Found' : 'Not found');
      logTest('5.3: campaign-mgmt/index.js imports handlers', hasHandlers, hasHandlers ? 'Found' : 'Not found');
      logTest('5.4: campaign-mgmt/index.js has X-Ray tracing', hasXRay, hasXRay ? 'Found' : 'Not found');
    } catch (error) {
      logTest('5.1: Read campaign-mgmt/index.js', false, `Error: ${error.message}`);
    }
  }
  
  // Check create handler
  const createFile = path.join(campaignMgmtDir, 'handlers', 'create.js');
  if (fs.existsSync(createFile)) {
    try {
      const content = fs.readFileSync(createFile, 'utf8');
      const hasPostgres = content.includes('pool') || content.includes('client.query');
      const hasDispatcher = content.includes('dispatcherClient') || content.includes('handleLambdaEvent');
      const hasTransaction = content.includes('BEGIN') && content.includes('COMMIT');
      
      logTest('5.5: handlers/create.js has PostgreSQL integration', hasPostgres, hasPostgres ? 'Found' : 'Not found');
      logTest('5.6: handlers/create.js uses dispatcher client', hasDispatcher, hasDispatcher ? 'Found' : 'Not found');
      logTest('5.7: handlers/create.js has transaction handling', hasTransaction, hasTransaction ? 'Found' : 'Not found');
    } catch (error) {
      logTest('5.5: Read handlers/create.js', false, `Error: ${error.message}`);
    }
  }
}

if (bulkWorkerExists) {
  const indexFile = path.join(bulkWorkerDir, 'index.js');
  if (fs.existsSync(indexFile)) {
    try {
      const content = fs.readFileSync(indexFile, 'utf8');
      
      const hasHandlerExport = content.includes('exports.handler') || content.includes('module.exports.handler');
      const hasBatchJobClient = content.includes('batchJobClient') || content.includes('batchJob');
      const hasSqsProcessing = content.includes('event.Records') || content.includes('Records');
      const hasDynamoDB = content.includes('dynamodb') || content.includes('DynamoDB');
      const hasXRay = content.includes('AWSXRay') || content.includes('aws-xray-sdk-core');
      
      logTest('5.8: bulk-worker/index.js has handler export', hasHandlerExport, hasHandlerExport ? 'Found' : 'Not found');
      logTest('5.9: bulk-worker/index.js uses batch job client', hasBatchJobClient, hasBatchJobClient ? 'Found' : 'Not found');
      logTest('5.10: bulk-worker/index.js processes SQS events', hasSqsProcessing, hasSqsProcessing ? 'Found' : 'Not found');
      logTest('5.11: bulk-worker/index.js has DynamoDB integration', hasDynamoDB, hasDynamoDB ? 'Found' : 'Not found');
      logTest('5.12: bulk-worker/index.js has X-Ray tracing', hasXRay, hasXRay ? 'Found' : 'Not found');
    } catch (error) {
      logTest('5.8: Read bulk-worker/index.js', false, `Error: ${error.message}`);
    }
  }
}

// Test 6: Library file content validation
console.log('\nTest 6: Library File Content Validation');
if (campaignMgmtExists) {
  const dispatcherFile = path.join(campaignMgmtDir, 'lib', 'dispatcher.js');
  if (fs.existsSync(dispatcherFile)) {
    try {
      const content = fs.readFileSync(dispatcherFile, 'utf8');
      const hasMarinDispatcherClient = content.includes('MarinDispatcherClient');
      const hasModuleExport = content.includes('module.exports') || content.includes('exports');
      
      logTest('6.1: lib/dispatcher.js exports MarinDispatcherClient', hasMarinDispatcherClient, hasMarinDispatcherClient ? 'Found' : 'Not found');
      logTest('6.2: lib/dispatcher.js has module export', hasModuleExport, hasModuleExport ? 'Found' : 'Not found');
    } catch (error) {
      logTest('6.1: Read lib/dispatcher.js', false, `Error: ${error.message}`);
    }
  }
  
  const dbFile = path.join(campaignMgmtDir, 'lib', 'db.js');
  if (fs.existsSync(dbFile)) {
    try {
      const content = fs.readFileSync(dbFile, 'utf8');
      const hasPool = content.includes('Pool') || content.includes('pg');
      const hasXRay = content.includes('AWSXRay') || content.includes('capturePostgres');
      const hasModuleExport = content.includes('module.exports') || content.includes('exports');
      
      logTest('6.3: lib/db.js exports PostgreSQL pool', hasPool, hasPool ? 'Found' : 'Not found');
      logTest('6.4: lib/db.js has X-Ray tracing', hasXRay, hasXRay ? 'Found' : 'Not found');
      logTest('6.5: lib/db.js has module export', hasModuleExport, hasModuleExport ? 'Found' : 'Not found');
    } catch (error) {
      logTest('6.3: Read lib/db.js', false, `Error: ${error.message}`);
    }
  }
}

if (bulkWorkerExists) {
  const batchJobFile = path.join(bulkWorkerDir, 'lib', 'batchJob.js');
  if (fs.existsSync(batchJobFile)) {
    try {
      const content = fs.readFileSync(batchJobFile, 'utf8');
      const hasMarinBatchJobClient = content.includes('MarinBatchJobClient');
      const hasModuleExport = content.includes('module.exports') || content.includes('exports');
      
      logTest('6.6: lib/batchJob.js exports MarinBatchJobClient', hasMarinBatchJobClient, hasMarinBatchJobClient ? 'Found' : 'Not found');
      logTest('6.7: lib/batchJob.js has module export', hasModuleExport, hasModuleExport ? 'Found' : 'Not found');
    } catch (error) {
      logTest('6.6: Read lib/batchJob.js', false, `Error: ${error.message}`);
    }
  }
}

// Test 7: README files validation
console.log('\nTest 7: README Files Validation');
if (campaignMgmtExists) {
  const readmeFile = path.join(campaignMgmtDir, 'README.md');
  if (fs.existsSync(readmeFile)) {
    try {
      const content = fs.readFileSync(readmeFile, 'utf8');
      const hasStructure = content.includes('Structure') || content.includes('directory');
      const hasEnvVars = content.includes('Environment Variables') || content.includes('DISPATCHER_URL');
      const hasActions = content.includes('Supported Actions') || content.includes('create_campaign');
      
      logTest('7.1: campaign-mgmt/README.md has structure section', hasStructure, hasStructure ? 'Found' : 'Not found');
      logTest('7.2: campaign-mgmt/README.md documents environment variables', hasEnvVars, hasEnvVars ? 'Found' : 'Not found');
      logTest('7.3: campaign-mgmt/README.md documents supported actions', hasActions, hasActions ? 'Found' : 'Not found');
    } catch (error) {
      logTest('7.1: Read campaign-mgmt/README.md', false, `Error: ${error.message}`);
    }
  }
}

if (bulkWorkerExists) {
  const readmeFile = path.join(bulkWorkerDir, 'README.md');
  if (fs.existsSync(readmeFile)) {
    try {
      const content = fs.readFileSync(readmeFile, 'utf8');
      const hasStructure = content.includes('Structure') || content.includes('directory');
      const hasEnvVars = content.includes('Environment Variables') || content.includes('DISPATCHER_URL');
      const hasEventFormat = content.includes('Event Format') || content.includes('SQS');
      
      logTest('7.4: bulk-worker/README.md has structure section', hasStructure, hasStructure ? 'Found' : 'Not found');
      logTest('7.5: bulk-worker/README.md documents environment variables', hasEnvVars, hasEnvVars ? 'Found' : 'Not found');
      logTest('7.6: bulk-worker/README.md documents event format', hasEventFormat, hasEventFormat ? 'Found' : 'Not found');
    } catch (error) {
      logTest('7.4: Read bulk-worker/README.md', false, `Error: ${error.message}`);
    }
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

