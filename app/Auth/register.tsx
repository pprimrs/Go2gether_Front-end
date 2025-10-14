import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { styles } from './styles/registerstyles'; // ⬅️ ใช้ไฟล์สไตล์ที่แยกออกมา

export default function RegisterScreen() {
  // === ลอจิกเดิม (คงไว้) ===
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

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      Alert.alert('Error', 'Username is required');
      return false;
    }
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
    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/auth/register', {
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
      try { data = await response.json(); } catch {}

      if (response.ok) {
        // ✅ สำเร็จ: เด้งไปหน้า Login ทันที
        router.replace('/Auth/login'); // ปรับ path ให้ตรงโปรเจกต์คุณถ้าจำเป็น
      } else {
        Alert.alert('Error', data?.message || 'Registration failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // === UI ===
  const [tab] = useState<'login' | 'signup'>('signup');

  // ปุ่มจะกดได้เมื่อฟอร์มครบถ้วน
  const canSubmit =
    !!formData.username.trim() &&
    !!formData.email.trim() &&
    !!formData.password &&
    !!formData.confirmPassword;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.select({ ios: 'padding' })}>
      <View style={styles.screen}>
        {/* ส่วนบน (โลโก้ + หัวข้อ) */}
        <View style={styles.topSection}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            contentFit="contain"
          />
          <Text style={styles.title}>Welcome to Go2gether</Text>
          <Text style={styles.subtitle}>
            Sign up or login below to{'\n'}create your plan trip
          </Text>
        </View>

        {/* แท็บ */}
        <View style={styles.tabsOuterRow}>
          <Pressable onPress={() => router.replace('/Auth/login')} style={styles.tabBtn}>
            <Text style={styles.tabText}>Login</Text>
          </Pressable>
          <Pressable onPress={() => {}} style={styles.tabBtn}>
            <Text style={[styles.tabText, styles.tabActive]}>Sign Up</Text>
          </Pressable>
        </View>

        {/* กรอบฟอร์ม */}
        <View style={styles.bottomSheet}>
          <ScrollView
            contentContainerStyle={styles.sheetContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Name */}
            <View style={styles.inputWrap}>
              <Ionicons name="person-outline" size={18} color="#111" />
              <TextInput
                style={styles.input}
                placeholder="Your name"
                value={formData.username}
                onChangeText={v => handleInputChange('username', v)}
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>

            {/* Email */}
            <View style={styles.inputWrap}>
              <Ionicons name="mail-outline" size={18} color="#111" />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                value={formData.email}
                onChangeText={v => handleInputChange('email', v)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>

            {/* Password */}
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color="#111" />
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                value={formData.password}
                onChangeText={v => handleInputChange('password', v)}
                secureTextEntry={!showPassword}
                returnKeyType="next"
              />
              <TouchableOpacity onPress={() => setShowPassword(s => !s)} hitSlop={10} style={styles.smallRow}>
                <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={18} color="#111" />
              </TouchableOpacity>
            </View>

            {/* Confirm Password */}
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color="#111" />
              <TextInput
                style={styles.input}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChangeText={v => handleInputChange('confirmPassword', v)}
                secureTextEntry={!showConfirmPassword}
                returnKeyType="done"
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(s => !s)} hitSlop={10} style={styles.smallRow}>
                <Ionicons name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'} size={18} color="#111" />
              </TouchableOpacity>
            </View>

            {/* Terms */}
            <Text style={styles.terms}>
              By agreeing to the Terms & Conditions,{'\n'}
              you enter into a binding agreement with Go2gether
            </Text>

            {/* ปุ่ม Sign Up */}
            <Pressable
              style={[
                styles.btn,
                canSubmit && !loading ? styles.btnPrimary : styles.btnPrimaryDisabled,
              ]}
              disabled={!canSubmit || loading}
              onPress={handleRegister}
              accessibilityState={{ disabled: !canSubmit || loading }}
            >
              <Text
                style={[
                  styles.btnText,
                  canSubmit && !loading ? styles.btnPrimaryText : styles.btnDisabledText,
                ]}
              >
                {loading ? 'Creating Account...' : 'Sign Up'}
              </Text>
            </Pressable>

            {/* ลิงก์ไปหน้า Login (ใต้ฟอร์ม) */}
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
