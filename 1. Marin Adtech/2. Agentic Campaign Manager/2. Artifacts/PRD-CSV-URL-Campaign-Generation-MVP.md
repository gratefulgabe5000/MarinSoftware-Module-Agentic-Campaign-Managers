# Product Requirements Document (PRD) - CSV/URL-Based Campaign Generation MVP

**Document Version**: 1.0  
**Created**: January 2025  
**Last Updated**: January 2025  
**Project Timeline**: MVP Development  
**Framework**: Based on Agentic Campaign Manager PRD structure  
**Target Platform**: Web Application Module (React/TypeScript)  
**Integration Context**: Feature addition to Agentic Campaign Manager Module  
**Product Focus**: CSV/URL input → Ad Group & Keyword Generation → Spreadsheet Preview → Google Ads Export

---

## Executive Summary

**Product Vision**: Enable performance marketers to generate complete Google Ads campaign structures from CSV files or product URL lists by learning from existing high-performing campaigns. The system automatically creates ad groups, generates keywords, and produces responsive search ads (RSA) that can be edited in a spreadsheet-like interface before export to Google Ads Editor.

**Market Position**: Automates the tedious process of manually creating ad groups and keywords for product catalogs, reducing setup time from hours to minutes while maintaining consistency with existing campaign structures.

**Integration Model**: This feature integrates into the existing Agentic Campaign Manager module as a new workflow option. Users can choose between conversational campaign creation (existing) or CSV/URL-based bulk generation (new).

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
- CSV parser library (PapaParse or similar)
- File upload component with drag-and-drop
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
- [ ] Query all existing campaigns in connected Google Ads account
- [ ] Extract ad group structure (names, themes, organization patterns)
- [ ] Identify high-performing keywords (by CTR, conversions, or ROAS)
- [ ] Extract ad copy patterns (headlines, descriptions, CTAs)
- [ ] Analyze budget and bidding patterns for reference
- [ ] Store extracted patterns for use in generation
- [ ] Display summary of learned patterns to user
- [ ] Allow user to select which campaigns to learn from (optional)

**Technical Requirements**:
- Google Ads API integration for campaign querying
- Pattern extraction service
- Keyword performance analysis
- Ad copy pattern recognition
- Data storage for extracted patterns

**Query Scope**:
- Query all campaigns in connected account
- Filter by active/paused status (exclude deleted)
- Include campaign, ad group, keyword, and ad data
- Performance metrics: impressions, clicks, CTR, conversions, ROAS

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
  - Response: CampaignPatterns

// Get high-performing keywords
GET /api/campaigns/high-performing-keywords
  - Query params: accountId, minCTR (optional), minConversions (optional)
  - Response: Keyword[]

// Get ad copy patterns
GET /api/campaigns/ad-copy-patterns
  - Query params: accountId
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
1. Extract keywords from product data (name, category, description)
2. Find similar high-performing keywords from existing campaigns
3. Use LLM to generate keyword variations and expansions
4. Rank all keywords by relevance and performance potential
5. Select top 15-20 keywords per ad group
6. Remove duplicates and validate

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

Return as JSON array of keyword strings.
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
1. Extract ad copy templates from existing campaigns
2. Use LLM to generate product-specific variations
3. Incorporate product name, category, benefits
4. Match tone and style of existing ads
5. Generate multiple variations for testing
6. Validate character limits and Google Ads requirements

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
- Table/grid component (React Table or similar)
- Inline editing functionality
- Validation on edit
- State management for edits
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
- CSV generation library
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
3. Generate CSV file
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

## Technical Architecture

### **Data Flow**

```
1. User Input (CSV/URLs)
   ↓
2. Product Parsing & Validation
   ↓
3. Query Existing Campaigns → Extract Patterns
   ↓
4. Generate Ad Groups (1 per product)
   ↓
5. Generate Keywords (15-20 per ad group)
   ↓
6. Generate RSA (1-2 per ad group)
   ↓
7. Spreadsheet Preview & Editing
   ↓
8. Validation
   ↓
9. CSV Export → Google Ads Editor
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
│ Backend Services                                        │
├─────────────────────────────────────────────────────────┤
│ - ProductParsingService                                 │
│ - CampaignQueryService (Google Ads API)                │
│ - PatternExtractionService                             │
│ - AdGroupGenerationService                             │
│ - KeywordGenerationService (LLM + Patterns)           │
│ - RSAGenerationService (LLM + Templates)              │
│ - ValidationService                                    │
│ - CSVExportService                                     │
└─────────────────────────────────────────────────────────┘
                        ↕
┌─────────────────────────────────────────────────────────┐
│ External APIs                                           │
├─────────────────────────────────────────────────────────┤
│ - Google Ads API (Campaign Query)                      │
│ - OpenAI/Claude API (Keyword & Ad Copy Generation)     │
└─────────────────────────────────────────────────────────┘
```

### **Data Models**

