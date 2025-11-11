# Enhanced LLM Generation & Competitor Analysis - Planning Document

**Date**: 2025-11-11  
**Status**: Planning Phase  
**Priority**: Post-Infrastructure Compliance Verification

---

## Executive Summary

This document outlines the plan to enhance the Agentic Campaign Manager with:
1. **Specialized LLM Integration**: Replace generic OpenAI calls with marketing-specialized models that understand Google Ads, Meta Ads, and marketing best practices
2. **URL Crawling & Content Analysis**: Integrate Firecrawl (or similar) to analyze provided URLs and generate smarter campaigns based on actual website content
3. **Competitor Analysis Feature**: Separate feature accessible during preview to analyze competitor advertisements and provide improvement recommendations with confidence scores

---

## Current State Analysis

### Current LLM Implementation

**Location**: Multiple services use basic OpenAI GPT-4o-mini calls

1. **RSA Generation** (`rsaGenerationService.ts`)
   - Uses `gpt-4o-mini` with basic prompt
   - No URL crawling or content analysis
   - Generic copywriting instructions
   - No marketing platform specialization

2. **Keyword Generation** (`keywordGenerationService.ts`)
   - Uses `gpt-4o-mini` with basic prompt
   - No URL analysis
   - Generic keyword suggestions
   - No platform-specific keyword research

3. **Campaign/Ad Group Generation** (`adGroupGenerationService.ts`, `campaignGenerationService.ts`)
   - Rule-based generation (no LLM currently)
   - Simple naming conventions
   - No strategic optimization

4. **AI Service** (`aiService.ts`)
   - Uses `gpt-4o-mini` for goal understanding
   - Generic performance marketing assistant

### Current Limitations

- ❌ No specialized marketing knowledge
- ❌ No URL content analysis
- ❌ No competitor intelligence
- ❌ Generic prompts without platform-specific expertise
- ❌ No confidence scoring for recommendations
- ❌ Limited understanding of Google Ads/Meta Ads best practices

---

## Proposed Enhancements

### Enhancement 1: Specialized LLM Integration

#### 1.1 Marketing-Specialized Model Options

**Option A: Fine-Tuned OpenAI Model (External API)**
- Fine-tune GPT-4 or GPT-4o-mini on marketing/advertising datasets
- Training data: Google Ads best practices, Meta Ads guidelines, successful campaign examples
- **Pros**: Specialized knowledge, no infrastructure management
- **Cons**: Per-token costs, API rate limits, data privacy concerns, ongoing API dependency

**Option B: Claude 3.5 Sonnet (Anthropic API)**
- Already has strong marketing/advertising knowledge
- Can be enhanced with RAG (Retrieval-Augmented Generation) using marketing docs
- **Pros**: High quality out-of-box, no training needed, excellent reasoning
- **Cons**: Higher cost, API dependency, rate limits

**Option C: Hybrid External APIs**
- Use Claude 3.5 Sonnet for strategic decisions (campaign structure, bidding)
- Use fine-tuned GPT-4o-mini for copy generation (cost-effective)
- **Pros**: Best of both worlds, optimized costs
- **Cons**: More complex integration, still dependent on external APIs

**Option D: Self-Hosted LLM (Recommended for High-Volume Tasks)**
- Host fine-tuned open-source models (Llama 3, Mistral, Qwen) on AWS infrastructure
- Fine-tune on marketing/advertising datasets
- Deploy on EC2 GPU instances (g5.xlarge or larger) or use AWS Bedrock Custom Models
- **Pros**: 
  - No per-token costs (fixed infrastructure cost)
  - Full data privacy and control
  - No API rate limits
  - Can fine-tune specifically for marketing/advertising
  - Cost-effective at scale (1000+ generations/day)
  - Can optimize for specific use cases (RSA generation, keyword generation)
- **Cons**: 
  - Initial setup complexity (GPU infrastructure)
  - Infrastructure management overhead
  - May need multiple models for different tasks
  - Lower quality than Claude 3.5 for complex reasoning

**Recommended**: **Option E - Hybrid Self-Hosted + External API (Best of Both Worlds)**

