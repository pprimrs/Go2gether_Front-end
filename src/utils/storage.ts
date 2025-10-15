// src/utils/storage.ts
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { logger } from './logger';

export type StorageKey = string;

class Storage {
  private isAvailable: boolean;

  constructor() {
    this.isAvailable = Platform.OS !== 'web';
    if (!this.isAvailable) {
      logger.warn('SecureStore not available on web, using localStorage fallback');
    }
  }

  /**
   * Store token securely
   */
  async setToken(key: StorageKey, value: string): Promise<void> {
    try {
      if (this.isAvailable) {
        await SecureStore.setItemAsync(key, value);
      } else {
        // Web fallback (less secure)
        localStorage.setItem(key, value);
      }
      logger.info(`Token stored: ${key}`);
    } catch (error) {
      logger.error(`Failed to store token: ${key}`, error);
      throw new Error(`Storage error: ${error}`);
    }
  }

  /**
   * Retrieve token
   */
  async getToken(key: StorageKey): Promise<string | null> {
    try {
      if (this.isAvailable) {
        return await SecureStore.getItemAsync(key);
      } else {
        return localStorage.getItem(key);
      }
    } catch (error) {
      logger.error(`Failed to retrieve token: ${key}`, error);
      return null;
    }
  }

  /**
   * Remove token
   */
  async clearToken(key: StorageKey): Promise<void> {
    try {
      if (this.isAvailable) {
        await SecureStore.deleteItemAsync(key);
      } else {
        localStorage.removeItem(key);
      }
      logger.info(`Token cleared: ${key}`);
    } catch (error) {
      logger.error(`Failed to clear token: ${key}`, error);
    }
  }

  /**
   * Clear all tokens (useful for logout)
   */
  async clearAll(): Promise<void> {
    const keys = ['auth_token', 'refresh_token', 'user_data'];
    await Promise.all(keys.map(key => this.clearToken(key)));
  }

  /**
   * Store JSON data
   */
  async setObject<T>(key: StorageKey, value: T): Promise<void> {
    try {
      const json = JSON.stringify(value);
      await this.setToken(key, json);
    } catch (error) {
      logger.error(`Failed to store object: ${key}`, error);
      throw error;
    }
  }

  /**
   * Retrieve JSON data
   */
  async getObject<T>(key: StorageKey): Promise<T | null> {
    try {
      const json = await this.getToken(key);
      return json ? JSON.parse(json) : null;
    } catch (error) {
      logger.error(`Failed to retrieve object: ${key}`, error);
      return null;
    }
  }

  /**
   * Check if key exists
   */
  async hasKey(key: StorageKey): Promise<boolean> {
    const value = await this.getToken(key);
    return value !== null;
  }
}

export const storage = new Storage();

// Convenience exports for common operations
export const TokenStorage = {
  setAccessToken: (token: string) => storage.setToken('auth_token', token),
  getAccessToken: () => storage.getToken('auth_token'),
  setRefreshToken: (token: string) => storage.setToken('refresh_token', token),
  getRefreshToken: () => storage.getToken('refresh_token'),
  setItem: (key: string, value: string) => storage.setToken(key, value),
  getItem: (key: string) => storage.getToken(key),
  setObject: <T>(key: string, value: T) => storage.setObject(key, value),
  getObject: <T>(key: string) => storage.getObject<T>(key),
  clearTokens: () => storage.clearAll(),
};