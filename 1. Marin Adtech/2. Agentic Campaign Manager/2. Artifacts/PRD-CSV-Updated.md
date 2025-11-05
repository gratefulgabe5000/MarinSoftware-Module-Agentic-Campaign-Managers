# Product Requirements Document (PRD) - CSV/URL-Based Campaign Generation MVP

**Document Version**: 2.0  
**Created**: January 2025  
**Last Updated**: January 2025  
**Project Timeline**: MVP Development  
**Framework**: React + TypeScript + Express + TypeScript (Node.js)  
**Target Platform**: Web Application Module  
**Integration Context**: Feature addition to Agentic Campaign Manager Module within Ad Development Environment (ADE)  
**Product Focus**: CSV/URL input → Ad Group & Keyword Generation → Spreadsheet Preview → Google Ads Export

---

## Executive Summary

**Product Vision**: Enable performance marketers to generate complete Google Ads campaign structures from CSV files or product URL lists by learning from existing high-performing campaigns. The system automatically creates ad groups, generates keywords, and produces responsive search ads (RSA) that can be edited in a spreadsheet-like interface before export to Google Ads Editor.

**Market Position**: Automates the tedious process of manually creating ad groups and keywords for product catalogs, reducing setup time from hours to minutes while maintaining consistency with existing campaign structures.

**Integration Model**: This feature integrates into the existing Agentic Campaign Manager module as a new workflow option within the broader Ad Development Environment (ADE). The ADE is a modular web application similar to Cursor, where tools are added as modules. Users can choose between conversational campaign creation (existing) or CSV/URL-based bulk generation (new).

**Success Metrics**: 
- **MVP Gate**: Complete end-to-end workflow functional
- **Core Value Proposition**: Upload CSV/URLs → System learns from existing campaigns → Generates 10 ad groups with 15-20 keywords each → Editable preview → Export to Google Ads Editor
- **Time Savings**: Reduce campaign setup time from 2-4 hours to < 15 minutes
- **Quality**: Generated keywords and ad copy match or exceed manual creation quality

---

## Product Overview

### **Mission Statement**

The CSV/URL-Based Campaign Generation feature transforms bulk product campaign creation by automatically generating ad groups, keywords, and responsive search ads from product lists while learning from existing high-performing campaigns. Marketers can review and edit all generated content in a familiar spreadsheet-like interface before exporting to Google Ads Editor.

### **Feature Definition**

The CSV/URL-Based Campaign Generation feature:
- Accepts CSV files or lists of product URLs as input
- Queries existing campaigns to extract structure, keywords, and ad copy patterns
- Generates up to 10 ad groups (one per product) with 15-20 keywords each
- Creates 1-2 responsive search ads per ad group
- Provides spreadsheet-like preview with full editing capabilities
- Exports validated CSV for Google Ads Editor upload
- Integrates seamlessly with existing conversational campaign creation workflow

### **Target Audience**

#### **Primary Persona: Performance Marketer Pat**
- **Use Case**: "I have 10 motorcycle product URLs and need to create ad groups for each. I want the system to learn from my existing motorcycle dealership campaigns and generate keywords and ad copy that match my current style."
- **Pain Points**: 
  - Manual keyword research takes hours
  - Maintaining consistency across ad groups is difficult
  - Copying structure from existing campaigns is tedious
  - Exporting to Google Ads Editor requires manual formatting

#### **Secondary Persona: E-commerce Manager Emma**
- **Use Case**: "I have a CSV with 50 products. I need to create search campaigns quickly without manually creating each ad group."
- **Pain Points**:
  - Bulk product campaign creation is time-consuming
  - Ensuring keyword quality at scale is challenging
  - Maintaining brand voice across many ad groups

---

## Technical Architecture

### **Technology Stack**

#### **Frontend**
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **State Management**: Zustand (existing pattern)
- **UI Libraries**: 
  - React Table (@tanstack/react-table) for spreadsheet preview
  - React Dropzone for file uploads
  - PapaParse for CSV parsing
- **Styling**: CSS Modules with responsive design

#### **Backend**
- **Runtime**: Node.js 18+
- **Framework**: Express 5.x with TypeScript
- **API Architecture**: RESTful API with Express Router
- **Libraries**:
  - `google-ads-api` for Google Ads API integration
  - `openai` or `@anthropic-ai/sdk` for LLM integration
  - `papaparse` for CSV parsing (shared with frontend)
  - `multer` for file upload handling
  - `csv-writer` for CSV export

#### **Module Integration**
- **ADE Architecture**: Modular web application (similar to Cursor)
- **Module Structure**: Self-contained module within ADE framework
- **Shared Services**: 
  - Authentication service (OAuth for Google Ads)
  - State management patterns
  - UI component library (if available)
- **Module Interface**: 
  - Exports main component for ADE integration
  - Follows ADE module lifecycle hooks
  - Uses ADE routing system

### **Module Structure**

