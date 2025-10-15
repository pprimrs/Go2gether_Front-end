import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link, router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { styles } from './styles/registerstyles';

export default function RegisterScreen() {
  // form state (คง logic เดิม)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // error state รายช่อง
  const [errors, setErrors] = useState<Partial<Record<keyof typeof formData, string>>>({});

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const validateField = (field: keyof typeof formData, value: string) => {
    let msg = '';
    if (field === 'username') {
      if (!value.trim()) msg = 'Username is required';
    }
    if (field === 'email') {
      if (!value.trim()) msg = 'Email is required';
      else if (!value.includes('@')) msg = 'Please enter a valid email';
    }
    if (field === 'password') {
      if (!value) msg = 'Password is required';
      else if (value.length < 6) msg = 'Password must be at least 6 characters';
    }
    if (field === 'confirmPassword') {
      if (!value) msg = 'Please confirm your password';
      else if (value !== formData.password) msg = 'Passwords do not match';
    }
    setErrors(prev => ({ ...prev, [field]: msg || undefined }));
    return !msg;
  };

  const validateForm = () => {
    const next: typeof errors = {};
    if (!formData.username.trim()) next.username = 'Username is required';
    if (!formData.email.trim()) next.email = 'Email is required';
    else if (!formData.email.includes('@')) next.email = 'Please enter a valid email';
    if (!formData.password) next.password = 'Password is required';
    else if (formData.password.length < 6) next.password = 'Password must be at least 6 characters';
    if (!formData.confirmPassword) next.confirmPassword = 'Please confirm your password';
    else if (formData.confirmPassword !== formData.password) next.confirmPassword = 'Passwords do not match';

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const resp = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          display_name: formData.displayName || formData.username,
        }),
      });

      let data: any = {};
      try { data = await resp.json(); } catch {}

      if (resp.ok) {
        router.replace('/Auth/login');
      } else {
        setErrors(prev => ({
          ...prev,
          email: prev.email || data?.message || 'Registration failed',
        }));
      }
    } catch {
      setErrors(prev => ({
        ...prev,
        email: prev.email || 'Network error. Please try again.',
      }));
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = useMemo(
    () =>
      !!formData.username.trim() &&
      !!formData.email.trim() &&
      !!formData.password &&
      !!formData.confirmPassword,
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
          <Pressable onPress={() => router.replace('/Auth/login')} style={styles.tabBtn}>
            <Text style={styles.tabText}>Login</Text>
          </Pressable>
          <Pressable onPress={() => {}} style={styles.tabBtn}>
            <Text style={[styles.tabText, styles.tabActive]}>Sign Up</Text>
          </Pressable>
        </View>

        {/* Form */}
        <View style={styles.bottomSheet}>
          <ScrollView contentContainerStyle={styles.sheetContent} keyboardShouldPersistTaps="handled">
            {/* Username */}
            <View style={[styles.inputWrap, errors.username && styles.inputWrapError]}>
              <Ionicons name="person-outline" size={18} color="#111" />
              <TextInput
                style={styles.input}
                placeholder="Your name"
                value={formData.username}
                onChangeText={v => handleInputChange('username', v)}
                onBlur={() => validateField('username', formData.username)}
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>
            {errors.username ? <Text style={styles.errorText}>{errors.username}</Text> : null}

            {/* Email */}
            <View style={[styles.inputWrap, errors.email && styles.inputWrapError]}>
              <Ionicons name="mail-outline" size={18} color="#111" />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                value={formData.email}
                onChangeText={v => handleInputChange('email', v)}
                onBlur={() => validateField('email', formData.email)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

            {/* Password */}
            <View style={[styles.inputWrap, errors.password && styles.inputWrapError]}>
              <Ionicons name="lock-closed-outline" size={18} color="#111" />
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                value={formData.password}
                onChangeText={v => handleInputChange('password', v)}
                onBlur={() => validateField('password', formData.password)}
                secureTextEntry={!showPassword}
                returnKeyType="next"
              />
              <TouchableOpacity onPress={() => setShowPassword(s => !s)} hitSlop={10} style={styles.smallRow}>
                <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={18} color="#111" />
              </TouchableOpacity>
            </View>
            {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

            {/* Confirm Password */}
            <View style={[styles.inputWrap, errors.confirmPassword && styles.inputWrapError]}>
              <Ionicons name="lock-closed-outline" size={18} color="#111" />
              <TextInput
                style={styles.input}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChangeText={v => handleInputChange('confirmPassword', v)}
                onBlur={() => validateField('confirmPassword', formData.confirmPassword)}
                secureTextEntry={!showConfirmPassword}
                returnKeyType="done"
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(s => !s)} hitSlop={10} style={styles.smallRow}>
                <Ionicons name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'} size={18} color="#111" />
              </TouchableOpacity>
            </View>
            {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}

            {/* Terms */}
            <Text style={styles.terms}>
              By agreeing to the Terms & Conditions,{'\n'}you enter into a binding agreement with Go2gether
            </Text>

            {/* Submit */}
            <Pressable
              style={[styles.btn, canSubmit && !loading ? styles.btnPrimary : styles.btnPrimaryDisabled]}
              disabled={!canSubmit || loading}
              onPress={handleRegister}
              accessibilityState={{ disabled: !canSubmit || loading }}
            >
              <Text style={[styles.btnText, canSubmit && !loading ? styles.btnPrimaryText : styles.btnDisabledText]}>
                {loading ? 'Creating Account...' : 'Sign Up'}
              </Text>
            </Pressable>

            {/* Link to Login */}
            <View style={{ marginTop: 14, alignItems: 'center' }}>
              <Text style={{ fontSize: 14, color: '#555' }}>
                Already have an account?{' '}
                <Link href="/Auth/login" asChild>
                  <TouchableOpacity>
                    <Text style={styles.link}>Sign In</Text>
                  </TouchableOpacity>
                </Link>
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
