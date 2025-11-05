import { CampaignPatterns } from './campaign-patterns.types';

/**
 * RSA Generation Types (Frontend)
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
  product: {
    id: string;
    name: string;
    url: string;
    category?: string;
    price?: number;
    description?: string;
  };
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

