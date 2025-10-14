// src/api/services/auth.service.ts
import {
  AuthResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  ResetPasswordResponse,
  UserResponse,
  VerifyOTPRequest,
  VerifyOTPResponse,
} from '../../types/auth.types';
import { logger } from '../../utils/logger';
import { TokenStorage } from '../../utils/storage';
import { client } from '../client';
import { API_ENDPOINTS } from '../endpoints';

class AuthService {
  // Use the centralized endpoints
  private readonly endpoints = API_ENDPOINTS.AUTH;

  /**
   * Register new user
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      logger.info('Registering user', { email: data.email });
      
      const response = await client.post<AuthResponse>(
        this.endpoints.REGISTER,
        data
      );

      await this.saveTokens(response.data);
      logger.info('Registration successful');
      
      return response.data;
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
      
      const response = await client.post<AuthResponse>(
        this.endpoints.LOGIN,
        data
      );

      await this.saveTokens(response.data);
      logger.info('Login successful');
      
      return response.data;
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
        await client.post(this.endpoints.LOGOUT);
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
      
      const response = await client.get<UserResponse>(this.endpoints.PROFILE);
      
      logger.info('Profile fetched successfully');
      return response.data;
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
      
      const response = await client.put<UserResponse>(
        this.endpoints.PROFILE,
        data
      );
      
      logger.info('Profile updated successfully');
      return response.data;
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
      
      const response = await client.post<ForgotPasswordResponse>(
        this.endpoints.FORGOT_PASSWORD,
        data
      );
      
      logger.info('Password reset email sent');
      return response.data;
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
      
      const response = await client.post<VerifyOTPResponse>(
        this.endpoints.VERIFY_OTP,
        data
      );
      
      logger.info('OTP verified successfully');
      return response.data;
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
      
      const response = await client.post<ResetPasswordResponse>(
        this.endpoints.RESET_PASSWORD,
        data
      );
      
      logger.info('Password reset successful');
      return response.data;
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
      
      const response = await client.get<{ url: string }>(
        this.endpoints.GOOGLE_LOGIN
      );
      
      return response.data.url;
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
      
      const response = await client.get<AuthResponse>(
        this.endpoints.GOOGLE_CALLBACK,
        { params: { code, state } }
      );

      await this.saveTokens(response.data);
      logger.info('Google login successful');
      
      return response.data;
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

      const response = await client.post<{ token: string }>(
        this.endpoints.REFRESH,
        { refresh_token: refreshToken }
      );

      await TokenStorage.setAccessToken(response.data.token);
      logger.info('Token refreshed successfully');
      
      return response.data.token;
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