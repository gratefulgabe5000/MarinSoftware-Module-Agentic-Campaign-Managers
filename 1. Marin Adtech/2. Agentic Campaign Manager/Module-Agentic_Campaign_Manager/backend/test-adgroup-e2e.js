/**
 * Ad Group End-to-End Tests
 * 
 * Tests complete Ad Group operations with actual Marin Dispatcher API:
 * - Create Ad Group
 * - Update Ad Group
 * - Error Handling
 * - Validation
 * 
 * InfraDocs Reference: MARIN-DISPATCHER-API-REFERENCE.md sections 2.1-2.2
 */

const path = require('path');

// Load compiled services
const dispatcherServicePath = path.join(__dirname, 'dist/services/marinDispatcherService.js');
const { MarinDispatcherService } = require(dispatcherServicePath);

let testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
  details: []
};

// Store IDs for cleanup
let createdCampaignIds = [];
let createdAdGroupIds = [];

function logTest(testName, passed, message = '', skipped = false) {
  testResults.total++;
  if (skipped) {
    testResults.skipped++;
    console.log(`⏸️  Test ${testResults.total}: ${testName} - SKIPPED`);
    if (message) console.log(`   ${message}`);
  } else if (passed) {
    testResults.passed++;
    console.log(`✅ Test ${testResults.total}: ${testName} - PASS`);
    if (message) console.log(`   ${message}`);
  } else {
    testResults.failed++;
    console.log(`❌ Test ${testResults.total}: ${testName} - FAIL`);
    if (message) console.log(`   ${message}`);
  }
  testResults.details.push({
    test: testName,
    passed,
    skipped,
    message
  });
}

// Create test campaign plan
function createTestCampaignPlan(budget = 100) {
  return {
    objective: 'Drive website traffic',
    targetAudience: {
      demographics: {
        age: '25-45',
        location: 'United States'
      },
      interests: ['technology', 'business']
    },
    budget: {
      total: budget,
      daily: budget / 30,
      currency: 'USD'
    },
    timeline: {
      startDate: new Date().toISOString(),
      duration: 30
    },
    platforms: ['google'],
    kpis: {
      primary: 'clicks',
      secondary: ['impressions', 'conversions']
    }
  };
}

