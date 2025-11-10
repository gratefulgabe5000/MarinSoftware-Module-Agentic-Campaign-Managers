/**
 * Marin Dispatcher Client Module
 * 
 * Exports a configured instance of MarinDispatcherClient
 * for use in Lambda functions
 * 
 * Uses DISPATCHER_URL from environment (set by CloudFormation)
 * 
 * @module dispatcher
 */

const { MarinDispatcherClient } = require('../../lib/marinDispatcherClient');

// Export client instance
// Uses DISPATCHER_URL from environment (set by CloudFormation)
module.exports = new MarinDispatcherClient();

