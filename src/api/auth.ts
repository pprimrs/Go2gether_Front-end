// services/auth.ts
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const API_BASE_URL = 'http://localhost:8080/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
});


export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export type User = {
  id: string;
  username: string;
  email: string;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken?: string;
  user: User;
};

/* ===================== Service ===================== */
class AuthService {
  private baseURL = API_BASE_URL; // เผื่ออยากใช้ภายหลัง

  async login(payload: LoginRequest): Promise<User> {
    const { data } = await api.post<AuthResponse>("/auth/login", payload);
    await SecureStore.setItemAsync("accessToken", data.accessToken);
    if (data.refreshToken) {
      await SecureStore.setItemAsync("refreshToken", data.refreshToken);
    }
    return data.user;
  }

  async register(payload: RegisterRequest): Promise<User> {
    const { data } = await api.post<AuthResponse>("/auth/register", payload);
    await SecureStore.setItemAsync("accessToken", data.accessToken);
    if (data.refreshToken) {
      await SecureStore.setItemAsync("refreshToken", data.refreshToken);
    }
    return data.user;
  }

  async logout() {
    await SecureStore.deleteItemAsync("accessToken");
    await SecureStore.deleteItemAsync("refreshToken");
  }
}

export const auth = new AuthService();

/* ===================== Error helper ===================== */
export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    // พยายามอ่านข้อความจาก backend ก่อน
    return ((err.response?.data as any)?.message ?? err.message ?? "Request failed");
  }
  return "Unexpected error";
}

