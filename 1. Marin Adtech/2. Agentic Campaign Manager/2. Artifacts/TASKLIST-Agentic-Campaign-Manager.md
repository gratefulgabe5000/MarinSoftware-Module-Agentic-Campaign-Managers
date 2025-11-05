# Task List: Agentic Campaign Manager MVP Implementation

**Document Version**: 1.0  
**Created**: January 2025  
**Project Timeline**: 24 hours (MVP Demo by Tomorrow 5:00 PM)  
**Target**: Complete MVP implementation of Agentic Campaign Manager web module  
**Framework**: React + TypeScript + Backend API

---

## Overview

This document provides a granular, step-by-step task list for implementing the Agentic Campaign Manager MVP. Tasks are organized into phases and subphases for maximum workflow efficiency. Each phase concludes with a unit testing subphase before proceeding to the next phase.

**Workflow Rules**:
- Complete all tasks in a subphase before proceeding
- Pause for confirmation after each subphase completion
- Use PowerShell syntax for all commands
- Run unit tests after each phase completion
- Do not proceed to next phase until current phase is tested and confirmed

---

## Phase 1: Project Setup & Foundation (4 hours)

### Subphase 1.1: Development Environment Setup (30 minutes)

#### Task 1.1.1: Verify Prerequisites
- [ ] Verify Node.js 18+ is installed: `node --version`
- [ ] Verify npm 9+ is installed: `npm --version`
- [ ] Verify Git is installed: `git --version`
- [ ] Verify code editor (VS Code recommended) is installed
- [ ] Create project root directory: `New-Item -ItemType Directory -Path "C:\Projects\AgenticCampaignManager" -Force`
- [ ] Navigate to project directory: `cd C:\Projects\AgenticCampaignManager`

#### Task 1.1.2: Initialize Frontend Project
- [ ] Initialize npm project: `npm init -y`
- [ ] Install React 18: `npm install react@18 react-dom@18`
- [ ] Install React types: `npm install --save-dev @types/react@18 @types/react-dom@18`
- [ ] Install TypeScript: `npm install --save-dev typescript@5.0`
- [ ] Install Vite: `npm install --save-dev vite@latest`
- [ ] Install Vite React plugin: `npm install --save-dev @vitejs/plugin-react@latest`
- [ ] Install React Router: `npm install react-router-dom@latest`
- [ ] Install React Router types: `npm install --save-dev @types/react-router-dom@latest`
- [ ] Install Axios: `npm install axios@latest`

#### Task 1.1.3: Initialize Backend Project
- [ ] Create backend directory: `New-Item -ItemType Directory -Path "backend" -Force`
- [ ] Navigate to backend: `cd backend`
- [ ] Initialize npm project: `npm init -y`
- [ ] Install Express: `npm install express@latest`
- [ ] Install Express types: `npm install --save-dev @types/express@latest`
- [ ] Install CORS: `npm install cors@latest`
- [ ] Install CORS types: `npm install --save-dev @types/cors@latest`
- [ ] Install dotenv: `npm install dotenv@latest`
- [ ] Install cookie-parser: `npm install cookie-parser@latest`
- [ ] Install cookie-parser types: `npm install --save-dev @types/cookie-parser@latest`
- [ ] Navigate back to root: `cd ..`

#### Task 1.1.4: Configure TypeScript
- [ ] Create frontend tsconfig.json: `New-Item -ItemType File -Path "tsconfig.json"`
- [ ] Add TypeScript configuration for React:
  ```json
  {
    "compilerOptions": {
      "target": "ES2020",
      "useDefineForClassFields": true,
      "lib": ["ES2020", "DOM", "DOM.Iterable"],
      "module": "ESNext",
      "skipLibCheck": true,
      "moduleResolution": "bundler",
      "allowImportingTsExtensions": true,
      "resolveJsonModule": true,
      "isolatedModules": true,
      "noEmit": true,
      "jsx": "react-jsx",
      "strict": true,
      "noUnusedLocals": true,
      "noUnusedParameters": true,
      "noFallthroughCasesInSwitch": true
    },
    "include": ["src"],
    "references": [{ "path": "./tsconfig.node.json" }]
  }
  ```
- [ ] Create backend tsconfig.json: `New-Item -ItemType File -Path "backend\tsconfig.json"`
- [ ] Add TypeScript configuration for Node.js backend

#### Task 1.1.5: Configure Vite
- [ ] Create vite.config.ts: `New-Item -ItemType File -Path "vite.config.ts"`
- [ ] Configure Vite with React plugin:
  ```typescript
  import { defineConfig } from 'vite';
  import react from '@vitejs/plugin-react';

  export default defineConfig({
    plugins: [react()],
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
        },
      },
    },
  });
  ```

**Pause for Confirmation**: Complete Subphase 1.1 before proceeding

---

### Subphase 1.2: Project Structure Creation (30 minutes)

#### Task 1.2.1: Create Frontend Directory Structure
- [ ] Create src directory: `New-Item -ItemType Directory -Path "src" -Force`
- [ ] Create src/components: `New-Item -ItemType Directory -Path "src\components" -Force`
- [ ] Create src/services: `New-Item -ItemType Directory -Path "src\services" -Force`
- [ ] Create src/hooks: `New-Item -ItemType Directory -Path "src\hooks" -Force`
- [ ] Create src/store: `New-Item -ItemType Directory -Path "src\store" -Force`
- [ ] Create src/types: `New-Item -ItemType Directory -Path "src\types" -Force`
- [ ] Create src/utils: `New-Item -ItemType Directory -Path "src\utils" -Force`
- [ ] Create src/config: `New-Item -ItemType Directory -Path "src\config" -Force`
- [ ] Create src/assets: `New-Item -ItemType Directory -Path "src\assets" -Force`

#### Task 1.2.2: Create Backend Directory Structure
- [ ] Create backend/src: `New-Item -ItemType Directory -Path "backend\src" -Force`
- [ ] Create backend/src/routes: `New-Item -ItemType Directory -Path "backend\src\routes" -Force`
- [ ] Create backend/src/services: `New-Item -ItemType Directory -Path "backend\src\services" -Force`
- [ ] Create backend/src/controllers: `New-Item -ItemType Directory -Path "backend\src\controllers" -Force`
- [ ] Create backend/src/middleware: `New-Item -ItemType Directory -Path "backend\src\middleware" -Force`
- [ ] Create backend/src/utils: `New-Item -ItemType Directory -Path "backend\src\utils" -Force`
- [ ] Create backend/src/types: `New-Item -ItemType Directory -Path "backend\src\types" -Force`