```typescript
// Complete generated campaign structure
interface GeneratedCampaign {
  id: string;
  name: string;
  campaignId: string; // Target Google Ads campaign
  adGroups: GeneratedAdGroup[];
  patterns: CampaignPatterns; // Learned patterns
  createdAt: Date;
  status: 'draft' | 'ready_for_export' | 'exported';
}

interface GeneratedAdGroup {
  id: string;
  name: string;
  productId: string;
  product: ProductInput;
  keywords: GeneratedKeyword[];
  ads: GeneratedRSA[];
  edits?: AdGroupEdits; // User edits
}

interface GeneratedKeyword {
  id: string;
  text: string;
  matchType: 'broad' | 'phrase' | 'exact';
  source: KeywordSource;
  suggestedBid?: number;
  edits?: KeywordEdits; // User edits
}

interface GeneratedRSA {
  id: string;
  adGroupId: string;
  headlines: AdHeadline[];
  descriptions: AdDescription[];
  finalUrl: string;
  displayUrl?: string;
  edits?: RSAEdits; // User edits
}
```

---

## User Experience Requirements

### **Core User Flow**

#### **Flow 1: CSV Upload → Generation → Export**

1. **Upload CSV** → User uploads CSV file or pastes URLs
2. **Review Products** → System displays parsed products, user can edit
3. **Query Existing Campaigns** → System queries and learns from existing campaigns
4. **Review Patterns** → System shows learned patterns (optional review)
5. **Generate Campaign** → System generates ad groups, keywords, and ads
6. **Edit in Spreadsheet** → User reviews and edits in table interface
7. **Validate** → System validates all data
8. **Export CSV** → User downloads CSV for Google Ads Editor
9. **Upload to Google Ads** → User manually uploads CSV to Google Ads Editor

**Target Time**: < 15 minutes from upload to export

### **UI Components**

#### **1. CSV Upload Screen**
- Drag-and-drop file upload area
- File picker button
- URL list textarea (alternative)
- Product preview table
- "Generate Campaign" button

#### **2. Pattern Learning Screen** (Optional)
- Summary of learned patterns
- High-performing keywords list
- Ad copy pattern examples
- "Continue to Generation" button

#### **3. Generation Progress Screen**
- Progress indicator
- Status messages:
  - "Querying existing campaigns..."
  - "Extracting patterns..."
  - "Generating ad groups..."
  - "Generating keywords..."
  - "Generating ad copy..."
- Estimated time remaining

#### **4. Spreadsheet Preview Screen**
- Table with expandable rows
- Inline editing
- Column filters
- Validation indicators
- Export button
- Save draft button

#### **5. Export Screen**
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

---

## Integration Points

### **Integration with Existing Agentic Campaign Manager**

#### **Workflow Selection**
- Add new option in campaign creation: "Bulk Generate from CSV/URLs"
- Maintain existing conversational workflow
- Shared campaign management and export functionality

#### **Shared Services**
- Campaign creation service (for assigning ad groups to campaigns)
- Google Ads API integration
- Pattern extraction (can be used by conversational flow)
- Export service

#### **UI Integration**
- Add CSV upload option to campaign dashboard
- Reuse spreadsheet preview component in other workflows
- Shared validation and export components

---

## Success Metrics & KPIs

### **MVP Success Criteria**

#### **Functionality**
- [ ] CSV upload and parsing works correctly
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

#### **Risk 2: LLM Generation Quality**
**Impact**: High (poor keywords/ad copy = poor campaigns)  
**Probability**: Medium  
**Mitigation**:
- Use high-quality prompts with examples
- Validate generated content against patterns
- Allow extensive user editing
- Provide regeneration option

#### **Risk 3: CSV Format Variations**
**Impact**: Medium (user frustration)  
**Probability**: High  
**Mitigation**:
- Provide CSV template download
- Support common variations
- Clear error messages with examples
- Allow manual editing of parsed data

#### **Risk 4: Google Ads Editor Format Changes**
**Impact**: Medium (export fails)  
**Probability**: Low  
**Mitigation**:
- Test export with current Google Ads Editor version
- Provide format documentation
- Allow manual CSV editing before export

---

## Development Phases & Timeline

### **Phase 1: Input & Query (Week 1)**
- CSV/URL input processing
- Existing campaign querying
- Pattern extraction

### **Phase 2: Generation (Week 2)**
- Ad group generation
- Keyword generation
- RSA generation

### **Phase 3: Preview & Export (Week 3)**
- Spreadsheet preview interface
- Inline editing
- CSV export

### **Phase 4: Polish & Testing (Week 4)**
- Validation improvements
- Error handling
- Performance optimization
- User testing

---

## Technical Debt & Future Considerations

### **MVP Limitations (Acceptable)**

1. **Limited to 10 Products**: Expandable to 50+ in future
2. **Broad Match Only**: Add phrase/exact match selection later
3. **1 RSA per Ad Group**: Expandable to 2-3
4. **Manual Google Ads Upload**: Direct API upload in future
5. **Single Campaign Assignment**: Multi-campaign assignment later
6. **Basic Pattern Learning**: Advanced ML-based learning later

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

**Expected Outcome**: A working MVP that reduces campaign setup time from 2-4 hours to < 15 minutes while maintaining or improving quality through learned patterns and AI generation.

---

*Document Version: 1.0*  
*Created: January 2025*  
*Last Updated: January 2025*  
*Project: CSV/URL-Based Campaign Generation MVP*  
*Integration: Agentic Campaign Manager Module*

