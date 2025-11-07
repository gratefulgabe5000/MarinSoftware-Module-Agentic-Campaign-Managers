import { create } from 'zustand';
import { Campaign } from '../types/campaign.types';
import { CampaignPlan } from '../types/ai.types';
import {
  loadAllCampaigns,
  saveCampaign,
  saveCampaigns,
  deleteCampaign as deleteCampaignFromDB,
} from '../utils/indexedDB';

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
  isInitialized: boolean; // Flag to track if campaigns have been loaded from IndexedDB

  // Actions
  initializeCampaigns: () => Promise<void>;
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
 * Manages campaign state using Zustand with IndexedDB persistence
 */
export const useCampaignStore = create<CampaignStore>((set, get) => ({
  // Initial state
  currentCampaignPlan: null,
  currentCampaignPlanIsMock: false,
  currentCampaign: null,
  campaigns: [],
  isLoading: false,
  error: null,
  isInitialized: false,

  // Actions
  initializeCampaigns: async () => {
    console.log('🔄 [CampaignStore] initializeCampaigns called', {
      isInitialized: get().isInitialized,
      currentCampaigns: get().campaigns.length
    });

    if (get().isInitialized) {
      console.log('⏭️ [CampaignStore] Already initialized, skipping');
      return; // Already initialized
    }

    try {
      console.log('📂 [CampaignStore] Loading campaigns from IndexedDB...');
      const campaigns = await loadAllCampaigns();
      console.log('✅ [CampaignStore] Loaded campaigns from IndexedDB:', {
        count: campaigns.length,
        campaigns
      });
      set({ campaigns, isInitialized: true, error: null });
    } catch (error) {
      console.error('❌ [CampaignStore] Failed to initialize campaigns from IndexedDB:', error);
      set({ isInitialized: true, error: 'Failed to load campaigns' });
    }
  },

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
    console.log('➕ [CampaignStore] Adding campaign:', {
      campaign,
      currentCount: get().campaigns.length
    });
    set((state) => ({
      campaigns: [...state.campaigns, campaign],
      error: null,
    }));
    console.log('✅ [CampaignStore] Campaign added to state, new count:', get().campaigns.length);
    // Persist to IndexedDB
    saveCampaign(campaign)
      .then(() => {
        console.log('💾 [CampaignStore] Campaign saved to IndexedDB:', campaign.id);
      })
      .catch((error) => {
        console.error('❌ [CampaignStore] Failed to save campaign to IndexedDB:', error);
      });
  },

  updateCampaign: (id: string, updates: Partial<Campaign>) => {
    const state = get();
    const updatedCampaigns = state.campaigns.map((campaign) =>
      campaign.id === id ? { ...campaign, ...updates, updatedAt: new Date() } : campaign
    );
    const updatedCurrentCampaign =
      state.currentCampaign?.id === id
        ? { ...state.currentCampaign, ...updates, updatedAt: new Date() }
        : state.currentCampaign;

    set({
      campaigns: updatedCampaigns,
      currentCampaign: updatedCurrentCampaign,
      error: null,
    });

    // Persist to IndexedDB
    const updatedCampaign = updatedCampaigns.find((c) => c.id === id);
    if (updatedCampaign) {
      saveCampaign(updatedCampaign).catch((error) => {
        console.error('Failed to update campaign in IndexedDB:', error);
      });
    }
  },

  removeCampaign: (id: string) => {
    set((state) => ({
      campaigns: state.campaigns.filter((campaign) => campaign.id !== id),
      currentCampaign:
        state.currentCampaign?.id === id ? null : state.currentCampaign,
      error: null,
    }));
    // Remove from IndexedDB
    deleteCampaignFromDB(id).catch((error) => {
      console.error('Failed to delete campaign from IndexedDB:', error);
    });
  },

  setCampaigns: (campaigns: Campaign[]) => {
    set({ campaigns, error: null });
    // Persist all campaigns to IndexedDB
    saveCampaigns(campaigns).catch((error) => {
      console.error('Failed to save campaigns to IndexedDB:', error);
    });
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

