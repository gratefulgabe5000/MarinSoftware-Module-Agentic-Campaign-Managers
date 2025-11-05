# Product Requirements Document: Intelligent Operations Dashboard

**Version:** 1.0  
**Date:** November 3, 2025  
**Project Duration:** 7 Days (Nov 3 - Nov 9, 2025)  
**Project Start:** November 3, 2025  
**Framework:** Based on October 16, 2025 success path methodology  
**Target:** Real-time command center for marketplace health monitoring

---

## Executive Summary

Intelligent Operations Dashboard is a real-time command center that monitors marketplace health, predicts supply/demand imbalances, automatically adjusts tutor recruiting campaigns, and alerts operators to anomalies. The system handles 50+ data streams and provides explainable AI recommendations, addressing critical operational challenges and retention issues.

**Key Deliverables:**
- ✅ Real-time marketplace health monitoring
- ✅ Supply/demand prediction and balancing
- ✅ Automated tutor recruiting campaign adjustments
- ✅ Anomaly detection and alerts
- ✅ Customer health score dashboard
- ✅ First session success rate tracking by tutor/subject
- ✅ Session velocity trends by cohort
- ✅ IB call spike alerts (≥2 calls in 14 days = churn risk)
- ✅ Churn prediction by customer segment
- ✅ Instant tutor supply vs. demand predictions
- ✅ Early warning alerts for at-risk customers

**Success Targets:**
- **MVP (Nov 4)**: Core dashboard, basic health monitoring, simple supply/demand tracking
- **Early Submission (Nov 7)**: + AI predictions, automated campaign adjustments, retention features
- **Final Submission (Nov 9)**: + Full analytics, explainable AI, comprehensive testing, demo video

**Business Impact:**
- Prevents churn through early warning alerts
- Optimizes tutor supply through demand prediction
- Improves first session success rates through insights
- Reduces operational overhead through automation

---

## Project Timeline

| Milestone | Date | Deliverable |
|-----------|------|-------------|
| **Phase 1: MVP** | Tuesday, November 4, 2025 | Core dashboard, basic health monitoring, supply/demand tracking |
| **Early Submission** | Friday, November 7, 2025 | + AI predictions, automated campaigns, retention features |
| **Final Submission** | Sunday, November 9, 2025 | + Full analytics, explainable AI, comprehensive testing, demo video |

---

## Technology Stack

### AI/ML Stack
- **LLM Provider**: OpenAI GPT-4 for explainable recommendations
- **ML Framework**: scikit-learn (Python) for supply/demand prediction
- **Time Series**: Prophet or LSTM for demand forecasting
- **Anomaly Detection**: Isolation Forest or LSTM Autoencoder
- **Embeddings**: OpenAI text-embedding-3-small for semantic analysis

### Backend Stack
- **Framework**: Ruby on Rails 7+ (integrates with existing platform)
- **API**: RESTful API + GraphQL for complex queries
- **Background Jobs**: Sidekiq for async processing (data aggregation, predictions)
- **Database**: PostgreSQL (existing Nerdy infrastructure)
- **Caching**: Redis for real-time data and predictions
- **Time Series Database**: TimescaleDB (PostgreSQL extension) for time-series data
- **Python Integration**: Python microservice for ML models (via HTTP API)

### Frontend Stack
- **Framework**: React 18+ (integrates with existing platform)
- **State Management**: React Query for server state, Zustand for client state
- **UI Components**: Existing Nerdy design system components
- **Charts**: Recharts or Chart.js for analytics visualization
- **Real-time**: Action Cable (WebSocket) for live updates
- **Dashboard Framework**: Custom dashboard with real-time widgets

### Data Integration Stack
- **Data Streams**: 50+ data sources (sessions, bookings, tutors, students, etc.)
- **API Integration**: Existing Nerdy APIs for all data sources
- **Data Aggregation**: Background jobs for real-time aggregation
- **Event Streaming**: Action Cable for real-time updates

