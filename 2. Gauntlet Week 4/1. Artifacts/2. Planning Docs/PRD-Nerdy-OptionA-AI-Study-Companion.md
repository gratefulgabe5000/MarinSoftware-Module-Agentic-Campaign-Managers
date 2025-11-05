# Product Requirements Document: AI Study Companion

**Version:** 1.0  
**Date:** November 3, 2025  
**Project Duration:** 7 Days (Nov 3 - Nov 9, 2025)  
**Project Start:** November 3, 2025  
**Framework:** Based on October 16, 2025 success path methodology  
**Target:** Persistent AI companion for between-tutoring-session support

---

## Executive Summary

AI Study Companion is a persistent AI-powered learning assistant that lives between tutoring sessions, remembers previous lessons, assigns adaptive practice, answers questions conversationally, and drives students back to human tutors when needed. The system integrates with existing Nerdy session recordings and generates measurable learning improvements while addressing critical retention challenges.

**Key Deliverables:**
- ✅ Persistent AI companion with session memory
- ✅ Adaptive practice assignment system
- ✅ Conversational Q&A interface
- ✅ Multi-goal progress tracking
- ✅ Retention enhancement features (goal completion suggestions, session nudges)
- ✅ Integration with existing Rails/React platform
- ✅ Session recording analysis and extraction
- ✅ Measurable learning improvements tracking

**Success Targets:**
- **MVP (Nov 4)**: Core AI companion with memory, basic practice assignments, Q&A interface
- **Early Submission (Nov 7)**: + Retention features (goal suggestions, nudges), multi-goal tracking
- **Final Submission (Nov 9)**: + Session recording integration, analytics dashboard, comprehensive testing

**Business Impact:**
- Addresses 52% "goal achieved" churn through subject suggestions
- Reduces early churn by nudging students with <3 sessions by Day 7
- Improves engagement through persistent companion between sessions
- Generates measurable learning improvements

---

## Project Timeline

| Milestone | Date | Deliverable |
|-----------|------|-------------|
| **Phase 1: MVP** | Tuesday, November 4, 2025 | Core AI companion with memory, basic practice assignments, conversational Q&A |
| **Early Submission** | Friday, November 7, 2025 | + Retention features (goal suggestions, session nudges), multi-goal progress tracking |
| **Final Submission** | Sunday, November 9, 2025 | + Session recording integration, analytics dashboard, comprehensive testing, demo video |

---

## Technology Stack

### AI/ML Stack
- **LLM Provider**: OpenAI GPT-4 (or Claude 3.5 Sonnet) for conversational AI
- **Embeddings**: OpenAI text-embedding-3-small for semantic search
- **Vector Database**: PostgreSQL with pgvector extension (or Pinecone for production)
- **Session Memory**: LangChain ConversationBufferMemory + VectorStoreRetrieverMemory

### Backend Stack
- **Framework**: Ruby on Rails 7+ (integrates with existing platform)
- **API**: RESTful API + GraphQL for complex queries
- **Background Jobs**: Sidekiq for async processing (session analysis, practice generation)
- **Database**: PostgreSQL (existing Nerdy infrastructure)
- **Caching**: Redis for session state and practice caching

### Frontend Stack
- **Framework**: React 18+ (integrates with existing platform)
- **State Management**: React Query for server state, Zustand for client state
- **UI Components**: Existing Nerdy design system components
- **Real-time**: Action Cable (WebSocket) for live updates
- **Charts**: Recharts or Chart.js for progress visualization

### Integration Stack
- **Session Recordings**: Existing Nerdy API for session data
- **Authentication**: Existing Nerdy authentication system
- **File Processing**: ActiveStorage for session recording files
- **Audio Transcription**: OpenAI Whisper API (or existing transcription service)

### Development Tools
- **Testing**: RSpec (backend), Jest + React Testing Library (frontend)
- **Linting**: ESLint, RuboCop
- **Type Checking**: TypeScript for React, Sorbet for Ruby (optional)
- **Documentation**: JSDoc, YARD

---

## Architecture Overview

### System Components

