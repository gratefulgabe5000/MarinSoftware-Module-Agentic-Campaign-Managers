import React from 'react';
import { CampaignPatterns } from '../../types/campaign-patterns.types';

/**
 * Pattern Viewer Component Props
 */
interface PatternViewerProps {
  patterns: CampaignPatterns;
  onContinue?: () => void;
}

/**
 * Pattern Viewer Component
 * Displays extracted campaign patterns
 */
const PatternViewer: React.FC<PatternViewerProps> = ({
  patterns,
  onContinue,
}) => {
  return (
    <div className="pattern-viewer">
      <div className="pattern-viewer-header">
        <h2>Extracted Campaign Patterns</h2>
        <p>These patterns were learned from your existing campaigns</p>
      </div>

      <div className="pattern-sections">
        {/* Ad Group Structures */}
        <div className="pattern-section">
          <h3>Ad Group Structures</h3>
          <div className="pattern-content">
            <div className="pattern-item">
              <label>Naming Convention:</label>
              <span className="pattern-value">
                {patterns.adGroupStructures.namingConvention}
              </span>
            </div>
            <div className="pattern-item">
              <label>Common Themes:</label>
              <div className="pattern-tags">
                {patterns.adGroupStructures.themes.map((theme, index) => (
                  <span key={index} className="tag">
                    {theme}
                  </span>
                ))}
              </div>
            </div>
            <div className="pattern-item">
              <label>Average Keywords per Group:</label>
              <span className="pattern-value">
                {patterns.adGroupStructures.averageKeywordsPerGroup}
              </span>
            </div>
          </div>
        </div>

        {/* High Performing Keywords */}
        <div className="pattern-section">
          <h3>High Performing Keywords (Top 20)</h3>
          <div className="pattern-content">
            {patterns.highPerformingKeywords.length > 0 ? (
              <div className="keywords-table">
                <table>
                  <thead>
                    <tr>
                      <th>Keyword</th>
                      <th>Match Type</th>
                      <th>CTR</th>
                      <th>Conversions</th>
                      {patterns.highPerformingKeywords[0]?.roas && (
                        <th>ROAS</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {patterns.highPerformingKeywords.slice(0, 20).map((kw, index) => (
                      <tr key={index}>
                        <td>{kw.keyword}</td>
                        <td>{kw.matchType}</td>
                        <td>{kw.ctr.toFixed(2)}%</td>
                        <td>{kw.conversions}</td>
                        {kw.roas && <td>{kw.roas.toFixed(2)}x</td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="no-data">No high-performing keywords found</p>
            )}
          </div>
        </div>

        {/* Ad Copy Patterns */}
        <div className="pattern-section">
          <h3>Ad Copy Patterns</h3>
          <div className="pattern-content">
            <div className="pattern-item">
              <label>Headline Templates ({patterns.adCopyPatterns.headlineTemplates.length}):</label>
              <div className="pattern-list">
                {patterns.adCopyPatterns.headlineTemplates.slice(0, 5).map(
                  (template, index) => (
                    <div key={index} className="pattern-example">
                      {template}
                    </div>
                  )
                )}
              </div>
            </div>
            <div className="pattern-item">
              <label>Description Templates ({patterns.adCopyPatterns.descriptionTemplates.length}):</label>
              <div className="pattern-list">
                {patterns.adCopyPatterns.descriptionTemplates.slice(0, 3).map(
                  (template, index) => (
                    <div key={index} className="pattern-example">
                      {template}
                    </div>
                  )
                )}
              </div>
            </div>
            <div className="pattern-item">
              <label>Common CTAs:</label>
              <div className="pattern-tags">
                {patterns.adCopyPatterns.commonCTAs.map((cta, index) => (
                  <span key={index} className="tag">
                    {cta}
                  </span>
                ))}
              </div>
            </div>
            <div className="pattern-item">
              <label>Average Headlines per Ad:</label>
              <span className="pattern-value">
                {patterns.adCopyPatterns.averageHeadlinesPerAd}
              </span>
            </div>
            <div className="pattern-item">
              <label>Average Descriptions per Ad:</label>
              <span className="pattern-value">
                {patterns.adCopyPatterns.averageDescriptionsPerAd}
              </span>
            </div>
          </div>
        </div>

        {/* Bidding Patterns */}
        <div className="pattern-section">
          <h3>Bidding Patterns</h3>
          <div className="pattern-content">
            <div className="pattern-item">
              <label>Average CPC:</label>
              <span className="pattern-value">
                ${patterns.biddingPatterns.averageCPC.toFixed(2)}
              </span>
            </div>
            <div className="pattern-item">
              <label>Bid Strategy:</label>
              <span className="pattern-value">
                {patterns.biddingPatterns.bidStrategy}
              </span>
            </div>
            {patterns.biddingPatterns.averageCPM && (
              <div className="pattern-item">
                <label>Average CPM:</label>
                <span className="pattern-value">
                  ${patterns.biddingPatterns.averageCPM.toFixed(2)}
                </span>
              </div>
            )}
            {patterns.biddingPatterns.averageCPA && (
              <div className="pattern-item">
                <label>Average CPA:</label>
                <span className="pattern-value">
                  ${patterns.biddingPatterns.averageCPA.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {onContinue && (
        <div className="pattern-viewer-footer">
          <button
            className="btn btn-primary"
            onClick={onContinue}
            type="button"
          >
            Continue to Generation
          </button>
        </div>
      )}
    </div>
  );
};

export default PatternViewer;

