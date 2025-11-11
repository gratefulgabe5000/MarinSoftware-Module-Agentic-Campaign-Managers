# Marin Dispatcher API - Quick Reference Guide

## API Endpoint Paths

All endpoints use the format: `/dispatcher/{publisher}/{resource}`

### Campaign Endpoints
```
POST   /dispatcher/google/campaigns                    # Create campaign
PUT    /dispatcher/google/campaigns/{id}               # Update campaign
GET    /dispatcher/google/campaigns/{id}               # Get campaign
GET    /dispatcher/google/campaigns?limit=10&offset=0  # List campaigns
```

### Ad Group Endpoints
```
POST   /dispatcher/google/adgroups                     # Create ad group
PUT    /dispatcher/google/adgroups/{id}                # Update ad group
GET    /dispatcher/google/adgroups/{id}                # Get ad group
POST   /dispatcher/google/adgroups/bulk                # Bulk create ad groups
```

### Ad (RSA) Endpoints
```
POST   /dispatcher/google/ads                          # Create ad
PUT    /dispatcher/google/ads/{id}                     # Update ad
GET    /dispatcher/google/ads/{id}                     # Get ad
POST   /dispatcher/google/ads/bulk                     # Bulk create ads
```

### Keyword Endpoints
```
POST   /dispatcher/google/keywords                     # Create keyword
PUT    /dispatcher/google/keywords/{id}                # Update keyword
GET    /dispatcher/google/keywords/{id}                # Get keyword
POST   /dispatcher/google/keywords/bulk                # Bulk create keywords
```

### Batch Job Endpoints
```
POST   /dispatcher/google/batch-jobs                              # Create batch job
PUT    /dispatcher/google/batch-jobs/{id}/operations              # Add operations
POST   /dispatcher/google/batch-jobs/{id}/run                     # Run batch job
GET    /dispatcher/google/batch-jobs/{id}                         # Get batch status
GET    /dispatcher/google/batch-jobs/{id}/results                 # Get results
```

---

## Service Layer Quick Usage

### Create a Campaign
```typescript
import { MarinDispatcherService } from './services/marinDispatcherService';

const service = new MarinDispatcherService('account-123', 'google');

const response = await service.createCampaign({
  objective: 'sales',
  budget: { total: 1000 },
  timeline: { startDate: '2024-01-01', endDate: '2024-12-31' },
  platforms: ['google'],
}, 'My Campaign');

if (response.success) {
  console.log('Campaign created:', response.campaignId);
} else {
  console.error('Error:', response.error);
}
```

### Bulk Create Campaigns with Batch Job
```typescript
import { MarinBatchJobService } from './services/marinBatchJobService';

const batchService = new MarinBatchJobService('account-123', 'google');

const campaigns = [
  { accountId: 'account-123', name: 'Campaign 1', status: 'ENABLED', ... },
  { accountId: 'account-123', name: 'Campaign 2', status: 'ENABLED', ... },
  // ... up to 100,000 campaigns
];

const results = await batchService.bulkCreateCampaigns(campaigns);

console.log('Success:', results.summary.successfulOperations);
console.log('Failed:', results.summary.failedOperations);
```

### Lambda Handler Pattern
```typescript
import { MarinDispatcherClient } from './lib/marinDispatcherClient';

export const handler = async (event) => {
  const client = new MarinDispatcherClient();
  
  return await client.handleLambdaEvent({
    action: 'create_campaign',
    data: {
      campaignPlan: { ... },
      name: 'Campaign Name'
    },
    user: { sub: 'user-id' }
  });
};
```

---

## Request/Response Format Examples

### Create Campaign Request
```json
{
  "accountId": "account-123",
  "name": "Summer Sale Campaign",
  "status": "ENABLED",
  "budget": {
    "amount": 1000,
    "deliveryMethod": "STANDARD"
  },
  "biddingStrategy": "MANUAL_CPC",
  "objective": "SALES"
}
```

### Create Campaign Response (Success)
```json
{
  "id": "campaign-456",
  "accountId": "account-123",
  "name": "Summer Sale Campaign",
  "campaignStatus": "ENABLED",
  "budget": {
    "amount": 1000,
    "deliveryMethod": "STANDARD"
  },
  "biddingStrategy": "MANUAL_CPC",
  "status": "SUCCESS",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### Batch Job Results Response
```json
{
  "jobId": "batch-789",
  "jobStatus": "DONE",
  "summary": {
    "totalOperations": 100,
    "successfulOperations": 95,
    "failedOperations": 5
  },
  "results": [
    {
      "operationId": "op-1",
      "resourceType": "CAMPAIGN",
      "resourceId": "campaign-123",
      "status": "SUCCESS"
    },
    {
      "operationId": "op-2",
      "resourceType": "CAMPAIGN",
      "resourceId": null,
      "status": "FAILURE",
      "error": "Invalid campaign name"
    }
  ]
}
```

---

## Environment Variables Required

```bash
# Marin Dispatcher Configuration
DISPATCHER_URL=http://meridian-dispatcher-alb-dev.region.elb.amazonaws.com
MARIN_DISPATCHER_ACCOUNT_ID=your-marin-account-id
MARIN_DISPATCHER_PUBLISHER=google          # or meta, microsoft
MARIN_DISPATCHER_TIMEOUT=10000             # milliseconds
```

---

## Validation Rules Quick Check

### Campaign
- `accountId`: Required, non-empty string
- `name`: Required, max 255 characters
- `status`: ENABLED, PAUSED, or REMOVED
- `budget.amount`: Required, positive number (in dollars, NOT micros)
- `budget.deliveryMethod`: STANDARD or ACCELERATED
- `biddingStrategy`: Required, non-empty string
- `objective`: Optional, string if provided

### Keyword
- `text`: Required, max 80 characters
- `matchType`: BROAD, PHRASE, or EXACT
- `cpcBid`: Optional, must be positive
- `status`: ENABLED, PAUSED, or REMOVED (optional)

### Ad (RSA)
- `headlines`: 3-15 items, max 30 chars each
- `descriptions`: 2-4 items, max 90 chars each
- `finalUrl`: Required, must be valid URL
- `displayUrl`: Optional
- `paths`: Optional array of strings

---

## Error Handling Patterns

### Check validation before API call
```typescript
import { validateCampaignRequest } from './utils/marinTypeValidators';