#### Task 1.2.3: Create Entry Point Files
- [ ] Create src/index.html with basic HTML structure
- [ ] Create src/main.tsx as React entry point
- [ ] Create src/App.tsx as main App component
- [ ] Create backend/src/index.ts as backend entry point

#### Task 1.2.4: Create Configuration Files
- [ ] Create .gitignore file with Node.js patterns
- [ ] Create .env.example file for environment variables
- [ ] Create .env file for local development (copy from .env.example)
- [ ] Create README.md with project overview

**Pause for Confirmation**: Complete Subphase 1.2 before proceeding

---

### Subphase 1.3: Basic Module Structure (1 hour)

#### Task 1.3.1: Create ADE Module Interface Types
- [ ] Create src/types/ade.types.ts
- [ ] Define ADEModule interface:
  ```typescript
  export interface ADEModule {
    id: string;
    name: string;
    version: string;
    description: string;
    icon?: string;
    category?: string;
    initialize: (context: ADEContext) => Promise<void>;
    activate: () => Promise<void>;
    deactivate: () => Promise<void>;
    destroy: () => Promise<void>;
    getUIComponents: () => ModuleUIComponents;
    onEvent: (event: ADEEvent) => void;
    emitEvent: (event: ADEEvent) => void;
  }
  ```
- [ ] Define ADEContext interface
- [ ] Define ModuleUIComponents interface
- [ ] Define ADEEvent interface

#### Task 1.3.2: Create Module Entry Point Component
- [ ] Create src/AgenticCampaignManagerModule.tsx
- [ ] Implement basic React component structure
- [ ] Add module metadata (id, name, version, description)
- [ ] Implement lifecycle hooks (initialize, activate, deactivate)
- [ ] Add basic error boundary wrapper

#### Task 1.3.3: Create Module Configuration
- [ ] Create src/config/module.config.ts
- [ ] Export module configuration object
- [ ] Define module metadata
- [ ] Define module routes
- [ ] Define module menu items

#### Task 1.3.4: Set Up Basic Routing
- [ ] Install React Router dependencies (if not already installed)
- [ ] Create src/components/ModuleContainer.tsx
- [ ] Implement basic routing structure within module
- [ ] Create placeholder route components (Dashboard, Create, Detail)

**Pause for Confirmation**: Complete Subphase 1.3 before proceeding

---

### Subphase 1.4: Basic Backend Setup (1 hour)

#### Task 1.4.1: Create Express Server
- [ ] Create backend/src/index.ts
- [ ] Set up basic Express server
- [ ] Configure CORS middleware
- [ ] Configure JSON body parser
- [ ] Configure cookie parser
- [ ] Set up basic error handling middleware
- [ ] Configure server to listen on port 3001

#### Task 1.4.2: Create API Route Structure
- [ ] Create backend/src/routes/index.ts
- [ ] Create backend/src/routes/campaigns.ts
- [ ] Create backend/src/routes/auth.ts
- [ ] Create backend/src/routes/ai.ts
- [ ] Set up route mounting in main server file

#### Task 1.4.3: Create Basic Controllers
- [ ] Create backend/src/controllers/campaignController.ts
- [ ] Create backend/src/controllers/authController.ts
- [ ] Create backend/src/controllers/aiController.ts
- [ ] Implement basic controller structure with placeholder methods

#### Task 1.4.4: Create Environment Configuration
- [ ] Create backend/.env file
- [ ] Add PORT configuration
- [ ] Add CORS_ORIGIN configuration
- [ ] Add OPENAI_API_KEY placeholder
- [ ] Add GOOGLE_ADS_CLIENT_ID placeholder
- [ ] Add GOOGLE_ADS_CLIENT_SECRET placeholder
- [ ] Create backend/src/config/env.ts to load environment variables

**Pause for Confirmation**: Complete Subphase 1.4 before proceeding

---

### Subphase 1.5: Phase 1 Unit Testing (30 minutes)

#### Task 1.5.1: Install Testing Dependencies
- [ ] Install Jest: `npm install --save-dev jest@latest`
- [ ] Install TypeScript Jest preset: `npm install --save-dev ts-jest@latest`
- [ ] Install @types/jest: `npm install --save-dev @types/jest@latest`
- [ ] Install React Testing Library: `npm install --save-dev @testing-library/react@latest`
- [ ] Install @testing-library/jest-dom: `npm install --save-dev @testing-library/jest-dom@latest`

#### Task 1.5.2: Configure Jest
- [ ] Create jest.config.js in root directory
- [ ] Configure Jest for TypeScript and React
- [ ] Configure test environment (jsdom for React)
- [ ] Set up test file patterns

#### Task 1.5.3: Write Unit Tests for Module Structure
- [ ] Create src/__tests__/AgenticCampaignManagerModule.test.tsx
- [ ] Test module initialization
- [ ] Test module activation/deactivation
- [ ] Test module lifecycle hooks
- [ ] Test module error boundaries

#### Task 1.5.4: Write Unit Tests for Backend Setup
- [ ] Create backend/src/__tests__/index.test.ts
- [ ] Test Express server initialization
- [ ] Test route mounting
- [ ] Test middleware configuration
- [ ] Test error handling

#### Task 1.5.5: Run Tests
- [ ] Run frontend tests: `npm test -- src/__tests__`
- [ ] Run backend tests: `npm test -- backend/src/__tests__`
- [ ] Verify all tests pass
- [ ] Fix any failing tests

**Pause for Confirmation**: Phase 1 complete. Proceed to Phase 2?

---

## Phase 2: Conversational Interface & Goal Understanding (4 hours)

### Subphase 2.1: Conversational Interface Component (1.5 hours)

#### Task 2.1.1: Create Message Types
- [ ] Create src/types/message.types.ts
- [ ] Define Message interface:
  ```typescript
  export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    isLoading?: boolean;
  }
  ```
- [ ] Define ConversationState interface

#### Task 2.1.2: Create Conversational Interface Component
- [ ] Create src/components/ConversationalInterface.tsx
- [ ] Implement message list component with scroll-to-bottom
- [ ] Implement message input component with send button
- [ ] Add keyboard shortcuts (Enter to send, Shift+Enter for new line)
- [ ] Add loading states for AI responses
- [ ] Add typing indicators
- [ ] Implement message formatting (markdown support)

#### Task 2.1.3: Create Message List Component
- [ ] Create src/components/MessageList.tsx
- [ ] Implement message rendering (user vs assistant styling)
- [ ] Implement auto-scroll to bottom on new messages
- [ ] Add message timestamp display
- [ ] Add loading indicator for AI responses

