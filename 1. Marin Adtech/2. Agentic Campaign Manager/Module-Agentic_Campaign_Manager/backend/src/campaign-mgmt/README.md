# Campaign Management Lambda Function

Lambda function for campaign management operations using Marin Dispatcher API.

## Structure

```
campaign-mgmt/
├── index.js              # Main handler (routes to appropriate handler)
├── package.json          # Dependencies
├── handlers/             # Individual action handlers
│   ├── create.js        # Create campaign handler
│   ├── read.js          # Read campaign handler
│   ├── update.js        # Update campaign handler
│   └── delete.js        # Delete campaign handler
└── lib/                  # Shared modules
    ├── db.js            # PostgreSQL connection pool
    └── dispatcher.js    # MarinDispatcherClient instance
```

## Environment Variables

The following environment variables are required (set by CloudFormation):

- `DISPATCHER_URL`: Marin Dispatcher API URL (set by CloudFormation)
- `POSTGRES_HOST`: PostgreSQL host
- `POSTGRES_DB`: PostgreSQL database name
- `POSTGRES_USER`: PostgreSQL user
- `DB_PASSWORD`: PostgreSQL password (from Secrets Manager)

## Supported Actions

- `create_campaign`: Creates campaign in PostgreSQL and Marin Dispatcher
- `update_campaign`: Updates campaign in Marin Dispatcher
- `pause_campaign`: Pauses campaign in Marin Dispatcher
- `resume_campaign`: Resumes campaign in Marin Dispatcher
- `delete_campaign`: Deletes campaign in Marin Dispatcher
- `get_campaign_status`: Gets campaign status from Marin Dispatcher

## Dependencies

- `pg`: PostgreSQL client
- `axios`: HTTP client (used by MarinDispatcherClient)
- `aws-xray-sdk-core`: AWS X-Ray tracing

## Deployment

This Lambda function should be deployed with:
- Lambda Layer containing shared dependencies
- Environment variables set by CloudFormation
- IAM role with permissions for:
  - X-Ray tracing
  - VPC access (for PostgreSQL)
  - Secrets Manager access (for DB_PASSWORD)

