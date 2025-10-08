import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons"; // npm i @expo/vector-icons

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: "#2f6fa0" }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="compass-outline" color={color} size={size} />
          ),
        }}
      />
      {/* เพิ่มแท็บอื่นได้ เช่น planning.tsx, profile.tsx */}
    </Tabs>
  );
}


