#!/usr/bin/env node

/**
 * Mock API Server for Go2gether Frontend Testing
 * Run with: node server/mock-api.js
 */

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoints
app.get('/healthz', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  });
});

app.get('/livez', (req, res) => {
  res.json({
    status: 'alive',
    timestamp: new Date().toISOString()
  });
});

app.get('/readyz', (req, res) => {
  res.json({
    status: 'ready',
    timestamp: new Date().toISOString(),
    services: {
      database: 'connected',
      cache: 'connected',
      auth: 'ready'
    }
  });
});

// Mock Auth endpoints
app.post('/api/auth/register', (req, res) => {
  const { email, password, username, display_name } = req.body;
  
  // Mock validation
  if (!email || !password || !username) {
    return res.status(400).json({
      error: 'Missing required fields',
      message: 'Email, password, and username are required'
    });
  }

  // Mock successful registration
  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    user: {
      id: 'mock-user-id',
      email,
      username,
      display_name: display_name || username,
      created_at: new Date().toISOString()
    },
    token: 'mock-jwt-token-' + Date.now()
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Mock validation
  if (!email || !password) {
    return res.status(400).json({
      error: 'Missing credentials',
      message: 'Email and password are required'
    });
  }

  // Mock successful login
  res.json({
    success: true,
    message: 'Login successful',
    user: {
      id: 'mock-user-id',
      email,
      username: 'mockuser',
      display_name: 'Mock User',
      created_at: new Date().toISOString()
    },
    token: 'mock-jwt-token-' + Date.now()
  });
});

app.post('/api/auth/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

app.get('/api/auth/profile', (req, res) => {
  // Mock profile data
  res.json({
    success: true,
    user: {
      id: 'mock-user-id',
      email: 'user@example.com',
      username: 'mockuser',
      display_name: 'Mock User',
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString()
    }
  });
});

app.post('/api/auth/refresh', (req, res) => {
  res.json({
    success: true,
    token: 'mock-refreshed-jwt-token-' + Date.now()
  });
});

// Mock other auth endpoints
app.post('/api/auth/forgot-password', (req, res) => {
  res.json({
    success: true,
    message: 'Password reset email sent'
  });
});

app.post('/api/auth/verify-otp', (req, res) => {
  res.json({
    success: true,
    message: 'OTP verified successfully'
  });
});

app.post('/api/auth/reset-password', (req, res) => {
  res.json({
    success: true,
    message: 'Password reset successfully'
  });
});

// Google OAuth endpoints
app.get('/api/auth/google/login', (req, res) => {
  res.json({
    success: true,
    auth_url: 'https://accounts.google.com/oauth/authorize?client_id=mock&redirect_uri=mock'
  });
});

app.get('/api/auth/google/callback', (req, res) => {
  res.json({
    success: true,
    message: 'Google OAuth callback successful',
    user: {
      id: 'google-user-id',
      email: 'user@gmail.com',
      username: 'googleuser',
      display_name: 'Google User'
    },
    token: 'mock-google-jwt-token-' + Date.now()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Mock API Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/healthz`);
  console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth/*`);
  console.log('Press Ctrl+C to stop the server');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Mock API Server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down Mock API Server...');
  process.exit(0);
});
