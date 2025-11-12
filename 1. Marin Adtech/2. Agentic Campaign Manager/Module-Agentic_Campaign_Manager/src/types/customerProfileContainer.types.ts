/**
 * Customer Profile Container Types (Frontend)
 * Container type that groups Target Customer Profile, Brand Guidelines, and Budget
 * together for account-level management and first-time user detection
 * Compatible with backend Container types for seamless data synchronization
 *
 * @module customerProfileContainer.types
 */

import { TargetCustomerProfile } from './customerProfile.types';
import { BrandGuidelines } from './brandGuidelines.types';
import { Budget } from './budget.types';

// ============================================================================
// Profile Counts Interface
// ============================================================================

/**
 * Profile counts for tracking the number of each profile type in an account
 * Used for first-time user detection and profile management
 */
export interface ProfileCounts {
  /** Number of Target Customer Profiles in the account */
  customerProfiles: number;

  /** Number of Brand Guidelines in the account */
  brandGuidelines: number;

  /** Number of Budgets in the account */
  budgets: number;

  /** Total number of all profiles combined */
  total: number;

  /** Whether the account has at least one of each profile type */
  hasCompleteSet: boolean;

  /** ISO 8601 timestamp when counts were last calculated */
  lastCalculatedAt: Date;
}

// ============================================================================
// Account Profile Status Interface
// ============================================================================

/**
 * Account profile status for first-time user detection
 * Tracks which profiles have been created and provides onboarding guidance
 */
export interface AccountProfileStatus {
  /** Account ID these statuses belong to */
  accountId: string;

  /** Whether this is a first-time user (no profiles created yet) */
  isFirstTimeUser: boolean;

  /** Whether a Target Customer Profile has been created */
  hasCustomerProfile: boolean;

  /** Whether Brand Guidelines have been created */
  hasBrandGuidelines: boolean;

  /** Whether a Budget has been created */
  hasBudget: boolean;

  /** Whether all required profiles have been created */
  hasCompletedOnboarding: boolean;

  /** Profile counts for the account */
  profileCounts: ProfileCounts;

  /** Next recommended step for onboarding */
  nextStep?: 'CREATE_CUSTOMER_PROFILE' | 'CREATE_BRAND_GUIDELINES' | 'CREATE_BUDGET' | 'COMPLETE';

  /** Onboarding progress percentage (0-100) */
  onboardingProgress: number;

  /** Missing profile types that need to be created */
  missingProfiles: Array<'CUSTOMER_PROFILE' | 'BRAND_GUIDELINES' | 'BUDGET'>;

  /** ISO 8601 timestamp when status was last updated */
  lastUpdatedAt: Date;

  /** Additional metadata */
  metadata?: {
    /** When the account was created */
    accountCreatedAt?: Date;
    /** When the first profile was created */
    firstProfileCreatedAt?: Date;
    /** When onboarding was completed */
    onboardingCompletedAt?: Date;
    /** Number of campaigns created (if any) */
    campaignCount?: number;
  };
}

// ============================================================================
// Customer Profile Container Interface
// ============================================================================

/**
 * Customer Profile Container
 * Groups Target Customer Profile, Brand Guidelines, and Budget together
 * for account-level management and easy access to all profile data
 */
export interface CustomerProfileContainer {
  /** Unique container identifier */
  id: string;

  /** Account ID this container belongs to */
  accountId: string;

  /** Container name for identification */
  name: string;

  /** Container description */
  description?: string;

  /** Target Customer Profile ID reference */
  customerProfileId: string;

  /** Brand Guidelines ID reference */
  brandGuidelinesId: string;

  /** Budget ID reference */
  budgetId: string;

  /** Whether this is the default/active container for the account */
  isDefault: boolean;

  /** Whether this is the primary container (for accounts with multiple containers) */
  isPrimary: boolean;

  /** Container version number for tracking changes */
  version: number;

  /** Container status */
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED' | 'DRAFT';

  /** ISO 8601 timestamp when container was created */
  createdAt: Date;

  /** ISO 8601 timestamp when container was last updated */
  updatedAt: Date;

  /** User ID who created the container */
  createdBy?: string;

