# Product Requirements Document: Varsity Tutors 10x K Factor

**Version:** 1.1  
**Date:** November 3, 2025  
**Project Duration:** 7 Days (Nov 3 - Nov 9, 2025)  
**Project Start:** November 3, 2025  
**Framework:** Based on October 16, 2025 success path methodology  
**Target:** Viral, Gamified, Supercharged Growth System

---

## Executive Summary

Varsity Tutors 10x K Factor is a production-ready growth system that makes learning feel fun, social, and "alive," turning every touchpoint into a shareable, referable moment across students, parents, and tutors. The system implements ≥4 closed-loop viral mechanics, presence signals, activity feeds, and agentic actions powered by session transcription to achieve K ≥ 1.20.

**Key Deliverables:**
- ✅ ≥4 closed-loop viral mechanics (Buddy Challenge, Results Rally, Proud Parent, Tutor Spotlight, etc.)
- ✅ "Alive" Layer (presence signals, activity feed, mini-leaderboards, cohort rooms)
- ✅ Async Results as Viral Surfaces (share cards, deep links, cohort challenges)
- ✅ Required Agents (Loop Orchestrator, Personalization, Incentives, Social Presence, Tutor Advocacy, Trust & Safety, Experimentation)
- ✅ ≥4 Agentic Actions (≥2 student, ≥2 tutor) from session transcription
- ✅ Signed smart links + attribution service
- ✅ Event schema & dashboards (K, invites, conversion, FVM, retention)
- ✅ Results-page share packs (cards, reels, deep links)
- ✅ Compliance memo (COPPA/FERPA safe)

**Success Targets:**
- **MVP (Nov 4)**: Core viral loops + basic agents + presence layer working
- **Early Submission (Nov 7)**: + Agentic actions + smart links + results-page sharing
- **Final Submission (Nov 9)**: + Analytics + compliance + comprehensive testing

---

## Project Timeline

| Milestone | Date | Deliverable |
|-----------|------|-------------|
| **Phase 1: MVP** | Tuesday, November 4, 2025 | ≥4 viral loops, basic agents, presence layer, operator demo |
| **Early Submission** | Friday, November 7, 2025 | + Agentic actions, smart links, results-page sharing, analytics |
| **Final Submission** | Sunday, November 9, 2025 | + Compliance memo, comprehensive testing, documentation |

---

## Technology Stack

### Frontend Stack
- **Framework**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **UI Library**: shadcn/ui or Material-UI
- **Real-time**: Socket.io-client or WebSockets
- **State Management**: Zustand or Redux
- **Build Tool**: Vite or Next.js

### Backend Stack
- **Framework**: Node.js + Express.js or Next.js API
- **Language**: TypeScript
- **Real-time**: Socket.io for presence and activity feed
- **Database**: PostgreSQL or MongoDB (for production) / SQLite (for prototype)
- **Queue**: Bull (Redis) for job processing
- **Storage**: AWS S3 or local for assets (share cards, reels)

### AI/Agent Stack
- **LLM**: OpenAI GPT-4 or Anthropic Claude
- **SDK**: OpenAI SDK or Anthropic SDK
- **Agent Framework**: Model Context Protocol (MCP) servers or custom agent framework
- **Transcription**: OpenAI Whisper API or Web Speech API
- **Summarization**: LLM-based summarization of transcripts

### Analytics Stack
- **Event Tracking**: Custom event bus or PostHog/Mixpanel
- **Database**: PostgreSQL for event storage
- **Dashboards**: Custom React dashboard or Grafana
- **Streaming**: Redis Streams or Kafka for event processing

### Development Tools
- **Package Manager**: npm or yarn
- **Linting**: ESLint + Prettier
- **Testing**: Vitest or Jest
- **Documentation**: JSDoc + README

---

## Architecture Overview

### System Components

```
varsity-tutors-growth/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ViralLoops/          # Viral loop UI components
│   │   │   ├── Presence/             # Presence indicators
│   │   │   ├── ActivityFeed/         # Activity feed
│   │   │   ├── Leaderboards/        # Mini-leaderboards
│   │   │   ├── ResultsPages/        # Results page sharing
│   │   │   └── ShareCards/          # Share card components
│   │   ├── hooks/
│   │   │   ├── usePresence.ts
│   │   │   ├── useActivityFeed.ts
│   │   │   └── useViralLoops.ts
│   │   └── App.tsx
├── backend/
│   ├── agents/
│   │   ├── loopOrchestrator.ts      # Required: Loop Orchestrator
│   │   ├── personalization.ts        # Required: Personalization
│   │   ├── incentives.ts              # Incentives & Economy
│   │   ├── socialPresence.ts         # Social Presence
│   │   ├── tutorAdvocacy.ts          # Tutor Advocacy
│   │   ├── trustSafety.ts            # Trust & Safety
│   │   └── experimentation.ts       # Required: Experimentation
│   ├── services/
│   │   ├── transcription.ts         # Session transcription
│   │   ├── summarization.ts          # Transcript summarization
│   │   ├── agenticActions.ts         # Agentic action triggers
│   │   ├── smartLinks.ts             # Signed smart links
│   │   ├── attribution.ts             # Attribution tracking
│   │   └── analytics.ts              # Event tracking
│   ├── api/
│   │   ├── viral-loops.ts           # Viral loop endpoints
│   │   ├── presence.ts               # Presence endpoints
│   │   ├── analytics.ts              # Analytics endpoints
│   │   └── share-cards.ts            # Share card generation
│   └── server.ts
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── docs/
    ├── technical-writeup.md
    ├── compliance-memo.md
    └── decision-log.md
```

