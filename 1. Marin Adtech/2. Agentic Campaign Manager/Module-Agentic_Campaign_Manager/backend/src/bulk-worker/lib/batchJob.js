/**
 * Zilkr Batch Job Client Module
 * 
 * Exports a configured instance of ZilkrBatchJobClient
 * for use in Lambda functions
 * 
 * Uses DISPATCHER_URL from environment (set by CloudFormation)
 * 
 * @module batchJob
 */

const { ZilkrBatchJobClient } = require('../../lib/zilkrBatchJobClient');

// Export client instance
// Uses DISPATCHER_URL from environment (set by CloudFormation)
module.exports = new ZilkrBatchJobClient();

