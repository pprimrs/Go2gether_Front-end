import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, InteractionManager, Pressable, ScrollView, Text, View } from "react-native";
import { styles } from "./styles/settingstyles";

const BASE_URL = "https://go2gether.vercel.app"; // Android Emulator ใช้ 10.0.2.2
const LOGIN_HREF = "/Auth/login"; // 👈 ปรับให้ตรงกับไฟล์จริงของคุณ

export default function SettingPage() {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [n, e, raw] = await Promise.all([
          AsyncStorage.getItem("USER_NAME"),
          AsyncStorage.getItem("USER_EMAIL"),
          AsyncStorage.getItem("USER_DATA"),
        ]);
        if (n) setName(n);
        if (e) setEmail(e);
        if (!n && raw) {
          const obj = JSON.parse(raw || "{}");
          if (obj?.display_name) setName(String(obj.display_name));
        }
        if (!e && raw) {
          const obj = JSON.parse(raw || "{}");
          if (obj?.email) setEmail(String(obj.email));
        }
      } catch {}
    })();
  }, []);

  const displayName = name || "User";
  const displayEmail = email || "example@email.com";

  // ✅ กดแล้วเด้งออกทันที: เคลียร์ storage แล้ว replace ไปหน้า login
  const signOutNow = async () => {
    try {
      await AsyncStorage.multiRemove(["USER_NAME","USER_EMAIL","USER_DATA","TOKEN","PROFILE_EXISTS"]);
    } catch {}
    try { router.dismissAll?.(); } catch {}

    // กัน animation/transition ยังไม่จบ
    InteractionManager.runAfterInteractions(() => {
      router.replace(LOGIN_HREF);
      // กันบางเคสที่ transition ค้าง
      setTimeout(() => router.replace(LOGIN_HREF), 0);
    });
  };

  const goBackSafe = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/Mainapp/homepage");
  };

  const openPersonalInfo = async () => {
    if (loadingProfile) return;
    setLoadingProfile(true);
    try {
      const token = await AsyncStorage.getItem("TOKEN");
      if (!token) {
        await AsyncStorage.multiRemove(["USER_NAME","USER_EMAIL","USER_DATA","TOKEN","PROFILE_EXISTS"]);
        signOutNow();
        return;
      }

      const res = await fetch(`${BASE_URL}/api/profile`, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        await AsyncStorage.multiRemove(["USER_NAME","USER_EMAIL","USER_DATA","TOKEN","PROFILE_EXISTS"]);
        signOutNow();
        return;
      }
      if (res.status === 404) {
        router.push("/Profile/personal-create");
        return;
      }

      let json: any = {};
      try { json = await res.json(); } catch {}
      if (!res.ok) {
        // เงียบ ๆ แล้วอยู่หน้าเดิม (หรือจะ alert ก็ได้)
        return;
      }

      const user = json?.user || json;
      await AsyncStorage.setItem("USER_DATA", JSON.stringify(user));
      if (user?.display_name) await AsyncStorage.setItem("USER_NAME", String(user.display_name));
      if (user?.email) await AsyncStorage.setItem("USER_EMAIL", String(user.email));

      router.push("/Profile/personal-update");
    } catch {
      // เงียบ ๆ
    } finally {
      setLoadingProfile(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#FFF" }}>
      {/* Header */}
      <View style={styles.topBar}>
        <Pressable onPress={goBackSafe} hitSlop={10} style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>
          <Ionicons name="chevron-back" size={24} color="#111" />
        </Pressable>
        <Text style={styles.topBarTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 28 }} keyboardShouldPersistTaps="handled">
        {/* Profile */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={{ marginLeft: 14 }}>
            <Text style={styles.nameText}>{displayName}</Text>
            <Text style={styles.emailText}>{displayEmail}</Text>
          </View>
        </View>

        {/* Menu */}
        <View style={styles.menuCard}>
          <Pressable
            onPress={openPersonalInfo}
            disabled={loadingProfile}
            style={({ pressed }) => [styles.menuRow, (pressed || loadingProfile) && { opacity: 0.7 }]}
          >
            <Text style={styles.menuText}>{loadingProfile ? "Loading profile..." : "Personal Information"}</Text>
            {loadingProfile ? <ActivityIndicator style={{ marginLeft: 8 }} /> : null}
          </Pressable>
          <View style={styles.divider} />

          {/* 🔴 ปุ่มที่คุณต้องการ: กดแล้วเด้งออกทันที */}
          <Pressable onPress={signOutNow} style={({ pressed }) => [styles.menuRow, pressed && { opacity: 0.7 }]}>
            <Text style={styles.menuText}>Sign Out</Text>
          </Pressable>
          <View style={styles.divider} />

          <Pressable onPress={signOutNow} style={({ pressed }) => [styles.menuRow, pressed && { opacity: 0.7 }]}>
            <Text style={styles.menuDanger}>Delete Account</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
