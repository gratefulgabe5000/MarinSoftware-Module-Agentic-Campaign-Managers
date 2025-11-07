import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCampaignPatterns } from '../../hooks/useCampaignPatterns';
import PatternViewer from './PatternViewer';
import LoadingSpinner from '../LoadingSpinner';

/**
 * Pattern Learning Screen Component
 * Main screen for learning patterns from existing campaigns
 */
const PatternLearningScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [accountId] = useState<string>('mock-account-id'); // For MVP, use mock
  const [skipPatternLearning, setSkipPatternLearning] = useState(false);

  // Get products from previous step (passed via location state)
  const products = location.state?.products || [];

  const {
    patterns,
    loading,
    error,
    isMockData,
    fetchPatterns,
    refresh,
  } = useCampaignPatterns(accountId, {
    autoFetch: true,
  });

  const handleContinue = () => {
    // Navigate to generation screen with products and patterns
    navigate('/campaigns/generate', {
      state: {
        products,
        patterns: patterns || undefined,
      },
    });
  };

  const handleSkip = () => {
    // Navigate to generation with default patterns
    navigate('/campaigns/generate', {
      state: {
        products,
        patterns: undefined, // Use defaults
      },
    });
  };

  if (loading) {
    return (
      <div className="pattern-learning-screen">
        <div className="pattern-learning-header">
          <h1>Learning from Your Campaigns</h1>
        </div>
        <div className="pattern-learning-loading">
          <LoadingSpinner />
          <div className="loading-messages">
            <p>Querying existing campaigns...</p>
            <p>Extracting patterns...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pattern-learning-screen">
        <div className="pattern-learning-header">
          <h1>Pattern Learning</h1>
        </div>
        <div className="pattern-learning-error">
          <h3>Error Loading Patterns</h3>
          <p>{error}</p>
          <div className="error-actions">
            <button
              className="btn btn-secondary"
              onClick={refresh}
              type="button"
            >
              Retry
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSkip}
              type="button"
            >
              Skip & Use Defaults
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (skipPatternLearning || !patterns) {
    return (
      <div className="pattern-learning-screen">
        <div className="pattern-learning-header">
          <h1>Pattern Learning</h1>
          <p>Using default patterns for campaign generation</p>
        </div>
        <div className="pattern-learning-skipped">
          <p>You can proceed with default patterns or go back to learn from your campaigns.</p>
          <div className="pattern-learning-actions">
            <button
              className="btn btn-secondary"
              onClick={() => {
                setSkipPatternLearning(false);
                fetchPatterns();
              }}
              type="button"
            >
              Learn from Campaigns
            </button>
            <button
              className="btn btn-primary"
              onClick={handleContinue}
              type="button"
            >
              Continue with Defaults
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pattern-learning-screen">
      <div className="pattern-learning-header">
        <h1>Pattern Learning</h1>
        <p>We've analyzed your existing campaigns and extracted these patterns</p>
      </div>

      <PatternViewer patterns={patterns} isMockData={isMockData} onContinue={handleContinue} />

      <div className="pattern-learning-footer">
        <button
          className="btn btn-secondary"
          onClick={() => navigate('/campaigns/csv-upload')}
          type="button"
        >
          Back
        </button>
        <button
          className="btn btn-secondary"
          onClick={handleSkip}
          type="button"
        >
          Skip & Use Defaults
        </button>
      </div>
    </div>
  );
};

export default PatternLearningScreen;

