import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import ModuleContainer from '../../components/ModuleContainer';

describe('ModuleContainer', () => {
  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <ModuleContainer />
      </BrowserRouter>
    );
  });

  it('renders CampaignDashboard on root path', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <ModuleContainer />
      </MemoryRouter>
    );

    expect(screen.getByText(/Campaign Dashboard/i)).toBeInTheDocument();
  });

  it('renders CampaignCreation on /create path', () => {
    render(
      <MemoryRouter initialEntries={['/create']}>
        <ModuleContainer />
      </MemoryRouter>
    );

    expect(screen.getByText(/Create Campaign/i)).toBeInTheDocument();
  });

  it('renders CampaignDetail on /campaign/:id path', () => {
    render(
      <MemoryRouter initialEntries={['/campaign/test-id-123']}>
        <ModuleContainer />
      </MemoryRouter>
    );

    expect(screen.getByText(/Campaign Detail/i)).toBeInTheDocument();
    expect(screen.getByText(/test-id-123/i)).toBeInTheDocument();
  });
});

