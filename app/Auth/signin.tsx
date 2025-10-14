// app/Auth/signin/login.tsx
import React, { useState } from "react";
import {View, Text, TextInput, Pressable, StyleSheet, ScrollView, KeyboardAvoidingView, Platform,Alert,} 
from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons"; // npm i @expo/vector-icons
import { router } from "expo-router";

export default function SignInScreen() {
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);

  const onGoogle = () => Alert.alert("Google", "Connect your Google sign-in here.");
  const onForgot = () => Alert.alert("Forgot password", "Route to reset password screen.");
  const onSubmit = () => {
    // TODO: validate & call API
    if (!email || !password) return Alert.alert("Oops", "Please enter email and password.");
    // mock success → เข้าแท็บหลัก
    router.replace("/(tabs)");
  };
  return (
  <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.select({ ios: "padding" })}>
    <View style={styles.screen}>
      {/* ส่วนบน (โลโก้ + หัวข้อ) */}
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

      {/* ✅ แท็บอยู่นอกกรอบสีฟ้า */}
      <View style={styles.tabsOuterRow}>
        <Pressable onPress={() => setTab("login")} style={styles.tabBtn}>
            <Text style={[styles.tabText, tab === "login" && styles.tabActive]}>Login</Text>
        </Pressable>
        <Pressable onPress={() => router.replace("/Auth/signup")} style={styles.tabBtn}>
            <Text style={styles.tabText}>Sign Up</Text>
        </Pressable>
    </View>

      {/* กรอบสีฟ้าด้านล่าง */}
      <View style={styles.bottomSheet}>
        <ScrollView contentContainerStyle={styles.sheetContent} showsVerticalScrollIndicator={false}>
          {/* ปุ่ม Google */}
          <Pressable style={styles.googleBtn} onPress={onGoogle}>
            <Ionicons name="logo-google" size={18} color="#000" />
            <Text style={styles.googleText}>Login with Google</Text>
          </Pressable>

          <Text style={styles.orText}>or with continue with email</Text>

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
        <View style={[styles.inputWrap, { marginTop: 12 }]}>
          <Ionicons name="lock-closed-outline" size={18} color="#6B6B6B" />
          
          <TextInput style={styles.input} placeholder="Enter your password"
            value={password} onChangeText={setPassword} secureTextEntry={!showPw}     // ← ผูกกับ state
          />
      
          <Pressable
              onPress={() => setShowPw(v => !v)}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel={showPw ? "Hide password" : "Show password"}
          >
          
          <Ionicons
              name={showPw ? "eye-off-outline" : "eye-outline"}  // ← เปลี่ยนไอคอนตาม state
              size={18}
              color="#6B6B6B"
          />
        </Pressable>
  </View>


          <Pressable onPress={onForgot} style={{ marginTop: 8 }}>
            <Text style={styles.forgot}>Forgot Password?</Text>
          </Pressable>

          {/* Submit */}
          <Pressable style={[styles.btn, styles.btnPrimary]} onPress={onSubmit}>
            <Text style={[styles.btnText, styles.btnPrimaryText]}>
              {tab === "login" ? "Login" : "Create account"}
            </Text>
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

const PRIMARY = "#bcd6e7";
const TEXT = "#111";
const MUTED = "#6B6B6B";
const CARD_BG = "#eaf4fb";

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
  title: { 
        fontSize: 25, 
        fontWeight: "800", 
        color: TEXT, 
        marginTop: 8 
},
  subtitle: { 
    marginTop: 20, 
    fontSize: 14, 
    lineHeight: 18, 
    color: "#959595", 
    textAlign: "center" 
},

  /* ✅ แท็บอยู่นอกกรอบสีฟ้า */
  tabsOuterRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 10,
    marginBottom: -15,
    borderBottomColor: "#c8d9eb",

    zIndex: 1,
  },
  tabBtn: { 
    paddingHorizontal: 8, 
    paddingVertical: 16 
  },
  
  tabText: { 
    fontSize: 17, 
    color: MUTED, 
    fontWeight: "700" 
},
  tabActive: { 
    color: "#2f6fa0",
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: "#2f6fa0" 
  },

  /* กรอบสีฟ้าล่าง */
  bottomSheet: {
    flex: 1,                         // กินพื้นที่ที่เหลือทั้งหมด
    backgroundColor: "#eaf4fb",
    borderWidth: 1,
    borderTopWidth: 0,               // ให้ต่อกับเส้นใต้แท็บเนียนๆ
    borderColor: "#e7eef5",
    marginTop: -3, 
  },
  sheetContent: { padding: 16 },

  googleBtn: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    width: "85%",
    alignSelf: 'center',
    gap: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    height: 53,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },
  googleText: { 
    fontSize: 16, 
    fontWeight: "700", 
    color: "#000", 
    flex: 1, 
    textAlign: "center" 
},

  orText: { 
    textAlign: "center",
    marginTop: 25, 
    marginBottom: 25, 
    color: MUTED, 
    fontSize: 14 
},

  inputWrap: {
    width: "85%",
    alignSelf: 'center',
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
  input: { 
    flex: 1, 
    fontSize: 16, 
    color: "#959595" },

  forgot: { 
    fontSize: 12, 
    color: "#746E6E", 
    marginTop: 8,
    alignSelf: 'stretch',   // ให้กว้างเท่ากล่องด้านบน
    textAlign: 'left',     // ชิดขวาในกรอบเดียวกัน
    marginHorizontal: 34  
  },

  btn: {
    width: "85%",
    alignSelf: 'center',
    alignItems: "center",
    height: 53,
    borderRadius: 12,
    justifyContent: "center",
    marginTop: 16,
  },
  btnPrimary: { 
    marginTop: 36,
    backgroundColor: "#9ACBE2" 
  },
  btnText: { fontSize: 20, fontWeight: "800" },
  btnPrimaryText: { color: "#0B2A3A" },

  terms: { 
    marginTop: 20, 
    fontSize: 13, 
    color: MUTED, 
    textAlign: "center" 
  },

  link: { textDecorationLine: "underline", color: "#2f6fa0", fontWeight: "600" },

  indicatorWrapper: { alignItems: "center", marginTop: 16, marginBottom: 6 },
});



