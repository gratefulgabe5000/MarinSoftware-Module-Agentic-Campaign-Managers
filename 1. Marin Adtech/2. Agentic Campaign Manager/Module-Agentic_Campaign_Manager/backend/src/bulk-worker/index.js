/**
 * Bulk Worker Lambda Handler
 * 
 * Main Lambda handler function for bulk campaign creation
 * Processes SQS events for batch job operations
 * 
 * Uses ZilkrBatchJobClient and DynamoDB for batch job operations
 * 
 * @module bulk-worker-handler
 */

const batchJobClient = require('./lib/batchJob');
const AWSXRay = require('aws-xray-sdk-core');
const AWS = require('aws-sdk');

// Initialize AWS SDK clients
// Note: In production, use AWS SDK v3 for better performance
const dynamodb = new AWS.DynamoDB.DocumentClient();

// Wrap DynamoDB client with X-Ray for tracing
AWSXRay.captureAWSClient(dynamodb.service);

/**
 * Lambda handler function for bulk campaign creation
 * 
 * Processes SQS events containing batch job requests:
 * - Parses SQS message body containing jobId and campaigns array
 * - Updates job status in DynamoDB
 * - Calls ZilkrBatchJobClient to process batch job
 * - Updates job status with results
 * 
 * @param {Object} event - SQS event containing Records array
 * @param {Object} context - Lambda context
 * @returns {Promise<Object>} Lambda response with success status and results
 */
exports.handler = async (event, context) => {
  const segment = AWSXRay.getSegment();
  const subsegment = segment?.addNewSubsegment('BulkWorkerFunction');

  try {
    // Validate event structure
    if (!event || !event.Records || !Array.isArray(event.Records)) {
      subsegment?.close();
      return {
        success: false,
        error: 'Invalid SQS event: Records array is required',
        details: { event },
      };
    }

    if (event.Records.length === 0) {
      subsegment?.close();
      return {
        success: false,
        error: 'SQS event contains no records',
        details: { event },
      };
    }

    const results = [];
    const errors = [];

    // Process SQS messages
    for (const record of event.Records) {
      const recordSubsegment = segment?.addNewSubsegment('BulkWorkerFunction.processRecord');

      try {
        // Parse message body
        let message;
        try {
          message = JSON.parse(record.body);
        } catch (parseError) {
          recordSubsegment?.close();
          errors.push({
            messageId: record.messageId,
            error: `Failed to parse message body: ${parseError.message}`,
            record,
          });
          continue;
        }

        const { jobId, campaigns, userId } = message;

        // Validate message structure
        if (!jobId) {
          recordSubsegment?.close();
          errors.push({
            messageId: record.messageId,
            error: 'Message jobId is required',
            record,
          });
          continue;
        }

        if (!campaigns || !Array.isArray(campaigns) || campaigns.length === 0) {
          recordSubsegment?.close();
          errors.push({
            messageId: record.messageId,
            jobId,
            error: 'Message campaigns array is required and cannot be empty',
            record,
          });
          continue;
        }

        // Update job status to RUNNING in DynamoDB
        try {
          await dynamodb
            .update({
              TableName: process.env.DYNAMODB_JOB_STATUS,
              Key: { job_id: jobId },
              UpdateExpression: 'SET #status = :status, updated_at = :now',
              ExpressionAttributeNames: { '#status': 'status' },
              ExpressionAttributeValues: {
                ':status': 'RUNNING',
                ':now': new Date().toISOString(),
              },
            })
            .promise();
        } catch (dbError) {
          recordSubsegment?.close();
          errors.push({
            messageId: record.messageId,
            jobId,
            error: `Failed to update job status: ${dbError.message}`,
            record,
          });
          continue;
        }

        // Call Zilkr Dispatcher via batch job client (uses DISPATCHER_URL from environment)
        const result = await batchJobClient.handleSqsEvent({ Records: [record] });

        // Update job status with results in DynamoDB
        try {
          await dynamodb
            .update({
              TableName: process.env.DYNAMODB_JOB_STATUS,
              Key: { job_id: jobId },
              UpdateExpression:
                'SET #status = :status, result = :result, updated_at = :now',
              ExpressionAttributeNames: { '#status': 'status' },
              ExpressionAttributeValues: {
                ':status': result.success ? 'COMPLETED' : 'FAILED',
                ':result': result,
                ':now': new Date().toISOString(),
              },
            })
            .promise();
        } catch (dbError) {
          // Log error but don't fail the entire operation
          console.error(`Failed to update job status in DynamoDB: ${dbError.message}`);
        }

        recordSubsegment?.close();

        results.push({
          jobId,
          result,
        });
      } catch (error) {
        recordSubsegment?.close();

        // Try to update job status to FAILED
        try {
          const message = JSON.parse(record.body);
          if (message.jobId) {
            await dynamodb
              .update({
                TableName: process.env.DYNAMODB_JOB_STATUS,
                Key: { job_id: message.jobId },
                UpdateExpression:
                  'SET #status = :status, error = :error, updated_at = :now',
                ExpressionAttributeNames: { '#status': 'status' },
                ExpressionAttributeValues: {
                  ':status': 'FAILED',
                  ':error': error.message || 'Unknown error occurred',
                  ':now': new Date().toISOString(),
                },
              })
              .promise();
          }
        } catch (dbError) {
          // Log error but don't fail the entire operation
          console.error(`Failed to update job status to FAILED: ${dbError.message}`);
        }

        errors.push({
          messageId: record.messageId,
          error: error.message || 'Unknown error occurred',
          record,
        });
      }
    }

    subsegment?.close();

    // Return response with results and any errors
    if (errors.length > 0 && results.length === 0) {
      // All records failed
      return {
        success: false,
        error: `All ${errors.length} record(s) failed`,
        result: {
          processed: 0,
          failed: errors.length,
          errors,
        },
        details: { event, errors },
      };
    } else if (errors.length > 0) {
      // Partial success
      return {
        success: true,
        result: {
          processed: results.length,
          failed: errors.length,
          results,
          errors,
        },
        details: { event, results, errors },
      };
    } else {
      // All records succeeded
      return {
        success: true,
        result: {
          processed: results.length,
          failed: 0,
          results,
        },
        details: { event, results },
      };
    }
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