### Development Tools
- **Testing**: RSpec (backend), Jest + React Testing Library (frontend), pytest (Python ML)
- **Linting**: ESLint, RuboCop, pylint
- **Type Checking**: TypeScript for React, Sorbet for Ruby (optional)
- **Documentation**: JSDoc, YARD

---

## Architecture Overview

### System Components

```
intelligent-operations-dashboard/
├── backend/
│   ├── app/
│   │   ├── models/
│   │   │   ├── marketplace_health.rb
│   │   │   ├── supply_demand.rb
│   │   │   ├── customer_health.rb
│   │   │   ├── prediction.rb
│   │   │   ├── alert.rb
│   │   │   └── campaign_adjustment.rb
│   │   ├── controllers/
│   │   │   ├── api/
│   │   │   │   ├── dashboard_controller.rb
│   │   │   │   ├── health_controller.rb
│   │   │   │   ├── predictions_controller.rb
│   │   │   │   └── alerts_controller.rb
│   │   ├── services/
│   │   │   ├── data/
│   │   │   │   ├── stream_aggregator_service.rb
│   │   │   │   └── data_processor_service.rb
│   │   │   ├── prediction/
│   │   │   │   ├── supply_demand_predictor_service.rb
│   │   │   │   ├── churn_predictor_service.rb
│   │   │   │   └── anomaly_detector_service.rb
│   │   │   ├── automation/
│   │   │   │   ├── campaign_adjuster_service.rb
│   │   │   │   └── alert_service.rb
│   │   │   └── retention/
│   │   │       ├── customer_health_service.rb
│   │   │       └── early_warning_service.rb
│   │   └── jobs/
│   │       ├── data_aggregation_job.rb
│   │       ├── prediction_job.rb
│   │       ├── anomaly_detection_job.rb
│   │       └── campaign_adjustment_job.rb
│   ├── db/
│   │   ├── migrate/
│   │   └── schema.rb
│   └── spec/
├── ml-service/
│   ├── models/
│   │   ├── supply_demand_predictor.py
│   │   ├── churn_predictor.py
│   │   └── anomaly_detector.py
│   ├── services/
│   │   ├── model_training.py
│   │   └── prediction_service.py
│   └── tests/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard/
│   │   │   ├── HealthMetrics/
│   │   │   ├── SupplyDemand/
│   │   │   ├── CustomerHealth/
│   │   │   ├── Predictions/
│   │   │   ├── Alerts/
│   │   │   └── Campaigns/
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   └── websocket.ts
│   │   └── hooks/
│   │       ├── useDashboard.ts
│   │       └── usePredictions.ts
│   └── __tests__/
└── docs/
    ├── ai-prompting-strategies.md
    └── ml-model-documentation.md
```

### Data Flow

1. **Data Aggregation Flow**: 50+ data streams → Background jobs → Aggregate and process → Store in TimescaleDB → Update dashboard
2. **Prediction Flow**: Historical data → ML models → Predict supply/demand → Generate recommendations → Store predictions
3. **Alert Flow**: Anomaly detected → Alert service → Generate alert → Send notification → Display on dashboard
4. **Campaign Flow**: Supply/demand imbalance detected → Campaign adjuster → Generate recommendations → Execute campaign adjustments → Track results

---

## Phase Breakdown

### Phase 1: MVP (Due Tuesday, November 4, 2025)

**Objective**: Core dashboard with basic health monitoring working

#### Phase 1.1: Project Setup & Foundation (120 minutes)

**Task 1.1.1**: Initialize Rails API backend
- Duration: 30 minutes
- Create new Rails API app or integrate with existing Nerdy platform
- Configure PostgreSQL with TimescaleDB extension
- Setup basic API structure with versioning (api/v1/)
- Install dependencies: `gem 'sidekiq', gem 'redis', gem 'timescaledb'`
- PowerShell: `rails new intelligent_operations_dashboard --api --database=postgresql`

