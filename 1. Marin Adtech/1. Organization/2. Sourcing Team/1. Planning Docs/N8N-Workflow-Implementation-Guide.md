# N8N Workflow Implementation Guide: LinkedIn Lead Scraper

## Quick Start Guide

This guide provides step-by-step instructions for building the LinkedIn Performance Marketers scraper workflow in N8N.

---

## Prerequisites

1. **N8N Instance:** Self-hosted or cloud (n8n.io)
2. **BrightData Account:** API access configured
3. **PostgreSQL Database:** Database and schema created
4. **CRM Access:** Salesforce or HubSpot API credentials (optional)

---

## Step-by-Step Workflow Build

### Step 1: Schedule Trigger

**Node Type:** Cron Trigger  
**Node Name:** `Daily Scheduler`

**Configuration:**
- **Trigger Times:** Daily at 2:00 AM
- **Cron Expression:** `0 2 * * *`
- **Timezone:** Your timezone

**Purpose:** Automates daily collection runs during off-peak hours

---

### Step 2: Search Criteria Setup

**Node Type:** Code Node  
**Node Name:** `Search Criteria`

**Code:**
```javascript
// Search criteria configuration
const searchCriteria = {
  jobTitles: [
    'Performance Marketing Manager',
    'Paid Media Manager',
    'Digital Marketing Manager',
    'PPC Manager',
    'SEM Manager',
    'Marketing Operations Manager',
    'Growth Marketing Manager',
    'Customer Acquisition Manager',
    'Media Buyer',
    'Ad Operations Manager'
  ],
  locations: [
    'United States',
    'New York, New York, United States',
    'San Francisco, California, United States',
    'Los Angeles, California, United States',
    'Chicago, Illinois, United States',
    'Boston, Massachusetts, United States',
    'Seattle, Washington, United States',
    'Austin, Texas, United States',
    'Denver, Colorado, United States',
    'Atlanta, Georgia, United States'
  ],
  industries: [
    'Technology',
    'E-commerce',
    'Retail',
    'SaaS',
    'Marketing',
    'Advertising'
  ],
  companySizes: [
    '11-50',
    '51-200',
    '201-500',
    '501-1000',
    '1001-5000',
    '5001-10000'
  ]
};

// Return search criteria as array of items for processing
return searchCriteria.jobTitles.map(title => ({
  json: {
    jobTitle: title,
    locations: searchCriteria.locations,
    industries: searchCriteria.industries,
    companySizes: searchCriteria.companySizes
  }
}));
```

**Purpose:** Defines search parameters for LinkedIn scraping

---

### Step 3: BrightData API Integration

**Node Type:** HTTP Request  
**Node Name:** `BrightData LinkedIn Scraper`

**Configuration:**
- **Method:** POST
- **URL:** `https://api.brightdata.com/linkedin/scraper`
- **Authentication:** Generic Credential Type
  - **Type:** Header Auth
  - **Name:** `Authorization`
  - **Value:** `Bearer YOUR_BRIGHTDATA_API_KEY`

**Headers:**
```
Authorization: Bearer YOUR_BRIGHTDATA_API_KEY
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "search_query": "={{$json.jobTitle}}",
  "location": "={{$json.locations[0]}}",
  "limit": 100,
  "offset": 0,
  "filters": {
    "industries": "={{$json.industries}}",
    "company_sizes": "={{$json.companySizes}}"
  }
}
```

**Options:**
- **Timeout:** 30000 (30 seconds)
- **Response Format:** JSON

**Rate Limiting:**
- Add "Wait" node after this to limit to 1 request per 2 seconds

**Purpose:** Calls BrightData API to scrape LinkedIn profiles

---

### Step 4: Wait Node (Rate Limiting)

**Node Type:** Wait  
**Node Name:** `Rate Limiter`

**Configuration:**
- **Wait Time:** 2 seconds
- **Units:** Seconds

**Purpose:** Implements rate limiting to avoid API throttling

---

### Step 5: Parse BrightData Response

**Node Type:** Code Node  
**Node Name:** `Parse Response`

**Code:**
```javascript
// Parse BrightData API response
const items = $input.all();
const parsedProfiles = [];

for (const item of items) {
  const response = item.json;
  
  // BrightData returns profiles in response.data or response.results
  const profiles = response.data || response.results || [];
  
  for (const profile of profiles) {
    parsedProfiles.push({
      json: {
        linkedin_url: profile.profile_url || profile.url || '',
        linkedin_profile_id: profile.profile_id || profile.id || '',
        full_name: profile.full_name || profile.name || '',
        job_title: profile.job_title || profile.title || '',
        company_name: profile.company_name || profile.company || '',
        company_linkedin_url: profile.company_linkedin_url || profile.company_url || '',
        company_website: profile.company_website || '',
        location_city: profile.location_city || profile.city || '',
        location_state: profile.location_state || profile.state || '',
        location_country: profile.location_country || profile.country || 'United States',
        profile_picture_url: profile.profile_picture_url || profile.picture_url || '',
        data_source: 'brightdata_linkedin',
        data_collected_date: new Date().toISOString()
      }
    });
  }
}

return parsedProfiles;
```

