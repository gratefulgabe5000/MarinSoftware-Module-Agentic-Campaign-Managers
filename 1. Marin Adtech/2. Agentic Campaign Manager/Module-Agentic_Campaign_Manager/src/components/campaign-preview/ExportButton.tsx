import React, { useState } from 'react';
import { CampaignPreviewData } from '../../types/campaign-preview.types';
import { useCSVExport } from '../../hooks/useCSVExport';
import { useCampaignPreviewStore } from '../../store/campaignPreviewStore';
import { toastService } from '../../utils/toastService';

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

  return (
    <div className="export-button-container">
      {error && (
        <div className="export-error">
          <p>⚠️ {error}</p>
        </div>
      )}
      <button
        className="btn btn-primary export-btn"
        onClick={handleExport}
        disabled={isExporting || isValidating || dataToExport.adGroups.length === 0 || (validationResult && !validationResult.isValid)}
        type="button"
        title={validationResult && !validationResult.isValid ? 'Please fix validation errors before exporting' : 'Export to Google Ads Editor'}
      >
        {isExporting || isValidating ? (
          <>
            <span className="spinner"></span>
            {isValidating ? 'Validating...' : 'Exporting...'}
          </>
        ) : (
          <>
            📥 Export to Google Ads Editor
          </>
        )}
      </button>
    </div>
  );
};

export default ExportButton;

