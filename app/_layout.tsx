// app/_layout.tsx
import { Stack } from "expo-router";
import { AuthProvider } from "../src/store/auth"; // <- ชี้มาที่ไฟล์ที่ export AuthProvider

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AuthProvider>
  );
}



