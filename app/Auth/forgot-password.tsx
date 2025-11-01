import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './styles/forgotstyles';

// 🔹 ตัวอย่าง API (แก้ BASE_URL ให้ตรงกับ backend จริง)
async function requestPasswordReset(email: string) {
  const res = await fetch('http://localhost:8080/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    let msg = 'Request failed';
    try {
      const j = await res.json();
      msg = j?.message || msg;
    } catch {}
    throw new Error(msg);
  }
  return true;
}

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();

  // ----- State -----
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const canSubmit = useMemo(() => !!email.trim() && email.includes('@'), [email]);

  // ----- Back button -----
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/Auth/login'); // ถ้าไม่มี history กลับ ให้ไปหน้า Login
    }
  };

  // ----- Submit -----
  const handleSubmit = async () => {
    if (!canSubmit) {
      setError('Please enter a valid email');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await requestPasswordReset(email.trim());
      router.replace({
        pathname: '/Auth/verify-code',
        params: { email: email.trim() },
      });
    } catch (e: any) {
      setError(e?.message || 'Something went wrong, please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ----- Render -----
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 16 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back Button */}
          <View style={styles.headerRow}>
            <Pressable onPress={handleBack} hitSlop={12} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={22} color="#000" />
            </Pressable>
          </View>

          {/* Content */}
          <View style={styles.container}>
            {/* Logo */}
            <Image
              source={require('../../assets/images/logo.png')}
              style={styles.logo}
              contentFit="contain"
            />

            {/* Title */}
            <Text style={styles.title}>Forget Password</Text>
            <Text style={styles.subtitle}>Enter your email account to reset password</Text>

            {/* Illustration */}
            <Image
              source={require('../../assets/images/forget-pass.png')}
              style={styles.illustration}
              contentFit="contain"
            />

            {/* Email Input */}
            <View style={[styles.inputWrap, !!error && styles.inputWrapError]}>
              <Ionicons name="mail-outline" size={18} color="#6B6B6B" />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  if (error) setError(null);
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="send"
                onSubmitEditing={() =>
                  canSubmit ? handleSubmit() : setError('Please enter a valid email')
                }
              />
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {/* Send Button */}
            <Pressable
              style={[styles.btn, (!canSubmit || loading) && { opacity: 0.6 }]}
              onPress={handleSubmit}
              disabled={!canSubmit || loading}
            >
              <Text style={styles.btnText}>{loading ? 'Sending…' : 'Send'}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
