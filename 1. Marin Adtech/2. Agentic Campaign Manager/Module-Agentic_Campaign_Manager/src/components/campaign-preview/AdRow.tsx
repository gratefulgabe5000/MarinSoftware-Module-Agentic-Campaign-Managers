import React, { useState } from 'react';
import { GeneratedRSA } from '../../types/rsa-generation.types';
import AdCopyEditor from './AdCopyEditor';

/**
 * Ad Row Component
 * Editable row for a Responsive Search Ad
 */
interface AdRowProps {
  ad: GeneratedRSA;
  adGroupId: string;
}

const AdRow: React.FC<AdRowProps> = ({ ad, adGroupId }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <tr className="ad-row">
        <td className="col-expand">
          <button
            className="expand-button"
            onClick={() => setIsExpanded(!isExpanded)}
            type="button"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        </td>
        <td className="col-type">
          <span className="type-badge type-ad">Ad</span>
        </td>
        <td className="col-name">
          <span>RSA Ad ({ad.headlines.length} headlines, {ad.descriptions.length} descriptions)</span>
        </td>
        <td className="col-match-type">—</td>
        <td className="col-keywords">—</td>
        <td className="col-ads">
          <span className="ad-count">{ad.headlines.length}H / {ad.descriptions.length}D</span>
        </td>
        <td className="col-actions">
          <button
            className="btn-icon"
            onClick={() => setIsExpanded(!isExpanded)}
            type="button"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        </td>
      </tr>
      {isExpanded && (
        <tr className="ad-details-row">
          <td colSpan={7} className="ad-details">
            <AdCopyEditor ad={ad} adGroupId={adGroupId} />
          </td>
        </tr>
      )}
    </>
  );
};

export default AdRow;