### Data Flow

1. **Session Trigger**: User completes session → Transcription → Summarization → Agentic action triggers
2. **Loop Orchestration**: Agentic action → Loop Orchestrator → Chooses loop → Personalization → Incentives
3. **Viral Loop**: Share invitation → Smart link → Attribution → Join → FVM tracking
4. **Presence**: User activity → Presence service → Broadcast to cohort → Activity feed
5. **Analytics**: All events → Event bus → Stream processing → Warehouse → Dashboard

---

## Viral Loop Selection

**Selected Loops (≥4):**
1. **Buddy Challenge** (Student → Student) - After practice, share "Beat-my-score" micro-deck
2. **Results Rally** (Async → Social) - Results page generates rank vs. peers + challenge link
3. **Proud Parent** (Parent → Parent) - Weekly recap + shareable progress reel + invite
4. **Tutor Spotlight** (Tutor → Family/Peers) - After 5★ session, generate tutor card + invite link

**Rationale**: Covers all personas (student, parent, tutor), includes async results integration, has clear first-value moments, measurable K-factor potential.

---

## Phase Breakdown

### Phase 1: MVP (Due Tuesday, November 4, 2025)

**Objective**: Core viral loops and basic agents working

#### Phase 1.1: Project Setup & Foundation (120 minutes)

**Task 1.1.1**: Initialize React + TypeScript project
- Duration: 30 minutes
- Create `varsity-tutors-growth/` directory
- Initialize React app: `npm create vite@latest frontend -- --template react-ts`
- Install: React, TypeScript, Tailwind CSS, Socket.io-client
- PowerShell: `New-Item -ItemType Directory -Path varsity-tutors-growth; Set-Location varsity-tutors-growth`

**Task 1.1.2**: Setup backend with Express
- Duration: 30 minutes
- Create `backend/` directory
- Initialize Node.js: `npm init -y`
- Install: Express, TypeScript, Socket.io, OpenAI SDK, PostgreSQL/SQLite
- Create `server.ts` with Express + Socket.io
- Add TypeScript config

**Task 1.1.3**: Setup database schema
- Duration: 30 minutes
- Create database schema:
  - `users(id, persona, subject_preferences)`
  - `sessions(id, user_id, transcript, summary)`
  - `viral_loops(id, type, user_id, invite_id, status)`
  - `invites(id, loop_id, invitee_email, smart_link, status)`
  - `events(id, user_id, event_type, data, timestamp)`
  - `presence(id, user_id, status, last_seen)`
- Initialize database

**Task 1.1.4**: Configure environment variables
- Duration: 15 minutes
- Create `.env` files
- Add: `OPENAI_API_KEY`, `DATABASE_URL`, `JWT_SECRET`, `S3_BUCKET` (optional)
- Add `.env.example`
- Create `.gitignore`

**Task 1.1.5**: Setup testing framework
- Duration: 15 minutes
- Install Vitest: `npm install -D vitest`
- Create `tests/` directory structure
- Create sample test
- Add test script to `package.json`

#### Phase 1.2: Required Agents - Loop Orchestrator (150 minutes)

**Task 1.2.1**: Create Loop Orchestrator Agent
- Duration: 60 minutes
- Create `backend/agents/loopOrchestrator.ts`
- Function: `chooseLoop(context: Context) => LoopType`
- Logic:
  - Input: Session summary, user persona, current state
  - Check: Loop eligibility (user has friends, has results, etc.)
  - Check: Throttling (not too many invites sent)
  - Choose: Best loop based on context
  - Return: LoopType + rationale
- Implement MCP server pattern or custom agent pattern

**Task 1.2.2**: Implement loop eligibility checking
- Duration: 45 minutes
- Function: `checkEligibility(loop: LoopType, user: User) => boolean`
- Checks:
  - Buddy Challenge: User has completed practice, has friends
  - Results Rally: User has results page, has subject peers
  - Proud Parent: User is parent, has weekly progress
  - Tutor Spotlight: User is tutor, has 5★ session
- Return: Eligible (true/false) with reason

**Task 1.2.3**: Implement throttling logic
- Duration: 45 minutes
- Function: `checkThrottle(user: User, loop: LoopType) => boolean`
- Logic:
  - Track: Invites sent per day per user
  - Limit: Max invites/day (configurable, default: 5)
  - Cooldown: Between same loop type (1 hour)
- Return: Throttled (true/false)

#### Phase 1.3: Required Agents - Personalization Agent (120 minutes)

