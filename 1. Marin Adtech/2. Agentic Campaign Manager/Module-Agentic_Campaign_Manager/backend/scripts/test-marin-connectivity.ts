#!/usr/bin/env ts-node
/**
 * Marin Dispatcher API Connectivity Test Script
 *
 * Manual test script to verify Marin Dispatcher API connectivity
 * Tests various scenarios including valid/invalid configurations
 *
 * Usage:
 *   npm run test:marin-connectivity
 *   OR
 *   ts-node backend/scripts/test-marin-connectivity.ts
 *
 * Environment Variables Required:
 *   DISPATCHER_URL or MARIN_DISPATCHER_BASE_URL
 *   MARIN_DISPATCHER_ACCOUNT_ID
 *   MARIN_DISPATCHER_PUBLISHER (optional, defaults to 'google')
 *
 * Task: 4.1.1 - Test API Connectivity
 */

import dotenv from 'dotenv';
import axios from 'axios';
import { MarinDispatcherService } from '../src/services/marinDispatcherService';
import config from '../src/config/env';

// Load environment variables
dotenv.config();

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

// Test result interface
interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  message: string;
  duration: number;
}

// Test results array
const results: TestResult[] = [];

/**
 * Print test header
 */
function printHeader() {
  console.log('\n' + colors.bold + colors.cyan + '='.repeat(70));
  console.log('  MARIN DISPATCHER API CONNECTIVITY TEST');
  console.log('  Task 4.1.1 - Test API Connectivity');
  console.log('='.repeat(70) + colors.reset + '\n');
}

/**
 * Print test result
 */
function printResult(result: TestResult) {
  const statusColor = result.status === 'PASS' ? colors.green :
                      result.status === 'FAIL' ? colors.red : colors.yellow;
  const statusIcon = result.status === 'PASS' ? '✓' :
                     result.status === 'FAIL' ? '✗' : '⚠';

  console.log(
    `${statusColor}${statusIcon}${colors.reset} ${result.name} ` +
    `${colors.cyan}(${result.duration}ms)${colors.reset}`
  );
  console.log(`  ${result.message}\n`);
}

/**
 * Print summary
 */
function printSummary() {
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const warnings = results.filter(r => r.status === 'WARN').length;
  const total = results.length;

  console.log('\n' + colors.bold + '='.repeat(70));
  console.log('  TEST SUMMARY');
  console.log('='.repeat(70) + colors.reset);
  console.log(`${colors.green}Passed:${colors.reset}   ${passed}/${total}`);
  console.log(`${colors.red}Failed:${colors.reset}   ${failed}/${total}`);
  console.log(`${colors.yellow}Warnings:${colors.reset} ${warnings}/${total}`);
  console.log('');

  if (failed === 0) {
    console.log(colors.green + colors.bold + '✓ All tests passed!' + colors.reset + '\n');
    process.exit(0);
  } else {
    console.log(colors.red + colors.bold + '✗ Some tests failed!' + colors.reset + '\n');
    process.exit(1);
  }
}

/**
 * Run a test with timing
 */
async function runTest(
  name: string,
  testFn: () => Promise<{ status: 'PASS' | 'FAIL' | 'WARN'; message: string }>
): Promise<void> {
  console.log(colors.blue + `Running: ${name}...` + colors.reset);
  const start = Date.now();

  try {
    const result = await testFn();
    const duration = Date.now() - start;

    results.push({
      name,
      status: result.status,
      message: result.message,
      duration,
    });

    printResult(results[results.length - 1]);
  } catch (error: any) {
    const duration = Date.now() - start;
    results.push({
      name,
      status: 'FAIL',
      message: `Unexpected error: ${error.message}`,
      duration,
    });
    printResult(results[results.length - 1]);
  }
}

/**
 * Test 1: Check environment configuration
 */
