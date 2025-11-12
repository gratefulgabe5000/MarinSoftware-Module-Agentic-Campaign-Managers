/**
 * Budget Types (Frontend)
 * Comprehensive TypeScript type definitions for Budget management
 * Compatible with backend budget types and Zilkr Dispatcher API for Google Ads campaign budgets
 *
 * @module budget.types
 */

// ============================================================================
// Base Budget Types
// ============================================================================

/**
 * Budget delivery method determines how budget is spent throughout the day
 * - STANDARD: Budget is spent evenly throughout the day (recommended)
 * - ACCELERATED: Budget is spent as quickly as possible (may exhaust budget early)
 */
export type BudgetDeliveryMethod = 'STANDARD' | 'ACCELERATED';

/**
 * Budget period defines the time frame for budget allocation
 */
export type BudgetPeriod =
  | 'DAILY'           // Daily budget limit
  | 'WEEKLY'          // Weekly budget limit
  | 'MONTHLY'         // Monthly budget limit
  | 'QUARTERLY'       // Quarterly budget limit
  | 'YEARLY'          // Yearly budget limit
  | 'CAMPAIGN_TOTAL'  // Total campaign lifetime budget
  | 'CUSTOM';         // Custom date range budget

/**
 * Budget status indicates the current state of the budget
 */
export type BudgetStatus =
  | 'ACTIVE'      // Budget is active and being used
  | 'PAUSED'      // Budget is paused (not being spent)
  | 'EXHAUSTED'   // Budget has been fully spent
  | 'EXPIRED'     // Budget period has ended
  | 'REMOVED';    // Budget has been removed/deleted

/**
 * Budget type categorization for different use cases
 */
export type BudgetType =
  | 'CAMPAIGN'        // Campaign-level budget
  | 'ADGROUP'         // Ad group-level budget
  | 'ACCOUNT'         // Account-level budget
  | 'PORTFOLIO'       // Portfolio/shared budget
  | 'EXPERIMENT';     // Experimental/test budget

// ============================================================================
// Core Budget Interfaces
// ============================================================================

/**
 * Budget interface with comprehensive configuration options
 * This is the main budget object used throughout the application
 */
export interface Budget {
  /** Unique budget identifier */
  id: string;

  /** Budget name for identification and reporting */
  name: string;

  /** Account ID this budget belongs to */
  accountId: string;

  /** Budget amount in dollars (NOT micros) */
  amount: number;

  /** Budget delivery method (STANDARD or ACCELERATED) */
  deliveryMethod: BudgetDeliveryMethod;

  /** Budget period (DAILY, MONTHLY, CAMPAIGN_TOTAL, etc.) */
  period: BudgetPeriod;

  /** Budget status (ACTIVE, PAUSED, EXHAUSTED, etc.) */
  status: BudgetStatus;

  /** Budget type categorization */
  type: BudgetType;

  /** Currency code (ISO 4217, e.g., "USD", "EUR", "GBP") */
  currency?: string;

  /** Budget start date (YYYY-MM-DD format) */
  startDate?: string;

  /** Budget end date (YYYY-MM-DD format, optional) */
  endDate?: string;

  /** Whether this is a shared budget across multiple campaigns */
  isShared?: boolean;

  /** Campaign IDs using this budget (if shared) */
  campaignIds?: string[];

  /** Amount spent so far (in dollars) */
  amountSpent?: number;

  /** Remaining budget amount (in dollars) */
  amountRemaining?: number;

  /** Percentage of budget spent (0-100) */
  percentageSpent?: number;

  /** Budget utilization rate (spending per day/week/month) */
  utilizationRate?: number;

  /** Whether budget auto-replenishes (for recurring budgets) */
  autoReplenish?: boolean;

  /** Budget alerts and thresholds */
  alerts?: BudgetAlert[];

  /** ISO 8601 timestamp when budget was created */
  createdAt: Date;

  /** ISO 8601 timestamp when budget was last updated */
  updatedAt: Date;

  /** User ID who created the budget */
  createdBy?: string;

  /** User ID who last updated the budget */
  updatedBy?: string;

