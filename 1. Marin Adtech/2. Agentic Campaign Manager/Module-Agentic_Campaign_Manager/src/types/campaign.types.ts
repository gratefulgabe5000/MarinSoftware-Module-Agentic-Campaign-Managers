/**
 * Campaign Types
 * Defines types for campaign management and Customer Profile integration
 */

import { CampaignPlan } from './ai.types';
import {
  CustomerProfileContainer,
  ContainerWithDetails
} from './customerProfileContainer.types';

/**
 * Profile Version Used
 * Tracks which Customer Profile Container and version was used when creating a campaign
 * This enables auditing and ensures campaigns can reference historical profile data
 */
export interface ProfileVersionUsed {
  /** ID of the Customer Profile Container used */
  profileContainerId: string;

  /** Version of the container when it was used */
  containerVersion: number;

  /** Timestamp when the profile was captured/used */
  usedAt: Date;

  /** Snapshot of profile IDs at the time of use */
  profileSnapshot: {
    /** Customer Profile ID at time of use */
    customerProfileId: string;
    /** Brand Guidelines ID at time of use */
    brandGuidelinesId: string;
    /** Budget ID at time of use */
    budgetId: string;
  };

  /** Whether this was the default/account profile or a custom one */
  isDefaultProfile: boolean;

  /** Optional notes about why this profile was selected */
  notes?: string;
}

/**
 * Resolved Profile
 * Full profile data resolved from a profile container reference
 * Used when complete profile information is needed for campaign operations
 */
export interface ResolvedProfile extends ContainerWithDetails {
  /** The profile version information */
  versionInfo: ProfileVersionUsed;

  /** Whether this profile is still current/active */
  isCurrent: boolean;

  /** Any warnings about using this profile (e.g., outdated, missing data) */
  warnings?: string[];
}

/**
 * Campaign Interface
 * Represents a created campaign with status and tracking
 * Now includes Customer Profile Container references for default or custom profiles
 */
export interface Campaign {
  id: string;
  name: string;
  description?: string;
  campaignPlan: CampaignPlan;
  status: CampaignStatus;
  platformCampaignIds: PlatformCampaignIds;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  metadata?: CampaignMetadata;
  isMock?: boolean; // Flag to indicate if this campaign was created/retrieved using mock data

  /**
   * Customer Profile Container reference
   * Links this campaign to a specific Customer Profile Container (with Target Customer Profile,
   * Brand Guidelines, and Budget). Tracks the version used for historical accuracy.
   *
   * @migration For existing campaigns without a profile reference, this field will be undefined.
   * Campaigns can operate without a profile reference for backward compatibility.
   */
  profileVersion?: ProfileVersionUsed;
}

/**
 * Campaign Status
 */
export type CampaignStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'creating'
  | 'active'
  | 'paused'
  | 'completed'
  | 'archived'
  | 'error';

/**
 * Platform Campaign IDs
 * Maps platform names to their campaign IDs
 */
export interface PlatformCampaignIds {
  googleAds?: string;
  meta?: string;
  microsoft?: string;
  zilkr?: string;
  [platform: string]: string | undefined;
}

/**
 * Campaign Metadata
 */
export interface CampaignMetadata {
  tags?: string[];
  notes?: string;
  estimatedPerformance?: PerformanceEstimates;
  actualPerformance?: PerformanceMetrics;
}

/**
 * Performance Estimates
 */
export interface PerformanceEstimates {
  impressions?: number;
  clicks?: number;
  conversions?: number;
  ctr?: number;
  cpa?: number;
  roas?: number;
  confidence?: number;
}

/**
 * Performance Metrics
 */
export interface PerformanceMetrics {
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpa: number;
  roas: number;
  spend: number;
  revenue?: number;
  startDate: Date;
  endDate?: Date;
}

/**
 * Target Audience Interface
 */
export interface TargetAudience {
  demographics?: {
    age?: string;
    gender?: string;
    location?: string;
    language?: string;
    interests?: string[];
  };
  psychographics?: {
    values?: string[];
    behaviors?: string[];
    painPoints?: string[];
  };
  customAudiences?: string[];
  lookalikeAudiences?: string[];
  estimatedSize?: number;
}

/**
 * Budget Interface
 */
export interface Budget {
  total: number;
  daily?: number;
  currency: string;
  distribution?: BudgetDistribution;
}

/**
 * Budget Distribution
 */
export interface BudgetDistribution {
  byPlatform?: {
    [platform: string]: number;
  };
  byAdGroup?: {
    [adGroupId: string]: number;
  };
}

/**
 * Timeline Interface
 */
export interface Timeline {
  startDate: string;
  endDate?: string;
  duration: number; // in days
  timeZone?: string;
}

/**
 * KPIs Interface
 */
export interface KPIs {
  primary: string;
  secondary?: string[];
  targets?: {
    [kpi: string]: number;
  };
}

/**
 * Campaign Creation Request
 */
export interface CampaignCreationRequest {
  campaignPlan: CampaignPlan;
  name: string;
  description?: string;
  metadata?: CampaignMetadata;
}

/**
 * Campaign Update Request
 */
export interface CampaignUpdateRequest {
  name?: string;
  description?: string;
  campaignPlan?: Partial<CampaignPlan>;
  status?: CampaignStatus;
  metadata?: Partial<CampaignMetadata>;
}

/**
 * Campaign Creation Error
 */
export interface CampaignCreationError {
  platform: string;
  error: string;
}

/**
 * Campaign Creation Response
 */
export interface CampaignCreationResponse {
  campaignId: string;
  status: CampaignStatus;
  platformCampaignIds: PlatformCampaignIds;
  createdAt: Date;
  message?: string;
  errors?: CampaignCreationError[];
}

