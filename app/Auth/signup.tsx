// app/Auth/signup.tsx
// app/Auth/signup/index.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function SignUpScreen() {
  const [tab, setTab] = useState<"login" | "signup">("signup");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);

  const onSubmit = () => {
    if (!name || !email || !password || !confirm) {
      return Alert.alert("Oops", "Please fill in all fields.");
    }
    if (password.length < 6) {
      return Alert.alert("Password too short", "At least 6 characters.");
    }
    if (password !== confirm) {
      return Alert.alert("Mismatch", "Passwords do not match.");
    }
    // TODO: call your sign-up API
    router.replace("/(tabs)");
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.select({ ios: "padding" })}>
      <View style={styles.screen}>
        {/* ส่วนบน (โลโก้ + ข้อความต้อนรับ) */}
        <View style={styles.topSection}>
          <Image
            source={require("../../assets/images/logo.png")}
            style={styles.logo}
            contentFit="contain"
          />
          <Text style={styles.title}>Welcome to Go2gether</Text>
          <Text style={styles.subtitle}>
            Sign up or login below to{"\n"}create your plan trip
          </Text>
        </View>

        {/* ✅ แท็บอยู่นอกกรอบสีฟ้า (เหมือน signin) */}
        <View style={styles.tabsOuterRow}>
          <Pressable onPress={() => router.replace("/Auth/signin")} style={styles.tabBtn}>
            <Text style={styles.tabText}>Login</Text>
          </Pressable>
          <Pressable onPress={() => setTab("signup")} style={styles.tabBtn}>
            <Text style={[styles.tabText, styles.tabActive]}>Sign Up</Text>
          </Pressable>
        </View>

        {/* กรอบสีฟ้าด้านล่าง (layout เดียวกับ signin) */}
        <View style={styles.bottomSheet}>
          <ScrollView contentContainerStyle={styles.sheetContent} showsVerticalScrollIndicator={false}>
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
            <View style={[styles.inputWrap, { marginTop: 12 }]}>
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
            <View style={[styles.inputWrap, { marginTop: 12 }]}>
              <Ionicons name="lock-closed-outline" size={18} color="#6B6B6B" />
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPw}
              />
              <Pressable onPress={() => setShowPw(v => !v)}>
                <Ionicons name={showPw ? "eye-off-outline" : "eye-outline"} size={18} color="#6B6B6B" />
              </Pressable>
            </View>

            {/* Confirm Password */}
            <View style={[styles.inputWrap, { marginTop: 12 }]}>
              <Ionicons name="lock-closed-outline" size={18} color="#6B6B6B" />
              <TextInput
                style={styles.input}
                placeholder="Confirm your password"
                value={confirm}
                onChangeText={setConfirm}
                secureTextEntry={!showPw2}
              />
              <Pressable onPress={() => setShowPw2(v => !v)}>
                <Ionicons name={showPw2 ? "eye-off-outline" : "eye-outline"} size={18} color="#6B6B6B" />
              </Pressable>
            </View>

            {/* ปุ่มสมัคร */}
            <Pressable style={[styles.btn, styles.btnPrimary]} onPress={onSubmit}>
              <Text style={[styles.btnText, styles.btnPrimaryText]}>Create account</Text>
            </Pressable>

            {/* Terms */}
            <Text style={styles.terms}>
              By signing up, you agree to our <Text style={styles.link}>Terms of {"\n"} service</Text> and{" "}
              <Text style={styles.link}>Privacy policy</Text>
            </Text>
          </ScrollView>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

/* ====== สไตล์: โคลนจากไฟล์ signin ของคุณ ====== */
const PRIMARY = "#bcd6e7";
const TEXT = "#111";
const MUTED = "#6B6B6B";

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff" },

  logo: {
    width: 300,
    height: 150,
  },

  topSection: {
    marginTop: -35,
    alignItems: "center",
    paddingTop: 90,
    paddingHorizontal: 10,
    paddingBottom: 8,
  },
  title: { fontSize: 25, fontWeight: "800", color: TEXT, marginTop: 8 },
  subtitle: { marginTop: 20, fontSize: 14, lineHeight: 18, color: "#959595", textAlign: "center" },

  tabsOuterRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 10,
    marginBottom: -15,
    borderBottomColor: "#c8d9eb",
    zIndex: 1,
  },
  tabBtn: { paddingHorizontal: 8, paddingVertical: 16 },
  tabText: { fontSize: 17, color: MUTED, fontWeight: "700" },
  tabActive: {
    color: "#2f6fa0",
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: "#2f6fa0",
  },

  bottomSheet: {
    flex: 1,
    backgroundColor: "#eaf4fb",
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: "#e7eef5",
    marginTop: -3,
  },
  sheetContent: { padding: 16 },

  inputWrap: {
    width: "85%",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 25,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 53,
    borderWidth: 1,
    borderColor: "#eee",
  },
  input: { flex: 1, fontSize: 16, color: "#959595" },

  btn: {
    width: "85%",
    alignSelf: "center",
    alignItems: "center",
    height: 53,
    borderRadius: 12,
    justifyContent: "center",
    marginTop: 36,
  },
  btnPrimary: { backgroundColor: "#9ACBE2" },
  btnText: { fontSize: 20, fontWeight: "800" },
  btnPrimaryText: { color: "#0B2A3A" },

  terms: {
    marginTop: 20,
    fontSize: 13,
    color: MUTED,
    textAlign: "center",
  },
  link: { textDecorationLine: "underline", color: "#2f6fa0", fontWeight: "600" },
});