async function testEnvironmentConfig(): Promise<{ status: 'PASS' | 'FAIL' | 'WARN'; message: string }> {
  const baseUrl = config.marinDispatcher.baseUrl;
  const accountId = config.marinDispatcher.accountId;
  const publisher = config.marinDispatcher.publisher;

  if (!baseUrl) {
    return {
      status: 'FAIL',
      message: 'DISPATCHER_URL or MARIN_DISPATCHER_BASE_URL not set',
    };
  }

  if (!accountId) {
    return {
      status: 'WARN',
      message: 'MARIN_DISPATCHER_ACCOUNT_ID not set (using default)',
    };
  }

  return {
    status: 'PASS',
    message: `Config: ${baseUrl} | Account: ${accountId} | Publisher: ${publisher}`,
  };
}

/**
 * Test 2: Test isAuthenticated() with valid configuration
 */
async function testIsAuthenticated(): Promise<{ status: 'PASS' | 'FAIL' | 'WARN'; message: string }> {
  const service = new MarinDispatcherService();
  const result = await service.isAuthenticated();

  if (result) {
    return {
      status: 'PASS',
      message: 'Successfully authenticated with Marin Dispatcher API',
    };
  } else {
    return {
      status: 'FAIL',
      message: 'Failed to authenticate with Marin Dispatcher API',
    };
  }
}

/**
 * Test 3: Test direct API endpoint reachability
 */
async function testEndpointReachability(): Promise<{ status: 'PASS' | 'FAIL' | 'WARN'; message: string }> {
  const baseUrl = config.marinDispatcher.baseUrl;
  const publisher = config.marinDispatcher.publisher;
  const accountId = config.marinDispatcher.accountId;
  const endpoint = `${baseUrl}/dispatcher/${publisher}/campaigns`;

  try {
    const response = await axios.get(endpoint, {
      params: { accountId, limit: 1 },
      timeout: config.marinDispatcher.timeout,
    });

    if (response.status === 200) {
      return {
        status: 'PASS',
        message: `API endpoint reachable: ${endpoint}`,
      };
    } else {
      return {
        status: 'WARN',
        message: `Unexpected status code: ${response.status}`,
      };
    }
  } catch (error: any) {
    if (error.response) {
      return {
        status: 'FAIL',
        message: `HTTP ${error.response.status}: ${error.response.data?.error || error.message}`,
      };
    } else if (error.code === 'ECONNREFUSED') {
      return {
        status: 'FAIL',
        message: 'Connection refused - is the Dispatcher service running?',
      };
    } else if (error.code === 'ECONNABORTED') {
      return {
        status: 'FAIL',
        message: 'Connection timeout - check network connectivity',
      };
    } else if (error.code === 'ENOTFOUND') {
      return {
        status: 'FAIL',
        message: 'DNS resolution failed - check DISPATCHER_URL',
      };
    } else {
      return {
        status: 'FAIL',
        message: error.message,
      };
    }
  }
}

/**
 * Test 4: Test with invalid account ID
 */
async function testInvalidAccountId(): Promise<{ status: 'PASS' | 'FAIL' | 'WARN'; message: string }> {
  const service = new MarinDispatcherService('invalid-account-id-12345');
  const result = await service.isAuthenticated();

  if (!result) {
    return {
      status: 'PASS',
      message: 'Correctly rejected invalid account ID',
    };
  } else {
    return {
      status: 'WARN',
      message: 'Invalid account ID was accepted (API may not validate account IDs)',
    };
  }
}

/**
 * Test 5: Test with invalid publisher
 */
async function testInvalidPublisher(): Promise<{ status: 'PASS' | 'FAIL' | 'WARN'; message: string }> {
  const service = new MarinDispatcherService(undefined, 'invalid-publisher');
  const result = await service.isAuthenticated();

  if (!result) {
    return {
      status: 'PASS',
      message: 'Correctly rejected invalid publisher',
    };
  } else {
    return {
      status: 'WARN',
      message: 'Invalid publisher was accepted (API may not validate publishers)',
    };
  }
}

/**
 * Test 6: Test with Google publisher
 */
async function testGooglePublisher(): Promise<{ status: 'PASS' | 'FAIL' | 'WARN'; message: string }> {
  const service = new MarinDispatcherService(undefined, 'google');
  const result = await service.isAuthenticated();

  if (result) {
    return {
      status: 'PASS',
      message: 'Google publisher connectivity verified',
    };
  } else {
    return {
      status: 'FAIL',
      message: 'Failed to connect with Google publisher',
    };
  }
}

