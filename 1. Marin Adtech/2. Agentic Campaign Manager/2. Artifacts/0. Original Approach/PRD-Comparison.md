# PRD Comparison: Original vs Updated

**Document**: PRD Comparison  
**Created**: January 2025  
**Purpose**: Identify all additions and changes between PRD-CSV-URL-Campaign-Generation-MVP.md (v1.0) and PRD-CSV-Updated.md (v2.0)

---

## Summary of Changes

**Total Changes**: 247 lines added, multiple sections expanded  
**Document Version**: 1.0 → 2.0  
**Primary Focus**: Added technical architecture details, OAuth authentication, environment configuration, and enhanced algorithm specifications

---

## Major Sections Added

### 1. **Technical Architecture Section** (NEW - ~150 lines)

**Location**: Added after "Product Overview" section (before "Feature Requirements")

**What Was Added**:
- Complete technology stack specification:
  - Frontend: React 18, TypeScript, Vite, Zustand, specific UI libraries
  - Backend: Node.js 18+, Express 5.x, TypeScript, all required libraries
  - Module Integration: ADE architecture details
- Module structure diagram showing file organization
- Service architecture diagram
- Data flow diagram (expanded with OAuth step)
- **Environment Variables** subsection:
  - Required environment variables with examples
  - Optional environment variables
  - Complete .env file template
- **Google Ads API Authentication** subsection:
  - OAuth 2.0 flow (8-step process)
  - Token management details
  - API client configuration code example
  - Token expiration handling

**Impact**: Provides complete technical foundation and setup requirements

---

### 2. **Enhanced Pattern Extraction Algorithm** (EXPANDED)

**Location**: Section 1.1 "Existing Campaign Query & Pattern Extraction"

**Original**: Brief description of what to extract

**Added**:
- **Ad Group Structure Extraction**:
  - Step-by-step algorithm (4 steps)
  - Tokenization process
  - Pattern frequency calculation
  - Theme identification process
  - Average calculation methodology
- **High-Performing Keywords Extraction**:
  - Step-by-step algorithm (3 steps)
  - Filtering criteria (CTR, conversions, ROAS thresholds)
  - Sorting methodology (primary, secondary, tertiary)
  - Return count specification (top 50)
- **Ad Copy Pattern Extraction**:
  - Step-by-step algorithm (4 steps)
  - Headline analysis process
  - Template generation with placeholders
  - Description analysis
  - Average calculations
- **Bidding Pattern Extraction**:
  - Step-by-step algorithm (4 steps)
  - Bid strategy type identification
  - Average CPC calculation

**Impact**: Provides implementable algorithm specifications

---

### 3. **Enhanced Keyword Generation Algorithm** (EXPANDED)

**Location**: Section 1.3 "Keyword Generation"

**Original**: High-level 6-step process

**Added**:
- **Detailed 5-step algorithm** with scoring:
  1. Extract from Product Data (relevance: 0.9)
  2. Match from Existing Campaigns (relevance: 0.8)
  3. LLM Generation (relevance: 0.7)
  4. Aggregate and Rank with detailed scoring formula:
     * Relevance * 0.4
     * Performance potential * 0.3
     * Confidence * 0.2
     * Intent score * 0.1
  5. Validate with specific checks
- **String similarity methods** specified (Levenshtein distance or cosine similarity)
- **Duplicate removal** process (case-insensitive, normalized)
- **Scoring formula** with weighted components

**Impact**: Provides implementable ranking and aggregation logic

---

### 4. **Ad Group Naming Algorithm** (NEW)

**Location**: Section 1.2 "Ad Group Generation"

**Original**: Examples only

**Added**:
- **5-step naming algorithm**:
  1. Parse learned naming convention pattern
  2. Extract brand/model from product name
  3. Apply pattern with variable substitution
  4. Validate against Google Ads requirements
  5. Ensure uniqueness (append number if duplicate)
- **Variable substitution** details ({Brand}, {Model}, {Category}, {Type})
- **Validation rules** (max 255 chars, allowed characters)
- **Uniqueness handling**

**Impact**: Provides implementable naming logic

---

### 5. **OAuth Authentication Requirements** (NEW - Added throughout)

**Location**: Multiple sections

**What Was Added**:

**In Section 1.1 "Existing Campaign Query & Pattern Extraction"**:
- OAuth Flow subsection (4-step process)
- Token validation requirements
- Token storage requirements
- API endpoint modifications:
  - Added "Headers: Authorization (OAuth token)" to all endpoints
  - Added OAuth token validation middleware requirement
  - Added fallback to mock data option

**In User Experience Requirements**:
- Added "OAuth Authentication" step in user flow
- Added "OAuth Connection Screen" UI component

**In Performance Requirements**:
- Added "OAuth Authentication" performance target (< 30 seconds)

**In Risk Assessment**:
- Added "Risk 2: OAuth Token Management" with mitigation strategies

**Impact**: Comprehensive OAuth integration throughout the workflow

