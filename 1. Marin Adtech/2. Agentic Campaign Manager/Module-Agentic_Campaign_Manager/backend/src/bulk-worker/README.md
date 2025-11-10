# Bulk Worker Lambda Function

Lambda function for bulk campaign creation using Marin Dispatcher Batch Job API.

## Structure

```
bulk-worker/
├── index.js              # Main handler (processes SQS events)
├── package.json          # Dependencies
└── lib/                  # Shared modules
    └── batchJob.js       # MarinBatchJobClient instance
```

## Environment Variables

The following environment variables are required (set by CloudFormation):

- `DISPATCHER_URL`: Marin Dispatcher API URL (set by CloudFormation)
- `DYNAMODB_JOB_STATUS`: DynamoDB table name for job status tracking

## Event Format

This Lambda function is triggered by SQS events. Each SQS message should contain:

```json
{
  "jobId": "job-123",
  "campaigns": [
    {
      "name": "Campaign 1",
      "accountId": "5533110357",
      "status": "ENABLED",
      "budget": {
        "amount": 100,
        "deliveryMethod": "STANDARD"
      },
      "biddingStrategy": "MANUAL_CPC"
    }
  ]
}
```

## Job Status Tracking

The function updates job status in DynamoDB:
- `RUNNING`: Job is being processed
- `COMPLETED`: Job completed successfully
- `FAILED`: Job failed

## Dependencies

- `aws-sdk`: AWS SDK for DynamoDB access
- `aws-xray-sdk-core`: AWS X-Ray tracing

## Deployment

This Lambda function should be deployed with:
- SQS trigger configured
- Lambda Layer containing shared dependencies
- Environment variables set by CloudFormation
- IAM role with permissions for:
  - X-Ray tracing
  - DynamoDB access (for job status tracking)
  - SQS message deletion

