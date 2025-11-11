/**
 * Cleanup Test Campaigns Script
 * 
 * This script helps you:
 * 1. List all campaigns (especially test campaigns)
 * 2. Pause campaigns to stop spending
 * 3. Delete campaigns (set status to REMOVED)
 * 
 * Usage:
 *   node cleanup-test-campaigns.js list          # List all campaigns
 *   node cleanup-test-campaigns.js pause-all     # Pause all campaigns
 *   node cleanup-test-campaigns.js delete-test   # Delete campaigns with "Test" in name
 *   node cleanup-test-campaigns.js delete-all    # Delete ALL campaigns (DANGEROUS!)
 */

const path = require('path');
const readline = require('readline');

// Load compiled services
const dispatcherServicePath = path.join(__dirname, 'dist/services/marinDispatcherService.js');
const { MarinDispatcherService } = require(dispatcherServicePath);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function listCampaigns() {
  console.log('\n=== Listing All Campaigns ===\n');
  
  const service = new MarinDispatcherService();
  
  try {
    const result = await service.queryCampaigns(100, 0);
    
    if (!result.campaigns || result.campaigns.length === 0) {
      console.log('✅ No campaigns found.\n');
      return [];
    }
    
    console.log(`Found ${result.campaigns.length} campaign(s):\n`);
    
    result.campaigns.forEach((campaign, index) => {
      const isTest = campaign.name.toLowerCase().includes('test') || 
                     campaign.name.toLowerCase().includes('e2e') ||
                     campaign.name.toLowerCase().includes('api test');
      const status = campaign.campaignStatus || campaign.status || 'UNKNOWN';
      const budget = campaign.budget?.amount || 'N/A';
      
      console.log(`${index + 1}. ${campaign.name}`);
      console.log(`   ID: ${campaign.id}`);
      console.log(`   Status: ${status}`);
      console.log(`   Budget: $${budget}`);
      console.log(`   ${isTest ? '⚠️  TEST CAMPAIGN' : ''}`);
      console.log('');
    });
    
    return result.campaigns;
  } catch (error) {
    console.error('❌ Error listing campaigns:', error.message);
    return [];
  }
}

async function pauseCampaign(campaignId) {
  const service = new MarinDispatcherService();
  
  try {
    const result = await service.pauseCampaign(campaignId);
    
    if (result && result.success) {
      console.log(`✅ Campaign ${campaignId} paused`);
      return true;
    } else {
      console.log(`❌ Failed to pause campaign ${campaignId}: ${result?.error || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error pausing campaign ${campaignId}:`, error.message);
    return false;
  }
}

async function deleteCampaign(campaignId) {
  const service = new MarinDispatcherService();
  
  try {
    const result = await service.deleteCampaign(campaignId);
    
    if (result && result.success) {
      console.log(`✅ Campaign ${campaignId} deleted (status set to REMOVED)`);
      return true;
    } else {
      console.log(`❌ Failed to delete campaign ${campaignId}: ${result?.error || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error deleting campaign ${campaignId}:`, error.message);
    return false;
  }
}

async function pauseAllCampaigns() {
  console.log('\n=== Pausing All Campaigns ===\n');
  console.log('⚠️  WARNING: This will pause ALL campaigns in the account!\n');
  
  const campaigns = await listCampaigns();
  
  if (campaigns.length === 0) {
    return;
  }
  
  const answer = await question(`Are you sure you want to pause ${campaigns.length} campaign(s)? (yes/no): `);
  
  if (answer.toLowerCase() !== 'yes') {
    console.log('Cancelled.\n');
    return;
  }
  
  console.log('\nPausing campaigns...\n');
  
  let paused = 0;
  for (const campaign of campaigns) {
    if (await pauseCampaign(campaign.id)) {
      paused++;
    }
  }
  
  console.log(`\n✅ Paused ${paused} of ${campaigns.length} campaign(s)\n`);
}

async function deleteTestCampaigns() {
  console.log('\n=== Deleting Test Campaigns ===\n');
  
  const campaigns = await listCampaigns();
  
  if (campaigns.length === 0) {
    return;
  }
  
  const testCampaigns = campaigns.filter(c => {
    const name = c.name.toLowerCase();
    return name.includes('test') || name.includes('e2e') || name.includes('api test');
  });
  
  if (testCampaigns.length === 0) {
    console.log('✅ No test campaigns found.\n');
    return;
  }
  
  console.log(`\nFound ${testCampaigns.length} test campaign(s) to delete:\n`);
  testCampaigns.forEach(c => console.log(`  - ${c.name} (${c.id})`));
  
  const answer = await question(`\nDelete these ${testCampaigns.length} test campaign(s)? (yes/no): `);
  
  if (answer.toLowerCase() !== 'yes') {
    console.log('Cancelled.\n');
    return;
  }
  
  console.log('\nDeleting test campaigns...\n');
  
  let deleted = 0;
  for (const campaign of testCampaigns) {
    if (await deleteCampaign(campaign.id)) {
      deleted++;
    }
  }
  
  console.log(`\n✅ Deleted ${deleted} of ${testCampaigns.length} test campaign(s)\n`);
}

async function deleteAllCampaigns() {
  console.log('\n=== DELETE ALL CAMPAIGNS ===\n');
  console.log('⚠️  ⚠️  ⚠️  DANGER ZONE ⚠️  ⚠️  ⚠️\n');
  console.log('This will DELETE ALL campaigns in the account!');
  console.log('This action cannot be easily undone!\n');
  
  const campaigns = await listCampaigns();
  
  if (campaigns.length === 0) {
    return;
  }
  
  const answer1 = await question(`Are you ABSOLUTELY SURE you want to delete ALL ${campaigns.length} campaign(s)? (type 'DELETE ALL' to confirm): `);
  
  if (answer1 !== 'DELETE ALL') {
    console.log('Cancelled.\n');
    return;
  }
  
  const answer2 = await question('One more time - type "YES DELETE ALL" to confirm: ');
  
  if (answer2 !== 'YES DELETE ALL') {
    console.log('Cancelled.\n');
    return;
  }
  
  console.log('\nDeleting all campaigns...\n');
  
  let deleted = 0;
  for (const campaign of campaigns) {
    if (await deleteCampaign(campaign.id)) {
      deleted++;
    }
  }
  
  console.log(`\n✅ Deleted ${deleted} of ${campaigns.length} campaign(s)\n`);
}

async function main() {
  const command = process.argv[2] || 'list';
  
  console.log('=== Campaign Cleanup Script ===\n');
  
  switch (command) {
    case 'list':
      await listCampaigns();
      break;
      
    case 'pause-all':
      await pauseAllCampaigns();
      break;
      
    case 'delete-test':
      await deleteTestCampaigns();
      break;
      
    case 'delete-all':
      await deleteAllCampaigns();
      break;
      
    default:
      console.log('Usage:');
      console.log('  node cleanup-test-campaigns.js list          # List all campaigns');
      console.log('  node cleanup-test-campaigns.js pause-all     # Pause all campaigns');
      console.log('  node cleanup-test-campaigns.js delete-test   # Delete test campaigns');
      console.log('  node cleanup-test-campaigns.js delete-all    # Delete ALL campaigns (DANGEROUS!)');
      console.log('');
      break;
  }
  
  rl.close();
}

main().catch(error => {
  console.error('Fatal error:', error);
  rl.close();
  process.exit(1);
});

