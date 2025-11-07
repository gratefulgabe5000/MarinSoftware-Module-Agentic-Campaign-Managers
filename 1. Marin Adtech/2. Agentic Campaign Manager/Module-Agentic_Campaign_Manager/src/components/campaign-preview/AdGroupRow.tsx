import React, { useState } from 'react';
import { AdGroupPreviewRow } from '../../types/campaign-preview.types';
import { useCampaignPreviewStore } from '../../store/campaignPreviewStore';
import { handleAdGroupNameEdit } from '../../utils/inlineEditing';
import { validateAdGroupName } from '../../services/validationService';
import KeywordRow from './KeywordRow';
import AdRow from './AdRow';

/**
 * Ad Group Row Component
 * Expandable row showing ad group with nested keywords and ads
 */
interface AdGroupRowProps {
  adGroup: AdGroupPreviewRow;
  isExpanded: boolean;
  onToggle: () => void;
}

const AdGroupRow: React.FC<AdGroupRowProps> = ({ adGroup, isExpanded, onToggle }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(adGroup.name);
  const [error, setError] = useState<string | null>(null);

  const { updateAdGroup } = useCampaignPreviewStore();

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
    setError(null);
  };

  const handleNameSave = () => {
    const validation = validateAdGroupName(editValue);
    if (!validation.valid) {
      setError(validation.error || 'Invalid ad group name');
      return;
    }

    const result = handleAdGroupNameEdit(adGroup.id, editValue, (adGroupId, updates) => {
      updateAdGroup(adGroupId, updates);
    });

    if (result.success) {
      setIsEditing(false);
      setError(null);
    } else {
      setError(result.error || 'Failed to update ad group name');
    }
  };

  const handleNameCancel = () => {
    setEditValue(adGroup.name);
    setIsEditing(false);
    setError(null);
  };

  return (
    <>
      <tr className="adgroup-row">
        <td className="col-expand">
          <button
            className="expand-button"
            onClick={onToggle}
            type="button"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        </td>
        <td className="col-type">
          <span className="type-badge type-adgroup">Ad Group</span>
        </td>
        <td className="col-name">
          {isEditing ? (
            <div className="editing-wrapper">
              <input
                type="text"
                value={editValue}
                onChange={handleNameChange}
                onBlur={handleNameSave}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleNameSave();
                  } else if (e.key === 'Escape') {
                    handleNameCancel();
                  }
                }}
                className={error ? 'error' : ''}
                autoFocus
                maxLength={255}
              />
              {error && <div className="error-message">{error}</div>}
            </div>
          ) : (
            <span
              className="editable-text"
              onClick={() => setIsEditing(true)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setIsEditing(true);
                }
              }}
            >
              {adGroup.name}
            </span>
          )}
        </td>
        <td className="col-match-type">—</td>
        <td className="col-keywords">{adGroup.keywords.length}</td>
        <td className="col-ads">{adGroup.ads.length}</td>
        <td className="col-actions">
          <button
            className="btn-icon"
            onClick={() => setIsEditing(!isEditing)}
            type="button"
            title="Edit"
          >
            ✏️
          </button>
        </td>
      </tr>
      {isExpanded && (
        <>
          {adGroup.keywords.map((keyword, index) => (
            <KeywordRow
              key={`keyword-${adGroup.id}-${index}`}
              keyword={keyword}
              adGroupId={adGroup.id}
              keywordIndex={index}
            />
          ))}
          {adGroup.ads.map((ad, index) => (
            <AdRow
              key={`ad-${adGroup.id}-${index}`}
              ad={ad}
              adGroupId={adGroup.id}
            />
          ))}
        </>
      )}
    </>
  );
};

export default AdGroupRow;