---

### 6. **Enhanced Integration Context** (EXPANDED)

**Location**: Header and Executive Summary

**Original**:
- Framework: "Based on Agentic Campaign Manager PRD structure"
- Integration Context: "Feature addition to Agentic Campaign Manager Module"

**Updated**:
- Framework: "React + TypeScript + Express + TypeScript (Node.js)"
- Integration Context: "Feature addition to Agentic Campaign Manager Module within Ad Development Environment (ADE)"
- Integration Model: Expanded to explain ADE architecture (modular web application similar to Cursor)

**New Section**: "Module Integration with ADE"
- Module structure details
- Shared infrastructure requirements
- ADE lifecycle hooks
- ADE routing system integration

**Impact**: Clarifies module integration within broader ADE framework

---

### 7. **Enhanced API Endpoint Specifications** (EXPANDED)

**Location**: Throughout feature requirements

**What Was Added**:
- Authorization headers specified for all Google Ads API endpoints
- OAuth token validation requirements
- Fallback to mock data options
- Error handling specifications for OAuth failures

**Impact**: Complete API contract specifications

---

### 8. **Enhanced Ad Copy Generation Logic** (EXPANDED)

**Location**: Section 1.4 "Responsive Search Ad (RSA) Generation"

**Original**: 6 high-level steps

**Added**:
- **4-step detailed algorithm**:
  1. Extract Templates (with selection criteria)
  2. Template Variable Substitution (with placeholders)
  3. LLM Generation (with parsing requirements)
  4. Combine and Validate (with variety requirements)
- **Template selection** criteria (top 3-5 headlines, top 2-3 descriptions)
- **Variation generation** examples
- **Validation requirements** (character limits, minimum counts)

**Impact**: Provides implementable ad copy generation logic

---

### 9. **Enhanced Export Process** (EXPANDED)

**Location**: Section 1.6 "CSV Export for Google Ads Editor"

**Original**: 5-step high-level process

**Added**:
- **Encoding specification**: "UTF-8 with BOM for Excel compatibility"
- **Export validation** requirements expanded
- **Error handling** specifications

**Impact**: Ensures export compatibility

---

### 10. **Technical Debt Section Updates** (EXPANDED)

**Location**: End of document

**Original**: 6 MVP limitations

**Added**:
- **7th limitation**: "OAuth Token Storage: Session-based for MVP, database in future"
- **Version 2.0 features**: Added "Secure token storage in database"

**Impact**: Acknowledges OAuth token storage as technical debt

---

## Minor Changes

### Header Changes
- **Version**: 1.0 → 2.0
- **Framework**: Generic → Specific tech stack
- **Integration Context**: Simple → Detailed ADE context

### Section Reordering
- **Technical Architecture** moved before "Feature Requirements" (was embedded in Feature Requirements in original)

### Terminology Updates
- "PapaParse or similar" → "PapaParse" (specific library)
- "React Table or similar" → "@tanstack/react-table" (specific library)
- Added specific library versions where applicable

### Code Examples
- Added Google Ads API client configuration example
- Added more detailed TypeScript interface examples
- Added environment variable examples

---

## Key Improvements Summary

### 1. **Technical Clarity**
- ✅ Specific technology stack identified
- ✅ Complete environment variable specification
- ✅ OAuth flow fully documented
- ✅ Module integration details clarified

### 2. **Algorithm Specifications**
- ✅ Pattern extraction algorithms with step-by-step logic
- ✅ Keyword generation with scoring formula
- ✅ Ad group naming with validation rules
- ✅ Ad copy generation with template system

### 3. **Implementation Readiness**
- ✅ All required libraries specified
- ✅ API endpoints with authentication requirements
- ✅ Error handling specifications
- ✅ Mock data fallback options

### 4. **Integration Clarity**
- ✅ ADE architecture explained
- ✅ Module lifecycle hooks specified
- ✅ Shared services identified
- ✅ Integration patterns documented

---

## Missing from Original (Now Added)

1. **Backend framework specification** (Express + TypeScript)
2. **OAuth authentication flow** (complete 8-step process)
3. **Environment variable configuration** (complete template)
4. **Pattern extraction algorithms** (detailed step-by-step)
5. **Keyword ranking formula** (weighted scoring)
6. **Ad group naming algorithm** (5-step process)
7. **Module integration details** (ADE architecture)
8. **Token management** (expiration, refresh, storage)
9. **Mock data support** (fallback options)
10. **API authentication requirements** (headers, middleware)

---

## Conclusion

The updated PRD (v2.0) transforms the original from a high-level feature specification into a **technical implementation guide** with:

- **Complete technical stack** specification
- **Detailed algorithms** for all generation processes
- **OAuth integration** throughout
- **Environment configuration** requirements
- **Module integration** patterns for ADE

The document is now **implementation-ready** with all technical details necessary for development teams to begin work immediately.

---

*Document Created: January 2025*  
*Comparison: PRD v1.0 vs PRD v2.0*