**Strategy**:
- **Self-hosted fine-tuned model** for high-volume, repetitive tasks:
  - RSA headline/description generation (1000s per day)
  - Keyword generation (1000s per day)
  - Ad copy variations
  - Synonym generation (via semantic search + LLM)
- **External API (Claude 3.5 Sonnet)** for low-volume, complex reasoning:
  - Campaign strategy decisions
  - Bidding strategy recommendations
  - Competitor analysis insights
  - Complex goal understanding

**Cost Analysis** (1000 generations/day):
- **Self-hosted**: ~$200-400/month (g5.xlarge spot instance) = $0.007-0.013 per generation
- **External API**: ~$30-150/month (depending on model) = $0.001-0.005 per generation
- **Break-even**: ~500-1000 generations/day (self-hosted becomes cheaper)
- **At scale (10,000/day)**: Self-hosted saves $500-1000/month

#### 1.2 Platform-Specific Specialization

**Google Ads Specialization**
- RSA headline/description best practices (30/90 char limits, pinning strategies)
- Keyword match type recommendations (BROAD/PHRASE/EXACT)
- Ad group structure optimization
- Bidding strategy recommendations
- Quality Score optimization insights

**Meta Ads Specialization**
- Ad creative best practices
- Audience targeting recommendations
- Campaign objective alignment
- Budget optimization strategies

**Implementation Strategy**
- Create specialized prompt templates per platform
- Use RAG + Vector Database (Pinecone) to inject platform-specific documentation
- Fine-tune self-hosted models on platform-specific successful campaigns
- Use semantic search for synonym generation and keyword expansion

#### 1.3 Integration Points

**Files to Modify**:
1. `backend/src/services/rsaGenerationService.ts`
   - Replace `generateAdCopyWithLLM()` with specialized version
   - Add platform-specific prompt templates
   - Add RAG context injection

2. `backend/src/services/keywordGenerationService.ts`
   - Replace `generateKeywordsWithLLM()` with specialized version
   - Add keyword research capabilities
   - Add match type recommendations

3. `backend/src/services/adGroupGenerationService.ts`
   - Add LLM-based ad group structure optimization
   - Add strategic naming recommendations

4. `backend/src/services/aiService.ts`
   - Enhance goal understanding with marketing expertise
   - Add campaign strategy recommendations

**New Files to Create**:
- `backend/src/services/llm/marketingLLMService.ts` - Main service for marketing LLM calls (routes to self-hosted or external)
- `backend/src/services/llm/selfHostedLLMService.ts` - Self-hosted LLM API client
- `backend/src/services/llm/externalLLMService.ts` - External API client (Claude, OpenAI)
- `backend/src/services/llm/promptTemplates.ts` - Platform-specific prompts
- `backend/src/services/llm/ragService.ts` - RAG for marketing documentation (Pinecone integration)
- `backend/src/services/llm/semanticSearchService.ts` - Semantic search for synonym generation
- `backend/src/services/llm/vectorDBService.ts` - Pinecone vector database service
- `backend/src/config/llmConfig.ts` - LLM configuration (models, API keys, endpoints)

#### 1.4 RAG + Vector Database Integration (Pinecone)

**Purpose**: Enhance LLM responses with marketing-specific knowledge and enable semantic search for synonym generation

**Architecture**:
- **Vector Database**: Pinecone (managed, scalable, fast)
- **Embedding Model**: OpenAI `text-embedding-3-small` or `text-embedding-ada-002` (cost-effective)
- **Knowledge Base**: Marketing documentation, best practices, successful campaign examples

**Knowledge Sources to Ingest**:
1. Google Ads documentation and best practices
2. Meta Ads documentation and best practices
3. Industry marketing guides (WordStream, HubSpot, etc.)
4. Successful campaign examples (anonymized)
5. Keyword research data
6. Ad copy templates and examples
7. Platform-specific guidelines (character limits, policies, etc.)

**RAG Implementation**:
```typescript
// RAG Flow
1. User query → Embedding model → Vector search in Pinecone
2. Retrieve top K relevant documents (K=5-10)
3. Inject retrieved context into LLM prompt
4. LLM generates response with marketing-specific knowledge
```

