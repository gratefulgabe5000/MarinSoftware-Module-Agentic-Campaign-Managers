/**
 * Marin Batch Job Client Module
 * 
 * Exports a configured instance of MarinBatchJobClient
 * for use in Lambda functions
 * 
 * Uses DISPATCHER_URL from environment (set by CloudFormation)
 * 
 * @module batchJob
 */

const { MarinBatchJobClient } = require('../../lib/marinBatchJobClient');

// Export client instance
// Uses DISPATCHER_URL from environment (set by CloudFormation)
module.exports = new MarinBatchJobClient();

