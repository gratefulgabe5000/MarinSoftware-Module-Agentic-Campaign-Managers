import { ProductInput } from '../types/product.types';
import { CampaignPatterns } from '../types/campaign-patterns.types';
import {
  KeywordSource,
  GeneratedKeyword,
  KeywordGenerationRequest,
  KeywordValidationResult,
} from '../types/keyword-generation.types';
import axios from 'axios';
import config from '../config/env';

/**
 * Keyword Generation Service
 * Generates keywords from multiple sources and aggregates them
 */

/**
 * Extracts keywords from product data
 */
export function extractKeywordsFromProduct(
  product: ProductInput
): KeywordSource[] {
  const keywords: KeywordSource[] = [];

  // Extract from product name
  if (product.name) {
    const nameWords = product.name
      .toLowerCase()
      .split(/[\s-]+/)
      .filter((word) => word.length > 2);
    
    nameWords.forEach((word) => {
      keywords.push({
        type: 'product_data',
        keyword: word,
        relevance: 0.9, // High relevance for product name
        confidence: 0.8,
      });
    });

    // Add full product name as keyword
    keywords.push({
      type: 'product_data',
      keyword: product.name.toLowerCase(),
      relevance: 0.95,
      confidence: 0.9,
    });
  }

  // Extract from category
  if (product.category) {
    keywords.push({
      type: 'product_data',
      keyword: product.category.toLowerCase(),
      relevance: 0.7,
      confidence: 0.7,
    });

    // Add category + product name variations
    if (product.name) {
      keywords.push({
        type: 'product_data',
        keyword: `${product.category.toLowerCase()} ${product.name.toLowerCase()}`,
        relevance: 0.8,
        confidence: 0.75,
      });
    }
  }

  // Extract from description (top keywords only)
  if (product.description) {
    const descWords = product.description
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 4) // Longer words are more meaningful
      .slice(0, 5); // Top 5 words
    
    descWords.forEach((word) => {
      keywords.push({
        type: 'product_data',
        keyword: word,
        relevance: 0.6,
        confidence: 0.6,
      });
    });
  }

  return keywords;
}

/**
 * Finds similar keywords from existing high-performing keywords
 */
export function matchKeywordsFromExistingCampaigns(
  product: ProductInput,
  patterns?: CampaignPatterns
): KeywordSource[] {
  const keywords: KeywordSource[] = [];

  if (!patterns?.highPerformingKeywords || patterns.highPerformingKeywords.length === 0) {
    return keywords;
  }

  const productName = product.name?.toLowerCase() || '';
  const category = product.category?.toLowerCase() || '';
  const productTerms = [...productName.split(/\s+/), category].filter(Boolean);

  // Find similar keywords using simple string matching
  patterns.highPerformingKeywords.forEach((hpKeyword) => {
    const keywordText = hpKeyword.keyword.toLowerCase();
    
    // Check if keyword contains product terms
    const matchesProduct = productTerms.some((term) => 
      keywordText.includes(term) || term.includes(keywordText)
    );

    if (matchesProduct) {
      // Calculate similarity score
      let similarity = 0;
      productTerms.forEach((term) => {
        if (keywordText.includes(term)) {
          similarity += 0.3;
        }
        if (term.includes(keywordText)) {
          similarity += 0.2;
        }
      });

      if (similarity > 0.2) {
        keywords.push({
          type: 'existing_campaign',
          keyword: hpKeyword.keyword,
          relevance: Math.min(0.8, similarity),
          confidence: 0.7,
          performanceData: {
            ctr: hpKeyword.ctr,
            conversions: hpKeyword.conversions,
            roas: hpKeyword.roas,
          },
        });
      }
    }
  });

  return keywords;
}

/**
 * Generates keywords using LLM
 */
