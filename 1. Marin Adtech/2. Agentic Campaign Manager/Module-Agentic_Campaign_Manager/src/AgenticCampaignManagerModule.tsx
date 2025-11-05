import React, { useEffect, useState } from 'react';
import { ADEContext, ADEEvent } from './types/ade.types';
import ModuleContainer from './components/ModuleContainer';

/**
 * Agentic Campaign Manager Module Props
 */
interface AgenticCampaignManagerModuleProps {
  context?: ADEContext;
  isActive?: boolean;
  onActivate?: () => void;
  onDeactivate?: () => void;
}

/**
 * Agentic Campaign Manager Module
 * Main entry point component for the module
 */
const AgenticCampaignManagerModule: React.FC<AgenticCampaignManagerModuleProps> = ({
  context,
  isActive = false,
  onActivate,
  onDeactivate,
}) => {
  const [isInitialized, setIsInitialized] = useState(false);

  // Module initialization
  useEffect(() => {
    if (context && !isInitialized) {
      initializeModule(context);
    }
  }, [context, isInitialized]);

  // Module activation/deactivation
  useEffect(() => {
    if (isActive) {
      activateModule();
    } else {
      deactivateModule();
    }
  }, [isActive]);

  /**
   * Initialize module with ADE context
   */
  const initializeModule = async (adeContext: ADEContext) => {
    try {
      // Subscribe to ADE-wide events
      adeContext.eventBus.on('user:logout', handleUserLogout);
      adeContext.eventBus.on('theme:change', handleThemeChange);
      
      // Initialize module services
      await initializeServices(adeContext);
      
      setIsInitialized(true);
      
      // Emit module initialized event
      adeContext.eventBus.emit({
        type: 'module:initialized',
        payload: { moduleId: 'agentic-campaign-manager' },
        timestamp: new Date(),
        source: 'agentic-campaign-manager',
      });
    } catch (error) {
      console.error('Failed to initialize module:', error);
    }
  };

  /**
   * Initialize module services
   */
  const initializeServices = async (adeContext: ADEContext) => {
    // Initialize module-specific services
    // - Performance polling services
    // - Campaign status monitoring
    // - Analytics tracking
    // - Storage synchronization
    
    // Emit initialization event
    adeContext.analytics.track('module_initialized', {
      moduleId: 'agentic-campaign-manager',
      version: '1.0.0',
    });
  };

  /**
   * Activate module
   */
  const activateModule = async () => {
    try {
      // Start background services
      startBackgroundServices();
      
      if (onActivate) {
        onActivate();
      }
      
      if (context) {
        context.eventBus.emit({
          type: 'module:activated',
          payload: { moduleId: 'agentic-campaign-manager' },
          timestamp: new Date(),
          source: 'agentic-campaign-manager',
        });
      }
    } catch (error) {
      console.error('Failed to activate module:', error);
    }
  };

  /**
   * Deactivate module
   */
  const deactivateModule = async () => {
    try {
      // Stop background services
      stopBackgroundServices();
      
      if (onDeactivate) {
        onDeactivate();
      }
      
      if (context) {
        context.eventBus.emit({
          type: 'module:deactivated',
          payload: { moduleId: 'agentic-campaign-manager' },
          timestamp: new Date(),
          source: 'agentic-campaign-manager',
        });
      }
    } catch (error) {
      console.error('Failed to deactivate module:', error);
    }
  };

  /**
   * Start background services
   */
  const startBackgroundServices = () => {
    // Start background services:
    // - Performance data polling
    // - Campaign status monitoring
    // - Cache cleanup
    // - Analytics heartbeat
    
    // Track activation
    if (context) {
      context.analytics.track('module_activated', {
        moduleId: 'agentic-campaign-manager',
      });
    }
  };

  /**
   * Stop background services
   */
  const stopBackgroundServices = () => {
    // Stop background services:
    // - Clear polling intervals
    // - Close WebSocket connections
    // - Cancel pending requests
    
    // Track deactivation
    if (context) {
      context.analytics.track('module_deactivated', {
        moduleId: 'agentic-campaign-manager',
      });
    }
  };

  /**
   * Handle user logout event from ADE
   */
  const handleUserLogout = (_event: ADEEvent) => {
    // Clean up module state on logout
    stopBackgroundServices();
    
    // Clear sensitive data
    // - Clear OAuth tokens
    // - Clear campaign data (if needed)
    // - Reset module state
    
    // Track logout
    if (context) {
      context.analytics.track('module_logout', {
        moduleId: 'agentic-campaign-manager',
      });
    }
  };

  /**
   * Handle theme change event from ADE
   */
  const handleThemeChange = (event: ADEEvent) => {
    // Update module UI to match new theme
    const newTheme = event.payload?.theme || 'light';
    
    // Apply theme to module
    document.documentElement.setAttribute('data-theme', newTheme);
    
    // Track theme change
    if (context) {
      context.analytics.track('module_theme_changed', {
        moduleId: 'agentic-campaign-manager',
        theme: newTheme,
      });
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (context) {
        context.eventBus.off('user:logout', handleUserLogout);
        context.eventBus.off('theme:change', handleThemeChange);
      }
      stopBackgroundServices();
    };
  }, [context]);

  if (!isInitialized && context) {
    return <div>Initializing module...</div>;
  }

  return (
    <div className="agentic-campaign-manager-module">
      <ModuleContainer />
    </div>
  );
};

export default AgenticCampaignManagerModule;

