import Papa from 'papaparse';
import {
  ProductInput,
  ProductParsingResult,
  ProductValidationError,
} from '../types/product.types';

/**
 * Product Parsing Service
 * Handles parsing of CSV files and URL lists into ProductInput objects
 */

/**
 * CSV Column Mapping
 */
interface CSVColumnMapping {
  name?: string;
  url?: string;
  category?: string;
  price?: string;
  description?: string;
}

/**
 * Validates a URL format
 */
function isValidURL(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Generates a unique ID for a product
 */
function generateProductId(): string {
  return `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validates a ProductInput object
 */
function validateProduct(
  product: Partial<ProductInput>,
  row?: number
): ProductValidationError[] {
  const errors: ProductValidationError[] = [];

  if (!product.name || product.name.trim().length === 0) {
    errors.push({
      field: 'name',
      message: 'Product name is required',
      row,
    });
  }

  if (!product.url || product.url.trim().length === 0) {
    errors.push({
      field: 'url',
      message: 'Product URL is required',
      row,
    });
  } else if (!isValidURL(product.url)) {
    errors.push({
      field: 'url',
      message: 'Invalid URL format',
      row,
    });
  }

  if (product.price !== undefined && product.price < 0) {
    errors.push({
      field: 'price',
      message: 'Price must be a positive number',
      row,
    });
  }

  return errors;
}

/**
 * Normalizes column names to handle variations
 */
function normalizeColumnName(columnName: string): string {
  const normalized = columnName.toLowerCase().trim();
  const mappings: { [key: string]: string } = {
    'product name': 'name',
    'product_name': 'name',
    'name': 'name',
    'title': 'name',
    'product title': 'name',
    'url': 'url',
    'link': 'url',
    'product url': 'url',
    'product_url': 'url',
    'website': 'url',
    'category': 'category',
    'product category': 'category',
    'product_category': 'category',
    'type': 'category',
    'price': 'price',
    'product price': 'price',
    'product_price': 'price',
    'cost': 'price',
    'description': 'description',
    'product description': 'description',
    'product_description': 'description',
    'desc': 'description',
  };

  return mappings[normalized] || normalized;
}

/**
 * Maps CSV row to ProductInput
 */
function mapCSVRowToProduct(
  row: any,
  columnMapping: CSVColumnMapping,
  rowIndex: number
): Partial<ProductInput> {
  const product: Partial<ProductInput> = {
    id: generateProductId(),
    source: 'csv',
  };

  if (columnMapping.name && row[columnMapping.name]) {
    product.name = String(row[columnMapping.name]).trim();
  }

  if (columnMapping.url && row[columnMapping.url]) {
    product.url = String(row[columnMapping.url]).trim();
  }

  if (columnMapping.category && row[columnMapping.category]) {
    product.category = String(row[columnMapping.category]).trim();
  }

  if (columnMapping.price && row[columnMapping.price]) {
    const priceStr = String(row[columnMapping.price]).replace(/[^0-9.-]/g, '');
    const price = parseFloat(priceStr);
    if (!isNaN(price)) {
      product.price = price;
    }
  }

  if (columnMapping.description && row[columnMapping.description]) {
    product.description = String(row[columnMapping.description]).trim();
  }

  return product;
}

/**
 * Parses CSV file content into ProductInput array
 */
export async function parseCSV(
  csvContent: string
): Promise<ProductParsingResult> {
  return new Promise((resolve) => {
    const result: ProductParsingResult = {
      products: [],
      errors: [],
      warnings: [],
    };

    Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: normalizeColumnName,
      complete: (parsedResults) => {
        if (parsedResults.errors.length > 0) {
          parsedResults.errors.forEach((error) => {
            result.errors.push({
              field: 'csv',
              message: error.message || 'CSV parsing error',
              row: error.row,
            });
          });
        }

        // Check for required columns
        const headers = parsedResults.meta.fields || [];
        const hasName = headers.some((h) => normalizeColumnName(h) === 'name');
        const hasURL = headers.some((h) => normalizeColumnName(h) === 'url');

        if (!hasName || !hasURL) {
          result.errors.push({
            field: 'csv',
            message: 'CSV must contain "Product Name" (or "Name") and "URL" columns',
          });
          resolve(result);
          return;
        }

        // Build column mapping
        const columnMapping: CSVColumnMapping = {};
        headers.forEach((header) => {
          const normalized = normalizeColumnName(header);
          if (['name', 'url', 'category', 'price', 'description'].includes(normalized)) {
            columnMapping[normalized as keyof CSVColumnMapping] = header;
          }
        });

        // Process each row
        parsedResults.data.forEach((row: any, index: number) => {
          const product = mapCSVRowToProduct(row, columnMapping, index + 2); // +2 because of header and 0-indexing
          const validationErrors = validateProduct(product, index + 2);

          if (validationErrors.length === 0 && product.name && product.url) {
            result.products.push(product as ProductInput);
          } else {
            result.errors.push(...validationErrors);
          }
        });

        // Limit to 10 products for MVP
        if (result.products.length > 10) {
          result.warnings.push(
            `Only the first 10 products will be processed. ${result.products.length} products found.`
          );
          result.products = result.products.slice(0, 10);
        }

        resolve(result);
      },
      error: (error: Error) => {
        result.errors.push({
          field: 'csv',
          message: error.message || 'Failed to parse CSV file',
        });
        resolve(result);
      },
    });
  });
}

/**
 * Extracts product name from URL
 */
function extractProductNameFromURL(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const segments = pathname.split('/').filter((s) => s.length > 0);
    
    if (segments.length > 0) {
      // Use the last segment, remove hyphens and capitalize
      const lastSegment = segments[segments.length - 1];
      return lastSegment
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    
    return urlObj.hostname.replace('www.', '');
  } catch {
    return url;
  }
}

/**
 * Parses URL list into ProductInput array
 */
export function parseURLList(urls: string[]): ProductParsingResult {
  const result: ProductParsingResult = {
    products: [],
    errors: [],
    warnings: [],
  };

  urls.forEach((url, index) => {
    const trimmedUrl = url.trim();
    
    if (!trimmedUrl) {
      return; // Skip empty lines
    }

    if (!isValidURL(trimmedUrl)) {
      result.errors.push({
        field: 'url',
        message: `Invalid URL format: ${trimmedUrl}`,
        row: index + 1,
      });
      return;
    }

    const product: ProductInput = {
      id: generateProductId(),
      name: extractProductNameFromURL(trimmedUrl),
      url: trimmedUrl,
      source: 'url_list',
    };

    result.products.push(product);
  });

  // Limit to 10 products for MVP
  if (result.products.length > 10) {
    result.warnings.push(
      `Only the first 10 products will be processed. ${result.products.length} products found.`
    );
    result.products = result.products.slice(0, 10);
  }

  return result;
}

