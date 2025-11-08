import { useCampaignStore } from '../campaignStore';
import { CampaignPlan, Campaign, CampaignStatus } from '../../types/campaign.types';

describe('CampaignStore', () => {
  beforeEach(() => {
    // Reset store state
    useCampaignStore.setState({
      currentCampaignPlan: null,
      currentCampaign: null,
      campaigns: [],
      isLoading: false,
      error: null,
    });
  });

  describe('setCampaignPlan', () => {
    it('should set campaign plan', () => {
      const plan: CampaignPlan = {
        objective: 'Test objective',
        targetAudience: {},
        budget: { total: 1000, currency: 'USD' },
        timeline: { startDate: '2025-01-01', duration: 30 },
        platforms: ['Google Ads'],
        kpis: { primary: 'Conversions' },
      };

      useCampaignStore.getState().setCampaignPlan(plan);

      expect(useCampaignStore.getState().getCampaignPlan()).toEqual(plan);
      expect(useCampaignStore.getState().error).toBe(null);
    });
  });

  describe('updateCampaignPlan', () => {
    it('should update campaign plan', () => {
      const plan: CampaignPlan = {
        objective: 'Test objective',
        targetAudience: {},
        budget: { total: 1000, currency: 'USD' },
        timeline: { startDate: '2025-01-01', duration: 30 },
        platforms: ['Google Ads'],
        kpis: { primary: 'Conversions' },
      };

      useCampaignStore.getState().setCampaignPlan(plan);
      useCampaignStore.getState().updateCampaignPlan({ objective: 'Updated objective' });

      const updatedPlan = useCampaignStore.getState().getCampaignPlan();
      expect(updatedPlan?.objective).toBe('Updated objective');
      expect(updatedPlan?.budget.total).toBe(1000); // Other fields unchanged
    });
  });

  describe('setCampaign', () => {
    it('should set current campaign', () => {
      const campaign: Campaign = {
        id: 'test-1',
        name: 'Test Campaign',
        campaignPlan: {
          objective: 'Test',
          targetAudience: {},
          budget: { total: 1000, currency: 'USD' },
          timeline: { startDate: '2025-01-01', duration: 30 },
          platforms: ['Google Ads'],
          kpis: { primary: 'Conversions' },
        },
        status: 'active',
        platformCampaignIds: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      useCampaignStore.getState().setCampaign(campaign);

      expect(useCampaignStore.getState().getCampaign()).toEqual(campaign);
    });
  });

  describe('addCampaign', () => {
    it('should add campaign to campaigns list', () => {
      const campaign: Campaign = {
        id: 'test-1',
        name: 'Test Campaign',
        campaignPlan: {
          objective: 'Test',
          targetAudience: {},
          budget: { total: 1000, currency: 'USD' },
          timeline: { startDate: '2025-01-01', duration: 30 },
          platforms: ['Google Ads'],
          kpis: { primary: 'Conversions' },
        },
        status: 'active',
        platformCampaignIds: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      useCampaignStore.getState().addCampaign(campaign);

      const campaigns = useCampaignStore.getState().campaigns;
      expect(campaigns).toHaveLength(1);
      expect(campaigns[0]).toEqual(campaign);
    });
  });

  describe('updateCampaign', () => {
    it('should update campaign in campaigns list', () => {
      const campaign: Campaign = {
        id: 'test-1',
        name: 'Test Campaign',
        campaignPlan: {
          objective: 'Test',
          targetAudience: {},
          budget: { total: 1000, currency: 'USD' },
          timeline: { startDate: '2025-01-01', duration: 30 },
          platforms: ['Google Ads'],
          kpis: { primary: 'Conversions' },
        },
        status: 'active',
        platformCampaignIds: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      useCampaignStore.getState().addCampaign(campaign);
      useCampaignStore.getState().updateCampaign('test-1', { status: 'paused' });

      const updatedCampaign = useCampaignStore.getState().getCampaignById('test-1');
      expect(updatedCampaign?.status).toBe('paused');
    });
  });

  describe('getCampaignById', () => {
    it('should return campaign by ID', () => {
      const campaign: Campaign = {
        id: 'test-1',
        name: 'Test Campaign',
        campaignPlan: {
          objective: 'Test',
          targetAudience: {},
          budget: { total: 1000, currency: 'USD' },
          timeline: { startDate: '2025-01-01', duration: 30 },
          platforms: ['Google Ads'],
          kpis: { primary: 'Conversions' },
        },
        status: 'active',
        platformCampaignIds: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      useCampaignStore.getState().addCampaign(campaign);

      const found = useCampaignStore.getState().getCampaignById('test-1');
      expect(found).toEqual(campaign);
    });

    it('should return undefined if campaign not found', () => {
      const found = useCampaignStore.getState().getCampaignById('non-existent');
      expect(found).toBeUndefined();
    });
  });

  describe('isCampaignPlanValid', () => {
    it('should return true for valid campaign plan', () => {
      const plan: CampaignPlan = {
        objective: 'Test objective',
        targetAudience: {},
        budget: { total: 1000, currency: 'USD' },
        timeline: { startDate: '2025-01-01', duration: 30 },
        platforms: ['Google Ads'],
        kpis: { primary: 'Conversions' },
      };

      useCampaignStore.getState().setCampaignPlan(plan);

      expect(useCampaignStore.getState().isCampaignPlanValid()).toBe(true);
    });

    it('should return false for invalid campaign plan', () => {
      const plan: CampaignPlan = {
        objective: '',
        targetAudience: {},
        budget: { total: 0, currency: 'USD' },
        timeline: { startDate: '', duration: 0 },
        platforms: [],
        kpis: { primary: '' },
      };

      useCampaignStore.getState().setCampaignPlan(plan);

      expect(useCampaignStore.getState().isCampaignPlanValid()).toBe(false);
    });

    it('should return false if no campaign plan', () => {
      expect(useCampaignStore.getState().isCampaignPlanValid()).toBe(false);
    });
  });

  describe('clearCampaignPlan', () => {
    it('should clear campaign plan', () => {
      const plan: CampaignPlan = {
        objective: 'Test',
        targetAudience: {},
        budget: { total: 1000, currency: 'USD' },
        timeline: { startDate: '2025-01-01', duration: 30 },
        platforms: ['Google Ads'],
        kpis: { primary: 'Conversions' },
      };

      useCampaignStore.getState().setCampaignPlan(plan);
      useCampaignStore.getState().clearCampaignPlan();

      expect(useCampaignStore.getState().getCampaignPlan()).toBe(null);
    });
  });
});