const validation = validateCampaignRequest(request);
if (!validation.isValid) {
  console.error('Validation errors:', validation.errors);
  return { success: false, error: validation.errors.join(', ') };
}
```

### Handle platform response
```typescript
const response = await service.createCampaign(plan, name);

if (!response.success) {
  console.error('API Error:', response.error);
  console.error('Details:', response.details);
  // Handle error
} else {
  console.log('Campaign ID:', response.campaignId);
}
```

### SQS Error Handling (Partial Success)
```typescript
const result = await client.handleSqsEvent(event);

if (result.success) {
  console.log(`Processed: ${result.result.processed}, Failed: ${result.result.failed}`);
  
  // Some may have failed - check details
  if (result.result.errors?.length > 0) {
    console.warn('Failed records:', result.result.errors);
  }
}
```

---

## Batch Job Workflow Summary

1. **Create Batch Job** → Get `batchJobId`
2. **Add Operations** (max 1000 per request) → Track `sequenceToken`
3. **Run Batch Job** → Job starts processing
4. **Poll Status** → Wait for DONE/FAILED/CANCELLED
5. **Get Results** → Summary + individual operation results

### Polling Intervals
- Initial: 5 seconds
- Exponential backoff: doubles each retry
- Max: 30 seconds
- Default max attempts: 120 (10 minutes total)

---

## Common Status Codes

### Campaign/Resource Status
- `ENABLED` - Active and running
- `PAUSED` - Paused, not spending
- `REMOVED` - Deleted (soft delete)

### Batch Job Status
- `PENDING` - Created, waiting for operations
- `PROCESSING` - Running
- `DONE` - Completed successfully
- `FAILED` - Execution failed
- `CANCELLED` - User cancelled

### API Response Status
- `SUCCESS` - Operation completed successfully
- `FAILURE` - Operation failed, check errors array

---

## Performance Tips

1. **Batch Operations**: Use batch job API for >50 campaigns
   - Single API: 1 campaign at a time
   - Batch API: Up to 100,000 campaigns in single job

2. **Chunk Size**: Max 1000 operations per request
   - Automatically handled by bulkCreateCampaigns()
   - Sequence token managed across chunks

3. **Polling Strategy**: Use exponential backoff
   - Reduces API load
   - Adaptive to network conditions
   - Configurable retry count and interval

4. **X-Ray Tracing**: Enabled automatically in Lambda
   - Fine-grained subsegments per operation
   - Performance metrics visible in AWS Console

---

## Files to Reference

| Purpose | File |
|---------|------|
| Core API integration | `/backend/src/services/marinDispatcherService.ts` |
| Batch operations | `/backend/src/services/marinBatchJobService.ts` |
| Lambda dispatcher | `/backend/src/lib/marinDispatcherClient.ts` |
| Lambda batch jobs | `/backend/src/lib/marinBatchJobClient.ts` |
| Type definitions | `/backend/src/types/marinDispatcher.types.ts` |
| Validation rules | `/backend/src/utils/marinTypeValidators.ts` |
| Configuration | `/backend/src/config/env.ts` |
| Error handling | `/backend/src/middleware/errorHandler.ts` |
| REST routes | `/backend/src/routes/campaigns.ts` |

---

## Debugging Tips

### Enable detailed logging
```typescript
// In services
console.log('[Marin Dispatcher]', 'Operation details:', {
  endpoint: this.buildApiPath(endpoint),
  request: request,
  timestamp: new Date().toISOString(),
});
```

### Check X-Ray traces in AWS Console
- Lambda function execution
- API call latency
- Service dependencies

### Validate with curl (local dev)
```bash
curl -X POST http://localhost:8080/dispatcher/google/campaigns \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "test-123",
    "name": "Test Campaign",
    "status": "ENABLED",
    "budget": {"amount": 100, "deliveryMethod": "STANDARD"},
    "biddingStrategy": "MANUAL_CPC"
  }'
```

### Test batch job flow
1. Create batch job
2. Add operations (check sequenceToken)
3. Run batch job
4. Poll status (every 5s)
5. Get results when DONE

