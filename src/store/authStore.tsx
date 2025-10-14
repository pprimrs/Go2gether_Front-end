// src/store/authStore.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import { apiLogin, apiRegister, apiProfile } from "../api/auth";

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

type SignInResult = { ok: true } | { ok: false; message: string };

type AuthContextValue = {
  user: UserResponse | null;
  token: string | null;
  loading: boolean;
  signInWithEmail: (p: { email: string; password: string }) => Promise<SignInResult>;
  signUpWithEmail: (p: RegisterRequest) => Promise<void>;
  fetchProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

/** ===== Safe storage helpers (รองรับ web) ===== */
const TOKEN_KEY = "token";

async function storageGet(key: string): Promise<string | null> {
  try {
    if (Platform.OS === "web") {
      return typeof window !== "undefined" ? window.localStorage.getItem(key) : null;
    }
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
  } catch {}
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
  } catch {}
}

/** ===== Shapes & Unwrap (ยืดหยุ่น) ===== */
// รูปทรงตอบกลับที่เรารับได้จาก auth API (ยืดหยุ่น ไม่ lock แข็ง)
type AuthResponseShape = {
  token?: string;
  accessToken?: string;
  jwt?: string;
  user?: UserResponse;
  profile?: UserResponse;
  [k: string]: any;
};

// รองรับทั้งกรณีเป็น T ตรง ๆ หรือเป็น { data: T } หรือแบบอื่นที่ unknown
function unwrap<T = any>(r: unknown): T {
  const anyResp = r as any;
  if (anyResp && typeof anyResp === "object" && "data" in anyResp) {
    return anyResp.data as T;
  }
  return anyResp as T;
}

/** ===== Utils ===== */
function pickToken(data: any): string | null {
  if (!data) return null;
  return data.token ?? data.accessToken ?? data.jwt ?? null;
}
function pickUser(data: any): UserResponse | null {
  const u = data?.user ?? data?.profile ?? null;
  return u ?? null;
}
function apiErrorMessage(err: any, fallback = "Invalid credentials") {
  return (
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    fallback
  );
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

  // bootstrap token
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

  /** ===== Real API login only ===== */
  const signInWithEmail = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<SignInResult> => {
    try {
      const resp = await apiLogin({ email, password });

      // ⬇⬇ จุดสำคัญ: ไม่ล็อคชนิดอินพุตอีกต่อไป
      const data = unwrap<AuthResponseShape>(resp);

      const tk = pickToken(data);
      if (!tk) return { ok: false, message: "Missing token from server." };

      await storageSet(TOKEN_KEY, tk);
      setToken(tk);

      const u = pickUser(data) ?? ({ id: "me", email } as UserResponse);
      setUser(u);

      return { ok: true };
    } catch (err: any) {
      return { ok: false, message: apiErrorMessage(err) };
    }
  };

  /** ===== Real API signup only ===== */
  const signUpWithEmail = async (p: RegisterRequest) => {
    const payload = {
      email: p.email,
      password: p.password,
      username: p.username ?? p.name ?? p.email.split("@")[0],
      display_name: p.display_name ?? p.name ?? p.username ?? "",
      name: p.name ?? p.display_name ?? p.username,
    };

    const regResp = await apiRegister(payload);
    // ถ้าต้องอ่านข้อมูลหลังสมัคร:
    // const regData = unwrap<AuthResponseShape>(regResp);

    // สมัครสำเร็จ -> ล็อกอินทันที
    const res = await signInWithEmail({ email: payload.email, password: payload.password });
    if (!res.ok) throw new Error(res.message || "Auto sign-in after signup failed");
  };

  const fetchProfile = async () => {
    if (!token) return;
    try {
      const resp = await apiProfile();
      const data = unwrap<AuthResponseShape>(resp);
      const u = pickUser(data);
      if (u) setUser(u);
    } catch {
      await signOut();
    }
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






