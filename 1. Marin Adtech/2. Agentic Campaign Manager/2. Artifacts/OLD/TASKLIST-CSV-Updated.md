# Task List: CSV/URL-Based Campaign Generation MVP Implementation

**Document Version**: 2.0  
**Created**: January 2025  
**Last Updated**: January 2025  
**Project Timeline**: MVP Development (Compressed timeline)  
**Target**: Complete MVP implementation of CSV/URL-Based Campaign Generation feature  
**Framework**: React + TypeScript + Express + TypeScript (Node.js)  
**Integration**: Feature addition to Agentic Campaign Manager Module within ADE

---

## Overview

This document provides a granular, step-by-step task list for implementing the CSV/URL-Based Campaign Generation MVP. Tasks are organized into phases matching the PRD structure. Each phase includes frontend, backend, and integration tasks.

**Workflow Rules**:
- Complete all tasks in a subphase before proceeding
- Pause for confirmation after each subphase completion
- Run unit tests after each subphase completion (explicit unit test subphases included)
- Do not proceed to next phase until current phase is tested and confirmed
- Follow existing Agentic Campaign Manager code patterns and architecture
- Use PowerShell syntax for all commands
- When testing, use mock data if live APIs are unavailable

---

## Phase 0: Project Setup & Configuration (2 hours)

### Subphase 0.1: Project Structure & Dependencies (1 hour)

#### Task 0.1.1: Verify Project Structure
- [ ] Navigate to `Module-Agentic_Campaign_Manager` directory
- [ ] Verify frontend structure exists: `src/`, `src/components/`, `src/services/`, `src/types/`
- [ ] Verify backend structure exists: `backend/src/`, `backend/src/services/`, `backend/src/routes/`, `backend/src/controllers/`
- [ ] Verify `package.json` files exist in root and `backend/` directories
- [ ] Verify `tsconfig.json` files exist in root and `backend/` directories

#### Task 0.1.2: Install Base Dependencies
- [ ] Frontend: Run `npm install` in root directory
- [ ] Backend: Run `npm install` in `backend/` directory
- [ ] Verify all existing dependencies are installed
- [ ] Check for any dependency conflicts

#### Task 0.1.3: Create Feature Directory Structure
- [ ] Create `src/components/csv-upload/` directory
- [ ] Create `src/components/pattern-learning/` directory
- [ ] Create `src/components/campaign-preview/` directory
- [ ] Create `src/types/` subdirectories if needed
- [ ] Create `backend/src/services/` subdirectories if needed
- [ ] Create `backend/src/routes/` subdirectories if needed

### Subphase 0.2: Environment Configuration (30 minutes)

#### Task 0.2.1: Create Backend Environment File
- [ ] Create `.env` file in `backend/` directory (if not exists)
- [ ] Add Google Ads API variables:
  ```
  GOOGLE_ADS_CLIENT_ID=
  GOOGLE_ADS_CLIENT_SECRET=
  GOOGLE_ADS_REFRESH_TOKEN=
  GOOGLE_ADS_DEVELOPER_TOKEN=
  GOOGLE_ADS_CUSTOMER_ID=
  ```
- [ ] Add LLM API variables:
  ```
  OPENAI_API_KEY=
  # OR
  ANTHROPIC_API_KEY=
  ```
- [ ] Add server configuration:
  ```
  PORT=3001
  CORS_ORIGIN=http://localhost:3000
  NODE_ENV=development
  ```

#### Task 0.2.2: Verify Environment Variable Loading
- [ ] Verify `backend/src/config/env.ts` loads environment variables
- [ ] Add any missing environment variables to config
- [ ] Test loading of environment variables in development mode

#### Task 0.2.3: Create Mock Data Setup
- [ ] Create `backend/src/data/mock/` directory
- [ ] Create `backend/src/data/mock/campaigns.json` with sample campaign data
- [ ] Create `backend/src/data/mock/keywords.json` with sample keyword performance data
- [ ] Create `backend/src/data/mock/ads.json` with sample RSA data
- [ ] Create `backend/src/data/mock/products.csv` with sample product data
- [ ] Add mock data loading utilities in `backend/src/utils/mockDataLoader.ts`

### Subphase 0.3: Google Ads API OAuth Setup (30 minutes)

#### Task 0.3.1: Verify OAuth Service Exists
- [ ] Check if `backend/src/services/oauthService.ts` exists
- [ ] Verify Google Ads OAuth methods exist:
  - `generateGoogleAuthUrl()`
  - `exchangeGoogleCode()`
  - `refreshGoogleToken()`
- [ ] If missing, extend existing OAuth service or create new methods

#### Task 0.3.2: Verify OAuth Routes Exist
- [ ] Check if `backend/src/routes/auth.ts` exists
- [ ] Verify Google Ads OAuth routes exist:
  - `GET /api/auth/google/authorize`
  - `GET /api/auth/google/callback`
- [ ] If missing, add routes to existing auth router

#### Task 0.3.3: Install Google Ads API Client
- [ ] Backend: Install `google-ads-api`: `npm install google-ads-api`
- [ ] Verify installation in `backend/package.json`
- [ ] Add TypeScript types if needed: `npm install --save-dev @types/google-ads-api` (if available)

