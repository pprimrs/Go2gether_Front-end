import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { authService } from '../../src/api/services/auth.service';
import { styles } from './styles/loginstyles';

// 👉 ถ้ารันบน Android Emulator ให้ใช้ 10.0.2.2
// const BASE_URL = 'http://10.0.2.2:8080';
const BASE_URL = 'https://undeclamatory-precollegiate-felicitas.ngrok-free.dev';

type Field = 'email' | 'password';

export default function LoginScreen() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const handleInputChange = (field: Field, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
    if (formError) setFormError(null);
  };

  const validateField = (field: Field, value: string) => {
    let msg = '';
    if (field === 'email') {
      if (!value.trim()) msg = 'Email is required';
      else if (!value.includes('@')) msg = 'Please enter a valid email';
    }
    if (field === 'password') {
      if (!value) msg = 'Password is required';
    }
    setErrors(prev => ({ ...prev, [field]: msg || undefined }));
    return !msg;
  };

  const validateForm = () => {
    const next: Partial<Record<Field, string>> = {};
    if (!formData.email.trim()) next.email = 'Email is required';
    else if (!formData.email.includes('@')) next.email = 'Please enter a valid email';
    if (!formData.password) next.password = 'Password is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  // ✅ Login → save token → GET /api/profile
  // - 200: save profile to storage → go Home
  // - 404: go to /Profile/personal-create
  const handleLogin = async () => {
    if (!validateForm()) return;
    setLoading(true);
    setFormError(null);

    try {
      // 1) Login
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      let data: any = {};
      try { data = await response.json(); } catch {}

      if (!response.ok) {
        if (response.status === 401) {
          setFormError('Incorrect email or password.');
        } else if (response.status === 404) {
          setErrors(prev => ({ ...prev, email: prev.email || 'Account not found' }));
        } else if (response.status === 429) {
          setFormError('Too many attempts. Please try again later.');
        } else {
          setFormError(data?.message || 'Login failed. Please try again.');
        }
        return;
      }

      // 2) Save token + user/email
      const token = data?.token || data?.accessToken || data?.data?.token;
      const emailFromApi = data?.user?.email || data?.email || formData.email;
      if (!token) {
        setFormError('Missing authentication token.');
        return;
      }
      await AsyncStorage.setItem('TOKEN', token);
      if (emailFromApi) await AsyncStorage.setItem('USER_EMAIL', String(emailFromApi));
      if (data?.user) await AsyncStorage.setItem('USER_DATA', JSON.stringify(data.user));

      // 3) Load profile to decide where to go
      const profRes = await fetch(`${BASE_URL}/api/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (profRes.status === 401) {
        await AsyncStorage.multiRemove(['USER_NAME','USER_EMAIL','USER_DATA','TOKEN','PROFILE_EXISTS']);
        setFormError('Session expired. Please sign in again.');
        router.replace('/Auth/welcome');
        return;
      }

      if (profRes.status === 404) {
        // ไม่มีโปรไฟล์ → ไปสร้าง
        await AsyncStorage.setItem('PROFILE_EXISTS', 'false');
        router.replace('/Profile/personal-create');
        return;
      }

      let profJson: any = {};
      try { profJson = await profRes.json(); } catch {}

      if (!profRes.ok) {
        setFormError(profJson?.message || `Failed to load profile (HTTP ${profRes.status}).`);
        return;
      }

      // ✅ 200 → เก็บข้อมูลแล้วไป Home
      const user = profJson?.user || profJson;
      await AsyncStorage.setItem('PROFILE_EXISTS', 'true');
      await AsyncStorage.setItem('USER_DATA', JSON.stringify(user));
      if (user?.display_name) await AsyncStorage.setItem('USER_NAME', String(user.display_name));
      if (user?.email) await AsyncStorage.setItem('USER_EMAIL', String(user.email));

      router.replace('/Mainapp/homepage');
    } catch {
      setFormError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const res = await authService.getGoogleAuthUrl();
      const url = (res as any).auth_url ?? (res as any).url;
      if (!url) {
        setFormError('Could not get Google login URL.');
        return;
      }
      const supported = await Linking.canOpenURL(url);
      if (supported) await Linking.openURL(url);
      else setFormError('Cannot open Google login URL.');
    } catch {
      setFormError('Failed to start Google login.');
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = useMemo(
    () => !!formData.email.trim() && !!formData.password.trim(),
    [formData]
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.select({ ios: 'padding' })}>
      <View style={styles.screen}>
        {/* Header */}
        <View style={styles.topSection}>
          <Image source={require('../../assets/images/logo.png')} style={styles.logo} contentFit="contain" />
          <Text style={styles.title}>Welcome to Go2gether</Text>
          <Text style={styles.subtitle}>Sign up or login below to{'\n'}create your plan trip</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabsOuterRow}>
          <Pressable style={styles.tabBtn}>
            <Text style={[styles.tabText, styles.tabActive]}>Login</Text>
          </Pressable>
          <Pressable onPress={() => router.replace('/Auth/register')} style={styles.tabBtn}>
            <Text style={styles.tabText}>Sign Up</Text>
          </Pressable>
        </View>

        {/* Form */}
        <View style={styles.bottomSheet}>
          <ScrollView contentContainerStyle={styles.sheetContent} keyboardShouldPersistTaps="handled">
            {/* Google */}
            <Pressable
              style={[styles.googleBtn, loading && { opacity: 0.6 }]}
              onPress={handleGoogleLogin}
              disabled={loading}
            >
              <Ionicons name="logo-google" size={18} color="#000" />
              <Text style={styles.googleText}>{loading ? 'Loading...' : 'Login with Google'}</Text>
            </Pressable>

            <Text style={styles.orText}>or continue with email</Text>

            {/* Email */}
            <View style={[styles.inputWrap, errors.email && styles.inputWrapError]}>
              <Ionicons name="mail-outline" size={18} color="#6B6B6B" />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                value={formData.email}
                onChangeText={v => handleInputChange('email', v)}
                onBlur={() => validateField('email', formData.email)}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
              />
            </View>
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

            {/* Password */}
            <View style={[styles.inputWrap, errors.password && styles.inputWrapError]}>
              <Ionicons name="lock-closed-outline" size={18} color="#6B6B6B" />
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                value={formData.password}
                onChangeText={v => handleInputChange('password', v)}
                onBlur={() => validateField('password', formData.password)}
                secureTextEntry={!showPassword}
                returnKeyType="done"
                onSubmitEditing={() =>
                  canSubmit ? handleLogin() : setFormError('Please fill in your email and password.')
                }
              />
              <Pressable onPress={() => setShowPassword(v => !v)} style={styles.smallRow} hitSlop={10}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color="#6B6B6B" />
              </Pressable>
            </View>
            {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

            {/* Forgot */}
            <Pressable onPress={() => router.push('/Auth/forgot-password')}>
              <Text style={styles.forgot}>Forgot Password?</Text>
            </Pressable>

            {/* Form error */}
            {formError ? <Text style={styles.formError}>{formError}</Text> : null}

            {/* Submit */}
            <Pressable
              style={[styles.btn, styles.btnPrimary, (!canSubmit || loading) && { opacity: 0.6 }]}
              onPress={handleLogin}
              disabled={!canSubmit || loading}
            >
              <Text style={[styles.btnText, styles.btnPrimaryText]}>
                {loading ? 'Signing in...' : 'Sign in'}
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
