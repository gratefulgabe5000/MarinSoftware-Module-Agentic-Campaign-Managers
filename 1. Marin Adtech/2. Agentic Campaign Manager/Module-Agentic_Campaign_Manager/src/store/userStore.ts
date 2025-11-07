import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile } from '../components/layout/HeaderUserMenu';

/**
 * User Store State Interface
 */
interface UserState {
  // User profile data
  user: UserProfile | null;

  // Loading state
  isLoading: boolean;

  // Error state
  error: string | null;

  // Actions
  setUser: (user: UserProfile) => void;
  clearUser: () => void;
  updateUser: (updates: Partial<UserProfile>) => void;
  fetchUser: () => Promise<void>;
  logout: () => void;
}

/**
 * Mock User Data (for development)
 */
const mockUser: UserProfile = {
  name: 'John Doe',
  email: 'john.doe@marinsoftware.com',
  initials: 'JD',
};

/**
 * User Store
 *
 * Manages user authentication and profile state.
 * Features:
 * - User profile management
 * - Persistent storage
 * - Loading and error states
 * - Mock data for development
 */
export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      // Initial state
      user: mockUser, // Use mock user for development
      isLoading: false,
      error: null,

      // Set user data
      setUser: (user) => {
        set({ user, error: null });
      },

      // Clear user data
      clearUser: () => {
        set({ user: null, error: null });
      },

      // Update user data
      updateUser: (updates) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        }));
      },

      // Fetch user data from API
      fetchUser: async () => {
        set({ isLoading: true, error: null });

        try {
          // TODO: Replace with actual API call
          // const response = await fetch('/api/user/profile');
          // const userData = await response.json();

          // Simulate API call delay
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Use mock data for now
          set({ user: mockUser, isLoading: false });
        } catch (error) {
          console.error('Failed to fetch user:', error);
          set({
            error: 'Failed to load user profile',
            isLoading: false,
          });
        }
      },

      // Logout - clear user data and session
      logout: () => {
        // TODO: Add actual logout API call
        // await fetch('/api/auth/logout', { method: 'POST' });

        // Clear user state
        set({ user: null, error: null });

        // Clear other stores if needed
        // Example: clear campaign data, conversation history, etc.

        // Redirect to login page if needed
        // window.location.href = '/login';
      },
    }),
    {
      name: 'user-storage', // localStorage key
      partialize: (state) => ({
        // Only persist user data, not loading/error states
        user: state.user,
      }),
    }
  )
);