**Task 1.1.2**: Setup Python ML service
- Duration: 30 minutes
- Create Python microservice directory structure
- Initialize virtual environment
- Install dependencies: `pip install scikit-learn pandas numpy prophet`
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
- Create migrations for core tables: marketplace_health, supply_demand, customer_health
- Setup TimescaleDB hypertables for time-series data
- Add indexes for performance
- Run migrations and verify setup
- Create seed data for testing

#### Phase 1.2: Data Aggregation System (180 minutes)

**Task 1.2.1**: Create data stream models
- Duration: 30 minutes
- Create models for data streams (sessions, bookings, tutors, students)
- Design data aggregation schema
- Create database migrations
- Add validations and constraints

**Task 1.2.2**: Implement data stream aggregator
- Duration: 60 minutes
- Create `StreamAggregatorService` class
- Integrate with 50+ Nerdy data APIs
- Aggregate data from multiple sources:
  - Session data
  - Booking data
  - Tutor data
  - Student data
  - Performance metrics
- Store aggregated data in TimescaleDB

**Task 1.2.3**: Create data processing jobs
- Duration: 60 minutes
- Create `DataAggregationJob` Sidekiq job
- Process data streams in background
- Aggregate data by time periods (hourly, daily)
- Handle job failures and retries
- Ensure real-time processing

**Task 1.2.4**: Implement data processor service
- Duration: 30 minutes
- Create `DataProcessorService` class
- Process and normalize aggregated data
- Calculate basic metrics (counts, averages, trends)
- Store processed data for dashboard

#### Phase 1.3: Basic Dashboard (150 minutes)

**Task 1.3.1**: Create dashboard API endpoints
- Duration: 45 minutes
- Create API controller for dashboard
- Implement get health metrics endpoint
- Implement get supply/demand data endpoint
- Add filtering and time range selection
- Return JSON with metrics

**Task 1.3.2**: Build basic dashboard UI
- Duration: 60 minutes
- Create `Dashboard` React component
- Display key health metrics:
  - Active tutors
  - Active sessions
  - Bookings
  - Supply/demand ratio
- Add real-time updates via WebSocket
- Style with existing Nerdy design system

**Task 1.3.3**: Create basic charts
- Duration: 45 minutes
- Build chart components using Recharts
- Display supply/demand trends over time
- Show marketplace health indicators
- Add basic filtering (date range, metrics)

#### Phase 1.4: Basic Supply/Demand Tracking (90 minutes)

**Task 1.4.1**: Implement supply tracking
- Duration: 30 minutes
- Create service to track tutor supply
- Calculate available tutors by subject
- Track tutor availability trends
- Store supply data in database

**Task 1.4.2**: Implement demand tracking
- Duration: 30 minutes
- Create service to track student demand
- Calculate booking requests by subject
- Track demand trends over time
- Store demand data in database

**Task 1.4.3**: Calculate supply/demand ratio
- Duration: 30 minutes
- Create service to calculate supply/demand ratios
- Identify imbalances (high demand, low supply)
- Display ratios on dashboard
- Add basic alerts for imbalances

#### Phase 1.5: Integration Testing & MVP Demo (90 minutes)

**Task 1.5.1**: Write integration tests for data aggregation
- Duration: 30 minutes
- Test data stream aggregation
- Test data processing
- Test API endpoints
- Verify real-time updates

**Task 1.5.2**: Write integration tests for dashboard
- Duration: 30 minutes
- Test dashboard API endpoints
- Test UI components
- Test WebSocket updates
- Verify data accuracy

**Task 1.5.3**: Create MVP demo script and cue card
- Duration: 30 minutes
- Write 3-minute demo video script showcasing:
  - Data aggregation system
  - Basic dashboard
  - Supply/demand tracking
  - Real-time updates
- Create cue card with narration and bullet points
- Highlight core MVP features

---

### Phase 2: Early Submission (Due Friday, November 7, 2025)

