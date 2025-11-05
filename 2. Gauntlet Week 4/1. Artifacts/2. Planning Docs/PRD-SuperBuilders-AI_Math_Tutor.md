# Product Requirements Document: AI Math Tutor

**Version:** 1.1  
**Date:** November 3, 2025  
**Project Duration:** 7 Days (Nov 3 - Nov 9, 2025)  
**Project Start:** November 3, 2025  
**Framework:** Based on October 16, 2025 success path methodology  
**Target:** Socratic Learning Assistant with OCR/Vision LLM Parsing

---

## Executive Summary

AI Math Tutor is an AI-powered educational assistant that guides students through math problems using Socratic questioning. The system accepts problems via screenshot or text input, parses them using OCR/Vision LLM, and maintains multi-turn conversations that guide students to discover solutions without providing direct answers.

**Key Deliverables:**
- ✅ Problem Input: Text entry + image upload with OCR/Vision LLM parsing
- ✅ Socratic Dialogue: Multi-turn conversation with guiding questions
- ✅ Math Rendering: Display equations properly (LaTeX/KaTeX)
- ✅ Web Interface: Clean chat UI with image upload and conversation history
- ✅ Context Management: Maintains conversation context across turns
- ✅ Adaptive Scaffolding: Adjusts to student understanding level

**Success Targets:**
- **MVP (Nov 4)**: Basic chat + LLM integration + Socratic prompting + image parsing
- **Early Submission (Nov 7)**: + Math rendering + conversation history + UI polish
- **Final Submission (Nov 9)**: + Comprehensive testing + documentation + optional stretch features

---

## Project Timeline

| Milestone | Date | Deliverable |
|-----------|------|-------------|
| **Phase 1: MVP** | Tuesday, November 4, 2025 | Basic chat UI, LLM integration, Socratic prompting, image parsing working |
| **Early Submission** | Friday, November 7, 2025 | + Math rendering (LaTeX), conversation history, UI polish |
| **Final Submission** | Sunday, November 9, 2025 | + Comprehensive testing, documentation, optional stretch features |

---

## Technology Stack

### Frontend Stack
- **Framework**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **UI Library**: shadcn/ui or Material-UI
- **Math Rendering**: KaTeX or MathJax
- **Image Upload**: React Dropzone or similar
- **Chat UI**: Custom chat component or react-chat-elements
- **Build Tool**: Vite or Next.js (if SSR needed)

### Backend Stack
- **Framework**: Node.js + Express.js or Next.js API routes
- **Language**: TypeScript
- **AI Integration**: OpenAI GPT-4 with Vision API or Anthropic Claude with vision
- **Image Processing**: Sharp (for image optimization)
- **Storage**: SQLite (local) or PostgreSQL (if deployed)
- **Session Management**: In-memory or Redis (if deployed)

### AI Integration
- **LLM**: OpenAI GPT-4 Turbo with Vision or Anthropic Claude 3.5 Sonnet with vision
- **SDK**: OpenAI Node.js SDK or Anthropic SDK
- **Image Processing**: OpenAI Vision API for OCR or Tesseract.js (local OCR)
- **Prompt Engineering**: Structured prompts for Socratic method

### Development Tools
- **Package Manager**: npm or yarn
- **Linting**: ESLint + Prettier
- **Type Checking**: TypeScript strict mode
- **Testing**: Vitest or Jest
- **Documentation**: JSDoc + README

---

## Architecture Overview

### System Components

```
AI-Math-Tutor/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Chat.tsx              # Main chat interface
│   │   │   ├── MessageBubble.tsx     # Message display
│   │   │   ├── ImageUpload.tsx       # Image upload component
│   │   │   ├── MathRenderer.tsx      # LaTeX math rendering
│   │   │   └── ConversationHistory.tsx # History sidebar
│   │   ├── hooks/
│   │   │   ├── useChat.ts            # Chat state management
│   │   │   └── useImageUpload.ts     # Image upload logic
│   │   ├── services/
│   │   │   ├── api.ts                # API client
│   │   │   └── mathParser.ts         # Math parsing utilities
│   │   └── App.tsx
│   └── public/
├── backend/
│   ├── api/
│   │   ├── chat.ts                   # Chat endpoint
│   │   ├── image-upload.ts            # Image upload endpoint
│   │   └── health.ts                  # Health check
│   ├── services/
│   │   ├── llm.ts                     # LLM service
│   │   ├── imageProcessor.ts          # Image processing
│   │   ├── socratic.ts                # Socratic method logic
│   │   └── contextManager.ts         # Conversation context
│   ├── prompts/
│   │   └── socratic.ts                # Socratic prompt templates
│   └── server.ts                      # Express server
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── docs/
    ├── technical-writeup.md
    └── prompt-engineering-notes.md
```

