// src/store/authStore.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
    apiLogin,
    apiLogout,
    apiProfile,
    apiRegister,
    apiUpdateProfile
} from "../api/auth";
import {
    AuthResponse,
    LoginRequest,
    RegisterRequest,
    UserResponse
} from "../types/auth.types";
import { logger } from "../utils/logger";
import { TokenStorage } from "../utils/storage";

type AuthContextValue = {
  user: UserResponse | null;
  token: string | null;
  loading: boolean;
  signInWithEmail: (credentials: LoginRequest) => Promise<void>;
  signUpWithEmail: (data: RegisterRequest) => Promise<void>;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<UserResponse>) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: () => Promise<boolean>;
};

/** ===== Auth State Management ===== **/

/** ===== Context / Hook ===== */
const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

/** ===== Provider ===== */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from storage
  useEffect(() => {
    (async () => {
      try {
        const token = await TokenStorage.getAccessToken();
        if (token) {
          setToken(token);
          // Optionally fetch user profile
          try {
            const userProfile = await apiProfile();
            setUser(userProfile);
          } catch (error) {
            logger.warn('Failed to fetch profile on init', error);
            // Token might be invalid, clear it
            await TokenStorage.clearTokens();
            setToken(null);
          }
        }
      } catch (error) {
        logger.error('Failed to initialize auth state', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const signInWithEmail = async (credentials: LoginRequest) => {
    try {
      setLoading(true);
      logger.info('Signing in user', { email: credentials.email });
      
      const response: AuthResponse = await apiLogin(credentials);
      
      // Store tokens
      await TokenStorage.setAccessToken(response.token);
      if (response.refreshToken) {
        await TokenStorage.setRefreshToken(response.refreshToken);
      }
      
      setToken(response.token);
      setUser(response.user);
      
      logger.info('Sign in successful');
    } catch (error) {
      logger.error('Sign in failed', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (data: RegisterRequest) => {
    try {
      setLoading(true);
      logger.info('Signing up user', { email: data.email });
      
      const response: AuthResponse = await apiRegister(data);
      
      // Store tokens
      await TokenStorage.setAccessToken(response.token);
      if (response.refreshToken) {
        await TokenStorage.setRefreshToken(response.refreshToken);
      }
      
      setToken(response.token);
      setUser(response.user);
      
      logger.info('Sign up successful');
    } catch (error) {
      logger.error('Sign up failed', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      logger.info('Fetching user profile');
      const userProfile = await apiProfile();
      setUser(userProfile);
      logger.info('Profile fetched successfully');
    } catch (error) {
      logger.error('Failed to fetch profile', error);
      throw error;
    }
  };

  const updateProfile = async (data: Partial<UserResponse>) => {
    try {
      setLoading(true);
      logger.info('Updating user profile');
      const updatedProfile = await apiUpdateProfile(data);
      setUser(updatedProfile);
      logger.info('Profile updated successfully');
    } catch (error) {
      logger.error('Failed to update profile', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      logger.info('Signing out user');
      
      // Call logout API
      try {
        await apiLogout();
      } catch (error) {
        // Continue even if API call fails
        logger.warn('API logout failed', error);
      }
      
      // Clear local state and storage
      await TokenStorage.clearTokens();
      setToken(null);
      setUser(null);
      
      logger.info('Sign out successful');
    } catch (error) {
      logger.error('Sign out failed', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const isAuthenticated = async (): Promise<boolean> => {
    const token = await TokenStorage.getAccessToken();
    return !!token;
  };

  const value = useMemo(
    () => ({ 
      user, 
      token, 
      loading, 
      signInWithEmail, 
      signUpWithEmail, 
      fetchProfile, 
      updateProfile,
      signOut,
      isAuthenticated
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;



