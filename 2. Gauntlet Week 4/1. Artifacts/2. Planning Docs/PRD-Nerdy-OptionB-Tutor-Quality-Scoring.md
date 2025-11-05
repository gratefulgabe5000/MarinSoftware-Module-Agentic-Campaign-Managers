# Product Requirements Document: Tutor Quality Scoring System

**Version:** 1.0  
**Date:** November 3, 2025  
**Project Duration:** 7 Days (Nov 3 - Nov 9, 2025)  
**Project Start:** November 3, 2025  
**Framework:** Based on October 16, 2025 success path methodology  
**Target:** Automated tutor performance evaluation and coaching system

---

## Executive Summary

Tutor Quality Scoring System is an automated evaluation platform that assesses tutor performance across every session, identifies coaching opportunities, predicts which tutors will churn, and recommends interventions. The system processes 3,000 daily sessions and provides actionable insights within 1 hour of session completion, addressing critical retention and quality issues.

**Key Deliverables:**
- ✅ Automated tutor performance scoring across all sessions
- ✅ Coaching opportunity identification
- ✅ Tutor churn prediction model
- ✅ Intervention recommendations
- ✅ Real-time performance dashboard
- ✅ First session quality detection (24% churn prevention)
- ✅ Rescheduling rate analysis (98.2% tutor-initiated detection)
- ✅ No-show risk identification (16% replacement prevention)

**Success Targets:**
- **MVP (Nov 4)**: Core scoring system, basic session analysis, simple dashboard
- **Early Submission (Nov 7)**: + Churn prediction, intervention recommendations, retention features
- **Final Submission (Nov 9)**: + Full analytics dashboard, coaching insights, comprehensive testing

**Business Impact:**
- Prevents 24% of churners through first session quality detection
- Identifies 98.2% of tutor-initiated reschedules
- Reduces 16% of tutor replacements through no-show prediction
- Processes 3,000 sessions/day with <1 hour latency

---

## Project Timeline

| Milestone | Date | Deliverable |
|-----------|------|-------------|
| **Phase 1: MVP** | Tuesday, November 4, 2025 | Core scoring system, session analysis, basic dashboard |
| **Early Submission** | Friday, November 7, 2025 | + Churn prediction, interventions, retention features |
| **Final Submission** | Sunday, November 9, 2025 | + Full analytics, coaching insights, comprehensive testing, demo video |

---

## Technology Stack

### AI/ML Stack
- **LLM Provider**: OpenAI GPT-4 for session analysis and scoring
- **ML Framework**: scikit-learn (Python) for churn prediction model
- **Embeddings**: OpenAI text-embedding-3-small for semantic analysis
- **Vector Database**: PostgreSQL with pgvector for session similarity search
- **ML Pipeline**: Python scripts for model training and prediction

### Backend Stack
- **Framework**: Ruby on Rails 7+ (integrates with existing platform)
- **API**: RESTful API + GraphQL for complex queries
- **Background Jobs**: Sidekiq for async processing (session analysis, scoring)
- **Database**: PostgreSQL (existing Nerdy infrastructure)
- **Caching**: Redis for session data and model predictions
- **Python Integration**: Python microservice for ML models (via HTTP API)

### Frontend Stack
- **Framework**: React 18+ (integrates with existing platform)
- **State Management**: React Query for server state, Zustand for client state
- **UI Components**: Existing Nerdy design system components
- **Charts**: Recharts or Chart.js for analytics visualization
- **Real-time**: Action Cable (WebSocket) for live updates

### Integration Stack
- **Session Data**: Existing Nerdy API for session information
- **Tutor Data**: Existing Nerdy API for tutor profiles
- **Rescheduling Data**: Existing Nerdy API for booking data
- **Authentication**: Existing Nerdy authentication system

### Development Tools
- **Testing**: RSpec (backend), Jest + React Testing Library (frontend), pytest (Python ML)
- **Linting**: ESLint, RuboCop, pylint
- **Type Checking**: TypeScript for React, Sorbet for Ruby (optional)
- **Documentation**: JSDoc, YARD

---

## Architecture Overview

### System Components

