import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AgenticCampaignManagerModule from '../../AgenticCampaignManagerModule';
import { ADEContext } from '../../types/ade.types';

// Mock ADE context
const createMockContext = (): ADEContext => ({
  eventBus: {
    emit: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
  },
  storage: {
    get: jest.fn(),
    set: jest.fn(),
    remove: jest.fn(),
    clear: jest.fn(),
  },
  analytics: {
    track: jest.fn(),
    page: jest.fn(),
  },
  auth: {
    getUser: jest.fn(),
    isAuthenticated: jest.fn(),
    logout: jest.fn(),
  },
  router: {
    navigate: jest.fn(),
    currentPath: jest.fn(() => '/'),
    goBack: jest.fn(),
    goForward: jest.fn(),
  },
  theme: {
    getTheme: jest.fn(() => 'light'),
    setTheme: jest.fn(),
    onThemeChange: jest.fn(),
  },
  modules: {
    getModule: jest.fn(),
    getAllModules: jest.fn(() => []),
    registerModule: jest.fn(),
    unregisterModule: jest.fn(),
  },
  globalState: {},
});

describe('AgenticCampaignManagerModule', () => {
  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <AgenticCampaignManagerModule />
      </BrowserRouter>
    );
  });

  it('displays initialization message when context is provided but not initialized', async () => {
    const mockContext = createMockContext();
    
    await act(async () => {
      render(
        <BrowserRouter>
          <AgenticCampaignManagerModule context={mockContext} isActive={false} />
        </BrowserRouter>
      );
    });
    
    // Wait for initialization to complete
    await waitFor(() => {
      expect(screen.getByText(/Campaign Dashboard/i)).toBeInTheDocument();
    });
  });

  it('subscribes to ADE events when context is provided', async () => {
    const mockContext = createMockContext();
    
    await act(async () => {
      render(
        <BrowserRouter>
          <AgenticCampaignManagerModule context={mockContext} isActive={true} />
        </BrowserRouter>
      );
    });

    // Wait for initialization
    await waitFor(() => {
      // Verify event bus subscriptions
      expect(mockContext.eventBus.on).toHaveBeenCalledWith('user:logout', expect.any(Function));
      expect(mockContext.eventBus.on).toHaveBeenCalledWith('theme:change', expect.any(Function));
    });
  });

  it('handles activation correctly', async () => {
    const mockContext = createMockContext();
    const onActivate = jest.fn();
    
    await act(async () => {
      render(
        <BrowserRouter>
          <AgenticCampaignManagerModule 
            context={mockContext} 
            isActive={true}
            onActivate={onActivate}
          />
        </BrowserRouter>
      );
    });

    // Wait for activation
    await waitFor(() => {
      // Module should be activated
      expect(mockContext.eventBus.emit).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'module:activated',
          payload: expect.objectContaining({ moduleId: 'agentic-campaign-manager' }),
        })
      );
    });
  });

  it('handles deactivation correctly', async () => {
    const mockContext = createMockContext();
    const onDeactivate = jest.fn();
    
    let rerender: any;
    
    await act(async () => {
      const result = render(
        <BrowserRouter>
          <AgenticCampaignManagerModule 
            context={mockContext} 
            isActive={true}
            onDeactivate={onDeactivate}
          />
        </BrowserRouter>
      );
      rerender = result.rerender;
    });

    // Deactivate module
    await act(async () => {
      rerender(
        <BrowserRouter>
          <AgenticCampaignManagerModule 
            context={mockContext} 
            isActive={false}
            onDeactivate={onDeactivate}
          />
        </BrowserRouter>
      );
    });

    // Wait for deactivation
    await waitFor(() => {
      // Module should be deactivated
      expect(mockContext.eventBus.emit).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'module:deactivated',
          payload: expect.objectContaining({ moduleId: 'agentic-campaign-manager' }),
        })
      );
    });
  });

  it('cleans up event listeners on unmount', async () => {
    const mockContext = createMockContext();
    let unmount: any;
    
    await act(async () => {
      const result = render(
        <BrowserRouter>
          <AgenticCampaignManagerModule context={mockContext} isActive={true} />
        </BrowserRouter>
      );
      unmount = result.unmount;
    });

    await act(async () => {
      unmount();
    });

    // Verify cleanup
    await waitFor(() => {
      expect(mockContext.eventBus.off).toHaveBeenCalledWith('user:logout', expect.any(Function));
      expect(mockContext.eventBus.off).toHaveBeenCalledWith('theme:change', expect.any(Function));
    });
  });
});