#### Task 2.1.4: Create Message Input Component
- [ ] Create src/components/MessageInput.tsx
- [ ] Implement textarea with auto-resize
- [ ] Implement send button (disabled when empty or loading)
- [ ] Implement keyboard shortcuts
- [ ] Add example prompts/suggestions display
- [ ] Add character count indicator (optional)

#### Task 2.1.5: Create Example Prompts Component
- [ ] Create src/components/ExamplePrompts.tsx
- [ ] Define example prompt templates
- [ ] Implement clickable prompt suggestions
- [ ] Add visual styling for prompt cards

**Pause for Confirmation**: Complete Subphase 2.1 before proceeding

---

### Subphase 2.2: Conversation State Management (1 hour)

#### Task 2.2.1: Install State Management Library
- [ ] Install Zustand: `npm install zustand@latest`
- [ ] Or install Redux Toolkit: `npm install @reduxjs/toolkit react-redux@latest`

#### Task 2.2.2: Create Conversation Store
- [ ] Create src/store/conversationStore.ts
- [ ] Define conversation state interface
- [ ] Implement store with Zustand (or Redux slice)
- [ ] Add actions: addMessage, setLoading, clearConversation
- [ ] Add selectors: getMessages, getLastMessage, isLoading

#### Task 2.2.3: Create IndexedDB Integration
- [ ] Create src/utils/indexedDB.ts
- [ ] Implement IndexedDB database initialization
- [ ] Implement conversation history save function
- [ ] Implement conversation history load function
- [ ] Implement conversation history clear function

#### Task 2.2.4: Integrate Store with Component
- [ ] Connect ConversationalInterface to conversation store
- [ ] Implement conversation persistence to IndexedDB
- [ ] Implement conversation loading on component mount
- [ ] Add conversation history management

**Pause for Confirmation**: Complete Subphase 2.2 before proceeding

---

### Subphase 2.3: AI Service Integration (1.5 hours)

#### Task 2.3.1: Create AI Service Types
- [ ] Create src/types/ai.types.ts
- [ ] Define CampaignPlan interface
- [ ] Define GoalUnderstandingRequest interface
- [ ] Define GoalUnderstandingResponse interface
- [ ] Define ClarifyingQuestion interface

#### Task 2.3.2: Create Frontend AI Service
- [ ] Create src/services/aiService.ts
- [ ] Implement understandGoal function:
  ```typescript
  async function understandGoal(goal: string): Promise<CampaignPlan>
  ```
- [ ] Implement generateClarifyingQuestions function
- [ ] Implement API error handling
- [ ] Implement retry logic with exponential backoff

#### Task 2.3.3: Create Backend AI Controller
- [ ] Create backend/src/controllers/aiController.ts
- [ ] Implement POST /api/ai/understand-goal endpoint
- [ ] Implement goal parsing logic
- [ ] Implement OpenAI/Claude API integration
- [ ] Implement prompt engineering for campaign goal extraction
- [ ] Implement structured output parsing (JSON schema validation)

#### Task 2.3.4: Create Backend AI Service
- [ ] Create backend/src/services/aiService.ts
- [ ] Implement LLM API client (OpenAI or Claude)
- [ ] Implement prompt templates
- [ ] Implement structured output generation
- [ ] Implement error handling and retry logic
- [ ] Implement rate limiting

#### Task 2.3.5: Create Backend AI Routes
- [ ] Create backend/src/routes/ai.ts
- [ ] Define POST /api/ai/understand-goal route
- [ ] Define POST /api/ai/clarifying-questions route
- [ ] Add request validation middleware
- [ ] Add error handling middleware

#### Task 2.3.6: Integrate AI Service with Frontend
- [ ] Connect ConversationalInterface to aiService
- [ ] Implement goal submission handler
- [ ] Implement AI response handling
- [ ] Implement clarifying questions display
- [ ] Add error message display for AI failures

**Pause for Confirmation**: Complete Subphase 2.3 before proceeding

---

### Subphase 2.4: Phase 2 Unit Testing (30 minutes)

#### Task 2.4.1: Write Tests for Conversational Interface
- [ ] Create src/components/__tests__/ConversationalInterface.test.tsx
- [ ] Test message rendering
- [ ] Test message input and submission
- [ ] Test keyboard shortcuts
- [ ] Test loading states
- [ ] Test error handling

#### Task 2.4.2: Write Tests for Conversation Store
- [ ] Create src/store/__tests__/conversationStore.test.ts
- [ ] Test message addition
- [ ] Test loading state management
- [ ] Test conversation clearing
- [ ] Test store selectors

#### Task 2.4.3: Write Tests for AI Service
- [ ] Create src/services/__tests__/aiService.test.ts
- [ ] Mock API calls
- [ ] Test goal understanding function
- [ ] Test error handling
- [ ] Test retry logic

#### Task 2.4.4: Write Tests for Backend AI Endpoints
- [ ] Create backend/src/__tests__/aiController.test.ts
- [ ] Test POST /api/ai/understand-goal endpoint
- [ ] Test request validation
- [ ] Test error handling
- [ ] Test response formatting

#### Task 2.4.5: Run Tests
- [ ] Run all Phase 2 tests: `npm test -- --testPathPattern="Phase2|2\."`
- [ ] Verify all tests pass
- [ ] Fix any failing tests

**Pause for Confirmation**: Phase 2 complete. Proceed to Phase 3?

---

## Phase 3: Campaign Preview & Creation (4 hours)

### Subphase 3.1: Campaign Plan Types & Interfaces (30 minutes)

#### Task 3.1.1: Create Campaign Types
- [ ] Create src/types/campaign.types.ts
- [ ] Define CampaignPlan interface (from PRD specification)
- [ ] Define Campaign interface
- [ ] Define AdGroupPlan interface
- [ ] Define TargetAudience interface
- [ ] Define Budget interface
- [ ] Define Timeline interface
- [ ] Define KPIs interface

#### Task 3.1.2: Create Campaign Store
- [ ] Create src/store/campaignStore.ts
- [ ] Define campaign state interface
- [ ] Implement campaign store with Zustand (or Redux)
- [ ] Add actions: setCampaignPlan, setCampaign, updateCampaignPlan
- [ ] Add selectors: getCampaignPlan, getCampaign, isCampaignPlanValid

**Pause for Confirmation**: Complete Subphase 3.1 before proceeding

---

### Subphase 3.2: Campaign Preview Component (1.5 hours)

#### Task 3.2.1: Create Campaign Preview Container
- [ ] Create src/components/CampaignPreview.tsx
- [ ] Implement campaign plan display layout
- [ ] Add edit/refine functionality
- [ ] Add approve button
- [ ] Add request changes option