```
tutor-quality-scoring/
├── backend/
│   ├── app/
│   │   ├── models/
│   │   │   ├── tutor.rb
│   │   │   ├── session.rb
│   │   │   ├── tutor_score.rb
│   │   │   ├── coaching_opportunity.rb
│   │   │   ├── churn_prediction.rb
│   │   │   └── intervention.rb
│   │   ├── controllers/
│   │   │   ├── api/
│   │   │   │   ├── tutor_scores_controller.rb
│   │   │   │   ├── coaching_controller.rb
│   │   │   │   └── predictions_controller.rb
│   │   ├── services/
│   │   │   ├── scoring/
│   │   │   │   ├── session_scorer_service.rb
│   │   │   │   ├── quality_analyzer_service.rb
│   │   │   │   └── first_session_analyzer.rb
│   │   │   ├── prediction/
│   │   │   │   ├── churn_predictor_service.rb
│   │   │   │   └── no_show_predictor_service.rb
│   │   │   └── retention/
│   │   │       ├── reschedule_analyzer_service.rb
│   │   │       └── intervention_service.rb
│   │   └── jobs/
│   │       ├── session_scoring_job.rb
│   │       ├── churn_prediction_job.rb
│   │       └── intervention_generation_job.rb
│   ├── db/
│   │   ├── migrate/
│   │   └── schema.rb
│   └── spec/
├── ml-service/
│   ├── models/
│   │   ├── churn_predictor.py
│   │   └── no_show_predictor.py
│   ├── services/
│   │   ├── model_training.py
│   │   └── prediction_service.py
│   └── tests/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── TutorScores/
│   │   │   ├── CoachingOpportunities/
│   │   │   ├── ChurnPredictions/
│   │   │   ├── Interventions/
│   │   │   └── AnalyticsDashboard/
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   └── websocket.ts
│   │   └── hooks/
│   │       ├── useTutorScores.ts
│   │       └── usePredictions.ts
│   └── __tests__/
└── docs/
    ├── ai-prompting-strategies.md
    └── ml-model-documentation.md
```

### Data Flow

1. **Session Scoring Flow**: Session ends → Job queued → AI analyzes session → Score calculated → Stored in database
2. **Churn Prediction Flow**: Daily job runs → Feature extraction → ML model prediction → Risk score assigned → Intervention triggered
3. **Coaching Flow**: Poor session detected → Coaching opportunity identified → Recommendations generated → Delivered to manager
4. **Intervention Flow**: High-risk tutor identified → Intervention service generates recommendations → Alerts sent → Actions tracked

---

## Phase Breakdown

### Phase 1: MVP (Due Tuesday, November 4, 2025)

**Objective**: Core scoring system working end-to-end

#### Phase 1.1: Project Setup & Foundation (120 minutes)

**Task 1.1.1**: Initialize Rails API backend
- Duration: 30 minutes
- Create new Rails API app or integrate with existing Nerdy platform
- Configure PostgreSQL database
- Setup basic API structure with versioning (api/v1/)
- Install dependencies: `gem 'openai', gem 'sidekiq', gem 'pgvector'`
- PowerShell: `rails new tutor_quality_scoring --api --database=postgresql`

**Task 1.1.2**: Setup Python ML service
- Duration: 30 minutes
- Create Python microservice directory structure
- Initialize virtual environment
- Install dependencies: `pip install scikit-learn pandas numpy openai`
- Create FastAPI or Flask API for ML service
- Setup HTTP communication with Rails backend

**Task 1.1.3**: Setup React frontend integration
- Duration: 30 minutes
- Create React components directory structure
- Setup React Query for API communication
- Configure WebSocket connection (Action Cable)
- Install dependencies: `npm install @tanstack/react-query axios recharts`
- Create base API service client

**Task 1.1.4**: Setup database schema foundation
- Duration: 30 minutes
- Create migrations for core tables: tutors, sessions, tutor_scores
- Add indexes for performance (tutor_id, session_id, created_at)
- Run migrations and verify setup
- Create seed data for testing

#### Phase 1.2: Session Scoring System (180 minutes)

**Task 1.2.1**: Create scoring models and schema
- Duration: 30 minutes
- Create `TutorScore` model with associations
- Design scoring schema (quality_score, engagement_score, technical_score, etc.)
- Create database migrations
- Add validations and constraints

