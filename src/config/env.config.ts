// src/config/env.config.ts
import Constants from 'expo-constants';

export type Environment = 'development' | 'staging' | 'production';

interface EnvConfig {
  API_URL: string;
  API_TIMEOUT: number;
  GOOGLE_CLIENT_ID: string;
  APP_ENV: Environment;
  IS_DEV: boolean;
  IS_PROD: boolean;
  ENABLE_LOGS: boolean;
}

const getEnvVars = (): EnvConfig => {
  const releaseChannel = Constants.expoConfig?.extra?.releaseChannel;
  
  // Production
  if (releaseChannel === 'production') {
    return {
      //API_URL: 'https://api.go2gether.com', prod
      API_URL: 'https://api.go2gether.com', // local
      API_TIMEOUT: 15000,
      GOOGLE_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_PROD || '',
      APP_ENV: 'production',
      IS_DEV: false,
      IS_PROD: true,
      ENABLE_LOGS: false,
    };
  }
  
  // Staging
  if (releaseChannel === 'staging') {
    return {
      API_URL: 'https://staging-api.go2gether.com',
      API_TIMEOUT: 15000,
      GOOGLE_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_STAGING || '',
      APP_ENV: 'staging',
      IS_DEV: false,
      IS_PROD: false,
      ENABLE_LOGS: true,
    };
  }
  
  // Development (default)
  return {
    API_URL: process.env.EXPO_PUBLIC_API_URL || 'https://go2gether.vercel.app',
    API_TIMEOUT: 30000,
    GOOGLE_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_DEV || '',
    APP_ENV: 'development',
    IS_DEV: true,
    IS_PROD: false,
    ENABLE_LOGS: true,
  };
};

export const ENV = getEnvVars();

// Type-safe environment validation
export const validateEnv = (): void => {
  const required: (keyof EnvConfig)[] = ['API_URL', 'GOOGLE_CLIENT_ID'];
  const missing = required.filter(key => !ENV[key]);
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
};