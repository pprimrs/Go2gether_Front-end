import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, Platform } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { styles } from "./styles/homepagestyles";

type TripItem = { title: string; img: any };

const myTrips: TripItem[] = [
  { title: "Japan gogo", img: require("../../assets/images/japan.png") },
  { title: "Eat w/kiki", img: require("../../assets/images/korean.png") },
  { title: "Picnic day", img: require("../../assets/images/japan.png") },
];

const favoriteTrips: TripItem[] = [
  { title: "Ni hao lao gong", img: require("../../assets/images/chinese.png") },
  { title: "BKK is calling!", img: require("../../assets/images/bkk.png") },
];

// Card
function TripCard({ item, onPress }: { item: TripItem; onPress?: () => void }) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Image source={item.img} style={styles.cardImage} contentFit="cover" />
      <Text numberOfLines={1} style={styles.cardTitle}>{item.title}</Text>
    </Pressable>
  );
}

// Bottom Bar
function BottomBar() {
  const pathname = usePathname();
  const isActive = (key: "home" | "mytrip" | "freeday" | "noti") => {
    if (key === "home") return pathname?.includes("/Mainapp/homepage");
    if (key === "mytrip") return pathname?.startsWith("/Trip");
    if (key === "freeday") return pathname?.includes("/FreeDay");
    return pathname?.includes("/Notification");
  };

  const items = [
    { key: "home", label: "Home", icon: "home-outline", to: "/Mainapp/homepage" },
    { key: "mytrip", label: "My Trip", icon: "location-outline", to: "/Mainapp/mytrippage" }, 
    { key: "freeday", label: "Free Day", icon: "briefcase-outline", to: "/FreeDay" },
    { key: "noti", label: "Notification", icon: "mail-open-outline", to: "/Notification" },
  ] as const;

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

export default function HomePage() {
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const loadUserName = async () => {
      try {
        const name = await AsyncStorage.getItem("USER_NAME");
        if (name) setUserName(name);
      } catch (e) {
        console.warn("Cannot load name:", e);
      }
    };
    loadUserName();
  }, []);

  const displayName = userName || "User";

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.page}
        contentContainerStyle={styles.pageContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={{ gap: 6 }}>
              <Text style={styles.profileName}>{displayName}</Text>
              <Pressable
                onPress={() => router.push("/Friends/add")}
                style={({ pressed }) => [styles.pillBtn, pressed && { opacity: 0.9 }]}
                accessibilityRole="button"
                accessibilityLabel="Add friends"
              >
                <Ionicons name="person-add-outline" size={14} color="#1E5872" />
                <Text style={styles.pillBtnText}>Add Friends</Text>
              </Pressable>
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
            <Pressable onPress={() => router.push("/Trip/create")} style={styles.linkPill}>
              <Text style={styles.linkPillText}>Add Trip +</Text>
            </Pressable>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hList}>
            {myTrips.map((t, i) => (
              <TripCard
                key={`${t.title}-${i}`}
                item={t}
                onPress={() => router.push({ pathname: "/Trip/detail", params: { title: t.title } })}
              />
            ))}
          </ScrollView>
        </View>

        {/* Favorite Trip (เพิ่มช่องว่างพิเศษ) */}
        <View style={[styles.section, styles.sectionGapLg]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Favorite Trip</Text>
            <Pressable onPress={() => router.push("/Favorite/add")} style={styles.linkPill}>
              <Text style={styles.linkPillText}>Add Favorite +</Text>
            </Pressable>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hList}>
            {favoriteTrips.map((t, i) => (
              <TripCard
                key={`${t.title}-${i}`}
                item={t}
                onPress={() => router.push({ pathname: "/Trip/detail", params: { title: t.title } })}
              />
            ))}
            <View style={{ width: 16 }} />
          </ScrollView>
        </View>

        {/* spacer เพื่อไม่ให้ content ชนแถบล่าง */}
        <View style={{ height: 110 }} />
      </ScrollView>

      <BottomBar />
    </View>
  );
}
