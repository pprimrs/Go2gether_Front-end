// src/api/auth.ts
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
} from "../types/auth.types";
import { client } from "./client";
import { API_ENDPOINTS } from "./endpoints";

// Re-export types for convenience
export type {
  AuthResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse, LoginRequest,
  RegisterRequest, ResetPasswordRequest,
  ResetPasswordResponse, UserResponse, VerifyOTPRequest,
  VerifyOTPResponse
};

/** ===== Auth API Functions ===== **/

/**
 * Login user with email and password
 */
export async function apiLogin(body: LoginRequest): Promise<AuthResponse> {
  const { data } = await client.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, body);
  return data;
}

/**
 * Register new user
 */
export async function apiRegister(body: RegisterRequest): Promise<AuthResponse> {
  const { data } = await client.post<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER, body);
  return data;
}

/**
 * Get current user profile
 */
export async function apiProfile(): Promise<UserResponse> {
  const { data } = await client.get<UserResponse>(API_ENDPOINTS.AUTH.PROFILE);
  return data;
}

/**
 * Update user profile
 */
export async function apiUpdateProfile(body: Partial<UserResponse>): Promise<UserResponse> {
  const { data } = await client.put<UserResponse>(API_ENDPOINTS.AUTH.PROFILE, body);
  return data;
}

/**
 * Logout user
 */
export async function apiLogout(): Promise<void> {
  await client.post(API_ENDPOINTS.AUTH.LOGOUT);
}

/**
 * Request password reset
 */
export async function apiForgotPassword(
  body: ForgotPasswordRequest
): Promise<ForgotPasswordResponse> {
  const { data } = await client.post<ForgotPasswordResponse>(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, body);
  return data;
}

/**
 * Verify OTP code
 */
export async function apiVerifyOTP(
  body: VerifyOTPRequest
): Promise<VerifyOTPResponse> {
  const { data } = await client.post<VerifyOTPResponse>(API_ENDPOINTS.AUTH.VERIFY_OTP, body);
  return data;
}

/**
 * Reset password with token
 */
export async function apiResetPassword(
  body: ResetPasswordRequest
): Promise<ResetPasswordResponse> {
  const { data } = await client.post<ResetPasswordResponse>(API_ENDPOINTS.AUTH.RESET_PASSWORD, body);
  return data;
}

/**
 * Get Google OAuth URL
 */
export async function apiGoogleLoginUrl(): Promise<{ url: string }> {
  const { data } = await client.get<{ url: string }>(API_ENDPOINTS.AUTH.GOOGLE_LOGIN);
  return data;
}

/**
 * Handle Google OAuth callback
 */
export async function apiGoogleCallback(params: { code: string; state?: string }): Promise<AuthResponse> {
  const { data } = await client.get<AuthResponse>(API_ENDPOINTS.AUTH.GOOGLE_CALLBACK, { params });
  return data;
}

/**
 * Refresh access token
 */
export async function apiRefreshToken(refreshToken: string): Promise<{ token: string }> {
  const { data } = await client.post<{ token: string }>(API_ENDPOINTS.AUTH.REFRESH, {
    refresh_token: refreshToken
  });
  return data;
}

/** ===== Health Check Functions ===== **/

/**
 * Basic health check
 */
export async function apiHealthz() {
  const { data } = await client.get(API_ENDPOINTS.HEALTH.HEALTHZ);
  return data;
}

/**
 * Liveness check
 */
export async function apiLivez() {
  const { data } = await client.get(API_ENDPOINTS.HEALTH.LIVEZ);
  return data;
}

/**
 * Readiness check
 */
export async function apiReadyz() {
  const { data } = await client.get(API_ENDPOINTS.HEALTH.READYZ);
  return data;
}
