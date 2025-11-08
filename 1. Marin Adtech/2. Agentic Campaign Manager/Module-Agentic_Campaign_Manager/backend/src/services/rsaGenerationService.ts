import { ProductInput } from '../types/product.types';
import { CampaignPatterns } from '../types/campaign-patterns.types';
import {
  RSAGenerationRequest,
  GeneratedRSA,
  AdHeadline,
  AdDescription,
  AdCopyValidationRequest,
  AdCopyValidationResult,
} from '../types/rsa-generation.types';
import {
  generateHeadlinesFromTemplates,
  generateDescriptionsFromTemplates,
} from './adCopyTemplateService';
import axios from 'axios';
import config from '../config/env';

/**
 * RSA Generation Service
 * Generates Responsive Search Ads from products and patterns
 */

/**
 * Generates a unique ID for an RSA
 */
function generateRSAId(): string {
  return `rsa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validates headline character limit
 */
function validateHeadline(text: string): { valid: boolean; error?: string } {
  if (text.length > 30) {
    return {
      valid: false,
      error: `Headline exceeds 30 character limit (${text.length} characters)`,
    };
  }
  if (text.length === 0) {
    return {
      valid: false,
      error: 'Headline cannot be empty',
    };
  }
  return { valid: true };
}

/**
 * Validates description character limit
 */
function validateDescription(text: string): { valid: boolean; error?: string } {
  if (text.length > 90) {
    return {
      valid: false,
      error: `Description exceeds 90 character limit (${text.length} characters)`,
    };
  }
  if (text.length === 0) {
    return {
      valid: false,
      error: 'Description cannot be empty',
    };
  }
  return { valid: true };
}

/**
 * Truncates text to fit character limit
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Generates ad copy using LLM
 */
export async function generateAdCopyWithLLM(
  product: ProductInput,
  patterns?: CampaignPatterns,
  maxHeadlines: number = 15,
  maxDescriptions: number = 4
): Promise<{ headlines: string[]; descriptions: string[] }> {
  try {
    const apiKey = config.openaiApiKey || '';
    if (!apiKey) {
      // Fallback to template-based generation
      return {
        headlines: generateHeadlinesFromTemplates(product, patterns, maxHeadlines),
        descriptions: generateDescriptionsFromTemplates(product, patterns, maxDescriptions),
      };
    }

    const prompt = `Generate ${maxHeadlines} headlines (max 30 characters each) and ${maxDescriptions} descriptions (max 90 characters each) for a Google Ads Responsive Search Ad.

Product Details:
- Product Name: ${product.name}
- Category: ${product.category || 'N/A'}
- Description: ${product.description || 'N/A'}
- Price: ${product.price ? `$${product.price.toFixed(2)}` : 'N/A'}
- URL: ${product.url}

Requirements:
- Headlines: ${maxHeadlines} headlines, each max 30 characters
- Descriptions: ${maxDescriptions} descriptions, each max 90 characters
- Focus on: product benefits, call-to-action, urgency, value proposition
- Include variety in tone and style
- Ensure all headlines and descriptions are under character limits

Return JSON format:
{
  "headlines": ["headline 1", "headline 2", ...],
  "descriptions": ["description 1", "description 2", ...]
}`;

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert copywriter for Google Ads. Always return valid JSON with headlines and descriptions arrays.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.8, // Higher temperature for variety
        max_tokens: 1000,
        response_format: { type: 'json_object' },
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    const responseData = response.data as any;
    const content = responseData.choices[0]?.message?.content || '';

    // Parse LLM response
    let headlines: string[] = [];
    let descriptions: string[] = [];

    try {
      const parsed = JSON.parse(content);
      headlines = parsed.headlines || [];
      descriptions = parsed.descriptions || [];
    } catch {
      // If JSON parsing fails, fallback to template generation
      return {
        headlines: generateHeadlinesFromTemplates(product, patterns, maxHeadlines),
        descriptions: generateDescriptionsFromTemplates(product, patterns, maxDescriptions),
      };
    }

    // Validate and truncate headlines
    headlines = headlines
      .map((h: string) => {
        const validation = validateHeadline(h);
        if (!validation.valid) {
          return truncateText(h, 30);
        }
        return h;
      })
      .filter((h: string) => h.length > 0)
      .slice(0, maxHeadlines);

    // Validate and truncate descriptions
    descriptions = descriptions
      .map((d: string) => {
        const validation = validateDescription(d);
        if (!validation.valid) {
          return truncateText(d, 90);
        }
        return d;
      })
      .filter((d: string) => d.length > 0)
      .slice(0, maxDescriptions);

    // Ensure minimum counts
    if (headlines.length < 3) {
      const templateHeadlines = generateHeadlinesFromTemplates(product, patterns, 3 - headlines.length);
      headlines.push(...templateHeadlines);
    }

    if (descriptions.length < 2) {
      const templateDescriptions = generateDescriptionsFromTemplates(product, patterns, 2 - descriptions.length);
      descriptions.push(...templateDescriptions);
    }

    return {
      headlines: headlines.slice(0, maxHeadlines),
      descriptions: descriptions.slice(0, maxDescriptions),
    };
  } catch (error) {
    console.error('Error generating ad copy with LLM:', error);
    // Fallback to template-based generation
    return {
      headlines: generateHeadlinesFromTemplates(product, patterns, maxHeadlines),
      descriptions: generateDescriptionsFromTemplates(product, patterns, maxDescriptions),
    };
  }
}

/**
 * Generates RSA for a product
 */
export async function generateRSA(
  request: RSAGenerationRequest
): Promise<GeneratedRSA> {
  const { adGroupId, product, patterns, maxHeadlines = 15, maxDescriptions = 4 } = request;

  // Generate ad copy using LLM (with template fallback)
  const { headlines, descriptions } = await generateAdCopyWithLLM(
    product,
    patterns,
    maxHeadlines,
    maxDescriptions
  );

  // Convert to AdHeadline and AdDescription arrays
  const adHeadlines: AdHeadline[] = headlines.map((text, index) => ({
    text,
    pinned: false,
    position: index,
  }));

  const adDescriptions: AdDescription[] = descriptions.map((text) => ({
    text,
  }));

  // Extract display URL from final URL
  let displayUrl: string | undefined;
  try {
    const urlObj = new URL(product.url);
    displayUrl = urlObj.hostname.replace('www.', '');
  } catch {
    displayUrl = product.url.substring(0, 35); // Fallback
  }

  const rsa: GeneratedRSA = {
    id: generateRSAId(),
    adGroupId,
    headlines: adHeadlines,
    descriptions: adDescriptions,
    finalUrl: product.url,
    displayUrl,
    paths: [], // Can be added later if needed
  };

  return rsa;
}

/**
 * Validates ad copy
 */
export function validateAdCopy(
  request: AdCopyValidationRequest
): AdCopyValidationResult {
  const { headlines, descriptions } = request;
  const headlineErrors: string[] = [];
  const descriptionErrors: string[] = [];
  const headlineWarnings: string[] = [];
  const descriptionWarnings: string[] = [];

  // Validate headlines
  if (headlines.length < 3) {
    headlineErrors.push(`Minimum 3 headlines required (found ${headlines.length})`);
  }

  headlines.forEach((headline, index) => {
    const validation = validateHeadline(headline);
    if (!validation.valid) {
      headlineErrors.push(`Headline ${index + 1}: ${validation.error}`);
    }
    if (headline.length < 5) {
      headlineWarnings.push(`Headline ${index + 1}: Very short (${headline.length} characters)`);
    }
  });

  // Validate descriptions
  if (descriptions.length < 2) {
    descriptionErrors.push(`Minimum 2 descriptions required (found ${descriptions.length})`);
  }

  descriptions.forEach((description, index) => {
    const validation = validateDescription(description);
    if (!validation.valid) {
      descriptionErrors.push(`Description ${index + 1}: ${validation.error}`);
    }
    if (description.length < 10) {
      descriptionWarnings.push(`Description ${index + 1}: Very short (${description.length} characters)`);
    }
  });

  // Check for duplicates
  const uniqueHeadlines = new Set(headlines);
  if (uniqueHeadlines.size < headlines.length) {
    headlineWarnings.push('Some headlines are duplicates');
  }

  const uniqueDescriptions = new Set(descriptions);
  if (uniqueDescriptions.size < descriptions.length) {
    descriptionWarnings.push('Some descriptions are duplicates');
  }

  const valid = headlineErrors.length === 0 && descriptionErrors.length === 0;

  return {
    valid,
    headlineErrors,
    descriptionErrors,
    headlineWarnings,
    descriptionWarnings,
  };
}

