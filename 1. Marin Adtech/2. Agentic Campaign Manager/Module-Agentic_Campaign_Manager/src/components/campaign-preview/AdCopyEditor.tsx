import React, { useState } from 'react';
import { GeneratedRSA } from '../../types/rsa-generation.types';
import { useCampaignPreviewStore } from '../../store/campaignPreviewStore';
import { handleHeadlineEdit, handleDescriptionEdit, handleUrlEdit } from '../../utils/inlineEditing';
import { validateHeadline, validateDescription, validateUrl } from '../../services/validationService';

/**
 * Ad Copy Editor Component
 * Editable component for headlines and descriptions
 */
interface AdCopyEditorProps {
  ad: GeneratedRSA;
  adGroupId: string;
  onUpdate?: () => void;
}

const AdCopyEditor: React.FC<AdCopyEditorProps> = ({ ad, adGroupId, onUpdate }) => {
  const [editingHeadlineIndex, setEditingHeadlineIndex] = useState<number | null>(null);
  const [editingDescriptionIndex, setEditingDescriptionIndex] = useState<number | null>(null);
  const [editingUrl, setEditingUrl] = useState(false);
  const [headlineErrors, setHeadlineErrors] = useState<Record<number, string>>({});
  const [descriptionErrors, setDescriptionErrors] = useState<Record<number, string>>({});
  const [urlError, setUrlError] = useState<string | null>(null);

  const {
    updateHeadline,
    updateDescription,
    updateUrl,
    addHeadline,
    addDescription,
    deleteHeadline,
    deleteDescription,
  } = useCampaignPreviewStore();

  // Handle headline change
  const handleHeadlineChange = (index: number, text: string) => {
    const validation = validateHeadline(text);
    if (!validation.valid) {
      setHeadlineErrors({ ...headlineErrors, [index]: validation.error || '' });
    } else {
      const newErrors = { ...headlineErrors };
      delete newErrors[index];
      setHeadlineErrors(newErrors);

      const result = handleHeadlineEdit(ad.id, index, text, (adId, headlineIndex, newText) => {
        updateHeadline(adId, adGroupId, headlineIndex, newText);
        if (onUpdate) onUpdate();
      });

      if (!result.success && result.error) {
        setHeadlineErrors({ ...headlineErrors, [index]: result.error });
      }
    }
  };

  // Handle description change
  const handleDescriptionChange = (index: number, text: string) => {
    const validation = validateDescription(text);
    if (!validation.valid) {
      setDescriptionErrors({ ...descriptionErrors, [index]: validation.error || '' });
    } else {
      const newErrors = { ...descriptionErrors };
      delete newErrors[index];
      setDescriptionErrors(newErrors);

      const result = handleDescriptionEdit(ad.id, index, text, (adId, descriptionIndex, newText) => {
        updateDescription(adId, adGroupId, descriptionIndex, newText);
        if (onUpdate) onUpdate();
      });

      if (!result.success && result.error) {
        setDescriptionErrors({ ...descriptionErrors, [index]: result.error });
      }
    }
  };

  // Handle URL change
  const handleUrlChange = (url: string) => {
    const validation = validateUrl(url);
    if (!validation.valid) {
      setUrlError(validation.error || null);
    } else {
      setUrlError(null);
      const result = handleUrlEdit(ad.id, url, (adId, newUrl) => {
        updateUrl(adId, adGroupId, newUrl);
        if (onUpdate) onUpdate();
      });

      if (!result.success && result.error) {
        setUrlError(result.error);
      }
    }
  };

  // Handle add headline
  const handleAddHeadline = () => {
    addHeadline(ad.id, adGroupId, '');
    if (onUpdate) onUpdate();
  };

  // Handle add description
  const handleAddDescription = () => {
    addDescription(ad.id, adGroupId, '');
    if (onUpdate) onUpdate();
  };

  // Handle delete headline
  const handleDeleteHeadline = (index: number) => {
    if (ad.headlines.length <= 3) {
      alert('At least 3 headlines are required');
      return;
    }
    deleteHeadline(ad.id, adGroupId, index);
    if (onUpdate) onUpdate();
  };

  // Handle delete description
  const handleDeleteDescription = (index: number) => {
    if (ad.descriptions.length <= 2) {
      alert('At least 2 descriptions are required');
      return;
    }
    deleteDescription(ad.id, adGroupId, index);
    if (onUpdate) onUpdate();
  };

  return (
    <div className="ad-copy-editor">
      {/* Headlines Section */}
      <div className="ad-section">
        <div className="section-header">
          <h4>Headlines ({ad.headlines.length}/15)</h4>
          {ad.headlines.length < 15 && (
            <button
              className="btn btn-sm btn-primary"
              onClick={handleAddHeadline}
              type="button"
            >
              + Add Headline
            </button>
          )}
        </div>
        <div className="headlines-list">
          {ad.headlines.map((headline, index) => (
            <div key={index} className="headline-item">
              <div className="headline-input-wrapper">
                <input
                  type="text"
                  value={headline.text}
                  maxLength={30}
                  onChange={(e) => handleHeadlineChange(index, e.target.value)}
                  onFocus={() => setEditingHeadlineIndex(index)}
                  onBlur={() => setEditingHeadlineIndex(null)}
                  className={headlineErrors[index] ? 'error' : ''}
                  placeholder={`Headline ${index + 1} (max 30 chars)`}
                />
                <div className="headline-actions">
                  <span className={`char-count ${headline.text.length > 30 ? 'error' : ''}`}>
                    {headline.text.length}/30
                  </span>
                  {ad.headlines.length > 3 && (
                    <button
                      className="btn-icon btn-danger"
                      onClick={() => handleDeleteHeadline(index)}
                      type="button"
                      title="Delete headline"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
              {headlineErrors[index] && (
                <div className="error-message">{headlineErrors[index]}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Descriptions Section */}
      <div className="ad-section">
        <div className="section-header">
          <h4>Descriptions ({ad.descriptions.length}/4)</h4>
          {ad.descriptions.length < 4 && (
            <button
              className="btn btn-sm btn-primary"
              onClick={handleAddDescription}
              type="button"
            >
              + Add Description
            </button>
          )}
        </div>
        <div className="descriptions-list">
          {ad.descriptions.map((description, index) => (
            <div key={index} className="description-item">
              <div className="description-input-wrapper">
                <textarea
                  value={description.text}
                  maxLength={90}
                  onChange={(e) => handleDescriptionChange(index, e.target.value)}
                  onFocus={() => setEditingDescriptionIndex(index)}
                  onBlur={() => setEditingDescriptionIndex(null)}
                  className={descriptionErrors[index] ? 'error' : ''}
                  placeholder={`Description ${index + 1} (max 90 chars)`}
                  rows={2}
                />
                <div className="description-actions">
                  <span className={`char-count ${description.text.length > 90 ? 'error' : ''}`}>
                    {description.text.length}/90
                  </span>
                  {ad.descriptions.length > 2 && (
                    <button
                      className="btn-icon btn-danger"
                      onClick={() => handleDeleteDescription(index)}
                      type="button"
                      title="Delete description"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
              {descriptionErrors[index] && (
                <div className="error-message">{descriptionErrors[index]}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* URLs Section */}
      <div className="ad-section">
        <h4>URLs</h4>
        <div className="url-inputs">
          <div className="url-item">
            <label>Final URL:</label>
            <input
              type="url"
              value={ad.finalUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              onFocus={() => setEditingUrl(true)}
              onBlur={() => setEditingUrl(false)}
              className={urlError ? 'error' : ''}
              placeholder="https://example.com"
            />
            {urlError && <div className="error-message">{urlError}</div>}
          </div>
          {ad.displayUrl && (
            <div className="url-item">
              <label>Display URL:</label>
              <input
                type="text"
                value={ad.displayUrl}
                onChange={(e) => {
                  // Display URL is optional, so we can update it directly
                  // TODO: Add updateDisplayUrl to store if needed
                }}
                placeholder="example.com"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdCopyEditor;

