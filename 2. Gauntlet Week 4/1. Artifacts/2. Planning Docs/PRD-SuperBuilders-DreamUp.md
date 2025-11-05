# Product Requirements Document: DreamUp Browser Game QA Pipeline

**Version:** 1.1  
**Date:** November 3, 2025  
**Project Duration:** 7 Days (Nov 3 - Nov 9, 2025)  
**Project Start:** November 3, 2025  
**Framework:** Based on October 16, 2025 success path methodology  
**Target:** Autonomous AI Agent for Browser Game Testing

---

## Executive Summary

DreamUp Browser Game QA Pipeline is an AI agent that autonomously tests browser games by simulating user interactions, capturing visual evidence, and evaluating playability metrics. The system works with any web-hosted game URL and generates structured reports with playability assessments.

**Key Deliverables:**
- ✅ Browser Automation Agent (load game, detect UI, interact)
- ✅ Evidence Capture (screenshots, console logs)
- ✅ AI Evaluation (LLM analysis of evidence)
- ✅ Execution Interface (TypeScript file or CLI)
- ✅ Structured Output (JSON with status, playability_score, issues)

**Success Targets:**
- **MVP (Nov 4)**: Basic agent loads games, takes screenshots, generates basic reports
- **Early Submission (Nov 7)**: + Interaction system, AI evaluation, structured output
- **Final Submission (Nov 9)**: + Comprehensive testing, error handling, documentation

---

## Project Timeline

| Milestone | Date | Deliverable |
|-----------|------|-------------|
| **Phase 1: MVP** | Tuesday, November 4, 2025 | Browser automation working, screenshots captured, basic report generation |
| **Early Submission** | Friday, November 7, 2025 | + Interaction system, AI evaluation, structured JSON output |
| **Final Submission** | Sunday, November 9, 2025 | + Error handling, comprehensive testing, documentation |

---

## Technology Stack

### Core Stack
- **Language**: TypeScript (required per assignment)
- **Runtime**: Node.js with `bun run qa.ts` or `npx tsx qa.ts`
- **Browser Automation**: Browserbase with Stagehand (recommended) or Puppeteer/Playwright
- **AI Framework**: Vercel AI SDK (recommended) or OpenAI SDK directly
- **LLM**: OpenAI GPT-4 Vision or Anthropic Claude with vision

### Browser Automation Options
- **Option A (Recommended)**: Browserbase + Stagehand
  - Browserbase: Cloud browser infrastructure
  - Stagehand: High-level automation library
  - Free tier: 1 browser-hour included
- **Option B**: Puppeteer (local)
  - Full browser control
  - Requires Chrome/Chromium installed
- **Option C**: Playwright
  - Cross-browser support
  - Better reliability than Puppeteer

### Development Tools
- **Package Manager**: npm or bun
- **Build Tool**: TypeScript compiler (tsc) or tsx
- **Testing**: Vitest or Jest
- **Linting**: ESLint + Prettier
- **File Handling**: fs-extra for file operations

---

## Architecture Overview

### System Components

```
dreamup-qa/
├── src/
│   ├── agent/
│   │   ├── browserAgent.ts         # Main browser automation agent
│   │   ├── interaction.ts           # Game interaction logic
│   │   └── monitoring.ts           # Crash/freeze detection
│   ├── capture/
│   │   ├── screenshots.ts          # Screenshot capture
│   │   ├── console.ts              # Console log capture
│   │   └── artifacts.ts            # Artifact management
│   ├── evaluation/
│   │   ├── llmEvaluator.ts         # LLM evaluation service
│   │   ├── prompts.ts               # Evaluation prompts
│   │   └── scoring.ts               # Playability scoring
│   ├── output/
│   │   ├── reportGenerator.ts      # JSON report generation
│   │   └── formatters.ts           # Output formatting
│   └── qa.ts                        # Main entry point
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── test-games/                      # Sample games for testing
│   └── urls.json                    # Test game URLs
└── docs/
    ├── technical-writeup.md
    └── decision-log.md
```

### Agent Flow