#### Task 3.2.2: Create Campaign Overview Card
- [ ] Create src/components/CampaignOverviewCard.tsx
- [ ] Display campaign objective
- [ ] Display campaign name/description
- [ ] Display timeline information
- [ ] Display primary KPIs

#### Task 3.2.3: Create Budget Breakdown Visualization
- [ ] Create src/components/BudgetBreakdown.tsx
- [ ] Implement visual budget breakdown (pie chart or bar chart)
- [ ] Display total budget
- [ ] Display daily budget
- [ ] Display budget distribution across ad groups
- [ ] Install chart library: `npm install recharts@latest`

#### Task 3.2.4: Create Audience Summary Card
- [ ] Create src/components/AudienceSummaryCard.tsx
- [ ] Display target demographics
- [ ] Display interests list
- [ ] Display behaviors list
- [ ] Display audience size estimate

#### Task 3.2.5: Create Ad Group Structure Tree
- [ ] Create src/components/AdGroupStructureTree.tsx
- [ ] Implement tree view of ad groups
- [ ] Display ad group names
- [ ] Display keywords/audiences per ad group
- [ ] Display budget allocation per ad group
- [ ] Add expand/collapse functionality

#### Task 3.2.6: Create Performance Estimates Card
- [ ] Create src/components/PerformanceEstimatesCard.tsx
- [ ] Display expected impressions
- [ ] Display projected clicks
- [ ] Display estimated conversions
- [ ] Display predicted CPA/ROAS
- [ ] Display confidence intervals

#### Task 3.2.7: Create Action Buttons Component
- [ ] Create src/components/CampaignActionButtons.tsx
- [ ] Implement Approve button
- [ ] Implement Edit button
- [ ] Implement Request Changes button
- [ ] Add loading states for actions
- [ ] Add confirmation dialogs for critical actions

**Pause for Confirmation**: Complete Subphase 3.2 before proceeding

---

### Subphase 3.3: Campaign Creation Agent (Backend) (1.5 hours)

#### Task 3.3.1: Create Campaign Creation Types
- [ ] Create backend/src/types/campaign.types.ts
- [ ] Define CampaignCreationRequest interface
- [ ] Define CampaignCreationResponse interface
- [ ] Define CampaignStatus interface
- [ ] Define Platform API response types

#### Task 3.3.2: Create Platform API Service Base
- [ ] Create backend/src/services/platformApiService.ts
- [ ] Define base platform API interface
- [ ] Implement abstract platform API methods
- [ ] Implement error handling for platform APIs
- [ ] Implement rate limiting wrapper

#### Task 3.3.3: Create Google Ads API Integration
- [ ] Create backend/src/services/googleAdsService.ts
- [ ] Install Google Ads API client: `npm install google-ads-api@latest`
- [ ] Implement OAuth token management
- [ ] Implement campaign creation method
- [ ] Implement ad group creation method
- [ ] Implement keyword addition method
- [ ] Implement budget setting method
- [ ] Implement targeting configuration method

#### Task 3.3.4: Create Campaign Creation Service
- [ ] Create backend/src/services/campaignCreationService.ts
- [ ] Implement createCampaign function:
  ```typescript
  async function createCampaign(plan: CampaignPlan, platform: 'google' | 'meta'): Promise<Campaign>
  ```
- [ ] Implement campaign plan validation
- [ ] Implement campaign entity creation
- [ ] Implement ad group creation
- [ ] Implement keyword/audience addition
- [ ] Implement budget and bidding configuration
- [ ] Implement campaign activation

#### Task 3.3.5: Create Campaign Controller
- [ ] Update backend/src/controllers/campaignController.ts
- [ ] Implement POST /api/campaigns/create endpoint
- [ ] Implement request validation
- [ ] Implement campaign creation orchestration
- [ ] Implement progress tracking
- [ ] Implement error handling and response formatting

#### Task 3.3.6: Create Campaign Routes
- [ ] Update backend/src/routes/campaigns.ts
- [ ] Define POST /api/campaigns/create route
- [ ] Add request validation middleware
- [ ] Add authentication middleware (placeholder for MVP)
- [ ] Add error handling middleware

**Pause for Confirmation**: Complete Subphase 3.3 before proceeding

---

### Subphase 3.4: Campaign Creation Integration (Frontend) (30 minutes)

#### Task 3.4.1: Create Campaign Service
- [ ] Create src/services/campaignService.ts
- [ ] Implement createCampaign function:
  ```typescript
  async function createCampaign(plan: CampaignPlan): Promise<Campaign>
  ```
- [ ] Implement API error handling
- [ ] Implement retry logic
- [ ] Implement request timeout handling

#### Task 3.4.2: Create Campaign Creation Component
- [ ] Create src/components/CampaignCreation.tsx
- [ ] Implement campaign creation flow
- [ ] Add progress tracking display
- [ ] Add success/error message display
- [ ] Add redirect to campaign detail on success

#### Task 3.4.3: Integrate Campaign Creation
- [ ] Connect CampaignPreview to campaignService
- [ ] Implement approve button handler
- [ ] Implement campaign creation on approval
- [ ] Add loading states during creation
- [ ] Add error handling and user feedback

**Pause for Confirmation**: Complete Subphase 3.4 before proceeding

---

### Subphase 3.5: Phase 3 Unit Testing (30 minutes)

#### Task 3.5.1: Write Tests for Campaign Types
- [ ] Create src/types/__tests__/campaign.types.test.ts
- [ ] Test CampaignPlan interface validation
- [ ] Test type guards for campaign objects

#### Task 3.5.2: Write Tests for Campaign Preview Components
- [ ] Create src/components/__tests__/CampaignPreview.test.tsx
- [ ] Test campaign plan display
- [ ] Test edit functionality
- [ ] Test approve button
- [ ] Test request changes functionality

#### Task 3.5.3: Write Tests for Campaign Store
- [ ] Create src/store/__tests__/campaignStore.test.ts
- [ ] Test campaign plan setting
- [ ] Test campaign plan updates
- [ ] Test campaign validation

#### Task 3.5.4: Write Tests for Campaign Service
- [ ] Create src/services/__tests__/campaignService.test.ts
- [ ] Mock API calls
- [ ] Test campaign creation function
- [ ] Test error handling
- [ ] Test retry logic

#### Task 3.5.5: Write Tests for Backend Campaign Creation
- [ ] Create backend/src/__tests__/campaignCreationService.test.ts
- [ ] Mock platform API calls
- [ ] Test campaign creation service
- [ ] Test validation logic
- [ ] Test error handling

