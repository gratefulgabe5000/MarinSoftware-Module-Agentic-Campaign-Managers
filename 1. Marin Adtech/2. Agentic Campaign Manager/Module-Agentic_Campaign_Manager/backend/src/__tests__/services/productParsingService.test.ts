import { parseCSV, parseURLList } from '../../services/productParsingService';
import { ProductInput } from '../../types/product.types';

describe('ProductParsingService', () => {
  describe('parseCSV', () => {
    it('should parse valid CSV with required columns', async () => {
      const csvContent = `Product Name,URL
Test Product 1,https://example.com/product1
Test Product 2,https://example.com/product2`;

      const result = await parseCSV(csvContent);

      expect(result.products).toHaveLength(2);
      expect(result.products[0].name).toBe('Test Product 1');
      expect(result.products[0].url).toBe('https://example.com/product1');
      expect(result.products[0].source).toBe('csv');
      expect(result.errors).toHaveLength(0);
    });

    it('should parse CSV with optional columns', async () => {
      const csvContent = `Product Name,URL,Category,Price,Description
Test Product 1,https://example.com/product1,Electronics,99.99,Great product
Test Product 2,https://example.com/product2,Books,19.99,Amazing book`;

      const result = await parseCSV(csvContent);

      expect(result.products).toHaveLength(2);
      expect(result.products[0].category).toBe('Electronics');
      expect(result.products[0].price).toBe(99.99);
      expect(result.products[0].description).toBe('Great product');
      expect(result.products[1].category).toBe('Books');
      expect(result.products[1].price).toBe(19.99);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle CSV with missing required columns', async () => {
      const csvContent = `Category,Price
Electronics,99.99`;

      const result = await parseCSV(csvContent);

      expect(result.products).toHaveLength(0);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some((e) => e.message.includes('Product Name') || e.message.includes('URL'))).toBe(true);
    });

    it('should handle CSV with missing URL column', async () => {
      const csvContent = `Product Name,Category
Test Product,Electronics`;

      const result = await parseCSV(csvContent);

      expect(result.products).toHaveLength(0);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle CSV with missing Product Name column', async () => {
      const csvContent = `URL,Category
https://example.com/product1,Electronics`;

      const result = await parseCSV(csvContent);

      expect(result.products).toHaveLength(0);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should validate URL format', async () => {
      const csvContent = `Product Name,URL
Test Product,invalid-url`;

      const result = await parseCSV(csvContent);

      expect(result.products).toHaveLength(0);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some((e) => e.field === 'url')).toBe(true);
    });

    it('should handle empty product name', async () => {
      const csvContent = `Product Name,URL
,https://example.com/product1`;

      const result = await parseCSV(csvContent);

      expect(result.products).toHaveLength(0);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some((e) => e.field === 'name')).toBe(true);
    });

    it('should handle invalid price format', async () => {
      const csvContent = `Product Name,URL,Price
Test Product,https://example.com/product1,invalid-price`;

      const result = await parseCSV(csvContent);

      // Should still parse the product but without price
      expect(result.products.length).toBeGreaterThan(0);
      expect(result.products[0].price).toBeUndefined();
    });

    it('should handle negative price', async () => {
      const csvContent = `Product Name,URL,Price
Test Product,https://example.com/product1,-10.00`;

      const result = await parseCSV(csvContent);

      // Note: The product will be created but validation should catch negative price
      // However, the current implementation validates before adding, so products with errors won't be added
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some((e) => e.field === 'price')).toBe(true);
      // If validation catches it, product won't be added; otherwise it will have an error
      if (result.products.length > 0) {
        // Product was added but should have validation error
        expect(result.errors.some((e) => e.field === 'price')).toBe(true);
      } else {
        // Product was not added due to validation error
        expect(result.products).toHaveLength(0);
      }
    });

    it('should limit to 10 products for MVP', async () => {
      const csvContent = `Product Name,URL
${Array.from({ length: 15 }, (_, i) => `Product ${i + 1},https://example.com/product${i + 1}`).join('\n')}`;

      const result = await parseCSV(csvContent);

      expect(result.products).toHaveLength(10);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.includes('10 products'))).toBe(true);
    });

    it('should handle CSV with different column name variations', async () => {
      const csvContent = `product_name,product_url,product_category
Test Product,https://example.com/product1,Electronics`;

      const result = await parseCSV(csvContent);

      expect(result.products).toHaveLength(1);
      expect(result.products[0].name).toBe('Test Product');
      expect(result.products[0].url).toBe('https://example.com/product1');
      expect(result.products[0].category).toBe('Electronics');
    });

    it('should handle CSV with special characters in price', async () => {
      const csvContent = `Product Name,URL,Price
Test Product,https://example.com/product1,$99.99`;

      const result = await parseCSV(csvContent);

      expect(result.products).toHaveLength(1);
      expect(result.products[0].price).toBe(99.99);
    });

    it('should handle empty CSV', async () => {
      const csvContent = '';

      const result = await parseCSV(csvContent);

      expect(result.products).toHaveLength(0);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle CSV with only headers', async () => {
      const csvContent = `Product Name,URL`;

      const result = await parseCSV(csvContent);

      expect(result.products).toHaveLength(0);
    });
  });

  describe('parseURLList', () => {
    it('should parse valid URL list', () => {
      const urls = [
        'https://example.com/product1',
        'https://example.com/product2',
        'https://example.com/product3',
      ];

      const result = parseURLList(urls);

      expect(result.products).toHaveLength(3);
      expect(result.products[0].url).toBe('https://example.com/product1');
      expect(result.products[0].source).toBe('url_list');
      expect(result.products[0].name).toBeDefined();
      expect(result.errors).toHaveLength(0);
    });

    it('should extract product name from URL', () => {
      const urls = ['https://example.com/awesome-product'];

      const result = parseURLList(urls);

      expect(result.products).toHaveLength(1);
      expect(result.products[0].name).toContain('Awesome Product');
    });

    it('should handle invalid URL format', () => {
      const urls = ['invalid-url', 'https://example.com/valid'];

      const result = parseURLList(urls);

      expect(result.products).toHaveLength(1);
      expect(result.products[0].url).toBe('https://example.com/valid');
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some((e) => e.message.includes('Invalid URL'))).toBe(true);
    });

    it('should handle empty URL list', () => {
      const urls: string[] = [];

      const result = parseURLList(urls);

      expect(result.products).toHaveLength(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle URLs with whitespace', () => {
      const urls = [
        '  https://example.com/product1  ',
        'https://example.com/product2',
      ];

      const result = parseURLList(urls);

      expect(result.products).toHaveLength(2);
      expect(result.products[0].url).toBe('https://example.com/product1');
    });

    it('should handle empty strings in URL list', () => {
      const urls = [
        'https://example.com/product1',
        '',
        'https://example.com/product2',
        '   ',
      ];

      const result = parseURLList(urls);

      expect(result.products).toHaveLength(2);
      expect(result.products[0].url).toBe('https://example.com/product1');
      expect(result.products[1].url).toBe('https://example.com/product2');
    });

    it('should limit to 10 products for MVP', () => {
      const urls = Array.from(
        { length: 15 },
        (_, i) => `https://example.com/product${i + 1}`
      );

      const result = parseURLList(urls);

      expect(result.products).toHaveLength(10);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('10 products');
    });

    it('should handle HTTP URLs', () => {
      const urls = ['http://example.com/product1'];

      const result = parseURLList(urls);

      expect(result.products).toHaveLength(1);
      expect(result.products[0].url).toBe('http://example.com/product1');
    });

    it('should handle URLs with query parameters', () => {
      const urls = ['https://example.com/product1?id=123&ref=test'];

      const result = parseURLList(urls);

      expect(result.products).toHaveLength(1);
      expect(result.products[0].url).toBe('https://example.com/product1?id=123&ref=test');
    });

    it('should handle URLs with paths', () => {
      const urls = ['https://example.com/category/subcategory/product-name'];

      const result = parseURLList(urls);

      expect(result.products).toHaveLength(1);
      expect(result.products[0].url).toBe('https://example.com/category/subcategory/product-name');
      expect(result.products[0].name).toContain('Product Name');
    });
  });
});