```
Module-Agentic_Campaign_Manager/
├── src/
│   ├── components/
│   │   ├── csv-upload/          # New CSV upload components
│   │   ├── pattern-learning/    # New pattern learning components
│   │   ├── campaign-preview/    # New preview components
│   │   └── ...
│   ├── services/
│   │   └── ...                  # Shared services
│   ├── store/
│   │   └── ...                  # Shared state management
│   └── types/
│       ├── product.types.ts     # New product types
│       ├── campaign-patterns.types.ts  # New pattern types
│       └── ...
├── backend/
│   ├── src/
│   │   ├── services/
│   │   │   ├── productParsingService.ts        # New
│   │   │   ├── patternExtractionService.ts    # New
│   │   │   ├── adGroupGenerationService.ts     # New
│   │   │   ├── keywordGenerationService.ts    # New
│   │   │   ├── rsaGenerationService.ts         # New
│   │   │   ├── csvExportService.ts             # New
│   │   │   └── googleAdsService.ts             # Extend existing
│   │   ├── routes/
│   │   │   ├── products.ts                     # New
│   │   │   └── campaigns.ts                   # Extend existing
│   │   └── controllers/
│   │       └── ...                             # Extend existing
│   └── package.json
└── package.json
```

### **Data Flow**

```
1. User Input (CSV/URLs)
   ↓
2. Product Parsing & Validation
   ↓
3. OAuth Authentication (if not already connected)
   ↓
4. Query Existing Campaigns → Extract Patterns
   ↓
5. Generate Ad Groups (1 per product)
   ↓
6. Generate Keywords (15-20 per ad group)
   ↓
7. Generate RSA (1-2 per ad group)
   ↓
8. Spreadsheet Preview & Editing
   ↓
9. Validation
   ↓
10. CSV Export → Google Ads Editor
```

### **Service Architecture**

```
┌─────────────────────────────────────────────────────────┐
│ Frontend (React/TypeScript)                             │
├─────────────────────────────────────────────────────────┤
│ - CSVUploadComponent                                    │
│ - CampaignPatternViewer                                 │
│ - CampaignPreviewTable (Spreadsheet)                    │
│ - ExportButton                                          │
└─────────────────────────────────────────────────────────┘
                        ↕
┌─────────────────────────────────────────────────────────┐
│ Backend Services (Express/TypeScript)                  │
├─────────────────────────────────────────────────────────┤
│ - ProductParsingService                                 │
│ - OAuthService (existing - Google Ads auth)            │
│ - GoogleAdsService (extend existing)                   │
│ - PatternExtractionService                             │
│ - AdGroupGenerationService                             │
│ - KeywordGenerationService (LLM + Patterns)            │
│ - RSAGenerationService (LLM + Templates)               │
│ - ValidationService                                    │
│ - CSVExportService                                     │
└─────────────────────────────────────────────────────────┘
                        ↕
┌─────────────────────────────────────────────────────────┐
│ External APIs                                           │
├─────────────────────────────────────────────────────────┤
│ - Google Ads API (via google-ads-api library)          │
│ - OpenAI/Claude API (via openai/@anthropic-ai/sdk)     │
└─────────────────────────────────────────────────────────┘
```

### **Environment Variables**

**Required Environment Variables**:
```bash
# Google Ads API
GOOGLE_ADS_CLIENT_ID=your_client_id
GOOGLE_ADS_CLIENT_SECRET=your_client_secret
GOOGLE_ADS_REFRESH_TOKEN=your_refresh_token
GOOGLE_ADS_DEVELOPER_TOKEN=your_developer_token
GOOGLE_ADS_CUSTOMER_ID=your_customer_id

# LLM API (choose one)
OPENAI_API_KEY=your_openai_key
# OR
ANTHROPIC_API_KEY=your_anthropic_key

# Server Configuration
PORT=3001
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
```

**Optional Environment Variables**:
```bash
# Google Ads API Configuration
GOOGLE_ADS_API_VERSION=v16
GOOGLE_ADS_LOGIN_CUSTOMER_ID=your_login_customer_id

# LLM Configuration
LLM_MODEL=gpt-4-turbo-preview  # or claude-3-opus-20240229
LLM_MAX_TOKENS=2000
LLM_TEMPERATURE=0.7
```

### **Google Ads API Authentication**

**OAuth 2.0 Flow**:
1. User initiates OAuth flow through ADE module UI
2. Backend generates authorization URL using `OAuthService`
3. User redirected to Google OAuth consent screen
4. Google redirects back with authorization code
5. Backend exchanges code for access token and refresh token
6. Tokens stored securely (session or database)
7. Access token used for API requests
8. Refresh token used to obtain new access tokens when expired

**Token Management**:
- Access tokens expire after 1 hour
- Refresh tokens used to obtain new access tokens
- Tokens stored per user session or in secure database
- Token refresh handled automatically by `OAuthService`

**API Client Configuration**:
```typescript
import { GoogleAdsApi } from 'google-ads-api';

const client = new GoogleAdsApi({
  client_id: config.googleAdsClientId,
  client_secret: config.googleAdsClientSecret,
  developer_token: config.googleAdsDeveloperToken,
});

const customer = client.Customer({
  customer_id: config.googleAdsCustomerId,
  refresh_token: storedRefreshToken,
});
```

---

## Feature Requirements