1. **Initialize**: Connect to browser (Browserbase or local)
2. **Load Game**: Navigate to game URL, wait for load
3. **Observe**: Capture baseline screenshot, wait for render
4. **Interact**: Find UI elements, click buttons, simulate gameplay
5. **Monitor**: Detect crashes, freezes, errors via console and screenshots
6. **Evaluate**: Submit evidence to LLM for assessment
7. **Report**: Generate structured JSON output

---

## Phase Breakdown

### Phase 1: MVP (Due Tuesday, November 4, 2025)

**Objective**: Basic browser automation and evidence capture working

#### Phase 1.1: Project Setup & Foundation (90 minutes)

**Task 1.1.1**: Initialize TypeScript project
- Duration: 20 minutes
- Create `dreamup-qa/` directory
- Initialize npm: `npm init -y`
- Install TypeScript: `npm install -D typescript @types/node`
- Install tsx: `npm install -D tsx` (for `npx tsx qa.ts`)
- Create `tsconfig.json` with proper settings
- PowerShell: `New-Item -ItemType Directory -Path dreamup-qa; Set-Location dreamup-qa; npm init -y`

**Task 1.1.2**: Setup Browserbase account and API key
- Duration: 15 minutes
- Sign up for Browserbase (free tier)
- Get API key from dashboard
- Create `.env` file with `BROWSERBASE_API_KEY`
- Add `.env.example` with placeholders
- Create `.gitignore` with `.env` entries

**Task 1.1.3**: Install browser automation libraries
- Duration: 20 minutes
- Install Browserbase SDK: `npm install @browserbasehq/sdk`
- Install Stagehand: `npm install @browserbasehq/stagehand`
- Install OpenAI SDK (for evaluation): `npm install openai`
- Install Vercel AI SDK (optional): `npm install ai`
- Verify installations: `npm list`

**Task 1.1.4**: Create project structure
- Duration: 20 minutes
- Create directory structure (agent/, capture/, evaluation/, output/)
- Create placeholder files for main modules
- Create `src/qa.ts` as main entry point
- Create basic README with setup instructions

**Task 1.1.5**: Setup testing framework
- Duration: 15 minutes
- Install Vitest: `npm install -D vitest @types/node`
- Create `tests/` directory structure
- Create sample test to verify setup
- Add test script to `package.json`: `"test": "vitest"`

#### Phase 1.2: Browser Automation - Basic Agent (150 minutes)

**Task 1.2.1**: Connect to Browserbase
- Duration: 30 minutes
- Create `src/agent/browserAgent.ts`
- Function: `createBrowserSession() => Promise<Browser>`
- Initialize Browserbase client with API key
- Create browser session
- Return browser instance
- Test: Connection works

**Task 1.2.2**: Load game URL
- Duration: 30 minutes
- Function: `loadGame(browser: Browser, url: string) => Promise<Page>`
- Navigate to game URL
- Wait for page load (waitForLoadState or timeout)
- Wait for initial render (wait for specific element or timeout)
- Handle: Load failures, timeouts
- Return: Page object

**Task 1.2.3**: Wait for initial render
- Duration: 30 minutes
- Function: `waitForRender(page: Page, timeout: number) => Promise<void>`
- Wait for: DOMContentLoaded, page load
- Wait for: Game canvas or main container element
- Timeout: 30 seconds max
- Retry: Up to 3 times if initial load fails
- Handle: Network errors, slow loads

**Task 1.2.4**: Basic error detection
- Duration: 30 minutes
- Function: `detectErrors(page: Page) => Promise<Error[]>`
- Listen for: Console errors
- Listen for: Network errors
- Detect: Page crashes (page closed unexpectedly)
- Return: Array of error messages
- Store: Errors for evaluation

**Task 1.2.5**: Test basic agent flow
- Duration: 30 minutes
- Create test game URL (e.g., simple HTML5 game from itch.io)
- Test: Load game → Wait for render → Detect errors
- Verify: All steps work correctly
- Document: Any issues encountered

#### Phase 1.3: Evidence Capture - Screenshots (120 minutes)