**Task 1.3.1**: Create Personalization Agent
- Duration: 60 minutes
- Create `backend/agents/personalization.ts`
- Function: `personalizeInvite(loop: LoopType, user: User, context: Context) => InviteContent`
- Personalize:
  - Copy: By persona (student/parent/tutor)
  - Subject: Match user's subject preferences
  - Intent: Based on current activity (practice, results, session)
- Return: Personalized invite content (title, message, CTA)

**Task 1.3.2**: Implement persona-based personalization
- Duration: 30 minutes
- Function: `personalizeByPersona(persona: string, loop: LoopType) => Copy`
- Templates:
  - Student: "Challenge your friend to beat your score!"
  - Parent: "Share your child's progress with another parent"
  - Tutor: "Share your tutoring success with other families"
- Return: Persona-specific copy

**Task 1.3.3**: Implement subject-based personalization
- Duration: 30 minutes
- Function: `personalizeBySubject(subject: string, loop: LoopType) => Copy`
- Match: Subject to loop (Algebra practice → Algebra challenge)
- Include: Subject-specific context in invite
- Return: Subject-specific copy

#### Phase 1.4: Viral Loop 1 - Buddy Challenge (150 minutes)

**Task 1.4.1**: Implement Buddy Challenge backend logic
- Duration: 60 minutes
- Create `backend/services/viralLoops/buddyChallenge.ts`
- Function: `createBuddyChallenge(userId: string, practiceId: string) => Challenge`
- Logic:
  - Generate: 5-question micro-deck from skill gaps
  - Create: Challenge record in database
  - Generate: Share link (smart link)
  - Return: Challenge object with share link

**Task 1.4.2**: Create Buddy Challenge UI component
- Duration: 45 minutes
- Create `frontend/src/components/ViralLoops/BuddyChallenge.tsx`
- Display: Challenge card with "Share Challenge" button
- Show: Skill deck preview
- Include: "Both get streak shields if friend reaches FVM" message
- Integrate: Share functionality

**Task 1.4.3**: Implement challenge acceptance flow
- Duration: 45 minutes
- Function: `acceptChallenge(challengeId: string, inviteeId: string) => Result`
- Logic:
  - Verify: Challenge exists and not expired
  - Create: Challenge attempt for invitee
  - Track: Challenge completion
  - Award: Streak shields to both users when invitee reaches FVM
- Return: Challenge started confirmation

#### Phase 1.5: Viral Loop 2 - Results Rally (120 minutes)

**Task 1.5.1**: Implement Results Rally backend logic
- Duration: 60 minutes
- Create `backend/services/viralLoops/resultsRally.ts`
- Function: `createResultsRally(userId: string, resultsId: string) => Rally`
- Logic:
  - Calculate: Rank vs. peers (from results data)
  - Generate: Challenge link (beat-my-rank)
  - Create: Rally record in database
  - Generate: Share link
- Return: Rally object with rank and share link

**Task 1.5.2**: Create Results Rally UI component
- Duration: 30 minutes
- Create `frontend/src/components/ViralLoops/ResultsRally.tsx`
- Display: Rank vs. peers, "Challenge a friend" CTA
- Show: Leaderboard preview
- Integrate: Share functionality

**Task 1.5.3**: Integrate with results pages
- Duration: 30 minutes
- Modify: Results page component to include Results Rally
- Trigger: After results page load
- Display: Rally component if eligible
- Test: Integration works

#### Phase 1.6: Viral Loop 3 - Proud Parent (120 minutes)

**Task 1.6.1**: Implement Proud Parent backend logic
- Duration: 60 minutes
- Create `backend/services/viralLoops/proudParent.ts`
- Function: `createProudParentInvite(parentId: string, childId: string) => Invite`
- Logic:
  - Generate: Weekly recap card (progress summary)
  - Generate: Shareable progress reel (20-30s summary)
  - Create: Invite record
  - Generate: Referral link for class pass
- Return: Invite object with reel and link

**Task 1.6.2**: Create Proud Parent UI component
- Duration: 30 minutes
- Create `frontend/src/components/ViralLoops/ProudParent.tsx`
- Display: Weekly recap card, progress reel preview
- Show: "Invite a parent" CTA
- Include: Class pass offer
- Integrate: Share functionality

**Task 1.6.3**: Generate progress reel
- Duration: 30 minutes
- Function: `generateProgressReel(childId: string) => Reel`
- Logic:
  - Collect: Key moments and wins from week
  - Compile: 20-30s video/slideshow
  - Make: Privacy-safe (no PII, only achievements)
  - Store: Reel asset
- Return: Reel URL

#### Phase 1.7: Viral Loop 4 - Tutor Spotlight (120 minutes)

**Task 1.7.1**: Implement Tutor Spotlight backend logic
- Duration: 60 minutes
- Create `backend/services/viralLoops/tutorSpotlight.ts`
- Function: `createTutorSpotlight(tutorId: string, sessionId: string) => Spotlight`
- Logic:
  - Verify: 5★ session rating
  - Generate: Tutor card with achievements
  - Create: Invite link for tutor to share
  - Track: Referral XP for tutor
- Return: Spotlight object with card and link

