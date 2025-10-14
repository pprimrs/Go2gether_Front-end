// src/api/services/auth.service.ts
import { apiClient } from '@/api/client';
import { TokenStorage } from '@/utils/storage';
import { logger } from '@/utils/logger';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  UserResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  VerifyOTPRequest,
  VerifyOTPResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
} from '@/types/auth.types';

class AuthService {
  private readonly endpoints = {
    register: '/api/auth/register',
    login: '/api/auth/login',
    logout: '/api/auth/logout',
    profile: '/api/auth/profile',
    forgotPassword: '/api/auth/forgot-password',
    verifyOTP: '/api/auth/verify-otp',
    resetPassword: '/api/auth/reset-password',
    googleLogin: '/api/auth/google/login',
    googleCallback: '/api/auth/google/callback',
    refresh: '/api/auth/refresh',
  };

  /**
   * Register new user
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      logger.info('Registering user', { email: data.email });
      
      const response = await apiClient.post<AuthResponse>(
        this.endpoints.register,
        data
      );

      await this.saveTokens(response);
      logger.info('Registration successful');
      
      return response;
    } catch (error) {
      logger.error('Registration failed', error);
      throw error;
    }
  }

  /**
   * Login user
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      logger.info('Logging in user', { email: data.email });
      
      const response = await apiClient.post<AuthResponse>(
        this.endpoints.login,
        data
      );

      await this.saveTokens(response);
      logger.info('Login successful');
      
      return response;
    } catch (error) {
      logger.error('Login failed', error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      logger.info('Logging out user');
      
      // Optional: Call backend logout endpoint
      try {
        await apiClient.post(this.endpoints.logout);
      } catch (error) {
        // Continue even if backend logout fails
        logger.warn('Backend logout failed', error);
      }

      await TokenStorage.clearTokens();
      logger.info('Logout successful');
    } catch (error) {
      logger.error('Logout failed', error);
      throw error;
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<UserResponse> {
    try {
      logger.info('Fetching user profile');
      
      const response = await apiClient.get<UserResponse>(this.endpoints.profile);
      
      logger.info('Profile fetched successfully');
      return response;
    } catch (error) {
      logger.error('Failed to fetch profile', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(data: Partial<UserResponse>): Promise<UserResponse> {
    try {
      logger.info('Updating user profile');
      
      const response = await apiClient.put<UserResponse>(
        this.endpoints.profile,
        data
      );
      
      logger.info('Profile updated successfully');
      return response;
    } catch (error) {
      logger.error('Failed to update profile', error);
      throw error;
    }
  }

  /**
   * Request password reset
   */
  async forgotPassword(data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
    try {
      logger.info('Requesting password reset', { email: data.email });
      
      const response = await apiClient.post<ForgotPasswordResponse>(
        this.endpoints.forgotPassword,
        data
      );
      
      logger.info('Password reset email sent');
      return response;
    } catch (error) {
      logger.error('Password reset request failed', error);
      throw error;
    }
  }

  /**
   * Verify OTP code
   */
  async verifyOTP(data: VerifyOTPRequest): Promise<VerifyOTPResponse> {
    try {
      logger.info('Verifying OTP', { email: data.email });
      
      const response = await apiClient.post<VerifyOTPResponse>(
        this.endpoints.verifyOTP,
        data
      );
      
      logger.info('OTP verified successfully');
      return response;
    } catch (error) {
      logger.error('OTP verification failed', error);
      throw error;
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(data: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    try {
      logger.info('Resetting password');
      
      const response = await apiClient.post<ResetPasswordResponse>(
        this.endpoints.resetPassword,
        data
      );
      
      logger.info('Password reset successful');
      return response;
    } catch (error) {
      logger.error('Password reset failed', error);
      throw error;
    }
  }

  /**
   * Get Google OAuth URL
   */
  async getGoogleAuthUrl(): Promise<string> {
    try {
      logger.info('Getting Google OAuth URL');
      
      const response = await apiClient.get<{ url: string }>(
        this.endpoints.googleLogin
      );
      
      return response.url;
    } catch (error) {
      logger.error('Failed to get Google OAuth URL', error);
      throw error;
    }
  }

  /**
   * Handle Google OAuth callback
   */
  async googleCallback(code: string, state?: string): Promise<AuthResponse> {
    try {
      logger.info('Processing Google OAuth callback');
      
      const response = await apiClient.get<AuthResponse>(
        this.endpoints.googleCallback,
        { params: { code, state } }
      );

      await this.saveTokens(response);
      logger.info('Google login successful');
      
      return response;
    } catch (error) {
      logger.error('Google OAuth callback failed', error);
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await TokenStorage.getAccessToken();
    return !!token;
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<string> {
    try {
      logger.info('Refreshing access token');
      
      const refreshToken = await TokenStorage.getRefreshToken();
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiClient.post<{ token: string }>(
        this.endpoints.refresh,
        { refresh_token: refreshToken }
      );

      await TokenStorage.setAccessToken(response.token);
      logger.info('Token refreshed successfully');
      
      return response.token;
    } catch (error) {
      logger.error('Token refresh failed', error);
      await this.logout();
      throw error;
    }
  }

  /**
   * Save authentication tokens
   */
  private async saveTokens(response: AuthResponse): Promise<void> {
    await TokenStorage.setAccessToken(response.token);
    
    if (response.refreshToken) {
      await TokenStorage.setRefreshToken(response.refreshToken);
    }
  }
}

export const authService = new AuthService();