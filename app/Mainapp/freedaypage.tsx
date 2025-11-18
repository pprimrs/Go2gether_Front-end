import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { router, usePathname } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  View,
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

type CategoryBudget = {
  hotel?: number;
  food?: number;
  shopping?: number;
  transport?: number;
  total?: number; // จาก /api/trips/{id}/budget
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
  categoryBudget?: CategoryBudget;
};

type AvailabilityByUser = Record<string, string[]>;

/* ---------- Per-user namespaced keys ---------- */
const USER_NS = (email: string) => `USER(${email})`;
const keyScoped = (email: string, base: string) => `${USER_NS(email)}:${base}`;
const KEY_TRIP_COVER_MAP = (email: string) => keyScoped(email, "TRIP_COVER_MAP");
const KEY_HIDDEN_PUBLISHED = (email: string) =>
  keyScoped(email, "HIDDEN_PUBLISHED_IDS");
const KEY_TRIP_DRAFTS = (email: string) => keyScoped(email, "TRIP_DRAFTS");
const KEY_JOINED_TRIPS = (email: string) => keyScoped(email, "JOINED_TRIPS");
const KEY_ACTIVE_EMAIL = "ACTIVE_EMAIL";
const KEY_TRIP_BUDGET_MAP = (email: string) => keyScoped(email, "TRIP_BUDGET_MAP");

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
async function readBudgetMap(
  email: string
): Promise<Record<string, CategoryBudget>> {
  try {
    const raw = await AsyncStorage.getItem(KEY_TRIP_BUDGET_MAP(email));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/* ---------- API: availability periods ---------- */
type ServerPeriod = {
  start_date: string;
  end_date: string;
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
  const arr: any[] = Array.isArray(js)
    ? js
    : Array.isArray(js?.periods)
    ? js.periods
    : [];
  return arr
    .map((p) => ({
      start_date: p.start_date ?? p.startDate ?? p.start ?? p.from,
      end_date: p.end_date ?? p.endDate ?? p.end ?? p.to,
      member_count: p.member_count ?? p.size ?? p.count,
    }))
    .filter((p) => p.start_date && p.end_date);
}

function expandDays(startYmd: string, endYmd: string) {
  const days: string[] = [];
  let cur = startYmd;
  while (diffDays(cur, endYmd) >= 0) {
    days.push(cur);
    cur = addDays(cur, 1);
  }
  return days;
}

/* ---------- NEW: API get budget for trip ---------- */
async function apiGetTripBudget(
  tripId: string
): Promise<CategoryBudget | undefined> {
  try {
    const res = await fetchWithAuth(
      `${BASE_URL}/api/trips/${encodeURIComponent(tripId)}/budget`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!res.ok) {
      const t = await res.text().catch(() => "");
      console.warn("Fetch budget failed", res.status, t);
      return undefined;
    }

    const js = await res.json().catch(() => ({} as any));
    const b = js?.budget ?? js;
    if (!b) return undefined;

    return {
      hotel: Number(b.hotel ?? 0) || 0,
      food: Number(b.food ?? 0) || 0,
      shopping: Number(b.shopping ?? 0) || 0,
      transport: Number(b.transport ?? 0) || 0,
      total: Number(b.total ?? 0) || 0,
    };
  } catch (e) {
    console.warn("Fetch budget error", e);
    return undefined;
  }
}

/* ---------- Type guard & normalizer ---------- */
function isApiTrip(x: any): x is ApiTrip {
  return x && typeof x === "object" && typeof x.id === "string" && typeof x.name === "string";
}
function normalizeTrips(js: any): ApiTrip[] {
  const arr = (Array.isArray(js?.trips) ? js.trips : Array.isArray(js) ? js : []) as any[];
  return arr.map((t: any) => ({ ...t, id: String(t?.id ?? "") })).filter(isApiTrip);
}

/* ---------- Card ---------- */
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

/* ---------- Fallback heuristic ---------- */
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

/* ---------- Mock availability (fallback) ---------- */
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

/* ---------- Page ---------- */
export default function FreeDayPage() {
  const insets = useSafeAreaInsets();
  const padTop = Math.max(
    insets.top,
    Platform.OS === "android" ? StatusBar.currentHeight ?? 0 : 0
  );

  const [tab, setTab] = useState<"free" | "budget" | "suggest">("free");
  const [items, setItems] = useState<FreeDayItem[]>([]);
  const [email, setEmail] = useState<string>("");

  // result modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [options, setOptions] = useState<
    Array<{ days: string[]; _meta?: any }>
  >([]);

  // budget modal
  const [budgetOpen, setBudgetOpen] = useState(false);
  const [budgetTripTitle, setBudgetTripTitle] = useState("");
  const [budgetTotal, setBudgetTotal] = useState(0);
  const [budget, setBudget] = useState({
    hotel: 0,
    food: 0,
    shopping: 0,
    transport: 0,
  });
  const DEFAULT_RATIOS = { hotel: 0.44, food: 0.29, shopping: 0.15, transport: 0.12 };

  // suggest modal
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [suggestTitle, setSuggestTitle] = useState("");

  // config generate modal
  const [configOpen, setConfigOpen] = useState(false);
  const [configTrip, setConfigTrip] = useState<FreeDayItem | null>(null);
  const [configMinDays, setConfigMinDays] = useState("3");
  const [configMinMembers, setConfigMinMembers] = useState("2");

  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const GENERATE_DEFAULTS = { min_days: 3, min_availability_member: 2 };

  /* ---------- Load trips ---------- */
  useEffect(() => {
    (async () => {
      try {
        const e = await getActiveEmail();
        setEmail(e);

        const [hiddenIds, coverMap, drafts, joined, budgetMapLocal] =
          await Promise.all([
            readHidden(e),
            readCoverMap(e),
            readDrafts(e),
            readJoined(e),
            readBudgetMap(e),
          ]);

        let published: ApiTrip[] = [];
        try {
          const res = await fetchWithAuth(
            `${BASE_URL}/api/trips?status=published&limit=100&offset=0`
          );
          const js = await res.json().catch(() => ({}));
          published = normalizeTrips(js);
        } catch {}

        const publishedVisible = published.filter(
          (t) => !hiddenIds.includes(t.id) && joined.has(t.id)
        );

        // --- ดึง budget จาก API สำหรับแต่ละ published trip ---
        const apiBudgetMap: Record<string, CategoryBudget> = {};
        try {
          const pairs = await Promise.all(
            publishedVisible.map(async (t) => {
              const b = await apiGetTripBudget(t.id);
              return [t.id, b] as const;
            })
          );
          pairs.forEach(([id, b]) => {
            if (b) apiBudgetMap[id] = b;
          });
        } catch (err) {
          console.warn("Load budgets for trips failed", err);
        }

        const pubItems: FreeDayItem[] = publishedVisible.map((t) => {
          // ใช้ budget local ก่อน ถ้าไม่มีค่อย fallback API
          const localBudget = budgetMapLocal[t.id];
          const apiBudget = apiBudgetMap[t.id];
          const categoryBudget = localBudget || apiBudget;

          let totalBudget: number | undefined = t.total_budget;
          if (categoryBudget) {
            const totalFromCat =
              (categoryBudget.hotel ?? 0) +
              (categoryBudget.food ?? 0) +
              (categoryBudget.shopping ?? 0) +
              (categoryBudget.transport ?? 0);
            const totalFromApi = categoryBudget.total ?? 0;
            const picked = totalFromCat || totalFromApi;
            if (picked > 0) totalBudget = picked;
          }

          return {
            id: t.id,
            originId: t.id,
            title: t.name,
            destination: t.destination,
            cover: coverMap[t.id] ? { uri: coverMap[t.id] } : null,
            totalBudget,
            budget: bandFromBudget(totalBudget),
            source: "published",
            categoryBudget,
          };
        });

        // ยังอ่าน draft ไว้ แต่ไม่เอาเข้า merged แล้ว
        const draftItems: FreeDayItem[] = drafts.map((d) => {
          const keyForBudget = d.sourceId || d.id;
          const catBudget = keyForBudget ? budgetMapLocal[keyForBudget] : undefined;

          let totalBudget: number | undefined = d.total_budget;
          if (catBudget) {
            const totalFromCat =
              (catBudget.hotel ?? 0) +
              (catBudget.food ?? 0) +
              (catBudget.shopping ?? 0) +
              (catBudget.transport ?? 0);
            const totalFromApi = catBudget.total ?? 0;
            const picked = totalFromCat || totalFromApi;
            if (picked > 0) totalBudget = picked;
          }

          return {
            id: d.id,
            originId: d.sourceId || undefined,
            title: d.title,
            destination: d.destination,
            cover: d.coverUri ? { uri: d.coverUri } : null,
            totalBudget,
            budget: bandFromBudget(totalBudget),
            source: "draft",
            categoryBudget: catBudget,
          } as FreeDayItem;
        });

        // ❗ ใช้เฉพาะ published ใน FreeDay
        const merged = [...pubItems];

        const seen = new Set<string>();
        const uniq: FreeDayItem[] = [];
        merged
          .sort((a, b) =>
            a.source === "draft" && b.source === "published" ? -1 : 1
          )
          .forEach((it) => {
            const key = it.originId ? `origin:${it.originId}` : `id:${it.id}`;
            if (seen.has(key)) return;
            seen.add(key);
            uniq.push(it);
          });

        setItems(uniq);
      } catch (err) {
        console.warn("Load FreeDay items failed", err);
        setItems([]);
      }
    })();
  }, []);

  // ✅ ทุก tab เห็นเฉพาะ published
  const freeGridList = useMemo(
    () => items.filter((it) => it.source === "published"),
    [items]
  );

  /* ---------- Confirm generate after config ---------- */
  const confirmGenerateForTrip = async () => {
    if (!configTrip) return;
    const tripId = configTrip.originId || configTrip.id;

    const minDays = Number(configMinDays || "1") || 1;
    const minMembers = Number(configMinMembers || "1") || 1;

    try {
      setGeneratingId(tripId);

      await apiGeneratePeriods(tripId, {
        min_days: minDays,
        min_availability_member: minMembers,
      });

      const periods = await apiGetAvailablePeriods(tripId);

      const opts = periods.map((p) => ({
        days: expandDays(p.start_date, p.end_date),
        _meta: {
          memberCount: p.member_count ?? 0,
          start: p.start_date,
          end: p.end_date,
        },
      }));

      setConfigOpen(false);
      setModalTitle(configTrip.title);
      setOptions(opts);
      setModalOpen(true);
    } catch (e: any) {
      console.warn(e?.message || e);

      try {
        const availability = await loadAvailabilityForTrip(tripId);
        const top = buildTopOptions(availability, {
          minGroupSize: 2,
          minStreak: 3,
        });
        setConfigOpen(false);
        setModalTitle(configTrip.title);
        setOptions(top.map((r) => ({ days: r.days })));
        setModalOpen(true);
      } catch {
        setConfigOpen(false);
        setModalTitle("Generate failed");
        setOptions([]);
        setModalOpen(true);
      }
    } finally {
      setGeneratingId(null);
    }
  };

  /* ---------- When press Generate on card ---------- */
  const handleGenerate = async (item: FreeDayItem) => {
    if (tab === "budget") {
      const cat = item.categoryBudget;

      if (cat) {
        let hotel = Number(cat.hotel ?? 0) || 0;
        let food = Number(cat.food ?? 0) || 0;
        let shopping = Number(cat.shopping ?? 0) || 0;
        let transport = Number(cat.transport ?? 0) || 0;

        let total =
          (cat.total ?? 0) || hotel + food + shopping + transport;

        // ถ้าเจอว่า budget กระจุกตัวหมวดเดียว (หมวดเดียว = total, ที่เหลือ 0)
        // ให้กระจายเท่า ๆ กันทุกหมวด
        const arr = [hotel, food, shopping, transport];
        const nonZero = arr.filter((v) => v > 0);
        if (total > 0 && nonZero.length === 1 && nonZero[0] === total) {
          const per = Math.round(total / 4);
          hotel = per;
          food = per;
          shopping = per;
          transport = per;
        }

        setBudgetTripTitle(item.title);
        setBudgetTotal(total);
        setBudget({ hotel, food, shopping, transport });
        setBudgetOpen(true);
        return;
      }

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
      // static suggest text
      setSuggestTitle(`Suggest ${item.title}`);
      setSuggestOpen(true);
      return;
    }

    // tab free day -> open config
    setConfigTrip(item);
    setConfigMinDays(String(GENERATE_DEFAULTS.min_days));
    setConfigMinMembers(String(GENERATE_DEFAULTS.min_availability_member));
    setConfigOpen(true);
    setGeneratingId(null);
  };

  return (
    <View style={styles.page}>
      {/* Hero */}
      <View style={[styles.heroTop, { paddingTop: padTop + 16 }]}>
        <Text style={styles.heroHeading}>
          GET READY{"\n"}FOR FREE DAY
        </Text>

        <View style={styles.tabsRow}>
          <Pressable
            onPress={() => setTab("free")}
            style={[styles.tabBtn, tab === "free" && styles.tabBtnActive]}
          >
            <Text style={[styles.tabText, tab === "free" && styles.tabTextActive]}>
              Free Day
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setTab("budget")}
            style={[styles.tabBtn, tab === "budget" && styles.tabBtnActive]}
          >
            <Text
              style={[styles.tabText, tab === "budget" && styles.tabTextActive]}
            >
              Budget Trip
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setTab("suggest")}
            style={[styles.tabBtn, tab === "suggest" && styles.tabBtnActive]}
          >
            <Text
              style={[styles.tabText, tab === "suggest" && styles.tabTextActive]}
            >
              Suggest
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 18,
          paddingTop: 16,
          paddingBottom: 120,
        }}
      >
        {freeGridList.length === 0 ? (
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              paddingTop: 24,
            }}
          >
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

      {/* Modal: Generate config */}
      <Modal
        visible={configOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setConfigOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Generate Free Day</Text>
            <Text style={styles.modalSub}>
              {configTrip ? configTrip.title : ""}
            </Text>

            <View style={{ marginTop: 16, rowGap: 12 }}>
              <View>
                <Text
                  style={{ fontSize: 13, color: "#4B5563", marginBottom: 4 }}
                >
                  Minimum days for a period
                </Text>
                <TextInput
                  style={[styles.input, { height: 44 }]}
                  keyboardType="numeric"
                  value={configMinDays}
                  onChangeText={(v) => setConfigMinDays(v.replace(/[^\d]/g, ""))}
                  placeholder="e.g. 3"
                />
              </View>

              <View>
                <Text
                  style={{ fontSize: 13, color: "#4B5563", marginBottom: 4 }}
                >
                  Minimum available members
                </Text>
                <TextInput
                  style={[styles.input, { height: 44 }]}
                  keyboardType="numeric"
                  value={configMinMembers}
                  onChangeText={(v) =>
                    setConfigMinMembers(v.replace(/[^\d]/g, ""))
                  }
                  placeholder="e.g. 2"
                />
              </View>
            </View>

            <View
              style={[
                styles.modalBtns,
                {
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  columnGap: 8,
                },
              ]}
            >
              <Pressable
                style={styles.modalBtnGhost}
                onPress={() => setConfigOpen(false)}
              >
                <Text style={styles.modalBtnGhostText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={styles.modalBtnPrimary}
                onPress={confirmGenerateForTrip}
                disabled={
                  !configTrip ||
                  generatingId === (configTrip.originId || configTrip.id)
                }
              >
                <Text style={styles.modalBtnPrimaryText}>
                  {configTrip &&
                  generatingId === (configTrip.originId || configTrip.id)
                    ? "Generating..."
                    : "Generate"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal: Free Day options result */}
      <Modal
        visible={modalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{modalTitle}</Text>
            <Text style={styles.modalSub}>
              All of option its generate for your group FREE DAY
            </Text>

            <View style={styles.optionsWrap}>
              {options.length === 0 ? (
                <Text style={styles.noOptionText}>
                  No overlapping dates found.
                </Text>
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
                            <Text style={styles.dateChipText}>
                              {formatChip(d)}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  </View>
                ))
              )}
            </View>

            <View style={styles.modalBtns}>
              <Pressable
                style={styles.modalBtnGhost}
                onPress={() => setModalOpen(false)}
              >
                <Text style={styles.modalBtnGhostText}>Close</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal: Budget */}
      <Modal
        visible={budgetOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setBudgetOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{budgetTripTitle}</Text>
            <Text style={styles.modalSub}>
              Average budget suggestion for this trip
            </Text>

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
                  <Ionicons
                    name="storefront-outline"
                    size={20}
                    color={COLORS.cardIcon}
                  />
                </View>
                <Text style={styles.budgetAmount}>{THB(budget.hotel)}</Text>
              </View>

              <View style={styles.budgetCard}>
                <View style={styles.budgetCardHeader}>
                  <Text style={styles.budgetTitle}>Food</Text>
                  <Ionicons
                    name="restaurant-outline"
                    size={20}
                    color={COLORS.cardIcon}
                  />
                </View>
                <Text style={styles.budgetAmount}>{THB(budget.food)}</Text>
              </View>

              <View style={styles.budgetCard}>
                <View style={styles.budgetCardHeader}>
                  <Text style={styles.budgetTitle}>Shopping</Text>
                  <Ionicons
                    name="bag-outline"
                    size={20}
                    color={COLORS.cardIcon}
                  />
                </View>
                <Text style={styles.budgetAmount}>{THB(budget.shopping)}</Text>
              </View>

              <View style={styles.budgetCard}>
                <View style={styles.budgetCardHeader}>
                  <Text style={styles.budgetTitle}>Transport</Text>
                  <Ionicons
                    name="train-outline"
                    size={20}
                    color={COLORS.cardIcon}
                  />
                </View>
                <Text style={styles.budgetAmount}>{THB(budget.transport)}</Text>
              </View>
            </View>

            <View style={styles.modalBtns}>
              <Pressable
                style={styles.modalBtnGhost}
                onPress={() => setBudgetOpen(false)}
              >
                <Text style={styles.modalBtnGhostText}>Close</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal: Suggest (simple static text) */}
      <Modal
        visible={suggestOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setSuggestOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{suggestTitle}</Text>
            <Text style={styles.modalSub}>
              Simple suggestion for how to spend your free day
            </Text>

            <View style={{ marginTop: 8 }}>
              {/* Morning */}
              <View style={styles.sugBlock}>
                <Text style={styles.sugWhen}>Morning</Text>
                <Text style={[styles.placeText, { marginTop: 6 }]}>
                  - Eat Breakfast{"\n"}
                  - Go to the park
                </Text>
              </View>

              {/* Afternoon */}
              <View style={styles.sugBlock}>
                <Text style={styles.sugWhen}>Afternoon</Text>
                <Text style={[styles.placeText, { marginTop: 6 }]}>
                  - Go shopping (Fashion street){"\n"}
                  - Cafe / Lunch
                </Text>
              </View>

              {/* Evening */}
              <View style={styles.sugBlock}>
                <Text style={styles.sugWhen}>Evening</Text>
                <Text style={[styles.placeText, { marginTop: 6 }]}>
                  - Free Time / Take a rest{"\n"}
                  - Night Marget
                </Text>
              </View>
            </View>

            <View style={styles.modalBtns}>
              <Pressable
                style={styles.modalBtnGhost}
                onPress={() => setSuggestOpen(false)}
              >
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