// ============================================================================
// Helper Functions for Profile Resolution
// ============================================================================

/**
 * Creates a ProfileVersionUsed record from a CustomerProfileContainer
 * This captures the current state of the container for historical tracking
 *
 * @param container - The Customer Profile Container to capture
 * @param isDefault - Whether this is the default/account profile
 * @param notes - Optional notes about why this profile was selected
 * @returns ProfileVersionUsed object for the campaign
 */
export function createProfileVersionUsed(
  container: CustomerProfileContainer,
  isDefault: boolean = false,
  notes?: string
): ProfileVersionUsed {
  return {
    profileContainerId: container.id,
    containerVersion: container.version,
    usedAt: new Date(),
    profileSnapshot: {
      customerProfileId: container.customerProfileId,
      brandGuidelinesId: container.brandGuidelinesId,
      budgetId: container.budgetId,
    },
    isDefaultProfile: isDefault,
    notes,
  };
}

/**
 * Resolves a campaign's profile reference to full profile data
 * This is useful when you need the complete profile information for campaign operations
 *
 * @param campaign - The campaign with a profile reference
 * @param containerWithDetails - The full container data with profile objects
 * @returns ResolvedProfile with full profile data and version information
 */
export function resolveProfileForCampaign(
  campaign: Campaign,
  containerWithDetails: ContainerWithDetails
): ResolvedProfile | null {
  if (!campaign.profileVersion) {
    return null;
  }

  const warnings: string[] = [];

  // Check if container IDs match
  if (campaign.profileVersion.profileContainerId !== containerWithDetails.id) {
    warnings.push('Container ID mismatch - this may not be the correct profile');
  }

  // Check if profile IDs have changed
  const snapshotMatch =
    campaign.profileVersion.profileSnapshot.customerProfileId === containerWithDetails.customerProfile.id &&
    campaign.profileVersion.profileSnapshot.brandGuidelinesId === containerWithDetails.brandGuidelines.id &&
    campaign.profileVersion.profileSnapshot.budgetId === containerWithDetails.budget.id;

  if (!snapshotMatch) {
    warnings.push('Profile IDs have changed since campaign creation - this profile may be outdated');
  }

  // Check if version has changed
  const isCurrent = campaign.profileVersion.containerVersion === containerWithDetails.version;
  if (!isCurrent) {
    warnings.push(
      `Profile version has been updated (campaign uses v${campaign.profileVersion.containerVersion}, current is v${containerWithDetails.version})`
    );
  }

  return {
    ...containerWithDetails,
    versionInfo: campaign.profileVersion,
    isCurrent,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * Checks if a campaign has a profile reference
 * Type guard for campaigns with profile data
 *
 * @param campaign - The campaign to check
 * @returns True if the campaign has a profile reference
 */
export function hasProfileReference(campaign: Campaign): campaign is Campaign & { profileVersion: ProfileVersionUsed } {
  return campaign.profileVersion !== undefined;
}

/**
 * Checks if a campaign is using the default account profile
 *
 * @param campaign - The campaign to check
 * @returns True if the campaign uses the default profile, false otherwise (or undefined if no profile)
 */
export function isUsingDefaultProfile(campaign: Campaign): boolean | undefined {
  return campaign.profileVersion?.isDefaultProfile;
}

/**
 * Gets the profile container ID from a campaign
 * Convenience function to safely extract the container ID
 *
 * @param campaign - The campaign to get the container ID from
 * @returns The container ID or undefined if no profile reference
 */
export function getProfileContainerId(campaign: Campaign): string | undefined {
  return campaign.profileVersion?.profileContainerId;
}

/**
 * Checks if a campaign's profile is outdated based on version
 *
 * @param campaign - The campaign to check
 * @param currentContainer - The current state of the container
 * @returns True if the campaign is using an old version of the profile
 */
export function isProfileOutdated(campaign: Campaign, currentContainer: CustomerProfileContainer): boolean {
  if (!campaign.profileVersion) {
    return false; // No profile reference means not outdated
  }

  if (campaign.profileVersion.profileContainerId !== currentContainer.id) {
    return false; // Different container, not outdated just different
  }

  return campaign.profileVersion.containerVersion < currentContainer.version;
}

// ============================================================================
// Migration Notes
// ============================================================================

/**
 * MIGRATION NOTES FOR EXISTING CAMPAIGNS
 *
 * When upgrading to this version of campaign types, existing campaigns will not have
 * a `profileVersion` field. The system should handle this gracefully:
 *
 * 1. BACKWARD COMPATIBILITY:
 *    - The `profileVersion` field is optional (undefined for old campaigns)
 *    - All helper functions handle undefined profileVersion gracefully
 *    - Campaigns can still be created and function without profile references
 *
 * 2. MIGRATION STRATEGY:
 *    - Option A: Leave existing campaigns without profile references
 *    - Option B: Backfill campaigns with their account's default profile
 *    - Option C: Prompt users to select a profile when editing old campaigns
 *
 * 3. API HANDLING:
 *    - APIs should accept campaigns with or without profileVersion
 *    - New campaigns should encourage (but not require) profile selection
 *    - Profile resolution functions return null for campaigns without profiles
 *
 * 4. UI CONSIDERATIONS:
 *    - Show "No profile linked" or similar message for old campaigns
 *    - Provide easy way to link a profile to existing campaigns
 *    - Display warnings if using outdated profile versions
 *
 * 5. DATABASE MIGRATION:
 *    - Add `profileVersion` field as nullable/optional
 *    - No data transformation needed for existing records
 *    - Consider adding index on `profileVersion.profileContainerId` for queries
 */

