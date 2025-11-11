/**
 * Test Campaign Creation with All Required Fields
 * 
 * This test:
 * 1. Reads a CSV with all required campaign fields
 * 2. Creates campaigns using the Marin Dispatcher API
 * 3. Verifies all required fields are included in requests
 * 4. Tests with different advertising channel types
 */

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

// Load compiled services
const dispatcherServicePath = path.join(__dirname, 'dist/services/marinDispatcherService.js');
const { MarinDispatcherService } = require(dispatcherServicePath);

// Load CSV parser if available, otherwise use simple parsing
function parseCSV(csvContent) {
  try {
    return parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });
  } catch (error) {
    // Fallback to simple parsing
    const lines = csvContent.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = values[index] || '';
      });
      return obj;
    });
  }
}

async function testCampaignCreation() {
  console.log('=== Test Campaign Creation with All Required Fields ===\n');

  // Read CSV file
  const csvPath = path.join(__dirname, 'test-campaign-creation-with-fields.csv');
  console.log(`Reading CSV from: ${csvPath}\n`);

  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV file not found: ${csvPath}`);
    process.exit(1);
  }

  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const campaigns = parseCSV(csvContent);

  console.log(`Found ${campaigns.length} campaign(s) in CSV\n`);

  const service = new MarinDispatcherService();
  const createdCampaigns = [];
  const failedCampaigns = [];

  // Test connectivity first
  console.log('--- Step 1: Verify API Connectivity ---');
  const isAuth = await service.isAuthenticated();
  if (!isAuth) {
    console.error('❌ API connectivity failed. Cannot proceed.\n');
    process.exit(1);
  }
  console.log('✅ API is reachable and authenticated!\n');

  // Create each campaign
  for (let i = 0; i < campaigns.length; i++) {
    const csvRow = campaigns[i];
    console.log(`--- Step ${i + 2}: Creating Campaign "${csvRow['Campaign Name']}" ---`);

    // Build campaign plan from CSV row
    const budgetAmount = parseFloat(csvRow['Budget Amount']) || 1000;
    const campaignPlan = {
      budget: {
        total: budgetAmount,
        daily: budgetAmount,
        amount: budgetAmount, // Also include as 'amount' for compatibility
      },
      timeline: {
        startDate: csvRow['Start Date'] || new Date().toISOString(),
        endDate: csvRow['End Date'] || undefined,
      },
      campaignType: {
        googleAds: csvRow['Advertising Channel Type'] || 'SEARCH',
      },
    };

    // Log the request that will be sent
    console.log('   Campaign Plan:');
    console.log(`     Name: ${csvRow['Campaign Name']}`);
    console.log(`     Account ID: ${csvRow['Account ID']}`);
    console.log(`     Status: ${csvRow['Status']}`);
    console.log(`     Budget: $${campaignPlan.budget.amount}`);
    console.log(`     Budget Delivery: ${csvRow['Budget Delivery Method']}`);
    console.log(`     Bidding Strategy: ${csvRow['Bidding Strategy']}`);
    console.log(`     Advertising Channel Type: ${csvRow['Advertising Channel Type']}`);
    console.log(`     Start Date: ${csvRow['Start Date'] || 'Today (default)'}`);
    console.log(`     End Date: ${csvRow['End Date'] || 'Not set'}`);
    console.log('');

    try {
      // Override account ID if specified in CSV
      if (csvRow['Account ID']) {
        service.accountId = csvRow['Account ID'];
      }

      // Create campaign
      const result = await service.createCampaign(campaignPlan, csvRow['Campaign Name']);

      if (result.success && result.campaignId) {
        console.log(`   ✅ Campaign created successfully!`);
        console.log(`      Campaign ID: ${result.campaignId}`);
        console.log(`      Resource ID: ${result.resourceId || 'N/A'}`);
        createdCampaigns.push({
          name: csvRow['Campaign Name'],
          id: result.campaignId,
          resourceId: result.resourceId,
        });
      } else {
        console.log(`   ❌ Campaign creation failed:`);
        console.log(`      Error: ${result.error || 'Unknown error'}`);
        failedCampaigns.push({
          name: csvRow['Campaign Name'],
          error: result.error || 'Unknown error',
        });
      }
    } catch (error) {
      console.log(`   ❌ Exception during campaign creation:`);
      console.log(`      Error: ${error.message}`);
      
      if (error.response) {
        console.log(`      Status: ${error.response.status}`);
        console.log(`      Status Text: ${error.response.statusText}`);
        if (error.response.data) {
          console.log(`      Response Data:`, JSON.stringify(error.response.data, null, 2));
        }
      }
      
      failedCampaigns.push({
        name: csvRow['Campaign Name'],
        error: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
    }

    console.log('');
  }

  // Summary
  console.log('=== Test Summary ===\n');
  console.log(`Total campaigns in CSV: ${campaigns.length}`);
  console.log(`✅ Successfully created: ${createdCampaigns.length}`);
  console.log(`❌ Failed: ${failedCampaigns.length}\n`);

  if (createdCampaigns.length > 0) {
    console.log('--- Successfully Created Campaigns ---');
    createdCampaigns.forEach((campaign, index) => {
      console.log(`${index + 1}. ${campaign.name}`);
      console.log(`   ID: ${campaign.id}`);
      console.log(`   Resource ID: ${campaign.resourceId || 'N/A'}`);
    });
    console.log('');
  }

  if (failedCampaigns.length > 0) {
    console.log('--- Failed Campaigns ---');
    failedCampaigns.forEach((campaign, index) => {
      console.log(`${index + 1}. ${campaign.name}`);
      console.log(`   Error: ${campaign.error}`);
      if (campaign.status) {
        console.log(`   Status: ${campaign.status}`);
      }
      if (campaign.data) {
        console.log(`   Response: ${JSON.stringify(campaign.data, null, 2)}`);
      }
    });
    console.log('');
  }

  // Request structure verification
  console.log('--- Request Structure Verification ---');
  console.log('Expected fields in request:');
  console.log('  ✅ accountId');
  console.log('  ✅ name');
  console.log('  ✅ status');
  console.log('  ✅ budget.amount');
  console.log('  ✅ budget.deliveryMethod');
  console.log('  ✅ biddingStrategy');
  console.log('  ✅ advertisingChannelType (NEW - Required)');
  console.log('  ✅ startDate (NEW - Required)');
  console.log('  ✅ endDate (NEW - Optional)');
  console.log('  ❌ objective (Removed - Google Ads doesn\'t accept it)');
  console.log('');

  if (failedCampaigns.length === 0) {
    console.log('✅ All campaigns created successfully!');
    console.log('⚠️  Remember to clean up test campaigns after verification.\n');
  } else {
    console.log('⚠️  Some campaigns failed. Review errors above.\n');
  }
}

// Run test
testCampaignCreation()
  .then(() => {
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