**Task 1.2.2**: Implement basic session analyzer
- Duration: 60 minutes
- Create `SessionAnalyzerService` class
- Integrate with existing Nerdy session API
- Extract session data (duration, transcript, ratings, student feedback)
- Parse session metadata
- Store raw session data

**Task 1.2.3**: Implement AI-powered scoring service
- Duration: 60 minutes
- Create `SessionScorerService` class
- Use OpenAI to analyze session transcripts
- Generate quality scores based on:
  - Teaching effectiveness
  - Student engagement
  - Communication clarity
  - Technical accuracy
- Store scores in database

**Task 1.2.4**: Create scoring job processor
- Duration: 30 minutes
- Create `SessionScoringJob` Sidekiq job
- Process sessions in background
- Handle job failures and retries
- Queue processing for 3,000 sessions/day
- Ensure <1 hour latency

#### Phase 1.3: Basic Dashboard (150 minutes)

**Task 1.3.1**: Create scoring API endpoints
- Duration: 45 minutes
- Create API controller for tutor scores
- Implement get tutor scores endpoint
- Implement get session score endpoint
- Add filtering and pagination
- Return JSON with scores and metadata

**Task 1.3.2**: Build tutor scores UI component
- Duration: 45 minutes
- Create `TutorScores` React component
- Display tutor score cards with metrics
- Show score history over time
- Add score breakdown visualization
- Style with existing Nerdy design system

**Task 1.3.3**: Create basic analytics dashboard
- Duration: 60 minutes
- Build `AnalyticsDashboard` component
- Display aggregate tutor scores
- Show score distribution charts
- Add basic filtering (date range, tutor)
- Display top/bottom performing tutors

#### Phase 1.4: First Session Quality Detection (90 minutes)

**Task 1.4.1**: Implement first session analyzer
- Duration: 45 minutes
- Create `FirstSessionAnalyzerService`
- Detect first sessions for students
- Analyze quality indicators:
  - Engagement level
  - Communication clarity
  - Student satisfaction signals
  - Technical issues
- Flag poor first sessions

**Task 1.4.2**: Create first session alerts
- Duration: 30 minutes
- Create alert system for poor first sessions
- Generate alert notifications
- Store alerts in database
- Integrate with notification system

**Task 1.4.3**: Build first session UI
- Duration: 15 minutes
- Add first session alerts to dashboard
- Display poor first session indicators
- Show alert history

#### Phase 1.5: Integration Testing & MVP Demo (90 minutes)

**Task 1.5.1**: Write integration tests for scoring flow
- Duration: 30 minutes
- Test session scoring job
- Test score calculation
- Test API endpoints
- Verify <1 hour latency

**Task 1.5.2**: Write integration tests for dashboard
- Duration: 30 minutes
- Test API endpoints
- Test UI components
- Test real-time updates
- Verify data accuracy

**Task 1.5.3**: Create MVP demo script and cue card
- Duration: 30 minutes
- Write 3-minute demo video script showcasing:
  - Session scoring system
  - Tutor scores dashboard
  - First session quality detection
  - Basic analytics
- Create cue card with narration and bullet points
- Highlight core MVP features

---

### Phase 2: Early Submission (Due Friday, November 7, 2025)

**Objective**: Add churn prediction, interventions, and retention features

#### Phase 2.1: Churn Prediction System (180 minutes)

**Task 2.1.1**: Create churn prediction data model
- Duration: 30 minutes
- Design feature extraction schema
- Create `ChurnPrediction` model
- Store prediction results and confidence scores
- Add database migrations

**Task 2.1.2**: Implement feature extraction service
- Duration: 60 minutes
- Create `FeatureExtractionService` (Python)
- Extract features from tutor data:
  - Session frequency trends
  - Score trends (declining performance)
  - Rescheduling patterns
  - Student feedback trends
  - Engagement metrics
- Store features in database

**Task 2.1.3**: Build churn prediction ML model
- Duration: 60 minutes
- Create `ChurnPredictor` Python model
- Train model on historical tutor data (if available)
- Use scikit-learn (Random Forest or XGBoost)
- Implement prediction API endpoint
- Return risk score (0-1) and confidence

