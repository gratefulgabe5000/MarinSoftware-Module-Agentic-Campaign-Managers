# Product Requirements Document: ChainEquity

**Version:** 1.1  
**Date:** November 3, 2025  
**Project Duration:** 7 Days (Nov 3 - Nov 9, 2025)  
**Project Start:** November 3, 2025  
**Framework:** Based on October 16, 2025 success path methodology  
**Target:** Tokenized Security Prototype with Compliance Gating

---

## Executive Summary

ChainEquity is a working prototype demonstrating how tokenized securities function on-chain with compliance gating, corporate actions, and operator workflows. Built as a technical demonstration (NOT regulatory-compliant), the system showcases blockchain primitives for equity management through transparent, automated compliance checks.

**Key Deliverables:**
- ✅ Gated token contract (allowlist-based transfer restrictions)
- ✅ Issuer service for wallet approval and token minting
- ✅ Event indexer producing cap-table snapshots
- ✅ Corporate action system (splits, symbol changes)
- ✅ Operator UI or CLI for demonstrations
- ✅ Test suite and gas benchmarks
- ✅ Technical writeup with decision rationale

**Success Targets:**
- **MVP (Nov 4)**: Core gated token + basic issuer service + event indexer
- **Early Submission (Nov 7)**: + Corporate actions + operator demo
- **Final Submission (Nov 9)**: + Comprehensive testing + documentation + gas optimization

---

## Project Timeline

| Milestone | Date | Deliverable |
|-----------|------|-------------|
| **Phase 1: MVP** | Tuesday, November 4, 2025 | Core gated token contract, basic issuer service, event indexer working |
| **Early Submission** | Friday, November 7, 2025 | + Corporate actions (split + symbol change), operator demo UI/CLI |
| **Final Submission** | Sunday, November 9, 2025 | + Comprehensive test suite, gas benchmarks, technical writeup |

---

## Technology Stack

### Blockchain Selection
**Recommendation: Ethereum Sepolia Testnet**
- **Rationale**: Most mature ecosystem, ERC-20 standard well-documented, extensive tooling
- **Alternative**: Polygon Mumbai (lower gas costs, EVM-compatible)
- **Local Option**: Hardhat Network for development, then deploy to Sepolia

### Smart Contract Stack
- **Language**: Solidity 0.8.20+
- **Framework**: Hardhat (testing, deployment, gas reporting)
- **Base Contracts**: OpenZeppelin Contracts v5.0+ (ERC-20 base)
- **Testing**: Hardhat + Chai + Ethers.js v6
- **Deployment**: Hardhat scripts with environment variables

### Backend/Indexer Stack
- **Language**: Node.js + TypeScript
- **Blockchain Library**: ethers.js v6
- **Event Listening**: WebSocket subscriptions or polling
- **Storage**: SQLite for cap-table snapshots (simple, no external deps)
- **CLI Framework**: Commander.js for CLI interface
- **Web Framework** (Optional UI): Express.js + React

### Development Tools
- **Package Manager**: npm or yarn
- **Linting**: ESLint + Prettier
- **Type Checking**: TypeScript strict mode
- **Git Hooks**: Husky + lint-staged
- **Documentation**: JSDoc for contracts, README.md for setup

---

## Architecture Overview

### System Components

```
ChainEquity/
├── contracts/
│   ├── GatedToken.sol              # ERC-20 with allowlist gating
│   ├── CorporateActions.sol         # Split and symbol change logic
│   └── interfaces/
│       └── IGatedToken.sol
├── backend/
│   ├── issuer-service/              # Wallet approval + minting
│   │   ├── approval.ts
│   │   ├── mint.ts
│   │   └── allowlist.ts
│   ├── indexer/                     # Event indexing + cap-table
│   │   ├── eventListener.ts
│   │   ├── capTable.ts
│   │   └── snapshot.ts
│   └── cli/                         # Operator CLI
│       └── commands.ts
├── tests/
│   ├── unit/
│   │   ├── GatedToken.test.ts
│   │   └── CorporateActions.test.ts
│   ├── integration/
│   │   ├── fullFlow.test.ts
│   │   └── capTable.test.ts
│   └── gas/
│       └── benchmarks.test.ts
├── scripts/
│   ├── deploy.ts
│   └── seed.ts
└── docs/
    ├── technical-writeup.md
    └── decision-log.md
```

