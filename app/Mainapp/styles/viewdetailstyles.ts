// app/Mainapp/styles/viewdetailstyles.ts
import { StyleSheet } from "react-native";

export const COLORS = {
  text: "#0F1D2B",
  subtext: "#5E6B78",
  primary: "#6FA1C3",
  border: "#E6EDF2",
  muted: "#97A6B1",
  bg: "#FFFFFF",

  softBg: "#F8FBFD",
  softBorder: "#EEF2F6",
  action: "#6FA1C3",
  danger: "#da5252ff",
};

export const styles = StyleSheet.create({
  /* Header */
  topBar: {
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.bg,
  },
  title: { fontSize: 18, fontWeight: "700", color: COLORS.text },

  /* Page */
  pageContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: COLORS.bg,
  },

  /* Cover */
  coverWrap: { marginTop: 6, marginBottom: 12 },
  coverImg: {
    width: "100%",
    height: 180,
    borderRadius: 16,
    backgroundColor: "#E9EEF3",
  },
  coverPlaceholder: { alignItems: "center", justifyContent: "center" },
  coverHint: { color: COLORS.muted, marginTop: 6 },
  coverAction: {
    position: "absolute",
    right: 14,
    bottom: 14,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.action,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  /* Labels & Inputs */
  label: {
    fontSize: 17,
    fontWeight: "600",
    color: COLORS.text,
    marginTop: 14,
    marginBottom: 6,
  },
  helper: { fontSize: 13, color: COLORS.subtext, marginBottom: 6 },

  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    backgroundColor: COLORS.bg,
    fontSize: 15,
    color: COLORS.text,
  },

  /* Period Row */
  row: { flexDirection: "row", gap: 10 },
  dateBox: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.softBorder,
    backgroundColor: COLORS.bg,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  dateBoxPlaceholder: { backgroundColor: COLORS.softBg },
  dateText: { fontSize: 15, color: COLORS.text },
  datePlaceholder: { color: COLORS.muted },

  /* Budget */
  budgetRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 8,
  },
  budgetText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: COLORS.text,
    marginLeft: 6,
  },
  amountInput: {
    width: 80,
    height: 32,
    textAlign: "right",
    borderWidth: 0,
    fontSize: 15,
    color: COLORS.text,
    backgroundColor: "transparent",
  },
  currency: { fontSize: 15, color: COLORS.subtext, marginLeft: 4 },

  /* Bottom Buttons: Delete | Save */
  bottomButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  btnPrimary: {
    flex: 1,
    height: 52,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  btnPrimaryDisabled: { backgroundColor: "#A9BBC6" },
  btnPrimaryText: { color: "#fff", fontWeight: "800", fontSize: 18 },
  btnPrimaryTextDisabled: { opacity: 0.85 },

  btnDanger: {
    flex: 1,
    height: 52,
    borderRadius: 28,
    backgroundColor: COLORS.danger,
    alignItems: "center",
    justifyContent: "center",
  },
  btnDangerText: { color: "#fff", fontWeight: "800", fontSize: 18 },

  /* Date Modal */
  modalBackdrop: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  modalSheet: {
    backgroundColor: COLORS.bg,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden",
  },
  modalHeader: {
    height: 48,
    paddingHorizontal: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomColor: COLORS.softBorder,
    borderBottomWidth: 1,
  },
  modalCancel: { color: "#6B7785", fontWeight: "700" },
  modalTitle: { color: COLORS.text, fontWeight: "800" },
  modalDone: { color: COLORS.primary, fontWeight: "800" },
});