**Task 2.1.4**: Integrate churn prediction into Rails
- Duration: 30 minutes
- Create `ChurnPredictorService` in Rails
- Call Python ML service API
- Store predictions in database
- Schedule daily prediction job

#### Phase 2.2: Intervention System (150 minutes)

**Task 2.2.1**: Create intervention model
- Duration: 30 minutes
- Create `Intervention` model
- Store intervention recommendations
- Add intervention types (coaching, support, resource)
- Create database migrations

**Task 2.2.2**: Implement intervention generation service
- Duration: 60 minutes
- Create `InterventionService` class
- Use OpenAI to generate personalized recommendations
- Generate interventions based on:
  - Low scores
  - Churn risk
  - Specific coaching needs
  - Performance trends
- Store recommendations

**Task 2.2.3**: Create intervention delivery system
- Duration: 30 minutes
- Integrate with notification system
- Send interventions to managers
- Track intervention delivery
- Store intervention history

**Task 2.2.4**: Build intervention UI
- Duration: 30 minutes
- Create `Interventions` component
- Display recommended interventions
- Show intervention history
- Add action tracking (completed, dismissed)

#### Phase 2.3: Rescheduling Analysis (120 minutes)

**Task 2.3.1**: Implement reschedule analyzer
- Duration: 45 minutes
- Create `RescheduleAnalyzerService`
- Integrate with existing booking API
- Analyze rescheduling patterns:
  - Tutor-initiated vs student-initiated
  - Frequency of reschedules
  - Patterns (time of day, day of week)
- Flag high rescheduling tutors

**Task 2.3.2**: Create rescheduling alerts
- Duration: 30 minutes
- Generate alerts for tutors with high rescheduling rates
- Detect patterns indicating churn risk
- Store alerts in database
- Integrate with notification system

**Task 2.3.3**: Build rescheduling UI
- Duration: 45 minutes
- Create `ReschedulingAnalysis` component
- Display rescheduling statistics
- Show tutor rescheduling patterns
- Highlight high-risk tutors
- Add filtering and sorting

#### Phase 2.4: No-Show Prediction (120 minutes)

**Task 2.4.1**: Implement no-show predictor
- Duration: 45 minutes
- Create `NoShowPredictorService` (Python)
- Build ML model for no-show prediction
- Extract features:
  - Historical no-show rate
  - Recent cancelation patterns
  - Scheduling patterns
  - Engagement metrics
- Return risk score

**Task 2.4.2**: Integrate no-show prediction
- Duration: 30 minutes
- Integrate Python model into Rails
- Schedule prediction job
- Store predictions in database
- Generate alerts for high-risk tutors

**Task 2.4.3**: Create no-show UI
- Duration: 45 minutes
- Build `NoShowPredictions` component
- Display no-show risk scores
- Show historical no-show data
- Highlight at-risk tutors
- Add intervention recommendations

#### Phase 2.5: Unit Testing & Integration Testing (90 minutes)

**Task 2.5.1**: Write unit tests for churn prediction
- Duration: 30 minutes
- Test feature extraction
- Test ML model prediction
- Test prediction service integration
- Verify prediction accuracy

**Task 2.5.2**: Write unit tests for intervention system
- Duration: 30 minutes
- Test intervention generation
- Test intervention delivery
- Test intervention tracking

**Task 2.5.3**: Write integration tests for retention features
- Duration: 30 minutes
- Test rescheduling analysis
- Test no-show prediction
- Test end-to-end retention flow

#### Phase 2.6: Early Submission Demo Script & Cue Card (60 minutes)

**Task 2.6.1**: Create early submission demo script
- Duration: 30 minutes
- Write 3-minute demo video script showcasing:
  - Churn prediction system
  - Intervention recommendations
  - Rescheduling analysis
  - No-show prediction
  - Retention features working together
- Create cue card with narration and bullet points
- Highlight retention enhancement features

**Task 2.6.2**: Prepare demo environment
- Duration: 30 minutes
- Set up test data for demo
- Prepare sample scenarios
- Verify all features work for recording

---

### Phase 3: Final Submission (Due Sunday, November 9, 2025)

**Objective**: Full analytics, coaching insights, and production readiness

