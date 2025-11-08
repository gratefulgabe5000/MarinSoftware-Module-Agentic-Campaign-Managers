import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { productService } from '../../services/productService';
import { ProductParsingResult } from '../../types/product.types';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { UploadCloudIcon, FileTextIcon, Loader2Icon, CheckCircle2Icon, XIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * CSV Upload Component Props
 */
interface CSVUploadComponentProps {
  onParseComplete: (result: ProductParsingResult) => void;
  onError: (error: string) => void;
  onClearErrorsWarnings?: () => void;
  onClear?: () => void;
  onRemoveFile?: (fileName: string) => void;
  uploadedFiles?: string[];
}

/**
 * CSV Upload Component
 * Provides drag-and-drop and file picker for CSV uploads
 */
const CSVUploadComponent: React.FC<CSVUploadComponentProps> = ({
  onParseComplete,
  onError,
  onClearErrorsWarnings,
  onClear,
  onRemoveFile,
  uploadedFiles = [],
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [currentFileName, setCurrentFileName] = useState<string | null>(null);

  const handleClear = useCallback(() => {
    setCurrentFileName(null);
    if (onClear) {
      onClear();
    }
  }, [onClear]);

  const handleRemoveFile = useCallback((fileName: string) => {
    if (onRemoveFile) {
      onRemoveFile(fileName);
    }
  }, [onRemoveFile]);

  const onDropRejected = useCallback((fileRejections: any[]) => {
    // Clear previous errors/warnings when new files are rejected (preserve products)
    if (onClearErrorsWarnings) {
      onClearErrorsWarnings();
    }
    
    fileRejections.forEach(({ file, errors }) => {
      if (errors.some((e: any) => e.code === 'file-invalid-type')) {
        onError('Only CSV files are allowed.');
      } else if (errors.some((e: any) => e.code === 'file-too-large')) {
        onError('File size must be less than 5MB');
      } else {
        onError(`File rejected: ${errors.map((e: any) => e.message).join(', ')}`);
      }
    });
  }, [onError, onClearErrorsWarnings]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      // Clear previous errors and warnings when new files are dropped (preserve products)
      if (onClearErrorsWarnings) {
        onClearErrorsWarnings();
      }

      setIsUploading(true);

      // Process all files sequentially
      for (const file of acceptedFiles) {
        // Validate file type (double check)
        if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
          onError('Only CSV files are allowed.');
          continue;
        }

        // Validate file size (5MB limit)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
          onError('File size must be less than 5MB');
          continue;
        }

        setCurrentFileName(file.name);

        try {
          const result = await productService.parseCSV(file);
          // Include the filename in the parsing result
          onParseComplete({ ...result, fileName: file.name });
        } catch (error) {
          onError(
            error instanceof Error
              ? error.message
              : 'Failed to parse CSV file'
          );
        }
      }

      setCurrentFileName(null);
      setIsUploading(false);
    },
    [onParseComplete, onError, onClearErrorsWarnings]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: {
      'text/csv': ['.csv'],
    },
    multiple: true, // Allow multiple file selection
    disabled: isUploading,
  });

  return (
    <div className="space-y-4">
      <Card
        {...getRootProps()}
        className={cn(
          'cursor-pointer transition-all duration-200 hover:border-primary',
          'min-h-[400px]',
          isDragActive && 'border-primary bg-primary/5',
          isUploading && 'pointer-events-none opacity-70'
        )}
      >
        <input {...getInputProps()} />
        <CardContent className="flex flex-col items-center justify-center p-12 text-center min-h-[376px]">
          {isUploading ? (
            <div className="pointer-events-none">
              <Loader2Icon className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-lg font-medium">Uploading and parsing CSV...</p>
              {currentFileName && (
                <p className="text-sm text-muted-foreground mt-2">{currentFileName}</p>
              )}
            </div>
          ) : (
            <>
              {/* Active drag state - show when dragging over */}
              <div className={cn(
                'pointer-events-none',
                isDragActive ? 'flex flex-col items-center' : 'hidden'
              )}>
                <UploadCloudIcon className="h-12 w-12 text-primary mb-4" />
                <p className="text-lg font-medium">Drop your CSV file(s) here...</p>
              </div>

              {/* Inactive state - show when not dragging */}
              <div className={cn(
                'pointer-events-none',
                isDragActive ? 'hidden' : 'flex flex-col items-center'
              )}>
                <div className="rounded-full bg-primary/10 p-4 mb-4">
                  <FileTextIcon className="h-8 w-8 text-primary" />
                </div>
                <p className="text-lg font-medium mb-2">
                  Drag and drop CSV files here
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  or click to browse (you can select multiple files)
                </p>
                <div className="rounded-lg bg-muted px-4 py-3 text-left">
                  <p className="text-sm font-medium mb-1">Required columns:</p>
                  <p className="text-sm text-muted-foreground">
                    • Product Name, URL
                  </p>
                  <p className="text-sm font-medium mt-2 mb-1">Optional columns:</p>
                  <p className="text-sm text-muted-foreground">
                    • Category, Price, Description
                  </p>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  Maximum file size: 5MB
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {uploadedFiles.length > 0 && !isUploading && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Uploaded Files ({uploadedFiles.length})
          </p>
          {uploadedFiles.map((fileName) => (
            <div
              key={fileName}
              className="flex items-center justify-between gap-2 rounded-lg border bg-card p-4"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2Icon className="h-5 w-5 text-green-600" />
                <span className="font-medium text-sm">{fileName}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveFile(fileName)}
                className="h-8 w-8 p-0"
                type="button"
                aria-label={`Remove ${fileName}`}
              >
                <XIcon className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CSVUploadComponent;