  /** User ID who last updated the container */
  updatedBy?: string;

  /** Whether all referenced profiles exist and are valid */
  isComplete: boolean;

  /** List of missing or invalid profile references */
  missingProfiles?: Array<'CUSTOMER_PROFILE' | 'BRAND_GUIDELINES' | 'BUDGET'>;

  /** Additional metadata */
  metadata?: {
    /** Tags for organization */
    tags?: string[];
    /** Internal notes */
    notes?: string;
    /** Container purpose or use case */
    purpose?: string;
    /** Number of campaigns using this container */
    usageCount?: number;
    /** Last time the container was used in a campaign */
    lastUsedAt?: Date;
  };
}

// ============================================================================
// Container With Details Interface
// ============================================================================

/**
 * Container With Details
 * Extended container interface that includes the full objects instead of just IDs
 * Used for API responses where complete profile data is needed
 */
export interface ContainerWithDetails extends Omit<CustomerProfileContainer, 'customerProfileId' | 'brandGuidelinesId' | 'budgetId'> {
  /** Full Target Customer Profile object */
  customerProfile: TargetCustomerProfile;

  /** Full Brand Guidelines object */
  brandGuidelines: BrandGuidelines;

  /** Full Budget object */
  budget: Budget;

  /** Combined validation status for all profiles */
  validationStatus: {
    /** Whether all profiles are valid */
    isValid: boolean;
    /** Individual profile validation results */
    profileValidation: {
      /** Whether customer profile is valid */
      customerProfileValid: boolean;
      /** Whether brand guidelines are valid */
      brandGuidelinesValid: boolean;
      /** Whether budget is valid */
      budgetValid: boolean;
    };
    /** Validation errors from any profile */
    errors?: Array<{
      /** Profile type that has the error */
      profileType: 'CUSTOMER_PROFILE' | 'BRAND_GUIDELINES' | 'BUDGET';
      /** Error field */
      field: string;
      /** Error message */
      message: string;
    }>;
    /** Validation warnings from any profile */
    warnings?: string[];
  };
}

// ============================================================================
// Request/Response Interfaces
// ============================================================================

/**
 * Container Creation Request
 * Used when creating a new profile container
 */
export interface ContainerCreationRequest {
  /** Account ID this container belongs to */
  accountId: string;

  /** Container name */
  name: string;

  /** Container description */
  description?: string;

  /** Target Customer Profile ID */
  customerProfileId: string;

  /** Brand Guidelines ID */
  brandGuidelinesId: string;

  /** Budget ID */
  budgetId: string;

  /** Whether this is the default container */
  isDefault?: boolean;

  /** Whether this is the primary container */
  isPrimary?: boolean;

  /** Container status */
  status?: 'ACTIVE' | 'INACTIVE' | 'DRAFT';

  /** Additional metadata */
  metadata?: {
    tags?: string[];
    notes?: string;
    purpose?: string;
  };
}

/**
 * Container Update Request
 * Used when updating an existing profile container
 */
export interface ContainerUpdateRequest {
  /** New container name */
  name?: string;

  /** New container description */
  description?: string;

  /** New Target Customer Profile ID */
  customerProfileId?: string;

  /** New Brand Guidelines ID */
  brandGuidelinesId?: string;

  /** New Budget ID */
  budgetId?: string;

  /** Update default status */
  isDefault?: boolean;

  /** Update primary status */
  isPrimary?: boolean;

  /** Update container status */
  status?: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED' | 'DRAFT';

  /** Update metadata */
  metadata?: {
    tags?: string[];
    notes?: string;
    purpose?: string;
  };
}

/**
 * Container Query Request
 * Used when querying or listing containers
 */
export interface ContainerQueryRequest {
  /** Account ID to filter by */
  accountId: string;

  /** Container status filter */
  status?: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED' | 'DRAFT' | Array<'ACTIVE' | 'INACTIVE' | 'ARCHIVED' | 'DRAFT'>;

  /** Only return default containers */
  isDefault?: boolean;

  /** Only return primary containers */
  isPrimary?: boolean;

  /** Only return complete containers */
  isComplete?: boolean;

  /** Search query for container name */
  searchQuery?: string;

