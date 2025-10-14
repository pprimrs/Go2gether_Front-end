// src/api/auth.ts
import { client } from "./client";

/** ===== Types from spec ===== **/
export type LoginRequest = { email: string; password: string }; // /api/auth/login
export type RegisterRequest = {
  username: string; // REQUIRED
  email: string;    // REQUIRED
  password: string; // REQUIRED (>= 6)
  // optional fields (เพิ่มได้ตามสเปก)
  display_name?: string;
  phone?: string;
  birth_date?: string;
  allergic_drugs?: string;
  allergic_food?: string;
  chronic_disease?: string;
  emergency_contact?: string;
  food_preferences?: string;
  food_categories?: string;
  activities?: string;
};

export type UserResponse = {
  id?: string;
  username?: string;
  email?: string;
  display_name?: string;
  role?: string;
  phone?: string;
  avatar_url?: string;
  birth_date?: string;
  created_at?: string;
  updated_at?: string;
  // …(field อื่น ๆ ตาม spec เป็น string ทั้งหมด)
};

export type AuthResponse = {
  token: string;
  user: UserResponse;
};

export type ForgotPasswordRequest = { email: string };
export type ForgotPasswordResponse = {
  email: string;
  expires_in: string;
  message: string;
};

export type VerifyOTPRequest = { email: string; code: string };
export type VerifyOTPResponse = {
  reset_token: string;
  expires_in: string;
  message: string;
};

export type ResetPasswordRequest = { reset_token: string; new_password: string };
export type ResetPasswordResponse = { message: string };

/** ===== Endpoints (ตาม paths ของ spec) ===== **/
export async function apiLogin(body: LoginRequest): Promise<AuthResponse> {
  const { data } = await client.post<AuthResponse>("/api/auth/login", body);
  return data;
}

export async function apiRegister(body: RegisterRequest): Promise<AuthResponse> {
  const { data } = await client.post<AuthResponse>("/api/auth/register", body);
  return data;
}

export async function apiProfile(): Promise<UserResponse> {
  const { data } = await client.get<UserResponse>("/api/auth/profile");
  return data;
}

export async function apiForgotPassword(
  body: ForgotPasswordRequest
): Promise<ForgotPasswordResponse> {
  const { data } = await client.post<ForgotPasswordResponse>("/api/auth/forgot-password", body);
  return data;
}

export async function apiVerifyOTP(
  body: VerifyOTPRequest
): Promise<VerifyOTPResponse> {
  const { data } = await client.post<VerifyOTPResponse>("/api/auth/verify-otp", body);
  return data;
}

export async function apiResetPassword(
  body: ResetPasswordRequest
): Promise<ResetPasswordResponse> {
  const { data } = await client.post<ResetPasswordResponse>("/api/auth/reset-password", body);
  return data;
}

/** Google OAuth (ถ้าจะใช้บนมือถือควรเปิดผ่าน WebBrowser) */
export async function apiGoogleLoginUrl(): Promise<{ url: string }> {
  const { data } = await client.get<{ url: string }>("/api/auth/google/login");
  return data;
}
export async function apiGoogleCallback(params: { code: string; state?: string }): Promise<AuthResponse> {
  const { data } = await client.get<AuthResponse>("/api/auth/google/callback", { params });
  return data;
}

/** Health */
export async function apiHealthz() {
  const { data } = await client.get("/healthz");
  return data;
}
