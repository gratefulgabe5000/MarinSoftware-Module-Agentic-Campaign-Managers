import { useState } from 'react';
import { GeneratedRSA } from '../../types/rsa-generation.types';
import { useCampaignPreviewStore } from '../../store/campaignPreviewStore';
import { handleHeadlineEdit, handleDescriptionEdit, handleUrlEdit } from '../../utils/inlineEditing';
import { validateHeadline, validateDescription, validateUrl } from '../../services/validationService';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { TrashIcon, PlusIcon } from 'lucide-react';

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

  // Suppress unused variable warning
  void editingUrl;

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
    <div className="space-y-6">
      {/* Headlines Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              Headlines ({ad.headlines.length}/15)
            </CardTitle>
            {ad.headlines.length < 15 && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleAddHeadline}
                type="button"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Headline
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {ad.headlines.map((headline, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-start gap-2">
                <div className="flex-1 space-y-1">
                  <Input
                    type="text"
                    value={headline.text}
                    maxLength={30}
                    onChange={(e) => handleHeadlineChange(index, e.target.value)}
                    className={headlineErrors[index] ? 'border-destructive' : ''}
                    placeholder={`Headline ${index + 1}`}
                  />
                  {headlineErrors[index] && (
                    <p className="text-sm text-destructive">{headlineErrors[index]}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <Badge
                    variant={headline.text.length > 30 ? 'destructive' : 'secondary'}
                    className="font-mono text-xs"
                  >
                    {headline.text.length}/30
                  </Badge>
                  {ad.headlines.length > 3 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteHeadline(index)}
                      type="button"
                      title="Delete headline"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Descriptions Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              Descriptions ({ad.descriptions.length}/4)
            </CardTitle>
            {ad.descriptions.length < 4 && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleAddDescription}
                type="button"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Description
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {ad.descriptions.map((description, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-start gap-2">
                <div className="flex-1 space-y-1">
                  <Textarea
                    value={description.text}
                    maxLength={90}
                    onChange={(e) => handleDescriptionChange(index, e.target.value)}
                    className={descriptionErrors[index] ? 'border-destructive' : ''}
                    placeholder={`Description ${index + 1}`}
                    rows={2}
                  />
                  {descriptionErrors[index] && (
                    <p className="text-sm text-destructive">{descriptionErrors[index]}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <Badge
                    variant={description.text.length > 90 ? 'destructive' : 'secondary'}
                    className="font-mono text-xs"
                  >
                    {description.text.length}/90
                  </Badge>
                  {ad.descriptions.length > 2 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteDescription(index)}
                      type="button"
                      title="Delete description"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* URLs Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">URLs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="final-url">Final URL</Label>
            <Input
              id="final-url"
              type="url"
              value={ad.finalUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              onFocus={() => setEditingUrl(true)}
              onBlur={() => setEditingUrl(false)}
              className={urlError ? 'border-destructive' : ''}
              placeholder="https://example.com"
            />
            {urlError && (
              <p className="text-sm text-destructive">{urlError}</p>
            )}
          </div>
          {ad.displayUrl && (
            <div className="space-y-2">
              <Label htmlFor="display-url">Display URL</Label>
              <Input
                id="display-url"
                type="text"
                value={ad.displayUrl}
                onChange={() => {
                  // Display URL is optional, so we can update it directly
                  // TODO: Add updateDisplayUrl to store if needed
                }}
                placeholder="example.com"
                disabled
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdCopyEditor;

