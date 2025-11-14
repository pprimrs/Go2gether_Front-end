import { StyleSheet } from "react-native";

const COLORS = {
  bg: "#FFFFFF",
  text: "#111111",
  muted: "#7C7C7C",
  border: "#ECECEC",
  chipBg: "#E8F1F6",
  chipText: "#1E5872",
  sectionBtnBg: "#F3F7FA",
  cardTitle: "#0E0E0E",
  shadow: "#000000",
  barBg: "#EAF5FB",
  activeIconBg: "#6FA1C3",
};

export const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: COLORS.bg },
  pageContent: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 4 },

  // ===== Header =====
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",   // ✅ ขอบล่างของโปรไฟล์กับ Setting เสมอกัน
    paddingTop: 40,           // ✅ ระยะห่างบน คุมทั้งแถว
    marginBottom: 12,
  },

  profileRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 22,
    marginLeft: 30,
    // ❌ ไม่ต้องมี marginTop แล้ว
  },

  avatar: {
    marginTop: 40,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#6FA1C3",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#FFFFFF", fontWeight: "800", fontSize: 22 },

  // ชื่อ – ให้ต่ำลงเล็กน้อยพอดีสายตา
  profileName: {
    fontSize: 23,
    fontWeight: "800",
    color: COLORS.text,
    marginTop: 30,             // ปรับขยับให้ส่วนหัวลงมา
  },

  pillBtn: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.chipBg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginTop: 6,
  },
  pillBtnText: { color: COLORS.chipText, fontWeight: "700", fontSize: 12 },

  // Setting (ขยับลงอัตโนมัติจาก alignItems: 'flex-end')
  settingContainer: {
    alignItems: "center",
    marginRight: 10,
    // ❌ ตัด marginTop เดิมออก
  },
  settingLabel: { marginTop: 6, color: "#8A8A8A", fontSize: 11, textAlign: "center" },

  // ===== Sections =====
  section: { marginTop: 34 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  sectionTitle: { fontSize: 20, fontWeight: "800", color: COLORS.text },

  // ระยะห่างระหว่าง My Trip ↔ Favorite Trip
  sectionGapLg: { marginTop: 50 },

  linkPill: {
    backgroundColor: COLORS.sectionBtnBg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  linkPillText: { fontSize: 12, fontWeight: "700", color: "#2F5064" },

  hList: { paddingRight: 4 },

  // ===== Card =====
  card: {
    width: 152,
    marginRight: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  cardImage: { width: "100%", height: 110 },
  cardTitle: { paddingHorizontal: 10, paddingVertical: 8, fontWeight: "800", fontSize: 14, color: COLORS.cardTitle },

  // ===== Bottom Bar =====
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.barBg,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 18,
    paddingHorizontal: 12,
    borderTopWidth: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  tabItem: { alignItems: "center", justifyContent: "center", minWidth: 70, gap: 6 },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  iconWrapActive: {
    backgroundColor: COLORS.activeIconBg,
    shadowColor: "#6FA1C3",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  tabLabel: { fontSize: 12, color: "#8E8E8E", fontWeight: "700" },
  tabLabelActive: { color: "#2F6284" },
});
