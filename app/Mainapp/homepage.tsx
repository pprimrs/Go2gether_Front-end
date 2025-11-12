// app/Mainapp/homepage.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Clipboard from "expo-clipboard";
import { Image } from "expo-image";
import { router, useFocusEffect, usePathname } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { styles } from "./styles/homepagestyles";

const BASE_URL = "https://undeclamatory-precollegiate-felicitas.ngrok-free.dev";

/* ---------- Types ---------- */
type ApiTrip = {
  id: string;
  name: string;
  destination: string;
  status: string;
  start_date: string;
  end_date: string;
};

/* ---------- Per-user namespaced keys ---------- */
const USER_NS = (email: string) => `USER(${email})`;
const keyScoped = (email: string, base: string) => `${USER_NS(email)}:${base}`;
const KEY_TRIP_COVER_MAP = (email: string) => keyScoped(email, "TRIP_COVER_MAP");
const KEY_HIDDEN_PUBLISHED = (email: string) => keyScoped(email, "HIDDEN_PUBLISHED_IDS");
const KEY_JOINED_TRIPS = (email: string) => keyScoped(email, "JOINED_TRIPS");
const KEY_ACTIVE_EMAIL = "ACTIVE_EMAIL";
const KEY_LAST_INVITE_TOKEN = (email: string) => keyScoped(email, "LAST_INVITE_TOKEN");

/* ---------- Helpers ---------- */
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

async function readCoverMap(email: string): Promise<Record<string, string>> {
  try {
    const raw = await AsyncStorage.getItem(KEY_TRIP_COVER_MAP(email));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
async function readHidden(email: string): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY_HIDDEN_PUBLISHED(email));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
async function readJoined(email: string): Promise<Set<string>> {
  try {
    const raw = await AsyncStorage.getItem(KEY_JOINED_TRIPS(email));
    const arr: string[] = raw ? JSON.parse(raw) : [];
    return new Set(arr);
  } catch {
    return new Set();
  }
}
async function writeJoined(email: string, setIds: Set<string>) {
  const arr = Array.from(setIds);
  await AsyncStorage.setItem(KEY_JOINED_TRIPS(email), JSON.stringify(arr));
}

/* ---------- Normalizer ---------- */
function isApiTrip(x: any): x is ApiTrip {
  return (
    x &&
    typeof x === "object" &&
    typeof x.id === "string" &&
    typeof x.name === "string" &&
    typeof x.destination === "string"
  );
}
function normalizeTrips(input: any): ApiTrip[] {
  const arr = (Array.isArray(input?.trips)
    ? input.trips
    : Array.isArray(input)
    ? input
    : []) as any[];
  return arr
    .map((x: any) => ({ ...x, id: String(x?.id ?? "") }))
    .filter(isApiTrip);
}

/* ---------- Utils: extract invitation token ---------- */
/** รองรับ:
 *   http://localhost:8081/trips/<uuid>/join?token=<jwt>
 *   หรือวาง token (JWT) ตรง ๆ
 */
function extractInviteToken(input: string): string | undefined {
  if (!input) return undefined;
  const s = input.trim();
  try {
    const u = new URL(s);
    const token = u.searchParams.get("token") || undefined;
    if (token) return token;
  } catch {
    // not a URL
  }
  if (s.length >= 20) return s; // assume JWT
  return undefined;
}

/* ---------- Small card ---------- */
function TripCard({
  title,
  image,
  onPress,
}: {
  title: string;
  image: any | null;
  onPress?: () => void;
}) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      {image ? (
        <Image source={image} style={styles.cardImage} contentFit="cover" />
      ) : (
        <View
          style={[
            styles.cardImage,
            { alignItems: "center", justifyContent: "center", backgroundColor: "#E9EEF3" },
          ]}
        >
          <Ionicons name="image-outline" size={18} color="#97A6B1" />
          <Text style={{ marginTop: 4, fontSize: 11, color: "#97A6B1", fontWeight: "700" }}>
            No picture
          </Text>
        </View>
      )}
      <Text numberOfLines={1} style={styles.cardTitle}>
        {title}
      </Text>
    </Pressable>
  );
}

