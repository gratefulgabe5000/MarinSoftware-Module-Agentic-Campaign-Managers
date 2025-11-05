import React from 'react';
import { CampaignPlan } from '../types/ai.types';

/**
 * AudienceSummaryCard Component Props
 */
interface AudienceSummaryCardProps {
  campaignPlan: CampaignPlan;
}

/**
 * AudienceSummaryCard Component
 * Displays target audience summary
 */
const AudienceSummaryCard: React.FC<AudienceSummaryCardProps> = ({
  campaignPlan,
}) => {
  const { targetAudience } = campaignPlan;

  return (
    <div className="audience-summary-card card">
      <div className="card-header">
        <h3>Target Audience</h3>
      </div>
      <div className="card-content">
        {targetAudience.demographics && (
          <div className="audience-section">
            <h4>Demographics</h4>
            <div className="demographics-list">
              {targetAudience.demographics.age && (
                <div className="demographic-item">
                  <label>Age:</label>
                  <span>{targetAudience.demographics.age}</span>
                </div>
              )}
              {targetAudience.demographics.gender && (
                <div className="demographic-item">
                  <label>Gender:</label>
                  <span>{targetAudience.demographics.gender}</span>
                </div>
              )}
              {targetAudience.demographics.location && (
                <div className="demographic-item">
                  <label>Location:</label>
                  <span>{targetAudience.demographics.location}</span>
                </div>
              )}
              {targetAudience.demographics.interests &&
                targetAudience.demographics.interests.length > 0 && (
                  <div className="demographic-item">
                    <label>Interests:</label>
                    <div className="interests-list">
                      {targetAudience.demographics.interests.map((interest, index) => (
                        <span key={index} className="interest-badge">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>
        )}

        {targetAudience.psychographics && (
          <div className="audience-section">
            <h4>Psychographics</h4>
            {targetAudience.psychographics.values &&
              targetAudience.psychographics.values.length > 0 && (
                <div className="psychographic-item">
                  <label>Values:</label>
                  <div className="values-list">
                    {targetAudience.psychographics.values.map((value, index) => (
                      <span key={index} className="value-badge">
                        {value}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            {targetAudience.psychographics.behaviors &&
              targetAudience.psychographics.behaviors.length > 0 && (
                <div className="psychographic-item">
                  <label>Behaviors:</label>
                  <div className="behaviors-list">
                    {targetAudience.psychographics.behaviors.map((behavior, index) => (
                      <span key={index} className="behavior-badge">
                        {behavior}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            {targetAudience.psychographics.painPoints &&
              targetAudience.psychographics.painPoints.length > 0 && (
                <div className="psychographic-item">
                  <label>Pain Points:</label>
                  <ul className="pain-points-list">
                    {targetAudience.psychographics.painPoints.map((painPoint, index) => (
                      <li key={index}>{painPoint}</li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
        )}

        {!targetAudience.demographics && !targetAudience.psychographics && (
          <div className="audience-empty">
            <p>No audience information specified</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudienceSummaryCard;