### Data Flow

1. **Problem Input**: User uploads image or types text → Image processed via Vision API → Problem text extracted
2. **Socratic Dialogue**: Problem text → LLM with Socratic prompt → Guiding question → User response → Context updated
3. **Math Rendering**: Mathematical expressions → LaTeX parser → KaTeX renderer → Displayed in UI
4. **Context Management**: Each turn → Context stored → Previous turns retrieved → Full conversation context maintained

---

## Phase Breakdown

### Phase 1: MVP (Due Tuesday, November 4, 2025)

**Objective**: Basic chat with LLM integration and Socratic prompting working

#### Phase 1.1: Project Setup & Foundation (90 minutes)

**Task 1.1.1**: Initialize React + TypeScript project
- Duration: 20 minutes
- Create `ai-math-tutor/` directory
- Initialize React app: `npm create vite@latest frontend -- --template react-ts`
- Install dependencies: React, TypeScript, Tailwind CSS
- Verify setup: `npm run dev`
- PowerShell: `New-Item -ItemType Directory -Path ai-math-tutor; Set-Location ai-math-tutor; npm create vite@latest frontend -- --template react-ts`

**Task 1.1.2**: Setup backend with Express
- Duration: 20 minutes
- Create `backend/` directory
- Initialize Node.js: `npm init -y`
- Install: Express, TypeScript, tsx, OpenAI SDK
- Create `server.ts` with basic Express setup
- Add TypeScript config: `tsconfig.json`
- PowerShell: `New-Item -ItemType Directory -Path backend; Set-Location backend; npm init -y; npm install express typescript tsx @types/express @types/node`

**Task 1.1.3**: Configure environment variables
- Duration: 15 minutes
- Create `.env` files (frontend and backend)
- Add: `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`
- Add `.env.example` with placeholders
- Create `.gitignore` with `.env` entries
- Document setup in README

**Task 1.1.4**: Setup testing framework
- Duration: 20 minutes
- Install Vitest: `npm install -D vitest @testing-library/react`
- Create `tests/` directory structure
- Create sample test to verify setup
- Run: `npm test` to verify working

**Task 1.1.5**: Create project structure
- Duration: 15 minutes
- Create directory structure (components, services, hooks)
- Create placeholder files for main components
- Add basic README with setup instructions

#### Phase 1.2: Basic Chat UI (120 minutes)

**Task 1.2.1**: Create chat interface component
- Duration: 45 minutes
- Create `frontend/src/components/Chat.tsx`
- Basic chat UI with:
  - Message input area
  - Send button
  - Message list area
  - Simple styling with Tailwind
- Add state management for messages

**Task 1.2.2**: Create message bubble component
- Duration: 30 minutes
- Create `frontend/src/components/MessageBubble.tsx`
- Display: User messages (right-aligned), Tutor messages (left-aligned)
- Add basic styling and animations
- Show timestamps

**Task 1.2.3**: Create chat hook for state management
- Duration: 30 minutes
- Create `frontend/src/hooks/useChat.ts`
- Manage: Messages array, current input, loading state
- Functions: `sendMessage()`, `addMessage()`, `clearChat()`
- Return: Messages, loading, sendMessage function

**Task 1.2.4**: Create API client
- Duration: 15 minutes
- Create `frontend/src/services/api.ts`
- Function: `sendMessage(message: string) => Promise<string>`
- POST to `/api/chat` endpoint
- Handle errors and loading states

#### Phase 1.3: Backend API - Chat Endpoint (120 minutes)

