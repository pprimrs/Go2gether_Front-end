// src/examples/AuthExample.tsx
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../store/authStore';
import { logger } from '../utils/logger';

/**
 * Example component showing how to use the authentication API
 */
export const AuthExample: React.FC = () => {
  const { user, token, loading, signInWithEmail, signUpWithEmail, signOut, fetchProfile } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async () => {
    try {
      if (isSignUp) {
        await signUpWithEmail({
          email,
          password,
          username,
          display_name: username,
        });
        Alert.alert('Success', 'Account created successfully!');
      } else {
        await signInWithEmail({ email, password });
        Alert.alert('Success', 'Logged in successfully!');
      }
    } catch (error) {
      logger.error('Authentication failed:', error);
      Alert.alert('Error', 'Authentication failed. Please try again.');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      Alert.alert('Success', 'Logged out successfully!');
    } catch (error) {
      logger.error('Sign out failed:', error);
      Alert.alert('Error', 'Sign out failed. Please try again.');
    }
  };

  const handleFetchProfile = async () => {
    try {
      await fetchProfile();
      Alert.alert('Success', 'Profile fetched successfully!');
    } catch (error) {
      logger.error('Fetch profile failed:', error);
      Alert.alert('Error', 'Failed to fetch profile. Please try again.');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (user && token) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Welcome, {user.display_name || user.username || user.email}!</Text>
        <Text style={styles.subtitle}>You are logged in</Text>
        
        <TouchableOpacity style={styles.button} onPress={handleFetchProfile}>
          <Text style={styles.buttonText}>Fetch Profile</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleSignOut}>
          <Text style={styles.buttonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isSignUp ? 'Create Account' : 'Sign In'}
      </Text>
      
      {isSignUp && (
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
      )}
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <TouchableOpacity style={styles.button} onPress={handleAuth}>
        <Text style={styles.buttonText}>
          {isSignUp ? 'Sign Up' : 'Sign In'}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.linkButton} 
        onPress={() => setIsSignUp(!isSignUp)}
      >
        <Text style={styles.linkText}>
          {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkButton: {
    alignItems: 'center',
  },
  linkText: {
    color: '#007AFF',
    fontSize: 16,
  },
});
