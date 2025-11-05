# Product Requirements Document: SpendSense

**Version:** 1.1  
**Date:** November 3, 2025  
**Project Duration:** 7 Days (Nov 3 - Nov 9, 2025)  
**Project Start:** November 3, 2025  
**Framework:** Based on October 16, 2025 success path methodology  
**Target:** Explainable, Consent-Aware Financial Education System

---

## Executive Summary

SpendSense is an explainable, consent-aware system that detects behavioral patterns from Plaid-style transaction data, assigns personas, and delivers personalized financial education with clear guardrails around eligibility and tone. The system transforms transaction data into actionable insights without crossing into regulated financial advice.

**Key Deliverables:**
- ✅ Synthetic Plaid-style data generator (50-100 users)
- ✅ Feature pipeline detecting subscriptions, savings, credit, income patterns
- ✅ Persona assignment system (5 personas)
- ✅ Recommendation engine with plain-language rationales
- ✅ Consent and eligibility guardrails
- ✅ Operator view for oversight
- ✅ Evaluation harness with metrics

**Success Targets:**
- **MVP (Nov 4)**: Data ingestion + behavioral signal detection + basic persona assignment
- **Early Submission (Nov 7)**: + Recommendation engine + consent guardrails + operator view
- **Final Submission (Nov 9)**: + Evaluation harness + comprehensive testing + documentation

---

## Project Timeline

| Milestone | Date | Deliverable |
|-----------|------|-------------|
| **Phase 1: MVP** | Tuesday, November 4, 2025 | Synthetic data generator, signal detection, basic persona assignment working |
| **Early Submission** | Friday, November 7, 2025 | + Recommendation engine, consent guardrails, operator view |
| **Final Submission** | Sunday, November 9, 2025 | + Evaluation harness, comprehensive testing, documentation |

---

## Technology Stack

### Backend Stack
- **Language**: Python 3.11+ (or Node.js + TypeScript)
- **Data Processing**: Pandas (Python) or similar libraries
- **Storage**: SQLite for relational data, Parquet for analytics
- **API Framework**: FastAPI (Python) or Express.js (Node.js)
- **Testing**: pytest (Python) or Jest (Node.js)

### Frontend Stack (Optional Operator View)
- **Framework**: React + TypeScript (if web UI needed)
- **UI Library**: Tailwind CSS or Material-UI
- **Data Visualization**: Recharts or Chart.js

### AI Integration (Optional)
- **LLM**: OpenAI GPT-4 or Anthropic Claude (for educational content generation)
- **Framework**: OpenAI SDK or Anthropic SDK

### Development Tools
- **Package Manager**: pip (Python) or npm (Node.js)
- **Linting**: pylint/flake8 (Python) or ESLint (Node.js)
- **Type Checking**: mypy (Python) or TypeScript
- **Documentation**: Sphinx (Python) or JSDoc (Node.js)

---

## Architecture Overview

### System Components

```
SpendSense/
├── ingest/
│   ├── data_generator.py          # Synthetic Plaid data generator
│   ├── data_loader.py              # CSV/JSON ingestion
│   └── schema_validator.py         # Data validation
├── features/
│   ├── subscriptions.py            # Subscription signal detection
│   ├── savings.py                  # Savings pattern detection
│   ├── credit.py                   # Credit utilization detection
│   ├── income.py                   # Income stability detection
│   └── aggregator.py               # Feature aggregation
├── personas/
│   ├── assignment.py              # Persona assignment logic
│   ├── prioritization.py          # Multi-persona prioritization
│   └── personas.py                 # Persona definitions
├── recommend/
│   ├── engine.py                   # Recommendation engine
│   ├── content_catalog.py          # Education content catalog
│   ├── partner_offers.py           # Partner offer catalog
│   └── rationales.py               # Rationale generation
├── guardrails/
│   ├── consent.py                  # Consent management
│   ├── eligibility.py              # Eligibility checking
│   └── tone_checker.py             # Tone validation
├── ui/
│   ├── operator_view.py            # Operator interface
│   ├── api.py                       # REST API endpoints
│   └── frontend/                    # React UI (optional)
├── eval/
│   ├── metrics.py                   # Evaluation metrics
│   ├── harness.py                   # Evaluation harness
│   └── reports.py                  # Report generation
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── docs/
    ├── technical-writeup.md
    └── decision-log.md
```

### Data Flow

1. **Ingestion**: Synthetic data → Validation → Storage (SQLite/Parquet)
2. **Feature Extraction**: Transaction data → Signal detection → Feature vectors
3. **Persona Assignment**: Features → Persona matching → Priority selection
4. **Recommendation**: Persona + Features → Content matching → Rationale generation
5. **Guardrails**: Recommendations → Consent check → Eligibility check → Tone check
6. **Operator Review**: Recommendations → Operator approval → Final output

