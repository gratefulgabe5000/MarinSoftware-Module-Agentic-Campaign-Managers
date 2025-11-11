/**
 * Create Campaign Handler
 * 
 * Handles create_campaign action
 * Creates campaign in PostgreSQL first, then in Zilkr Dispatcher
 * 
 * @module create-handler
 */

/**
 * Handle create_campaign action
 * 
 * @param {Object} event - Lambda event
 * @param {Object} context - Lambda context
 * @param {Object} dispatcherClient - ZilkrDispatcherClient instance
 * @param {Object} pool - PostgreSQL connection pool
 * @returns {Promise<Object>} Lambda response
 */
module.exports = async (event, context, dispatcherClient, pool) => {
  const { data, user } = event;
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
      return {
        success: false,
        error: `Failed to create campaign in Zilkr Dispatcher: ${dispatcherResult.error}`,
        details: { campaign, dispatcherResult },
      };
    }

    await client.query('COMMIT');

    return {
      success: true,
      result: { campaign },
      details: { dispatcherResult },
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

