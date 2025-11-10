# Meridian Architecture - Deployment Guide

## Prerequisites

1. **AWS CLI configured** with appropriate credentials
2. **SAM CLI installed**: `brew install aws-sam-cli` (Mac) or follow [AWS docs](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html)
3. **Docker installed** (for building Lambda layers)
4. **Node.js 20+** installed
5. **Cognito User Pool ID** from teammate

## Project Structure

```
meridian/
├── template.yaml                 # Main SAM template
├── samconfig.toml               # Deployment configuration
├── statemachines/
│   └── video-generation.asl.json # Step Functions workflow
├── src/
│   ├── main-api/
│   │   ├── index.js
│   │   └── package.json
│   ├── orchestrator/
│   │   ├── index.js
│   │   └── package.json
│   ├── campaign-mgmt/
│   │   ├── index.js
│   │   └── package.json
│   ├── fraud-ingest/
│   ├── fraud-detect/
│   ├── bulk-router/
│   ├── bulk-worker/
│   ├── copy-router/
│   ├── copy-worker/
│   ├── video-router/
│   ├── video-worker/
│   └── dynamo-to-kinesis/
└── dispatcher/
    ├── Dockerfile
    ├── package.json
    └── src/
        └── index.js
```

## Step 1: Initial Setup

### 1.1 Clone/Create Project Structure

```bash
# Create project directory
mkdir meridian && cd meridian

# Create directory structure
mkdir -p src/{main-api,orchestrator,campaign-mgmt,fraud-ingest,fraud-detect,bulk-router,bulk-worker,copy-router,copy-worker,video-router,video-worker,dynamo-to-kinesis}
mkdir -p statemachines
mkdir -p dispatcher/src

# Copy template files
# (Copy the template.yaml, samconfig.toml, and video-generation.asl.json files)
```

### 1.2 Get Cognito User Pool ID from Teammate

```bash
# Your teammate should provide:
export COGNITO_USER_POOL_ID="us-east-1_ABC123XYZ"

# Update samconfig.toml with the actual value
```

### 1.3 Set Database Password

```bash
# Generate a secure password
export DB_PASSWORD=$(openssl rand -base64 32)

# Or use AWS Secrets Manager (recommended for prod)
aws secretsmanager create-secret \
  --name meridian/db/password \
  --secret-string "$DB_PASSWORD"
```

## Step 2: Create Lambda Function Code

### 2.1 Main API Lambda

```bash
cd src/main-api
npm init -y
npm install express aws-xray-sdk-core
```

Create `src/main-api/index.js`:

```javascript
const express = require('express');
const awsServerlessExpress = require('aws-serverless-express');
const AWSXRay = require('aws-xray-sdk-core');
const AWS = AWSXRay.captureAWS(require('aws-sdk'));

const app = express();
app.use(express.json());

const lambda = new AWS.Lambda();

app.post('/api/:action', async (req, res) => {
  try {
    // Invoke orchestrator
    const result = await lambda.invoke({
      FunctionName: process.env.ORCHESTRATOR_FUNCTION_NAME,
      Payload: JSON.stringify({
        action: req.params.action,
        data: req.body,
        mode: req.headers['x-meridian-mode'] || 'direct',
        user: req.requestContext.authorizer.claims
      })
    }).promise();
    
    const response = JSON.parse(result.Payload);
    res.json(response);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

const server = awsServerlessExpress.createServer(app);

exports.handler = (event, context) => {
  awsServerlessExpress.proxy(server, event, context);
};
```

### 2.2 Orchestrator Lambda

```bash
cd ../orchestrator
npm init -y
npm install @aws-sdk/client-bedrock-runtime aws-xray-sdk-core
```

Create `src/orchestrator/index.js`:

```javascript
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
const AWSXRay = require('aws-xray-sdk-core');

const bedrock = AWSXRay.captureAWSv3Client(new BedrockRuntimeClient({ region: process.env.AWS_REGION }));

exports.handler = async (event) => {
  const { mode, action, data, user } = event;
  
  if (mode === 'agentic') {
    // Enhance with Claude
    const prompt = `
      User wants to: ${action}
      Input: ${JSON.stringify(data)}
      User context: ${JSON.stringify(user)}
      
      Enhance this request with:
      1. Optimization suggestions
      2. Best practices
      3. Predicted outcomes
      
      Return JSON only.
    `;
    
    const command = new InvokeModelCommand({
      modelId: process.env.BEDROCK_MODEL_ID,
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }]
      })
    });
    
    const response = await bedrock.send(command);
    const enhanced = JSON.parse(new TextDecoder().decode(response.body));
    
    return {
      enhanced: true,
      data: enhanced,
      action: action
    };
  }
  
  // Direct mode
  return {
    enhanced: false,
    data: data,
    action: action
  };
};
```