**Purpose:** Parses BrightData API response and extracts profile data

---

### Step 6: Split into Items

**Node Type:** Split In Batches  
**Node Name:** `Split for Processing`

**Configuration:**
- **Batch Size:** 10 (process 10 profiles at a time)

**Purpose:** Splits profiles into batches for efficient processing

---

### Step 7: Check for Duplicates

**Node Type:** PostgreSQL  
**Node Name:** `Check Duplicates`

**Configuration:**
- **Operation:** Execute Query
- **Query:**
```sql
SELECT linkedin_url, id 
FROM performance_marketers 
WHERE linkedin_url = $1
```
- **Query Values:**
  - `$1`: `={{$json.linkedin_url}}`

**Options:**
- **Continue on Fail:** True

**Purpose:** Checks if profile already exists in database

---

### Step 8: Filter Duplicates

**Node Type:** IF Node  
**Node Name:** `Filter New Records`

**Configuration:**
- **Condition:** `{{$json.linkedin_url}}` is empty (no existing record)
- **Operation:** `{{$json.linkedin_url}} === ''`

**Purpose:** Filters out duplicate records, only processes new ones

---

### Step 9: Data Enrichment - Company Data

**Node Type:** HTTP Request  
**Node Name:** `Enrich Company Data (Clearbit)`

**Configuration:**
- **Method:** GET
- **URL:** `https://company.clearbit.com/v2/companies/find`
- **Authentication:** Header Auth
  - **Name:** `Authorization`
  - **Value:** `Bearer YOUR_CLEARBIT_API_KEY`
- **Query Parameters:**
  - `domain`: `={{$json.company_website}}` (extract domain from URL)

**Purpose:** Enriches company data using Clearbit API

---

### Step 10: Data Enrichment - Email Finding

**Node Type:** HTTP Request  
**Node Name:** `Find Email (Hunter.io)`

**Configuration:**
- **Method:** GET
- **URL:** `https://api.hunter.io/v2/email-finder`
- **Query Parameters:**
  - `domain`: `={{$json.company_website}}`
  - `first_name`: `={{$json.full_name.split(' ')[0]}}`
  - `last_name`: `={{$json.full_name.split(' ')[1]}}`
  - `api_key`: `YOUR_HUNTER_API_KEY`

**Options:**
- **Continue on Fail:** True

**Purpose:** Finds email addresses for profiles

---

### Step 11: Merge Enriched Data

**Node Type:** Merge Node  
**Node Name:** `Merge Enriched Data`

**Configuration:**
- **Mode:** Merge By Position
- **Merge Fields:**
  - Company data from Clearbit
  - Email from Hunter.io
  - Original profile data

**Purpose:** Merges all enriched data into single record

---

### Step 12: Data Validation

**Node Type:** Code Node  
**Node Name:** `Validate Data`

**Code:**
```javascript
// Validate data quality
const item = $input.first().json;

const validation = {
  hasRequiredFields: !!(item.full_name && item.linkedin_url && item.company_name),
  hasEmail: !!item.email,
  hasCompanyData: !!(item.company_website || item.company_linkedin_url),
  emailValid: item.email ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item.email) : false,
  dataQualityScore: 0
};

// Calculate data quality score
if (validation.hasRequiredFields) validation.dataQualityScore += 30;
if (validation.hasEmail && validation.emailValid) validation.dataQualityScore += 30;
if (validation.hasCompanyData) validation.dataQualityScore += 20;
if (item.job_title) validation.dataQualityScore += 10;
if (item.location_city && item.location_state) validation.dataQualityScore += 10;

return {
  json: {
    ...item,
    is_validated: validation.hasRequiredFields && validation.dataQualityScore >= 60,
    data_quality_score: validation.dataQualityScore,
    validation_errors: Object.keys(validation).filter(k => !validation[k])
  }
};
```

**Purpose:** Validates data quality and calculates quality score

---

### Step 13: Store in Database

**Node Type:** PostgreSQL  
**Node Name:** `Store in Database`

**Configuration:**
- **Operation:** Insert
- **Table:** `performance_marketers`
- **Columns:** 
  - `linkedin_url`
  - `linkedin_profile_id`
  - `full_name`
  - `job_title`
  - `company_name`
  - `company_linkedin_url`
  - `company_website`
  - `location_city`
  - `location_state`
  - `location_country`
  - `email`
  - `profile_picture_url`
  - `company_size`
  - `company_industry`
  - `data_source`
  - `data_collected_date`
  - `data_quality_score`
  - `is_validated`

