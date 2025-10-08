import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />     {/* Landing */}
      <Stack.Screen name="Auth" />      {/* กลุ่ม Auth */}
      <Stack.Screen name="(tabs)" />    {/* กลุ่ม Tabs */}
    </Stack>
  );
}


