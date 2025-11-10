import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CampaignPreview from '../CampaignPreview';
import { useCampaignStore } from '../../store/campaignStore';

// Mock campaign service to avoid import.meta issues
jest.mock('../../services/campaignService', () => ({
  campaignService: {
    createCampaign: jest.fn(),
    getCampaign: jest.fn(),
    getAllCampaigns: jest.fn(),
  },
}));

// Mock campaign store
jest.mock('../../store/campaignStore', () => ({
  useCampaignStore: jest.fn(),
}));

describe('CampaignPreview', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    (useCampaignStore as jest.Mock).mockImplementation((selector) => {
      const state = {
        currentCampaignPlan: null,
        isLoading: false,
        error: null,
      };
      return selector(state);
    });

    render(
      <BrowserRouter>
        <CampaignPreview />
      </BrowserRouter>
    );
  });

  it('displays empty state when no campaign plan', () => {
    (useCampaignStore as jest.Mock).mockImplementation((selector) => {
      const state = {
        currentCampaignPlan: null,
        isLoading: false,
        error: null,
      };
      return selector(state);
    });

    render(
      <BrowserRouter>
        <CampaignPreview />
      </BrowserRouter>
    );

    expect(screen.getByText(/No Campaign Plan/i)).toBeInTheDocument();
  });

  it('displays error state when error exists', () => {
    (useCampaignStore as jest.Mock).mockImplementation((selector) => {
      const state = {
        currentCampaignPlan: null,
        isLoading: false,
        error: 'Test error',
      };
      return selector(state);
    });

    render(
      <BrowserRouter>
        <CampaignPreview />
      </BrowserRouter>
    );

    expect(screen.getByText(/Test error/i)).toBeInTheDocument();
  });
});