**Task 1.3.1**: Create Express server with chat endpoint
- Duration: 30 minutes
- Create `backend/server.ts`
- Setup Express with CORS middleware
- Create `/api/chat` POST endpoint
- Receive: `{ message: string, conversationHistory?: Message[] }`
- Return: `{ response: string }`

**Task 1.3.2**: Integrate OpenAI SDK
- Duration: 30 minutes
- Create `backend/services/llm.ts`
- Setup OpenAI client with API key
- Function: `generateResponse(messages: Message[]) => Promise<string>`
- Call `openai.chat.completions.create()` with messages
- Return assistant message

**Task 1.3.3**: Create Socratic prompt template
- Duration: 30 minutes
- Create `backend/prompts/socratic.ts`
- System prompt: "You are a patient math tutor. NEVER give direct answers. Guide through questions: 'What information do we have?' 'What method might help?' If stuck >2 turns, provide concrete hint. Use encouraging language."
- Format: System message + conversation history
- Add prompt validation

**Task 1.3.4**: Implement Socratic logic
- Duration: 30 minutes
- Create `backend/services/socratic.ts`
- Function: `buildPrompt(conversationHistory: Message[]) => Message[]`
- Logic:
  - If first message: Parse problem → Inventory knowns → Identify goal
  - If subsequent: Guide method selection → Step through solution → Validate answer
- Add validation for Socratic method (no direct answers)

#### Phase 1.4: Image Upload & OCR/Vision LLM (150 minutes)

**Task 1.4.1**: Create image upload component
- Duration: 45 minutes
- Create `frontend/src/components/ImageUpload.tsx`
- Use React Dropzone or similar
- Features: Drag & drop, click to upload, preview image
- Accept: PNG, JPG, JPEG formats
- Display upload progress

**Task 1.4.2**: Create image upload API endpoint
- Duration: 30 minutes
- Create `/api/image-upload` POST endpoint
- Use Multer or similar for file handling
- Save uploaded image temporarily
- Return: Image URL or base64 data

**Task 1.4.3**: Integrate Vision API for OCR
- Duration: 45 minutes
- Create `backend/services/imageProcessor.ts`
- Function: `extractTextFromImage(imagePath: string) => Promise<string>`
- Option A: OpenAI Vision API:
  - Use `openai.chat.completions.create()` with vision model
  - Prompt: "Extract all mathematical expressions and text from this image. Return the problem statement."
  - Parse response for problem text
- Option B: Tesseract.js (local OCR):
  - Install Tesseract.js
  - Process image locally
  - Extract text (less accurate for math)

**Task 1.4.4**: Integrate image upload into chat flow
- Duration: 30 minutes
- Modify chat UI to include image upload
- When image uploaded: Extract text → Send to LLM as first message
- Handle: Image processing → Text extraction → Problem parsing → Chat start
- Add loading state for image processing

#### Phase 1.5: Conversation Context Management (90 minutes)

**Task 1.5.1**: Implement context manager
- Duration: 45 minutes
- Create `backend/services/contextManager.ts`
- Function: `buildContext(userId: string, conversationId: string) => Message[]`
- Store: Messages in-memory (Map<conversationId, Message[]>)
- Or: Use SQLite for persistence
- Retrieve: Full conversation history for context

**Task 1.5.2**: Add context to chat endpoint
- Duration: 30 minutes
- Modify `/api/chat` endpoint to accept `conversationId`
- Retrieve conversation history from context manager
- Pass full history to LLM (last 10-20 messages for token efficiency)
- Update context after each message

**Task 1.5.3**: Test context management
- Duration: 15 minutes
- Test: Multi-turn conversation maintains context
- Test: LLM references previous messages
- Test: Context persists across API calls
- Verify: Conversation history is accurate

#### Phase 1.6: Basic Testing & Validation (90 minutes)

**Task 1.6.1**: Write unit tests for chat logic
- Duration: 45 minutes
- Test: Message sending and receiving
- Test: Context management (add/retrieve messages)
- Test: Socratic prompt building
- Test: Image text extraction (mock)
- Run: `npm test` to verify

**Task 1.6.2**: Test with hardcoded problems
- Duration: 30 minutes
- Test problems:
  1. Simple arithmetic: "2x + 5 = 13"
  2. Algebra: "x² + 5x + 6 = 0"
  3. Geometry: "Find the area of a circle with radius 5"
  4. Word problem: "A train travels 60 mph for 3 hours..."
  5. Multi-step: "Solve for x: 2x + 3 = 4x - 1"