**Benefits**:
- LLM responses grounded in marketing best practices
- Up-to-date knowledge (can update vector DB without retraining)
- Reduces hallucinations
- Provides citations/sources for recommendations

#### 1.5 Semantic Search for Synonym Generation

**Purpose**: Generate relevant synonyms and related keywords for campaign generation using semantic similarity

**Implementation**:
1. **Vectorize Existing Keywords**: Embed all existing keywords in campaigns
2. **Semantic Search**: For a new keyword, find semantically similar keywords in vector space
3. **Synonym Generation**: Use LLM + RAG to generate synonyms based on semantic context
4. **Keyword Expansion**: Suggest related keywords for ad groups

**Flow**:
```
New keyword "running shoes"
  ↓
Embed keyword → Vector search in Pinecone
  ↓
Find similar keywords: "athletic footwear", "sneakers", "trainers"
  ↓
RAG retrieval: Marketing docs about footwear keywords
  ↓
LLM generates synonyms: "jogging shoes", "athletic sneakers", "running trainers"
  ↓
Return expanded keyword list with match type recommendations
```

**Integration Points**:
- `keywordGenerationService.ts`: Use semantic search for keyword expansion
- `adGroupGenerationService.ts`: Group semantically similar keywords
- Campaign preview: Show synonym suggestions

**New Service**: `backend/src/services/llm/semanticSearchService.ts`

```typescript
interface SynonymGenerationRequest {
  keyword: string;
  context?: string; // Product context, category, etc.
  maxSynonyms?: number; // Default: 10
}

interface SynonymResult {
  keyword: string;
  synonyms: string[];
  semanticSimilarity: number; // 0-1
  matchTypeRecommendation: 'BROAD' | 'PHRASE' | 'EXACT';
  confidence: number;
}
```

---

### Enhancement 2: URL Crawling & Content Analysis

#### 2.1 Firecrawl Integration

**Why Firecrawl?**
- Handles JavaScript-rendered content
- Extracts structured data (title, description, pricing, features)
- Handles authentication and cookies
- Rate limiting and retry logic
- Clean HTML extraction

**Alternative Options**:
- **Puppeteer/Playwright**: More control but requires more infrastructure
- **Scrapy**: Good for simple sites, limited JS support
- **Bright Data**: Enterprise-grade but expensive

**Recommended**: **Firecrawl** (best balance of features and ease of integration)

#### 2.2 Content Analysis Pipeline

**Step 1: URL Crawling**
```
User provides URL → Firecrawl API → Structured content extraction
```

**Step 2: Content Analysis**
- Extract product information (name, price, description, features)
- Identify value propositions
- Extract competitor mentions
- Analyze page structure and messaging
- Extract images and media

**Step 3: Enhanced Generation**
- Use extracted content to inform LLM prompts
- Generate more accurate keywords based on actual content
- Create headlines/descriptions that match page messaging
- Align ad copy with landing page content

#### 2.3 Implementation Architecture

**New Service**: `backend/src/services/urlCrawlingService.ts`

```typescript
interface CrawledContent {
  url: string;
  title: string;
  description: string;
  content: string; // Main text content
  structuredData: {
    price?: number;
    currency?: string;
    features?: string[];
    images?: string[];
    metadata?: Record<string, any>;
  };
  extractedAt: string;
}

async function crawlURL(url: string): Promise<CrawledContent>
async function analyzeContent(content: CrawledContent): Promise<ContentAnalysis>
```

**Integration Points**:
1. **Campaign Generation Flow**
   - Before generating campaigns, crawl provided URLs
   - Pass crawled content to LLM services
   - Use content to enhance keyword/ad copy generation

2. **RSA Generation**
   - Use crawled content to ensure ad copy matches landing page
   - Extract value propositions from page
   - Generate headlines that align with page messaging

3. **Keyword Generation**
   - Extract keywords from page content
   - Use page structure to identify important terms
   - Generate keywords that match user search intent

#### 2.4 Caching Strategy

- Cache crawled content in Redis (24-hour TTL)
- Store in PostgreSQL for historical analysis
- Invalidate cache on URL updates

