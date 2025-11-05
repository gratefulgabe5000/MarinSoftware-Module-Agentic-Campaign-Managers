import { ProductInput } from '../types/product.types';
import { CampaignPatterns } from '../types/campaign-patterns.types';
import {
  AdGroupGenerationRequest,
  GeneratedAdGroup,
} from '../types/adgroup-generation.types';
import { generateAdGroupName, validateGeneratedAdGroupName } from './adGroupNamingService';

/**
 * Ad Group Generation Service
 * Generates ad groups from products and patterns
 */

/**
 * Generates a unique ID for an ad group
 */
function generateAdGroupId(): string {
  return `adgroup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generates ad groups from products and patterns
 */
export function generateAdGroups(
  request: AdGroupGenerationRequest
): GeneratedAdGroup[] {
  const { products, targetCampaignId, namingConvention, maxAdGroups, patterns } = request;

  // Limit products to maxAdGroups (default 10 for MVP)
  const maxGroups = maxAdGroups || 10;
  const limitedProducts = products.slice(0, maxGroups);

  // Determine naming convention
  let namingPattern = namingConvention;
  if (!namingPattern && patterns?.adGroupStructures?.namingConvention) {
    namingPattern = patterns.adGroupStructures.namingConvention;
  }
  if (!namingPattern) {
    namingPattern = 'Product Name'; // Default
  }

  // Use target campaign ID or generate a default one
  const campaignId = targetCampaignId || 'campaign-default';

  // Generate ad groups
  const adGroups: GeneratedAdGroup[] = limitedProducts.map((product) => {
    // Generate ad group name
    const adGroupName = generateAdGroupName(product, namingPattern);
    
    // Validate name
    const validation = validateGeneratedAdGroupName(adGroupName);
    const finalName = validation.sanitized || validation.valid ? adGroupName : `Product ${product.id.substring(0, 8)}`;

    const adGroup: GeneratedAdGroup = {
      id: generateAdGroupId(),
      name: finalName,
      productId: product.id,
      campaignId,
      keywords: [], // Will be populated in keyword generation phase
      ads: [], // Will be populated in RSA generation phase
    };

    return adGroup;
  });

  return adGroups;
}

/**
 * Validates ad group generation request
 */
export function validateAdGroupGenerationRequest(
  request: AdGroupGenerationRequest
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!request.products || request.products.length === 0) {
    errors.push('At least one product is required');
  }

  if (request.products && request.products.length > 10) {
    errors.push('Maximum 10 products allowed for MVP');
  }

  if (request.maxAdGroups && request.maxAdGroups > 10) {
    errors.push('Maximum 10 ad groups allowed for MVP');
  }

  // Validate each product
  request.products?.forEach((product, index) => {
    if (!product.name || product.name.trim().length === 0) {
      errors.push(`Product ${index + 1}: Name is required`);
    }
    if (!product.url || product.url.trim().length === 0) {
      errors.push(`Product ${index + 1}: URL is required`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

