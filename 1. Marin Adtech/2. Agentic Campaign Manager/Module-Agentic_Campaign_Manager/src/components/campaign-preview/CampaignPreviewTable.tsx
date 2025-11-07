import React, { useState, useMemo } from 'react';
import { CampaignPreviewData, AdGroupPreviewRow } from '../../types/campaign-preview.types';
import { useCampaignPreviewStore } from '../../store/campaignPreviewStore';
import AdGroupRow from './AdGroupRow';
import ExportButton from './ExportButton';
import ExportInstructions from './ExportInstructions';

/**
 * Campaign Preview Table Component
 * Main table component for displaying and editing campaigns
 */
interface CampaignPreviewTableProps {
  previewData: CampaignPreviewData;
}

const CampaignPreviewTable: React.FC<CampaignPreviewTableProps> = ({ previewData }) => {
  const [expandedAdGroups, setExpandedAdGroups] = useState<Set<string>>(new Set());
  const [filterText, setFilterText] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'keywords' | 'ads'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const { editedPreviewData } = useCampaignPreviewStore();

  // Use edited data if available, otherwise use original
  const displayData = editedPreviewData || previewData;

  const toggleAdGroup = (adGroupId: string) => {
    const newExpanded = new Set(expandedAdGroups);
    if (newExpanded.has(adGroupId)) {
      newExpanded.delete(adGroupId);
    } else {
      newExpanded.add(adGroupId);
    }
    setExpandedAdGroups(newExpanded);
  };

  // Filter and sort ad groups
  const filteredAndSortedAdGroups = useMemo(() => {
    let filtered = displayData.adGroups;

    // Filter by text
    if (filterText) {
      const lowerFilter = filterText.toLowerCase();
      filtered = filtered.filter((ag) =>
        ag.name.toLowerCase().includes(lowerFilter) ||
        ag.keywords.some((kw) => kw.text.toLowerCase().includes(lowerFilter))
      );
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'keywords':
          comparison = a.keywords.length - b.keywords.length;
          break;
        case 'ads':
          comparison = a.ads.length - b.ads.length;
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [displayData.adGroups, filterText, sortBy, sortOrder]);

  return (
    <div className="campaign-preview-table">
      <div className="preview-summary">
        <div className="summary-item">
          <span className="summary-label">Campaign:</span>
          <span className="summary-value">{displayData.campaignName}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Ad Groups:</span>
          <span className="summary-value">{displayData.adGroups.length}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Keywords:</span>
          <span className="summary-value">{displayData.totalKeywords}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Ads:</span>
          <span className="summary-value">{displayData.totalAds}</span>
        </div>
      </div>

      {/* Filters and Sorting */}
      <div className="preview-filters">
        <div className="filter-group">
          <label htmlFor="filter-text">Filter:</label>
          <input
            id="filter-text"
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Search ad groups or keywords..."
            className="filter-input"
          />
        </div>
        <div className="filter-group">
          <label htmlFor="sort-by">Sort by:</label>
          <select
            id="sort-by"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'keywords' | 'ads')}
            className="sort-select"
          >
            <option value="name">Name</option>
            <option value="keywords">Keywords Count</option>
            <option value="ads">Ads Count</option>
          </select>
        </div>
        <div className="filter-group">
          <button
            className="btn btn-sm btn-secondary"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            type="button"
          >
            {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
          </button>
        </div>
      </div>

      <div className="preview-table-container">
        <table className="preview-table">
          <thead>
            <tr>
              <th className="col-expand"></th>
              <th className="col-type">Type</th>
              <th className="col-name">Name / Text</th>
              <th className="col-match-type">Match Type</th>
              <th className="col-keywords">Keywords</th>
              <th className="col-ads">Ads</th>
              <th className="col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedAdGroups.length === 0 ? (
              <tr>
                <td colSpan={7} className="no-results">
                  No ad groups found matching your filter.
                </td>
              </tr>
            ) : (
              filteredAndSortedAdGroups.map((adGroup) => (
                <AdGroupRow
                  key={adGroup.id}
                  adGroup={adGroup}
                  isExpanded={expandedAdGroups.has(adGroup.id)}
                  onToggle={() => toggleAdGroup(adGroup.id)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="preview-export-section">
        <ExportInstructions />
        <ExportButton previewData={displayData} />
      </div>
    </div>
  );
};

export default CampaignPreviewTable;

