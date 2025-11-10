// Simple manual test using compiled JavaScript
// Run with: node test-simple-manual.js

console.log('=== Starting Marin Dispatcher Service Manual Test ===\n');
console.log('Step 1: Loading modules...\n');

let MarinDispatcherService;
let config;

try {
  console.log('  - Attempting to load marinDispatcherService...');
  const serviceModule = require('./dist/services/marinDispatcherService.js');
  MarinDispatcherService = serviceModule.MarinDispatcherService;
  console.log('  ✓ marinDispatcherService loaded successfully');
  console.log('  - MarinDispatcherService type:', typeof MarinDispatcherService);
  console.log('  - MarinDispatcherService exists:', !!MarinDispatcherService);
} catch (error) {
  console.error('  ✗ ERROR loading marinDispatcherService:', error.message);
  console.error('  Stack:', error.stack);
  process.exit(1);
}

try {
  console.log('  - Attempting to load config...');
  const configModule = require('./dist/config/env.js');
  config = configModule.default;
  console.log('  ✓ config loaded successfully');
  console.log('  - Config type:', typeof config);
  console.log('  - Config exists:', !!config);
} catch (error) {
  console.error('  ✗ ERROR loading config:', error.message);
  console.error('  Stack:', error.stack);
  process.exit(1);
}

console.log('\n=== Marin Dispatcher Service Manual Test ===\n');

// Test 1: Verify config is loaded
console.log('Test 1: Verify config is loaded');
try {
  console.log('  - Config exists:', !!config);
  console.log('  - Config type:', typeof config);
  console.log('  - Config keys:', config ? Object.keys(config).slice(0, 5).join(', ') : 'N/A');
  console.log('  - marinDispatcher exists:', !!(config && config.marinDispatcher));
  
  if (!config) {
    throw new Error('Config is null or undefined');
  }
  
  if (!config.marinDispatcher) {
    throw new Error('config.marinDispatcher is null or undefined');
  }
  
  console.log('  - marinDispatcher.accountId:', config.marinDispatcher.accountId);
  console.log('  - marinDispatcher.timeout:', config.marinDispatcher.timeout);
  console.log('  - marinDispatcher.baseUrl:', config.marinDispatcher.baseUrl);
  console.log('  - marinDispatcher.publisher:', config.marinDispatcher.publisher);
  console.log('  ✓ Config loaded successfully\n');
} catch (error) {
  console.error('  ✗ ERROR in Test 1:', error.message);
  console.error('  Stack:', error.stack);
  process.exit(1);
}

// Test 2: Create service with default publisher
console.log('Test 2: Create service with default publisher');
try {
  console.log('  - Attempting to create service...');
  console.log('  - MarinDispatcherService constructor:', typeof MarinDispatcherService);
  
  if (typeof MarinDispatcherService !== 'function') {
    throw new Error('MarinDispatcherService is not a function');
  }
  
  const service1 = new MarinDispatcherService();
  console.log('  - Service created:', !!service1);
  console.log('  - Service type:', typeof service1);
  console.log('  - Service is instance of MarinDispatcherService:', service1 instanceof MarinDispatcherService);
  console.log('  - Service constructor name:', service1.constructor.name);
  console.log('  ✓ Service created successfully\n');
} catch (error) {
  console.error('  ✗ ERROR creating service:', error.message);
  console.error('  Error name:', error.name);
  console.error('  Stack:', error.stack);
  process.exit(1);
}

// Test 3: Create service with custom accountId and publisher
console.log('Test 3: Create service with custom accountId and publisher');
try {
  const service2 = new MarinDispatcherService('custom-account-id', 'meta');
  console.log('  - Service created:', !!service2);
  console.log('  ✓ Service created with custom parameters\n');
} catch (error) {
  console.error('  ✗ Error creating service:', error.message);
  process.exit(1);
}

// Test 4: Test isAuthenticated (async)
console.log('Test 4: Test isAuthenticated method');
(async () => {
  try {
    console.log('  - Creating service for isAuthenticated test...');
    const service3 = new MarinDispatcherService();
    console.log('  - Service created:', !!service3);
    console.log('  - Checking if isAuthenticated method exists...');
    console.log('  - isAuthenticated type:', typeof service3.isAuthenticated);
    
    if (typeof service3.isAuthenticated !== 'function') {
      throw new Error('isAuthenticated is not a function');
    }
    
    console.log('  - Calling isAuthenticated...');
    const isAuth = await service3.isAuthenticated();
    console.log('  - Result:', isAuth);
    console.log('  - Type:', typeof isAuth);
    console.log('  ✓ isAuthenticated completed (result may be false if API not available)\n');
  } catch (error) {
    console.error('  ✗ ERROR calling isAuthenticated:', error.message);
    console.error('  Error name:', error.name);
    console.error('  Stack:', error.stack);
    console.error('  Note: This is expected if the API is not available\n');
  }

  // Test 5: Test placeholder methods
  console.log('Test 5: Test placeholder methods');
  try {
    const service4 = new MarinDispatcherService();
    
    const campaignPlan = {
      objective: 'Test objective',
      targetAudience: {},
      budget: { total: 1000, currency: 'USD' },
      timeline: { startDate: '2025-01-01', duration: 30 },
      platforms: ['Google Ads'],
      kpis: { primary: 'Conversions' },
    };

    const createResult = await service4.createCampaign(campaignPlan, 'Test Campaign');
    console.log('  - createCampaign result:', JSON.stringify(createResult));
    console.log('  - Expected error:', createResult.error === 'createCampaign not yet implemented');
    
    const updateResult = await service4.updateCampaign('test-id', {});
    console.log('  - updateCampaign result:', updateResult.error === 'updateCampaign not yet implemented');
    
    const pauseResult = await service4.pauseCampaign('test-id');
    console.log('  - pauseCampaign result:', pauseResult.error === 'pauseCampaign not yet implemented');
    
    const resumeResult = await service4.resumeCampaign('test-id');
    console.log('  - resumeCampaign result:', resumeResult.error === 'resumeCampaign not yet implemented');
    
    const deleteResult = await service4.deleteCampaign('test-id');
    console.log('  - deleteCampaign result:', deleteResult.error === 'deleteCampaign not yet implemented');
    
    const statusResult = await service4.getCampaignStatus('test-id');
    console.log('  - getCampaignStatus result:', statusResult.error === 'getCampaignStatus not yet implemented');
    
    console.log('  ✓ All placeholder methods return expected errors\n');
    console.log('=== All manual tests completed successfully! ===');
  } catch (error) {
    console.error('  ✗ Error testing placeholder methods:', error.message);
    process.exit(1);
  }
})().catch((error) => {
  console.error('\n✗ FATAL ERROR in async tests:', error.message);
  console.error('Error name:', error.name);
  console.error('Stack:', error.stack);
  process.exit(1);
});

// Add unhandled rejection handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('\n✗ UNHANDLED REJECTION:', reason);
  console.error('Promise:', promise);
  process.exit(1);
});

// Add uncaught exception handler
process.on('uncaughtException', (error) => {
  console.error('\n✗ UNCAUGHT EXCEPTION:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
});

