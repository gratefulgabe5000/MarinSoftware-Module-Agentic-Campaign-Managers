import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AgenticCampaignManagerModule from './AgenticCampaignManagerModule';
import ErrorBoundary from './components/ErrorBoundary';
import ToastContainer from './components/ToastContainer';

/**
 * Main App Component
 * For standalone development, this wraps the module
 * In production, this will be integrated into the ADE framework
 */
const App: React.FC = () => {
  // Mock ADE context for standalone development
  // In production, this will be provided by the ADE framework
  const mockContext = undefined;

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <div className="app">
          <AgenticCampaignManagerModule 
            context={mockContext}
            isActive={true}
          />
          <ToastContainer />
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;

