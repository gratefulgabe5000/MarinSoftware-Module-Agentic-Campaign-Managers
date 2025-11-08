import React, { useState, useMemo, useEffect } from 'react';
import { AdGroupPreviewRow } from '../../types/campaign-preview.types';
import { useCampaignPreviewStore } from '../../store/campaignPreviewStore';
import { handleAdGroupNameEdit } from '../../utils/inlineEditing';
import { validateAdGroupName } from '../../services/validationService';
import KeywordRow from './KeywordRow';
import AdRow from './AdRow';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { TableCell, TableRow } from '../ui/table';
import { ChevronRightIcon, ChevronDownIcon, PencilIcon } from 'lucide-react';

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
  const { editedPreviewData, updateAdGroup } = useCampaignPreviewStore();

  // Get current ad group data from store if available, otherwise use prop
  const currentAdGroup = useMemo(() => {
    if (editedPreviewData) {
      const storeAdGroup = editedPreviewData.adGroups.find(ag => ag.id === adGroup.id);
      if (storeAdGroup) {
        return storeAdGroup;
      }
    }
    return adGroup;
  }, [editedPreviewData, adGroup]);

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(currentAdGroup.name);
  const [error, setError] = useState<string | null>(null);

  // Sync editValue when currentAdGroup.name changes
  useEffect(() => {
    setEditValue(currentAdGroup.name);
  }, [currentAdGroup.name]);

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
    setEditValue(currentAdGroup.name);
    setIsEditing(false);
    setError(null);
  };

  return (
    <>
      <TableRow className="bg-muted/50 hover:bg-muted/70">
        <TableCell className="w-12">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            type="button"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
            className="h-8 w-8 p-0"
          >
            {isExpanded ? (
              <ChevronDownIcon className="h-4 w-4" />
            ) : (
              <ChevronRightIcon className="h-4 w-4" />
            )}
          </Button>
        </TableCell>
        <TableCell>
          <Badge variant="default">Ad Group</Badge>
        </TableCell>
        <TableCell>
          {isEditing ? (
            <div className="space-y-1">
              <Input
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
                className={error ? 'border-destructive' : ''}
                autoFocus
                maxLength={255}
              />
              {error && <p className="text-xs text-destructive">{error}</p>}
            </div>
          ) : (
            <button
              className="text-left hover:text-primary transition-colors font-medium"
              onClick={() => setIsEditing(true)}
              type="button"
            >
              {currentAdGroup.name}
            </button>
          )}
        </TableCell>
        <TableCell className="text-center text-muted-foreground">—</TableCell>
        <TableCell className="text-center font-medium">{adGroup.keywords.length}</TableCell>
        <TableCell className="text-center font-medium">{adGroup.ads.length}</TableCell>
        <TableCell className="text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            type="button"
            title="Edit"
            className="h-8 w-8 p-0"
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
        </TableCell>
      </TableRow>
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