### **Phase 1: MVP Foundation**

#### **1.0 CSV/URL Input Processing**

**Priority**: P0 (Must Have)  
**Estimated Effort**: 4 hours  
**User Story**: *"As a marketer, I can upload a CSV file or paste a list of product URLs so that the system can generate ad groups for each product."*

**Acceptance Criteria**:
- [ ] Accept CSV file upload (drag-and-drop or file picker)
- [ ] Accept plain text list of URLs (paste into textarea)
- [ ] Parse CSV with columns: Product Name, URL, Category, Price, Description
- [ ] Validate CSV format and provide clear error messages
- [ ] Extract product information from CSV columns
- [ ] Support up to 10 products for MVP (expandable later)
- [ ] Display parsed products in preview before generation
- [ ] Allow editing of parsed product data before generation

**Technical Requirements**:
- CSV parser library (PapaParse)
- File upload component with drag-and-drop (react-dropzone)
- Textarea for URL list input
- Product data validation
- Error handling for malformed CSV
- Product preview component

**CSV Format Specification**:
```csv
Product Name,URL,Category,Price,Description
Triumph Bonneville T120,https://example.com/triumph-bonneville,Motorcycles,12999,Classic British motorcycle with modern performance
Harley-Davidson Sportster,https://example.com/harley-sportster,Motorcycles,9999,Iconic American cruiser motorcycle
Ducati Monster 821,https://example.com/ducati-monster,Motorcycles,11999,Italian naked sportbike with aggressive styling
```

**URL List Format**:
```
https://example.com/triumph-bonneville
https://example.com/harley-sportster
https://example.com/ducati-monster
```

**Product Data Model**:
```typescript
interface ProductInput {
  id: string;
  name: string;
  url: string;
  category?: string;
  price?: number;
  description?: string;
  source: 'csv' | 'url_list';
}
```

---

#### **1.1 Existing Campaign Query & Pattern Extraction**

**Priority**: P0 (Must Have)  
**Estimated Effort**: 6 hours  
**User Story**: *"As a marketer, the system learns from my existing campaigns to generate keywords and ad copy that match my current style and structure."*

**Acceptance Criteria**:
- [ ] Authenticate with Google Ads API via OAuth (if not already connected)
- [ ] Query all existing campaigns in connected Google Ads account
- [ ] Extract ad group structure (names, themes, organization patterns)
- [ ] Identify high-performing keywords (by CTR, conversions, or ROAS)
- [ ] Extract ad copy patterns (headlines, descriptions, CTAs)
- [ ] Analyze budget and bidding patterns for reference
- [ ] Store extracted patterns for use in generation
- [ ] Display summary of learned patterns to user
- [ ] Allow user to select which campaigns to learn from (optional)

**Technical Requirements**:
- Google Ads API integration using `google-ads-api` library
- OAuth 2.0 authentication (extend existing `OAuthService`)
- Pattern extraction service with detailed algorithms
- Keyword performance analysis
- Ad copy pattern recognition
- Data storage for extracted patterns

**OAuth Flow**:
1. Check if user has valid Google Ads OAuth token
2. If not, initiate OAuth flow using existing `OAuthService`
3. Store tokens securely (session or database)
4. Use tokens to authenticate Google Ads API requests

**Query Scope**:
- Query all campaigns in connected account
- Filter by active/paused status (exclude deleted)
- Include campaign, ad group, keyword, and ad data
- Performance metrics: impressions, clicks, CTR, conversions, ROAS
- Date range: Last 30-90 days (configurable)

**Pattern Extraction Algorithm**:

**Ad Group Structure Extraction**:
1. Collect all ad group names from active campaigns
2. Analyze naming patterns:
   - Tokenize ad group names into words
   - Identify common patterns: "Brand + Model", "Product + Category", etc.
   - Calculate frequency of each pattern
   - Select most common pattern as naming convention
3. Identify themes:
   - Group ad groups by campaign
   - Extract common keywords/categories
   - Identify product categories or themes
4. Calculate average keywords per group:
   - Count keywords per ad group
   - Calculate mean, median, mode
   - Return average

**High-Performing Keywords Extraction**:
1. Query keywords with performance metrics:
   - Filter by CTR threshold (default: > 2%)
   - Filter by conversions (default: > 0)
   - Filter by ROAS (if available, default: > 2.0)
2. Sort by performance:
   - Primary: Conversions (descending)
   - Secondary: CTR (descending)
   - Tertiary: ROAS (descending)
3. Return top N keywords (default: 50)

**Ad Copy Pattern Extraction**:
1. Query all RSA ads from active campaigns
2. Extract headlines:
   - Tokenize headlines into words/phrases
   - Identify common structures:
     * Product name variations
     * Benefit statements
     * CTA patterns
   - Generate templates with placeholders: "{Brand} {Model} - {Benefit}"
3. Extract descriptions:
   - Similar analysis to headlines
   - Identify common patterns and CTAs
4. Calculate averages:
   - Average headlines per ad
   - Average descriptions per ad

