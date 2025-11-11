/**
 * Delete Campaign Handler
 * 
 * Handles delete_campaign action
 * Deletes campaign in Zilkr Dispatcher
 * 
 * @module delete-handler
 */

/**
 * Handle delete_campaign action
 * 
 * @param {Object} event - Lambda event
 * @param {Object} context - Lambda context
 * @param {Object} dispatcherClient - ZilkrDispatcherClient instance
 * @param {Object} pool - PostgreSQL connection pool
 * @returns {Promise<Object>} Lambda response
 */
module.exports = async (event, context, dispatcherClient, pool) => {
  // Use dispatcher client directly for delete operations
  return await dispatcherClient.handleLambdaEvent(event);
};

