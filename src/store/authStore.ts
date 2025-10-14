// src/store/authStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '@/api/services/auth.service';
import { UserResponse, LoginRequest, RegisterRequest } from '@/types/auth.types';
import { logger } from '@/utils/logger';

interface AuthState {
  // State
  user: UserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  updateUser: (data: Partial<UserResponse>) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...initialState,

      /**
       * Login user
       */
      login: async (data: LoginRequest) => {
        try {
          set({ isLoading: true, error: null });
          logger.info('Auth store: Logging in');

          const response = await authService.login(data);

          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          logger.info('Auth store: Login successful');
        } catch (error: any) {
          logger.error('Auth store: Login failed', error);
          
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: error.message || 'Login failed',
          });

          throw error;
        }
      },

      /**
       * Register new user
       */
      register: async (data: RegisterRequest) => {
        try {
          set({ isLoading: true, error: null });
          logger.info('Auth store: Registering user');

          const response = await authService.register(data);

          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          logger.info('Auth store: Registration successful');
        } catch (error: any) {
          logger.error('Auth store: Registration failed', error);
          
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: error.message || 'Registration failed',
          });

          throw error;
        }
      },

      /**
       * Logout user
       */
      logout: async () => {
        try {
          set({ isLoading: true });
          logger.info('Auth store: Logging out');

          await authService.logout();

          set({
            ...initialState,
          });

          logger.info('Auth store: Logout successful');
        } catch (error: any) {
          logger.error('Auth store: Logout failed', error);
          
          // Clear state even if logout fails
          set({
            ...initialState,
            error: error.message || 'Logout failed',
          });
        }
      },

      /**
       * Load current user
       */
      loadUser: async () => {
        try {
          set({ isLoading: true, error: null });
          logger.info('Auth store: Loading user');

          const isAuth = await authService.isAuthenticated();

          if (!isAuth) {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
            });
            return;
          }

          const user = await authService.getProfile();

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          logger.info('Auth store: User loaded successfully');
        } catch (error: any) {
          logger.error('Auth store: Failed to load user', error);
          
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: error.message || 'Failed to load user',
          });
        }
      },

      /**
       * Update user profile
       */
      updateUser: async (data: Partial<UserResponse>) => {
        try {
          set({ isLoading: true, error: null });
          logger.info('Auth store: Updating user');

          const updatedUser = await authService.updateProfile(data);

          set({
            user: updatedUser,
            isLoading: false,
            error: null,
          });

          logger.info('Auth store: User updated successfully');
        } catch (error: any) {
          logger.error('Auth store: Failed to update user', error);
          
          set({
            isLoading: false,
            error: error.message || 'Failed to update user',
          });

          throw error;
        }
      },

      /**
       * Clear error
       */
      clearError: () => {
        set({ error: null });
      },

      /**
       * Reset store
       */
      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Selectors for better performance
export const selectUser = (state: AuthState) => state.user;
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
export const selectIsLoading = (state: AuthState) => state.isLoading;
export const selectError = (state: AuthState) => state.error;