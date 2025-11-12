import React, { useCallback, useMemo, useState } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styles, COLORS } from "./styles/notistyles";

/* ---------- Types ---------- */
type NotificationItem = {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
};

/* ---------- Page ---------- */
export default function NotificationPage() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [loading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [items] = useState<NotificationItem[]>([]); // เริ่มจากว่าง

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (n) => n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q)
    );
  }, [items, query]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 700);
  }, []);

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
      {/* Header (ไม่มี Notification title ด้านบนแล้ว) */}
      <View style={styles.headerWrap}>
        <View style={styles.heroContainer}>
          <NotiHeroBox />
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
                onPress={() => {}}
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
function NotiHeroBox() {
  return (
    <View style={styles.heroBox}>
      <View style={{ flex: 1 }}>
        <Text style={styles.heroTitle}>Notification</Text>
        <Text style={styles.heroSub}>
          Stay up to date with invites, friends, and trip updates
        </Text>
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