**Task 1.7.2**: Create Tutor Spotlight UI component
- Duration: 30 minutes
- Create `frontend/src/components/ViralLoops/TutorSpotlight.tsx`
- Display: Tutor card with achievements
- Show: "Share your success" CTA
- Include: Referral XP benefits
- Integrate: Share functionality (WhatsApp/SMS)

**Task 1.7.3**: Implement referral XP tracking
- Duration: 30 minutes
- Function: `trackReferralXP(tutorId: string, joinId: string) => XP`
- Logic:
  - Verify: Join came from tutor's referral
  - Calculate: XP amount (based on conversion)
  - Award: XP to tutor
  - Update: Tutor leaderboard
- Return: XP awarded

#### Phase 1.8: "Alive" Layer - Presence Signals (90 minutes)

**Task 1.8.1**: Implement presence service
- Duration: 45 minutes
- Create `backend/services/presence.ts`
- Function: `updatePresence(userId: string, status: string) => void`
- Logic:
  - Track: User status (online, offline, practicing)
  - Broadcast: Presence updates via Socket.io
  - Store: Last seen timestamp
  - Cleanup: Offline users after timeout
- Socket.io: Emit presence updates to cohort

**Task 1.8.2**: Create presence UI component
- Duration: 30 minutes
- Create `frontend/src/components/Presence/PresenceIndicator.tsx`
- Display: "28 peers practicing Algebra now" message
- Show: Friends online indicator
- Update: Real-time via Socket.io
- Style: Active/inactive states

**Task 1.8.3**: Implement cohort presence broadcasting
- Duration: 15 minutes
- Function: `broadcastCohortPresence(subject: string) => Presence[]`
- Logic:
  - Query: Users practicing same subject
  - Count: Active users
  - Broadcast: Count and active users to cohort
- Return: Presence array

#### Phase 1.9: "Alive" Layer - Activity Feed (90 minutes)

**Task 1.9.1**: Implement activity feed service
- Duration: 45 minutes
- Create `backend/services/activityFeed.ts`
- Function: `addActivity(activity: Activity) => void`
- Activities:
  - "Friend completed Algebra practice"
  - "Friend earned a badge"
  - "Friend reached a streak milestone"
- Store: Activities in database
- Broadcast: Via Socket.io

**Task 1.9.2**: Create activity feed UI component
- Duration: 30 minutes
- Create `frontend/src/components/ActivityFeed/ActivityFeed.tsx`
- Display: List of recent activities
- Update: Real-time via Socket.io
- Filter: By friend or all
- Style: Timeline or list view

**Task 1.9.3**: Integrate activity feed into main UI
- Duration: 15 minutes
- Add: Activity feed sidebar or component
- Connect: To Socket.io for real-time updates
- Test: Activity feed displays correctly

#### Phase 1.10: "Alive" Layer - Mini-Leaderboards (90 minutes)

**Task 1.10.1**: Implement leaderboard service
- Duration: 45 minutes
- Create `backend/services/leaderboards.ts`
- Function: `getLeaderboard(subject: string, metric: string) => Leaderboard`
- Metrics:
  - Practice score
  - Streak days
  - XP earned
- Logic:
  - Query: Top N users by metric
  - Include: User ranking
  - Return: Leaderboard data
- Handle: Age bands, fairness (new vs. veterans)

**Task 1.10.2**: Create leaderboard UI component
- Duration: 30 minutes
- Create `frontend/src/components/Leaderboards/MiniLeaderboard.tsx`
- Display: Top 10 users with rankings
- Show: Current user's position
- Update: Periodically (every 30 seconds)
- Style: Clean, gamified design

**Task 1.10.3**: Integrate leaderboards into results pages
- Duration: 15 minutes
- Add: Mini-leaderboard to results pages
- Show: User's rank vs. peers
- Include: "Challenge a friend" CTA
- Test: Leaderboard displays correctly

#### Phase 1.11: Basic Testing & Validation (120 minutes)

**Task 1.11.1**: Test viral loops end-to-end
- Duration: 60 minutes
- Test: Buddy Challenge (create → share → accept → complete)
- Test: Results Rally (generate → share → join)
- Test: Proud Parent (generate → share → invite)
- Test: Tutor Spotlight (generate → share → referral)
- Verify: All loops work correctly

**Task 1.11.2**: Test presence and activity feed
- Duration: 30 minutes
- Test: Presence updates broadcast correctly
- Test: Activity feed displays activities
- Test: Leaderboards update correctly
- Verify: Real-time updates work

**Task 1.11.3**: Integrated Unit Testing for Phase 1
- Duration: 30 minutes
- Write unit tests for:
  - Loop Orchestrator logic
  - Personalization logic
  - Viral loop creation
  - Presence updates
- Run: `npm test` to verify
- Document: Any failing tests

#### Phase 1.12: MVP Demo Video Preparation (45 minutes)

**Task 1.12.1**: Create 3-minute demo video script
- Duration: 20 minutes
- Script should cover:
  - Introduction (10s): "Varsity Tutors 10x K Factor MVP - viral growth system"
  - System Overview (20s): Architecture, viral loops, agents
  - Viral Loop Demo (80s): Show Buddy Challenge, Results Rally, Proud Parent, Tutor Spotlight
  - Presence Layer (30s): Show presence signals, activity feed, leaderboards
  - Conclusion (10s): "MVP demonstrates ≥4 viral loops and 'alive' layer"