**Objective**: Add AI predictions, automated campaigns, and retention features

#### Phase 2.1: Supply/Demand Prediction System (180 minutes)

**Task 2.1.1**: Create prediction data model
- Duration: 30 minutes
- Design prediction schema
- Create `Prediction` model
- Store predictions and confidence scores
- Add database migrations

**Task 2.1.2**: Implement supply/demand predictor
- Duration: 90 minutes
- Create `SupplyDemandPredictor` Python model
- Use Prophet or LSTM for time-series forecasting
- Train model on historical supply/demand data
- Predict supply/demand for next 7-30 days
- Implement prediction API endpoint

**Task 2.1.3**: Integrate prediction into Rails
- Duration: 30 minutes
- Create `SupplyDemandPredictorService` in Rails
- Call Python ML service API
- Store predictions in database
- Schedule daily prediction job

**Task 2.1.4**: Build prediction UI
- Duration: 30 minutes
- Create `SupplyDemandPredictions` component
- Display predicted supply/demand
- Show prediction confidence intervals
- Visualize predictions vs actuals

#### Phase 2.2: Automated Campaign Adjustment System (150 minutes)

**Task 2.2.1**: Create campaign adjustment model
- Duration: 30 minutes
- Create `CampaignAdjustment` model
- Store campaign recommendations
- Add adjustment types (recruiting, incentives, pricing)
- Create database migrations

**Task 2.2.2**: Implement campaign adjuster service
- Duration: 60 minutes
- Create `CampaignAdjusterService` class
- Use AI to generate campaign recommendations:
  - When to recruit more tutors (subject, location)
  - What incentives to offer
  - How to adjust pricing
- Generate explainable recommendations

**Task 2.2.3**: Create campaign execution system
- Duration: 30 minutes
- Integrate with existing recruiting campaign API
- Execute campaign adjustments automatically
- Track campaign execution
- Store campaign results

**Task 2.2.4**: Build campaign UI
- Duration: 30 minutes
- Create `Campaigns` component
- Display campaign recommendations
- Show campaign execution status
- Track campaign effectiveness

#### Phase 2.3: Customer Health Score Dashboard (150 minutes)

**Task 2.3.1**: Implement customer health service
- Duration: 60 minutes
- Create `CustomerHealthService` class
- Calculate health scores based on:
  - First session success rates by tutor/subject
  - Session velocity trends by cohort
  - IB call frequency (≥2 calls in 14 days = churn risk)
  - Engagement metrics
- Store health scores in database

**Task 2.3.2**: Create customer health API
- Duration: 30 minutes
- Create customer health controller
- Implement endpoints for:
  - Get customer health scores
  - Get health trends
  - Get cohort comparisons
- Return structured health data

**Task 2.3.3**: Build customer health UI
- Duration: 60 minutes
- Create `CustomerHealth` component
- Display customer health scores
- Show first session success rates by tutor/subject
- Display session velocity trends by cohort
- Visualize health trends over time

#### Phase 2.4: Early Warning & Alert System (120 minutes)

**Task 2.4.1**: Implement IB call spike detection
- Duration: 30 minutes
- Create service to detect IB call spikes
- Identify customers with ≥2 calls in 14 days
- Calculate churn risk based on call frequency
- Store alerts in database

**Task 2.4.2**: Implement churn prediction by segment
- Duration: 45 minutes
- Create `ChurnPredictorService` (Python)
- Build ML model for churn prediction
- Segment customers by attributes
- Predict churn risk by segment
- Return risk scores

**Task 2.4.3**: Create early warning alert service
- Duration: 30 minutes
- Create `EarlyWarningService` class
- Generate alerts for at-risk customers
- Integrate with notification system
- Send alerts to operators
- Track alert responses

**Task 2.4.4**: Build alerts UI
- Duration: 15 minutes
- Create `Alerts` component
- Display early warning alerts
- Show churn risk indicators
- Display IB call spike alerts
- Add alert management