**Task 1.3.1**: Capture baseline screenshot
- Duration: 30 minutes
- Create `src/capture/screenshots.ts`
- Function: `captureScreenshot(page: Page, timestamp: number) => Promise<string>`
- Capture: Full page screenshot
- Save: To `artifacts/screenshots/` directory
- Filename: `screenshot-{timestamp}.png`
- Return: File path
- Use: Playwright's `screenshot()` or Puppeteer's `screenshot()`

**Task 1.3.2**: Capture multiple screenshots during session
- Duration: 45 minutes
- Function: `captureSessionScreenshots(page: Page, count: number) => Promise<string[]>`
- Capture: 3-5 screenshots at key moments
  - After initial load
  - After first interaction
  - During gameplay
  - After navigation (if applicable)
  - Final state
- Timestamp: Each screenshot
- Store: All screenshot paths

**Task 1.3.3**: Create artifacts directory structure
- Duration: 15 minutes
- Create `src/capture/artifacts.ts`
- Function: `setupArtifactsDirectory(gameUrl: string) => Promise<string>`
- Create: `artifacts/{game-id}/` directory
- Subdirectories: `screenshots/`, `console-logs/`, `reports/`
- Return: Base artifacts path
- Clean: Old artifacts before new run (optional)

**Task 1.3.4**: Test screenshot capture
- Duration: 30 minutes
- Test: Screenshot capture on test game
- Verify: Screenshots saved correctly
- Verify: Timestamps accurate
- Verify: Multiple screenshots captured
- Check: Image quality and size

#### Phase 1.4: Evidence Capture - Console Logs (90 minutes)

**Task 1.4.1**: Capture console logs
- Duration: 45 minutes
- Create `src/capture/console.ts`
- Function: `captureConsoleLogs(page: Page) => Promise<string[]>`
- Listen for: Console messages (log, error, warn, info)
- Capture: All console output during session
- Store: Logs in `artifacts/{game-id}/console-logs/`
- Format: JSON or text file with timestamps
- Include: Error stack traces

**Task 1.4.2**: Filter and format console logs
- Duration: 30 minutes
- Function: `formatConsoleLogs(logs: ConsoleMessage[]) => string`
- Filter: Relevant errors and warnings
- Format: Human-readable or JSON
- Include: Timestamp, level, message, stack (if error)
- Save: To file

**Task 1.4.3**: Test console log capture
- Duration: 15 minutes
- Test: Console log capture on test game
- Verify: Logs captured correctly
- Verify: Errors detected
- Verify: Logs saved to file

#### Phase 1.5: Basic Report Generation (90 minutes)

**Task 1.5.1**: Create basic report structure
- Duration: 30 minutes
- Create `src/output/reportGenerator.ts`
- Define: Report interface
  ```typescript
  interface QAReport {
    status: 'pass' | 'fail' | 'partial';
    playability_score?: number;
    issues: string[];
    screenshots: string[];
    timestamp: string;
  }
  ```

**Task 1.5.2**: Generate basic JSON report
- Duration: 30 minutes
- Function: `generateReport(evidence: Evidence) => QAReport`
- Input: Screenshots, console logs, errors
- Output: Basic report with:
  - Status (based on errors detected)
  - Issues (from console errors)
  - Screenshot paths
  - Timestamp
- Save: To `artifacts/{game-id}/report.json`

**Task 1.5.3**: Create main entry point (qa.ts)
- Duration: 30 minutes
- Create `src/qa.ts` as main entry point
- Function: `main(gameUrl: string) => Promise<void>`
- Flow:
  1. Setup artifacts directory
  2. Create browser session
  3. Load game
  4. Capture screenshots
  5. Capture console logs
  6. Generate report
  7. Save report
- CLI: Accept URL as argument: `npx tsx qa.ts <game-url>`
- PowerShell: `npx tsx src/qa.ts "https://example.com/game"`

#### Phase 1.6: Basic Testing & Validation (90 minutes)

**Task 1.6.1**: Test with simple game
- Duration: 30 minutes
- Find: Simple HTML5 game (e.g., tic-tac-toe from itch.io)
- Test: Full flow (load → screenshot → console → report)
- Verify: Report generated correctly
- Verify: Screenshots captured
- Verify: Console logs captured

