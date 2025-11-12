import { StyleSheet } from "react-native";

export const COLORS = {
  bg: "#FFFFFF",
  text: "#111111",
  muted: "#8A8A8A",
  border: "#ECECEC",

  heroBg: "#EAF5FB",
  heroTitle: "#0B2A3A",

  cardTitle: "#0E0E0E",

  chipBg: "#F2F6F9",
  chipText: "#2F5064",

  // bottom bar
  barBg: "#EAF5FB",
  activeIconBg: "#6FA1C3",

  // budget modal
  cardIcon: "#6A86A0",

  overlay: "rgba(0,0,0,0.35)",
};

export const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: COLORS.bg },

  /* ---------- Hero Top ---------- */
  heroTop: {
    backgroundColor: COLORS.heroBg,
    paddingHorizontal: 18,
    paddingBottom: 16,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  heroHeading: {
    fontSize: 36,
    lineHeight: 40,
    fontWeight: "900",
    color: COLORS.heroTitle,
    marginBottom: 14,
    textAlign: "center",
  },

  /* ---------- Tabs ---------- */
  tabsRow: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  tabBtn: {
    flex: 1,
    height: 46,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5EEF6",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  tabBtnActive: {
    backgroundColor: COLORS.activeIconBg,
  },
  tabText: {
    fontWeight: "800",
    color: "#6E7D88",
  },
  tabTextActive: {
    color: "#FFFFFF",
  },

  /* ---------- Grid cards ---------- */
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 16,
    paddingBottom: 20,
  },

  card: {
    width: "47%", // ✅ ลดขนาดเหลือประมาณครึ่งจอ
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },

  cardImage: {
    width: "100%",
    height: 110, // ✅ ลดความสูงของรูป
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },

  cardTitle: {
    fontSize: 14, // ✅ ตัวเล็กลง
    fontWeight: "800",
    color: COLORS.cardTitle,
    marginTop: 6,
    marginHorizontal: 10,
    marginBottom: 8,
  },

  generateBtn: {
    backgroundColor: "#F2F6FA",
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  generateText: {
    fontWeight: "800",
    color: "#2F6284",
    fontSize: 13,
  },


  /* ---------- Bottom Bar ---------- */
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

  /* ---------- Modals (shared) ---------- */
  modalBackdrop: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  modalCard: {
    width: "100%",
    maxWidth: 560,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
  },
  modalTitle: { fontSize: 26, fontWeight: "900", color: COLORS.cardTitle },
  modalSub: { color: "#6F8190", marginTop: 4, marginBottom: 12, fontWeight: "600" },
  modalBtns: { marginTop: 14, alignItems: "flex-end" },
  modalBtnGhost: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#EFF4F8",
  },
  modalBtnGhostText: { color: "#2F6284", fontWeight: "800" },

  /* ---------- Free Day options ---------- */
  optionsWrap: { gap: 12, marginTop: 8 },
  optionRow: {
    flexDirection: "row",
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#F7FBFE",
    borderWidth: 1,
    borderColor: "#E6EEF6",
    alignItems: "center",
  },
  optionLabelCol: { width: 90, paddingRight: 10, borderRightWidth: 1, borderRightColor: "#E6EEF6" },
  optionLabel: { fontWeight: "800", color: "#5C6E7C" },
  optionDatesCol: { flex: 1, paddingLeft: 12 },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  dateChip: {
    backgroundColor: "#6FA1C3",
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  dateChipText: { color: "#fff", fontWeight: "800" },
  noOptionText: { color: "#6F8190", fontWeight: "700" },

  /* ---------- Budget modal ---------- */
  totalCard: {
    backgroundColor: "#9EC0D9",
    borderRadius: 16,
    padding: 14,
  },
  totalRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  totalValue: { color: "#fff", fontSize: 28, fontWeight: "900" },
  totalUpdated: { color: "#f6faff", marginTop: 2 },
  budgetHeader: { marginTop: 14, fontWeight: "900", color: "#41576A" },
  budgetGrid: {
    marginTop: 10,
    gap: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  budgetCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E9EFF4",
    padding: 12,
  },
  budgetCardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  budgetTitle: { fontWeight: "900", color: "#54718A" },
  budgetAmount: { marginTop: 6, fontWeight: "900", color: "#2D3F50" },
  progressTrack: {
    marginTop: 8,
    height: 6,
    borderRadius: 6,
    backgroundColor: "#EFF4F8",
    overflow: "hidden",
  },
  progressBar: { height: 6, backgroundColor: "#9EC0D9" },
  budgetRemaining: { marginTop: 6, color: "#7D90A0" },

  /* ---------- Suggest modal ---------- */
  sugRow: {
    flexDirection: "row",
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E6EEF6",
    backgroundColor: "#F9FCFF",
  },
  sugPhoto: { width: 120, height: 86, borderRadius: 12, backgroundColor: "#E9EEF3" },
  sugHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  sugCat: { fontSize: 16, fontWeight: "900", color: "#1F2E3A" },
  sugWhen: { fontWeight: "900", color: "#4A89B1" },
  dotRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#6FA1C3", marginTop: 7 },
  placeText: { flex: 1, color: "#1E2D38", fontWeight: "700" },
});
