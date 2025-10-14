// app/test.tsx - Test page for API integration
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { testApi } from '../src/utils/apiTest';

export default function TestPage() {
  const [testResults, setTestResults] = useState<{ connectivity: boolean; auth: boolean } | null>(null);
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    try {
      const results = await testApi();
      setTestResults(results);
    } catch (error) {
      Alert.alert('Test Error', 'Failed to run tests: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧪 API Integration Test</Text>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={runTests}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Running Tests...' : 'Test API Connectivity'}
        </Text>
      </TouchableOpacity>

      {testResults && (
        <View style={styles.results}>
          <Text style={styles.resultTitle}>Test Results:</Text>
          <Text style={[
            styles.resultItem, 
            testResults.connectivity ? styles.success : styles.error
          ]}>
            {testResults.connectivity ? '✅' : '❌'} API Connectivity
          </Text>
          <Text style={[
            styles.resultItem, 
            testResults.auth ? styles.success : styles.error
          ]}>
            {testResults.auth ? '✅' : '❌'} Auth Configuration
          </Text>
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.infoTitle}>API Configuration:</Text>
        <Text style={styles.infoText}>• Base URL: http://localhost:8080</Text>
        <Text style={styles.infoText}>• Timeout: 15000ms</Text>
        <Text style={styles.infoText}>• Auto token refresh: Enabled</Text>
        <Text style={styles.infoText}>• Secure storage: Enabled</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  results: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  resultItem: {
    fontSize: 16,
    marginBottom: 5,
  },
  success: {
    color: '#34C759',
  },
  error: {
    color: '#FF3B30',
  },
  info: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
});