**Task 1.6.2**: Test error scenarios
- Duration: 30 minutes
- Test: Invalid URL (should handle gracefully)
- Test: Non-existent game (should detect load failure)
- Test: Slow-loading game (should timeout appropriately)
- Test: Game with errors (should capture in report)
- Verify: Error handling works correctly

**Task 1.6.3**: Integrated Unit Testing for Phase 1
- Duration: 30 minutes
- Write unit tests for:
  - Browser connection
  - Screenshot capture
  - Console log capture
  - Report generation
- Run: `npm test` to verify
- Document: Any failing tests

#### Phase 1.7: MVP Demo Video Preparation (45 minutes)

**Task 1.7.1**: Create 3-minute demo video script
- Duration: 20 minutes
- Script should cover:
  - Introduction (10s): "DreamUp QA Pipeline MVP - autonomous browser game testing"
  - Setup (20s): Show project structure, Browserbase setup
  - Game Loading (40s): Load game URL, wait for render, capture baseline screenshot
  - Evidence Capture (50s): Show multiple screenshots captured, console logs captured
  - Report Generation (30s): Show JSON report with status, issues, screenshots
  - Conclusion (10s): "MVP demonstrates basic automation, evidence capture, and reporting"

**Task 1.7.2**: Create cue card with narration and highlights
- Duration: 15 minutes
- Include narration for each section
- Bullet points for key CLI outputs/features
- Visual cues for terminal commands
- Timing markers for 3-minute target

---

### Phase 2: Early Submission (Due Friday, November 7, 2025)

**Objective**: Add interaction system, AI evaluation, structured output

#### Phase 2.1: Game Interaction System (180 minutes)

**Task 2.1.1**: Detect common UI patterns
- Duration: 60 minutes
- Create `src/agent/interaction.ts`
- Function: `detectUIElements(page: Page) => Promise<UIElements>`
- Detect:
  - Start/Play buttons (text: "Start", "Play", "Begin")
  - Menus (navigation elements)
  - Game over screens (text: "Game Over", "You Win", "You Lose")
  - Controls (keyboard hints, button indicators)
- Use: Stagehand's element detection or Playwright's selectors
- Return: Detected elements

**Task 2.1.2**: Implement click interactions
- Duration: 45 minutes
- Function: `clickElement(page: Page, selector: string) => Promise<void>`
- Click: Start/Play buttons
- Click: Menu items
- Wait: For action to complete (waitForNavigation or timeout)
- Handle: Element not found, click failures
- Retry: Up to 3 times if click fails

**Task 2.1.3**: Implement keyboard interactions
- Duration: 45 minutes
- Function: `simulateGameplay(page: Page) => Promise<void>`
- Simulate: Arrow keys (movement)
- Simulate: Spacebar (jump/action)
- Simulate: Enter (confirm/select)
- Sequence: Execute action sequence (e.g., move → jump → move)
- Wait: Between actions for game to respond
- Duration: 5-10 seconds of gameplay simulation

**Task 2.1.4**: Navigate multiple screens/levels
- Duration: 30 minutes
- Function: `navigateScreens(page: Page) => Promise<void>`
- Logic: If game has multiple screens/levels, navigate through 2-3
- Detect: Level completion, screen transitions
- Capture: Screenshots at each screen
- Handle: Games with single screen (skip navigation)

#### Phase 2.2: Monitoring & Error Detection (120 minutes)

**Task 2.2.1**: Detect crashes and freezes
- Duration: 45 minutes
- Create `src/agent/monitoring.ts`
- Function: `monitorGameplay(page: Page) => Promise<MonitorResult>`
- Detect:
  - Crashes: Page closed unexpectedly, JavaScript errors
  - Freezes: No response to interactions, timeout
  - Rendering issues: Blank screens, distorted graphics
- Use: Screenshot comparison (compare consecutive screenshots)
- Use: Console error monitoring
- Return: Status (crashed, frozen, running)