### Data Flow

1. **Approval Flow**: User requests → Issuer Service → Contract allowlist update
2. **Minting Flow**: Issuer Service → Contract mint → Event emitted
3. **Transfer Flow**: User initiates → Contract checks allowlist → Transfer succeeds/fails
4. **Indexing Flow**: Contract events → Indexer listens → SQLite cap-table updated
5. **Export Flow**: Indexer queries → CSV/JSON generation

---

## Phase Breakdown

### Phase 1: MVP (Due Tuesday, November 4, 2025)

**Objective**: Core functionality working end-to-end

#### Phase 1.1: Project Setup & Foundation (90 minutes)

**Task 1.1.1**: Initialize Hardhat project with TypeScript
- Duration: 15 minutes
- Create `chainequity/` directory
- Run `npx hardhat init` with TypeScript template
- Install OpenZeppelin Contracts: `npm install @openzeppelin/contracts`
- Install ethers.js v6: `npm install ethers@^6.0.0`
- Verify setup: `npx hardhat compile`
- PowerShell: `New-Item -ItemType Directory -Path chainequity; Set-Location chainequity; npx hardhat init`

**Task 1.1.2**: Configure Hardhat for Sepolia testnet
- Duration: 15 minutes
- Create `.env` file with `SEPOLIA_RPC_URL` and `PRIVATE_KEY`
- Update `hardhat.config.ts` with network config
- Add `.env.example` with placeholders
- Document setup in README.md

**Task 1.1.3**: Setup backend project structure
- Duration: 30 minutes
- Create `backend/` directory with `issuer-service/`, `indexer/`, `cli/`
- Initialize TypeScript: `tsc --init`
- Install dependencies: `npm install ethers commander sqlite3`
- Create `tsconfig.json` with proper settings
- PowerShell: `New-Item -ItemType Directory -Path backend/issuer-service,backend/indexer,backend/cli; npm init -y`

**Task 1.1.4**: Install testing dependencies
- Duration: 15 minutes
- Install: `npm install --save-dev @nomicfoundation/hardhat-chai-matchers @nomicfoundation/hardhat-toolbox chai`
- Create `tests/` directory structure
- Verify test setup: `npx hardhat test`

**Task 1.1.5**: Create .gitignore and initial README
- Duration: 15 minutes
- Add `.env`, `node_modules/`, `artifacts/`, `cache/` to .gitignore
- Write README.md with setup instructions
- Document environment variables needed

#### Phase 1.2: Gated Token Contract (180 minutes)

**Task 1.2.1**: Create base ERC-20 contract extending OpenZeppelin
- Duration: 30 minutes
- Create `contracts/GatedToken.sol`
- Import `@openzeppelin/contracts/token/ERC20/ERC20.sol`
- Add constructor with name, symbol, initial supply
- Add owner/admin role using OpenZeppelin's Ownable
- Compile and verify: `npx hardhat compile`

**Task 1.2.2**: Implement allowlist mapping and modifiers
- Duration: 45 minutes
- Add `mapping(address => bool) public allowlist`
- Create modifier `onlyAllowlisted(address account)`
- Add events: `AllowlistUpdated(address indexed account, bool indexed status)`
- Add view function `isAllowlisted(address account) returns (bool)`
- Test allowlist logic in isolated test file

**Task 1.2.3**: Override transfer functions to check allowlist
- Duration: 60 minutes
- Override `transfer(address to, uint256 amount)` with allowlist check
- Override `transferFrom(address from, address to, uint256 amount)` with allowlist check
- Check BOTH sender AND recipient are on allowlist
- Revert with descriptive error if either not approved
- Emit `Transfer` event only on success
- Test transfer scenarios (approved→approved, approved→non-approved, non-approved→approved)

