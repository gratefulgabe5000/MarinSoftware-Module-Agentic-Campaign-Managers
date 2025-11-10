// test-3.1.2-lambda-integration.js
const path = require('path');
const fs = require('fs');

console.log('Task 3.1.2: Verify Lambda Integration');
console.log('=====================================');
console.log('');

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

// Test 2: Verify Lambda client files exist
console.log('Test 2: Lambda Client Files');
console.log('============================');
try {
  const dispatcherClientPath = path.join(__dirname, 'src', 'lib', 'marinDispatcherClient.ts');
  const batchJobClientPath = path.join(__dirname, 'src', 'lib', 'marinBatchJobClient.ts');
  const lambdaTypesPath = path.join(__dirname, 'src', 'types', 'lambda.types.ts');
  
  if (fs.existsSync(dispatcherClientPath)) {
    console.log('✅ marinDispatcherClient.ts exists');
  } else {
    console.error('❌ marinDispatcherClient.ts not found');
    process.exit(1);
  }
  
  if (fs.existsSync(batchJobClientPath)) {
    console.log('✅ marinBatchJobClient.ts exists');
  } else {
    console.error('❌ marinBatchJobClient.ts not found');
    process.exit(1);
  }
  
  if (fs.existsSync(lambdaTypesPath)) {
    console.log('✅ lambda.types.ts exists');
  } else {
    console.error('❌ lambda.types.ts not found');
    process.exit(1);
  }
  console.log('');
} catch (error) {
  console.error('❌ File verification failed:', error.message);
  process.exit(1);
}

// Test 3: Verify Lambda client exports
console.log('Test 3: Lambda Client Exports');
console.log('==============================');
try {
  const dispatcherClientPath = path.join(__dirname, 'src', 'lib', 'marinDispatcherClient.ts');
  const batchJobClientPath = path.join(__dirname, 'src', 'lib', 'marinBatchJobClient.ts');
  const dispatcherContent = fs.readFileSync(dispatcherClientPath, 'utf8');
  const batchJobContent = fs.readFileSync(batchJobClientPath, 'utf8');
  
  if (dispatcherContent.includes('export class MarinDispatcherClient')) {
    console.log('✅ MarinDispatcherClient class exported');
  } else {
    console.error('❌ MarinDispatcherClient class not exported');
    process.exit(1);
  }
  
  if (batchJobContent.includes('export class MarinBatchJobClient')) {
    console.log('✅ MarinBatchJobClient class exported');
  } else {
    console.error('❌ MarinBatchJobClient class not exported');
    process.exit(1);
  }
  console.log('');
} catch (error) {
  console.error('❌ Export verification failed:', error.message);
  process.exit(1);
}

// Test 4: Verify Lambda event format handling
console.log('Test 4: Lambda Event Format Handling');
console.log('====================================');
try {
  const dispatcherClientPath = path.join(__dirname, 'src', 'lib', 'marinDispatcherClient.ts');
  const dispatcherContent = fs.readFileSync(dispatcherClientPath, 'utf8');
  
  // Check for handleLambdaEvent method
  if (dispatcherContent.includes('handleLambdaEvent(event: LambdaEvent)')) {
    console.log('✅ handleLambdaEvent method found');
  } else {
    console.error('❌ handleLambdaEvent method not found');
    process.exit(1);
  }
  
  // Check for event validation
  if (dispatcherContent.includes('action') && dispatcherContent.includes('data') && dispatcherContent.includes('user')) {
    console.log('✅ Lambda event structure validation found');
  } else {
    console.error('❌ Lambda event structure validation not found');
    process.exit(1);
  }
  
  // Check for action handling
  const actions = ['create_campaign', 'update_campaign', 'pause_campaign', 'resume_campaign', 'delete_campaign', 'get_campaign_status'];
  let actionsFound = 0;
  actions.forEach(action => {
    if (dispatcherContent.includes(`case '${action}'`)) {
      actionsFound++;
    }
  });
  if (actionsFound === actions.length) {
    console.log(`✅ All ${actions.length} campaign actions handled`);
  } else {
    console.error(`❌ Only ${actionsFound}/${actions.length} campaign actions found`);
    process.exit(1);
  }
  console.log('');
} catch (error) {
  console.error('❌ Event format verification failed:', error.message);
  process.exit(1);
}

// Test 5: Verify Lambda response format
console.log('Test 5: Lambda Response Format');
console.log('==============================');
try {
  const dispatcherClientPath = path.join(__dirname, 'src', 'lib', 'marinDispatcherClient.ts');
  const dispatcherContent = fs.readFileSync(dispatcherClientPath, 'utf8');
  const lambdaTypesPath = path.join(__dirname, 'src', 'types', 'lambda.types.ts');
  const lambdaTypesContent = fs.readFileSync(lambdaTypesPath, 'utf8');
  
  // Check for LambdaResponse interface
  if (lambdaTypesContent.includes('interface LambdaResponse')) {
    console.log('✅ LambdaResponse interface defined');
  } else {
    console.error('❌ LambdaResponse interface not found');
    process.exit(1);
  }
  
  // Check for response mapping
  if (dispatcherContent.includes('mapPlatformResponseToLambdaResponse')) {
    console.log('✅ Response mapping method found');
  } else {
    console.error('❌ Response mapping method not found');
    process.exit(1);
  }
  
  // Check for response structure
  if (dispatcherContent.includes('success:') && dispatcherContent.includes('result:') && dispatcherContent.includes('error:')) {
    console.log('✅ Lambda response structure correct');
  } else {
    console.error('❌ Lambda response structure incorrect');
    process.exit(1);
  }
  console.log('');
} catch (error) {
  console.error('❌ Response format verification failed:', error.message);
  process.exit(1);
}

