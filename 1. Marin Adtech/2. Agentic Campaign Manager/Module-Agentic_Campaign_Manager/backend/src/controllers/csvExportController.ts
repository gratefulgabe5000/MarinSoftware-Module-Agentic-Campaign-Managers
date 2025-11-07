import { Request, Response } from 'express';
import {
  exportCampaignToGoogleAdsEditorCSV,
  validateCampaignForExport,
} from '../services/csvExportService';
import { CampaignPreviewData } from '../types/campaign-preview.types';

/**
 * CSV Export Controller
 * Handles CSV export endpoints
 */
export class CSVExportController {
  /**
   * Export campaign to Google Ads Editor CSV
   * POST /api/campaigns/export
   */
  exportCampaign = async (req: Request, res: Response): Promise<void> => {
    try {
      const previewData = req.body as CampaignPreviewData;

      if (!previewData) {
        res.status(400).json({
          error: 'Invalid request',
          message: 'Preview data is required',
        });
        return;
      }

      // Validate campaign data before export
      const validation = validateCampaignForExport(previewData);
      if (!validation.valid) {
        res.status(400).json({
          error: 'Validation failed',
          message: 'Campaign data validation failed',
          errors: validation.errors,
        });
        return;
      }

      // Generate CSV
      const csv = exportCampaignToGoogleAdsEditorCSV(previewData);

      // Set response headers for CSV download
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="google-ads-editor-${previewData.campaignName.replace(/[^a-z0-9]/gi, '_')}-${Date.now()}.csv"`
      );

      // Send CSV
      res.send(csv);
    } catch (error: any) {
      console.error('Error exporting campaign:', error);
      res.status(500).json({
        error: 'Failed to export campaign',
        message: error.message || 'An unexpected error occurred',
      });
    }
  };

  /**
   * Validate campaign before export
   * POST /api/campaigns/export/validate
   */
  validateExport = async (req: Request, res: Response): Promise<void> => {
    try {
      const previewData = req.body as CampaignPreviewData;

      if (!previewData) {
        res.status(400).json({
          error: 'Invalid request',
          message: 'Preview data is required',
        });
        return;
      }

      // Validate campaign data
      const validation = validateCampaignForExport(previewData);

      res.json({
        valid: validation.valid,
        errors: validation.errors,
      });
    } catch (error: any) {
      console.error('Error validating export:', error);
      res.status(500).json({
        error: 'Failed to validate export',
        message: error.message || 'An unexpected error occurred',
      });
    }
  };
}