**Task 1.2.4**: Implement admin functions for allowlist management
- Duration: 45 minutes
- Add `approveWallet(address account)` function (owner only)
- Add `revokeWallet(address account)` function (owner only)
- Add `batchApprove(address[] calldata accounts)` for efficiency
- Add `batchRevoke(address[] calldata accounts)`
- Emit `AllowlistUpdated` events for all changes
- Add access control checks (only owner)

#### Phase 1.3: Issuer Service Backend (150 minutes)

**Task 1.3.1**: Create wallet approval service
- Duration: 45 minutes
- Create `backend/issuer-service/approval.ts`
- Implement `approveWallet(contract: Contract, wallet: string, signer: Signer)`
- Connect to contract using ethers.js
- Call `approveWallet()` function
- Handle errors and transaction confirmation
- Add retry logic for failed transactions

**Task 1.3.2**: Create token minting service
- Duration: 45 minutes
- Create `backend/issuer-service/mint.ts`
- Implement `mintTokens(contract: Contract, to: string, amount: bigint, signer: Signer)`
- Verify recipient is on allowlist before minting
- Call contract's mint function (need to add mint function to contract)
- Wait for transaction confirmation
- Return transaction hash

**Task 1.3.3**: Create allowlist query service
- Duration: 30 minutes
- Create `backend/issuer-service/allowlist.ts`
- Implement `checkAllowlistStatus(contract: Contract, wallet: string)`
- Query contract's `isAllowlisted()` view function
- Return boolean status
- Add batch query support for multiple wallets

**Task 1.3.4**: Add mint function to contract (if not present)
- Duration: 30 minutes
- Add `mint(address to, uint256 amount)` function to GatedToken.sol
- Ensure `to` address is on allowlist before minting
- Check owner/admin permissions (only owner can mint)
- Emit `Transfer(address(0), to, amount)` event
- Test minting in isolation

#### Phase 1.4: Event Indexer (120 minutes)

**Task 1.4.1**: Setup SQLite database schema
- Duration: 30 minutes
- Create `backend/indexer/database.ts`
- Define schema: `wallets(id, address, balance, last_updated)`
- Define schema: `transfers(id, from_address, to_address, amount, block_number, tx_hash)`
- Define schema: `mints(id, to_address, amount, block_number, tx_hash)`
- Initialize database with tables
- Add indexes on addresses and block_numbers

**Task 1.4.2**: Create event listener for Transfer events
- Duration: 45 minutes
- Create `backend/indexer/eventListener.ts`
- Setup ethers.js contract connection
- Listen for `Transfer(address indexed from, address indexed to, uint256 value)` events
- Parse event data and extract from/to/amount
- Store events in SQLite transfers table
- Handle reorgs (query from specific block)

**Task 1.4.3**: Create event listener for Mint events
- Duration: 30 minutes
- Listen for custom `Mint(address indexed to, uint256 amount)` events
- Parse and store in mints table
- Update wallet balances accordingly
- Handle duplicate events (check transaction hash)

**Task 1.4.4**: Implement balance aggregation
- Duration: 15 minutes
- Create function to aggregate current balance per wallet
- Query all transfers and mints from genesis
- Calculate net balance: sum(mints) + sum(received) - sum(sent)
- Update wallets table with current balances

#### Phase 1.5: Basic CLI Interface (90 minutes)

**Task 1.5.1**: Setup Commander.js CLI framework
- Duration: 20 minutes
- Install commander: `npm install commander`
- Create `backend/cli/index.ts` as entry point
- Setup command structure with commander
- Add `--help` and `--version` flags

**Task 1.5.2**: Implement approve-wallet command
- Duration: 20 minutes
- Add `approve-wallet <address>` command
- Connect to contract
- Call approval service
- Show transaction hash and confirmation

**Task 1.5.3**: Implement mint command
- Duration: 25 minutes
- Add `mint <address> <amount>` command
- Validate address format
- Parse amount to BigInt
- Call minting service
- Show confirmation