#### Task 3.5.6: Write Tests for Backend Campaign Endpoints
- [ ] Create backend/src/__tests__/campaignController.test.ts
- [ ] Test POST /api/campaigns/create endpoint
- [ ] Test request validation
- [ ] Test error handling
- [ ] Test response formatting

#### Task 3.5.7: Run Tests
- [ ] Run all Phase 3 tests: `npm test -- --testPathPattern="Phase3|3\."`
- [ ] Verify all tests pass
- [ ] Fix any failing tests

**Pause for Confirmation**: Phase 3 complete. Proceed to Phase 4?

---

## Phase 4: Campaign Launch & Tracking (4 hours)

### Subphase 4.1: Campaign Status Tracking (1 hour)

#### Task 4.1.1: Create Status Types
- [ ] Create src/types/status.types.ts
- [ ] Define CampaignStatus enum:
  ```typescript
  enum CampaignStatus {
    CREATING = 'creating',
    ACTIVE = 'active',
    PAUSED = 'paused',
    ERROR = 'error',
    PENDING_REVIEW = 'pending_review'
  }
  ```
- [ ] Define StatusUpdate interface
- [ ] Define StatusHistory interface

#### Task 4.1.2: Create Status Service
- [ ] Create src/services/statusService.ts
- [ ] Implement getCampaignStatus function
- [ ] Implement startMonitoring function (polling)
- [ ] Implement stopMonitoring function
- [ ] Implement status update callback system

#### Task 4.1.3: Create Status Component
- [ ] Create src/components/CampaignStatus.tsx
- [ ] Implement status display with visual indicators
- [ ] Implement status history display
- [ ] Add status change notifications
- [ ] Add error message display

#### Task 4.1.4: Create Backend Status Endpoint
- [ ] Create backend/src/controllers/statusController.ts
- [ ] Implement GET /api/campaigns/:id/status endpoint
- [ ] Implement status polling from platform API
- [ ] Implement status caching
- [ ] Add error handling

#### Task 4.1.5: Integrate Status Tracking
- [ ] Connect CampaignDetail to statusService
- [ ] Implement automatic status polling
- [ ] Implement status updates in UI
- [ ] Add cleanup on component unmount

**Pause for Confirmation**: Complete Subphase 4.1 before proceeding

---

### Subphase 4.2: Browser Notifications (30 minutes)

#### Task 4.2.1: Create Notification Service
- [ ] Create src/services/notificationService.ts
- [ ] Implement requestNotificationPermission function
- [ ] Implement showNotification function
- [ ] Implement notification click handling
- [ ] Implement notification close handling

#### Task 4.2.2: Integrate Notifications with Status
- [ ] Connect notificationService to statusService
- [ ] Implement notifications for status changes
- [ ] Add notification permission request
- [ ] Add notification settings/preferences

#### Task 4.2.3: Create Notification Component
- [ ] Create src/components/NotificationSettings.tsx
- [ ] Implement notification permission status
- [ ] Implement notification toggle
- [ ] Add notification preferences storage (LocalStorage)

**Pause for Confirmation**: Complete Subphase 4.2 before proceeding

---

### Subphase 4.3: Campaign Detail View (1 hour)

#### Task 4.3.1: Create Campaign Detail Component
- [ ] Create src/components/CampaignDetail.tsx
- [ ] Implement campaign information display
- [ ] Implement status display
- [ ] Implement action buttons (pause, resume, delete)
- [ ] Add link to platform UI (opens in new tab)

#### Task 4.3.2: Create Campaign Information Card
- [ ] Create src/components/CampaignInfoCard.tsx
- [ ] Display campaign ID
- [ ] Display campaign name
- [ ] Display campaign objective
- [ ] Display budget information
- [ ] Display timeline information

#### Task 4.3.3: Create Campaign Actions Component
- [ ] Create src/components/CampaignActions.tsx
- [ ] Implement pause campaign button
- [ ] Implement resume campaign button
- [ ] Implement delete campaign button
- [ ] Add confirmation dialogs
- [ ] Add loading states

#### Task 4.3.4: Create Backend Campaign Actions
- [ ] Update backend/src/controllers/campaignController.ts
- [ ] Implement POST /api/campaigns/:id/pause endpoint
- [ ] Implement POST /api/campaigns/:id/resume endpoint
- [ ] Implement DELETE /api/campaigns/:id endpoint
- [ ] Add platform API integration for actions

#### Task 4.3.5: Integrate Campaign Actions
- [ ] Connect CampaignActions to campaignService
- [ ] Implement pause/resume/delete handlers
- [ ] Add success/error feedback
- [ ] Update campaign state after actions

**Pause for Confirmation**: Complete Subphase 4.3 before proceeding

---

### Subphase 4.4: OAuth Integration (1 hour)

#### Task 4.4.1: Create OAuth Service (Backend)
- [ ] Create backend/src/services/oauthService.ts
- [ ] Implement OAuth authorization URL generation
- [ ] Implement OAuth callback handler
- [ ] Implement token exchange
- [ ] Implement token storage (database)
- [ ] Implement token refresh logic

#### Task 4.4.2: Create OAuth Routes
- [ ] Create backend/src/routes/auth.ts
- [ ] Define GET /api/auth/google/authorize endpoint
- [ ] Define GET /api/auth/google/callback endpoint
- [ ] Define GET /api/auth/meta/authorize endpoint
- [ ] Define GET /api/auth/meta/callback endpoint
- [ ] Add error handling middleware

#### Task 4.4.3: Create OAuth Frontend Component
- [ ] Create src/components/PlatformConnection.tsx
- [ ] Implement connection button
- [ ] Implement connection status display
- [ ] Implement OAuth flow initiation
- [ ] Implement connection success handling

#### Task 4.4.4: Create Session Management
- [ ] Create backend/src/middleware/authMiddleware.ts
- [ ] Implement session validation middleware
- [ ] Implement token refresh middleware
- [ ] Create session storage (database table or in-memory for MVP)

#### Task 4.4.5: Integrate OAuth Flow
- [ ] Connect PlatformConnection to backend OAuth endpoints
- [ ] Implement OAuth redirect flow
- [ ] Implement session cookie handling
- [ ] Add connection status display

**Pause for Confirmation**: Complete Subphase 4.4 before proceeding

---

### Subphase 4.5: Phase 4 Unit Testing (30 minutes)

#### Task 4.5.1: Write Tests for Status Service
- [ ] Create src/services/__tests__/statusService.test.ts
- [ ] Test status polling
- [ ] Test status monitoring start/stop
- [ ] Test status update callbacks

