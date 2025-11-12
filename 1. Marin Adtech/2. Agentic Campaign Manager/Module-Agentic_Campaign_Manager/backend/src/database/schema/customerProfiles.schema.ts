/**
 * Customer Profiles Database Schema
 * TypeScript interfaces that match the database tables for type safety
 *
 * This file provides TypeScript types for database records to ensure
 * type safety when working with database queries and results.
 *
 * @module customerProfiles.schema
 */

// ============================================================================
// Database Record Types
// ============================================================================

/**
 * Target Customer Profile Database Record
 * Matches the target_customer_profiles table structure
 */
export interface TargetCustomerProfileRecord {
  // Primary identifiers
  id: string; // UUID
  name: string;
  description: string | null;
  account_id: string;

  // Profile content (JSONB columns)
  demographics: Record<string, any> | null; // JSONB
  interests: string[] | null; // TEXT[]
  behavior: Record<string, any> | null; // JSONB
  persona: Record<string, any> | null; // JSONB

  // Status and versioning
  is_default: boolean;
  is_active: boolean;
  version: number;

  // Timestamps
  created_at: Date;
  updated_at: Date;

  // Audit fields
  created_by: string | null;
  updated_by: string | null;

  // Metadata
  metadata: Record<string, any>; // JSONB

  // Soft delete
  deleted_at: Date | null;
}

/**
 * Brand Guidelines Database Record
 * Matches the brand_guidelines table structure
 */
export interface BrandGuidelinesRecord {
  // Primary identifiers
  id: string; // UUID
  brand_name: string;
  brand_description: string | null;
  account_id: string;

  // Guidelines detail level
  detail_level: 'high-level' | 'full';

  // Guidelines content (JSONB columns)
  high_level_guidelines: Record<string, any> | null; // JSONB
  full_style_guide: Record<string, any> | null; // JSONB

  // Brand context
  industry: string | null;
  target_audience: string | null;
  brand_values: string[] | null; // TEXT[]
  positioning_statement: string | null;
  competitors: string[] | null; // TEXT[]

  // Status and versioning
  version: number;
  is_active: boolean;

  // Timestamps
  created_at: Date;
  updated_at: Date;

  // Audit fields
  created_by: string | null;
  updated_by: string | null;

  // Metadata
  metadata: Record<string, any>; // JSONB

  // Soft delete
  deleted_at: Date | null;
}

/**
 * Budget Database Record
 * Matches the budgets table structure
 */
export interface BudgetRecord {
  // Primary identifiers
  id: string; // UUID
  name: string;
  account_id: string;

  // Budget configuration
  amount: number; // DECIMAL(15, 2)
  delivery_method: 'STANDARD' | 'ACCELERATED';
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'CAMPAIGN_TOTAL' | 'CUSTOM';
  status: 'ACTIVE' | 'PAUSED' | 'EXHAUSTED' | 'EXPIRED' | 'REMOVED';
  type: 'CAMPAIGN' | 'ADGROUP' | 'ACCOUNT' | 'PORTFOLIO' | 'EXPERIMENT';
  currency: string;

  // Date range
  start_date: string | null; // DATE
  end_date: string | null; // DATE

  // Shared budget configuration
  is_shared: boolean;
  campaign_ids: string[] | null; // TEXT[]

  // Budget tracking
  amount_spent: number; // DECIMAL(15, 2)
  amount_remaining: number | null; // DECIMAL(15, 2) - calculated
  percentage_spent: number; // DECIMAL(5, 2)
  utilization_rate: number | null; // DECIMAL(10, 4)

  // Auto-replenish
  auto_replenish: boolean;

  // Alerts (JSONB array)
  alerts: Record<string, any>[]; // JSONB

  // Timestamps
  created_at: Date;
  updated_at: Date;

  // Audit fields
  created_by: string | null;
  updated_by: string | null;

  // Metadata
  metadata: Record<string, any>; // JSONB

  // Soft delete
  deleted_at: Date | null;
}

/**
 * Customer Profile Container Database Record
 * Matches the customer_profile_containers table structure
 */
export interface CustomerProfileContainerRecord {
  // Primary identifiers
  id: string; // UUID
  account_id: string;
  name: string;
  description: string | null;

  // Profile references (Foreign Keys)
  customer_profile_id: string; // UUID
  brand_guidelines_id: string; // UUID
  budget_id: string; // UUID

  // Container configuration
  is_default: boolean;
  is_primary: boolean;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED' | 'DRAFT';
  version: number;