**Task 1.5.4**: Implement query-allowlist command
- Duration: 15 minutes
- Add `query-allowlist <address>` command
- Query contract for allowlist status
- Display status (approved/not approved)

**Task 1.5.5**: Implement export-cap-table command
- Duration: 10 minutes
- Add `export-cap-table [--format csv|json]` command
- Query database for all wallets and balances
- Calculate percentage ownership (balance / total supply)
- Export to CSV or JSON format
- PowerShell: `node backend/cli/index.ts export-cap-table --format csv > cap-table.csv`

#### Phase 1.6: Deployment & Testing (120 minutes)

**Task 1.6.1**: Deploy contract to Sepolia testnet
- Duration: 30 minutes
- Create `scripts/deploy.ts`
- Load private key from .env
- Deploy GatedToken contract with constructor params
- Verify deployment address
- Save contract address to .env or config file

**Task 1.6.2**: Write basic unit tests for contract
- Duration: 45 minutes
- Create `tests/unit/GatedToken.test.ts`
- Test: approve wallet → verify allowlist status
- Test: mint to approved wallet → verify balance
- Test: transfer between approved wallets → SUCCESS
- Test: transfer to non-approved wallet → FAIL
- Test: transfer from non-approved wallet → FAIL
- Use Hardhat's fixture pattern for setup

**Task 1.6.3**: Write integration test for full flow
- Duration: 30 minutes
- Create `tests/integration/fullFlow.test.ts`
- Test: Approve → Mint → Transfer → Export cap-table
- Verify all events are emitted correctly
- Verify balances are correct at each step

**Task 1.6.4**: Integrated Unit Testing for Phase 1
- Duration: 15 minutes
- Run full test suite: `npx hardhat test`
- Verify all tests pass
- Check coverage (if configured)
- Document any failing tests or known issues

#### Phase 1.7: MVP Demo Video Preparation (45 minutes)

**Task 1.7.1**: Create 3-minute demo video script
- Duration: 20 minutes
- Script should cover:
  - Introduction (10s): "This is ChainEquity MVP - a tokenized security prototype"
  - Wallet Approval Demo (30s): Show approve-wallet command, verify status
  - Minting Demo (30s): Mint tokens to approved wallet, show balance
  - Transfer Demo (40s): Transfer between approved wallets (SUCCESS), then try non-approved (FAIL)
  - Cap-Table Export (30s): Export current state to CSV, show ownership percentages
  - Conclusion (10s): "MVP demonstrates core gating, minting, and indexing functionality"

**Task 1.7.2**: Create cue card with narration and highlights
- Duration: 15 minutes
- Format:
  ```
  [NARRATION]: "This is ChainEquity MVP..."
  • Highlights: Project introduction, system overview
  [NARRATION]: "First, we'll approve a wallet..."
  • Highlights: CLI approve-wallet command, contract interaction, transaction confirmation
  ```
- Include bullet points for each narration line showing key UI elements/actions
- Keep narration natural, 3 minutes total
- Include visual cues (what to show on screen)

---

### Phase 2: Early Submission (Due Friday, November 7, 2025)

**Objective**: Add corporate actions and operator demo interface

#### Phase 2.1: Corporate Actions - Stock Split (180 minutes)

**Task 2.1.1**: Design split implementation approach
- Duration: 30 minutes
- Evaluate: On-chain iteration vs. virtual split vs. contract migration
- **Decision**: Virtual split (adjust display logic, keep balances unchanged)
- **Rationale**: Gas-efficient, maintains contract state, simpler implementation
- Document tradeoffs in decision-log.md

**Task 2.1.2**: Implement split ratio tracking in contract
- Duration: 45 minutes
- Add `uint256 public splitRatio = 1` (1 = no split, 7 = 7-for-1 split)
- Add `mapping(address => uint256) public adjustedBalances` (optional for display)
- Add `event StockSplit(uint256 oldRatio, uint256 newRatio, uint256 blockNumber)`
- Add `executeSplit(uint256 newRatio)` function (owner only)
- Validate newRatio > 0 and newRatio > splitRatio (only forward splits)

