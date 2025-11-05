import React, { useState } from 'react';
import { CampaignPlan } from '../types/ai.types';

/**
 * AdGroupStructureTree Component Props
 */
interface AdGroupStructureTreeProps {
  campaignPlan: CampaignPlan;
}

/**
 * AdGroupStructureTree Component
 * Displays ad group structure in a tree view
 */
const AdGroupStructureTree: React.FC<AdGroupStructureTreeProps> = ({
  campaignPlan,
}) => {
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());

  const toggleGroup = (index: number) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  if (!campaignPlan.adGroups || campaignPlan.adGroups.length === 0) {
    return (
      <div className="ad-group-structure-tree card">
        <div className="card-header">
          <h3>Ad Group Structure</h3>
        </div>
        <div className="card-content">
          <div className="empty-state">
            <p>No ad groups defined yet. They will be created during campaign setup.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ad-group-structure-tree card">
      <div className="card-header">
        <h3>Ad Group Structure</h3>
        <span className="ad-group-count">{campaignPlan.adGroups.length} ad groups</span>
      </div>
      <div className="card-content">
        <div className="ad-group-tree">
          {campaignPlan.adGroups.map((adGroup, index) => {
            const isExpanded = expandedGroups.has(index);
            return (
              <div key={index} className="ad-group-item">
                <div
                  className="ad-group-header"
                  onClick={() => toggleGroup(index)}
                >
                  <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
                  <span className="ad-group-name">{adGroup.name}</span>
                  <span className="ad-group-budget">
                    {campaignPlan.budget.currency} {adGroup.budget.toLocaleString()}
                  </span>
                </div>
                {isExpanded && (
                  <div className="ad-group-details">
                    <div className="ad-group-detail-item">
                      <label>Objective:</label>
                      <span>{adGroup.objective}</span>
                    </div>
                    {adGroup.targeting && (
                      <>
                        {adGroup.targeting.interests &&
                          adGroup.targeting.interests.length > 0 && (
                            <div className="ad-group-detail-item">
                              <label>Interests:</label>
                              <div className="interests-tags">
                                {adGroup.targeting.interests.map((interest, i) => (
                                  <span key={i} className="interest-tag">
                                    {interest}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        {adGroup.targeting.behaviors &&
                          adGroup.targeting.behaviors.length > 0 && (
                            <div className="ad-group-detail-item">
                              <label>Behaviors:</label>
                              <div className="behaviors-tags">
                                {adGroup.targeting.behaviors.map((behavior, i) => (
                                  <span key={i} className="behavior-tag">
                                    {behavior}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                      </>
                    )}
                    {adGroup.adFormats && adGroup.adFormats.length > 0 && (
                      <div className="ad-group-detail-item">
                        <label>Ad Formats:</label>
                        <div className="ad-formats-tags">
                          {adGroup.adFormats.map((format, i) => (
                            <span key={i} className="ad-format-tag">
                              {format}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdGroupStructureTree;