#### Task 0.3.4: Create OAuth Test Endpoints
- [ ] Add `GET /api/auth/google/status` endpoint to check OAuth connection status
- [ ] Add `POST /api/auth/google/disconnect` endpoint to disconnect OAuth
- [ ] Test OAuth flow with mock data if live credentials unavailable

### Subphase 0.4: Development Environment Setup (30 minutes)

#### Task 0.4.1: Verify Backend Server Runs
- [ ] Navigate to `backend/` directory
- [ ] Run `npm run dev` to start development server
- [ ] Verify server starts on port 3001 (or configured port)
- [ ] Test health check endpoint: `GET http://localhost:3001/api/health`
- [ ] Stop server

#### Task 0.4.2: Verify Frontend Server Runs
- [ ] Navigate to root directory
- [ ] Run `npm run dev` to start frontend development server
- [ ] Verify server starts on port 3000 (or configured port)
- [ ] Verify frontend loads in browser
- [ ] Stop server

#### Task 0.4.3: Verify Build Process
- [ ] Backend: Run `npm run build` to verify TypeScript compilation
- [ ] Frontend: Run `npm run build` to verify Vite build
- [ ] Check for any build errors
- [ ] Verify build outputs are created in `dist/` directories

#### Task 0.4.4: Setup Testing Framework
- [ ] Verify Jest is configured in `backend/` (check `jest.config.ts`)
- [ ] Verify Jest is configured in root (check `jest.config.ts`)
- [ ] Run `npm test` in both directories to verify tests run
- [ ] Create test data fixtures in `__tests__/fixtures/` directories

---

## Phase 1: Input & Query (Week 1)

### Subphase 1.1: CSV/URL Input Processing (4 hours)

#### Task 1.1.1: Install Required Dependencies
- [ ] Install CSV parsing library: `npm install papaparse`
- [ ] Install TypeScript types for papaparse: `npm install --save-dev @types/papaparse`
- [ ] Install file upload utilities: `npm install react-dropzone` (if not already installed)

#### Task 1.1.2: Create Product Input Types
- [ ] Create `src/types/product.types.ts`:
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
- [ ] Export ProductInput type
- [ ] Add validation schema for ProductInput

#### Task 1.1.3: Create CSV Parser Service (Backend)
- [ ] Create `backend/src/services/productParsingService.ts`
- [ ] Implement CSV parsing function using PapaParse
- [ ] Add CSV format validation:
  - Required columns: Product Name, URL
  - Optional columns: Category, Price, Description
- [ ] Add error handling for malformed CSV
- [ ] Return parsed products array with validation errors
- [ ] Add unit tests for CSV parsing

#### Task 1.1.4: Create URL List Parser Service (Backend)
- [ ] Add URL list parsing function to `productParsingService.ts`
- [ ] Parse plain text list of URLs (one per line)
- [ ] Extract product name from URL (if possible) or use URL as name
- [ ] Validate URL format
- [ ] Return parsed products array
- [ ] Add unit tests for URL list parsing

#### Task 1.1.5: Create CSV Upload API Endpoint (Backend)
- [ ] Create `backend/src/routes/products.ts`
- [ ] Add POST `/api/products/parse-csv` endpoint
- [ ] Accept multipart/form-data with CSV file
- [ ] Call productParsingService to parse CSV
- [ ] Return parsed products with validation errors
- [ ] Add error handling middleware
- [ ] Add request validation

#### Task 1.1.6: Create URL List Parse API Endpoint (Backend)
- [ ] Add POST `/api/products/parse-urls` endpoint to `products.ts`
- [ ] Accept JSON body with `urls: string[]`
- [ ] Call productParsingService to parse URLs
- [ ] Return parsed products
- [ ] Add validation for URL format

#### Task 1.1.7: Create CSV Upload Component (Frontend)
- [ ] Create `src/components/csv-upload/CSVUploadComponent.tsx`
- [ ] Implement drag-and-drop file upload using react-dropzone
- [ ] Add file picker button as alternative
- [ ] Display upload progress
- [ ] Show file name after selection
- [ ] Add file type validation (.csv only)
- [ ] Add file size limit (e.g., 5MB)
- [ ] Call `/api/products/parse-csv` on file upload
- [ ] Handle upload errors gracefully

#### Task 1.1.8: Create URL List Input Component (Frontend)
- [ ] Create `src/components/csv-upload/URLListInput.tsx`
- [ ] Implement textarea for URL list input
- [ ] Add placeholder text with example format
- [ ] Add character counter
- [ ] Add "Parse URLs" button
- [ ] Call `/api/products/parse-urls` on submit
- [ ] Handle parsing errors

#### Task 1.1.9: Create Product Preview Component (Frontend)
- [ ] Create `src/components/csv-upload/ProductPreview.tsx`
- [ ] Display parsed products in table format
- [ ] Show columns: Name, URL, Category, Price, Description
- [ ] Enable inline editing of product data
- [ ] Add "Remove Product" button per row
- [ ] Add "Add Product" button for manual entry
- [ ] Validate edited data
- [ ] Show validation errors inline

#### Task 1.1.10: Create CSV Upload Screen (Frontend)
- [ ] Create `src/components/csv-upload/CSVUploadScreen.tsx`
- [ ] Integrate CSVUploadComponent and URLListInput
- [ ] Add tab switcher: "Upload CSV" / "Paste URLs"
- [ ] Integrate ProductPreview component
- [ ] Add "Generate Campaign" button (disabled until products validated)
- [ ] Add product count display
- [ ] Add limit indicator (max 10 products for MVP)
- [ ] Handle navigation to next step

