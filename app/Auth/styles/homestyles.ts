// app/Auth/styles/home.styles.ts
import { StyleSheet, Platform } from "react-native";

/** 🎨 สีหลักที่ใช้ในหน้า Home */
const PRIMARY = "#9ACBE2";
const TEXT_DARK = "#111";
const TEXT_MUTED = "#6B6B6B";

export const styles = StyleSheet.create({
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
  },

  logo: {
    width: 300,
    height: 200,
    resizeMode: "contain",
  },

  home: {
    width: "100%",
    height: 160,
    marginTop: 0,
    marginBottom: 70,
    resizeMode: "contain",
  },

  title: {
    fontSize: 24,
    fontWeight: "800",
    color: TEXT_DARK,
    textAlign: "center",
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: TEXT_MUTED,
    textAlign: "center",
    paddingHorizontal: 8,
    marginBottom: 24,
  },

  ctaGroup: {
    width: "100%",
    marginTop: 4,
  },

  btn: {
    width: "100%",
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E6E6E6",
    marginBottom: 12, // แทน gap ที่บาง RN ไม่รองรับ
  },

  btnPrimary: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },

  btnGhost: {
    backgroundColor: "#FFFFFF",
  },

  btnText: {
    fontSize: 17,
    fontWeight: "700",
  },

  btnPrimaryText: {
    color: "#0B2A3A",
  },

  btnGhostText: {
    color: TEXT_DARK,
  },

  indicatorWrapper: {
    position: "absolute",
    bottom: 16,
    width: "100%",
    alignItems: "center",
  },

  indicatorBar: {
    width: 120,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#CFCFCF",
  },
});

