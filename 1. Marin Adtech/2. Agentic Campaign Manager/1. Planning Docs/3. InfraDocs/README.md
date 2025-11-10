# Meridian - AI-Powered Marketing Platform

## Architecture Overview

Complete AWS serverless architecture for managing ad campaigns with AI enhancement capabilities.

### Key Components

- **API Gateway** - Entry point with Cognito authentication
- **Lambda Functions** - Serverless compute for all services
- **ECS Fargate** - Dispatcher service for external API rate limiting
- **DynamoDB** - Hot data storage (click events, 7-day TTL)
- **PostgreSQL (RDS)** - Relational data (campaigns, users)
- **Redis (ElastiCache)** - Caching and rate limiting
- **S3 + Iceberg** - Data lake for analytics
- **Step Functions** - Video generation orchestration
- **SQS** - Async job queues
- **X-Ray** - Distributed tracing
- **CloudWatch** - Logging and monitoring

## Quick Start

### Prerequisites

```bash
# Install SAM CLI
brew install aws-sam-cli

# Install Docker
brew install --cask docker

# Configure AWS CLI
aws configure
```

### Get Info from Teammate

You need ONE thing from your teammate:
- Cognito User Pool ID: `us-east-1_ABC123XYZ`

### Deploy

```bash
# Clone/create project
mkdir meridian && cd meridian

# Copy template files (template.yaml, samconfig.toml, etc.)

# Update samconfig.toml with:
# - CognitoUserPoolId from teammate
# - Secure DatabasePassword

# Build
sam build

# Deploy (first time with --guided)
sam deploy --guided

# Deploy (subsequent)
sam deploy
```

### Test

```bash
# Get API endpoint
export API_URL=$(aws cloudformation describe-stacks \
  --stack-name meridian-dev \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiEndpoint`].OutputValue' \
  --output text)

# Test with Cognito token
curl -H "Authorization: Bearer $TOKEN" $API_URL/api/campaigns
```

## Architecture Decisions

### Why Lambda?
- Sporadic traffic (marketers working business hours)
- Scale to zero when not in use
- Fast iteration without container builds
- Clear request/response boundaries

### Why Fargate for Dispatcher?
- Persistent rate limit state across requests
- OAuth token management and refresh
- Connection pooling to external APIs
- Circuit breaker pattern for API failures

### Why DynamoDB + PostgreSQL?
- **DynamoDB**: High-write throughput for click events, TTL for automatic cleanup
- **PostgreSQL**: Complex queries for campaigns, ACID transactions, joins

### Why Iceberg?
- Cost-effective historical data storage (S3 vs DynamoDB)
- Time-travel queries for analysis
- Analytics at scale without impacting operational databases
- Multi-engine access (Athena, Spark, etc.)

## Services Breakdown

### Direct vs Agentic Paths

Users can choose execution mode per request:

**Direct Mode** (fast, no AI):
```
Client → API Gateway → Main API → Orchestrator → Service Lambda
Response time: ~300ms
```

**Agentic Mode** (AI-enhanced):
```
Client → API Gateway → Main API → Orchestrator → Bedrock (Claude) → Service Lambda
Response time: ~1800ms (slower but smarter)
```

### Service Descriptions

| Service | Purpose | Async? | Uses AI? |
|---------|---------|--------|----------|
| **Campaign Management** | CRUD for campaigns | No | Optional (agentic mode) |
| **Ad Fraud Detection** | Detect fraudulent clicks | Yes (SQS) | Yes (XGBoost + Claude) |
| **Bulk Create** | Create multiple campaigns | Yes (SQS) | Optional |
| **Copy Refresh** | Generate new ad copy | Yes (SQS) | Yes (Claude) |
| **Video Generation** | Create display ads | Yes (Step Functions) | Yes (Banana AI) |
| **Dispatcher** | Rate-limit external APIs | No | No |

## Data Flow

### Campaign Creation Flow

```
1. User creates campaign (via UI)
   ↓
2. API Gateway validates Cognito token
   ↓
3. Main API invokes Orchestrator
   ↓
4. Orchestrator checks mode:
   - Direct: Pass through
   - Agentic: Enhance with Claude
   ↓
5. Campaign Management Lambda:
   - Writes to PostgreSQL
   - Calls Dispatcher
   ↓
6. Dispatcher:
   - Checks rate limits (Redis)
   - Calls Google Ads API
   - Returns campaign ID
   ↓
7. Response to user
```

### Click Event Flow (Fraud Detection)

```
1. Click arrives at API Gateway
   ↓
2. Ad Fraud Ingest Lambda:
   - Validates input
   - Sends to SQS
   - Returns 202 Accepted
   ↓
3. SQS triggers Ad Fraud Detect Lambda:
   - Runs XGBoost model
   - Scores 0-1 fraud probability
   ↓
4. If score > 0.7:
   - Calls Claude for detailed analysis
   - Generates fraud report
   ↓
5. Writes to DynamoDB (with 7-day TTL)
   ↓
6. DynamoDB Stream → Kinesis → Firehose → S3 Iceberg
   ↓