---

### Enhancement 3: Competitor Analysis Feature

#### 3.1 Feature Overview

**Purpose**: Analyze competitor advertisements to provide improvement recommendations

**Access Point**: Separate feature accessible during campaign preview (not part of ad creation flow)

**Key Capabilities**:
1. Crawl competitor landing pages
2. Analyze competitor ad copy (if accessible)
3. Compare against generated campaigns
4. Provide improvement recommendations with confidence scores
5. Suggest keyword opportunities
6. Recommend bidding strategies

#### 3.2 Competitor Data Sources

**Option A: Manual Input**
- User provides competitor URLs
- User provides competitor ad examples (screenshots or text)

**Option B: Automated Discovery**
- Use Google Ads Transparency Center API (if available)
- Use Meta Ad Library API
- Use third-party tools (SEMrush, Ahrefs APIs)

**Option C: Hybrid**
- Start with manual input
- Enhance with automated discovery where possible

**Recommended**: **Option C (Hybrid)**

#### 3.3 Analysis Components

**1. Ad Copy Analysis**
- Compare headlines/descriptions
- Identify messaging gaps
- Suggest improvements

**2. Keyword Analysis**
- Identify competitor keywords
- Find keyword gaps
- Suggest new keyword opportunities

**3. Landing Page Analysis**
- Compare landing page quality
- Identify conversion optimization opportunities
- Suggest improvements

**4. Campaign Structure Analysis**
- Compare ad group organization
- Identify structural improvements
- Suggest optimization strategies

#### 3.4 Confidence Scoring

**Confidence Score Factors**:
- Data quality (0.0 - 1.0)
  - Complete competitor data: 1.0
  - Partial data: 0.5-0.8
  - Limited data: 0.3-0.5

- Recommendation strength (0.0 - 1.0)
  - Strong evidence: 0.8-1.0
  - Moderate evidence: 0.5-0.8
  - Weak evidence: 0.3-0.5

- Industry alignment (0.0 - 1.0)
  - Industry best practices: 0.9-1.0
  - General best practices: 0.7-0.9
  - Experimental: 0.5-0.7

**Final Confidence Score**: Weighted average of factors

#### 3.5 Implementation Architecture

**New Service**: `backend/src/services/competitorAnalysisService.ts`

```typescript
interface CompetitorAnalysisRequest {
  campaignId: string;
  competitorUrls: string[];
  competitorAds?: CompetitorAd[];
}

interface CompetitorAd {
  headline?: string;
  description?: string;
  landingPageUrl: string;
  platform: 'google' | 'meta' | 'other';
}

interface CompetitorAnalysisResult {
  campaignId: string;
  recommendations: Recommendation[];
  confidenceScore: number;
  analyzedAt: string;
}

interface Recommendation {
  type: 'keyword' | 'ad_copy' | 'structure' | 'bidding' | 'landing_page';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  suggestedAction: string;
}
```

**New API Endpoint**: `POST /api/campaigns/:id/competitor-analysis`

**Frontend Integration**:
- Add "Competitor Analysis" button in campaign preview
- Display recommendations with confidence scores
- Allow user to apply recommendations

---

## Technical Architecture

### Service Layer Structure

```
backend/src/services/
├── llm/
│   ├── marketingLLMService.ts      # Main marketing LLM service (routes to self-hosted/external)
│   ├── selfHostedLLMService.ts      # Self-hosted LLM API client
│   ├── externalLLMService.ts      # External API client (Claude, OpenAI)
│   ├── promptTemplates.ts          # Platform-specific prompts
│   ├── ragService.ts               # RAG for marketing docs (Pinecone integration)
│   ├── semanticSearchService.ts    # Semantic search for synonym generation
│   ├── vectorDBService.ts          # Pinecone vector database service
│   └── modelRouter.ts              # Routes to appropriate model based on task
├── urlCrawling/
│   ├── urlCrawlingService.ts       # Firecrawl integration
│   ├── contentAnalyzer.ts          # Content analysis
│   └── cacheManager.ts             # Caching strategy
├── competitorAnalysis/
│   ├── competitorAnalysisService.ts # Main competitor service
│   ├── competitorCrawler.ts        # Competitor data collection
│   ├── recommendationEngine.ts     # Generate recommendations
│   └── confidenceScorer.ts         # Calculate confidence scores
└── [existing services updated]
```

