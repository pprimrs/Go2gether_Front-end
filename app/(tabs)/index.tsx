// app/index.tsx  ← หน้าแรก (Welcome)
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity, Platform, Image } from 'react-native';

export default function WelcomeScreen() {
  const onSignIn = () => router.replace('/Auth/login');
  const onSignUp = () => router.replace('/Auth/register');

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* โลโก้ */}
      <Image
        source={require('../../assets/images/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* ภาพประกอบ */}
      <Image
        source={require('../../assets/images/home-page.png')}
        style={styles.hero}
        resizeMode="contain"
      />

      {/* ข้อความหัว/คำอธิบาย */}
      <Text style={styles.title}>Plan and Go2gether</Text>
      <Text style={styles.subtitle}>
        The easiest way to turn{'\n'}
        “we should travel” into real{'\n'}
        tickets and shared memories.{'\n'}
        Vote on places, drop pins, and{'\n'}
        keep all trip talk in one spot.{'\n'}
        Plan confidently and Go2gether
      </Text>

      {/* ปุ่ม */}
      <View style={styles.actions}>
        <TouchableOpacity onPress={onSignIn} style={styles.primaryBtn} activeOpacity={0.85}>
          <Text style={styles.primaryBtnText}>Sign in</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onSignUp} style={styles.secondaryBtn} activeOpacity={0.9}>
          <Text style={styles.secondaryBtnText}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

/* ===== Styles ===== */
const COLORS = {
  bg: '#FFFFFF',
  text: '#111111',
  subtitle: '#7E7E7E',
  blueFill: '#BCD6E7',   // ปุ่มฟ้าอ่อน
  border: '#EAEAEA',     // เส้นขอบปุ่มขาว
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  content: {
    paddingTop: 48,
    paddingHorizontal: 24,
    paddingBottom: 36,
    alignItems: 'center',
  },

  // โลโก้
  logo: {
    width: 220,
    height: 80,
    marginTop: 12,
    alignSelf: 'center',
  },

  // ภาพประกอบ
  hero: {
    width: '86%',
    height: 160,
    marginTop: 12,
    marginBottom: 16,
    alignSelf: 'center',
  },

  // ข้อความ
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.subtitle,
    textAlign: 'center',
    marginBottom: 24,
  },

  // ปุ่ม
  actions: {
    width: '100%',
    marginTop: 8,
    gap: 14,
  },
  primaryBtn: {
    height: 56,
    borderRadius: 14,
    backgroundColor: COLORS.blueFill,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: Platform.OS === 'ios' ? 0.06 : 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  primaryBtnText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text, // ตัวอักษรสีเข้มบนพื้นฟ้า
  },

  secondaryBtn: {
    height: 56,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  secondaryBtnText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
});
