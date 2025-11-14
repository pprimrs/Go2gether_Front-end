// app/Mainapp/freedaypage.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { router, usePathname } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, styles } from "./styles/freedaystyles";

const BASE_URL = "https://undeclamatory-precollegiate-felicitas.ngrok-free.dev";

/* ---------- Types ---------- */
type ApiTrip = {
  id: string;
  name: string;
  destination: string;
  total_budget?: number;
  start_date?: string;
  end_date?: string;
};

type DraftTrip = {
  id: string; // draft_xxx
  sourceId?: string;
  title: string;
  destination: string;
  total_budget?: number;
  coverUri?: string;
};

type FreeDayItem = {
  id: string;
  originId?: string;
  title: string;
  destination: string;
  cover: any | null;
  totalBudget?: number;
  budget?: "low" | "mid" | "high";
  source: "published" | "draft";
};

type AvailabilityByUser = Record<string, string[]>;

/* ---------- Per-user namespaced keys ---------- */
const USER_NS = (email: string) => `USER(${email})`;
const keyScoped = (email: string, base: string) => `${USER_NS(email)}:${base}`;
const KEY_TRIP_COVER_MAP = (email: string) => keyScoped(email, "TRIP_COVER_MAP");
const KEY_HIDDEN_PUBLISHED = (email: string) => keyScoped(email, "HIDDEN_PUBLISHED_IDS");
const KEY_TRIP_DRAFTS = (email: string) => keyScoped(email, "TRIP_DRAFTS");
const KEY_JOINED_TRIPS = (email: string) => keyScoped(email, "JOINED_TRIPS");
const KEY_ACTIVE_EMAIL = "ACTIVE_EMAIL";

/* ---------- Budget band helper ---------- */
function bandFromBudget(v?: number): "low" | "mid" | "high" | undefined {
  if (v == null) return undefined;
  if (v < 10000) return "low";
  if (v < 50000) return "mid";
  return "high";
}
const THB = (n: number) =>
  `${n.toLocaleString("en-US", { maximumFractionDigits: 0 })} THB`;

/* ---------- Date utils ---------- */
function ymd(d: Date) {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}
function parseYmd(s: string) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}
function diffDays(a: string, b: string) {
  const da = parseYmd(a).getTime();
  const db = parseYmd(b).getTime();
  return Math.round((db - da) / 86400000);
}
function addDays(ymdStr: string, n: number) {
  const d = parseYmd(ymdStr);
  d.setDate(d.getDate() + n);
  return ymd(d);
}
function formatChip(ymdStr: string) {
  const d = parseYmd(ymdStr);
  return d.toLocaleDateString("en-US", { day: "2-digit", month: "short" });
}

/* ---------- Auth helpers ---------- */
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
        p?.email || p?.user?.email || p?.data?.email || p?.profile?.email ||
        (await AsyncStorage.getItem("USER_EMAIL")) || "";
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

/* ---------- Per-user local readers ---------- */
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
async function readDrafts(email: string): Promise<DraftTrip[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY_TRIP_DRAFTS(email));
    const list = raw ? JSON.parse(raw) : [];
    return (list as any[]).map((d: any) => ({
      id: String(d.id),
      sourceId: d.sourceId ?? d.originId,
      title: d.title ?? d.name ?? "",
      destination: d.destination ?? "",
      coverUri: d.coverUri ?? d.cover_uri ?? undefined,
      total_budget: d.total_budget ?? d.totalBudget ?? undefined,
    })) as DraftTrip[];
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

/* ---------- API: availability periods ---------- */
type ServerPeriod = {
  start_date: string; // "YYYY-MM-DD"
  end_date: string;   // "YYYY-MM-DD"
  member_count?: number;
};

async function apiGeneratePeriods(
  tripId: string,
  opts?: { min_days?: number; min_availability_member?: number }
) {
  const res = await fetchWithAuth(
    `${BASE_URL}/api/trips/${encodeURIComponent(tripId)}/availability/generate-periods`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // ตาม Swagger: body เดียวมีสองพารามิเตอร์
      body: JSON.stringify({
        min_days: opts?.min_days ?? 1,
        min_availability_member: opts?.min_availability_member ?? 1,
      }),
    }
  );
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`Generate failed (${res.status}) ${t}`);
  }
  // server persist เอง
}

