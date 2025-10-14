// app/Auth/signin.tsx
import React, { useState } from "react";
import {
  View, Text, TextInput, Pressable, ScrollView,
  KeyboardAvoidingView, Platform, Alert,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { styles } from "./styles/signinstyles";
// ถ้า store ของคุณคือ src/store/auth ให้ใช้บรรทัดด้านล่าง
import { useAuth } from "../../src/store/authStore"; 
// ถ้าไฟล์จริงใช้ชื่อ authStore ก็เปลี่ยน path ให้ตรง

export default function SignInScreen() {
  const { signInWithEmail } = useAuth();

  const [tab, setTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = email.trim().length > 0 && password.trim().length > 0;

  const onGoogle = () => Alert.alert("Google", "Connect your Google sign-in here.");
  const onForgot = () => router.push("/Auth/forgot-password");

  const onSubmit = async () => {
    if (!canSubmit) {
      Alert.alert("Required", "Please enter your email and password.");
      return;
    }
    try {
      setSubmitting(true);
      await signInWithEmail({ email: email.trim(), password });
      router.replace("/(tabs)");
    } catch (e: any) {
      console.log("SignIn error:", e?.response?.data || e?.message);
      Alert.alert("Sign in failed", e?.response?.data?.message ?? "Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.select({ ios: "padding" })}>
      <View style={styles.screen}>
        {/* ส่วนบน */}
        <View style={styles.topSection}>
          <Image source={require("../../assets/images/logo.png")} style={styles.logo} contentFit="contain" />
          <Text style={styles.title}>Welcome to Go2gether</Text>
          <Text style={styles.subtitle}>Sign up or login below to{"\n"}create your plan trip</Text>
        </View>

        {/* แท็บ */}
        <View style={styles.tabsOuterRow}>
          <Pressable onPress={() => setTab("login")} style={styles.tabBtn}>
            <Text style={[styles.tabText, tab === "login" && styles.tabActive]}>Login</Text>
          </Pressable>
          <Pressable onPress={() => router.replace("/Auth/signup")} style={styles.tabBtn}>
            <Text style={styles.tabText}>Sign Up</Text>
          </Pressable>
        </View>

        {/* ฟอร์ม */}
        <View style={styles.bottomSheet}>
          <ScrollView
            contentContainerStyle={styles.sheetContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Google */}
            <Pressable style={styles.googleBtn} onPress={onGoogle}>
              <Ionicons name="logo-google" size={18} color="#000" />
              <Text style={styles.googleText}>Login with Google</Text>
            </Pressable>

            <Text style={styles.orText}>or continue with email</Text>

            {/* Email */}
            <View style={styles.inputWrap}>
              <Ionicons name="mail-outline" size={18} color="#6B6B6B" />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>

            {/* Password */}
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color="#6B6B6B" />
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPw}
                returnKeyType="done"
                onSubmitEditing={() =>
                  canSubmit ? onSubmit() : Alert.alert("Required", "Please enter your email and password.")
                }
              />
              <Pressable
                onPress={() => setShowPw(v => !v)}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel={showPw ? "Hide password" : "Show password"}
                style={styles.smallRow}
              >
                <Ionicons name={showPw ? "eye-off-outline" : "eye-outline"} size={18} color="#6B6B6B" />
              </Pressable>
            </View>

            {/* Forgot */}
            <Pressable onPress={onForgot} style={{ marginTop: 8 }}>
              <Text style={styles.forgot}>Forgot Password?</Text>
            </Pressable>

            {/* Submit */}
            <Pressable
              style={[
                styles.btn,
                styles.btnPrimary,
                (!canSubmit || submitting) && { opacity: 0.6 }, // ดูเป็น disabled ชัดเจน
              ]}
              onPress={onSubmit}
              disabled={!canSubmit || submitting}
              accessibilityState={{ disabled: !canSubmit || submitting }}
            >
              <Text style={[styles.btnText, styles.btnPrimaryText]}>
                {submitting ? "Signing in..." : "Sign in"}
              </Text>
            </Pressable>

            {/* Terms */}
            <Text style={styles.terms}>
              By signing up, you agree to our <Text style={styles.link}>Terms of service</Text> and{" "}
              <Text style={styles.link}>Privacy policy</Text>
            </Text>
          </ScrollView>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}



