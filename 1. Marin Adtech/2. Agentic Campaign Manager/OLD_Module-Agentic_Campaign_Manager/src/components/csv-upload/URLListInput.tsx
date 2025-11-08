import React, { useState } from 'react';
import { productService } from '../../services/productService';
import { ProductParsingResult } from '../../types/product.types';

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

  return (
    <div className="url-list-input-component">
      <div className="url-input-container">
        <label htmlFor="url-list-textarea" className="url-input-label">
          Paste URLs (one per line)
        </label>
        <textarea
          id="url-list-textarea"
          className="url-list-textarea"
          value={urls}
          onChange={handleInputChange}
          placeholder="https://example.com/product1&#10;https://example.com/product2&#10;https://example.com/product3"
          rows={10}
          disabled={isParsing}
        />
        <div className="url-input-footer">
          <span className="character-count">{characterCount} characters</span>
          <button
            className="btn btn-primary parse-urls-button"
            onClick={handleParse}
            disabled={isParsing || !urls.trim()}
            type="button"
          >
            {isParsing ? (
              <>
                <span className="spinner-small"></span>
                Parsing...
              </>
            ) : (
              'Parse URLs'
            )}
          </button>
        </div>
      </div>
      <div className="url-input-hint">
        <p>
          <strong>Example format:</strong>
        </p>
        <pre className="url-example">
          https://example.com/product1{'\n'}
          https://example.com/product2{'\n'}
          https://example.com/product3
        </pre>
      </div>
    </div>
  );
};

export default URLListInput;

