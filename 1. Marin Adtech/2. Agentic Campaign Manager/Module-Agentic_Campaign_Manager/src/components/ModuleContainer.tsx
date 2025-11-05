import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CampaignDashboard from './CampaignDashboard';
import CampaignCreation from './CampaignCreation';
import CampaignPreview from './CampaignPreview';
import CampaignDetail from './CampaignDetail';
import PerformanceDashboard from './PerformanceDashboard';
import CSVUploadScreen from './csv-upload/CSVUploadScreen';
import PatternLearningScreen from './pattern-learning/PatternLearningScreen';
import CampaignGenerationScreen from './campaign-generation/CampaignGenerationScreen';

/**
 * Module Container Component
 * Wraps the module routes and provides navigation structure
 */
const ModuleContainer: React.FC = () => {
  return (
    <div className="module-container">
      <Routes>
        <Route path="/" element={<CampaignDashboard />} />
        <Route path="/create" element={<CampaignCreation />} />
        <Route path="/preview" element={<CampaignPreview />} />
        <Route path="/campaigns/csv-upload" element={<CSVUploadScreen />} />
        <Route path="/campaigns/pattern-learning" element={<PatternLearningScreen />} />
        <Route path="/campaigns/generate" element={<CampaignGenerationScreen />} />
        <Route path="/campaign/:id" element={<CampaignDetail />} />
        <Route path="/campaign/:id/performance" element={<PerformanceDashboard />} />
      </Routes>
    </div>
  );
};

export default ModuleContainer;

