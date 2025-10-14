// lib/apiClient.ts
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { BASE_URL } from "../constants/env";

export const TOKEN_KEY = "go2_token";

export async function getToken() {
  return SecureStore.getItemAsync(TOKEN_KEY);
}
export async function setToken(token: string) {
  return SecureStore.setItemAsync(TOKEN_KEY, token);
}
export async function clearToken() {
  return SecureStore.deleteItemAsync(TOKEN_KEY);
}

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" }
});

// แนบ Bearer อัตโนมัติถ้ามี token
api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
