// test-3.1.1-service-registration.js
const path = require('path');
const fs = require('fs');

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