  /** Additional metadata */
  metadata?: {
    /** Tags for organization */
    tags?: string[];
    /** Internal notes */
    notes?: string;
    /** Budget source (e.g., "manual", "imported", "ai_generated") */
    source?: string;
    /** Reference to original budget if this is a copy */
    originalBudgetId?: string;
  };
}

/**
 * Budget alert configuration for monitoring and notifications
 */
export interface BudgetAlert {
  /** Alert threshold as percentage of budget (0-100) */
  threshold: number;

  /** Alert type */
  type: 'PERCENTAGE' | 'ABSOLUTE_AMOUNT' | 'TIME_BASED';

  /** Whether this alert has been triggered */
  triggered: boolean;

  /** Timestamp when alert was triggered */
  triggeredAt?: Date;

  /** Alert message/description */
  message?: string;

  /** Notification channels (email, slack, etc.) */
  channels?: string[];
}

/**
 * Budget allocation breakdown by category, channel, or campaign
 */
export interface BudgetAllocation {
  /** Allocation identifier */
  id: string;

  /** Budget ID this allocation belongs to */
  budgetId: string;

  /** Allocation name/description */
  name: string;

  /** Allocated amount in dollars */
  amount: number;

  /** Allocation percentage of total budget (0-100) */
  percentage: number;

  /** Category, channel, or campaign this allocation is for */
  target: {
    /** Target type (campaign, channel, category) */
    type: 'CAMPAIGN' | 'CHANNEL' | 'CATEGORY' | 'ADGROUP' | 'PRODUCT';
    /** Target ID or name */
    id: string;
    /** Target display name */
    name: string;
  };

  /** Amount spent from this allocation */
  amountSpent?: number;

  /** Whether this allocation is locked/fixed */
  isLocked?: boolean;

  /** Priority level for budget distribution */
  priority?: number;
}

// ============================================================================
// Zilkr Budget Compatibility Types
// ============================================================================

/**
 * Zilkr-compatible budget interface
 * This interface ensures budget data can be converted to ZilkrBudgetRequest format
 * Use this when creating budgets that will be sent to Zilkr Dispatcher
 */
export interface ZilkrBudgetCompatible {
  /** The Zilkr account ID (required by Zilkr API) */
  accountId: string;

  /** Budget amount in dollars (NOT micros) - Zilkr requirement */
  amount: number;

  /** Budget delivery method (STANDARD or ACCELERATED) - Zilkr requirement */
  deliveryMethod: BudgetDeliveryMethod;

  /** Budget name (optional, for internal tracking) */
  name?: string;

  /** Budget period (optional, for internal tracking) */
  period?: BudgetPeriod;
}

/**
 * Zilkr budget response data
 * Represents the response from Zilkr Dispatcher after creating a budget
 */
export interface ZilkrBudgetResponseData {
  /** Unique budget ID from Zilkr/Google Ads */
  budgetId: string;

  /** Full resource name (e.g., customers/{ID}/campaignBudgets/{BUDGET_ID}) */
  resourceName: string;

  /** Budget amount in dollars */
  amount: number;

  /** Budget delivery method */
  deliveryMethod: string;

  /** Operation status */
  status: 'SUCCESS' | 'FAILURE';

  /** Resource ID (may be different from budgetId) */
  resourceId?: string;

  /** Error messages if operation failed */
  errors?: string[];

  /** Warning messages */
  warnings?: string[];
}

// ============================================================================
// Budget Request/Response Interfaces
// ============================================================================

/**
 * Budget creation request interface
 * Used when creating a new budget in the system
 */
export interface BudgetCreationRequest {
  /** Budget name for identification */
  name: string;

  /** Account ID this budget belongs to */
  accountId: string;

  /** Budget amount in dollars */
  amount: number;

  /** Budget delivery method */
  deliveryMethod: BudgetDeliveryMethod;

  /** Budget period */
  period: BudgetPeriod;

  /** Budget type */
  type?: BudgetType;

  /** Currency code (default: "USD") */
  currency?: string;

  /** Budget start date (YYYY-MM-DD) */
  startDate?: string;

  /** Budget end date (YYYY-MM-DD) */
  endDate?: string;

  /** Whether this is a shared budget */
  isShared?: boolean;

  /** Campaign IDs to associate with this budget */
  campaignIds?: string[];

