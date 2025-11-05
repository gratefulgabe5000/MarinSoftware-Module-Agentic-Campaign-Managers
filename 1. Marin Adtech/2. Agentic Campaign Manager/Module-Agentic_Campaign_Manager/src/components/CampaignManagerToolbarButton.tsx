import React from 'react';

/**
 * Campaign Manager Toolbar Button Props
 */
interface CampaignManagerToolbarButtonProps {
  isActive?: boolean;
  onClick?: () => void;
  badgeCount?: number;
}

/**
 * Campaign Manager Toolbar Button Component
 * Toolbar button for activating the Campaign Manager module
 */
const CampaignManagerToolbarButton: React.FC<CampaignManagerToolbarButtonProps> = ({
  isActive = false,
  onClick,
  badgeCount,
}) => {
  return (
    <button
      className={`toolbar-button campaign-manager-button ${isActive ? 'active' : ''}`}
      onClick={onClick}
      type="button"
      title="Open Campaign Manager"
      aria-label="Open Campaign Manager"
    >
      <span className="button-icon">📊</span>
      <span className="button-label">Campaign Manager</span>
      {badgeCount !== undefined && badgeCount > 0 && (
        <span className="button-badge" aria-label={`${badgeCount} notifications`}>
          {badgeCount > 99 ? '99+' : badgeCount}
        </span>
      )}
    </button>
  );
};

export default CampaignManagerToolbarButton;