  // Container completeness
  is_complete: boolean;
  missing_profiles: string[] | null; // TEXT[]

  // Timestamps
  created_at: Date;
  updated_at: Date;

  // Audit fields
  created_by: string | null;
  updated_by: string | null;

  // Metadata
  metadata: Record<string, any>; // JSONB

  // Soft delete
  deleted_at: Date | null;
}

/**
 * Campaign Profile Usage Database Record
 * Matches the campaign_profile_usage table structure
 */
export interface CampaignProfileUsageRecord {
  // Primary identifier
  id: string; // UUID

  // Campaign reference
  campaign_id: string;

  // Profile container reference
  container_id: string | null; // UUID

  // Individual profile references
  customer_profile_id: string | null; // UUID
  brand_guidelines_id: string | null; // UUID
  budget_id: string | null; // UUID

  // Account
  account_id: string;

  // Usage tracking
  usage_type: 'CONTAINER' | 'INDIVIDUAL' | 'HYBRID';
  is_active: boolean;

  // Timestamps
  created_at: Date;
  updated_at: Date;

  // Audit fields
  created_by: string | null;

  // Metadata
  metadata: Record<string, any>; // JSONB
}

// ============================================================================
// Extended Record Types (with joined data)
// ============================================================================

/**
 * Customer Profile Container with Full Profile Data
 * Used when querying containers with all associated profiles
 */
export interface CustomerProfileContainerWithProfiles extends CustomerProfileContainerRecord {
  customer_profile: TargetCustomerProfileRecord;
  brand_guidelines: BrandGuidelinesRecord;
  budget: BudgetRecord;
}

/**
 * Campaign Profile Usage with Full Profile Data
 * Used when querying usage records with all associated profiles
 */
export interface CampaignProfileUsageWithProfiles extends CampaignProfileUsageRecord {
  container?: CustomerProfileContainerWithProfiles;
  customer_profile?: TargetCustomerProfileRecord;
  brand_guidelines?: BrandGuidelinesRecord;
  budget?: BudgetRecord;
}

// ============================================================================
// Insert/Update Types (without auto-generated fields)
// ============================================================================

/**
 * Target Customer Profile Insert Data
 * Used when inserting new records (excludes auto-generated fields)
 */
export type TargetCustomerProfileInsert = Omit<
  TargetCustomerProfileRecord,
  'id' | 'created_at' | 'updated_at' | 'deleted_at'
> & {
  id?: string; // Optional - will be auto-generated if not provided
};

/**
 * Brand Guidelines Insert Data
 * Used when inserting new records (excludes auto-generated fields)
 */
export type BrandGuidelinesInsert = Omit<
  BrandGuidelinesRecord,
  'id' | 'created_at' | 'updated_at' | 'deleted_at'
> & {
  id?: string; // Optional - will be auto-generated if not provided
};

/**
 * Budget Insert Data
 * Used when inserting new records (excludes auto-generated fields)
 */
export type BudgetInsert = Omit<
  BudgetRecord,
  'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'amount_remaining'
> & {
  id?: string; // Optional - will be auto-generated if not provided
};

/**
 * Customer Profile Container Insert Data
 * Used when inserting new records (excludes auto-generated fields)
 */
export type CustomerProfileContainerInsert = Omit<
  CustomerProfileContainerRecord,
  'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'is_complete'
> & {
  id?: string; // Optional - will be auto-generated if not provided
};

/**
 * Campaign Profile Usage Insert Data
 * Used when inserting new records (excludes auto-generated fields)
 */
export type CampaignProfileUsageInsert = Omit<
  CampaignProfileUsageRecord,
  'id' | 'created_at' | 'updated_at'
> & {
  id?: string; // Optional - will be auto-generated if not provided
};

/**
 * Target Customer Profile Update Data
 * Used when updating records (all fields optional except those that shouldn't change)
 */
export type TargetCustomerProfileUpdate = Partial<
  Omit<
    TargetCustomerProfileRecord,
    'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'account_id'
  >
>;

/**
 * Brand Guidelines Update Data
 * Used when updating records (all fields optional except those that shouldn't change)
 */
export type BrandGuidelinesUpdate = Partial<
  Omit<
    BrandGuidelinesRecord,
    'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'account_id'
  >
>;

/**
 * Budget Update Data
 * Used when updating records (all fields optional except those that shouldn't change)
 */
export type BudgetUpdate = Partial<
  Omit<
    BudgetRecord,
    'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'account_id' | 'amount_remaining'
  >
>;

