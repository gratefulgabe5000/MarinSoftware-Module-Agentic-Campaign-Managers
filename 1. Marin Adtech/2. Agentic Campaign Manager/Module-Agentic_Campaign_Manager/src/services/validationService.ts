/**
 * Validation Service
 * Provides validation functions for campaign preview editing
 */

import { PreviewValidationResult } from '../types/campaign-preview.types';

/**
 * Validation error
 */
export interface ValidationError {
  rowId: string;
  field: string;
  message: string;
}

/**
 * Validation warnings
 */
export interface ValidationWarning {
  rowId: string;
  field: string;
  message: string;
}

/**
 * Validate ad group name
 */
export const validateAdGroupName = (name: string): { valid: boolean; error?: string } => {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Ad group name is required' };
  }
  if (name.length > 255) {
    return { valid: false, error: 'Ad group name must be 255 characters or less' };
  }
  // Check for invalid characters (Google Ads doesn't allow certain special characters)
  const invalidChars = /[<>{}]/;
  if (invalidChars.test(name)) {
    return { valid: false, error: 'Ad group name contains invalid characters (<, >, {, })' };
  }
  return { valid: true };
};

/**
 * Validate keyword
 */
export const validateKeyword = (keyword: string): { valid: boolean; error?: string } => {
  if (!keyword || keyword.trim().length === 0) {
    return { valid: false, error: 'Keyword is required' };
  }
  if (keyword.length > 80) {
    return { valid: false, error: 'Keyword must be 80 characters or less' };
  }
  // Check for invalid characters
  const invalidChars = /[<>{}]/;
  if (invalidChars.test(keyword)) {
    return { valid: false, error: 'Keyword contains invalid characters (<, >, {, })' };
  }
  return { valid: true };
};

/**
 * Validate headline
 */
export const validateHeadline = (headline: string): { valid: boolean; error?: string; warning?: string } => {
  if (!headline || headline.trim().length === 0) {
    return { valid: false, error: 'Headline is required' };
  }
  if (headline.length > 30) {
    return { valid: false, error: 'Headline must be 30 characters or less' };
  }
  if (headline.length < 3) {
    return { valid: false, error: 'Headline must be at least 3 characters' };
  }
  // Warning for very short headlines
  if (headline.length < 10) {
    return { valid: true, warning: 'Headline is very short. Consider making it more descriptive.' };
  }
  return { valid: true };
};

/**
 * Validate description
 */
export const validateDescription = (description: string): { valid: boolean; error?: string; warning?: string } => {
  if (!description || description.trim().length === 0) {
    return { valid: false, error: 'Description is required' };
  }
  if (description.length > 90) {
    return { valid: false, error: 'Description must be 90 characters or less' };
  }
  if (description.length < 10) {
    return { valid: false, error: 'Description must be at least 10 characters' };
  }
  // Warning for very short descriptions
  if (description.length < 30) {
    return { valid: true, warning: 'Description is short. Consider making it more detailed.' };
  }
  return { valid: true };
};

/**
 * Validate URL
 */
export const validateUrl = (url: string): { valid: boolean; error?: string } => {
  if (!url || url.trim().length === 0) {
    return { valid: false, error: 'URL is required' };
  }
  try {
    const urlObj = new URL(url);
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      return { valid: false, error: 'URL must start with http:// or https://' };
    }
    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }
};

/**
 * Validate campaign preview data
 */
export const validateCampaignPreview = (
  previewData: any,
  adGroups: any[]
): PreviewValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Validate ad groups
  adGroups.forEach((adGroup) => {
    // Validate ad group name
    const nameValidation = validateAdGroupName(adGroup.name);
    if (!nameValidation.valid) {
      errors.push({
        rowId: adGroup.id,
        field: 'name',
        message: nameValidation.error || 'Invalid ad group name',
      });
    }

    // Validate keywords
    if (adGroup.keywords) {
      adGroup.keywords.forEach((keyword: any, index: number) => {
        const keywordValidation = validateKeyword(keyword.text || keyword);
        if (!keywordValidation.valid) {
          errors.push({
            rowId: `keyword-${adGroup.id}-${index}`,
            field: 'text',
            message: keywordValidation.error || 'Invalid keyword',
          });
        }
      });
    }

    // Validate ads
    if (adGroup.ads) {
      adGroup.ads.forEach((ad: any, adIndex: number) => {
        // Validate headlines
        if (ad.headlines) {
          ad.headlines.forEach((headline: any, hIndex: number) => {
            const headlineText = typeof headline === 'string' ? headline : headline.text;
            const headlineValidation = validateHeadline(headlineText);
            if (!headlineValidation.valid) {
              errors.push({
                rowId: `ad-${adGroup.id}-${adIndex}-headline-${hIndex}`,
                field: 'headline',
                message: headlineValidation.error || 'Invalid headline',
              });
            } else if (headlineValidation.warning) {
              warnings.push({
                rowId: `ad-${adGroup.id}-${adIndex}-headline-${hIndex}`,
                field: 'headline',
                message: headlineValidation.warning,
              });
            }
          });

          // Check minimum headline count
          if (ad.headlines.length < 3) {
            errors.push({
              rowId: `ad-${adGroup.id}-${adIndex}`,
              field: 'headlines',
              message: 'At least 3 headlines are required',
            });
          }
        }

        // Validate descriptions
        if (ad.descriptions) {
          ad.descriptions.forEach((description: any, dIndex: number) => {
            const descText = typeof description === 'string' ? description : description.text;
            const descValidation = validateDescription(descText);
            if (!descValidation.valid) {
              errors.push({
                rowId: `ad-${adGroup.id}-${adIndex}-description-${dIndex}`,
                field: 'description',
                message: descValidation.error || 'Invalid description',
              });
            } else if (descValidation.warning) {
              warnings.push({
                rowId: `ad-${adGroup.id}-${adIndex}-description-${dIndex}`,
                field: 'description',
                message: descValidation.warning,
              });
            }
          });

          // Check minimum description count
          if (ad.descriptions.length < 2) {
            errors.push({
              rowId: `ad-${adGroup.id}-${adIndex}`,
              field: 'descriptions',
              message: 'At least 2 descriptions are required',
            });
          }
        }

        // Validate final URL
        if (ad.finalUrl) {
          const urlValidation = validateUrl(ad.finalUrl);
          if (!urlValidation.valid) {
            errors.push({
              rowId: `ad-${adGroup.id}-${adIndex}`,
              field: 'finalUrl',
              message: urlValidation.error || 'Invalid URL',
            });
          }
        }
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Get validation error for a specific field
 */
export const getValidationError = (
  validationResult: PreviewValidationResult,
  rowId: string,
  field: string
): string | undefined => {
  const error = validationResult.errors.find((e) => e.rowId === rowId && e.field === field);
  return error?.message;
};

/**
 * Get validation warning for a specific field
 */
export const getValidationWarning = (
  validationResult: PreviewValidationResult,
  rowId: string,
  field: string
): string | undefined => {
  const warning = validationResult.warnings.find((w) => w.rowId === rowId && w.field === field);
  return warning?.message;
};