#### Task 1.1.11: Add Routing for CSV Upload
- [ ] Add route `/campaigns/csv-upload` to main router
- [ ] Integrate CSVUploadScreen component
- [ ] Add navigation from campaign dashboard
- [ ] Store parsed products in state/store

#### Task 1.1.12: Unit Tests for Input Processing
- [ ] Test CSV parsing with valid CSV
- [ ] Test CSV parsing with missing columns
- [ ] Test CSV parsing with invalid data
- [ ] Test URL list parsing with valid URLs
- [ ] Test URL list parsing with invalid URLs
- [ ] Test product validation
- [ ] Test CSV upload component
- [ ] Test URL list input component
- [ ] Test product preview component

---

### Subphase 1.2: Existing Campaign Query & Pattern Extraction (6 hours)

#### Task 1.2.1: Google Ads API OAuth Authentication Setup
- [ ] Verify OAuth service is accessible from pattern extraction service
- [ ] Create OAuth connection check utility function
- [ ] Add OAuth token validation before API calls
- [ ] Implement OAuth token refresh logic if token expired
- [ ] Add error handling for OAuth failures
- [ ] Create fallback to mock data if OAuth not available
- [ ] Add OAuth connection status indicator in UI

#### Task 1.2.2: Create Campaign Patterns Types
- [ ] Create `src/types/campaign-patterns.types.ts`:
  ```typescript
  interface CampaignPatterns {
    adGroupStructures: {
      namingConvention: string;
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
      headlineTemplates: string[];
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
- [ ] Export all pattern types

#### Task 1.2.3: Extend Google Ads API Service (Backend)
- [ ] Verify `backend/src/services/googleAdsService.ts` exists
- [ ] Extend existing GoogleAdsService with new methods:
  - `queryAllCampaigns(accountId: string, dateRange?: DateRange)`
  - `queryAdGroups(campaignId: string)`
  - `queryKeywordsWithMetrics(adGroupId: string, dateRange?: DateRange)`
  - `queryRSAs(adGroupId: string)`
- [ ] Add OAuth token handling in all methods
- [ ] Add error handling for API failures
- [ ] Add rate limiting logic (if not already present)
- [ ] Add caching for campaign data (if not already present)
- [ ] Add fallback to mock data if API unavailable

#### Task 1.2.4: Create Pattern Extraction Service (Backend)
- [ ] Create `backend/src/services/patternExtractionService.ts`
- [ ] Implement `extractAdGroupStructures()`:
  - Analyze ad group names for naming conventions
  - Identify common themes
  - Calculate average keywords per group
- [ ] Implement `extractHighPerformingKeywords()`:
  - Filter keywords by CTR threshold (e.g., > 2%)
  - Filter by conversions (e.g., > 0)
  - Sort by performance metrics
  - Return top N keywords
- [ ] Implement `extractAdCopyPatterns()`:
  - Analyze headlines for templates/patterns
  - Analyze descriptions for templates/patterns
  - Extract common CTAs
  - Calculate average headlines/descriptions per ad
- [ ] Implement `extractBiddingPatterns()`:
  - Calculate average CPC
  - Identify bid strategy types
- [ ] Add unit tests for pattern extraction

#### Task 1.2.5: Create Campaign Query API Endpoints (Backend)
- [ ] Verify `backend/src/routes/campaigns.ts` exists (or extend existing)
- [ ] Add GET `/api/campaigns/query-patterns`:
  - Query params: accountId, dateRange (optional)
  - Headers: Authorization (OAuth token)
  - Query Google Ads API for campaigns (or use mock data)
  - Extract patterns using patternExtractionService
  - Return CampaignPatterns
- [ ] Add GET `/api/campaigns/high-performing-keywords`:
  - Query params: accountId, minCTR (optional), minConversions (optional)
  - Headers: Authorization (OAuth token)
  - Return high-performing keywords
- [ ] Add GET `/api/campaigns/ad-copy-patterns`:
  - Query params: accountId
  - Headers: Authorization (OAuth token)
  - Return ad copy patterns
- [ ] Add OAuth token validation middleware
- [ ] Add error handling for OAuth failures
- [ ] Add fallback to mock data if OAuth unavailable
- [ ] Add request validation

#### Task 1.2.6: Create Pattern Learning Hook (Frontend)
- [ ] Create `src/hooks/useCampaignPatterns.ts`
- [ ] Implement hook to fetch patterns from API
- [ ] Add loading state
- [ ] Add error handling
- [ ] Cache patterns in state
- [ ] Add refresh function

#### Task 1.2.7: Create Pattern Viewer Component (Frontend)
- [ ] Create `src/components/pattern-learning/PatternViewer.tsx`
- [ ] Display ad group structure patterns:
  - Naming convention
  - Common themes
  - Average keywords per group
- [ ] Display high-performing keywords list (top 20)
- [ ] Display ad copy pattern examples:
  - Sample headline templates
  - Sample description templates
  - Common CTAs
- [ ] Display bidding patterns:
  - Average CPC
  - Bid strategy
- [ ] Add OAuth connection status indicator
- [ ] Add "Continue to Generation" button
- [ ] Add "Select Campaigns to Learn From" option (optional)

#### Task 1.2.8: Create Pattern Learning Screen (Frontend)
- [ ] Create `src/components/pattern-learning/PatternLearningScreen.tsx`
- [ ] Integrate PatternViewer component
- [ ] Add loading indicator during pattern extraction
- [ ] Add progress messages:
  - "Querying existing campaigns..."
  - "Extracting patterns..."
- [ ] Show error messages if pattern extraction fails
- [ ] Add option to skip pattern learning (use defaults)
- [ ] Store patterns in state/store for use in generation

#### Task 1.2.9: Add Pattern Learning to Workflow
- [ ] Add route `/campaigns/pattern-learning` to router
- [ ] Integrate PatternLearningScreen
- [ ] Navigate from CSV upload screen after products parsed
- [ ] Pass products and patterns to generation screen
- [ ] Add OAuth connection check before navigation
- [ ] Handle OAuth redirect flow if needed

#### Task 1.2.10: Unit Tests for Pattern Extraction
- [ ] Test Google Ads API service with mock data
- [ ] Test pattern extraction with sample campaign data
- [ ] Test ad group structure extraction
- [ ] Test high-performing keyword extraction
- [ ] Test ad copy pattern extraction
- [ ] Test bidding pattern extraction
- [ ] Test API endpoints
- [ ] Test pattern learning hook
- [ ] Test pattern viewer component

---

## Phase 2: Generation (Week 2)

### Subphase 2.1: Ad Group Generation (5 hours)

#### Task 2.1.1: Create Ad Group Generation Types
- [ ] Create `src/types/adgroup-generation.types.ts`:
  ```typescript
  interface AdGroupGenerationRequest {
    products: ProductInput[];
    targetCampaignId?: string;
    namingConvention?: string;
    maxAdGroups?: number;
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
- [ ] Export all types

#### Task 2.1.2: Create Ad Group Naming Service (Backend)
- [ ] Create `backend/src/services/adGroupNamingService.ts`
- [ ] Implement function to generate ad group name:
  - Use learned naming convention if available
  - Fallback to default patterns
  - Support patterns: "Brand + Model", "Product + Category", "Brand + Type"
- [ ] Validate ad group name against Google Ads requirements:
  - Max 255 characters
  - No special characters
- [ ] Add unit tests

#### Task 2.1.3: Create Ad Group Generation Service (Backend)
- [ ] Create `backend/src/services/adGroupGenerationService.ts`
- [ ] Implement `generateAdGroups()`:
  - Accept products and patterns
  - Generate one ad group per product (max 10)
  - Use adGroupNamingService for names
  - Assign to target campaign or auto-select
  - Return GeneratedAdGroup[]
- [ ] Add validation for ad group names
- [ ] Add unit tests

#### Task 2.1.4: Create Ad Group Generation API Endpoint (Backend)
- [ ] Add POST `/api/adgroups/generate` to `backend/src/routes/campaigns.ts`
- [ ] Accept request body: AdGroupGenerationRequest
- [ ] Call adGroupGenerationService
- [ ] Return GeneratedAdGroup[]
- [ ] Add error handling
- [ ] Add request validation

#### Task 2.1.5: Create Ad Group Generation Hook (Frontend)
- [ ] Create `src/hooks/useAdGroupGeneration.ts`
- [ ] Implement hook to call generation API
- [ ] Add loading state
- [ ] Add error handling
- [ ] Store generated ad groups in state

#### Task 2.1.6: Unit Tests for Ad Group Generation
- [ ] Test ad group naming service
- [ ] Test ad group generation service
- [ ] Test API endpoint
- [ ] Test generation hook

---

### Subphase 2.2: Keyword Generation (8 hours)

#### Task 2.2.1: Create Keyword Generation Types
- [ ] Create `src/types/keyword-generation.types.ts`:
  ```typescript
  interface KeywordSource {
    type: 'product_data' | 'existing_campaign' | 'llm_generated' | 'competitor';
    keyword: string;
    relevance: number;
    confidence: number;
  }

  interface GeneratedKeyword {
    text: string;
    matchType: 'broad' | 'phrase' | 'exact';
    source: KeywordSource;
    suggestedBid?: number;
  }
  ```
- [ ] Export all types

#### Task 2.2.2: Create Keyword Extraction from Product Data (Backend)
- [ ] Create `backend/src/services/keywordGenerationService.ts`
- [ ] Implement `extractKeywordsFromProduct()`:
  - Extract keywords from product name
  - Extract keywords from category
  - Extract keywords from description
  - Return keyword array with relevance scores
- [ ] Add unit tests

#### Task 2.2.3: Create Keyword Matching from Existing Campaigns (Backend)
- [ ] Add function to `keywordGenerationService.ts`:
  - Find similar keywords from high-performing keywords
  - Match by product category/theme
  - Calculate similarity scores
  - Return matched keywords with performance data
- [ ] Add unit tests

#### Task 2.2.4: Create LLM Keyword Generation (Backend)
- [ ] Install LLM client (OpenAI or Claude): `npm install openai` or `npm install @anthropic-ai/sdk`
- [ ] Add LLM configuration to environment variables
- [ ] Implement `generateKeywordsWithLLM()`:
  - Create prompt with product details
  - Request 20 keywords from LLM
  - Parse LLM response
  - Return keyword array
- [ ] Add error handling for LLM failures
- [ ] Add retry logic
- [ ] Add unit tests with mock LLM responses

#### Task 2.2.5: Create Keyword Aggregation & Ranking (Backend)
- [ ] Implement `aggregateAndRankKeywords()`:
  - Combine keywords from all sources
  - Remove duplicates
  - Rank by relevance and performance potential
  - Select top 15-20 keywords per ad group
- [ ] Add unit tests

#### Task 2.2.6: Create Keyword Validation (Backend)
- [ ] Implement `validateKeywords()`:
  - Check max 80 characters
  - Validate format (no invalid characters)
  - Check against Google Ads keyword policies
  - Return validation results
- [ ] Add unit tests

#### Task 2.2.7: Create Keyword Generation API Endpoint (Backend)
- [ ] Add POST `/api/keywords/generate` to `backend/src/routes/campaigns.ts`
- [ ] Accept body: `{ product: ProductInput, patterns: CampaignPatterns }`
- [ ] Call keywordGenerationService
- [ ] Return GeneratedKeyword[]
- [ ] Add POST `/api/keywords/validate`:
  - Accept body: `{ keywords: string[] }`
  - Return validation results
- [ ] Add error handling

#### Task 2.2.8: Create Keyword Generation Hook (Frontend)
- [ ] Create `src/hooks/useKeywordGeneration.ts`
- [ ] Implement hook to call generation API
- [ ] Add loading state
- [ ] Add progress tracking for multiple ad groups
- [ ] Add error handling
- [ ] Store generated keywords in state

#### Task 2.2.9: Unit Tests for Keyword Generation
- [ ] Test keyword extraction from product data
- [ ] Test keyword matching from existing campaigns
- [ ] Test LLM keyword generation (with mocks)
- [ ] Test keyword aggregation and ranking
- [ ] Test keyword validation
- [ ] Test API endpoints
- [ ] Test generation hook

---

### Subphase 2.3: Responsive Search Ad (RSA) Generation (6 hours)

#### Task 2.3.1: Create RSA Generation Types
- [ ] Create `src/types/rsa-generation.types.ts`:
  ```typescript
  interface GeneratedRSA {
    id: string;
    adGroupId: string;
    headlines: AdHeadline[];
    descriptions: AdDescription[];
    finalUrl: string;
    displayUrl?: string;
    paths?: string[];
  }

  interface AdHeadline {
    text: string;
    pinned?: boolean;
  }

  interface AdDescription {
    text: string;
  }
  ```
- [ ] Export all types

#### Task 2.3.2: Create Ad Copy Template Engine (Backend)
- [ ] Create `backend/src/services/adCopyTemplateService.ts`
- [ ] Implement template parsing from learned patterns
- [ ] Implement template variable substitution:
  - {productName}
  - {category}
  - {benefit}
  - {price}
- [ ] Add unit tests

#### Task 2.3.3: Create LLM Ad Copy Generation (Backend)
- [ ] Add to `backend/src/services/rsaGenerationService.ts`
- [ ] Implement `generateAdCopyWithLLM()`:
  - Create prompt with product details and patterns
  - Request 15 headlines and 4 descriptions
  - Parse LLM response
  - Validate character limits (30 for headlines, 90 for descriptions)
  - Return headlines and descriptions arrays
- [ ] Add error handling
- [ ] Add retry logic
- [ ] Add unit tests with mock LLM responses

#### Task 2.3.4: Create RSA Generation Service (Backend)
- [ ] Create `backend/src/services/rsaGenerationService.ts`
- [ ] Implement `generateRSA()`:
  - Accept ad group, product, and patterns
  - Generate 1 RSA per ad group (MVP)
  - Use LLM to generate headlines and descriptions
  - Incorporate product-specific information
  - Ensure variety in headlines and descriptions
  - Validate character limits
  - Return GeneratedRSA
- [ ] Add unit tests

#### Task 2.3.5: Create Ad Copy Validation (Backend)
- [ ] Implement `validateAdCopy()`:
  - Check headline character limits (max 30)
  - Check description character limits (max 90)
  - Validate minimum counts (3 headlines, 2 descriptions)
  - Check for invalid characters
  - Return validation results
- [ ] Add unit tests

#### Task 2.3.6: Create RSA Generation API Endpoint (Backend)
- [ ] Add POST `/api/ads/generate-rsa` to `backend/src/routes/campaigns.ts`
- [ ] Accept body: `{ adGroupId: string, product: ProductInput, patterns: CampaignPatterns }`
- [ ] Call rsaGenerationService
- [ ] Return GeneratedRSA
- [ ] Add POST `/api/ads/validate`:
  - Accept body: `{ headlines: string[], descriptions: string[] }`
  - Return validation results
- [ ] Add error handling

#### Task 2.3.7: Create RSA Generation Hook (Frontend)
- [ ] Create `src/hooks/useRSAGeneration.ts`
- [ ] Implement hook to call generation API
- [ ] Add loading state
- [ ] Add progress tracking
- [ ] Add error handling
- [ ] Store generated RSAs in state

#### Task 2.3.8: Unit Tests for RSA Generation
- [ ] Test ad copy template engine
- [ ] Test LLM ad copy generation (with mocks)
- [ ] Test RSA generation service
- [ ] Test ad copy validation
- [ ] Test API endpoints
- [ ] Test generation hook

---

## Phase 3: Preview & Export (Week 3)

### Subphase 3.1: Spreadsheet-Like Preview & Editing Interface (10 hours)

#### Task 3.1.1: Install Table/Grid Library
- [ ] Install React Table: `npm install @tanstack/react-table`
- [ ] Or install alternative: `npm install react-data-grid`
- [ ] Install required types

#### Task 3.1.2: Create Campaign Preview Types
- [ ] Create `src/types/campaign-preview.types.ts`
- [ ] Define types for editable campaign structure
- [ ] Define types for edit operations
- [ ] Define types for validation errors

#### Task 3.1.3: Create Campaign Preview Store (Frontend)
- [ ] Create `src/store/campaignPreviewStore.ts` (or extend existing)
- [ ] Store generated campaign structure
- [ ] Store edit history
- [ ] Store validation errors
- [ ] Add actions for editing
- [ ] Add actions for validation

#### Task 3.1.4: Create Ad Group Row Component (Frontend)
- [ ] Create `src/components/campaign-preview/AdGroupRow.tsx`
- [ ] Display ad group name (editable)
- [ ] Display expandable/collapsible row
- [ ] Show keyword count
- [ ] Show headline count
- [ ] Show description count
- [ ] Show final URL
- [ ] Add expand/collapse functionality
- [ ] Add inline editing for ad group name
- [ ] Add validation indicators

#### Task 3.1.5: Create Keyword Row Component (Frontend)
- [ ] Create `src/components/campaign-preview/KeywordRow.tsx`
- [ ] Display keyword text (editable)
- [ ] Display match type dropdown (editable)
- [ ] Display suggested bid (editable, optional)
- [ ] Show source indicator
- [ ] Add inline editing
- [ ] Add validation indicators
- [ ] Add delete button

#### Task 3.1.6: Create Ad Copy Editor Component (Frontend)
- [ ] Create `src/components/campaign-preview/AdCopyEditor.tsx`
- [ ] Display headlines list (editable)
- [ ] Display descriptions list (editable)
- [ ] Show character counts for each headline/description
- [ ] Add "Add Headline" button
- [ ] Add "Add Description" button
- [ ] Add delete buttons
- [ ] Add validation indicators
- [ ] Support pinning headlines to positions

#### Task 3.1.7: Create Campaign Preview Table Component (Frontend)
- [ ] Create `src/components/campaign-preview/CampaignPreviewTable.tsx`
- [ ] Use React Table or similar for table structure
- [ ] Integrate AdGroupRow components
- [ ] Integrate KeywordRow components (nested)
- [ ] Integrate AdCopyEditor components
- [ ] Add column management (show/hide, reorder)
- [ ] Add filtering functionality
- [ ] Add sorting functionality
- [ ] Add bulk selection
- [ ] Add responsive design

#### Task 3.1.8: Create Inline Editing Utilities (Frontend)
- [ ] Create `src/utils/inlineEditing.ts`
- [ ] Implement edit handlers for all field types
- [ ] Implement validation on edit
- [ ] Implement save/cancel functionality
- [ ] Add undo/redo support (optional)

#### Task 3.1.9: Create Validation Service (Frontend)
- [ ] Create `src/services/validationService.ts`
- [ ] Implement ad group name validation
- [ ] Implement keyword validation
- [ ] Implement headline validation
- [ ] Implement description validation
- [ ] Implement URL validation
- [ ] Return validation errors with field paths
- [ ] Add unit tests

#### Task 3.1.10: Create Campaign Preview Screen (Frontend)
- [ ] Create `src/components/campaign-preview/CampaignPreviewScreen.tsx`
- [ ] Integrate CampaignPreviewTable
- [ ] Add filters UI
- [ ] Add export button
- [ ] Add save draft button
- [ ] Add validation summary
- [ ] Show progress indicator during generation
- [ ] Handle navigation

#### Task 3.1.11: Add Campaign Preview to Workflow
- [ ] Add route `/campaigns/preview` to router
- [ ] Integrate CampaignPreviewScreen
- [ ] Navigate from generation completion
- [ ] Pass generated campaign data
- [ ] Store edits in state/store

#### Task 3.1.12: Unit Tests for Preview Interface
- [ ] Test ad group row component
- [ ] Test keyword row component
- [ ] Test ad copy editor component
- [ ] Test campaign preview table
- [ ] Test inline editing utilities
- [ ] Test validation service
- [ ] Test preview screen

---

### Subphase 3.2: CSV Export for Google Ads Editor (4 hours)

#### Task 3.2.1: Research Google Ads Editor CSV Format
- [ ] Document required columns for Google Ads Editor
- [ ] Document format requirements
- [ ] Create example CSV file
- [ ] Test import with Google Ads Editor (if available)

#### Task 3.2.2: Create CSV Export Service (Backend)
- [ ] Create `backend/src/services/csvExportService.ts`
- [ ] Install CSV library: `npm install csv-writer` or use built-in
- [ ] Implement `generateGoogleAdsEditorCSV()`:
  - Map internal campaign structure to Google Ads Editor format
  - Generate CSV rows for each keyword
  - Include all required columns
  - Format match types correctly ([Broad], [Phrase], [Exact])
  - Include headlines and descriptions
  - Include URLs
- [ ] Add unit tests

#### Task 3.2.3: Create Export Validation (Backend)
- [ ] Add to `csvExportService.ts`
- [ ] Implement `validateBeforeExport()`:
  - Check all required fields present
  - Validate character limits
  - Validate URL formats
  - Check for duplicates
  - Return validation results
- [ ] Add unit tests

#### Task 3.2.4: Create CSV Export API Endpoint (Backend)
- [ ] Add POST `/api/campaigns/export-csv` to `backend/src/routes/campaigns.ts`
- [ ] Accept body: `{ campaignId: string, includeAds: boolean }`
- [ ] Validate before export
- [ ] Generate CSV using csvExportService
- [ ] Return CSV file as download
- [ ] Add error handling
- [ ] Add POST `/api/campaigns/validate-export`:
  - Accept body: `{ campaignId: string }`
  - Return validation results

#### Task 3.2.5: Create Export Hook (Frontend)
- [ ] Create `src/hooks/useCSVExport.ts`
- [ ] Implement hook to call export API
- [ ] Handle file download
- [ ] Add loading state
- [ ] Add error handling
- [ ] Show success message

#### Task 3.2.6: Create Export Button Component (Frontend)
- [ ] Create `src/components/campaign-preview/ExportButton.tsx`
- [ ] Add "Export CSV" button
- [ ] Show validation status before export
- [ ] Disable if validation fails
- [ ] Show export progress
- [ ] Show success message with instructions
- [ ] Handle download

#### Task 3.2.7: Create Export Instructions Component (Frontend)
- [ ] Create `src/components/campaign-preview/ExportInstructions.tsx`
- [ ] Display instructions for Google Ads Editor upload
- [ ] Show step-by-step guide
- [ ] Add link to Google Ads Editor download (if needed)
- [ ] Display after successful export

#### Task 3.2.8: Integrate Export into Preview Screen
- [ ] Add ExportButton to CampaignPreviewScreen
- [ ] Add ExportInstructions component
- [ ] Handle export flow
- [ ] Show validation errors before export

#### Task 3.2.9: Unit Tests for CSV Export
- [ ] Test CSV generation with sample data
- [ ] Test Google Ads Editor format compliance
- [ ] Test export validation
- [ ] Test API endpoints
- [ ] Test export hook
- [ ] Test export button component

---

## Phase 4: Integration & Polish (Week 4)

### Subphase 4.1: Integration with Agentic Campaign Manager

#### Task 4.1.1: Add CSV Upload Option to Campaign Dashboard
- [ ] Update campaign dashboard to include "Bulk Generate from CSV/URLs" option
- [ ] Add navigation to CSV upload screen
- [ ] Maintain existing conversational workflow option
- [ ] Add workflow selection UI

#### Task 4.1.2: Integrate Shared Services
- [ ] Ensure campaign creation service is accessible
- [ ] Share Google Ads API integration
- [ ] Share pattern extraction (if used by conversational flow)
- [ ] Share export service
- [ ] Update service exports

#### Task 4.1.3: Integrate Shared Components
- [ ] Reuse validation components
- [ ] Reuse export components (if applicable)
- [ ] Ensure consistent styling
- [ ] Update component exports

#### Task 4.1.4: Update State Management
- [ ] Integrate CSV workflow state with existing campaign store
- [ ] Ensure state persistence
- [ ] Handle state cleanup
- [ ] Update store types

---

### Subphase 4.2: Error Handling & Validation Improvements

#### Task 4.2.1: Improve Error Messages
- [ ] Review all error messages for clarity
- [ ] Add user-friendly error messages
- [ ] Add error recovery suggestions
- [ ] Update error display components

#### Task 4.2.2: Add Retry Logic
- [ ] Add retry for Google Ads API calls
- [ ] Add retry for LLM API calls
- [ ] Add exponential backoff
- [ ] Add retry UI indicators

#### Task 4.2.3: Improve Validation Feedback
- [ ] Add real-time validation in preview
- [ ] Highlight validation errors clearly
- [ ] Add validation error tooltips
- [ ] Show validation summary

#### Task 4.2.4: Add Error Boundaries
- [ ] Add React error boundaries
- [ ] Handle API errors gracefully
- [ ] Add error logging
- [ ] Add error reporting (optional)

---

### Subphase 4.3: Performance Optimization

#### Task 4.3.1: Optimize Campaign Query
- [ ] Add caching for campaign data
- [ ] Implement request queuing
- [ ] Add rate limiting
- [ ] Optimize API calls

#### Task 4.3.2: Optimize LLM Calls
- [ ] Batch LLM requests where possible
- [ ] Add request queuing
- [ ] Cache common generations
- [ ] Optimize prompts for speed

#### Task 4.3.3: Optimize Frontend Rendering
- [ ] Add virtualization for large tables
- [ ] Optimize re-renders
- [ ] Add loading states
- [ ] Add progress indicators

#### Task 4.3.4: Performance Testing
- [ ] Test CSV parsing performance (target: < 2s for 10 products)
- [ ] Test campaign query performance (target: < 10s)
- [ ] Test pattern extraction performance (target: < 5s)
- [ ] Test ad group generation performance (target: < 3s for 10)
- [ ] Test keyword generation performance (target: < 30s total)
- [ ] Test RSA generation performance (target: < 20s total)
- [ ] Test total generation time (target: < 2 minutes)
- [ ] Optimize bottlenecks

---

### Subphase 4.4: User Experience Improvements

#### Task 4.4.1: Add Progress Indicators
- [ ] Add progress bar for generation process
- [ ] Show step-by-step progress
- [ ] Add estimated time remaining
- [ ] Add cancel option

#### Task 4.4.2: Add Help & Documentation
- [ ] Add tooltips for complex features
- [ ] Add help text for CSV format
- [ ] Add example CSV download
- [ ] Add FAQ section

#### Task 4.4.3: Improve Loading States
- [ ] Add skeleton loaders
- [ ] Add loading animations
- [ ] Show meaningful loading messages
- [ ] Prevent interaction during loading

#### Task 4.4.4: Add Success Feedback
- [ ] Add success animations
- [ ] Show generation summary
- [ ] Show export success message
- [ ] Add next steps guidance

---

### Subphase 4.5: Testing & Quality Assurance

#### Task 4.5.1: End-to-End Testing
- [ ] Test complete CSV upload workflow
- [ ] Test complete URL list workflow
- [ ] Test pattern learning workflow
- [ ] Test generation workflow
- [ ] Test preview and editing workflow
- [ ] Test export workflow
- [ ] Test error scenarios

#### Task 4.5.2: Integration Testing
- [ ] Test integration with existing campaign manager
- [ ] Test shared services
- [ ] Test state management
- [ ] Test routing

#### Task 4.5.3: User Acceptance Testing
- [ ] Test with sample CSV files
- [ ] Test with various CSV formats
- [ ] Test with URL lists
- [ ] Test with different product counts
- [ ] Test export and Google Ads Editor import
- [ ] Gather user feedback

#### Task 4.5.4: Bug Fixes
- [ ] Fix identified bugs
- [ ] Fix validation issues
- [ ] Fix performance issues
- [ ] Fix UI/UX issues

---

## Success Criteria Checklist

### Functionality
- [ ] CSV upload and parsing works correctly
- [ ] URL list parsing works correctly
- [ ] Existing campaign querying works
- [ ] Pattern extraction produces usable patterns
- [ ] Ad group generation creates 10 ad groups
- [ ] Keyword generation produces 15-20 keywords per ad group
- [ ] RSA generation produces valid ad copy
- [ ] Spreadsheet preview displays correctly
- [ ] Inline editing works for all fields
- [ ] CSV export produces valid Google Ads Editor format
- [ ] Export file imports successfully into Google Ads Editor

### Quality
- [ ] Generated keywords are relevant to products
- [ ] Generated ad copy matches existing style
- [ ] All validation rules enforced
- [ ] Error handling is comprehensive
- [ ] User feedback is clear and helpful

### Performance
- [ ] Complete workflow completes in < 15 minutes
- [ ] Generation completes in < 2 minutes for 10 products
- [ ] UI remains responsive during generation
- [ ] All performance targets met

### Integration
- [ ] Integrates seamlessly with Agentic Campaign Manager
- [ ] Shared services work correctly
- [ ] State management is consistent
- [ ] Routing works correctly

---

## Notes

- **MVP Limitation**: Limited to 10 products (expandable in future versions)
- **Match Type**: Default to broad match only (phrase/exact in future)
- **RSA Count**: 1 RSA per ad group (expandable to 2-3)
- **Manual Upload**: CSV export requires manual upload to Google Ads Editor (direct API upload in future)
- **Single Campaign**: Ad groups assigned to single campaign (multi-campaign in future)

---

---

## Phase 5: Build & Demo Preparation (Final)

### Subphase 5.1: Build & Run Tasks

#### Task 5.1.1: Build Backend
- [ ] Navigate to `backend/` directory
- [ ] Run `npm run build` to compile TypeScript
- [ ] Verify no TypeScript errors
- [ ] Verify build output in `backend/dist/` directory
- [ ] Test production build: `npm start` (if configured)

#### Task 5.1.2: Build Frontend
- [ ] Navigate to root directory
- [ ] Run `npm run build` to build frontend
- [ ] Verify no build errors
- [ ] Verify build output in `dist/` directory
- [ ] Test production preview: `npm run preview` (if configured)

#### Task 5.1.3: Run Development Servers
- [ ] Start backend server: `cd backend && npm run dev`
- [ ] Verify backend running on port 3001
- [ ] Start frontend server: `npm run dev` (in new terminal)
- [ ] Verify frontend running on port 3000
- [ ] Test end-to-end workflow in browser

#### Task 5.1.4: Demo Preparation
- [ ] Prepare sample CSV file with 5-10 products
- [ ] Prepare sample URL list for testing
- [ ] Set up mock Google Ads API data (if live API unavailable)
- [ ] Document demo workflow steps
- [ ] Test complete workflow from CSV upload to export
- [ ] Verify export file opens in Google Ads Editor (if available)

---

*Document Version: 2.0*  
*Created: January 2025*  
*Last Updated: January 2025*  
*Project: CSV/URL-Based Campaign Generation MVP*  
*Integration: Agentic Campaign Manager Module within Ad Development Environment*

