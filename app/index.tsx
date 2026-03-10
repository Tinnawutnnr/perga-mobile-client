import { useAuth } from "@/context/auth-context";
import type { Router } from "expo-router";
import { router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { Text, View } from "react-native";

// ─── Dev flag ────────────────────────────────────────────────────────────────
// Set to false to skip token check and go straight to a specific route.
const TOKEN_CHECK_ENABLED = true;
const DEV_REDIRECT: Parameters<Router["replace"]>[0] = "/(tabs)/home";
// ─────────────────────────────────────────────────────────────────────────────

export default function Index() {
  const { token, isLoading } = useAuth();

  useFocusEffect(
    useCallback(() => {
      if (!TOKEN_CHECK_ENABLED) {
        const timer = setTimeout(() => router.replace(DEV_REDIRECT), 100);
        return () => clearTimeout(timer);
      }

      if (isLoading) return;
      const timer = setTimeout(() => {
        if (token) {
          router.replace("/(tabs)/home");
        } else {
          router.replace("/onboarding");
        }
      }, 100);

      return () => clearTimeout(timer);
    }, [token, isLoading]),
  );

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Loading...</Text>
    </View>
  );
}
