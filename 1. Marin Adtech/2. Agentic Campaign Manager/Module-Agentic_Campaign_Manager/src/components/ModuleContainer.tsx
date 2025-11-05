import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CampaignDashboard from './CampaignDashboard';
import CampaignCreation from './CampaignCreation';
import CampaignPreview from './CampaignPreview';
import CampaignDetail from './CampaignDetail';

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
        <Route path="/campaign/:id" element={<CampaignDetail />} />
      </Routes>
    </div>
  );
};

export default ModuleContainer;