- Verify: Socratic method works (no direct answers)
- Verify: Context maintained across turns

**Task 1.6.3**: Integrated Unit Testing for Phase 1
- Duration: 15 minutes
- Run full test suite: `npm test`
- Verify: All unit tests pass
- Verify: Chat flow works end-to-end
- Document any failing tests

#### Phase 1.7: MVP Demo Video Preparation (45 minutes)

**Task 1.7.1**: Create 3-minute demo video script
- Duration: 20 minutes
- Script should cover:
  - Introduction (10s): "AI Math Tutor MVP - Socratic learning assistant"
  - Problem Input (30s): Show text input and image upload, demonstrate OCR
  - Socratic Dialogue (60s): Show multi-turn conversation, demonstrate guiding questions (no direct answers)
  - Context Management (30s): Show how tutor references previous messages
  - Conclusion (10s): "MVP demonstrates core Socratic method with image parsing and context management"

**Task 1.7.2**: Create cue card with narration and highlights
- Duration: 15 minutes
- Include narration for each section
- Bullet points for key UI elements/features
- Visual cues for chat interface
- Timing markers for 3-minute target

---

### Phase 2: Early Submission (Due Friday, November 7, 2025)

**Objective**: Add math rendering, conversation history, UI polish

#### Phase 2.1: Math Rendering with LaTeX/KaTeX (120 minutes)

**Task 2.1.1**: Install and configure KaTeX
- Duration: 20 minutes
- Install: `npm install katex react-katex`
- Add KaTeX CSS to main CSS file
- Create `frontend/src/components/MathRenderer.tsx`
- Function: `renderMath(text: string) => JSX.Element`
- Support: Inline math `$...$` and display math `$$...$$`

**Task 2.1.2**: Parse mathematical expressions from messages
- Duration: 45 minutes
- Create `frontend/src/services/mathParser.ts`
- Function: `parseMath(text: string) => string`
- Extract: LaTeX expressions from text
- Handle: Inline math and display math
- Preserve: Non-math text

**Task 2.1.3**: Integrate math rendering into message bubbles
- Duration: 35 minutes
- Modify `MessageBubble.tsx` to render math
- Parse message text for math expressions
- Render math with KaTeX component
- Handle: Error cases (invalid LaTeX)
- Style: Math expressions appropriately

**Task 2.1.4**: Test math rendering
- Duration: 20 minutes
- Test: Simple equations (`x + 5 = 13`)
- Test: Complex equations (`x² + 5x + 6 = 0`)
- Test: Fractions, exponents, integrals
- Test: Mixed text and math
- Verify: All expressions render correctly

#### Phase 2.2: Conversation History (90 minutes)

**Task 2.2.1**: Create conversation history UI
- Duration: 45 minutes
- Create `frontend/src/components/ConversationHistory.tsx`
- Display: List of past conversations
- Features:
  - Conversation titles (first problem statement)
  - Timestamp
  - Click to load conversation
  - Delete conversation
- Sidebar or dropdown menu

**Task 2.2.2**: Persist conversations in backend
- Duration: 30 minutes
- Create SQLite database for conversations
- Schema: `conversations(id, userId, title, createdAt)`, `messages(conversationId, role, content, timestamp)`
- Store: Full conversation history
- Retrieve: Conversations by user

**Task 2.2.3**: Load conversation from history
- Duration: 15 minutes
- Add API endpoint: `GET /api/conversations/:id`
- Load conversation messages into chat
- Update context manager with loaded conversation
- Test: Loading conversation works correctly

#### Phase 2.3: UI Polish & Enhancements (120 minutes)

**Task 2.3.1**: Improve chat UI design
- Duration: 45 minutes
- Enhance: Message bubble styling
- Add: Typing indicator
- Add: Loading states for LLM responses
- Add: Smooth scroll to latest message
- Add: Dark mode (optional)

**Task 2.3.2**: Add error handling and user feedback
- Duration: 30 minutes
- Display: Error messages for failed API calls
- Add: Retry button for failed requests
- Show: Network errors clearly
- Add: Input validation (empty messages, file size limits)