**Task 2.2.2**: Implement timeout and retry logic
- Duration: 45 minutes
- Function: `executeWithTimeout<T>(fn: () => Promise<T>, timeout: number) => Promise<T>`
- Max execution time: 5 minutes per game
- Retry: Failed loads up to 3 times
- Timeout: Individual operations (load, interaction, screenshot)
- Handle: Timeout errors gracefully
- Return: Result or timeout error

**Task 2.2.3**: Enhanced error detection
- Duration: 30 minutes
- Detect: Network errors (failed resource loads)
- Detect: Rendering errors (WebGL errors, canvas issues)
- Detect: Performance issues (slow frame rate)
- Log: All errors with context
- Include: Errors in final report

#### Phase 2.3: AI Evaluation with LLM (150 minutes)

**Task 2.3.1**: Setup LLM evaluation service
- Duration: 45 minutes
- Create `src/evaluation/llmEvaluator.ts`
- Function: `evaluateEvidence(evidence: Evidence) => Promise<Evaluation>`
- Setup: OpenAI client or Vercel AI SDK
- Use: GPT-4 Vision or Claude with vision
- Input: Screenshots, console logs, errors
- Output: Structured evaluation

**Task 2.3.2**: Create evaluation prompts
- Duration: 45 minutes
- Create `src/evaluation/prompts.ts`
- Prompt template:
  ```
  "Analyze these screenshots and console logs from a browser game test.
  Assess:
  1. Does the game load successfully?
  2. Are controls responsive?
  3. Did the game complete without crashes?
  
  Provide: pass/fail status, confidence score (0-1), and issue descriptions."
  ```
- Include: Screenshots (base64 or URLs)
- Include: Console logs summary
- Format: Structured JSON response

**Task 2.3.3**: Implement playability scoring
- Duration: 30 minutes
- Create `src/evaluation/scoring.ts`
- Function: `calculatePlayabilityScore(evaluation: Evaluation) => number`
- Factors:
  - Successful load (0.3 weight)
  - Responsive controls (0.3 weight)
  - No crashes (0.4 weight)
- Score: 0-1 (0 = unplayable, 1 = fully playable)
- Return: Numeric score

**Task 2.3.4**: Test AI evaluation
- Duration: 30 minutes
- Test: Evaluation with known good game
- Test: Evaluation with broken game
- Verify: LLM provides accurate assessments
- Verify: Scores are reasonable
- Handle: LLM API errors gracefully

#### Phase 2.4: Structured Output (90 minutes)

**Task 2.4.1**: Enhance report structure
- Duration: 30 minutes
- Update report interface:
  ```typescript
  interface QAReport {
    status: 'pass' | 'fail' | 'partial';
    playability_score: number;
    issues: Issue[];
    screenshots: string[];
    timestamp: string;
    confidence?: number;
  }
  
  interface Issue {
    type: 'crash' | 'freeze' | 'error' | 'performance';
    description: string;
    severity: 'high' | 'medium' | 'low';
  }
  ```

**Task 2.4.2**: Generate comprehensive JSON report
- Duration: 30 minutes
- Function: `generateFullReport(evidence: Evidence, evaluation: Evaluation) => QAReport`
- Include:
  - Status (pass/fail/partial)
  - Playability score (0-1)
  - Issues array (detailed)
  - Screenshot paths
  - Timestamp
  - Confidence score (from LLM)
- Format: Pretty-printed JSON
- Save: To artifacts directory

**Task 2.4.3**: Create output formatters
- Duration: 30 minutes
- Create `src/output/formatters.ts`
- Function: `formatReport(report: QAReport) => string`
- Options: JSON (default), human-readable text
- Include: Summary at top, details below
- Add: Color coding for status (if terminal output)

#### Phase 2.5: Enhanced Testing (90 minutes)

**Task 2.5.1**: Test interaction system
- Duration: 30 minutes
- Test: UI element detection on various games
- Test: Click interactions work
- Test: Keyboard interactions work
- Test: Navigation through screens
- Verify: All interaction types work correctly