**Task 1.12.2**: Create cue card with narration and highlights
- Duration: 15 minutes
- Include narration for each section
- Bullet points for key UI elements/features
- Visual cues for viral loop triggers
- Timing markers for 3-minute target

---

### Phase 2: Early Submission (Due Friday, November 7, 2025)

**Objective**: Add agentic actions, smart links, results-page sharing, analytics

#### Phase 2.1: Session Transcription & Summarization (180 minutes)

**Task 2.1.1**: Implement transcription service
- Duration: 60 minutes
- Create `backend/services/transcription.ts`
- Function: `transcribeSession(audioFile: File) => Transcript`
- Option A: OpenAI Whisper API
  - Upload audio file
  - Call Whisper API
  - Get transcript
- Option B: Web Speech API (browser-based, less accurate)
- Store: Transcript in database
- Return: Transcript text

**Task 2.1.2**: Implement summarization service
- Duration: 60 minutes
- Create `backend/services/summarization.ts`
- Function: `summarizeTranscript(transcript: string) => Summary`
- Use: LLM (GPT-4 or Claude) to summarize
- Prompt: "Summarize this tutoring session. Identify: skill gaps, upcoming exams, stuck concepts, wins."
- Extract: Key information (skill gaps, exam dates, concepts)
- Store: Summary in database
- Return: Summary object

**Task 2.1.3**: Trigger agentic actions from summaries
- Duration: 60 minutes
- Create `backend/services/agenticActions.ts`
- Function: `triggerAgenticActions(sessionId: string, summary: Summary) => Actions[]`
- Logic:
  - Parse: Summary for triggers
  - For Students (≥2 actions):
    - "Beat-My-Skill" Challenge: If skill gaps detected → Generate 5-question deck
    - Study Buddy Nudge: If exam coming → Create co-practice invite
  - For Tutors (≥2 actions):
    - Parent Progress Reel: After session → Generate reel + invite
    - Next-Session Prep Pack: After session → Generate prep pack + share link
- Return: Array of triggered actions

#### Phase 2.2: Smart Links & Attribution (120 minutes)

**Task 2.2.1**: Implement signed smart links
- Duration: 60 minutes
- Create `backend/services/smartLinks.ts`
- Function: `generateSmartLink(inviteId: string, utm: object) => SmartLink`
- Logic:
  - Generate: Short code (unique identifier)
  - Sign: Link with JWT or HMAC
  - Include: UTM parameters (source, medium, campaign)
  - Include: Invite context (loop type, user id)
  - Store: Link in database
  - Return: Shortened link (e.g., `vtutor.io/invite/abc123`)

**Task 2.2.2**: Implement attribution tracking
- Duration: 60 minutes
- Create `backend/services/attribution.ts`
- Function: `trackAttribution(smartLink: string, userId: string) => Attribution`
- Logic:
  - Parse: Smart link to get invite context
  - Track: Last-touch attribution (join)
  - Store: Multi-touch attribution (view → sign-up → FVM)
  - Record: Referrer, loop type, campaign
  - Update: Viral loop status
- Return: Attribution object

**Task 2.2.3**: Handle smart link clicks
- Duration: 30 minutes
- Create API endpoint: `GET /invite/:code`
- Function: `handleInvite(code: string) => Redirect`
- Logic:
  - Validate: Link signature
  - Retrieve: Invite context
  - Track: Click event
  - Redirect: To deep link (pre-filled context)
- Return: Redirect to appropriate page

#### Phase 2.3: Results-Page Sharing (150 minutes)

**Task 2.3.1**: Create share card generator
- Duration: 60 minutes
- Create `backend/services/shareCards.ts`
- Function: `generateShareCard(resultsId: string, persona: string) => ShareCard`
- Logic:
  - Query: Results data (score, skills, recommendations)
  - Generate: Privacy-safe share card (no PII, only achievements)
  - Variants: Student, Parent, Tutor variants
  - Include: Deep link to results page
  - Render: As image or HTML
- Return: Share card URL

**Task 2.3.2**: Integrate sharing into results pages
- Duration: 45 minutes
- Modify: Results page components
- Add: "Share Results" button
- Generate: Share card on demand
- Include: "Challenge a friend" CTA
- Include: Deep link to skill check
- Test: Sharing works correctly

**Task 2.3.3**: Create deep link handler
- Duration: 45 minutes
- Function: `handleDeepLink(link: string) => Page`
- Logic:
  - Parse: Deep link to get context
  - Pre-fill: Skill deck, challenge, or practice set
  - Redirect: To appropriate page with context
  - Track: Deep link click
- Return: Pre-filled page

#### Phase 2.4: Analytics & Event Tracking (150 minutes)

**Task 2.4.1**: Implement event schema
- Duration: 45 minutes
- Create `backend/services/analytics.ts`
- Define event types:
  - `invite_sent` (invite_id, loop_type, user_id)
  - `invite_opened` (invite_id, user_id)
  - `account_created` (user_id, referrer_id)
  - `fvm_reached` (user_id, fvm_type)
  - `retention` (user_id, day)
