# ARCH v1 - Architectural Diagram Reference

**File Name:** `ARCH v1`  
**Location:** `2. Artifacts/`  
**Date:** 2025-11-09  
**Status:** Reference Document

---

## Image Description

This is a detailed architectural diagram (ARCH v1) illustrating the comprehensive system architecture for the Marin Software ad technology platform. The diagram shows various components, data flows, and interactions using different colored rectangular nodes and arrows.

### Key Components Shown:

1. **User Interaction & Authentication:**
   - Login/Signup → Cognito User Pool → JWT Token validation
   - React SWR/Vite/Amplify client (direct or agentic mode)
   - API Gateway + Cognito Authorizer
   - Main API Node/Express Lambda Entry Point

2. **Execution Paths:**
   - **Direct Mode Fast Path:** Direct Execution → Bulk Create Lambda, Campaign Mgmt Lambda, Copy Refresh Lambda
   - **Agentic Mode:** Agentic Execution + LLM Context → Video Gen Lambda, Ad Fraud Ingest Lambda, Bulk Create Lambda, Copy Refresh Lambda, Campaign Mgmt Lambda

3. **Message Queues (SQS):**
   - SQS Bulk Queue, SQS Copy Queue, SQS Video Queue, SQS Fraud Queue

4. **Worker Lambdas:**
   - Bulk Worker Lambda, Copy Worker Lambda, Ad Fraud Detect Lambda
   - Step Functions Banana Orchestration

5. **External Integrations:**
   - **Dispatcher ECS Fargate** (Rate Limiting & API Gateway)
   - Google Ads API, Meta Ads API, Other Ad Platforms
   - Redis (Rate Limiting & Cache OAuth Tokens)

6. **Data Storage:**
   - DynamoDB → S3 + Iceberg (Stream)
   - PostgreSQL? (or re-use DynamoDB?)
   - Query Layer Athena

7. **AI/ML Services:**
   - Bedrock/Claude integration

8. **Monitoring & Observability:**
   - X-Ray Distributed Tracing
   - CloudWatch Logs & Metrics & Dashboards
   - **Note:** Some Logs & Tracing lines are removed from the diagram for readability. All Lambda functions and microservices send logs and traces to X-Ray and CloudWatch.

### Key Architectural Patterns:

- **Dual Execution Modes:** Direct and Agentic execution paths
- **Microservices Architecture:** Lambda-based services
- **Asynchronous Processing:** SQS queues for scalability
- **External API Management:** Dispatcher for rate limiting and OAuth
- **Comprehensive Observability:** X-Ray and CloudWatch integration (all Lambdas/microservices logged, some tracing lines removed for readability)

---

## Notes

**Image File:**
The actual image file should be saved manually as `ARCH v1` (with appropriate image extension) in the `2. Artifacts/` directory.

**Observability:**
Some Logs & Tracing lines are removed from the diagram for readability. **All Lambda functions and microservices are logged and traced** - assume that all components send logs and traces to X-Ray Distributed Tracing and CloudWatch Logs & Metrics & Dashboards, even if not explicitly shown in the diagram.

This reference document provides context and description of the architectural diagram for documentation purposes.

---

**Last Updated:** 2025-11-09  
**Related Documents:** 
- `ARCHITECTURE-COMPARISON-ANALYSIS.md` - Comparison of architectural visions