---

## Phase Breakdown

### Phase 1: MVP (Due Tuesday, November 4, 2025)

**Objective**: Data ingestion and signal detection working end-to-end

#### Phase 1.1: Project Setup & Foundation (90 minutes)

**Task 1.1.1**: Initialize project structure
- Duration: 15 minutes
- Create `spendsense/` directory
- Setup Python virtual environment: `python -m venv venv`
- Activate venv: PowerShell: `.\venv\Scripts\Activate.ps1`
- Create directory structure (ingest/, features/, personas/, etc.)
- Initialize git repository: `git init`

**Task 1.1.2**: Install dependencies
- Duration: 15 minutes
- Create `requirements.txt` with dependencies:
  - pandas, numpy, sqlalchemy, pytest
- Install: `pip install -r requirements.txt`
- Create `.gitignore` with venv/, `__pycache__/`, `.env`, `*.db`

**Task 1.1.3**: Setup SQLite database
- Duration: 20 minutes
- Create `database.py` with SQLite connection
- Define schema: users, accounts, transactions, liabilities
- Create tables with proper indexes
- Add seed data helper functions

**Task 1.1.4**: Create configuration system
- Duration: 20 minutes
- Create `config.py` with settings:
  - Database path
  - Feature window sizes (30d, 180d)
  - Signal thresholds
- Create `.env.example` with configuration placeholders
- Document configuration in README

**Task 1.1.5**: Setup testing framework
- Duration: 20 minutes
- Create `tests/` directory structure
- Create `pytest.ini` configuration
- Write sample test to verify setup
- Run: `pytest` to verify working

#### Phase 1.2: Synthetic Data Generator (180 minutes)

**Task 1.2.1**: Define Plaid-style data schemas
- Duration: 30 minutes
- Create `ingest/schemas.py` with data models:
  - Account: account_id, type, subtype, balances, iso_currency_code
  - Transaction: account_id, date, amount, merchant_name, category, pending
  - Liability: account_id, aprs, minimum_payment, last_payment, is_overdue
- Use dataclasses or Pydantic models
- Add validation logic

**Task 1.2.2**: Implement account generator
- Duration: 45 minutes
- Create `ingest/data_generator.py`
- Function: `generate_accounts(user_id: int, count: int)` 
- Generate: checking, savings, credit cards, money market, HSA
- Randomize balances, limits, APRs
- Ensure diversity (various income levels, credit behaviors)

**Task 1.2.3**: Implement transaction generator
- Duration: 60 minutes
- Function: `generate_transactions(account_id: str, days: int)`
- Generate realistic transaction patterns:
  - Payroll deposits (bi-weekly/monthly)
  - Recurring subscriptions (Netflix, Spotify, etc.)
  - Variable expenses (groceries, gas, restaurants)
  - Random one-time purchases
- Include merchant names, categories, amounts
- Ensure variety in transaction patterns

**Task 1.2.4**: Implement liability generator
- Duration: 30 minutes
- Function: `generate_liabilities(user_id: int)`
- Generate credit cards with:
  - APRs (type, percentage)
  - Minimum payment amounts
  - Last payment amounts
  - Overdue status (occasional)
- Generate mortgages/student loans (optional)

**Task 1.2.5**: Generate 50-100 synthetic users
- Duration: 15 minutes
- Function: `generate_users(count: int = 75)`
- Generate diverse financial situations:
  - High utilization users (credit cards)
  - Variable income users (irregular pay)
  - Subscription-heavy users (many recurring)
  - Savings builders (growing savings)
  - Mixed scenarios
- Use fake names, masked account numbers (no PII)
- Save to SQLite database

**Task 1.2.6**: Create data validation
- Duration: 30 minutes
- Create `ingest/schema_validator.py`
- Validate: account structure, transaction structure, liability structure
- Check: date ranges, amount ranges, required fields
- Generate validation report
- Handle invalid data gracefully

#### Phase 1.3: Behavioral Signal Detection - Subscriptions (120 minutes)

**Task 1.3.1**: Implement recurring merchant detection
- Duration: 45 minutes
- Create `features/subscriptions.py`
- Function: `detect_recurring_merchants(transactions: DataFrame, days: int = 90)`
- Logic: Find merchants with ≥3 transactions in 90 days
- Calculate cadence (monthly/weekly)
- Identify subscription merchants (Netflix, Spotify, etc.)
- Return: list of recurring merchants with cadence

**Task 1.3.2**: Calculate subscription metrics
- Duration: 45 minutes
- Function: `calculate_subscription_metrics(transactions: DataFrame, window: int)`
- Calculate: Monthly recurring spend (sum of recurring transactions)
- Calculate: Subscription share of total spend (recurring / total)
- Support: 30-day and 180-day windows
- Return: metrics dictionary