**Task 2.3.3**: Optimize image upload UX
- Duration: 30 minutes
- Add: Image preview before upload
- Add: Image compression (if needed)
- Add: Progress bar for upload
- Add: Error handling for unsupported formats
- Add: Maximum file size validation

**Task 2.3.4**: Add keyboard shortcuts
- Duration: 15 minutes
- Add: Enter to send message
- Add: Shift+Enter for new line
- Add: Escape to clear input
- Test: Keyboard shortcuts work correctly

#### Phase 2.4: Enhanced Testing (90 minutes)

**Task 2.4.1**: Test math rendering with various problems
- Duration: 30 minutes
- Test: 5+ problem types (arithmetic, algebra, geometry, word problems, multi-step)
- Verify: All math expressions render correctly
- Verify: LaTeX syntax is handled properly
- Document: Any rendering issues

**Task 2.4.2**: Test conversation history
- Duration: 30 minutes
- Test: Saving conversations
- Test: Loading conversations
- Test: Deleting conversations
- Test: Multiple conversations per user
- Verify: Context maintained when loading

**Task 2.4.3**: Integration tests for full flow
- Duration: 30 minutes
- Test: Upload image → Extract text → Start chat → Socratic dialogue → Math rendering
- Test: Load conversation → Continue chat → Context maintained
- Test: Error scenarios (API failures, invalid images)
- Verify: All features work together

**Task 2.4.4**: Integrated Unit Testing for Phase 2
- Duration: 15 minutes
- Run full test suite: `npm test`
- Verify: All Phase 1 + Phase 2 tests pass
- Document: Any edge cases

#### Phase 2.5: Early Submission Demo Video Preparation (45 minutes)

**Task 2.5.1**: Create 3-minute demo video script
- Duration: 20 minutes
- Script should cover:
  - Introduction (10s): "AI Math Tutor Early Submission - now with math rendering and history"
  - Problem Input (25s): Show text input and image upload, demonstrate OCR
  - Socratic Dialogue (50s): Show multi-turn conversation, demonstrate guiding questions, show math rendering
  - Conversation History (30s): Show past conversations, load conversation, continue dialogue
  - UI Polish (25s): Show improved UI, error handling, keyboard shortcuts
  - Conclusion (10s): "Demonstrates complete Socratic learning experience with math rendering"

**Task 2.5.2**: Create cue card with narration and highlights
- Duration: 15 minutes
- Include narration for each section
- Bullet points for key UI elements/features
- Visual cues for improved interface
- Timing markers for 3-minute target

---

### Phase 3: Final Submission (Due Sunday, November 9, 2025)

**Objective**: Comprehensive testing, documentation, optional stretch features

#### Phase 3.1: Comprehensive Testing (120 minutes)

**Task 3.1.1**: Test all 5+ problem types
- Duration: 60 minutes
- Test problems:
  1. Simple arithmetic: "2x + 5 = 13"
  2. Algebra: "x² + 5x + 6 = 0"
  3. Geometry: "Find the area of a circle with radius 5"
  4. Word problems: "A train travels 60 mph for 3 hours..."
  5. Multi-step: "Solve for x: 2x + 3 = 4x - 1"
  6. Fractions: "1/2 + 1/3 = ?"
  7. Exponents: "2³ × 2² = ?"
- Verify: Socratic method works for all types
- Verify: No direct answers given
- Verify: Context maintained across turns

**Task 3.1.2**: Test edge cases and error scenarios
- Duration: 45 minutes
- Test: Invalid image formats
- Test: Very large images
- Test: Blurry images (OCR failure)
- Test: No text in image
- Test: Network errors
- Test: LLM API errors
- Test: Empty messages
- Test: Very long conversations (>20 turns)

**Task 3.1.3**: Integrated Unit Testing for Phase 3
- Duration: 15 minutes
- Run complete test suite: `npm test`
- Verify: All tests pass
- Check: Test coverage (aim for >80%)
- Document: Test results summary

#### Phase 3.2: Optional Stretch Features (180 minutes)

