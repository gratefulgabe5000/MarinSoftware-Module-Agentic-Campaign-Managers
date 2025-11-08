/**
 * Product Input Types
 * Defines types for CSV/URL-based product input processing
 */

/**
 * Product Input Interface
 * Represents a product parsed from CSV or URL list
 */
export interface ProductInput {
  id: string;
  name: string;
  url: string;
  category?: string;
  price?: number;
  description?: string;
  source: 'csv' | 'url_list';
  sourceFile?: string; // Track which file the product came from for multi-file uploads
}

/**
 * Product Validation Error
 */
export interface ProductValidationError {
  field: string;
  message: string;
  row?: number;
}

/**
 * Product Parsing Result
 */
export interface ProductParsingResult {
  products: ProductInput[];
  errors: ProductValidationError[];
  warnings: string[];
  fileName?: string; // Name of the uploaded file
}

/**
 * CSV Upload Request
 */
export interface CSVUploadRequest {
  file: File;
}

/**
 * URL List Parse Request
 */
export interface URLListParseRequest {
  urls: string[];
}

/**
 * Product Input Validation Schema
 */
export interface ProductInputValidation {
  isValid: boolean;
  errors: ProductValidationError[];
}

