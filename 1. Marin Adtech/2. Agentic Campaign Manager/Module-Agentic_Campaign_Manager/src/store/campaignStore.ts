import { create } from 'zustand';
import { Campaign, CampaignPlan, CampaignStatus, CampaignCreationRequest } from '../types/campaign.types';

/**
 * Campaign Store Interface
 */
interface CampaignStore {
  // State
  currentCampaignPlan: CampaignPlan | null;
  currentCampaignPlanIsMock: boolean; // Flag to track if current plan is from mock data
  currentCampaign: Campaign | null;
  campaigns: Campaign[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setCampaignPlan: (plan: CampaignPlan, isMockData?: boolean) => void;
  updateCampaignPlan: (updates: Partial<CampaignPlan>) => void;
  setCampaign: (campaign: Campaign) => void;
  addCampaign: (campaign: Campaign) => void;
  updateCampaign: (id: string, updates: Partial<Campaign>) => void;
  removeCampaign: (id: string) => void;
  setCampaigns: (campaigns: Campaign[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearCampaignPlan: () => void;
  clearCampaign: () => void;

  // Selectors
  getCampaignPlan: () => CampaignPlan | null;
  getCampaign: () => Campaign | null;
  getCampaignById: (id: string) => Campaign | undefined;
  isCampaignPlanValid: () => boolean;
  getLoadingState: () => boolean;
  hasError: () => boolean;
}

/**
 * Validate campaign plan
 */
const validateCampaignPlan = (plan: CampaignPlan): boolean => {
  if (!plan.objective) return false;
  if (!plan.budget || plan.budget.total <= 0) return false;
  if (!plan.timeline || !plan.timeline.startDate) return false;
  if (!plan.platforms || plan.platforms.length === 0) return false;
  if (!plan.kpis || !plan.kpis.primary) return false;
  return true;
};

/**
 * Campaign Store
 * Manages campaign state using Zustand
 */
export const useCampaignStore = create<CampaignStore>((set, get) => ({
  // Initial state
  currentCampaignPlan: null,
  currentCampaignPlanIsMock: false,
  currentCampaign: null,
  campaigns: [],
  isLoading: false,
  error: null,

  // Actions
  setCampaignPlan: (plan: CampaignPlan, isMockData: boolean = false) => {
    set({ currentCampaignPlan: plan, currentCampaignPlanIsMock: isMockData, error: null });
  },

  updateCampaignPlan: (updates: Partial<CampaignPlan>) => {
    const currentPlan = get().currentCampaignPlan;
    if (currentPlan) {
      set({
        currentCampaignPlan: { ...currentPlan, ...updates },
        error: null,
      });
    }
  },

  setCampaign: (campaign: Campaign) => {
    set({ currentCampaign: campaign, error: null });
  },

  addCampaign: (campaign: Campaign) => {
    set((state) => ({
      campaigns: [...state.campaigns, campaign],
      error: null,
    }));
  },

  updateCampaign: (id: string, updates: Partial<Campaign>) => {
    set((state) => ({
      campaigns: state.campaigns.map((campaign) =>
        campaign.id === id ? { ...campaign, ...updates, updatedAt: new Date() } : campaign
      ),
      currentCampaign:
        state.currentCampaign?.id === id
          ? { ...state.currentCampaign, ...updates, updatedAt: new Date() }
          : state.currentCampaign,
      error: null,
    }));
  },

  removeCampaign: (id: string) => {
    set((state) => ({
      campaigns: state.campaigns.filter((campaign) => campaign.id !== id),
      currentCampaign:
        state.currentCampaign?.id === id ? null : state.currentCampaign,
      error: null,
    }));
  },

  setCampaigns: (campaigns: Campaign[]) => {
    set({ campaigns, error: null });
  },

  setLoading: (isLoading: boolean) => {
    set({ isLoading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  clearCampaignPlan: () => {
    set({ currentCampaignPlan: null, currentCampaignPlanIsMock: false, error: null });
  },

  clearCampaign: () => {
    set({ currentCampaign: null, error: null });
  },

  // Selectors
  getCampaignPlan: () => {
    return get().currentCampaignPlan;
  },

  getCampaign: () => {
    return get().currentCampaign;
  },

  getCampaignById: (id: string) => {
    return get().campaigns.find((campaign) => campaign.id === id);
  },

  isCampaignPlanValid: () => {
    const plan = get().currentCampaignPlan;
    return plan ? validateCampaignPlan(plan) : false;
  },

  getLoadingState: () => {
    return get().isLoading;
  },

  hasError: () => {
    return get().error !== null;
  },
}));

