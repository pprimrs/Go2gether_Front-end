// src/api/client.ts
import axios, { AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';

// ⚙️ กำหนดจาก env (Expo SDK 49+ ใช้ EXPO_PUBLIC_*)
const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.example.com';
const TIMEOUT_MS = 15_000;
const TOKEN_KEY = 'auth_token';

export async function setToken(token: string | null) {
  if (token) {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
}

export async function getToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

export const http = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT_MS,
});

// attach token
http.interceptors.request.use(async (config) => {
  const token = await getToken();
  return token
    ? {
        ...config,
        headers: {
          ...(config.headers as any),
          Authorization: `Bearer ${token}`,
        },
      }
    : config;
});


// normalize errors
export type ApiError = {
  status: number | null;
  code?: string;
  message: string;
  details?: unknown;
};

function toApiError(err: unknown): ApiError {
  if (axios.isAxiosError(err)) {
    const e = err as AxiosError<any>;
    const status = e.response?.status ?? null;
    const message =
      e.response?.data?.message ||
      e.message ||
      'Network error, please try again.';
    return {
      status,
      code: e.code,
      message,
      details: e.response?.data ?? e.toJSON?.(),
    };
  }
  return { status: null, message: 'Unknown error', details: err };
}

// simple helpers
export async function get<T>(url: string, params?: any): Promise<T> {
  try {
    const { data } = await http.get<T>(url, { params });
    return data;
  } catch (e) {
    throw toApiError(e);
  }
}

export async function post<T>(url: string, body?: any): Promise<T> {
  try {
    const { data } = await http.post<T>(url, body);
    return data;
  } catch (e) {
    throw toApiError(e);
  }
}

export async function put<T>(url: string, body?: any): Promise<T> {
  try {
    const { data } = await http.put<T>(url, body);
    return data;
  } catch (e) {
    throw toApiError(e);
  }
}

export async function patch<T>(url: string, body?: any): Promise<T> {
  try {
    const { data } = await http.patch<T>(url, body);
    return data;
  } catch (e) {
    throw toApiError(e);
  }
}

export async function del<T>(url: string): Promise<T> {
  try {
    const { data } = await http.delete<T>(url);
    return data;
  } catch (e) {
    throw toApiError(e);
  }
}
