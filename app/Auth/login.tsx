import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { styles } from './styles/loginstyles'; // ← ดึง style แยกไฟล์

export default function LoginScreen() {
  // 🔹 Logic เดิม
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      Alert.alert('Error', 'Email is required');
      return false;
    }
    if (!formData.email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email');
      return false;
    }
    if (!formData.password) {
      Alert.alert('Error', 'Password is required');
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      let data: any = {};
      try { data = await response.json(); } catch {}

      if (response.ok) {
        // ไปหน้า Personal Information ทันที
        router.replace('/Profile/personal-information');
        setTimeout(() => router.replace('/Profile/personal-information'), 0);
      } else {
        Alert.alert('Error', data?.message || 'Login failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 🔹 สำหรับ UI
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const submitting = loading;
  const canSubmit = !!(formData.email.trim() && formData.password.trim());

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.select({ ios: 'padding' })}>
      <View style={styles.screen}>
        {/* ส่วนบน */}
        <View style={styles.topSection}>
          <Image
            source={require('../../assets/images/logo.png')} // ปรับ path ให้ตรงโปรเจกต์
            style={styles.logo}
            contentFit="contain"
          />
          <Text style={styles.title}>Welcome to Go2gether</Text>
          <Text style={styles.subtitle}>Sign up or login below to{'\n'}create your plan trip</Text>
        </View>

        {/* แท็บ */}
        <View style={styles.tabsOuterRow}>
          <Pressable onPress={() => setTab('login')} style={styles.tabBtn}>
            <Text style={[styles.tabText, tab === 'login' && styles.tabActive]}>Login</Text>
          </Pressable>
          <Pressable onPress={() => router.replace('/Auth/register')} style={styles.tabBtn}>
            <Text style={styles.tabText}>Sign Up</Text>
          </Pressable>
        </View>

        {/* ฟอร์ม */}
        <View style={styles.bottomSheet}>
          <ScrollView contentContainerStyle={styles.sheetContent} keyboardShouldPersistTaps="handled">
            {/* Google */}
            <Pressable style={styles.googleBtn} onPress={() => Alert.alert('Google Login', 'Coming soon!')}>
              <Ionicons name="logo-google" size={18} color="#000" />
              <Text style={styles.googleText}>Login with Google</Text>
            </Pressable>

            <Text style={styles.orText}>or continue with email</Text>

            {/* Email */}
            <View style={styles.inputWrap}>
              <Ionicons name="mail-outline" size={18} color="#6B6B6B" />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                value={formData.email}
                onChangeText={v => handleInputChange('email', v)}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
              />
            </View>

            {/* Password */}
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color="#6B6B6B" />
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                value={formData.password}
                onChangeText={v => handleInputChange('password', v)}
                secureTextEntry={!showPassword}
                returnKeyType="done"
                onSubmitEditing={() =>
                  canSubmit ? handleLogin() : Alert.alert('Required', 'Please enter your email and password.')
                }
              />
              <Pressable onPress={() => setShowPassword(v => !v)} style={styles.smallRow} hitSlop={10}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color="#6B6B6B" />
              </Pressable>
            </View>

            {/* Forgot */}
            <Pressable onPress={() => Alert.alert('Forgot Password', 'Coming soon!')}>
              <Text style={styles.forgot}>Forgot Password?</Text>
            </Pressable>

            {/* Submit */}
            <Pressable
              style={[styles.btn, styles.btnPrimary, (!canSubmit || submitting) && { opacity: 0.6 }]}
              onPress={handleLogin}
              disabled={!canSubmit || submitting}
            >
              <Text style={[styles.btnText, styles.btnPrimaryText]}>
                {submitting ? 'Signing in...' : 'Sign in'}
              </Text>
            </Pressable>

            {/* Terms */}
            <Text style={styles.terms}>
              By signing up, you agree to our <Text style={styles.link}>Terms of service</Text> and{' '}
              <Text style={styles.link}>Privacy policy</Text>
            </Text>
          </ScrollView>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
