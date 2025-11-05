import React from 'react';
import { CampaignPlan } from '../types/ai.types';

/**
 * CampaignOverviewCard Component Props
 */
interface CampaignOverviewCardProps {
  campaignPlan: CampaignPlan;
}

/**
 * CampaignOverviewCard Component
 * Displays campaign overview information
 */
const CampaignOverviewCard: React.FC<CampaignOverviewCardProps> = ({
  campaignPlan,
}) => {
  return (
    <div className="campaign-overview-card card">
      <div className="card-header">
        <h3>Campaign Overview</h3>
      </div>
      <div className="card-content">
        <div className="overview-section">
          <label>Objective</label>
          <p className="objective-text">{campaignPlan.objective}</p>
        </div>

        <div className="overview-section">
          <label>Timeline</label>
          <div className="timeline-info">
            <span className="timeline-item">
              <strong>Start:</strong> {new Date(campaignPlan.timeline.startDate).toLocaleDateString()}
            </span>
            {campaignPlan.timeline.endDate && (
              <span className="timeline-item">
                <strong>End:</strong> {new Date(campaignPlan.timeline.endDate).toLocaleDateString()}
              </span>
            )}
            <span className="timeline-item">
              <strong>Duration:</strong> {campaignPlan.timeline.duration} days
            </span>
          </div>
        </div>

        <div className="overview-section">
          <label>Platforms</label>
          <div className="platforms-list">
            {campaignPlan.platforms.map((platform, index) => (
              <span key={index} className="platform-badge">
                {platform}
              </span>
            ))}
          </div>
        </div>

        <div className="overview-section">
          <label>Primary KPI</label>
          <p className="kpi-text">
            <strong>{campaignPlan.kpis.primary}</strong>
            {campaignPlan.kpis.secondary && campaignPlan.kpis.secondary.length > 0 && (
              <span className="secondary-kpis">
                {' '}(Secondary: {campaignPlan.kpis.secondary.join(', ')})
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CampaignOverviewCard;

