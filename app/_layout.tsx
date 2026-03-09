import { Stack } from "expo-router";
import { AuthProvider } from "../context/auth-context";
import { ThemeProvider } from "../context/theme-context";

// ensures the BLE singleton (BleManager) is created
import "@/store/ble-store";

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
          <Stack.Screen name="create-profile" />
          <Stack.Screen name="forgot-password" />
          <Stack.Screen name="confirmation-code" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </ThemeProvider>
    </AuthProvider>
  );
}
