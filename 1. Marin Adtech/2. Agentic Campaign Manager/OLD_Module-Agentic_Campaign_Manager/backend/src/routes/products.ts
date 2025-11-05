import { Router, Request, Response } from 'express';
import multer from 'multer';
import { parseCSV, parseURLList } from '../services/productParsingService';
import { URLListParseRequest } from '../types/product.types';

/**
 * Products Routes
 * Handles product parsing endpoints for CSV and URL list uploads
 */
const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
});

/**
 * POST /api/products/parse-csv
 * Parse CSV file and return products
 */
router.post('/parse-csv', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please upload a CSV file',
      });
    }

    const csvContent = req.file.buffer.toString('utf-8');
    const result = await parseCSV(csvContent);

    if (result.errors.length > 0 && result.products.length === 0) {
      return res.status(400).json({
        error: 'CSV parsing failed',
        errors: result.errors,
        warnings: result.warnings,
      });
    }

    res.json({
      success: true,
      products: result.products,
      errors: result.errors,
      warnings: result.warnings,
      count: result.products.length,
    });
  } catch (error: any) {
    console.error('Error parsing CSV:', error);
    res.status(500).json({
      error: 'Failed to parse CSV',
      message: error.message || 'An unexpected error occurred',
    });
  }
});

/**
 * POST /api/products/parse-urls
 * Parse URL list and return products
 */
router.post('/parse-urls', async (req: Request, res: Response) => {
  try {
    const { urls } = req.body as URLListParseRequest;

    if (!urls || !Array.isArray(urls)) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Request body must contain an array of URLs',
      });
    }

    if (urls.length === 0) {
      return res.status(400).json({
        error: 'Empty URL list',
        message: 'Please provide at least one URL',
      });
    }

    const result = parseURLList(urls);

    if (result.errors.length > 0 && result.products.length === 0) {
      return res.status(400).json({
        error: 'URL parsing failed',
        errors: result.errors,
        warnings: result.warnings,
      });
    }

    res.json({
      success: true,
      products: result.products,
      errors: result.errors,
      warnings: result.warnings,
      count: result.products.length,
    });
  } catch (error: any) {
    console.error('Error parsing URLs:', error);
    res.status(500).json({
      error: 'Failed to parse URLs',
      message: error.message || 'An unexpected error occurred',
    });
  }
});

export default router;

