# Lambda Function Code Structure

This directory shows the recommended structure for your Lambda functions.

## Directory Structure

```
src/
├── main-api/
│   ├── index.js              # Handler
│   ├── package.json
│   └── lib/
│       ├── orchestrator.js   # Business logic
│       └── auth.js           # Auth helpers
├── orchestrator/
│   ├── index.js
│   ├── package.json
│   ├── direct-executor.js    # Direct path
│   └── agentic-executor.js   # Agentic path with LLM
├── campaign-mgmt/
│   ├── index.js
│   ├── package.json
│   ├── handlers/
│   │   ├── create.js
│   │   ├── read.js
│   │   ├── update.js
│   │   └── delete.js
│   └── lib/
│       ├── db.js             # Database connection
│       └── dispatcher.js     # Dispatcher client
└── shared/                    # Shared Lambda Layer
    ├── nodejs/
    │   └── node_modules/
    │       └── @meridian/
    │           ├── db/       # Shared DB utilities
    │           ├── logger/   # Logging
    │           └── xray/     # X-Ray helpers
    └── package.json
```

## Example: Main API Lambda

### index.js
```javascript
const express = require('express');
const serverless = require('serverless-http');
const AWSXRay = require('aws-xray-sdk-core');
const AWS = AWSXRay.captureAWS(require('aws-sdk'));

const app = express();
app.use(express.json());

const lambda = new AWS.Lambda();

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Route to orchestrator
app.all('/api/:action', async (req, res) => {
  try {
    const segment = AWSXRay.getSegment();
    const subsegment = segment.addNewSubsegment('InvokeOrchestrator');
    
    const result = await lambda.invoke({
      FunctionName: process.env.ORCHESTRATOR_FUNCTION_NAME,
      Payload: JSON.stringify({
        action: req.params.action,
        method: req.method,
        data: req.body,
        query: req.query,
        mode: req.headers['x-meridian-mode'] || 'direct',
        user: req.requestContext?.authorizer?.claims || {}
      })
    }).promise();
    
    subsegment.close();
    
    const response = JSON.parse(result.Payload);
    
    if (result.FunctionError) {
      res.status(500).json({ error: response.errorMessage });
    } else {
      res.json(response);
    }
  } catch (error) {
    console.error('Error invoking orchestrator:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

module.exports.handler = serverless(app);
```

### package.json
```json
{
  "name": "meridian-main-api",
  "version": "1.0.0",
  "dependencies": {
    "express": "^4.18.2",
    "serverless-http": "^3.2.0",
    "aws-xray-sdk-core": "^3.5.3",
    "aws-sdk": "^2.1467.0"
  }
}
```

## Example: Orchestrator Lambda

### index.js
```javascript
const DirectExecutor = require('./direct-executor');
const AgenticExecutor = require('./agentic-executor');
const AWSXRay = require('aws-xray-sdk-core');

const directExecutor = new DirectExecutor();
const agenticExecutor = new AgenticExecutor();

exports.handler = async (event) => {
  const segment = AWSXRay.getSegment();
  
  try {
    console.log('Orchestrator received:', JSON.stringify(event));
    
    const { mode, action, data, user } = event;
    
    // Routing decision
    if (mode === 'agentic') {
      const subsegment = segment.addNewSubsegment('AgenticExecution');
      
      // Enhance with AI
      const enhanced = await agenticExecutor.enhance(action, data, user);
      
      subsegment.close();
      
      // Execute with enhanced data
      return await directExecutor.execute(action, enhanced, user);
    } else {
      // Direct execution
      return await directExecutor.execute(action, data, user);
    }
  } catch (error) {
    console.error('Orchestrator error:', error);
    segment.addError(error);
    throw error;
  }
};
```

### direct-executor.js
```javascript
const AWS = require('aws-sdk');

class DirectExecutor {
  constructor() {
    this.lambda = new AWS.Lambda();
  }
  
  async execute(action, data, user) {
    const functionMap = {
      'create_campaign': process.env.CAMPAIGN_MGMT_FUNCTION,
      'get_campaigns': process.env.CAMPAIGN_MGMT_FUNCTION,
      'bulk_create': process.env.BULK_CREATE_FUNCTION,
      'refresh_copy': process.env.COPY_REFRESH_FUNCTION,
    };
    
    const functionName = functionMap[action];
    if (!functionName) {
      throw new Error(`Unknown action: ${action}`);
    }
    
    const result = await this.lambda.invoke({
      FunctionName: functionName,
      Payload: JSON.stringify({ action, data, user })
    }).promise();
    
    return JSON.parse(result.Payload);
  }
}

module.exports = DirectExecutor;
```