**Bidding Pattern Extraction**:
1. Query campaign bid strategies
2. Calculate average CPC across all keywords
3. Identify bid strategy types:
   - Manual CPC
   - Target CPA
   - Target ROAS
   - Maximize conversions
4. Return most common strategy and average CPC

**Extracted Patterns**:
```typescript
interface CampaignPatterns {
  adGroupStructures: {
    namingConvention: string; // e.g., "Brand + Model"
    themes: string[];
    averageKeywordsPerGroup: number;
  };
  highPerformingKeywords: {
    keyword: string;
    matchType: string;
    ctr: number;
    conversions: number;
    roas?: number;
  }[];
  adCopyPatterns: {
    headlineTemplates: string[]; // e.g., "{Brand} {Model} - {Benefit}"
    descriptionTemplates: string[];
    commonCTAs: string[];
    averageHeadlinesPerAd: number;
    averageDescriptionsPerAd: number;
  };
  biddingPatterns: {
    averageCPC: number;
    bidStrategy: string;
  };
}
```

**API Endpoints**:
```typescript
// Query existing campaigns
GET /api/campaigns/query-patterns
  - Query params: accountId, dateRange (optional)
  - Headers: Authorization (OAuth token)
  - Response: CampaignPatterns

// Get high-performing keywords
GET /api/campaigns/high-performing-keywords
  - Query params: accountId, minCTR (optional), minConversions (optional)
  - Headers: Authorization (OAuth token)
  - Response: Keyword[]

// Get ad copy patterns
GET /api/campaigns/ad-copy-patterns
  - Query params: accountId
  - Headers: Authorization (OAuth token)
  - Response: AdCopyPatterns
```

---

#### **1.2 Ad Group Generation**

**Priority**: P0 (Must Have)  
**Estimated Effort**: 5 hours  
**User Story**: *"As a marketer, the system automatically creates one ad group per product using the structure from my existing campaigns."*

**Acceptance Criteria**:
- [ ] Generate up to 10 ad groups (one per product)
- [ ] Use existing campaign structure as template
- [ ] Name ad groups based on product name and learned naming convention
- [ ] Assign ad groups to appropriate campaign (user-selected or auto-selected)
- [ ] Validate ad group names against Google Ads requirements
- [ ] Display generated ad groups in preview

**Technical Requirements**:
- Ad group naming service (uses learned patterns)
- Campaign assignment logic
- Ad group validation
- Preview component

**Ad Group Generation Logic**:
```typescript
interface AdGroupGenerationRequest {
  products: ProductInput[];
  targetCampaignId?: string; // Optional: specific campaign
  namingConvention?: string; // Optional: override learned pattern
  maxAdGroups?: number; // Default: 10
}

interface GeneratedAdGroup {
  id: string;
  name: string;
  productId: string;
  campaignId: string;
  keywords: GeneratedKeyword[];
  ads: GeneratedRSA[];
}
```

**Naming Convention Examples**:
- "Brand + Model": "Triumph Bonneville T120"
- "Product + Category": "Triumph T120 - Classic Motorcycle"
- "Brand + Type": "Triumph - Cruiser Motorcycle"

**Naming Algorithm**:
1. Parse learned naming convention pattern
2. Extract brand/model from product name
3. Apply pattern:
   - Replace {Brand} with extracted brand
   - Replace {Model} with extracted model
   - Replace {Category} with product category
   - Replace {Type} with inferred type
4. Validate against Google Ads requirements:
   - Max 255 characters
   - No special characters except spaces, hyphens, underscores
   - Trim whitespace
5. Ensure uniqueness (append number if duplicate)

---

#### **1.3 Keyword Generation**

**Priority**: P0 (Must Have)  
**Estimated Effort**: 8 hours  
**User Story**: *"As a marketer, the system generates 15-20 relevant keywords per ad group by combining product data, existing high-performing keywords, and AI-generated expansions."*

**Acceptance Criteria**:
- [ ] Generate 15-20 keywords per ad group
- [ ] Combine multiple sources:
  - Product data (name, category, description)
  - High-performing keywords from existing campaigns
  - Competitor analysis (optional, future)
  - LLM-generated keyword expansions
- [ ] Default to broad match for MVP
- [ ] Rank keywords by relevance and intent
- [ ] Remove duplicates across ad groups
- [ ] Validate keywords against Google Ads requirements
- [ ] Display keywords in preview with source indicators

**Technical Requirements**:
- Keyword generation service
- Multi-source keyword aggregation
- Keyword ranking algorithm
- Duplicate detection
- Keyword validation
- LLM integration for keyword expansion

**Keyword Generation Sources**:
```typescript
interface KeywordSource {
  type: 'product_data' | 'existing_campaign' | 'llm_generated' | 'competitor';
  keyword: string;
  relevance: number; // 0-1
  confidence: number; // 0-1
}

interface GeneratedKeyword {
  text: string;
  matchType: 'broad' | 'phrase' | 'exact'; // Default: 'broad'
  source: KeywordSource;
  suggestedBid?: number; // Based on existing campaign data
}
```

**Keyword Generation Algorithm**:
1. **Extract from Product Data**:
   - Tokenize product name
   - Extract brand, model, category
   - Generate variations: "brand model", "model for sale", "buy brand model"
   - Calculate relevance: 0.9 (high for product name terms)
   
