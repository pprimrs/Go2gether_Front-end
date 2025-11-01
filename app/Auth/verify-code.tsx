import React, { useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  View,
  Pressable,
  ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { styles } from './styles/verifystyles';

const VERIFY_URL = 'http://localhost:8080/api/auth/verify-otp';

export default function VerifyCodeScreen() {
  const insets = useSafeAreaInsets();

  // รับอีเมลจากหน้า Forgot
  const { email } = useLocalSearchParams<{ email?: string }>();
  const displayEmail = Array.isArray(email) ? email[0] : (email ?? '');

  const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputs = useRef<Array<TextInput | null>>([]);

  const canSubmit = useMemo(() => code.join('').length === 6 && !!displayEmail, [code, displayEmail]);

  const handleBack = () => {
    router.replace('/Auth/forgot-password');
  };

  const handleChange = (text: string, index: number) => {
    if (!/^[0-9]*$/.test(text)) return;
    const next = [...code];
    next[index] = text;
    setCode(next);
    if (error) setError(null);
    if (text && index < 5) inputs.current[index + 1]?.focus();
  };

  const handleVerify = async () => {
    const otp = code.join('');
    if (!canSubmit) {
      setError('Please enter all 6 digits.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(VERIFY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: otp, email: displayEmail }),
      });

      const data = await res.json().catch(() => ({} as any));

      if (!res.ok) {
        setError(data?.message || 'Invalid or expired code. Please try again.');
        setCode(['', '', '', '', '', '']);
        inputs.current[0]?.focus();
        return;
      }

      const resetToken: string = (data?.reset_token ?? '').toString().trim();
      console.log('[verify-otp] reset_token length =', resetToken.length);

      router.replace({
        pathname: '/Auth/reset-password',
        params: { token: resetToken },
      });
    } catch {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 🔁 Resend: เปลี่ยนเป็นให้เด้งกลับไปหน้า Forgot Password เพื่อใส่อีเมลใหม่
  const handleResend = () => {
    router.replace('/Auth/forgot-password');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 20 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <Pressable onPress={handleBack} hitSlop={12} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={22} color="#000" />
            </Pressable>
          </View>

          <View style={styles.container}>
            {/* Logo */}
            <Image
              source={require('../../assets/images/logo.png')}
              style={styles.logo}
              contentFit="contain"
            />

            <Text style={styles.title}>Enter Verification Code</Text>
            <Text style={styles.subtitle}>
              We have sent a code to <Text style={styles.emailText}>{displayEmail || 'your email'}</Text>
            </Text>

            {/* 6 ช่อง OTP */}
            <View style={styles.otpContainer}>
              {code.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(el) => { inputs.current[index] = el; }}
                  style={styles.otpInput}
                  keyboardType="number-pad"
                  maxLength={1}
                  value={digit}
                  onChangeText={(text) => handleChange(text, index)}
                  returnKeyType="next"
                  onSubmitEditing={() => {
                    if (index < 5) inputs.current[index + 1]?.focus();
                  }}
                />
              ))}
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {/* Resend */}
            <View style={styles.resendRow}>
              <Text style={styles.resendText}>Did you receive any code?</Text>
              <Pressable onPress={handleResend}>
                <Text style={styles.resendLink}> Please put your email again</Text>
              </Pressable>
            </View>

            {/* Verify */}
            <Pressable
              style={[styles.verifyBtn, canSubmit && { backgroundColor: '#9ACBE2' }, (loading || !canSubmit) && { opacity: 0.7 }]}
              onPress={handleVerify}
              disabled={!canSubmit || loading}
            >
              <Text style={[styles.verifyText, canSubmit && { color: '#0B2A3A' }]}>
                {loading ? 'Verifying…' : 'Verify Now'}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