**Options:**
- **On Conflict:** Update existing record

**Purpose:** Stores validated profiles in database

---

### Step 14: Sync to CRM (Optional)

**Node Type:** Salesforce / HubSpot  
**Node Name:** `Sync to CRM`

**Configuration (HubSpot Example):**
- **Operation:** Create Contact
- **Properties:**
  - `firstname`: `={{$json.full_name.split(' ')[0]}}`
  - `lastname`: `={{$json.full_name.split(' ').slice(1).join(' ')}}`
  - `email`: `={{$json.email}}`
  - `jobtitle`: `={{$json.job_title}}`
  - `company`: `={{$json.company_name}}`
  - `linkedin_url`: `={{$json.linkedin_url}}`
  - `city`: `={{$json.location_city}}`
  - `state`: `={{$json.location_state}}`

**Purpose:** Syncs profiles to CRM for sales team

---

### Step 15: Reporting & Monitoring

**Node Type:** Code Node  
**Node Name:** `Generate Report`

**Code:**
```javascript
// Generate collection statistics
const items = $input.all();
const stats = {
  total_collected: items.length,
  with_email: items.filter(i => i.json.email).length,
  validated: items.filter(i => i.json.is_validated).length,
  average_quality_score: items.reduce((sum, i) => sum + (i.json.data_quality_score || 0), 0) / items.length,
  timestamp: new Date().toISOString()
};

return {
  json: stats
};
```

**Purpose:** Generates collection statistics

---

### Step 16: Send Notification (Optional)

**Node Type:** Slack / Email  
**Node Name:** `Send Notification`

**Configuration (Slack Example):**
- **Channel:** `#sourcing-team`
- **Message:**
```
📊 LinkedIn Lead Collection Report
Total Profiles Collected: {{$json.total_collected}}
With Email: {{$json.with_email}}
Validated: {{$json.validated}}
Average Quality Score: {{$json.average_quality_score}}
```

**Purpose:** Sends daily collection report to team

---

## Workflow Connections

```
Daily Scheduler
  → Search Criteria
    → BrightData LinkedIn Scraper
      → Rate Limiter
        → Parse Response
          → Split for Processing
            → Check Duplicates
              → Filter New Records
                → Enrich Company Data (Clearbit)
                  → Find Email (Hunter.io)
                    → Merge Enriched Data
                      → Validate Data
                        → Store in Database
                          → Sync to CRM (Optional)
                            → Generate Report
                              → Send Notification (Optional)
```

---

## Error Handling

### Add Error Handling Nodes

1. **Error Trigger Node:** Catch all errors
2. **Error Logging Node:** Log errors to database or file
3. **Error Notification Node:** Send error alerts
4. **Retry Logic:** Retry failed requests (max 3 attempts)

---

## Testing Checklist

### Phase 1: Basic Testing
- [ ] Test scheduler trigger
- [ ] Test search criteria setup
- [ ] Test BrightData API connection
- [ ] Test data parsing
- [ ] Test duplicate checking
- [ ] Test database storage

### Phase 2: Integration Testing
- [ ] Test data enrichment (Clearbit)
- [ ] Test email finding (Hunter.io)
- [ ] Test data validation
- [ ] Test CRM sync (if applicable)
- [ ] Test error handling

### Phase 3: Production Testing
- [ ] Run full workflow (small batch: 10-50 profiles)
- [ ] Validate data quality
- [ ] Check rate limiting
- [ ] Monitor system performance
- [ ] Review error logs

---

## Optimization Tips

1. **Batch Processing:** Process profiles in batches (10-50 at a time)
2. **Rate Limiting:** Implement conservative rate limits (1-2 requests/second)
3. **Error Handling:** Add retry logic for failed requests
4. **Data Caching:** Cache company data to avoid duplicate API calls
5. **Parallel Processing:** Use N8N's parallel execution where possible
6. **Cost Optimization:** Minimize API calls, use free tiers where available

---

## Troubleshooting

### Common Issues

1. **BrightData API Errors:**
   - Check API key validity
   - Verify rate limits
   - Check account quota

2. **Database Connection Errors:**
   - Verify database credentials
   - Check database connectivity
   - Verify table schema

3. **Data Enrichment Errors:**
   - Check API keys
   - Verify API quotas
   - Handle missing data gracefully

4. **Workflow Execution Errors:**
   - Check node configurations
   - Verify data formats
   - Review error logs

---

## Next Steps

1. **Set up N8N instance** (self-hosted or cloud)
2. **Configure BrightData API** access
3. **Create PostgreSQL database** and schema
4. **Build workflow** step-by-step using this guide
5. **Test workflow** with small batch
6. **Scale to production** volume
7. **Monitor and optimize** continuously

---

*Document Created: January 2025*  
*For: Marin Software Revival - Sourcing Team*

