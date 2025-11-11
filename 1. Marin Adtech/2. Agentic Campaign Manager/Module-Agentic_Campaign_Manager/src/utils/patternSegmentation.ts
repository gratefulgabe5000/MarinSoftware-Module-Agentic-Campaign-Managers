/**
 * Pattern Segmentation Utilities
 * Functions to segment campaign patterns by product
 */

import {
  CampaignPatterns,
  HighPerformingKeyword,
  AdGroupStructures,
  AdCopyPatterns,
} from '../types/campaign-patterns.types';
import { ProductInput } from '../types/product.types';

/**
 * Checks if a keyword/theme matches a product based on name, category, or description
 */
function matchesProduct(text: string, product: ProductInput): boolean {
  const searchText = text.toLowerCase();
  const productName = product.name.toLowerCase();
  const productCategory = product.category?.toLowerCase() || '';
  const productDescription = product.description?.toLowerCase() || '';

  // Extract key terms from product name (split by spaces and special chars)
  const productTerms = productName
    .split(/[\s\-_,]+/)
    .filter((term) => term.length > 2); // Ignore very short terms

  // Check if any product term appears in the text
  return productTerms.some((term) => searchText.includes(term)) ||
    searchText.includes(productName) ||
    (productCategory.length > 0 && searchText.includes(productCategory)) ||
    (productDescription.length > 0 && searchText.includes(productDescription));
}

/**
 * Segments keywords by product relevance
 */
function segmentKeywords(
  keywords: HighPerformingKeyword[],
  product: ProductInput
): HighPerformingKeyword[] {
  return keywords.filter((kw) => matchesProduct(kw.keyword, product));
}

/**
 * Segments ad copy patterns by product relevance
 */
function segmentAdCopyPatterns(
  patterns: AdCopyPatterns,
  product: ProductInput
): AdCopyPatterns {
  const matchingHeadlines = patterns.headlineTemplates.filter((h) =>
    matchesProduct(h, product)
  );

  const matchingDescriptions = patterns.descriptionTemplates.filter((d) =>
    matchesProduct(d, product)
  );

  return {
    headlineTemplates: matchingHeadlines.length > 0 ? matchingHeadlines : patterns.headlineTemplates,
    descriptionTemplates: matchingDescriptions.length > 0 ? matchingDescriptions : patterns.descriptionTemplates,
    commonCTAs: patterns.commonCTAs,
    averageHeadlinesPerAd: patterns.averageHeadlinesPerAd,
    averageDescriptionsPerAd: patterns.averageDescriptionsPerAd,
  };
}

/**
 * Segments ad group structures by product relevance
 */
function segmentAdGroupStructures(
  structures: AdGroupStructures,
  product: ProductInput
): AdGroupStructures {
  const matchingThemes = structures.themes.filter((theme) =>
    matchesProduct(theme, product)
  );

  return {
    namingConvention: structures.namingConvention,
    themes: matchingThemes.length > 0 ? matchingThemes : structures.themes,
    averageKeywordsPerGroup: structures.averageKeywordsPerGroup,
  };
}

/**
 * Creates product-specific patterns from aggregated patterns
 */
export function segmentPatternsByProduct(
  aggregatedPatterns: CampaignPatterns,
  product: ProductInput
): CampaignPatterns {
  const segmentedKeywords = segmentKeywords(
    aggregatedPatterns.highPerformingKeywords,
    product
  );

  const segmentedAdCopy = segmentAdCopyPatterns(
    aggregatedPatterns.adCopyPatterns,
    product
  );

  const segmentedStructures = segmentAdGroupStructures(
    aggregatedPatterns.adGroupStructures,
    product
  );

  return {
    adGroupStructures: segmentedStructures,
    highPerformingKeywords: segmentedKeywords,
    adCopyPatterns: segmentedAdCopy,
    biddingPatterns: aggregatedPatterns.biddingPatterns, // Bidding patterns are shared
    productId: product.id,
    productName: product.name,
  };
}

/**
 * Creates product-specific patterns for all products
 */
export function segmentPatternsForAllProducts(
  aggregatedPatterns: CampaignPatterns,
  products: ProductInput[]
): CampaignPatterns[] {
  return products.map((product) =>
    segmentPatternsByProduct(aggregatedPatterns, product)
  );
}
