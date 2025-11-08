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
          throw new Error(
            error.response.data?.message ||
              `Server error: ${error.response.status}`
          );
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