### Data Flow

**Enhanced Campaign Generation Flow**:
```
1. User provides URLs
   ↓
2. URL Crawling Service crawls URLs
   ↓
3. Content Analysis extracts structured data
   ↓
4. RAG Service retrieves relevant marketing knowledge (Pinecone)
   ↓
5. Marketing LLM Service generates campaigns
   (with crawled content + RAG context)
   - Self-hosted LLM for high-volume tasks (RSA, keywords)
   - External API (Claude) for strategic decisions
   ↓
6. Semantic Search generates synonyms and related keywords
   ↓
7. Enhanced keywords, ad groups, RSA generated
   ↓
8. Campaign preview with competitor analysis option
```

**Competitor Analysis Flow**:
```
1. User clicks "Competitor Analysis" in preview
   ↓
2. User provides competitor URLs/ads
   ↓
3. Competitor Analysis Service:
   - Crawls competitor URLs
   - Analyzes competitor ads
   - Compares against generated campaign
   ↓
4. Recommendation Engine generates recommendations
   ↓
5. Confidence Scorer calculates scores
   ↓
6. Results displayed to user
```

---

## Implementation Plan

### Phase 1: Specialized LLM Integration (Week 1-2)

**Tasks**:
1. **Setup LLM Infrastructure**
   - [ ] Create `llm/` service directory
   - [ ] Set up self-hosted LLM infrastructure (EC2 GPU instance or AWS Bedrock Custom Models)
   - [ ] Set up Claude API integration (for strategic decisions)
   - [ ] Set up Pinecone account and create index
   - [ ] Set up embedding model (OpenAI or self-hosted)
   - [ ] Create LLM configuration service

2. **Create Marketing LLM Service**
   - [ ] Implement `marketingLLMService.ts`
   - [ ] Add model routing logic
   - [ ] Add error handling and fallbacks

3. **Create Prompt Templates**
   - [ ] Google Ads prompt templates
   - [ ] Meta Ads prompt templates
   - [ ] Keyword research prompts
   - [ ] Campaign strategy prompts

4. **Integrate RAG + Vector Database (Required)**
   - [ ] Set up Pinecone index for marketing knowledge
   - [ ] Create embedding pipeline for marketing documents
   - [ ] Ingest marketing documentation (Google Ads, Meta Ads, best practices)
   - [ ] Implement RAG retrieval service
   - [ ] Test RAG-enhanced LLM responses

5. **Implement Semantic Search for Synonyms**
   - [ ] Create semantic search service
   - [ ] Vectorize existing keywords in campaigns
   - [ ] Implement synonym generation using semantic search + LLM
   - [ ] Integrate with keyword generation service

6. **Update Existing Services**
   - [ ] Update `rsaGenerationService.ts` (use self-hosted LLM + RAG)
   - [ ] Update `keywordGenerationService.ts` (use semantic search + self-hosted LLM)
   - [ ] Update `adGroupGenerationService.ts` (use external API for strategy)
   - [ ] Update `aiService.ts` (use external API for complex reasoning)

**Deliverables**:
- Marketing LLM service operational
- All generation services using specialized models
- Tests passing

---

### Phase 2: URL Crawling Integration (Week 2-3)

**Tasks**:
1. **Setup Firecrawl Integration**
   - [ ] Create Firecrawl account/API key
   - [ ] Create `urlCrawlingService.ts`
   - [ ] Implement URL crawling logic
   - [ ] Add error handling and retries

2. **Content Analysis**
   - [ ] Create `contentAnalyzer.ts`
   - [ ] Implement content extraction
   - [ ] Implement structured data parsing
   - [ ] Add content validation

3. **Caching Implementation**
   - [ ] Set up Redis caching
   - [ ] Implement cache invalidation
   - [ ] Add cache hit/miss metrics

4. **Integration with Campaign Generation**
   - [ ] Update campaign generation flow
   - [ ] Pass crawled content to LLM services
   - [ ] Update UI to show crawled content