**Task 2.1.3**: Implement split logic in issuer service
- Duration: 45 minutes
- Create `backend/issuer-service/split.ts`
- Implement `executeSplit(contract: Contract, ratio: bigint, signer: Signer)`
- Call contract's `executeSplit()` function
- Wait for event emission
- Update indexer to track split events

**Task 2.1.4**: Update indexer to handle split events
- Duration: 30 minutes
- Listen for `StockSplit` events
- Store split history in database: `splits(id, old_ratio, new_ratio, block_number)`
- Update cap-table export to account for current split ratio
- Calculate adjusted balances: `display_balance = actual_balance * splitRatio`

**Task 2.1.5**: Test 7-for-1 split end-to-end
- Duration: 30 minutes
- Write test: `tests/integration/split.test.ts`
- Test: Initial state (splitRatio = 1, balance = 10)
- Test: Execute 7-for-1 split (splitRatio = 7)
- Test: Verify adjusted balance = 70 (display), actual balance = 10 (contract)
- Test: Verify ownership percentages unchanged
- Test: Export cap-table shows adjusted balances

#### Phase 2.2: Corporate Actions - Symbol Change (120 minutes)

**Task 2.2.1**: Design symbol change implementation
- Duration: 20 minutes
- Evaluate: Mutable contract vs. proxy pattern vs. new deployment
- **Decision**: Add mutable symbol field with owner update function
- **Rationale**: Simplest approach for prototype, sufficient for demonstration
- Document limitations (production would use proxy pattern)

**Task 2.2.2**: Add symbol update function to contract
- Duration: 40 minutes
- Add `string public symbol` variable (separate from constructor)
- Add `event SymbolChanged(string oldSymbol, string newSymbol)`
- Add `changeSymbol(string memory newSymbol)` function (owner only)
- Validate newSymbol length > 0
- Emit event with old and new symbol

**Task 2.2.3**: Implement symbol change in issuer service
- Duration: 30 minutes
- Create `backend/issuer-service/symbol.ts`
- Implement `changeSymbol(contract: Contract, newSymbol: string, signer: Signer)`
- Call contract's `changeSymbol()` function
- Verify event emission
- Return transaction hash

**Task 2.2.4**: Test symbol change end-to-end
- Duration: 30 minutes
- Write test: `tests/integration/symbol.test.ts`
- Test: Initial symbol (e.g., "ACME")
- Test: Change symbol to "ACMEX"
- Test: Verify contract symbol updated
- Test: Verify event emitted correctly
- Test: Verify balances unchanged

#### Phase 2.3: Operator Demo Interface (180 minutes)

**Task 2.3.1**: Enhance CLI with corporate action commands
- Duration: 30 minutes
- Add `split <ratio>` command (e.g., `split 7` for 7-for-1)
- Add `change-symbol <symbol>` command
- Add validation and error handling
- Show confirmation messages

**Task 2.3.2**: Create simple web UI (Optional but recommended)
- Duration: 90 minutes
- Setup Express.js server: `backend/ui/server.ts`
- Create basic HTML page with buttons:
  - "Approve Wallet" (input address)
  - "Mint Tokens" (input address, amount)
  - "Transfer" (input from, to, amount)
  - "Execute Split" (input ratio)
  - "Change Symbol" (input symbol)
  - "Export Cap-Table"
- Add JavaScript to call backend API
- Display results (transaction hashes, confirmations)

**Task 2.3.3**: Create scripted demo (Alternative to UI)
- Duration: 60 minutes
- Create `scripts/demo.ts` that runs automatically
- Sequence:
  1. Approve wallet A
  2. Approve wallet B
  3. Mint 10,000 tokens to A
  4. Mint 7,000 tokens to B
  5. Transfer 3,000 from A to B (SUCCESS)
  6. Try transfer to non-approved C (FAIL)
  7. Approve C
  8. Transfer to C (SUCCESS)
  9. Execute 7-for-1 split
  10. Change symbol
  11. Export cap-table
- Include delays and console output for visibility
- PowerShell: `npx tsx scripts/demo.ts`

