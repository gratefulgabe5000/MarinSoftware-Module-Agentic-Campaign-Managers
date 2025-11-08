import { Request, Response } from 'express';
import {
  generateAdGroups,
  validateAdGroupGenerationRequest,
} from '../services/adGroupGenerationService';
import { AdGroupGenerationRequest } from '../types/adgroup-generation.types';

/**
 * Ad Group Generation Controller
 * Handles ad group generation endpoints
 */
export class AdGroupGenerationController {
  /**
   * Generate ad groups
   * POST /api/adgroups/generate
   */
  generateAdGroups = async (req: Request, res: Response): Promise<void> => {
    try {
      const request = req.body as AdGroupGenerationRequest;

      // Validate request
      const validation = validateAdGroupGenerationRequest(request);
      if (!validation.valid) {
        res.status(400).json({
          error: 'Invalid request',
          message: 'Validation failed',
          errors: validation.errors,
        });
        return;
      }

      // Generate ad groups
      const adGroups = generateAdGroups(request);

      res.json({
        success: true,
        adGroups,
        count: adGroups.length,
      });
    } catch (error: any) {
      console.error('Error generating ad groups:', error);
      res.status(500).json({
        error: 'Failed to generate ad groups',
        message: error.message || 'An unexpected error occurred',
      });
    }
  };
}

