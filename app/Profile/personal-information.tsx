// app/Profile/personal-information.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { styles } from "./styles/personalstyles";

export default function PersonalInformationScreen() {
  const [form, setForm] = useState({
    name: "",
    foodAllergies: "",
    allergicDrugs: "",
    chronicDisease: "",
    emergencyCall: "",
  });
  const [saving, setSaving] = useState(false);

  // ✅ state สำหรับปุ่ม Sign out
  const [signingOut, setSigningOut] = useState(false);

  const onChange = (k: keyof typeof form, v: string) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const onSave = async () => {
    if (!form.name.trim()) {
      Alert.alert("Required", "Please enter your name.");
      return;
    }
    setSaving(true);
    try {
      // TODO: call API save
      Alert.alert("Saved", "Your personal information has been saved.");
    } catch (e) {
      Alert.alert("Error", "Could not save, please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ✅ ฟังก์ชัน Sign out
  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      // ลบ token / user data ที่เคยเก็บไว้
      await Promise.all([
        AsyncStorage.removeItem("TOKEN"),
        AsyncStorage.removeItem("USER_DATA"),
      ]);

      // ถ้าหน้า Welcome อยู่ที่ app/index.tsx ให้ใช้ "/"
      // ถ้าอยู่ที่ app/welcome.tsx ให้เปลี่ยนเป็น "/welcome"
      const WELCOME_PATH = "/Auth/welcome"; // ← แก้เป็น "/welcome" ถ้าคุณวางไฟล์ไว้ชื่อนั้น

      // บางเคส iOS/Expo ชอบไม่ยอมเปลี่ยนหน้าทันที—หน่วง 1 tick
      router.replace(WELCOME_PATH);
      setTimeout(() => router.replace(WELCOME_PATH), 0);
    } catch (e) {
      Alert.alert("Error", "Sign out failed, please try again.");
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.select({ ios: "padding" })}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* โลโก้ */}
        <Image
          source={require("../../assets/images/logo.png")}
          style={styles.logo}
          contentFit="contain"
        />

        {/* หัวข้อ */}
        <Text style={styles.screenTitle}>Personal Information</Text>

        {/* การ์ดฟอร์ม */}
        <View style={styles.card}>
          <View style={styles.item}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Fullname or Nickname"
              placeholderTextColor="#B9B9B9"
              value={form.name}
              onChangeText={(v) => onChange("name", v)}
              returnKeyType="next"
            />
          </View>
          <View style={styles.divider} />

          <View style={styles.item}>
            <Text style={styles.label}>Food Allergies</Text>
            <TextInput
              style={styles.input}
              placeholder="Food Name"
              placeholderTextColor="#B9B9B9"
              value={form.foodAllergies}
              onChangeText={(v) => onChange("foodAllergies", v)}
              returnKeyType="next"
            />
          </View>
          <View style={styles.divider} />

          <View style={styles.item}>
            <Text style={styles.label}>Allergic Drugs</Text>
            <TextInput
              style={styles.input}
              placeholder="Drugs Name"
              placeholderTextColor="#B9B9B9"
              value={form.allergicDrugs}
              onChangeText={(v) => onChange("allergicDrugs", v)}
              returnKeyType="next"
            />
          </View>
          <View style={styles.divider} />

          <View style={styles.item}>
            <Text style={styles.label}>Chronic Disease</Text>
            <TextInput
              style={styles.input}
              placeholder="Medical Condition"
              placeholderTextColor="#B9B9B9"
              value={form.chronicDisease}
              onChangeText={(v) => onChange("chronicDisease", v)}
              returnKeyType="next"
            />
          </View>
          <View style={styles.divider} />

          <View style={styles.item}>
            <Text style={styles.label}>Emergency Call</Text>
            <TextInput
              style={styles.input}
              placeholder="(+66)"
              placeholderTextColor="#B9B9B9"
              value={form.emergencyCall}
              onChangeText={(v) => onChange("emergencyCall", v)}
              keyboardType="phone-pad"
              returnKeyType="done"
            />
          </View>
        </View>

        {/* ปุ่ม Save */}
        <Pressable
          onPress={onSave}
          disabled={saving}
          style={({ pressed }) => [
            styles.saveBtn,
            (saving || pressed) && { opacity: 0.7 },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Save personal information"
        >
          <Text style={styles.saveText}>{saving ? "Saving..." : "Save"}</Text>
        </Pressable>

        {/* ปุ่ม Sign out */}
        <Pressable
          onPress={handleSignOut}
          disabled={signingOut}
          style={({ pressed }) => [
            styles.signOutBtn,
            (signingOut || pressed) && { opacity: 0.75 },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Sign out and go to Welcome"
        >
          <Text style={styles.signOutText}>
            {signingOut ? "Signing out..." : "Sign out"}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
