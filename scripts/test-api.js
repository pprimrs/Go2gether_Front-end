#!/usr/bin/env node

/**
 * Simple script to test API connectivity
 * Run with: node scripts/test-api.js
 */

const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:8080';

async function testApiConnectivity() {
  console.log('🧪 Testing API connectivity...');
  console.log(`API URL: ${API_URL}`);
  
  try {
    // Test health endpoint
    console.log('\n1. Testing health endpoint...');
    const healthResponse = await axios.get(`${API_URL}/healthz`);
    console.log('✅ Health check passed:', healthResponse.data);
    
    // Test liveness endpoint
    console.log('\n2. Testing liveness endpoint...');
    const liveResponse = await axios.get(`${API_URL}/livez`);
    console.log('✅ Liveness check passed:', liveResponse.data);
    
    // Test readiness endpoint
    console.log('\n3. Testing readiness endpoint...');
    const readyResponse = await axios.get(`${API_URL}/readyz`);
    console.log('✅ Readiness check passed:', readyResponse.data);
    
    console.log('\n🎉 All API tests passed!');
    return true;
    
  } catch (error) {
    console.error('\n❌ API test failed:');
    
    if (error.code === 'ECONNREFUSED') {
      console.error('   Connection refused. Is the API server running?');
    } else if (error.code === 'ENOTFOUND') {
      console.error('   Host not found. Check the API URL.');
    } else if (error.response) {
      console.error(`   HTTP ${error.response.status}: ${error.response.statusText}`);
      console.error('   Response:', error.response.data);
    } else {
      console.error('   Error:', error.message);
    }
    
    return false;
  }
}

// Run the test
testApiConnectivity()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
