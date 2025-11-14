import { StyleSheet, Platform } from "react-native";

export const COLORS = {
  bg: "#FFFFFF",
  text: "#111111",
  mutedText: "#6E6E6E",
  mutedIcon: "#8FA2AE",
  border: "#ECECEC",

  heroBg: "#EAF5FB",
  heroTitle: "#0B2A3A",

  softBtnBg: "#E9F1F6",
  softBtnText: "#2F6284",

  ghostBtnBg: "#ECECEC",
  ghostBtnText: "#5E5E5E",

  primary: "#6FA1C3",
  primaryText: "#FFFFFF",

  chipBg: "#F2F6F9",
  chipText: "#2F5064",

  fabBg: "#FFEFB7",
};

export const styles = StyleSheet.create({
  /* ---------- Layout ---------- */
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 60 : 30,
    paddingBottom: 10,
    backgroundColor: COLORS.bg,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.text,
  },
  pageContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },

  /* ---------- Cover ---------- */
  coverWrap: {
    alignSelf: "center",
    marginBottom: 22,
  },
  coverImg: {
    width: 180,
    height: 180,
    borderRadius: 16,
    backgroundColor: "#F4F4F4",
  },
  coverPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  coverHint: {
    color: "#97A6B1",
    fontSize: 12,
    marginTop: 4,
  },
  coverAction: {
    position: "absolute",
    right: 10,
    bottom: 10,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#6FA1C3",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },

  /* ---------- Labels & Inputs ---------- */
  label: {
    fontWeight: "800",
    fontSize: 15,
    marginBottom: 6,
    color: COLORS.text,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 12 : 10,
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 18,
    backgroundColor: "#FFF",
  },
  helper: {
    color: "#7B8C96",
    fontSize: 12,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 18,
  },
  dateBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 12,
    backgroundColor: "#FFF",
  },
  dateBoxPlaceholder: {
    backgroundColor: "#F6F8FA",
  },
  dateText: {
    fontSize: 14,
    color: "#2F5064",
    fontWeight: "600",
  },
  datePlaceholder: {
    color: "#9BA4AE",
  },

  /* ---------- Add Friends ---------- */
  addFriendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  addBtn: {
    backgroundColor: COLORS.primary,
    height: 44,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnText: {
    color: COLORS.primaryText,
    fontWeight: "800",
  },
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 18,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.chipBg,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
  },
  chipText: {
    color: COLORS.chipText,
    fontSize: 13,
    fontWeight: "600",
  },

  /* ---------- Budget ---------- */
  budgetRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 10,
  },
  budgetText: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "600",
  },
  amountInput: {
    width: 80,
    textAlign: "right",
    fontSize: 14,
    color: COLORS.text,
  },
  currency: {
    fontSize: 14,
    color: COLORS.mutedText,
    fontWeight: "600",
  },

  /* ---------- Buttons ---------- */
  bottomButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 24,
  },
  btnPrimary: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  btnPrimaryDisabled: {
    backgroundColor: "#B8C9D6",
  },
  btnPrimaryText: {
    color: "#FFF",
    fontWeight: "800",
  },
  btnPrimaryTextDisabled: {
    color: "#F4F4F4",
  },
  btnGhost: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    backgroundColor: COLORS.ghostBtnBg,
    alignItems: "center",
    justifyContent: "center",
  },
  btnGhostText: {
    color: COLORS.ghostBtnText,
    fontWeight: "800",
  },

  /* ---------- Modal Picker ---------- */
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  modalSheet: {
    width: "100%",
    backgroundColor: "#FFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  modalCancel: {
    color: "#8E8E8E",
    fontWeight: "700",
  },
  modalTitle: {
    fontWeight: "800",
    color: COLORS.text,
  },
  modalDone: {
    color: COLORS.primary,
    fontWeight: "800",
  },
});
