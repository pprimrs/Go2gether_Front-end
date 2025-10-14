// src/api/client.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { ENV } from "../config/env.config";
import { logger } from "../utils/logger";
import { TokenStorage } from "../utils/storage";

// Get API URL from environment configuration
const API_URL = ENV.API_URL;

// Create axios instance with proper configuration
export const client: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: ENV.API_TIMEOUT,
  headers: { 
    "Content-Type": "application/json",
    "Accept": "application/json"
  },
});

// Request interceptor to add auth token
client.interceptors.request.use(
  async (config: AxiosRequestConfig) => {
    try {
      const token = await TokenStorage.getAccessToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      logger.debug('API Request', {
        method: config.method?.toUpperCase(),
        url: config.url,
        hasAuth: !!token
      });
    } catch (error) {
      logger.error('Failed to add auth token to request', error);
    }
    return config;
  },
  (error) => {
    logger.error('Request interceptor error', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
client.interceptors.response.use(
  (response: AxiosResponse) => {
    logger.debug('API Response', {
      status: response.status,
      url: response.config.url
    });
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh token
        const refreshToken = await TokenStorage.getRefreshToken();
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/api/auth/refresh`, {
            refresh_token: refreshToken
          });
          
          const { token } = response.data;
          await TokenStorage.setAccessToken(token);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return client(originalRequest);
        }
      } catch (refreshError) {
        logger.error('Token refresh failed', refreshError);
        // Clear tokens and redirect to login
        await TokenStorage.clearTokens();
      }
    }
    
    // Log error details
    logger.error('API Error', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      url: error.config?.url
    });
    
    return Promise.reject(error);
  }
);

// Export a function to update base URL if needed
export const updateBaseURL = (newURL: string) => {
  client.defaults.baseURL = newURL;
  logger.info('API base URL updated', { newURL });
};

// Export a function to clear auth and reset client
export const resetClient = async () => {
  await TokenStorage.clearTokens();
  logger.info('API client reset - tokens cleared');
};