**Task 1.3.3**: Test subscription detection
- Duration: 30 minutes
- Create test data with known subscriptions
- Test: Detection of monthly subscriptions
- Test: Detection of weekly subscriptions
- Test: False positives (non-recurring merchants)
- Verify metrics calculation accuracy

#### Phase 1.4: Behavioral Signal Detection - Savings (90 minutes)

**Task 1.4.1**: Detect savings account activity
- Duration: 30 minutes
- Create `features/savings.py`
- Function: `detect_savings_activity(transactions: DataFrame, accounts: DataFrame)`
- Filter: savings-like accounts (savings, money market, cash management, HSA)
- Calculate: Net inflow (inflows - outflows)
- Calculate: Growth rate over window
- Return: net inflow, growth rate

**Task 1.4.2**: Calculate emergency fund coverage
- Duration: 30 minutes
- Function: `calculate_emergency_fund_coverage(accounts: DataFrame, transactions: DataFrame)`
- Logic: savings_balance / average_monthly_expenses
- Calculate average monthly expenses from transaction history
- Return: coverage ratio (months of expenses covered)
- Handle edge cases (zero expenses, negative savings)

**Task 1.4.3**: Test savings detection
- Duration: 30 minutes
- Create test data with known savings patterns
- Test: Growing savings detection
- Test: Declining savings detection
- Test: Emergency fund calculation accuracy
- Verify metrics for 30d and 180d windows

#### Phase 1.5: Behavioral Signal Detection - Credit (120 minutes)

**Task 1.5.1**: Calculate credit utilization
- Duration: 30 minutes
- Create `features/credit.py`
- Function: `calculate_utilization(liabilities: DataFrame)`
- Logic: utilization = balance / limit (per card)
- Calculate overall utilization (total balance / total limit)
- Return: per-card and overall utilization
- Handle missing limits gracefully

**Task 1.5.2**: Detect credit flags
- Duration: 45 minutes
- Function: `detect_credit_flags(liabilities: DataFrame)`
- Flags:
  - Utilization ≥30%
  - Utilization ≥50%
  - Utilization ≥80%
  - Minimum-payment-only (min_payment = statement_balance)
  - Interest charges present
  - Overdue status
- Return: list of flags per card and overall

**Task 1.5.3**: Test credit detection
- Duration: 45 minutes
- Create test data with various utilization levels
- Test: Low utilization (<30%)
- Test: Medium utilization (30-50%)
- Test: High utilization (>80%)
- Test: Minimum-payment-only detection
- Test: Overdue detection
- Verify all flags triggered correctly

#### Phase 1.6: Behavioral Signal Detection - Income Stability (90 minutes)

**Task 1.6.1**: Detect payroll ACH deposits
- Duration: 30 minutes
- Create `features/income.py`
- Function: `detect_payroll_deposits(transactions: DataFrame)`
- Logic: Find ACH deposits with consistent patterns
- Identify: Payment frequency (weekly/bi-weekly/monthly)
- Calculate: Payment amount and variability
- Return: payroll transactions with frequency

**Task 1.6.2**: Calculate income stability metrics
- Duration: 30 minutes
- Function: `calculate_income_stability(transactions: DataFrame, window: int)`
- Calculate: Median pay gap (days between payments)
- Calculate: Payment variability (standard deviation)
- Calculate: Cash-flow buffer (months of expenses vs. income)
- Return: stability metrics

**Task 1.6.3**: Test income detection
- Duration: 30 minutes
- Create test data with regular and irregular income
- Test: Regular bi-weekly income detection
- Test: Irregular income detection
- Test: Cash-flow buffer calculation
- Verify metrics for variable income users

#### Phase 1.7: Feature Aggregation (60 minutes)

**Task 1.7.1**: Create feature aggregation pipeline
- Duration: 30 minutes
- Create `features/aggregator.py`
- Function: `aggregate_features(user_id: int, window_30d: bool, window_180d: bool)`
- Aggregate: Subscriptions, Savings, Credit, Income features
- Return: Comprehensive feature dictionary for user
- Support: 30-day and 180-day windows separately

**Task 1.7.2**: Store aggregated features
- Duration: 20 minutes
- Create database table: `user_features`
- Store: user_id, window_size, feature_vector (JSON)
- Index on user_id and window_size
- Add function to retrieve features

**Task 1.7.3**: Test feature aggregation
- Duration: 10 minutes
- Test: Aggregation for multiple users
- Test: Both window sizes (30d, 180d)
- Verify: All signals included correctly

#### Phase 1.8: Basic Persona Assignment (90 minutes)