#### Phase 2.5: Anomaly Detection (120 minutes)

**Task 2.5.1**: Implement anomaly detector
- Duration: 60 minutes
- Create `AnomalyDetector` Python model
- Use Isolation Forest or LSTM Autoencoder
- Detect anomalies in:
  - Session patterns
  - Booking patterns
  - Supply/demand patterns
  - Performance metrics
- Return anomaly scores

**Task 2.5.2**: Integrate anomaly detection
- Duration: 30 minutes
- Integrate Python model into Rails
- Schedule anomaly detection job
- Store anomalies in database
- Generate alerts for anomalies

**Task 2.5.3**: Build anomaly UI
- Duration: 30 minutes
- Create `Anomalies` component
- Display detected anomalies
- Show anomaly details and context
- Visualize anomaly patterns
- Add anomaly investigation tools

#### Phase 2.6: Unit Testing & Integration Testing (90 minutes)

**Task 2.6.1**: Write unit tests for prediction system
- Duration: 30 minutes
- Test supply/demand prediction
- Test prediction service integration
- Test prediction accuracy

**Task 2.6.2**: Write unit tests for campaign system
- Duration: 30 minutes
- Test campaign adjustment generation
- Test campaign execution
- Test campaign tracking

**Task 2.6.3**: Write integration tests for retention features
- Duration: 30 minutes
- Test customer health calculation
- Test early warning alerts
- Test anomaly detection
- Test end-to-end retention flow

#### Phase 2.7: Early Submission Demo Script & Cue Card (60 minutes)

**Task 2.7.1**: Create early submission demo script
- Duration: 30 minutes
- Write 3-minute demo video script showcasing:
  - Supply/demand predictions
  - Automated campaign adjustments
  - Customer health dashboard
  - Early warning alerts
  - Anomaly detection
  - Retention features working together
- Create cue card with narration and bullet points
- Highlight retention enhancement features

**Task 2.7.2**: Prepare demo environment
- Duration: 30 minutes
- Set up test data for demo
- Prepare sample scenarios
- Verify all features work for recording

---

### Phase 3: Final Submission (Due Sunday, November 9, 2025)

**Objective**: Full analytics, explainable AI, and production readiness

#### Phase 3.1: Explainable AI Recommendations (180 minutes)

**Task 3.1.1**: Implement explainable recommendation service
- Duration: 60 minutes
- Create `ExplainableRecommendationService` class
- Use OpenAI to generate explainable recommendations
- Explain why each recommendation is made
- Provide supporting data and context
- Store explanations in database

**Task 3.1.2**: Build explanation UI
- Duration: 60 minutes
- Create `ExplainableRecommendations` component
- Display recommendations with explanations
- Show supporting data and metrics
- Visualize recommendation reasoning
- Add interactive exploration

**Task 3.1.3**: Integrate explanations into all predictions
- Duration: 30 minutes
- Add explanations to supply/demand predictions
- Add explanations to campaign recommendations
- Add explanations to churn predictions
- Add explanations to anomaly alerts

**Task 3.1.4**: Create explanation documentation
- Duration: 30 minutes
- Document explanation format
- Explain explanation generation process
- Provide examples of good explanations
- Create explanation quality guidelines

#### Phase 3.2: Advanced Analytics Dashboard (150 minutes)

**Task 3.2.1**: Create advanced analytics service
- Duration: 45 minutes
- Create `AdvancedAnalyticsService` class
- Calculate advanced metrics:
  - Cohort analysis
  - Trend analysis
  - Correlation analysis
  - Predictive analytics
- Aggregate data efficiently

**Task 3.2.2**: Build advanced analytics API
- Duration: 45 minutes
- Create advanced analytics controller
- Implement endpoints for:
  - Cohort analytics
  - Trend analysis
  - Correlation metrics
  - Predictive insights
- Add caching for performance