**Task 3.2.1**: Interactive Whiteboard (Optional - High Value)
- Duration: 90 minutes
- Install: react-sketch-canvas or similar
- Create: `Whiteboard.tsx` component
- Features:
  - Draw diagrams and equations
  - Share with tutor
  - Tutor can draw explanations
- Integrate: Into chat flow
- Test: Whiteboard functionality

**Task 3.2.2**: Step Visualization (Optional - High Value)
- Duration: 60 minutes
- Create: `StepVisualization.tsx` component
- Display: Solution steps animated or sequentially
- Parse: LLM response for steps
- Render: Each step with math rendering
- Test: Step visualization works

**Task 3.2.3**: Voice Interface (Optional - High Value)
- Duration: 30 minutes
- Add: Text-to-speech for tutor responses
- Add: Speech-to-text for student input
- Use: Web Speech API
- Test: Voice interface works

#### Phase 3.3: Documentation (120 minutes)

**Task 3.3.1**: Write technical writeup
- Duration: 45 minutes
- Sections:
  - System Overview
  - Architecture Decisions
  - LLM Integration (OpenAI/Anthropic)
  - Socratic Method Implementation
  - Image Processing & OCR
  - Math Rendering (KaTeX)
  - Context Management
  - Known Limitations
  - Future Improvements

**Task 3.3.2**: Write prompt engineering notes
- Duration: 30 minutes
- Document: Socratic prompt design
- Document: Prompt iterations and improvements
- Document: Techniques for preventing direct answers
- Document: Context management strategies
- Include: Example prompts and responses

**Task 3.3.3**: Update README with complete setup
- Duration: 30 minutes
- Prerequisites (Node.js, npm, API keys)
- Installation steps
- Environment setup
- Running locally
- Testing instructions
- Deployment instructions (if applicable)
- Troubleshooting section

**Task 3.3.4**: Document 5+ example problem walkthroughs
- Duration: 15 minutes
- Document: 5+ complete problem walkthroughs
- Include: Problem statement, conversation flow, final answer
- Show: Socratic method in action
- Show: Context maintained across turns

**Task 3.3.5**: Document AI tools and prompts used
- Duration: 15 minutes
- List: AI tools used (Cursor, Copilot, etc.)
- Document: Key prompts that generated code
- Acknowledge: AI assistance in README

#### Phase 3.4: Code Evaluation, Refactoring & Security Assessment (90 minutes)

**Task 3.4.1**: Code evaluation and refactoring
- Duration: 45 minutes
- Review: All React/TypeScript code for best practices
- Review: Backend API code for best practices
- Refactor: Duplicate code, improve naming conventions
- Refactor: Improve code organization and structure
- Refactor: Enhance error handling and validation
- Verify: Code follows React and TypeScript best practices
- Review: LLM integration code for efficiency
- Optimize: API calls and context management

**Task 3.4.2**: Security assessment
- Duration: 45 minutes
- Assess: API key security (never expose in frontend)
- Check: Input validation (image uploads, user messages)
- Check: Image processing security (file size limits, type validation)
- Review: LLM API usage (rate limiting, error handling)
- Review: Session management and context storage
- Check: CORS configuration (if applicable)
- Document: Security findings and mitigations
- Verify: No sensitive data in client-side code

#### Phase 3.5: Final Polish (90 minutes)

**Task 3.5.1**: Code cleanup and linting
- Duration: 30 minutes
- Run linter: `npm run lint`
- Fix all linting errors
- Format code: `npm run format`
- Remove: Debug code and console.logs
- Add: JSDoc comments to all functions

**Task 3.5.2**: Performance optimization
- Duration: 30 minutes
- Optimize: Image upload (compression if needed)
- Optimize: Math rendering (cache if possible)
- Optimize: Context management (limit history length)
- Profile: API response times
- Optimize: Re-renders in React

**Task 3.5.3**: Final verification checklist
- Duration: 30 minutes
- ✅ All 5+ problem types tested
- ✅ Socratic method works (no direct answers)
- ✅ Context maintained across turns
- ✅ Math rendering works correctly
- ✅ Image upload and OCR working
- ✅ Conversation history working
- ✅ README complete and accurate
- ✅ Documentation complete
- ✅ Tests passing
- ✅ No API keys in code or commits

