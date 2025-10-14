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
import { styles } from "./styles/personalstyles"; // ⬅️ ดึงสไตล์จากไฟล์แยก

export default function PersonalInformationScreen() {
  const [form, setForm] = useState({
    name: "",
    foodAllergies: "",
    allergicDrugs: "",
    chronicDisease: "",
    emergencyCall: "",
  });
  const [saving, setSaving] = useState(false);

  const onChange = (k: keyof typeof form, v: string) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const onSave = async () => {
    if (!form.name.trim()) {
      Alert.alert("Required", "Please enter your name.");
      return;
    }
    setSaving(true);
    try {
      // TODO: เชื่อม API บันทึกจริง
      Alert.alert("Saved", "Your personal information has been saved.");
    } catch (e: any) {
      Alert.alert("Error", "Could not save, please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.select({ ios: "padding" })}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* โลโก้ */}
        <Image
          // ปรับ path ให้ตรงกับโปรเจกต์จริง
          source={require("../../assets/images/logo.png")}
          style={styles.logo}
          contentFit="contain"
        />

        {/* หัวข้อ */}
        <Text style={styles.screenTitle}>Personal Information</Text>

        {/* การ์ดฟอร์ม */}
        <View style={styles.card}>
          {/* Name */}
          <View style={styles.item}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Fullname or Nickname"
              placeholderTextColor="#B9B9B9"
              value={form.name}
              onChangeText={v => onChange("name", v)}
              returnKeyType="next"
            />
          </View>
          <View style={styles.divider} />

          {/* Food Allergies */}
          <View style={styles.item}>
            <Text style={styles.label}>Food Allergies</Text>
            <TextInput
              style={styles.input}
              placeholder="Food Name"
              placeholderTextColor="#B9B9B9"
              value={form.foodAllergies}
              onChangeText={v => onChange("foodAllergies", v)}
              returnKeyType="next"
            />
          </View>
          <View style={styles.divider} />

          {/* Allergic Drugs */}
          <View style={styles.item}>
            <Text style={styles.label}>Allergic Drugs</Text>
            <TextInput
              style={styles.input}
              placeholder="Drugs Name"
              placeholderTextColor="#B9B9B9"
              value={form.allergicDrugs}
              onChangeText={v => onChange("allergicDrugs", v)}
              returnKeyType="next"
            />
          </View>
          <View style={styles.divider} />

          {/* Chronic Disease */}
          <View style={styles.item}>
            <Text style={styles.label}>Chronic Disease</Text>
            <TextInput
              style={styles.input}
              placeholder="Medical Condition"
              placeholderTextColor="#B9B9B9"
              value={form.chronicDisease}
              onChangeText={v => onChange("chronicDisease", v)}
              returnKeyType="next"
            />
          </View>
          <View style={styles.divider} />

          {/* Emergency Call */}
          <View style={styles.item}>
            <Text style={styles.label}>Emergency Call</Text>
            <TextInput
              style={styles.input}
              placeholder="(+66)"
              placeholderTextColor="#B9B9B9"
              value={form.emergencyCall}
              onChangeText={v => onChange("emergencyCall", v)}
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