  /** Whether budget auto-replenishes */
  autoReplenish?: boolean;

  /** Budget alerts configuration */
  alerts?: Omit<BudgetAlert, 'triggered' | 'triggeredAt'>[];

  /** Additional metadata */
  metadata?: {
    tags?: string[];
    notes?: string;
    source?: string;
  };
}

/**
 * Budget update request interface
 * Used when updating an existing budget
 * All fields are optional - only provided fields will be updated
 */
export interface BudgetUpdateRequest {
  /** New budget name */
  name?: string;

  /** New budget amount */
  amount?: number;

  /** New budget delivery method */
  deliveryMethod?: BudgetDeliveryMethod;

  /** New budget status */
  status?: BudgetStatus;

  /** New budget end date */
  endDate?: string;

  /** Update shared budget setting */
  isShared?: boolean;

  /** Update campaign IDs */
  campaignIds?: string[];

  /** Update auto-replenish setting */
  autoReplenish?: boolean;

  /** Update alerts */
  alerts?: Omit<BudgetAlert, 'triggered' | 'triggeredAt'>[];

  /** Update metadata */
  metadata?: {
    tags?: string[];
    notes?: string;
  };
}

/**
 * Budget query/filter request interface
 * Used when querying or listing budgets with filters
 */
export interface BudgetQueryRequest {
  /** Account ID to filter by */
  accountId: string;

  /** Budget status filter */
  status?: BudgetStatus | BudgetStatus[];

  /** Budget type filter */
  type?: BudgetType | BudgetType[];

  /** Budget period filter */
  period?: BudgetPeriod | BudgetPeriod[];

  /** Campaign ID filter (for shared budgets) */
  campaignId?: string;

  /** Minimum budget amount filter */
  minAmount?: number;

  /** Maximum budget amount filter */
  maxAmount?: number;

  /** Date range filter */
  dateRange?: {
    startDate: string;
    endDate: string;
  };

  /** Search query for budget name */
  searchQuery?: string;

  /** Tags filter */
  tags?: string[];

  /** Pagination: number of results to return */
  limit?: number;

  /** Pagination: number of results to skip */
  offset?: number;

  /** Sort field */
  sortBy?: 'name' | 'amount' | 'createdAt' | 'updatedAt' | 'percentageSpent';

  /** Sort direction */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Budget query response interface
 * Response from budget list/query operations
 */
export interface BudgetQueryResponse {
  /** Array of budgets matching the query */
  budgets: Budget[];

  /** Total number of budgets matching the query */
  total: number;

  /** Limit used for this query */
  limit: number;

  /** Offset used for this query */
  offset: number;

  /** Whether there are more results */
  hasMore: boolean;

  /** Summary statistics */
  summary?: {
    /** Total budget amount across all results */
    totalAmount: number;
    /** Total amount spent across all results */
    totalSpent: number;
    /** Average budget amount */
    averageAmount: number;
    /** Average utilization rate */
    averageUtilization: number;
  };
}

// ============================================================================
// Budget Validation Types
// ============================================================================

/**
 * Budget validation error interface
 */
export interface BudgetValidationError {
  /** Field that has the validation error */
  field: string;

  /** Error message describing the validation issue */
  message: string;

  /** Error code for programmatic handling */
  code?: string;

  /** Suggested value or fix */
  suggestion?: string;
}

/**
 * Budget validation result interface
 * Returned after validating budget data
 */
export interface BudgetValidationResult {
  /** Whether the budget data is valid */
  isValid: boolean;

  /** List of validation errors if invalid */
  errors?: BudgetValidationError[];

  /** List of validation warnings (non-blocking issues) */
  warnings?: string[];

  /** Whether the budget is compatible with Zilkr Dispatcher */
  isZilkrCompatible?: boolean;

  /** Zilkr-specific validation issues */
  zilkrValidationIssues?: string[];
}

// ============================================================================
// Budget Calculation & Analytics Types
// ============================================================================

/**
 * Budget performance metrics
 * Analytics and performance data for budget monitoring
 */
export interface BudgetPerformance {
  /** Budget ID */
  budgetId: string;

  /** Current spend rate (dollars per day) */
  currentSpendRate: number;

