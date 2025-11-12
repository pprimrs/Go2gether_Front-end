import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView, Platform,
  Pressable,
  ScrollView,
  Text, TextInput,
  View
} from "react-native";
import { styles } from "./styles/personalcreatestyles";

type FormState = {
  name: string;
  foodAllergies: string;
  allergicDrugs: string;
  chronicDisease: string;
  emergencyCall: string;
};

const toUsername = (s: string) =>
  (s || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();

const resolveUsername = async (fallbackName: string) => {
  try {
    const raw = await AsyncStorage.getItem("USER_DATA");
    if (raw) {
      const u = JSON.parse(raw);
      if (u?.username) return toUsername(String(u.username));
      if (u?.email) {
        const local = String(u.email).split("@")[0];
        const v = toUsername(local);
        if (v) return v;
      }
    }
  } catch {}
  const fromName = toUsername(fallbackName);
  return fromName || `user_${Math.random().toString(36).slice(2, 8)}`;
};

export default function PersonalCreateScreen() {
  const [form, setForm] = useState<FormState>({
    name: "",
    foodAllergies: "",      // ← ช่องเปล่า
    allergicDrugs: "",      // ← ช่องเปล่า
    chronicDisease: "",     // ← ช่องเปล่า
    emergencyCall: "",
  });
  const [touched, setTouched] = useState<Record<keyof FormState, boolean>>({
    name: false, foodAllergies: false, allergicDrugs: false, chronicDisease: false, emergencyCall: false,
  });
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const onChange = (k: keyof FormState, v: string) => {
    if (k === "emergencyCall") {
      const digits = v.replace(/\D/g, "").slice(0, 10);
      setForm(prev => ({ ...prev, emergencyCall: digits }));
      return;
    }
    setForm(prev => ({ ...prev, [k]: v }));
  };
  const onBlur = (k: keyof FormState) => setTouched(prev => ({ ...prev, [k]: true }));

  const errors = useMemo(() => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) e.name = "Please enter your name";
    const phone = form.emergencyCall.trim();
    if (!phone) e.emergencyCall = "Emergency number is required.";
    else if (!/^\d+$/.test(phone)) e.emergencyCall = "Numbers only.";
    else if (phone.length !== 10) e.emergencyCall = "Phone must be exactly 10 digits.";
    return e;
  }, [form]);

  const canSave = useMemo(() => Object.keys(errors).length === 0, [errors]);

  const onSave = async () => {
    if (!canSave) {
      setTouched({ name: true, foodAllergies: true, allergicDrugs: true, chronicDisease: true, emergencyCall: true });
      Alert.alert("Incomplete", "Please correct the highlighted fields.");
      return;
    }
    setSaving(true);
    try {
      await AsyncStorage.setItem("USER_NAME", form.name);
      const token = await AsyncStorage.getItem("TOKEN");
      if (!token) {
        await AsyncStorage.multiRemove(["USER_NAME","USER_EMAIL","USER_DATA","TOKEN"]);
        Alert.alert("Session expired", "Please sign in again.");
        router.replace("/Auth/welcome");
        return;
      }

      // ✅ ส่งตามค่าที่กรอก (ว่างก็ส่งว่าง ไม่เติม '-')
      const payload = {
        allergic_drugs: form.allergicDrugs,
        allergic_food: form.foodAllergies,
        avatar_url: "",
        bio: "",
        birth_date: "",
        chronic_disease: form.chronicDisease,
        display_name: form.name.trim(),
        emergency_contact: form.emergencyCall.trim(),
        first_name: "",
        food_preferences: "",
        last_name: "",
        phone: "",
        username: await resolveUsername(form.name),
      };

      const res = await fetch("https://undeclamatory-precollegiate-felicitas.ngrok-free.dev/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        await AsyncStorage.multiRemove(["USER_NAME","USER_EMAIL","USER_DATA","TOKEN"]);
        Alert.alert("Session expired", "Please sign in again.");
        router.replace("/Auth/welcome");
        return;
      }

      let json: any = {};
      try { json = await res.json(); } catch {}

      if (!res.ok) {
        if (res.status === 409 || /username.*(exists|taken)/i.test(json?.message || "")) {
          Alert.alert("Username taken", "This username is already in use. Please edit your name and try again.");
          return;
        }
        Alert.alert("Error", json?.message || `Create profile failed (HTTP ${res.status}).`);
        return;
      }

      if (json?.user) {
        await AsyncStorage.setItem("USER_DATA", JSON.stringify(json.user));
        if (json.user?.display_name) await AsyncStorage.setItem("USER_NAME", String(json.user.display_name));
        if (json.user?.email) await AsyncStorage.setItem("USER_EMAIL", String(json.user.email));
      }

      Alert.alert("Saved", json?.message || "Your personal information has been saved.");
      router.replace("/Mainapp/homepage");
    } catch (e) {
      Alert.alert("Error", "Could not save, please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await Promise.all([AsyncStorage.removeItem("TOKEN"), AsyncStorage.removeItem("USER_DATA")]);
      const WELCOME_PATH = "/Auth/welcome";
      router.replace(WELCOME_PATH);
      setTimeout(() => router.replace(WELCOME_PATH), 0);
    } catch {
      Alert.alert("Error", "Sign out failed, please try again.");
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.select({ ios: "padding" })}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Image source={require("../../assets/images/logo.png")} style={styles.logo} contentFit="contain" />
        <Text style={styles.screenTitle}>Create Personal Information</Text>

        <View style={styles.card}>
          {/* Name */}
          <View style={styles.item}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Fullname or Nickname"
              placeholderTextColor="#B9B9B9"
              value={form.name}
              onChangeText={(v) => setForm(prev => ({ ...prev, name: v }))}
              onBlur={() => onBlur("name")}
              returnKeyType="next"
            />
            {touched.name && !!errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>
          <View style={styles.divider} />

          {/* Food Allergies */}
          <View style={styles.item}>
            <Text style={styles.label}>Food Allergies</Text>
            <TextInput
              style={styles.input}
              placeholder="Food Name (if any)"
              placeholderTextColor="#B9B9B9"
              value={form.foodAllergies}
              onChangeText={(v) => onChange("foodAllergies", v)}
              onBlur={() => onBlur("foodAllergies")}
              returnKeyType="next"
            />
          </View>
          <View style={styles.divider} />

          {/* Allergic Drugs */}
          <View style={styles.item}>
            <Text style={styles.label}>Allergic Drugs</Text>
            <TextInput
              style={styles.input}
              placeholder="Drug Name (if any)"
              placeholderTextColor="#B9B9B9"
              value={form.allergicDrugs}
              onChangeText={(v) => onChange("allergicDrugs", v)}
              onBlur={() => onBlur("allergicDrugs")}
              returnKeyType="next"
            />
          </View>
          <View style={styles.divider} />

          {/* Chronic Disease */}
          <View style={styles.item}>
            <Text style={styles.label}>Chronic Disease</Text>
            <TextInput
              style={styles.input}
              placeholder="Medical Condition (if any)"
              placeholderTextColor="#B9B9B9"
              value={form.chronicDisease}
              onChangeText={(v) => onChange("chronicDisease", v)}
              onBlur={() => onBlur("chronicDisease")}
              returnKeyType="next"
            />
          </View>
          <View style={styles.divider} />

          {/* Emergency Call */}
          <View style={styles.item}>
            <Text style={styles.label}>Emergency Call</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 0123456789"
              placeholderTextColor="#B9B9B9"
              value={form.emergencyCall}
              onChangeText={(v) => onChange("emergencyCall", v)}
              onBlur={() => onBlur("emergencyCall")}
              keyboardType={Platform.OS === "ios" ? "number-pad" : "numeric"}
              returnKeyType="done"
              maxLength={10}
            />
            {touched.emergencyCall && !!errors.emergencyCall && <Text style={styles.errorText}>{errors.emergencyCall}</Text>}
          </View>
        </View>

        <Pressable
          onPress={onSave}
          disabled={saving || !canSave}
          style={({ pressed }) => [
            styles.saveBtn,
            canSave ? styles.saveBtnActive : styles.saveBtnDisabled,
            (saving || pressed) && { opacity: 0.85 },
          ]}
        >
          <Text style={[styles.saveText, canSave ? styles.saveTextActive : styles.saveTextDisabled]}>
            {saving ? "Saving..." : "Save"}
          </Text>
        </Pressable>

        <Pressable
          onPress={handleSignOut}
          disabled={signingOut}
          style={({ pressed }) => [styles.signOutBtn, (signingOut || pressed) && { opacity: 0.75 }]}
        >
          <Text style={styles.signOutText}>{signingOut ? "Signing out..." : "Sign out"}</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