#### Phase 2.4: Enhanced Testing (90 minutes)

**Task 2.4.1**: Write tests for corporate actions
- Duration: 45 minutes
- Test split with various ratios (2, 7, 10)
- Test split validation (prevent reverse splits, zero ratios)
- Test symbol change with various lengths
- Test symbol change validation (empty string rejection)
- Test admin-only access for both functions

**Task 2.4.2**: Write integration tests for full operator flow
- Duration: 30 minutes
- Test complete demo scenario in `tests/integration/demoFlow.test.ts`
- Verify all operations succeed in sequence
- Verify cap-table export matches expectations
- Test failure scenarios (unauthorized access)

**Task 2.4.3**: Integrated Unit Testing for Phase 2
- Duration: 15 minutes
- Run full test suite: `npx hardhat test`
- Run backend tests: `npm test` (if configured)
- Verify all Phase 1 + Phase 2 tests pass
- Document any edge cases or limitations

#### Phase 2.5: Early Submission Demo Video Preparation (45 minutes)

**Task 2.5.1**: Create 3-minute demo video script
- Duration: 20 minutes
- Script should cover:
  - Introduction (10s): "ChainEquity Early Submission - now with corporate actions"
  - Operator Flow Demo (50s): Approve wallets → Mint → Transfer (show success/fail)
  - Split Demo (40s): Execute 7-for-1 split, show adjusted balances, verify percentages unchanged
  - Symbol Change Demo (30s): Change symbol from "ACME" to "ACMEX", verify balances unchanged
  - Cap-Table Export (30s): Export final state, show ownership percentages
  - Conclusion (10s): "Demonstrates compliance gating, corporate actions, and operator workflows"

**Task 2.5.2**: Create cue card with narration and highlights
- Duration: 15 minutes
- Include narration for each section
- Bullet points for key UI elements/CLI outputs
- Visual cues for what to demonstrate
- Timing markers for 3-minute target

---

### Phase 3: Final Submission (Due Sunday, November 9, 2025)

**Objective**: Comprehensive testing, documentation, optimization

#### Phase 3.1: Comprehensive Test Suite (180 minutes)

**Task 3.1.1**: Write all required test scenarios
- Duration: 90 minutes
- Test: Approve wallet → Mint tokens → Verify balance
- Test: Transfer between two approved wallets → SUCCESS
- Test: Transfer from approved to non-approved → FAIL
- Test: Transfer from non-approved to approved → FAIL
- Test: Revoke approval → Previously approved wallet can no longer receive
- Test: Execute 7-for-1 split → All balances multiply by 7, total supply updates
- Test: Change symbol → Metadata updates, balances unchanged
- Test: Export cap-table at block N → Verify accuracy
- Test: Export cap-table at block N+10 → Verify changes reflected
- Test: Unauthorized wallet attempts admin action → FAIL

**Task 3.1.2**: Write edge case tests
- Duration: 45 minutes
- Test: Zero-amount transfers
- Test: Transfer to self (should fail or be blocked)
- Test: Mint to zero address (should fail)
- Test: Maximum uint256 values (overflow protection)
- Test: Empty allowlist operations
- Test: Batch operations with large arrays

**Task 3.1.3**: Write gas optimization tests
- Duration: 45 minutes
- Create `tests/gas/benchmarks.test.ts`
- Measure gas for: mint tokens, approve wallet, transfer (gated), revoke approval, stock split, symbol change
- Target: Mint <100k, Approve <50k, Transfer <100k, Revoke <50k, Symbol <50k
- Document actual costs vs. targets
- Propose optimizations if targets exceeded

#### Phase 3.2: Gas Optimization (120 minutes)

**Task 3.2.1**: Analyze gas usage patterns
- Duration: 30 minutes
- Run gas reports: `npx hardhat test --gas-reporter`
- Identify high-gas operations
- Look for unnecessary storage writes
- Identify loop optimizations

**Task 3.2.2**: Optimize contract code
- Duration: 60 minutes
- Use `immutable` for constants
- Pack structs efficiently
- Reduce storage operations
- Use events instead of storage where possible
- Optimize batch operations

