// app/Mainapp/mytrippage.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Clipboard from "expo-clipboard";
import { Image } from "expo-image";
import { router, useFocusEffect, usePathname } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  RefreshControl,
  Image as RNImage,
  ScrollView,
  StatusBar,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, styles } from "./styles/mytripstyles";

const BASE_URL = "https://undeclamatory-precollegiate-felicitas.ngrok-free.dev";

/* ---------- DEBUG HELPERS ---------- */
const DEBUG_TRIP = true;
const dlog = (...args: any[]) => {
  if (__DEV__ && DEBUG_TRIP) {
    console.log("[MyTrip]", ...args);
  }
};

/* ---------- Types ---------- */
type ApiTrip = {
  id: string;
  name: string;
  destination: string;
  status: string;
  currency: string;
  total_budget: number;
  start_date: string;
  end_date: string;
  owner_email?: string;
  created_by?: string;
  creator_id?: string; // 👈 ใช้ให้ตรงกับ viewdetail
};

type TripsResponse = {
  pagination: { limit: number; offset: number; total: number };
  trips: ApiTrip[];
};

type DraftTrip = {
  id: string;
  sourceId?: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  coverUri?: string;
};

function fmt(d: string) {
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return d;
  const day = dt.getDate().toString().padStart(2, "0");
  const mon = dt.toLocaleString("en-US", { month: "short" });
  const yr = dt.getFullYear();
  return `${day} ${mon} ${yr}`;
}

/* ---------- Per-user namespaced keys ---------- */
const USER_NS = (email: string) => `USER(${email})`;
const keyScoped = (email: string, base: string) => `${USER_NS(email)}:${base}`;
const KEY_TRIP_COVER_MAP = (email: string) => keyScoped(email, "TRIP_COVER_MAP");
const KEY_HIDDEN_PUBLISHED = (email: string) => keyScoped(email, "HIDDEN_PUBLISHED_IDS");
const KEY_JOINED_TRIPS = (email: string) => keyScoped(email, "JOINED_TRIPS");
const KEY_INVITE_LINK_MAP = (email: string) => keyScoped(email, "INVITE_LINK_MAP");
const KEY_TRIP_DRAFTS = (email: string) => keyScoped(email, "TRIP_DRAFTS");
const KEY_ACTIVE_EMAIL = "ACTIVE_EMAIL";
const KEY_ACTIVE_USER_ID = "ACTIVE_USER_ID"; // 👈 cache user id
const KEY_OWN_TRIP_IDS = (email: string) => keyScoped(email, "OWN_TRIP_IDS");

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
        p?.email ||
        p?.user?.email ||
        p?.data?.email ||
        p?.profile?.email ||
        (await AsyncStorage.getItem("USER_EMAIL")) ||
        "";
      if (email) {
        await AsyncStorage.setItem("USER_EMAIL", String(email));
        await AsyncStorage.setItem(KEY_ACTIVE_EMAIL, String(email));
        dlog("getActiveEmail from API:", email);
        return String(email);
      }
    }
  } catch (err) {
    dlog("getActiveEmail error:", err);
  }
  const cached =
    (await AsyncStorage.getItem(KEY_ACTIVE_EMAIL)) ||
    (await AsyncStorage.getItem("USER_EMAIL")) ||
    "anon";
  dlog("getActiveEmail from cache:", cached);
  return cached;
}

async function getActiveUserId(): Promise<string> {
  try {
    const res = await fetchWithAuth(`${BASE_URL}/api/auth/profile`);
    if (res.ok) {
      const p = await res.json().catch(() => ({} as any));

      const id =
        (p && (p.id || p.user?.id || p.data?.id || p.profile?.id)) ||
        (await AsyncStorage.getItem(KEY_ACTIVE_USER_ID)) ||
        "";

      if (id) {
        await AsyncStorage.setItem(KEY_ACTIVE_USER_ID, String(id));
        dlog("getActiveUserId from API:", id);
        return String(id);
      }
    }
  } catch (err) {
    dlog("getActiveUserId error:", err);
  }

  const cached = (await AsyncStorage.getItem(KEY_ACTIVE_USER_ID)) || "";
  dlog("getActiveUserId from cache:", cached);
  return cached;
}

