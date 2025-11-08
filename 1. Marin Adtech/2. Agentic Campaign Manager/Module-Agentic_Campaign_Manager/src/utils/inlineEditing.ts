/**
 * Inline Editing Utilities
 * Provides utilities for handling inline editing in campaign preview
 */

import { PreviewEditOperation } from '../types/campaign-preview.types';
import {
  validateAdGroupName,
  validateKeyword,
  validateHeadline,
  validateDescription,
  validateUrl,
} from '../services/validationService';

/**
 * Edit handler result
 */
export interface EditHandlerResult {
  success: boolean;
  error?: string;
  warning?: string;
}

/**
 * Handle ad group name edit
 */
export const handleAdGroupNameEdit = (
  adGroupId: string,
  newName: string,
  onUpdate: (adGroupId: string, updates: { name: string }) => void
): EditHandlerResult => {
  const validation = validateAdGroupName(newName);
  if (!validation.valid) {
    return {
      success: false,
      error: validation.error,
    };
  }

  try {
    onUpdate(adGroupId, { name: newName });
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update ad group name',
    };
  }
};

/**
 * Handle keyword edit
 */
export const handleKeywordEdit = (
  keywordId: string,
  updates: { text?: string; matchType?: 'broad' | 'phrase' | 'exact' },
  onUpdate: (keywordId: string, updates: Partial<any>) => void
): EditHandlerResult => {
  if (updates.text !== undefined) {
    const validation = validateKeyword(updates.text);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
      };
    }
  }

  try {
    onUpdate(keywordId, updates);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update keyword',
    };
  }
};

/**
 * Handle headline edit
 */
export const handleHeadlineEdit = (
  adId: string,
  headlineIndex: number,
  newText: string,
  onUpdate: (adId: string, headlineIndex: number, text: string) => void
): EditHandlerResult => {
  const validation = validateHeadline(newText);
  if (!validation.valid) {
    return {
      success: false,
      error: validation.error,
      warning: validation.warning,
    };
  }

  try {
    onUpdate(adId, headlineIndex, newText);
    return {
      success: true,
      warning: validation.warning,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update headline',
    };
  }
};

/**
 * Handle description edit
 */
export const handleDescriptionEdit = (
  adId: string,
  descriptionIndex: number,
  newText: string,
  onUpdate: (adId: string, descriptionIndex: number, text: string) => void
): EditHandlerResult => {
  const validation = validateDescription(newText);
  if (!validation.valid) {
    return {
      success: false,
      error: validation.error,
      warning: validation.warning,
    };
  }

  try {
    onUpdate(adId, descriptionIndex, newText);
    return {
      success: true,
      warning: validation.warning,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update description',
    };
  }
};

/**
 * Handle URL edit
 */
export const handleUrlEdit = (
  adId: string,
  newUrl: string,
  onUpdate: (adId: string, url: string) => void
): EditHandlerResult => {
  const validation = validateUrl(newUrl);
  if (!validation.valid) {
    return {
      success: false,
      error: validation.error,
    };
  }

  try {
    onUpdate(adId, newUrl);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update URL',
    };
  }
};

/**
 * Create edit operation
 */
export const createEditOperation = (
  type: PreviewEditOperation['type'],
  ...args: any[]
): PreviewEditOperation => {
  switch (type) {
    case 'update_keyword':
      return {
        type: 'update_keyword',
        keywordId: args[0],
        updates: args[1],
      };
    case 'update_headline':
      return {
        type: 'update_headline',
        adId: args[0],
        headlineIndex: args[1],
        text: args[2],
      };
    case 'update_description':
      return {
        type: 'update_description',
        adId: args[0],
        descriptionIndex: args[1],
        text: args[2],
      };
    case 'update_url':
      return {
        type: 'update_url',
        adId: args[0],
        url: args[1],
      };
    case 'delete_keyword':
      return {
        type: 'delete_keyword',
        keywordId: args[0],
      };
    case 'delete_ad':
      return {
        type: 'delete_ad',
        adId: args[0],
      };
    default:
      throw new Error(`Unknown edit operation type: ${type}`);
  }
};

/**
 * Save edit operation
 */
export const saveEdit = (
  operation: PreviewEditOperation,
  onSave: (operation: PreviewEditOperation) => void
): EditHandlerResult => {
  try {
    onSave(operation);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save edit',
    };
  }
};

/**
 * Cancel edit operation
 */
export const cancelEdit = (onCancel: () => void): void => {
  onCancel();
};

