import { ProductInput } from '../types/product.types';
import { CampaignPatterns } from '../types/campaign-patterns.types';

/**
 * Ad Copy Template Service
 * Handles template parsing and variable substitution for ad copy
 */

/**
 * Substitutes variables in a template string
 */
function substituteVariables(
  template: string,
  product: ProductInput,
  patterns?: CampaignPatterns
): string {
  let result = template;

  // Product variables
  result = result.replace(/{productName}/g, product.name || '');
  result = result.replace(/{category}/g, product.category || '');
  result = result.replace(/{price}/g, product.price ? `$${product.price.toFixed(2)}` : '');
  result = result.replace(/{description}/g, product.description || '');

  // Extract brand/model from product name
  const nameParts = product.name.split(/[\s-]+/);
  const brand = nameParts[0] || '';
  const model = nameParts.slice(1).join(' ') || '';

  result = result.replace(/{brand}/g, brand);
  result = result.replace(/{model}/g, model);

  // Extract domain from URL
  try {
    const urlObj = new URL(product.url);
    const domain = urlObj.hostname.replace('www.', '');
    result = result.replace(/{domain}/g, domain);
  } catch {
    result = result.replace(/{domain}/g, '');
  }

  // Common benefits (default if not in description)
  const benefits = ['quality', 'premium', 'affordable', 'best', 'top-rated'];
  result = result.replace(/{benefit}/g, benefits[Math.floor(Math.random() * benefits.length)]);

  return result.trim();
}

/**
 * Parses templates from learned patterns
 */
export function parseTemplatesFromPatterns(
  patterns?: CampaignPatterns
): {
  headlineTemplates: string[];
  descriptionTemplates: string[];
  commonCTAs: string[];
} {
  const headlineTemplates: string[] = [];
  const descriptionTemplates: string[] = [];
  const commonCTAs: string[] = [];

  if (patterns?.adCopyPatterns) {
    // Use top templates from patterns
    headlineTemplates.push(
      ...(patterns.adCopyPatterns.headlineTemplates || []).slice(0, 5)
    );
    descriptionTemplates.push(
      ...(patterns.adCopyPatterns.descriptionTemplates || []).slice(0, 3)
    );
    commonCTAs.push(...(patterns.adCopyPatterns.commonCTAs || []));
  }

  // Add default templates if none available
  if (headlineTemplates.length === 0) {
    headlineTemplates.push(
      '{productName}',
      'Shop {productName}',
      'Best {category}',
      '{productName} - {price}',
      'Buy {productName} Online'
    );
  }

  if (descriptionTemplates.length === 0) {
    descriptionTemplates.push(
      'Discover {productName}. {description}',
      'Shop {productName} - {category}. Quality products at great prices.',
      'Find {productName} online. {benefit} selection with fast shipping.'
    );
  }

  if (commonCTAs.length === 0) {
    commonCTAs.push('Shop Now', 'Buy Now', 'Learn More', 'Get Started', 'Order Today');
  }

  return {
    headlineTemplates,
    descriptionTemplates,
    commonCTAs,
  };
}

/**
 * Generates headlines from templates
 */
export function generateHeadlinesFromTemplates(
  product: ProductInput,
  patterns?: CampaignPatterns,
  maxHeadlines: number = 15
): string[] {
  const { headlineTemplates, commonCTAs } = parseTemplatesFromPatterns(patterns);
  const headlines: string[] = [];

  // Generate from templates
  headlineTemplates.forEach((template) => {
    const headline = substituteVariables(template, product, patterns);
    if (headline.length <= 30 && headline.length > 0) {
      headlines.push(headline);
    }
  });

  // Add variations with CTAs
  commonCTAs.slice(0, 3).forEach((cta) => {
    const headline = `${product.name} - ${cta}`;
    if (headline.length <= 30 && headline.length > 0) {
      headlines.push(headline);
    }
  });

  // Add product-specific variations
  if (product.category) {
    headlines.push(`${product.category} - ${product.name}`);
    headlines.push(`Shop ${product.category}`);
  }

  if (product.price) {
    headlines.push(`${product.name} - $${product.price.toFixed(2)}`);
    headlines.push(`Buy ${product.name} - $${product.price.toFixed(2)}`);
  }

  // Remove duplicates and limit to maxHeadlines
  const uniqueHeadlines = Array.from(new Set(headlines))
    .filter((h) => h.length <= 30 && h.length > 0)
    .slice(0, maxHeadlines);

  return uniqueHeadlines;
}

/**
 * Generates descriptions from templates
 */
export function generateDescriptionsFromTemplates(
  product: ProductInput,
  patterns?: CampaignPatterns,
  maxDescriptions: number = 4
): string[] {
  const { descriptionTemplates, commonCTAs } = parseTemplatesFromPatterns(patterns);
  const descriptions: string[] = [];

  // Generate from templates
  descriptionTemplates.forEach((template) => {
    const description = substituteVariables(template, product, patterns);
    if (description.length <= 90 && description.length > 0) {
      descriptions.push(description);
    }
  });

  // Add product-specific descriptions
  if (product.description) {
    const shortDesc = product.description.substring(0, 90);
    if (shortDesc.length > 0) {
      descriptions.push(shortDesc);
    }
  }

  // Add variations with CTAs
  commonCTAs.slice(0, 2).forEach((cta) => {
    const description = `${product.name}. Quality ${product.category || 'product'}. ${cta} today!`;
    if (description.length <= 90 && description.length > 0) {
      descriptions.push(description);
    }
  });

  // Remove duplicates and limit to maxDescriptions
  const uniqueDescriptions = Array.from(new Set(descriptions))
    .filter((d) => d.length <= 90 && d.length > 0)
    .slice(0, maxDescriptions);

  return uniqueDescriptions;
}

