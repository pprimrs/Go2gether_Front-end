import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { storage } from '../../src/utils/storage';

export default function GoogleCallbackScreen() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('Processing Google login...');
  const params = useLocalSearchParams();

  useEffect(() => {
    handleGoogleCallback();
  }, []);

  const handleGoogleCallback = async () => {
    try {
      setLoading(true);
      setStatus('Processing Google login...');

      // Extract parameters from URL
      const { token, user_id, email, display_name, provider, is_verified } = params;
      
      console.log('Callback params:', { token, user_id, email, display_name, provider, is_verified });
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      setStatus('Saving user data...');

      // Save token to local storage
      await storage.setToken('auth_token', token as string);

      // Create user object from parameters
      const userData = {
        id: user_id as string,
        email: email as string,
        display_name: display_name as string,
        username: email as string, // Use email as username
        provider: provider as string,
        is_verified: is_verified === 'true',
        avatar_url: null,
        phone: null,
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Save user data to local storage
      await storage.setObject('user_data', userData);

      setStatus('Login successful! Redirecting...');

      // Wait a moment then redirect to profile
      setTimeout(() => {
        router.replace('/Profile/personal-information');
      }, 1500);

    } catch (error) {
      console.error('Google callback error:', error);
      setStatus('Login failed. Please try again.');
      
      setTimeout(() => {
        router.replace('/Auth/login');
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with Logo */}
      <View style={styles.header}>
        <Image
          source={require('../../assets/images/logo.png')}
          style={styles.logo}
          contentFit="contain"
        />
        <Text style={styles.appName}>Go2gether</Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#2f6fa0" />
          ) : (
            <Ionicons 
              name={status.includes('successful') ? 'checkmark-circle' : 'alert-circle'} 
              size={60} 
              color={status.includes('successful') ? '#4CAF50' : '#F44336'} 
            />
          )}
        </View>

        <Text style={styles.title}>{status}</Text>
        
        {loading && (
          <Text style={styles.subtitle}>
            Please wait while we complete your login...
          </Text>
        )}

        {!loading && status.includes('failed') && (
          <Text style={styles.errorText}>
            Redirecting to login page...
          </Text>
        )}

        {!loading && status.includes('successful') && (
          <Text style={styles.successText}>
            Welcome to Go2gether! Redirecting to your profile...
          </Text>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Powered by Google OAuth
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  logo: {
    width: 120,
    height: 60,
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1e293b',
    letterSpacing: -0.5,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 28,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
  successText: {
    fontSize: 16,
    color: '#059669',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },
  footer: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500',
  },
});
