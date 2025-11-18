// app/Mainapp/buildmytrippage.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { styles } from "./styles/buildmytripstyles";

const BASE_URL = "https://undeclamatory-precollegiate-felicitas.ngrok-free.dev"; // Android Emulator: http://10.0.2.2:8080

/* ---------- Per-user storage helpers ---------- */
const USER_NS = (email: string) => `USER(${email})`;
const keyScoped = (email: string, base: string) => `${USER_NS(email)}:${base}`;
const KEY_TRIP_DRAFTS = (email: string) => keyScoped(email, "TRIP_DRAFTS");
const KEY_TRIP_COVER_MAP = (email: string) => keyScoped(email, "TRIP_COVER_MAP");
const KEY_JOINED_TRIPS = (email: string) => keyScoped(email, "JOINED_TRIPS");
const KEY_TRIP_BUDGET_MAP = (email: string) => keyScoped(email, "TRIP_BUDGET_MAP"); // เก็บ budget แยกหมวด (ใช้กับ draft/local)
const KEY_ACTIVE_EMAIL = "ACTIVE_EMAIL";

// เก็บ trip id ล่าสุดไว้ ใช้คู่กับ auth_token เวลา debug / ใช้ในจุดอื่น
const KEY_LAST_TRIP_ID = "LAST_TRIP_ID";

