// app/signup.tsx
import { View, Text, StyleSheet } from "react-native";

export default function SignUp() {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>Sign up</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "700" }
});
