// app/Auth/signup.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { styles } from "./styles/signupstyles";
import { useAuth } from "../../src/store/authStore";

export default function SignUpScreen() {
  const [tab, setTab] = useState<"login" | "signup">("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const { signUpWithEmail } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
  if (!name || !email || !password || !confirm) {
    Alert.alert("Oops", "Please fill in all fields.");
    return;
  }
  if (password.length < 6) {
    Alert.alert("Password too short", "At least 6 characters.");
    return;
  }
  if (password !== confirm) {
    Alert.alert("Mismatch", "Passwords do not match.");
    return;
  }
  try {
    setSubmitting(true);
    await signUpWithEmail({
      username: name,       // ← SPEC ต้องการ username (required)
      email,
      password,
      display_name: name,   // (optional) เก็บชื่อโชว์
    });
    router.replace("/(tabs)");
  } catch (e: any) {
    Alert.alert("Sign up failed", e?.response?.data?.message || "Please try again.");
  } finally {
    setSubmitting(false);
  }
};

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.select({ ios: "padding" })}
    >
      <View style={styles.screen}>
        {/* ส่วนบน (โลโก้ + ข้อความต้อนรับ) */}
        <View style={styles.topSection}>
          <Image
            // ปรับ path ให้ตรงกับโครงของคุณ: asset/images/*
            source={require("../../assets/images/logo.png")}
            style={styles.logo}
            contentFit="contain"
          />
          <Text style={styles.title}>Welcome to Go2gether</Text>
          <Text style={styles.subtitle}>
            Sign up or login below to{"\n"}create your plan trip
          </Text>
        </View>

        {/* ✅ แท็บอยู่นอกกรอบสีฟ้า */}
        <View style={styles.tabsOuterRow}>
          <Pressable onPress={() => router.replace("/Auth/signin")} style={styles.tabBtn}>
            <Text style={styles.tabText}>Login</Text>
          </Pressable>
          <Pressable onPress={() => setTab("signup")} style={styles.tabBtn}>
            <Text style={[styles.tabText, styles.tabActive]}>Sign Up</Text>
          </Pressable>
        </View>

        {/* กรอบสีฟ้าด้านล่าง */}
        <View style={styles.bottomSheet}>
          <ScrollView
            contentContainerStyle={styles.sheetContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Name */}
            <View style={styles.inputWrap}>
              <Ionicons name="person-outline" size={18} color="#6B6B6B" />
              <TextInput
                style={styles.input}
                placeholder="Your name"
                value={name}
                onChangeText={setName}
              />
            </View>

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
              />
              <Pressable onPress={() => setShowPw((v) => !v)} style={styles.smallRow}>
                <Ionicons
                  name={showPw ? "eye-off-outline" : "eye-outline"}
                  size={18}
                  color="#6B6B6B"
                />
              </Pressable>
            </View>

            {/* Confirm Password */}
            <View style={styles.inputWrap}>
              <Ionicons name="checkmark-circle-outline" size={18} color="#6B6B6B" />
              <TextInput
                style={styles.input}
                placeholder="Confirm your password"
                value={confirm}
                onChangeText={setConfirm}
                secureTextEntry={!showPw2}
              />
              <Pressable onPress={() => setShowPw2((v) => !v)} style={styles.smallRow}>
                <Ionicons
                  name={showPw2 ? "eye-off-outline" : "eye-outline"}
                  size={18}
                  color="#6B6B6B"
                />
              </Pressable>
            </View>

            {/* ปุ่มสมัคร */}
            <Pressable style={[styles.btn, styles.btnPrimary]} onPress={onSubmit}>
              <Text style={[styles.btnText, styles.btnPrimaryText]}>Create account</Text>
            </Pressable>

            {/* Terms */}
            <Text style={styles.terms}>
              By signing up, you agree to our{" "}
              <Text style={styles.link}>Terms of service</Text> and{" "}
              <Text style={styles.link}>Privacy policy</Text>
            </Text>
          </ScrollView>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}