2. **Match from Existing Campaigns**:
   - Find similar keywords from high-performing keywords
   - Use string similarity (Levenshtein distance or cosine similarity)
   - Match by category/theme
   - Calculate similarity scores
   - Return matched keywords with performance data
   - Relevance: 0.8 (high for proven performers)
   
3. **LLM Generation**:
   - Create prompt with product details
   - Request 20 keywords from LLM
   - Parse LLM response (JSON array)
   - Validate keywords
   - Relevance: 0.7 (medium-high for AI suggestions)
   
4. **Aggregate and Rank**:
   - Combine all keywords from all sources
   - Remove duplicates (case-insensitive, normalized)
   - Calculate final score:
     * Relevance * 0.4
     * Performance potential (from existing keywords) * 0.3
     * Confidence * 0.2
     * Intent score (buy/purchase keywords get boost) * 0.1
   - Sort by final score (descending)
   - Select top 15-20 keywords per ad group
   
5. **Validate**:
   - Check max 80 characters
   - Validate format (no invalid characters)
   - Check against Google Ads keyword policies
   - Return validation results

**LLM Prompt for Keyword Generation**:
```
Given a product: {productName} in category {category} with description {description},
generate 20 search keywords that someone would use when looking to purchase this product.
Focus on lower-funnel, high-intent keywords (ready-to-buy).

Include variations with:
- Model year modifiers (if applicable)
- Brand names
- Product features
- Action words (buy, purchase, find, etc.)

Return as JSON array of keyword strings only.
Example format: ["keyword1", "keyword2", "keyword3"]
```

**API Endpoints**:
```typescript
// Generate keywords for ad group
POST /api/keywords/generate
  - Body: { product: ProductInput, patterns: CampaignPatterns }
  - Response: GeneratedKeyword[]

// Validate keywords
POST /api/keywords/validate
  - Body: { keywords: string[] }
  - Response: { valid: string[], invalid: string[], errors: ValidationError[] }
```

---

#### **1.4 Responsive Search Ad (RSA) Generation**

**Priority**: P0 (Must Have)  
**Estimated Effort**: 6 hours  
**User Story**: *"As a marketer, the system generates 1-2 responsive search ads per ad group with headlines and descriptions that match my existing ad copy style."*

**Acceptance Criteria**:
- [ ] Generate 1 RSA per ad group (MVP), expandable to 2
- [ ] Generate up to 15 headlines per RSA
- [ ] Generate up to 4 descriptions per RSA
- [ ] Use learned ad copy patterns from existing campaigns
- [ ] Incorporate product-specific information
- [ ] Validate character limits (30 chars for headlines, 90 chars for descriptions)
- [ ] Ensure variety in headlines and descriptions
- [ ] Display generated ads in preview

**Technical Requirements**:
- RSA generation service
- Ad copy template engine
- LLM integration for ad copy generation
- Character limit validation
- Ad preview component

**RSA Structure**:
```typescript
interface GeneratedRSA {
  id: string;
  adGroupId: string;
  headlines: AdHeadline[]; // Up to 15
  descriptions: AdDescription[]; // Up to 4
  finalUrl: string; // From product URL
  displayUrl?: string; // Optional
  paths?: string[]; // Optional URL paths
}

interface AdHeadline {
  text: string; // Max 30 characters
  pinned?: boolean; // Pin to position 1-3
}

interface AdDescription {
  text: string; // Max 90 characters
}
```

**Ad Copy Generation Logic**:
1. **Extract Templates**:
   - Use learned ad copy patterns from existing campaigns
   - Select top 3-5 headline templates
   - Select top 2-3 description templates
   
2. **Template Variable Substitution**:
   - Parse templates with placeholders: {Brand}, {Model}, {Category}, {Benefit}, {Price}
   - Extract values from product data
   - Substitute placeholders with actual values
   - Generate variations (e.g., "Brand Model" vs "Model by Brand")
   
3. **LLM Generation**:
   - Create prompt with product details and patterns
   - Request 15 headlines and 4 descriptions
   - Parse LLM response (JSON format)
   - Validate character limits
   - Return headlines and descriptions arrays
   
4. **Combine and Validate**:
   - Combine template-based and LLM-generated ad copy
   - Remove duplicates
   - Ensure variety (different styles, benefits, CTAs)
   - Validate all character limits
   - Ensure minimum counts (3 headlines, 2 descriptions)

**LLM Prompt for Ad Copy Generation**:
```
Generate responsive search ad copy for: {productName}

Based on these high-performing ad copy patterns from existing campaigns:
{adCopyPatterns}

Product details:
- Name: {productName}
- Category: {category}
- Description: {description}
- Price: {price}

Generate:
- 15 headlines (max 30 characters each)
- 4 descriptions (max 90 characters each)

Match the tone and style of existing ads. Include:
- Product name variations
- Key benefits and features
- Call-to-action
- Model year or specifications (if applicable)

Return as JSON:
{
  "headlines": ["...", ...],
  "descriptions": ["...", ...]
}
```

