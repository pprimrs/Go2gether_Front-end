// app/Auth/index.tsx
import { View, Text, StyleSheet, Pressable, Platform } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      {/* โลโก้ + ชื่อแอป */}
      <View style={styles.header}>
        <Image
          source={require("../../assets/images/logo.png")}      // <-- จาก Auth ใช้ ../../
          style={styles.logo}
          contentFit="contain"
        />
      </View>

      {/* ภาพคนกลุ่ม */}
      <Image
        source={require("../../assets/images/home-page.png")}   // <-- จาก Auth ใช้ ../../
        style={styles.home}
        contentFit="contain"
      />

      {/* หัวข้อ + คำโปรย */}
      <Text style={styles.title}>Plan and Go2gether</Text>
      <Text style={styles.subtitle}>
        The easiest way to turn “we should travel” into real tickets and shared memories.
        Vote on places, drop pins, and keep all trip talk in one spot. Plan confidently and Go2gether
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

const PRIMARY = "#9ACBE2";
const TEXT_DARK = "#111";
const TEXT_MUTED = "#6B6B6B";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Platform.select({ ios: 56, android: 24, default: 32 }),
        paddingHorizontal: 24,
        backgroundColor: "#FFFFFF",
        alignItems: "center",
    },
    header: { 
        flexDirection: "row", 
        alignItems: "center", 
        marginBottom: 2, 
        gap: 2 
    },
  
    logo: { 
        width: 300, 
        height: 200, 
    },
  
    home: { 
        width: "100%", 
        height: 160, 
        marginTop: 0, 
        marginBottom:  70
    },
  
    title: { 
        fontSize: 24, 
        fontWeight: "800", 
        color: TEXT_DARK, 
        textAlign: "center", 
        marginBottom: 10 
    },
  
    subtitle: {
        fontSize: 14, 
        lineHeight: 20, 
        color: "#746E6E", 
        textAlign: "center",
        paddingHorizontal: 8, 
        marginBottom: 24,
    },
  
    ctaGroup: { 
        width: "100%", 
        gap: 12, 
        marginTop: 4 },
  
    btn: {
        width: "100%", 
        paddingVertical: 18, 
        borderRadius: 12, 
        alignItems: "center",
        justifyContent: "center", 
        borderWidth: 1, 
        borderColor: "#E6E6E6",
    },
  
    btnPrimary: { 
        backgroundColor: PRIMARY, 
        borderColor: PRIMARY 
    },
  
    btnGhost: { 
        backgroundColor: "#FFFFFF" 
    },
  
    btnText: { 
        fontSize: 17, 
        fontWeight: "700" 
    },
  
    btnPrimaryText: { 
        color: "#0B2A3A" 
    },
  
    btnGhostText: { 
        color: "#111" 
    },
  
    indicatorWrapper: { 
        position: "absolute", 
        bottom: 16, 
        width: "100%", 
        alignItems: "center" 
    },
  
    indicatorBar: { 
        width: 120, 
        height: 8, 
        borderRadius: 4, 
        backgroundColor: "#CFCFCF" 
    },
});