**Task 2.5.2**: Test AI evaluation
- Duration: 30 minutes
- Test: Evaluation on 3+ different game types
- Test: Playability scores are accurate
- Test: Issues detected correctly
- Test: Confidence scores reasonable
- Verify: LLM evaluation works consistently

**Task 2.5.3**: Integration test for full flow
- Duration: 30 minutes
- Test: Full end-to-end flow:
  - Load game → Interact → Monitor → Evaluate → Report
- Test: Multiple game types (puzzle, platformer, idle)
- Verify: Complete report generated
- Verify: All artifacts saved correctly

**Task 2.5.4**: Integrated Unit Testing for Phase 2
- Duration: 15 minutes
- Run full test suite: `npm test`
- Verify: All Phase 1 + Phase 2 tests pass
- Document: Any edge cases

#### Phase 2.6: Early Submission Demo Video Preparation (45 minutes)

**Task 2.6.1**: Create 3-minute demo video script
- Duration: 20 minutes
- Script should cover:
  - Introduction (10s): "DreamUp QA Pipeline Early Submission - now with AI evaluation"
  - Game Loading (25s): Load game, wait for render, detect UI elements
  - Interaction Demo (50s): Show click interactions, keyboard gameplay, navigation
  - Monitoring (30s): Show crash/freeze detection, error monitoring
  - AI Evaluation (40s): Show LLM analyzing evidence, generating playability score
  - Report Output (25s): Show structured JSON report with status, score, issues
  - Conclusion (10s): "Demonstrates complete autonomous game testing with AI evaluation"

**Task 2.6.2**: Create cue card with narration and highlights
- Duration: 15 minutes
- Include narration for each section
- Bullet points for key features/outputs
- Visual cues for terminal/CLI output
- Timing markers for 3-minute target

---

### Phase 3: Final Submission (Due Sunday, November 9, 2025)

**Objective**: Comprehensive testing, error handling, documentation

#### Phase 3.1: Test on Diverse Game Types (180 minutes)

**Task 3.1.1**: Test on 3-5 different game types
- Duration: 120 minutes
- Test games:
  1. Simple Puzzle (tic-tac-toe) - Basic click interactions
  2. Platformer (Mario clone) - Keyboard controls, physics
  3. Idle/Clicker - Minimal interaction, persistent state
  4. Broken Game (intentionally buggy) - Test failure detection
  5. Complex Game (RPG demo) - Multiple levels/screens
- Find games at: itch.io/games/html5
- Verify: Agent works with all types
- Document: Results for each game

**Task 3.1.2**: Generate test reports
- Duration: 30 minutes
- Run: QA agent on each test game
- Save: Reports to `test-results/` directory
- Include: Screenshots, console logs, JSON reports
- Analyze: Accuracy of playability assessments
- Target: 80%+ accuracy on playability assessment

**Task 3.1.3**: Document test results
- Duration: 30 minutes
- Create: Test results summary document
- Include: Game URLs, playability scores, issues found
- Compare: Agent assessment vs. manual assessment
- Identify: False positives/negatives
- Document: Known limitations

#### Phase 3.2: Error Handling & Robustness (120 minutes)

**Task 3.2.1**: Handle edge cases
- Duration: 60 minutes
- Handle: Games that don't load (timeout, network error)
- Handle: Games with no interactive elements
- Handle: Games that crash immediately
- Handle: Games with infinite loops
- Handle: Games that require user input (username, etc.)
- Add: Graceful error messages

**Task 3.2.2**: Implement graceful degradation
- Duration: 30 minutes
- If: Screenshot capture fails → Continue with console logs
- If: LLM evaluation fails → Fallback to rule-based evaluation
- If: Interaction fails → Report as "non-interactive"
- Always: Generate report (even if partial)

**Task 3.2.3**: Add retry and recovery logic
- Duration: 30 minutes
- Retry: Failed loads up to 3 times
- Retry: Failed interactions (different selectors)
- Retry: LLM API calls (with exponential backoff)
- Recovery: Continue testing even if one step fails
- Log: All retry attempts

#### Phase 3.3: Documentation (120 minutes)