**API Endpoints**:
```typescript
// Generate RSA for ad group
POST /api/ads/generate-rsa
  - Body: { adGroupId: string, product: ProductInput, patterns: CampaignPatterns }
  - Response: GeneratedRSA

// Validate ad copy
POST /api/ads/validate
  - Body: { headlines: string[], descriptions: string[] }
  - Response: { valid: boolean, errors: ValidationError[] }
```

---

#### **1.5 Spreadsheet-Like Preview & Editing Interface**

**Priority**: P0 (Must Have)  
**Estimated Effort**: 10 hours  
**User Story**: *"As a marketer, I can review and edit all generated ad groups, keywords, and ad copy in a spreadsheet-like interface before exporting to Google Ads Editor."*

**Acceptance Criteria**:
- [ ] Display generated campaign structure in table/grid format
- [ ] Show ad groups with expandable rows for keywords and ads
- [ ] Enable inline editing of:
  - Ad group names
  - Keywords (text, match type)
  - Ad headlines and descriptions
  - Final URLs
- [ ] Provide column filtering and sorting
- [ ] Show validation errors inline
- [ ] Display character counts for ad copy
- [ ] Allow bulk editing (select multiple rows)
- [ ] Save edits to state
- [ ] Responsive design for different screen sizes

**Technical Requirements**:
- Table/grid component (React Table @tanstack/react-table)
- Inline editing functionality
- Validation on edit
- State management for edits (Zustand)
- Column management (show/hide, reorder)
- Filtering and sorting

**UI Structure**:
```
┌─────────────────────────────────────────────────────────────┐
│ Campaign: [Campaign Name]                    [Export CSV]  │
├─────────────────────────────────────────────────────────────┤
│ Filters: [Ad Group] [Keyword] [Status]                     │
├─────────────────────────────────────────────────────────────┤
│ Ad Group        │ Keywords │ Headlines │ Descriptions │ URL │
├─────────────────┼──────────┼───────────┼──────────────┼─────┤
│ ▼ Triumph T120  │ 20       │ 15        │ 4            │ ... │
│   ├─ keyword 1  │ [edit]   │ [edit]    │ [edit]       │ ... │
│   ├─ keyword 2  │          │           │              │     │
│   └─ ...        │          │           │              │     │
│ ▼ Harley Sportster│ 18       │ 15        │ 4            │ ... │
│   └─ ...        │          │           │              │     │
└─────────────────────────────────────────────────────────────┘
```

**Editable Fields**:
- **Ad Group Name**: Text input, max 255 characters
- **Keywords**: 
  - Text: Text input
  - Match Type: Dropdown (Broad/Phrase/Exact)
  - Bid: Number input (optional)
- **Headlines**: Text input array, max 30 characters each
- **Descriptions**: Text input array, max 90 characters each
- **Final URL**: URL input with validation
- **Display URL**: Text input (optional)

**Validation Rules**:
- Ad group names: Required, max 255 chars, no special characters
- Keywords: Required, max 80 characters, no special characters (except match type brackets)
- Headlines: Required, max 30 characters, at least 3 headlines
- Descriptions: Required, max 90 characters, at least 2 descriptions
- URLs: Valid URL format, must start with http:// or https://

**Component Structure**:
```typescript
// Main preview component
<CampaignPreviewTable
  campaign={generatedCampaign}
  onEdit={handleEdit}
  onValidate={handleValidate}
/>

// Ad group row (expandable)
<AdGroupRow
  adGroup={adGroup}
  isExpanded={boolean}
  onToggle={handleToggle}
  onEdit={handleEdit}
/>

// Keyword row
<KeywordRow
  keyword={keyword}
  onEdit={handleEdit}
/>

// Ad copy editor
<AdCopyEditor
  rsa={rsa}
  onEdit={handleEdit}
/>
```

---

#### **1.6 CSV Export for Google Ads Editor**

**Priority**: P0 (Must Have)  
**Estimated Effort**: 4 hours  
**User Story**: *"As a marketer, I can export the generated campaign structure as a CSV file that I can upload directly to Google Ads Editor."*

**Acceptance Criteria**:
- [ ] Export all ad groups, keywords, and ads to CSV
- [ ] Format CSV according to Google Ads Editor import requirements
- [ ] Include all required columns for Google Ads Editor
- [ ] Validate all data before export
- [ ] Provide download button
- [ ] Show export progress/status
- [ ] Handle errors gracefully

**Technical Requirements**:
- CSV generation library (csv-writer or similar)
- Google Ads Editor format mapping
- Data validation before export
- File download functionality

**Google Ads Editor CSV Format**:
```csv
Campaign,Ad Group,Keyword,Match Type,Headline 1,Headline 2,Headline 3,...,Description 1,Description 2,...,Final URL,Display URL
Campaign Name,Ad Group 1,keyword 1,[Broad],Headline 1,Headline 2,...,Description 1,...,https://...,example.com
Campaign Name,Ad Group 1,keyword 2,[Broad],Headline 1,Headline 2,...,Description 1,...,https://...,example.com
```

