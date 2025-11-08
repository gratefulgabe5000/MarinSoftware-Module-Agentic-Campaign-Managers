import { ProductInput } from '../types/product.types';
import { AdGroupNamingPattern } from '../types/adgroup-generation.types';

/**
 * Ad Group Naming Service
 * Generates ad group names based on product data and naming conventions
 */

/**
 * Validates ad group name against Google Ads requirements
 */
function validateAdGroupName(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Ad group name cannot be empty' };
  }

  if (name.length > 255) {
    return { valid: false, error: 'Ad group name cannot exceed 255 characters' };
  }

  // Check for invalid characters (Google Ads may restrict certain special characters)
  const invalidChars = /[<>"{}|\\^`\[\]]/;
  if (invalidChars.test(name)) {
    return { valid: false, error: 'Ad group name contains invalid characters' };
  }

  return { valid: true };
}

/**
 * Sanitizes ad group name
 */
function sanitizeAdGroupName(name: string): string {
  // Remove invalid characters
  let sanitized = name.replace(/[<>"{}|\\^`\[\]]/g, '');
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  // Truncate if too long
  if (sanitized.length > 255) {
    sanitized = sanitized.substring(0, 252) + '...';
  }

  return sanitized;
}

/**
 * Generates ad group name based on product and naming pattern
 */
export function generateAdGroupName(
  product: ProductInput,
  namingPattern?: AdGroupNamingPattern | string
): string {
  let name = '';

  // Extract components from product
  const productName = product.name || '';
  const category = product.category || '';
  const url = product.url || '';

  // Try to extract brand/model from product name or URL
  let brand = '';
  let model = '';
  
  // Simple parsing: try to split product name
  const nameParts = productName.split(/[\s-]+/);
  if (nameParts.length >= 2) {
    brand = nameParts[0];
    model = nameParts.slice(1).join(' ');
  } else {
    brand = productName;
  }

  // Extract brand from URL if available
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace('www.', '');
    const domainParts = hostname.split('.');
    if (domainParts.length > 0 && !brand) {
      brand = domainParts[0].charAt(0).toUpperCase() + domainParts[0].slice(1);
    }
  } catch {
    // Invalid URL, ignore
  }

  // Apply naming pattern
  if (!namingPattern || namingPattern === 'Product Name') {
    name = productName;
  } else if (namingPattern === 'Brand + Model') {
    name = `${brand} ${model}`.trim() || productName;
  } else if (namingPattern === 'Product + Category') {
    name = category ? `${productName} - ${category}` : productName;
  } else if (namingPattern === 'Brand + Type') {
    name = category ? `${brand} ${category}`.trim() : productName;
  } else {
    // Custom pattern - simple substitution
    name = namingPattern
      .replace('{productName}', productName)
      .replace('{brand}', brand)
      .replace('{category}', category)
      .replace('{model}', model);
    
    // Fallback if pattern doesn't match
    if (name === namingPattern) {
      name = productName;
    }
  }

  // Sanitize and validate
  name = sanitizeAdGroupName(name);

  // Ensure name is not empty
  if (!name || name.trim().length === 0) {
    name = `Product ${product.id.substring(0, 8)}`;
  }

  return name;
}

/**
 * Validates generated ad group name
 */
export function validateGeneratedAdGroupName(name: string): { valid: boolean; error?: string; sanitized?: string } {
  const validation = validateAdGroupName(name);
  
  if (!validation.valid) {
    const sanitized = sanitizeAdGroupName(name);
    return {
      valid: false,
      error: validation.error,
      sanitized,
    };
  }

  return { valid: true };
}

