/**
 * Marin Dispatcher Type Validation Utilities
 *
 * This module provides validation functions for all Marin Dispatcher API request types.
 * Each function validates the structure and constraints of request objects and returns
 * an array of error messages (empty array if valid).
 *
 * @module marinTypeValidators
 */

import {
  MarinCampaignRequest,
  MarinAdGroupRequest,
  MarinAdRequest,
  MarinKeywordRequest,
  BatchOperation,
  BatchOperationType,
  BatchResourceType,
  isValidCampaignStatus,
  isValidBudgetDeliveryMethod,
  isValidKeywordMatchType,
  isValidResourceStatus,
  isValidBatchOperationType,
  isValidBatchResourceType,
} from '../types/marinDispatcher.types';

/**
 * Validation result type
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Helper function to check if a value is a non-empty string
 */
function isNonEmptyString(value: any): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Helper function to check if a value is a valid URL
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Helper function to check if a value is a positive number
 */
function isPositiveNumber(value: any): boolean {
  return typeof value === 'number' && value > 0 && !isNaN(value);
}

/**
 * Validates a Marin campaign request object
 *
 * @param request - The campaign request to validate
 * @returns ValidationResult with isValid flag and array of error messages
 */
export function validateCampaignRequest(
  request: MarinCampaignRequest
): ValidationResult {
  const errors: string[] = [];

  // Validate accountId
  if (!isNonEmptyString(request.accountId)) {
    errors.push('accountId is required and must be a non-empty string');
  }

  // Validate name
  if (!isNonEmptyString(request.name)) {
    errors.push('name is required and must be a non-empty string');
  } else if (request.name.length > 255) {
    errors.push('name must not exceed 255 characters');
  }

  // Validate status
  if (!isValidCampaignStatus(request.status)) {
    errors.push('status must be one of: ENABLED, PAUSED, REMOVED');
  }

  // Validate budget
  if (!request.budget) {
    errors.push('budget is required');
  } else {
    if (!isPositiveNumber(request.budget.amount)) {
      errors.push('budget.amount must be a positive number');
    }
    if (!isValidBudgetDeliveryMethod(request.budget.deliveryMethod)) {
      errors.push('budget.deliveryMethod must be one of: STANDARD, ACCELERATED');
    }
  }

  // Validate biddingStrategy
  if (!isNonEmptyString(request.biddingStrategy)) {
    errors.push('biddingStrategy is required and must be a non-empty string');
  }

  // Validate objective (optional, but if provided must be a string)
  if (request.objective !== undefined && !isNonEmptyString(request.objective)) {
    errors.push('objective must be a non-empty string if provided');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates a Marin ad group request object
 *
 * @param request - The ad group request to validate
 * @returns ValidationResult with isValid flag and array of error messages
 */
export function validateAdGroupRequest(
  request: MarinAdGroupRequest
): ValidationResult {
  const errors: string[] = [];

  // Validate accountId
  if (!isNonEmptyString(request.accountId)) {
    errors.push('accountId is required and must be a non-empty string');
  }

  // Validate campaignId
  if (!isNonEmptyString(request.campaignId)) {
    errors.push('campaignId is required and must be a non-empty string');
  }

  // Validate name
  if (!isNonEmptyString(request.name)) {
    errors.push('name is required and must be a non-empty string');
  }

  // Validate status (optional)
  if (request.status !== undefined && !isValidResourceStatus(request.status)) {
    errors.push('status must be one of: ENABLED, PAUSED, REMOVED');
  }

  // Validate cpcBid (optional)
  if (request.cpcBid !== undefined && !isPositiveNumber(request.cpcBid)) {
    errors.push('cpcBid must be a positive number if provided');
  }

  // Validate cpmBid (optional)
  if (request.cpmBid !== undefined && !isPositiveNumber(request.cpmBid)) {
    errors.push('cpmBid must be a positive number if provided');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates a Marin ad request object (Responsive Search Ad)
 *
 * @param request - The ad request to validate
 * @returns ValidationResult with isValid flag and array of error messages
 */
export function validateAdRequest(request: MarinAdRequest): ValidationResult {
  const errors: string[] = [];

  // Validate accountId
  if (!isNonEmptyString(request.accountId)) {
    errors.push('accountId is required and must be a non-empty string');
  }

  // Validate adGroupId
  if (!isNonEmptyString(request.adGroupId)) {
    errors.push('adGroupId is required and must be a non-empty string');
  }

  // Validate type
  if (request.type !== 'RESPONSIVE_SEARCH_AD') {
    errors.push('type must be RESPONSIVE_SEARCH_AD');
  }

  // Validate headlines
  if (!Array.isArray(request.headlines)) {
    errors.push('headlines must be an array');
  } else {
    if (request.headlines.length < 3) {
      errors.push('headlines must have at least 3 items');
    }
    if (request.headlines.length > 15) {
      errors.push('headlines must have at most 15 items');
    }
    request.headlines.forEach((headline, index) => {
      if (!headline.text || !isNonEmptyString(headline.text)) {
        errors.push(`headlines[${index}].text is required and must be a non-empty string`);
      } else if (headline.text.length > 30) {
        errors.push(`headlines[${index}].text must not exceed 30 characters`);
      }
    });
  }

  // Validate descriptions
  if (!Array.isArray(request.descriptions)) {
    errors.push('descriptions must be an array');
  } else {
    if (request.descriptions.length < 2) {
      errors.push('descriptions must have at least 2 items');
    }
    if (request.descriptions.length > 4) {
      errors.push('descriptions must have at most 4 items');
    }
    request.descriptions.forEach((description, index) => {
      if (!description.text || !isNonEmptyString(description.text)) {
        errors.push(`descriptions[${index}].text is required and must be a non-empty string`);
      } else if (description.text.length > 90) {
        errors.push(`descriptions[${index}].text must not exceed 90 characters`);
      }
    });
  }

  // Validate finalUrl
  if (!isNonEmptyString(request.finalUrl)) {
    errors.push('finalUrl is required and must be a non-empty string');
  } else if (!isValidUrl(request.finalUrl)) {
    errors.push('finalUrl must be a valid URL');
  }

  // Validate displayUrl (optional)
  if (request.displayUrl !== undefined && !isNonEmptyString(request.displayUrl)) {
    errors.push('displayUrl must be a non-empty string if provided');
  }

  // Validate paths (optional)
  if (request.paths !== undefined) {
    if (!Array.isArray(request.paths)) {
      errors.push('paths must be an array if provided');
    } else {
      request.paths.forEach((path, index) => {
        if (!isNonEmptyString(path)) {
          errors.push(`paths[${index}] must be a non-empty string`);
        }
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates a Marin keyword request object
 *
 * @param request - The keyword request to validate
 * @returns ValidationResult with isValid flag and array of error messages
 */
export function validateKeywordRequest(
  request: MarinKeywordRequest
): ValidationResult {
  const errors: string[] = [];

  // Validate accountId
  if (!isNonEmptyString(request.accountId)) {
    errors.push('accountId is required and must be a non-empty string');
  }

  // Validate adGroupId
  if (!isNonEmptyString(request.adGroupId)) {
    errors.push('adGroupId is required and must be a non-empty string');
  }

  // Validate text
  if (!isNonEmptyString(request.text)) {
    errors.push('text is required and must be a non-empty string');
  } else if (request.text.length > 80) {
    errors.push('text must not exceed 80 characters');
  }

  // Validate matchType
  if (!isValidKeywordMatchType(request.matchType)) {
    errors.push('matchType must be one of: BROAD, PHRASE, EXACT');
  }

  // Validate cpcBid (optional)
  if (request.cpcBid !== undefined && !isPositiveNumber(request.cpcBid)) {
    errors.push('cpcBid must be a positive number if provided');
  }

  // Validate status (optional)
  if (request.status !== undefined && !isValidResourceStatus(request.status)) {
    errors.push('status must be one of: ENABLED, PAUSED, REMOVED');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates a batch operation object
 *
 * @param operation - The batch operation to validate
 * @returns ValidationResult with isValid flag and array of error messages
 */
export function validateBatchOperation(
  operation: BatchOperation
): ValidationResult {
  const errors: string[] = [];

  // Validate operationType
  if (!isValidBatchOperationType(operation.operationType)) {
    errors.push('operationType must be one of: CREATE, UPDATE');
  }

  // Validate resourceType
  if (!isValidBatchResourceType(operation.resourceType)) {
    errors.push('resourceType must be one of: CAMPAIGN, ADGROUP, AD, KEYWORD');
  }

  // Validate resource data based on resourceType
  if (!operation.resource) {
    errors.push('resource is required');
  } else {
    let resourceValidation: ValidationResult;

    switch (operation.resourceType) {
      case 'CAMPAIGN':
        resourceValidation = validateCampaignRequest(operation.resource as MarinCampaignRequest);
        if (!resourceValidation.isValid) {
          errors.push(...resourceValidation.errors.map(err => `resource.${err}`));
        }
        break;

      case 'ADGROUP':
        resourceValidation = validateAdGroupRequest(operation.resource as MarinAdGroupRequest);
        if (!resourceValidation.isValid) {
          errors.push(...resourceValidation.errors.map(err => `resource.${err}`));
        }
        break;

      case 'AD':
        resourceValidation = validateAdRequest(operation.resource as MarinAdRequest);
        if (!resourceValidation.isValid) {
          errors.push(...resourceValidation.errors.map(err => `resource.${err}`));
        }
        break;

      case 'KEYWORD':
        resourceValidation = validateKeywordRequest(operation.resource as MarinKeywordRequest);
        if (!resourceValidation.isValid) {
          errors.push(...resourceValidation.errors.map(err => `resource.${err}`));
        }
        break;

      default:
        errors.push('Invalid resourceType');
    }
  }

  // Validate operationId (optional)
  if (operation.operationId !== undefined && !isNonEmptyString(operation.operationId)) {
    errors.push('operationId must be a non-empty string if provided');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