**Deliverables**:
- URL crawling service operational
- Content analysis working
- Campaign generation enhanced with crawled content

---

### Phase 3: Competitor Analysis Feature (Week 3-4)

**Tasks**:
1. **Competitor Analysis Service**
   - [ ] Create `competitorAnalysisService.ts`
   - [ ] Implement competitor data collection
   - [ ] Create recommendation engine
   - [ ] Implement confidence scoring

2. **API Endpoints**
   - [ ] Create competitor analysis endpoint
   - [ ] Add authentication/authorization
   - [ ] Add rate limiting

3. **Frontend Integration**
   - [ ] Add "Competitor Analysis" button in preview
   - [ ] Create competitor input form
   - [ ] Display recommendations with confidence scores
   - [ ] Add "Apply Recommendation" functionality

4. **Testing & Validation**
   - [ ] Unit tests for all services
   - [ ] Integration tests
   - [ ] End-to-end tests
   - [ ] User acceptance testing

**Deliverables**:
- Competitor analysis feature complete
- UI integration complete
- Tests passing

---

## Dependencies & Considerations

### External Dependencies

1. **Firecrawl API**
   - Account setup required
   - API key management
   - Rate limits and pricing

2. **Claude API (Anthropic)**
   - API key setup
   - Rate limits
   - Cost considerations

3. **OpenAI API** (if fine-tuning)
   - Fine-tuning access
   - Training data preparation
   - Model deployment

4. **Pinecone Vector Database** (Required)
   - Pinecone account setup
   - Index creation and configuration
   - Embedding model selection (OpenAI or self-hosted)
   - Knowledge base ingestion pipeline

5. **Self-Hosted LLM Infrastructure**
   - EC2 GPU instance (g5.xlarge or larger) OR
   - AWS Bedrock Custom Models (if using Bedrock)
   - Model serving infrastructure (vLLM, TensorRT-LLM, or similar)
   - Load balancing and auto-scaling
   - Model fine-tuning pipeline

### Infrastructure Considerations

1. **Redis Caching**
   - Already in infrastructure (from InfraDocs)
   - May need to increase capacity for URL caching

2. **Database Schema Updates**
   - Add tables for:
     - Crawled content cache
     - Competitor analysis results
     - Recommendation history
     - Keyword vectors (for semantic search)
     - RAG knowledge base metadata

3. **API Rate Limits**
   - Firecrawl rate limits
   - LLM API rate limits
   - Implement queuing for bulk operations

4. **Cost Management**
   - Monitor self-hosted LLM infrastructure costs (EC2 GPU instances)
   - Monitor external API costs (Claude for strategic decisions)
   - Monitor Pinecone costs (storage + queries)
   - Monitor Firecrawl costs
   - Implement usage limits per user
   - Cost optimization: Use spot instances for self-hosted LLM where possible

### Security Considerations

1. **URL Validation**
   - Validate URLs before crawling
   - Prevent SSRF attacks
   - Whitelist/blacklist domains

2. **Content Sanitization**
   - Sanitize crawled content
   - Prevent XSS in displayed content
   - Validate structured data

3. **API Key Management**
   - Store in AWS Secrets Manager
   - Rotate keys regularly
   - Monitor for leaks

---

## Success Metrics

### Quality Metrics

1. **Campaign Generation Quality**
   - Ad copy relevance score (user rating)
   - Keyword match rate (keywords that perform)
   - Campaign performance improvement (CTR, conversions)

2. **URL Crawling Effectiveness**
   - Content extraction accuracy
   - Cache hit rate
   - Crawl success rate

3. **Competitor Analysis Value**
   - Recommendation acceptance rate
   - Confidence score accuracy
   - User satisfaction score

### Performance Metrics

1. **Response Times**
   - LLM generation time (target: <5s)
   - URL crawling time (target: <10s)
   - Competitor analysis time (target: <30s)

2. **Cost Metrics**
   - Cost per campaign generation
   - Cost per competitor analysis
   - Monthly API costs

---

## Risk Mitigation

### Risks