  /** Tags filter */
  tags?: string[];

  /** Include full profile details in response */
  includeDetails?: boolean;

  /** Pagination: number of results to return */
  limit?: number;

  /** Pagination: number of results to skip */
  offset?: number;

  /** Sort field */
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'usageCount';

  /** Sort direction */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Container Query Response
 * Response from container list/query operations
 */
export interface ContainerQueryResponse {
  /** Array of containers matching the query */
  containers: CustomerProfileContainer[] | ContainerWithDetails[];

  /** Total number of containers matching the query */
  total: number;

  /** Limit used for this query */
  limit: number;

  /** Offset used for this query */
  offset: number;

  /** Whether there are more results */
  hasMore: boolean;

  /** Summary statistics */
  summary?: {
    /** Number of active containers */
    activeCount: number;
    /** Number of complete containers */
    completeCount: number;
    /** Number of default containers */
    defaultCount: number;
  };
}

// ============================================================================
// Validation Interfaces
// ============================================================================

/**
 * Container Validation Error
 */
export interface ContainerValidationError {
  /** Field that has the validation error */
  field: string;

  /** Error message describing the validation issue */
  message: string;

  /** Error code for programmatic handling */
  code?: string;

  /** Profile type if error is related to a specific profile */
  profileType?: 'CUSTOMER_PROFILE' | 'BRAND_GUIDELINES' | 'BUDGET';
}

/**
 * Container Validation Result
 */
export interface ContainerValidationResult {
  /** Whether the container is valid */
  isValid: boolean;

  /** List of validation errors if invalid */
  errors?: ContainerValidationError[];

  /** List of validation warnings (non-blocking issues) */
  warnings?: string[];

  /** Whether all referenced profiles exist */
  allProfilesExist: boolean;