**Task 3.2.3**: Create advanced analytics UI
- Duration: 60 minutes
- Build `AdvancedAnalytics` component
- Display cohort comparisons
- Show trend analysis charts
- Visualize correlations
- Add interactive filters and drill-downs

#### Phase 3.3: Real-time Data Processing Optimization (120 minutes)

**Task 3.3.1**: Optimize for 50+ data streams
- Duration: 45 minutes
- Implement efficient data aggregation
- Add batch processing for large datasets
- Optimize database queries
- Implement caching strategies
- Ensure real-time processing

**Task 3.3.2**: Implement real-time WebSocket updates
- Duration: 30 minutes
- Optimize Action Cable for real-time updates
- Implement efficient data broadcasting
- Add connection management
- Handle connection failures gracefully

**Task 3.3.3**: Add performance monitoring
- Duration: 30 minutes
- Monitor data processing latency
- Track API response times
- Monitor WebSocket performance
- Add performance dashboards
- Alert on performance issues

**Task 3.3.4**: Optimize ML model performance
- Duration: 15 minutes
- Optimize prediction model inference time
- Cache model predictions
- Batch prediction requests
- Monitor ML service performance

#### Phase 3.4: Production Hardening (120 minutes)

**Task 3.4.1**: Add error handling and logging
- Duration: 30 minutes
- Implement comprehensive error handling
- Add logging for all data streams
- Log all AI API calls
- Setup error monitoring (Sentry)

**Task 3.4.2**: Implement rate limiting and caching
- Duration: 30 minutes
- Add rate limiting for API endpoints
- Implement Redis caching for predictions
- Cache dashboard data
- Optimize cache invalidation

**Task 3.4.3**: Add security and access control
- Duration: 30 minutes
- Implement role-based access control
- Secure API endpoints
- Add authentication for ML service
- Audit log access

**Task 3.4.4**: Performance optimization
- Duration: 30 minutes
- Optimize database queries
- Add missing indexes
- Implement pagination
- Add query optimization monitoring

#### Phase 3.5: Documentation & Deployment (120 minutes)

**Task 3.5.1**: Write AI prompting strategies documentation
- Duration: 30 minutes
- Document all AI prompts used
- Explain prompting strategies for recommendations
- Document explainable AI prompts
- Include examples

**Task 3.5.2**: Create ML model documentation
- Duration: 30 minutes
- Document supply/demand prediction model
- Document churn prediction model
- Document anomaly detection model
- Explain feature engineering

**Task 3.5.3**: Create integration guide
- Duration: 30 minutes
- Document Rails/React integration
- Document Python ML service integration
- Document 50+ data stream integrations
- Include troubleshooting guide

**Task 3.5.4**: Deploy to cloud (AWS or Vercel)
- Duration: 30 minutes
- Deploy backend to AWS (or Heroku/Railway)
- Deploy Python ML service
- Deploy frontend to Vercel
- Configure environment variables
- Verify deployment works

#### Phase 3.6: Comprehensive Testing (90 minutes)

**Task 3.6.1**: Write end-to-end tests
- Duration: 30 minutes
- Test complete data aggregation flow
- Test prediction generation flow
- Test alert generation flow
- Test campaign adjustment flow

**Task 3.6.2**: Write unit tests for all services
- Duration: 30 minutes
- Test all data aggregation services
- Test prediction services
- Test automation services
- Achieve >80% code coverage

**Task 3.6.3**: Performance testing
- Duration: 30 minutes
- Test 50+ data stream processing
- Test real-time update performance
- Test API response times
- Verify system handles expected load

#### Phase 3.7: Cost Analysis & Final Demo (90 minutes)

**Task 3.7.1**: Create cost analysis document
- Duration: 30 minutes
- Analyze OpenAI API costs
- Estimate ML service hosting costs
- Estimate TimescaleDB costs
- Document cost optimization strategies
- Create cost projection for production