**Task 3.3.1**: Write technical writeup
- Duration: 45 minutes
- Sections:
  - System Overview
  - Architecture Decisions
  - Browser Automation Approach (Browserbase vs. alternatives)
  - AI Evaluation Strategy
  - Interaction Detection Logic
  - Error Handling Strategy
  - Known Limitations
  - Future Improvements

**Task 3.3.2**: Update README
- Duration: 30 minutes
- Prerequisites (Node.js, Browserbase account, API keys)
- Installation steps
- Configuration (environment variables)
- Usage examples
- Test game URLs
- Troubleshooting section
- Example reports

**Task 3.3.3**: Create decision log
- Duration: 30 minutes
- Document key decisions:
  - Why Browserbase over Puppeteer
  - Why TypeScript over JavaScript
  - Why GPT-4 Vision over Claude
  - Why structured JSON output
  - Tradeoffs and alternatives considered

**Task 3.3.4**: Document AI tools and prompts
- Duration: 15 minutes
- List AI tools used
- Document key prompts
- Acknowledge AI assistance

#### Phase 3.4: Optional Stretch Features (120 minutes)

**Task 3.4.1**: GIF Recording (Optional)
- Duration: 60 minutes
- Install: gifshot or similar library
- Capture: Screenshot sequence during gameplay
- Generate: Animated GIF
- Include: In report output
- Test: GIF generation works

**Task 3.4.2**: Batch Testing (Optional)
- Duration: 30 minutes
- Function: `batchTest(urls: string[]) => Promise<Report[]>`
- Process: Multiple games sequentially
- Aggregate: Summary report across all games
- Output: Individual reports + aggregate summary

**Task 3.4.3**: Advanced Metrics (Optional)
- Duration: 30 minutes
- Add: FPS monitoring (if possible)
- Add: Load time analysis
- Add: Accessibility checks (basic)
- Include: In report output

#### Phase 3.5: Code Evaluation, Refactoring & Security Assessment (90 minutes)

**Task 3.5.1**: Code evaluation and refactoring
- Duration: 45 minutes
- Review: All TypeScript code for best practices
- Review: Browser automation code for efficiency
- Refactor: Duplicate code, improve naming conventions
- Refactor: Improve code organization and structure
- Refactor: Enhance error handling and validation
- Verify: Code follows TypeScript best practices
- Review: LLM integration code for efficiency
- Optimize: API calls and screenshot processing

**Task 3.5.2**: Security assessment
- Duration: 45 minutes
- Assess: API key security (never expose in code)
- Check: Input validation (game URLs, user inputs)
- Check: File system security (screenshot storage)
- Review: Browser automation security (isolated browser sessions)
- Review: LLM API usage (rate limiting, error handling)
- Check: Environment variable handling
- Document: Security findings and mitigations
- Verify: No sensitive data in logs or outputs

#### Phase 3.6: Final Polish (90 minutes)

**Task 3.6.1**: Code cleanup and linting
- Duration: 30 minutes
- Run linter: `npm run lint`
- Fix all linting errors
- Format code: `npm run format`
- Remove debug code
- Add JSDoc comments

**Task 3.6.2**: Optimize performance
- Duration: 30 minutes
- Optimize: Screenshot capture (compress if needed)
- Optimize: LLM API calls (batch if possible)
- Optimize: File I/O operations
- Profile: Execution time
- Target: <5 minutes per game

**Task 3.6.3**: Final verification checklist
- Duration: 30 minutes
- ✅ Agent tests 3+ diverse games successfully
- ✅ AI evaluation accuracy ≥80%
- ✅ Error handling works gracefully
- ✅ Structured JSON output correct
- ✅ README complete and accurate
- ✅ Technical writeup complete
- ✅ Test results documented
- ✅ No API keys in code or commits

#### Phase 3.7: Final Submission Demo Video Preparation (45 minutes)

