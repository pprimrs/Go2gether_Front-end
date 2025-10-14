// src/types/auth.types.ts
export type ErrorResponse = { 
  error?: string; 
  message?: string; 
};

export type LoginRequest = { 
  email: string; 
  password: string; 
};

export type RegisterRequest = {
  email: string;
  password: string;          // minLength 6
  username: string;
  display_name?: string;
  phone?: string;
  birth_date?: string;       // Will be parsed to time.Time
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
  // Additional fields from API spec
  activities?: string;
  allergic_drugs?: string;
  allergic_food?: string;
  chronic_disease?: string;
  emergency_contact?: string;
  food_preferences?: string;
  food_categories?: string;
};

export type AuthResponse = { 
  token: string; 
  user: UserResponse;
  refreshToken?: string; // For token refresh functionality
};

export type ForgotPasswordRequest = { 
  email: string; 
};

export type ForgotPasswordResponse = { 
  email?: string; 
  expires_in?: string; 
  message?: string; 
};

export type VerifyOTPRequest = { 
  email: string; 
  code: string; 
};

export type VerifyOTPResponse = { 
  message?: string; 
  reset_token?: string; 
  expires_in?: string; 
};

export type ResetPasswordRequest = { 
  reset_token: string; 
  new_password: string; 
};

export type ResetPasswordResponse = { 
  message?: string; 
};

export type HealthResponse = {
  status: string;
  details?: any;
};
