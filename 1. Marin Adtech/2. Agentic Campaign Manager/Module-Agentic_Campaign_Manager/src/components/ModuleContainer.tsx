import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CampaignDashboard from './CampaignDashboard';
import CampaignCreation from './CampaignCreation';
import CampaignPreview from './CampaignPreview';
import CampaignDetail from './CampaignDetail';
import PerformanceDashboard from './PerformanceDashboard';
<<<<<<< HEAD
import CSVUploadScreen from './csv-upload/CSVUploadScreen';
import PatternLearningScreen from './pattern-learning/PatternLearningScreen';
import CampaignGenerationScreen from './campaign-generation/CampaignGenerationScreen';
=======
>>>>>>> c75a29246aa4d3b02efa0ae3553d6040d682d314

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
<<<<<<< HEAD
        <Route path="/campaigns/csv-upload" element={<CSVUploadScreen />} />
        <Route path="/campaigns/pattern-learning" element={<PatternLearningScreen />} />
        <Route path="/campaigns/generate" element={<CampaignGenerationScreen />} />
=======
>>>>>>> c75a29246aa4d3b02efa0ae3553d6040d682d314
        <Route path="/campaign/:id" element={<CampaignDetail />} />
        <Route path="/campaign/:id/performance" element={<PerformanceDashboard />} />
      </Routes>
    </div>
  );
};

export default ModuleContainer;

