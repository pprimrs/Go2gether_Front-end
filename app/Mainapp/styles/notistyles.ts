import { StyleSheet } from "react-native";

export const COLORS = {
  bg: "#FFFFFF",
  text: "#111111",
  muted: "#7C7C7C",
  border: "#ECECEC",
  cardTitle: "#0E0E0E",
  shadow: "#000000",
  barBg: "#EAF5FB",
  activeIconBg: "#6FA1C3",
};

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  /* ---------- Header (ไม่มี title) ---------- */
  headerWrap: {
    backgroundColor: COLORS.bg,
    width: "100%",
    paddingTop: 20,
    paddingBottom: 10,
  },

  /* ✅ ให้กล่องฟ้า noti มีระยะเหมือน mytrip */
  heroContainer: {
    marginTop: 8,
    marginHorizontal: 12,  // ← เหมือน mytrip
    marginBottom: 14,      // ← เหมือน mytrip
  },

  /* 🔵 Hero Box = ขนาดเดียวกับ mytrip */
  heroBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EAF5FB",
    borderRadius: 18,        // ← 18 เท่ากับ mytrip
    paddingHorizontal: 18,   // ← 18 เท่ากับ mytrip
    paddingTop: 22,          // ← 22 เท่ากับ mytrip
    paddingBottom: 18,       // ← 18 เท่ากับ mytrip
    gap: 10,                 // ← gap ระหว่างซ้าย/ขวาเหมือน mytrip
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  heroTitle: {
    fontSize: 36,            // ← 36 เท่ากับ mytrip
    fontWeight: "900",       // ← 900 เท่ากับ mytrip
    color: "#0B2A3A",
  },
  heroSub: {
    marginTop: 10,           // ← เหมือน mytrip
    color: "#637784",
    fontSize: 13,
  },
  heroRight: {
    width: 120,              // ← ขนาดรวมฝั่งขวาเท่ากับ heroImg 120x120 ของ mytrip
    height: 120,
    borderRadius: 18,
    backgroundColor: "#F3F8FC",
    alignItems: "center",
    justifyContent: "center",
  },

  /* ---------- Search ---------- */
  searchBox: {
    marginHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 42,
    paddingHorizontal: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    paddingRight: 12,
    fontSize: 14,
    color: COLORS.text,
  },

  /* ---------- Content ---------- */
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 120,
  },

  /* ---------- Empty ---------- */
  emptyWrap: { alignItems: "center", marginTop: 100 },
  emptyIconCircle: {
    width: 96, height: 96, borderRadius: 24, backgroundColor: "#F0F6FC",
    alignItems: "center", justifyContent: "center", marginBottom: 16,
  },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: COLORS.text, marginBottom: 6 },
  emptySub: { fontSize: 13, color: COLORS.muted },

  /* ---------- Cards ---------- */
  listWrap: { gap: 10 },
  card: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF",
    borderRadius: 16, paddingHorizontal: 14, paddingVertical: 14,
    borderWidth: 1, borderColor: COLORS.border,
    shadowColor: COLORS.shadow, shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 1,
  },
  cardLeftIcon: {
    width: 36, height: 36, borderRadius: 8, backgroundColor: "#EFF6FF",
    alignItems: "center", justifyContent: "center", marginRight: 12,
  },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: "700", color: COLORS.text, marginBottom: 2 },
  cardMessage: { fontSize: 13, color: COLORS.muted },
  cardTime: { fontSize: 11, color: "#9CA3AF", marginLeft: 8 },

  /* ---------- Bottom Bar ---------- */
  bottomBar: {
    position: "absolute", left: 0, right: 0, bottom: 0,
    backgroundColor: COLORS.barBg,
    flexDirection: "row", justifyContent: "space-around", alignItems: "center",
    paddingTop: 10, paddingBottom: 18, paddingHorizontal: 12,
    shadowColor: "#000", shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 8,
  },
  tabItem: { alignItems: "center", justifyContent: "center", minWidth: 70, gap: 6 },
  iconWrap: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: "center", justifyContent: "center", backgroundColor: "transparent",
  },
  iconWrapActive: {
    backgroundColor: COLORS.activeIconBg,
    shadowColor: COLORS.activeIconBg, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25, shadowRadius: 10, elevation: 6,
  },
  tabLabel: { fontSize: 12, color: "#8E8E8E", fontWeight: "700" },
  tabLabelActive: { color: "#2F6284" },
});
