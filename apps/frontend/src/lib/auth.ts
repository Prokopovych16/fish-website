import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from './api';
import { useCartStore } from './cart';

let _refreshPromise: Promise<void> | null = null;

const setAuthorizationHeader = (token: string | null) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  role: 'USER' | 'MANAGER' | 'ADMIN' | 'SUPER_ADMIN';
  isEmailVerified: boolean;
  isBlocked: boolean;
  blockReason?: string;
  loyaltyPoints: number;
  totalSpent: number;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  _hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
  login: (email: string, password: string) => Promise<User | null>;
  register: (data: {
    email: string;
    firstName: string;
    lastName?: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isLoading: false,
      isAuthenticated: false,
      _hasHydrated: false,
      setHasHydrated: (v) => set({ _hasHydrated: v }),

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/login', { email, password });
          const user = response.data.user;
          const accessToken = response.data.accessToken;
          setAuthorizationHeader(accessToken);
          set({ user, accessToken, isAuthenticated: true, isLoading: false });
          // Merge guest cart into user's API cart
          useCartStore.getState().mergeOnLogin().catch(() => {});
          return user;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (data) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/register', data);
          const user = response.data.user;
          set({ user, accessToken: null, isAuthenticated: false, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch (error) {
          // Continue with logout even if API fails
        }
        setAuthorizationHeader(null);
        set({ user: null, accessToken: null, isAuthenticated: false });
        useCartStore.getState().clearCart().catch(() => {});
      },

      refreshUser: async () => {
        if (_refreshPromise) return _refreshPromise;

        _refreshPromise = (async () => {
          const { accessToken } = get();
          if (accessToken) {
            setAuthorizationHeader(accessToken);
          }

          try {
            const response = await api.get('/auth/me');
            const user = response.data;
            set({ user, isAuthenticated: true });
          } catch (_error) {
            try {
              const refreshResponse = await api.post('/auth/refresh');
              const newAccessToken = refreshResponse.data.accessToken;
              if (newAccessToken) {
                setAuthorizationHeader(newAccessToken);
                set({ accessToken: newAccessToken });
              }
              const secondResponse = await api.get('/auth/me');
              const user = secondResponse.data;
              set({ user, isAuthenticated: true });
            } catch (error) {
              setAuthorizationHeader(null);
              set({ user: null, accessToken: null, isAuthenticated: false });
              throw error;
            }
          } finally {
            _refreshPromise = null;
          }
        })();

        return _refreshPromise;
      },

      forgotPassword: async (email: string) => {
        await api.post('/auth/forgot-password', { email });
      },

      resetPassword: async (token: string, password: string) => {
        await api.post('/auth/reset-password', { token, password });
      },

      verifyEmail: async (token: string) => {
        await api.post('/auth/verify-email', { token });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.accessToken) {
          setAuthorizationHeader(state.accessToken);
        }
        state?.setHasHydrated(true);
      },
    }
  )
);