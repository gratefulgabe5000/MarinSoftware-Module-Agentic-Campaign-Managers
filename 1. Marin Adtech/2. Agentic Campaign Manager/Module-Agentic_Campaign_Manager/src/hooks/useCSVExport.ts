import { useState } from 'react';
import axios from 'axios';
import { CampaignPreviewData } from '../types/campaign-preview.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

/**
 * CSV Export Hook
 * Handles CSV export functionality
 */
export function useCSVExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Export campaign to CSV
   */
  const exportCampaign = async (previewData: CampaignPreviewData): Promise<void> => {
    try {
      setIsExporting(true);
      setError(null);

      const response = await axios.post(
        `${API_BASE_URL}/campaigns/export`,
        previewData,
        {
          responseType: 'blob',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      // Create blob from response
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });

      // Create download link
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      
      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'google-ads-editor-export.csv';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up URL
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Error exporting campaign:', err);
      if (err.response?.data) {
        // Try to parse error message from blob response
        if (err.response.data instanceof Blob) {
          const text = await err.response.data.text();
          try {
            const errorData = JSON.parse(text);
            setError(errorData.message || 'Failed to export campaign');
          } catch {
            setError('Failed to export campaign');
          }
        } else {
          setError(err.response.data.message || 'Failed to export campaign');
        }
      } else {
        setError(err.message || 'Failed to export campaign');
      }
      throw err;
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Validate campaign before export
   */
  const validateExport = async (previewData: CampaignPreviewData): Promise<{
    valid: boolean;
    errors: string[];
  }> => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/campaigns/export/validate`,
        previewData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (err: any) {
      console.error('Error validating export:', err);
      if (err.response?.data) {
        return {
          valid: false,
          errors: [err.response.data.message || 'Validation failed'],
        };
      }
      return {
        valid: false,
        errors: [err.message || 'Validation failed'],
      };
    }
  };

  return {
    exportCampaign,
    validateExport,
    isExporting,
    error,
  };
}