### 2.3 Campaign Management Lambda

```bash
cd ../campaign-mgmt
npm init -y
npm install pg aws-xray-sdk-core
```

Create `src/campaign-mgmt/index.js`:

```javascript
const { Pool } = require('pg');
const AWSXRay = require('aws-xray-sdk-core');

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  port: 5432
});

exports.handler = async (event) => {
  const { action, data, user } = event;
  
  switch (action) {
    case 'create_campaign':
      return await createCampaign(data, user);
    case 'get_campaigns':
      return await getCampaigns(user);
    case 'update_campaign':
      return await updateCampaign(data, user);
    default:
      throw new Error(`Unknown action: ${action}`);
  }
};

async function createCampaign(data, user) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'INSERT INTO campaigns (user_id, name, budget, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [user.sub, data.name, data.budget, 'active']
    );
    
    // Call Dispatcher to create in Google Ads
    // await callDispatcher('google_ads', 'create_campaign', result.rows[0]);
    
    return result.rows[0];
  } finally {
    client.release();
  }
}

async function getCampaigns(user) {
  const result = await pool.query(
    'SELECT * FROM campaigns WHERE user_id = $1 ORDER BY created_at DESC',
    [user.sub]
  );
  return result.rows;
}

async function updateCampaign(data, user) {
  const result = await pool.query(
    'UPDATE campaigns SET name = $1, budget = $2 WHERE id = $3 AND user_id = $4 RETURNING *',
    [data.name, data.budget, data.id, user.sub]
  );
  return result.rows[0];
}
```

## Step 3: Build Dispatcher Docker Image

### 3.1 Create Dispatcher Code

Create `dispatcher/Dockerfile`:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY src/ ./src/

EXPOSE 3000

CMD ["node", "src/index.js"]
```

Create `dispatcher/package.json`:

```json
{
  "name": "meridian-dispatcher",
  "version": "1.0.0",
  "main": "src/index.js",
  "dependencies": {
    "express": "^4.18.0",
    "ioredis": "^5.3.0",
    "google-ads-api": "^16.0.0",
    "aws-xray-sdk": "^3.5.0"
  }
}
```

Create `dispatcher/src/index.js`:

```javascript
const express = require('express');
const Redis = require('ioredis');
const AWSXRay = require('aws-xray-sdk');

const app = express();
app.use(express.json());

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
});

// Rate limiter
class RateLimiter {
  async checkLimit(platform, operation) {
    const key = `rate-limit:${platform}:${operation}`;
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, 60); // Reset every minute
    }
    
    // Google Ads: 2000 ops/minute
    if (platform === 'google' && count > 1950) {
      throw new Error('Rate limit exceeded');
    }
    
    return count;
  }
}

const rateLimiter = new RateLimiter();