#### Phase 3.1: Coaching Opportunity System (180 minutes)

**Task 3.1.1**: Create coaching opportunity model
- Duration: 30 minutes
- Create `CoachingOpportunity` model
- Store coaching recommendations
- Add opportunity types (communication, technical, engagement)
- Create database migrations

**Task 3.1.2**: Implement coaching analyzer
- Duration: 60 minutes
- Create `CoachingAnalyzerService`
- Use AI to identify specific coaching needs:
  - Communication improvements
  - Technical accuracy issues
  - Engagement techniques
  - Time management
- Generate actionable coaching points

**Task 3.1.3**: Build coaching insights API
- Duration: 45 minutes
- Create coaching controller
- Implement endpoints for:
  - Get tutor coaching opportunities
  - Get coaching recommendations
  - Track coaching progress
- Return structured coaching data

**Task 3.1.4**: Create coaching UI
- Duration: 45 minutes
- Build `CoachingOpportunities` component
- Display coaching recommendations
- Show coaching progress tracking
- Add coaching history
- Visualize coaching impact

#### Phase 3.2: Advanced Analytics Dashboard (150 minutes)

**Task 3.2.1**: Create analytics data models
- Duration: 30 minutes
- Design analytics schema
- Create metrics tables (cohort analysis, trend analysis)
- Add indexes for query performance

**Task 3.2.2**: Implement advanced analytics service
- Duration: 60 minutes
- Create `AnalyticsService` class
- Calculate metrics:
  - Tutor performance trends
  - Cohort comparisons
  - Score distributions
  - Retention metrics
- Aggregate data efficiently

**Task 3.2.3**: Build advanced analytics API
- Duration: 30 minutes
- Create analytics controller
- Implement endpoints for:
  - Cohort analytics
  - Trend analysis
  - Performance distributions
  - Retention metrics
- Add caching for performance

**Task 3.2.4**: Create advanced analytics UI
- Duration: 30 minutes
- Build `AdvancedAnalytics` component
- Display cohort comparisons
- Show trend charts
- Add interactive filters
- Visualize performance distributions

#### Phase 3.3: Production Hardening (120 minutes)

**Task 3.3.1**: Optimize for 3,000 sessions/day
- Duration: 45 minutes
- Implement job queue prioritization
- Add batch processing for scoring
- Optimize database queries
- Implement caching strategies
- Verify <1 hour latency for all sessions

**Task 3.3.2**: Add error handling and monitoring
- Duration: 30 minutes
- Implement comprehensive error handling
- Add logging for all AI API calls
- Setup error monitoring (Sentry)
- Add health check endpoints

**Task 3.3.3**: Implement rate limiting and caching
- Duration: 30 minutes
- Add rate limiting for API endpoints
- Implement Redis caching for predictions
- Cache ML model predictions
- Optimize API response times

**Task 3.3.4**: Performance optimization
- Duration: 15 minutes
- Optimize database queries
- Add missing indexes
- Implement pagination
- Add performance monitoring

#### Phase 3.4: Documentation & Deployment (120 minutes)

**Task 3.4.1**: Write AI prompting strategies documentation
- Duration: 30 minutes
- Document all AI prompts used
- Explain prompting strategies for scoring
- Document coaching recommendation prompts
- Include examples

**Task 3.4.2**: Create ML model documentation
- Duration: 30 minutes
- Document churn prediction model
- Document no-show prediction model
- Explain feature engineering
- Document model training process

**Task 3.4.3**: Create integration guide
- Duration: 30 minutes
- Document Rails/React integration
- Document Python ML service integration
- Explain API endpoints
- Include troubleshooting guide

**Task 3.4.4**: Deploy to cloud (AWS or Vercel)
- Duration: 30 minutes
- Deploy backend to AWS (or Heroku/Railway)
- Deploy Python ML service
- Deploy frontend to Vercel
- Configure environment variables
- Verify deployment works

#### Phase 3.5: Comprehensive Testing (90 minutes)

**Task 3.5.1**: Write end-to-end tests
- Duration: 30 minutes
- Test complete scoring flow
- Test churn prediction flow
- Test intervention delivery
- Test analytics dashboard