async function fetchWithAuth(path: string, init?: RequestInit) {
  const token = await AsyncStorage.getItem("TOKEN");
  const headers: Record<string, string> = {
    ...(init?.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(path, { ...init, headers });
  if (res.status === 401) {
    await AsyncStorage.multiRemove(["USER_NAME", "USER_EMAIL", "USER_DATA", "TOKEN"]);
    Alert.alert("Session expired", "Please sign in again.");
    router.replace("/Auth/login");
    throw new Error("Unauthorized");
  }
  return res;
}

async function getActiveEmail(): Promise<string> {
  try {
    const res = await fetchWithAuth(`${BASE_URL}/api/auth/profile`);
    if (res.ok) {
      const p = await res.json().catch(() => ({}));
      const email =
        p?.email ||
        p?.user?.email ||
        p?.data?.email ||
        p?.profile?.email ||
        (await AsyncStorage.getItem("USER_EMAIL")) ||
        "";
      if (email) {
        await AsyncStorage.setItem("USER_EMAIL", String(email));
        await AsyncStorage.setItem(KEY_ACTIVE_EMAIL, String(email));
        return String(email);
      }
    }
  } catch {}
  const cached =
    (await AsyncStorage.getItem(KEY_ACTIVE_EMAIL)) ||
    (await AsyncStorage.getItem("USER_EMAIL")) ||
    "anon";
  return cached;
}

async function addJoined(email: string, tripId: string) {
  const raw = await AsyncStorage.getItem(KEY_JOINED_TRIPS(email));
  const set = new Set<string>(raw ? JSON.parse(raw) : []);
  if (!set.has(tripId)) {
    set.add(tripId);
    await AsyncStorage.setItem(KEY_JOINED_TRIPS(email), JSON.stringify(Array.from(set)));
  }
}

/* ---------- helpers ---------- */
const toISO = (d: Date) => d.toISOString().slice(0, 10);
const formatDate = (d?: Date) =>
  !d
    ? ""
    : `${String(d.getDate()).padStart(2, "0")}/${String(
        d.getMonth() + 1
      ).padStart(2, "0")}/${d.getFullYear()}`;

export default function BuildMyTripPage() {
  const [tripName, setTripName] = useState("");
  const [destination, setDestination] = useState("");
  const [coverUri, setCoverUri] = useState<string | undefined>(undefined);

  // date range
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [pickerVisible, setPickerVisible] = useState(false);
  const [picking, setPicking] = useState<"start" | "end">("start");
  const [tempDate, setTempDate] = useState<Date>(new Date());

  // budgets (string ใน input)
  const [budget, setBudget] = useState({
    food: "",
    hotel: "",
    shopping: "",
    transport: "",
  });

  const totalBudget = useMemo(() => {
    const n = (s: string) => Number(s || 0);
    return n(budget.food) + n(budget.hotel) + n(budget.shopping) + n(budget.transport);
  }, [budget]);

  // เช็คว่าทุก budget กรอกครบ (ไม่ใช่ string ว่าง)
  const hasAllBudget = useMemo(
    () =>
      ["food", "hotel", "shopping", "transport"].every(
        (k) => budget[k as keyof typeof budget].trim() !== ""
      ),
    [budget]
  );

  const canPublish = useMemo(
    () =>
      !!tripName.trim() &&
      !!destination.trim() &&
      !!startDate &&
      !!endDate &&
      endDate >= startDate &&
      hasAllBudget,
    [tripName, destination, startDate, endDate, hasAllBudget]
  );

  // image picker
  const pickCover = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted")
      return Alert.alert("Permission required", "Please allow photo access.");
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.9,
      aspect: [4, 4],
    });
    if (!res.canceled && res.assets?.length) setCoverUri(res.assets[0].uri);
  };

  // date pickers
  const openStartPicker = () => {
    setPicking("start");
    setTempDate(startDate || new Date());
    setPickerVisible(true);
  };
  const openEndPicker = () => {
    if (!startDate) return Alert.alert("Select start date first");
    setPicking("end");
    setTempDate(endDate || startDate || new Date());
    setPickerVisible(true);
  };
  const onAndroidChange = (e: DateTimePickerEvent, d?: Date) => {
    if (e.type !== "dismissed" && d) setTempDate(d);
  };
  const onIOSChange = (_: any, d?: Date) => {
    if (d) setTempDate(d);
  };
  const confirmPick = () => {
    if (picking === "start") {
      setStartDate(tempDate);
      if (endDate && endDate < tempDate) setEndDate(undefined);
    } else {
      if (startDate && tempDate < startDate)
        return Alert.alert("Invalid range", "End date must be after start date.");
      setEndDate(tempDate);
    }
    setPickerVisible(false);
  };

  const [submitting, setSubmitting] = useState(false);

  // DRAFT (LOCAL ONLY) — per-user key
  const onDraft = async () => {
    if (!tripName.trim())
      return Alert.alert("Trip name required", "Please enter your trip name.");

    const draftId = `draft_${Date.now()}`;

    const draft = {
      id: draftId,
      title: tripName.trim(),
      destination: destination.trim(),
      startDate: startDate ? toISO(startDate) : "",
      endDate: endDate ? toISO(endDate) : "",
      total_budget: Number.isFinite(totalBudget) ? totalBudget : 0,
      coverUri, // camelCase
      created_at: new Date().toISOString(),
      status: "draft" as const,
    };

    try {
      const email = await getActiveEmail();

      // เก็บลงลิสต์ DRAFT เดิม
      const raw = await AsyncStorage.getItem(KEY_TRIP_DRAFTS(email));
      const list = raw ? JSON.parse(raw) : [];
      list.unshift(draft);
      await AsyncStorage.setItem(KEY_TRIP_DRAFTS(email), JSON.stringify(list));

      // เก็บ budget แยกหมวดผูกกับ draftId (ใช้กับ FreeDay Budget แบบ local)
      try {
        const rawBudget = await AsyncStorage.getItem(KEY_TRIP_BUDGET_MAP(email));
        const budgetMap = rawBudget ? JSON.parse(rawBudget) : {};
        budgetMap[draftId] = {
          hotel: Number(budget.hotel || 0),
          food: Number(budget.food || 0),
          shopping: Number(budget.shopping || 0),
          transport: Number(budget.transport || 0),
        };
        await AsyncStorage.setItem(
          KEY_TRIP_BUDGET_MAP(email),
          JSON.stringify(budgetMap)
        );
      } catch {
        // ถ้า error ก็ปล่อยผ่าน ไม่กระทบการ save draft
      }

      Alert.alert("Saved to Draft", "Your trip draft has been saved locally.");
      router.replace("/Mainapp/mytrippage");
    } catch {
      Alert.alert("Error", "Could not save draft, please try again.");
    }
  };

  // PUBLISH — เรียก API และบันทึก cover map + JOINED_TRIPS (per-user)
  const onPublish = async () => {
    if (!canPublish)
      return Alert.alert(
        "Incomplete",
        "Please fill in required fields, date range and budget."
      );
    setSubmitting(true);
    try {
      const payload = {
        name: tripName.trim(),
        destination: destination.trim(),
        start_date: toISO(startDate!),
        end_date: toISO(endDate!),
        description: "",
        status: "published",
        currency: "THB",

        // ส่ง budget แยกหมวดเข้า /api/trips ตามรูป Postman
        food: Number(budget.food || 0),
        hotel: Number(budget.hotel || 0),
        shopping: Number(budget.shopping || 0),
        transport: Number(budget.transport || 0),

        // ถ้า backend ยังใช้ total_budget ด้วย ก็ส่งไปด้วย
        total_budget: Number.isFinite(totalBudget) ? totalBudget : 0,
      };

      const res = await fetchWithAuth(`${BASE_URL}/api/trips`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let json: any = {};
      try {
        json = await res.json();
      } catch {}

      if (!res.ok) {
        const msg = json?.message || `Create trip failed (HTTP ${res.status}).`;
        Alert.alert("Error", msg);
        return;
      }

      const trip = json?.trip || json;
      const tripId = trip?.id;

      const email = await getActiveEmail();

      // cover per-user
      if (tripId && coverUri?.trim()) {
        try {
          const raw = await AsyncStorage.getItem(KEY_TRIP_COVER_MAP(email));
          const map = raw ? JSON.parse(raw) : {};
          map[tripId] = coverUri;
          await AsyncStorage.setItem(KEY_TRIP_COVER_MAP(email), JSON.stringify(map));
        } catch {}
      }

      // เก็บ budget แยกหมวดแบบ local ผูกกับ tripId (backup)
      if (tripId) {
        try {
          const rawBudget = await AsyncStorage.getItem(KEY_TRIP_BUDGET_MAP(email));
          const budgetMap = rawBudget ? JSON.parse(rawBudget) : {};
          budgetMap[tripId] = {
            hotel: Number(budget.hotel || 0),
            food: Number(budget.food || 0),
            shopping: Number(budget.shopping || 0),
            transport: Number(budget.transport || 0),
          };
          await AsyncStorage.setItem(
            KEY_TRIP_BUDGET_MAP(email),
            JSON.stringify(budgetMap)
          );
        } catch (err) {
          console.warn("Save category budget locally failed", err);
        }

        await AsyncStorage.setItem(KEY_LAST_TRIP_ID, String(tripId));
        await addJoined(email, String(tripId)); // creator เห็นของตัวเอง
      }

      Alert.alert("Published", "Your trip has been published!");
      router.replace("/Mainapp/mytrippage");
    } catch {
      Alert.alert("Error", "Could not publish trip. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#FFF" }}
      behavior={Platform.select({ ios: "padding" })}
    >
      {/* Header */}
      <View style={[styles.topBar, { marginTop: 12 }]}>
        <Pressable
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace("/Mainapp/mytrippage")
          }
          hitSlop={10}
          style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
        >
          <Ionicons name="chevron-back" size={24} color="#111" />
        </Pressable>
        <Text style={styles.title}>Edit Your Trip</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.pageContent, { paddingBottom: 260 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Cover area */}
        <View style={styles.coverWrap}>
          {coverUri?.trim() ? (
            <Image source={{ uri: coverUri }} style={styles.coverImg} contentFit="cover" />
          ) : (
            <View style={[styles.coverImg, styles.coverPlaceholder]}>
              <Ionicons name="image-outline" size={28} color="#97A6B1" />
              <Text style={styles.coverHint}>No picture</Text>
            </View>
          )}

          {/* add / change photo */}
          <Pressable style={styles.coverAction} onPress={pickCover}>
            <Ionicons name="add" size={18} color="#fff" />
          </Pressable>

          {/* quick clear photo */}
          {coverUri?.trim() && (
            <Pressable
              onPress={() => setCoverUri(undefined)}
              hitSlop={10}
              style={{
                position: "absolute",
                right: 52,
                bottom: 12,
                backgroundColor: "#0008",
                borderRadius: 12,
                padding: 6,
              }}
            >
              <Ionicons name="close" size={14} color="#fff" />
            </Pressable>
          )}
        </View>

        {/* Trip Name */}
        <Text style={styles.label}>Your Trip Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Your Trip Name"
          value={tripName}
          onChangeText={setTripName}
          returnKeyType="next"
        />

        {/* Destination */}
        <Text style={styles.label}>Destination</Text>
        <TextInput
          style={styles.input}
          placeholder="City / Country"
          value={destination}
          onChangeText={setDestination}
          returnKeyType="next"
        />

        {/* Period */}
        <Text style={[styles.label, { marginBottom: 6 }]}>Period</Text>
        <Text style={styles.helper}>Please select the period (From - To)</Text>

        <View style={styles.row}>
          <Pressable
            style={[styles.dateBox, !startDate && styles.dateBoxPlaceholder]}
            onPress={openStartPicker}
          >
            <Ionicons
              name="calendar-outline"
              size={16}
              color={startDate ? "#2F5064" : "#9BA4AE"}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.dateText, !startDate && styles.datePlaceholder]}>
              {startDate ? formatDate(startDate) : "From"}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.dateBox, !endDate && styles.dateBoxPlaceholder]}
            onPress={openEndPicker}
          >
            <Ionicons
              name="calendar-outline"
              size={16}
              color={endDate ? "#2F5064" : "#9BA4AE"}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.dateText, !endDate && styles.datePlaceholder]}>
              {endDate ? formatDate(endDate) : "To"}
            </Text>
          </Pressable>
        </View>

        {/* Budget */}
        <Text style={styles.label}>Budget</Text>
        {["Food", "Hotel", "Shopping", "Transport"].map((t) => {
          const k = (t === "Transport" ? "transport" : t.toLowerCase()) as keyof typeof budget;
          const icon =
            t === "Food"
              ? "cafe-outline"
              : t === "Hotel"
              ? "bed-outline"
              : t === "Shopping"
              ? "bag-outline"
              : "bus-outline";
          return (
            <View key={k} style={styles.budgetRow}>
              <Ionicons name={icon} size={16} color="#B2B2B2" />
              <Text style={styles.budgetText}>{t}</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0"
                keyboardType="numeric"
                value={budget[k]}
                onChangeText={(v) =>
                  setBudget((b) => ({ ...b, [k]: v.replace(/[^\d]/g, "") }))
                }
              />
              <Text style={styles.currency}>฿</Text>
            </View>
          );
        })}

        <View style={{ height: 12 }} />

        {/* Buttons */}
        <View style={styles.bottomButtons}>
          <Pressable style={styles.btnGhost} onPress={onDraft} disabled={submitting}>
            <Text style={styles.btnGhostText}>Draft</Text>
          </Pressable>

          <Pressable
            style={[styles.btnPrimary, (!canPublish || submitting) && styles.btnPrimaryDisabled]}
            disabled={!canPublish || submitting}
            onPress={onPublish}
          >
            {submitting ? (
              <ActivityIndicator />
            ) : (
              <Text
                style={[
                  styles.btnPrimaryText,
                  !canPublish && styles.btnPrimaryTextDisabled,
                ]}
              >
                Publish
              </Text>
            )}
          </Pressable>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Date Picker Modal */}
      <Modal
        visible={pickerVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setPickerVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Pressable onPress={() => setPickerVisible(false)} hitSlop={10}>
                <Text style={styles.modalCancel}>Cancel</Text>
              </Pressable>
              <Text style={styles.modalTitle}>
                {picking === "start" ? "Select Start Date" : "Select End Date"}
              </Text>
              <Pressable onPress={confirmPick} hitSlop={10}>
                <Text style={styles.modalDone}>Done</Text>
              </Pressable>
            </View>
            <DateTimePicker
              value={tempDate}
              mode="date"
              display={Platform.OS === "ios" ? "inline" : "calendar"}
              onChange={Platform.OS === "ios" ? onIOSChange : onAndroidChange}
              minimumDate={picking === "end" ? startDate || new Date() : new Date()}
            />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}
