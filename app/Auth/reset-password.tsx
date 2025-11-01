import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
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
import { styles } from './styles/resetstyles';

const RESET_URL = 'http://localhost:8080/api/auth/reset-password';

async function requestResetPassword({
  password,
  token,
}: {
  password: string;
  token: string;
}) {
  // ✅ BE ต้องการ key ชื่อ reset_token ใน body
  const payload = { new_password: password.trim(), reset_token: token };
  console.log('[reset-password] payload =', payload);

  const res = await fetch(RESET_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  let json: any = {};
  try { json = JSON.parse(text || '{}'); } catch {}

  if (!res.ok) {
    console.warn('[reset-password] server error:', text);
    throw new Error(json?.message || 'Reset password failed');
  }
  return json;
}

export default function ResetPasswordScreen() {
  const insets = useSafeAreaInsets();

  // รับ token จาก query (จากหน้า verify-code)
  const { token } = useLocalSearchParams<{ token?: string }>();
  const resetToken = decodeURIComponent((Array.isArray(token) ? token[0] : token) ?? '').trim();
  console.log('[reset-password] token length =', resetToken.length);

  const [pw1, setPw1] = useState('');
  const [pw2, setPw2] = useState('');
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    if (!resetToken) return false;
    if (!pw1 || !pw2) return false;
    if (pw1 !== pw2) return false;
    if (pw1.trim().length < 8) return false;
    return true;
  }, [resetToken, pw1, pw2]);

  const onSubmit = async () => {
    if (!canSubmit) { setErr('Reset token and new password are required'); return; }
    setLoading(true);
    setErr(null);
    try {
      await requestResetPassword({ password: pw1, token: resetToken });
      router.replace('/Auth/login');
    } catch (e: any) {
      setErr(e?.message || 'Unable to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
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
            <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={22} color="#000" />
            </Pressable>
          </View>

          <View style={styles.container}>
            <Image source={require('../../assets/images/logo.png')} style={styles.logo} />

            <Text style={styles.title}>Reset Your Password</Text>
            <Text style={styles.subtitle}>The password must different than before</Text>

            {/* New password */}
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color="#6B6B6B" />
              <TextInput
                style={styles.input}
                placeholder="New password"
                value={pw1}
                onChangeText={(t) => { setPw1(t); if (err) setErr(null); }}
                secureTextEntry={!show1}
                returnKeyType="next"
              />
              <Pressable onPress={() => setShow1((v) => !v)} hitSlop={10}>
                <Ionicons name={show1 ? 'eye-off-outline' : 'eye-outline'} size={18} color="#6B6B6B" />
              </Pressable>
            </View>

            {/* Confirm password */}
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color="#6B6B6B" />
              <TextInput
                style={styles.input}
                placeholder="Confirm password"
                value={pw2}
                onChangeText={(t) => { setPw2(t); if (err) setErr(null); }}
                secureTextEntry={!show2}
                returnKeyType="done"
                onSubmitEditing={onSubmit}
              />
              <Pressable onPress={() => setShow2((v) => !v)} hitSlop={10}>
                <Ionicons name={show2 ? 'eye-off-outline' : 'eye-outline'} size={18} color="#6B6B6B" />
              </Pressable>
            </View>

            {pw2.length > 0 && pw1 !== pw2 ? (
              <Text style={styles.errorText}>Passwords do not match.</Text>
            ) : null}
            {err ? <Text style={styles.errorText}>{err}</Text> : null}

            <Pressable
              style={[
                styles.btn,
                canSubmit && styles.btnActive,
                (loading || !canSubmit) && { opacity: 0.7 },
              ]}
              onPress={onSubmit}
              disabled={!canSubmit || loading}
            >
              <Text style={[styles.btnText, canSubmit && styles.btnTextActive]}>
                {loading ? 'Submitting…' : 'Confirm'}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