/* ---------- Storage Helpers (per user) ---------- */
async function readDrafts(email: string): Promise<DraftTrip[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY_TRIP_DRAFTS(email));
    const list = raw ? JSON.parse(raw) : [];
    dlog("readDrafts raw:", raw);
    return list.map((x: any) => ({
      ...x,
      title: x.title ?? x.name ?? "",
      startDate: x.startDate ?? x.start_date ?? "",
      endDate: x.endDate ?? x.end_date ?? "",
      destination: x.destination ?? "",
      coverUri: x.coverUri ?? x.cover_uri ?? undefined,
    })) as DraftTrip[];
  } catch (err) {
    dlog("readDrafts error:", err);
    return [];
  }
}
async function writeDrafts(email: string, list: DraftTrip[]) {
  try {
    await AsyncStorage.setItem(KEY_TRIP_DRAFTS(email), JSON.stringify(list));
    dlog("writeDrafts:", list.map((d) => d.id));
  } catch (err) {
    dlog("writeDrafts error:", err);
  }
}
function apiTripToDraft(t: ApiTrip): DraftTrip {
  return {
    id: `draft_${t.id}`,
    sourceId: t.id,
    title: t.name,
    destination: t.destination,
    startDate: t.start_date,
    endDate: t.end_date,
  };
}
async function readHidden(email: string): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY_HIDDEN_PUBLISHED(email));
    const v = raw ? JSON.parse(raw) : [];
    dlog("readHidden:", v);
    return v;
  } catch (err) {
    dlog("readHidden error:", err);
    return [];
  }
}
async function writeHidden(email: string, ids: string[]) {
  try {
    await AsyncStorage.setItem(KEY_HIDDEN_PUBLISHED(email), JSON.stringify(ids));
    dlog("writeHidden:", ids);
  } catch (err) {
    dlog("writeHidden error:", err);
  }
}
async function readJoined(email: string): Promise<Set<string>> {
  try {
    const raw = await AsyncStorage.getItem(KEY_JOINED_TRIPS(email));
    const arr: string[] = raw ? JSON.parse(raw) : [];
    dlog("readJoined raw:", raw);
    return new Set(arr);
  } catch (err) {
    dlog("readJoined error:", err);
    return new Set();
  }
}
async function writeJoined(email: string, setIds: Set<string>) {
  const arr = Array.from(setIds);
  await AsyncStorage.setItem(KEY_JOINED_TRIPS(email), JSON.stringify(arr));
  dlog("writeJoined:", arr);
}
async function readInviteLinkMap(email: string): Promise<Record<string, string>> {
  try {
    const raw = await AsyncStorage.getItem(KEY_INVITE_LINK_MAP(email));
    const v = raw ? JSON.parse(raw) : {};
    dlog("readInviteLinkMap:", v);
    return v;
  } catch (err) {
    dlog("readInviteLinkMap error:", err);
    return {};
  }
}
async function writeInviteLinkMap(email: string, m: Record<string, string>) {
  try {
    await AsyncStorage.setItem(KEY_INVITE_LINK_MAP(email), JSON.stringify(m));
    dlog("writeInviteLinkMap:", m);
  } catch (err) {
    dlog("writeInviteLinkMap error:", err);
  }
}
async function readOwnTripIds(email: string): Promise<Set<string>> {
  try {
    const raw = await AsyncStorage.getItem(KEY_OWN_TRIP_IDS(email));
    const arr: string[] = raw ? JSON.parse(raw) : [];
    dlog("readOwnTripIds raw:", raw);
    return new Set(arr);
  } catch (err) {
    dlog("readOwnTripIds error:", err);
    return new Set();
  }
}
async function writeOwnTripIds(email: string, setIds: Set<string>) {
  const arr = Array.from(setIds);
  await AsyncStorage.setItem(KEY_OWN_TRIP_IDS(email), JSON.stringify(arr));
  dlog("writeOwnTripIds:", arr);
}

