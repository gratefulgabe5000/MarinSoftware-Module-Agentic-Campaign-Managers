# Meridian Infrastructure - Team Deployment Guide

## 🎯 Overview

Jason has deployed the **base infrastructure** (databases, queues, networking). Now **each team deploys their own Lambda service** independently.

### What's Already Deployed (by Jason)
✅ VPC with public/private subnets  
✅ PostgreSQL database (RDS)  
✅ Redis cache (ElastiCache)  
✅ DynamoDB tables (click events, job status)  
✅ SQS queues (fraud, bulk, copy, video)  
✅ S3 buckets (content, Iceberg data lake)  
✅ API Gateway (with Cognito auth)  
✅ ECS Fargate cluster (for Dispatcher)  
✅ All networking, security groups, IAM roles  

### What Your Team Deploys
🔨 **Your Lambda function** + configuration

---

## 📋 Prerequisites

### 1. Install AWS SAM CLI
```bash
# Mac
brew install aws-sam-cli

# Windows
choco install aws-sam-cli

# Linux
pip install aws-sam-cli
```

### 2. Configure AWS Credentials
```bash
aws configure

# Use your AWS access key and secret
# Region: us-east-1 (or your region)
```

### 3. Get Environment Name
Ask Jason: Are we deploying to `dev`, `staging`, or `prod`?

---

## 🚀 Quick Start - Deploy Your Service

### Step 1: Set Up Your Project

```bash
# Create your service directory
mkdir meridian-[YOUR-SERVICE]
cd meridian-[YOUR-SERVICE]

# Copy the service template
cp /path/to/template-service.yaml template.yaml

# Create your Lambda code
touch index.js package.json
```

### Step 2: Write Your Lambda Code

**index.js** (minimum required):
```javascript
exports.handler = async (event) => {
  console.log('Event received:', JSON.stringify(event));
  
  // Your event format from Orchestrator:
  const { action, data, user, mode } = event;
  
  try {
    // Your business logic here
    const result = await processRequest(action, data, user);
    
    return {
      success: true,
      result: result
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

async function processRequest(action, data, user) {
  // TODO: Implement your service logic
  return { message: `Processed ${action} for user ${user.sub}` };
}
```

**package.json**:
```json
{
  "name": "meridian-your-service",
  "version": "1.0.0",
  "main": "index.js",
  "dependencies": {
    "aws-xray-sdk-core": "^3.5.3"
  }
}
```

### Step 3: Deploy

```bash
# Build
sam build

# Deploy (first time)
sam deploy \
  --stack-name meridian-[YOUR-SERVICE]-dev \
  --parameter-overrides \
    Environment=dev \
    ServiceName=[YOUR-SERVICE] \
  --capabilities CAPABILITY_IAM \
  --resolve-s3

# Example for campaign management team:
sam deploy \
  --stack-name meridian-campaign-mgmt-dev \
  --parameter-overrides \
    Environment=dev \
    ServiceName=campaign-mgmt \
  --capabilities CAPABILITY_IAM \
  --resolve-s3
```

### Step 4: Test Your Lambda

```bash
# Get your function name
aws cloudformation describe-stacks \
  --stack-name meridian-[YOUR-SERVICE]-dev \
  --query 'Stacks[0].Outputs[?OutputKey==`FunctionName`].OutputValue' \
  --output text

# Invoke your function
aws lambda invoke \
  --function-name meridian-[YOUR-SERVICE]-dev \
  --payload '{"action":"test","data":{},"user":{"sub":"user-123"}}' \
  response.json

# Check the response
cat response.json
```

---

## 📝 Service Contract

### What Your Lambda Receives (Event Format)

```javascript
{
  "action": "create_campaign",     // The operation to perform
  "data": {                        // Input data for the operation
    "name": "Summer Sale",
    "budget": 5000
  },
  "user": {                        // Cognito user context
    "sub": "abc-123-def-456",      // User ID
    "email": "user@example.com",
    "cognito:groups": ["admin"]
  },
  "mode": "direct"                 // or "agentic"
}
```

### What Your Lambda Must Return

**Success:**
```javascript
{
  "success": true,
  "result": {
    // Your result data
    "campaignId": "camp-123",
    "status": "created"
  }
}
```

**Error:**
```javascript
{
  "success": false,
  "error": "Error message here",
  "details": {
    // Optional error details
  }
}
```

---

## 🔧 Available Infrastructure

Your Lambda has access to all the shared infrastructure through **environment variables**:

### Environment Variables (Pre-configured)

```javascript
// In your Lambda code, these are available via process.env:

// Database
process.env.POSTGRES_HOST      // PostgreSQL endpoint
process.env.POSTGRES_PORT      // 5432
process.env.POSTGRES_DB        // meridian
process.env.POSTGRES_USER      // meridian_admin
// Password: Use Secrets Manager (see below)

// Redis
process.env.REDIS_HOST         // Redis endpoint
process.env.REDIS_PORT         // 6379

// DynamoDB
process.env.DYNAMODB_CLICK_EVENTS    // Click events table name
process.env.DYNAMODB_JOB_STATUS      // Job status table name

// S3
process.env.CONTENT_BUCKET     // S3 bucket for content

// Dispatcher
process.env.DISPATCHER_URL     // Internal URL for Dispatcher service

// General
process.env.ENVIRONMENT        // dev, staging, or prod
```

