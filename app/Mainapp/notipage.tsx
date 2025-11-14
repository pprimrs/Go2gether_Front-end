// app/Mainapp/notipage.tsx
import React, { useCallback, useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Platform,
  StatusBar,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styles, COLORS } from "./styles/notistyles";

/* ---------- Config ---------- */
const BASE_URL = "https://undeclamatory-precollegiate-felicitas.ngrok-free.dev";

/* ---------- Types ---------- */
type ApiNotification = {
  id: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  type?: string;
  action_url?: string;
  data?: Record<string, any>;
};

type NotificationsResponse = {
  notifications?: ApiNotification[];
  pagination?: {
    limit: number;
    offset: number;
    total: number;
    unread_count: number;
  };
};

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
};

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

function formatCreatedAt(raw?: string): string {
  if (!raw) return "";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  // ตัวอย่าง: 13 Nov, 16:45
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ---------- Page ---------- */
export default function NotificationPage() {
  const insets = useSafeAreaInsets();

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  /* ----- Load from API ----- */
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth(
        `${BASE_URL}/api/notifications?limit=50&offset=0`
      );
      const js: NotificationsResponse | any = await res.json().catch(() => ({}));

      const list: ApiNotification[] = Array.isArray(js?.notifications)
        ? js.notifications
        : Array.isArray(js)
        ? js
        : [];

      const mapped: NotificationItem[] = list.map((n) => ({
        id: String(n.id),
        title: n.title || "(no title)",
        message: n.message || "",
        createdAt: formatCreatedAt(n.created_at),
        read: !!n.read,
      }));

      setItems(mapped);

      const uc =
        typeof js?.pagination?.unread_count === "number"
          ? js.pagination.unread_count
          : mapped.filter((n) => !n.read).length;
      setUnreadCount(uc);
    } catch (err) {
      console.error("load notifications error", err);
      setItems([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications().catch(() => {});
  }, [fetchNotifications]);

  /* ----- Mark all as read ----- */
  const markAllRead = useCallback(async () => {
    try {
      const res = await fetchWithAuth(
        `${BASE_URL}/api/notifications/read-all`,
        { method: "POST" }
      );
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("mark all read error", err);
      Alert.alert("Error", "Cannot mark all as read.");
    }
  }, []);

  /* ----- Mark single as read (tap card) ----- */
  const markOneRead = useCallback(async (id: string) => {
    try {
      const res = await fetchWithAuth(
        `${BASE_URL}/api/notifications/${encodeURIComponent(id)}/read`,
        { method: "POST" }
      );
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      setItems((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, read: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("mark one read error", err);
      // ไม่ต้อง Alert ก็ได้ จะได้ไม่กวน user ถ้ากดหลายรอบ
    }
  }, []);

  /* ----- Filter UI ----- */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (n) => n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q)
    );
  }, [items, query]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotifications()
      .catch(() => {})
      .finally(() => setRefreshing(false));
  }, [fetchNotifications]);

  /* ----- Card press handler ----- */
  const onPressNotification = (n: NotificationItem) => {
    if (!n.read) {
      // mark read ก่อน
      markOneRead(n.id);
    }
    // ถ้ามี requirement ให้ navigate ตาม action_url ค่อยมาเพิ่มทีหลังได้
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: Math.max(
            insets.top,
            Platform.OS === "android" ? StatusBar.currentHeight ?? 0 : 0
          ),
        },
      ]}
    >
      {/* Header */}
      <View style={styles.headerWrap}>
        <View style={styles.heroContainer}>
          <NotiHeroBox unreadCount={unreadCount} />
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={COLORS.muted} style={{ marginHorizontal: 8 }} />
          <TextInput
            placeholder="Your Invite, Friends, Update"
            placeholderTextColor={COLORS.muted}
            value={query}
            onChangeText={setQuery}
            style={styles.searchInput}
            returnKeyType="search"
          />
        </View>

        {/* Mark all as read */}
        <View
          style={{
            marginTop: 8,
            marginHorizontal: 20,
            alignItems: "flex-end",
          }}
        >
          <Pressable onPress={markAllRead}>
            <Text style={{ fontSize: 12, fontWeight: "700", color: COLORS.activeIconBg }}>
              Mark all as read
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.activeIconBg]}
          />
        }
      >
        {loading ? (
          <ActivityIndicator size="small" color={COLORS.activeIconBg} />
        ) : filtered.length === 0 ? (
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="mail-outline" size={56} color={COLORS.activeIconBg} />
            </View>
            <Text style={styles.emptyTitle}>No Notification</Text>
            <Text style={styles.emptySub}>You have 0 notification</Text>
          </View>
        ) : (
          <View style={styles.listWrap}>
            {filtered.map((n) => (
              <Pressable
                key={n.id}
                style={({ pressed }) => [
                  styles.card,
                  pressed && { opacity: 0.85, transform: [{ scale: 0.997 }] },
                ]}
                onPress={() => onPressNotification(n)}
              >
                <View style={styles.cardLeftIcon}>
                  <Ionicons
                    name={n.read ? "mail-open-outline" : "mail-unread-outline"}
                    size={20}
                    color={COLORS.activeIconBg}
                  />
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {n.title}
                  </Text>
                  <Text style={styles.cardMessage} numberOfLines={2}>
                    {n.message}
                  </Text>
                </View>
                <Text style={styles.cardTime}>{n.createdAt}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      <BottomBar />
    </View>
  );
}

/* ---------- Hero Box ---------- */
function NotiHeroBox({ unreadCount }: { unreadCount: number }) {
  const subtitle =
    unreadCount > 0
      ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
      : "Stay up to date with invites, friends, and trip updates";

  return (
    <View style={styles.heroBox}>
      <View style={{ flex: 1 }}>
        <Text style={styles.heroTitle}>Notification</Text>
        <Text style={styles.heroSub}>{subtitle}</Text>
      </View>
      <View style={styles.heroRight}>
        <Ionicons name="mail" size={46} color="#2F5064" />
      </View>
    </View>
  );
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

  const isActive = (key: string) => pathname?.includes(`/${key}`);

  return (
    <View style={styles.bottomBar}>
      {items.map((it) => {
        const active = isActive(it.key);
        const name = active ? (it.icon.replace("-outline", "") as any) : (it.icon as any);
        return (
          <Pressable key={it.key} style={styles.tabItem} onPress={() => router.replace(it.to)}>
            <View style={[styles.iconWrap, active && styles.iconWrapActive]}>
              <Ionicons size={22} name={name} color={active ? "#FFFFFF" : "#8E8E8E"} />
            </View>
            <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{it.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