**Task 3.5.2**: Write unit tests for all services
- Duration: 30 minutes
- Test all scoring services
- Test prediction services
- Test retention services
- Achieve >80% code coverage

**Task 3.5.3**: Performance testing
- Duration: 30 minutes
- Test 3,000 sessions/day processing
- Test API response times
- Test concurrent user handling
- Verify <1 hour latency

#### Phase 3.6: Cost Analysis & Final Demo (90 minutes)

**Task 3.6.1**: Create cost analysis document
- Duration: 30 minutes
- Analyze OpenAI API costs
- Estimate ML service hosting costs
- Document cost optimization strategies
- Create cost projection for production

**Task 3.6.2**: Create final demo video script and cue card
- Duration: 30 minutes
- Write 3-minute demo video script showcasing:
  - Complete scoring system
  - Churn prediction in action
  - Coaching opportunities
  - Advanced analytics dashboard
  - Retention features
- Create cue card with narration and bullet points
- Highlight production-ready features

**Task 3.6.3**: Final system walkthrough
- Duration: 30 minutes
- Verify all features work end-to-end
- Test with sample 3,000 sessions
- Verify <1 hour processing time
- Prepare demo environment

---

## Success Metrics

### Technical Metrics
- ✅ Process 3,000 sessions/day
- ✅ <1 hour latency from session completion to insights
- ✅ System uptime > 99%
- ✅ API response time < 500ms (95th percentile)
- ✅ ML model prediction accuracy > 85%

### Business Metrics
- ✅ Identify 24% of churners through first session detection
- ✅ Flag 98.2% of tutor-initiated reschedules
- ✅ Predict 16% of no-shows with >80% accuracy
- ✅ Generate actionable interventions for >90% of at-risk tutors

### Quality Metrics
- ✅ Scoring accuracy > 90% (validated against human reviewers)
- ✅ Churn prediction precision > 80%
- ✅ Coaching recommendation relevance > 85%
- ✅ Intervention acceptance rate > 60%

---

## Risk Assessment & Mitigation

### Risk 1: Processing 3,000 Sessions/Day
- **Probability**: Medium
- **Impact**: High
- **Mitigation**: Implement job queue prioritization, batch processing, horizontal scaling

### Risk 2: ML Model Accuracy
- **Probability**: Medium
- **Impact**: High
- **Mitigation**: Iterative model training, feature engineering, validation against historical data

### Risk 3: OpenAI API Rate Limits
- **Probability**: Medium
- **Impact**: Medium
- **Mitigation**: Implement rate limiting, caching, queue management, batch API calls

### Risk 4: Integration with Existing Platform
- **Probability**: Low
- **Impact**: Medium
- **Mitigation**: Create API wrapper, implement retry logic, handle API failures gracefully

---

## Dependencies

### External Dependencies
- OpenAI API access and credits
- Existing Nerdy Rails/React platform access
- Session data API access
- Tutor and booking data API access
- PostgreSQL database access

### Internal Dependencies
- Design system components
- Authentication system
- Notification system
- WebSocket infrastructure
- Python ML service hosting

---

## Appendix: AI Prompting Strategies

### Session Scoring Prompt Template
```
Analyze this tutoring session transcript and provide scores (1-10) for:
1. Teaching Effectiveness
2. Student Engagement
3. Communication Clarity
4. Technical Accuracy

Transcript: [SESSION_TRANSCRIPT]
Student Feedback: [FEEDBACK]
Session Duration: [DURATION]

Provide scores and brief justification for each category.
```

### Coaching Recommendation Prompt Template
```
Based on this tutor's performance data, identify 3 specific coaching opportunities:
- Recent scores: [SCORES]
- Common issues: [ISSUES]
- Student feedback: [FEEDBACK]

Provide actionable coaching recommendations with specific examples.
```

### Intervention Generation Prompt Template
```
This tutor has a churn risk score of [RISK_SCORE]. Generate personalized intervention recommendations:
- Performance trends: [TRENDS]
- Specific issues: [ISSUES]
- Engagement level: [ENGAGEMENT]

Provide 3-5 specific intervention actions with expected outcomes.
```

---

*Document Version: 1.0*  
*Created: November 3, 2025*  
*Last Updated: November 3, 2025*  
*Status: Ready for Execution*

