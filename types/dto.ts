// types/dto.ts
export type ErrorResponse = { error?: string; message?: string };

export type LoginRequest = { email: string; password: string }; // ตาม required ในสเปค :contentReference[oaicite:3]{index=3}
export type RegisterRequest = {
  email: string;
  password: string;          // minLength 6 ในสเปค :contentReference[oaicite:4]{index=4}
  username: string;
  display_name?: string;
  phone?: string;
  birth_date?: string;       // พาร์สเป็น time ได้ตามคำอธิบายสเปค
  allergic_drugs?: string;
  allergic_food?: string;
  chronic_disease?: string;
  emergency_contact?: string;
  food_preferences?: string;
  activities?: string;
  food_categories?: string;
};

export type UserResponse = {
  id?: string;
  username?: string;
  display_name?: string;
  email?: string;
  phone?: string;
  role?: string;
  avatar_url?: string;
  birth_date?: string;
  created_at?: string;
  updated_at?: string;
  // สนามอื่น ๆ ตามสเปค
}; // :contentReference[oaicite:5]{index=5}

export type AuthResponse = { token: string; user: UserResponse }; // :contentReference[oaicite:6]{index=6}

export type ForgotPasswordRequest = { email: string }; // :contentReference[oaicite:7]{index=7}
export type ForgotPasswordResponse = { email?: string; expires_in?: string; message?: string }; // :contentReference[oaicite:8]{index=8}

export type VerifyOTPRequest = { email: string; code: string }; // :contentReference[oaicite:9]{index=9}
export type VerifyOTPResponse = { message?: string; reset_token?: string; expires_in?: string }; // :contentReference[oaicite:10]{index=10}

export type ResetPasswordRequest = { reset_token: string; new_password: string }; // :contentReference[oaicite:11]{index=11}
export type ResetPasswordResponse = { message?: string }; // :contentReference[oaicite:12]{index=12}
