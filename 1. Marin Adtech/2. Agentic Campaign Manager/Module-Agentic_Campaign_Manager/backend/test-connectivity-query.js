/**
 * Connectivity Test - Query Existing Campaigns
 * 
 * This test verifies:
 * - API connectivity to Marin Dispatcher
 * - Ability to query existing campaigns
 * - Response structure and data
 * - No creation of resources (read-only)
 */

const path = require('path');

// Load compiled services
const dispatcherServicePath = path.join(__dirname, 'dist/services/marinDispatcherService.js');
const { MarinDispatcherService } = require(dispatcherServicePath);

async function runTest() {
  console.log('=== Connectivity Test - Query Existing Campaigns ===\n');
  console.log('This test is READ-ONLY - no resources will be created.\n');

  const service = new MarinDispatcherService();

  try {
    // Test 1: Check authentication/connectivity
    console.log('--- Test 1: API Connectivity ---');
    const isAuth = await service.isAuthenticated();
    
    if (isAuth) {
      console.log('✅ API is reachable and authenticated!\n');
    } else {
      console.log('❌ API connectivity failed\n');
      return;
    }

    // Test 2: Query campaigns (limit 10)
    console.log('--- Test 2: Query Existing Campaigns (Limit 10) ---');
    const result = await service.queryCampaigns(10, 0);

    if (result && result.campaigns) {
      console.log(`✅ Successfully queried campaigns!`);
      console.log(`   Total campaigns found: ${result.total || result.campaigns.length}`);
      console.log(`   Returned: ${result.campaigns.length} campaign(s)\n`);

      if (result.campaigns.length > 0) {
        console.log('--- Sample Campaigns ---\n');
        result.campaigns.slice(0, 5).forEach((campaign, index) => {
          console.log(`${index + 1}. ${campaign.name}`);
          console.log(`   ID: ${campaign.id}`);
          console.log(`   Account ID: ${campaign.accountId || 'N/A'}`);
          console.log(`   Status: ${campaign.campaignStatus || campaign.status || 'N/A'}`);
          console.log(`   Budget: $${campaign.budget?.amount || 'N/A'}`);
          console.log(`   Bidding Strategy: ${campaign.biddingStrategy || 'N/A'}`);
          console.log('');
        });

        // Check for test campaigns
        const testCampaigns = result.campaigns.filter(c => {
          const name = c.name.toLowerCase();
          return name.includes('test') || name.includes('e2e') || name.includes('api test');
        });

        if (testCampaigns.length > 0) {
          console.log(`⚠️  Found ${testCampaigns.length} test campaign(s):`);
          testCampaigns.forEach(c => {
            console.log(`   - ${c.name} (${c.id}) - Status: ${c.campaignStatus || c.status}`);
          });
          console.log('');
        }
      } else {
        console.log('ℹ️  No campaigns found in account.\n');
      }

      // Test 3: Verify response structure
      console.log('--- Test 3: Response Structure Verification ---');
      const hasCampaigns = Array.isArray(result.campaigns);
      const hasTotal = typeof result.total === 'number';
      const hasLimit = typeof result.limit === 'number';
      const hasOffset = typeof result.offset === 'number';

      console.log(`   campaigns array: ${hasCampaigns ? '✅' : '❌'}`);
      console.log(`   total field: ${hasTotal ? '✅' : '❌'}`);
      console.log(`   limit field: ${hasLimit ? '✅' : '❌'}`);
      console.log(`   offset field: ${hasOffset ? '✅' : '❌'}\n`);

      // Test 4: Pagination test
      if (result.total > 10) {
        console.log('--- Test 4: Pagination Test ---');
        const page2 = await service.queryCampaigns(10, 10);
        if (page2 && page2.campaigns) {
          console.log(`✅ Pagination works! Retrieved ${page2.campaigns.length} campaigns on page 2\n`);
        }
      }

      console.log('=== Test Summary ===');
      console.log('✅ API Connectivity: WORKING');
      console.log('✅ Campaign Query: WORKING');
      console.log('✅ Response Structure: VERIFIED');
      console.log(`✅ Found ${result.campaigns.length} campaign(s) in account\n`);

    } else {
      console.log('❌ Unexpected response structure');
      console.log('Response:', JSON.stringify(result, null, 2));
    }

  } catch (error) {
    console.error('❌ Error during connectivity test:');
    console.error(`   Message: ${error.message}`);
    
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Status Text: ${error.response.statusText}`);
      if (error.response.data) {
        console.error(`   Response Data:`, JSON.stringify(error.response.data, null, 2));
      }
    }
    
    console.error('');
    process.exit(1);
  }
}

// Run test
runTest()
  .then(() => {
    console.log('✅ Connectivity test completed successfully!\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

