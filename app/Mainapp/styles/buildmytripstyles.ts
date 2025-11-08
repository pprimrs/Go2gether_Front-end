import { StyleSheet } from "react-native";

const COLORS = {
  text: "#111111",
  muted: "#8C8C8C",
  border: "#EFEFEF",
  inputBg: "#FFFFFF",
  chipBg: "#EAF3FA",
  chipText: "#2F5064",
  primary: "#9ACBE2",
  primaryDark: "#0B2A3A",
  placeholder: "#B8C0CA",
};

export const styles = StyleSheet.create({
  topBar: {
    alignSelf: "stretch",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    marginTop: 70,
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.text,
  },

  pageContent: {
    paddingHorizontal: 20,
    paddingBottom: 18,
  },

  /* Cover */
  coverWrap: {
    width: 160,
    height: 160,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
    alignSelf: "center",
    marginTop: 8,
    marginBottom: 18,
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  coverImg: { width: "100%", height: "100%" },
  coverAction: {
    position: "absolute",
    right: -8,
    bottom: -8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFF",
  },

  /* Labels / Inputs */
  label: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.text,
    marginTop: 12,
    marginBottom: 8,
  },
  helper: {
    fontSize: 12,
    color: COLORS.muted,
    marginBottom: 10,
  },
  input: {
    backgroundColor: COLORS.inputBg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    height: 44,
    paddingHorizontal: 0,
    fontSize: 15,
    color: COLORS.text,
    marginBottom: 6,
  },

  /* Date range */
  row: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 8,
  },
  dateBox: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DCE6EF",
    backgroundColor: COLORS.chipBg,
    paddingHorizontal: 12,
    alignItems: "center",
    flexDirection: "row",
  },
  dateBoxPlaceholder: {
    backgroundColor: "#F4F7FA",
  },
  dateText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.chipText,
  },
  datePlaceholder: {
    color: COLORS.placeholder,
    fontWeight: "600",
  },

  /* Add friend row / chips */
  addFriendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  addBtn: {
    height: 42,
    borderRadius: 10,
    paddingHorizontal: 16,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnText: {
    color: COLORS.primaryDark,
    fontWeight: "800",
  },
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 6,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F2F7FA",
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#E1EBF2",
  },
  chipText: {
    color: "#3C5564",
    fontWeight: "700",
    fontSize: 12,
  },

  /* Budget rows */
  budgetRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    height: 44,
    gap: 10,
  },
  budgetText: {
    fontSize: 14,
    color: "#707070",
    fontWeight: "700",
    flex: 1,
  },
  amountInput: {
    width: 90,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DDE6EE",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    textAlign: "right",
    fontWeight: "800",
    color: "#274A60",
  },
  currency: {
    marginLeft: 6,
    fontWeight: "800",
    color: "#274A60",
  },

  /* Bottom buttons */
  bottomButtons: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    marginTop: 12,
  },
  btnGhost: {
    flex: 1,
    height: 48,
    borderRadius: 18,
    backgroundColor: "#ECECEC",
    alignItems: "center",
    justifyContent: "center",
  },
  btnGhostText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#5E5E5E",
  },
  btnPrimary: {
    flex: 1,
    height: 48,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  btnPrimaryDisabled: {
    backgroundColor: "#D7EAF5",
  },
  btnPrimaryText: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.primaryDark,
  },
  btnPrimaryTextDisabled: {
    color: "#8AA0AE",
  },

  /* Modal for Date Picker */
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 16,
    paddingTop: 6,
    paddingHorizontal: 12,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 6,
    paddingVertical: 10,
  },
  modalCancel: {
    color: "#6B7280",
    fontWeight: "700",
  },
  modalTitle: {
    color: "#111",
    fontWeight: "800",
  },
  modalDone: {
    color: "#0B2A3A",
    fontWeight: "800",
  },
});
