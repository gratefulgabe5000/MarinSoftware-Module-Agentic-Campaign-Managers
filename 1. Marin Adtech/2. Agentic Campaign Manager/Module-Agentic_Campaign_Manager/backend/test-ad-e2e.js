/**
 * Ad End-to-End Tests
 * 
 * Tests complete Ad operations with actual Marin Dispatcher API:
 * - Create Ad (Responsive Search Ad)
 * - Update Ad
 * - Error Handling
 * - Validation (headlines, descriptions, URLs)
 * 
 * InfraDocs Reference: MARIN-DISPATCHER-API-REFERENCE.md sections 3.1-3.2
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
let createdAdIds = [];

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
  console.log('=== Ad End-to-End Tests ===\n');
  console.log('Testing Ad operations with actual Marin Dispatcher API...\n');
  console.log('⚠️  WARNING: This will create real campaigns, ad groups, and ads in the Marin system!\n');

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
      console.log('\n⚠️  Cannot proceed with Ad tests without a campaign.\n');
      return testResults;
    }
  } catch (error) {
    logTest(
      'Prerequisite - Create Campaign',
      false,
      `❌ Error: ${error.message}`
    );
    console.log('\n⚠️  Cannot proceed with Ad tests without a campaign.\n');
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
      console.log('\n⚠️  Cannot proceed with Ad tests without an ad group.\n');
      return testResults;
    }
  } catch (error) {
    logTest(
      'Prerequisite - Create Ad Group',
      false,
      `❌ Error: ${error.message}`
    );
    console.log('\n⚠️  Cannot proceed with Ad tests without an ad group.\n');
    return testResults;
  }

  // ==========================================
  // TEST SUITE 2: Create Ad
  // ==========================================
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('TEST SUITE 2: Create Ad');
  console.log('═══════════════════════════════════════════════════════════════\n');

  let testAdId = null;

  // Test 2.1: Create Responsive Search Ad (minimal)
  console.log('--- Test 2.1: Create Responsive Search Ad (Minimal) ---');
  try {
    const adData = {
      type: 'RESPONSIVE_SEARCH_AD',
      headlines: [
        { text: 'Headline 1', pinned: false },
        { text: 'Headline 2', pinned: false },
        { text: 'Headline 3', pinned: false }
      ],
      descriptions: [
        { text: 'Description 1' },
        { text: 'Description 2' }
      ],
      finalUrl: 'https://example.com'
    };

    const startTime = Date.now();
    const result = await dispatcherService.createAd(testAdGroupId, adData);
    const responseTime = Date.now() - startTime;

    if (result && result.success && result.adId) {
      testAdId = result.adId;
      createdAdIds.push(testAdId);

      logTest(
        'Create Ad - Minimal',
        true,
        `✅ Ad created! ID: ${testAdId}, Response time: ${responseTime}ms`
      );

      // Verify response structure
      if (result.details) {
        logTest(
          'Create Ad - Response Structure',
          true,
          '✅ Response includes details object'
        );
      }
    } else {
      logTest(
        'Create Ad - Minimal',
        false,
        `❌ Ad creation failed: ${result?.error || 'Unknown error'}`
      );
    }
  } catch (error) {
    logTest(
      'Create Ad - Minimal',
      false,
      `❌ Error: ${error.message}`
    );
  }

  // Test 2.2: Create Responsive Search Ad (with pinned headline)
  console.log('\n--- Test 2.2: Create Ad (With Pinned Headline) ---');
  try {
    const adData = {
      type: 'RESPONSIVE_SEARCH_AD',
      headlines: [
        { text: 'Pinned Headline', pinned: true }, // Pinned to position 1
        { text: 'Headline 2', pinned: false },
        { text: 'Headline 3', pinned: false }
      ],
      descriptions: [
        { text: 'Description 1' },
        { text: 'Description 2' }
      ],
      finalUrl: 'https://example.com/product'
    };

    const result = await dispatcherService.createAd(testAdGroupId, adData);

    if (result && result.success && result.adId) {
      createdAdIds.push(result.adId);

      logTest(
        'Create Ad - With Pinned Headline',
        true,
        `✅ Ad created with pinned headline! ID: ${result.adId}`
      );
    } else {
      logTest(
        'Create Ad - With Pinned Headline',
        false,
        `❌ Ad creation failed: ${result?.error || 'Unknown error'}`
      );
    }
  } catch (error) {
    logTest(
      'Create Ad - With Pinned Headline',
      false,
      `❌ Error: ${error.message}`
    );
  }

  // Test 2.3: Create Ad with display URL and paths
  console.log('\n--- Test 2.3: Create Ad (With Display URL and Paths) ---');
  try {
    const adData = {
      type: 'RESPONSIVE_SEARCH_AD',
      headlines: [
        { text: 'Headline 1', pinned: false },
        { text: 'Headline 2', pinned: false },
        { text: 'Headline 3', pinned: false }
      ],
      descriptions: [
        { text: 'Description 1' },
        { text: 'Description 2' }
      ],
      finalUrl: 'https://example.com/product',
      displayUrl: 'example.com',
      paths: ['product', 'sale']
    };

    const result = await dispatcherService.createAd(testAdGroupId, adData);

    if (result && result.success && result.adId) {
      createdAdIds.push(result.adId);

      logTest(
        'Create Ad - With Display URL and Paths',
        true,
        `✅ Ad created with display URL and paths! ID: ${result.adId}`
      );
    } else {
      logTest(
        'Create Ad - With Display URL and Paths',
        false,
        `❌ Ad creation failed: ${result?.error || 'Unknown error'}`
      );
    }
  } catch (error) {
    logTest(
      'Create Ad - With Display URL and Paths',
      false,
      `❌ Error: ${error.message}`
    );
  }

  // ==========================================
  // TEST SUITE 3: Update Ad
  // ==========================================
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('TEST SUITE 3: Update Ad');
  console.log('═══════════════════════════════════════════════════════════════\n');

  if (!testAdId) {
    logTest(
      'Update Ad - Prerequisite',
      false,
      '⏸️  Skipped: No ad ID available for update tests'
    );
  } else {
    // Test 3.1: Update Ad headlines
    console.log('--- Test 3.1: Update Ad Headlines ---');
    try {
      const updates = {
        headlines: [
          { text: 'Updated Headline 1', pinned: false },
          { text: 'Updated Headline 2', pinned: false },
          { text: 'Updated Headline 3', pinned: false }
        ]
      };

      const result = await dispatcherService.updateAd(testAdId, updates);

      if (result && result.success) {
        logTest(
          'Update Ad - Headlines',
          true,
          `✅ Ad headlines updated! ID: ${result.adId}`
        );

        // Verify headlines in response
        if (result.details && result.details.headlines) {
          logTest(
            'Update Ad - Headlines Verification',
            true,
            `✅ Headlines correctly updated: ${result.details.headlines.length} headlines`
          );
        }
      } else {
        logTest(
          'Update Ad - Headlines',
          false,
          `❌ Ad update failed: ${result?.error || 'Unknown error'}`
        );
      }
    } catch (error) {
      logTest(
        'Update Ad - Headlines',
        false,
        `❌ Error: ${error.message}`
      );
    }

    // Test 3.2: Update Ad descriptions
    console.log('\n--- Test 3.2: Update Ad Descriptions ---');
    try {
      const updates = {
        descriptions: [
          { text: 'Updated Description 1' },
          { text: 'Updated Description 2' }
        ]
      };

      const result = await dispatcherService.updateAd(testAdId, updates);

      if (result && result.success) {
        logTest(
          'Update Ad - Descriptions',
          true,
          `✅ Ad descriptions updated! ID: ${result.adId}`
        );
      } else {
        logTest(
          'Update Ad - Descriptions',
          false,
          `❌ Ad update failed: ${result?.error || 'Unknown error'}`
        );
      }
    } catch (error) {
      logTest(
        'Update Ad - Descriptions',
        false,
        `❌ Error: ${error.message}`
      );
    }

    // Test 3.3: Update Ad final URL
    console.log('\n--- Test 3.3: Update Ad Final URL ---');
    try {
      const updates = {
        finalUrl: 'https://example.com/updated'
      };

      const result = await dispatcherService.updateAd(testAdId, updates);

      if (result && result.success) {
        logTest(
          'Update Ad - Final URL',
          true,
          `✅ Ad final URL updated! ID: ${result.adId}`
        );
      } else {
        logTest(
          'Update Ad - Final URL',
          false,
          `❌ Ad update failed: ${result?.error || 'Unknown error'}`
        );
      }
    } catch (error) {
      logTest(
        'Update Ad - Final URL',
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

  // Test 4.1: Create Ad with too few headlines (should fail validation)
  console.log('--- Test 4.1: Create Ad (Too Few Headlines) ---');
  try {
    const adData = {
      type: 'RESPONSIVE_SEARCH_AD',
      headlines: [
        { text: 'Only One Headline', pinned: false } // Min 3 required
      ],
      descriptions: [
        { text: 'Description 1' },
        { text: 'Description 2' }
      ],
      finalUrl: 'https://example.com'
    };

    const result = await dispatcherService.createAd(testAdGroupId, adData);

    if (result && !result.success && result.error) {
      logTest(
        'Validation - Too Few Headlines',
        true,
        `✅ Correctly rejected ad with too few headlines: ${result.error}`
      );
    } else {
      logTest(
        'Validation - Too Few Headlines',
        false,
        '❌ Should have rejected ad with too few headlines'
      );
    }
  } catch (error) {
    logTest(
      'Validation - Too Few Headlines',
      true,
      `✅ Error thrown for too few headlines: ${error.message}`
    );
  }

  // Test 4.2: Create Ad with too few descriptions (should fail validation)
  console.log('\n--- Test 4.2: Create Ad (Too Few Descriptions) ---');
  try {
    const adData = {
      type: 'RESPONSIVE_SEARCH_AD',
      headlines: [
        { text: 'Headline 1', pinned: false },
        { text: 'Headline 2', pinned: false },
        { text: 'Headline 3', pinned: false }
      ],
      descriptions: [
        { text: 'Only One Description' } // Min 2 required
      ],
      finalUrl: 'https://example.com'
    };

    const result = await dispatcherService.createAd(testAdGroupId, adData);

    if (result && !result.success && result.error) {
      logTest(
        'Validation - Too Few Descriptions',
        true,
        `✅ Correctly rejected ad with too few descriptions: ${result.error}`
      );
    } else {
      logTest(
        'Validation - Too Few Descriptions',
        false,
        '❌ Should have rejected ad with too few descriptions'
      );
    }
  } catch (error) {
    logTest(
      'Validation - Too Few Descriptions',
      true,
      `✅ Error thrown for too few descriptions: ${error.message}`
    );
  }

  // Test 4.3: Create Ad with invalid URL (should fail validation)
  console.log('\n--- Test 4.3: Create Ad (Invalid URL) ---');
  try {
    const adData = {
      type: 'RESPONSIVE_SEARCH_AD',
      headlines: [
        { text: 'Headline 1', pinned: false },
        { text: 'Headline 2', pinned: false },
        { text: 'Headline 3', pinned: false }
      ],
      descriptions: [
        { text: 'Description 1' },
        { text: 'Description 2' }
      ],
      finalUrl: 'not-a-valid-url' // Invalid URL
    };

    const result = await dispatcherService.createAd(testAdGroupId, adData);

    if (result && !result.success && result.error) {
      logTest(
        'Validation - Invalid URL',
        true,
        `✅ Correctly rejected ad with invalid URL: ${result.error}`
      );
    } else {
      logTest(
        'Validation - Invalid URL',
        false,
        '❌ Should have rejected ad with invalid URL'
      );
    }
  } catch (error) {
    logTest(
      'Validation - Invalid URL',
      true,
      `✅ Error thrown for invalid URL: ${error.message}`
    );
  }

  // ==========================================
  // TEST SUITE 5: Error Handling
  // ==========================================
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('TEST SUITE 5: Error Handling');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Test 5.1: Create Ad with invalid ad group ID
  console.log('--- Test 5.1: Create Ad (Invalid Ad Group ID) ---');
  try {
    const adData = {
      type: 'RESPONSIVE_SEARCH_AD',
      headlines: [
        { text: 'Headline 1', pinned: false },
        { text: 'Headline 2', pinned: false },
        { text: 'Headline 3', pinned: false }
      ],
      descriptions: [
        { text: 'Description 1' },
        { text: 'Description 2' }
      ],
      finalUrl: 'https://example.com'
    };

    const result = await dispatcherService.createAd('invalid-adgroup-id-12345', adData);

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

  // Test 5.2: Update Ad with invalid ID
  console.log('\n--- Test 5.2: Update Ad (Invalid ID) ---');
  try {
    const updates = {
      headlines: [
        { text: 'Updated Headline', pinned: false }
      ]
    };

    const result = await dispatcherService.updateAd('invalid-ad-id-12345', updates);

    if (result && !result.success && result.error) {
      logTest(
        'Error Handling - Invalid Ad ID',
        true,
        `✅ Correctly handled invalid ad ID: ${result.error}`
      );
    } else {
      logTest(
        'Error Handling - Invalid Ad ID',
        false,
        '❌ Should have returned error for invalid ad ID'
      );
    }
  } catch (error) {
    logTest(
      'Error Handling - Invalid Ad ID',
      true,
      `✅ Error thrown for invalid ad ID: ${error.message}`
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
  console.log(`   Ads: ${createdAdIds.length}`);
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

