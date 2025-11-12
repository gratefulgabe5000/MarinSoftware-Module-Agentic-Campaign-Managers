/**
 * Customer Profile Types (Frontend)
 * Defines comprehensive types for Target Customer Profile with demographics,
 * interests, behaviors, and persona information for campaign targeting
 */

/**
 * Age Range for demographic targeting
 */
export interface AgeRange {
  /** Minimum age (e.g., 18) */
  min: number;
  /** Maximum age (e.g., 65) or null for "65+" */
  max: number | null;
}

/**
 * Income Range for demographic targeting
 * Values in USD per year
 */
export interface IncomeRange {
  /** Minimum annual income in USD (e.g., 50000) */
  min: number;
  /** Maximum annual income in USD (e.g., 100000) or null for "100000+" */
  max: number | null;
}

/**
 * Household Size Range for demographic targeting
 */
export interface HouseholdSizeRange {
  /** Minimum household size (e.g., 1) */
  min: number;
  /** Maximum household size (e.g., 5) or null for "5+" */
  max: number | null;
}

/**
 * Radius Targeting for location-based campaigns
 */
export interface RadiusTargeting {
  /** Center point latitude */
  latitude: number;
  /** Center point longitude */
  longitude: number;
  /** Radius in miles or kilometers */
  radius: number;
  /** Unit of measurement for radius */
  unit: 'miles' | 'kilometers';
}

/**
 * Location Targeting Configuration
 * Supports multiple location targeting types for precise geographic targeting
 */
export interface LocationTargeting {
  /** List of countries to target (ISO 3166-1 alpha-2 codes, e.g., ["US", "CA", "GB"]) */
  countries?: string[];
  /** List of states/provinces to target (e.g., ["California", "New York", "Texas"]) */
  states?: string[];
  /** List of cities to target (e.g., ["San Francisco", "Los Angeles", "New York"]) */
  cities?: string[];
  /** List of postal/zip codes to target (e.g., ["94102", "10001", "90210"]) */
  postalCodes?: string[];
  /** Radius-based targeting (target within X miles/km of a location) */
  radius?: RadiusTargeting;
  /** Whether to include locations of interest (e.g., people interested in this location) */
  includeLocationsOfInterest?: boolean;
}

/**
 * Gender targeting options
 */
export type Gender = 'male' | 'female' | 'all' | 'other';

/**
 * Parental status targeting options
 */
export type ParentalStatus =
  | 'parent'
  | 'not_a_parent'
  | 'all'
  | 'expecting_parent'
  | 'parent_infant'
  | 'parent_toddler'
  | 'parent_preschooler'
  | 'parent_gradeschooler'
  | 'parent_teenager';

/**
 * Marital status targeting options
 */
export type MaritalStatus =
  | 'single'
  | 'married'
  | 'divorced'
  | 'widowed'
  | 'all'
  | 'in_relationship'
  | 'engaged';

/**
 * Education level targeting options
 */
export type EducationLevel =
  | 'high_school'
  | 'some_college'
  | 'bachelors'
  | 'masters'
  | 'doctorate'
  | 'all'
  | 'associate'
  | 'professional_degree';

/**
 * Employment status targeting options
 */
export type EmploymentStatus =
  | 'employed'
  | 'unemployed'
  | 'self_employed'
  | 'retired'
  | 'student'
  | 'all';

/**
 * Home ownership status targeting options
 */
export type HomeOwnershipStatus =
  | 'homeowner'
  | 'renter'
  | 'all';

/**
 * Demographics Configuration
 * Comprehensive demographic targeting options for customer profiles
 */
export interface Demographics {
  /** Age range targeting */
  ageRange?: AgeRange;
  /** Gender targeting */
  gender?: Gender;
  /** Household income range targeting */
  incomeRange?: IncomeRange;
  /** Household size range targeting */
  householdSize?: HouseholdSizeRange;
  /** Parental status targeting */
  parentalStatus?: ParentalStatus;
  /** Marital status targeting */
  maritalStatus?: MaritalStatus;
  /** Education level targeting */
  educationLevel?: EducationLevel;
  /** Employment status targeting */
  employmentStatus?: EmploymentStatus;
  /** Home ownership status targeting */
  homeOwnershipStatus?: HomeOwnershipStatus;
  /** Location targeting configuration */
  location?: LocationTargeting;
  /** Languages spoken (ISO 639-1 codes, e.g., ["en", "es", "fr"]) */
  languages?: string[];
}

/**
 * Device targeting options
 */
export type DeviceType = 'desktop' | 'mobile' | 'tablet' | 'all';

/**
 * Operating System targeting options
 */
export type OperatingSystem =
  | 'windows'
  | 'macos'
  | 'linux'
  | 'ios'
  | 'android'
  | 'all';

/**
 * Browser targeting options
 */
export type BrowserType =
  | 'chrome'
  | 'firefox'
  | 'safari'
  | 'edge'
  | 'opera'
  | 'all';

/**
 * Purchase behavior targeting options
 */
export type PurchaseBehavior =
  | 'frequent_buyer'
  | 'occasional_buyer'
  | 'window_shopper'
  | 'first_time_buyer'
  | 'high_value_buyer'
  | 'discount_seeker'
  | 'impulse_buyer';

/**
 * Online activity level targeting options
 */
export type OnlineActivityLevel =
  | 'very_active'
  | 'active'
  | 'moderate'
  | 'light'
  | 'all';

/**
 * Behavior Configuration
 * Behavioral targeting attributes for customer profiles
 */
