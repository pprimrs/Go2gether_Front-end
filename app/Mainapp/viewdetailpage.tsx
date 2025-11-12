// app/Mainapp/viewdetailpage.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styles } from "./styles/viewdetailstyles";

const BASE_URL = "https://undeclamatory-precollegiate-felicitas.ngrok-free.dev";

/** ---------- Per-user storage helpers ---------- */
const USER_NS = (email: string) => `USER(${email})`;
const keyScoped = (email: string, base: string) => `${USER_NS(email)}:${base}`;
const KEY_TRIP_COVER_MAP = (email: string) => keyScoped(email, "TRIP_COVER_MAP");
const KEY_JOINED_TRIPS = (email: string) => keyScoped(email, "JOINED_TRIPS");
const KEY_ACTIVE_EMAIL = "ACTIVE_EMAIL";

async function fetchWithAuth(path: string, init?: RequestInit) {
  const token = await AsyncStorage.getItem("TOKEN");
  const headers: Record<string, string> = { ...(init?.headers as Record<string, string>) };
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
async function removeJoined(email: string, tripId: string) {
  const raw = await AsyncStorage.getItem(KEY_JOINED_TRIPS(email));
  const set = new Set<string>(raw ? JSON.parse(raw) : []);
  if (set.has(tripId)) {
    set.delete(tripId);
    await AsyncStorage.setItem(KEY_JOINED_TRIPS(email), JSON.stringify(Array.from(set)));
  }
}

/** ---------- Date helpers ---------- */
const toLocalISO = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};
const fmt = (d?: Date) =>
  !d ? "" : `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;

const parseDateSafe = (v?: string): Date | undefined => {
  if (!v || typeof v !== "string") return undefined;
  const s = v.trim();
  const mISO = s.match(/^(\d{4})[-/](\d{2})[-/](\d{2})/);
  if (mISO) return new Date(Number(mISO[1]), Number(mISO[2]) - 1, Number(mISO[3]));
  const mDMY = s.match(/^(\d{2})[/-](\d{2})[/-](\d{4})$/);
  if (mDMY) return new Date(Number(mDMY[3]), Number(mDMY[2]) - 1, Number(mDMY[1]));
  const t = Date.parse(s);
  if (!Number.isNaN(t)) return new Date(t);
  return undefined;
};
const firstNonEmpty = (obj: any, keys: string[]) => {
  for (const k of keys) {
    const parts = k.split(".");
    let cur = obj;
    for (const p of parts) {
      if (cur && typeof cur === "object" && p in cur) cur = cur[p];
      else {
        cur = undefined;
        break;
      }
    }
    if (cur !== undefined && cur !== null && String(cur).trim() !== "") return String(cur);
  }
  return "";
};
const expandYmdRange = (start?: Date, end?: Date): string[] => {
  if (!start || !end) return [];
  const s = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const e = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  if (e < s) return [];
  const out: string[] = [];
  let cur = s;
  while (cur <= e) {
    out.push(toLocalISO(cur));
    const nxt = new Date(cur);
    nxt.setDate(nxt.getDate() + 1);
    cur = nxt;
  }
  return out;
};
const compressDatesToRange = (dates: string[]): { start?: Date; end?: Date } => {
  const valid = dates
    .map((d) => parseDateSafe(d))
    .filter((d): d is Date => !!d)
    .sort((a, b) => a.getTime() - b.getTime());
  if (!valid.length) return {};
  return { start: valid[0], end: valid[valid.length - 1] };
};

/** ---------- Types ---------- */
type TripDetail = {
  id: string;
  name: string;
  destination: string;
  start_date: string;
  end_date: string;
  currency?: string;
  total_budget?: number;
  description?: string;
  owner_email?: string;
  created_by?: string;
};

export default function ViewDetailPage() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string; isCreator?: string; start?: string; end?: string; invite?: string }>();
  const tripId = String(params?.id || "");
  const startParam = params?.start ? String(params.start) : "";
  const endParam   = params?.end   ? String(params.end)   : "";
  const inviteToken = params?.invite ? String(params.invite) : "";

  const [loading, setLoading] = useState(true);
  const [trip, setTrip] = useState<TripDetail | null>(null);
  const [coverUri, setCoverUri] = useState<string | undefined>(undefined);
  const [userEmail, setUserEmail] = useState("");

  // Joiner form
  const [joinForm, setJoinForm] = useState({ activity: "" });
  const [jStart, setJStart] = useState<Date | undefined>();
  const [jEnd, setJEnd] = useState<Date | undefined>();
  const [jPickerVisible, setJPickerVisible] = useState(false);
  const [jPicking, setJPicking] = useState<"start" | "end">("start");
  const [jTempDate, setJTempDate] = useState<Date>(new Date());
  const [jBudget, setJBudget] = useState({ food: "", hotel: "", shopping: "", transport: "" });
  const jTotal = useMemo(() => {
    const n = (s: string) => Number(s || 0);
    return n(jBudget.food) + n(jBudget.hotel) + n(jBudget.shopping) + n(jBudget.transport);
  }, [jBudget]);
  const canSaveJoin = true;

  /** ---------- Fetch Trip Detail ---------- */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        let t: any = {};
        try {
          const res = await fetchWithAuth(`${BASE_URL}/api/trips/${encodeURIComponent(tripId)}`);
          const data = await res.json().catch(() => ({}));
          t = (data?.trip || data) ?? {};
        } catch {}

        // local (create trip)
        let localStart = "";
        let localEnd = "";
        try {
          const localRaw = await AsyncStorage.getItem(`CREATE_TRIP_FORM_${tripId}`);
          if (localRaw) {
            const l = JSON.parse(localRaw);
            localStart = firstNonEmpty(l, ["period.start", "period.start_date", "start_date", "start"]);
            localEnd   = firstNonEmpty(l, ["period.end", "period.end_date", "end_date", "end"]);
          }
        } catch {}

        const startRaw =
          startParam || localStart || firstNonEmpty(t, [
            "start_date","startDate","start","from_date","from","period.start_date","period.start","dates.start","start_at",
          ]);
        const endRaw =
          endParam || localEnd || firstNonEmpty(t, [
            "end_date","endDate","end","to_date","to","period.end_date","period.end","dates.end","end_at",
          ]);

        const sDate = parseDateSafe(startRaw);
        const eDate = parseDateSafe(endRaw);
        const startNorm = sDate ? toLocalISO(sDate) : startRaw || "";
        const endNorm   = eDate ? toLocalISO(eDate) : endRaw   || "";

        const normalized: TripDetail = {
          id: String(t?.id ?? tripId),
          name: String(t?.name ?? "Untitled Trip"),
          destination: String(t?.destination ?? ""),
          start_date: startNorm,
          end_date: endNorm,
          currency: String(t?.currency ?? "THB"),
          total_budget: Number(t?.total_budget ?? 0),
          description: String(t?.description ?? ""),
          owner_email: t?.owner_email ? String(t.owner_email) : undefined,
          created_by: t?.created_by ? String(t.created_by) : undefined,
        };

        if (!cancelled) setTrip(normalized);
      } catch {
        if (!cancelled)
          setTrip({
            id: tripId,
            name: "Untitled Trip",
            destination: "",
            start_date: "",
            end_date: "",
            currency: "THB",
            total_budget: 0,
            description: "",
          });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [tripId, startParam, endParam]);

  /** ---------- Load cover + email ---------- */
  useEffect(() => {
    (async () => {
      try {
        const email = await getActiveEmail();
        setUserEmail(email);
        const rawMap = await AsyncStorage.getItem(KEY_TRIP_COVER_MAP(email));
        const map = rawMap ? JSON.parse(rawMap) : {};
        if (tripId && map[tripId]) setCoverUri(map[tripId]);
      } catch {}
    })();
  }, [tripId]);

  /** ---------- Prefill joiner ---------- */
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(`JOIN_FORM_${tripId}`);
        if (raw) {
          const saved = JSON.parse(raw);
          if (saved?.activity) setJoinForm({ activity: saved.activity });
          if (saved?.budget) {
            setJBudget({
              food: String(saved.budget.food ?? ""),
              hotel: String(saved.budget.hotel ?? ""),
              shopping: String(saved.budget.shopping ?? ""),
              transport: String(saved.budget.transport ?? ""),
            });
          }
          if (saved?.period?.start) setJStart(parseDateSafe(saved.period.start));
          if (saved?.period?.end) setJEnd(parseDateSafe(saved.period.end));
        } else if (trip?.start_date || trip?.end_date) {
          const s = parseDateSafe(trip?.start_date);
          const e = parseDateSafe(trip?.end_date);
          if (s) setJStart(s);
          if (e) setJEnd(e);
        }
      } catch {}
    })();
  }, [tripId, trip?.start_date, trip?.end_date]);

  // sync availability/me → period
  useEffect(() => {
    (async () => {
      try {
        const res = await fetchWithAuth(`${BASE_URL}/api/trips/${encodeURIComponent(tripId)}/availability/me`);
        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          const list: string[] = Array.isArray(data) ? data : Array.isArray(data?.dates) ? data.dates : [];
          if (list.length) {
            const { start, end } = compressDatesToRange(list);
            if (start) setJStart(start);
            if (end) setJEnd(end);
          }
        }
      } catch {}
    })();
  }, [tripId]);

  /** ---------- Role ---------- */
  const isCreator = useMemo(() => {
    if (params?.isCreator === "1") return true;
    if (!trip) return false;
    const owner = (trip.owner_email || trip.created_by || "").toLowerCase();
    return owner && userEmail && owner === userEmail.toLowerCase();
  }, [params?.isCreator, trip, userEmail]);

  /** ---------- Local save ---------- */
  const saveJoinLocal = async () => {
    const payload = {
      ...joinForm,
      period: { start: jStart ? toLocalISO(jStart) : "", end: jEnd ? toLocalISO(jEnd) : "" },
      budget: jBudget,
      total_budget: jTotal,
    };
    try {
      await AsyncStorage.setItem(`JOIN_FORM_${tripId}`, JSON.stringify(payload));
    } catch {}
  };

  /** ---------- API helpers ---------- */
  async function joinTripIfNeededUsingToken(tripId: string): Promise<"joined" | "already" | "skipped"> {
    // join เฉพาะเมื่อมาด้วย invite token; ถ้าไม่มีให้ข้าม
    if (!inviteToken) return "skipped";
    const token = await AsyncStorage.getItem("TOKEN");
    if (!token) throw new Error("no token");

    const res = await fetch(`${BASE_URL}/api/trips/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ invitation_token: inviteToken }),
    });

    if (res.status === 200 || res.status === 201 || res.status === 409) {
      const email = await getActiveEmail();
      await addJoined(email, tripId);
      return res.status === 409 ? "already" : "joined";
    }
    const msg = await res.text().catch(() => "");
    throw new Error(`Join failed (${res.status}) ${msg}`);
  }

  async function saveAvailability(tripId: string, days: string[]) {
    const token = await AsyncStorage.getItem("TOKEN");
    if (!token) throw new Error("no token");
    const res = await fetch(`${BASE_URL}/api/trips/${encodeURIComponent(tripId)}/availability`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ dates: days }),
    });
    if (!res.ok) {
      const msg = await res.text().catch(() => "");
      throw new Error(`Save availability failed (${res.status}) ${msg}`);
    }
    try {
      const js = await res.json();
      const s = js?.summary;
      if (s && (typeof s.submitted_dates === "number" || typeof s.total_dates === "number")) {
        Alert.alert("Submitted", `Saved ${s.submitted_dates ?? 0} / ${s.total_dates ?? days.length} days.`);
        return;
      }
    } catch {}
    Alert.alert("Submitted", "Your free days have been saved.");
  }

  /** ---------- Submit ---------- */
  const onSaveJoin = async () => {
    // save local first (เสมอ)
    await saveJoinLocal();

    const days = expandYmdRange(jStart, jEnd);
    if (days.length === 0) {
      Alert.alert("Select period", "Please select your free period (From/To) before saving.");
      return;
    }

    try {
      // ผู้เข้าร่วมที่เปิดด้วย invite ให้ join ก่อน
      if (!isCreator) {
        await joinTripIfNeededUsingToken(tripId);
      }
      await saveAvailability(tripId, days);
    } catch (e: any) {
      // เก็บโลคัลแล้วแจ้งเตือนแบบไม่ฟ้องยาว
      Alert.alert("Saved locally", e?.message || "We saved your info on this device.");
    }
  };

  /** ---------- Delete Trip (creator only) ---------- */
  const onDeleteTrip = async () => {
    Alert.alert("Delete Trip", "Are you sure you want to delete this trip?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const res = await fetchWithAuth(`${BASE_URL}/api/trips/${encodeURIComponent(tripId)}`, {
              method: "DELETE",
            });
            if (!res.ok) throw new Error(String(res.status));

            try {
              const email = await getActiveEmail();
              const raw = await AsyncStorage.getItem(KEY_TRIP_COVER_MAP(email));
              const map = raw ? JSON.parse(raw) : {};
              if (map[tripId]) {
                delete map[tripId];
                await AsyncStorage.setItem(KEY_TRIP_COVER_MAP(email), JSON.stringify(map));
              }
              await removeJoined(email, tripId);
            } catch {}

            Alert.alert("Deleted", "Trip has been deleted.");
            router.replace("/Mainapp/mytrippage");
          } catch {
            Alert.alert("Error", "Failed to delete trip.");
          }
        },
      },
    ]);
  };

  /** ---------- Cover picker (creator) ---------- */
  const pickCover = async () => {
    if (!isCreator) return;
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.9,
      aspect: [4, 4],
    });
    if (!res.canceled && res.assets?.length) {
      const uri = res.assets[0].uri;
      setCoverUri(uri);
      try {
        const email = await getActiveEmail();
        const raw = await AsyncStorage.getItem(KEY_TRIP_COVER_MAP(email));
        const map = raw ? JSON.parse(raw) : {};
        map[tripId] = uri;
        await AsyncStorage.setItem(KEY_TRIP_COVER_MAP(email), JSON.stringify(map));
      } catch {}
    }
  };

  /** ---------- Date picker (joiner) ---------- */
  const [jPickerOpen, setJPickerOpen] = useState(false);
  const openJStart = () => { setJPicking("start"); setJTempDate(jStart || new Date()); setJPickerVisible(true); };
  const openJEnd   = () => {
    if (!jStart) return Alert.alert("Select start date first");
    setJPicking("end"); setJTempDate(jEnd || jStart || new Date()); setJPickerVisible(true);
  };
  const onAndroidChange = (e: DateTimePickerEvent, d?: Date) => { if (e.type !== "dismissed" && d) setJTempDate(d); };
  const onIOSChange = (_: any, d?: Date) => { if (d) setJTempDate(d); };
  const confirmPick = () => {
    if (jPicking === "start") {
      setJStart(jTempDate);
      if (jEnd && jEnd < jTempDate) setJEnd(undefined);
    } else {
      if (jStart && jTempDate < jStart) return Alert.alert("Invalid range", "End date must be after start date.");
      setJEnd(jTempDate);
    }
    setJPickerVisible(false);
  };

  /** ---------- Derived strings ---------- */
  const tripStartStr = useMemo(() => {
    const s = trip?.start_date;
    if (!s) return "-";
    const d = parseDateSafe(s);
    return d ? fmt(d) : s;
  }, [trip?.start_date]);
  const tripEndStr = useMemo(() => {
    const s = trip?.end_date;
    if (!s) return "-";
    const d = parseDateSafe(s);
    return d ? fmt(d) : s;
  }, [trip?.end_date]);

  /** ---------- Header ---------- */
  const Header = (
    <View style={[styles.topBar, { paddingTop: insets.top, height: 56 + insets.top }]}>
      <Pressable
        onPress={() => (router.canGoBack() ? router.back() : router.replace("/Mainapp/mytrippage"))}
        hitSlop={10}
      >
        <Ionicons name="chevron-back" size={24} color="#111" />
      </Pressable>
      <Text style={styles.title}>{isCreator ? "Trip Detail" : "Join Trip"}</Text>
      <View style={{ width: 24 }} />
    </View>
  );

  if (loading)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        {Header}
        <ActivityIndicator />
      </View>
    );

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: "#FFF" }} behavior={Platform.select({ ios: "padding" })}>
      {Header}

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.pageContent, { paddingBottom: 220 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Cover */}
        <View style={styles.coverWrap}>
          {coverUri ? (
            <Image source={{ uri: coverUri }} style={styles.coverImg} contentFit="cover" />
          ) : (
            <View style={[styles.coverImg, styles.coverPlaceholder]}>
              <Ionicons name="image-outline" size={28} color="#97A6B1" />
              <Text style={styles.coverHint}>No cover image</Text>
            </View>
          )}
          {isCreator && (
            <Pressable style={styles.coverAction} onPress={pickCover}>
              <Ionicons name="add" size={18} color="#fff" />
            </Pressable>
          )}
        </View>

        {/* Trip read-only */}
        <Text style={styles.label}>Trip Name</Text>
        <View style={[styles.input, { justifyContent: "center" }]}><Text>{trip?.name || "-"}</Text></View>

        <Text style={styles.label}>Destination</Text>
        <View style={[styles.input, { justifyContent: "center" }]}><Text>{trip?.destination || "-"}</Text></View>

        {/* Period (read-only from trip) */}
        <Text style={[styles.label, { marginBottom: 6 }]}>Period</Text>
        <Text style={{ color: "#6A7A88", marginBottom: 8 }}>From – To</Text>
        <Text style={{ fontSize: 16, fontWeight: "600", color: "#2F5064", backgroundColor: "#F1F5F9", paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12 }}>
          {tripStartStr} — {tripEndStr}
        </Text>

        <Text style={styles.label}>Total Budget</Text>
        <View style={[styles.input, { justifyContent: "center" }]}>
          <Text>{trip?.total_budget?.toLocaleString() ?? "-"} {trip?.currency || "THB"}</Text>
        </View>

        {/* Your Information */}
        <Text style={[styles.label, { marginTop: 36 }]}>Your Information</Text>

        <Text style={[styles.label, { marginBottom: 6 }]}>Select Your Free Period</Text>
        <View style={styles.row}>
          <Pressable style={[styles.dateBox, !jStart && styles.dateBoxPlaceholder]} onPress={openJStart}>
            <Ionicons name="calendar-outline" size={16} color={jStart ? "#2F5064" : "#9BA4AE"} style={{ marginRight: 6 }} />
            <Text style={[styles.dateText, !jStart && styles.datePlaceholder]}>{jStart ? fmt(jStart) : "From"}</Text>
          </Pressable>
          <Pressable style={[styles.dateBox, !jEnd && styles.dateBoxPlaceholder]} onPress={openJEnd}>
            <Ionicons name="calendar-outline" size={16} color={jEnd ? "#2F5064" : "#9BA4AE"} style={{ marginRight: 6 }} />
            <Text style={[styles.dateText, !jEnd && styles.datePlaceholder]}>{jEnd ? fmt(jEnd) : "To"}</Text>
          </Pressable>
        </View>

        <Text style={[styles.label, { marginTop: 10 }]}>Budget</Text>
        {["Food", "Hotel", "Shopping", "Transport"].map((t) => {
          const k = (t === "Transport" ? "transport" : t.toLowerCase()) as keyof typeof jBudget;
          const icon = t === "Food" ? "cafe-outline" : t === "Hotel" ? "bed-outline" : t === "Shopping" ? "bag-outline" : "bus-outline";
          return (
            <View key={k} style={styles.budgetRow}>
              <Ionicons name={icon as any} size={16} color="#B2B2B2" />
              <Text style={styles.budgetText}>{t}</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0"
                keyboardType="numeric"
                value={jBudget[k]}
                onChangeText={(v) => setJBudget((b) => ({ ...b, [k]: v.replace(/[^\d]/g, "") }))}
              />
              <Text style={styles.currency}>฿</Text>
            </View>
          );
        })}

        <Text style={styles.label}>Activity</Text>
        <TextInput
          style={[styles.input, { height: 88, textAlignVertical: "top", paddingTop: 12 }]}
          placeholder="Activity"
          value={joinForm.activity}
          onChangeText={(v) => setJoinForm((p) => ({ ...p, activity: v }))}
          multiline
        />

        {/* Bottom buttons */}
        <View style={styles.bottomButtons}>
          {isCreator ? (
            <Pressable style={styles.btnDanger} onPress={onDeleteTrip}>
              <Text style={styles.btnDangerText}>Delete Trip</Text>
            </Pressable>
          ) : (
            <View style={{ flex: 1 }} />
          )}
          <Pressable style={[styles.btnPrimary, !canSaveJoin && styles.btnPrimaryDisabled]} disabled={!canSaveJoin} onPress={onSaveJoin}>
            <Text style={[styles.btnPrimaryText, !canSaveJoin && styles.btnPrimaryTextDisabled]}>Save</Text>
          </Pressable>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Date picker modal */}
      {jPickerVisible && (
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Pressable onPress={() => setJPickerVisible(false)} hitSlop={10}><Text style={styles.modalCancel}>Cancel</Text></Pressable>
              <Text style={styles.modalTitle}>{jPicking === "start" ? "Select Start Date" : "Select End Date"}</Text>
              <Pressable onPress={confirmPick} hitSlop={10}><Text style={styles.modalDone}>Done</Text></Pressable>
            </View>
            <DateTimePicker
              value={jTempDate}
              mode="date"
              display={Platform.OS === "ios" ? "inline" : "calendar"}
              onChange={Platform.OS === "ios" ? onIOSChange : onAndroidChange}
              minimumDate={jPicking === "end" ? jStart || new Date() : new Date()}
            />
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}