**Task 3.2.3**: Generate final gas report
- Duration: 30 minutes
- Run comprehensive gas benchmarks
- Document all operation costs
- Compare against targets
- Document optimizations applied

#### Phase 3.3: Documentation (150 minutes)

**Task 3.3.1**: Write technical writeup (1-2 pages)
- Duration: 60 minutes
- Sections:
  - Chain selection rationale (why Ethereum Sepolia)
  - Corporate action implementation approach (virtual split, mutable symbol)
  - Key architectural decisions (allowlist gating, event indexing, SQLite storage)
  - Known limitations and risks (not regulatory-compliant, prototype only)
  - Gas costs and optimizations
  - Future improvements

**Task 3.3.2**: Create decision log
- Duration: 30 minutes
- Document all major decisions:
  - Why Ethereum over Polygon/Solana
  - Why virtual split over on-chain iteration
  - Why SQLite over PostgreSQL
  - Why CLI-first over UI-first
  - Tradeoffs and alternatives considered

**Task 3.3.3**: Update README with complete setup instructions
- Duration: 30 minutes
- Prerequisites (Node.js, npm, Hardhat, FFmpeg if needed)
- Environment setup (.env configuration)
- Installation steps
- Deployment instructions (local and Sepolia)
- Testing instructions
- Demo execution instructions
- Troubleshooting section

**Task 3.3.4**: Document AI tools and prompts used
- Duration: 30 minutes
- List all AI tools used (Cursor, GitHub Copilot, etc.)
- Document key prompts that generated code
- Acknowledge AI assistance in README

#### Phase 3.4: Final Integration & Polish (90 minutes)

**Task 3.4.1**: Run complete end-to-end test
- Duration: 30 minutes
- Deploy fresh contract to Sepolia
- Run full demo script
- Verify all operations succeed
- Export cap-table and verify accuracy
- Test failure scenarios

**Task 3.4.2**: Code cleanup and linting
- Duration: 30 minutes
- Run linter: `npm run lint`
- Fix all linting errors
- Format code: `npm run format`
- Remove console.logs (or replace with proper logging)
- Add JSDoc comments to all functions

**Task 3.4.3**: Final verification checklist
- Duration: 30 minutes
- ✅ All test scenarios pass
- ✅ Gas costs documented and within targets (or justified)
- ✅ Contract deployed and address documented
- ✅ README complete and accurate
- ✅ Technical writeup complete
- ✅ Decision log complete
- ✅ Demo script/UI works end-to-end
- ✅ No secrets in code or commits

#### Phase 3.5: Final Submission Demo Video Preparation (45 minutes)

**Task 3.5.1**: Create 3-minute demo video script
- Duration: 20 minutes
- Script should cover:
  - Introduction (10s): "ChainEquity - Complete tokenized security prototype"
  - System Overview (20s): Architecture overview, key components
  - Gating Demo (30s): Approve → Mint → Transfer success/fail scenarios
  - Corporate Actions (40s): Split and symbol change, verify balances and metadata
  - Cap-Table Export (30s): Export with historical snapshots, verify accuracy
  - Testing Highlights (30s): Show test suite running, gas benchmarks
  - Conclusion (10s): "Complete system with compliance gating, corporate actions, and operator workflows"

**Task 3.5.2**: Create cue card with narration and highlights
- Duration: 15 minutes
- Final polished version with all features
- Include visual demonstrations of CLI/UI
- Highlight key technical achievements
- Show test results and gas benchmarks

#### Phase 3.6: Code Evaluation, Refactoring & Security Assessment (90 minutes)

**Task 3.6.1**: Code evaluation and refactoring
- Duration: 45 minutes
- Review: All contract code for optimizations
- Review: All backend code for best practices
- Refactor: Duplicate code, improve naming conventions
- Refactor: Improve code organization and structure
- Refactor: Enhance error handling and validation
- Verify: Code follows Solidity best practices
- Verify: Code follows TypeScript best practices

