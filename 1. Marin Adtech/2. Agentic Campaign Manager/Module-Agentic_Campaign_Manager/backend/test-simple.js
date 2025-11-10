// Simple test to verify output works
console.log('=== Simple Test ===');
console.log('Test 1: Basic output');
console.log('Test 2: Config check');

const config = require('./dist/config/env.js').default;
console.log('Config loaded:', !!config);
console.log('marinDispatcher:', config && config.marinDispatcher ? 'exists' : 'missing');

const { MarinDispatcherService } = require('./dist/services/marinDispatcherService.js');
console.log('Service imported:', !!MarinDispatcherService);

try {
  const service = new MarinDispatcherService();
  console.log('Service created:', !!service);
  console.log('=== All tests passed ===');
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}


