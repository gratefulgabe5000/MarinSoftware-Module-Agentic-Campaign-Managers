import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { productService } from '../../services/productService';
import { ProductParsingResult } from '../../types/product.types';

/**
 * CSV Upload Component Props
 */
interface CSVUploadComponentProps {
  onParseComplete: (result: ProductParsingResult) => void;
  onError: (error: string) => void;
}

/**
 * CSV Upload Component
 * Provides drag-and-drop and file picker for CSV uploads
 */
const CSVUploadComponent: React.FC<CSVUploadComponentProps> = ({
  onParseComplete,
  onError,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      // Validate file type
      if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
        onError('Please upload a CSV file');
        return;
      }

      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        onError('File size must be less than 5MB');
        return;
      }

      setFileName(file.name);
      setIsUploading(true);

      try {
        const result = await productService.parseCSV(file);
        onParseComplete(result);
      } catch (error) {
        onError(
          error instanceof Error ? error.message : 'Failed to parse CSV file'
        );
        setFileName(null);
      } finally {
        setIsUploading(false);
      }
    },
    [onParseComplete, onError]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
    disabled: isUploading,
  });

  return (
    <div className="csv-upload-component">
      <div
        {...getRootProps()}
        className={`csv-upload-dropzone ${isDragActive ? 'active' : ''} ${
          isUploading ? 'uploading' : ''
        }`}
      >
        <input {...getInputProps()} />
        {isUploading ? (
          <div className="upload-progress">
            <div className="spinner"></div>
            <p>Uploading and parsing CSV...</p>
            {fileName && <p className="file-name">{fileName}</p>}
          </div>
        ) : (
          <div className="upload-content">
            {isDragActive ? (
              <p className="drop-text">Drop your CSV file here...</p>
            ) : (
              <>
                <div className="upload-icon">📁</div>
                <p className="upload-text">
                  Drag and drop your CSV file here, or click to select
                </p>
                <p className="upload-hint">
                  CSV must contain: Product Name, URL (required)
                  <br />
                  Optional: Category, Price, Description
                </p>
              </>
            )}
          </div>
        )}
      </div>
      {fileName && !isUploading && (
        <div className="file-info">
          <span className="file-icon">✓</span>
          <span className="file-name-text">{fileName}</span>
        </div>
      )}
    </div>
  );
};

export default CSVUploadComponent;

