import React from 'react';
import { TimeRange, TimeRangeConfig } from '../types/performance.types';

/**
 * Time Range Selector Props
 */
interface TimeRangeSelectorProps {
  selectedRange: TimeRangeConfig;
  onRangeChange: (range: TimeRangeConfig) => void;
  showCustom?: boolean;
}

/**
 * Time Range Selector Component
 * Allows users to select time range for performance data
 */
const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
  selectedRange,
  onRangeChange,
  showCustom = false,
}) => {
  const timeRangeOptions: Array<{ value: TimeRange; label: string }> = [
    { value: 'today', label: 'Today' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
  ];

  if (showCustom) {
    timeRangeOptions.push({ value: 'custom', label: 'Custom Range' });
  }

  const handleRangeSelect = (range: TimeRange) => {
    if (range === 'custom') {
      // For MVP, we'll use a default custom range
      // In production, this would open a date picker
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 30);
      onRangeChange({
        type: 'custom',
        start,
        end,
      });
    } else {
      onRangeChange({ type: range });
    }
  };

  return (
    <div className="time-range-selector">
      <label className="time-range-label">Time Range:</label>
      <div className="time-range-buttons">
        {timeRangeOptions.map((option) => (
          <button
            key={option.value}
            className={`time-range-button ${
              selectedRange.type === option.value ? 'active' : ''
            }`}
            onClick={() => handleRangeSelect(option.value)}
            type="button"
          >
            {option.label}
          </button>
        ))}
      </div>
      {selectedRange.type === 'custom' && selectedRange.start && selectedRange.end && (
        <div className="custom-range-display">
          <span className="custom-range-text">
            {selectedRange.start.toLocaleDateString()} -{' '}
            {selectedRange.end.toLocaleDateString()}
          </span>
        </div>
      )}
    </div>
  );
};

export default TimeRangeSelector;

