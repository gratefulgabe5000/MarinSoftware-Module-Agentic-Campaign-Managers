/**
 * Update Campaign Handler
 * 
 * Handles update_campaign, pause_campaign, and resume_campaign actions
 * Updates campaign in Marin Dispatcher
 * 
 * @module update-handler
 */

/**
 * Handle update_campaign, pause_campaign, or resume_campaign action
 * 
 * @param {Object} event - Lambda event
 * @param {Object} context - Lambda context
 * @param {Object} dispatcherClient - MarinDispatcherClient instance
 * @param {Object} pool - PostgreSQL connection pool
 * @returns {Promise<Object>} Lambda response
 */
module.exports = async (event, context, dispatcherClient, pool) => {
  // Use dispatcher client directly for update operations
  // These operations don't require PostgreSQL interaction
  return await dispatcherClient.handleLambdaEvent(event);
};

