# Meridian SAM Infrastructure - Quick Start

## 📦 What You Have

This package contains everything you need to deploy the complete Meridian architecture to AWS using SAM (Serverless Application Model).

### Files Included

| File | Purpose |
|------|---------|
| **template.yaml** | Main CloudFormation/SAM template (31KB, ~900 lines) |
| **samconfig.toml** | Deployment configuration |
| **deploy.sh** | Automated deployment script |
| **README.md** | Architecture overview and documentation |
| **DEPLOYMENT_GUIDE.md** | Step-by-step deployment instructions |
| **LAMBDA_CODE_GUIDE.md** | Example Lambda function code |
| **meridian-architecture.mermaid** | Visual architecture diagram |
| **statemachines/video-generation.asl.json** | Step Functions workflow |

## 🚀 Quick Deploy (5 Minutes)

### Prerequisites
```bash
# 1. Install AWS SAM CLI
brew install aws-sam-cli

# 2. Configure AWS credentials
aws configure

# 3. Get from teammate: Cognito User Pool ID
```

### Deploy

```bash
# Run the deployment script
./deploy.sh

# Or manual deployment:
sam build
sam deploy --guided
```

That's it! The script will:
1. ✅ Check prerequisites
2. ✅ Ask for configuration (environment, Cognito pool, etc.)
3. ✅ Generate secure database password
4. ✅ Build all Lambda functions
5. ✅ Deploy complete infrastructure (~15 minutes)
6. ✅ Save credentials to `.env` file

## 📋 What Gets Deployed

### Compute
- ✅ 11 Lambda functions (Main API, Orchestrator, 9 services)
- ✅ ECS Fargate cluster (Dispatcher service, 2 tasks)
- ✅ Step Functions state machine (Video generation)

### Storage
- ✅ DynamoDB table (Click events with TTL and streams)
- ✅ PostgreSQL RDS (Campaigns, users)
- ✅ ElastiCache Redis (Rate limiting, caching)
- ✅ S3 buckets (Content storage, Iceberg data lake)

### Queuing
- ✅ 4 SQS queues (Fraud, Bulk, Copy, Video)
- ✅ 4 Dead Letter Queues (DLQs)
- ✅ Kinesis Data Stream (DynamoDB → Iceberg)
- ✅ Kinesis Firehose (Stream → S3 Parquet)

### Networking
- ✅ VPC with public/private subnets
- ✅ NAT Gateway for Lambda internet access
- ✅ Security groups (least privilege)
- ✅ Internal ALB for Dispatcher

### Analytics
- ✅ Glue Data Catalog (Iceberg tables)
- ✅ Glue Crawler (auto-schema discovery)
- ✅ Athena access to S3 data lake

### Observability
- ✅ X-Ray tracing (all services)
- ✅ CloudWatch log groups (7-day retention)
- ✅ CloudWatch alarms (errors, queue depth)
- ✅ API Gateway access logs

## 💰 Cost Estimates

### Development (~$86/month)
- RDS: $15
- ElastiCache: $12
- NAT Gateway: $32 (can be removed to save costs)
- Lambda: $5
- DynamoDB: $2
- Fargate: $15
- Other: $5

### Production (~$739/month at 10K users)
See README.md for detailed breakdown

## 🔧 Next Steps After Deployment

### 1. Initialize Database

```bash
# Get PostgreSQL endpoint from outputs
export POSTGRES_HOST=$(aws cloudformation describe-stacks \
  --stack-name meridian-dev \
  --query 'Stacks[0].Outputs[?OutputKey==`PostgresEndpoint`].OutputValue' \
  --output text)

# Connect and create schema
psql -h $POSTGRES_HOST -U meridian_admin -d meridian << EOF
CREATE TABLE campaigns (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  budget DECIMAL(10,2),
  status VARCHAR(50),
  google_ads_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_campaigns_user ON campaigns(user_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
EOF
```

### 2. Build Lambda Code

See `LAMBDA_CODE_GUIDE.md` for complete examples.

Quick template structure:
```
meridian/
├── template.yaml
├── src/
│   ├── main-api/
│   │   ├── index.js
│   │   └── package.json
│   ├── orchestrator/
│   │   ├── index.js
│   │   ├── package.json
│   │   ├── direct-executor.js
│   │   └── agentic-executor.js
│   └── campaign-mgmt/
│       ├── index.js
│       └── package.json
└── dispatcher/
    ├── Dockerfile
    └── src/
```

### 3. Build & Push Dispatcher Docker Image

```bash
# Create ECR repo
aws ecr create-repository --repository-name meridian-dispatcher

# Build and push
cd dispatcher
docker build -t meridian-dispatcher .
docker tag meridian-dispatcher:latest \
  ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/meridian-dispatcher:latest
docker push ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/meridian-dispatcher:latest

# Redeploy SAM to pick up new image
cd ..
sam deploy
```

### 4. Test the API

```bash
# Load environment
source .env.dev

# Get Cognito test token from teammate
export TOKEN="eyJraWQ..."

# Test endpoint
curl -X POST $API_ENDPOINT/api/create_campaign \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "X-Meridian-Mode: direct" \
  -d '{
    "name": "Test Campaign",
    "budget": 5000
  }'
```

### 5. Monitor

```bash
# View logs
sam logs -n MainApiFunction --tail

# Check X-Ray traces
open "https://console.aws.amazon.com/xray/home?region=us-east-1"

# View CloudWatch dashboard
open "https://console.aws.amazon.com/cloudwatch/home?region=us-east-1"
```

