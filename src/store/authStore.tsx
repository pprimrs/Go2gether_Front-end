// src/store/auth.ts
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as SecureStore from "expo-secure-store";
import {
  apiLogin, apiRegister, apiProfile,
  LoginRequest, RegisterRequest, AuthResponse, UserResponse
} from "../api/auth";

type AuthContextValue = {
  user: UserResponse | null;
  token: string | null;
  loading: boolean;
  signInWithEmail: (p: LoginRequest) => Promise<void>;
  signUpWithEmail: (p: RegisterRequest) => Promise<void>;
  fetchProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [t, u] = await Promise.all([
          SecureStore.getItemAsync("auth_token"),
          SecureStore.getItemAsync("auth_user"),
        ]);
        if (t) setToken(t);
        if (u) setUser(JSON.parse(u));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const setSession = async (resp: AuthResponse) => {
    setToken(resp.token);
    setUser(resp.user);
    await SecureStore.setItemAsync("auth_token", resp.token);
    await SecureStore.setItemAsync("auth_user", JSON.stringify(resp.user));
  };

  const signInWithEmail = async (p: LoginRequest) => {
    const data = await apiLogin(p);
    await setSession(data);
  };

  const signUpWithEmail = async (p: RegisterRequest) => {
    const data = await apiRegister(p);
    await setSession(data);
  };

  const fetchProfile = async () => {
    const profile = await apiProfile();
    setUser(profile);
    await SecureStore.setItemAsync("auth_user", JSON.stringify(profile));
  };

  const signOut = async () => {
    setUser(null);
    setToken(null);
    await SecureStore.deleteItemAsync("auth_token");
    await SecureStore.deleteItemAsync("auth_user");
  };

  const value = useMemo(
    () => ({ user, token, loading, signInWithEmail, signUpWithEmail, fetchProfile, signOut }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
