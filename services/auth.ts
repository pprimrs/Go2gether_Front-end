// services/auth.ts
// This file is deprecated - use src/api/auth.ts instead
// Keeping for backward compatibility but redirecting to new implementation

import {
    apiForgotPassword,
    apiGoogleCallback,
    apiGoogleLoginUrl,
    apiLogin,
    apiLogout,
    apiProfile,
    apiRegister,
    apiResetPassword,
    apiVerifyOTP
} from "../src/api/auth";

import {
    AuthResponse,
    ForgotPasswordRequest, ForgotPasswordResponse,
    LoginRequest, RegisterRequest,
    ResetPasswordRequest, ResetPasswordResponse,
    UserResponse,
    VerifyOTPRequest, VerifyOTPResponse
} from "../src/types/auth.types";

// Re-export functions from the new API implementation
export const register = apiRegister;
export const login = apiLogin;
export const getProfile = apiProfile;
export const logout = apiLogout;
export const forgotPassword = apiForgotPassword;
export const verifyOTP = apiVerifyOTP;
export const resetPassword = apiResetPassword;
export const getGoogleAuthUrl = apiGoogleLoginUrl;
export const googleCallback = apiGoogleCallback;

// Re-export types for convenience
export type {
    AuthResponse, ForgotPasswordRequest,
    ForgotPasswordResponse, LoginRequest,
    RegisterRequest, ResetPasswordRequest,
    ResetPasswordResponse, UserResponse, VerifyOTPRequest,
    VerifyOTPResponse
};

