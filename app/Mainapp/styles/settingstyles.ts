import { StyleSheet } from "react-native";

const COLORS = {
  text: "#111111",
  muted: "#7B7B7B",
  border: "#EDEDED",
  cardBg: "#FFFFFF",
  avatarBg: "#6FA1C3",
  danger: "#C62828",
};

export const styles = StyleSheet.create({
  topBar: {
    paddingTop: 94,
    paddingHorizontal: 16,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topBarTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.text,
  },

  // Profile Card
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.avatarBg,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFF",
    fontWeight: "800",
    fontSize: 22,
  },
  nameText: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.text,
  },
  emailText: {
    marginTop: 4,
    fontSize: 13,
    color: COLORS.muted,
  },

  // Menu
  menuCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  menuRow: {
    paddingVertical: 16,
  },
  menuText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#575757",
  },
  menuDanger: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.danger,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
});