- Store: Events in database or event bus

**Task 2.4.2**: Calculate K-factor
- Duration: 60 minutes
- Function: `calculateKFactor(cohort: Cohort) => number`
- Formula: K = (invites_per_user × invite_conversion_rate)
- Track:
  - `invites_per_user`: Average invites sent per user
  - `invite_conversion_rate`: % of invites that convert to joins
- Return: K-factor value
- Target: K ≥ 1.20

**Task 2.4.3**: Create analytics dashboard
- Duration: 45 minutes
- Create `frontend/src/components/Analytics/Dashboard.tsx`
- Display:
  - K-factor over time
  - Invites per user
  - Conversion rates
  - FVM rates
  - Retention curves (D1/D7/D28)
  - Loop funnel drop-offs
- Update: Real-time or periodic refresh

#### Phase 2.5: Enhanced Testing (90 minutes)

**Task 2.5.1**: Test agentic actions
- Duration: 45 minutes
- Test: Session transcription → Summarization → Agentic action triggers
- Test: ≥2 student actions (Beat-My-Skill, Study Buddy)
- Test: ≥2 tutor actions (Parent Reel, Prep Pack)
- Verify: Actions trigger correctly from summaries
- Verify: Actions feed viral loops

**Task 2.5.2**: Test smart links and attribution
- Duration: 30 minutes
- Test: Generate smart link → Click link → Attribution tracked
- Test: Last-touch attribution works
- Test: Multi-touch attribution stored
- Verify: Deep links work correctly

**Task 2.5.3**: Integrated Unit Testing for Phase 2
- Duration: 15 minutes
- Run full test suite: `npm test`
- Verify: All Phase 1 + Phase 2 tests pass
- Document: Any edge cases

#### Phase 2.6: Early Submission Demo Video Preparation (45 minutes)

**Task 2.6.1**: Create 3-minute demo video script
- Duration: 20 minutes
- Script should cover:
  - Introduction (10s): "Varsity Tutors 10x K Factor Early Submission - now with agentic actions"
  - Agentic Actions (50s): Show session transcription → Summary → Action triggers (student + tutor)
  - Smart Links (30s): Show smart link generation, click tracking, attribution
  - Results-Page Sharing (40s): Show share card generation, deep links, cohort challenges
  - Analytics Dashboard (40s): Show K-factor, conversion rates, retention curves
  - Conclusion (10s): "Demonstrates complete viral growth system with agentic actions and analytics"

**Task 2.6.2**: Create cue card with narration and highlights
- Duration: 15 minutes
- Include narration for each section
- Bullet points for key features/outputs
- Visual cues for dashboard and analytics
- Timing markers for 3-minute target

---

### Phase 3: Final Submission (Due Sunday, November 9, 2025)

**Objective**: Compliance memo, comprehensive testing, documentation

#### Phase 3.1: Compliance & Safety (120 minutes)

**Task 3.1.1**: Write compliance memo
- Duration: 60 minutes
- Create `docs/compliance-memo.md` (1-page)
- Sections:
  - Data flows (what data collected, where stored)
  - Consent flows (explicit opt-in, revocable)
  - COPPA/FERPA compliance (parental gating for minors)
  - Privacy-safe defaults (no PII in share cards)
  - Child data segregation
  - Risk mitigation strategies
- Ensure: All recommendations are COPPA/FERPA safe

**Task 3.1.2**: Implement consent flows
- Duration: 30 minutes
- Add: Explicit consent UI for data processing
- Add: Consent tracking in database
- Add: Revocation flow
- Ensure: No processing without consent
- Test: Consent flows work correctly

**Task 3.1.3**: Implement parental gating
- Duration: 30 minutes
- Function: `checkParentalConsent(userId: string) => boolean`
- Logic:
  - Check: User age (if <13, require parental consent)
  - Gate: Certain features (sharing, viral loops) for minors
  - Require: Parental approval for child accounts
- Test: Parental gating works correctly

#### Phase 3.2: Trust & Safety Agent (120 minutes)

**Task 3.2.1**: Implement fraud detection
- Duration: 45 minutes
- Create `backend/agents/trustSafety.ts`
- Function: `detectFraud(invite: Invite) => FraudRisk`
- Checks:
  - Duplicate device/email (same user creating multiple accounts)
  - Suspicious invite patterns (too many invites in short time)
  - Invalid email domains
  - Known spam patterns
- Return: Fraud risk level

**Task 3.2.2**: Implement rate limiting
- Duration: 30 minutes
- Function: `checkRateLimit(userId: string, action: string) => boolean`
- Limits:
  - Max invites/day: 5
  - Cooldown between same loop: 1 hour
  - Max actions/hour: 20
- Return: Rate limit status

**Task 3.2.3**: Implement report/undo functionality
- Duration: 45 minutes
- Function: `reportInvite(inviteId: string, reason: string) => void`
- Function: `undoInvite(inviteId: string) => void`
- Logic:
  - Report: Store report in database
  - Undo: Revoke invite, remove from tracking
  - Track: Report rate (abuse metric)