## 🏗️ Architecture Highlights

### Direct vs Agentic Paths
```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ X-Meridian-Mode: direct | agentic
       ↓
┌─────────────┐
│ API Gateway │
│  + Cognito  │
└──────┬──────┘
       │
┌──────▼───────┐
│  Main API    │
└──────┬───────┘
       │
┌──────▼────────┐
│ Orchestrator  │
└──┬─────────┬──┘
   │         │
   │ direct  │ agentic
   ↓         ↓
┌──────┐  ┌────────┐
│Lambda│  │Bedrock │→ Enhanced
└──────┘  └────┬───┘    ↓
              Lambda
```

### Data Flow: Click Event → Analytics
```
Click → API Gateway
       ↓
   Lambda (ingest)
       ↓
     SQS (queue)
       ↓
   Lambda (detect fraud)
       ↓
   DynamoDB (hot data, 7-day TTL)
       ↓
   DynamoDB Stream
       ↓
   Kinesis Data Stream
       ↓
   Kinesis Firehose
       ↓
   S3 (Parquet files)
       ↓
   Glue Catalog (Iceberg)
       ↓
   Athena (query)
```

### Rate Limiting via Dispatcher
```
┌─────────┐
│ Lambda  │───┐
└─────────┘   │
              ├──→ ┌────────────┐
┌─────────┐   │    │ Dispatcher │
│ Lambda  │───┤    │  (Fargate) │
└─────────┘   │    └─────┬──────┘
              │          │
┌─────────┐   │          ↓
│ Lambda  │───┘    ┌──────────┐
└─────────┘        │  Redis   │ Rate limit state
                   └──────────┘
                         │
                         ↓
                   ┌────────────┐
                   │ Google Ads │
                   │  Meta Ads  │
                   └────────────┘
```

## 📚 Documentation

### Full Documentation
- **README.md** - Complete architecture overview
- **DEPLOYMENT_GUIDE.md** - Detailed deployment steps
- **LAMBDA_CODE_GUIDE.md** - Lambda code examples

### AWS Documentation
- SAM: https://docs.aws.amazon.com/serverless-application-model/
- Lambda: https://docs.aws.amazon.com/lambda/
- API Gateway: https://docs.aws.amazon.com/apigateway/

## 🛠️ Customization

### Change Database Size
Edit `template.yaml`:
```yaml
PostgresDB:
  Properties:
    DBInstanceClass: db.t4g.small  # Change from db.t4g.micro
```

### Add More SQS Queues
```yaml
MyNewQueue:
  Type: AWS::SQS::Queue
  Properties:
    QueueName: !Sub meridian-mynew-queue-${Environment}
    VisibilityTimeout: 180
```

### Add Lambda Function
```yaml
MyNewFunction:
  Type: AWS::Serverless::Function
  Properties:
    FunctionName: !Sub meridian-mynew-${Environment}
    CodeUri: ./src/mynew/
    Handler: index.handler
```

## ⚠️ Important Notes

### What You Need from Teammate
- ✅ Cognito User Pool ID
- ❌ Client ID (frontend only, not needed for infrastructure)
- ❌ Domain (frontend only)

### Costs to Watch
1. **NAT Gateway** - $32/month, can remove for dev
2. **RDS** - Runs 24/7, even when idle
3. **Fargate** - 2 tasks always running

### Cost Optimization for Dev
```yaml
# Comment out NAT Gateway (Lambdas won't have internet)
# NatGateway:
#   Type: AWS::EC2::NatGateway

# Or use VPC endpoints (free for AWS services)
VPCEndpoint:
  Type: AWS::EC2::VPCEndpoint
  Properties:
    ServiceName: !Sub com.amazonaws.${AWS::Region}.dynamodb
```

## 🚨 Troubleshooting

### Deployment Takes Forever
- RDS creation: 10-15 minutes (normal)
- First deployment: ~20 minutes total
- Subsequent: ~5 minutes

### Lambda Can't Connect to RDS
- Check: Lambda in private subnets?
- Check: Security group allows port 5432?
- Check: RDS in same VPC?

### Dispatcher Container Won't Start
- Check: ECR image exists and is accessible?
- Check: Task role has correct permissions?
- View logs: CloudWatch → /aws/ecs/meridian-dispatcher-dev

### High Costs in Dev
- Remove NAT Gateway (save $32/month)
- Stop RDS when not in use
- Use Fargate Spot (already configured)

## 🎉 Success Checklist

- [ ] SAM CLI installed
- [ ] AWS credentials configured  
- [ ] Cognito User Pool ID from teammate
- [ ] Ran `./deploy.sh` successfully
- [ ] Database schema created
- [ ] Lambda code deployed
- [ ] Dispatcher container built and pushed
- [ ] Test API call works
- [ ] X-Ray traces visible
- [ ] CloudWatch logs flowing

## 📞 Getting Help

- **AWS SAM Issues**: https://github.com/aws/aws-sam-cli/issues
- **Template Issues**: Check CloudFormation console for detailed errors
- **Lambda Issues**: Check CloudWatch Logs
- **Network Issues**: Check VPC Flow Logs

## 🔄 Updates and Maintenance

### Update Lambda Code
```bash
# After changing code in src/
sam build
sam deploy
```

### Update Infrastructure
```bash
# After changing template.yaml
sam build
sam deploy
```

### Delete Everything
```bash
sam delete --stack-name meridian-dev
# Manually delete S3 buckets (have data retention)
```

---

**Ready to deploy?** Run `./deploy.sh` and follow the prompts!