**Task 3.6.2**: Security assessment
- Duration: 45 minutes
- Assess: Smart contract security (common vulnerabilities)
- Check: Reentrancy vulnerabilities
- Check: Access control issues
- Check: Integer overflow/underflow protection
- Check: Private key management (backend)
- Check: Input validation and sanitization
- Review: OpenZeppelin contracts usage (secure)
- Document: Security findings and mitigations
- Run: Security linters/tools (Slither, Mythril if available)

#### Phase 3.7: Integrated Unit Testing for Phase 3
- Duration: 15 minutes
- Run complete test suite: `npx hardhat test`
- Verify 100% of required scenarios pass
- Run gas benchmarks: `npx hardhat test --gas-reporter`
- Document final test results
- Create test summary report

---

## Success Criteria

### MVP (Phase 1) - November 4
- ✅ Gated token contract deployed and functional
- ✅ Allowlist mechanism working (approve/revoke)
- ✅ Transfer restrictions enforced (both sender and recipient)
- ✅ Issuer service can approve wallets and mint tokens
- ✅ Event indexer listening and storing events
- ✅ Cap-table export working (CSV/JSON)
- ✅ Basic CLI interface functional
- ✅ Unit tests for core contract functions passing

### Early Submission (Phase 2) - November 7
- ✅ Stock split (7-for-1) implemented and tested
- ✅ Symbol change implemented and tested
- ✅ Operator demo interface (CLI or UI) functional
- ✅ Integration tests for full flow passing
- ✅ Demo script/UI demonstrates all operations

### Final Submission (Phase 3) - November 9
- ✅ All required test scenarios passing (10+ tests)
- ✅ Gas benchmarks documented (all operations)
- ✅ Technical writeup complete (1-2 pages)
- ✅ Decision log documenting key choices
- ✅ README with complete setup instructions
- ✅ No false compliance claims (disclaimer included)
- ✅ Reproducible setup (anyone can run demo)
- ✅ All code clean, linted, and documented

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Gas costs exceed targets | Medium | Document actual costs, propose optimizations, accept if reasonable for prototype |
| Testnet RPC rate limits | High | Use local Hardhat network for development, Sepolia only for final deployment |
| Event indexing gaps | Medium | Query from genesis block, handle reorgs with block confirmation |
| Contract deployment failures | High | Test deployment locally first, keep backup deployment script |
| Time constraints | High | MVP is safety net, corporate actions are enhancement, prioritize core features first |

---

## Deliverables Checklist

### Code Repository
- [ ] GitHub repository with clean structure
- [ ] All contracts in `contracts/` directory
- [ ] All backend code in `backend/` directory
- [ ] All tests in `tests/` directory
- [ ] Deployment scripts in `scripts/` directory
- [ ] README.md with setup instructions
- [ ] .env.example with required variables
- [ ] .gitignore configured properly

### Documentation
- [ ] Technical writeup (1-2 pages)
- [ ] Decision log with key architectural choices
- [ ] README with complete setup and usage
- [ ] AI tools and prompts documentation
- [ ] Gas report with benchmarks
- [ ] Test results summary

### Testing
- [ ] Unit tests for all contract functions
- [ ] Integration tests for full flows
- [ ] Gas benchmarks for all operations
- [ ] Test coverage for required scenarios

### Demo
- [ ] Demo script or UI working end-to-end
- [ ] Demo video (3 minutes)
- [ ] Demo video script
- [ ] Demo video cue card
- [ ] Deployment addresses documented (if testnet)

---

## Notes

- **No Compliance Claims**: This is a technical prototype. Include disclaimer that it is NOT regulatory-compliant.
- **Testnet Only**: Never use real funds. Sepolia testnet or local Hardhat network only.
- **Secrets Management**: Use .env for private keys, never commit secrets.
- **Gas Optimization**: Targets are guidelines. Document actual costs and justify if above targets.

---

**Document Version**: 1.1  
**Created**: October 31, 2025  
**Last Updated**: November 3, 2025  
**Project Start Date**: November 3, 2025  
**Framework**: Based on October 16, 2025 success path methodology