- Return: Success confirmation

#### Phase 3.3: Experimentation Agent (90 minutes)

**Task 3.3.1**: Implement traffic allocation
- Duration: 45 minutes
- Create `backend/agents/experimentation.ts`
- Function: `allocateTraffic(userId: string) => Variant`
- Logic:
  - A/B test: Control vs. Treatment groups
  - Allocation: 50/50 split (configurable)
  - Track: User variant assignment
- Return: Variant (A or B)

**Task 3.3.2**: Calculate uplift and guardrail metrics
- Duration: 45 minutes
- Function: `calculateUplift(experiment: Experiment) => Metrics`
- Metrics:
  - K-factor: Treatment vs. Control
  - FVM lift: +20% target
  - Retention lift: +10% D7 target
  - Guardrails: Complaint rate, opt-out rate, abuse rate
- Return: Metrics object
- Target: K ≥ 1.20, abuse <0.5%

#### Phase 3.4: Comprehensive Testing (120 minutes)

**Task 3.4.1**: Test all viral loops end-to-end
- Duration: 60 minutes
- Test: Complete flow for each loop:
  1. Buddy Challenge: Practice → Share → Accept → Complete → FVM
  2. Results Rally: Results → Share → Join → FVM
  3. Proud Parent: Weekly recap → Share → Invite → Join
  4. Tutor Spotlight: 5★ session → Share → Referral → Join
- Verify: All loops complete successfully
- Verify: Attribution tracked correctly

**Task 3.4.2**: Test agentic actions
- Duration: 30 minutes
- Test: Session → Transcription → Summary → Action trigger
- Test: All ≥4 agentic actions (≥2 student, ≥2 tutor)
- Verify: Actions feed viral loops correctly
- Verify: Actions are privacy-safe

**Task 3.4.3**: Test analytics and K-factor calculation
- Duration: 30 minutes
- Test: K-factor calculation with seeded cohort
- Test: Event tracking for all events
- Test: Dashboard displays correct metrics
- Verify: K ≥ 1.20 for at least one loop
- Document: K-factor results

#### Phase 3.5: Documentation (120 minutes)

**Task 3.5.1**: Write technical writeup
- Duration: 60 minutes
- Sections:
  - System Overview
  - Architecture Decisions
  - Viral Loop Design (why these 4+ loops)
  - Agent Architecture (MCP or custom)
  - Smart Links & Attribution
  - Analytics & K-factor Calculation
  - Known Limitations
  - Future Improvements

**Task 3.5.2**: Update README
- Duration: 30 minutes
- Complete setup instructions
- Usage examples
- API documentation
- Testing instructions
- Deployment instructions
- Troubleshooting section

**Task 3.5.3**: Document AI tools and prompts
- Duration: 30 minutes
- List: AI tools used
- Document: Key prompts for agents
- Document: Prompt engineering for agentic actions
- Acknowledge: AI assistance

#### Phase 3.6: Code Evaluation, Refactoring & Security Assessment (90 minutes)

**Task 3.6.1**: Code evaluation and refactoring
- Duration: 45 minutes
- Review: All React/TypeScript code for best practices
- Review: Backend and agent code for best practices
- Refactor: Duplicate code, improve naming conventions
- Refactor: Improve code organization and structure
- Refactor: Enhance error handling and validation
- Verify: Code follows React and TypeScript best practices
- Review: Agent architecture for efficiency
- Optimize: API calls and real-time updates

**Task 3.6.2**: Security assessment
- Duration: 45 minutes
- Assess: API key security (never expose in frontend)
- Check: Input validation (user inputs, smart links)
- Check: SQL injection vulnerabilities (if using SQL)
- Review: Authentication and authorization
- Review: COPPA/FERPA compliance (parental gating, consent)
- Review: Data privacy (PII handling, child data segregation)
- Review: Smart link security (signature validation)
- Document: Security findings and mitigations
- Verify: No sensitive data in client-side code or logs

#### Phase 3.7: Final Polish (90 minutes)

**Task 3.7.1**: Code cleanup and linting
- Duration: 30 minutes
- Run linter: `npm run lint`
- Fix all linting errors
- Format code: `npm run format`
- Remove debug code
- Add JSDoc comments

**Task 3.7.2**: Optimize performance
- Duration: 30 minutes
- Optimize: Database queries
- Optimize: Real-time updates (Socket.io)
- Optimize: LLM API calls (batch if possible)
- Profile: Response times
- Target: <150ms decision SLA for in-app triggers

**Task 3.7.3**: Final verification checklist
- Duration: 30 minutes
- ✅ ≥4 viral loops functioning end-to-end
- ✅ ≥4 agentic actions (≥2 tutor, ≥2 student) working
- ✅ K-factor measured (pass/fail vs K ≥ 1.20)
- ✅ Presence UI and leaderboards working
- ✅ Compliance memo complete
- ✅ Results-page sharing active
- ✅ Analytics dashboard working
- ✅ All tests passing
- ✅ Documentation complete
- ✅ No secrets in code or commits

#### Phase 3.8: Final Submission Demo Video Preparation (45 minutes)

