// app/signin.tsx
import { View, Text, StyleSheet } from "react-native";

export default function SignIn() {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>Sign in</Text>
      {/* ใส่ฟอร์มจริงทีหลังได้ */}
    </View>
  );
}
const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "700" }
});