app.post('/dispatcher/:platform/:action', async (req, res) => {
  try {
    await rateLimiter.checkLimit(req.params.platform, req.params.action);
    
    // Call external API (Google/Meta)
    const result = await callExternalAPI(req.params.platform, req.params.action, req.body);
    
    res.json({ success: true, result });
  } catch (error) {
    console.error('Dispatcher error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

async function callExternalAPI(platform, action, data) {
  // Implement actual API calls here
  return { platform, action, data };
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Dispatcher listening on port ${PORT}`);
});
```

### 3.2 Build and Push Docker Image

```bash
cd dispatcher

# Create ECR repository
aws ecr create-repository --repository-name meridian-dispatcher

# Get ECR login
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Build image
docker build -t meridian-dispatcher .

# Tag image
docker tag meridian-dispatcher:latest \
  ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/meridian-dispatcher:latest

# Push to ECR
docker push ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/meridian-dispatcher:latest
```

## Step 4: Deploy with SAM

### 4.1 Validate Template

```bash
cd ..  # Back to project root
sam validate
```

### 4.2 Build

```bash
sam build
```

### 4.3 Deploy (First Time)

```bash
sam deploy --guided

# Follow prompts:
# - Stack name: meridian-dev
# - Region: us-east-1
# - Parameter CognitoUserPoolId: [from teammate]
# - Parameter DatabasePassword: [secure password]
# - Confirm changeset: Y
# - Allow SAM CLI IAM role creation: Y
# - Save arguments to config: Y
```

### 4.4 Deploy (Subsequent Times)

```bash
sam deploy
```

## Step 5: Post-Deployment Setup

### 5.1 Initialize Database

```bash
# Get RDS endpoint from outputs
export POSTGRES_HOST=$(aws cloudformation describe-stacks \
  --stack-name meridian-dev \
  --query 'Stacks[0].Outputs[?OutputKey==`PostgresEndpoint`].OutputValue' \
  --output text)

# Connect and create schema
psql -h $POSTGRES_HOST -U meridian_admin -d meridian

# Run schema creation
CREATE TABLE campaigns (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  budget DECIMAL(10,2),
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_campaigns_user ON campaigns(user_id);
```

### 5.2 Test Deployment

```bash
# Get API endpoint
export API_URL=$(aws cloudformation describe-stacks \
  --stack-name meridian-dev \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiEndpoint`].OutputValue' \
  --output text)

# Get test token from Cognito
export TOKEN=$(aws cognito-idp initiate-auth \
  --auth-flow USER_PASSWORD_AUTH \
  --client-id YOUR_CLIENT_ID \
  --auth-parameters USERNAME=test@example.com,PASSWORD=TestPass123! \
  --query 'AuthenticationResult.IdToken' \
  --output text)

# Test API
curl -X POST $API_URL/api/create_campaign \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Campaign", "budget": 5000}'
```

## Step 6: Monitor Deployment

### 6.1 Check CloudWatch Logs

```bash
# View API Gateway logs
sam logs -n MainApiFunction --stack-name meridian-dev --tail

# View Orchestrator logs
sam logs -n OrchestratorFunction --stack-name meridian-dev --tail
```

### 6.2 Check X-Ray Traces

```bash
# Open X-Ray console
open "https://console.aws.amazon.com/xray/home?region=us-east-1#/service-map"
```

### 6.3 Check CloudWatch Alarms

```bash
aws cloudwatch describe-alarms --alarm-names meridian-api-errors-dev
```

## Troubleshooting

### Common Issues

1. **VPC/NAT Gateway costs too high**
   - Comment out NAT Gateway in template for dev
   - Use VPC endpoints instead

2. **RDS takes forever to create**
   - First deployment takes 10-15 minutes for RDS
   - Use CloudFormation console to monitor progress

3. **Lambda can't connect to RDS**
   - Check security groups
   - Ensure Lambda is in correct subnets
   - Verify RDS is in same VPC

4. **Dispatcher container won't start**
   - Check ECR image exists
   - Verify task role has correct permissions
   - Check CloudWatch logs for container errors

## Cost Optimization for Dev

### Reduce Costs in Development

1. **RDS**: Use `db.t4g.micro` (included in template)
2. **ElastiCache**: Use `cache.t4g.micro` (included)
3. **NAT Gateway**: Comment out for dev, use VPC endpoints
4. **Fargate**: Use FARGATE_SPOT (included)
5. **DynamoDB**: Use PAY_PER_REQUEST (included)

### Estimated Monthly Costs (Dev)

- RDS PostgreSQL (t4g.micro): ~$15
- ElastiCache Redis (t4g.micro): ~$12
- NAT Gateway: ~$32 (comment out to save)
- Lambda: ~$5
- DynamoDB: ~$2
- S3: ~$1
- API Gateway: ~$3
- Fargate Spot (2 tasks): ~$15
- **Total: ~$85/month (or ~$53 without NAT)**

## Next Steps

1. **Create remaining Lambda functions** following the patterns above
2. **Set up CI/CD pipeline** with GitHub Actions or CodePipeline
3. **Configure custom domain** for API Gateway
4. **Set up monitoring dashboard** in CloudWatch
5. **Add integration tests**
6. **Configure backup strategy** for RDS and DynamoDB

## Useful Commands

```bash
# Deploy changes
sam build && sam deploy

# View logs
sam logs -n FUNCTION_NAME --tail

# Delete stack (careful!)
sam delete --stack-name meridian-dev

# Validate template
sam validate --lint

# Test locally
sam local start-api
```