**Task 3.8.1**: Create 3-minute demo video script
- Duration: 20 minutes
- Script should cover:
  - Introduction (10s): "Varsity Tutors 10x K Factor - Complete viral growth system"
  - System Overview (20s): Architecture, viral loops, agents, presence layer
  - Viral Loop Demo (60s): Show Buddy Challenge, Results Rally, Proud Parent, Tutor Spotlight with full flow
  - Agentic Actions (40s): Show session transcription → Summary → Action triggers → Viral loops
  - Smart Links & Analytics (30s): Show smart links, attribution, K-factor dashboard
  - Compliance & Safety (10s): Show consent flows, parental gating
  - Conclusion (10s): "Complete viral growth system achieving K ≥ 1.20"

**Task 3.8.2**: Create cue card with narration and highlights
- Duration: 15 minutes
- Final polished version with all features
- Include visual demonstrations of all components
- Highlight key metrics (K-factor, conversion rates)
- Show compliance features

#### Phase 3.9: Integrated Unit Testing for Phase 3
- Duration: 15 minutes
- Run complete test suite: `npm test`
- Verify: All tests pass (100% of required scenarios)
- Run: End-to-end tests for all loops
- Verify: K-factor calculation works
- Document: Final test results summary

---

## Success Criteria

### MVP (Phase 1) - November 4
- ✅ ≥4 viral loops implemented (Buddy Challenge, Results Rally, Proud Parent, Tutor Spotlight)
- ✅ Required agents implemented (Loop Orchestrator, Personalization)
- ✅ "Alive" layer working (presence, activity feed, leaderboards)
- ✅ Basic operator demo functional
- ✅ Unit tests for core functions passing

### Early Submission (Phase 2) - November 7
- ✅ Session transcription and summarization working
- ✅ ≥4 agentic actions implemented (≥2 student, ≥2 tutor)
- ✅ Smart links and attribution tracking working
- ✅ Results-page sharing active (share cards, deep links)
- ✅ Analytics dashboard with K-factor calculation
- ✅ Integration tests passing

### Final Submission (Phase 3) - November 9
- ✅ All ≥4 viral loops functioning end-to-end
- ✅ All ≥4 agentic actions working
- ✅ K-factor measured (pass/fail vs K ≥ 1.20 target)
- ✅ Compliance memo complete (COPPA/FERPA safe)
- ✅ Trust & Safety agent working (fraud detection, rate limiting)
- ✅ Experimentation agent working (traffic allocation, uplift calculation)
- ✅ Comprehensive testing complete
- ✅ Documentation complete (technical writeup, README, compliance memo)
- ✅ All tests passing

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| K-factor < 1.20 | High | Optimize loops, improve personalization, test with seeded cohort |
| Agentic actions fail | Medium | Fallback to default copy/reward, log errors, graceful degradation |
| Compliance violations | High | Clear consent flows, parental gating, privacy-safe defaults, review compliance memo |
| Fraud/abuse | Medium | Trust & Safety agent, rate limiting, report/undo functionality |
| API costs too high | Medium | Cache responses, use cheaper models for iteration, optimize prompts |
| Time constraints | High | MVP is safety net, prioritize core loops and agents first |

---

## Deliverables Checklist

### Code Repository
- [ ] GitHub repository with clean structure
- [ ] Frontend code in `frontend/` directory
- [ ] Backend code in `backend/` directory
- [ ] Agent code in `backend/agents/` directory
- [ ] All tests in `tests/` directory
- [ ] README.md with setup instructions
- [ ] .env.example with required variables
- [ ] .gitignore configured properly

### Documentation
- [ ] Technical writeup (1-2 pages)
- [ ] Compliance memo (1-page)
- [ ] Decision log with key architectural choices
- [ ] README with complete setup and usage
- [ ] AI tools and prompts documentation

### Testing
- [ ] Unit tests for all agents
- [ ] Integration tests for all viral loops
- [ ] E2E tests for full flows
- [ ] K-factor calculation tests

### Demo
- [ ] Thin-slice prototype (web/mobile) with ≥4 loops
- [ ] Demo video (3 minutes)
- [ ] Demo video script
- [ ] Demo video cue card
- [ ] Run-of-show demo (3-minute journey)

### Analytics
- [ ] Event schema documented
- [ ] Analytics dashboard functional
- [ ] K-factor calculated and documented
- [ ] Metrics report generated

---

## Notes

- **COPPA/FERPA Compliance**: All features must be COPPA/FERPA safe, with parental gating for minors
- **Privacy-Safe Defaults**: No PII in share cards, explicit consent required
- **K-Factor Target**: K ≥ 1.20 for at least one loop over 14-day cohort
- **Agentic Actions**: ≥4 total (≥2 student, ≥2 tutor) from session transcription
- **MCP Agents**: Agents communicate via Model Context Protocol (MCP) servers
- **Explainability**: Each agent decision must include rationale for auditability

---

**Document Version**: 1.1  
**Created**: October 31, 2025  
**Last Updated**: November 3, 2025  
**Project Start Date**: November 3, 2025  
**Framework**: Based on October 16, 2025 success path methodology

