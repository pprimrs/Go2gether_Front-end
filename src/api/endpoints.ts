// src/api/endpoints.ts
export const API_ENDPOINTS = {
  // Auth endpoints
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
  
  // Health endpoints
  HEALTH: {
    HEALTHZ: '/healthz',
    LIVEZ: '/livez',
    READYZ: '/readyz',
  },
  
  // User endpoints (for future use)
  USER: {
    PROFILE: '/api/user/profile',
    UPDATE_PROFILE: '/api/user/profile',
    DELETE_ACCOUNT: '/api/user/account',
  },
  
  // Trip endpoints (for future use)
  TRIP: {
    LIST: '/api/trips',
    CREATE: '/api/trips',
    GET: '/api/trips/:id',
    UPDATE: '/api/trips/:id',
    DELETE: '/api/trips/:id',
  },
} as const;

// Helper function to build URLs with parameters
export const buildUrl = (endpoint: string, params?: Record<string, string | number>): string => {
  if (!params) return endpoint;
  
  let url = endpoint;
  Object.entries(params).forEach(([key, value]) => {
    url = url.replace(`:${key}`, String(value));
  });
  
  return url;
};
