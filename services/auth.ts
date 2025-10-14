// services/auth.ts
import api, { setToken, clearToken } from "../lib/apiClient";
import {
  LoginRequest, RegisterRequest, AuthResponse, UserResponse,
  ForgotPasswordRequest, ForgotPasswordResponse,
  VerifyOTPRequest, VerifyOTPResponse,
  ResetPasswordRequest, ResetPasswordResponse
} from "../types/dto";

// POST /api/auth/register  → 201 + AuthResponse  :contentReference[oaicite:13]{index=13}
export async function register(data: RegisterRequest) {
  const res = await api.post<AuthResponse>("/api/auth/register", data);
  await setToken(res.data.token);
  return res.data;
}

// POST /api/auth/login  → 200 + AuthResponse  :contentReference[oaicite:14]{index=14}
export async function login(data: LoginRequest) {
  const res = await api.post<AuthResponse>("/api/auth/login", data);
  await setToken(res.data.token);
  return res.data;
}

// GET /api/auth/profile  (Bearer) → UserResponse  :contentReference[oaicite:15]{index=15}
export async function getProfile() {
  const res = await api.get<UserResponse>("/api/auth/profile");
  return res.data;
}

export async function logout() {
  await clearToken();
}

// POST /api/auth/forgot-password → ForgotPasswordResponse  :contentReference[oaicite:16]{index=16}
export async function forgotPassword(data: ForgotPasswordRequest) {
  const res = await api.post<ForgotPasswordResponse>("/api/auth/forgot-password", data);
  return res.data;
}

// POST /api/auth/verify-otp → VerifyOTPResponse  (ได้ reset_token ชั่วคราว)  :contentReference[oaicite:17]{index=17}
export async function verifyOTP(data: VerifyOTPRequest) {
  const res = await api.post<VerifyOTPResponse>("/api/auth/verify-otp", data);
  return res.data;
}

// POST /api/auth/reset-password → ResetPasswordResponse  (ใช้ reset_token + new_password) :contentReference[oaicite:18]{index=18}
export async function resetPassword(data: ResetPasswordRequest) {
  const res = await api.post<ResetPasswordResponse>("/api/auth/reset-password", data);
  return res.data;
}

// GET /api/auth/google/login → URL  :contentReference[oaicite:19]{index=19}
export async function getGoogleAuthUrl() {
  const res = await api.get<{ [k: string]: string }>("/api/auth/google/login");
  return res.data;
}

// GET /api/auth/google/callback?code=...&state=... → AuthResponse  :contentReference[oaicite:20]{index=20}
export async function googleCallback(code: string, state?: string) {
  const res = await api.get<AuthResponse>("/api/auth/google/callback", { params: { code, state } });
  await setToken(res.data.token);
  return res.data;
}
