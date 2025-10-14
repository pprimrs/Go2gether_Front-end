// src/store/authStore.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

/** ===== Types ===== */
export type UserResponse = {
  id: string;
  email: string;
  name?: string;
  username?: string;
  display_name?: string;
};

export type RegisterRequest = {
  email: string;
  password: string;
  name?: string;
  username?: string;
  display_name?: string;
};

type AuthContextValue = {
  user: UserResponse | null;
  token: string | null;
  loading: boolean;
  signInWithEmail: (p: { email: string; password: string }) => Promise<void>;
  signUpWithEmail: (p: RegisterRequest) => Promise<void>;
  fetchProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

/** ===== Safe storage helpers (รองรับ web) ===== */
const TOKEN_KEY = "token";

async function storageGet(key: string): Promise<string | null> {
  try {
    if (Platform.OS === "web") {
      // RN Web ใช้ localStorage แทน
      return typeof window !== "undefined" ? window.localStorage.getItem(key) : null;
    }
    // native: เช็คว่า SecureStore ใช้ได้ไหม
    const ok = await SecureStore.isAvailableAsync();
    if (!ok) return null;
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

async function storageSet(key: string, value: string): Promise<void> {
  try {
    if (Platform.OS === "web") {
      if (typeof window !== "undefined") window.localStorage.setItem(key, value);
      return;
    }
    const ok = await SecureStore.isAvailableAsync();
    if (!ok) return;
    await SecureStore.setItemAsync(key, value);
  } catch {
    // swallow
  }
}

async function storageDelete(key: string): Promise<void> {
  try {
    if (Platform.OS === "web") {
      if (typeof window !== "undefined") window.localStorage.removeItem(key);
      return;
    }
    const ok = await SecureStore.isAvailableAsync();
    if (!ok) return;
    await SecureStore.deleteItemAsync(key);
  } catch {
    // swallow
  }
}

/** ===== Context / Hook ===== */
const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

/** ===== Provider ===== */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // bootstrap token from storage (รองรับ web)
  useEffect(() => {
    (async () => {
      try {
        const t = await storageGet(TOKEN_KEY);
        if (t) setToken(t);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const signInWithEmail = async ({ email, password }: { email: string; password: string }) => {
    // TODO: call your API
    const fakeToken = "token.sample";
    await storageSet(TOKEN_KEY, fakeToken);
    setToken(fakeToken);
    setUser({ id: "u1", email });
  };

  const signUpWithEmail = async (p: RegisterRequest) => {
    const payload = {
      email: p.email,
      password: p.password,
      username: p.username ?? p.name ?? p.email.split("@")[0],
      display_name: p.display_name ?? p.name ?? p.username ?? "",
      name: p.name ?? p.display_name ?? p.username,
    };
    // TODO: await apiRegister(payload)
    await signInWithEmail({ email: payload.email, password: payload.password });
    setUser((u) => ({
      ...(u ?? { id: "u1", email: payload.email }),
      name: payload.display_name,
      username: payload.username,
      display_name: payload.display_name,
    }));
  };

  const fetchProfile = async () => {
    // TODO: call apiProfile() then setUser(...)
  };

  const signOut = async () => {
    await storageDelete(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, token, loading, signInWithEmail, signUpWithEmail, fetchProfile, signOut }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;



