import React from 'react';
import { render, screen, waitFor, findByText } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import CampaignDetail from '../CampaignDetail';
import { useCampaignStore } from '../../store/campaignStore';
import { campaignService } from '../../services/campaignService';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
  useNavigate: jest.fn(() => jest.fn()),
}));

// Mock campaign store
jest.mock('../../store/campaignStore', () => ({
  useCampaignStore: jest.fn(),
}));

// Mock campaign service
jest.mock('../../services/campaignService', () => ({
  campaignService: {
    getCampaign: jest.fn(),
  },
}));

// Mock campaign status component
jest.mock('../CampaignStatus', () => {
  return function MockCampaignStatus(props: any) {
    return <div data-testid="campaign-status">Campaign Status</div>;
  };
});

// Mock campaign actions component
jest.mock('../CampaignActions', () => {
  return function MockCampaignActions(props: any) {
    return <div data-testid="campaign-actions">Campaign Actions</div>;
  };
});

describe('CampaignDetail', () => {
  const mockCampaign = {
    id: 'campaign-123',
    name: 'Test Campaign',
    description: 'Test description',
    campaignPlan: {
      objective: 'Test objective',
      targetAudience: {},
      budget: { total: 1000, currency: 'USD' },
      timeline: { startDate: '2025-01-01', duration: 30 },
      platforms: ['Google Ads'],
      kpis: { primary: 'Conversions' },
  },
    status: 'active' as const,
    platformCampaignIds: {
      googleAds: 'google-123',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Create stable mock functions
  const mockGetCampaignById = jest.fn().mockReturnValue(null);
  const mockStoreState = {
    getCampaignById: mockGetCampaignById,
    currentCampaign: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCampaignById.mockReturnValue(null);
  });

  it('renders without crashing', () => {
    (useParams as jest.Mock).mockReturnValue({ id: 'campaign-123' });
    (useCampaignStore as jest.Mock).mockReturnValue(null);
    (useCampaignStore as jest.Mock).mockReturnValue(null);

    render(
      <BrowserRouter>
        <CampaignDetail />
      </BrowserRouter>
    );
  });

  it('displays loading state', () => {
    (useParams as jest.Mock).mockReturnValue({ id: 'campaign-123' });
    (useCampaignStore as jest.Mock).mockImplementation((selector) => {
      return selector(mockStoreState);
    });
    (campaignService.getCampaign as jest.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves

    render(
      <BrowserRouter>
        <CampaignDetail />
      </BrowserRouter>
    );

    expect(screen.getByText(/Loading campaign details/i)).toBeInTheDocument();
  });

  it('displays campaign information', async () => {
    (useParams as jest.Mock).mockReturnValue({ id: 'campaign-123' });
    (useCampaignStore as jest.Mock).mockImplementation((selector) => {
      return selector(mockStoreState);
    });

    // Set up the mock before rendering
    (campaignService.getCampaign as jest.Mock).mockResolvedValue(mockCampaign);

    render(
      <BrowserRouter>
        <CampaignDetail />
      </BrowserRouter>
    );

    // Wait for campaign to be displayed - the component will call the service and update
    await waitFor(() => {
      expect(screen.getByText('Test Campaign')).toBeInTheDocument();
    }, { timeout: 10000 });

    // Verify the service was called
    expect(campaignService.getCampaign).toHaveBeenCalledWith('campaign-123');
  });

  it('displays error state', async () => {
    (useParams as jest.Mock).mockReturnValue({ id: 'campaign-123' });
    (useCampaignStore as jest.Mock).mockImplementation((selector) => {
      return selector(mockStoreState);
    });

    // Set up the mock to reject before rendering
    (campaignService.getCampaign as jest.Mock).mockRejectedValue(
      new Error('Failed to load campaign')
    );

    render(
      <BrowserRouter>
        <CampaignDetail />
      </BrowserRouter>
    );

    // Wait for error to be displayed
    await waitFor(() => {
      expect(screen.getByText(/Failed to load campaign/i)).toBeInTheDocument();
    }, { timeout: 10000 });

    // Verify the service was called
    expect(campaignService.getCampaign).toHaveBeenCalledWith('campaign-123');
  });

  it('displays empty state when campaign not found', async () => {
    (useParams as jest.Mock).mockReturnValue({ id: 'campaign-123' });
    (useCampaignStore as jest.Mock).mockImplementation((selector) => {
      return selector(mockStoreState);
    });

    // Set up the mock to return null immediately
    (campaignService.getCampaign as jest.Mock).mockResolvedValue(null);

    render(
      <BrowserRouter>
        <CampaignDetail />
      </BrowserRouter>
    );

    // Wait for the service to be called and promise to resolve
    await waitFor(() => {
      expect(campaignService.getCampaign).toHaveBeenCalledWith('campaign-123');
    });

    // Wait for empty state to appear - React should update after promise resolves
    await waitFor(() => {
      expect(screen.getByText(/Campaign Not Found/i)).toBeInTheDocument();
    }, { timeout: 10000 });
  });
});

