// app/_layout.tsx
import React from "react";
import { Stack } from "expo-router";
// เลือกแบบใดแบบหนึ่งให้ตรงกับไฟล์ด้านบน (แนะนำ default)
import AuthProvider from "../../src/store/authStore"; // ✅ default import ที่ตรงกับ default export

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AuthProvider>
  );
}