#### Phase 3.5: Final Submission Demo Video Preparation (45 minutes)

**Task 3.5.1**: Create 3-minute demo video script
- Duration: 20 minutes
- Script should cover:
  - Introduction (10s): "AI Math Tutor - Complete Socratic learning assistant"
  - System Overview (15s): Architecture, key features
  - Problem Input (25s): Text input and image upload, OCR demonstration
  - Socratic Dialogue (60s): Multi-turn conversation, guiding questions, math rendering, no direct answers
  - Conversation History (20s): Past conversations, loading and continuing
  - Stretch Features (20s): Whiteboard/step visualization/voice (if built)
  - Conclusion (10s): "Complete Socratic learning experience with comprehensive features"

**Task 3.5.2**: Create cue card with narration and highlights
- Duration: 15 minutes
- Final polished version with all features
- Include visual demonstrations of all features
- Highlight key technical achievements
- Show Socratic method in action

#### Phase 3.6: Integrated Unit Testing for Phase 3
- Duration: 15 minutes
- Run complete test suite: `npm test`
- Verify: All tests pass (100% of required scenarios)
- Check: Test coverage (aim for >80%)
- Document: Final test results summary

---

## Success Criteria

### MVP (Phase 1) - November 4
- ✅ Problem input working (text + image upload)
- ✅ OCR/Vision LLM parsing working
- ✅ Basic chat UI functional
- ✅ LLM integration with Socratic prompting
- ✅ Socratic method working (no direct answers)
- ✅ Context management working
- ✅ Multi-turn conversations functional
- ✅ Unit tests for core functions passing

### Early Submission (Phase 2) - November 7
- ✅ Math rendering with LaTeX/KaTeX working
- ✅ Conversation history implemented
- ✅ UI polish and enhancements complete
- ✅ Integration tests passing
- ✅ Tested on 5+ problem types

### Final Submission (Phase 3) - November 9
- ✅ Comprehensive testing (5+ problem types)
- ✅ Edge cases handled gracefully
- ✅ Documentation complete (technical writeup, prompt notes, README, walkthroughs)
- ✅ Optional stretch features implemented (if time permits)
- ✅ Code clean, linted, and documented
- ✅ All tests passing

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| LLM gives direct answers | High | Strict Socratic prompt, validation in code, test thoroughly |
| OCR fails on images | Medium | Fallback to text input, clear error messages, test with various images |
| Context too long for LLM | Medium | Limit conversation history (last 10-20 messages), summarize if needed |
| API costs too high | Medium | Cache responses if possible, use cheaper models for iteration |
| Math rendering errors | Low | Validate LaTeX syntax, handle errors gracefully |
| Time constraints | High | MVP is safety net, stretch features are optional, prioritize core Socratic method |

---

## Deliverables Checklist

### Code Repository
- [ ] GitHub repository with clean structure
- [ ] Frontend code in `frontend/` directory
- [ ] Backend code in `backend/` directory
- [ ] All tests in `tests/` directory
- [ ] README.md with setup instructions
- [ ] .env.example with required variables
- [ ] .gitignore configured properly

### Documentation
- [ ] Technical writeup (1-2 pages)
- [ ] Prompt engineering notes
- [ ] README with complete setup and usage
- [ ] 5+ example problem walkthroughs
- [ ] AI tools and prompts documentation

### Testing
- [ ] Unit tests for chat logic
- [ ] Integration tests for full flow
- [ ] Tests for 5+ problem types
- [ ] Edge case tests

### Demo
- [ ] Demo video (3 minutes)
- [ ] Demo video script
- [ ] Demo video cue card
- [ ] Deployed app or local setup instructions

---

## Notes

- **Socratic Method**: NEVER give direct answers. Guide through questions only.
- **Context Management**: Maintain full conversation history for proper context.
- **Math Rendering**: Use KaTeX for accurate math display.
- **Image Processing**: Use Vision API for best OCR results (or Tesseract.js for local).
- **Testing**: Test with diverse problem types to ensure Socratic method works.

---

**Document Version**: 1.1  
**Created**: October 31, 2025  
**Last Updated**: November 3, 2025  
**Project Start Date**: November 3, 2025  
**Framework**: Based on October 16, 2025 success path methodology

