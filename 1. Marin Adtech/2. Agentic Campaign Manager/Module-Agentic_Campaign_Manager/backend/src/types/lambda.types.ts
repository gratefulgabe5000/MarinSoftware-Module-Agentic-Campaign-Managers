/**
 * Lambda Event and Response Types
 * 
 * Defines types for Lambda function events and responses
 * Used for integrating Marin Dispatcher services with AWS Lambda
 * 
 * @module lambda.types
 */

/**
 * Lambda Event Interface
 * 
 * Represents the event structure passed to Lambda functions
 * Supports both direct and agentic modes of operation
 * 
 * @interface LambdaEvent
 */
export interface LambdaEvent {
  /**
   * Action to perform (e.g., "create_campaign", "update_campaign")
   * Maps to specific service methods
   */
  action: string;

  /**
   * Operation-specific data
   * Structure varies based on action type
   */
  data: any;

  /**
   * User information from Cognito or other auth provider
   */
  user: {
    /**
     * User ID (subject)
     */
    sub: string;

    /**
     * User email (optional)
     */
    email?: string;

    /**
     * Cognito groups (optional)
     */
    'cognito:groups'?: string[];
  };

  /**
   * Operation mode
   * - 'direct': Direct API call
   * - 'agentic': Agentic mode (AI-driven)
   */
  mode?: 'direct' | 'agentic';
}

/**
 * Lambda Response Interface
 * 
 * Represents the response structure returned from Lambda functions
 * Standardized format for success and error responses
 * 
 * @interface LambdaResponse
 */
export interface LambdaResponse {
  /**
   * Whether the operation was successful
   */
  success: boolean;

  /**
   * Result data (present on success)
   */
  result?: any;

  /**
   * Error message (present on failure)
   */
  error?: string;

  /**
   * Additional details (optional)
   * Can include full response, metadata, etc.
   */
  details?: any;
}

/**
 * Campaign Action Types
 * 
 * Supported action strings for campaign operations
 */
export type CampaignAction =
  | 'create_campaign'
  | 'update_campaign'
  | 'pause_campaign'
  | 'resume_campaign'
  | 'delete_campaign'
  | 'get_campaign_status';

/**
 * Batch Job Action Types
 * 
 * Supported action strings for batch job operations
 */
export type BatchJobAction =
  | 'create_batch_job'
  | 'add_operations_to_batch'
  | 'run_batch_job'
  | 'poll_batch_job_status'
  | 'get_batch_job_results'
  | 'bulk_create_campaigns';

/**
 * Lambda Event Data for Campaign Operations
 * 
 * Type-safe data structures for different campaign actions
 */
export interface CreateCampaignEventData {
  campaignPlan: any; // CampaignPlan type from ai.types
  name: string;
}

export interface UpdateCampaignEventData {
  campaignId: string;
  updates: any; // Partial<CampaignPlan> from ai.types
}

export interface CampaignIdEventData {
  campaignId: string;
}

/**
 * Lambda Event Data for Batch Job Operations
 * 
 * Type-safe data structures for different batch job actions
 */
export interface CreateBatchJobEventData {
  // No additional data required
}

export interface AddOperationsToBatchEventData {
  batchJobId: string;
  operations: any[]; // BatchOperation[] from marinDispatcher.types
  sequenceToken?: string;
}

export interface BatchJobIdEventData {
  batchJobId: string;
}

export interface BulkCreateCampaignsEventData {
  campaigns: any[]; // MarinCampaignRequest[] from marinDispatcher.types
}

/**
 * SQS Event Interface
 * 
 * Represents SQS event structure for batch job processing
 * Used by batch job Lambda functions triggered by SQS
 */
export interface SqsEvent {
  Records: Array<{
    messageId: string;
    receiptHandle: string;
    body: string;
    attributes: {
      ApproximateReceiveCount: string;
      SentTimestamp: string;
      SenderId: string;
      ApproximateFirstReceiveTimestamp: string;
    };
    messageAttributes?: Record<string, any>;
    md5OfBody: string;
    eventSource: string;
    eventSourceARN: string;
    awsRegion: string;
  }>;
}

/**
 * SQS Message Body for Batch Job
 * 
 * Structure of message body in SQS events for batch operations
 */
export interface BatchJobSqsMessage {
  jobId: string;
  campaigns: any[]; // MarinCampaignRequest[] from marinDispatcher.types
}

