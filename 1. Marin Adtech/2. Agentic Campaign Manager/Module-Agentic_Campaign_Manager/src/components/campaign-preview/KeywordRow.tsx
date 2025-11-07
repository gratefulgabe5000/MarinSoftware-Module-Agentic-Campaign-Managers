import React, { useState } from 'react';
import { GeneratedKeyword } from '../../types/keyword-generation.types';
import { useCampaignPreviewStore } from '../../store/campaignPreviewStore';
import { handleKeywordEdit } from '../../utils/inlineEditing';
import { validateKeyword } from '../../services/validationService';

/**
 * Keyword Row Component
 * Editable row for a keyword
 */
interface KeywordRowProps {
  keyword: GeneratedKeyword;
  adGroupId: string;
  keywordIndex: number;
}

const KeywordRow: React.FC<KeywordRowProps> = ({ keyword, adGroupId, keywordIndex }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [keywordText, setKeywordText] = useState(keyword.text);
  const [matchType, setMatchType] = useState(keyword.matchType);
  const [error, setError] = useState<string | null>(null);

  const { updateKeyword, deleteKeyword } = useCampaignPreviewStore();

  const matchTypeDisplay = {
    broad: 'Broad',
    phrase: 'Phrase',
    exact: 'Exact',
  };

  const handleSave = () => {
    const validation = validateKeyword(keywordText);
    if (!validation.valid) {
      setError(validation.error || 'Invalid keyword');
      return;
    }

    const keywordId = (keyword as any).id || keyword.text;
    const result = handleKeywordEdit(
      keywordId,
      { text: keywordText, matchType },
      (keywordId, updates) => {
        updateKeyword(keywordId, adGroupId, updates);
      }
    );

    if (result.success) {
      setIsEditing(false);
      setError(null);
    } else {
      setError(result.error || 'Failed to update keyword');
    }
  };

  const handleCancel = () => {
    setKeywordText(keyword.text);
    setMatchType(keyword.matchType);
    setIsEditing(false);
    setError(null);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete the keyword "${keyword.text}"?`)) {
      const keywordId = (keyword as any).id || keyword.text;
      deleteKeyword(keywordId, adGroupId);
    }
  };

  return (
    <tr className="keyword-row">
      <td className="col-expand"></td>
      <td className="col-type">
        <span className="type-badge type-keyword">Keyword</span>
      </td>
      <td className="col-name">
        {isEditing ? (
          <div className="editing-wrapper">
            <input
              type="text"
              value={keywordText}
              onChange={(e) => {
                setKeywordText(e.target.value);
                setError(null);
              }}
              onBlur={handleSave}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSave();
                } else if (e.key === 'Escape') {
                  handleCancel();
                }
              }}
              className={error ? 'error' : ''}
              autoFocus
              maxLength={80}
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
            {keywordText}
          </span>
        )}
      </td>
      <td className="col-match-type">
        {isEditing ? (
          <select
            value={matchType}
            onChange={(e) => setMatchType(e.target.value as 'broad' | 'phrase' | 'exact')}
            onBlur={handleSave}
          >
            <option value="broad">Broad</option>
            <option value="phrase">Phrase</option>
            <option value="exact">Exact</option>
          </select>
        ) : (
          <span className={`match-type-badge match-type-${matchType}`}>
            {matchTypeDisplay[matchType]}
          </span>
        )}
      </td>
      <td className="col-keywords">—</td>
      <td className="col-ads">—</td>
      <td className="col-actions">
        <button
          className="btn-icon"
          onClick={() => setIsEditing(!isEditing)}
          type="button"
          title="Edit"
        >
          ✏️
        </button>
        <button
          className="btn-icon btn-danger"
          onClick={handleDelete}
          type="button"
          title="Delete"
        >
          🗑️
        </button>
      </td>
    </tr>
  );
};

export default KeywordRow;