async function apiGetAvailablePeriods(tripId: string): Promise<ServerPeriod[]> {
  const res = await fetchWithAuth(
    `${BASE_URL}/api/trips/${encodeURIComponent(tripId)}/available-periods`
  );
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`Fetch periods failed (${res.status}) ${t}`);
  }
  const js = await res.json().catch(() => ({}));
  const arr: any[] = Array.isArray(js) ? js : Array.isArray(js?.periods) ? js.periods : [];
  return arr
    .map((p) => ({
      start_date: p.start_date ?? p.startDate ?? p.start ?? p.from,
      end_date: p.end_date ?? p.endDate ?? p.end ?? p.to,
      member_count: p.member_count ?? p.size ?? p.count,
    }))
    .filter((p) => p.start_date && p.end_date);
}

/* ช่วยแปลงช่วง start-end -> list รายวัน (ใช้กับ UI chips) */
function expandDays(startYmd: string, endYmd: string) {
  const days: string[] = [];
  let cur = startYmd;
  while (diffDays(cur, endYmd) >= 0) {
    days.push(cur);
    cur = addDays(cur, 1);
  }
  return days;
}

/* ---------- Type guard & normalizer ---------- */
function isApiTrip(x: any): x is ApiTrip {
  return x && typeof x === "object" && typeof x.id === "string" && typeof x.name === "string";
}
function normalizeTrips(js: any): ApiTrip[] {
  const arr = (Array.isArray(js?.trips) ? js.trips : Array.isArray(js) ? js : []) as any[];
  return arr.map((t: any) => ({ ...t, id: String(t?.id ?? "") })).filter(isApiTrip);
}

/* ---------- Small Card (ใช้กับทุกแท็บ) ---------- */
function SuggestCard({
  item,
  busy,
  onGenerate,
}: {
  item: FreeDayItem;
  busy: boolean;
  onGenerate: (it: FreeDayItem) => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && { opacity: 0.95, transform: [{ scale: 0.997 }] },
      ]}
      onPress={() => !busy && onGenerate(item)}
      disabled={busy}
    >
      {item.cover ? (
        <Image source={item.cover} style={styles.cardImage} contentFit="cover" />
      ) : (
        <View
          style={[
            styles.cardImage,
            {
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#E9EEF3",
            },
          ]}
        >
          <Ionicons name="image-outline" size={18} color="#97A6B1" />
          <Text
            style={{
              marginTop: 4,
              fontSize: 11,
              color: "#97A6B1",
              fontWeight: "700",
            }}
          >
            No picture
          </Text>
        </View>
      )}
      <Text numberOfLines={1} style={styles.cardTitle}>
        {item.title}
      </Text>
      <Pressable
        style={({ pressed }) => [
          styles.generateBtn,
          pressed && { opacity: 0.85 },
          busy && { opacity: 0.6 },
        ]}
        onPress={() => !busy && onGenerate(item)}
        disabled={busy}
      >
        <Text style={styles.generateText}>{busy ? "Generating..." : "Generate"}</Text>
      </Pressable>
    </Pressable>
  );
}

