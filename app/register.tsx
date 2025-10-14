import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  Text,
} from 'react-native';
import { ThemedText } from '../components/themed-text';
import { ThemedView } from '../components/themed-view';

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
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
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Account created successfully! Please login to continue.', [
          { text: 'OK', onPress: () => router.push('/login') },
        ]);
      } else {
        Alert.alert('Error', data.message || 'Registration failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const activeTab: 'login' | 'signup' = 'signup';

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <ThemedView style={styles.screen}>
          {/* Header */}
          <View style={styles.header}>
            <ThemedText type="title" style={styles.title}>
              Welcome to Go2gether
            </ThemedText>
            <ThemedText type="default" style={styles.subtitle}>
              Sign up or login bellow to{'\n'}create your plan trip
            </ThemedText>
          </View>

          {/* Tabs */}
          <View style={styles.tabsRow}>
            <TouchableOpacity style={styles.tabBtn}>
              <Text style={[styles.tabText, activeTab === 'login' && styles.tabTextActive]}>Login</Text>
              <View style={[styles.tabUnderline, activeTab === 'login' && styles.tabUnderlineActive]} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.tabBtn}>
              <Text style={[styles.tabText, activeTab === 'signup' && styles.tabTextActive]}>Sign Up</Text>
              <View style={[styles.tabUnderline, activeTab === 'signup' && styles.tabUnderlineActive]} />
            </TouchableOpacity>
          </View>

          {/* Light blue panel */}
          <View style={styles.panel}>
            {/* Name */}
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={18} color="#111" style={styles.leftIcon} />
              <TextInput
                style={styles.input}
                placeholder="Your name"
                placeholderTextColor="#9AA4AE"
                value={formData.username}
                onChangeText={v => handleInputChange('username', v)}
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>

            {/* Email */}
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={18} color="#111" style={styles.leftIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#9AA4AE"
                value={formData.email}
                onChangeText={v => handleInputChange('email', v)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>

            {/* Password */}
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={18} color="#111" style={styles.leftIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor="#9AA4AE"
                value={formData.password}
                onChangeText={v => handleInputChange('password', v)}
                secureTextEntry={!showPassword}
                returnKeyType="next"
              />
              <TouchableOpacity onPress={() => setShowPassword(s => !s)} hitSlop={10} style={styles.rightIconBtn}>
                <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={18} color="#111" />
              </TouchableOpacity>
            </View>

            {/* Confirm Password */}
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={18} color="#111" style={styles.leftIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirm your password"
                placeholderTextColor="#9AA4AE"
                value={formData.confirmPassword}
                onChangeText={v => handleInputChange('confirmPassword', v)}
                secureTextEntry={!showConfirmPassword}
                returnKeyType="done"
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(s => !s)} hitSlop={10} style={styles.rightIconBtn}>
                <Ionicons name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'} size={18} color="#111" />
              </TouchableOpacity>
            </View>

            {/* Terms */}
            <Text style={styles.termsText}>
              By agreeing to the Terms & Conditions,{'\n'}you enter into a binding agreement with Go2gether
            </Text>

            {/* Submit */}
            <TouchableOpacity
              style={[styles.primaryBtn, loading && { opacity: 0.6 }]}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.primaryBtnText}>{loading ? 'Creating Account...' : 'Sign Up'}</Text>
            </TouchableOpacity>
          </View>

          {/* Login link (optional,ใต้แผงฟ้า) */}
          <View style={styles.bottomLoginRow}>
            <Text style={styles.bottomLoginText}>Already have an account? </Text>
            <Link href="/login" asChild>
              <TouchableOpacity>
                <Text style={styles.bottomLoginLink}>Sign In</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const COLORS = {
  background: '#FFFFFF',
  panel: '#EAF5FF',        // ฟ้าอ่อนเหมือนภาพ
  inputBg: '#FFFFFF',
  inputBorder: '#FFFFFF',
  inputShadow: 'rgba(0,0,0,0.06)',
  text: '#0B0B0B',
  muted: '#9AA4AE',
  primary: '#0A66A3',      // น้ำเงินหม่นคล้ายโลโก้
  primaryDark: '#0a5a8f',
  divider: '#B6D1EA',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  screen: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },

  /** Header */
  header: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.muted,
    textAlign: 'center',
  },

  /** Tabs */
  tabsRow: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
  },
  tabBtn: {
    alignItems: 'center',
    width: '40%',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#737373',
  },
  tabTextActive: {
    color: COLORS.primary,
  },
  tabUnderline: {
    marginTop: 6,
    height: 2,
    width: '60%',
    backgroundColor: 'transparent',
  },
  tabUnderlineActive: {
    backgroundColor: COLORS.primary,
  },

  /** Light blue panel */
  panel: {
    marginTop: 8,
    backgroundColor: COLORS.panel,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    borderRadius: 8,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderColor: COLORS.divider,
    borderWidth: StyleSheet.hairlineWidth,
  },

  /** Inputs */
  inputWrapper: {
    height: 54,
    backgroundColor: COLORS.inputBg,
    borderColor: COLORS.inputBorder,
    borderWidth: 1,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  leftIcon: {
    marginRight: 10,
  },
  rightIconBtn: {
    padding: 6,
    marginLeft: 6,
  },
  input: {
    flex: 1,
    fontSize: 15.5,
    color: COLORS.text,
  },

  /** Terms */
  termsText: {
    marginTop: 6,
    marginBottom: 12,
    fontSize: 11.5,
    lineHeight: 16,
    color: COLORS.muted,
    textAlign: 'center',
  },

  /** Primary button */
  primaryBtn: {
    height: 54,
    borderRadius: 14,
    backgroundColor: COLORS.text === '#0B0B0B' ? '#111111' : '#111111',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },

  /** Bottom login row */
  bottomLoginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
  },
  bottomLoginText: {
    fontSize: 14,
    color: '#555',
  },
  bottomLoginLink: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
});
