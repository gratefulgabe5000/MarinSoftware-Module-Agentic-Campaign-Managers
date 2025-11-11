import React, { useState } from 'react';
import { CampaignPlan } from '../types/ai.types';
import { toastService } from '../utils/toastService';

/**
 * Campaign Plan Editor Props
 */
interface CampaignPlanEditorProps {
  campaignPlan: CampaignPlan;
  onSave: (updatedPlan: CampaignPlan) => void;
  onCancel: () => void;
}

/**
 * Campaign Plan Editor Component
 * Allows editing of campaign plan fields
 */
const CampaignPlanEditor: React.FC<CampaignPlanEditorProps> = ({
  campaignPlan,
  onSave,
  onCancel,
}) => {
  const [editedPlan, setEditedPlan] = useState<CampaignPlan>({ ...campaignPlan });
  const [isSaving, setIsSaving] = useState(false);

  /**
   * Update edited plan field
   */
  const updateField = (field: string, value: any) => {
    setEditedPlan((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /**
   * Update nested field
   */
  const updateNestedField = (path: string[], value: any) => {
    setEditedPlan((prev) => {
      const newPlan = { ...prev };
      let current: any = newPlan;
      
      for (let i = 0; i < path.length - 1; i++) {
        current[path[i]] = { ...current[path[i]] };
        current = current[path[i]];
      }
      
      current[path[path.length - 1]] = value;
      return newPlan;
    });
  };

  /**
   * Handle save
   */
  const handleSave = async () => {
    setIsSaving(true);
    try {
      onSave(editedPlan);
      toastService.success('Campaign plan updated successfully');
    } catch (error) {
      toastService.error(error instanceof Error ? error.message : 'Failed to save campaign plan');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="campaign-plan-editor">
      <div className="editor-header">
        <h3>Edit Campaign Plan</h3>
        <p>Modify the campaign plan details below</p>
      </div>

      <div className="editor-content">
        {/* Objective */}
        <div className="editor-section">
          <label className="editor-label">
            Objective <span className="required">*</span>
          </label>
          <textarea
            className="editor-input"
            value={editedPlan.objective}
            onChange={(e) => updateField('objective', e.target.value)}
            rows={3}
            placeholder="Enter campaign objective"
          />
        </div>

        {/* Budget */}
        <div className="editor-section">
          <label className="editor-label">
            Budget <span className="required">*</span>
          </label>
          <div className="editor-row">
            <div className="editor-field">
              <label>Total Budget</label>
              <input
                type="number"
                className="editor-input"
                value={editedPlan.budget.total}
                onChange={(e) =>
                  updateNestedField(['budget', 'total'], parseFloat(e.target.value) || 0)
                }
                min="0"
                step="0.01"
              />
            </div>
            <div className="editor-field">
              <label>Daily Budget</label>
              <input
                type="number"
                className="editor-input"
                value={editedPlan.budget.daily || ''}
                onChange={(e) =>
                  updateNestedField(
                    ['budget', 'daily'],
                    e.target.value ? parseFloat(e.target.value) : undefined
                  )
                }
                min="0"
                step="0.01"
                placeholder="Auto-calculated"
              />
            </div>
            <div className="editor-field">
              <label>Currency</label>
              <select
                className="editor-input"
                value={editedPlan.budget.currency}
                onChange={(e) => updateNestedField(['budget', 'currency'], e.target.value)}
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="CAD">CAD</option>
                <option value="AUD">AUD</option>
              </select>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="editor-section">
          <label className="editor-label">
            Timeline <span className="required">*</span>
          </label>
          <div className="editor-row">
            <div className="editor-field">
              <label>Start Date</label>
              <input
                type="date"
                className="editor-input"
                value={editedPlan.timeline.startDate}
                onChange={(e) => updateNestedField(['timeline', 'startDate'], e.target.value)}
              />
            </div>
            <div className="editor-field">
              <label>Duration (days)</label>
              <input
                type="number"
                className="editor-input"
                value={editedPlan.timeline.duration}
                onChange={(e) =>
                  updateNestedField(['timeline', 'duration'], parseInt(e.target.value, 10) || 0)
                }
                min="1"
              />
            </div>
            <div className="editor-field">
              <label>End Date</label>
              <input
                type="date"
                className="editor-input"
                value={editedPlan.timeline.endDate || ''}
                onChange={(e) =>
                  updateNestedField(
                    ['timeline', 'endDate'],
                    e.target.value || undefined
                  )
                }
                placeholder="Auto-calculated"
              />
            </div>
          </div>
        </div>

        {/* Platforms */}
        <div className="editor-section">
          <label className="editor-label">
            Platforms <span className="required">*</span>
          </label>
          <div className="editor-checkboxes">
            {['Google Ads', 'Meta', 'Microsoft Ads'].map((platform) => (
              <label key={platform} className="editor-checkbox">
                <input
                  type="checkbox"
                  checked={editedPlan.platforms.includes(platform)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      updateField('platforms', [...editedPlan.platforms, platform]);
                    } else {
                      updateField(
                        'platforms',
                        editedPlan.platforms.filter((p) => p !== platform)
                      );
                    }
                  }}
                />
                <span>{platform}</span>
              </label>
            ))}
          </div>
        </div>

        {/* KPIs */}
        <div className="editor-section">
          <label className="editor-label">
            Key Performance Indicators <span className="required">*</span>
          </label>
          <div className="editor-row">
            <div className="editor-field">
              <label>Primary KPI</label>
              <select
                className="editor-input"
                value={editedPlan.kpis.primary}
                onChange={(e) => updateNestedField(['kpis', 'primary'], e.target.value)}
              >
                <option value="Conversions">Conversions</option>
                <option value="Sign-ups">Sign-ups</option>
                <option value="Sales">Sales</option>
                <option value="Leads">Leads</option>
                <option value="Clicks">Clicks</option>
                <option value="Impressions">Impressions</option>
                <option value="CTR">CTR</option>
                <option value="CPA">CPA</option>
                <option value="ROAS">ROAS</option>
              </select>
            </div>
            <div className="editor-field">
              <label>Secondary KPIs (comma-separated)</label>
              <input
                type="text"
                className="editor-input"
                value={editedPlan.kpis.secondary?.join(', ') || ''}
                onChange={(e) =>
                  updateNestedField(
                    ['kpis', 'secondary'],
                    e.target.value
                      .split(',')
                      .map((s) => s.trim())
                      .filter((s) => s.length > 0)
                  )
                }
                placeholder="CTR, CPA, ROAS"
              />
            </div>
          </div>
        </div>

        {/* Target Audience */}
        <div className="editor-section">
          <label className="editor-label">Target Audience</label>
          <div className="editor-row">
            <div className="editor-field">
              <label>Age Range</label>
              <input
                type="text"
                className="editor-input"
                value={
                  editedPlan.targetAudience.demographics?.age || ''
                }
                onChange={(e) =>
                  updateNestedField(
                    ['targetAudience', 'demographics', 'age'],
                    e.target.value || undefined
                  )
                }
                placeholder="25-45"
              />
            </div>
            <div className="editor-field">
              <label>Location</label>
              <input
                type="text"
                className="editor-input"
                value={
                  editedPlan.targetAudience.demographics?.location || ''
                }
                onChange={(e) =>
                  updateNestedField(
                    ['targetAudience', 'demographics', 'location'],
                    e.target.value || undefined
                  )
                }
                placeholder="US"
              />
            </div>
          </div>
          <div className="editor-field">
            <label>Interests (comma-separated)</label>
            <input
              type="text"
              className="editor-input"
              value={
                editedPlan.targetAudience.demographics?.interests?.join(', ') || ''
              }
              onChange={(e) =>
                updateNestedField(
                  ['targetAudience', 'demographics', 'interests'],
                  e.target.value
                    .split(',')
                    .map((s) => s.trim())
                    .filter((s) => s.length > 0)
                )
              }
              placeholder="technology, software"
            />
          </div>
        </div>
      </div>

      <div className="editor-actions">
        <button
          className="btn btn-secondary"
          onClick={onCancel}
          type="button"
          disabled={isSaving}
        >
          Cancel
        </button>
        <button
          className="btn btn-primary"
          onClick={handleSave}
          type="button"
          disabled={isSaving || !editedPlan.objective || editedPlan.budget.total <= 0}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default CampaignPlanEditor;