/* ---------- Bottom Bar ---------- */
function BottomBar() {
  const pathname = usePathname();
  const items = [
    { key: "/Mainapp/homepage", label: "Home", icon: "home-outline", to: "/Mainapp/homepage" },
    { key: "/Mainapp/mytrippage", label: "My Trip", icon: "location-outline", to: "/Mainapp/mytrippage" },
    { key: "/Mainapp/freedaypage", label: "Free Day", icon: "briefcase-outline", to: "/Mainapp/freedaypage" },
    { key: "/Mainapp/notipage", label: "Notification", icon: "mail-open-outline", to: "/Mainapp/notipage" },
  ] as const;

  const isActive = (k: string) => (pathname ?? "").startsWith(k);

  return (
    <View style={styles.bottomBar}>
      {items.map((it) => {
        const active = isActive(it.key);
        return (
          <Pressable key={it.key} style={styles.tabItem} onPress={() => router.replace(it.to)}>
            <View style={[styles.iconWrap, active && styles.iconWrapActive]}>
              <Ionicons
                name={(active ? it.icon.replace("-outline", "") : it.icon) as any}
                size={22}
                color={active ? "#FFFFFF" : "#8E8E8E"}
              />
            </View>
            <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{it.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/* ---------- Page ---------- */
export default function HomePage() {
  const [userName, setUserName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [published, setPublished] = useState<ApiTrip[]>([]);
  const [coverMap, setCoverMap] = useState<Record<string, string>>({});
  const [hidden, setHidden] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal: Join via Link
  const [joinOpen, setJoinOpen] = useState(false);
  const [joinInput, setJoinInput] = useState("");
  const [joining, setJoining] = useState(false);

  const getImage = (id?: string) => {
    if (id && coverMap[id]) return { uri: coverMap[id] };
    return null;
  };

  const loadUserName = useCallback(async () => {
    try {
      const name = await AsyncStorage.getItem("USER_NAME");
      if (name) setUserName(name);
    } catch {}
  }, []);

  const loadLocalMaps = useCallback(async (currentEmail: string) => {
    setCoverMap(await readCoverMap(currentEmail));
    setHidden(await readHidden(currentEmail));
  }, []);

  const fetchPublished = useCallback(async (currentEmail: string) => {
    setLoading(true);
    try {
      const res = await fetchWithAuth(`${BASE_URL}/api/trips?status=published&limit=100&offset=0`);
      const js = await res.json().catch(() => ({}));
      const all: ApiTrip[] = normalizeTrips(js);
      const joined = await readJoined(currentEmail);
      const mine = all.filter((t) => joined.has(t.id));
      setPublished(mine);
    } catch {
      setPublished([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const e = await getActiveEmail();
        setEmail(e);
        await loadUserName();
        await loadLocalMaps(e);
        await fetchPublished(e);
      })();
    }, [loadUserName, loadLocalMaps, fetchPublished])
  );

  const displayName = userName || "User";
  const filtered = published.filter((t) => !hidden.includes(t.id));
  const hasPublished = filtered.length > 0;

  /* ---------- Join via link handlers ---------- */
  const pasteFromClipboard = async () => {
    try {
      const txt = await Clipboard.getStringAsync();
      if (txt) setJoinInput(txt);
    } catch {
      Alert.alert("Clipboard", "Cannot read from clipboard.");
    }
  };

  // guard กันการยิงซ้ำจาก onPress
  let inFlight = false;
  const submitJoin = async () => {
    if (inFlight || joining) return;
    const token = extractInviteToken(joinInput);
    if (!token) {
      Alert.alert("Invalid", "Please paste a valid invite link or token.");
      return;
    }
    if (!email) {
      Alert.alert("Error", "Please sign in again.");
      return;
    }

    inFlight = true;
    setJoining(true);
    try {
      // เก็บ token ไว้ใช้ภายหลัง
      await AsyncStorage.setItem(KEY_LAST_INVITE_TOKEN(email), token);

      // ส่งตามสเปก Swagger: { invitation_token: string }
      const res = await fetchWithAuth(`${BASE_URL}/api/trips/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invitation_token: token }),
      });

      const rawText = await res.text();
      let js: any = {};
      try {
        js = rawText ? JSON.parse(rawText) : {};
      } catch {}

      if (!res.ok) {
        const msg = js?.message || js?.error || rawText || `HTTP ${res.status}`;
        throw new Error(msg);
      }

      // บันทึก trip ที่เข้าร่วม (ถ้ามีคืนมา)
      const joined = await readJoined(email);
      const tripIdFromRes: string = js?.trip?.id || js?.id || js?.trip_id || "";
      if (tripIdFromRes) joined.add(String(tripIdFromRes));
      await writeJoined(email, joined);

      await fetchPublished(email);
      setJoinOpen(false);
      setJoinInput("");
      Alert.alert("Joined", "You have joined the trip successfully.");
    } catch (e: any) {
      Alert.alert("Join failed", e?.message || "Could not join the trip.");
    } finally {
      inFlight = false;
      setJoining(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.page}
        contentContainerStyle={styles.pageContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={[styles.profileRow, { alignItems: "center", gap: 12 }]}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
            </View>
            <View>
              <Text style={styles.profileName}>{displayName}</Text>
            </View>
          </View>

          <Pressable
            hitSlop={10}
            onPress={() => router.push("Mainapp/settingpage")}
            style={({ pressed }) => [styles.settingContainer, { opacity: pressed ? 0.6 : 1 }]}
            accessibilityLabel="Setting"
            accessibilityRole="button"
          >
            <Ionicons name="settings-outline" size={22} color="#8A8A8A" />
            <Text style={styles.settingLabel}>Setting</Text>
          </Pressable>
        </View>

        {/* My Trip */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Trip</Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Pressable onPress={() => router.push("/Mainapp/buildmytrippage")} style={styles.linkPill}>
                <Text style={styles.linkPillText}>Add Trip +</Text>
              </Pressable>
              {/* ปุ่มเปิด Modal Join */}
              <Pressable onPress={() => setJoinOpen(true)} style={styles.linkPill}>
                <Text style={styles.linkPillText}>Join via Link</Text>
              </Pressable>
            </View>
          </View>

          {loading ? (
            <ActivityIndicator />
          ) : !hasPublished ? (
            <Text style={{ color: "#8A8A8A", marginTop: 8 }}>
              No trips yet. Create or join a trip to get started.
            </Text>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hList}
            >
              {filtered.map((t) => (
                <TripCard
                  key={t.id}
                  title={t.name}
                  image={getImage(t.id)}
                  onPress={() =>
                    router.push({
                      pathname: "/Mainapp/viewdetailpage",
                      params: { id: t.id, start: t.start_date, end: t.end_date },
                    })
                  }
                />
              ))}
              <View style={{ width: 16 }} />
            </ScrollView>
          )}
        </View>

        {/* Favorite Trip (placeholder) */}
        <View style={[styles.section, styles.sectionGapLg]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Favorite Trip</Text>
            <Pressable onPress={() => router.push("/Favorite/add")} style={styles.linkPill}>
              <Text style={styles.linkPillText}>Add Favorite +</Text>
            </Pressable>
          </View>
        </View>

        {/* spacer */}
        <View style={{ height: 110 }} />
      </ScrollView>

      {/* ===== Modal: Join via Link ===== */}
      <Modal
        visible={joinOpen}
        transparent
        animationType="slide"
        onRequestClose={() => (!joining ? setJoinOpen(false) : null)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.35)",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <View
            style={{
              width: "100%",
              maxWidth: 460,
              backgroundColor: "#fff",
              borderRadius: 16,
              padding: 16,
              gap: 10,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "700" }}>Join via Link</Text>
            <Text style={{ color: "#6B7280" }}>
              Paste the invite link or token below. We’ll store the token and join the trip.
            </Text>

            <TextInput
              placeholder="https://... or invitation token"
              value={joinInput}
              onChangeText={setJoinInput}
              autoCapitalize="none"
              autoCorrect={false}
              style={{
                borderWidth: 1,
                borderColor: "#E5E7EB",
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 10,
                fontSize: 14,
              }}
            />

            <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 6 }}>
              <Pressable
                onPress={pasteFromClipboard}
                style={({ pressed }) => ({
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  borderRadius: 10,
                  backgroundColor: pressed ? "#F3F4F6" : "#F9FAFB",
                })}
              >
                <Text style={{ fontWeight: "700", color: "#111827" }}>Paste</Text>
              </Pressable>

              <Pressable
                disabled={joining}
                onPress={() => setJoinOpen(false)}
                style={({ pressed }) => ({
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  borderRadius: 10,
                  backgroundColor: pressed ? "#F3F4F6" : "#F9FAFB",
                  opacity: joining ? 0.6 : 1,
                })}
              >
                <Text style={{ fontWeight: "700", color: "#6B7280" }}>Cancel</Text>
              </Pressable>

              <Pressable
                disabled={joining}
                onPress={submitJoin}
                style={({ pressed }) => ({
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: 10,
                  backgroundColor: joining ? "#BEE3F8" : pressed ? "#1E88E5" : "#2196F3",
                  opacity: joining ? 0.9 : 1,
                })}
              >
                <Text style={{ fontWeight: "700", color: "#fff" }}>
                  {joining ? "Joining..." : "Join"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <BottomBar />
    </View>
  );
}