export interface Behavior {
  /** Device usage preferences */
  devicePreferences?: DeviceType[];
  /** Operating system preferences */
  operatingSystemPreferences?: OperatingSystem[];
  /** Browser preferences */
  browserPreferences?: BrowserType[];
  /** Purchase behavior patterns */
  purchaseBehavior?: PurchaseBehavior[];
  /** Online activity level */
  onlineActivityLevel?: OnlineActivityLevel;
  /** Websites/domains frequently visited (e.g., ["amazon.com", "etsy.com"]) */
  frequentlyVisitedSites?: string[];
  /** Shopping categories of interest (e.g., ["electronics", "fashion", "home"]) */
  shoppingCategories?: string[];
  /** Average time spent online per day (in minutes) */
  averageTimeOnline?: number;
  /** Preferred shopping times (e.g., ["evening", "weekend"]) */
  preferredShoppingTimes?: string[];
  /** Social media platforms used (e.g., ["facebook", "instagram", "twitter"]) */
  socialMediaPlatforms?: string[];
}

/**
 * Persona Configuration
 * Detailed customer persona information for targeted messaging
 */
export interface Persona {
  /** Persona name (e.g., "Tech-Savvy Professional", "Budget-Conscious Parent") */
  name: string;
  /** Detailed persona description */
  description: string;
  /** Key motivations and goals (e.g., ["save time", "find quality products", "stay on budget"]) */
  motivations?: string[];
  /** Pain points and challenges (e.g., ["lack of time", "overwhelmed by choices", "budget constraints"]) */
  painPoints?: string[];
  /** Values and priorities (e.g., ["quality", "convenience", "sustainability"]) */
  values?: string[];
  /** Primary goals when shopping/searching (e.g., ["find best price", "quick delivery", "eco-friendly options"]) */
  goals?: string[];
  /** Objections or concerns (e.g., ["worried about quality", "skeptical of online reviews", "privacy concerns"]) */
  objections?: string[];
  /** Preferred communication style (e.g., "direct and professional", "friendly and casual") */
  communicationStyle?: string;
  /** Decision-making factors (e.g., ["price", "reviews", "brand reputation", "convenience"]) */
  decisionMakingFactors?: string[];
}

/**
 * Target Customer Profile
 * Comprehensive customer profile for campaign targeting with demographics,
 * interests, behaviors, and persona information
 */
export interface TargetCustomerProfile {
  /** Unique identifier for the customer profile */
  id: string;
  /** Profile name for easy identification (e.g., "Millennial Tech Enthusiasts") */
  name: string;
  /** Detailed profile description */
  description?: string;
  /** Account ID this profile belongs to */
  accountId: string;
  /** Demographic targeting configuration */
  demographics?: Demographics;
  /** List of interests and affinities (e.g., ["technology", "travel", "fitness", "cooking"]) */
  interests?: string[];
  /** Behavioral targeting configuration */
  behavior?: Behavior;
  /** Detailed customer persona information */
  persona?: Persona;
  /** Whether this is the default profile for the account */
  isDefault?: boolean;
  /** Version number for tracking changes */
  version?: number;
  /** ISO 8601 timestamp when profile was created */
  createdAt: Date;
  /** ISO 8601 timestamp when profile was last updated */
  updatedAt: Date;
  /** User ID who created the profile */
  createdBy?: string;
  /** User ID who last updated the profile */
  updatedBy?: string;
  /** Whether the profile is active or archived */
  isActive?: boolean;
  /** Additional metadata for the profile */
  metadata?: {
    /** Tags for organization (e.g., ["high-value", "seasonal", "test"]) */
    tags?: string[];
    /** Internal notes about the profile */
    notes?: string;
    /** Source of profile data (e.g., "manual", "llm_generated", "imported") */
    source?: string;
    /** Number of campaigns using this profile */
    usageCount?: number;
  };
}

/**
 * Customer Profile Creation Request
 * Used when creating a new customer profile
 */
export interface CustomerProfileCreationRequest {
  /** Profile name for easy identification */
  name: string;
  /** Detailed profile description */
  description?: string;
  /** Account ID this profile belongs to */
  accountId: string;
  /** Demographic targeting configuration */
  demographics?: Demographics;
  /** List of interests and affinities */
  interests?: string[];
  /** Behavioral targeting configuration */
  behavior?: Behavior;
  /** Detailed customer persona information */
  persona?: Persona;
  /** Whether this is the default profile for the account */
  isDefault?: boolean;
  /** Additional metadata for the profile */
  metadata?: {
    tags?: string[];
    notes?: string;
    source?: string;
  };
}

/**
 * Customer Profile Update Request
 * Used when updating an existing customer profile
 */
export interface CustomerProfileUpdateRequest {
  /** Profile name for easy identification */
  name?: string;
  /** Detailed profile description */
  description?: string;
  /** Demographic targeting configuration */
  demographics?: Demographics;
  /** List of interests and affinities */
  interests?: string[];
  /** Behavioral targeting configuration */
  behavior?: Behavior;
  /** Detailed customer persona information */
  persona?: Persona;
  /** Whether this is the default profile for the account */
  isDefault?: boolean;
  /** Whether the profile is active or archived */
  isActive?: boolean;
  /** Additional metadata for the profile */
  metadata?: {
    tags?: string[];
    notes?: string;
  };
}

/**
 * Customer Profile Validation Error
 */
export interface CustomerProfileValidationError {
  /** Field that has the validation error */
  field: string;
  /** Error message describing the validation issue */
  message: string;
  /** Error code for programmatic handling */
  code?: string;
}

/**
 * Customer Profile Validation Result
 */
export interface CustomerProfileValidationResult {
  /** Whether the profile is valid */
  isValid: boolean;
  /** List of validation errors if invalid */
  errors?: CustomerProfileValidationError[];
  /** List of validation warnings (non-blocking issues) */
  warnings?: string[];
}
