import { CampaignPreviewData } from '../types/campaign-preview.types';
import Papa from 'papaparse';

/**
 * CSV Export Service
 * Handles export of campaigns to Google Ads Editor CSV format
 */

/**
 * Google Ads Editor CSV Row
 * Represents a row in the Google Ads Editor CSV format
 */
export interface GoogleAdsEditorCSVRow {
  'Campaign': string;
  'Campaign state': string;
  'Ad group': string;
  'Ad group state': string;
  'Keyword': string;
  'Match type': string;
  'Keyword state': string;
  'Headline 1': string;
  'Headline 2': string;
  'Headline 3': string;
  'Headline 4': string;
  'Headline 5': string;
  'Headline 6': string;
  'Headline 7': string;
  'Headline 8': string;
  'Headline 9': string;
  'Headline 10': string;
  'Headline 11': string;
  'Headline 12': string;
  'Headline 13': string;
  'Headline 14': string;
  'Headline 15': string;
  'Description 1': string;
  'Description 2': string;
  'Description 3': string;
  'Description 4': string;
  'Final URL': string;
  'Display URL': string;
  'Path 1': string;
  'Path 2': string;
}

/**
 * Export campaign to Google Ads Editor CSV format
 */
export function exportCampaignToGoogleAdsEditorCSV(
  previewData: CampaignPreviewData
): string {
  const rows: GoogleAdsEditorCSVRow[] = [];

  previewData.adGroups.forEach((adGroup) => {
    // For each ad group, create rows for each keyword-ad combination
    adGroup.ads.forEach((ad) => {
      adGroup.keywords.forEach((keyword) => {
        const row: GoogleAdsEditorCSVRow = {
          'Campaign': previewData.campaignName,
          'Campaign state': 'Active',
          'Ad group': adGroup.name,
          'Ad group state': 'Active',
          'Keyword': keyword.text,
          'Match type': formatMatchType(keyword.matchType),
          'Keyword state': 'Active',
          'Headline 1': ad.headlines[0]?.text || '',
          'Headline 2': ad.headlines[1]?.text || '',
          'Headline 3': ad.headlines[2]?.text || '',
          'Headline 4': ad.headlines[3]?.text || '',
          'Headline 5': ad.headlines[4]?.text || '',
          'Headline 6': ad.headlines[5]?.text || '',
          'Headline 7': ad.headlines[6]?.text || '',
          'Headline 8': ad.headlines[7]?.text || '',
          'Headline 9': ad.headlines[8]?.text || '',
          'Headline 10': ad.headlines[9]?.text || '',
          'Headline 11': ad.headlines[10]?.text || '',
          'Headline 12': ad.headlines[11]?.text || '',
          'Headline 13': ad.headlines[12]?.text || '',
          'Headline 14': ad.headlines[13]?.text || '',
          'Headline 15': ad.headlines[14]?.text || '',
          'Description 1': ad.descriptions[0]?.text || '',
          'Description 2': ad.descriptions[1]?.text || '',
          'Description 3': ad.descriptions[2]?.text || '',
          'Description 4': ad.descriptions[3]?.text || '',
          'Final URL': ad.finalUrl || '',
          'Display URL': ad.displayUrl || extractDisplayUrl(ad.finalUrl),
          'Path 1': ad.paths?.[0] || '',
          'Path 2': ad.paths?.[1] || '',
        };

        rows.push(row);
      });
    });

    // If no ads, still create rows for keywords (without ad content)
    if (adGroup.ads.length === 0) {
      adGroup.keywords.forEach((keyword) => {
        const row: GoogleAdsEditorCSVRow = {
          'Campaign': previewData.campaignName,
          'Campaign state': 'Active',
          'Ad group': adGroup.name,
          'Ad group state': 'Active',
          'Keyword': keyword.text,
          'Match type': formatMatchType(keyword.matchType),
          'Keyword state': 'Active',
          'Headline 1': '',
          'Headline 2': '',
          'Headline 3': '',
          'Headline 4': '',
          'Headline 5': '',
          'Headline 6': '',
          'Headline 7': '',
          'Headline 8': '',
          'Headline 9': '',
          'Headline 10': '',
          'Headline 11': '',
          'Headline 12': '',
          'Headline 13': '',
          'Headline 14': '',
          'Headline 15': '',
          'Description 1': '',
          'Description 2': '',
          'Description 3': '',
          'Description 4': '',
          'Final URL': '',
          'Display URL': '',
          'Path 1': '',
          'Path 2': '',
        };

        rows.push(row);
      });
    }
  });

  // Convert to CSV using PapaParse
  const csv = Papa.unparse(rows, {
    header: true,
    delimiter: ',',
    quotes: true,
    escapeChar: '"',
  });

  return csv;
}

/**
 * Format match type for Google Ads Editor
 * Google Ads Editor expects: [Broad], [Phrase], or [Exact]
 */
function formatMatchType(matchType: 'broad' | 'phrase' | 'exact'): string {
  switch (matchType) {
    case 'broad':
      return '[Broad]';
    case 'phrase':
      return '[Phrase]';
    case 'exact':
      return '[Exact]';
    default:
      return '[Broad]';
  }
}

/**
 * Extract display URL from final URL
 */
function extractDisplayUrl(finalUrl: string): string {
  if (!finalUrl) return '';
  
  try {
    const url = new URL(finalUrl);
    return url.hostname.replace('www.', '');
  } catch {
    // If URL parsing fails, return empty string
    return '';
  }
}

/**
 * Validate campaign data before export
 */
export function validateCampaignForExport(
  previewData: CampaignPreviewData
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!previewData.campaignName) {
    errors.push('Campaign name is required');
  }

  if (previewData.adGroups.length === 0) {
    errors.push('At least one ad group is required');
  }

  previewData.adGroups.forEach((adGroup, agIndex) => {
    if (!adGroup.name) {
      errors.push(`Ad group ${agIndex + 1} is missing a name`);
    }

    if (adGroup.keywords.length === 0) {
      errors.push(`Ad group "${adGroup.name}" has no keywords`);
    }

    adGroup.keywords.forEach((keyword, kwIndex) => {
      if (!keyword.text || keyword.text.trim().length === 0) {
        errors.push(`Ad group "${adGroup.name}", keyword ${kwIndex + 1} is empty`);
      }

      if (keyword.text.length > 80) {
        errors.push(`Ad group "${adGroup.name}", keyword "${keyword.text}" exceeds 80 characters`);
      }
    });

    adGroup.ads.forEach((ad, adIndex) => {
      if (ad.headlines.length === 0) {
        errors.push(`Ad group "${adGroup.name}", ad ${adIndex + 1} has no headlines`);
      }

      ad.headlines.forEach((headline, hIndex) => {
        if (headline.text.length > 30) {
          errors.push(`Ad group "${adGroup.name}", ad ${adIndex + 1}, headline ${hIndex + 1} exceeds 30 characters`);
        }
      });

      ad.descriptions.forEach((description, dIndex) => {
        if (description.text.length > 90) {
          errors.push(`Ad group "${adGroup.name}", ad ${adIndex + 1}, description ${dIndex + 1} exceeds 90 characters`);
        }
      });

      if (ad.finalUrl && !isValidUrl(ad.finalUrl)) {
        errors.push(`Ad group "${adGroup.name}", ad ${adIndex + 1} has invalid final URL`);
      }
    });
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate URL
 */
function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

