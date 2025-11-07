import React, { useState } from 'react';

/**
 * Export Instructions Component
 * Displays instructions for importing CSV into Google Ads Editor
 */
const ExportInstructions: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="export-instructions">
      <button
        className="instructions-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
        type="button"
      >
        {isExpanded ? '▼' : '▶'} How to import into Google Ads Editor
      </button>
      
      {isExpanded && (
        <div className="instructions-content">
          <ol>
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
          
          <div className="instructions-note">
            <p>
              <strong>Note:</strong> The exported CSV file follows the Google Ads Editor format and includes:
            </p>
            <ul>
              <li>Campaign and Ad Group information</li>
              <li>Keywords with match types ([Broad], [Phrase], [Exact])</li>
              <li>Responsive Search Ads with headlines and descriptions</li>
              <li>Final URLs and Display URLs</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportInstructions;

