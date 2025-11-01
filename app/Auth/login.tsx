import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Alert,
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

type Field = 'email' | 'password';

export default function LoginScreen() {
  // form state (เหมือนเดิม)
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // error state รายช่อง + error รวม (เช่น invalid credentials)
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

  const handleLogin = async () => {
    if (!validateForm()) return;
    setLoading(true);
    setFormError(null);

    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      let data: any = {};
      try { data = await response.json(); } catch {}

      if (response.ok) {
        router.replace('/Profile/personal-information');
        setTimeout(() => router.replace('/Profile/personal-information'), 0);
      } else {
        // แมพสถานะทั่วไปเป็นข้อความบนหน้า (ไม่ใช้ Alert)
        if (response.status === 401) {
          setFormError('Incorrect email or password.');
        } else if (response.status === 404) {
          setErrors(prev => ({ ...prev, email: prev.email || 'Account not found' }));
        } else if (response.status === 429) {
          setFormError('Too many attempts. Please try again later.');
        } else {
          setFormError(data?.message || 'Login failed. Please try again.');
        }
      }
    } catch {
      setFormError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const res = await authService.getGoogleAuthUrl(); // ควรคืน { auth_url: string }
      const url = (res as any).auth_url ?? (res as any).url; // เผื่อ service คืนชื่อ key ไม่เหมือนกัน
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

            {/* ✅ Forgot Password link (เพิ่มใหม่) */}
            <Pressable onPress={() => router.push('/Auth/forgot-password')}>
              <Text style={styles.forgot}>Forgot Password?</Text>
            </Pressable>

            {/* Global error (เช่น wrong password / network) */}
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