1. **API Dependency Risk**
   - **Mitigation**: Implement fallbacks to generic models
   - **Mitigation**: Cache responses aggressively

2. **Cost Overrun Risk**
   - **Mitigation**: Implement usage limits
   - **Mitigation**: Monitor costs in real-time
   - **Mitigation**: Use cost-effective models where possible

3. **Quality Risk**
   - **Mitigation**: A/B test new vs. old generation
   - **Mitigation**: User feedback loops
   - **Mitigation**: Gradual rollout

4. **URL Crawling Failures**
   - **Mitigation**: Robust error handling
   - **Mitigation**: Fallback to manual input
   - **Mitigation**: Retry logic with exponential backoff

---

## Next Steps

### Immediate (Before Starting)

1. ✅ Verify infrastructure compliance (InfraDocs)
2. ✅ Resolve all current errors
3. ⬜ Review and approve this plan
4. ⬜ Set up external API accounts (Firecrawl, Claude)
5. ⬜ Estimate costs and set budgets

### Phase 1 Kickoff

1. Create feature branch: `feat/enhanced-llm-integration`
2. Set up development environment
3. Begin LLM service implementation
4. Start prompt template development

---

## Appendix

### A. LLM Model Comparison

| Model | Cost | Quality | Speed | Specialization | Best For |
|-------|------|---------|-------|----------------|----------|
| GPT-4o-mini (API) | Low | Good | Fast | None | Low-volume testing |
| GPT-4o (API) | Medium | Excellent | Medium | None | High-quality copy |
| Claude 3.5 Sonnet (API) | Medium | Excellent | Medium | Strong | Strategic decisions |
| Self-hosted (Llama 3/Mistral) | Fixed | Good-Excellent | Fast | Custom (fine-tuned) | High-volume generation |
| Fine-tuned GPT-4o-mini (API) | Low (after training) | Excellent | Fast | Custom | Specialized tasks |

**Self-Hosted Options**:
- **Llama 3 8B/70B**: Good quality, fast inference, easy to fine-tune
- **Mistral 7B**: Excellent quality-to-size ratio, fast
- **Qwen 2.5**: Strong multilingual support, good for international campaigns
- **Recommended**: Llama 3 8B (fine-tuned) for RSA/keyword generation, Mistral 7B for ad copy

### B. Firecrawl Pricing (Reference)

- Starter: $20/month (1,000 pages)
- Growth: $100/month (10,000 pages)
- Business: Custom pricing

### D. Self-Hosted LLM Infrastructure Costs (AWS)

**EC2 GPU Instances** (on-demand):
- g5.xlarge (1 GPU, 4 vCPU, 16GB RAM): ~$1.00/hour = ~$730/month
- g5.2xlarge (1 GPU, 8 vCPU, 32GB RAM): ~$1.50/hour = ~$1,095/month
- g5.4xlarge (1 GPU, 16 vCPU, 64GB RAM): ~$2.00/hour = ~$1,460/month

**EC2 GPU Instances** (spot, ~70% discount):
- g5.xlarge spot: ~$0.30/hour = ~$220/month
- g5.2xlarge spot: ~$0.45/hour = ~$330/month

**AWS Bedrock Custom Models** (alternative):
- Model hosting: Pay per inference
- No infrastructure management
- Good for testing, may be more expensive at scale

**Recommendation**: Start with g5.xlarge spot instance (~$220/month), scale up if needed

### C. Pinecone Pricing (Reference)

**Starter Plan**:
- $70/month: 1 index, 100K vectors, 100K queries/month
- Good for initial RAG implementation

**Standard Plan**:
- $200/month: 1 index, 1M vectors, 1M queries/month
- Recommended for production

**Enterprise**: Custom pricing for larger scale

### E. Competitor Analysis Data Sources

1. **Google Ads Transparency Center**
   - Public ad library
   - Limited API access
   - Requires manual scraping

2. **Meta Ad Library**
   - Public ad library
   - API available
   - Good coverage

3. **Third-party Tools**
   - SEMrush API
   - Ahrefs API
   - SpyFu API

---

**Last Updated**: 2025-11-11  
**Next Review**: After infrastructure compliance verification