7. Available for analytics via Athena
```

## Monitoring

### CloudWatch Dashboards

Pre-configured alarms for:
- API Gateway 5XX errors
- Lambda errors and throttles
- SQS queue depth
- RDS CPU and connections
- Fargate task health

### X-Ray Tracing

All services instrumented with X-Ray for:
- End-to-end request tracing
- Performance bottleneck identification
- Error root cause analysis
- Service dependency mapping

### Access Logs

- **API Gateway**: All requests logged
- **Lambda**: CloudWatch Logs (7-day retention)
- **ECS**: Container logs
- **RDS**: PostgreSQL query logs
- **ElastiCache**: Slow log

## Cost Estimates

### Development Environment

| Service | Config | Monthly Cost |
|---------|--------|-------------|
| RDS PostgreSQL | db.t4g.micro | $15 |
| ElastiCache Redis | cache.t4g.micro | $12 |
| NAT Gateway | 1 instance | $32 |
| Lambda | ~10K invocations | $5 |
| DynamoDB | Pay-per-request | $2 |
| S3 | 100GB | $2 |
| API Gateway | 10K requests | $3 |
| Fargate Spot | 2 tasks | $15 |
| **Total** | | **~$86/month** |

💡 **Cost Optimization**: Comment out NAT Gateway for dev and use VPC endpoints to save $32/month (~$54 total)

### Production Environment (10K users)

| Service | Config | Monthly Cost |
|---------|--------|-------------|
| RDS Aurora | Serverless v2 | $200 |
| ElastiCache Redis | cache.r6g.large | $150 |
| NAT Gateway | 2 instances (HA) | $64 |
| Lambda | ~1M invocations | $20 |
| DynamoDB | On-demand | $50 |
| S3 + Glacier | 10TB | $100 |
| API Gateway | 1M requests | $35 |
| Fargate | 4 tasks | $120 |
| **Total** | | **~$739/month** |

## Security

### Network Security
- Private subnets for databases and caches
- Security groups restrict access between services
- NAT Gateway for Lambda outbound internet access
- VPC endpoints for AWS services (optional)

### Data Security
- Encryption at rest: DynamoDB, S3, RDS, ElastiCache
- Encryption in transit: TLS everywhere
- Secrets in AWS Secrets Manager (not in code!)
- IAM roles with least privilege

### Application Security
- Cognito JWT validation at API Gateway
- Rate limiting via Dispatcher
- SQL injection protection (parameterized queries)
- XSS protection in frontend

## Disaster Recovery

### Backup Strategy
- **RDS**: Automated daily backups (7-day retention)
- **DynamoDB**: Point-in-time recovery enabled
- **S3**: Versioning enabled
- **CloudFormation**: Infrastructure as code

### Recovery Procedures
- **RDS Failure**: Restore from latest snapshot (~15 min)
- **Lambda Failure**: Auto-retry + DLQ
- **Fargate Failure**: Auto-restart by ECS
- **Regional Failure**: Deploy to new region (manual)

## Development Workflow

### Local Development

```bash
# Run API locally
sam local start-api

# Invoke function locally
sam local invoke MainApiFunction -e events/test-event.json

# Test with local DynamoDB
docker-compose up dynamodb-local
```

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy to AWS
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: aws-actions/setup-sam@v2
      - run: sam build
      - run: sam deploy --no-confirm-changeset
```

## Scaling Considerations

### Current Limits
- API Gateway: 10K req/sec (can increase)
- Lambda: 1K concurrent executions (can increase)
- DynamoDB: Unlimited with on-demand
- RDS: Vertical scaling up to db.r6g.16xlarge

### When to Scale Up
- **> 100K daily active users**: 
  - Use Aurora Serverless v2
  - Add read replicas
  - Implement caching layer

- **> 1M click events/day**:
  - Increase DynamoDB capacity
  - Add Kinesis shards
  - Consider real-time analytics

- **> 10K campaigns**:
  - Add database indexes
  - Implement query optimization
  - Consider sharding strategy

## Troubleshooting

### Lambda Cold Starts
- Symptom: First request takes 1-3 seconds
- Solution: Enable provisioned concurrency (costs more)

### RDS Connection Pool Exhaustion
- Symptom: "too many connections" errors
- Solution: Use RDS Proxy (add to template)

### Rate Limiting Issues
- Symptom: 429 errors from Google/Meta APIs
- Solution: Dispatcher handles this automatically

### High Costs
- Check: CloudWatch → Billing dashboard
- Common culprits: NAT Gateway, RDS, Fargate
- Solution: Right-size resources for environment

## Next Steps

1. ✅ Deploy infrastructure (this template)
2. ⬜ Implement Lambda function code
3. ⬜ Build Dispatcher container
4. ⬜ Create database schemas
5. ⬜ Set up CI/CD pipeline
6. ⬜ Configure custom domain
7. ⬜ Add integration tests
8. ⬜ Create CloudWatch dashboards
9. ⬜ Set up monitoring alerts
10. ⬜ Deploy to staging environment

## Support

- **AWS SAM Docs**: https://docs.aws.amazon.com/serverless-application-model/
- **Lambda Best Practices**: https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html
- **Architecture Patterns**: https://aws.amazon.com/architecture/

## License

Proprietary - Gauntlet.ai
