/**
 * Campaign Management Lambda Handler
 * 
 * Main Lambda handler function for campaign management operations
 * Routes to appropriate handler based on action
 * 
 * Uses MarinDispatcherClient and PostgreSQL for campaign operations
 * 
 * @module campaign-mgmt-handler
 */

const dispatcherClient = require('./lib/dispatcher');
const pool = require('./lib/db');
const createHandler = require('./handlers/create');
const updateHandler = require('./handlers/update');
const readHandler = require('./handlers/read');
const deleteHandler = require('./handlers/delete');
const AWSXRay = require('aws-xray-sdk-core');

/**
 * Lambda handler function for campaign management
 * 
 * Routes to appropriate handler based on action:
 * - create_campaign: createHandler
 * - update_campaign: updateHandler
 * - pause_campaign: updateHandler (with status update)
 * - resume_campaign: updateHandler (with status update)
 * - get_campaign_status: readHandler
 * - delete_campaign: deleteHandler
 * 
 * @param {Object} event - Lambda event containing action, data, and user info
 * @param {Object} context - Lambda context
 * @returns {Promise<Object>} Lambda response with success status and result
 */
exports.handler = async (event, context) => {
  const segment = AWSXRay.getSegment();
  const subsegment = segment?.addNewSubsegment('CampaignMgmtFunction');

  try {
    const { action, data, user } = event;

    // Validate event structure
    if (!action || typeof action !== 'string') {
      subsegment?.close();
      return {
        success: false,
        error: 'Action is required and must be a string',
        details: { event },
      };
    }

    if (!data || typeof data !== 'object') {
      subsegment?.close();
      return {
        success: false,
        error: 'Data is required and must be an object',
        details: { event },
      };
    }

    if (!user || !user.sub) {
      subsegment?.close();
      return {
        success: false,
        error: 'User is required and must have a sub (user ID)',
        details: { event },
      };
    }

    // Route to appropriate handler
    let result;
    switch (action) {
      case 'create_campaign':
        result = await createHandler(event, context, dispatcherClient, pool);
        break;
      case 'update_campaign':
        result = await updateHandler(event, context, dispatcherClient, pool);
        break;
      case 'pause_campaign':
      case 'resume_campaign':
        result = await updateHandler(event, context, dispatcherClient, pool);
        break;
      case 'get_campaign_status':
        result = await readHandler(event, context, dispatcherClient, pool);
        break;
      case 'delete_campaign':
        result = await deleteHandler(event, context, dispatcherClient, pool);
        break;
      default:
        subsegment?.close();
        return {
          success: false,
          error: `Unknown action: ${action}. Supported actions: create_campaign, update_campaign, pause_campaign, resume_campaign, get_campaign_status, delete_campaign`,
          details: { event },
        };
    }

    subsegment?.close();
    return result;
  } catch (error) {
    subsegment?.close();
    return {
      success: false,
      error: error.message || 'Unknown error occurred',
      details: {
        error: error.toString(),
        stack: error.stack,
        event,
      },
    };
  }
};