**Task 1.8.1**: Define persona criteria
- Duration: 30 minutes
- Create `personas/personas.py`
- Define 4 required personas:
  1. High Utilization (utilization ≥50% OR interest > 0 OR min-payment-only OR overdue)
  2. Variable Income Budgeter (median pay gap > 45d AND cash-flow < 1 month)
  3. Subscription-Heavy (recurring ≥3 AND (monthly spend ≥$50 OR share ≥10%))
  4. Savings Builder (growth rate ≥2% OR inflow ≥$200/month AND all utilizations < 30%)
- Document criteria clearly

**Task 1.8.2**: Implement persona assignment logic
- Duration: 45 minutes
- Create `personas/assignment.py`
- Function: `assign_persona(user_id: int, features: dict) -> str`
- Check each persona criteria in order
- Return: First matching persona (or "None" if no match)
- Log assignment rationale

**Task 1.8.3**: Test persona assignment
- Duration: 15 minutes
- Create test users matching each persona
- Test: High Utilization user assignment
- Test: Variable Income user assignment
- Test: Subscription-Heavy user assignment
- Test: Savings Builder user assignment
- Verify: Correct persona assigned

#### Phase 1.9: Basic CLI & Testing (90 minutes)

**Task 1.9.1**: Create simple CLI for data generation
- Duration: 30 minutes
- Create `cli.py` with commands:
  - `generate-data --count 75` (generate 75 users)
  - `detect-features --user-id <id>` (detect features for user)
  - `assign-persona --user-id <id>` (assign persona)
- Use argparse or click for CLI
- PowerShell: `python cli.py generate-data --count 75`

**Task 1.9.2**: Write basic unit tests
- Duration: 30 minutes
- Test: Subscription detection logic
- Test: Savings calculation logic
- Test: Credit utilization calculation
- Test: Income stability detection
- Test: Persona assignment logic
- Run: `pytest tests/unit/`

**Task 1.9.3**: Integrated Unit Testing for Phase 1
- Duration: 30 minutes
- Run full test suite: `pytest`
- Verify: Data generation works
- Verify: All signal detection works
- Verify: Persona assignment works
- Document any failing tests

#### Phase 1.10: MVP Demo Video Preparation (45 minutes)

**Task 1.10.1**: Create 3-minute demo video script
- Duration: 20 minutes
- Script should cover:
  - Introduction (10s): "SpendSense MVP - financial behavior detection system"
  - Data Generation (30s): Generate 75 synthetic users, show data structure
  - Signal Detection (50s): Show subscription detection, savings patterns, credit utilization, income stability
  - Persona Assignment (40s): Assign personas to users, show criteria matching
  - Feature Aggregation (20s): Show aggregated features for a user
  - Conclusion (10s): "MVP demonstrates data ingestion, signal detection, and persona assignment"

**Task 1.10.2**: Create cue card with narration and highlights
- Duration: 15 minutes
- Include narration for each section
- Bullet points for key outputs/CLI commands
- Visual cues for data visualization (if applicable)
- Timing markers for 3-minute target

---

### Phase 2: Early Submission (Due Friday, November 7, 2025)

**Objective**: Add recommendation engine, consent guardrails, and operator view

#### Phase 2.1: Recommendation Engine - Content Catalog (120 minutes)

**Task 2.1.1**: Create education content catalog
- Duration: 45 minutes
- Create `recommend/content_catalog.py`
- Define content items:
  - Articles on debt paydown strategies
  - Budget templates for variable income
  - Subscription audit checklists
  - Emergency fund calculators
  - Credit utilization explainers
- Each item: id, title, description, persona_tags, category

**Task 2.1.2**: Create partner offer catalog
- Duration: 45 minutes
- Create `recommend/partner_offers.py`
- Define offers:
  - Balance transfer credit cards (for high utilization)
  - High-yield savings accounts (for emergency fund builders)
  - Budgeting apps (for variable income)
  - Subscription management tools (for subscription-heavy)
- Each offer: id, title, description, eligibility_criteria, persona_tags

**Task 2.1.3**: Implement content matching
- Duration: 30 minutes
- Function: `match_content(persona: str, features: dict) -> List[ContentItem]`
- Match: Content items tagged with persona
- Rank: By relevance to user's specific signals
- Return: 3-5 education items, 1-3 partner offers

#### Phase 2.2: Recommendation Engine - Rationale Generation (150 minutes)

**Task 2.2.1**: Implement rationale generation
- Duration: 60 minutes
- Create `recommend/rationales.py`
- Function: `generate_rationale(recommendation: dict, user_features: dict) -> str`
- Format: "We noticed [specific data point]. [Recommendation] because [reason]."
- Example: "We noticed your Visa ending in 4523 is at 68% utilization ($3,400 of $5,000 limit). Bringing this below 30% could improve your credit score and reduce interest charges of $87/month."
- Use plain language, cite concrete data

