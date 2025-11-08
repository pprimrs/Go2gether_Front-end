import { StyleSheet } from "react-native";

export const COLORS = {
  bg: "#FFFFFF",
  text: "#111111",
  mutedText: "#6E6E6E",
  mutedIcon: "#8FA2AE",
  border: "#ECECEC",

  heroBg: "#EAF5FB",
  heroTitle: "#0B2A3A",

  chipBg: "#F2F6F9",
  chipText: "#2F5064",

  primary: "#6FA1C3",
  primaryText: "#0B2A3A",

  softBtnBg: "#E9F1F6",
  softBtnText: "#2F6284",

  ghostBtnBg: "#ECECEC",
  ghostBtnText: "#5E5E5E",

  fabBg: "#FFEFB7",

  // bottom bar
  barBg: "#EAF5FB",
  activeIconBg: "#6FA1C3",
};

export const styles = StyleSheet.create({
  /* ---------- Top ---------- */
  topBar: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  /* ---------- Hero ---------- */
  hero: {
    backgroundColor: COLORS.heroBg,
    marginHorizontal: 12,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingTop: 22,        // ขยับหัวลงตามที่ขอ
    paddingBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: "900",
    color: COLORS.heroTitle,
  },
  heroSub: {
    marginTop: 10,
    color: "#637784",
    fontSize: 13,
  },
  heroImg: {
    width: 120,
    height: 120,
  },

  /* ---------- Tabs ---------- */
  tabsRow: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  tabBtn: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F1F1",
  },
  tabActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  tabText: {
    fontWeight: "800",
    color: "#8A8A8A",
  },
  tabTextActive: {
    color: COLORS.heroTitle,
  },

  /* ---------- Card ---------- */
  card: {
    flexDirection: "row",
    gap: 12,
    padding: 12,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  cardImage: {
    width: 120,
    height: 96,
    borderRadius: 12,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  cardTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.text,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  metaText: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "700",
  },

  cardBtnRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  btnPrimary: {
    height: 40,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  btnPrimaryText: {
    fontWeight: "800",
    color: "#FFFFFF",
  },
  btnSoft: {
    height: 40,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: COLORS.softBtnBg,
    alignItems: "center",
    justifyContent: "center",
  },
  btnSoftText: {
    fontWeight: "800",
    color: COLORS.softBtnText,
  },
  btnGhost: {
    height: 40,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: COLORS.ghostBtnBg,
    alignItems: "center",
    justifyContent: "center",
  },
  btnGhostText: {
    fontWeight: "800",
    color: COLORS.ghostBtnText,
  },

  emptyText: {
    textAlign: "center",
    color: COLORS.mutedText,
    paddingVertical: 24,
    fontWeight: "700",
  },

  /* ---------- Floating Button ---------- */
  fab: {
    position: "absolute",
    right: 18,
    bottom: 110,               // อยู่เหนือ BottomBar
    width: 76,
    height: 76,
    borderRadius: 18,
    backgroundColor: COLORS.fabBg,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },

  /* ---------- Bottom Bar (เหมือนหน้า Home) ---------- */
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
    shadowColor: COLORS.activeIconBg,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  tabLabel: { fontSize: 12, color: "#8E8E8E", fontWeight: "700" },
  tabLabelActive: { color: "#2F6284" },
});
