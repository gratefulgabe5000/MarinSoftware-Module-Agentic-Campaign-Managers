import React, { useState } from 'react';
import { GeneratedKeyword } from '../../types/keyword-generation.types';
import { useCampaignPreviewStore } from '../../store/campaignPreviewStore';
import { handleKeywordEdit } from '../../utils/inlineEditing';
import { validateKeyword } from '../../services/validationService';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { TableCell, TableRow } from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { PencilIcon, Trash2Icon } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';

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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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
    const keywordId = (keyword as any).id || keyword.text;
    deleteKeyword(keywordId, adGroupId);
    setShowDeleteDialog(false);
  };

  const getMatchTypeBadgeVariant = (type: string): "default" | "secondary" | "outline" => {
    switch (type) {
      case 'exact':
        return 'default';
      case 'phrase':
        return 'secondary';
      case 'broad':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <>
      <TableRow className="hover:bg-muted/50">
        <TableCell className="w-12"></TableCell>
        <TableCell>
          <Badge variant="secondary">Keyword</Badge>
        </TableCell>
        <TableCell>
          {isEditing ? (
            <div className="space-y-1">
              <Input
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
                className={error ? 'border-destructive' : ''}
                autoFocus
                maxLength={80}
              />
              {error && <p className="text-xs text-destructive">{error}</p>}
            </div>
          ) : (
            <button
              className="text-left hover:text-primary transition-colors"
              onClick={() => setIsEditing(true)}
              type="button"
            >
              {keywordText}
            </button>
          )}
        </TableCell>
        <TableCell className="text-center">
          {isEditing ? (
            <Select
              value={matchType}
              onValueChange={(value) => {
                setMatchType(value as 'broad' | 'phrase' | 'exact');
                // Auto-save when match type changes
                setTimeout(() => handleSave(), 100);
              }}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="broad">Broad</SelectItem>
                <SelectItem value="phrase">Phrase</SelectItem>
                <SelectItem value="exact">Exact</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <Badge variant={getMatchTypeBadgeVariant(matchType)}>
              {matchTypeDisplay[matchType]}
            </Badge>
          )}
        </TableCell>
        <TableCell className="text-center text-muted-foreground">—</TableCell>
        <TableCell className="text-center text-muted-foreground">—</TableCell>
        <TableCell className="text-center">
          <div className="flex justify-center gap-1">
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              type="button"
              title="Delete"
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2Icon className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Keyword</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the keyword "{keyword.text}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default KeywordRow;