**Export Process**:
1. Validate all data (keywords, ad copy, URLs)
2. Map internal data structure to Google Ads Editor format
3. Generate CSV file with proper encoding (UTF-8 with BOM for Excel compatibility)
4. Trigger browser download
5. Show success message with instructions

**API Endpoints**:
```typescript
// Export campaign to CSV
POST /api/campaigns/export-csv
  - Body: { campaignId: string, includeAds: boolean }
  - Response: CSV file (download)

// Validate before export
POST /api/campaigns/validate-export
  - Body: { campaignId: string }
  - Response: { valid: boolean, errors: ValidationError[] }
```

---

## User Experience Requirements

### **Core User Flow**

#### **Flow 1: CSV Upload → Generation → Export**

1. **Upload CSV** → User uploads CSV file or pastes URLs
2. **Review Products** → System displays parsed products, user can edit
3. **OAuth Authentication** → If not connected, user authenticates with Google Ads
4. **Query Existing Campaigns** → System queries and learns from existing campaigns
5. **Review Patterns** → System shows learned patterns (optional review)
6. **Generate Campaign** → System generates ad groups, keywords, and ads
7. **Edit in Spreadsheet** → User reviews and edits in table interface
8. **Validate** → System validates all data
9. **Export CSV** → User downloads CSV for Google Ads Editor
10. **Upload to Google Ads** → User manually uploads CSV to Google Ads Editor

**Target Time**: < 15 minutes from upload to export

### **UI Components**

#### **1. CSV Upload Screen**
- Drag-and-drop file upload area
- File picker button
- URL list textarea (alternative)
- Product preview table
- "Generate Campaign" button

#### **2. OAuth Connection Screen** (if needed)
- Google Ads connection button
- OAuth flow initiation
- Connection status indicator

#### **3. Pattern Learning Screen** (Optional)
- Summary of learned patterns
- High-performing keywords list
- Ad copy pattern examples
- "Continue to Generation" button

#### **4. Generation Progress Screen**
- Progress indicator
- Status messages:
  - "Querying existing campaigns..."
  - "Extracting patterns..."
  - "Generating ad groups..."
  - "Generating keywords..."
  - "Generating ad copy..."
- Estimated time remaining

#### **5. Spreadsheet Preview Screen**
- Table with expandable rows
- Inline editing
- Column filters
- Validation indicators
- Export button
- Save draft button

#### **6. Export Screen**
- Validation summary
- Export button
- Download link
- Instructions for Google Ads Editor upload

---

## Performance Requirements

### **MVP Performance Targets**

#### **CSV Parsing**
- **Target**: Parse 10 products in < 2 seconds
- **Measurement**: Time from upload to product preview

#### **OAuth Authentication**
- **Target**: Complete OAuth flow in < 30 seconds (user interaction time)
- **Measurement**: Time from initiation to token storage

#### **Campaign Query**
- **Target**: Query existing campaigns in < 10 seconds
- **Measurement**: Time to fetch and analyze campaign data

#### **Pattern Extraction**
- **Target**: Extract patterns in < 5 seconds
- **Measurement**: Time to analyze and extract patterns

#### **Ad Group Generation**
- **Target**: Generate 10 ad groups in < 3 seconds
- **Measurement**: Time to create all ad groups

#### **Keyword Generation**
- **Target**: Generate 15-20 keywords per ad group in < 30 seconds total
- **Measurement**: Time for all keyword generation (including LLM calls)

#### **RSA Generation**
- **Target**: Generate 1 RSA per ad group in < 20 seconds total
- **Measurement**: Time for all ad copy generation (including LLM calls)

#### **Total Generation Time**
- **Target**: Complete generation in < 2 minutes for 10 products
- **Acceptance**: 90% of generations complete within target

---

## Quality Requirements

### **Validation Requirements**

#### **Product Input Validation**
- CSV format validation
- Required columns present
- URL format validation
- Product name validation

#### **Generated Content Validation**
- Ad group names: Max 255 chars, valid characters
- Keywords: Max 80 chars, valid format, no duplicates
- Headlines: Max 30 chars, at least 3 per RSA
- Descriptions: Max 90 chars, at least 2 per RSA
- URLs: Valid URL format

#### **Export Validation**
- All required fields present
- Character limits met
- URL formats valid
- No duplicates
- Google Ads Editor format compliance

### **Error Handling**

- Clear error messages for validation failures
- Graceful handling of API failures
- Retry logic for transient errors
- User-friendly error display in UI
- OAuth error handling with re-authentication flow

---

## Integration Points

### **Integration with Existing Agentic Campaign Manager**

#### **Workflow Selection**
- Add new option in campaign creation: "Bulk Generate from CSV/URLs"
- Maintain existing conversational workflow
- Shared campaign management and export functionality

#### **Shared Services**
- OAuth service (extend existing for Google Ads authentication)
- Campaign creation service (for assigning ad groups to campaigns)
- Google Ads API integration (extend existing `GoogleAdsService`)
- Pattern extraction (can be used by conversational flow)
- Export service

#### **UI Integration**
- Add CSV upload option to campaign dashboard
- Reuse spreadsheet preview component in other workflows
- Shared validation and export components
- Consistent styling with ADE module system

