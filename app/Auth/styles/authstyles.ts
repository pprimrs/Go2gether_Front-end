// app/Auth/styles/auth.styles.ts
import { StyleSheet } from "react-native";

/** Design tokens (ปรับสีได้ตรงนี้จุดเดียว) */
export const PRIMARY = "#bcd6e7";
export const TEXT = "#111111";
export const MUTED = "#6B6B6B";
export const CARD_BG = "#eaf4fb";
export const BORDER = "#e7eef5";

export const authStyles = StyleSheet.create({
  /** layout */
  screen: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1 },

  /** logo + title section */
  topSection: {
    marginTop: -35,
    alignItems: "center",
    paddingTop: 90,
    paddingHorizontal: 10,
    paddingBottom: 8,
  },
  logo: { width: 300, height: 150 },
  title: { fontSize: 25, fontWeight: "800", color: TEXT, marginTop: 8 },

  /** subtitle / tips */
  subtitle: { marginTop: 6, color: MUTED, fontSize: 13 },

  /** tab bar (ใช้หรือไม่ใช้ก็ได้) */
  tabsOuterRow: {
    marginTop: 18,
    paddingHorizontal: 18,
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
  },
  tabBtn: { paddingVertical: 8 },
  tabText: { fontSize: 16, color: MUTED, fontWeight: "600" },
  tabActive: {
    color: "#2f6fa0",
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: "#2f6fa0",
  },

  /** blue sheet (พื้นที่ฟอร์ม) */
  bottomSheet: {
    flex: 1,
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: BORDER,
    marginTop: -3,
  },
  sheetContent: {
    paddingTop: 22,
    paddingHorizontal: 22,
    paddingBottom: 30,
    gap: 14,
  },

  /** input */
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 53,
    borderWidth: 1,
    borderColor: "#eee",
  },
  input: { flex: 1, fontSize: 16, color: "#333" },

  /** small row (เช่น toggle show password) */
  smallRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  /** buttons */
  btn: {
    width: "85%",
    alignSelf: "center",
    marginTop: 6,
    borderRadius: 12,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  btnPrimary: { backgroundColor: TEXT },
  btnPrimaryText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  btnSecondary: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  btnSecondaryText: { color: TEXT, fontSize: 15, fontWeight: "600" },

  /** misc */
  terms: {
    marginTop: 12,
    color: MUTED,
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
  link: { color: "#2f6fa0", fontWeight: "700" },

  /** auth helper */
  formHeader: {
    fontSize: 18,
    fontWeight: "700",
    color: TEXT,
    marginBottom: 8,
  },
  spacer8: { height: 8 },
  spacer12: { height: 12 },
  spacer16: { height: 16 },
});
