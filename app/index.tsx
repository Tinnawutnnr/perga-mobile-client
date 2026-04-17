import { caregiverApi } from "@/api/caregiver";
import { useAuth } from "@/context/auth-context";
import { usePatientStore } from "@/store/patient-store";
import { patientStorage } from "@/utils/token-storage";
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
  const { token, role, isLoading } = useAuth();
  const { setSelectedPatient } = usePatientStore();

  useFocusEffect(
    useCallback(() => {
      if (!TOKEN_CHECK_ENABLED) {
        const timer = setTimeout(() => router.replace(DEV_REDIRECT), 100);
        return () => clearTimeout(timer);
      }

      if (isLoading) return;

      if (!token) {
        const timer = setTimeout(() => router.replace("/onboarding"), 100);
        return () => clearTimeout(timer);
      }

      if (role === "caregiver") {
        let cancelled = false;
        patientStorage.getId().then(async (savedId) => {
          if (cancelled) return;
          const savedUsername = await patientStorage.getUsername();
          if (savedId && savedUsername) {
            try {
              const profile = await caregiverApi.getPatient(
                savedUsername,
                token,
              );
              if (cancelled) return;
              setSelectedPatient({ ...profile, username: savedUsername });
              router.replace("/(tabs)/home");
            } catch {
              router.replace("/(tabs)/patient-selection");
            }
          } else {
            router.replace("/(tabs)/patient-selection");
          }
        });
        return () => {
          cancelled = true;
        };
      }

      const timer = setTimeout(() => router.replace("/(tabs)/home"), 100);
      return () => clearTimeout(timer);
    }, [token, role, isLoading, setSelectedPatient]),
  );

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Loading...</Text>
    </View>
  );
}
