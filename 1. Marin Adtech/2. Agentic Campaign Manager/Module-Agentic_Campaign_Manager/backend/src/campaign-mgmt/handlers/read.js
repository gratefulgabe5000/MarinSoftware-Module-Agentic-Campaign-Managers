/**
 * Read Campaign Handler
 * 
 * Handles get_campaign_status action
 * Gets campaign status from Marin Dispatcher
 * 
 * @module read-handler
 */

/**
 * Handle get_campaign_status action
 * 
 * @param {Object} event - Lambda event
 * @param {Object} context - Lambda context
 * @param {Object} dispatcherClient - MarinDispatcherClient instance
 * @param {Object} pool - PostgreSQL connection pool
 * @returns {Promise<Object>} Lambda response
 */
module.exports = async (event, context, dispatcherClient, pool) => {
  // Use dispatcher client directly for read operations
  return await dispatcherClient.handleLambdaEvent(event);
};

