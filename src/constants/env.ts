// src/constants/env.ts
import { ENV } from '../config/env.config';

// Re-export environment configuration
export const API_CONFIG = {
  BASE_URL: ENV.API_URL,
  TIMEOUT: ENV.API_TIMEOUT,
  GOOGLE_CLIENT_ID: ENV.GOOGLE_CLIENT_ID,
} as const;

// API endpoints configuration
export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    PROFILE: '/api/auth/profile',
    REFRESH: '/api/auth/refresh',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    VERIFY_OTP: '/api/auth/verify-otp',
    RESET_PASSWORD: '/api/auth/reset-password',
    GOOGLE_LOGIN: '/api/auth/google/login',
    GOOGLE_CALLBACK: '/api/auth/google/callback',
  },
  HEALTH: {
    HEALTHZ: '/healthz',
    LIVEZ: '/livez',
    READYZ: '/readyz',
  },
} as const;

// App configuration
export const APP_CONFIG = {
  NAME: 'Go2gether',
  VERSION: '1.0.0',
  ENVIRONMENT: ENV.APP_ENV,
  IS_DEV: ENV.IS_DEV,
  IS_PROD: ENV.IS_PROD,
  ENABLE_LOGS: ENV.ENABLE_LOGS,
} as const;