**Task 3.7.1**: Create 3-minute demo video script
- Duration: 20 minutes
- Script should cover:
  - Introduction (10s): "DreamUp QA Pipeline - Complete autonomous game testing"
  - System Overview (15s): Architecture, key components
  - Game Loading (20s): Load game, detect UI, wait for render
  - Interaction Demo (40s): Show click interactions, keyboard gameplay, navigation
  - Monitoring (20s): Show crash/freeze detection, error monitoring
  - AI Evaluation (40s): Show LLM analyzing evidence, generating playability score
  - Diverse Testing (25s): Show testing on 3+ different game types
  - Report Output (20s): Show structured JSON reports
  - Conclusion (10s): "Complete autonomous testing system with AI evaluation"

**Task 3.7.2**: Create cue card with narration and highlights
- Duration: 15 minutes
- Final polished version with all features
- Include visual demonstrations of terminal/CLI
- Highlight key technical achievements
- Show test results from diverse games

#### Phase 3.7: Integrated Unit Testing for Phase 3
- Duration: 15 minutes
- Run complete test suite: `npm test`
- Verify: All tests pass
- Run: QA agent on test games
- Verify: Reports generated correctly
- Document: Final test results summary

---

## Success Criteria

### MVP (Phase 1) - November 4
- ✅ Browser automation agent loads games
- ✅ Screenshots captured (3-5 per session)
- ✅ Console logs captured
- ✅ Basic JSON report generated
- ✅ CLI interface functional (`npx tsx qa.ts <url>`)
- ✅ Unit tests for core functions passing

### Early Submission (Phase 2) - November 7
- ✅ Game interaction system working (clicks, keyboard)
- ✅ UI element detection working
- ✅ Monitoring and error detection working
- ✅ AI evaluation integrated (LLM analysis)
- ✅ Structured JSON output with playability score
- ✅ Integration tests passing

### Final Submission (Phase 3) - November 9
- ✅ Tested on 3-5 diverse game types successfully
- ✅ AI evaluation accuracy ≥80%
- ✅ Comprehensive error handling
- ✅ Documentation complete (technical writeup, README, decision log)
- ✅ Optional stretch features implemented (if time permits)
- ✅ All tests passing
- ✅ Code clean, linted, and documented

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Agent loops infinitely | High | Max action count, total timeout (5 min), action limits |
| LLM gives inconsistent results | Medium | Structured prompts, confidence thresholds, fallback heuristics |
| Games don't load in headless mode | High | Test with headed mode option, screenshot comparison, retry logic |
| API costs exceed budget | Low | Cache responses if possible, use cheaper models for iteration |
| Interaction detection fails | Medium | Multiple selector strategies, fallback to generic clicks |
| Time constraints | High | MVP is safety net, interaction is enhancement, prioritize core automation |

---

## Deliverables Checklist

### Code Repository
- [ ] GitHub repository with clean structure
- [ ] TypeScript source code in `src/` directory
- [ ] All tests in `tests/` directory
- [ ] README.md with setup instructions
- [ ] `.env.example` with required variables
- [ ] `.gitignore` configured properly
- [ ] `qa.ts` executable with `npx tsx qa.ts <url>` or `bun run qa.ts <url>`

### Documentation
- [ ] Technical writeup (1-2 pages)
- [ ] Decision log with key architectural choices
- [ ] README with complete setup and usage
- [ ] Test results summary (3-5 games)
- [ ] AI tools and prompts documentation

### Testing
- [ ] Unit tests for agent logic
- [ ] Integration tests for full flow
- [ ] Test results for 3-5 diverse games
- [ ] QA reports with screenshots

### Demo
- [ ] Demo video (2-5 minutes)
- [ ] Demo video script
- [ ] Demo video cue card
- [ ] Example reports and artifacts

---

## Notes

- **TypeScript Required**: Assignment requires TypeScript (`bun run qa.ts` or `npx tsx qa.ts`)
- **Browserbase Recommended**: Free tier includes 1 browser-hour
- **Structured Output**: Must output JSON with `{status, playability_score, issues[], screenshots[], timestamp}`
- **Max Execution Time**: 5 minutes per game
- **Test Games**: Find at itch.io/games/html5 or create simple test cases

---

**Document Version**: 1.1  
**Created**: October 31, 2025  
**Last Updated**: November 3, 2025  
**Project Start Date**: November 3, 2025  
**Framework**: Based on October 16, 2025 success path methodology

