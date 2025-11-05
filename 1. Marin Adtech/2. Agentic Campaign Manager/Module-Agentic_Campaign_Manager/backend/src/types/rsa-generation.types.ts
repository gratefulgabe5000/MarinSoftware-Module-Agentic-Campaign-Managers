import { ProductInput } from './product.types';
import { CampaignPatterns } from './campaign-patterns.types';

/**
 * RSA Generation Types (Backend)
 * Defines types for Responsive Search Ad generation
 */

/**
 * Ad Headline
 */
export interface AdHeadline {
  text: string;
  pinned?: boolean;
  position?: number; // For pinning
}

/**
 * Ad Description
 */
export interface AdDescription {
  text: string;
}

/**
 * Generated RSA
 */
export interface GeneratedRSA {
  id: string;
  adGroupId: string;
  headlines: AdHeadline[];
  descriptions: AdDescription[];
  finalUrl: string;
  displayUrl?: string;
  paths?: string[];
}

/**
 * RSA Generation Request
 */
export interface RSAGenerationRequest {
  adGroupId: string;
  product: ProductInput;
  patterns?: CampaignPatterns;
  maxHeadlines?: number;
  maxDescriptions?: number;
}

/**
 * Ad Copy Validation Request
 */
export interface AdCopyValidationRequest {
  headlines: string[];
  descriptions: string[];
}

/**
 * Ad Copy Validation Result
 */
export interface AdCopyValidationResult {
  valid: boolean;
  headlineErrors: string[];
  descriptionErrors: string[];
  headlineWarnings: string[];
  descriptionWarnings: string[];
}

