/**
 * Complete Workflow End-to-End Tests
 * 
 * Tests complete workflows from beginning to end:
 * - Full Campaign Structure Creation (Campaign → Ad Group → Ad → Keywords)
 * - Campaign Update Workflow
 * - Batch Job Workflow
 * - Resource Hierarchy Verification
 * - Complete Lifecycle Management
 * 
 * InfraDocs Reference: All API operations in MARIN-DISPATCHER-API-REFERENCE.md
 */

const path = require('path');

// Load compiled services
const dispatcherServicePath = path.join(__dirname, 'dist/services/marinDispatcherService.js');
const batchJobServicePath = path.join(__dirname, 'dist/services/marinBatchJobService.js');
const { MarinDispatcherService } = require(dispatcherServicePath);
const { MarinBatchJobService } = require(batchJobServicePath);

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
    objective: 'Drive website traffic and conversions',
    targetAudience: {
      demographics: {
        age: '25-45',
        location: 'United States'
      },
      interests: ['technology', 'business', 'shopping']
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
      primary: 'conversions',
      secondary: ['clicks', 'ctr', 'roas']
    }
  };
}

async function runTests() {
  console.log('=== Complete Workflow End-to-End Tests ===\n');
  console.log('Testing complete workflows from beginning to end...\n');
  console.log('⚠️  WARNING: This will create real resources in the Marin system!\n');

  const dispatcherService = new MarinDispatcherService();
  const batchJobService = new MarinBatchJobService();

  // ==========================================
  // TEST SUITE 1: Complete Campaign Structure Creation
  // ==========================================
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('TEST SUITE 1: Complete Campaign Structure Creation');
  console.log('═══════════════════════════════════════════════════════════════\n');
  console.log('Workflow: Campaign → Ad Group → Ad → Keywords\n');

  let workflowCampaignId = null;
  let workflowAdGroupId = null;
  let workflowAdId = null;
  let workflowKeywordIds = [];

  // Step 1: Create Campaign
  console.log('--- Step 1: Create Campaign ---');
  try {
    const campaignPlan = createTestCampaignPlan(100);
    const campaignName = `Complete Workflow Campaign ${Date.now()}`;
    
    const result = await dispatcherService.createCampaign(campaignPlan, campaignName);

    if (result && result.success && result.campaignId) {
      workflowCampaignId = result.campaignId;
      createdCampaignIds.push(workflowCampaignId);
      
      logTest(
        'Workflow - Step 1: Create Campaign',
        true,
        `✅ Campaign created! ID: ${workflowCampaignId}`
      );
    } else {
      logTest(
        'Workflow - Step 1: Create Campaign',
        false,
        `❌ Campaign creation failed: ${result?.error || 'Unknown error'}`
      );
      console.log('\n⚠️  Cannot proceed with workflow without a campaign.\n');
      return testResults;
    }
  } catch (error) {
    logTest(
      'Workflow - Step 1: Create Campaign',
      false,
      `❌ Error: ${error.message}`
    );
    console.log('\n⚠️  Cannot proceed with workflow without a campaign.\n');
    return testResults;
  }

  // Step 2: Create Ad Group
  console.log('\n--- Step 2: Create Ad Group ---');
  try {
    const adGroupData = {
      name: `Workflow Ad Group ${Date.now()}`,
      status: 'ENABLED',
      cpcBid: 2.50
    };

    const result = await dispatcherService.createAdGroup(workflowCampaignId, adGroupData);

    if (result && result.success && result.adGroupId) {
      workflowAdGroupId = result.adGroupId;
      createdAdGroupIds.push(workflowAdGroupId);
      
      logTest(
        'Workflow - Step 2: Create Ad Group',
        true,
        `✅ Ad Group created! ID: ${workflowAdGroupId}, Linked to Campaign: ${workflowCampaignId}`
      );
    } else {
      logTest(
        'Workflow - Step 2: Create Ad Group',
        false,
        `❌ Ad Group creation failed: ${result?.error || 'Unknown error'}`
      );
      console.log('\n⚠️  Cannot proceed with workflow without an ad group.\n');
      return testResults;
    }
  } catch (error) {
    logTest(
      'Workflow - Step 2: Create Ad Group',
      false,
      `❌ Error: ${error.message}`
    );
    console.log('\n⚠️  Cannot proceed with workflow without an ad group.\n');
    return testResults;
  }

  // Step 3: Create Ad
  console.log('\n--- Step 3: Create Ad ---');
  try {
    const adData = {
      type: 'RESPONSIVE_SEARCH_AD',
      headlines: [
        { text: 'Best Products Online', pinned: false },
        { text: 'Shop Now and Save', pinned: false },
        { text: 'Free Shipping Available', pinned: false }
      ],
      descriptions: [
        { text: 'Discover amazing products at great prices' },
        { text: 'Fast shipping and excellent customer service' }
      ],
      finalUrl: 'https://example.com/products',
      displayUrl: 'example.com',
      paths: ['products', 'sale']
    };

    const result = await dispatcherService.createAd(workflowAdGroupId, adData);

    if (result && result.success && result.adId) {
      workflowAdId = result.adId;
      createdAdIds.push(workflowAdId);
      
      logTest(
        'Workflow - Step 3: Create Ad',
        true,
        `✅ Ad created! ID: ${workflowAdId}, Linked to Ad Group: ${workflowAdGroupId}`
      );
    } else {
      logTest(
        'Workflow - Step 3: Create Ad',
        false,
        `❌ Ad creation failed: ${result?.error || 'Unknown error'}`
      );
      console.log('\n⚠️  Cannot proceed with workflow without an ad.\n');
      return testResults;
    }
  } catch (error) {
    logTest(
      'Workflow - Step 3: Create Ad',
      false,
      `❌ Error: ${error.message}`
    );
    console.log('\n⚠️  Cannot proceed with workflow without an ad.\n');
    return testResults;
  }

  // Step 4: Create Keywords
  console.log('\n--- Step 4: Create Keywords ---');
  try {
    const keywords = [
      {
        text: 'best products',
        matchType: 'BROAD',
        cpcBid: 1.50,
        status: 'ENABLED'
      },
      {
        text: 'online shopping',
        matchType: 'PHRASE',
        cpcBid: 2.00,
        status: 'ENABLED'
      },
      {
        text: 'buy now',
        matchType: 'EXACT',
        cpcBid: 2.50,
        status: 'ENABLED'
      }
    ];

    const result = await dispatcherService.createKeywords(workflowAdGroupId, keywords);

    if (result && result.success && result.keywords && result.keywords.length > 0) {
      result.keywords.forEach(kw => {
        workflowKeywordIds.push(kw.id);
        createdKeywordIds.push(kw.id);
      });
      
      logTest(
        'Workflow - Step 4: Create Keywords',
        true,
        `✅ ${result.keywords.length} keywords created! Linked to Ad Group: ${workflowAdGroupId}`
      );
    } else {
      logTest(
        'Workflow - Step 4: Create Keywords',
        false,
        `❌ Keyword creation failed: ${result?.error || 'Unknown error'}`
      );
    }
  } catch (error) {
    logTest(
      'Workflow - Step 4: Create Keywords',
      false,
      `❌ Error: ${error.message}`
    );
  }

  // Verify Complete Structure
  console.log('\n--- Verification: Complete Structure ---');
  if (workflowCampaignId && workflowAdGroupId && workflowAdId && workflowKeywordIds.length > 0) {
    logTest(
      'Workflow - Verification: Complete Structure',
      true,
      `✅ Complete structure created: Campaign(${workflowCampaignId}) → Ad Group(${workflowAdGroupId}) → Ad(${workflowAdId}) → Keywords(${workflowKeywordIds.length})`
    );
  } else {
    logTest(
      'Workflow - Verification: Complete Structure',
      false,
      `❌ Incomplete structure: Campaign(${workflowCampaignId ? '✓' : '✗'}) → Ad Group(${workflowAdGroupId ? '✓' : '✗'}) → Ad(${workflowAdId ? '✓' : '✗'}) → Keywords(${workflowKeywordIds.length})`
    );
  }

  // ==========================================
  // TEST SUITE 2: Campaign Update Workflow
  // ==========================================
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('TEST SUITE 2: Campaign Update Workflow');
  console.log('═══════════════════════════════════════════════════════════════\n');

  if (!workflowCampaignId) {
    logTest(
      'Update Workflow - Prerequisite',
      false,
      '⏸️  Skipped: No campaign available for update workflow'
    );
  } else {
    // Test 2.1: Update campaign budget
    console.log('--- Test 2.1: Update Campaign Budget ---');
    try {
      const updates = {
        budget: {
          total: 150,
          currency: 'USD'
        }
      };

      const result = await dispatcherService.updateCampaign(workflowCampaignId, updates);

      if (result && result.success) {
        logTest(
          'Update Workflow - Campaign Budget',
          true,
          `✅ Campaign budget updated!`
        );
      } else {
        logTest(
          'Update Workflow - Campaign Budget',
          false,
          `❌ Campaign budget update failed: ${result?.error || 'Unknown error'}`
        );
      }
    } catch (error) {
      logTest(
        'Update Workflow - Campaign Budget',
        false,
        `❌ Error: ${error.message}`
      );
    }

    // Test 2.2: Update ad group bid
    if (workflowAdGroupId) {
      console.log('\n--- Test 2.2: Update Ad Group Bid ---');
      try {
        const updates = {
          cpcBid: 3.00
        };

        const result = await dispatcherService.updateAdGroup(workflowAdGroupId, updates);

        if (result && result.success) {
          logTest(
            'Update Workflow - Ad Group Bid',
            true,
            `✅ Ad Group bid updated!`
          );
        } else {
          logTest(
            'Update Workflow - Ad Group Bid',
            false,
            `❌ Ad Group bid update failed: ${result?.error || 'Unknown error'}`
          );
        }
      } catch (error) {
        logTest(
          'Update Workflow - Ad Group Bid',
          false,
          `❌ Error: ${error.message}`
        );
      }
    }

    // Test 2.3: Update ad headlines
    if (workflowAdId) {
      console.log('\n--- Test 2.3: Update Ad Headlines ---');
      try {
        const updates = {
          headlines: [
            { text: 'Updated Headline 1', pinned: false },
            { text: 'Updated Headline 2', pinned: false },
            { text: 'Updated Headline 3', pinned: false }
          ]
        };

        const result = await dispatcherService.updateAd(workflowAdId, updates);

        if (result && result.success) {
          logTest(
            'Update Workflow - Ad Headlines',
            true,
            `✅ Ad headlines updated!`
          );
        } else {
          logTest(
            'Update Workflow - Ad Headlines',
            false,
            `❌ Ad headlines update failed: ${result?.error || 'Unknown error'}`
          );
        }
      } catch (error) {
        logTest(
          'Update Workflow - Ad Headlines',
          false,
          `❌ Error: ${error.message}`
        );
      }
    }

    // Test 2.4: Update keyword bids
    if (workflowKeywordIds.length > 0) {
      console.log('\n--- Test 2.4: Update Keyword Bids ---');
      try {
        const keywordId = workflowKeywordIds[0];
        const updates = {
          cpcBid: 3.00
        };

        const result = await dispatcherService.updateKeywords(keywordId, updates);

        if (result && result.success) {
          logTest(
            'Update Workflow - Keyword Bids',
            true,
            `✅ Keyword bid updated!`
          );
        } else {
          logTest(
            'Update Workflow - Keyword Bids',
            false,
            `❌ Keyword bid update failed: ${result?.error || 'Unknown error'}`
          );
        }
      } catch (error) {
        logTest(
          'Update Workflow - Keyword Bids',
          false,
          `❌ Error: ${error.message}`
        );
      }
    }
  }

  // ==========================================
  // TEST SUITE 3: Campaign Lifecycle Management
  // ==========================================
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('TEST SUITE 3: Campaign Lifecycle Management');
  console.log('═══════════════════════════════════════════════════════════════\n');

  if (!workflowCampaignId) {
    logTest(
      'Lifecycle - Prerequisite',
      false,
      '⏸️  Skipped: No campaign available for lifecycle tests'
    );
  } else {
    // Test 3.1: Pause campaign
    console.log('--- Test 3.1: Pause Campaign ---');
    try {
      const result = await dispatcherService.pauseCampaign(workflowCampaignId);

      if (result && result.success) {
        logTest(
          'Lifecycle - Pause Campaign',
          true,
          `✅ Campaign paused!`
        );
      } else {
        logTest(
          'Lifecycle - Pause Campaign',
          false,
          `❌ Campaign pause failed: ${result?.error || 'Unknown error'}`
        );
      }
    } catch (error) {
      logTest(
        'Lifecycle - Pause Campaign',
        false,
        `❌ Error: ${error.message}`
      );
    }

    // Test 3.2: Resume campaign
    console.log('\n--- Test 3.2: Resume Campaign ---');
    try {
      const result = await dispatcherService.resumeCampaign(workflowCampaignId);

      if (result && result.success) {
        logTest(
          'Lifecycle - Resume Campaign',
          true,
          `✅ Campaign resumed!`
        );
      } else {
        logTest(
          'Lifecycle - Resume Campaign',
          false,
          `❌ Campaign resume failed: ${result?.error || 'Unknown error'}`
        );
      }
    } catch (error) {
      logTest(
        'Lifecycle - Resume Campaign',
        false,
        `❌ Error: ${error.message}`
      );
    }
  }

  // ==========================================
  // TEST SUITE 4: Batch Job Workflow
  // ==========================================
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('TEST SUITE 4: Batch Job Workflow');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Test 4.1: Create batch job
  console.log('--- Test 4.1: Create Batch Job ---');
  let batchJobId = null;
  try {
    const result = await batchJobService.createBatchJob();

    if (result && result.batchJobId) {
      batchJobId = result.batchJobId;
      
      logTest(
        'Batch Job Workflow - Create',
        true,
        `✅ Batch job created! ID: ${batchJobId}`
      );
    } else {
      logTest(
        'Batch Job Workflow - Create',
        false,
        `❌ Batch job creation failed`
      );
    }
  } catch (error) {
    logTest(
      'Batch Job Workflow - Create',
      false,
      `❌ Error: ${error.message}`
    );
  }

  // Note: Full batch job workflow (add operations, run, poll, get results)
  // is tested in test-phase4-COMPREHENSIVE-API-TESTS.js
  // This test verifies the batch job can be created as part of a workflow

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