#### Task 4.5.2: Write Tests for Notification Service
- [ ] Create src/services/__tests__/notificationService.test.ts
- [ ] Mock Notification API
- [ ] Test permission request
- [ ] Test notification display

#### Task 4.5.3: Write Tests for Campaign Detail Components
- [ ] Create src/components/__tests__/CampaignDetail.test.tsx
- [ ] Test campaign information display
- [ ] Test action buttons
- [ ] Test confirmation dialogs

#### Task 4.5.4: Write Tests for Backend Status Endpoints
- [ ] Create backend/src/__tests__/statusController.test.ts
- [ ] Test GET /api/campaigns/:id/status endpoint
- [ ] Test status polling logic
- [ ] Test error handling

#### Task 4.5.5: Write Tests for OAuth Service
- [ ] Create backend/src/__tests__/oauthService.test.ts
- [ ] Mock OAuth provider APIs
- [ ] Test authorization URL generation
- [ ] Test token exchange
- [ ] Test token refresh

#### Task 4.5.6: Run Tests
- [ ] Run all Phase 4 tests: `npm test -- --testPathPattern="Phase4|4\."`
- [ ] Verify all tests pass
- [ ] Fix any failing tests

**Pause for Confirmation**: Phase 4 complete. Proceed to Phase 5?

---

## Phase 5: Performance Dashboard (4 hours)

### Subphase 5.1: Performance Data Types & Service (1 hour)

#### Task 5.1.1: Create Performance Types
- [ ] Create src/types/performance.types.ts
- [ ] Define PerformanceMetrics interface:
  ```typescript
  interface PerformanceMetrics {
    impressions: number;
    clicks: number;
    ctr: number;
    conversions: number;
    cpa: number;
    roas: number;
    spend: number;
    dateRange: { start: Date; end: Date };
  }
  ```
- [ ] Define PerformanceDataPoint interface
- [ ] Define PerformanceTimeSeries interface

#### Task 5.1.2: Create Performance Service
- [ ] Create src/services/performanceService.ts
- [ ] Implement getMetrics function:
  ```typescript
  async function getMetrics(campaignId: string, timeRange: string): Promise<PerformanceMetrics>
  ```
- [ ] Implement getTimeSeries function
- [ ] Implement cacheMetrics function (IndexedDB)
- [ ] Implement getCachedMetrics function
- [ ] Implement exportToCSV function

#### Task 5.1.3: Create Backend Performance Endpoint
- [ ] Create backend/src/controllers/performanceController.ts
- [ ] Implement GET /api/campaigns/:id/performance endpoint
- [ ] Implement platform API integration for metrics
- [ ] Implement data aggregation logic
- [ ] Implement caching (optional for MVP)
- [ ] Add error handling

#### Task 5.1.4: Create Performance Routes
- [ ] Update backend/src/routes/campaigns.ts
- [ ] Define GET /api/campaigns/:id/performance route
- [ ] Add query parameter validation (timeRange)
- [ ] Add error handling middleware

**Pause for Confirmation**: Complete Subphase 5.1 before proceeding

---

### Subphase 5.2: Performance Dashboard Component (1.5 hours)

#### Task 5.2.1: Create Performance Dashboard Container
- [ ] Create src/components/PerformanceDashboard.tsx
- [ ] Implement dashboard layout
- [ ] Implement time range selector
- [ ] Implement metrics cards display
- [ ] Implement charts display
- [ ] Add loading states
- [ ] Add error handling

#### Task 5.2.2: Create Metrics Summary Cards
- [ ] Create src/components/MetricsSummaryCards.tsx
- [ ] Create ImpressionsCard component
- [ ] Create ClicksCard component
- [ ] Create CTRCard component
- [ ] Create ConversionsCard component
- [ ] Create CPACard component
- [ ] Create ROASCard component
- [ ] Create SpendCard component
- [ ] Add visual styling and icons

#### Task 5.2.3: Create Performance Charts
- [ ] Create src/components/PerformanceCharts.tsx
- [ ] Install Recharts: `npm install recharts@latest`
- [ ] Create SpendOverTimeChart component (line chart)
- [ ] Create PerformanceComparisonChart component (bar chart)
- [ ] Create CTRTrendChart component (line chart)
- [ ] Add chart interactivity (tooltips, zoom)
- [ ] Add responsive chart sizing

#### Task 5.2.4: Create Time Range Selector
- [ ] Create src/components/TimeRangeSelector.tsx
- [ ] Implement time range options (today, 7d, 30d)
- [ ] Implement custom date range picker (optional for MVP)
- [ ] Add visual styling
- [ ] Connect to performance service

#### Task 5.2.5: Create Performance vs Goals Display
- [ ] Create src/components/PerformanceVsGoals.tsx
- [ ] Display goal vs actual comparison
- [ ] Implement visual indicators (meeting/not meeting goals)
- [ ] Add percentage difference display
- [ ] Add color coding (green/yellow/red)

**Pause for Confirmation**: Complete Subphase 5.2 before proceeding

---

### Subphase 5.3: Data Caching & Offline Support (1 hour)

#### Task 5.3.1: Enhance IndexedDB Service
- [ ] Update src/utils/indexedDB.ts
- [ ] Implement performance metrics storage
- [ ] Implement cache TTL (time-to-live) logic
- [ ] Implement cache invalidation
- [ ] Implement cache cleanup (old data)

#### Task 5.3.2: Implement Offline Data Viewing
- [ ] Update performanceService to check cache first
- [ ] Implement fallback to cached data when offline
- [ ] Add offline indicator in dashboard
- [ ] Add "last updated" timestamp display

#### Task 5.3.3: Implement Data Sync Queue
- [ ] Create src/utils/syncQueue.ts
- [ ] Implement request queue for offline scenarios
- [ ] Implement sync on connection restore
- [ ] Add queue status display

#### Task 5.3.4: Implement Background Polling
- [ ] Update statusService to include performance polling
- [ ] Implement periodic performance data updates
- [ ] Implement configurable polling interval
- [ ] Add polling start/stop controls

**Pause for Confirmation**: Complete Subphase 5.3 before proceeding

---

### Subphase 5.4: Export Functionality (30 minutes)

#### Task 5.4.1: Create Export Service
- [ ] Create src/utils/exportService.ts
- [ ] Implement convertToCSV function
- [ ] Implement downloadFile function (Blob API)
- [ ] Implement exportMetrics function
- [ ] Add file naming with timestamp

#### Task 5.4.2: Create Export Component
- [ ] Create src/components/ExportButton.tsx
- [ ] Implement export button
- [ ] Add export options (CSV, Excel placeholder)
- [ ] Add loading state during export
- [ ] Add success/error feedback