### agentic-executor.js
```javascript
const { 
  BedrockRuntimeClient, 
  InvokeModelCommand 
} = require('@aws-sdk/client-bedrock-runtime');

class AgenticExecutor {
  constructor() {
    this.bedrock = new BedrockRuntimeClient({ 
      region: process.env.AWS_REGION 
    });
  }
  
  async enhance(action, data, user) {
    console.log('Enhancing with AI:', action);
    
    const prompt = this.buildPrompt(action, data, user);
    
    const command = new InvokeModelCommand({
      modelId: process.env.BEDROCK_MODEL_ID,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 2000,
        messages: [{
          role: "user",
          content: prompt
        }]
      })
    });
    
    const response = await this.bedrock.send(command);
    const responseBody = JSON.parse(
      new TextDecoder().decode(response.body)
    );
    
    // Extract enhanced data from Claude's response
    const enhanced = this.parseResponse(responseBody.content[0].text);
    
    return {
      ...data,
      ...enhanced,
      _aiEnhanced: true,
      _suggestions: enhanced.suggestions
    };
  }
  
  buildPrompt(action, data, user) {
    switch (action) {
      case 'create_campaign':
        return `
You are an expert digital marketer. Enhance this campaign request:

User Input:
${JSON.stringify(data, null, 2)}

User Context:
- User ID: ${user.sub}
- Email: ${user.email}

Provide:
1. Optimized budget allocation across channels
2. Suggested keywords based on industry best practices
3. Recommended targeting options
4. 3 variations of ad copy
5. Predicted CTR and conversion rate

Respond with valid JSON only, matching this structure:
{
  "budgetAllocation": { "search": 3000, "display": 1500, "video": 500 },
  "keywords": ["keyword1", "keyword2"],
  "targeting": { "age": "25-45", "interests": [...] },
  "adCopyVariants": ["variant1", "variant2", "variant3"],
  "predictions": { "ctr": 2.5, "conversion": 3.2 },
  "suggestions": ["suggestion1", "suggestion2"],
  "reasoning": "Why these suggestions work..."
}
`;
      
      default:
        return `Enhance this ${action} request: ${JSON.stringify(data)}`;
    }
  }
  
  parseResponse(text) {
    // Remove markdown code blocks if present
    const cleaned = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    try {
      return JSON.parse(cleaned);
    } catch (error) {
      console.error('Failed to parse AI response:', cleaned);
      throw new Error('Invalid AI response format');
    }
  }
}

module.exports = AgenticExecutor;
```

### package.json
```json
{
  "name": "meridian-orchestrator",
  "version": "1.0.0",
  "dependencies": {
    "@aws-sdk/client-bedrock-runtime": "^3.450.0",
    "aws-xray-sdk-core": "^3.5.3"
  }
}
```

## Example: Campaign Management Lambda

### index.js
```javascript
const { Pool } = require('pg');
const AWSXRay = require('aws-xray-sdk-core');
const handlers = require('./handlers');

// PostgreSQL connection pool
const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  port: 5432,
  max: 10,
  idleTimeoutMillis: 30000,
});

// Wrap pool with X-Ray
AWSXRay.capturePostgres(pool);

exports.handler = async (event) => {
  const { action, data, user } = event;
  
  console.log(`Campaign Management: ${action} for user ${user.sub}`);
  
  try {
    switch (action) {
      case 'create_campaign':
        return await handlers.create(pool, data, user);
      
      case 'get_campaigns':
        return await handlers.read(pool, user);
      
      case 'update_campaign':
        return await handlers.update(pool, data, user);
      
      case 'delete_campaign':
        return await handlers.deleteHandler(pool, data, user);
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error('Campaign management error:', error);
    throw error;
  }
};
```