**Task 3.7.2**: Create final demo video script and cue card
- Duration: 30 minutes
- Write 3-minute demo video script showcasing:
  - Complete dashboard with 50+ data streams
  - Supply/demand predictions
  - Automated campaign adjustments
  - Customer health dashboard
  - Explainable AI recommendations
  - Early warning alerts
  - Anomaly detection
- Create cue card with narration and bullet points
- Highlight production-ready features

**Task 3.7.3**: Final system walkthrough
- Duration: 30 minutes
- Verify all features work end-to-end
- Test with 50+ data streams
- Verify real-time updates
- Verify explainable AI working
- Prepare demo environment

---

## Success Metrics

### Technical Metrics
- ✅ Process 50+ data streams in real-time
- ✅ Dashboard update latency < 5 seconds
- ✅ System uptime > 99%
- ✅ API response time < 500ms (95th percentile)
- ✅ ML model prediction accuracy > 85%

### Business Metrics
- ✅ Identify at-risk customers through early warning alerts
- ✅ Optimize tutor supply through demand prediction
- ✅ Improve first session success rates through insights
- ✅ Reduce operational overhead through automation
- ✅ Generate explainable recommendations for 100% of predictions

### Operational Metrics
- ✅ Supply/demand prediction accuracy > 90%
- ✅ Churn prediction precision > 80%
- ✅ Campaign adjustment effectiveness > 70%
- ✅ Anomaly detection recall > 85%

---

## Risk Assessment & Mitigation

### Risk 1: Processing 50+ Data Streams
- **Probability**: Medium
- **Impact**: High
- **Mitigation**: Implement efficient aggregation, batch processing, caching, horizontal scaling

### Risk 2: Real-time Update Performance
- **Probability**: Medium
- **Impact**: Medium
- **Mitigation**: Optimize WebSocket connections, implement efficient broadcasting, add connection pooling

### Risk 3: ML Model Accuracy
- **Probability**: Medium
- **Impact**: High
- **Mitigation**: Iterative model training, feature engineering, validation against historical data

### Risk 4: Explainable AI Quality
- **Probability**: Medium
- **Impact**: Medium
- **Mitigation**: Iterative prompt engineering, user feedback loop, A/B testing explanations

---

## Dependencies

### External Dependencies
- OpenAI API access and credits
- Existing Nerdy Rails/React platform access
- 50+ data stream APIs access
- PostgreSQL with TimescaleDB access
- Python ML service hosting

### Internal Dependencies
- Design system components
- Authentication system
- Notification system
- WebSocket infrastructure
- Campaign management API

---

## Appendix: AI Prompting Strategies

### Explainable Recommendation Prompt Template
```
Based on this marketplace data, provide a recommendation with explanation:
- Current state: [CURRENT_STATE]
- Prediction: [PREDICTION]
- Historical context: [HISTORY]

Provide:
1. Recommendation (specific action)
2. Explanation (why this recommendation)
3. Supporting data (metrics, trends)
4. Expected outcome (what will happen)
5. Confidence level (how certain)

Format: Clear, actionable, explainable.
```

### Campaign Adjustment Prompt Template
```
Supply/demand imbalance detected:
- Subject: [SUBJECT]
- Supply: [SUPPLY]
- Demand: [DEMAND]
- Gap: [GAP]

Generate campaign adjustment recommendation:
- When to recruit (specific timing)
- Where to recruit (location/subject)
- What incentives to offer
- Expected results

Provide explainable reasoning for each recommendation.
```

### Churn Prediction Explanation Prompt Template
```
Customer churn risk score: [RISK_SCORE]
Customer segment: [SEGMENT]
Key indicators:
- First session: [FIRST_SESSION]
- IB calls: [IB_CALLS]
- Session velocity: [VELOCITY]

Explain:
1. Why this customer is at risk
2. Key contributing factors
3. Recommended interventions
4. Expected outcomes

Format: Clear, actionable, explainable.
```

---

*Document Version: 1.0*  
*Created: November 3, 2025*  
*Last Updated: November 3, 2025*  
*Status: Ready for Execution*

