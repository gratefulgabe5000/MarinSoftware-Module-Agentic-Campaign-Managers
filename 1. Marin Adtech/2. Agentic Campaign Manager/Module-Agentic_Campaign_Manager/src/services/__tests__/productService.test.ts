import axios from 'axios';
import { productService } from '../productService';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ProductService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('parseCSV', () => {
    it('should parse CSV file successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          products: [
            {
              id: 'prod_1',
              name: 'Test Product',
              url: 'https://example.com/product',
              source: 'csv',
            },
          ],
          errors: [],
          warnings: [],
          count: 1,
        },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const file = new File(['Product Name,URL\nTest Product,https://example.com/product'], 'test.csv', {
        type: 'text/csv',
      });

      const result = await productService.parseCSV(file);

      expect(result.products).toHaveLength(1);
      expect(result.products[0].name).toBe('Test Product');
      expect(result.errors).toHaveLength(0);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/products/parse-csv'),
        expect.any(FormData),
        expect.objectContaining({
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
      );
    });

    it('should handle server errors', async () => {
      const mockError = {
        response: {
          status: 400,
          data: {
            message: 'Invalid CSV format',
          },
        },
      };

      mockedAxios.isAxiosError = jest.fn().mockReturnValue(true) as any;
      mockedAxios.post.mockRejectedValue(mockError);

      const file = new File(['Invalid CSV'], 'test.csv', { type: 'text/csv' });

      await expect(productService.parseCSV(file)).rejects.toThrow('Invalid CSV format');
    });

    it('should handle network errors', async () => {
      const mockError = {
        request: {},
      };

      mockedAxios.isAxiosError = jest.fn().mockReturnValue(true) as any;
      mockedAxios.post.mockRejectedValue(mockError);

      const file = new File(['Product Name,URL\nTest,https://example.com'], 'test.csv', {
        type: 'text/csv',
      });

      await expect(productService.parseCSV(file)).rejects.toThrow('Network error');
    });

    it('should handle parsing errors from server', async () => {
      const mockResponse = {
        data: {
          success: false,
          products: [],
          errors: [{ field: 'csv', message: 'Invalid CSV format' }],
          warnings: [],
          count: 0,
        },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const file = new File(['Invalid CSV'], 'test.csv', { type: 'text/csv' });

      const result = await productService.parseCSV(file);

      expect(result.products).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
    });
  });

  describe('parseURLs', () => {
    it('should parse URL list successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          products: [
            {
              id: 'prod_1',
              name: 'Product 1',
              url: 'https://example.com/product1',
              source: 'url_list',
            },
            {
              id: 'prod_2',
              name: 'Product 2',
              url: 'https://example.com/product2',
              source: 'url_list',
            },
          ],
          errors: [],
          warnings: [],
          count: 2,
        },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const urls = ['https://example.com/product1', 'https://example.com/product2'];
      const result = await productService.parseURLs(urls);

      expect(result.products).toHaveLength(2);
      expect(result.products[0].url).toBe('https://example.com/product1');
      expect(result.errors).toHaveLength(0);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/products/parse-urls'),
        { urls },
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );
    });

    it('should handle server errors', async () => {
      const mockError = {
        response: {
          status: 400,
          data: {
            message: 'Invalid URL format',
          },
        },
      };

      mockedAxios.isAxiosError = jest.fn().mockReturnValue(true) as any;
      mockedAxios.post.mockRejectedValue(mockError);

      const urls = ['invalid-url'];

      await expect(productService.parseURLs(urls)).rejects.toThrow('Invalid URL format');
    });

    it('should handle network errors', async () => {
      const mockError = {
        request: {},
      };

      mockedAxios.isAxiosError = jest.fn().mockReturnValue(true) as any;
      mockedAxios.post.mockRejectedValue(mockError);

      const urls = ['https://example.com'];

      await expect(productService.parseURLs(urls)).rejects.toThrow('Network error');
    });

    it('should handle parsing errors from server', async () => {
      const mockResponse = {
        data: {
          success: false,
          products: [],
          errors: [{ field: 'url', message: 'Invalid URL format', row: 1 }],
          warnings: [],
          count: 0,
        },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const urls = ['invalid-url'];
      const result = await productService.parseURLs(urls);

      expect(result.products).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
    });
  });
});

