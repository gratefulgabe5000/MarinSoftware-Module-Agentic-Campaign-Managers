/**
 * Product Input Types (Backend)
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
}

/**
 * URL List Parse Request
 */
export interface URLListParseRequest {
  urls: string[];
}