#### Task 5.4.3: Integrate Export Functionality
- [ ] Connect ExportButton to exportService
- [ ] Add export button to PerformanceDashboard
- [ ] Test export functionality

**Pause for Confirmation**: Complete Subphase 5.4 before proceeding

---

### Subphase 5.5: Phase 5 Unit Testing (30 minutes)

#### Task 5.5.1: Write Tests for Performance Service
- [ ] Create src/services/__tests__/performanceService.test.ts
- [ ] Mock API calls
- [ ] Test getMetrics function
- [ ] Test caching logic
- [ ] Test export functionality

#### Task 5.5.2: Write Tests for Performance Components
- [ ] Create src/components/__tests__/PerformanceDashboard.test.tsx
- [ ] Test metrics display
- [ ] Test time range selection
- [ ] Test chart rendering
- [ ] Test loading states

#### Task 5.5.3: Write Tests for IndexedDB Caching
- [ ] Create src/utils/__tests__/indexedDB.test.ts
- [ ] Mock IndexedDB API
- [ ] Test cache storage
- [ ] Test cache retrieval
- [ ] Test cache TTL logic

#### Task 5.5.4: Write Tests for Backend Performance Endpoints
- [ ] Create backend/src/__tests__/performanceController.test.ts
- [ ] Test GET /api/campaigns/:id/performance endpoint
- [ ] Test data aggregation
- [ ] Test error handling

#### Task 5.5.5: Run Tests
- [ ] Run all Phase 5 tests: `npm test -- --testPathPattern="Phase5|5\."`
- [ ] Verify all tests pass
- [ ] Fix any failing tests

**Pause for Confirmation**: Phase 5 complete. Proceed to Phase 6?

---

## Phase 6: Integration & Polish (8 hours - Tomorrow)

### Subphase 6.1: ADE Module Integration (2 hours)

#### Task 6.1.1: Complete Module Registration
- [ ] Update src/AgenticCampaignManagerModule.tsx
- [ ] Implement full ADE module interface
- [ ] Implement all lifecycle hooks
- [ ] Implement UI component registration
- [ ] Implement event handling

#### Task 6.1.2: Create Toolbar Button Component
- [ ] Create src/components/CampaignManagerToolbarButton.tsx
- [ ] Implement toolbar button with icon
- [ ] Implement click handler to activate module
- [ ] Add active state styling
- [ ] Add badge for notifications (optional)

#### Task 6.1.3: Create Sidebar Panel Component
- [ ] Create src/components/CampaignManagerSidebar.tsx
- [ ] Implement campaign list display
- [ ] Implement quick actions
- [ ] Implement campaign search/filter
- [ ] Add active campaign highlighting

#### Task 6.1.4: Create Module Routes Configuration
- [ ] Update src/config/module.config.ts
- [ ] Define all module routes
- [ ] Define route components
- [ ] Define route metadata

#### Task 6.1.5: Integrate with ADE Event Bus
- [ ] Implement event subscription
- [ ] Implement event emission
- [ ] Handle ADE-wide events (user logout, theme change, etc.)
- [ ] Emit module-specific events

**Pause for Confirmation**: Complete Subphase 6.1 before proceeding

---

### Subphase 6.2: Error Handling & User Feedback (1.5 hours)

#### Task 6.2.1: Create Error Boundary Component
- [ ] Create src/components/ErrorBoundary.tsx
- [ ] Implement React error boundary
- [ ] Add error message display
- [ ] Add error recovery options
- [ ] Add error reporting (optional for MVP)

#### Task 6.2.2: Create Toast Notification System
- [ ] Create src/components/Toast.tsx
- [ ] Create src/components/ToastContainer.tsx
- [ ] Create src/utils/toastService.ts
- [ ] Implement toast display (success, error, warning, info)
- [ ] Implement auto-dismiss functionality

#### Task 6.2.3: Add Error Handling Throughout
- [ ] Add try-catch blocks to all API calls
- [ ] Add error messages to all forms
- [ ] Add loading states to all async operations
- [ ] Add validation error display
- [ ] Add network error handling

#### Task 6.2.4: Create Loading Components
- [ ] Create src/components/LoadingSpinner.tsx
- [ ] Create src/components/LoadingOverlay.tsx
- [ ] Create src/components/SkeletonLoader.tsx
- [ ] Integrate loading components throughout module

**Pause for Confirmation**: Complete Subphase 6.2 before proceeding

---

### Subphase 6.3: Responsive Design & Browser Compatibility (1.5 hours)

#### Task 6.3.1: Add Responsive CSS
- [ ] Create src/styles/responsive.css
- [ ] Add mobile breakpoints (768px, 480px)
- [ ] Add tablet breakpoints (1024px)
- [ ] Update all components for responsive design
- [ ] Test on mobile viewport

#### Task 6.3.2: Browser Compatibility Testing
- [ ] Test in Chrome/Edge (Chromium)
- [ ] Test in Firefox
- [ ] Test in Safari
- [ ] Fix browser-specific issues
- [ ] Add polyfills if needed (for older browsers)

#### Task 6.3.3: Cross-Browser CSS Fixes
- [ ] Fix CSS vendor prefixes
- [ ] Fix Flexbox/Grid compatibility
- [ ] Fix IndexedDB API compatibility
- [ ] Fix Web Notifications API compatibility

#### Task 6.3.4: Mobile Optimization
- [ ] Optimize touch interactions
- [ ] Optimize form inputs for mobile
- [ ] Optimize chart displays for mobile
- [ ] Optimize navigation for mobile

**Pause for Confirmation**: Complete Subphase 6.3 before proceeding

---

### Subphase 6.4: Module Bundling & Optimization (1 hour)

#### Task 6.4.1: Configure Build Scripts
- [ ] Update package.json with build scripts
- [ ] Add build:frontend script
- [ ] Add build:backend script
- [ ] Add build:all script
- [ ] Add start:dev script for development

#### Task 6.4.2: Optimize Bundle Size
- [ ] Analyze bundle size: `npm run build -- --analyze`
- [ ] Remove unused dependencies
- [ ] Implement code splitting (lazy loading)
- [ ] Optimize images and assets
- [ ] Minimize bundle to < 500KB gzipped

#### Task 6.4.3: Configure Production Build
- [ ] Update Vite config for production
- [ ] Enable minification
- [ ] Enable tree shaking
- [ ] Configure source maps (optional)
- [ ] Test production build

#### Task 6.4.4: Create Module Package
- [ ] Create module manifest file
- [ ] Create module entry point
- [ ] Test module loading in ADE framework
- [ ] Verify module can be bundled separately

