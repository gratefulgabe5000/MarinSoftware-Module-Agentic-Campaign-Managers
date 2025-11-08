import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { ChevronDownIcon, InfoIcon } from 'lucide-react';
import { Label } from '../ui/label';

/**
 * Export Instructions Component
 * Displays instructions for importing CSV into Google Ads Editor
 */
const ExportInstructions: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="flex-1 space-y-4">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            type="button"
            className="w-full justify-between"
          >
            <span className="font-medium">How to import into Google Ads Editor</span>
            <ChevronDownIcon
              className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            />
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-4">
          <ol className="space-y-3 list-decimal list-inside text-sm">
            <li>
              <strong>Download the CSV file</strong> by clicking the "Export to Google Ads Editor" button
            </li>
            <li>
              <strong>Open Google Ads Editor</strong> on your computer
            </li>
            <li>
              <strong>Sign in</strong> to your Google Ads account
            </li>
            <li>
              <strong>Go to File → Import</strong> (or press Ctrl+I / Cmd+I)
            </li>
            <li>
              <strong>Select the downloaded CSV file</strong>
            </li>
            <li>
              <strong>Review the import preview</strong> to ensure all data is correct
            </li>
            <li>
              <strong>Click "Post"</strong> to upload the campaigns to your Google Ads account
            </li>
          </ol>
        </CollapsibleContent>
      </Collapsible>

      <div className="space-y-3">
        <div className="flex items-start gap-2">
          <InfoIcon className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div className="space-y-2">
            <Label className="text-sm font-medium">CSV Format Details</Label>
            <p className="text-sm text-muted-foreground">
              The exported CSV file follows the Google Ads Editor format and includes:
            </p>
          </div>
        </div>
        <ul className="space-y-1 list-disc list-inside text-sm text-muted-foreground ml-6">
          <li>Campaign and Ad Group information</li>
          <li>Keywords with match types ([Broad], [Phrase], [Exact])</li>
          <li>Responsive Search Ads with headlines and descriptions</li>
          <li>Final URLs and Display URLs</li>
        </ul>
      </div>
    </div>
  );
};

export default ExportInstructions;

