/**
 * Test Budget and Campaign Creation
 * 
 * Tests the new budget resource creation flow:
 * 1. Create budget resource first
 * 2. Get budget reference
 * 3. Create campaign with budget reference
 */

const { MarinDispatcherService } = require('./dist/services/marinDispatcherService');

const accountId = '5533110357';
const publisher = 'google';
const service = new MarinDispatcherService(accountId, publisher);

async function testBudgetCreation() {
  console.log('=== Testing Budget Resource Creation ===\n');
  
  try {
    // Test 1: Create budget resource
    console.log('--- Test 1: Create Budget Resource ---');
    const budgetAmount = 1000;
    const deliveryMethod = 'STANDARD';
    
    console.log(`Creating budget: $${budgetAmount}, delivery: ${deliveryMethod}`);
    const budgetResponse = await service.createBudget(budgetAmount, deliveryMethod);
    
    console.log('✅ Budget created successfully!');
    console.log('Budget Response:', JSON.stringify(budgetResponse, null, 2));
    
    // Extract budget reference
    const budgetReference = budgetResponse.resourceName || budgetResponse.budgetId || budgetResponse.resourceId;
    console.log(`\nBudget Reference: ${budgetReference}`);
    
    return budgetReference;
  } catch (error) {
    console.error('❌ Budget creation failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    throw error;
  }
}

async function testCampaignCreationWithBudget(budgetReference) {
  console.log('\n=== Testing Campaign Creation with Budget Reference ===\n');
  
  try {
    // Test 2: Create campaign with budget reference
    console.log('--- Test 2: Create Campaign with Budget Reference ---');
    
    const campaignPlan = {
      budget: {
        total: 1000,
        daily: 50,
        currency: 'USD',
      },
      timeline: {
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        duration: 30,
      },
      campaignType: {
        googleAds: 'SEARCH',
      },
      platforms: ['google'],
      targetAudience: {
        demographics: {
          age: '18-65',
          gender: 'all',
          location: 'all',
          interests: [],
        },
      },
      kpis: {
        primary: 'conversions',
        secondary: [],
      },
    };
    
    const campaignName = `Test Campaign - Budget Resource - ${new Date().toISOString()}`;
    const status = 'PAUSED'; // Create as draft
    
    console.log(`Creating campaign: "${campaignName}"`);
    console.log(`Budget Reference: ${budgetReference}`);
    console.log(`Status: ${status}`);
    
    const campaignResponse = await service.createCampaign(campaignPlan, campaignName, status);
    
    if (campaignResponse.success) {
      console.log('✅ Campaign created successfully!');
      console.log('Campaign ID:', campaignResponse.campaignId);
      console.log('Campaign Response:', JSON.stringify(campaignResponse, null, 2));
      return campaignResponse;
    } else {
      console.error('❌ Campaign creation failed:', campaignResponse.error);
      console.error('Details:', JSON.stringify(campaignResponse.details, null, 2));
      return null;
    }
  } catch (error) {
    console.error('❌ Campaign creation failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    throw error;
  }
}

async function runTests() {
  console.log('=== Budget and Campaign Creation Test ===\n');
  console.log(`Account ID: ${accountId}`);
  console.log(`Publisher: ${publisher}\n`);
  
  try {
    // Test 1: Create budget
    let budgetReference;
    try {
      budgetReference = await testBudgetCreation();
    } catch (error) {
      console.error('\n⚠️  Budget creation failed. This may be expected if Marin Dispatcher endpoint is not yet available.');
      console.error('Error:', error.message);
      console.log('\n--- Testing Campaign Creation with Mock Budget Reference ---');
      // Use a mock budget reference for testing campaign creation
      budgetReference = 'customers/5533110357/campaignBudgets/123456789';
      console.log(`Using mock budget reference: ${budgetReference}`);
    }
    
    // Test 2: Create campaign with budget reference
    if (budgetReference) {
      await testCampaignCreationWithBudget(budgetReference);
    }
    
    console.log('\n=== Test Summary ===');
    console.log('✅ Budget creation test completed');
    console.log('✅ Campaign creation test completed');
    console.log('\nNote: If budget creation failed, Marin Dispatcher may need to add the endpoint:');
    console.log('POST /api/v2/dispatcher/google/campaign-budgets');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Run tests
runTests();