/* ---------- Bottom Bar ---------- */
function BottomBar() {
  const pathname = usePathname();
  const items = [
    { key: "homepage", label: "Home", icon: "home-outline", to: "/Mainapp/homepage" },
    { key: "mytrippage", label: "My Trip", icon: "location-outline", to: "/Mainapp/mytrippage" },
    { key: "freedaypage", label: "Free Day", icon: "briefcase-outline", to: "/Mainapp/freedaypage" },
    { key: "notipage", label: "Notification", icon: "mail-open-outline", to: "/Mainapp/notipage" },
  ] as const;
  const isActive = (k: string) => pathname?.includes(`/${k}`);
  return (
    <View style={styles.bottomBar}>
      {items.map((it) => {
        const active = isActive(it.key);
        const name = active ? (it.icon.replace("-outline", "") as any) : (it.icon as any);
        return (
          <Pressable key={it.key} style={styles.tabItem} onPress={() => router.replace(it.to)}>
            <View style={[styles.iconWrap, active && styles.iconWrapActive]}>
              <Ionicons size={22} name={name} color={active ? "#fff" : "#8E8E8E"} />
            </View>
            <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{it.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/* ---------- Free Day heuristic mock (fallback) ---------- */
function buildTopOptions(
  availability: AvailabilityByUser,
  { minGroupSize = 2, minStreak = 3 }: { minGroupSize?: number; minStreak?: number } = {}
) {
  const countMap = new Map<string, number>();
  Object.values(availability).forEach((days) => {
    days.forEach((d) => countMap.set(d, (countMap.get(d) || 0) + 1));
  });
  const kept = Array.from(countMap.entries())
    .filter(([, c]) => c >= minGroupSize)
    .map(([d]) => d)
    .sort((a, b) => (a < b ? -1 : 1));

  type Range = { days: string[]; score: number };
  const ranges: Range[] = [];
  let cur: string[] = [];
  for (let i = 0; i < kept.length; i++) {
    const d = kept[i];
    if (cur.length === 0) cur.push(d);
    else if (diffDays(cur[cur.length - 1], d) === 1) cur.push(d);
    else {
      if (cur.length >= minStreak)
        ranges.push({
          days: cur,
          score:
            cur.reduce((s, x) => s + (countMap.get(x) || 0), 0) + cur.length * 0.25,
        });
      cur = [d];
    }
  }
  if (cur.length >= minStreak)
    ranges.push({
      days: cur,
      score:
        cur.reduce((s, x) => s + (countMap.get(x) || 0), 0) + cur.length * 0.25,
    });
  ranges.sort((a, b) => b.score - a.score);
  return ranges.slice(0, 3);
}

/* ---------- Mock availability (fallback เมื่อ error) ---------- */
async function loadAvailabilityForTrip(_tripId: string): Promise<AvailabilityByUser> {
  const base = "2025-12-02";
  const d = (n: number) => addDays(base, n);
  return {
    a: [d(0), d(1), d(2), d(3), d(4), d(8), d(9), d(10), d(16), d(17), d(18), d(19)],
    b: [d(1), d(2), d(3), d(4), d(5), d(8), d(9), d(10), d(16), d(17)],
    c: [d(2), d(3), d(4), d(5), d(6), d(10), d(16), d(17), d(18), d(19), d(20), d(21)],
    d: [d(2), d(3), d(4), d(5), d(6), d(10), d(11), d(12), d(18), d(19), d(20), d(21)],
  };
}

/* ---------- Suggest DB (mock) ---------- */
type SuggestBlock = {
  when: "Morning" | "Afternoon" | "Evening";
  category: string;
  photo: any;
  places: Array<{ name: string; note?: string }>;
};
const SUGGEST_DB: Record<string, SuggestBlock[]> = {
  tokyo: [
    {
      when: "Morning",
      category: "Shrine / Park",
      photo: require("../../assets/images/japan.png"),
      places: [
        { name: "Meiji Jingu (Shinto shrine in Tokyo)" },
        { name: "Yoyogi Park (Liveliest park in Tokyo)" },
      ],
    },
    {
      when: "Afternoon",
      category: "Shopping & Cafe",
      photo: require("../../assets/images/chinese.png"),
      places: [{ name: "Takeshita Street (Harajuku fashion & sweets)" }, { name: "Omotesando" }],
    },
    {
      when: "Evening",
      category: "Festival / Dinner",
      photo: require("../../assets/images/japan.png"),
      places: [
        { name: "!! Highlight !! : 47 Ronin Festival", note: "(only on 14 Dec)" },
        { name: "Kaiten Wanko Soba", note: "Kurukuru Wanko" },
      ],
    },
  ],
  bangkok: [
    {
      when: "Morning",
      category: "Temple & Park",
      photo: require("../../assets/images/bkk.png"),
      places: [{ name: "Wat Arun" }, { name: "Benjakitti Forest Park" }],
    },
    {
      when: "Afternoon",
      category: "Shopping & Cafe",
      photo: require("../../assets/images/bkk.png"),
      places: [{ name: "ICONSIAM" }, { name: "Ari cafe hopping" }],
    },
    {
      when: "Evening",
      category: "Street Food / Night",
      photo: require("../../assets/images/bkk.png"),
      places: [{ name: "Yaowarat Night Street Food" }, { name: "Asiatique Riverfront" }],
    },
  ],
};
function cityKeyOf(title: string, dest: string) {
  const s = `${title} ${dest}`.toLowerCase();
  if (s.includes("tokyo") || s.includes("japan")) return "tokyo";
  if (s.includes("bkk") || s.includes("bangkok") || s.includes("thai")) return "bangkok";
  return "tokyo";
}

/* ---------- Page ---------- */
export default function FreeDayPage() {
  const insets = useSafeAreaInsets();
  const padTop = Math.max(insets.top, Platform.OS === "android" ? StatusBar.currentHeight ?? 0 : 0);

  const [tab, setTab] = useState<"free" | "budget" | "suggest">("free");
  const [items, setItems] = useState<FreeDayItem[]>([]);
  const [email, setEmail] = useState<string>("");

  // ===== Modal: Free Day (options) =====
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [options, setOptions] = useState<Array<{ days: string[]; _meta?: any }>>([]);

  // ===== Modal: Budget =====
  const [budgetOpen, setBudgetOpen] = useState(false);
  const [budgetTripTitle, setBudgetTripTitle] = useState("");
  const [budgetTotal, setBudgetTotal] = useState(0);
  const [budget, setBudget] = useState({ hotel: 0, food: 0, shopping: 0, transport: 0 });
  const DEFAULT_RATIOS = { hotel: 0.44, food: 0.29, shopping: 0.15, transport: 0.12 };

  // ===== Modal: Suggest =====
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [suggestTitle, setSuggestTitle] = useState("");
  const [suggestBlocks, setSuggestBlocks] = useState<SuggestBlock[]>([]);

  // ===== ป้องกันกด Generate ซ้ำ =====
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const GENERATE_DEFAULTS = { min_days: 3, min_availability_member: 2 };

  // ===== Load trips (Published + Draft) & de-dupe (per-user + joined only) =====
  useEffect(() => {
    (async () => {
      try {
        const e = await getActiveEmail();
        setEmail(e);

        const [hiddenIds, coverMap, drafts, joined] = await Promise.all([
          readHidden(e),
          readCoverMap(e),
          readDrafts(e),
          readJoined(e),
        ]);

        // fetch published
        let published: ApiTrip[] = [];
        try {
          const res = await fetchWithAuth(`${BASE_URL}/api/trips?status=published&limit=100&offset=0`);
          const js = await res.json().catch(() => ({}));
          published = normalizeTrips(js);
        } catch {}

        // กรอง published ด้วย hidden + joined (เฉพาะของผู้ใช้)
        const publishedVisible = published.filter((t) => !hiddenIds.includes(t.id) && joined.has(t.id));

        const pubItems: FreeDayItem[] = publishedVisible.map((t) => ({
          id: t.id,
          originId: t.id,
          title: t.name,
          destination: t.destination,
          cover: coverMap[t.id] ? { uri: coverMap[t.id] } : null,
          totalBudget: t.total_budget,
          budget: bandFromBudget(t.total_budget),
          source: "published",
        }));

        const draftItems: FreeDayItem[] = drafts.map((d) => ({
          id: d.id,
          originId: d.sourceId || undefined,
          title: d.title,
          destination: d.destination,
          cover: d.coverUri ? { uri: d.coverUri } : null,
          totalBudget: d.total_budget,
          budget: bandFromBudget(d.total_budget),
          source: "draft",
        }));

        const merged = [...pubItems, ...draftItems];
        const seen = new Set<string>();
        const uniq: FreeDayItem[] = [];
        merged
          .sort((a, b) => (a.source === "draft" && b.source === "published" ? -1 : 1))
          .forEach((it) => {
            const key = it.originId ? `origin:${it.originId}` : `id:${it.id}`;
            if (seen.has(key)) return;
            seen.add(key);
            uniq.push(it);
          });

        setItems(uniq);
      } catch {
        setItems([]);
      }
    })();
  }, []);

  const freeGridList = useMemo(() => items, [items]);

  /* ---------- เมื่อกด Generate ---------- */
  const handleGenerate = async (item: FreeDayItem) => {
    if (tab === "budget") {
      const total = item.totalBudget ?? 35000;
      const b = {
        hotel: Math.round(total * DEFAULT_RATIOS.hotel),
        food: Math.round(total * DEFAULT_RATIOS.food),
        shopping: Math.round(total * DEFAULT_RATIOS.shopping),
        transport: Math.round(total * DEFAULT_RATIOS.transport),
      };
      setBudgetTripTitle(item.title);
      setBudgetTotal(total);
      setBudget(b);
      setBudgetOpen(true);
      return;
    }

    if (tab === "suggest") {
      const key = cityKeyOf(item.title, item.destination);
      const blocks = SUGGEST_DB[key] ?? SUGGEST_DB["tokyo"];
      setSuggestTitle(`Suggest ${item.title}`);
      setSuggestBlocks(blocks);
      setSuggestOpen(true);
      return;
    }

    // ===== Free Day options (เรียก API จริง; fallback เป็น mock ถ้า error) =====
    const tripId = item.originId || item.id;

    try {
      setGeneratingId(tripId);

      // 1) ให้แบ็กเอนด์คำนวณและ persist
      await apiGeneratePeriods(tripId, GENERATE_DEFAULTS);

      // 2) ดึงช่วงที่บันทึกไว้
      const periods = await apiGetAvailablePeriods(tripId);

      // 3) map เป็น { days: string[] } ให้ใช้ UI เดิมได้เลย
      const opts = periods.map((p) => ({
        days: expandDays(p.start_date, p.end_date),
        _meta: {
          memberCount: p.member_count ?? 0,
          start: p.start_date,
          end: p.end_date,
        },
      }));

      setModalTitle(item.title);
      setOptions(opts);
      setModalOpen(true);
    } catch (e: any) {
      console.warn(e?.message || e);
      // fallback: mock
      try {
        const availability = await loadAvailabilityForTrip(tripId);
        const top = buildTopOptions(availability, { minGroupSize: 2, minStreak: 3 });
        setModalTitle(item.title);
        setOptions(top.map((r) => ({ days: r.days })));
        setModalOpen(true);
      } catch {
        setModalTitle("Generate failed");
        setOptions([]);
        setModalOpen(true);
      }
    } finally {
      setGeneratingId(null);
    }
  };

  return (
    <View style={styles.page}>
      {/* Top Light Blue Area */}
      <View style={[styles.heroTop, { paddingTop: padTop + 16 }]}>
        <Text style={styles.heroHeading}>GET READY{"\n"}FOR FREE DAY</Text>

        {/* Tabs */}
        <View style={styles.tabsRow}>
          <Pressable onPress={() => setTab("free")} style={[styles.tabBtn, tab === "free" && styles.tabBtnActive]}>
            <Text style={[styles.tabText, tab === "free" && styles.tabTextActive]}>Free Day</Text>
          </Pressable>
          <Pressable onPress={() => setTab("budget")} style={[styles.tabBtn, tab === "budget" && styles.tabBtnActive]}>
            <Text style={[styles.tabText, tab === "budget" && styles.tabTextActive]}>Budget Trip</Text>
          </Pressable>
          <Pressable onPress={() => setTab("suggest")} style={[styles.tabBtn, tab === "suggest" && styles.tabBtnActive]}>
            <Text style={[styles.tabText, tab === "suggest" && styles.tabTextActive]}>Suggest</Text>
          </Pressable>
        </View>
      </View>

      {/* Content List */}
      <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 16, paddingBottom: 120 }}>
        {freeGridList.length === 0 ? (
          <View style={{ alignItems: "center", justifyContent: "center", paddingTop: 24 }}>
            <Ionicons name="calendar-outline" size={28} color="#97A6B1" />
            <Text style={{ marginTop: 8, color: "#97A6B1" }}>
              You don’t have any trips yet.
            </Text>
            <Pressable
              onPress={() => router.push("/Mainapp/buildmytrippage")}
              style={({ pressed }) => [
                {
                  marginTop: 12,
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: 12,
                  backgroundColor: pressed ? "#2F5064DD" : "#2F5064",
                },
              ]}
            >
              <Text style={{ color: "#fff", fontWeight: "600" }}>
                Create a New Trip
              </Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.grid}>
            {freeGridList.map((it) => {
              const busy = generatingId === (it.originId || it.id);
              return (
                <SuggestCard
                  key={`${it.source}:${it.id}`}
                  item={it}
                  busy={busy}
                  onGenerate={handleGenerate}
                />
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Modal: Free Day Options */}
      <Modal visible={modalOpen} transparent animationType="fade" onRequestClose={() => setModalOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{modalTitle}</Text>
            <Text style={styles.modalSub}>All of option its generate for your group FREE DAY</Text>

            <View style={styles.optionsWrap}>
              {options.length === 0 ? (
                <Text style={styles.noOptionText}>No overlapping dates found.</Text>
              ) : (
                options.map((op, idx) => (
                  <View key={idx} style={styles.optionRow}>
                    <View style={styles.optionLabelCol}>
                      <Text style={styles.optionLabel}>Option {idx + 1}</Text>
                      {!!op._meta?.memberCount && (
                        <Text style={{ color: "#97A6B1", fontSize: 11 }}>
                          Group overlap: {op._meta.memberCount} members
                        </Text>
                      )}
                      {!!op._meta?.start && !!op._meta?.end && (
                        <Text style={{ color: "#97A6B1", fontSize: 11 }}>
                          {op._meta.start} → {op._meta.end}
                        </Text>
                      )}
                    </View>
                    <View style={styles.optionDatesCol}>
                      <View style={styles.chipsRow}>
                        {op.days.map((d) => (
                          <View key={d} style={styles.dateChip}>
                            <Text style={styles.dateChipText}>{formatChip(d)}</Text>
                          </View>
                        ))}
                      </View>

                      <Pressable
                        style={[styles.generateBtn, { marginTop: 8 }]}
                        onPress={() => {
                          const daysCount = op.days.length;
                          const base = items.find((it) => it.title === modalTitle);
                          const total = base?.totalBudget ?? 35000;
                          const perDay = Math.max(1, Math.round(total / 5)); // fallback baseline
                          const periodBudget = perDay * daysCount;

                          setBudgetTripTitle(`${modalTitle} (${daysCount} days)`);
                          setBudgetTotal(periodBudget);
                          setBudget({
                            hotel: Math.round(periodBudget * 0.44),
                            food: Math.round(periodBudget * 0.29),
                            shopping: Math.round(periodBudget * 0.15),
                            transport: Math.round(periodBudget * 0.12),
                          });

                          setModalOpen(false);
                          setBudgetOpen(true);
                        }}
                      >
                        <Text style={styles.generateText}>Select</Text>
                      </Pressable>
                    </View>
                  </View>
                ))
              )}
            </View>

            <View style={styles.modalBtns}>
              <Pressable style={styles.modalBtnGhost} onPress={() => setModalOpen(false)}>
                <Text style={styles.modalBtnGhostText}>Close</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal: Budget */}
      <Modal visible={budgetOpen} transparent animationType="fade" onRequestClose={() => setBudgetOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{budgetTripTitle}</Text>
            <Text style={styles.modalSub}>Average budget suggestion for this trip</Text>

            <View style={[styles.totalCard, { marginTop: 12 }]}>
              <View style={styles.totalRow}>
                <Ionicons name="logo-bitcoin" size={22} color="#fff" />
                <Text style={styles.totalValue}>{THB(budgetTotal)}</Text>
              </View>
              <Text style={styles.totalUpdated}>Last Updated 1 day ago</Text>
            </View>

            <Text style={styles.budgetHeader}>Your Budget</Text>

            <View style={styles.budgetGrid}>
              <View style={styles.budgetCard}>
                <View style={styles.budgetCardHeader}>
                  <Text style={styles.budgetTitle}>Hotel</Text>
                  <Ionicons name="storefront-outline" size={20} color={COLORS.cardIcon} />
                </View>
                <Text style={styles.budgetAmount}>{THB(budget.hotel)}</Text>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressBar, { width: "80%" }]} />
                </View>
                <Text style={styles.budgetRemaining}>Remaining: {THB(Math.round(budget.hotel * 0.72))}</Text>
              </View>

              <View style={styles.budgetCard}>
                <View style={styles.budgetCardHeader}>
                  <Text style={styles.budgetTitle}>Food</Text>
                  <Ionicons name="restaurant-outline" size={20} color={COLORS.cardIcon} />
                </View>
                <Text style={styles.budgetAmount}>{THB(budget.food)}</Text>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressBar, { width: "70%" }]} />
                </View>
                <Text style={styles.budgetRemaining}>Remaining: {THB(Math.round(budget.food * 0.88))}</Text>
              </View>

              <View style={styles.budgetCard}>
                <View style={styles.budgetCardHeader}>
                  <Text style={styles.budgetTitle}>Shopping</Text>
                  <Ionicons name="bag-outline" size={20} color={COLORS.cardIcon} />
                </View>
                <Text style={styles.budgetAmount}>{THB(budget.shopping)}</Text>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressBar, { width: "60%" }]} />
                </View>
                <Text style={styles.budgetRemaining}>Remaining: {THB(Math.round(budget.shopping * 0.83))}</Text>
              </View>

              <View style={styles.budgetCard}>
                <View style={styles.budgetCardHeader}>
                  <Text style={styles.budgetTitle}>Transport</Text>
                  <Ionicons name="train-outline" size={20} color={COLORS.cardIcon} />
                </View>
                <Text style={styles.budgetAmount}>{THB(budget.transport)}</Text>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressBar, { width: "55%" }]} />
                </View>
                <Text style={styles.budgetRemaining}>Remaining: {THB(Math.round(budget.transport * 0.76))}</Text>
              </View>
            </View>

            <View style={styles.modalBtns}>
              <Pressable style={styles.modalBtnGhost} onPress={() => setBudgetOpen(false)}>
                <Text style={styles.modalBtnGhostText}>Close</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal: Suggest (Morning / Afternoon / Evening) */}
      <Modal visible={suggestOpen} transparent animationType="fade" onRequestClose={() => setSuggestOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{suggestTitle}</Text>
            <Text style={styles.modalSub}>Auto-suggested places based on your destination</Text>

            <View style={{ gap: 14 }}>
              {suggestBlocks.map((b, idx) => (
                <View key={idx} style={styles.sugRow}>
                  <Image source={b.photo} style={styles.sugPhoto} contentFit="cover" />
                  <View style={{ flex: 1 }}>
                    <View style={styles.sugHeader}>
                      <Text style={styles.sugCat}>{b.category}</Text>
                      <Text style={styles.sugWhen}>{b.when}</Text>
                    </View>
                    <View style={{ marginTop: 6, gap: 6 }}>
                      {b.places.map((p, i) => (
                        <View key={i} style={styles.dotRow}>
                          <View style={styles.dot} />
                          <Text style={styles.placeText}>
                            {p.name}
                            {p.note ? ` ${p.note}` : ""}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.modalBtns}>
              <Pressable style={styles.modalBtnGhost} onPress={() => setSuggestOpen(false)}>
                <Text style={styles.modalBtnGhostText}>Close</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <BottomBar />
    </View>
  );
}