```
ai-study-companion/
├── backend/
│   ├── app/
│   │   ├── models/
│   │   │   ├── student.rb
│   │   │   ├── study_session.rb
│   │   │   ├── ai_conversation.rb
│   │   │   ├── practice_assignment.rb
│   │   │   ├── learning_goal.rb
│   │   │   └── session_recording.rb
│   │   ├── controllers/
│   │   │   ├── api/
│   │   │   │   ├── ai_companion_controller.rb
│   │   │   │   ├── practice_assignments_controller.rb
│   │   │   │   └── progress_controller.rb
│   │   ├── services/
│   │   │   ├── ai/
│   │   │   │   ├── conversation_service.rb
│   │   │   │   ├── memory_service.rb
│   │   │   │   ├── practice_generator_service.rb
│   │   │   │   └── session_analyzer_service.rb
│   │   │   ├── retention/
│   │   │   │   ├── goal_suggestion_service.rb
│   │   │   │   └── nudge_service.rb
│   │   └── jobs/
│   │       ├── session_analysis_job.rb
│   │       └── practice_generation_job.rb
│   ├── db/
│   │   ├── migrate/
│   │   └── schema.rb
│   └── spec/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CompanionChat/
│   │   │   ├── PracticeAssignments/
│   │   │   ├── ProgressTracking/
│   │   │   └── RetentionFeatures/
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   └── websocket.ts
│   │   └── hooks/
│   │       ├── useCompanion.ts
│   │       └── usePractice.ts
│   └── __tests__/
└── docs/
    ├── ai-prompting-strategies.md
    └── integration-guide.md
```

### Data Flow

1. **Session Recording Flow**: Session ends → Recording uploaded → Transcription → Analysis → Memory storage
2. **Conversation Flow**: Student asks question → AI retrieves context from memory → Generates response → Stores conversation
3. **Practice Generation Flow**: Session analyzed → Learning gaps identified → Practice generated → Assigned to student
4. **Retention Flow**: Goal completed → Suggestion service triggered → Related subjects suggested → Nudge scheduled if needed

---

## Phase Breakdown

### Phase 1: MVP (Due Tuesday, November 4, 2025)

**Objective**: Core AI companion functionality working end-to-end

#### Phase 1.1: Project Setup & Foundation (120 minutes)

**Task 1.1.1**: Initialize Rails API backend
- Duration: 30 minutes
- Create new Rails API app or integrate with existing Nerdy platform
- Configure PostgreSQL database
- Setup basic API structure with versioning (api/v1/)
- Install dependencies: `gem 'openai', gem 'sidekiq', gem 'pgvector'`
- PowerShell: `rails new ai_study_companion --api --database=postgresql`

**Task 1.1.2**: Setup React frontend integration
- Duration: 30 minutes
- Create React components directory structure
- Setup React Query for API communication
- Configure WebSocket connection (Action Cable)
- Install dependencies: `npm install @tanstack/react-query axios`
- Create base API service client

**Task 1.1.3**: Configure AI service integration
- Duration: 30 minutes
- Setup OpenAI API client with environment variables
- Create initial AI service wrapper
- Configure API key management
- Add retry logic and error handling
- Create `.env.example` with required keys

**Task 1.1.4**: Setup database schema foundation
- Duration: 30 minutes
- Create migrations for core tables: students, ai_conversations, practice_assignments
- Add indexes for performance
- Run migrations and verify setup
- Create seed data for testing

#### Phase 1.2: AI Conversation Service (180 minutes)

**Task 1.2.1**: Create conversation model and controller
- Duration: 45 minutes
- Create `AiConversation` model with associations to Student
- Create API controller for conversation endpoints
- Implement create conversation endpoint
- Implement send message endpoint
- Add basic validation and error handling

**Task 1.2.2**: Implement OpenAI conversation service
- Duration: 60 minutes
- Create `ConversationService` class
- Integrate OpenAI ChatCompletion API
- Implement system prompt for educational assistant persona
- Add conversation history management
- Handle API errors and retries

**Task 1.2.3**: Implement basic memory system
- Duration: 45 minutes
- Create `MemoryService` for storing conversation context
- Implement conversation buffer (last 10 messages)
- Store conversations in database
- Add retrieval of recent conversation history
- Test memory persistence

**Task 1.2.4**: Create React conversation UI
- Duration: 30 minutes
- Build `CompanionChat` component with message list
- Implement message input and send functionality
- Add loading states and error handling
- Style with existing Nerdy design system
- Connect to WebSocket for real-time updates

#### Phase 1.3: Practice Assignment System (150 minutes)

**Task 1.3.1**: Create practice assignment models
- Duration: 30 minutes
- Create `PracticeAssignment` model
- Create `PracticeQuestion` model
- Add associations and validations
- Create database migrations

**Task 1.3.2**: Implement basic practice generator
- Duration: 60 minutes
- Create `PracticeGeneratorService`
- Use OpenAI to generate practice questions based on subject
- Implement adaptive difficulty levels (beginner, intermediate, advanced)
- Store generated practices in database
- Add validation for question quality

**Task 1.3.3**: Create practice assignment API
- Duration: 30 minutes
- Create API controller for practice assignments
- Implement assign practice endpoint
- Implement get student practices endpoint
- Add completion tracking