**Pause for Confirmation**: Complete Subphase 6.4 before proceeding

---

### Subphase 6.5: Documentation & Demo Preparation (1 hour)

#### Task 6.5.1: Create User Documentation
- [ ] Create USER_GUIDE.md
- [ ] Document module features
- [ ] Document user workflows
- [ ] Add screenshots (if available)
- [ ] Add FAQ section

#### Task 6.5.2: Create Developer Documentation
- [ ] Create DEVELOPER_GUIDE.md
- [ ] Document module architecture
- [ ] Document API endpoints
- [ ] Document component structure
- [ ] Document state management

#### Task 6.5.3: Create Demo Script
- [ ] Create DEMO_SCRIPT.md
- [ ] Outline demo flow
- [ ] List demo scenarios
- [ ] Prepare example campaign goals
- [ ] Prepare test accounts (if needed)

#### Task 6.5.4: Prepare Demo Environment
- [ ] Set up demo Google Ads account (or test account)
- [ ] Set up demo API keys
- [ ] Prepare demo data
- [ ] Test demo flow end-to-end
- [ ] Record demo video (optional)

**Pause for Confirmation**: Complete Subphase 6.5 before proceeding

---

### Subphase 6.6: Final Testing & Bug Fixes (1 hour)

#### Task 6.6.1: End-to-End Testing
- [ ] Test complete campaign creation flow
- [ ] Test goal input → plan generation → approval → creation
- [ ] Test campaign status tracking
- [ ] Test performance dashboard
- [ ] Test OAuth flow
- [ ] Test error scenarios

#### Task 6.6.2: Integration Testing
- [ ] Test module integration with ADE framework
- [ ] Test module activation/deactivation
- [ ] Test module routing
- [ ] Test event bus integration
- [ ] Test shared state integration

#### Task 6.6.3: Performance Testing
- [ ] Test module load time (< 2 seconds)
- [ ] Test API response times
- [ ] Test UI responsiveness
- [ ] Test memory leaks (component cleanup)
- [ ] Test bundle size

#### Task 6.6.4: Bug Fixes
- [ ] Fix all identified bugs
- [ ] Fix console errors
- [ ] Fix TypeScript errors
- [ ] Fix linting errors
- [ ] Fix accessibility issues (basic)

#### Task 6.6.5: Final Test Run
- [ ] Run all unit tests: `npm test`
- [ ] Run integration tests
- [ ] Run E2E tests (if available)
- [ ] Verify all tests pass
- [ ] Document any known issues

**Pause for Confirmation**: Complete Subphase 6.6 before proceeding

---

### Subphase 6.7: Phase 6 Unit Testing (30 minutes)

#### Task 6.7.1: Write Tests for Module Integration
- [ ] Create src/__tests__/moduleIntegration.test.tsx
- [ ] Test module registration
- [ ] Test lifecycle hooks
- [ ] Test UI component registration
- [ ] Test event handling

#### Task 6.7.2: Write Tests for Error Handling
- [ ] Create src/components/__tests__/ErrorBoundary.test.tsx
- [ ] Test error boundary functionality
- [ ] Test error recovery

#### Task 6.7.3: Write Tests for Toast System
- [ ] Create src/utils/__tests__/toastService.test.ts
- [ ] Test toast display
- [ ] Test toast dismissal

#### Task 6.7.4: Run Final Test Suite
- [ ] Run all tests: `npm test -- --coverage`
- [ ] Verify test coverage > 70% (target)
- [ ] Fix any failing tests
- [ ] Document test coverage

**Pause for Confirmation**: Phase 6 complete. Ready for demo?

---

## Final Verification Checklist

### Pre-Demo Verification (30 minutes)

#### Task FV.1: MVP Requirements Verification
- [ ] Web application module launches and loads within ADE ✓
- [ ] Natural language goal input works ✓
- [ ] AI understands goals and generates plan ✓
- [ ] Campaign preview and approval interface works ✓
- [ ] Campaign creation in single platform works ✓
- [ ] Campaign launch tracking works ✓
- [ ] Basic performance dashboard displays data ✓

#### Task FV.2: Demo Flow Verification
- [ ] Complete end-to-end workflow (Goal → Campaign → Launch) works in < 5 minutes
- [ ] Campaign successfully created in Google Ads OR Meta Ads
- [ ] Performance data displays correctly
- [ ] User can understand and approve AI-generated plan
- [ ] Demo showcases agentic capabilities (not just automation)

#### Task FV.3: Technical Verification
- [ ] App loads without errors
- [ ] AI responses are relevant and accurate
- [ ] Campaign creation succeeds > 90% of the time
- [ ] Performance data updates within 15 minutes
- [ ] No critical bugs or crashes

#### Task FV.4: Documentation Verification
- [ ] README.md is complete
- [ ] USER_GUIDE.md is complete
- [ ] DEVELOPER_GUIDE.md is complete
- [ ] DEMO_SCRIPT.md is ready
- [ ] All documentation is accurate

**Final Confirmation**: All tasks complete. MVP ready for demo at 5:00 PM!

---

## PowerShell Command Reference

### Common Commands Used Throughout

```powershell
# Create directory
New-Item -ItemType Directory -Path "path" -Force

# Navigate directory
cd "path"

# Install npm package
npm install package-name@latest

# Install dev dependency
npm install --save-dev package-name@latest

# Run tests
npm test

# Run tests with pattern
npm test -- --testPathPattern="pattern"

# Build project
npm run build

# Start development server
npm run dev

# Check Node.js version
node --version

# Check npm version
npm --version
```

---

## Notes & Considerations

1. **Timeline**: This is a 24-hour sprint. Focus on MVP features only. Polish and enhancements can come post-MVP.

2. **Testing**: Unit tests are included at the end of each phase. Integration tests and E2E tests can be added post-MVP.

3. **Error Handling**: Basic error handling is included. Comprehensive error handling can be enhanced post-MVP.

4. **OAuth**: For MVP, a basic OAuth flow is sufficient. Full token refresh and edge cases can be handled post-MVP.

5. **Platform Integration**: MVP focuses on single platform (Google Ads OR Meta Ads). Multi-platform support is post-MVP.

6. **Offline Support**: Basic offline support is included. Full offline queue and sync can be enhanced post-MVP.

7. **Performance**: Basic performance optimization is included. Advanced optimization can be done post-MVP.

8. **Documentation**: Basic documentation is included. Comprehensive documentation can be enhanced post-MVP.

---

*Document Version: 1.0*  
*Created: January 2025*  
*For: Agentic Campaign Manager MVP Implementation*  
*Timeline: 24 hours (Demo by Tomorrow 5:00 PM)*

