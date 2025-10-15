// app/Welcome/index.tsx  (เปลี่ยนพาธไฟล์ตามโปรเจ็กต์จริง)
import { router, Link } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';

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
        contentFit="contain"
      />

      {/* ภาพประกอบ */}
      <Image
        // ใช้รูปที่คุณมี เช่น home-page.png
        source={require('../../assets/images/home-page.png')}
        style={styles.hero}
        contentFit="contain"
      />

      {/* หัวข้อ/คำอธิบาย */}
      <Text style={styles.title}>Plan and Go2gether</Text>
      <Text style={styles.subtitle}>
        The easiest way to turn{'\n'}
        “we should travel” into real{'\n'}
        tickets and shared memories.{'\n'}
        Vote on places, drop pins, and{'\n'}
        keep all trip talk in one spot.{'\n'}
        Plan confidently and Go2gether
      </Text>

      {/* ปุ่มการกระทำ */}
      <View style={styles.actions}>
        <TouchableOpacity onPress={onSignIn} style={styles.primaryBtn} activeOpacity={0.8}>
          <Text style={styles.primaryBtnText}>Sign in</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onSignUp} style={styles.secondaryBtn} activeOpacity={0.85}>
          <Text style={styles.secondaryBtnText}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

/* ===== Styles (ให้โทนและสัดส่วนเหมือนภาพ) ===== */
const COLORS = {
  bg: '#FFFFFF',
  text: '#111111',
  muted: '#7C7C7C',
  blueFill: '#BCD6E7', // ฟ้าพาสเทลของปุ่ม Sign in
  blueText: '#0B2A3A',
  border: '#EAEAEA',
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

  /** โลโก้ */
  logo: {
    width: 300,
    height: 150,
    marginTop: 12,
    alignSelf: 'center',
  },

  /** ภาพประกอบ */
  hero: {
    width: '86%',
    height: 160,
    marginTop: 12,
    marginBottom: 16,
  },

  /** ตัวอักษร */
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
    color: '#7E7E7E',
    textAlign: 'center',
    marginBottom: 24,
  },

  /** ปุ่ม */
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
    // shadow เบา ๆ ให้ฟีลยกนิดๆ เหมือนในภาพ
    shadowColor: '#000',
    shadowOpacity: Platform.OS === 'ios' ? 0.06 : 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  primaryBtnText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text, // ตัวอักษรสีเข้มบนพื้นฟ้าอ่อน (ตามภาพ)
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