**Task 1.3.4**: Build practice assignment UI
- Duration: 30 minutes
- Create `PracticeAssignments` component
- Display assigned practices to students
- Implement practice completion interface
- Show practice history

#### Phase 1.4: Basic Progress Tracking (90 minutes)

**Task 1.4.1**: Create learning goal model
- Duration: 30 minutes
- Create `LearningGoal` model
- Add associations to Student and Subject
- Create goal status tracking (active, completed, paused)
- Add database migrations

**Task 1.4.2**: Implement progress tracking API
- Duration: 30 minutes
- Create progress controller
- Implement get student progress endpoint
- Calculate progress metrics (completion rate, time spent)
- Return progress data in JSON format

**Task 1.4.3**: Build basic progress UI
- Duration: 30 minutes
- Create `ProgressTracking` component
- Display single goal progress
- Show completion percentage
- Add basic progress visualization

#### Phase 1.5: Integration Testing & MVP Demo (90 minutes)

**Task 1.5.1**: Write integration tests for conversation flow
- Duration: 30 minutes
- Test conversation creation
- Test message sending and AI response
- Test memory retrieval
- Verify WebSocket updates

**Task 1.5.2**: Write integration tests for practice system
- Duration: 30 minutes
- Test practice generation
- Test practice assignment
- Test practice completion
- Verify progress updates

**Task 1.5.3**: Create MVP demo script and cue card
- Duration: 30 minutes
- Write 3-minute demo video script showcasing:
  - AI conversation interface
  - Practice assignment functionality
  - Basic progress tracking
- Create cue card with narration and bullet points
- Highlight core MVP features

---

### Phase 2: Early Submission (Due Friday, November 7, 2025)

**Objective**: Add retention enhancement features and multi-goal tracking

#### Phase 2.1: Goal Suggestion System (150 minutes)

**Task 2.1.1**: Implement goal completion detection
- Duration: 30 minutes
- Create service to detect when goals are completed
- Add event listener for goal status changes
- Trigger suggestion service on completion

**Task 2.1.2**: Build subject suggestion service
- Duration: 60 minutes
- Create `GoalSuggestionService`
- Implement logic for subject suggestions:
  - SAT complete → college essays, study skills, AP prep
  - Chemistry → physics, STEM subjects
  - General subject → related subjects
- Use OpenAI to generate contextual suggestions
- Store suggestions in database

**Task 2.1.3**: Create suggestion UI
- Duration: 30 minutes
- Build `SubjectSuggestions` component
- Display suggestions when goal completes
- Allow students to accept suggestions as new goals
- Add "Not interested" option

**Task 2.1.4**: Add suggestion analytics
- Duration: 30 minutes
- Track suggestion acceptance rate
- Monitor which suggestions convert to new goals
- Store analytics for future improvement

#### Phase 2.2: Session Nudge System (120 minutes)

**Task 2.2.1**: Implement nudge detection logic
- Duration: 30 minutes
- Create `NudgeService` to check student conditions
- Detect students with <3 sessions by Day 7
- Schedule nudge checks (daily job)

**Task 2.2.2**: Create nudge generation
- Duration: 30 minutes
- Generate personalized nudge messages using AI
- Include booking link and session benefits
- Store nudge history

**Task 2.2.3**: Build nudge delivery system
- Duration: 30 minutes
- Integrate with existing Nerdy notification system
- Send nudges via email or in-app notification
- Track nudge delivery and response

**Task 2.2.4**: Create nudge UI component
- Duration: 30 minutes
- Display nudge notifications in UI
- Show "Book Session" CTA
- Track nudge interactions

#### Phase 2.3: Multi-Goal Progress Tracking (150 minutes)

**Task 2.3.1**: Extend progress model for multiple goals
- Duration: 30 minutes
- Update database schema to support multiple goals per student
- Add goal prioritization and ordering
- Update associations

**Task 2.3.2**: Implement multi-goal progress API
- Duration: 45 minutes
- Create endpoint to get all student goals with progress
- Calculate progress across all goals
- Return aggregated metrics
- Support filtering by goal status

**Task 2.3.3**: Build multi-goal progress UI
- Duration: 45 minutes
- Update `ProgressTracking` component
- Display multiple goals in dashboard view
- Show progress for each goal
- Add goal switching/tabs
- Visualize overall progress

**Task 2.3.4**: Add progress comparison
- Duration: 30 minutes
- Compare progress across goals
- Show fastest progressing goal
- Highlight goals needing attention

#### Phase 2.4: Unit Testing & Integration Testing (90 minutes)

