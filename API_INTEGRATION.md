# API Integration Guide

This document explains how the Go2gether frontend is integrated with the backend API.

## 🏗️ Architecture Overview

The API integration follows a clean, modular architecture:

```
src/
├── api/
│   ├── client.ts          # Axios client with interceptors
│   ├── auth.ts            # Auth API functions
│   ├── endpoints.ts       # Centralized endpoint definitions
│   └── services/
│       └── auth.service.ts # Auth service class
├── types/
│   └── auth.types.ts      # TypeScript type definitions
├── utils/
│   ├── storage.ts         # Token storage utilities
│   ├── logger.ts          # Logging utilities
│   └── apiTest.ts         # API testing utilities
├── store/
│   └── authStore.tsx      # React context for auth state
└── config/
    └── env.config.ts      # Environment configuration
```

## 🔧 Configuration

### Environment Setup

The API URL is configured in `src/config/env.config.ts`:

```typescript
// Development
API_URL: 'https://go2gether.vercel.app'

// Production
API_URL: 'https://api.go2gether.com'
```

### Environment Variables

Set these environment variables in your `.env` file:

```bash
EXPO_PUBLIC_API_URL=https://go2gether.vercel.app
EXPO_PUBLIC_GOOGLE_CLIENT_ID_DEV=your_google_client_id
```

## 🚀 Usage

### 1. Using the Auth Store (Recommended)

```tsx
import { useAuth } from '@/store/authStore';

function LoginScreen() {
  const { signInWithEmail, signUpWithEmail, user, loading } = useAuth();
  
  const handleLogin = async (email: string, password: string) => {
    try {
      await signInWithEmail({ email, password });
      // User is now logged in
    } catch (error) {
      // Handle error
    }
  };
  
  return (
    // Your UI components
  );
}
```

### 2. Using API Functions Directly

```tsx
import { apiLogin, apiRegister, apiProfile } from '@/api/auth';

// Login
const response = await apiLogin({ email, password });
console.log('User:', response.user);
console.log('Token:', response.token);

// Register
const newUser = await apiRegister({
  email: 'user@example.com',
  password: 'password123',
  username: 'username',
  display_name: 'Display Name'
});

// Get profile
const profile = await apiProfile();
```

### 3. Using the Auth Service

```tsx
import { authService } from '@/api/services/auth.service';

// All auth operations
await authService.login({ email, password });
await authService.register(userData);
await authService.getProfile();
await authService.logout();
```

## 🔐 Authentication Flow

1. **Login/Register**: User credentials are sent to the API
2. **Token Storage**: JWT token is stored securely using Expo SecureStore
3. **Auto-attach**: Token is automatically attached to subsequent requests
4. **Token Refresh**: Expired tokens are automatically refreshed
5. **Logout**: Tokens are cleared from storage

## 📡 API Endpoints

All endpoints are defined in `src/api/endpoints.ts`:

```typescript
export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    PROFILE: '/api/auth/profile',
    REFRESH: '/api/auth/refresh',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    VERIFY_OTP: '/api/auth/verify-otp',
    RESET_PASSWORD: '/api/auth/reset-password',
    GOOGLE_LOGIN: '/api/auth/google/login',
    GOOGLE_CALLBACK: '/api/auth/google/callback',
  },
  HEALTH: {
    HEALTHZ: '/healthz',
    LIVEZ: '/livez',
    READYZ: '/readyz',
  },
};
```

## 🧪 Testing

### Test API Connectivity

```tsx
import { testApi } from '@/utils/apiTest';

// Run all tests
const results = await testApi();
console.log('Connectivity:', results.connectivity);
console.log('Auth:', results.auth);
```

### Manual Testing

1. **Health Check**: Test if the API is running
2. **Authentication**: Test login/register flow
3. **Token Management**: Test token storage and refresh
4. **Error Handling**: Test error scenarios

## 🛠️ Error Handling

The API client includes comprehensive error handling:

- **Network Errors**: Connection timeouts, network failures
- **HTTP Errors**: 4xx, 5xx status codes
- **Token Errors**: Invalid/expired tokens
- **Validation Errors**: Invalid request data

All errors are logged using the logger utility and can be caught in your components.

## 🔄 Token Management

### Automatic Token Refresh

The API client automatically handles token refresh:

```typescript
// In client.ts
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try to refresh token
      const newToken = await refreshToken();
      // Retry original request
    }
  }
);
```

### Manual Token Management

```typescript
import { TokenStorage } from '@/utils/storage';

// Store token
await TokenStorage.setAccessToken(token);

// Get token
const token = await TokenStorage.getAccessToken();

// Clear tokens
await TokenStorage.clearTokens();
```

## 📱 Platform Support

- **iOS**: Uses Expo SecureStore for secure token storage
- **Android**: Uses Expo SecureStore for secure token storage  
- **Web**: Falls back to localStorage (less secure)

## 🔍 Debugging

### Enable Logging

Set `ENABLE_LOGS: true` in your environment configuration to see detailed API logs.

### Common Issues

1. **CORS Errors**: Make sure your API server allows requests from your app
2. **Network Errors**: Check if the API URL is correct and accessible
3. **Token Errors**: Verify token format and expiration
4. **Type Errors**: Ensure TypeScript types match your API responses

## 🚀 Deployment

### Development
```bash
npm start
# API_URL will be https://go2gether.vercel.app
```

### Production
```bash
expo build
# API_URL will be https://api.go2gether.com
```

## 📚 Examples

See `src/examples/AuthExample.tsx` for a complete example of how to use the authentication API in a React component.

## 🤝 Contributing

When adding new API endpoints:

1. Add the endpoint to `src/api/endpoints.ts`
2. Create the API function in the appropriate file
3. Add TypeScript types in `src/types/`
4. Update the service class if needed
5. Add tests in `src/utils/apiTest.ts`
