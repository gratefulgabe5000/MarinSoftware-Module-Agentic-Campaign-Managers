/**
 * Zilkr Dispatcher Client Module
 * 
 * Exports a configured instance of ZilkrDispatcherClient
 * for use in Lambda functions
 * 
 * Uses DISPATCHER_URL from environment (set by CloudFormation)
 * 
 * @module dispatcher
 */

const { ZilkrDispatcherClient } = require('../../lib/zilkrDispatcherClient');

// Export client instance
// Uses DISPATCHER_URL from environment (set by CloudFormation)
module.exports = new ZilkrDispatcherClient();