**Task 2.2.2**: Generate recommendation output
- Duration: 45 minutes
- Function: `generate_recommendations(user_id: int, window: str) -> dict`
- Output per user per window:
  - 3-5 education items with rationales
  - 1-3 partner offers with eligibility checks
  - Every item includes "because" rationale
- Return: Structured recommendation dictionary

**Task 2.2.3**: Test recommendation generation
- Duration: 45 minutes
- Test: Recommendations for each persona
- Test: Rationales cite specific data points
- Test: Plain language (no jargon)
- Verify: All recommendations have rationales

#### Phase 2.3: Consent Management (90 minutes)

**Task 2.3.1**: Implement consent tracking
- Duration: 30 minutes
- Create `guardrails/consent.py`
- Database table: `user_consent(user_id, consent_given, consent_date, revoked_date)`
- Function: `check_consent(user_id: int) -> bool`
- Function: `record_consent(user_id: int, given: bool)`
- Function: `revoke_consent(user_id: int)`

**Task 2.3.2**: Enforce consent in recommendation flow
- Duration: 30 minutes
- Modify recommendation generation to check consent first
- If no consent: return empty recommendations
- Log consent status for audit
- Add consent check to all data processing functions

**Task 2.3.3**: Test consent enforcement
- Duration: 30 minutes
- Test: Recommendations blocked without consent
- Test: Consent can be revoked
- Test: Recommendations return after consent given
- Verify: No recommendations without consent

#### Phase 2.4: Eligibility Guardrails (90 minutes)

