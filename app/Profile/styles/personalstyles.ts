import { StyleSheet } from "react-native";

const COLORS = {
  bg: "#FFFFFF",
  text: "#111111",
  muted: "#7C7C7C",
  card: "#FFFFFF",
  border: "#ECECEC",
  shadow: "rgba(0,0,0,0.06)",
  saveBg: "#E9E9E9",
  saveText: "#111111",
};

export const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.bg,
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 40,
  },
  logo: {
    width: 300,
    height: 150,
    alignSelf: "center",
    marginBottom: 16,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 14,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  item: {
    paddingVertical: 14,
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4A4A4A",
    marginBottom: 6,
  },
  input: {
    fontSize: 14,
    color: COLORS.text,
    paddingVertical: 8,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  saveBtn: {
    alignSelf: "center",
    marginTop: 28,
    backgroundColor: COLORS.saveBg,
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 36,
  },
  saveText: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.saveText,
  },
});
