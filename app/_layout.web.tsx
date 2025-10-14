// app/_layout.web.tsx
import React from "react";
import { Stack } from "expo-router";
import { Platform } from "react-native";

// For web, we'll use a simpler layout to avoid potential issues
export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="Auth" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: "modal" }} />
    </Stack>
  );
}
