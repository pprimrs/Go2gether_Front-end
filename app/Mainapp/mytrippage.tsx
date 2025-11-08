import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable, Image as RNImage } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import { styles, COLORS } from "./styles/mytripstyles";

type Trip = {
  id: string;
  title: string;
  cover: any;
  location: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  status: "published" | "draft";
  favorite?: boolean;
};

const tripsSeed: Trip[] = [
  {
    id: "t1",
    title: "Japan gogo",
    cover: require("../../assets/images/japan.png"),
    location: "Japan, 15273, Tokyo",
    startDate: "2025-12-13",
    endDate: "2025-12-18",
    status: "published",
  },
  {
    id: "t2",
    title: "Ni hao lao gong",
    cover: require("../../assets/images/chinese.png"),
    location: "Chinese, 13244, Chengdu",
    startDate: "2025-08-11",
    endDate: "2025-08-16",
    status: "published",
    favorite: true,
  },
  {
    id: "t3",
    title: "Picnic day",
    cover: require("../../assets/images/bkk.png"),
    location: "BKK, Thailand",
    startDate: "2025-11-20",
    endDate: "2025-11-21",
    status: "draft",
  },
];

function fmt(d: string) {
  const dt = new Date(d);
  const day = dt.getDate().toString().padStart(2, "0");
  const mon = dt.toLocaleString("en-US", { month: "short" });
  const yr = dt.getFullYear();
  return `${day} ${mon} ${yr}`;
}

/* ---------- Bottom Bar (เหมือนหน้า Home) ---------- */
function BottomBar() {
  const pathname = usePathname();
  const items = [
    { key: "home",    label: "Home",        icon: "home-outline",      to: "/Mainapp/homepage" },
    { key: "mytrip",  label: "My Trip",     icon: "location-outline",  to: "/Mainapp/mytrippage" },
    { key: "freeday", label: "Free Day",    icon: "briefcase-outline", to: "/FreeDay" },
    { key: "noti",    label: "Notification",icon: "mail-open-outline",  to: "/Notification" },
  ] as const;

  const isActive = (k: (typeof items)[number]["key"]) => {
    if (k === "home")   return pathname?.includes("/Mainapp/homepage");
    if (k === "mytrip") return pathname?.includes("/Mainapp/mytrippage");
    if (k === "freeday")return pathname?.includes("/FreeDay");
    return pathname?.includes("/Notification");
  };

  return (
    <View style={styles.bottomBar}>
      {items.map((it) => {
        const active = isActive(it.key);
        const name = (active
          ? (it.icon.replace("-outline", "") as any)
          : (it.icon as any));
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

/* ---------- Trip Card ---------- */
function TripCard({
  trip,
  onEdit,
  onView,
  onToggleFav,
  onPublish,
  onMoveToDraft,
}: {
  trip: Trip;
  onEdit: () => void;
  onView: () => void;
  onToggleFav: () => void;
  onPublish: () => void;
  onMoveToDraft: () => void;
}) {
  const complete = new Date(trip.endDate).getTime() < new Date().setHours(0, 0, 0, 0);

  return (
    <View style={styles.card}>
      <Image source={trip.cover} style={styles.cardImage} contentFit="cover" />
      <View style={{ flex: 1 }}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle} numberOfLines={1}>{trip.title}</Text>
          <Pressable hitSlop={10} onPress={onToggleFav} style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>
            <Ionicons
              name={trip.favorite ? "star" : "star-outline"}
              size={20}
              color={trip.favorite ? "#F5C451" : "#E0E0E0"}
            />
          </Pressable>
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={14} color={COLORS.mutedIcon} />
          <Text style={styles.metaText} numberOfLines={1}>{trip.location}</Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={14} color={COLORS.mutedIcon} />
          <Text style={styles.metaText}>{fmt(trip.startDate)} - {fmt(trip.endDate)}</Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons
            name={complete ? "radio-button-on" : "radio-button-off"}
            size={14}
            color={complete ? "#3BA776" : COLORS.mutedIcon}
          />
          <Text style={[styles.metaText, complete && { color: "#3BA776" }]}>{complete ? "Complete" : "Planing"}</Text>
        </View>

        <View style={styles.cardBtnRow}>
          {trip.status === "published" ? (
            <>
              <Pressable style={styles.btnSoft} onPress={onView}>
                <Text style={styles.btnSoftText}>View Details</Text>
              </Pressable>
              <Pressable style={styles.btnGhost} onPress={onMoveToDraft}>
                <Text style={styles.btnGhostText}>Draft</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Pressable style={styles.btnPrimary} onPress={onEdit}>
                <Text style={styles.btnPrimaryText}>Edit</Text>
              </Pressable>
              <Pressable style={styles.btnSoft} onPress={onPublish}>
                <Text style={styles.btnSoftText}>Publish</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

export default function MyTripPage() {
  const [tab, setTab] = useState<"published" | "draft">("published");
  const [trips, setTrips] = useState<Trip[]>(tripsSeed);
  const list = useMemo(() => trips.filter((t) => t.status === tab), [trips, tab]);

  const toggleFav = (id: string) =>
    setTrips((prev) => prev.map((t) => (t.id === id ? { ...t, favorite: !t.favorite } : t)));
  const setStatus = (id: string, status: "published" | "draft") =>
    setTrips((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 160 /* กันชนแถบล่าง */ }}
      >
        {/* Top bar + back */}
        <View style={styles.topBar}>
          <Pressable
            hitSlop={10}
            onPress={() =>
              router.canGoBack() ? router.back() : router.replace("/Mainapp/homepage")
            }
          >
            <Ionicons name="chevron-back" size={24} color="#111" />
          </Pressable>
          <View style={{ width: 24 }} />
        </View>

        {/* Hero */}
        <View style={styles.hero}>
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
          {list.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              onToggleFav={() => toggleFav(trip.id)}
              onEdit={() =>
                router.push({
                  pathname: "/Mainapp/buildmytrippage",
                  params: { id: trip.id },
                })
              }
              onView={() =>
                router.push({
                  pathname: "/Trip/detail",
                  params: { id: trip.id, title: trip.title },
                })
              }
              onPublish={() => setStatus(trip.id, "published")}
              onMoveToDraft={() => setStatus(trip.id, "draft")}
            />
          ))}
          {list.length === 0 && (
            <Text style={styles.emptyText}>No {tab} trips yet.</Text>
          )}
        </View>
      </ScrollView>

      {/* Floating Add */}
      <Pressable
        onPress={() => router.push("/Mainapp/buildmytrippage")}
        style={({ pressed }) => [styles.fab, pressed && { opacity: 0.9 }]}
        accessibilityLabel="Create new trip"
      >
        <Ionicons name="add" size={32} color="#111" />
      </Pressable>

      {/* Bottom Bar */}
      <BottomBar />
    </View>
  );
}
