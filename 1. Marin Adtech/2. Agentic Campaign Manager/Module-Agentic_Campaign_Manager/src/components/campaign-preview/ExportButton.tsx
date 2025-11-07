import React, { useState } from 'react';
import { CampaignPreviewData } from '../../types/campaign-preview.types';
import { useCSVExport } from '../../hooks/useCSVExport';
import { useCampaignPreviewStore } from '../../store/campaignPreviewStore';
import { toastService } from '../../utils/toastService';
import { Button } from '../ui/button';
import { Alert } from '../ui/alert';
import { Download, Loader2 } from 'lucide-react';

/**
 * Export Button Component
 * Button to export campaign to Google Ads Editor CSV format
 */
interface ExportButtonProps {
  previewData: CampaignPreviewData;
}

const ExportButton: React.FC<ExportButtonProps> = ({ previewData }) => {
  const { exportCampaign, validateExport, isExporting, error } = useCSVExport();
  const { editedPreviewData, validateCampaign, validationResult } = useCampaignPreviewStore();
  const [isValidating, setIsValidating] = useState(false);

  // Use edited data if available, otherwise use original
  const dataToExport = editedPreviewData || previewData;

  const handleExport = async () => {
    try {
      setIsValidating(true);

      // Validate campaign first (using store validation)
      const validation = validateCampaign();
      if (!validation.isValid) {
        toastService.error(
          `Export validation failed:\n${validation.errors.slice(0, 5).map((e: any) => e.message || e).join('\n')}${validation.errors.length > 5 ? `\n... and ${validation.errors.length - 5} more errors` : ''}`
        );
        return;
      }

      // Also validate via API (double-check)
      const apiValidation = await validateExport(dataToExport);

      if (!apiValidation.valid) {
        toastService.error(
          `Export validation failed:\n${apiValidation.errors.slice(0, 5).join('\n')}${apiValidation.errors.length > 5 ? `\n... and ${apiValidation.errors.length - 5} more errors` : ''}`
        );
        return;
      }

      // Export campaign
      await exportCampaign(dataToExport);
      toastService.success('Campaign exported successfully! Check your downloads folder.');
    } catch (err) {
      console.error('Export error:', err);
      toastService.error('Failed to export campaign. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  const isDisabled = isExporting || isValidating || dataToExport.adGroups.length === 0 || (validationResult && !validationResult.isValid);
  const isLoading = isExporting || isValidating;

  return (
    <div className="space-y-3">
      <Button
        onClick={handleExport}
        disabled={isDisabled}
        type="button"
        className="w-full md:w-auto"
        title={validationResult && !validationResult.isValid ? 'Please fix validation errors before exporting' : 'Export to Google Ads Editor'}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {isValidating ? 'Validating...' : 'Exporting...'}
          </>
        ) : (
          <>
            <Download className="h-4 w-4" />
            Export to Google Ads Editor
          </>
        )}
      </Button>

      {error && (
        <Alert variant="destructive">
          <p className="text-sm">{error}</p>
        </Alert>
      )}
    </div>
  );
};

export default ExportButton;