  /** Average spend rate over the budget period */
  averageSpendRate: number;

  /** Projected total spend at current rate */
  projectedTotalSpend: number;

  /** Projected end date based on current spend rate */
  projectedEndDate?: string;

  /** Whether budget is on track to be fully utilized */
  isOnTrack: boolean;

  /** Budget pacing (ahead, on-track, behind) */
  pacing: 'AHEAD' | 'ON_TRACK' | 'BEHIND';

  /** Pacing percentage (100 = on track, >100 = ahead, <100 = behind) */
  pacingPercentage: number;

  /** Days remaining in budget period */
  daysRemaining?: number;

  /** Estimated days until budget exhausted */
  daysUntilExhausted?: number;

  /** Budget efficiency score (0-100) */
  efficiencyScore?: number;

  /** ROI (Return on Investment) metrics */
  roi?: {
    /** Revenue generated */
    revenue: number;
    /** ROI percentage */
    percentage: number;
    /** ROAS (Return on Ad Spend) */
    roas: number;
  };

  /** Last calculated timestamp */
  calculatedAt: Date;
}

/**
 * Budget recommendation interface
 * AI-generated or rule-based budget recommendations
 */
export interface BudgetRecommendation {
  /** Recommendation ID */
  id: string;

  /** Budget ID this recommendation is for */
  budgetId: string;

  /** Recommendation type */
  type: 'INCREASE' | 'DECREASE' | 'REALLOCATE' | 'EXTEND_PERIOD' | 'CHANGE_DELIVERY';

  /** Recommendation priority */
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

  /** Recommendation title */
  title: string;

  /** Detailed recommendation description */
  description: string;

  /** Current value */
  currentValue: number | string;

  /** Recommended value */
  recommendedValue: number | string;

  /** Expected impact */
  expectedImpact: {
    /** Metric being impacted */
    metric: string;
    /** Expected change */
    change: number;
    /** Change direction */
    direction: 'INCREASE' | 'DECREASE';
  };

  /** Confidence score (0-100) */
  confidence: number;

  /** Supporting data/reasoning */
  reasoning?: string;

  /** Whether recommendation has been applied */
  isApplied: boolean;

  /** Timestamp when recommendation was generated */
  generatedAt: Date;