### **Module Integration with ADE**

#### **Module Structure**
- Self-contained module within ADE framework
- Exports main component for ADE integration
- Follows ADE module lifecycle hooks
- Uses ADE routing system (if available)

#### **Shared Infrastructure**
- Uses ADE authentication system (if available)
- Integrates with ADE state management patterns
- Follows ADE UI/UX guidelines
- Uses ADE error handling patterns

---

## Success Metrics & KPIs

### **MVP Success Criteria**

#### **Functionality**
- [ ] CSV upload and parsing works correctly
- [ ] OAuth authentication works correctly
- [ ] Existing campaign querying works
- [ ] Pattern extraction produces usable patterns
- [ ] Ad group generation creates 10 ad groups
- [ ] Keyword generation produces 15-20 keywords per ad group
- [ ] RSA generation produces valid ad copy
- [ ] Spreadsheet preview displays and edits correctly
- [ ] CSV export produces valid Google Ads Editor format

#### **Quality**
- [ ] Generated keywords are relevant to products
- [ ] Generated ad copy matches existing style
- [ ] All validation rules enforced
- [ ] Export file imports successfully into Google Ads Editor

#### **Performance**
- [ ] Complete workflow completes in < 15 minutes
- [ ] Generation completes in < 2 minutes
- [ ] UI remains responsive during generation

---

## Risk Assessment & Mitigation

### **High-Risk Items**

#### **Risk 1: Google Ads API Rate Limits**
**Impact**: High (blocks campaign querying)  
**Probability**: Medium  
**Mitigation**:
- Implement request queuing and rate limiting
- Cache campaign data for reuse
- Provide fallback to manual pattern input
- Use batch requests where possible

#### **Risk 2: OAuth Token Management**
**Impact**: High (blocks all API access)  
**Probability**: Medium  
**Mitigation**:
- Implement automatic token refresh
- Store tokens securely (encrypted, session-based or database)
- Provide clear re-authentication flow
- Handle token expiration gracefully

#### **Risk 3: LLM Generation Quality**
**Impact**: High (poor keywords/ad copy = poor campaigns)  
**Probability**: Medium  
**Mitigation**:
- Use high-quality prompts with examples
- Validate generated content against patterns
- Allow extensive user editing
- Provide regeneration option

#### **Risk 4: CSV Format Variations**
**Impact**: Medium (user frustration)  
**Probability**: High  
**Mitigation**:
- Provide CSV template download
- Support common variations
- Clear error messages with examples
- Allow manual editing of parsed data

#### **Risk 5: Google Ads Editor Format Changes**
**Impact**: Medium (export fails)  
**Probability**: Low  
**Mitigation**:
- Test export with current Google Ads Editor version
- Provide format documentation
- Allow manual CSV editing before export

---

## Technical Debt & Future Considerations

### **MVP Limitations (Acceptable)**

1. **Limited to 10 Products**: Expandable to 50+ in future
2. **Broad Match Only**: Add phrase/exact match selection later
3. **1 RSA per Ad Group**: Expandable to 2-3
4. **Manual Google Ads Upload**: Direct API upload in future
5. **Single Campaign Assignment**: Multi-campaign assignment later
6. **Basic Pattern Learning**: Advanced ML-based learning later
7. **OAuth Token Storage**: Session-based for MVP, database in future

### **Post-MVP Enhancements**

#### **Version 2.0 Features**
- Support for 50+ products
- Multiple match types per keyword
- 2-3 RSAs per ad group
- Direct Google Ads API upload
- Advanced pattern learning with ML
- Competitor keyword analysis
- Bulk editing improvements
- Template saving and reuse
- Secure token storage in database

#### **Version 3.0 Features**
- Multi-platform support (Meta, Microsoft)
- Automated bid suggestions
- Performance-based keyword expansion
- A/B testing for ad copy
- Scheduled generation and export

---

## Conclusion

The CSV/URL-Based Campaign Generation MVP transforms bulk product campaign creation by automating ad group, keyword, and ad copy generation while learning from existing high-performing campaigns. The spreadsheet-like preview interface provides familiar editing capabilities, and the Google Ads Editor CSV export enables seamless integration with existing workflows.

**Key Success Factors**:
1. **Learn from Existing**: Pattern extraction from existing campaigns ensures consistency
2. **Multi-Source Keywords**: Combining product data, existing keywords, and LLM generation ensures quality
3. **Familiar Interface**: Spreadsheet-like preview matches user expectations
4. **Validation First**: Comprehensive validation prevents export errors
5. **Flexible Editing**: Extensive editing capabilities ensure user control
6. **Robust Authentication**: OAuth integration with automatic token refresh ensures reliability

**Expected Outcome**: A working MVP that reduces campaign setup time from 2-4 hours to < 15 minutes while maintaining or improving quality through learned patterns and AI generation.

---

*Document Version: 2.0*  
*Created: January 2025*  
*Last Updated: January 2025*  
*Project: CSV/URL-Based Campaign Generation MVP*  
*Integration: Agentic Campaign Manager Module within Ad Development Environment*