async function runTests() {
  console.log('=== Ad Group End-to-End Tests ===\n');
  console.log('Testing Ad Group operations with actual Marin Dispatcher API...\n');
  console.log('⚠️  WARNING: This will create real campaigns and ad groups in the Marin system!\n');

  const dispatcherService = new MarinDispatcherService();

  // ==========================================
  // TEST SUITE 1: Prerequisites - Create Campaign
  // ==========================================
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('TEST SUITE 1: Prerequisites - Create Campaign');
  console.log('═══════════════════════════════════════════════════════════════\n');

  let testCampaignId = null;

  console.log('--- Creating test campaign ---');
  try {
    const campaignPlan = createTestCampaignPlan(100);
    const campaignName = `E2E Test Campaign ${Date.now()}`;
    
    const result = await dispatcherService.createCampaign(campaignPlan, campaignName);

    if (result && result.success && result.campaignId) {
      testCampaignId = result.campaignId;
      createdCampaignIds.push(testCampaignId);
      
      logTest(
        'Prerequisite - Create Campaign',
        true,
        `✅ Campaign created! ID: ${testCampaignId}`
      );
    } else {
      logTest(
        'Prerequisite - Create Campaign',
        false,
        `❌ Campaign creation failed: ${result?.error || 'Unknown error'}`
      );
      console.log('\n⚠️  Cannot proceed with Ad Group tests without a campaign.\n');
      return testResults;
    }
  } catch (error) {
    logTest(
      'Prerequisite - Create Campaign',
      false,
      `❌ Error: ${error.message}`
    );
    console.log('\n⚠️  Cannot proceed with Ad Group tests without a campaign.\n');
    return testResults;
  }

  // ==========================================
  // TEST SUITE 2: Create Ad Group
  // ==========================================
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('TEST SUITE 2: Create Ad Group');
  console.log('═══════════════════════════════════════════════════════════════\n');

  let testAdGroupId = null;

  // Test 2.1: Create Ad Group with minimal data
  console.log('--- Test 2.1: Create Ad Group (Minimal) ---');
  try {
    const adGroupData = {
      name: `E2E Test Ad Group ${Date.now()}`,
      status: 'ENABLED'
    };

    const startTime = Date.now();
    const result = await dispatcherService.createAdGroup(testCampaignId, adGroupData);
    const responseTime = Date.now() - startTime;

    if (result && result.success && result.adGroupId) {
      testAdGroupId = result.adGroupId;
      createdAdGroupIds.push(testAdGroupId);

      logTest(
        'Create Ad Group - Minimal Data',
        true,
        `✅ Ad Group created! ID: ${testAdGroupId}, Response time: ${responseTime}ms`
      );

      // Verify response structure
      if (result.details) {
        logTest(
          'Create Ad Group - Response Structure',
          true,
          '✅ Response includes details object'
        );
      }
    } else {
      logTest(
        'Create Ad Group - Minimal Data',
        false,
        `❌ Ad Group creation failed: ${result?.error || 'Unknown error'}`
      );
    }
  } catch (error) {
    logTest(
      'Create Ad Group - Minimal Data',
      false,
      `❌ Error: ${error.message}`
    );
  }

  // Test 2.2: Create Ad Group with CPC bid
  console.log('\n--- Test 2.2: Create Ad Group (With CPC Bid) ---');
  try {
    const adGroupData = {
      name: `E2E Test Ad Group CPC ${Date.now()}`,
      status: 'ENABLED',
      cpcBid: 2.50
    };

    const result = await dispatcherService.createAdGroup(testCampaignId, adGroupData);

    if (result && result.success && result.adGroupId) {
      createdAdGroupIds.push(result.adGroupId);

      logTest(
        'Create Ad Group - With CPC Bid',
        true,
        `✅ Ad Group created with CPC bid! ID: ${result.adGroupId}`
      );

      // Verify CPC bid in response
      if (result.details && result.details.cpcBid === 2.50) {
        logTest(
          'Create Ad Group - CPC Bid Verification',
          true,
          `✅ CPC bid correctly set: ${result.details.cpcBid}`
        );
      }
    } else {
      logTest(
        'Create Ad Group - With CPC Bid',
        false,
        `❌ Ad Group creation failed: ${result?.error || 'Unknown error'}`
      );
    }
  } catch (error) {
    logTest(
      'Create Ad Group - With CPC Bid',
      false,
      `❌ Error: ${error.message}`
    );
  }

  // Test 2.3: Create Ad Group with CPM bid
  console.log('\n--- Test 2.3: Create Ad Group (With CPM Bid) ---');
  try {
    const adGroupData = {
      name: `E2E Test Ad Group CPM ${Date.now()}`,
      status: 'ENABLED',
      cpmBid: 5.00
    };

    const result = await dispatcherService.createAdGroup(testCampaignId, adGroupData);

    if (result && result.success && result.adGroupId) {
      createdAdGroupIds.push(result.adGroupId);

      logTest(
        'Create Ad Group - With CPM Bid',
        true,
        `✅ Ad Group created with CPM bid! ID: ${result.adGroupId}`
      );
    } else {
      logTest(
        'Create Ad Group - With CPM Bid',
        false,
        `❌ Ad Group creation failed: ${result?.error || 'Unknown error'}`
      );
    }
  } catch (error) {
    logTest(
      'Create Ad Group - With CPM Bid',
      false,
      `❌ Error: ${error.message}`
    );
  }

  // ==========================================
  // TEST SUITE 3: Update Ad Group
  // ==========================================
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('TEST SUITE 3: Update Ad Group');
  console.log('═══════════════════════════════════════════════════════════════\n');

  if (!testAdGroupId) {
    logTest(
      'Update Ad Group - Prerequisite',
      false,
      '⏸️  Skipped: No ad group ID available for update tests'
    );
  } else {
    // Test 3.1: Update Ad Group name
    console.log('--- Test 3.1: Update Ad Group Name ---');
    try {
      const updates = {
        name: `Updated Ad Group Name ${Date.now()}`
      };

      const result = await dispatcherService.updateAdGroup(testAdGroupId, updates);

      if (result && result.success) {
        logTest(
          'Update Ad Group - Name',
          true,
          `✅ Ad Group name updated! ID: ${result.adGroupId}`
        );

        // Verify name in response
        if (result.details && result.details.name === updates.name) {
          logTest(
            'Update Ad Group - Name Verification',
            true,
            `✅ Name correctly updated: ${result.details.name}`
          );
        }
      } else {
        logTest(
          'Update Ad Group - Name',
          false,
          `❌ Ad Group update failed: ${result?.error || 'Unknown error'}`
        );
      }
    } catch (error) {
      logTest(
        'Update Ad Group - Name',
        false,
        `❌ Error: ${error.message}`
      );
    }

    // Test 3.2: Update Ad Group status to PAUSED
    console.log('\n--- Test 3.2: Update Ad Group Status (PAUSED) ---');
    try {
      const updates = {
        status: 'PAUSED'
      };

      const result = await dispatcherService.updateAdGroup(testAdGroupId, updates);

      if (result && result.success) {
        logTest(
          'Update Ad Group - Status (PAUSED)',
          true,
          `✅ Ad Group status updated to PAUSED! ID: ${result.adGroupId}`
        );

        // Verify status in response
        if (result.details && result.details.adGroupStatus === 'PAUSED') {
          logTest(
            'Update Ad Group - Status Verification',
            true,
            `✅ Status correctly updated: ${result.details.adGroupStatus}`
          );
        }
      } else {
        logTest(
          'Update Ad Group - Status (PAUSED)',
          false,
          `❌ Ad Group update failed: ${result?.error || 'Unknown error'}`
        );
      }
    } catch (error) {
      logTest(
        'Update Ad Group - Status (PAUSED)',
        false,
        `❌ Error: ${error.message}`
      );
    }

    // Test 3.3: Update Ad Group CPC bid
    console.log('\n--- Test 3.3: Update Ad Group CPC Bid ---');
    try {
      const updates = {
        cpcBid: 3.00
      };

      const result = await dispatcherService.updateAdGroup(testAdGroupId, updates);

      if (result && result.success) {
        logTest(
          'Update Ad Group - CPC Bid',
          true,
          `✅ Ad Group CPC bid updated! ID: ${result.adGroupId}`
        );
      } else {
        logTest(
          'Update Ad Group - CPC Bid',
          false,
          `❌ Ad Group update failed: ${result?.error || 'Unknown error'}`
        );
      }
    } catch (error) {
      logTest(
        'Update Ad Group - CPC Bid',
        false,
        `❌ Error: ${error.message}`
      );
    }

    // Test 3.4: Update Ad Group status back to ENABLED
    console.log('\n--- Test 3.4: Update Ad Group Status (ENABLED) ---');
    try {
      const updates = {
        status: 'ENABLED'
      };

      const result = await dispatcherService.updateAdGroup(testAdGroupId, updates);

      if (result && result.success) {
        logTest(
          'Update Ad Group - Status (ENABLED)',
          true,
          `✅ Ad Group status updated to ENABLED! ID: ${result.adGroupId}`
        );
      } else {
        logTest(
          'Update Ad Group - Status (ENABLED)',
          false,
          `❌ Ad Group update failed: ${result?.error || 'Unknown error'}`
        );
      }
    } catch (error) {
      logTest(
        'Update Ad Group - Status (ENABLED)',
        false,
        `❌ Error: ${error.message}`
      );
    }
  }

  // ==========================================
  // TEST SUITE 4: Error Handling
  // ==========================================
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('TEST SUITE 4: Error Handling');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Test 4.1: Create Ad Group with invalid campaign ID
  console.log('--- Test 4.1: Create Ad Group (Invalid Campaign ID) ---');
  try {
    const adGroupData = {
      name: 'Test Ad Group',
      status: 'ENABLED'
    };

    const result = await dispatcherService.createAdGroup('invalid-campaign-id-12345', adGroupData);

    if (result && !result.success && result.error) {
      logTest(
        'Error Handling - Invalid Campaign ID',
        true,
        `✅ Correctly handled invalid campaign ID: ${result.error}`
      );
    } else {
      logTest(
        'Error Handling - Invalid Campaign ID',
        false,
        '❌ Should have returned error for invalid campaign ID'
      );
    }
  } catch (error) {
    logTest(
      'Error Handling - Invalid Campaign ID',
      true,
      `✅ Error thrown for invalid campaign ID: ${error.message}`
    );
  }

  // Test 4.2: Update Ad Group with invalid ID
  console.log('\n--- Test 4.2: Update Ad Group (Invalid ID) ---');
  try {
    const updates = {
      name: 'Updated Name'
    };

    const result = await dispatcherService.updateAdGroup('invalid-adgroup-id-12345', updates);

    if (result && !result.success && result.error) {
      logTest(
        'Error Handling - Invalid Ad Group ID',
        true,
        `✅ Correctly handled invalid ad group ID: ${result.error}`
      );
    } else {
      logTest(
        'Error Handling - Invalid Ad Group ID',
        false,
        '❌ Should have returned error for invalid ad group ID'
      );
    }
  } catch (error) {
    logTest(
      'Error Handling - Invalid Ad Group ID',
      true,
      `✅ Error thrown for invalid ad group ID: ${error.message}`
    );
  }

  // ==========================================
  // Summary
  // ==========================================
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('TEST SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════\n');
  console.log(`Total Tests: ${testResults.total}`);
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`⏸️  Skipped: ${testResults.skipped}`);
  console.log(`\nPass Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%\n`);

  if (testResults.failed > 0) {
    console.log('Failed Tests:');
    testResults.details
      .filter(t => !t.passed && !t.skipped)
      .forEach(t => console.log(`  - ${t.test}: ${t.message}`));
  }

  console.log(`\n📝 Created Resources:`);
  console.log(`   Campaigns: ${createdCampaignIds.length}`);
  console.log(`   Ad Groups: ${createdAdGroupIds.length}`);
  console.log(`\n⚠️  Note: These resources remain in the Marin system and may need manual cleanup.\n`);

  return testResults;
}

// Run tests if executed directly
if (require.main === module) {
  runTests()
    .then(results => {
      process.exit(results.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { runTests };

