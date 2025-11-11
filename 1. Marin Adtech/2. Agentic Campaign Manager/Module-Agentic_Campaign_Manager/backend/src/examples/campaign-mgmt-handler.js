/**
 * Campaign Management Lambda Handler Example
 * 
 * Example Lambda handler function for campaign management operations
 * Shows how to use ZilkrDispatcherClient in a Lambda function
 * 
 * This handler:
 * - Processes Lambda events for campaign operations
 * - Integrates with PostgreSQL for campaign storage
 * - Uses ZilkrDispatcherClient to call Zilkr Dispatcher API
 * - Includes X-Ray tracing for observability
 * 
 * Environment Variables Required:
 * - DISPATCHER_URL: Zilkr Dispatcher API URL (set by CloudFormation)
 * - POSTGRES_HOST: PostgreSQL host
 * - POSTGRES_DB: PostgreSQL database name
 * - POSTGRES_USER: PostgreSQL user
 * - DB_PASSWORD: PostgreSQL password (from Secrets Manager)
 * 
 * @module campaign-mgmt-handler
 */

const { ZilkrDispatcherClient } = require('../lib/zilkrDispatcherClient');
const AWSXRay = require('aws-xray-sdk-core');
const { Pool } = require('pg');

// PostgreSQL connection pool
// Note: In production, use connection pooling and proper error handling
const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.DB_PASSWORD, // From Secrets Manager
  port: 5432,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Wrap pool with X-Ray for tracing
AWSXRay.capturePostgres(pool);

// Create dispatcher client instance
// Uses DISPATCHER_URL from environment (set by CloudFormation)
const dispatcherClient = new ZilkrDispatcherClient();

/**
 * Lambda handler function for campaign management
 * 
 * Handles Lambda events for campaign operations:
 * - create_campaign: Creates campaign in PostgreSQL and Zilkr Dispatcher
 * - update_campaign: Updates campaign in Zilkr Dispatcher
 * - pause_campaign: Pauses campaign in Zilkr Dispatcher
 * - resume_campaign: Resumes campaign in Zilkr Dispatcher
 * - delete_campaign: Deletes campaign in Zilkr Dispatcher
 * - get_campaign_status: Gets campaign status from Zilkr Dispatcher
 * 
 * @param {Object} event - Lambda event containing action, data, and user info
 * @param {Object} context - Lambda context
 * @returns {Promise<Object>} Lambda response with success status and result
 * 
 * @example
 * ```javascript
 * const event = {
 *   action: 'create_campaign',
 *   data: {
 *     campaignPlan: { objective: 'Drive sales', ... },
 *     name: 'My Campaign'
 *   },
 *   user: { sub: 'user-123', email: 'user@example.com' }
 * };
 * const result = await handler(event, context);
 * ```
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

    // For create_campaign action: Create in PostgreSQL first, then in Zilkr Dispatcher
    if (action === 'create_campaign') {
      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');

        // Insert campaign into PostgreSQL
        const insertResult = await client.query(
          `INSERT INTO campaigns (user_id, name, budget, status, created_at) 
           VALUES ($1, $2, $3, $4, NOW()) RETURNING *`,
          [
            user.sub,
            data.name,
            data.campaignPlan?.budget?.total || data.campaignPlan?.budget?.daily || 0,
            'active',
          ]
        );

        const campaign = insertResult.rows[0];

        // Call Zilkr Dispatcher via client (uses DISPATCHER_URL from environment)
        const dispatcherResult = await dispatcherClient.handleLambdaEvent({
          action: 'create_campaign',
          data: {
            campaignPlan: data.campaignPlan,
            name: campaign.name,
          },
          user,
        });

        if (dispatcherResult.success) {
          // Update campaign with Zilkr Dispatcher ID
          await client.query(
            'UPDATE campaigns SET zilkr_id = $1, updated_at = NOW() WHERE id = $2',
            [dispatcherResult.result?.campaignId || dispatcherResult.details?.campaignId, campaign.id]
          );
          campaign.zilkr_id = dispatcherResult.result?.campaignId || dispatcherResult.details?.campaignId;
        } else {
          // If Dispatcher call failed, rollback PostgreSQL transaction
          await client.query('ROLLBACK');
          subsegment?.close();
          return {
            success: false,
            error: `Failed to create campaign in Zilkr Dispatcher: ${dispatcherResult.error}`,
            details: { campaign, dispatcherResult },
          };
        }

        await client.query('COMMIT');

        subsegment?.close();
        return {
          success: true,
          result: { campaign },
          details: { dispatcherResult },
        };
      } catch (error) {
        await client.query('ROLLBACK');
        subsegment?.close();
        return {
          success: false,
          error: error.message || 'Unknown error occurred',
          details: { error: error.toString(), stack: error.stack },
        };
      } finally {
        client.release();
      }
    }

    // For other actions, use dispatcher client directly
    // These actions don't require PostgreSQL interaction
    const result = await dispatcherClient.handleLambdaEvent(event);

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

