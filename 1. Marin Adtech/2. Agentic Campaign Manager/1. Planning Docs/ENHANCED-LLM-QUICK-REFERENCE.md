# Enhanced LLM & Competitor Analysis - Quick Reference

**Date**: 2025-11-11  
**Status**: Planning Phase

---

## 🎯 Three Main Enhancements

### 1. Specialized LLM Integration
**Goal**: Replace generic OpenAI calls with marketing-specialized models

**Approach**: Hybrid Self-Hosted + External API
- **Self-hosted fine-tuned model** (Llama 3/Mistral) for high-volume tasks:
  - RSA headline/description generation
  - Keyword generation
  - Synonym generation
- **External API (Claude 3.5 Sonnet)** for low-volume, complex reasoning:
  - Campaign strategy decisions
  - Bidding recommendations
  - Competitor analysis

**Impact**: 
- Better campaign/ad group/keyword generation
- Platform-specific best practices (Google Ads, Meta Ads)
- Improved RSA content quality
- Cost-effective at scale (1000+ generations/day)
- Full data privacy and control

---

### 2. URL Crawling & Content Analysis
**Goal**: Crawl provided URLs to generate smarter campaigns

**Tool**: Firecrawl (handles JS, structured extraction)

**Impact**:
- Campaigns based on actual website content
- Keywords extracted from page content
- Ad copy aligned with landing pages

---

### 3. Competitor Analysis Feature
**Goal**: Analyze competitor ads and provide improvement recommendations

**Access**: Separate feature in campaign preview (not part of creation flow)

**Features**:
- Crawl competitor landing pages
- Analyze competitor ad copy
- Compare against generated campaigns
- Recommendations with confidence scores

---

## 📋 Implementation Phases

### Phase 1: Specialized LLM (Week 1-2)
- Setup LLM infrastructure
- Create marketing LLM service
- Update existing generation services

### Phase 2: URL Crawling (Week 2-3)
- Integrate Firecrawl
- Content analysis pipeline
- Integration with campaign generation

### Phase 3: Competitor Analysis (Week 3-4)
- Competitor analysis service
- API endpoints
- Frontend integration

---

## 🔑 Key Files to Modify

**Existing Services**:
- `backend/src/services/rsaGenerationService.ts`
- `backend/src/services/keywordGenerationService.ts`
- `backend/src/services/adGroupGenerationService.ts`
- `backend/src/services/aiService.ts`

**New Services**:
- `backend/src/services/llm/marketingLLMService.ts`
- `backend/src/services/urlCrawling/urlCrawlingService.ts`
- `backend/src/services/competitorAnalysis/competitorAnalysisService.ts`

---

## 💰 Cost Considerations

**Self-Hosted LLM** (Recommended for high-volume):
- EC2 g5.xlarge spot: ~$220/month (unlimited generations)
- Break-even: ~500-1000 generations/day vs. external APIs
- At scale (10,000/day): Saves $500-1000/month

**External APIs** (For strategic decisions):
- Claude 3.5 Sonnet: ~$3-15 per 1M tokens
- GPT-4o-mini: ~$0.15-0.60 per 1M tokens

**Pinecone** (RAG + Semantic Search):
- Starter: $70/month (100K vectors, 100K queries)
- Standard: $200/month (1M vectors, 1M queries)

**Firecrawl**:
- Starter: $20/month (1,000 pages)
- Growth: $100/month (10,000 pages)

**Recommendation**: 
- Use self-hosted for high-volume generation
- Use external APIs for complex reasoning
- Implement usage limits and monitoring

---

## ⚠️ Prerequisites

1. ✅ Infrastructure compliance verified (InfraDocs)
2. ✅ All current errors resolved
3. ⬜ External API accounts set up (Firecrawl, Claude)
4. ⬜ Budget approved

---

## 📊 Success Metrics

- Campaign generation quality improvement
- URL crawling success rate >95%
- Competitor analysis recommendation acceptance rate
- Response times: LLM <5s, Crawling <10s, Analysis <30s

---

**Full Details**: See `ENHANCED-LLM-AND-COMPETITOR-ANALYSIS-PLAN.md`