export async function generateKeywordsWithLLM(
  product: ProductInput
): Promise<KeywordSource[]> {
  try {
    const apiKey = config.openaiApiKey || '';
    if (!apiKey) {
      // Return empty array if no API key (will fall back to other sources)
      return [];
    }

    const prompt = `Generate 20 relevant search keywords for a product with the following details:
- Product Name: ${product.name}
- Category: ${product.category || 'N/A'}
- Description: ${product.description || 'N/A'}
- URL: ${product.url}

Generate a JSON array of keyword strings. Focus on:
1. Product-specific keywords
2. Category-based keywords
3. Intent-based keywords (buy, shop, compare, etc.)
4. Brand + product combinations

Return only a JSON array of strings, no other text. Example: ["buy product name", "product name online", "best product name"]`;

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a keyword generation assistant. Always return valid JSON arrays.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
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
    let keywords: string[] = [];
    try {
      // Try to parse as JSON
      const parsed = JSON.parse(content);
      
      // Check if it's an object with a keywords array
      if (parsed.keywords && Array.isArray(parsed.keywords)) {
        keywords = parsed.keywords;
      } else if (Array.isArray(parsed)) {
        keywords = parsed;
      } else if (typeof parsed === 'string') {
        // If it's a string, try to split by commas or newlines
        keywords = parsed.split(/[,\n]/).map((k: string) => k.trim()).filter(Boolean);
      }
    } catch {
      // If JSON parsing fails, try to extract keywords from text
      keywords = content
        .split(/[,\n]/)
        .map((k: string) => k.trim().replace(/[\[\]"]/g, ''))
        .filter((k: string) => k.length > 0)
        .slice(0, 20);
    }

    // Convert to KeywordSource array
    return keywords.map((keyword: string) => ({
      type: 'llm_generated' as const,
      keyword: keyword.toLowerCase(),
      relevance: 0.7,
      confidence: 0.6,
    }));
  } catch (error) {
    console.error('Error generating keywords with LLM:', error);
    // Return empty array on error
    return [];
  }
}

/**
 * Aggregates and ranks keywords from all sources
 */
export function aggregateAndRankKeywords(
  allKeywords: KeywordSource[],
  maxKeywords: number = 20
): GeneratedKeyword[] {
  // Remove duplicates (case-insensitive)
  const keywordMap = new Map<string, KeywordSource>();
  
  allKeywords.forEach((source) => {
    const key = source.keyword.toLowerCase().trim();
    const existing = keywordMap.get(key);
    
    if (!existing) {
      keywordMap.set(key, source);
    } else {
      // If keyword exists, use the one with higher relevance
      if (source.relevance > existing.relevance) {
        keywordMap.set(key, source);
      } else if (source.relevance === existing.relevance && source.confidence > existing.confidence) {
        keywordMap.set(key, source);
      }
    }
  });

  // Convert to GeneratedKeyword and calculate scores
  const generatedKeywords: GeneratedKeyword[] = Array.from(keywordMap.values()).map((source) => {
    // Calculate aggregated score
    // Relevance * 0.4 + Confidence * 0.2 + Performance potential * 0.3 + Intent score * 0.1
    let performanceScore = 0;
    if (source.performanceData) {
      const ctr = source.performanceData.ctr || 0;
      const conversions = source.performanceData.conversions || 0;
      const roas = source.performanceData.roas || 0;
      performanceScore = (ctr * 0.3 + conversions * 0.3 + roas * 0.4) / 100; // Normalize
    }

    // Intent score (keywords with action words get higher score)
    const intentWords = ['buy', 'shop', 'purchase', 'order', 'find', 'best', 'cheap', 'discount'];
    const hasIntent = intentWords.some((word) => source.keyword.includes(word));
    const intentScore = hasIntent ? 0.8 : 0.5;

    const score =
      source.relevance * 0.4 +
      source.confidence * 0.2 +
      performanceScore * 0.3 +
      intentScore * 0.1;

    // Determine match type based on source type
    let matchType: 'broad' | 'phrase' | 'exact' = 'broad';
    if (source.type === 'existing_campaign' && source.performanceData) {
      // Use match type from performance data if available
      matchType = 'phrase'; // Default for existing campaigns
    } else if (source.type === 'product_data') {
      matchType = 'phrase'; // Product data keywords are usually phrase match
    } else {
      matchType = 'broad'; // LLM and other sources default to broad
    }

    return {
      text: source.keyword,
      matchType,
      source,
      score,
      suggestedBid: source.performanceData?.averageCpc,
    };
  });

  // Sort by score (descending)
  generatedKeywords.sort((a, b) => (b.score || 0) - (a.score || 0));

  // Return top N keywords
  return generatedKeywords.slice(0, maxKeywords);
}

/**
 * Validates keywords against Google Ads policies
 */
export function validateKeywords(
  keywords: string[]
): KeywordValidationResult[] {
  return keywords.map((keyword) => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check length (max 80 characters)
    if (keyword.length > 80) {
      errors.push('Keyword exceeds maximum length of 80 characters');
    }

    // Check for invalid characters
    const invalidChars = /[<>{}[\]\\]/;
    if (invalidChars.test(keyword)) {
      errors.push('Keyword contains invalid characters');
    }

    // Check for empty or whitespace-only
    if (!keyword.trim()) {
      errors.push('Keyword cannot be empty');
    }

    // Warnings for common issues
    if (keyword.length < 3) {
      warnings.push('Keyword is very short and may have low relevance');
    }

    if (keyword.length > 60) {
      warnings.push('Keyword is very long and may have low search volume');
    }

    return {
      keyword,
      valid: errors.length === 0,
      errors,
      warnings,
    };
  });
}

/**
 * Main function to generate keywords for a product
 */
export async function generateKeywordsForProduct(
  request: KeywordGenerationRequest
): Promise<GeneratedKeyword[]> {
  const { product, patterns, maxKeywords = 20 } = request;

  // Extract keywords from all sources
  const productKeywords = extractKeywordsFromProduct(product);
  const existingKeywords = matchKeywordsFromExistingCampaigns(product, patterns);
  
  // Generate with LLM (async)
  let llmKeywords: KeywordSource[] = [];
  try {
    llmKeywords = await generateKeywordsWithLLM(product);
  } catch (error) {
    console.error('LLM keyword generation failed, continuing without LLM keywords:', error);
  }

  // Aggregate all keywords
  const allKeywords = [...productKeywords, ...existingKeywords, ...llmKeywords];

  // Aggregate and rank
  const rankedKeywords = aggregateAndRankKeywords(allKeywords, maxKeywords);

  // Validate keywords
  const keywordTexts = rankedKeywords.map((k) => k.text);
  const validationResults = validateKeywords(keywordTexts);

  // Filter out invalid keywords
  const validKeywords = rankedKeywords.filter((keyword, index) => 
    validationResults[index].valid
  );

  return validKeywords;
}

