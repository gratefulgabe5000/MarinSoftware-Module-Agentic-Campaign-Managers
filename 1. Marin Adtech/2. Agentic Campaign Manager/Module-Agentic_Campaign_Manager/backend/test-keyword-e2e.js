/**
 * Keyword End-to-End Tests
 * 
 * Tests complete Keyword operations with actual Marin Dispatcher API:
 * - Create Keywords (Bulk)
 * - Update Keyword
 * - Error Handling
 * - Validation (match types, text length)
 * 
 * InfraDocs Reference: MARIN-DISPATCHER-API-REFERENCE.md sections 4.1-4.2
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
let createdKeywordIds = [];

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
  console.log('=== Keyword End-to-End Tests ===\n');
  console.log('Testing Keyword operations with actual Marin Dispatcher API...\n');
  console.log('⚠️  WARNING: This will create real campaigns, ad groups, and keywords in the Marin system!\n');

  const dispatcherService = new MarinDispatcherService();

  // ==========================================
  // TEST SUITE 1: Prerequisites - Create Campaign and Ad Group
  // ==========================================
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('TEST SUITE 1: Prerequisites - Create Campaign and Ad Group');
  console.log('═══════════════════════════════════════════════════════════════\n');

  let testCampaignId = null;
  let testAdGroupId = null;

  // Create campaign
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
      console.log('\n⚠️  Cannot proceed with Keyword tests without a campaign.\n');
      return testResults;
    }
  } catch (error) {
    logTest(
      'Prerequisite - Create Campaign',
      false,
      `❌ Error: ${error.message}`
    );
    console.log('\n⚠️  Cannot proceed with Keyword tests without a campaign.\n');
    return testResults;
  }

  // Create ad group
  console.log('\n--- Creating test ad group ---');
  try {
    const adGroupData = {
      name: `E2E Test Ad Group ${Date.now()}`,
      status: 'ENABLED'
    };

    const result = await dispatcherService.createAdGroup(testCampaignId, adGroupData);

    if (result && result.success && result.adGroupId) {
      testAdGroupId = result.adGroupId;
      createdAdGroupIds.push(testAdGroupId);
      
      logTest(
        'Prerequisite - Create Ad Group',
        true,
        `✅ Ad Group created! ID: ${testAdGroupId}`
      );
    } else {
      logTest(
        'Prerequisite - Create Ad Group',
        false,
        `❌ Ad Group creation failed: ${result?.error || 'Unknown error'}`
      );
      console.log('\n⚠️  Cannot proceed with Keyword tests without an ad group.\n');
      return testResults;
    }
  } catch (error) {
    logTest(
      'Prerequisite - Create Ad Group',
      false,
      `❌ Error: ${error.message}`
    );
    console.log('\n⚠️  Cannot proceed with Keyword tests without an ad group.\n');
    return testResults;
  }

  // ==========================================
  // TEST SUITE 2: Create Keywords (Bulk)
  // ==========================================
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('TEST SUITE 2: Create Keywords (Bulk)');
  console.log('═══════════════════════════════════════════════════════════════\n');

  let testKeywordIds = [];

  // Test 2.1: Create single keyword
  console.log('--- Test 2.1: Create Single Keyword ---');
  try {
    const keywords = [
      {
        text: 'running shoes',
        matchType: 'BROAD',
        cpcBid: 1.50,
        status: 'ENABLED'
      }
    ];

    const startTime = Date.now();
    const result = await dispatcherService.createKeywords(testAdGroupId, keywords);
    const responseTime = Date.now() - startTime;

    if (result && result.success && result.keywords && result.keywords.length > 0) {
      const keywordId = result.keywords[0].id;
      testKeywordIds.push(keywordId);
      createdKeywordIds.push(keywordId);

      logTest(
        'Create Keywords - Single',
        true,
        `✅ Keyword created! ID: ${keywordId}, Response time: ${responseTime}ms`
      );

      // Verify response structure
      if (result.keywords[0].text === 'running shoes') {
        logTest(
          'Create Keywords - Response Structure',
          true,
          '✅ Response includes correct keyword text'
        );
      }
    } else {
      logTest(
        'Create Keywords - Single',
        false,
        `❌ Keyword creation failed: ${result?.error || 'Unknown error'}`
      );
    }
  } catch (error) {
    logTest(
      'Create Keywords - Single',
      false,
      `❌ Error: ${error.message}`
    );
  }

  // Test 2.2: Create multiple keywords (bulk)
  console.log('\n--- Test 2.2: Create Multiple Keywords (Bulk) ---');
  try {
    const keywords = [
      {
        text: 'athletic footwear',
        matchType: 'PHRASE',
        cpcBid: 2.00,
        status: 'ENABLED'
      },
      {
        text: 'sports shoes',
        matchType: 'EXACT',
        cpcBid: 2.50,
        status: 'ENABLED'
      },
      {
        text: 'sneakers',
        matchType: 'BROAD',
        cpcBid: 1.00,
        status: 'ENABLED'
      }
    ];

    const result = await dispatcherService.createKeywords(testAdGroupId, keywords);

    if (result && result.success && result.keywords && result.keywords.length === 3) {
      result.keywords.forEach(kw => {
        testKeywordIds.push(kw.id);
        createdKeywordIds.push(kw.id);
      });

      logTest(
        'Create Keywords - Multiple',
        true,
        `✅ ${result.keywords.length} keywords created!`
      );

      // Verify match types
      const matchTypes = result.keywords.map(kw => kw.matchType);
      if (matchTypes.includes('BROAD') && matchTypes.includes('PHRASE') && matchTypes.includes('EXACT')) {
        logTest(
          'Create Keywords - Match Types',
          true,
          '✅ All match types (BROAD, PHRASE, EXACT) supported'
        );
      }
    } else {
      logTest(
        'Create Keywords - Multiple',
        false,
        `❌ Keyword creation failed: ${result?.error || 'Unknown error'}`
      );
    }
  } catch (error) {
    logTest(
      'Create Keywords - Multiple',
      false,
      `❌ Error: ${error.message}`
    );
  }

  // Test 2.3: Create keywords with different bids
  console.log('\n--- Test 2.3: Create Keywords (Different Bids) ---');
  try {
    const keywords = [
      {
        text: 'low bid keyword',
        matchType: 'BROAD',
        cpcBid: 0.50,
        status: 'ENABLED'
      },
      {
        text: 'high bid keyword',
        matchType: 'EXACT',
        cpcBid: 5.00,
        status: 'ENABLED'
      }
    ];

    const result = await dispatcherService.createKeywords(testAdGroupId, keywords);

    if (result && result.success && result.keywords && result.keywords.length === 2) {
      result.keywords.forEach(kw => {
        testKeywordIds.push(kw.id);
        createdKeywordIds.push(kw.id);
      });

      logTest(
        'Create Keywords - Different Bids',
        true,
        `✅ Keywords created with different bids!`
      );

      // Verify bids
      const bids = result.keywords.map(kw => kw.cpcBid);
      if (bids.includes(0.50) && bids.includes(5.00)) {
        logTest(
          'Create Keywords - Bid Verification',
          true,
          '✅ Bids correctly set'
        );
      }
    } else {
      logTest(
        'Create Keywords - Different Bids',
        false,
        `❌ Keyword creation failed: ${result?.error || 'Unknown error'}`
      );
    }
  } catch (error) {
    logTest(
      'Create Keywords - Different Bids',
      false,
      `❌ Error: ${error.message}`
    );
  }

  // ==========================================
  // TEST SUITE 3: Update Keyword
  // ==========================================
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('TEST SUITE 3: Update Keyword');
  console.log('═══════════════════════════════════════════════════════════════\n');

  if (testKeywordIds.length === 0) {
    logTest(
      'Update Keyword - Prerequisite',
      false,
      '⏸️  Skipped: No keyword IDs available for update tests'
    );
  } else {
    const testKeywordId = testKeywordIds[0];

    // Test 3.1: Update keyword text
    console.log('--- Test 3.1: Update Keyword Text ---');
    try {
      const updates = {
        text: `updated keyword text ${Date.now()}`
      };

      const result = await dispatcherService.updateKeywords(testKeywordId, updates);

      if (result && result.success) {
        logTest(
          'Update Keyword - Text',
          true,
          `✅ Keyword text updated! ID: ${result.keywordId}`
        );

        // Verify text in response
        if (result.details && result.details.text === updates.text) {
          logTest(
            'Update Keyword - Text Verification',
            true,
            `✅ Text correctly updated: ${result.details.text}`
          );
        }
      } else {
        logTest(
          'Update Keyword - Text',
          false,
          `❌ Keyword update failed: ${result?.error || 'Unknown error'}`
        );
      }
    } catch (error) {
      logTest(
        'Update Keyword - Text',
        false,
        `❌ Error: ${error.message}`
      );
    }

    // Test 3.2: Update keyword match type
    console.log('\n--- Test 3.2: Update Keyword Match Type ---');
    try {
      const updates = {
        matchType: 'EXACT'
      };

      const result = await dispatcherService.updateKeywords(testKeywordId, updates);

      if (result && result.success) {
        logTest(
          'Update Keyword - Match Type',
          true,
          `✅ Keyword match type updated! ID: ${result.keywordId}`
        );

        // Verify match type in response
        if (result.details && result.details.matchType === 'EXACT') {
          logTest(
            'Update Keyword - Match Type Verification',
            true,
            `✅ Match type correctly updated: ${result.details.matchType}`
          );
        }
      } else {
        logTest(
          'Update Keyword - Match Type',
          false,
          `❌ Keyword update failed: ${result?.error || 'Unknown error'}`
        );
      }
    } catch (error) {
      logTest(
        'Update Keyword - Match Type',
        false,
        `❌ Error: ${error.message}`
      );
    }

    // Test 3.3: Update keyword CPC bid
    console.log('\n--- Test 3.3: Update Keyword CPC Bid ---');
    try {
      const updates = {
        cpcBid: 3.00
      };

      const result = await dispatcherService.updateKeywords(testKeywordId, updates);

      if (result && result.success) {
        logTest(
          'Update Keyword - CPC Bid',
          true,
          `✅ Keyword CPC bid updated! ID: ${result.keywordId}`
        );
      } else {
        logTest(
          'Update Keyword - CPC Bid',
          false,
          `❌ Keyword update failed: ${result?.error || 'Unknown error'}`
        );
      }
    } catch (error) {
      logTest(
        'Update Keyword - CPC Bid',
        false,
        `❌ Error: ${error.message}`
      );
    }

    // Test 3.4: Update keyword status to PAUSED
    console.log('\n--- Test 3.4: Update Keyword Status (PAUSED) ---');
    try {
      const updates = {
        status: 'PAUSED'
      };

      const result = await dispatcherService.updateKeywords(testKeywordId, updates);

      if (result && result.success) {
        logTest(
          'Update Keyword - Status (PAUSED)',
          true,
          `✅ Keyword status updated to PAUSED! ID: ${result.keywordId}`
        );

        // Verify status in response
        if (result.details && result.details.keywordStatus === 'PAUSED') {
          logTest(
            'Update Keyword - Status Verification',
            true,
            `✅ Status correctly updated: ${result.details.keywordStatus}`
          );
        }
      } else {
        logTest(
          'Update Keyword - Status (PAUSED)',
          false,
          `❌ Keyword update failed: ${result?.error || 'Unknown error'}`
        );
      }
    } catch (error) {
      logTest(
        'Update Keyword - Status (PAUSED)',
        false,
        `❌ Error: ${error.message}`
      );
    }

    // Test 3.5: Update keyword status back to ENABLED
    console.log('\n--- Test 3.5: Update Keyword Status (ENABLED) ---');
    try {
      const updates = {
        status: 'ENABLED'
      };

      const result = await dispatcherService.updateKeywords(testKeywordId, updates);

      if (result && result.success) {
        logTest(
          'Update Keyword - Status (ENABLED)',
          true,
          `✅ Keyword status updated to ENABLED! ID: ${result.keywordId}`
        );
      } else {
        logTest(
          'Update Keyword - Status (ENABLED)',
          false,
          `❌ Keyword update failed: ${result?.error || 'Unknown error'}`
        );
      }
    } catch (error) {
      logTest(
        'Update Keyword - Status (ENABLED)',
        false,
        `❌ Error: ${error.message}`
      );
    }
  }

  // ==========================================
  // TEST SUITE 4: Validation Tests
  // ==========================================
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('TEST SUITE 4: Validation Tests');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Test 4.1: Create keyword with invalid match type (should fail validation)
  console.log('--- Test 4.1: Create Keyword (Invalid Match Type) ---');
  try {
    const keywords = [
      {
        text: 'test keyword',
        matchType: 'INVALID_TYPE', // Invalid match type
        cpcBid: 1.0,
        status: 'ENABLED'
      }
    ];

    const result = await dispatcherService.createKeywords(testAdGroupId, keywords);

    if (result && !result.success && result.error) {
      logTest(
        'Validation - Invalid Match Type',
        true,
        `✅ Correctly rejected keyword with invalid match type: ${result.error}`
      );
    } else {
      logTest(
        'Validation - Invalid Match Type',
        false,
        '❌ Should have rejected keyword with invalid match type'
      );
    }
  } catch (error) {
    logTest(
      'Validation - Invalid Match Type',
      true,
      `✅ Error thrown for invalid match type: ${error.message}`
    );
  }

  // Test 4.2: Create keyword with text too long (should fail validation)
  console.log('\n--- Test 4.2: Create Keyword (Text Too Long) ---');
  try {
    const keywords = [
      {
        text: 'a'.repeat(81), // Max 80 characters
        matchType: 'BROAD',
        cpcBid: 1.0,
        status: 'ENABLED'
      }
    ];

    const result = await dispatcherService.createKeywords(testAdGroupId, keywords);

    if (result && !result.success && result.error) {
      logTest(
        'Validation - Text Too Long',
        true,
        `✅ Correctly rejected keyword with text too long: ${result.error}`
      );
    } else {
      logTest(
        'Validation - Text Too Long',
        false,
        '❌ Should have rejected keyword with text too long'
      );
    }
  } catch (error) {
    logTest(
      'Validation - Text Too Long',
      true,
      `✅ Error thrown for text too long: ${error.message}`
    );
  }

  // ==========================================
  // TEST SUITE 5: Error Handling
  // ==========================================
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('TEST SUITE 5: Error Handling');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Test 5.1: Create keywords with invalid ad group ID
  console.log('--- Test 5.1: Create Keywords (Invalid Ad Group ID) ---');
  try {
    const keywords = [
      {
        text: 'test keyword',
        matchType: 'BROAD',
        cpcBid: 1.0,
        status: 'ENABLED'
      }
    ];

    const result = await dispatcherService.createKeywords('invalid-adgroup-id-12345', keywords);

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

  // Test 5.2: Update keyword with invalid ID
  console.log('\n--- Test 5.2: Update Keyword (Invalid ID) ---');
  try {
    const updates = {
      text: 'updated text'
    };

    const result = await dispatcherService.updateKeywords('invalid-keyword-id-12345', updates);

    if (result && !result.success && result.error) {
      logTest(
        'Error Handling - Invalid Keyword ID',
        true,
        `✅ Correctly handled invalid keyword ID: ${result.error}`
      );
    } else {
      logTest(
        'Error Handling - Invalid Keyword ID',
        false,
        '❌ Should have returned error for invalid keyword ID'
      );
    }
  } catch (error) {
    logTest(
      'Error Handling - Invalid Keyword ID',
      true,
      `✅ Error thrown for invalid keyword ID: ${error.message}`
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
  console.log(`   Keywords: ${createdKeywordIds.length}`);
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

