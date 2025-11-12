import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ApiModeState {
  useZilkrDispatcher: boolean;
  setUseZilkrDispatcher: (value: boolean) => void;
  toggleApiMode: () => void;
}

export const useApiModeStore = create<ApiModeState>()(
  persist(
    (set) => ({
      useZilkrDispatcher: false, // Default to Direct Google Ads API
      setUseZilkrDispatcher: (value) => set({ useZilkrDispatcher: value }),
      toggleApiMode: () => set((state) => ({ useZilkrDispatcher: !state.useZilkrDispatcher })),
    }),
    {
      name: 'api_mode_preference', // localStorage key
    }
  )
);