### Using PostgreSQL

```javascript
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.DB_PASSWORD,  // From Secrets Manager
  max: 5
});

async function query(sql, params) {
  const client = await pool.connect();
  try {
    const result = await client.query(sql, params);
    return result.rows;
  } finally {
    client.release();
  }
}

// Example usage
const campaigns = await query(
  'SELECT * FROM campaigns WHERE user_id = $1',
  [user.sub]
);
```

### Using DynamoDB

```javascript
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

async function saveClickEvent(clickData) {
  await dynamodb.put({
    TableName: process.env.DYNAMODB_CLICK_EVENTS,
    Item: {
      click_id: clickData.id,
      timestamp: Date.now(),
      user_id: clickData.userId,
      // ... other fields
      ttl: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60)  // 7 days
    }
  }).promise();
}
```

### Using SQS

```javascript
const AWS = require('aws-sdk');
const sqs = new AWS.SQS();

// Queue URLs are imported from infrastructure stack
// Get them from CloudFormation exports

async function sendToQueue(queueName, message) {
  const queueUrl = await getQueueUrl(queueName);
  
  await sqs.sendMessage({
    QueueUrl: queueUrl,
    MessageBody: JSON.stringify(message)
  }).promise();
}
```

### Calling the Dispatcher

```javascript
const axios = require('axios');

async function createCampaignInGoogle(campaignData) {
  const response = await axios.post(
    `${process.env.DISPATCHER_URL}/dispatcher/google/campaigns`,
    campaignData,
    {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
  
  return response.data;
}
```

### Using Bedrock (Claude AI)

```javascript
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

const bedrock = new BedrockRuntimeClient({ region: 'us-east-1' });

async function callClaude(prompt) {
  const command = new InvokeModelCommand({
    modelId: 'anthropic.claude-sonnet-4-20250514',
    body: JSON.stringify({
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 2000,
      messages: [{
        role: "user",
        content: prompt
      }]
    })
  });
  
  const response = await bedrock.send(command);
  const responseBody = JSON.parse(new TextDecoder().decode(response.body));
  return responseBody.content[0].text;
}
```

---

## 🔐 Database Password (Secrets Manager)

**NEVER hardcode the database password!**

### Option 1: Store in Secrets Manager (Recommended)

```bash
# One-time setup (Jason or team lead does this)
aws secretsmanager create-secret \
  --name meridian/db/password \
  --secret-string "YOUR_SECURE_PASSWORD"
```

**In your Lambda code:**
```javascript
const AWS = require('aws-sdk');
const secretsManager = new AWS.SecretsManager();

async function getDatabasePassword() {
  const secret = await secretsManager.getSecretValue({
    SecretId: 'meridian/db/password'
  }).promise();
  
  return secret.SecretString;
}

// Use it
const password = await getDatabasePassword();
const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  password: password,
  // ... other config
});
```

### Option 2: Environment Variable (Less Secure)

Add to your template.yaml:
```yaml
Environment:
  Variables:
    DB_PASSWORD: !Sub '{{resolve:secretsmanager:meridian/db/password}}'
```

---

## 📦 Common Dependencies

Add these to your `package.json` as needed:

```json
{
  "dependencies": {
    "pg": "^8.11.0",                    // PostgreSQL
    "ioredis": "^5.3.0",                // Redis
    "aws-sdk": "^2.1467.0",             // AWS services (v2)
    "@aws-sdk/client-bedrock-runtime": "^3.450.0",  // Bedrock (v3)
    "aws-xray-sdk-core": "^3.5.3",      // X-Ray tracing
    "axios": "^1.6.0"                   // HTTP requests
  }
}
```

---

## 🧪 Testing Your Lambda

### Local Testing

```bash
# Create a test event
cat > test-event.json << EOF
{
  "action": "test",
  "data": {
    "message": "Hello"
  },
  "user": {
    "sub": "test-user-123",
    "email": "test@example.com"
  }
}
EOF

# Test locally (won't have VPC access to RDS/Redis)
sam local invoke ServiceFunction -e test-event.json
```

### Testing After Deployment

```bash
# Invoke in AWS
aws lambda invoke \
  --function-name meridian-YOUR-SERVICE-dev \
  --payload file://test-event.json \
  response.json

cat response.json
```

### View Logs

```bash
# Tail logs in real-time
sam logs -n ServiceFunction --stack-name meridian-YOUR-SERVICE-dev --tail

# Or via AWS CLI
aws logs tail /aws/lambda/meridian-YOUR-SERVICE-dev --follow
```

---

## 🔄 Updating Your Service

After making code changes:

```bash
# Rebuild
sam build

# Deploy (no prompts, uses saved config)
sam deploy

# Or with confirmation
sam deploy --no-confirm-changeset
```

---

## 📊 Monitoring

### CloudWatch Logs
```bash
# View recent logs
aws logs tail /aws/lambda/meridian-YOUR-SERVICE-dev --since 1h

# Follow logs
aws logs tail /aws/lambda/meridian-YOUR-SERVICE-dev --follow
```

