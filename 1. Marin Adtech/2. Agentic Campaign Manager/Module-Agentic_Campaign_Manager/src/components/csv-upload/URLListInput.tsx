import React, { useState } from 'react';
import { productService } from '../../services/productService';
import { ProductParsingResult } from '../../types/product.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Loader2Icon, LinkIcon } from 'lucide-react';

/**
 * URL List Input Component Props
 */
interface URLListInputProps {
  onParseComplete: (result: ProductParsingResult) => void;
  onError: (error: string) => void;
}

/**
 * URL List Input Component
 * Provides textarea for pasting URLs
 */
const URLListInput: React.FC<URLListInputProps> = ({
  onParseComplete,
  onError,
}) => {
  const [urls, setUrls] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setUrls(value);
    setCharacterCount(value.length);
  };

  const handleParse = async () => {
    if (!urls.trim()) {
      onError('Please enter at least one URL');
      return;
    }

    // Split URLs by newlines and filter empty lines
    const urlList = urls
      .split('\n')
      .map((url) => url.trim())
      .filter((url) => url.length > 0);

    if (urlList.length === 0) {
      onError('Please enter at least one valid URL');
      return;
    }

    setIsParsing(true);

    try {
      const result = await productService.parseURLs(urlList);
      onParseComplete(result);
    } catch (error) {
      onError(
        error instanceof Error ? error.message : 'Failed to parse URLs'
      );
    } finally {
      setIsParsing(false);
    }
  };

  const urlCount = urls
    .split('\n')
    .map(url => url.trim())
    .filter(url => url.length > 0).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <LinkIcon className="h-5 w-5" />
          <CardTitle>Paste Product URLs</CardTitle>
        </div>
        <CardDescription>
          Enter product URLs, one per line. We'll extract product information automatically.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="url-list-textarea">URLs</Label>
          <Textarea
            id="url-list-textarea"
            value={urls}
            onChange={handleInputChange}
            placeholder="https://example.com/product1&#10;https://example.com/product2&#10;https://example.com/product3"
            rows={12}
            disabled={isParsing}
            className="font-mono text-sm"
          />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{urlCount} URL{urlCount !== 1 ? 's' : ''} • {characterCount} characters</span>
            <Button
              onClick={handleParse}
              disabled={isParsing || !urls.trim()}
              type="button"
            >
              {isParsing ? (
                <>
                  <Loader2Icon className="h-4 w-4 animate-spin" />
                  Parsing...
                </>
              ) : (
                <>
                  <LinkIcon className="h-4 w-4" />
                  Parse URLs
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="rounded-lg bg-muted p-4 space-y-2">
          <p className="text-sm font-medium">Example format:</p>
          <pre className="text-xs bg-background rounded p-2 border">
{`https://example.com/product1
https://example.com/product2
https://example.com/product3`}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
};

export default URLListInput;