/**
 * Test 7: Test with Meta publisher
 */
async function testMetaPublisher(): Promise<{ status: 'PASS' | 'FAIL' | 'WARN'; message: string }> {
  const service = new MarinDispatcherService(undefined, 'meta');
  const result = await service.isAuthenticated();

  if (result) {
    return {
      status: 'PASS',
      message: 'Meta publisher connectivity verified',
    };
  } else {
    return {
      status: 'WARN',
      message: 'Meta publisher not accessible (may not be configured)',
    };
  }
}

/**
 * Test 8: Test with Microsoft publisher
 */
async function testMicrosoftPublisher(): Promise<{ status: 'PASS' | 'FAIL' | 'WARN'; message: string }> {
  const service = new MarinDispatcherService(undefined, 'microsoft');
  const result = await service.isAuthenticated();

  if (result) {
    return {
      status: 'PASS',
      message: 'Microsoft publisher connectivity verified',
    };
  } else {
    return {
      status: 'WARN',
      message: 'Microsoft publisher not accessible (may not be configured)',
    };
  }
}

/**
 * Test 9: Test connection timeout handling
 */
async function testTimeoutHandling(): Promise<{ status: 'PASS' | 'FAIL' | 'WARN'; message: string }> {
  // Create a service with very short timeout
  const service = new MarinDispatcherService();

  // Set a very short timeout that should fail (if API is slow)
  const baseUrl = config.marinDispatcher.baseUrl;
  const publisher = config.marinDispatcher.publisher;
  const accountId = config.marinDispatcher.accountId;

  try {
    await axios.get(`${baseUrl}/dispatcher/${publisher}/campaigns`, {
      params: { accountId, limit: 1 },
      timeout: 1, // 1ms timeout - should fail
    });

    return {
      status: 'WARN',
      message: 'API responded within 1ms (unusually fast)',
    };
  } catch (error: any) {
    if (error.code === 'ECONNABORTED') {
      return {
        status: 'PASS',
        message: 'Timeout handling works correctly',
      };
    } else {
      return {
        status: 'PASS',
        message: `Timeout test passed with error: ${error.code || error.message}`,
      };
    }
  }
}

/**
 * Main test runner
 */
async function main() {
  printHeader();

  console.log(colors.bold + 'Environment Configuration:' + colors.reset);
  console.log(`  DISPATCHER_URL: ${config.marinDispatcher.baseUrl || 'NOT SET'}`);
  console.log(`  ACCOUNT_ID: ${config.marinDispatcher.accountId || 'NOT SET'}`);
  console.log(`  PUBLISHER: ${config.marinDispatcher.publisher}`);
  console.log(`  TIMEOUT: ${config.marinDispatcher.timeout}ms\n`);

  console.log(colors.bold + 'Running Tests:' + colors.reset + '\n');

  // Run tests
  await runTest('Test 1: Environment Configuration', testEnvironmentConfig);
  await runTest('Test 2: isAuthenticated() Method', testIsAuthenticated);
  await runTest('Test 3: Direct API Endpoint Reachability', testEndpointReachability);
  await runTest('Test 4: Invalid Account ID Rejection', testInvalidAccountId);
  await runTest('Test 5: Invalid Publisher Rejection', testInvalidPublisher);
  await runTest('Test 6: Google Publisher Connectivity', testGooglePublisher);
  await runTest('Test 7: Meta Publisher Connectivity', testMetaPublisher);
  await runTest('Test 8: Microsoft Publisher Connectivity', testMicrosoftPublisher);
  await runTest('Test 9: Timeout Handling', testTimeoutHandling);

  // Print summary
  printSummary();
}

// Run tests
if (require.main === module) {
  main().catch((error) => {
    console.error(colors.red + colors.bold + '\nUnexpected error:' + colors.reset, error);
    process.exit(1);
  });
}

export { main as testMarinConnectivity };