  /** Expiration timestamp for time-sensitive recommendations */
  expiresAt?: Date;
}

// ============================================================================
// Helper Functions & Type Guards
// ============================================================================

/**
 * Type guard to check if a string is a valid budget delivery method
 * @param method - The delivery method string to validate
 * @returns True if the delivery method is valid, false otherwise
 */
export function isValidBudgetDeliveryMethod(method: string): method is BudgetDeliveryMethod {
  return ['STANDARD', 'ACCELERATED'].includes(method);
}

/**
 * Type guard to check if a string is a valid budget period
 * @param period - The period string to validate
 * @returns True if the period is valid, false otherwise
 */
export function isValidBudgetPeriod(period: string): period is BudgetPeriod {
  return ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY', 'CAMPAIGN_TOTAL', 'CUSTOM'].includes(period);
}

/**
 * Type guard to check if a string is a valid budget status
 * @param status - The status string to validate
 * @returns True if the status is valid, false otherwise
 */
export function isValidBudgetStatus(status: string): status is BudgetStatus {
  return ['ACTIVE', 'PAUSED', 'EXHAUSTED', 'EXPIRED', 'REMOVED'].includes(status);
}

/**
 * Type guard to check if a string is a valid budget type
 * @param type - The type string to validate
 * @returns True if the type is valid, false otherwise
 */
export function isValidBudgetType(type: string): type is BudgetType {
  return ['CAMPAIGN', 'ADGROUP', 'ACCOUNT', 'PORTFOLIO', 'EXPERIMENT'].includes(type);
}

/**
 * Helper function to convert a Budget to ZilkrBudgetCompatible format
 * @param budget - The budget to convert
 * @returns ZilkrBudgetCompatible object ready for Zilkr API
 */
export function toZilkrBudgetFormat(budget: Budget | BudgetCreationRequest): ZilkrBudgetCompatible {
  return {
    accountId: budget.accountId,
    amount: budget.amount,
    deliveryMethod: budget.deliveryMethod,
    name: budget.name,
    period: 'period' in budget ? budget.period : undefined,
  };
}

/**
 * Helper function to create a Budget from ZilkrBudgetResponseData
 * @param response - Zilkr budget response data
 * @param originalRequest - Original budget creation request
 * @returns Budget object
 */
export function fromZilkrBudgetResponse(
  response: ZilkrBudgetResponseData,
  originalRequest: BudgetCreationRequest
): Budget {
  const now = new Date();

  return {
    id: response.budgetId || response.resourceId || '',
    name: originalRequest.name,
    accountId: originalRequest.accountId,
    amount: response.amount,
    deliveryMethod: response.deliveryMethod as BudgetDeliveryMethod,
    period: originalRequest.period,
    status: response.status === 'SUCCESS' ? 'ACTIVE' : 'PAUSED',
    type: originalRequest.type || 'CAMPAIGN',
    currency: originalRequest.currency || 'USD',
    startDate: originalRequest.startDate,
    endDate: originalRequest.endDate,
    isShared: originalRequest.isShared || false,
    campaignIds: originalRequest.campaignIds || [],
    amountSpent: 0,
    amountRemaining: response.amount,
    percentageSpent: 0,
    autoReplenish: originalRequest.autoReplenish || false,
    alerts: originalRequest.alerts as BudgetAlert[] || [],
    createdAt: now,
    updatedAt: now,
    metadata: originalRequest.metadata,
  };
}

/**
 * Helper function to calculate budget utilization percentage
 * @param amountSpent - Amount spent so far
 * @param totalAmount - Total budget amount
 * @returns Utilization percentage (0-100)
 */
export function calculateUtilization(amountSpent: number, totalAmount: number): number {
  if (totalAmount <= 0) return 0;
  return Math.min(100, (amountSpent / totalAmount) * 100);
}

/**
 * Helper function to calculate remaining budget
 * @param totalAmount - Total budget amount
 * @param amountSpent - Amount spent so far
 * @returns Remaining budget amount
 */
export function calculateRemaining(totalAmount: number, amountSpent: number): number {
  return Math.max(0, totalAmount - amountSpent);
}

/**
 * Helper function to calculate budget pacing
 * @param amountSpent - Amount spent so far
 * @param totalAmount - Total budget amount
 * @param daysElapsed - Days elapsed in budget period
 * @param totalDays - Total days in budget period
 * @returns Pacing information
 */
export function calculatePacing(
  amountSpent: number,
  totalAmount: number,
  daysElapsed: number,
  totalDays: number
): { pacing: 'AHEAD' | 'ON_TRACK' | 'BEHIND'; percentage: number } {
  if (totalDays <= 0 || totalAmount <= 0) {
    return { pacing: 'ON_TRACK', percentage: 100 };
  }

  const expectedSpendPercentage = (daysElapsed / totalDays) * 100;
  const actualSpendPercentage = (amountSpent / totalAmount) * 100;
  const pacingPercentage = (actualSpendPercentage / expectedSpendPercentage) * 100;

  let pacing: 'AHEAD' | 'ON_TRACK' | 'BEHIND';
  if (pacingPercentage > 110) {
    pacing = 'AHEAD';
  } else if (pacingPercentage < 90) {
    pacing = 'BEHIND';
  } else {
    pacing = 'ON_TRACK';
  }

  return { pacing, percentage: pacingPercentage };
}

// ============================================================================
// Type Exports
// ============================================================================

/**
 * Union type of all budget-related request types
 */
export type BudgetRequest = BudgetCreationRequest | BudgetUpdateRequest | BudgetQueryRequest;

/**
 * Union type of all budget-related response types
 */
export type BudgetResponse = Budget | BudgetQueryResponse | ZilkrBudgetResponseData;

/**
 * Union type for budget alert types
 */
export type BudgetAlertType = 'PERCENTAGE' | 'ABSOLUTE_AMOUNT' | 'TIME_BASED';

/**
 * Union type for budget allocation target types
 */
export type BudgetAllocationTargetType = 'CAMPAIGN' | 'CHANNEL' | 'CATEGORY' | 'ADGROUP' | 'PRODUCT';
