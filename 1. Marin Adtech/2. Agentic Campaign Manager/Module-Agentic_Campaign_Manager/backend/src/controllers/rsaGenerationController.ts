import { Request, Response } from 'express';
import {
  generateRSA,
  validateAdCopy,
} from '../services/rsaGenerationService';
import {
  RSAGenerationRequest,
  AdCopyValidationRequest,
} from '../types/rsa-generation.types';

/**
 * RSA Generation Controller
 * Handles RSA generation endpoints
 */
export class RSAGenerationController {
  /**
   * Generate RSA
   * POST /api/ads/generate-rsa
   */
  generateRSA = async (req: Request, res: Response): Promise<void> => {
    try {
      const request = req.body as RSAGenerationRequest;

      if (!request.adGroupId) {
        res.status(400).json({
          error: 'Invalid request',
          message: 'adGroupId is required',
        });
        return;
      }

      if (!request.product) {
        res.status(400).json({
          error: 'Invalid request',
          message: 'product is required',
        });
        return;
      }

      if (!request.product.name || !request.product.url) {
        res.status(400).json({
          error: 'Invalid request',
          message: 'product name and URL are required',
        });
        return;
      }

      // Generate RSA
      const rsa = await generateRSA(request);

      res.json({
        success: true,
        rsa,
      });
    } catch (error: any) {
      console.error('Error generating RSA:', error);
      res.status(500).json({
        error: 'Failed to generate RSA',
        message: error.message || 'An unexpected error occurred',
      });
    }
  };

  /**
   * Validate ad copy
   * POST /api/ads/validate
   */
  validateAdCopy = async (req: Request, res: Response): Promise<void> => {
    try {
      const request = req.body as AdCopyValidationRequest;

      if (!request.headlines || !Array.isArray(request.headlines)) {
        res.status(400).json({
          error: 'Invalid request',
          message: 'headlines array is required',
        });
        return;
      }

      if (!request.descriptions || !Array.isArray(request.descriptions)) {
        res.status(400).json({
          error: 'Invalid request',
          message: 'descriptions array is required',
        });
        return;
      }

      // Validate ad copy
      const validationResult = validateAdCopy(request);

      res.json({
        success: true,
        ...validationResult,
      });
    } catch (error: any) {
      console.error('Error validating ad copy:', error);
      res.status(500).json({
        error: 'Failed to validate ad copy',
        message: error.message || 'An unexpected error occurred',
      });
    }
  };
}

