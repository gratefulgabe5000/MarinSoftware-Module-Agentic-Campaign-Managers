import { ProductInput } from './product.types';
import { CampaignPatterns } from './campaign-patterns.types';

/**
 * Ad Group Generation Types (Backend)
 * Defines types for ad group generation
 */

/**
 * Ad Group Generation Request
 */
export interface AdGroupGenerationRequest {
  products: ProductInput[];
  targetCampaignId?: string;
  namingConvention?: string;
  maxAdGroups?: number;
  patterns?: CampaignPatterns;
}

/**
 * Generated Ad Group
 */
export interface GeneratedAdGroup {
  id: string;
  name: string;
  productId: string;
  campaignId: string;
  keywords: any[]; // Will be GeneratedKeyword[] after keyword generation
  ads: any[]; // Will be GeneratedRSA[] after RSA generation
}

/**
 * Ad Group Naming Pattern
 */
export type AdGroupNamingPattern = 
  | 'Brand + Model'
  | 'Product + Category'
  | 'Brand + Type'
  | 'Product Name'
  | string; // Custom pattern

