// app/Auth/styles/signup.styles.ts
import { StyleSheet } from "react-native";

/** Design tokens (ปรับสีส่วนกลางได้ที่นี่) */
const PRIMARY = "#bcd6e7";
const TEXT = "#111111";
const MUTED = "#6B6B6B";
const CARD_BG = "#eaf4fb";
const BORDER = "#e7eef5";

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff" },

  logo: { width: 300, height: 150 },

  topSection: {
    marginTop: -35,
    alignItems: "center",
    paddingTop: 90,
    paddingHorizontal: 10,
    paddingBottom: 8,
  },
  title: { fontSize: 25, fontWeight: "800", color: TEXT, marginTop: 8 },
  subtitle: {
    marginTop: 20,
    fontSize: 14,
    lineHeight: 18,
    color: "#959595",
    textAlign: "center",
  },

  /** ✅ แท็บอยู่นอกกรอบสีฟ้า */
  tabsOuterRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 10,
    marginBottom: -15,
    borderBottomColor: "#c8d9eb",
    zIndex: 1,
  },
  tabBtn: { paddingHorizontal: 8, paddingVertical: 16 },
  tabText: { fontSize: 17, color: MUTED, fontWeight: "700" },
  tabActive: {
    color: "#2f6fa0",
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: "#2f6fa0",
  },

  /** กรอบสีฟ้าด้านล่าง */
  bottomSheet: {
    flex: 1,
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: BORDER,
    marginTop: -3,
  },
  sheetContent: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 14,
  },

  /** input */
  inputWrap: {
    width: "85%",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 12, // ค่า gap ต้องเป็นตัวเลข
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 53,
    borderWidth: 1,
    borderColor: "#eee",
    marginTop: 12,
  },
  input: { flex: 1, fontSize: 16, color: "#333" },
  smallRow: { flexDirection: "row", alignItems: "center" },

  /** ปุ่ม */
  btn: {
    width: "85%",
    alignSelf: "center",
    alignItems: "center",
    height: 53,
    borderRadius: 12,
    justifyContent: "center",
    marginTop: 24,
  },
  btnText: { fontSize: 20, fontWeight: "800" },
  btnPrimary: { backgroundColor: "#9ACBE2" },
  btnPrimaryText: { color: "#0B2A3A" },

  /** terms */
  terms: { marginTop: 20, fontSize: 13, color: MUTED, textAlign: "center" },
  link: { textDecorationLine: "underline", color: "#2f6fa0", fontWeight: "600" },
});
