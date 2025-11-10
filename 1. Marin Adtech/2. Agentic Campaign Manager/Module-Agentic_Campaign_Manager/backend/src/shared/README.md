# Shared Lambda Layer

Shared Lambda Layer containing common dependencies and modules for Lambda functions.

## Structure

```
shared/
└── nodejs/
    └── node_modules/
        └── @meridian/
            └── dispatcher/  # MarinDispatcherClient library
                ├── lib/
                │   ├── marinDispatcherClient.js
                │   └── marinBatchJobClient.js
                └── types/
                    └── lambda.types.js
```

## Purpose

This Lambda Layer contains:
- `MarinDispatcherClient`: Client for campaign operations
- `MarinBatchJobClient`: Client for batch job operations
- Lambda type definitions

## Usage

Lambda functions can reference this layer to use the shared clients:

```javascript
const { MarinDispatcherClient } = require('/opt/nodejs/@meridian/dispatcher/lib/marinDispatcherClient');
```

## Deployment

This Lambda Layer should be:
- Built and packaged separately
- Deployed to AWS Lambda Layers
- Referenced by Lambda functions in their configuration

## Dependencies

The layer includes:
- `axios`: HTTP client
- `aws-xray-sdk-core`: AWS X-Ray tracing
- Type definitions for Lambda events and responses