  /** List of missing profile references */
  missingProfiles?: Array<'CUSTOMER_PROFILE' | 'BRAND_GUIDELINES' | 'BUDGET'>;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Determines if an account is a first-time user based on profile counts
 * @param profileCounts - The profile counts for the account
 * @returns True if this is a first-time user (no profiles created), false otherwise
 */
export function isFirstTimeUser(profileCounts: ProfileCounts): boolean {
  return profileCounts.total === 0;
}

/**
 * Determines if an account has completed onboarding
 * @param profileCounts - The profile counts for the account
 * @returns True if the account has at least one of each profile type, false otherwise
 */
export function hasCompletedOnboarding(profileCounts: ProfileCounts): boolean {
  return profileCounts.hasCompleteSet;
}

/**
 * Calculates onboarding progress percentage based on profile counts
 * @param profileCounts - The profile counts for the account
 * @returns Onboarding progress as a percentage (0-100)
 */
export function calculateOnboardingProgress(profileCounts: ProfileCounts): number {
  const requiredProfiles = 3; // Customer Profile, Brand Guidelines, Budget
  let completedProfiles = 0;

  if (profileCounts.customerProfiles > 0) completedProfiles++;
  if (profileCounts.brandGuidelines > 0) completedProfiles++;
  if (profileCounts.budgets > 0) completedProfiles++;

  return Math.round((completedProfiles / requiredProfiles) * 100);
}

/**
 * Determines the next recommended step for onboarding
 * @param hasCustomerProfile - Whether the account has a customer profile
 * @param hasBrandGuidelines - Whether the account has brand guidelines
 * @param hasBudget - Whether the account has a budget
 * @returns The next recommended onboarding step
 */
export function getNextOnboardingStep(
  hasCustomerProfile: boolean,
  hasBrandGuidelines: boolean,
  hasBudget: boolean
): 'CREATE_CUSTOMER_PROFILE' | 'CREATE_BRAND_GUIDELINES' | 'CREATE_BUDGET' | 'COMPLETE' {
  if (!hasCustomerProfile) return 'CREATE_CUSTOMER_PROFILE';
  if (!hasBrandGuidelines) return 'CREATE_BRAND_GUIDELINES';
  if (!hasBudget) return 'CREATE_BUDGET';
  return 'COMPLETE';
}

/**
 * Identifies missing profile types for an account
 * @param hasCustomerProfile - Whether the account has a customer profile
 * @param hasBrandGuidelines - Whether the account has brand guidelines
 * @param hasBudget - Whether the account has a budget
 * @returns Array of missing profile types
 */
export function getMissingProfiles(
  hasCustomerProfile: boolean,
  hasBrandGuidelines: boolean,
  hasBudget: boolean
): Array<'CUSTOMER_PROFILE' | 'BRAND_GUIDELINES' | 'BUDGET'> {
  const missing: Array<'CUSTOMER_PROFILE' | 'BRAND_GUIDELINES' | 'BUDGET'> = [];

  if (!hasCustomerProfile) missing.push('CUSTOMER_PROFILE');
  if (!hasBrandGuidelines) missing.push('BRAND_GUIDELINES');
  if (!hasBudget) missing.push('BUDGET');

  return missing;
}

/**
 * Creates an AccountProfileStatus object from profile counts
 * @param accountId - The account ID
 * @param profileCounts - The profile counts for the account
 * @param metadata - Optional metadata to include
 * @returns AccountProfileStatus object
 */
export function createAccountProfileStatus(
  accountId: string,
  profileCounts: ProfileCounts,
  metadata?: AccountProfileStatus['metadata']
): AccountProfileStatus {
  const hasCustomerProfile = profileCounts.customerProfiles > 0;
  const hasBrandGuidelines = profileCounts.brandGuidelines > 0;
  const hasBudget = profileCounts.budgets > 0;

  return {
    accountId,
    isFirstTimeUser: isFirstTimeUser(profileCounts),
    hasCustomerProfile,
    hasBrandGuidelines,
    hasBudget,
    hasCompletedOnboarding: hasCompletedOnboarding(profileCounts),
    profileCounts,
    nextStep: getNextOnboardingStep(hasCustomerProfile, hasBrandGuidelines, hasBudget),
    onboardingProgress: calculateOnboardingProgress(profileCounts),
    missingProfiles: getMissingProfiles(hasCustomerProfile, hasBrandGuidelines, hasBudget),
    lastUpdatedAt: new Date(),
    metadata,
  };
}

/**
 * Validates that a container has all required profile references
 * @param container - The container to validate
 * @returns Validation result with any errors or warnings
 */
export function validateContainer(container: CustomerProfileContainer | ContainerCreationRequest): ContainerValidationResult {
  const errors: ContainerValidationError[] = [];
  const warnings: string[] = [];
  const missingProfiles: Array<'CUSTOMER_PROFILE' | 'BRAND_GUIDELINES' | 'BUDGET'> = [];

  // Validate required fields
  if (!container.accountId) {
    errors.push({
      field: 'accountId',
      message: 'Account ID is required',
      code: 'REQUIRED_FIELD',
    });
  }

  if (!container.name || container.name.trim() === '') {
    errors.push({
      field: 'name',
      message: 'Container name is required',
      code: 'REQUIRED_FIELD',
    });
  }

  if (!container.customerProfileId || container.customerProfileId.trim() === '') {
    errors.push({
      field: 'customerProfileId',
      message: 'Customer Profile ID is required',
      code: 'REQUIRED_FIELD',
      profileType: 'CUSTOMER_PROFILE',
    });
    missingProfiles.push('CUSTOMER_PROFILE');
  }

  if (!container.brandGuidelinesId || container.brandGuidelinesId.trim() === '') {
    errors.push({
      field: 'brandGuidelinesId',
      message: 'Brand Guidelines ID is required',
      code: 'REQUIRED_FIELD',
      profileType: 'BRAND_GUIDELINES',
    });
    missingProfiles.push('BRAND_GUIDELINES');
  }

  if (!container.budgetId || container.budgetId.trim() === '') {
    errors.push({
      field: 'budgetId',
      message: 'Budget ID is required',
      code: 'REQUIRED_FIELD',
      profileType: 'BUDGET',
    });
    missingProfiles.push('BUDGET');
  }

  // Add warnings for optional best practices
  if ('isDefault' in container && container.isDefault && 'isPrimary' in container && !container.isPrimary) {
    warnings.push('Default containers are typically also marked as primary');
  }

  const allProfilesExist = missingProfiles.length === 0;

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    warnings: warnings.length > 0 ? warnings : undefined,
    allProfilesExist,
    missingProfiles: missingProfiles.length > 0 ? missingProfiles : undefined,
  };
}

/**
 * Checks if a container is complete (has all required profiles)
 * @param container - The container to check
 * @returns True if the container has all required profile IDs, false otherwise
 */
export function isContainerComplete(container: CustomerProfileContainer): boolean {
  return Boolean(
    container.customerProfileId &&
    container.brandGuidelinesId &&
    container.budgetId &&
    container.customerProfileId.trim() !== '' &&
    container.brandGuidelinesId.trim() !== '' &&
    container.budgetId.trim() !== ''
  );
}

/**
 * Creates a ContainerWithDetails object from a container and its profile objects
 * @param container - The base container
 * @param customerProfile - The full customer profile object
 * @param brandGuidelines - The full brand guidelines object
 * @param budget - The full budget object
 * @returns ContainerWithDetails object
 */
export function createContainerWithDetails(
  container: CustomerProfileContainer,
  customerProfile: TargetCustomerProfile,
  brandGuidelines: BrandGuidelines,
  budget: Budget
): ContainerWithDetails {
  const { customerProfileId, brandGuidelinesId, budgetId, ...baseContainer } = container;

  // Basic validation
  const customerProfileValid = Boolean(customerProfile && customerProfile.id === container.customerProfileId);
  const brandGuidelinesValid = Boolean(brandGuidelines && brandGuidelines.id === container.brandGuidelinesId);
  const budgetValid = Boolean(budget && budget.id === container.budgetId);
  const isValid = customerProfileValid && brandGuidelinesValid && budgetValid;

  return {
    ...baseContainer,
    customerProfile,
    brandGuidelines,
    budget,
    validationStatus: {
      isValid,
      profileValidation: {
        customerProfileValid,
        brandGuidelinesValid,
        budgetValid,
      },
      errors: !isValid ? [
        ...(!customerProfileValid ? [{
          profileType: 'CUSTOMER_PROFILE' as const,
          field: 'customerProfile',
          message: 'Customer profile is missing or ID mismatch',
        }] : []),
        ...(!brandGuidelinesValid ? [{
          profileType: 'BRAND_GUIDELINES' as const,
          field: 'brandGuidelines',
          message: 'Brand guidelines are missing or ID mismatch',
        }] : []),
        ...(!budgetValid ? [{
          profileType: 'BUDGET' as const,
          field: 'budget',
          message: 'Budget is missing or ID mismatch',
        }] : []),
      ] : undefined,
    },
  };
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard to check if a container has details (full profile objects)
 * @param container - The container to check
 * @returns True if the container has full profile objects, false otherwise
 */
export function isContainerWithDetails(
  container: CustomerProfileContainer | ContainerWithDetails
): container is ContainerWithDetails {
  return 'customerProfile' in container &&
         'brandGuidelines' in container &&
         'budget' in container;
}

/**
 * Type guard to check if a value is a valid container status
 * @param status - The status string to validate
 * @returns True if the status is valid, false otherwise
 */
export function isValidContainerStatus(status: string): status is CustomerProfileContainer['status'] {
  return ['ACTIVE', 'INACTIVE', 'ARCHIVED', 'DRAFT'].includes(status);
}

// ============================================================================
// Type Exports
// ============================================================================

/**
 * Union type of all container-related request types
 */
export type ContainerRequest = ContainerCreationRequest | ContainerUpdateRequest | ContainerQueryRequest;

/**
 * Union type of all container-related response types
 */
export type ContainerResponse = CustomerProfileContainer | ContainerWithDetails | ContainerQueryResponse;

/**
 * Union type for profile types in the container
 */
export type ProfileType = 'CUSTOMER_PROFILE' | 'BRAND_GUIDELINES' | 'BUDGET';

/**
 * Union type for onboarding steps
 */
export type OnboardingStep = 'CREATE_CUSTOMER_PROFILE' | 'CREATE_BRAND_GUIDELINES' | 'CREATE_BUDGET' | 'COMPLETE';

/**
 * Union type for container status
 */
export type ContainerStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED' | 'DRAFT';
