import request from 'supertest';
import express, { Application } from 'express';
import productsRoutes from '../../routes/products';
import { parseCSV, parseURLList } from '../../services/productParsingService';

// Mock the parsing services
jest.mock('../../services/productParsingService');

describe('Products Routes', () => {
  let app: Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use('/api/products', productsRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/products/parse-csv', () => {
    it('should parse CSV file successfully', async () => {
      const mockResult = {
        products: [
          {
            id: 'prod_1',
            name: 'Test Product',
            url: 'https://example.com/product',
            source: 'csv' as const,
          },
        ],
        errors: [],
        warnings: [],
      };

      (parseCSV as jest.Mock).mockResolvedValue(mockResult);

      // Create a CSV file content
      const csvContent = 'Product Name,URL\nTest Product,https://example.com/product';
      const csvBuffer = Buffer.from(csvContent, 'utf-8');

      const response = await request(app)
        .post('/api/products/parse-csv')
        .attach('file', csvBuffer, 'test.csv')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.products).toHaveLength(1);
      expect(response.body.products[0].name).toBe('Test Product');
      expect(parseCSV).toHaveBeenCalled();
    });

    it('should return 400 if no file uploaded', async () => {
      const response = await request(app)
        .post('/api/products/parse-csv')
        .expect(400);

      expect(response.body.error).toBe('No file uploaded');
    });

    it('should handle parsing errors', async () => {
      const mockResult = {
        products: [],
        errors: [{ field: 'csv', message: 'Invalid CSV format', row: 1 }],
        warnings: [],
      };

      (parseCSV as jest.Mock).mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/products/parse-csv')
        .attach('file', Buffer.from('Invalid CSV'), 'test.csv')
        .expect(400);

      expect(response.body.error).toBe('CSV parsing failed');
      expect(response.body.errors).toHaveLength(1);
    });

    it('should handle service errors', async () => {
      (parseCSV as jest.Mock).mockRejectedValue(new Error('Service error'));

      const response = await request(app)
        .post('/api/products/parse-csv')
        .attach('file', Buffer.from('Product Name,URL\nTest,https://example.com'), 'test.csv')
        .expect(500);

      expect(response.body.error).toBe('Failed to parse CSV');
    });
  });

  describe('POST /api/products/parse-urls', () => {
    it('should parse URL list successfully', async () => {
      const mockResult = {
        products: [
          {
            id: 'prod_1',
            name: 'Product 1',
            url: 'https://example.com/product1',
            source: 'url_list' as const,
          },
          {
            id: 'prod_2',
            name: 'Product 2',
            url: 'https://example.com/product2',
            source: 'url_list' as const,
          },
        ],
        errors: [],
        warnings: [],
      };

      (parseURLList as jest.Mock).mockReturnValue(mockResult);

      const response = await request(app)
        .post('/api/products/parse-urls')
        .send({
          urls: [
            'https://example.com/product1',
            'https://example.com/product2',
          ],
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.products).toHaveLength(2);
      expect(parseURLList).toHaveBeenCalled();
    });

    it('should return 400 if urls is not an array', async () => {
      const response = await request(app)
        .post('/api/products/parse-urls')
        .send({ urls: 'not-an-array' })
        .expect(400);

      expect(response.body.error).toBe('Invalid request');
    });

    it('should return 400 if urls array is empty', async () => {
      const response = await request(app)
        .post('/api/products/parse-urls')
        .send({ urls: [] })
        .expect(400);

      expect(response.body.error).toBe('Empty URL list');
    });

    it('should return 400 if urls is missing', async () => {
      const response = await request(app)
        .post('/api/products/parse-urls')
        .send({})
        .expect(400);

      expect(response.body.error).toBe('Invalid request');
    });

    it('should handle parsing errors', async () => {
      const mockResult = {
        products: [],
        errors: [{ field: 'url', message: 'Invalid URL format', row: 1 }],
        warnings: [],
      };

      (parseURLList as jest.Mock).mockReturnValue(mockResult);

      const response = await request(app)
        .post('/api/products/parse-urls')
        .send({ urls: ['invalid-url'] })
        .expect(400);

      expect(response.body.error).toBe('URL parsing failed');
      expect(response.body.errors).toHaveLength(1);
    });

    it('should handle service errors', async () => {
      (parseURLList as jest.Mock).mockImplementation(() => {
        throw new Error('Service error');
      });

      const response = await request(app)
        .post('/api/products/parse-urls')
        .send({ urls: ['https://example.com'] })
        .expect(500);

      expect(response.body.error).toBe('Failed to parse URLs');
    });
  });
});