### handlers/create.js
```javascript
const axios = require('axios');

async function create(pool, data, user) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Insert into PostgreSQL
    const result = await client.query(
      `INSERT INTO campaigns 
       (user_id, name, budget, status, created_at) 
       VALUES ($1, $2, $3, $4, NOW()) 
       RETURNING *`,
      [user.sub, data.name, data.budget, 'active']
    );
    
    const campaign = result.rows[0];
    
    // Call Dispatcher to create in Google Ads
    try {
      const dispatcherUrl = process.env.DISPATCHER_URL;
      const dispatcherResponse = await axios.post(
        `${dispatcherUrl}/dispatcher/google/campaigns`,
        {
          name: campaign.name,
          budget: campaign.budget,
          // ... other campaign details
        },
        {
          timeout: 10000,
          headers: {
            'X-User-ID': user.sub
          }
        }
      );
      
      // Update with external ID
      await client.query(
        'UPDATE campaigns SET google_ads_id = $1 WHERE id = $2',
        [dispatcherResponse.data.campaignId, campaign.id]
      );
      
      campaign.google_ads_id = dispatcherResponse.data.campaignId;
    } catch (dispatcherError) {
      console.error('Dispatcher error:', dispatcherError);
      // Campaign created in DB but failed in Google Ads
      // Handle accordingly (retry queue, alert, etc.)
    }
    
    await client.query('COMMIT');
    
    return {
      success: true,
      campaign
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = create;
```

### package.json
```json
{
  "name": "meridian-campaign-mgmt",
  "version": "1.0.0",
  "dependencies": {
    "pg": "^8.11.0",
    "axios": "^1.6.0",
    "aws-xray-sdk-core": "^3.5.3"
  }
}
```

## Shared Lambda Layer

Create a shared layer for common utilities:

### shared/nodejs/node_modules/@meridian/db/index.js
```javascript
const { Pool } = require('pg');

let pool;

function getPool() {
  if (!pool) {
    pool = new Pool({
      host: process.env.POSTGRES_HOST,
      database: process.env.POSTGRES_DB,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      port: 5432,
      max: 10,
    });
  }
  return pool;
}

module.exports = { getPool };
```

### shared/nodejs/node_modules/@meridian/logger/index.js
```javascript
function log(level, message, meta = {}) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta
  }));
}

module.exports = {
  info: (msg, meta) => log('INFO', msg, meta),
  error: (msg, meta) => log('ERROR', msg, meta),
  warn: (msg, meta) => log('WARN', msg, meta),
  debug: (msg, meta) => log('DEBUG', msg, meta),
};
```

## Best Practices

### 1. Connection Pooling
- Reuse database connections across invocations
- Set appropriate pool size and timeouts

### 2. Error Handling
- Use try/catch blocks
- Log errors with context
- Return appropriate HTTP status codes

### 3. X-Ray Tracing
- Capture all AWS SDK calls
- Add custom subsegments for business logic
- Annotate with user/request IDs

### 4. Environment Variables
- Never hardcode credentials
- Use AWS Secrets Manager for sensitive data
- Validate required env vars on startup

### 5. Logging
- Use structured JSON logging
- Include correlation IDs
- Don't log sensitive data

### 6. Testing
```javascript
// campaign-mgmt.test.js
const handler = require('./index').handler;

describe('Campaign Management', () => {
  it('should create campaign', async () => {
    const event = {
      action: 'create_campaign',
      data: { name: 'Test', budget: 5000 },
      user: { sub: 'user-123', email: 'test@example.com' }
    };
    
    const result = await handler(event);
    
    expect(result.success).toBe(true);
    expect(result.campaign.name).toBe('Test');
  });
});
```

## Deployment

Add to your template.yaml:

```yaml
  CampaignMgmtFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: src/campaign-mgmt/
      Handler: index.handler
      Layers:
        - !Ref SharedLayer
      Environment:
        Variables:
          DISPATCHER_URL: !GetAtt DispatcherService.LoadBalancerUrl

  SharedLayer:
    Type: AWS::Serverless::LayerVersion
    Properties:
      LayerName: meridian-shared
      ContentUri: shared/
      CompatibleRuntimes:
        - nodejs20.x
```

Build and deploy:

```bash
sam build
sam deploy
```