/**
 * Customer Profile Container Update Data
 * Used when updating records (all fields optional except those that shouldn't change)
 */
export type CustomerProfileContainerUpdate = Partial<
  Omit<
    CustomerProfileContainerRecord,
    'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'account_id' | 'is_complete'
  >
>;

/**
 * Campaign Profile Usage Update Data
 * Used when updating records (all fields optional except those that shouldn't change)
 */
export type CampaignProfileUsageUpdate = Partial<
  Omit<
    CampaignProfileUsageRecord,
    'id' | 'created_at' | 'updated_at' | 'account_id' | 'campaign_id'
  >
>;

// ============================================================================
// Query Result Types
// ============================================================================

/**
 * Profile Counts Query Result
 * Result from querying profile counts for an account
 */
export interface ProfileCountsResult {
  account_id: string;
  customer_profiles_count: number;
  brand_guidelines_count: number;
  budgets_count: number;
  containers_count: number;
  total_count: number;
}

/**
 * Account Profile Status Query Result
 * Result from checking account profile status for first-time user detection
 */
export interface AccountProfileStatusResult {
  account_id: string;
  has_customer_profile: boolean;
  has_brand_guidelines: boolean;
  has_budget: boolean;
  has_container: boolean;
  is_first_time_user: boolean;
  profile_counts: ProfileCountsResult;
}

// ============================================================================
// Database Query Helpers
// ============================================================================

/**
 * Table Names
 * Centralized table name constants
 */
export const TABLE_NAMES = {
  TARGET_CUSTOMER_PROFILES: 'target_customer_profiles',
  BRAND_GUIDELINES: 'brand_guidelines',
  BUDGETS: 'budgets',
  CUSTOMER_PROFILE_CONTAINERS: 'customer_profile_containers',
  CAMPAIGN_PROFILE_USAGE: 'campaign_profile_usage',
} as const;

/**
 * Common Column Names
 * Frequently used column names
 */
export const COMMON_COLUMNS = {
  ID: 'id',
  ACCOUNT_ID: 'account_id',
  CREATED_AT: 'created_at',
  UPDATED_AT: 'updated_at',
  DELETED_AT: 'deleted_at',
  IS_ACTIVE: 'is_active',
  METADATA: 'metadata',
} as const;

/**
 * Soft Delete Filter
 * SQL condition for filtering out soft-deleted records
 */
export const SOFT_DELETE_FILTER = 'deleted_at IS NULL';

/**
 * Active Records Filter
 * SQL condition for filtering to only active records
 */
export const ACTIVE_RECORDS_FILTER = 'is_active = TRUE AND deleted_at IS NULL';

/**
 * Sort Orders
 * Common sort order options
 */
export const SORT_ORDERS = {
  ASC: 'ASC',
  DESC: 'DESC',
} as const;

/**
 * Common Sort Fields
 * Frequently used sort field options
 */
export const SORT_FIELDS = {
  CREATED_AT: 'created_at',
  UPDATED_AT: 'updated_at',
  NAME: 'name',
} as const;

// ============================================================================
// Type Conversion Helpers
// ============================================================================

/**
 * Converts a database record to application type
 * Handles conversion of snake_case to camelCase if needed
 */
export function recordToType<T extends Record<string, any>>(record: any): T {
  // This is a placeholder for actual conversion logic
  // Implement actual field mapping based on your needs
  return record as T;
}

/**
 * Converts an application type to database record format
 * Handles conversion of camelCase to snake_case if needed
 */
export function typeToRecord<T extends Record<string, any>>(data: any): T {
  // This is a placeholder for actual conversion logic
  // Implement actual field mapping based on your needs
  return data as T;
}

// ============================================================================
// Type Exports
// ============================================================================

/**
 * Union type of all database record types
 */
export type DatabaseRecord =
  | TargetCustomerProfileRecord
  | BrandGuidelinesRecord
  | BudgetRecord
  | CustomerProfileContainerRecord
  | CampaignProfileUsageRecord;

/**
 * Union type of all insert types
 */
export type DatabaseInsert =
  | TargetCustomerProfileInsert
  | BrandGuidelinesInsert
  | BudgetInsert
  | CustomerProfileContainerInsert
  | CampaignProfileUsageInsert;

/**
 * Union type of all update types
 */
export type DatabaseUpdate =
  | TargetCustomerProfileUpdate
  | BrandGuidelinesUpdate
  | BudgetUpdate
  | CustomerProfileContainerUpdate
  | CampaignProfileUsageUpdate;