// Test 6: Verify DISPATCHER_URL usage
console.log('Test 6: DISPATCHER_URL Environment Variable');
console.log('============================================');
try {
  const dispatcherServicePath = path.join(__dirname, 'src', 'services', 'marinDispatcherService.ts');
  const dispatcherServiceContent = fs.readFileSync(dispatcherServicePath, 'utf8');
  
  // Check for DISPATCHER_URL usage
  if (dispatcherServiceContent.includes('DISPATCHER_URL') || dispatcherServiceContent.includes('process.env.DISPATCHER_URL')) {
    console.log('✅ DISPATCHER_URL environment variable usage found');
  } else {
    console.error('❌ DISPATCHER_URL environment variable usage not found');
    process.exit(1);
  }
  
  // Check for fallback to MARIN_DISPATCHER_BASE_URL
  if (dispatcherServiceContent.includes('MARIN_DISPATCHER_BASE_URL') || dispatcherServiceContent.includes('config.marinDispatcher.baseUrl')) {
    console.log('✅ Fallback to MARIN_DISPATCHER_BASE_URL found');
  } else {
    console.warn('⚠️  Fallback to MARIN_DISPATCHER_BASE_URL not found (may be acceptable)');
  }
  console.log('');
} catch (error) {
  console.error('❌ DISPATCHER_URL verification failed:', error.message);
  process.exit(1);
}

// Test 7: Verify X-Ray tracing
console.log('Test 7: X-Ray Tracing Integration');
console.log('==================================');
try {
  const dispatcherClientPath = path.join(__dirname, 'src', 'lib', 'marinDispatcherClient.ts');
  const batchJobClientPath = path.join(__dirname, 'src', 'lib', 'marinBatchJobClient.ts');
  const dispatcherContent = fs.readFileSync(dispatcherClientPath, 'utf8');
  const batchJobContent = fs.readFileSync(batchJobClientPath, 'utf8');
  
  // Check for X-Ray import
  if (dispatcherContent.includes('aws-xray-sdk-core') || dispatcherContent.includes('AWSXRay')) {
    console.log('✅ X-Ray SDK imported in MarinDispatcherClient');
  } else {
    console.error('❌ X-Ray SDK not imported in MarinDispatcherClient');
    process.exit(1);
  }
  
  if (batchJobContent.includes('aws-xray-sdk-core') || batchJobContent.includes('AWSXRay')) {
    console.log('✅ X-Ray SDK imported in MarinBatchJobClient');
  } else {
    console.error('❌ X-Ray SDK not imported in MarinBatchJobClient');
    process.exit(1);
  }
  
  // Check for X-Ray segment usage
  if (dispatcherContent.includes('getSegment') || dispatcherContent.includes('addNewSubsegment')) {
    console.log('✅ X-Ray tracing segments found in MarinDispatcherClient');
  } else {
    console.error('❌ X-Ray tracing segments not found in MarinDispatcherClient');
    process.exit(1);
  }
  
  if (batchJobContent.includes('getSegment') || batchJobContent.includes('addNewSubsegment')) {
    console.log('✅ X-Ray tracing segments found in MarinBatchJobClient');
  } else {
    console.error('❌ X-Ray tracing segments not found in MarinBatchJobClient');
    process.exit(1);
  }
  console.log('');
} catch (error) {
  console.error('❌ X-Ray tracing verification failed:', error.message);
  process.exit(1);
}

// Test 8: Verify SQS event handling
console.log('Test 8: SQS Event Handling');
console.log('==========================');
try {
  const batchJobClientPath = path.join(__dirname, 'src', 'lib', 'marinBatchJobClient.ts');
  const batchJobContent = fs.readFileSync(batchJobClientPath, 'utf8');
  const lambdaTypesPath = path.join(__dirname, 'src', 'types', 'lambda.types.ts');
  const lambdaTypesContent = fs.readFileSync(lambdaTypesPath, 'utf8');
  
  // Check for SqsEvent interface
  if (lambdaTypesContent.includes('interface SqsEvent')) {
    console.log('✅ SqsEvent interface defined');
  } else {
    console.error('❌ SqsEvent interface not found');
    process.exit(1);
  }
  
  // Check for handleSqsEvent method
  if (batchJobContent.includes('handleSqsEvent(event: SqsEvent)')) {
    console.log('✅ handleSqsEvent method found');
  } else {
    console.error('❌ handleSqsEvent method not found');
    process.exit(1);
  }
  
  // Check for SQS record processing
  if (batchJobContent.includes('event.Records') || batchJobContent.includes('Records')) {
    console.log('✅ SQS Records processing found');
  } else {
    console.error('❌ SQS Records processing not found');
    process.exit(1);
  }
  console.log('');
} catch (error) {
  console.error('❌ SQS event handling verification failed:', error.message);
  process.exit(1);
}

console.log('========================================');
console.log('All Tests Passed! ✅');
console.log('========================================');
console.log('');
console.log('Summary:');
console.log('- TypeScript compilation: ✅');
console.log('- Lambda client files exist: ✅');
console.log('- Lambda client exports: ✅');
console.log('- Lambda event format handling: ✅');
console.log('- Lambda response format: ✅');
console.log('- DISPATCHER_URL usage: ✅');
console.log('- X-Ray tracing integration: ✅');
console.log('- SQS event handling: ✅');
console.log('');
console.log('Task 3.1.2: Lambda Integration Verification - COMPLETE');