/* ---------- BottomBar ---------- */
function BottomBar() {
  const pathname = usePathname();
  const items = [
    { key: "homepage", label: "Home", icon: "home-outline", to: "/Mainapp/homepage" },
    { key: "mytrippage", label: "My Trip", icon: "location-outline", to: "/Mainapp/mytrippage" },
    { key: "freedaypage", label: "Free Day", icon: "briefcase-outline", to: "/Mainapp/freedaypage" },
    { key: "notipage", label: "Notification", icon: "mail-open-outline", to: "/Mainapp/notipage" },
  ] as const;

  const isActive = (k: string) => (pathname ?? "").includes(`/${k}`);

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

/* ---------- Card ---------- */
function TripCard({
  image,
  title,
  destination,
  start,
  end,
  buttonRight,
  onView,
  onRightPress,
  onCopy,
  showCopy = false,
  showView = true,
}: {
  image: any | null;
  title: string;
  destination: string;
  start: string;
  end: string;
  buttonRight: string;
  onView?: () => void;
  onRightPress: () => void;
  onCopy?: () => void;
  showCopy?: boolean;
  showView?: boolean;
}) {
  return (
    <View style={styles.card}>
      {showCopy && (
        <Pressable style={styles.copyBtn} onPress={onCopy} hitSlop={8}>
          <Ionicons name="link-outline" size={15} color="#2F5064" />
        </Pressable>
      )}

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

      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{title}</Text>
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={14} color={COLORS.mutedIcon} />
          <Text style={styles.metaText}>{destination || "-"}</Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={14} color={COLORS.mutedIcon} />
          <Text style={styles.metaText}>
            {fmt(start)} - {fmt(end)}
          </Text>
        </View>

        <View style={styles.cardBtnRow}>
          {showView && onView ? (
            <>
              <Pressable style={styles.btnSoft} onPress={onView}>
                <Text style={styles.btnSoftText}>View Details</Text>
              </Pressable>
              <Pressable style={styles.btnGhost} onPress={onRightPress}>
                <Text style={styles.btnGhostText}>{buttonRight}</Text>
              </Pressable>
            </>
          ) : (
            <Pressable style={styles.btnSoft} onPress={onRightPress}>
              <Text style={styles.btnSoftText}>{buttonRight}</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

/* ---------- Page ---------- */
export default function MyTripPage() {
  const insets = useSafeAreaInsets();
  const topPad =
    Math.max(insets.top, Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0) + 8;

  const [email, setEmail] = useState<string>("");
  const [tab, setTab] = useState<"published" | "draft">("published");
  const [published, setPublished] = useState<ApiTrip[]>([]);
  const [drafts, setDrafts] = useState<DraftTrip[]>([]);
  const [hidden, setHidden] = useState<string[]>([]);
  const [coverMap, setCoverMap] = useState<Record<string, string>>({});
  const [inviteLinkMap, setInviteLinkMap] = useState<Record<string, string>>({});
  const [ownTripIds, setOwnTripIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const getImage = (id?: string) => {
    if (id && coverMap[id]) return { uri: coverMap[id] };
    return null;
  };

  /* ----- Loaders ----- */
  const fetchPublished = useCallback(async (currentEmail: string) => {
    setLoading(true);
    try {
      dlog("fetchPublished for email:", currentEmail);

      const res = await fetchWithAuth(
        `${BASE_URL}/api/trips?status=published&limit=100&offset=0`
      );
      const js: TripsResponse | any = await res.json().catch(() => ({}));

      const all: ApiTrip[] = Array.isArray(js?.trips) ? js.trips : Array.isArray(js) ? js : [];
      dlog(
        "trips from API:",
        all.map((t) => ({
          id: t.id,
          name: t.name,
          owner_email: t.owner_email,
          created_by: t.created_by,
          creator_id: t.creator_id,
        }))
      );

      const joined = await readJoined(currentEmail);
      dlog("joined set:", Array.from(joined));

      // user เห็นเฉพาะทริปที่ตัวเอง join อยู่
      const mine = all.filter((t) => joined.has(t.id));
      dlog("mine (joined && published):", mine.map((t) => t.id));
      setPublished(mine);

      // debug keys
      const allKeys = (await AsyncStorage.getAllKeys()) || [];
      dlog(
        "All AS keys (filter CREATE_TRIP):",
        allKeys.filter((k) => k.includes("CREATE_TRIP"))
      );

      // ---------- build ownTripIds ----------
      const storedOwn = await readOwnTripIds(currentEmail);
      const ownSet = new Set<string>(storedOwn);
      const myEmailLower = currentEmail.toLowerCase();
      const currentUserId = await getActiveUserId();

      for (const t of mine) {
        const formKey = `CREATE_TRIP_FORM_${t.id}`;
        const localForm = await AsyncStorage.getItem(formKey);

        const ownerRaw = String(t.owner_email || t.created_by || "");
        const ownerLower = ownerRaw.toLowerCase();
        const looksLikeEmail = ownerRaw.includes("@");

        const isCreatorByForm = !!localForm;
        const isCreatorByEmail =
          looksLikeEmail && !!myEmailLower && myEmailLower === ownerLower;
        const isCreatorById =
          !!currentUserId && !!t.creator_id && String(t.creator_id) === String(currentUserId);

        if (isCreatorByForm || isCreatorByEmail || isCreatorById) {
          ownSet.add(t.id);
          dlog("Creator detected:", {
            id: t.id,
            name: t.name,
            isCreatorByForm,
            isCreatorByEmail,
            isCreatorById,
            ownerRaw,
            creator_id: t.creator_id,
            currentUserId,
            formKey,
            hasCreateForm: !!localForm,
          });
        } else {
          dlog("Not creator:", {
            id: t.id,
            name: t.name,
            ownerRaw,
            creator_id: t.creator_id,
            currentUserId,
            looksLikeEmail,
            myEmailLower,
          });
        }
      }

      await writeOwnTripIds(currentEmail, ownSet);
      setOwnTripIds(Array.from(ownSet));
      dlog("ownTripIds (after scan):", Array.from(ownSet));
    } catch (err) {
      dlog("fetchPublished error:", err);
      setPublished([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAll = useCallback(async () => {
    const e = await getActiveEmail();
    setEmail(e);
    dlog("loadAll() active email:", e);

    setDrafts(await readDrafts(e));
    setHidden(await readHidden(e));

    try {
      const raw = await AsyncStorage.getItem(KEY_TRIP_COVER_MAP(e));
      const map = raw ? JSON.parse(raw) : {};
      dlog("coverMap:", map);
      setCoverMap(map);
    } catch (err) {
      dlog("read coverMap error:", err);
      setCoverMap({});
    }

    setInviteLinkMap(await readInviteLinkMap(e));

    await fetchPublished(e);
  }, [fetchPublished]);

  useFocusEffect(
    useCallback(() => {
      dlog("useFocusEffect -> loadAll()");
      loadAll();
    }, [loadAll])
  );

  const onRefresh = async () => {
    dlog("onRefresh()");
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  };

  /* ----- Actions ----- */
  const moveToDraft = async (t: ApiTrip) => {
    dlog("moveToDraft trip:", t.id);
    const newDraft = { ...apiTripToDraft(t), coverUri: coverMap[t.id] };
    const nextDrafts = [...drafts, newDraft];
    await writeDrafts(email, nextDrafts);
    setDrafts(nextDrafts);

    const nextHidden = [...hidden, t.id];
    await writeHidden(email, nextHidden);
    setHidden(nextHidden);
    setPublished(published.filter((p) => p.id !== t.id));

    Alert.alert("Moved", "Trip moved to Draft.");
  };

  const publishDraft = async (d: DraftTrip) => {
    dlog("publishDraft:", d.id);
    const token = await AsyncStorage.getItem("TOKEN");
    if (!token) return;
    try {
      const res = await fetch(`${BASE_URL}/api/trips`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: d.title,
          destination: d.destination,
          start_date: d.startDate,
          end_date: d.endDate,
          currency: "THB",
          status: "published",
        }),
      });
      dlog("publishDraft response status:", res.status);
      if (!res.ok) throw new Error();
      const json: any = await res.json();
      dlog("publishDraft response json:", json);

      const newId = json?.trip?.id || json?.id;
      dlog("new trip id from draft:", newId);

      if (newId && d.coverUri) {
        try {
          const raw = await AsyncStorage.getItem(KEY_TRIP_COVER_MAP(email));
          const map = raw ? JSON.parse(raw) : {};
          map[newId] = d.coverUri;
          await AsyncStorage.setItem(KEY_TRIP_COVER_MAP(email), JSON.stringify(map));
          setCoverMap(map);
          dlog("updated coverMap with newId:", newId);
        } catch (err) {
          dlog("update coverMap error:", err);
        }
      }

      if (newId) {
        const own = await readOwnTripIds(email);
        own.add(String(newId));
        await writeOwnTripIds(email, own);
        setOwnTripIds(Array.from(own));

        const joined = await readJoined(email);
        joined.add(String(newId));
        await writeJoined(email, joined);
      }

      const next = drafts.filter((x) => x.id !== d.id);
      await writeDrafts(email, next);
      setDrafts(next);
      Alert.alert("Published", "Trip has been published.");
      await fetchPublished(email);
    } catch (err) {
      dlog("publishDraft error:", err);
      Alert.alert("Error", "Cannot publish draft.");
    }
  };

  /* ----- Copy Invite Link ----- */
  const copyInvite = async (tripId: string) => {
    dlog("copyInvite trip:", tripId);
    try {
      if (inviteLinkMap[tripId]) {
        await Clipboard.setStringAsync(inviteLinkMap[tripId]);
        Alert.alert("Copied", "Invitation link copied to clipboard.");
        return;
      }

      const token = await AsyncStorage.getItem("TOKEN");
      if (!token) {
        Alert.alert("Session expired", "Please sign in again.");
        router.replace("/Auth/login");
        return;
      }

      const res = await fetch(
        `${BASE_URL}/api/trips/${encodeURIComponent(tripId)}/invitations`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      dlog("copyInvite status:", res.status);

      let js: any = {};
      try {
        js = await res.json();
      } catch {}
      dlog("copyInvite json:", js);

      if (!res.ok) {
        const msg = js?.message || js?.error || `HTTP ${res.status}`;
        Alert.alert("Error", `Cannot generate invitation link (${msg}).`);
        return;
      }

      const link: string | undefined = js?.invitation_link;
      if (!link) {
        Alert.alert("Error", "Invitation link not found in response.");
        return;
      }

      const next = { ...inviteLinkMap, [tripId]: link };
      setInviteLinkMap(next);
      await writeInviteLinkMap(email, next);

      await Clipboard.setStringAsync(link);
      Alert.alert("Copied", "Invitation link copied to clipboard.");
    } catch (err) {
      dlog("copyInvite error:", err);
      Alert.alert("Error", "Failed to copy invite link.");
    }
  };

  const publishedList = published.filter((p) => !hidden.includes(p.id));
  const listEmpty = tab === "published" ? "No published trips yet." : "No draft trips yet.";

  const myEmailLower = (email || "").toLowerCase();
  dlog("render MyTripPage, email:", email, "ownTripIds:", ownTripIds);

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 160 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View
          style={[
            styles.topBar,
            {
              paddingTop: topPad,
              paddingBottom: 6,
            },
          ]}
        />

        {/* Hero */}
        <View style={[styles.hero, { marginTop: 8 }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>My Trip</Text>
            <Text style={styles.heroSub}>
              This is your sign to make a{"\n"}new trip with your partner
            </Text>
          </View>
          <RNImage
            source={require("../../assets/images/mytrip.png")}
            style={styles.heroImg}
            resizeMode="contain"
          />
        </View>

        {/* Tabs */}
        <View style={styles.tabsRow}>
          <Pressable
            onPress={() => setTab("published")}
            style={[styles.tabBtn, tab === "published" && styles.tabActive]}
          >
            <Text style={[styles.tabText, tab === "published" && styles.tabTextActive]}>
              Published
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setTab("draft")}
            style={[styles.tabBtn, tab === "draft" && styles.tabActive]}
          >
            <Text style={[styles.tabText, tab === "draft" && styles.tabTextActive]}>
              Draft
            </Text>
          </Pressable>
        </View>

        {/* List */}
        <View style={{ paddingHorizontal: 16, gap: 14 }}>
          {tab === "published" ? (
            loading ? (
              <ActivityIndicator />
            ) : publishedList.length === 0 ? (
              <Text style={styles.emptyText}>{listEmpty}</Text>
            ) : (
              publishedList.map((t) => {
                const ownerRaw = String((t.owner_email ?? t.created_by ?? "") || "");
                const ownerLower = ownerRaw.toLowerCase();
                const looksLikeEmail = ownerRaw.includes("@");

                const isCreator =
                  ownTripIds.includes(t.id) ||
                  (looksLikeEmail && !!myEmailLower && myEmailLower === ownerLower);

                if (__DEV__ && DEBUG_TRIP) {
                  dlog("render card trip:", t.id, {
                    name: t.name,
                    ownerRaw,
                    myEmailLower,
                    looksLikeEmail,
                    isCreator,
                    ownTripIds,
                    creator_id: t.creator_id,
                  });
                }

                return (
                  <TripCard
                    key={t.id}
                    image={getImage(t.id)}
                    title={t.name}
                    destination={t.destination}
                    start={t.start_date}
                    end={t.end_date}
                    buttonRight={isCreator ? "Draft" : "Joined"}
                    showCopy
                    onCopy={() => copyInvite(t.id)}
                    onView={() =>
                      router.push({
                        pathname: "/Mainapp/viewdetailpage",
                        params: {
                          id: t.id,
                          isCreator: isCreator ? "1" : "0",
                          start: t.start_date,
                          end: t.end_date,
                        },
                      })
                    }
                    onRightPress={() => {
                      dlog("press right button trip:", t.id, "isCreator:", isCreator);
                      if (!isCreator) {
                        Alert.alert(
                          "Not allowed",
                          "You can only move trips you created into Draft."
                        );
                        return;
                      }
                      moveToDraft(t);
                    }}
                  />
                );
              })
            )
          ) : drafts.length === 0 ? (
            <Text style={styles.emptyText}>{listEmpty}</Text>
          ) : (
            drafts.map((d) => (
              <TripCard
                key={d.id}
                image={d.coverUri ? { uri: d.coverUri } : null}
                title={d.title}
                destination={d.destination}
                start={d.startDate}
                end={d.endDate}
                buttonRight="Publish"
                showView={false}
                onRightPress={() => publishDraft(d)}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Floating Add */}
      <Pressable
        onPress={() => router.push("/Mainapp/buildmytrippage")}
        style={({ pressed }) => [styles.fab, pressed && { opacity: 0.9 }]}
      >
        <Ionicons name="add" size={32} color="#111" />
      </Pressable>

      <BottomBar />
    </View>
  );
}
