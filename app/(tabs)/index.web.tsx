import { StyleSheet, Text, View } from "react-native";

export default function HomeTab() {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>🏠 Go2gether</Text>
      <Text style={styles.subtitle}>Travel Companion Matching App</Text>
      <Text style={styles.description}>
        Find your perfect travel companion and explore the world together!
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { 
    flex: 1, 
    alignItems: "center", 
    justifyContent: "center", 
    backgroundColor: "#fff",
    padding: 20
  },
  title: { 
    fontSize: 32, 
    fontWeight: "700", 
    color: "#007AFF",
    marginBottom: 8
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "500",
    color: "#333",
    marginBottom: 16
  },
  description: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24
  }
});