**Task 2.4.1**: Write unit tests for goal suggestion service
- Duration: 30 minutes
- Test suggestion logic for different subjects
- Test suggestion generation
- Test suggestion acceptance flow

**Task 2.4.2**: Write unit tests for nudge service
- Duration: 30 minutes
- Test nudge detection logic
- Test nudge generation
- Test nudge delivery

**Task 2.4.3**: Write integration tests for multi-goal tracking
- Duration: 30 minutes
- Test multi-goal progress calculation
- Test progress API endpoints
- Test UI components with multiple goals

#### Phase 2.5: Early Submission Demo Script & Cue Card (60 minutes)

**Task 2.5.1**: Create early submission demo script
- Duration: 30 minutes
- Write 3-minute demo video script showcasing:
  - Goal completion and subject suggestions
  - Session nudge system
  - Multi-goal progress tracking
  - Retention features working together
- Create cue card with narration and bullet points
- Highlight retention enhancement features

**Task 2.5.2**: Prepare demo environment
- Duration: 30 minutes
- Set up test data for demo
- Prepare sample scenarios
- Verify all features work for recording

---

### Phase 3: Final Submission (Due Sunday, November 9, 2025)

**Objective**: Add session recording integration, analytics, and production readiness

#### Phase 3.1: Session Recording Integration (180 minutes)

**Task 3.1.1**: Setup session recording API integration
- Duration: 45 minutes
- Integrate with existing Nerdy session recording API
- Create service to fetch session recordings
- Handle authentication and authorization
- Add error handling for API failures

**Task 3.1.2**: Implement session transcription
- Duration: 45 minutes
- Integrate OpenAI Whisper API (or existing service)
- Create `SessionAnalyzerService` to process recordings
- Transcribe audio to text
- Store transcriptions in database

**Task 3.1.3**: Implement session analysis
- Duration: 60 minutes
- Use AI to analyze session transcripts
- Extract key learning points
- Identify topics covered
- Detect student strengths and weaknesses
- Store analysis results

**Task 3.1.4**: Integrate session analysis into memory
- Duration: 30 minutes
- Update `MemoryService` to include session insights
- Store session analysis in conversation context
- Enable AI to reference past sessions
- Test memory retrieval with session data

#### Phase 3.2: Analytics Dashboard (150 minutes)

**Task 3.2.1**: Create analytics data models
- Duration: 30 minutes
- Design analytics schema
- Create metrics tables (engagement, retention, learning improvements)
- Add indexes for query performance

**Task 3.2.2**: Implement analytics collection
- Duration: 45 minutes
- Create service to collect metrics:
  - Conversation frequency
  - Practice completion rates
  - Goal completion rates
  - Session engagement metrics
- Schedule daily analytics jobs

**Task 3.2.3**: Build analytics API
- Duration: 45 minutes
- Create analytics controller
- Implement endpoints for:
  - Student analytics
  - Cohort analytics
  - Retention metrics
  - Learning improvement tracking
- Add data aggregation logic

**Task 3.2.4**: Create analytics dashboard UI
- Duration: 30 minutes
- Build `AnalyticsDashboard` component
- Display key metrics with charts
- Show learning improvement trends
- Add date range filtering

#### Phase 3.3: Production Hardening (120 minutes)

**Task 3.3.1**: Add error handling and logging
- Duration: 30 minutes
- Implement comprehensive error handling
- Add logging for all AI API calls
- Log errors with context
- Setup error monitoring (Sentry or similar)

**Task 3.3.2**: Implement rate limiting
- Duration: 30 minutes
- Add rate limiting for API endpoints
- Protect OpenAI API calls from abuse
- Add queue management for background jobs

**Task 3.3.3**: Add caching layer
- Duration: 30 minutes
- Cache frequently accessed data (student progress, practice assignments)
- Implement Redis caching
- Add cache invalidation strategies
- Optimize database queries

**Task 3.3.4**: Performance optimization
- Duration: 30 minutes
- Optimize database queries (add missing indexes)
- Implement pagination for large datasets
- Optimize AI API calls (batch when possible)
- Add performance monitoring

#### Phase 3.4: Documentation & Deployment (120 minutes)

**Task 3.4.1**: Write AI prompting strategies documentation
- Duration: 30 minutes
- Document all AI prompts used
- Explain prompting strategies
- Document system prompts for different services
- Include examples of effective prompts

**Task 3.4.2**: Create integration guide
- Duration: 30 minutes
- Document Rails/React integration points
- Explain API endpoints
- Document WebSocket setup
- Include troubleshooting guide