**Task 2.4.1**: Implement eligibility checking
- Duration: 45 minutes
- Create `guardrails/eligibility.py`
- Function: `check_eligibility(offer: dict, user_features: dict) -> bool`
- Check:
  - Minimum income requirements
  - Credit requirements
  - Existing account filter (don't offer savings if they have one)
  - Avoid harmful suggestions (no payday loans, predatory products)
- Return: Eligible (True/False) with reason

**Task 2.4.2**: Filter ineligible offers
- Duration: 30 minutes
- Modify recommendation generation to filter offers
- Only include eligible offers in output
- Log ineligible offers for operator review
- Return eligibility status with recommendations

**Task 2.4.3**: Test eligibility checking
- Duration: 15 minutes
- Test: High-yield savings offer (check existing accounts)
- Test: Balance transfer card (check credit requirements)
- Test: Harmful product filtering (payday loans blocked)
- Verify: Only eligible offers included

#### Phase 2.5: Tone Guardrails (60 minutes)

**Task 2.5.1**: Implement tone checker
- Duration: 30 minutes
- Create `guardrails/tone_checker.py`
- Function: `check_tone(text: str) -> dict`
- Check for:
  - Shaming language ("you're overspending")
  - Judgmental phrases
  - Negative tone indicators
- Return: Tone score and flags

**Task 2.5.2**: Validate recommendation tone
- Duration: 20 minutes
- Run tone check on all rationales
- Filter or rewrite shaming language
- Ensure empowering, educational tone
- Use neutral, supportive language

**Task 2.5.3**: Test tone checking
- Duration: 10 minutes
- Test: Shaming language detection
- Test: Judgmental phrase detection
- Test: Neutral tone preservation
- Verify: All recommendations pass tone check

#### Phase 2.6: Operator View (150 minutes)

**Task 2.6.1**: Create REST API endpoints
- Duration: 60 minutes
- Create `ui/api.py` with FastAPI
- Endpoints:
  - `GET /users/{user_id}/signals` (detected signals)
  - `GET /users/{user_id}/persona` (assigned persona)
  - `GET /users/{user_id}/recommendations` (recommendations with rationales)
  - `POST /operator/approve/{recommendation_id}` (approve recommendation)
  - `POST /operator/override/{user_id}` (override recommendations)
  - `GET /operator/review` (approval queue)
- Add request/response models

**Task 2.6.2**: Create operator interface (CLI or Web)
- Duration: 60 minutes
- Option A: CLI interface:
  - `python cli.py view-signals --user-id <id>`
  - `python cli.py view-persona --user-id <id>`
  - `python cli.py view-recommendations --user-id <id>`
  - `python cli.py approve-recommendation --id <id>`
- Option B: Simple web UI (React + Tailwind):
  - Dashboard showing users
  - User detail page with signals, persona, recommendations
  - Approve/override buttons
  - Decision trace view

**Task 2.6.3**: Implement decision trace
- Duration: 30 minutes
- Function: `get_decision_trace(user_id: int) -> dict`
- Include: Features detected, persona assignment rationale, recommendation matching logic
- Store trace in database for audit
- Display in operator view

#### Phase 2.7: Enhanced Testing (90 minutes)

**Task 2.7.1**: Write integration tests
- Duration: 45 minutes
- Test: Full flow from data → features → persona → recommendations
- Test: Consent enforcement in flow
- Test: Eligibility filtering in flow
- Test: Tone checking in flow
- Test: Operator approval flow

**Task 2.7.2**: Write operator view tests
- Duration: 30 minutes
- Test: API endpoints return correct data
- Test: Operator can approve recommendations
- Test: Operator can override recommendations
- Test: Decision trace is accurate

**Task 2.7.3**: Integrated Unit Testing for Phase 2
- Duration: 15 minutes
- Run full test suite: `pytest`
- Verify: All Phase 1 + Phase 2 tests pass
- Document any edge cases

#### Phase 2.8: Early Submission Demo Video Preparation (45 minutes)

**Task 2.8.1**: Create 3-minute demo video script
- Duration: 20 minutes
- Script should cover:
  - Introduction (10s): "SpendSense Early Submission - now with recommendations and guardrails"
  - Signal Detection (30s): Show subscription, savings, credit, income signals for a user
  - Persona Assignment (20s): Show persona assignment with criteria matching
  - Recommendation Generation (50s): Show recommendations with rationales, explain plain language
  - Consent & Eligibility (30s): Show consent enforcement, eligibility filtering
  - Operator View (30s): Show operator interface reviewing recommendations
  - Conclusion (10s): "Demonstrates explainable, consent-aware financial education system"

**Task 2.8.2**: Create cue card with narration and highlights
- Duration: 15 minutes
- Include narration for each section
- Bullet points for key UI elements/outputs
- Visual cues for operator interface
- Timing markers for 3-minute target

---

### Phase 3: Final Submission (Due Sunday, November 9, 2025)

**Objective**: Evaluation harness, comprehensive testing, documentation

#### Phase 3.1: Evaluation Harness (180 minutes)

**Task 3.1.1**: Implement coverage metric
- Duration: 30 minutes
- Create `eval/metrics.py`
- Function: `calculate_coverage(users: List[int]) -> dict`
- Metric: % of users with assigned persona AND ≥3 detected behaviors
- Target: 100% coverage
- Calculate and return coverage percentage

**Task 3.1.2**: Implement explainability metric
- Duration: 30 minutes
- Function: `calculate_explainability(recommendations: List[dict]) -> dict`
- Metric: % of recommendations with plain-language rationales
- Target: 100% explainability
- Check: Rationales exist, cite data, plain language

**Task 3.1.3**: Implement latency metric
- Duration: 30 minutes
- Function: `measure_latency(user_id: int) -> dict`
- Metric: Time to generate recommendations per user
- Target: <5 seconds per user
- Measure: Feature detection + persona assignment + recommendation generation
- Return: Latency in seconds

**Task 3.1.4**: Implement auditability metric
- Duration: 30 minutes
- Function: `calculate_auditability(recommendations: List[dict]) -> dict`
- Metric: % of recommendations with decision traces
- Target: 100% auditability
- Check: Decision traces exist for all recommendations

**Task 3.1.5**: Implement fairness metric (basic)
- Duration: 30 minutes
- Function: `calculate_fairness(users: List[int]) -> dict`
- Basic check: Demographic parity if synthetic data includes demographics
- Calculate: Persona distribution across groups
- Flag: Significant disparities (>20% difference)
- Return: Fairness report

**Task 3.1.6**: Create evaluation harness
- Duration: 30 minutes
- Create `eval/harness.py`
- Function: `run_evaluation(users: List[int]) -> dict`
- Run all metrics: Coverage, Explainability, Latency, Auditability, Fairness
- Generate: JSON/CSV metrics file
- Generate: Summary report (1-2 pages)

#### Phase 3.2: Evaluation Reports (90 minutes)

**Task 3.2.1**: Generate metrics file
- Duration: 30 minutes
- Function: `generate_metrics_file(results: dict, format: str = 'json')`
- Export: All metrics to JSON or CSV
- Include: Per-user metrics, aggregate metrics
- Save: `eval/output/metrics.json` or `metrics.csv`

**Task 3.2.2**: Generate summary report
- Duration: 45 minutes
- Function: `generate_summary_report(results: dict) -> str`
- Sections:
  - Executive Summary
  - Coverage Results
  - Explainability Results
  - Latency Results
  - Auditability Results
  - Fairness Analysis
  - Limitations and Recommendations
- Save: `eval/output/summary_report.md`

**Task 3.2.3**: Generate per-user decision traces
- Duration: 15 minutes
- Function: `generate_decision_traces(users: List[int])`
- Export: Decision trace for each user
- Include: Features, persona assignment, recommendation logic
- Save: `eval/output/decision_traces.json`

#### Phase 3.3: Custom Persona (90 minutes)

**Task 3.3.1**: Design custom persona (Persona 5)
- Duration: 30 minutes
- Create custom persona based on behavioral signals
- Example: "Credit Score Builder" (low utilization, on-time payments, growing savings)
- Document: Clear criteria, rationale, primary educational focus
- Add to `personas/personas.py`

**Task 3.3.2**: Implement custom persona assignment
- Duration: 30 minutes
- Add custom persona to assignment logic
- Update prioritization if multiple personas match
- Document prioritization logic clearly
- Test: Assignment for users matching custom persona

**Task 3.3.3**: Test custom persona
- Duration: 30 minutes
- Create test users matching custom persona
- Test: Persona assignment works
- Test: Recommendations match persona
- Verify: All criteria documented and working

#### Phase 3.4: Comprehensive Testing (120 minutes)

**Task 3.4.1**: Write comprehensive unit tests
- Duration: 60 minutes
- Test: All signal detection functions
- Test: All persona assignment logic
- Test: All recommendation generation
- Test: All guardrails (consent, eligibility, tone)
- Test: All evaluation metrics
- Target: ≥10 unit tests

**Task 3.4.2**: Write integration tests
- Duration: 45 minutes
- Test: End-to-end flow (data → features → persona → recommendations)
- Test: Consent enforcement in full flow
- Test: Eligibility filtering in full flow
- Test: Operator approval flow
- Test: Evaluation harness execution

**Task 3.4.3**: Integrated Unit Testing for Phase 3
- Duration: 15 minutes
- Run complete test suite: `pytest`
- Verify: All tests pass
- Check: Test coverage (aim for >80%)
- Document: Test results summary

#### Phase 3.5: Documentation (120 minutes)

**Task 3.5.1**: Write technical writeup (1-2 pages)
- Duration: 45 minutes
- Sections:
  - System Overview
  - Architecture Decisions
  - Key Technical Choices
  - Signal Detection Approach
  - Persona Assignment Logic
  - Recommendation Engine Design
  - Guardrails Implementation
  - Known Limitations
  - Future Improvements

**Task 3.5.2**: Create decision log
- Duration: 30 minutes
- Document key decisions:
  - Why SQLite over PostgreSQL
  - Why Python over Node.js
  - Why rule-based over ML-based
  - Why virtual split (if applicable)
  - Tradeoffs and alternatives considered

**Task 3.5.3**: Update README
- Duration: 30 minutes
- Complete setup instructions
- Usage examples
- API documentation (if applicable)
- Testing instructions
- Evaluation harness usage
- Troubleshooting section

**Task 3.5.4**: Document AI tools and prompts
- Duration: 15 minutes
- List AI tools used (Cursor, Copilot, etc.)
- Document key prompts
- Acknowledge AI assistance

#### Phase 3.6: Code Evaluation, Refactoring & Security Assessment (90 minutes)

**Task 3.6.1**: Code evaluation and refactoring
- Duration: 45 minutes
- Review: All Python/Node.js code for best practices
- Refactor: Duplicate code, improve naming conventions
- Refactor: Improve code organization and structure
- Refactor: Enhance error handling and validation
- Verify: Code follows Python/TypeScript best practices
- Review: Data processing logic for efficiency
- Optimize: Database queries and data aggregation

**Task 3.6.2**: Security assessment
- Duration: 45 minutes
- Assess: Data privacy and PII handling
- Check: Input validation and sanitization (synthetic data, user inputs)
- Check: SQL injection vulnerabilities (if using SQL)
- Check: API security (authentication, authorization)
- Review: Consent management implementation (secure storage)
- Review: Financial data handling (disclaimer compliance)
- Document: Security findings and mitigations
- Verify: No real PII in synthetic data

#### Phase 3.7: Final Polish (60 minutes)

**Task 3.7.1**: Code cleanup and linting
- Duration: 30 minutes
- Run linter: `pylint` or `flake8`
- Fix all linting errors
- Format code: `black` or `autopep8`
- Remove debug code
- Add docstrings to all functions

**Task 3.7.2**: Final verification checklist
- Duration: 30 minutes
- ✅ All test scenarios pass (≥10 tests)
- ✅ Coverage: 100% users with persona + ≥3 behaviors
- ✅ Explainability: 100% recommendations with rationales
- ✅ Latency: <5 seconds per user
- ✅ Auditability: 100% with decision traces
- ✅ README complete and accurate
- ✅ Technical writeup complete
- ✅ Evaluation report generated
- ✅ No secrets in code or commits

#### Phase 3.8: Final Submission Demo Video Preparation (45 minutes)

**Task 3.8.1**: Create 3-minute demo video script
- Duration: 20 minutes
- Script should cover:
  - Introduction (10s): "SpendSense - Complete financial education system"
  - System Overview (20s): Architecture, components, data flow
  - Signal Detection (30s): Show subscription, savings, credit, income detection
  - Persona Assignment (20s): Show 5 personas, assignment logic
  - Recommendation Engine (40s): Show recommendations with rationales, plain language
  - Guardrails (30s): Show consent enforcement, eligibility filtering, tone checking
  - Operator View (20s): Show operator reviewing and approving recommendations
  - Evaluation Results (20s): Show metrics (coverage, explainability, latency)
  - Conclusion (10s): "Complete explainable, consent-aware financial education system"

**Task 3.8.2**: Create cue card with narration and highlights
- Duration: 15 minutes
- Final polished version with all features
- Include visual demonstrations of UI/CLI
- Highlight key metrics and achievements
- Show evaluation results

#### Phase 3.9: Integrated Unit Testing for Phase 3
- Duration: 15 minutes
- Run complete test suite: `pytest`
- Run evaluation harness: `python eval/harness.py`
- Verify: All metrics calculated correctly
- Document: Final test results summary

---

## Success Criteria

### MVP (Phase 1) - November 4
- ✅ Synthetic data generator creates 50-100 users
- ✅ Subscription signal detection working
- ✅ Savings signal detection working
- ✅ Credit utilization detection working
- ✅ Income stability detection working
- ✅ Feature aggregation working (30d and 180d windows)
- ✅ Basic persona assignment working (4 personas)
- ✅ Unit tests for signal detection passing

### Early Submission (Phase 2) - November 7
- ✅ Recommendation engine generating recommendations with rationales
- ✅ Consent management enforced
- ✅ Eligibility guardrails filtering ineligible offers
- ✅ Tone guardrails ensuring neutral language
- ✅ Operator view functional (CLI or web)
- ✅ Integration tests passing

### Final Submission (Phase 3) - November 9
- ✅ Evaluation harness implemented and run
- ✅ Coverage: 100% users with persona + ≥3 behaviors
- ✅ Explainability: 100% recommendations with rationales
- ✅ Latency: <5 seconds per user
- ✅ Auditability: 100% with decision traces
- ✅ Custom persona (5th persona) implemented
- ✅ Comprehensive test suite (≥10 tests) passing
- ✅ Technical writeup complete
- ✅ Evaluation report generated

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Synthetic data unrealistic | Medium | Use real-world transaction patterns, validate with domain knowledge |
| Signal detection false positives | Medium | Tune thresholds based on test data, validate with manual review |
| Persona assignment errors | Medium | Document criteria clearly, test with known users, log assignment rationale |
| Recommendation quality | High | Use plain language, cite data, validate with operator review |
| Latency too high | Medium | Optimize database queries, cache features, profile bottlenecks |
| Time constraints | High | MVP is safety net, recommendations are enhancement, prioritize core signals first |

---

## Deliverables Checklist

### Code Repository
- [ ] GitHub repository with clean structure
- [ ] All Python code in organized modules
- [ ] All tests in `tests/` directory
- [ ] README.md with setup instructions
- [ ] requirements.txt with dependencies
- [ ] .env.example with configuration placeholders
- [ ] .gitignore configured properly

### Documentation
- [ ] Technical writeup (1-2 pages)
- [ ] Decision log with key architectural choices
- [ ] README with complete setup and usage
- [ ] API documentation (if applicable)
- [ ] AI tools and prompts documentation

### Testing
- [ ] Unit tests for all signal detection functions (≥10 tests)
- [ ] Integration tests for full flow
- [ ] Evaluation harness results

### Evaluation
- [ ] Metrics file (JSON/CSV)
- [ ] Summary report (1-2 pages)
- [ ] Per-user decision traces
- [ ] Fairness analysis (if applicable)

### Demo
- [ ] Demo script or UI working end-to-end
- [ ] Demo video (3 minutes)
- [ ] Demo video script
- [ ] Demo video cue card

---

## Notes

- **No Financial Advice**: Include disclaimer: "This is educational content, not financial advice. Consult a licensed advisor for personalized guidance."
- **No Real PII**: Synthetic data only, fake names, masked account numbers
- **Consent First**: No recommendations without explicit consent
- **Explainability Required**: Every recommendation needs a clear rationale
- **Plain Language**: No jargon, cite concrete data points

---

**Document Version**: 1.1  
**Created**: October 31, 2025  
**Last Updated**: November 3, 2025  
**Project Start Date**: November 3, 2025  
**Framework**: Based on October 16, 2025 success path methodology

