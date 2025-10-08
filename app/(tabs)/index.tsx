import { View, Text, Image as RNImage, StyleSheet } from "react-native";
// ถ้าต้องใส่รูปจากตำแหน่งนี้ ให้ใช้ path แบบนี้:
const hero = require("../../assets/images/home-page.png");

export default function HomeTab() {
  return (
    <View style={styles.center}>
      <RNImage source={hero} style={{ width: 200, height: 120, resizeMode: "contain" }} />
      <Text style={styles.title}>Home Tab</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
  title: { marginTop: 12, fontSize: 22, fontWeight: "700" },
});