**Task 3.4.3**: Deploy to cloud (AWS or Vercel)
- Duration: 30 minutes
- Deploy backend to AWS (or Heroku/Railway)
- Deploy frontend to Vercel
- Configure environment variables
- Verify deployment works

**Task 3.4.4**: Create cost analysis document
- Duration: 30 minutes
- Analyze OpenAI API costs
- Estimate monthly costs for production
- Document cost optimization strategies
- Create cost projection for 90-day roadmap

#### Phase 3.5: Comprehensive Testing (90 minutes)

**Task 3.5.1**: Write end-to-end tests
- Duration: 30 minutes
- Test complete user flows:
  - Student starts conversation
  - Gets practice assignment
  - Completes goal
  - Receives suggestion
- Test session recording integration flow

**Task 3.5.2**: Write unit tests for all services
- Duration: 30 minutes
- Test all AI services
- Test retention services
- Test analytics services
- Achieve >80% code coverage

**Task 3.5.3**: Performance testing
- Duration: 30 minutes
- Test API response times
- Test concurrent user handling
- Test AI API rate limits
- Verify system can handle expected load

#### Phase 3.6: 90-Day Roadmap & Final Demo (90 minutes)

**Task 3.6.1**: Create 90-day implementation roadmap
- Duration: 30 minutes
- Document phased rollout plan
- Identify dependencies and blockers
- Estimate resource requirements
- Define success metrics for each phase

**Task 3.6.2**: Create final demo video script and cue card
- Duration: 30 minutes
- Write 3-minute demo video script showcasing:
  - Complete AI companion functionality
  - Session recording integration
  - Analytics dashboard
  - Retention features in action
- Create cue card with narration and bullet points
- Highlight production-ready features

**Task 3.6.3**: Final system walkthrough
- Duration: 30 minutes
- Verify all features work end-to-end
- Test demo scenario
- Prepare demo environment
- Document any known issues

---

## Success Metrics

### Technical Metrics
- ✅ AI conversation response time < 3 seconds
- ✅ Practice generation time < 5 seconds
- ✅ System uptime > 99%
- ✅ API response time < 500ms (95th percentile)

### Business Metrics
- ✅ Address 52% "goal achieved" churn through suggestions
- ✅ Increase session booking rate for <3 session students by 20%
- ✅ Improve student engagement (daily active users)
- ✅ Generate measurable learning improvements (test scores, completion rates)

### AI Metrics
- ✅ Conversation quality score > 4.0/5.0 (student ratings)
- ✅ Practice relevance score > 85%
- ✅ Suggestion acceptance rate > 30%
- ✅ AI response accuracy > 90%

---

## Risk Assessment & Mitigation

### Risk 1: OpenAI API Rate Limits
- **Probability**: Medium
- **Impact**: High
- **Mitigation**: Implement rate limiting, caching, and queue management

### Risk 2: Session Recording API Integration Issues
- **Probability**: Medium
- **Impact**: Medium
- **Mitigation**: Create fallback mock service, implement retry logic

### Risk 3: AI Response Quality
- **Probability**: Low
- **Impact**: High
- **Mitigation**: Iterative prompt engineering, user feedback loop, A/B testing

### Risk 4: Database Performance
- **Probability**: Low
- **Impact**: Medium
- **Mitigation**: Proper indexing, caching, query optimization

---

## Dependencies

### External Dependencies
- OpenAI API access and credits
- Existing Nerdy Rails/React platform access
- Session recording API access
- PostgreSQL database access

### Internal Dependencies
- Design system components
- Authentication system
- Notification system
- WebSocket infrastructure

---

## Appendix: AI Prompting Strategies

### Conversation System Prompt Template
```
You are an educational AI companion helping students between tutoring sessions. 
Your role is to:
- Answer questions conversationally and clearly
- Reference past lessons and sessions when relevant
- Encourage learning and practice
- Guide students back to human tutors for complex topics

Remember: [CONTEXT FROM MEMORY]
Student's current goals: [GOALS]
Recent sessions: [SESSION_SUMMARY]
```

### Practice Generation Prompt Template
```
Generate [NUMBER] practice questions for [SUBJECT] at [DIFFICULTY] level.
Based on: [SESSION_ANALYSIS]
Topics covered: [TOPICS]
Student level: [LEVEL]

Format: Multiple choice questions with explanations.
```

### Goal Suggestion Prompt Template
```
Student just completed: [COMPLETED_GOAL]
Suggest 3 related learning goals that would:
- Build on their success
- Address common next steps
- Keep them engaged

Context: [STUDENT_HISTORY]
```

---

*Document Version: 1.0*  
*Created: November 3, 2025*  
*Last Updated: November 3, 2025*  
*Status: Ready for Execution*

