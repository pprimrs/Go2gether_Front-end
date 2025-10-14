// app/Auth/index.tsx
import React from "react";
import { View, Text, Pressable, Platform } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { styles } from "./styles/homestyles"; // ✅ import style ที่แยกไว้

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      {/* โลโก้ + ชื่อแอป */}
      <View style={styles.header}>
        <Image
          // ปรับ path ตามโครงของคุณ (asset/images/*)
          source={require("../../assets/images/logo.png")}
          style={styles.logo}
          contentFit="contain"
        />
      </View>

      {/* ภาพคนกลุ่ม */}
      <Image
        source={require("../../assets/images/home-page.png")}
        style={styles.home}
        contentFit="contain"
      />

      {/* หัวข้อ + คำโปรย */}
      <Text style={styles.title}>Plan and Go2gether</Text>
      <Text style={styles.subtitle}>
        The easiest way to turn “we should travel” into real tickets and shared memories.{"\n"}
        Vote on places, drop pins, and keep all trip talk in one spot. Plan confidently and Go2gether.
      </Text>

      {/* ปุ่ม */}
      <View style={styles.ctaGroup}>
        <Pressable
          style={[styles.btn, styles.btnPrimary]}
          onPress={() => router.push("/Auth/signin")}
        >
          <Text style={[styles.btnText, styles.btnPrimaryText]}>Sign in</Text>
        </Pressable>

        <Pressable
          style={[styles.btn, styles.btnGhost]}
          onPress={() => router.push("/Auth/signup")}
        >
          <Text style={[styles.btnText, styles.btnGhostText]}>Sign up</Text>
        </Pressable>
      </View>
    </View>
  );
}