### X-Ray Traces
1. Open AWS Console
2. Go to X-Ray → Service Map
3. See your Lambda in the service graph
4. Click to view traces

### Metrics
Your Lambda automatically tracks:
- Invocations
- Duration
- Errors
- Throttles

View in CloudWatch → Metrics → Lambda

---

## 🐛 Troubleshooting

### My Lambda can't connect to PostgreSQL

**Check:**
1. Is your Lambda in the VPC? (template has VpcConfig)
2. Is the security group correct? (using imported LambdaSG)
3. Is the database password correct?

**Debug:**
```javascript
console.log('Postgres Host:', process.env.POSTGRES_HOST);
console.log('Postgres Port:', process.env.POSTGRES_PORT);

// Test connection
const client = await pool.connect();
console.log('Connected to database!');
client.release();
```

### My Lambda times out

**Common causes:**
1. Database query taking too long
2. Waiting for external API
3. Cold start in VPC (first invocation)

**Solutions:**
- Increase timeout in template.yaml (default 30s)
- Add indexes to database queries
- Use connection pooling
- Consider provisioned concurrency for production

### I get "Resource not found" errors

**Likely cause:** Infrastructure stack exports not found

**Check:**
```bash
# Verify infrastructure is deployed
aws cloudformation describe-stacks --stack-name meridian-infrastructure-dev

# Check exports exist
aws cloudformation list-exports | grep Meridian
```

### Deployment fails with "No changes to deploy"

**This is normal!** SAM detected no changes. If you did make changes:
```bash
# Force rebuild
sam build --use-container

# Or delete .aws-sam folder
rm -rf .aws-sam
sam build
sam deploy
```

---

## 📚 Service-Specific Examples

### Example: Campaign Management Service

**Directory structure:**
```
campaign-mgmt/
├── template.yaml
├── index.js
├── package.json
└── handlers/
    ├── create.js
    ├── read.js
    ├── update.js
    └── delete.js
```

**index.js:**
```javascript
const createHandler = require('./handlers/create');
const readHandler = require('./handlers/read');
const updateHandler = require('./handlers/update');
const deleteHandler = require('./handlers/delete');

exports.handler = async (event) => {
  const { action, data, user } = event;
  
  try {
    switch (action) {
      case 'create_campaign':
        return await createHandler(data, user);
      case 'get_campaigns':
        return await readHandler(user);
      case 'update_campaign':
        return await updateHandler(data, user);
      case 'delete_campaign':
        return await deleteHandler(data, user);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error('Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
```

**handlers/create.js:**
```javascript
const { Pool } = require('pg');
const axios = require('axios');

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.DB_PASSWORD
});

module.exports = async function createCampaign(data, user) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Insert into database
    const result = await client.query(
      'INSERT INTO campaigns (user_id, name, budget, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [user.sub, data.name, data.budget, 'active']
    );
    
    const campaign = result.rows[0];
    
    // Call Dispatcher to create in Google Ads
    const dispatcherResponse = await axios.post(
      `${process.env.DISPATCHER_URL}/dispatcher/google/campaigns`,
      {
        name: campaign.name,
        budget: campaign.budget
      }
    );
    
    // Update with Google Ads ID
    await client.query(
      'UPDATE campaigns SET google_ads_id = $1 WHERE id = $2',
      [dispatcherResponse.data.campaignId, campaign.id]
    );
    
    await client.query('COMMIT');
    
    return {
      success: true,
      result: {
        ...campaign,
        google_ads_id: dispatcherResponse.data.campaignId
      }
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};
```

---

## 🎯 Checklist for Your Team

Before deploying, make sure you have:

- [ ] AWS CLI installed and configured
- [ ] SAM CLI installed
- [ ] Created your service directory
- [ ] Copied template-service.yaml
- [ ] Written your Lambda code (index.js)
- [ ] Created package.json with dependencies
- [ ] Updated ServiceName parameter in template
- [ ] Tested your code locally (if possible)
- [ ] Deployed with `sam deploy`
- [ ] Tested deployed function
- [ ] Checked CloudWatch logs
- [ ] Notified Jason of your function ARN (for Orchestrator)

---

## 📞 Getting Help

**Infrastructure issues:** Ask Jason  
**Lambda code issues:** Your team lead  
**AWS/SAM issues:** Check AWS documentation or Stack Overflow  

**Useful links:**
- AWS SAM Docs: https://docs.aws.amazon.com/serverless-application-model/
- Lambda Best Practices: https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html
- PostgreSQL Node.js: https://node-postgres.com/

---

## 🚀 Next Steps

1. Deploy your Lambda function
2. Test it thoroughly
3. Send Jason your function ARN:
   ```bash
   aws cloudformation describe-stacks \
     --stack-name meridian-YOUR-SERVICE-dev \
     --query 'Stacks[0].Outputs[?OutputKey==`FunctionArn`].OutputValue' \
     --output text
   ```
4. Jason will wire it into the Orchestrator
5. Test end-to-end through API Gateway

---

**Questions?** Reach out to Jason!
