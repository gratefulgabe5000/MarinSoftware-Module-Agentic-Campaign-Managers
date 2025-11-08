import axios from 'axios';
import {
  ProductInput,
  ProductParsingResult,
  URLListParseRequest,
} from '../types/product.types';
import { getApiBaseUrl } from '../config/environment';

const API_BASE_URL = getApiBaseUrl();

/**
 * Product Service
 * Handles product parsing API calls
 */
class ProductService {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Parse CSV file
   */
  async parseCSV(file: File): Promise<ProductParsingResult> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post<{
        success: boolean;
        products: ProductInput[];
        errors: any[];
        warnings: string[];
        count: number;
      }>(`${this.baseURL}/products/parse-csv`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000,
      });

      return {
        products: response.data.products,
        errors: response.data.errors,
        warnings: response.data.warnings,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          const responseData = error.response.data;
          
          // If backend returns errors array, extract messages from it
          if (responseData?.errors && Array.isArray(responseData.errors) && responseData.errors.length > 0) {
            // Filter out verbose PapaParse auto-detect messages
            const filteredErrors = responseData.errors.filter((err: any) => {
              const message = err.message || err;
              // Filter out PapaParse auto-detect messages
              return !message.includes('Unable to auto-detect delimiting character') &&
                     !message.includes('defaulted to');
            });
            
            // If empty CSV error exists, show only that
            const emptyCsvError = filteredErrors.find((err: any) => 
              (err.message || err).includes('CSV file is empty')
            );
            if (emptyCsvError) {
              throw new Error('CSV file is empty. Please upload a CSV file with at least one product row.');
            }
            
            // For parsing errors, prefix with "Something is wrong with your CSV file:"
            const parsingErrors = filteredErrors.filter((err: any) => {
              const message = err.message || err;
              return message.includes('Quoted field') || 
                     message.includes('unterminated') ||
                     message.includes('parsing error') ||
                     (err.row && err.row > 0);
            });
            
            if (parsingErrors.length > 0) {
              const errorMessages = parsingErrors
                .map((err: any) => {
                  const message = err.message || err;
                  return err.row ? `Row ${err.row}: ${message}` : message;
                })
                .join('; ');
              throw new Error(`Something is wrong with your CSV file: ${errorMessages}`);
            }
            
            // For other errors, join them
            const errorMessages = filteredErrors
              .map((err: any) => err.message || err)
              .filter((msg: string) => msg)
              .join('; ');
            throw new Error(errorMessages);
          }
          
          // Otherwise, try to get message from response
          if (responseData?.message) {
            throw new Error(responseData.message);
          }
          
          if (responseData?.error) {
            throw new Error(responseData.error);
          }
          
          throw new Error(`Server error: ${error.response.status}`);
        } else if (error.request) {
          throw new Error('Network error: Could not connect to server');
        }
      }
      throw new Error('Failed to parse CSV file');
    }
  }

  /**
   * Parse URL list
   */
  async parseURLs(urls: string[]): Promise<ProductParsingResult> {
    try {
      const request: URLListParseRequest = { urls };

      const response = await axios.post<{
        success: boolean;
        products: ProductInput[];
        errors: any[];
        warnings: string[];
        count: number;
      }>(`${this.baseURL}/products/parse-urls`, request, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      });

      return {
        products: response.data.products,
        errors: response.data.errors,
        warnings: response.data.warnings,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(
            error.response.data?.message ||
              `Server error: ${error.response.status}`
          );
        } else if (error.request) {
          throw new Error('Network error: Could not connect to server');
        }
      }
      throw new Error('Failed to parse URLs');
    }
  }
}

// Export singleton instance
export const productService = new ProductService();

// Export class for testing
export default ProductService;

