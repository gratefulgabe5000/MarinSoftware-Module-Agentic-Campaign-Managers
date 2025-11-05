import { Request, Response } from 'express';
import {
  generateKeywordsForProduct,
  validateKeywords,
} from '../services/keywordGenerationService';
import {
  KeywordGenerationRequest,
} from '../types/keyword-generation.types';

/**
 * Keyword Generation Controller
 * Handles keyword generation endpoints
 */
export class KeywordGenerationController {
  /**
   * Generate keywords
   * POST /api/keywords/generate
   */
  generateKeywords = async (req: Request, res: Response): Promise<void> => {
    try {
      const request = req.body as KeywordGenerationRequest;

      if (!request.product) {
        res.status(400).json({
          error: 'Invalid request',
          message: 'Product is required',
        });
        return;
      }

      if (!request.product.name || !request.product.url) {
        res.status(400).json({
          error: 'Invalid request',
          message: 'Product name and URL are required',
        });
        return;
      }

      // Generate keywords
      const keywords = await generateKeywordsForProduct(request);

      res.json({
        success: true,
        keywords,
        count: keywords.length,
      });
    } catch (error: any) {
      console.error('Error generating keywords:', error);
      res.status(500).json({
        error: 'Failed to generate keywords',
        message: error.message || 'An unexpected error occurred',
      });
    }
  };

  /**
   * Validate keywords
   * POST /api/keywords/validate
   */
  validateKeywords = async (req: Request, res: Response): Promise<void> => {
    try {
      const { keywords } = req.body as { keywords: string[] };

      if (!keywords || !Array.isArray(keywords)) {
        res.status(400).json({
          error: 'Invalid request',
          message: 'Keywords array is required',
        });
        return;
      }

      // Validate keywords
      const validationResults = validateKeywords(keywords);

      res.json({
        success: true,
        results: validationResults,
        validCount: validationResults.filter((r) => r.valid).length,
        invalidCount: validationResults.filter((r) => !r.valid).length,
      });
    } catch (error: any) {
      console.error('Error validating keywords:', error);
      res.status(500).json({
        error: 'Failed to validate keyword(s)',
        message: error.message || 'An unexpected error occurred',
      });
    }
  };
}
